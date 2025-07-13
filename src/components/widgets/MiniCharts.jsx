// Mini chart components for compact widget views

const SparkLine = ({ data, color = '#60a5fa', height = 16, width = 40 }) => {
    if (!data || data.length < 2) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');
    
    return (
        <svg 
            className="widget-spark" 
            viewBox={`0 0 ${width} ${height}`} 
            style={{ width, height }}
        >
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

const RingChart = ({ percentage, color = '#60a5fa', size = 48, strokeWidth = 4 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="widget-ring-chart" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
            </svg>
            <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white'
            }}>
                {percentage}%
            </div>
        </div>
    );
};

const BarChart = ({ data, color = '#60a5fa', height = 40 }) => {
    if (!data || data.length === 0) return null;
    
    const max = Math.max(...data);
    const barWidth = 100 / data.length;
    
    return (
        <div className="widget-mini-chart">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                {data.map((value, index) => {
                    const barHeight = (value / max) * 40;
                    return (
                        <rect
                            key={index}
                            x={index * barWidth + barWidth * 0.1}
                            y={40 - barHeight}
                            width={barWidth * 0.8}
                            height={barHeight}
                            fill={color}
                            opacity={0.6 + (index / data.length) * 0.4}
                            rx="2"
                        />
                    );
                })}
            </svg>
        </div>
    );
};

const AreaChart = ({ data, color = '#60a5fa', height = 40 }) => {
    if (!data || data.length < 2) return null;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 40 - ((value - min) / range) * 40;
        return { x, y };
    });
    
    const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');
    
    const areaData = `${pathData} L 100 40 L 0 40 Z`;
    
    return (
        <div className="widget-mini-chart">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                    <linearGradient id={`area-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                    </linearGradient>
                </defs>
                <path
                    d={areaData}
                    fill={`url(#area-gradient-${color})`}
                />
                <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.8"
                />
            </svg>
        </div>
    );
};

const TrendIndicator = ({ value, size = 'small' }) => {
    const isPositive = value >= 0;
    const color = isPositive ? '#10b981' : '#ef4444';
    const arrow = isPositive ? '↑' : '↓';
    
    const fontSize = size === 'small' ? '11px' : '13px';
    
    return (
        <span style={{ 
            color, 
            fontSize, 
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px'
        }}>
            {arrow} {Math.abs(value)}%
        </span>
    );
};

// Export all components to window for use in other widgets
window.MiniCharts = {
    SparkLine,
    RingChart,
    BarChart,
    AreaChart,
    TrendIndicator
};