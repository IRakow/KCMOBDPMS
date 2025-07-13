// Enhanced CRUD Module Pattern for consistent module creation
window.CrudModulePattern = {
    // Main factory function for creating CRUD modules
    createModule: (config) => {
        const {
            moduleName,
            moduleNameSingular = moduleName.slice(0, -1), // Remove 's' for singular
            endpoint,
            stateKey = moduleName,
            columns = [], // For table view
            cardRenderer = null, // For custom card rendering
            modalComponent = null, // Add/Edit modal component
            filters = [], // Available filters
            searchable = true,
            defaultView = 'grid' // 'grid' or 'table'
        } = config;
        
        return () => {
            // State management
            const [data, setData] = React.useState([]);
            const [filteredData, setFilteredData] = React.useState([]);
            const [loading, setLoading] = React.useState(true);
            const [error, setError] = React.useState(null);
            const [refreshing, setRefreshing] = React.useState(false);
            
            // UI state
            const [showAddModal, setShowAddModal] = React.useState(false);
            const [selectedItem, setSelectedItem] = React.useState(null);
            const [viewMode, setViewMode] = React.useState(defaultView);
            const [searchTerm, setSearchTerm] = React.useState('');
            const [activeFilters, setActiveFilters] = React.useState({});
            
            // Subscribe to global state
            React.useEffect(() => {
                loadData();
                
                const unsubscribe = window.AppState.subscribe(stateKey, (newData) => {
                    setData(newData);
                    applyFilters(newData, searchTerm, activeFilters);
                });
                
                return unsubscribe;
            }, []);
            
            // Apply filters when search or filters change
            React.useEffect(() => {
                applyFilters(data, searchTerm, activeFilters);
            }, [data, searchTerm, activeFilters]);
            
            const applyFilters = (items, search, filters) => {
                let filtered = [...items];
                
                // Apply search
                if (search && searchable) {
                    filtered = filtered.filter(item => {
                        const searchFields = Object.values(item).join(' ').toLowerCase();
                        return searchFields.includes(search.toLowerCase());
                    });
                }
                
                // Apply custom filters
                Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== 'all') {
                        filtered = filtered.filter(item => item[key] === value);
                    }
                });
                
                setFilteredData(filtered);
            };
            
            const loadData = async (isRefresh = false) => {
                try {
                    if (isRefresh) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }
                    setError(null);
                    
                    const response = await window.ApiService.get(endpoint);
                    const responseData = response.results || response;
                    
                    window.AppState.setState(stateKey, responseData);
                    setData(responseData);
                    
                    if (isRefresh && window.showNotification) {
                        window.showNotification('success', `${moduleName} refreshed`);
                    }
                } catch (err) {
                    console.error(`Error loading ${moduleName}:`, err);
                    setError(err.message);
                    
                    if (window.showNotification) {
                        window.showNotification('error', err.message);
                    }
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            };
            
            const handleAdd = async (formData) => {
                try {
                    await window.ApiService.post(endpoint, formData);
                    await loadData();
                    setShowAddModal(false);
                    
                    if (window.showNotification) {
                        window.showNotification('success', `${moduleNameSingular} added successfully!`);
                    }
                } catch (error) {
                    if (window.showNotification) {
                        window.showNotification('error', error.message);
                    }
                }
            };
            
            const handleUpdate = async (id, formData) => {
                try {
                    await window.ApiService.patch(`${endpoint}/${id}`, formData);
                    await loadData();
                    setSelectedItem(null);
                    
                    if (window.showNotification) {
                        window.showNotification('success', `${moduleNameSingular} updated successfully!`);
                    }
                } catch (error) {
                    if (window.showNotification) {
                        window.showNotification('error', error.message);
                    }
                }
            };
            
            const handleDelete = async (id) => {
                if (confirm(`Are you sure you want to delete this ${moduleNameSingular}?`)) {
                    try {
                        await window.ApiService.delete(`${endpoint}/${id}`);
                        await loadData();
                        
                        if (window.showNotification) {
                            window.showNotification('success', `${moduleNameSingular} deleted successfully!`);
                        }
                    } catch (error) {
                        if (window.showNotification) {
                            window.showNotification('error', error.message);
                        }
                    }
                }
            };
            
            // Stats calculation
            const stats = React.useMemo(() => {
                return {
                    total: data.length,
                    filtered: filteredData.length,
                    ...config.calculateStats?.(data) || {}
                };
            }, [data, filteredData]);
            
            // Loading state
            if (loading && data.length === 0) {
                return (
                    <div className="module-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading {moduleName}...</p>
                    </div>
                );
            }
            
            // Error state
            if (error && data.length === 0) {
                return (
                    <div className="module-error">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h3>Error Loading {moduleName}</h3>
                        <p>{error}</p>
                        <button onClick={() => loadData()} className="btn btn-primary">
                            <i className="fas fa-redo"></i> Retry
                        </button>
                    </div>
                );
            }
            
            return (
                <div className={`crud-module ${moduleName}-page`}>
                    {/* Header */}
                    <div className="module-header">
                        <div className="header-info">
                            <h1>{moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}</h1>
                            <p>Manage {stats.total} {moduleName}</p>
                        </div>
                        <div className="header-actions">
                            <button 
                                className="btn btn-secondary" 
                                onClick={() => loadData(true)}
                                disabled={refreshing}
                            >
                                <i className={`fas fa-sync ${refreshing ? 'fa-spin' : ''}`}></i>
                                Refresh
                            </button>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setShowAddModal(true)}
                            >
                                <i className="fas fa-plus"></i>
                                Add {moduleNameSingular}
                            </button>
                        </div>
                    </div>
                    
                    {/* Filters Bar */}
                    <div className="module-filters">
                        {searchable && (
                            <div className="search-box">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder={`Search ${moduleName}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}
                        
                        {filters.map(filter => (
                            <select
                                key={filter.key}
                                className="filter-select"
                                value={activeFilters[filter.key] || 'all'}
                                onChange={(e) => setActiveFilters({
                                    ...activeFilters,
                                    [filter.key]: e.target.value
                                })}
                            >
                                <option value="all">All {filter.label}</option>
                                {filter.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        ))}
                        
                        <div className="view-toggle">
                            <button
                                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <i className="fas fa-th"></i>
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                onClick={() => setViewMode('table')}
                            >
                                <i className="fas fa-list"></i>
                            </button>
                        </div>
                    </div>
                    
                    {/* Results count */}
                    {searchTerm && (
                        <div className="results-count">
                            Showing {filteredData.length} of {data.length} {moduleName}
                        </div>
                    )}
                    
                    {/* Content */}
                    {filteredData.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-inbox"></i>
                            <h3>No {moduleName} Found</h3>
                            <p>
                                {data.length === 0 
                                    ? `Add your first ${moduleNameSingular} to get started`
                                    : 'Try adjusting your search or filters'}
                            </p>
                            {data.length === 0 && (
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    <i className="fas fa-plus"></i>
                                    Add First {moduleNameSingular}
                                </button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="module-grid">
                            {filteredData.map(item => (
                                cardRenderer ? cardRenderer({
                                    item,
                                    onEdit: () => setSelectedItem(item),
                                    onDelete: () => handleDelete(item.id)
                                }) : (
                                    <div key={item.id} className="module-card">
                                        <h3>{item.name || item.title || `${moduleNameSingular} ${item.id}`}</h3>
                                        <div className="card-actions">
                                            <button onClick={() => setSelectedItem(item)}>
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button onClick={() => handleDelete(item.id)}>
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    ) : (
                        <table className="module-table">
                            <thead>
                                <tr>
                                    {columns.map(col => (
                                        <th key={col.key}>{col.label}</th>
                                    ))}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map(item => (
                                    <tr key={item.id}>
                                        {columns.map(col => (
                                            <td key={col.key}>
                                                {col.render ? col.render(item) : item[col.key]}
                                            </td>
                                        ))}
                                        <td>
                                            <button 
                                                className="btn-icon"
                                                onClick={() => setSelectedItem(item)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                className="btn-icon danger"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    
                    {/* Modal */}
                    {modalComponent && (showAddModal || selectedItem) && (
                        React.createElement(modalComponent, {
                            item: selectedItem,
                            onClose: () => {
                                setShowAddModal(false);
                                setSelectedItem(null);
                            },
                            onSave: selectedItem 
                                ? (data) => handleUpdate(selectedItem.id, data)
                                : handleAdd
                        })
                    )}
                </div>
            );
        };
    },
    
    // Helper to create navigation function
    createNavigation: () => {
        return (path) => {
            window.history.pushState(null, '', path);
            window.dispatchEvent(new PopStateEvent('popstate'));
        };
    }
};

// Add CRUD module styles
if (!document.querySelector('#crud-module-styles')) {
    const styles = document.createElement('style');
    styles.id = 'crud-module-styles';
    styles.textContent = `
        .crud-module {
            padding: 24px;
            min-height: 100vh;
            background: #f8fafc;
        }
        
        .module-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .header-info h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            color: #1f2937;
        }
        
        .header-info p {
            margin: 4px 0 0 0;
            color: #6b7280;
        }
        
        .header-actions {
            display: flex;
            gap: 12px;
        }
        
        .module-filters {
            display: flex;
            gap: 16px;
            align-items: center;
            background: white;
            padding: 16px 24px;
            border-radius: 12px;
            margin-bottom: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .search-box {
            flex: 1;
            position: relative;
        }
        
        .search-box i {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
        }
        
        .search-box input {
            width: 100%;
            padding: 10px 16px 10px 44px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
        }
        
        .search-box input:focus {
            outline: none;
            border-color: #6366f1;
        }
        
        .filter-select {
            padding: 10px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 15px;
            background: white;
            cursor: pointer;
        }
        
        .view-toggle {
            display: flex;
            background: #f3f4f6;
            border-radius: 8px;
            padding: 4px;
        }
        
        .view-btn {
            padding: 8px 12px;
            background: transparent;
            border: none;
            color: #6b7280;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.2s;
        }
        
        .view-btn.active {
            background: white;
            color: #6366f1;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .results-count {
            margin-bottom: 16px;
            color: #6b7280;
            font-size: 14px;
        }
        
        .module-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 20px;
        }
        
        .module-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            transition: all 0.2s;
        }
        
        .module-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }
        
        .card-actions {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }
        
        .module-table {
            width: 100%;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .module-table th {
            background: #f9fafb;
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .module-table td {
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .module-table tr:hover {
            background: #f9fafb;
        }
    `;
    document.head.appendChild(styles);
}

// Export navigation helper
window.navigateTo = window.CrudModulePattern.createNavigation();