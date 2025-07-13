const RevenueWidget = ({ data, size, config }) => {
    if (!data) return null;
    
    // Load mini chart components - with fallback if not loaded yet
    const MiniCharts = window.MiniCharts || {};
    const { SparkLine, RingChart, BarChart, AreaChart, TrendIndicator } = MiniCharts;

    const isCompact = size.w === 1 && size.h === 1;
    const isWide = size.w === 2 && size.h === 1;
    const isTall = size.w === 1 && size.h === 2;
    const isLarge = size.w === 2 && size.h === 2;

    // Compact view (1x1) - Current revenue only
    if (isCompact) {
        const progressPercent = Math.round((data.current / data.target) * 100);
        return (
            <div className="widget-content" style={{ position: 'relative' }}>
                <div className="widget-header">
                    <h3 className="widget-title">Revenue</h3>
                    {TrendIndicator && <TrendIndicator value={data.change} size="small" />}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '-4px' }}>
                    <div>
                        <div className="metric-value">
                            ${(data.current / 1000000).toFixed(1)}M
                        </div>
                        <div className="metric-label" style={{ fontSize: '10px', opacity: 0.7 }}>
                            {progressPercent}% of target
                        </div>
                    </div>
                    {RingChart ? (
                        <RingChart percentage={progressPercent} color="#3b82f6" size={44} strokeWidth={3} />
                    ) : (
                        <div style={{ fontSize: '10px', opacity: 0.6 }}>Loading...</div>
                    )}
                </div>
                {BarChart && (
                    <BarChart 
                        data={data.daily || [1.2, 1.5, 1.8, 2.1, 1.9, 2.3, 2.5]} 
                        color="#3b82f6" 
                    />
                )}
            </div>
        );
    }

    // Wide view (2x1) - Revenue with target progress
    if (isWide) {
        const progressPercent = Math.round((data.current / data.target) * 100);
        return (
            <div className="widget-content widget-gradient-revenue">
                <div className="widget-header">
                    <h3 className="widget-title">Monthly Revenue</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>
                            ${(data.current / 1000000).toFixed(1)}M / ${(data.target / 1000000).toFixed(1)}M
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontSize: '28px', fontWeight: '700' }}>{progressPercent}%</span>
                                <span style={{ fontSize: '14px', opacity: 0.7 }}>of monthly target</span>
                            </div>
                            <div className="progress-bar" style={{ height: '8px', marginBottom: '8px' }}>
                                <div 
                                    className="progress-fill" 
                                    style={{ 
                                        width: `${Math.min(progressPercent, 100)}%`,
                                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                                    }}
                                />
                            </div>
                            <TrendIndicator value={data.change} />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            <div style={{ 
                                padding: '6px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                fontSize: '11px'
                            }}>
                                <div style={{ opacity: 0.7 }}>Today</div>
                                <div style={{ fontWeight: '600' }}>${(data.today / 1000).toFixed(0)}k</div>
                            </div>
                            <div style={{ 
                                padding: '6px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                fontSize: '11px'
                            }}>
                                <div style={{ opacity: 0.7 }}>Week</div>
                                <div style={{ fontWeight: '600' }}>${(data.week / 1000).toFixed(0)}k</div>
                            </div>
                            <div style={{ 
                                padding: '6px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                fontSize: '11px'
                            }}>
                                <div style={{ opacity: 0.7 }}>Month</div>
                                <div style={{ fontWeight: '600' }}>${(data.current / 1000000).toFixed(1)}M</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Large view (2x2) - Full revenue breakdown
    if (isLarge) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Revenue Analytics</h3>
                    <div className="widget-actions">
                        <button className="widget-action-btn">
                            <Icons.Chart />
                        </button>
                    </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <div className="metric-value large">
                        ${(data.current / 1000000).toFixed(2)}M
                    </div>
                    <div className="metric-label">Current Month Revenue</div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                        <div className={`metric-change ${data.change >= 0 ? 'positive' : 'negative'}`}>
                            {data.change >= 0 ? '↑' : '↓'} {Math.abs(data.change)}% MoM
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.8 }}>
                            YTD: ${(data.ytd / 1000000).toFixed(1)}M
                        </div>
                    </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '12px', marginBottom: '12px', opacity: 0.8 }}>
                        Revenue Breakdown
                    </h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Rent</span>
                            <span style={{ fontWeight: '600' }}>
                                ${(data.breakdown.rent / 1000000).toFixed(2)}M
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Fees</span>
                            <span style={{ fontWeight: '600' }}>
                                ${(data.breakdown.fees / 1000).toFixed(0)}K
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Other</span>
                            <span style={{ fontWeight: '600' }}>
                                ${(data.breakdown.other / 1000).toFixed(0)}K
                            </span>
                        </div>
                    </div>
                </div>
                
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>Target Progress</span>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{data.progress}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: '16px' }}>
                        <div 
                            className="progress-fill" 
                            style={{ 
                                width: `${Math.min(data.progress, 100)}%`,
                                background: data.progress >= 100 
                                    ? 'linear-gradient(90deg, #10b981, #34d399)' 
                                    : 'linear-gradient(90deg, #60a5fa, #3b82f6)'
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Default
    return (
        <div className="widget-content">
            <div className="metric-value">
                ${(data.current / 1000000).toFixed(1)}M
            </div>
            <div className="metric-label">Monthly Revenue</div>
        </div>
    );
};