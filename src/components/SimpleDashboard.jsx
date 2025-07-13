const SimpleDashboard = ({ user }) => {
    const [editMode, setEditMode] = React.useState(false);
    const [draggingWidget, setDraggingWidget] = React.useState(null);
    const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
    const [resizingWidget, setResizingWidget] = React.useState(null);
    const [showAddWidget, setShowAddWidget] = React.useState(false);
    const [widgets, setWidgets] = React.useState([
        {
            id: 'widget_1',
            widget_type: 'occupancy',
            position: { x: 0, y: 0, w: 2, h: 1 },
            data: { rate: 92, occupied: 184, total: 200, change: 3.5 }
        },
        {
            id: 'widget_2',
            widget_type: 'revenue',
            position: { x: 2, y: 0, w: 2, h: 1 },
            data: { current: 2500000, target: 3000000, change: 12.5 }
        },
        {
            id: 'widget_3',
            widget_type: 'maintenance',
            position: { x: 0, y: 1, w: 1, h: 1 },
            data: { open: 18, urgent: 3, completed: 45 }
        },
        {
            id: 'widget_4',
            widget_type: 'calendar',
            position: { x: 1, y: 1, w: 2, h: 1 },
            data: { today: 5, nextEvent: '2:00 PM - Vendor Meeting' }
        },
        {
            id: 'widget_5',
            widget_type: 'leases',
            position: { x: 3, y: 1, w: 1, h: 1 },
            data: { expiring: 8, thisMonth: 3 }
        }
    ]);

    const handleMouseDown = (e, widgetId) => {
        if (!editMode) return;
        
        const widget = widgets.find(w => w.id === widgetId);
        
        setDraggingWidget(widgetId);
        setDragOffset({
            x: e.clientX - (widget.position.x * window.innerWidth * 0.25),
            y: e.clientY - (widget.position.y * 96)
        });
    };

    const handleMouseMove = React.useCallback((e) => {
        if (draggingWidget) {
            const newX = Math.round((e.clientX - dragOffset.x) / (window.innerWidth * 0.25));
            const newY = Math.round((e.clientY - dragOffset.y) / 96);
            
            setWidgets(widgets => widgets.map(w => 
                w.id === draggingWidget 
                    ? { ...w, position: { ...w.position, x: Math.max(0, Math.min(3, newX)), y: Math.max(0, newY) } }
                    : w
            ));
        }
        
        if (resizingWidget) {
            const widget = widgets.find(w => w.id === resizingWidget);
            const gridWidth = window.innerWidth * 0.25;
            const newW = Math.round((e.clientX - (widget.position.x * gridWidth)) / gridWidth);
            const newH = Math.round((e.clientY - (widget.position.y * 96)) / 96);
            
            setWidgets(widgets => widgets.map(w => 
                w.id === resizingWidget 
                    ? { ...w, position: { ...w.position, w: Math.max(1, Math.min(4 - w.position.x, newW)), h: Math.max(1, newH) } }
                    : w
            ));
        }
    }, [draggingWidget, resizingWidget, dragOffset]);

    const handleMouseUp = React.useCallback(() => {
        setDraggingWidget(null);
        setResizingWidget(null);
    }, []);

    React.useEffect(() => {
        if (draggingWidget || resizingWidget) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggingWidget, resizingWidget, handleMouseMove, handleMouseUp]);

    const findEmptyPosition = () => {
        const occupiedPositions = new Set();
        widgets.forEach(w => {
            for (let x = w.position.x; x < w.position.x + w.position.w; x++) {
                for (let y = w.position.y; y < w.position.y + w.position.h; y++) {
                    occupiedPositions.add(`${x},${y}`);
                }
            }
        });
        
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 4; x++) {
                if (!occupiedPositions.has(`${x},${y}`)) {
                    return { x, y, w: 1, h: 1 };
                }
            }
        }
        
        return { x: 0, y: 0, w: 1, h: 1 };
    };

    const handleAddWidget = (widgetType) => {
        const newWidget = {
            id: `widget_${Date.now()}`,
            widget_type: widgetType,
            position: findEmptyPosition(),
            data: getDefaultWidgetData(widgetType)
        };
        setWidgets([...widgets, newWidget]);
        setShowAddWidget(false);
    };

    const getDefaultWidgetData = (type) => {
        switch(type) {
            case 'occupancy':
                return { rate: 85, occupied: 170, total: 200, change: 2.5 };
            case 'revenue':
                return { current: 1800000, target: 2000000, change: 8.3 };
            case 'maintenance':
                return { open: 12, urgent: 2, completed: 35 };
            case 'calendar':
                return { today: 3, nextEvent: '10:00 AM - Staff Meeting' };
            case 'leases':
                return { expiring: 5, thisMonth: 2 };
            default:
                return {};
        }
    };

    const renderWidget = (widget) => {
        const baseStyle = {
            position: 'absolute',
            left: `${widget.position.x * 25}%`,
            top: `${widget.position.y * 96}px`,
            width: `${widget.position.w * 25 - 2}%`,
            height: `${widget.position.h * 96 - 16}px`,
            minHeight: '80px',
            padding: widget.position.h === 1 ? '8px' : '12px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            color: 'white',
            transition: 'all 300ms ease',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            cursor: editMode ? 'move' : 'default',
            userSelect: editMode ? 'none' : 'auto'
        };

        return (
            <div 
                key={widget.id} 
                style={baseStyle}
                onMouseDown={(e) => handleMouseDown(e, widget.id)}
            >
                {/* Widget Header */}
                <div style={{ 
                    fontSize: '10px', 
                    fontWeight: '600',
                    opacity: 0.7, 
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span>{widget.widget_type.replace(/_/g, ' ')}</span>
                    {editMode && (
                        <span style={{ 
                            width: '8px', 
                            height: '8px', 
                            background: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '50%',
                            display: 'inline-block'
                        }} />
                    )}
                </div>
                
                {/* Widget Content */}
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minHeight: 0,
                    overflow: 'hidden'
                }}>
                    {widget.widget_type === 'occupancy' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                fontSize: widget.position.h === 1 ? '20px' : '28px', 
                                fontWeight: '700', 
                                lineHeight: 1,
                                color: '#10b981',
                                marginBottom: widget.position.h === 1 ? '1px' : '2px'
                            }}>
                                {widget.data.rate}%
                            </div>
                            {widget.position.h > 1 && (
                                <div style={{ fontSize: '10px', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {widget.data.occupied}/{widget.data.total} units
                                </div>
                            )}
                        </div>
                    )}
                    
                    {widget.widget_type === 'revenue' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                fontSize: widget.position.h === 1 ? '20px' : '28px', 
                                fontWeight: '700', 
                                lineHeight: 1,
                                color: '#3b82f6',
                                marginBottom: widget.position.h === 1 ? '1px' : '2px'
                            }}>
                                ${(widget.data.current / 1000000).toFixed(1)}M
                            </div>
                            {widget.position.h > 1 && (
                                <>
                                    <div style={{ fontSize: '10px', opacity: 0.6 }}>
                                        Monthly Revenue
                                    </div>
                                    <div style={{ 
                                        fontSize: '9px', 
                                        opacity: 0.5,
                                        color: '#10b981',
                                        marginTop: '2px'
                                    }}>
                                        +{widget.data.change}%
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    
                    {widget.widget_type === 'maintenance' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                fontSize: widget.position.h === 1 ? '20px' : '28px', 
                                fontWeight: '700', 
                                lineHeight: 1,
                                color: '#f59e0b',
                                marginBottom: widget.position.h === 1 ? '1px' : '2px'
                            }}>
                                {widget.data.open}
                            </div>
                            {widget.position.h > 1 && (
                                <>
                                    <div style={{ fontSize: '10px', opacity: 0.6 }}>
                                        Open
                                    </div>
                                    {widget.data.urgent > 0 && (
                                        <div style={{ 
                                            fontSize: '9px', 
                                            opacity: 0.8,
                                            color: '#ef4444',
                                            marginTop: '2px',
                                            fontWeight: '600'
                                        }}>
                                            {widget.data.urgent} urgent
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    
                    {widget.widget_type === 'calendar' && (
                        <div>
                            <div style={{ 
                                fontSize: widget.position.h === 1 ? '20px' : '24px', 
                                fontWeight: '700', 
                                lineHeight: 1,
                                marginBottom: '4px'
                            }}>
                                {widget.data.today} Events
                            </div>
                            <div style={{ 
                                fontSize: '10px', 
                                opacity: 0.6,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                paddingRight: '4px'
                            }}>
                                {widget.data.nextEvent}
                            </div>
                        </div>
                    )}
                    
                    {widget.widget_type === 'leases' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                fontSize: widget.position.h === 1 ? '20px' : '28px', 
                                fontWeight: '700', 
                                lineHeight: 1,
                                color: '#8b5cf6',
                                marginBottom: widget.position.h === 1 ? '1px' : '2px'
                            }}>
                                {widget.data.expiring}
                            </div>
                            {widget.position.h > 1 && (
                                <>
                                    <div style={{ fontSize: '10px', opacity: 0.6 }}>
                                        Expiring
                                    </div>
                                    <div style={{ 
                                        fontSize: '9px', 
                                        opacity: 0.5,
                                        marginTop: '2px'
                                    }}>
                                        {widget.data.thisMonth} this month
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Resize Handle */}
                {editMode && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '20px',
                            height: '20px',
                            cursor: 'se-resize',
                            zIndex: 10
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation();
                            setResizingWidget(widget.id);
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            width: '8px',
                            height: '8px',
                            borderRight: '2px solid rgba(255, 255, 255, 0.5)',
                            borderBottom: '2px solid rgba(255, 255, 255, 0.5)'
                        }} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            position: 'relative',
            width: '100%'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h1 style={{ color: 'white', fontSize: '24px', margin: 0 }}>Dashboard</h1>
                <button
                    onClick={() => setEditMode(!editMode)}
                    style={{
                        padding: '8px 16px',
                        background: editMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        color: editMode ? '#667eea' : 'white',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 200ms ease'
                    }}
                >
                    {editMode ? 'Done Editing' : 'Edit Layout'}
                </button>
            </div>

            {/* Widget Grid */}
            <div style={{ 
                position: 'relative', 
                padding: '24px',
                minHeight: 'calc(100vh - 84px)'
            }}>
                <div style={{ position: 'relative', minHeight: '400px' }}>
                    {widgets.map(renderWidget)}
                </div>
            </div>

            {/* Add Widget Button */}
            {editMode && (
                <button
                    onClick={() => setShowAddWidget(true)}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: '#667eea',
                        transition: 'all 200ms ease',
                        zIndex: 100
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                >
                    +
                </button>
            )}

            {/* Widget Selector Modal */}
            {showAddWidget && (
                <div 
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setShowAddWidget(false)}
                >
                    <div 
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            padding: '24px',
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{ margin: 0, color: '#1f2937' }}>Add Widget</h2>
                            <button
                                onClick={() => setShowAddWidget(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                            gap: '12px'
                        }}>
                            {[
                                { type: 'occupancy', name: 'Occupancy', icon: '🏢', color: '#10b981' },
                                { type: 'revenue', name: 'Revenue', icon: '💰', color: '#3b82f6' },
                                { type: 'maintenance', name: 'Maintenance', icon: '🔧', color: '#f59e0b' },
                                { type: 'calendar', name: 'Calendar', icon: '📅', color: '#667eea' },
                                { type: 'leases', name: 'Leases', icon: '📄', color: '#8b5cf6' }
                            ].map(widget => (
                                <button
                                    key={widget.type}
                                    onClick={() => handleAddWidget(widget.type)}
                                    style={{
                                        background: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        transition: 'all 200ms ease',
                                        textAlign: 'center'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = widget.color;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>{widget.icon}</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{widget.name}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};