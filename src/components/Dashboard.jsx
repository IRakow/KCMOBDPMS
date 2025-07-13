const Dashboard = ({ user }) => {
    const [editMode, setEditMode] = React.useState(false);
    const [widgets, setWidgets] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showAddWidget, setShowAddWidget] = React.useState(false);
    const [dashboardId, setDashboardId] = React.useState(null);
    const [error, setError] = React.useState(null);

    // Grid configuration
    const GRID_COLS = 4;
    const ROW_HEIGHT = 80;
    const GRID_MARGIN = [16, 16];

    React.useEffect(() => {
        console.log('Dashboard mounting, loading data...');
        loadDashboard();
        
        return () => {
            console.log('Dashboard unmounting!');
        };
    }, []);

    const loadDashboard = async () => {
        try {
            // Check if apiClient exists
            if (!window.apiClient || !window.apiClient.request) {
                throw new Error('API client not available');
            }
            
            // Get user's default dashboard
            const dashboardsRes = await window.apiClient.request('/dashboard/layouts');
            let dashboard = dashboardsRes.dashboards.find(d => d.is_default);
            
            if (!dashboard && dashboardsRes.dashboards.length > 0) {
                dashboard = dashboardsRes.dashboards[0];
            }
            
            if (!dashboard) {
                // Create default dashboard
                const newDashboard = await window.apiClient.request('/dashboard/layouts', {
                    method: 'POST',
                    body: { name: 'My Dashboard', is_default: true }
                });
                dashboard = newDashboard;
            }
            
            setDashboardId(dashboard.id);
            
            // Load dashboard with widgets
            const fullDashboard = await window.apiClient.request(`/dashboard/layouts/${dashboard.id}`);
            setWidgets(fullDashboard.widgets || []);
        } catch (err) {
            console.error('Failed to load dashboard, using mock:', err);
            setError(err.message || 'Failed to load dashboard');
            
            // Ensure we don't lose the dashboard on error
            if (!dashboardId) {
                setDashboardId('mock_dashboard_1');
            }
            
            // Set default widgets for demo
            const mockWidgets = [
                {
                    id: 'widget_1',
                    widget_type: 'occupancy',
                    position: { x: 0, y: 0, w: 2, h: 1 },
                    config: {},
                    refresh_interval: 300
                },
                {
                    id: 'widget_2',
                    widget_type: 'revenue',
                    position: { x: 2, y: 0, w: 2, h: 1 },
                    config: {},
                    refresh_interval: 300
                },
                {
                    id: 'widget_3',
                    widget_type: 'maintenance',
                    position: { x: 0, y: 1, w: 1, h: 1 },
                    config: {},
                    refresh_interval: 300
                },
                {
                    id: 'widget_4',
                    widget_type: 'calendar',
                    position: { x: 1, y: 1, w: 2, h: 1 },
                    config: {},
                    refresh_interval: 300
                },
                {
                    id: 'widget_5',
                    widget_type: 'quick_notes',
                    position: { x: 3, y: 1, w: 1, h: 1 },
                    config: { notes: 'Welcome to your dashboard!\n\nClick Edit Layout to customize.' },
                    refresh_interval: 0
                }
            ];
            setWidgets(mockWidgets);
        } finally {
            console.log('Dashboard loading complete');
            // Ensure loading is always set to false
            setTimeout(() => {
                setLoading(false);
            }, 100);
        }
    };


    const handleAddWidget = async (widgetType) => {
        try {
            // Try API first
            const newWidget = await window.apiClient.request(`/dashboard/layouts/${dashboardId}/widgets`, {
                method: 'POST',
                body: {
                    widget_type: widgetType,
                    position: findEmptyPosition()
                }
            });
            
            setWidgets([...widgets, newWidget]);
            setShowAddWidget(false);
        } catch (error) {
            console.error('Failed to add widget via API, using local mock:', error);
            
            // Fallback to local mock
            const position = findEmptyPosition();
            const mockWidget = {
                id: `widget_${Date.now()}`,
                widget_type: widgetType,
                position: position,
                config: {},
                title: null,
                refresh_interval: 300,
                is_loading: false,
                is_minimized: false
            };
            
            setWidgets([...widgets, mockWidget]);
            setShowAddWidget(false);
        }
    };

    const handleRemoveWidget = async (widgetId) => {
        if (!editMode) return;
        
        try {
            await window.apiClient.request(`/dashboard/layouts/${dashboardId}/widgets/${widgetId}`, {
                method: 'DELETE'
            });
            
            setWidgets(widgets.filter(w => w.id !== widgetId));
        } catch (error) {
            console.error('Failed to remove widget:', error);
        }
    };

    const findEmptyPosition = () => {
        // Find first empty position in grid
        const occupiedPositions = new Set();
        widgets.forEach(w => {
            for (let x = w.position.x; x < w.position.x + w.position.w; x++) {
                for (let y = w.position.y; y < w.position.y + w.position.h; y++) {
                    occupiedPositions.add(`${x},${y}`);
                }
            }
        });
        
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < GRID_COLS; x++) {
                if (!occupiedPositions.has(`${x},${y}`)) {
                    return { x, y, w: 1, h: 1 };
                }
            }
        }
        
        return { x: 0, y: 0, w: 1, h: 1 };
    };

    const renderWidget = (widget, index) => {
        try {
            return (
                <DraggableWidget
                    key={widget.id}
                    widget={widget}
                    index={index}
                    editMode={editMode}
                    onMove={handleWidgetMove}
                    onRemove={handleRemoveWidget}
                    onResize={handleWidgetResize}
                >
                    {typeof DashboardWidget !== 'undefined' ? (
                        <DashboardWidget 
                            widget={widget}
                            onUpdate={(updates) => handleWidgetUpdate(widget.id, updates)}
                        />
                    ) : (
                        <div style={{ padding: '20px', color: 'white' }}>
                            Widget type: {widget.widget_type}
                        </div>
                    )}
                </DraggableWidget>
            );
        } catch (error) {
            console.error('Error rendering widget:', widget, error);
            return (
                <div key={widget.id} style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>
                    Error loading widget: {widget.widget_type}
                </div>
            );
        }
    };

    const handleWidgetMove = async (widgetId, newPosition) => {
        // Update local state immediately
        setWidgets(widgets.map(w => 
            w.id === widgetId 
                ? { ...w, position: { ...w.position, x: newPosition.x, y: newPosition.y } }
                : w
        ));
        
        // Save to backend
        try {
            const updates = [{
                widget_id: widgetId,
                position: {
                    x: newPosition.x,
                    y: newPosition.y,
                    w: widgets.find(w => w.id === widgetId).position.w,
                    h: widgets.find(w => w.id === widgetId).position.h
                }
            }];
            
            await window.apiClient.request(`/dashboard/layouts/${dashboardId}`, {
                method: 'PUT',
                body: updates
            });
        } catch (error) {
            console.error('Failed to save widget position:', error);
        }
    };

    const handleWidgetResize = async (widgetId, newSize) => {
        // Update local state immediately
        setWidgets(widgets.map(w => 
            w.id === widgetId 
                ? { ...w, position: { ...w.position, w: newSize.w, h: newSize.h } }
                : w
        ));
        
        // Save to backend
        try {
            const widget = widgets.find(w => w.id === widgetId);
            const updates = [{
                widget_id: widgetId,
                position: {
                    x: widget.position.x,
                    y: widget.position.y,
                    w: newSize.w,
                    h: newSize.h
                }
            }];
            
            await window.apiClient.request(`/dashboard/layouts/${dashboardId}`, {
                method: 'PUT',
                body: updates
            });
        } catch (error) {
            console.error('Failed to save widget size:', error);
        }
    };

    const handleWidgetUpdate = async (widgetId, updates) => {
        try {
            await window.apiClient.request(`/dashboard/layouts/${dashboardId}/widgets/${widgetId}`, {
                method: 'PUT',
                body: updates
            });
            
            setWidgets(widgets.map(w => 
                w.id === widgetId ? { ...w, ...updates } : w
            ));
        } catch (error) {
            console.error('Failed to update widget:', error);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <div className="widget-loading-spinner"></div>
                    <div style={{ color: 'white', fontSize: '16px' }}>Loading Dashboard...</div>
                    {error && (
                        <div style={{ color: '#fca5a5', fontSize: '14px', marginTop: '10px' }}>
                            Error: {error}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ 
            minHeight: '100vh', 
            width: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative'
        }}>
            <div className="dashboard-header">
                <div className="dashboard-header-content">
                    <h1 className="dashboard-title">Dashboard</h1>
                    <div className="dashboard-actions">
                        <button 
                            className={`edit-mode-toggle ${editMode ? 'active' : ''}`}
                            onClick={() => setEditMode(!editMode)}
                        >
                            {Icons.Settings && <Icons.Settings />}
                            <span>{editMode ? 'Done Editing' : 'Edit Layout'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`dashboard-grid ${editMode ? 'edit-mode' : ''}`}>
                <div className="grid-layout" style={{ position: 'relative', minHeight: '600px' }}>
                    {widgets && widgets.length > 0 ? (
                        widgets.map((widget, index) => {
                            try {
                                return renderWidget(widget, index);
                            } catch (err) {
                                console.error('Error rendering widget:', widget, err);
                                return (
                                    <div key={widget?.id || index} style={{ 
                                        padding: '20px', 
                                        background: 'rgba(255,0,0,0.1)', 
                                        borderRadius: '8px',
                                        color: 'white'
                                    }}>
                                        Error loading widget
                                    </div>
                                );
                            }
                        })
                    ) : (
                        <div style={{ 
                            padding: '40px', 
                            textAlign: 'center', 
                            color: 'white',
                            opacity: 0.7
                        }}>
                            No widgets yet. Click "Edit Layout" to add widgets.
                        </div>
                    )}
                </div>
            </div>

            {editMode && (
                <button 
                    className="add-widget-fab"
                    onClick={() => {
                        console.log('Add widget button clicked');
                        setShowAddWidget(true);
                    }}
                >
                    {Icons.Plus ? <Icons.Plus /> : '+'}
                </button>
            )}

            {showAddWidget && (
                <div className="widget-selector-overlay" onClick={() => setShowAddWidget(false)}>
                    <div className="widget-selector-modal" onClick={e => e.stopPropagation()}>
                        <div className="widget-selector-header">
                            <h2>Add Widget</h2>
                            <button className="close-button" onClick={() => setShowAddWidget(false)}>×</button>
                        </div>

                        <div className="widget-selector-content">
                            <div className="widget-grid">
                                {[
                                    { type: 'occupancy', name: 'Occupancy Rate', icon: '🏢', desc: 'Track occupancy rates' },
                                    { type: 'revenue', name: 'Revenue', icon: '💰', desc: 'Monitor revenue' },
                                    { type: 'maintenance', name: 'Maintenance', icon: '🔧', desc: 'Manage tasks' },
                                    { type: 'leases', name: 'Leases', icon: '📄', desc: 'Track leases' },
                                    { type: 'calendar', name: 'Calendar', icon: '📅', desc: 'View events' },
                                    { type: 'follow_ups', name: 'Follow-ups', icon: '✅', desc: 'Track tasks' },
                                    { type: 'quick_notes', name: 'Notes', icon: '📝', desc: 'Keep notes' }
                                ].map(widget => (
                                    <div 
                                        key={widget.type}
                                        className="widget-card"
                                        onClick={() => {
                                            handleAddWidget(widget.type);
                                            setShowAddWidget(false);
                                        }}
                                    >
                                        <div className="widget-card-icon">{widget.icon}</div>
                                        <h3>{widget.name}</h3>
                                        <p>{widget.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};