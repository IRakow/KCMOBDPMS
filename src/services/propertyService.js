// Property Service for API Integration
const PropertyService = (() => {
  // Private API client instance
  let apiClient = null;
  
  // Initialize with API client
  const init = (client) => {
    apiClient = client;
  };
  
  // Get API client (with fallback)
  const getClient = () => {
    return apiClient || window.ApiService;
  };
  
  // Property API methods
  const propertyAPI = {
    // Get all properties for current user's company
    async getProperties(filters = {}) {
      const client = getClient();
      if (!client) throw new Error('API client not initialized');
      
      try {
        // Build query parameters matching backend API
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.type && filters.type !== 'all') params.append('property_type', filters.type);
        if (filters.skip) params.append('skip', filters.skip);
        if (filters.limit) params.append('limit', filters.limit || '100');
        
        const queryString = params.toString();
        const endpoint = `/properties/${queryString ? `?${queryString}` : ''}`;
        
        const response = await client.get(endpoint);
        
        // Transform response to match frontend expectations
        return {
          properties: response.results || response,
          total: response.total || (response.results || response).length,
          page: response.page || 1,
          totalPages: Math.ceil((response.total || 0) / (response.page_size || 10))
        };
        
      } catch (error) {
        console.error('Failed to fetch properties:', error);
        
        // Fallback to mock data in development
        if (window.location.hostname === 'localhost') {
          console.warn('Using mock data for properties');
          return {
            properties: getMockProperties(),
            total: getMockProperties().length,
            page: 1,
            totalPages: 1
          };
        }
        
        throw new Error(`Failed to load properties: ${error.message}`);
      }
    },
    
    // Create new property
    async createProperty(propertyData) {
      const client = getClient();
      if (!client) throw new Error('API client not initialized');
      
      try {
        // Transform frontend data to match backend schema
        const backendData = {
          name: propertyData.name,
          property_type: propertyData.property_type || 'residential',
          description: propertyData.description || '',
          address_line1: propertyData.address_line1 || propertyData.address,
          address_line2: propertyData.address_line2 || '',
          city: propertyData.city,
          state: propertyData.state,
          postal_code: propertyData.postal_code,
          country: propertyData.country || 'United States',
          year_built: propertyData.year_built ? parseInt(propertyData.year_built) : null,
          total_units: propertyData.total_units ? parseInt(propertyData.total_units) : 1,
          total_square_feet: propertyData.total_square_feet ? parseFloat(propertyData.total_square_feet) : null,
          lot_size: propertyData.lot_size ? parseFloat(propertyData.lot_size) : null,
          purchase_price: propertyData.purchase_price ? parseFloat(propertyData.purchase_price) : null,
          current_value: propertyData.current_value ? parseFloat(propertyData.current_value) : null,
          features: propertyData.features || [],
          amenities: propertyData.amenities || {}
        };
        
        const response = await client.post('/properties/', backendData);
        return response.data || response;
        
      } catch (error) {
        console.error('Failed to create property:', error);
        
        // Extract meaningful error message
        let errorMessage = 'Failed to create property';
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }
    },
    
    // Get single property by ID
    async getProperty(propertyId) {
      const client = getClient();
      if (!client) throw new Error('API client not initialized');
      
      try {
        const response = await client.get(`/properties/${propertyId}`);
        return response.data || response;
        
      } catch (error) {
        console.error('Failed to fetch property:', error);
        
        if (error.response?.status === 404) {
          throw new Error('Property not found');
        }
        
        throw new Error(`Failed to load property: ${error.message}`);
      }
    },
    
    // Update existing property
    async updateProperty(propertyId, propertyData) {
      const client = getClient();
      if (!client) throw new Error('API client not initialized');
      
      try {
        // Transform frontend data to match backend schema
        const backendData = {
          name: propertyData.name,
          property_type: propertyData.property_type,
          description: propertyData.description,
          address_line1: propertyData.address_line1 || propertyData.address,
          address_line2: propertyData.address_line2,
          city: propertyData.city,
          state: propertyData.state,
          postal_code: propertyData.postal_code,
          country: propertyData.country,
          year_built: propertyData.year_built ? parseInt(propertyData.year_built) : null,
          total_units: propertyData.total_units ? parseInt(propertyData.total_units) : null,
          total_square_feet: propertyData.total_square_feet ? parseFloat(propertyData.total_square_feet) : null,
          lot_size: propertyData.lot_size ? parseFloat(propertyData.lot_size) : null,
          purchase_price: propertyData.purchase_price ? parseFloat(propertyData.purchase_price) : null,
          current_value: propertyData.current_value ? parseFloat(propertyData.current_value) : null,
          features: propertyData.features,
          amenities: propertyData.amenities,
          is_active: propertyData.is_active
        };
        
        // Remove undefined fields
        Object.keys(backendData).forEach(key => {
          if (backendData[key] === undefined) {
            delete backendData[key];
          }
        });
        
        const response = await client.patch(`/properties/${propertyId}`, backendData);
        return response.data || response;
        
      } catch (error) {
        console.error('Failed to update property:', error);
        
        if (error.response?.status === 404) {
          throw new Error('Property not found');
        }
        
        let errorMessage = 'Failed to update property';
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
        
        throw new Error(errorMessage);
      }
    },
    
    // Delete property
    async deleteProperty(propertyId) {
      const client = getClient();
      if (!client) throw new Error('API client not initialized');
      
      try {
        const response = await client.delete(`/properties/${propertyId}`);
        return response.data || response;
        
      } catch (error) {
        console.error('Failed to delete property:', error);
        
        if (error.response?.status === 404) {
          throw new Error('Property not found');
        }
        
        if (error.response?.status === 400) {
          throw new Error(error.response.data.detail || 'Cannot delete property with existing units');
        }
        
        throw new Error(`Failed to delete property: ${error.message}`);
      }
    },
    
    // Get property analytics for a specific property
    async getPropertyAnalytics(propertyId) {
      const client = getClient();
      if (!client) throw new Error('API client not initialized');
      
      try {
        const response = await client.get(`/api/properties/${propertyId}/analytics`);
        return response.data || response;
        
      } catch (error) {
        console.error('Failed to fetch property analytics:', error);
        
        // Return mock analytics in development
        if (window.location.hostname === 'localhost') {
          return {
            property_id: propertyId,
            total_units: 24,
            occupied_units: 22,
            vacant_units: 2,
            occupancy_rate: 91.7,
            monthly_revenue: 62700,
            annual_revenue: 752400,
            upcoming_lease_expirations: 3,
            average_rent: 2850
          };
        }
        
        throw new Error(`Failed to load property analytics: ${error.message}`);
      }
    },
    
    // Upload photos for a property
    async uploadPropertyPhotos(propertyId, files) {
      const client = getClient();
      if (!client) throw new Error('API client not initialized');
      
      try {
        const formData = new FormData();
        files.forEach(file => {
          formData.append('files', file);
        });
        
        const response = await client.post(
          `/api/properties/${propertyId}/photos`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        return response.data || response;
        
      } catch (error) {
        console.error('Failed to upload property photos:', error);
        throw new Error(`Failed to upload photos: ${error.message}`);
      }
    },
    
    // Get overall property metrics for dashboard
    async getPropertyMetrics() {
      const client = getClient();
      if (!client) throw new Error('API client not initialized');
      
      try {
        // Since backend doesn't have a general metrics endpoint,
        // we'll calculate from properties list
        const propertiesResponse = await this.getProperties();
        return calculateMetricsFromProperties(propertiesResponse.properties);
        
      } catch (error) {
        console.error('Failed to fetch property metrics:', error);
        throw new Error(`Failed to load property metrics: ${error.message}`);
      }
    }
  };
  
  // Mock data for development/fallback
  const getMockProperties = () => [
    {
      id: '1',
      name: 'Sunset Apartments',
      address: {
        street: '123 Sunset Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90028'
      },
      property_type: 'residential',
      total_units: 24,
      occupied_units: 22,
      available_units: 2,
      average_rent: 2850,
      monthly_revenue: 62700,
      status: 'active',
      occupancy: { rate: 91.7 },
      last_updated: '2024-07-10T10:30:00Z',
      description: 'Modern apartment complex with pool and fitness center',
      amenities: ['Pool', 'Fitness Center', 'Parking', 'Laundry'],
      maintenance: { open: 3, completed: 12 }
    },
    {
      id: '2',
      name: 'Downtown Office Plaza',
      address: {
        street: '456 Business Ave',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      },
      property_type: 'commercial',
      total_units: 8,
      occupied_units: 6,
      available_units: 2,
      average_rent: 8500,
      monthly_revenue: 51000,
      status: 'active',
      occupancy: { rate: 75.0 },
      last_updated: '2024-07-11T14:15:00Z',
      description: 'Prime downtown office space with city views',
      amenities: ['Conference Rooms', 'High-Speed Internet', 'Security'],
      maintenance: { open: 1, completed: 8 }
    },
    {
      id: '3',
      name: 'Garden View Townhomes',
      address: {
        street: '789 Garden St',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      },
      property_type: 'residential',
      total_units: 16,
      occupied_units: 14,
      available_units: 1,
      average_rent: 2200,
      monthly_revenue: 30800,
      status: 'maintenance',
      occupancy: { rate: 87.5 },
      last_updated: '2024-07-09T09:45:00Z',
      description: 'Family-friendly townhomes with private gardens',
      amenities: ['Private Garden', 'Garage', 'Pet Friendly'],
      maintenance: { open: 7, completed: 5 }
    }
  ];
  
  // Calculate metrics from properties array
  const calculateMetricsFromProperties = (properties) => {
    if (!properties || properties.length === 0) {
      return {
        totalProperties: 0,
        totalUnits: 0,
        occupiedUnits: 0,
        occupancyRate: 0,
        totalRevenue: 0,
        avgOccupancy: 0
      };
    }
    
    const totals = properties.reduce((acc, property) => ({
      totalUnits: acc.totalUnits + (property.total_units || 0),
      occupiedUnits: acc.occupiedUnits + (property.occupied_units || 0),
      totalRevenue: acc.totalRevenue + (property.monthly_revenue || 0),
      avgOccupancy: acc.avgOccupancy + (property.occupancy?.rate || 0)
    }), { totalUnits: 0, occupiedUnits: 0, totalRevenue: 0, avgOccupancy: 0 });
    
    return {
      totalProperties: properties.length,
      ...totals,
      occupancyRate: totals.totalUnits > 0 ? (totals.occupiedUnits / totals.totalUnits) * 100 : 0,
      avgOccupancy: totals.avgOccupancy / properties.length
    };
  };
  
  // Data transformation helpers
  const transformers = {
    // Transform backend property to frontend format
    toFrontend: (backendProperty) => {
      return {
        id: backendProperty.id,
        name: backendProperty.name,
        address: backendProperty.full_address,
        property_type: backendProperty.property_type,
        total_units: backendProperty.total_units,
        occupied_units: Math.round(backendProperty.total_units * (backendProperty.occupancy_rate / 100)),
        available_units: backendProperty.total_units - Math.round(backendProperty.total_units * (backendProperty.occupancy_rate / 100)),
        average_rent: 0, // TODO: Calculate from units
        monthly_revenue: 0, // TODO: Calculate from units
        status: backendProperty.is_active ? 'active' : 'inactive',
        occupancy: { rate: backendProperty.occupancy_rate },
        last_updated: backendProperty.updated_at,
        description: backendProperty.description,
        amenities: backendProperty.features || [], // Map features to amenities
        maintenance: { open: 0, completed: 0 }, // TODO: Get from stats endpoint
        // Keep original data for editing
        _original: backendProperty
      };
    },
    
    // Transform frontend property to backend format
    toBackend: (frontendProperty) => {
      return {
        name: frontendProperty.name,
        property_type: frontendProperty.property_type,
        address: frontendProperty.address,
        total_units: frontendProperty.total_units,
        description: frontendProperty.description,
        valor_merchant_id: frontendProperty.valor_merchant_id,
        amenities: frontendProperty.amenities
      };
    }
  };
  
  // Cache management
  const cache = {
    properties: null,
    metrics: null,
    lastFetch: null,
    ttl: 5 * 60 * 1000, // 5 minutes
    
    isValid(key) {
      return this[key] && this.lastFetch && (Date.now() - this.lastFetch) < this.ttl;
    },
    
    set(key, data) {
      this[key] = data;
      this.lastFetch = Date.now();
    },
    
    get(key) {
      return this.isValid(key) ? this[key] : null;
    },
    
    clear() {
      this.properties = null;
      this.metrics = null;
      this.lastFetch = null;
    }
  };
  
  // Enhanced API methods with caching
  const cachedPropertyAPI = {
    // Get properties with caching
    async getProperties(filters = {}, useCache = true) {
      // Check cache first
      if (useCache && !filters.search && !filters.type && !filters.status) {
        const cached = cache.get('properties');
        if (cached) return cached;
      }
      
      const result = await propertyAPI.getProperties(filters);
      
      // Cache only unfiltered results
      if (useCache && !filters.search && !filters.type && !filters.status) {
        cache.set('properties', result);
      }
      
      return result;
    },
    
    // Create property and invalidate cache
    async createProperty(propertyData) {
      const result = await propertyAPI.createProperty(propertyData);
      cache.clear(); // Invalidate cache
      return result;
    },
    
    // Update property and invalidate cache
    async updateProperty(propertyId, propertyData) {
      const result = await propertyAPI.updateProperty(propertyId, propertyData);
      cache.clear(); // Invalidate cache
      return result;
    },
    
    // Delete property and invalidate cache
    async deleteProperty(propertyId) {
      const result = await propertyAPI.deleteProperty(propertyId);
      cache.clear(); // Invalidate cache
      return result;
    },
    
    // Get metrics with caching
    async getPropertyMetrics(useCache = true) {
      if (useCache) {
        const cached = cache.get('metrics');
        if (cached) return cached;
      }
      
      const result = await propertyAPI.getPropertyMetrics();
      
      if (useCache) {
        cache.set('metrics', result);
      }
      
      return result;
    },
    
    // Get single property (no caching for individual items)
    getProperty: propertyAPI.getProperty
  };
  
  // Public API
  return {
    init,
    ...cachedPropertyAPI,
    transformers,
    cache,
    // Direct access to uncached API for special cases
    raw: propertyAPI
  };
})();

// Auto-initialize with global API client
if (typeof window !== 'undefined') {
  // Try to initialize with existing API client
  const initializeWhenReady = () => {
    if (window.apiClient || window.api) {
      PropertyService.init(window.apiClient || window.api);
    } else {
      // Retry after a short delay
      setTimeout(initializeWhenReady, 100);
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
  } else {
    initializeWhenReady();
  }
}

// Export for module system
window.AppModules = window.AppModules || {};
window.AppModules.PropertyService = PropertyService;
window.PropertyService = PropertyService;