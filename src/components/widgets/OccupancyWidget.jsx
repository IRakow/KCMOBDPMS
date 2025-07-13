const OccupancyWidget = ({ data, size, config }) => {
    if (!data) return null;
    
    // Load mini chart components - with fallback if not loaded yet
    const MiniCharts = window.MiniCharts || {};
    const { SparkLine, RingChart, BarChart, AreaChart, TrendIndicator } = MiniCharts;

    // Size-aware rendering
    const isCompact = size.w === 1 && size.h === 1;
    const isWide = size.w === 2 && size.h === 1;
    const isTall = size.w === 1 && size.h === 2;
    const isLarge = size.w === 2 && size.h === 2;
    const isExtraLarge = size.w === 4;

    // Compact view (1x1) - Just the key metric
    if (isCompact) {
        return (
            <div className="widget-content" style={{ position: 'relative' }}>
                <div className="widget-header">
                    <h3 className="widget-title">Occupancy</h3>
                    {TrendIndicator && <TrendIndicator value={data.change} size="small" />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-4px' }}>
                    <div>
                        <div className="metric-value">{data.rate}%</div>
                        <div className="metric-label" style={{ fontSize: '10px', opacity: 0.7 }}>
                            {data.occupied} of {data.total}
                        </div>
                    </div>
                    {RingChart ? (
                        <RingChart percentage={data.rate} color="#10b981" size={44} strokeWidth={3} />
                    ) : (
                        <div style={{ fontSize: '10px', opacity: 0.6 }}>Loading...</div>
                    )}
                </div>
                {AreaChart && <AreaChart data={data.trend || [75, 78, 82, 85, 88, 87, 92]} color="#10b981" />}
            </div>
        );
    }

    // Wide view (2x1) - Metric with trend
    if (isWide) {
        return (
            <div className="widget-content widget-gradient-occupancy">
                <div className="widget-header">
                    <h3 className="widget-title">Occupancy Rate</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <TrendIndicator value={data.change} />
                        <span style={{ fontSize: '11px', opacity: 0.6 }}>vs last month</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                            <div className="metric-value">{data.rate}%</div>
                            <div style={{ fontSize: '14px', opacity: 0.7, fontWeight: '500' }}>
                                occupied
                            </div>
                        </div>
                        <div className="metric-label">{data.occupied} of {data.total} units</div>
                        
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            {data.properties?.slice(0, 3).map((prop, idx) => (
                                <div key={idx} style={{ 
                                    flex: 1,
                                    padding: '4px 8px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    fontSize: '11px'
                                }}>
                                    <div style={{ fontWeight: '600' }}>{prop.rate}%</div>
                                    <div style={{ opacity: 0.7, fontSize: '10px' }}>{prop.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ width: '120px', height: '60px' }}>
                        <AreaChart 
                            data={data.trend || [75, 78, 82, 80, 85, 88, 87, 90, 89, 92]} 
                            color="#10b981" 
                            height={60}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Tall view (1x2) - Metric with property list
    if (isTall) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Occupancy</h3>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <div className="metric-value">{data.rate}%</div>
                    <div className="metric-label">Overall</div>
                </div>
                <div className="widget-list">
                    {data.properties?.slice(0, 3).map((property, idx) => (
                        <div key={idx} className="widget-list-item">
                            <div className="list-item-title">{property.name}</div>
                            <div className="list-item-subtitle">{property.rate}%</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Large view (2x2) - Full analytics
    if (isLarge) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Occupancy Analytics</h3>
                    <div className="widget-actions">
                        <button className="widget-action-btn">
                            <Icons.Download />
                        </button>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <div className="metric-value large">{data.rate}%</div>
                        <div className="metric-label">{data.occupied} of {data.total} units occupied</div>
                        <div className={`metric-change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                            {data.change >= 0 ? '↑' : '↓'} {Math.abs(data.change)}% from last month
                        </div>
                    </div>
                    
                    <div>
                        <h4 style={{ fontSize: '12px', marginBottom: '12px', opacity: 0.8 }}>
                            Property Breakdown
                        </h4>
                        {data.properties?.map((property, idx) => (
                            <div key={idx} style={{ marginBottom: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '13px' }}>{property.name}</span>
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{property.rate}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${property.rate}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                    <h4 style={{ fontSize: '12px', marginBottom: '12px', opacity: 0.8 }}>
                        30-Day Trend
                    </h4>
                    <AreaChart data={data.history} height={80} />
                </div>
            </div>
        );
    }

    // Extra large view (4x1 or 4x2) - Comprehensive view
    if (isExtraLarge) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Occupancy Overview</h3>
                    <div className="widget-actions">
                        <select className="widget-action-select">
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                            <option>Year to date</option>
                        </select>
                    </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 300px', gap: '24px' }}>
                    <div>
                        <div className="metric-value large">{data.rate}%</div>
                        <div className="metric-label">Current Occupancy</div>
                        <div className={`metric-change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                            {data.change >= 0 ? '↑' : '↓'} {Math.abs(data.change)}% MoM
                        </div>
                        
                        <div style={{ marginTop: '20px' }}>
                            <div className="metric-label">Units Status</div>
                            <div style={{ marginTop: '8px' }}>
                                <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                                    Occupied: {data.occupied}
                                </div>
                                <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                                    Available: {data.total - data.occupied}
                                </div>
                                <div style={{ fontSize: '14px' }}>
                                    Total: {data.total}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <AreaChart data={data.history} height={size.h === 2 ? 140 : 60} />
                    </div>
                    
                    <div>
                        <h4 style={{ fontSize: '12px', marginBottom: '12px', opacity: 0.8 }}>
                            Properties Performance
                        </h4>
                        <div className="widget-list">
                            {data.properties?.map((property, idx) => (
                                <div key={idx} className="widget-list-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <div className="list-item-title">{property.name}</div>
                                            <div className="list-item-subtitle">
                                                {Math.floor(property.rate * data.total / 100)} units
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '16px', fontWeight: '600' }}>
                                                {property.rate}%
                                            </div>
                                            <div style={{ fontSize: '11px', opacity: 0.7 }}>
                                                occupancy
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Default fallback
    return (
        <div className="widget-content">
            <div className="metric-value">{data.rate}%</div>
            <div className="metric-label">Occupancy Rate</div>
        </div>
    );
};

// Simple sparkline chart component
const SparklineChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    
    const width = 100;
    const height = 40;
    const padding = 2;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - ((value - min) / range) * (height - 2 * padding) - padding;
        return `${x},${y}`;
    }).join(' ');
    
    return (
        <svg width={width} height={height} style={{ width: '100%', height: '100%' }}>
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                </linearGradient>
            </defs>
            <polyline
                points={points}
                className="chart-line"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <polygon
                points={`${padding},${height} ${points} ${width - padding},${height}`}
                className="chart-area"
            />
        </svg>
    );
};

// Area chart component
const AreaChart = ({ data, height = 100 }) => {
    if (!data || data.length === 0) return null;
    
    const width = 400;
    const padding = 20;
    
    const values = data.map(d => d.occupancy || d.value || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    const points = values.map((value, index) => {
        const x = (index / (values.length - 1)) * (width - 2 * padding) + padding;
        const y = height - ((value - min) / range) * (height - 2 * padding) - padding;
        return { x, y };
    });
    
    const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
    
    const areaData = `${pathData} L ${width - padding} ${height} L ${padding} ${height} Z`;
    
    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                </linearGradient>
            </defs>
            <path
                d={areaData}
                fill="url(#areaGradient)"
            />
            <path
                d={pathData}
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};