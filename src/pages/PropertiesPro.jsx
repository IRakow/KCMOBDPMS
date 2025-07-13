// Professional Properties Page - Clean, Modern, High-Contrast Design
const PropertiesPro = ComponentFactory.createComponent('PropertiesPro', {
  privateHelpers: {
    getOccupancyColor: (rate) => {
      if (rate >= 90) return 'success';
      if (rate >= 75) return 'warning';
      return 'danger';
    },
    
    generateMockProperties: () => [
      {
        id: '1',
        name: 'Sunset Apartments',
        status: 'active',
        units: 24,
        occupancy: 91.7,
        revenue: 62700,
        trend: 'up',
        address: '123 Sunset Blvd, Los Angeles, CA 90028',
        type: 'residential'
      },
      {
        id: '2',
        name: 'Downtown Office Plaza',
        status: 'active',
        units: 8,
        occupancy: 75,
        revenue: 51000,
        trend: 'down',
        address: '456 Business Ave, San Francisco, CA 94105',
        type: 'commercial'
      },
      {
        id: '3',
        name: 'Garden View Townhomes',
        status: 'maintenance',
        units: 16,
        occupancy: 87.5,
        revenue: 30800,
        trend: 'stable',
        address: '789 Garden St, Austin, TX 78701',
        type: 'residential'
      }
    ],
    
    filterProperties: (properties, filters) => {
      return properties.filter(property => {
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchText = `${property.name} ${property.address}`.toLowerCase();
          if (!searchText.includes(searchTerm)) return false;
        }
        
        if (filters.type !== 'all' && property.type !== filters.type) {
          return false;
        }
        
        if (filters.status !== 'all' && property.status !== filters.status) {
          return false;
        }
        
        return true;
      });
    }
  },
  
  defaultProps: {
    defaultView: 'cards'
  },
  
  withPerformanceTracking: true,
  withErrorBoundary: true
  
})((props, helpers) => {
  const {
    useLocalState,
    classNames,
    getOccupancyColor,
    generateMockProperties,
    filterProperties
  } = helpers;
  
  const [state, updateState] = useLocalState({
    properties: generateMockProperties(),
    filters: {
      search: '',
      type: 'all',
      status: 'all'
    },
    viewMode: props.defaultView
  });
  
  const filteredProperties = filterProperties(state.properties, state.filters);
  
  const updateFilter = (key, value) => {
    updateState({
      filters: { ...state.filters, [key]: value }
    });
  };
  
  // Calculate metrics
  const totalProperties = filteredProperties.length;
  const totalUnits = filteredProperties.reduce((sum, p) => sum + p.units, 0);
  const totalRevenue = filteredProperties.reduce((sum, p) => sum + p.revenue, 0);
  const avgOccupancy = totalUnits > 0 
    ? (filteredProperties.reduce((sum, p) => sum + p.occupancy * p.units, 0) / totalUnits).toFixed(0)
    : 0;
  
  const renderAlertBar = () => {
    return React.createElement('div', { className: 'alert-bar' }, [
      React.createElement('div', {
        key: 'warning',
        className: 'alert-card warning'
      }, [
        React.createElement('div', { key: 'icon', className: 'alert-icon' },
          React.createElement('i', { className: 'fas fa-exclamation-triangle' })
        ),
        React.createElement('div', { key: 'content', className: 'alert-content' }, [
          React.createElement('h4', { key: 'title' }, '3 Properties Need Attention'),
          React.createElement('p', { key: 'desc' }, 'High vacancy rates detected')
        ]),
        React.createElement('button', { key: 'action', className: 'alert-action' }, 'View')
      ]),
      
      React.createElement('div', {
        key: 'success',
        className: 'alert-card success'
      }, [
        React.createElement('div', { key: 'icon', className: 'alert-icon' },
          React.createElement('i', { className: 'fas fa-trending-up' })
        ),
        React.createElement('div', { key: 'content', className: 'alert-content' }, [
          React.createElement('h4', { key: 'title' }, 'Revenue Up 12%'),
          React.createElement('p', { key: 'desc' }, 'Compared to last month')
        ])
      ]),
      
      React.createElement('div', {
        key: 'info',
        className: 'alert-card info'
      }, [
        React.createElement('div', { key: 'icon', className: 'alert-icon' },
          React.createElement('i', { className: 'fas fa-lightbulb' })
        ),
        React.createElement('div', { key: 'content', className: 'alert-content' }, [
          React.createElement('h4', { key: 'title' }, 'Optimization Available'),
          React.createElement('p', { key: 'desc' }, '2 properties below market rent')
        ]),
        React.createElement('button', { key: 'action', className: 'alert-action' }, 'Review')
      ])
    ]);
  };
  
  const renderHeader = () => {
    return React.createElement('div', { className: 'page-header-pro' }, [
      React.createElement('div', { key: 'left', className: 'header-left' }, [
        React.createElement('h1', { key: 'title' }, 'Properties'),
        React.createElement('div', { key: 'metrics', className: 'header-metrics' }, [
          React.createElement('div', { key: 'total', className: 'metric' }, [
            React.createElement('span', { key: 'value', className: 'metric-value' }, totalProperties),
            React.createElement('span', { key: 'label', className: 'metric-label' }, 'Total')
          ]),
          React.createElement('div', { key: 'occupancy', className: 'metric' }, [
            React.createElement('span', { key: 'value', className: 'metric-value' }, `${avgOccupancy}%`),
            React.createElement('span', { key: 'label', className: 'metric-label' }, 'Occupied')
          ]),
          React.createElement('div', { key: 'revenue', className: 'metric' }, [
            React.createElement('span', { key: 'value', className: 'metric-value' }, 
              `$${(totalRevenue / 1000).toFixed(1)}K`
            ),
            React.createElement('span', { key: 'label', className: 'metric-label' }, 'Monthly Revenue')
          ])
        ])
      ]),
      
      React.createElement('div', { key: 'actions', className: 'header-actions' }, [
        React.createElement('button', {
          key: 'filter',
          className: 'btn btn-secondary'
        }, [
          React.createElement('i', { key: 'icon', className: 'fas fa-filter' }),
          ' Filter'
        ]),
        React.createElement('button', {
          key: 'export',
          className: 'btn btn-secondary'
        }, [
          React.createElement('i', { key: 'icon', className: 'fas fa-download' }),
          ' Export'
        ]),
        React.createElement('button', {
          key: 'add',
          className: 'btn btn-primary'
        }, [
          React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
          ' Add Property'
        ])
      ])
    ]);
  };
  
  const renderControls = () => {
    return React.createElement('div', { className: 'controls-bar' }, [
      React.createElement('div', { key: 'search', className: 'search-container' }, [
        React.createElement('i', { key: 'icon', className: 'fas fa-search' }),
        React.createElement('input', {
          key: 'input',
          type: 'text',
          placeholder: 'Search properties, addresses, units...',
          value: state.filters.search,
          onChange: (e) => updateFilter('search', e.target.value)
        })
      ]),
      
      React.createElement('div', { key: 'filters', className: 'filter-controls' }, [
        React.createElement('select', {
          key: 'type',
          className: 'filter-select',
          value: state.filters.type,
          onChange: (e) => updateFilter('type', e.target.value)
        }, [
          React.createElement('option', { key: 'all', value: 'all' }, 'All Types'),
          React.createElement('option', { key: 'res', value: 'residential' }, 'Residential'),
          React.createElement('option', { key: 'com', value: 'commercial' }, 'Commercial')
        ]),
        
        React.createElement('select', {
          key: 'status',
          className: 'filter-select',
          value: state.filters.status,
          onChange: (e) => updateFilter('status', e.target.value)
        }, [
          React.createElement('option', { key: 'all', value: 'all' }, 'All Status'),
          React.createElement('option', { key: 'active', value: 'active' }, 'Active'),
          React.createElement('option', { key: 'maint', value: 'maintenance' }, 'Maintenance')
        ])
      ]),
      
      React.createElement('div', { key: 'view', className: 'view-toggle' }, [
        React.createElement('button', {
          key: 'cards',
          className: classNames('toggle-btn', state.viewMode === 'cards' && 'active'),
          onClick: () => updateState({ viewMode: 'cards' })
        }, React.createElement('i', { className: 'fas fa-th-large' })),
        
        React.createElement('button', {
          key: 'table',
          className: classNames('toggle-btn', state.viewMode === 'table' && 'active'),
          onClick: () => updateState({ viewMode: 'table' })
        }, React.createElement('i', { className: 'fas fa-list' }))
      ])
    ]);
  };
  
  const renderPropertyCard = (property) => {
    const occupancyStatus = getOccupancyColor(property.occupancy);
    
    return React.createElement('div', {
      key: property.id,
      className: `property-card-pro ${property.status}`
    }, [
      React.createElement('div', { key: 'header', className: 'card-header' }, [
        React.createElement('h3', { key: 'name' }, property.name),
        React.createElement('span', {
          key: 'status',
          className: `status-badge ${property.status}`
        }, property.status.charAt(0).toUpperCase() + property.status.slice(1))
      ]),
      
      React.createElement('div', { key: 'metrics', className: 'card-metrics' }, [
        React.createElement('div', { key: 'units', className: 'metric-item' }, [
          React.createElement('div', { key: 'value', className: 'metric-value' }, property.units),
          React.createElement('div', { key: 'label', className: 'metric-label' }, 'UNITS')
        ]),
        
        React.createElement('div', {
          key: 'occupancy',
          className: `metric-item ${occupancyStatus}`
        }, [
          React.createElement('div', { key: 'value', className: 'metric-value' }, `${property.occupancy}%`),
          React.createElement('div', { key: 'label', className: 'metric-label' }, 'OCCUPIED')
        ]),
        
        React.createElement('div', { key: 'revenue', className: 'metric-item' }, [
          React.createElement('div', { key: 'value', className: 'metric-value' }, 
            `$${(property.revenue / 1000).toFixed(1)}K`
          ),
          React.createElement('div', { key: 'label', className: 'metric-label' }, 'REVENUE')
        ])
      ]),
      
      React.createElement('div', { key: 'footer', className: 'card-footer' }, [
        React.createElement('button', { key: 'details', className: 'btn-text' }, [
          'More Details ',
          React.createElement('i', { key: 'icon', className: 'fas fa-arrow-right' })
        ])
      ])
    ]);
  };
  
  // Main render
  return React.createElement('div', { className: 'properties-pro' }, [
    renderAlertBar(),
    renderHeader(),
    renderControls(),
    
    React.createElement('div', { className: 'properties-container' },
      state.viewMode === 'cards' 
        ? filteredProperties.map(renderPropertyCard)
        : React.createElement('div', { className: 'table-view-placeholder' }, 'Table view coming soon...')
    )
  ]);
});

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.PropertiesPro = PropertiesPro;