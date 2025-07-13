const MaintenanceWidget = ({ data, size, config }) => {
    if (!data) return null;
    
    // Load mini chart components - with fallback if not loaded yet
    const MiniCharts = window.MiniCharts || {};
    const { SparkLine, RingChart, BarChart, AreaChart, TrendIndicator } = MiniCharts;

    const isCompact = size.w === 1 && size.h === 1;
    const isWide = size.w === 2 && size.h === 1;
    const isTall = size.w === 1 && size.h === 2;
    const isLarge = size.w >= 2 && size.h >= 2;

    // Compact view (1x1) - Just counts
    if (isCompact) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Maintenance</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div className="metric-value">{data.open || 0}</div>
                        <div className="metric-label" style={{ fontSize: '10px' }}>Open</div>
                    </div>
                    {data.urgent > 0 && (
                        <div style={{ fontSize: '11px', color: '#fca5a5', fontWeight: '600' }}>
                            {data.urgent} urgent
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Wide view (2x1) - Counts with breakdown
    if (isWide) {
        return (
            <div className="widget-content widget-gradient-maintenance">
                <div className="widget-header">
                    <h3 className="widget-title">Maintenance Requests</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {data.urgent > 0 && (
                            <span style={{ 
                                fontSize: '11px', 
                                padding: '2px 8px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5',
                                borderRadius: '4px',
                                fontWeight: '600'
                            }}>
                                {data.urgent} urgent
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: '700' }}>{data.open}</div>
                                <div style={{ fontSize: '10px', opacity: 0.7 }}>Open</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>{data.today}</div>
                                <div style={{ fontSize: '10px', opacity: 0.7 }}>Today</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
                                    {data.overdue}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.7 }}>Overdue</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                                    {data.completed || 0}
                                </div>
                                <div style={{ fontSize: '10px', opacity: 0.7 }}>Done</div>
                            </div>
                        </div>
                        
                        <div style={{ marginTop: '12px', display: 'flex', gap: '4px' }}>
                            {['Plumbing', 'Electric', 'HVAC', 'Other'].map((cat, idx) => {
                                const count = data.byCategory?.[cat.toLowerCase()] || Math.floor(Math.random() * 10);
                                return (
                                    <div 
                                        key={cat}
                                        style={{ 
                                            flex: 1,
                                            padding: '4px',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            borderRadius: '4px',
                                            fontSize: '10px',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontWeight: '600' }}>{count}</div>
                                        <div style={{ opacity: 0.7, fontSize: '9px' }}>{cat}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    
                    {SparkLine && (
                        <div style={{ width: '100px' }}>
                            <SparkLine 
                                data={data.trend || [12, 15, 13, 18, 16, 14, 13]} 
                                color="#ec4899"
                                width={100}
                                height={40}
                            />
                            <div style={{ fontSize: '10px', opacity: 0.5, textAlign: 'center', marginTop: '4px' }}>7 day trend</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Tall/Large view - List of requests
    if (isTall || isLarge) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Recent Maintenance</h3>
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>
                        {data.open} open
                    </span>
                </div>
                <div className="widget-list">
                    {data.recent?.length > 0 ? (
                        data.recent.map((request, idx) => (
                            <div key={idx} className="widget-list-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ flex: 1 }}>
                                        <div className="list-item-title">{request.title}</div>
                                        <div className="list-item-subtitle">
                                            {request.status} • Priority: {request.priority}
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: getPriorityColor(request.priority),
                                        alignSelf: 'center'
                                    }} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px' }}>
                            No maintenance requests
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

const getPriorityColor = (priority) => {
    const colors = {
        high: '#ef4444',
        medium: '#f59e0b',
        low: '#10b981'
    };
    return colors[priority] || colors.medium;
};