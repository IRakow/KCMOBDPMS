const CalendarWidget = ({ data, size, config }) => {
    if (!data) return null;
    
    // Load mini chart components - with fallback if not loaded yet
    const MiniCharts = window.MiniCharts || {};
    const { SparkLine, RingChart, BarChart, AreaChart, TrendIndicator } = MiniCharts;

    const isCompact = size.w === 1 && size.h === 1;
    const isWide = size.w === 2 && size.h === 1;
    const isTall = size.w === 1 && size.h === 2;
    const isLarge = size.w >= 2 && size.h >= 2;

    const currentTime = new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
    });

    // Compact view (1x1) - Event count only
    if (isCompact) {
        const date = new Date();
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        
        return (
            <div className="widget-content widget-gradient-calendar" style={{ position: 'relative' }}>
                <div className="widget-header">
                    <h3 className="widget-title">Calendar</h3>
                    <span style={{ fontSize: '10px', opacity: 0.7 }}>{currentTime}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-4px' }}>
                    <div>
                        <div className="metric-value">{data.today || 0}</div>
                        <div className="metric-label" style={{ fontSize: '10px', opacity: 0.7 }}>events today</div>
                    </div>
                    <div style={{ 
                        width: '44px',
                        height: '44px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{ fontSize: '9px', opacity: 0.7, fontWeight: '600' }}>{dayName}</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', lineHeight: 1 }}>{dayNum}</div>
                    </div>
                </div>
                
                {data.nextEvent && (
                    <div style={{ 
                        marginTop: '8px',
                        padding: '4px 8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        <span style={{ opacity: 0.7 }}>Next:</span> {data.nextEvent.time} - {data.nextEvent.title}
                    </div>
                )}
            </div>
        );
    }

    // Wide view (2x1) - Today's event list
    if (isWide) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Today's Schedule</h3>
                    <span style={{ fontSize: '12px', opacity: 0.8 }}>{data.events?.length || 0} events</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                    {data.events?.length > 0 ? (
                        data.events.slice(0, 3).map((event, idx) => (
                            <div 
                                key={idx} 
                                style={{
                                    flex: '0 0 auto',
                                    padding: '8px 12px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    minWidth: '140px'
                                }}
                            >
                                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                                    {event.time}
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                    {event.title}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ opacity: 0.6, fontSize: '13px' }}>No events scheduled</div>
                    )}
                </div>
            </div>
        );
    }

    // Tall view (1x2) - Detailed event list
    if (isTall) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Calendar</h3>
                </div>
                <div className="widget-list">
                    {data.events?.length > 0 ? (
                        data.events.map((event, idx) => (
                            <div key={idx} className="widget-list-item">
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '4px',
                                        background: getEventColor(event.type),
                                        borderRadius: '2px'
                                    }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="list-item-title">{event.title}</div>
                                        <div className="list-item-subtitle">{event.time}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px' }}>
                            <div style={{ marginBottom: '8px' }}>📅</div>
                            <div style={{ fontSize: '13px' }}>No events today</div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Large view - Week view
    if (isLarge) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date().getDay();
        
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Weekly Calendar</h3>
                    <div className="widget-actions">
                        <button className="widget-action-btn">
                            <Icons.ChevronDown />
                        </button>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {days.map((day, idx) => (
                        <div 
                            key={idx}
                            style={{
                                padding: '12px 8px',
                                background: idx === today - 1 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>
                                {day}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '600' }}>
                                {new Date().getDate() - today + idx + 1}
                            </div>
                            <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>
                                {idx === today - 1 ? `${data.events?.length || 0} events` : ''}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '12px', marginBottom: '12px', opacity: 0.8 }}>
                        Today's Events
                    </h4>
                    <div className="widget-list">
                        {data.events?.map((event, idx) => (
                            <div key={idx} className="widget-list-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <div className="list-item-title">{event.title}</div>
                                        <div className="list-item-subtitle">
                                            {event.type} • {event.time}
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: getEventColor(event.type),
                                        alignSelf: 'center'
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

const getEventColor = (type) => {
    const colors = {
        meeting: '#60a5fa',
        inspection: '#34d399',
        lease: '#f59e0b',
        maintenance: '#f87171',
        other: '#a78bfa'
    };
    return colors[type] || colors.other;
};