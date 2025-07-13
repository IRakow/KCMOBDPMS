const WidgetSelector = ({ onSelect, onClose }) => {
    const widgets = [
        {
            widget_type: 'occupancy',
            display_name: 'Occupancy Rate',
            description: 'Track occupancy rates across your properties',
            category: 'property',
            icon: '🏢'
        },
        {
            widget_type: 'revenue',
            display_name: 'Revenue Tracker',
            description: 'Monitor monthly revenue and targets',
            category: 'property',
            icon: '💰'
        },
        {
            widget_type: 'maintenance',
            display_name: 'Maintenance Requests',
            description: 'View and manage maintenance tasks',
            category: 'property',
            icon: '🔧'
        },
        {
            widget_type: 'leases',
            display_name: 'Lease Management',
            description: 'Track expiring leases and renewals',
            category: 'property',
            icon: '📄'
        },
        {
            widget_type: 'calendar',
            display_name: 'Calendar',
            description: 'View today\'s events and appointments',
            category: 'productivity',
            icon: '📅'
        },
        {
            widget_type: 'follow_ups',
            display_name: 'Follow-ups',
            description: 'Track tasks and reminders',
            category: 'productivity',
            icon: '✅'
        },
        {
            widget_type: 'quick_notes',
            display_name: 'Quick Notes',
            description: 'Keep important notes handy',
            category: 'productivity',
            icon: '📝'
        }
    ];

    return (
        <div className="widget-selector-overlay" onClick={onClose}>
            <div className="widget-selector-modal" onClick={e => e.stopPropagation()}>
                <div className="widget-selector-header">
                    <h2>Add Widget</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="widget-selector-content">
                    <div className="widget-grid">
                        {widgets.map(widget => (
                            <div 
                                key={widget.widget_type}
                                className="widget-card"
                                onClick={() => onSelect(widget.widget_type)}
                            >
                                <div className="widget-card-icon">
                                    {widget.icon}
                                </div>
                                <h3>{widget.display_name}</h3>
                                <p>{widget.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};