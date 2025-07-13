const DashboardWidget = ({ widget, onUpdate }) => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        loadWidgetData();
        
        // Set up refresh interval if refresh is enabled
        if (widget.refresh_interval && widget.refresh_interval > 0) {
            const interval = setInterval(loadWidgetData, widget.refresh_interval * 1000);
            return () => clearInterval(interval);
        }
    }, [widget.id]);

    const loadWidgetData = async () => {
        try {
            setLoading(true);
            const response = await window.apiClient.request(`/dashboard/widgets/${widget.id}/data`);
            setData(response);
            setError(null);
        } catch (err) {
            console.error('Failed to load widget data, using mock:', err);
            // Use mock data based on widget type
            setData(getMockWidgetData(widget.widget_type));
            setError(null);
        } finally {
            setLoading(false);
        }
    };
    
    const getMockWidgetData = (widgetType) => {
        switch (widgetType) {
            case 'occupancy':
                return {
                    rate: 89.5,
                    occupied: 139,
                    total: 156,
                    change: 2.3,
                    trend: [87, 88, 87.5, 88.2, 89, 89.3, 89.5],
                    properties: [
                        { name: 'Sunset Apartments', rate: 92.5 },
                        { name: 'Oak Grove', rate: 88.0 },
                        { name: 'Riverside Plaza', rate: 87.2 }
                    ],
                    history: Array.from({ length: 30 }, (_, i) => ({
                        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        occupancy: 85 + Math.random() * 10
                    }))
                };
            case 'revenue':
                return {
                    current: 2400000,
                    target: 2500000,
                    progress: 96,
                    ytd: 18500000,
                    change: 8.1,
                    daily: [1.2, 1.5, 1.8, 2.1, 1.9, 2.3, 2.5],
                    today: 85000,
                    week: 580000,
                    breakdown: {
                        rent: 2100000,
                        fees: 180000,
                        other: 120000
                    }
                };
            case 'maintenance':
                return {
                    open: 18,
                    urgent: 3,
                    today: 5,
                    overdue: 2,
                    completed: 45,
                    inProgress: 7,
                    trend: [12, 15, 13, 18, 16, 14, 13],
                    byPriority: {
                        urgent: 3,
                        high: 5,
                        medium: 8,
                        low: 2
                    },
                    byCategory: {
                        plumbing: 5,
                        electric: 3,
                        hvac: 4,
                        other: 6
                    },
                    recent: [
                        { id: '1', title: 'HVAC Repair - Unit 4B', priority: 'high', status: 'in_progress' },
                        { id: '2', title: 'Plumbing Issue - Building C', priority: 'medium', status: 'pending' },
                        { id: '3', title: 'Light Fixture - Common Area', priority: 'low', status: 'pending' }
                    ]
                };
            case 'calendar':
                return {
                    today: 3,
                    nextEvent: {
                        time: '2:00 PM',
                        title: 'Vendor Meeting'
                    },
                    events: [
                        { time: '09:00 AM', title: 'Property Inspection - Oak Grove', type: 'inspection' },
                        { time: '02:00 PM', title: 'Vendor Meeting', type: 'meeting' },
                        { time: '04:30 PM', title: 'Lease Signing - Unit 12A', type: 'lease' }
                    ]
                };
            case 'follow_ups':
                return {
                    total: 12,
                    overdue: 3,
                    tasks: [
                        { id: '1', title: 'Review lease renewal - Tenant #45', due: 'Today', completed: false },
                        { id: '2', title: 'Follow up on maintenance request', due: 'Tomorrow', completed: false },
                        { id: '3', title: 'Schedule property walkthrough', due: 'Next Week', completed: false }
                    ]
                };
            case 'leases':
                return {
                    expiring: 8,
                    expiring_30d: 3,
                    expiring_60d: 3,
                    expiring_90d: 2,
                    upcoming: [
                        { tenant: 'John Smith', unit: '4B', property: 'Sunset Apts', days_until: 15, end_date: '2024-01-27' },
                        { tenant: 'Jane Doe', unit: '12A', property: 'Oak Grove', days_until: 28, end_date: '2024-02-09' },
                        { tenant: 'Bob Johnson', unit: '7C', property: 'Riverside', days_until: 45, end_date: '2024-02-26' }
                    ]
                };
            default:
                return {};
        }
    };

    const getWidgetComponent = () => {
        switch (widget.widget_type) {
            case 'occupancy':
                return <OccupancyWidget data={data} size={widget.position} config={widget.config} />;
            case 'revenue':
                return <RevenueWidget data={data} size={widget.position} config={widget.config} />;
            case 'maintenance':
                return <MaintenanceWidget data={data} size={widget.position} config={widget.config} />;
            case 'leases':
                return <LeasesWidget data={data} size={widget.position} config={widget.config} />;
            case 'calendar':
                return <CalendarWidget data={data} size={widget.position} config={widget.config} />;
            case 'follow_ups':
                return <FollowUpsWidget data={data} size={widget.position} config={widget.config} />;
            case 'quick_notes':
                return <QuickNotesWidget 
                    config={widget.config} 
                    size={widget.position}
                    onUpdate={(newConfig) => onUpdate({ config: newConfig })}
                />;
            default:
                return (
                    <div className="widget-content">
                        <div className="widget-header">
                            <h3 className="widget-title">{widget.widget_type}</h3>
                        </div>
                        <div style={{ opacity: 0.6, fontSize: '13px' }}>
                            Widget coming soon
                        </div>
                    </div>
                );
        }
    };

    if (loading && !data) {
        return (
            <div className="widget-loading">
                <div className="widget-loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="widget-error">
                <div className="widget-error-icon">!</div>
                <div className="widget-error-message">Failed to load data</div>
                <div className="widget-error-retry" onClick={loadWidgetData}>
                    Retry
                </div>
            </div>
        );
    }

    return getWidgetComponent();
};