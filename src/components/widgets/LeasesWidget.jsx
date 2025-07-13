const LeasesWidget = ({ data, size, config }) => {
    if (!data) return null;

    const isCompact = size.w === 1 && size.h === 1;
    const isWide = size.w === 2 && size.h === 1;
    const isTall = size.w === 1 && size.h === 2;
    const isLarge = size.w >= 2 && size.h >= 2;

    // Compact view (1x1) - Expiring count
    if (isCompact) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Leases</h3>
                </div>
                <div className="metric-value">{data.expiring || 0}</div>
                <div className="metric-label">Expiring soon</div>
                <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.7 }}>
                    Next 30 days
                </div>
            </div>
        );
    }

    // Wide view (2x1) - Timeline
    if (isWide) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Lease Timeline</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {['30d', '60d', '90d'].map((period, idx) => (
                        <div key={period} style={{ 
                            flex: 1, 
                            textAlign: 'center',
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '6px'
                        }}>
                            <div style={{ fontSize: '20px', fontWeight: '600' }}>
                                {data[`expiring_${period}`] || 0}
                            </div>
                            <div style={{ fontSize: '11px', opacity: 0.7 }}>
                                {period}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Default - List view
    return (
        <div className="widget-content">
            <div className="widget-header">
                <h3 className="widget-title">Expiring Leases</h3>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    {data.expiring} total
                </span>
            </div>
            <div className="widget-list">
                {data.upcoming?.length > 0 ? (
                    data.upcoming.slice(0, isLarge ? 5 : 3).map((lease, idx) => (
                        <div key={idx} className="widget-list-item">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div className="list-item-title">{lease.tenant}</div>
                                    <div className="list-item-subtitle">
                                        Unit {lease.unit} • {lease.property}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ 
                                        fontSize: '13px', 
                                        fontWeight: '600',
                                        color: getExpiryColor(lease.days_until)
                                    }}>
                                        {lease.days_until}d
                                    </div>
                                    <div style={{ fontSize: '11px', opacity: 0.7 }}>
                                        {lease.end_date}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px' }}>
                        No leases expiring soon
                    </div>
                )}
            </div>
        </div>
    );
};

const getExpiryColor = (days) => {
    if (days <= 30) return '#ef4444';
    if (days <= 60) return '#f59e0b';
    return 'inherit';
};