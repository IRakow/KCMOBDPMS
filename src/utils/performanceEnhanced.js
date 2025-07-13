// Enhanced Performance Monitoring System
class EnhancedPerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.metrics = new Map();
    this.thresholds = {
      slow: 100,
      warning: 500,
      critical: 1000
    };
    this.observers = [];
    
    // Setup performance observer for web vitals
    this.setupPerformanceObserver();
    
    // Track navigation timing
    this.trackNavigationTiming();
  }

  // Basic timing methods
  start(name) {
    this.marks.set(name, {
      startTime: performance.now(),
      startMark: `${name}-start`
    });
    performance.mark(`${name}-start`);
  }

  end(name) {
    const mark = this.marks.get(name);
    if (!mark) {
      console.warn(`No start mark found for: ${name}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - mark.startTime;
    
    performance.mark(`${name}-end`);
    performance.measure(name, mark.startMark, `${name}-end`);

    this.recordMetric(name, duration);
    this.marks.delete(name);
    
    return duration;
  }

  // Record and analyze metrics
  recordMetric(name, duration) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        calls: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        slowCalls: 0
      });
    }

    const metric = this.metrics.get(name);
    metric.calls++;
    metric.totalTime += duration;
    metric.avgTime = metric.totalTime / metric.calls;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    
    if (duration > this.thresholds.slow) {
      metric.slowCalls++;
    }

    // Log based on threshold
    const level = this.getPerformanceLevel(duration);
    const color = this.getLogColor(level);
    
    console.log(
      `%c[Performance] ${name}: ${duration.toFixed(2)}ms ${level}`,
      `color: ${color}; font-weight: bold;`
    );

    // Send to analytics
    this.sendAnalytics(name, duration, level);
    
    // Notify observers
    this.notifyObservers(name, duration, level);
  }

  getPerformanceLevel(duration) {
    if (duration > this.thresholds.critical) return '🔴 CRITICAL';
    if (duration > this.thresholds.warning) return '🟡 WARNING';
    if (duration > this.thresholds.slow) return '🟠 SLOW';
    return '🟢 FAST';
  }

  getLogColor(level) {
    const colors = {
      '🔴 CRITICAL': '#ff0000',
      '🟡 WARNING': '#ff9900', 
      '🟠 SLOW': '#ff6600',
      '🟢 FAST': '#00aa00'
    };
    return colors[level] || '#666666';
  }

  // Component performance wrapper
  measureComponent(name, Component) {
    return React.forwardRef((props, ref) => {
      const renderStart = React.useRef();
      
      // Measure mount time
      React.useEffect(() => {
        this.start(`${name}-mount`);
        return () => {
          this.end(`${name}-mount`);
        };
      }, []);

      // Measure render time
      React.useLayoutEffect(() => {
        if (renderStart.current) {
          const renderTime = performance.now() - renderStart.current;
          this.recordMetric(`${name}-render`, renderTime);
        }
      });

      renderStart.current = performance.now();
      
      return <Component {...props} ref={ref} />;
    });
  }

  // API call monitoring
  measureAPI(apiClient) {
    const originalRequest = apiClient.request.bind(apiClient);
    
    apiClient.request = async (method, endpoint, data) => {
      const metricName = `API-${method}-${endpoint.replace(/[\/\:]/g, '-')}`;
      this.start(metricName);
      
      try {
        const result = await originalRequest(method, endpoint, data);
        this.end(metricName);
        return result;
      } catch (error) {
        this.end(metricName);
        this.recordMetric(`${metricName}-error`, 0);
        throw error;
      }
    };
    
    return apiClient;
  }

  // Route performance tracking
  measureRouteChange(router) {
    const originalNavigate = router.navigate.bind(router);
    
    router.navigate = (path, pushState = true) => {
      this.start(`route-${path}`);
      
      // Use requestIdleCallback to measure after render
      requestIdleCallback(() => {
        this.end(`route-${path}`);
      });
      
      return originalNavigate(path, pushState);
    };
    
    return router;
  }

  // Web Vitals monitoring
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.recordMetric('LCP', entry.startTime);
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let clsValue = 0;
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.recordMetric('CLS', clsValue * 1000); // Convert to ms scale
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Navigation timing
  trackNavigationTiming() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const nav = performance.getEntriesByType('navigation')[0];
        if (nav) {
          this.recordMetric('DNS-lookup', nav.domainLookupEnd - nav.domainLookupStart);
          this.recordMetric('TCP-connect', nav.connectEnd - nav.connectStart);
          this.recordMetric('Request-response', nav.responseEnd - nav.requestStart);
          this.recordMetric('DOM-processing', nav.domComplete - nav.responseEnd);
          this.recordMetric('Page-load', nav.loadEventEnd - nav.navigationStart);
        }
      }, 1000);
    });
  }

  // Analytics integration
  sendAnalytics(name, duration, level) {
    if (window.analytics) {
      window.analytics.track('Performance Metric', {
        metric: name,
        duration: duration,
        level: level,
        timestamp: Date.now(),
        url: window.location.pathname
      });
    }

    // Send to custom monitoring service
    if (window.monitoring && duration > this.thresholds.warning) {
      window.monitoring.send({
        type: 'performance',
        metric: name,
        duration: duration,
        level: level,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      });
    }
  }

  // Observer pattern for real-time monitoring
  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  notifyObservers(name, duration, level) {
    this.observers.forEach(callback => {
      try {
        callback({ name, duration, level, timestamp: Date.now() });
      } catch (error) {
        console.error('Performance observer error:', error);
      }
    });
  }

  // Get performance report
  getReport() {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: Object.fromEntries(this.metrics),
      webVitals: this.getWebVitals(),
      slowest: this.getSlowestOperations(),
      summary: this.getSummary()
    };
    
    return report;
  }

  getWebVitals() {
    return {
      LCP: this.metrics.get('LCP'),
      FID: this.metrics.get('FID'),
      CLS: this.metrics.get('CLS')
    };
  }

  getSlowestOperations(limit = 10) {
    return Array.from(this.metrics.entries())
      .sort(([,a], [,b]) => b.maxTime - a.maxTime)
      .slice(0, limit)
      .map(([name, metric]) => ({
        name,
        maxTime: metric.maxTime,
        avgTime: metric.avgTime,
        calls: metric.calls
      }));
  }

  getSummary() {
    const totalMetrics = this.metrics.size;
    let slowOperations = 0;
    let totalCalls = 0;
    let totalTime = 0;

    this.metrics.forEach(metric => {
      if (metric.slowCalls > 0) slowOperations++;
      totalCalls += metric.calls;
      totalTime += metric.totalTime;
    });

    return {
      totalMetrics,
      slowOperations,
      totalCalls,
      avgResponseTime: totalCalls > 0 ? totalTime / totalCalls : 0,
      performanceScore: this.calculatePerformanceScore()
    };
  }

  calculatePerformanceScore() {
    // Simple scoring based on slow operations
    const totalOps = Array.from(this.metrics.values()).reduce((sum, m) => sum + m.calls, 0);
    const slowOps = Array.from(this.metrics.values()).reduce((sum, m) => sum + m.slowCalls, 0);
    
    if (totalOps === 0) return 100;
    
    const score = Math.max(0, 100 - (slowOps / totalOps) * 100);
    return Math.round(score);
  }

  // Clear all metrics
  clear() {
    this.marks.clear();
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }

  // Export performance data
  export() {
    const data = {
      report: this.getReport(),
      rawMetrics: Object.fromEntries(this.metrics),
      performanceEntries: performance.getEntries()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Create global instance
window.PerformanceMonitor = new EnhancedPerformanceMonitor();

// Export for module system
window.AppModules = window.AppModules || {};
window.AppModules.PerformanceMonitor = EnhancedPerformanceMonitor;