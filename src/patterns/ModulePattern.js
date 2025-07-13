// Module Pattern for consistent data loading across pages
window.ModulePattern = {
    // Create a standard data module component
    createDataModule: (config) => {
        const {
            moduleName,
            apiEndpoint,
            stateKey,
            renderContent,
            renderEmpty,
            filters = {}
        } = config;
        
        return () => {
            const [data, setData] = React.useState([]);
            const [loading, setLoading] = React.useState(true);
            const [error, setError] = React.useState(null);
            const [refreshing, setRefreshing] = React.useState(false);
            
            // Subscribe to global state
            React.useEffect(() => {
                // Initial load
                loadData();
                
                // Subscribe to global state if stateKey provided
                if (stateKey) {
                    const unsubscribe = window.AppState.subscribe(stateKey, setData);
                    return unsubscribe;
                }
            }, []);
            
            const loadData = async (isRefresh = false) => {
                try {
                    if (isRefresh) {
                        setRefreshing(true);
                    } else {
                        setLoading(true);
                    }
                    setError(null);
                    
                    // Build query string from filters
                    const queryParams = new URLSearchParams();
                    Object.entries(filters).forEach(([key, value]) => {
                        if (value && value !== 'all') {
                            queryParams.append(key, value);
                        }
                    });
                    
                    const endpoint = queryParams.toString() 
                        ? `${apiEndpoint}?${queryParams.toString()}`
                        : apiEndpoint;
                    
                    const response = await window.ApiService.get(endpoint);
                    const responseData = response.results || response;
                    
                    // Update global state if stateKey provided
                    if (stateKey) {
                        window.AppState.setState(stateKey, responseData);
                    }
                    
                    setData(responseData);
                    
                    if (isRefresh && window.showNotification) {
                        window.showNotification('success', 'Data refreshed successfully');
                    }
                    
                } catch (err) {
                    console.error(`Error loading ${moduleName} data:`, err);
                    setError(err.message);
                    
                    if (window.showNotification) {
                        window.showNotification('error', `Failed to load ${moduleName}: ${err.message}`);
                    }
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            };
            
            const refresh = () => loadData(true);
            
            // Show loading state
            if (loading && data.length === 0) {
                return (
                    <div className="module-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading {moduleName}...</p>
                    </div>
                );
            }
            
            // Show error state
            if (error && data.length === 0) {
                return (
                    <div className="module-error">
                        <i className="fas fa-exclamation-triangle"></i>
                        <h3>Error Loading {moduleName}</h3>
                        <p>{error}</p>
                        <button onClick={refresh} className="btn btn-primary">
                            <i className="fas fa-redo"></i> Retry
                        </button>
                    </div>
                );
            }
            
            // Show empty state
            if (!loading && data.length === 0) {
                return renderEmpty ? renderEmpty() : (
                    <div className="module-empty">
                        <i className="fas fa-inbox"></i>
                        <h3>No {moduleName} Found</h3>
                        <p>Get started by adding your first item.</p>
                    </div>
                );
            }
            
            // Render content with data
            return renderContent({
                data,
                loading,
                error,
                refreshing,
                refresh,
                loadData
            });
        };
    },
    
    // Create CRUD operations for a module
    createCrudOperations: (apiEndpoint, stateKey) => {
        return {
            create: async (data) => {
                try {
                    const response = await window.ApiService.post(apiEndpoint, data);
                    
                    // Refresh the state
                    if (stateKey) {
                        const currentData = window.AppState.getState(stateKey) || [];
                        window.AppState.setState(stateKey, [...currentData, response]);
                    }
                    
                    if (window.showNotification) {
                        window.showNotification('success', 'Created successfully');
                    }
                    
                    return response;
                } catch (error) {
                    if (window.showNotification) {
                        window.showNotification('error', error.message);
                    }
                    throw error;
                }
            },
            
            update: async (id, data) => {
                try {
                    const response = await window.ApiService.patch(`${apiEndpoint}/${id}`, data);
                    
                    // Update in state
                    if (stateKey) {
                        const currentData = window.AppState.getState(stateKey) || [];
                        const updatedData = currentData.map(item => 
                            item.id === id ? response : item
                        );
                        window.AppState.setState(stateKey, updatedData);
                    }
                    
                    if (window.showNotification) {
                        window.showNotification('success', 'Updated successfully');
                    }
                    
                    return response;
                } catch (error) {
                    if (window.showNotification) {
                        window.showNotification('error', error.message);
                    }
                    throw error;
                }
            },
            
            delete: async (id) => {
                try {
                    await window.ApiService.delete(`${apiEndpoint}/${id}`);
                    
                    // Remove from state
                    if (stateKey) {
                        const currentData = window.AppState.getState(stateKey) || [];
                        const filteredData = currentData.filter(item => item.id !== id);
                        window.AppState.setState(stateKey, filteredData);
                    }
                    
                    if (window.showNotification) {
                        window.showNotification('success', 'Deleted successfully');
                    }
                } catch (error) {
                    if (window.showNotification) {
                        window.showNotification('error', error.message);
                    }
                    throw error;
                }
            }
        };
    }
};

// Add module styles
if (!document.querySelector('#module-pattern-styles')) {
    const styles = document.createElement('style');
    styles.id = 'module-pattern-styles';
    styles.textContent = `
        .module-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            color: #6b7280;
        }
        
        .module-error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            text-align: center;
            color: #ef4444;
        }
        
        .module-error i {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .module-error h3 {
            font-size: 24px;
            margin: 0 0 8px 0;
            color: #1f2937;
        }
        
        .module-error p {
            color: #6b7280;
            margin: 0 0 24px 0;
        }
        
        .module-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            text-align: center;
            color: #9ca3af;
        }
        
        .module-empty i {
            font-size: 64px;
            margin-bottom: 16px;
        }
        
        .module-empty h3 {
            font-size: 24px;
            margin: 0 0 8px 0;
            color: #374151;
        }
        
        .module-empty p {
            color: #6b7280;
            margin: 0;
        }
    `;
    document.head.appendChild(styles);
}