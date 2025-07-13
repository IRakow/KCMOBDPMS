// Enhanced Properties Page with AI Insights and Smart Features
const PropertiesV2 = ComponentFactory.createComponent('PropertiesV2', {
  privateHelpers: {
    calculateOccupancy: (properties) => {
      if (!properties.length) return 0;
      const totalUnits = properties.reduce((sum, p) => sum + (p.total_units || 0), 0);
      const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupied_units || 0), 0);
      return totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    },
    
    calculateRevenue: (properties) => {
      return properties.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0);
    },
    
    formatRevenue: (amount) => {
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
      return amount.toString();
    },
    
    filterProperties: (properties, filters) => {
      return properties.filter(property => {
        // Search filter
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          const searchText = `${property.name} ${property.address} ${property.description || ''}`.toLowerCase();
          if (!searchText.includes(searchTerm)) return false;
        }
        
        // Type filter
        if (filters.type !== 'all' && property.property_type !== filters.type) {
          return false;
        }
        
        // Status filter
        if (filters.status !== 'all' && property.status !== filters.status) {
          return false;
        }
        
        // Occupancy range filter
        const occupancyRate = property.occupancy?.rate || 0;
        if (occupancyRate < filters.occupancyRange[0] || occupancyRate > filters.occupancyRange[1]) {
          return false;
        }
        
        return true;
      });
    },
    
    generateMockInsights: () => [
      {
        type: 'alert',
        icon: 'fa-exclamation-triangle',
        title: '3 Properties Need Attention',
        description: 'High vacancy rates detected',
        actionable: true
      },
      {
        type: 'success',
        icon: 'fa-chart-line',
        title: 'Revenue Up 12%',
        description: 'Compared to last month',
        actionable: false
      },
      {
        type: 'info',
        icon: 'fa-lightbulb',
        title: 'Optimization Available',
        description: '2 properties below market rent',
        actionable: true
      }
    ],
    
    generatePropertyInsights: (property) => {
      const insights = [];
      
      if (property.occupancy?.rate < 70) {
        insights.push({
          icon: 'fa-exclamation-triangle',
          message: 'Low occupancy - consider marketing review',
          type: 'warning'
        });
      }
      
      if (property.average_rent < 2500) {
        insights.push({
          icon: 'fa-arrow-up',
          message: 'Rent increase opportunity identified',
          type: 'info'
        });
      }
      
      if (property.maintenance?.open > 5) {
        insights.push({
          icon: 'fa-wrench',
          message: 'High maintenance backlog',
          type: 'warning'
        });
      }
      
      return insights;
    }
  },
  
  defaultProps: {
    showInsights: true,
    defaultView: 'grid'
  },
  
  withPerformanceTracking: true,
  withErrorBoundary: true
  
})((props, helpers) => {
  const {
    useLocalState,
    useAsyncState,
    formatCurrency,
    formatDate,
    classNames,
    calculateOccupancy,
    calculateRevenue,
    formatRevenue,
    filterProperties,
    generateMockInsights,
    generatePropertyInsights
  } = helpers;
  
  const [state, updateState] = useLocalState({
    view: props.defaultView,
    filters: {
      search: '',
      type: 'all',
      status: 'all',
      occupancyRange: [0, 100]
    },
    expandedCards: new Set()
  });
  
  // Load properties with mock data
  const propertiesData = useAsyncState(async () => {
    try {
      const response = await window.PropertyService.getProperties();
      
      // Enrich properties with mock insights and metrics
      return response.properties.map(property => ({
        ...property,
        metrics: {
          occupancyRate: property.occupancy?.rate || 0,
          monthlyRevenue: property.monthly_revenue || 0,
          revenueChange: Math.random() * 20 - 10 // -10% to +10%
        },
        insights: generatePropertyInsights(property),
        recentActivity: [
          {
            timestamp: new Date(Date.now() - Math.random() * 86400000),
            description: 'New lease signed'
          },
          {
            timestamp: new Date(Date.now() - Math.random() * 172800000),
            description: 'Maintenance completed'
          }
        ],
        upcomingLeaseExpirations: Math.floor(Math.random() * 5),
        scheduledMaintenance: Math.floor(Math.random() * 8)
      }));
    } catch (error) {
      console.error('Failed to load properties:', error);
      return [];
    }
  }, []);
  
  const properties = propertiesData.data || [];
  const filteredProperties = filterProperties(properties, state.filters);
  const insights = generateMockInsights();
  
  const updateFilter = (key, value) => {
    updateState({
      filters: { ...state.filters, [key]: value }
    });
  };
  
  const handlePropertyAction = (action, propertyId) => {
    console.log(`Action: ${action} on property ${propertyId}`);
    // Handle different actions
    switch (action) {
      case 'view':
        // Navigate to property details
        break;
      case 'edit':
        // Open edit modal
        break;
      case 'reports':
        // Navigate to reports
        break;
    }
  };
  
  const toggleCardExpansion = (propertyId) => {
    const newExpanded = new Set(state.expandedCards);
    if (newExpanded.has(propertyId)) {
      newExpanded.delete(propertyId);
    } else {
      newExpanded.add(propertyId);
    }
    updateState({ expandedCards: newExpanded });
  };
  
  // Render helpers
  const renderInsightsBar = () => {
    if (!props.showInsights) return null;
    
    return React.createElement('div', { className: 'insights-bar' },
      insights.map((insight, index) =>
        React.createElement('div', {
          key: index,
          className: `insight-card ${insight.type}`
        }, [
          React.createElement('i', {
            key: 'icon',
            className: `fas ${insight.icon}`
          }),
          React.createElement('div', { key: 'content' }, [
            React.createElement('strong', { key: 'title' }, insight.title),
            React.createElement('p', { key: 'desc' }, insight.description)
          ]),
          insight.actionable && React.createElement('button', {
            key: 'action',
            className: 'btn-link'
          }, 'View')
        ])
      )
    );
  };
  
  const renderHeader = () => {
    const occupancy = calculateOccupancy(properties);
    const revenue = calculateRevenue(properties);
    
    return React.createElement('div', { className: 'page-header-v2' }, [
      React.createElement('div', { key: 'main', className: 'header-main' }, [
        React.createElement('h1', { key: 'title' }, 'Properties'),
        React.createElement('div', { key: 'stats', className: 'header-stats' }, [
          React.createElement('span', { key: 'total', className: 'stat' }, [
            React.createElement('strong', { key: 'val' }, properties.length),
            ' Total'
          ]),
          React.createElement('span', { key: 'occupied', className: 'stat' }, [
            React.createElement('strong', { key: 'val' }, `${occupancy}%`),
            ' Occupied'
          ]),
          React.createElement('span', { key: 'revenue', className: 'stat' }, [
            React.createElement('strong', { key: 'val' }, `$${formatRevenue(revenue)}`),
            ' Monthly'
          ])
        ])
      ]),
      React.createElement('div', { key: 'actions', className: 'header-actions' }, [
        React.createElement('button', {
          key: 'import',
          className: 'btn btn-outline'
        }, [
          React.createElement('i', { key: 'icon', className: 'fas fa-file-import' }),
          ' Import'
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
  
  const renderFiltersBar = () => {
    return React.createElement('div', { className: 'filters-bar-v2' }, [
      // Search box
      React.createElement('div', { key: 'search', className: 'search-box-v2' }, [
        React.createElement('i', { key: 'icon', className: 'fas fa-search' }),
        React.createElement('input', {
          key: 'input',
          type: 'text',
          placeholder: 'Search properties, addresses, units...',
          value: state.filters.search,
          onChange: (e) => updateFilter('search', e.target.value)
        }),
        state.filters.search && React.createElement('span', {
          key: 'results',
          className: 'search-results'
        }, `${filteredProperties.length} results`)
      ]),
      
      // Filter chips
      React.createElement('div', { key: 'chips', className: 'filter-chips' }, [
        React.createElement('select', {
          key: 'type',
          value: state.filters.type,
          onChange: (e) => updateFilter('type', e.target.value),
          className: 'filter-select'
        }, [
          React.createElement('option', { key: 'all', value: 'all' }, 'All Types'),
          React.createElement('option', { key: 'res', value: 'residential' }, 'Residential'),
          React.createElement('option', { key: 'com', value: 'commercial' }, 'Commercial'),
          React.createElement('option', { key: 'mixed', value: 'mixed' }, 'Mixed Use')
        ]),
        
        React.createElement('select', {
          key: 'status',
          value: state.filters.status,
          onChange: (e) => updateFilter('status', e.target.value),
          className: 'filter-select'
        }, [
          React.createElement('option', { key: 'all', value: 'all' }, 'All Status'),
          React.createElement('option', { key: 'active', value: 'active' }, 'Active'),
          React.createElement('option', { key: 'maint', value: 'maintenance' }, 'Maintenance'),
          React.createElement('option', { key: 'inactive', value: 'inactive' }, 'Inactive')
        ])
      ]),
      
      // View toggles
      React.createElement('div', { key: 'views', className: 'view-toggles' }, [
        React.createElement('button', {
          key: 'grid',
          className: classNames('view-btn', state.view === 'grid' && 'active'),
          onClick: () => updateState({ view: 'grid' })
        }, React.createElement('i', { className: 'fas fa-th' })),
        
        React.createElement('button', {
          key: 'table',
          className: classNames('view-btn', state.view === 'table' && 'active'),
          onClick: () => updateState({ view: 'table' })
        }, React.createElement('i', { className: 'fas fa-list' })),
        
        React.createElement('button', {
          key: 'map',
          className: classNames('view-btn', state.view === 'map' && 'active'),
          onClick: () => updateState({ view: 'map' })
        }, React.createElement('i', { className: 'fas fa-map' }))
      ])
    ]);
  };
  
  const renderPropertyCard = (property) => {
    const isExpanded = state.expandedCards.has(property.id);
    const occupancyStatus = property.metrics.occupancyRate >= 90 ? 'excellent' 
      : property.metrics.occupancyRate >= 70 ? 'good' 
      : 'needs-attention';
    
    return React.createElement('div', {
      key: property.id,
      className: `property-card-v2 ${occupancyStatus}`
    }, [
      // Quick actions
      React.createElement('div', { key: 'actions', className: 'quick-actions' }, [
        React.createElement('button', {
          key: 'view',
          className: 'action-btn',
          onClick: () => handlePropertyAction('view', property.id),
          title: 'View Details'
        }, React.createElement('i', { className: 'fas fa-eye' })),
        
        React.createElement('button', {
          key: 'edit',
          className: 'action-btn',
          onClick: () => handlePropertyAction('edit', property.id),
          title: 'Edit'
        }, React.createElement('i', { className: 'fas fa-edit' })),
        
        React.createElement('button', {
          key: 'reports',
          className: 'action-btn',
          onClick: () => handlePropertyAction('reports', property.id),
          title: 'Reports'
        }, React.createElement('i', { className: 'fas fa-chart-bar' }))
      ]),
      
      // Property header
      React.createElement('div', { key: 'header', className: 'property-header' }, [
        React.createElement('h3', { key: 'name' }, property.name),
        React.createElement('span', {
          key: 'status',
          className: `status-badge ${property.status}`
        }, property.status)
      ]),
      
      // Key metrics
      React.createElement('div', { key: 'metrics', className: 'property-metrics' }, [
        React.createElement('div', { key: 'units', className: 'metric' }, [
          React.createElement('span', { key: 'val', className: 'metric-value' }, property.total_units),
          React.createElement('span', { key: 'label', className: 'metric-label' }, 'Units')
        ]),
        React.createElement('div', { key: 'occ', className: `metric ${occupancyStatus}` }, [
          React.createElement('span', { key: 'val', className: 'metric-value' }, `${property.metrics.occupancyRate}%`),
          React.createElement('span', { key: 'label', className: 'metric-label' }, 'Occupied')
        ]),
        React.createElement('div', { key: 'rev', className: 'metric' }, [
          React.createElement('span', { key: 'val', className: 'metric-value' }, `$${formatRevenue(property.metrics.monthlyRevenue)}`),
          React.createElement('span', { key: 'label', className: 'metric-label' }, 'Revenue')
        ])
      ]),
      
      // AI Insights
      property.insights && property.insights.length > 0 && React.createElement('div', {
        key: 'insights',
        className: 'property-insights'
      }, [
        React.createElement('div', { key: 'insight', className: 'insight' }, [
          React.createElement('i', { key: 'icon', className: `fas ${property.insights[0].icon}` }),
          React.createElement('span', { key: 'msg' }, property.insights[0].message)
        ])
      ]),
      
      // Expand button
      React.createElement('button', {
        key: 'expand',
        className: 'expand-btn',
        onClick: () => toggleCardExpansion(property.id)
      }, [
        isExpanded ? 'Less' : 'More',
        ' Details ',
        React.createElement('i', {
          key: 'icon',
          className: `fas fa-chevron-${isExpanded ? 'up' : 'down'}`
        })
      ]),
      
      // Expanded details
      isExpanded && React.createElement('div', { key: 'details', className: 'expanded-details' }, [
        React.createElement('div', { key: 'activity', className: 'detail-section' }, [
          React.createElement('h4', { key: 'title' }, 'Recent Activity'),
          React.createElement('ul', { key: 'list', className: 'activity-list' },
            property.recentActivity.map((activity, idx) =>
              React.createElement('li', { key: idx }, [
                React.createElement('span', { key: 'time', className: 'activity-time' }, 
                  formatDate(activity.timestamp)
                ),
                React.createElement('span', { key: 'text', className: 'activity-text' }, 
                  activity.description
                )
              ])
            )
          )
        ]),
        
        React.createElement('div', { key: 'upcoming', className: 'detail-section' }, [
          React.createElement('h4', { key: 'title' }, 'Upcoming'),
          React.createElement('ul', { key: 'list', className: 'upcoming-list' }, [
            React.createElement('li', { key: 'leases' }, [
              React.createElement('i', { key: 'icon', className: 'fas fa-calendar' }),
              ` ${property.upcomingLeaseExpirations} lease expirations`
            ]),
            React.createElement('li', { key: 'maint' }, [
              React.createElement('i', { key: 'icon', className: 'fas fa-wrench' }),
              ` ${property.scheduledMaintenance} maintenance tasks`
            ])
          ])
        ])
      ])
    ]);
  };
  
  const renderContent = () => {
    if (propertiesData.loading) {
      return React.createElement('div', { className: 'loading-state' }, [
        React.createElement('div', { key: 'spinner', className: 'spinner' }),
        React.createElement('p', { key: 'text' }, 'Loading properties...')
      ]);
    }
    
    if (propertiesData.error) {
      return React.createElement('div', { className: 'error-state' }, [
        React.createElement('h3', { key: 'title' }, 'Error Loading Properties'),
        React.createElement('p', { key: 'message' }, propertiesData.error)
      ]);
    }
    
    return React.createElement('div', { className: 'properties-content' }, [
      state.view === 'grid' && React.createElement('div', {
        key: 'grid',
        className: 'properties-grid-v2'
      }, filteredProperties.map(renderPropertyCard)),
      
      state.view === 'table' && React.createElement('div', {
        key: 'table',
        className: 'properties-table-v2'
      }, 'Table view coming soon...'),
      
      state.view === 'map' && React.createElement('div', {
        key: 'map',
        className: 'properties-map'
      }, 'Map view coming soon...')
    ]);
  };
  
  // Main render
  return React.createElement('div', { className: 'properties-v2' }, [
    renderInsightsBar(),
    renderHeader(),
    renderFiltersBar(),
    renderContent()
  ]);
});

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.PropertiesV2 = PropertiesV2;