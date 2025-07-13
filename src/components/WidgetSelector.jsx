const WidgetSelector = ({ onSelect, onClose }) => {
    const [widgets, setWidgets] = React.useState([]);
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [loading, setLoading] = React.useState(true);
    
    // Check if Icons is available
    const hasIcons = typeof Icons !== 'undefined';

    React.useEffect(() => {
        loadWidgetRegistry();
    }, []);

    const loadWidgetRegistry = async () => {
        try {
            const response = await window.apiClient.request('/dashboard/widgets/registry');
            setWidgets(response.widgets);
        } catch (error) {
            console.error('Failed to load widget registry:', error);
            // Use mock data as fallback
            setWidgets(getMockWidgets());
        } finally {
            setLoading(false);
        }
    };
    
    const getMockWidgets = () => [
        {
            widget_type: 'occupancy',
            display_name: 'Occupancy Rate',
            description: 'Track occupancy rates across your properties',
            category: 'property',
            default_size: {w: 2, h: 1},
            size_variants: [
                {w: 1, h: 1, name: 'compact'},
                {w: 2, h: 1, name: 'wide'},
                {w: 1, h: 2, name: 'tall'},
                {w: 2, h: 2, name: 'large'}
            ]
        },
        {
            widget_type: 'revenue',
            display_name: 'Revenue Tracker',
            description: 'Monitor monthly revenue and targets',
            category: 'property',
            default_size: {w: 2, h: 1},
            size_variants: [
                {w: 1, h: 1, name: 'compact'},
                {w: 2, h: 1, name: 'wide'},
                {w: 2, h: 2, name: 'large'}
            ]
        },
        {
            widget_type: 'maintenance',
            display_name: 'Maintenance Requests',
            description: 'View and manage maintenance tasks',
            category: 'property',
            default_size: {w: 1, h: 1},
            size_variants: [
                {w: 1, h: 1, name: 'compact'},
                {w: 2, h: 1, name: 'wide'},
                {w: 1, h: 2, name: 'tall'}
            ]
        },
        {
            widget_type: 'leases',
            display_name: 'Lease Management',
            description: 'Track expiring leases and renewals',
            category: 'property',
            default_size: {w: 1, h: 1},
            size_variants: [
                {w: 1, h: 1, name: 'compact'},
                {w: 2, h: 1, name: 'wide'}
            ]
        },
        {
            widget_type: 'calendar',
            display_name: 'Calendar',
            description: 'View today\'s events and appointments',
            category: 'productivity',
            default_size: {w: 2, h: 1},
            size_variants: [
                {w: 1, h: 1, name: 'compact'},
                {w: 2, h: 1, name: 'wide'},
                {w: 1, h: 2, name: 'tall'},
                {w: 2, h: 2, name: 'large'}
            ]
        },
        {
            widget_type: 'follow_ups',
            display_name: 'Follow-ups',
            description: 'Track tasks and reminders',
            category: 'productivity',
            default_size: {w: 1, h: 1},
            size_variants: [
                {w: 1, h: 1, name: 'compact'},
                {w: 2, h: 1, name: 'wide'},
                {w: 1, h: 2, name: 'tall'}
            ]
        },
        {
            widget_type: 'quick_notes',
            display_name: 'Quick Notes',
            description: 'Keep important notes handy',
            category: 'productivity',
            default_size: {w: 1, h: 1},
            size_variants: [
                {w: 1, h: 1, name: 'compact'},
                {w: 2, h: 1, name: 'wide'},
                {w: 1, h: 2, name: 'tall'}
            ]
        },
        {
            widget_type: 'rent_collection',
            display_name: 'Rent Collection',
            description: 'Monitor rent payment status',
            category: 'property',
            default_size: {w: 2, h: 1},
            size_variants: [
                {w: 2, h: 1, name: 'wide'},
                {w: 4, h: 1, name: 'full-width'}
            ],
            is_premium: true
        }
    ];

    const categories = [
        { id: 'all', name: 'All Widgets', icon: 'Dashboard' },
        { id: 'property', name: 'Property Metrics', icon: 'Building' },
        { id: 'productivity', name: 'Productivity', icon: 'Calendar' },
        { id: 'analytics', name: 'Analytics', icon: 'Chart' }
    ];

    const filteredWidgets = selectedCategory === 'all' 
        ? widgets 
        : widgets.filter(w => w.category === selectedCategory);

    // Debug log
    console.log('WidgetSelector rendering, widgets:', widgets.length);
    
    if (!widgets || widgets.length === 0) {
        return (
            <div className="widget-selector-overlay" onClick={onClose}>
                <div className="widget-selector-modal" onClick={e => e.stopPropagation()}>
                    <div className="widget-selector-header">
                        <h2>Add Widget</h2>
                        <button className="close-button" onClick={onClose}>×</button>
                    </div>
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <p>No widgets available</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="widget-selector-overlay" onClick={onClose}>
            <div className="widget-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="widget-selector-header">
                    <h2>Add Widget</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="widget-selector-categories">
                    {categories.map(cat => {
                        const IconComponent = hasIcons && Icons[cat.icon];
                        return (
                            <button
                                key={cat.id}
                                className={`category-button ${selectedCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {IconComponent ? <IconComponent /> : <span style={{marginRight: '4px'}}>•</span>}
                                <span>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="widget-selector-content">
                    {loading ? (
                        <div className="widget-selector-loading">
                            <div className="widget-loading-spinner"></div>
                        </div>
                    ) : (
                        <div className="widget-grid">
                            {filteredWidgets.map(widget => (
                                <div 
                                    key={widget.widget_type}
                                    className="widget-card"
                                    onClick={() => onSelect(widget.widget_type)}
                                >
                                    <div className="widget-card-icon">
                                        {getWidgetIcon(widget.widget_type)}
                                    </div>
                                    <h3>{widget.display_name}</h3>
                                    <p>{widget.description}</p>
                                    <div className="widget-card-sizes">
                                        {widget.size_variants.map(size => (
                                            <span key={`${size.w}x${size.h}`} className="size-badge">
                                                {size.w}×{size.h}
                                            </span>
                                        ))}
                                    </div>
                                    {widget.is_premium && (
                                        <div className="premium-badge">Premium</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const getWidgetIcon = (type) => {
    const icons = {
        occupancy: '🏢',
        revenue: '💰',
        maintenance: '🔧',
        leases: '📄',
        rent_collection: '💳',
        quick_notes: '📝',
        calendar: '📅',
        follow_ups: '✅',
        alerts: '🔔',
        documents: '📁',
        performance_kpi: '📊',
        financial_summary: '💼',
        tenant_satisfaction: '😊'
    };
    return icons[type] || '📊';
};

// Add these styles to dashboard.css
const widgetSelectorStyles = `
.widget-selector-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 200ms ease;
}

.widget-selector-modal {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    animation: slideUp 300ms ease;
}

.widget-selector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.widget-selector-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
}

.close-button {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: transparent;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    transition: all 150ms ease;
}

.close-button:hover {
    background: rgba(0, 0, 0, 0.05);
}

.widget-selector-categories {
    display: flex;
    gap: 8px;
    padding: 16px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.category-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
}

.category-button:hover {
    background: #f9fafb;
    border-color: #d1d5db;
}

.category-button.active {
    background: #667eea;
    border-color: #667eea;
    color: white;
}

.widget-selector-content {
    padding: 24px;
    overflow-y: auto;
    max-height: calc(80vh - 200px);
}

.widget-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
}

.widget-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 200ms ease;
    position: relative;
}

.widget-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
}

.widget-card-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.widget-card h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
}

.widget-card p {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
    margin-bottom: 12px;
}

.widget-card-sizes {
    display: flex;
    gap: 6px;
}

.size-badge {
    padding: 2px 8px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
}

.premium-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 8px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from { 
        opacity: 0;
        transform: translateY(20px);
    }
    to { 
        opacity: 1;
        transform: translateY(0);
    }
}
`;