// Properties Page using Component Factory Pattern
const Properties = ComponentFactory.createComponent('Properties', {
  // Private helpers specific to this component
  privateHelpers: {
    // Mock data generator for development
    generateMockProperties: () => [
      {
        id: 1,
        name: 'Sunset Apartments',
        address: '123 Sunset Blvd, Los Angeles, CA 90028',
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
        id: 2,
        name: 'Downtown Office Plaza',
        address: '456 Business Ave, San Francisco, CA 94105',
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
        id: 3,
        name: 'Garden View Townhomes',
        address: '789 Garden St, Austin, TX 78701',
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
      },
      {
        id: 4,
        name: 'Metro Mixed Use',
        address: '321 Metro Plaza, Seattle, WA 98101',
        property_type: 'mixed',
        total_units: 32,
        occupied_units: 28,
        available_units: 4,
        average_rent: 3200,
        monthly_revenue: 89600,
        status: 'active',
        occupancy: { rate: 87.5 },
        last_updated: '2024-07-12T08:20:00Z',
        description: 'Mixed-use development with retail and residential',
        amenities: ['Retail Space', 'Rooftop Deck', 'Concierge'],
        maintenance: { open: 2, completed: 15 }
      }
    ],
    
    calculateMetrics: (properties) => {
      const totals = properties.reduce((acc, property) => ({
        totalUnits: acc.totalUnits + property.total_units,
        occupiedUnits: acc.occupiedUnits + property.occupied_units,
        totalRevenue: acc.totalRevenue + property.monthly_revenue,
        avgOccupancy: acc.avgOccupancy + property.occupancy.rate
      }), { totalUnits: 0, occupiedUnits: 0, totalRevenue: 0, avgOccupancy: 0 });
      
      return {
        ...totals,
        avgOccupancy: totals.avgOccupancy / properties.length,
        occupancyRate: (totals.occupiedUnits / totals.totalUnits) * 100
      };
    },
    
    getPropertyTypeIcon: (type) => {
      const icons = {
        residential: '🏠',
        commercial: '🏢',
        mixed: '🏗️',
        industrial: '🏭'
      };
      return icons[type] || '🏢';
    },
    
    getStatusColor: (status) => {
      const colors = {
        active: 'var(--color-success)',
        maintenance: 'var(--color-warning)', 
        vacant: 'var(--color-danger)',
        inactive: 'var(--color-muted)'
      };
      return colors[status] || 'var(--color-muted)';
    }
  },
  
  // Default props
  defaultProps: {
    showMetrics: true,
    showFilters: true,
    itemsPerPage: 12
  },
  
  // Enable performance tracking and error boundary
  withPerformanceTracking: true,
  withErrorBoundary: true
  
})((props, helpers) => {
  // Destructure props
  const { showMetrics, showFilters, itemsPerPage } = props;
  
  // Destructure helpers
  const { 
    useLocalState,
    useAsyncState,
    formatCurrency,
    formatPercentage,
    classNames,
    generateMockProperties,
    calculateMetrics,
    getPropertyTypeIcon,
    getStatusColor
  } = helpers;
  
  // Component state
  const [state, updateState] = useLocalState({
    showAddModal: false,
    selectedProperty: null,
    view: 'grid', // 'grid' or 'list'
    sortBy: 'name',
    sortOrder: 'asc',
    refreshTrigger: 0, // Used to trigger data refresh
    filters: {
      type: '',
      status: '',
      search: ''
    }
  });
  
  // Load properties data
  const propertiesData = useAsyncState(async () => {
    try {
      // Use real API service
      const response = await window.PropertyService.getProperties(state.filters);
      return response.properties.map(property => 
        window.PropertyService.transformers.toFrontend(property)
      );
    } catch (error) {
      console.error('Failed to load properties:', error);
      // Fallback to mock data in development
      if (window.location.hostname === 'localhost') {
        console.warn('Using fallback mock data');
        return generateMockProperties();
      }
      throw error;
    }
  }, [state.filters]);
  
  const properties = propertiesData.data || [];
  const metrics = React.useMemo(() => 
    properties.length > 0 ? calculateMetrics(properties) : null,
    [properties]
  );
  
  // Event handlers
  const handleAddProperty = () => {
    updateState({ showAddModal: true });
  };
  
  const handleSaveProperty = async (propertyData) => {
    try {
      if (state.selectedProperty) {
        // Update existing property
        await window.PropertyService.updateProperty(state.selectedProperty.id, propertyData);
        console.log('Property updated successfully');
      } else {
        // Create new property
        await window.PropertyService.createProperty(propertyData);
        console.log('Property created successfully');
      }
      
      // Close modal and refresh data
      updateState({ showAddModal: false, selectedProperty: null });
      
      // Trigger data refresh by updating a dependency
      updateState({ refreshTrigger: Date.now() });
      
      // Show success message
      const message = state.selectedProperty ? 'Property updated successfully!' : 'Property created successfully!';
      alert(message);
      
    } catch (error) {
      console.error('Property save error:', error);
      throw new Error(error.message || 'Failed to save property');
    }
  };
  
  const handleEditProperty = (property) => {
    updateState({ selectedProperty: property, showAddModal: true });
  };
  
  const handleDeleteProperty = async (propertyId) => {
    try {
      // Call real API
      await window.PropertyService.deleteProperty(propertyId);
      console.log('Property deleted successfully');
      
      // Trigger data refresh
      updateState({ refreshTrigger: Date.now() });
      
      // Show success message
      alert('Property deleted successfully!');
      
    } catch (error) {
      console.error('Delete property error:', error);
      alert(error.message || 'Failed to delete property');
    }
  };
  
  const handleViewProperty = (property) => {
    console.log('Viewing property:', property);
    // Navigate to property detail page
  };
  
  // Render helpers
  const renderMetricsCards = () => {
    if (!showMetrics || !metrics) return null;
    
    const metricCards = [
      {
        title: 'Total Properties',
        value: properties.length,
        icon: '🏢',
        color: 'var(--color-primary)'
      },
      {
        title: 'Total Units',
        value: metrics.totalUnits,
        icon: '🏠',
        color: 'var(--color-info)'
      },
      {
        title: 'Occupancy Rate',
        value: formatPercentage(metrics.occupancyRate),
        icon: '📊',
        color: 'var(--color-success)'
      },
      {
        title: 'Monthly Revenue',
        value: formatCurrency(metrics.totalRevenue),
        icon: '💰',
        color: 'var(--color-warning)'
      }
    ];
    
    return React.createElement('div', { 
      className: 'metrics-grid' 
    },
      metricCards.map((metric, index) =>
        React.createElement('div', { 
          key: index,
          className: 'metric-card'
        }, [
          React.createElement('div', { 
            key: 'icon',
            className: 'metric-icon',
            style: { color: metric.color }
          }, metric.icon),
          
          React.createElement('div', { key: 'content', className: 'metric-content' }, [
            React.createElement('div', { 
              key: 'value',
              className: 'metric-value' 
            }, metric.value),
            React.createElement('div', { 
              key: 'title',
              className: 'metric-title' 
            }, metric.title)
          ])
        ])
      )
    );
  };
  
  const renderToolbar = () => {
    return React.createElement('div', { className: 'properties-toolbar' }, [
      // Left side - filters and search
      React.createElement('div', { key: 'left', className: 'toolbar-left' }, [
        showFilters && React.createElement('div', { 
          key: 'filters',
          className: 'toolbar-filters' 
        }, [
          React.createElement('input', {
            key: 'search',
            type: 'text',
            placeholder: 'Search properties...',
            className: 'search-input',
            value: state.filters.search,
            onChange: (e) => updateState({
              filters: { ...state.filters, search: e.target.value }
            })
          }),
          
          React.createElement('select', {
            key: 'type',
            className: 'filter-select',
            value: state.filters.type,
            onChange: (e) => updateState({
              filters: { ...state.filters, type: e.target.value }
            })
          }, [
            React.createElement('option', { value: '' }, 'All Types'),
            React.createElement('option', { value: 'residential' }, 'Residential'),
            React.createElement('option', { value: 'commercial' }, 'Commercial'),
            React.createElement('option', { value: 'mixed' }, 'Mixed Use'),
            React.createElement('option', { value: 'industrial' }, 'Industrial')
          ]),
          
          React.createElement('select', {
            key: 'status',
            className: 'filter-select',
            value: state.filters.status,
            onChange: (e) => updateState({
              filters: { ...state.filters, status: e.target.value }
            })
          }, [
            React.createElement('option', { value: '' }, 'All Status'),
            React.createElement('option', { value: 'active' }, 'Active'),
            React.createElement('option', { value: 'maintenance' }, 'Maintenance'),
            React.createElement('option', { value: 'vacant' }, 'Vacant'),
            React.createElement('option', { value: 'inactive' }, 'Inactive')
          ])
        ])
      ]),
      
      // Right side - view controls and actions
      React.createElement('div', { key: 'right', className: 'toolbar-right' }, [
        React.createElement('div', { key: 'view', className: 'view-controls' }, [
          React.createElement('button', {
            key: 'grid',
            className: classNames('view-button', state.view === 'grid' && 'active'),
            onClick: () => updateState({ view: 'grid' }),
            title: 'Grid View'
          }, '⊞'),
          
          React.createElement('button', {
            key: 'list',
            className: classNames('view-button', state.view === 'list' && 'active'),
            onClick: () => updateState({ view: 'list' }),
            title: 'List View'
          }, '☰')
        ]),
        
        React.createElement('button', {
          key: 'add',
          className: 'btn btn-primary',
          onClick: handleAddProperty
        }, [
          React.createElement('span', { key: 'icon' }, '+ '),
          'Add Property'
        ])
      ])
    ]);
  };
  
  const renderPropertiesGrid = () => {
    if (propertiesData.loading) {
      return React.createElement('div', { className: 'loading-state' }, [
        React.createElement('div', { key: 'spinner', className: 'spinner' }),
        React.createElement('p', { key: 'text' }, 'Loading properties...')
      ]);
    }
    
    if (propertiesData.error) {
      return React.createElement('div', { className: 'error-state' }, [
        React.createElement('h3', { key: 'title' }, 'Error Loading Properties'),
        React.createElement('p', { key: 'message' }, propertiesData.error),
        React.createElement('button', { 
          key: 'retry',
          className: 'btn btn-primary',
          onClick: () => window.location.reload()
        }, 'Retry')
      ]);
    }
    
    if (properties.length === 0) {
      return React.createElement('div', { className: 'empty-state' }, [
        React.createElement('div', { key: 'icon', className: 'empty-icon' }, '🏢'),
        React.createElement('h3', { key: 'title' }, 'No Properties Found'),
        React.createElement('p', { key: 'message' }, 'Get started by adding your first property.'),
        React.createElement('button', {
          key: 'add',
          className: 'btn btn-primary',
          onClick: handleAddProperty
        }, 'Add Property')
      ]);
    }
    
    // Use the PropertyList component we created earlier
    return React.createElement(window.AppModules.PropertyList, {
      properties,
      onEdit: handleEditProperty,
      onDelete: handleDeleteProperty,
      onView: handleViewProperty,
      compact: state.view === 'list',
      itemsPerPage
    });
  };
  
  const renderAddModal = () => {
    if (!state.showAddModal) return null;
    
    return React.createElement(window.AppModules.AddPropertyModal, {
      title: state.selectedProperty ? 'Edit Property' : 'Add New Property',
      submitText: state.selectedProperty ? 'Update Property' : 'Create Property',
      initialData: state.selectedProperty,
      onClose: () => updateState({ showAddModal: false, selectedProperty: null }),
      onSave: handleSaveProperty
    });
  };
  
  // Main render
  return React.createElement('div', { className: 'properties-page' }, [
    // Page Header
    React.createElement('div', { key: 'header', className: 'page-header' }, [
      React.createElement('div', { key: 'title-section' }, [
        React.createElement('h1', { key: 'title' }, 'Properties'),
        React.createElement('p', { key: 'subtitle' }, 'Manage your property portfolio')
      ])
    ]),
    
    // Metrics Cards
    renderMetricsCards(),
    
    // Toolbar
    renderToolbar(),
    
    // Properties Grid/List
    React.createElement('div', { key: 'content', className: 'properties-content' },
      renderPropertiesGrid()
    ),
    
    // Add/Edit Modal
    renderAddModal()
  ]);
});

// Create placeholder components for other pages
const Units = ComponentFactory.createComponent('Units', {})((props, helpers) => {
  return React.createElement('div', { className: 'page-placeholder' }, [
    React.createElement('h2', { key: 'title' }, '🏠 Units Management'),
    React.createElement('p', { key: 'description' }, 'Manage individual units within your properties. Coming soon!')
  ]);
});

const Tenants = ComponentFactory.createComponent('Tenants', {})((props, helpers) => {
  return React.createElement('div', { className: 'page-placeholder' }, [
    React.createElement('h2', { key: 'title' }, '👥 Tenant Management'),
    React.createElement('p', { key: 'description' }, 'Manage tenant information, applications, and communications. Coming soon!')
  ]);
});

const Leases = ComponentFactory.createComponent('Leases', {})((props, helpers) => {
  return React.createElement('div', { className: 'page-placeholder' }, [
    React.createElement('h2', { key: 'title' }, '📋 Lease Management'),
    React.createElement('p', { key: 'description' }, 'Create, manage, and track lease agreements. Coming soon!')
  ]);
});

const Maintenance = ComponentFactory.createComponent('Maintenance', {})((props, helpers) => {
  return React.createElement('div', { className: 'page-placeholder' }, [
    React.createElement('h2', { key: 'title' }, '🔧 Maintenance Requests'),
    React.createElement('p', { key: 'description' }, 'Track and manage property maintenance requests. Coming soon!')
  ]);
});

const Accounting = ComponentFactory.createComponent('Accounting', {})((props, helpers) => {
  return React.createElement('div', { className: 'page-placeholder' }, [
    React.createElement('h2', { key: 'title' }, '💰 Accounting & Finance'),
    React.createElement('p', { key: 'description' }, 'Manage finances, rent collection, and accounting. Coming soon!')
  ]);
});

const Reports = ComponentFactory.createComponent('Reports', {})((props, helpers) => {
  return React.createElement('div', { className: 'page-placeholder' }, [
    React.createElement('h2', { key: 'title' }, '📊 Reports & Analytics'),
    React.createElement('p', { key: 'description' }, 'Generate comprehensive reports and analytics. Coming soon!')
  ]);
});

// Export all components
window.AppModules = window.AppModules || {};
window.AppModules.Properties = Properties;
window.AppModules.Units = Units;
window.AppModules.Tenants = Tenants;
window.AppModules.Leases = Leases;
window.AppModules.Maintenance = Maintenance;
window.AppModules.Accounting = Accounting;
window.AppModules.Reports = Reports;