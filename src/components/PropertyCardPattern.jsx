// Property Card using the Component Factory Pattern
const PropertyCard = ComponentFactory.createComponent('PropertyCard', {
  // Private helpers specific to this component
  privateHelpers: {
    getOccupancyColor: (rate) => {
      if (rate >= 95) return '#00C851';
      if (rate >= 80) return '#ffbb33';
      return '#ff4444';
    },
    
    getStatusBadgeClass: (status) => {
      const statusMap = {
        active: 'status-active',
        maintenance: 'status-maintenance', 
        vacant: 'status-vacant'
      };
      return statusMap[status] || 'status-default';
    },
    
    truncateDescription: (text, maxLength = 100) => {
      if (!text || text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    }
  },
  
  // Default props
  defaultProps: {
    showActions: true,
    compact: false,
    showOccupancy: true
  },
  
  // Prop types for development validation
  propTypes: {
    property: 'object',
    onEdit: 'function',
    onDelete: 'function',
    onView: 'function',
    showActions: 'boolean',
    compact: 'boolean'
  },
  
  // Enable performance tracking
  withPerformanceTracking: true,
  
  // Enable error boundary
  withErrorBoundary: true
  
})((props, helpers, ref) => {
  // Destructure props
  const { 
    property, 
    onEdit, 
    onDelete, 
    onView, 
    showActions, 
    compact, 
    showOccupancy 
  } = props;
  
  // Destructure helpers
  const { 
    formatCurrency, 
    formatDate, 
    formatPercentage,
    classNames,
    useLocalState,
    getOccupancyColor,
    getStatusBadgeClass,
    truncateDescription
  } = helpers;
  
  // Component state
  const [state, updateState] = useLocalState({
    isHovered: false,
    showDetails: false,
    loading: false
  });
  
  // Computed values
  const occupancyRate = property.occupancy?.rate || 0;
  const occupancyColor = getOccupancyColor(occupancyRate);
  const statusClass = getStatusBadgeClass(property.status);
  
  // Event handlers
  const handleMouseEnter = () => updateState({ isHovered: true });
  const handleMouseLeave = () => updateState({ isHovered: false });
  
  const handleToggleDetails = () => {
    updateState({ showDetails: !state.showDetails });
  };
  
  const handleEdit = () => {
    if (onEdit) onEdit(property);
  };
  
  const handleDelete = () => {
    if (onDelete && confirm(`Delete property "${property.name}"?`)) {
      onDelete(property.id);
    }
  };
  
  const handleView = () => {
    if (onView) onView(property);
  };
  
  // Render helpers
  const renderHeader = () => (
    React.createElement('div', { 
      className: 'property-card-header' 
    }, [
      React.createElement('h3', { 
        key: 'title',
        className: 'property-title' 
      }, property.name),
      
      React.createElement('span', {
        key: 'status',
        className: classNames('status-badge', statusClass)
      }, property.status),
      
      showOccupancy && React.createElement('div', {
        key: 'occupancy',
        className: 'occupancy-indicator',
        style: { color: occupancyColor }
      }, formatPercentage(occupancyRate))
    ])
  );
  
  const renderContent = () => (
    React.createElement('div', { 
      className: 'property-card-content' 
    }, [
      React.createElement('p', { 
        key: 'address',
        className: 'property-address' 
      }, property.address),
      
      property.description && React.createElement('p', {
        key: 'description',
        className: 'property-description'
      }, compact ? truncateDescription(property.description) : property.description),
      
      React.createElement('div', { 
        key: 'stats',
        className: 'property-stats' 
      }, [
        React.createElement('div', { key: 'units' }, [
          React.createElement('span', { key: 'label' }, 'Units: '),
          React.createElement('strong', { key: 'value' }, property.total_units || 'N/A')
        ]),
        
        React.createElement('div', { key: 'rent' }, [
          React.createElement('span', { key: 'label' }, 'Avg Rent: '),
          React.createElement('strong', { key: 'value' }, formatCurrency(property.average_rent || 0))
        ]),
        
        property.last_updated && React.createElement('div', { key: 'updated' }, [
          React.createElement('span', { key: 'label' }, 'Updated: '),
          React.createElement('small', { key: 'value' }, formatDate(property.last_updated))
        ])
      ])
    ])
  );
  
  const renderActions = () => {
    if (!showActions) return null;
    
    return React.createElement('div', { 
      className: 'property-card-actions' 
    }, [
      React.createElement('button', {
        key: 'view',
        className: 'btn btn-outline btn-sm',
        onClick: handleView,
        disabled: state.loading
      }, '👁️ View'),
      
      React.createElement('button', {
        key: 'edit',
        className: 'btn btn-primary btn-sm',
        onClick: handleEdit,
        disabled: state.loading
      }, '✏️ Edit'),
      
      React.createElement('button', {
        key: 'delete',
        className: 'btn btn-danger btn-sm',
        onClick: handleDelete,
        disabled: state.loading
      }, '🗑️ Delete')
    ]);
  };
  
  const renderDetailsToggle = () => {
    if (compact) return null;
    
    return React.createElement('button', {
      className: 'details-toggle',
      onClick: handleToggleDetails
    }, state.showDetails ? '▼ Less Details' : '▶ More Details');
  };
  
  const renderExpandedDetails = () => {
    if (!state.showDetails) return null;
    
    return React.createElement('div', {
      className: 'property-expanded-details'
    }, [
      property.amenities && React.createElement('div', { key: 'amenities' }, [
        React.createElement('h4', { key: 'title' }, 'Amenities'),
        React.createElement('ul', { key: 'list' },
          property.amenities.map((amenity, i) =>
            React.createElement('li', { key: i }, amenity)
          )
        )
      ]),
      
      property.maintenance && React.createElement('div', { key: 'maintenance' }, [
        React.createElement('h4', { key: 'title' }, 'Maintenance'),
        React.createElement('p', { key: 'open' }, `Open Tickets: ${property.maintenance.open || 0}`),
        React.createElement('p', { key: 'completed' }, `Completed This Month: ${property.maintenance.completed || 0}`)
      ])
    ]);
  };
  
  // Main render
  return React.createElement('div', {
    ref,
    className: classNames(
      'property-card',
      compact && 'property-card-compact',
      state.isHovered && 'property-card-hovered',
      property.status && `property-card-${property.status}`
    ),
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    'data-property-id': property.id
  }, [
    renderHeader(),
    renderContent(),
    renderDetailsToggle(),
    renderExpandedDetails(),
    renderActions()
  ]);
});

// Enhanced Property List using the same pattern
const PropertyList = ComponentFactory.createComponent('PropertyList', {
  privateHelpers: {
    sortProperties: (properties, sortBy, sortOrder) => {
      return [...properties].sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    },
    
    filterProperties: (properties, filters) => {
      return properties.filter(property => {
        if (filters.status && property.status !== filters.status) return false;
        if (filters.minUnits && property.total_units < filters.minUnits) return false;
        if (filters.maxUnits && property.total_units > filters.maxUnits) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const searchableText = `${property.name} ${property.address} ${property.description}`.toLowerCase();
          if (!searchableText.includes(searchLower)) return false;
        }
        return true;
      });
    }
  },
  
  defaultProps: {
    compact: false,
    showFilters: true,
    showSort: true,
    itemsPerPage: 10
  },
  
  withPerformanceTracking: true,
  withErrorBoundary: true
  
})((props, helpers) => {
  const { 
    properties = [], 
    onEdit, 
    onDelete, 
    onView,
    compact,
    showFilters,
    showSort,
    itemsPerPage
  } = props;
  
  const { 
    useLocalState, 
    sortProperties, 
    filterProperties,
    debounce,
    classNames
  } = helpers;
  
  // Component state
  const [state, updateState] = useLocalState({
    sortBy: 'name',
    sortOrder: 'asc',
    filters: {
      status: '',
      search: '',
      minUnits: '',
      maxUnits: ''
    },
    currentPage: 1
  });
  
  // Debounced search
  const debouncedSearch = React.useMemo(
    () => debounce((searchValue) => {
      updateState({ 
        filters: { ...state.filters, search: searchValue },
        currentPage: 1 
      });
    }, 300),
    [state.filters]
  );
  
  // Process properties
  const filteredProperties = filterProperties(properties, state.filters);
  const sortedProperties = sortProperties(filteredProperties, state.sortBy, state.sortOrder);
  
  // Pagination
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);
  const startIndex = (state.currentPage - 1) * itemsPerPage;
  const paginatedProperties = sortedProperties.slice(startIndex, startIndex + itemsPerPage);
  
  // Event handlers
  const handleSort = (field) => {
    const newOrder = state.sortBy === field && state.sortOrder === 'asc' ? 'desc' : 'asc';
    updateState({ sortBy: field, sortOrder: newOrder });
  };
  
  const handleFilterChange = (filterKey, value) => {
    updateState({ 
      filters: { ...state.filters, [filterKey]: value },
      currentPage: 1 
    });
  };
  
  const handlePageChange = (page) => {
    updateState({ currentPage: page });
  };
  
  // Render methods
  const renderFilters = () => {
    if (!showFilters) return null;
    
    return React.createElement('div', { className: 'property-filters' }, [
      React.createElement('input', {
        key: 'search',
        type: 'text',
        placeholder: 'Search properties...',
        onChange: (e) => debouncedSearch(e.target.value),
        className: 'filter-search'
      }),
      
      React.createElement('select', {
        key: 'status',
        value: state.filters.status,
        onChange: (e) => handleFilterChange('status', e.target.value),
        className: 'filter-status'
      }, [
        React.createElement('option', { key: 'all', value: '' }, 'All Statuses'),
        React.createElement('option', { key: 'active', value: 'active' }, 'Active'),
        React.createElement('option', { key: 'maintenance', value: 'maintenance' }, 'Maintenance'),
        React.createElement('option', { key: 'vacant', value: 'vacant' }, 'Vacant')
      ])
    ]);
  };
  
  const renderSort = () => {
    if (!showSort) return null;
    
    const sortFields = [
      { key: 'name', label: 'Name' },
      { key: 'total_units', label: 'Units' },
      { key: 'average_rent', label: 'Rent' },
      { key: 'last_updated', label: 'Updated' }
    ];
    
    return React.createElement('div', { className: 'property-sort' },
      sortFields.map(field =>
        React.createElement('button', {
          key: field.key,
          className: classNames(
            'sort-button',
            state.sortBy === field.key && 'active',
            state.sortBy === field.key && `sort-${state.sortOrder}`
          ),
          onClick: () => handleSort(field.key)
        }, [
          field.label,
          state.sortBy === field.key && (state.sortOrder === 'asc' ? ' ↑' : ' ↓')
        ])
      )
    );
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return React.createElement('div', { className: 'pagination' }, [
      React.createElement('button', {
        key: 'prev',
        disabled: state.currentPage === 1,
        onClick: () => handlePageChange(state.currentPage - 1)
      }, 'Previous'),
      
      React.createElement('span', { key: 'info' }, 
        `Page ${state.currentPage} of ${totalPages}`
      ),
      
      React.createElement('button', {
        key: 'next',
        disabled: state.currentPage === totalPages,
        onClick: () => handlePageChange(state.currentPage + 1)
      }, 'Next')
    ]);
  };
  
  const renderPropertyCards = () => {
    if (paginatedProperties.length === 0) {
      return React.createElement('div', { className: 'no-properties' },
        'No properties found matching your criteria.'
      );
    }
    
    return React.createElement('div', { 
      className: classNames(
        'property-grid',
        compact && 'property-grid-compact'
      )
    },
      paginatedProperties.map(property =>
        React.createElement(PropertyCard, {
          key: property.id,
          property,
          onEdit,
          onDelete,
          onView,
          compact
        })
      )
    );
  };
  
  // Main render
  return React.createElement('div', { className: 'property-list' }, [
    renderFilters(),
    renderSort(),
    renderPropertyCards(),
    renderPagination()
  ]);
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.PropertyCard = PropertyCard;
window.AppModules.PropertyList = PropertyList;