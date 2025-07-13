// Enhanced Cache Management System
class EnhancedCacheManager {
  constructor(options = {}) {
    this.cache = new Map();
    this.config = {
      maxAge: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100, // Maximum cache entries
      compressionThreshold: 1024, // Compress items larger than 1KB
      persistKey: 'app_cache',
      enablePersistence: true,
      enableCompression: true,
      enableMetrics: true,
      ...options
    };
    
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      compressions: 0
    };
    
    this.tags = new Map(); // For tag-based invalidation
    this.dependencies = new Map(); // For dependency tracking
    
    // Load persisted cache
    this.loadFromStorage();
    
    // Setup cleanup interval
    this.startCleanup();
    
    // Setup performance monitoring
    if (window.PerformanceMonitor) {
      this.setupPerformanceMonitoring();
    }
  }

  // Enhanced set method with compression and tagging
  set(key, value, options = {}) {
    const {
      maxAge = this.config.maxAge,
      tags = [],
      dependencies = [],
      compress = this.config.enableCompression
    } = options;

    // Check cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    // Prepare value for storage
    let storedValue = value;
    let isCompressed = false;

    if (compress && this.shouldCompress(value)) {
      storedValue = this.compress(value);
      isCompressed = true;
      this.metrics.compressions++;
    }

    const entry = {
      value: storedValue,
      originalValue: value, // Keep original for immediate access
      timestamp: Date.now(),
      maxAge,
      accessCount: 0,
      lastAccessed: Date.now(),
      isCompressed,
      tags: [...tags],
      dependencies: [...dependencies]
    };

    this.cache.set(key, entry);
    this.metrics.sets++;

    // Update tag mappings
    tags.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, new Set());
      }
      this.tags.get(tag).add(key);
    });

    // Update dependency mappings
    dependencies.forEach(dep => {
      if (!this.dependencies.has(dep)) {
        this.dependencies.set(dep, new Set());
      }
      this.dependencies.get(dep).add(key);
    });

    // Persist if enabled
    if (this.config.enablePersistence) {
      this.persistToStorage();
    }

    return true;
  }

  // Enhanced get method with metrics
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check expiration
    if (Date.now() - entry.timestamp > entry.maxAge) {
      this.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Update access metrics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.metrics.hits++;

    // Return decompressed value if needed
    if (entry.isCompressed) {
      return this.decompress(entry.value);
    }

    return entry.originalValue || entry.value;
  }

  // Cached function decorator with advanced options
  async cached(key, fetcher, options = {}) {
    const startTime = performance.now();
    
    // Check cache first
    const cached = this.get(key);
    if (cached) {
      if (window.PerformanceMonitor) {
        window.PerformanceMonitor.recordMetric(`cache-hit-${key}`, performance.now() - startTime);
      }
      return cached;
    }

    // Fetch and cache
    try {
      const result = await fetcher();
      this.set(key, result, options);
      
      if (window.PerformanceMonitor) {
        window.PerformanceMonitor.recordMetric(`cache-miss-${key}`, performance.now() - startTime);
      }
      
      return result;
    } catch (error) {
      if (window.PerformanceMonitor) {
        window.PerformanceMonitor.recordMetric(`cache-error-${key}`, performance.now() - startTime);
      }
      throw error;
    }
  }

  // Tag-based invalidation
  invalidateByTag(tag) {
    const keys = this.tags.get(tag);
    if (!keys) return 0;

    let count = 0;
    keys.forEach(key => {
      if (this.delete(key)) count++;
    });

    this.tags.delete(tag);
    return count;
  }

  // Dependency-based invalidation
  invalidateByDependency(dependency) {
    const keys = this.dependencies.get(dependency);
    if (!keys) return 0;

    let count = 0;
    keys.forEach(key => {
      if (this.delete(key)) count++;
    });

    this.dependencies.delete(dependency);
    return count;
  }

  // Enhanced delete with cleanup
  delete(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Clean up tag references
    entry.tags.forEach(tag => {
      const tagKeys = this.tags.get(tag);
      if (tagKeys) {
        tagKeys.delete(key);
        if (tagKeys.size === 0) {
          this.tags.delete(tag);
        }
      }
    });

    // Clean up dependency references
    entry.dependencies.forEach(dep => {
      const depKeys = this.dependencies.get(dep);
      if (depKeys) {
        depKeys.delete(key);
        if (depKeys.size === 0) {
          this.dependencies.delete(dep);
        }
      }
    });

    this.cache.delete(key);
    return true;
  }

  // LRU eviction
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.metrics.evictions++;
    }
  }

  // Compression methods
  shouldCompress(value) {
    const size = JSON.stringify(value).length;
    return size > this.config.compressionThreshold;
  }

  compress(value) {
    // Simple LZ-based compression for demo
    // In production, use a proper compression library
    const json = JSON.stringify(value);
    return this.simpleCompress(json);
  }

  decompress(compressed) {
    const json = this.simpleDecompress(compressed);
    return JSON.parse(json);
  }

  simpleCompress(str) {
    // Basic run-length encoding for demo
    return str.replace(/(.)\1+/g, (match, char) => `${char}${match.length}`);
  }

  simpleDecompress(str) {
    // Reverse run-length encoding
    return str.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }

  // Persistence methods
  persistToStorage() {
    try {
      const serializable = Array.from(this.cache.entries()).map(([key, entry]) => [
        key,
        {
          ...entry,
          originalValue: undefined // Don't persist original value
        }
      ]);

      localStorage.setItem(this.config.persistKey, JSON.stringify({
        cache: serializable,
        metrics: this.metrics,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.config.persistKey);
      if (!stored) return;

      const data = JSON.parse(stored);
      const age = Date.now() - data.timestamp;

      // Don't load if data is too old
      if (age > this.config.maxAge * 2) return;

      // Restore cache entries
      data.cache.forEach(([key, entry]) => {
        this.cache.set(key, entry);
        
        // Restore tag mappings
        if (entry.tags) {
          entry.tags.forEach(tag => {
            if (!this.tags.has(tag)) {
              this.tags.set(tag, new Set());
            }
            this.tags.get(tag).add(key);
          });
        }

        // Restore dependency mappings
        if (entry.dependencies) {
          entry.dependencies.forEach(dep => {
            if (!this.dependencies.has(dep)) {
              this.dependencies.set(dep, new Set());
            }
            this.dependencies.get(dep).add(key);
          });
        }
      });

      // Restore metrics
      this.metrics = { ...this.metrics, ...data.metrics };
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
      localStorage.removeItem(this.config.persistKey);
    }
  }

  // Cleanup expired entries
  cleanup() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > entry.maxAge) {
        this.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  startCleanup() {
    // Clean up every minute
    this.cleanupInterval = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0 && this.config.enableMetrics) {
        console.log(`[Cache] Cleaned up ${cleaned} expired entries`);
      }
    }, 60000);
  }

  stopCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Performance monitoring integration
  setupPerformanceMonitoring() {
    const originalGet = this.get.bind(this);
    const originalSet = this.set.bind(this);

    this.get = (key) => {
      const start = performance.now();
      const result = originalGet(key);
      const duration = performance.now() - start;
      
      window.PerformanceMonitor.recordMetric('cache-get', duration);
      return result;
    };

    this.set = (key, value, options) => {
      const start = performance.now();
      const result = originalSet(key, value, options);
      const duration = performance.now() - start;
      
      window.PerformanceMonitor.recordMetric('cache-set', duration);
      return result;
    };
  }

  // Statistics and monitoring
  getStats() {
    const hitRate = this.metrics.hits + this.metrics.misses > 0 
      ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses) * 100).toFixed(2)
      : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: `${hitRate}%`,
      ...this.metrics,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  estimateMemoryUsage() {
    let totalSize = 0;
    for (const [key, entry] of this.cache) {
      totalSize += JSON.stringify([key, entry]).length * 2; // Rough estimate
    }
    return `${(totalSize / 1024).toFixed(2)} KB`;
  }

  // Clear all cache data
  clear() {
    this.cache.clear();
    this.tags.clear();
    this.dependencies.clear();
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      compressions: 0
    };
    
    if (this.config.enablePersistence) {
      localStorage.removeItem(this.config.persistKey);
    }
  }

  // Export cache data for debugging
  export() {
    return {
      cache: Array.from(this.cache.entries()),
      tags: Array.from(this.tags.entries()),
      dependencies: Array.from(this.dependencies.entries()),
      metrics: this.metrics,
      config: this.config
    };
  }
}

// API Cache wrapper
class APICacheWrapper {
  constructor(apiClient, cacheManager = window.cache) {
    this.api = apiClient;
    this.cache = cacheManager;
  }

  async get(endpoint, options = {}) {
    const { 
      cacheKey = `api-get-${endpoint}`,
      maxAge = 5 * 60 * 1000,
      tags = ['api'],
      dependencies = [endpoint],
      bypassCache = false
    } = options;

    if (bypassCache) {
      return this.api.get(endpoint);
    }

    return this.cache.cached(
      cacheKey,
      () => this.api.get(endpoint),
      { maxAge, tags, dependencies }
    );
  }

  async post(endpoint, data, options = {}) {
    const result = await this.api.post(endpoint, data);
    
    // Invalidate related cache entries
    const { invalidateTags = ['api'], invalidateDependencies = [endpoint] } = options;
    
    invalidateTags.forEach(tag => this.cache.invalidateByTag(tag));
    invalidateDependencies.forEach(dep => this.cache.invalidateByDependency(dep));
    
    return result;
  }

  async put(endpoint, data, options = {}) {
    const result = await this.api.put(endpoint, data);
    
    // Invalidate related cache entries
    const { invalidateTags = ['api'], invalidateDependencies = [endpoint] } = options;
    
    invalidateTags.forEach(tag => this.cache.invalidateByTag(tag));
    invalidateDependencies.forEach(dep => this.cache.invalidateByDependency(dep));
    
    return result;
  }

  async delete(endpoint, options = {}) {
    const result = await this.api.delete(endpoint);
    
    // Invalidate related cache entries
    const { invalidateTags = ['api'], invalidateDependencies = [endpoint] } = options;
    
    invalidateTags.forEach(tag => this.cache.invalidateByTag(tag));
    invalidateDependencies.forEach(dep => this.cache.invalidateByDependency(dep));
    
    return result;
  }
}

// Create global instances
window.cache = new EnhancedCacheManager();
window.CacheManager = EnhancedCacheManager;
window.APICacheWrapper = APICacheWrapper;

// Export for module system
window.AppModules = window.AppModules || {};
window.AppModules.cache = {
  EnhancedCacheManager,
  APICacheWrapper
};