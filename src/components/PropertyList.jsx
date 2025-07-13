// Property List Component using Component Factory Pattern
const PropertyList = ComponentFactory.createComponent('PropertyList', {
  // Private helpers specific to this component
  privateHelpers: {
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
    },
    
    formatLastUpdated: (dateString) => {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        
        return date.toLocaleDateString();
      } catch (error) {
        return 'Unknown';
      }
    }
  },
  
  // Default props
  defaultProps: {
    properties: [],
    onEdit: () => {},
    onDelete: () => {},
    onView: () => {},
    compact: false,
    itemsPerPage: 12
  }
  
})((props, helpers) => {
  // Destructure props
  const { 
    properties = [], 
    onEdit, 
    onDelete, 
    onView, 
    compact = false,
    itemsPerPage = 12
  } = props;
  
  // Destructure helpers
  const { 
    useLocalState,
    formatCurrency,
    formatPercentage,
    classNames,
    getPropertyTypeIcon,
    getStatusColor,
    formatLastUpdated
  } = helpers;
  
  // Component state
  const [state, updateState] = useLocalState({
    currentPage: 1,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  
  // Pagination logic
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (state.currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProperties = properties.slice(startIndex, endIndex);
  
  // Event handlers
  const handleSort = (field) => {
    const newOrder = state.sortBy === field && state.sortOrder === 'asc' ? 'desc' : 'asc';
    updateState({ sortBy: field, sortOrder: newOrder });
  };
  
  const handlePageChange = (page) => {
    updateState({ currentPage: page });
  };
  
  const handleEdit = (property) => {
    onEdit(property);
  };
  
  const handleDelete = async (property) => {
    const confirmed = confirm(`Are you sure you want to delete "${property.name}"?`);
    if (confirmed) {
      try {
        await onDelete(property.id);
      } catch (error) {
        alert(`Failed to delete property: ${error.message}`);
      }
    }
  };
  
  const handleView = (property) => {
    onView(property);
  };
  
  // Render property card
  const renderPropertyCard = (property) => {
    const typeIcon = getPropertyTypeIcon(property.property_type);
    const statusColor = getStatusColor(property.status);
    
    return React.createElement('div', {
      key: property.id,
      className: classNames('property-card', compact && 'compact')
    }, [
      // Header with icon and status
      React.createElement('div', { 
        key: 'header',
        className: 'property-header' 
      }, [
        React.createElement('div', { key: 'icon', className: 'property-icon' }, typeIcon),
        React.createElement('div', { 
          key: 'status',
          className: 'property-status',
          style: { color: statusColor }
        }, property.status)
      ]),
      
      // Name and address
      React.createElement('div', { key: 'info', className: 'property-info' }, [
        React.createElement('h3', { key: 'name', className: 'property-name' }, property.name),
        React.createElement('p', { key: 'address', className: 'property-address' }, property.address),
        property.description && React.createElement('p', { 
          key: 'description', 
          className: 'property-description' 
        }, property.description)
      ]),
      
      // Metrics
      React.createElement('div', { key: 'metrics', className: 'property-metrics' }, [
        React.createElement('div', { key: 'units', className: 'metric' }, [
          React.createElement('span', { key: 'label', className: 'metric-label' }, 'Units'),
          React.createElement('span', { key: 'value', className: 'metric-value' }, 
            `${property.occupied_units}/${property.total_units}`
          )
        ]),
        
        React.createElement('div', { key: 'occupancy', className: 'metric' }, [
          React.createElement('span', { key: 'label', className: 'metric-label' }, 'Occupancy'),
          React.createElement('span', { key: 'value', className: 'metric-value' }, 
            formatPercentage(property.occupancy?.rate || 0)
          )
        ]),
        
        React.createElement('div', { key: 'revenue', className: 'metric' }, [
          React.createElement('span', { key: 'label', className: 'metric-label' }, 'Revenue'),
          React.createElement('span', { key: 'value', className: 'metric-value' }, 
            formatCurrency(property.monthly_revenue || 0)
          )
        ])
      ]),
      
      // Last updated
      React.createElement('div', { key: 'footer', className: 'property-footer' }, [
        React.createElement('span', { key: 'updated', className: 'last-updated' }, 
          `Updated ${formatLastUpdated(property.last_updated)}`
        )
      ]),
      
      // Actions
      React.createElement('div', { key: 'actions', className: 'property-actions' }, [
        React.createElement('button', {
          key: 'view',
          className: 'btn btn-sm btn-outline-primary',
          onClick: () => handleView(property),
          title: 'View Details'
        }, '👁️'),
        
        React.createElement('button', {
          key: 'edit',
          className: 'btn btn-sm btn-outline-secondary',
          onClick: () => handleEdit(property),
          title: 'Edit Property'
        }, '✏️'),
        
        React.createElement('button', {
          key: 'delete',
          className: 'btn btn-sm btn-outline-danger',
          onClick: () => handleDelete(property),
          title: 'Delete Property'
        }, '🗑️')
      ])
    ]);
  };
  
  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Previous button
    if (state.currentPage > 1) {
      pages.push(
        React.createElement('button', {
          key: 'prev',
          className: 'btn btn-sm btn-outline-primary',
          onClick: () => handlePageChange(state.currentPage - 1)
        }, '‹')
      );
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        React.createElement('button', {
          key: i,
          className: classNames(
            'btn btn-sm',
            i === state.currentPage ? 'btn-primary' : 'btn-outline-primary'
          ),
          onClick: () => handlePageChange(i)
        }, i.toString())
      );
    }
    
    // Next button
    if (state.currentPage < totalPages) {
      pages.push(
        React.createElement('button', {
          key: 'next',
          className: 'btn btn-sm btn-outline-primary',
          onClick: () => handlePageChange(state.currentPage + 1)
        }, '›')
      );
    }
    
    return React.createElement('div', { className: 'pagination' }, [
      React.createElement('div', { key: 'info', className: 'pagination-info' }, 
        `Showing ${startIndex + 1}-${Math.min(endIndex, properties.length)} of ${properties.length} properties`
      ),
      React.createElement('div', { key: 'controls', className: 'pagination-controls' }, pages)
    ]);
  };
  
  // Main render
  if (properties.length === 0) {
    return React.createElement('div', { className: 'empty-state' }, [
      React.createElement('div', { key: 'icon', className: 'empty-icon' }, '🏢'),
      React.createElement('h3', { key: 'title' }, 'No Properties Found'),
      React.createElement('p', { key: 'message' }, 'No properties match your current filters.')
    ]);
  }
  
  return React.createElement('div', { className: 'property-list' }, [
    // Property grid
    React.createElement('div', { 
      key: 'grid',
      className: classNames(
        'properties-grid',
        compact && 'compact-grid'
      )
    }, currentProperties.map(renderPropertyCard)),
    
    // Pagination
    renderPagination()
  ]);
});

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.PropertyList = PropertyList;