// WorldClassReporting.jsx - Enterprise Analytics & Reporting Platform
const WorldClassReporting = () => {
    // Add error boundary
    const [error, setError] = React.useState(null);
    
    if (error) {
        return React.createElement('div', { className: 'error-boundary-reporting' }, [
            React.createElement('h2', { key: 'title' }, 'Reports Temporarily Unavailable'),
            React.createElement('p', { key: 'message' }, 'There was an error loading the reporting system. Please try refreshing the page.'),
            React.createElement('button', { 
                key: 'retry',
                onClick: () => setError(null),
                className: 'btn btn-primary'
            }, 'Retry')
        ]);
    }

    try {
    const [reportConfig, setReportConfig] = React.useState({
        timeRange: '30d',
        properties: [],
        metrics: ['revenue', 'occupancy', 'maintenance', 'expenses'],
        chartTypes: {
            revenue: 'line',
            occupancy: 'area',
            maintenance: 'bar',
            expenses: 'pie'
        },
        granularity: 'daily', // daily, weekly, monthly
        compareMode: false,
        comparePeriod: '30d',
        filters: {
            propertyTypes: [],
            unitTypes: [],
            tenant_status: 'all'
        }
    });

    const [customDashboard, setCustomDashboard] = React.useState({
        layout: 'grid',
        widgets: [
            { id: 'revenue-trend', type: 'line-chart', position: { x: 0, y: 0, w: 6, h: 4 }, title: 'Revenue Trend' },
            { id: 'occupancy-rate', type: 'gauge', position: { x: 6, y: 0, w: 3, h: 4 }, title: 'Occupancy Rate' },
            { id: 'maintenance-costs', type: 'bar-chart', position: { x: 9, y: 0, w: 3, h: 4 }, title: 'Maintenance Costs' },
            { id: 'property-performance', type: 'heatmap', position: { x: 0, y: 4, w: 6, h: 4 }, title: 'Property Performance' },
            { id: 'financial-summary', type: 'kpi-grid', position: { x: 6, y: 4, w: 6, h: 4 }, title: 'Financial KPIs' }
        ]
    });

    const [isCustomizing, setIsCustomizing] = React.useState(false);
    const [selectedWidget, setSelectedWidget] = React.useState(null);
    const [viewMode, setViewMode] = React.useState('dashboard'); // dashboard, builder, analytics

    // Generate comprehensive mock data
    const generateReportingData = () => {
        const properties = ['Sunset Apartments', 'Downtown Plaza', 'Garden Complex', 'Riverside Tower'];
        const currentDate = new Date();
        const data = {
            revenue: [],
            occupancy: [],
            maintenance: [],
            expenses: [],
            propertyPerformance: {},
            kpis: {}
        };

        // Generate time series data
        for (let i = 29; i >= 0; i--) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() - i);
            
            data.revenue.push({
                date: date.toISOString().split('T')[0],
                value: 45000 + Math.random() * 15000,
                collections: 42000 + Math.random() * 12000,
                projected: 47000 + Math.random() * 8000
            });

            data.occupancy.push({
                date: date.toISOString().split('T')[0],
                rate: 0.85 + Math.random() * 0.1,
                physical: 0.88 + Math.random() * 0.08,
                economic: 0.82 + Math.random() * 0.12
            });

            data.maintenance.push({
                date: date.toISOString().split('T')[0],
                emergency: Math.random() * 2000,
                routine: Math.random() * 3000,
                preventive: Math.random() * 1500,
                capital: Math.random() * 5000
            });

            data.expenses.push({
                date: date.toISOString().split('T')[0],
                utilities: 3000 + Math.random() * 1000,
                maintenance: 2500 + Math.random() * 1500,
                management: 4000 + Math.random() * 500,
                insurance: 1200 + Math.random() * 300,
                taxes: 2800 + Math.random() * 700,
                marketing: 800 + Math.random() * 400
            });
        }

        // Property performance matrix
        properties.forEach(property => {
            data.propertyPerformance[property] = {
                revenue: 0.85 + Math.random() * 0.2,
                occupancy: 0.80 + Math.random() * 0.15,
                maintenance: 0.70 + Math.random() * 0.25,
                satisfaction: 0.75 + Math.random() * 0.20,
                noi: 0.82 + Math.random() * 0.18
            };
        });

        // KPI calculations
        const latestRevenue = data.revenue[data.revenue.length - 1];
        const latestOccupancy = data.occupancy[data.occupancy.length - 1];
        const totalMaintenance = data.maintenance[data.maintenance.length - 1];
        
        data.kpis = {
            totalRevenue: latestRevenue.value,
            revenueGrowth: 0.034,
            occupancyRate: latestOccupancy.rate,
            occupancyChange: 0.025,
            avgRent: 2350,
            rentGrowth: 0.048,
            noi: latestRevenue.value * 0.65,
            noiMargin: 0.651,
            maintenanceCosts: Object.values(totalMaintenance).reduce((a, b) => a + b, 0),
            maintenancePerUnit: 127,
            vacancyLoss: 8750,
            concessions: 2100,
            collectionRate: 0.985,
            turnoverRate: 0.15,
            avgDaysVacant: 23,
            leadConversion: 0.28
        };

        return data;
    };

    const [reportData, setReportData] = React.useState(generateReportingData());

    // Update data when config changes
    React.useEffect(() => {
        setReportData(generateReportingData());
    }, [reportConfig]);

    // Header with Advanced Controls
    const ReportingHeader = () => {
        return React.createElement('div', { className: 'reporting-header-pro' }, [
            React.createElement('div', { key: 'title-section', className: 'header-title-section' }, [
                React.createElement('h1', { key: 'title' }, 'Analytics & Reporting'),
                React.createElement('p', { key: 'subtitle', className: 'header-subtitle' }, 
                    'Enterprise-grade analytics with real-time insights and custom dashboards'
                )
            ]),
            React.createElement('div', { key: 'controls', className: 'header-controls' }, [
                React.createElement('div', { key: 'view-mode', className: 'view-mode-selector' }, 
                    ['dashboard', 'builder', 'analytics'].map(mode =>
                        React.createElement('button', {
                            key: mode,
                            className: `mode-btn ${viewMode === mode ? 'active' : ''}`,
                            onClick: () => setViewMode(mode)
                        }, [
                            React.createElement('i', { 
                                key: 'icon',
                                className: `fas fa-${mode === 'dashboard' ? 'tachometer-alt' : mode === 'builder' ? 'file-alt' : 'chart-line'}`
                            }),
                            ' ',
                            mode === 'builder' ? 'Reports' : mode.charAt(0).toUpperCase() + mode.slice(1)
                        ])
                    )
                ),
                React.createElement('div', { key: 'time-controls', className: 'time-controls' }, [
                    React.createElement('select', {
                        key: 'range',
                        value: reportConfig.timeRange,
                        onChange: (e) => setReportConfig({ ...reportConfig, timeRange: e.target.value }),
                        className: 'time-range-select'
                    }, [
                        React.createElement('option', { key: '7d', value: '7d' }, 'Last 7 Days'),
                        React.createElement('option', { key: '30d', value: '30d' }, 'Last 30 Days'),
                        React.createElement('option', { key: '90d', value: '90d' }, 'Last 90 Days'),
                        React.createElement('option', { key: '1y', value: '1y' }, 'Last Year'),
                        React.createElement('option', { key: 'custom', value: 'custom' }, 'Custom Range')
                    ]),
                    React.createElement('button', {
                        key: 'compare',
                        className: `compare-btn ${reportConfig.compareMode ? 'active' : ''}`,
                        onClick: () => setReportConfig({ ...reportConfig, compareMode: !reportConfig.compareMode })
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-layer-group' }),
                        ' Compare'
                    ])
                ]),
                React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                    React.createElement('button', { key: 'refresh', className: 'btn-icon' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-sync-alt' })
                    ]),
                    React.createElement('button', { key: 'export', className: 'btn btn-secondary' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-download' }),
                        ' Export'
                    ]),
                    React.createElement('button', { key: 'save', className: 'btn btn-primary' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-save' }),
                        ' Save Dashboard'
                    ])
                ])
            ])
        ]);
    };

    // Advanced Filters Panel
    const FiltersPanel = () => {
        return React.createElement('div', { className: 'filters-panel-advanced' }, [
            React.createElement('div', { key: 'header', className: 'filters-header' }, [
                React.createElement('h3', { key: 'title' }, 'Advanced Filters'),
                React.createElement('button', { 
                    key: 'clear',
                    className: 'btn-text',
                    onClick: () => setReportConfig({ 
                        ...reportConfig, 
                        filters: { propertyTypes: [], unitTypes: [], tenant_status: 'all' }
                    })
                }, 'Clear All')
            ]),
            React.createElement('div', { key: 'content', className: 'filters-content' }, [
                React.createElement('div', { key: 'properties', className: 'filter-group' }, [
                    React.createElement('label', { key: 'label' }, 'Properties'),
                    React.createElement('div', { key: 'chips', className: 'filter-chips' }, 
                        ['Sunset Apartments', 'Downtown Plaza', 'Garden Complex', 'Riverside Tower'].map(property =>
                            React.createElement('button', {
                                key: property,
                                className: `filter-chip ${reportConfig.properties.includes(property) ? 'active' : ''}`,
                                onClick: () => {
                                    const newProperties = reportConfig.properties.includes(property)
                                        ? reportConfig.properties.filter(p => p !== property)
                                        : [...reportConfig.properties, property];
                                    setReportConfig({ ...reportConfig, properties: newProperties });
                                }
                            }, property)
                        )
                    )
                ]),
                React.createElement('div', { key: 'metrics', className: 'filter-group' }, [
                    React.createElement('label', { key: 'label' }, 'Metrics'),
                    React.createElement('div', { key: 'checkboxes', className: 'metric-checkboxes' }, 
                        [
                            { id: 'revenue', label: 'Revenue & Collections', icon: 'fa-dollar-sign' },
                            { id: 'occupancy', label: 'Occupancy Metrics', icon: 'fa-home' },
                            { id: 'maintenance', label: 'Maintenance Costs', icon: 'fa-tools' },
                            { id: 'expenses', label: 'Operating Expenses', icon: 'fa-chart-pie' },
                            { id: 'performance', label: 'Property Performance', icon: 'fa-tachometer-alt' },
                            { id: 'leasing', label: 'Leasing Activity', icon: 'fa-handshake' }
                        ].map(metric =>
                            React.createElement('label', { key: metric.id, className: 'metric-checkbox' }, [
                                React.createElement('input', {
                                    key: 'input',
                                    type: 'checkbox',
                                    checked: reportConfig.metrics.includes(metric.id),
                                    onChange: (e) => {
                                        const newMetrics = e.target.checked
                                            ? [...reportConfig.metrics, metric.id]
                                            : reportConfig.metrics.filter(m => m !== metric.id);
                                        setReportConfig({ ...reportConfig, metrics: newMetrics });
                                    }
                                }),
                                React.createElement('i', { key: 'icon', className: `fas ${metric.icon}` }),
                                React.createElement('span', { key: 'label' }, metric.label)
                            ])
                        )
                    )
                ]),
                React.createElement('div', { key: 'granularity', className: 'filter-group' }, [
                    React.createElement('label', { key: 'label' }, 'Granularity'),
                    React.createElement('div', { key: 'buttons', className: 'granularity-buttons' }, 
                        ['daily', 'weekly', 'monthly'].map(gran =>
                            React.createElement('button', {
                                key: gran,
                                className: `granularity-btn ${reportConfig.granularity === gran ? 'active' : ''}`,
                                onClick: () => setReportConfig({ ...reportConfig, granularity: gran })
                            }, gran.charAt(0).toUpperCase() + gran.slice(1))
                        )
                    )
                ])
            ])
        ]);
    };

    // Revenue Chart Component
    const RevenueChart = () => {
        const chartData = reportData.revenue.slice(-30);
        const maxValue = Math.max(...chartData.map(d => Math.max(d.value, d.collections, d.projected)));
        const svgWidth = 800;
        const svgHeight = 300;
        const margin = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = svgWidth - margin.left - margin.right;
        const chartHeight = svgHeight - margin.top - margin.bottom;

        const createPath = (data, valueKey) => {
            return data.map((d, i) => {
                const x = (i / (data.length - 1)) * chartWidth;
                const y = chartHeight - (d[valueKey] / maxValue) * chartHeight;
                return `${i === 0 ? 'M' : 'L'} ${x + margin.left} ${y + margin.top}`;
            }).join(' ');
        };

        return React.createElement('div', { className: 'chart-widget revenue-chart' }, [
            React.createElement('div', { key: 'header', className: 'chart-header' }, [
                React.createElement('h3', { key: 'title' }, 'Revenue Analytics'),
                React.createElement('div', { key: 'legend', className: 'chart-legend' }, [
                    React.createElement('span', { key: 'actual', className: 'legend-item actual' }, [
                        React.createElement('div', { key: 'dot', className: 'legend-dot' }),
                        'Actual Revenue'
                    ]),
                    React.createElement('span', { key: 'collections', className: 'legend-item collections' }, [
                        React.createElement('div', { key: 'dot', className: 'legend-dot' }),
                        'Collections'
                    ]),
                    React.createElement('span', { key: 'projected', className: 'legend-item projected' }, [
                        React.createElement('div', { key: 'dot', className: 'legend-dot' }),
                        'Projected'
                    ])
                ])
            ]),
            React.createElement('svg', { key: 'chart', width: svgWidth, height: svgHeight, className: 'revenue-svg' }, [
                // Grid lines
                ...Array.from({ length: 6 }, (_, i) => 
                    React.createElement('line', {
                        key: `grid-${i}`,
                        x1: margin.left,
                        y1: margin.top + (i * chartHeight / 5),
                        x2: svgWidth - margin.right,
                        y2: margin.top + (i * chartHeight / 5),
                        stroke: '#f1f5f9',
                        strokeWidth: 1
                    })
                ),
                // Actual revenue line
                React.createElement('path', {
                    key: 'actual',
                    d: createPath(chartData, 'value'),
                    fill: 'none',
                    stroke: '#3b82f6',
                    strokeWidth: 3,
                    className: 'revenue-line'
                }),
                // Collections line
                React.createElement('path', {
                    key: 'collections',
                    d: createPath(chartData, 'collections'),
                    fill: 'none',
                    stroke: '#10b981',
                    strokeWidth: 2,
                    strokeDasharray: '5,5'
                }),
                // Projected line
                React.createElement('path', {
                    key: 'projected',
                    d: createPath(chartData, 'projected'),
                    fill: 'none',
                    stroke: '#f59e0b',
                    strokeWidth: 2,
                    strokeDasharray: '2,3'
                }),
                // Data points
                ...chartData.map((d, i) => {
                    const x = (i / (chartData.length - 1)) * chartWidth + margin.left;
                    const y = chartHeight - (d.value / maxValue) * chartHeight + margin.top;
                    return React.createElement('circle', {
                        key: `point-${i}`,
                        cx: x,
                        cy: y,
                        r: 4,
                        fill: '#3b82f6',
                        className: 'data-point'
                    });
                })
            ])
        ]);
    };

    // Occupancy Gauge Component
    const OccupancyGauge = () => {
        const rate = reportData.kpis.occupancyRate;
        const radius = 80;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference * (1 - rate);

        return React.createElement('div', { className: 'chart-widget occupancy-gauge' }, [
            React.createElement('div', { key: 'header', className: 'chart-header' }, [
                React.createElement('h3', { key: 'title' }, 'Occupancy Rate')
            ]),
            React.createElement('div', { key: 'gauge', className: 'gauge-container' }, [
                React.createElement('svg', { width: 200, height: 200, className: 'gauge-svg' }, [
                    React.createElement('circle', {
                        key: 'bg',
                        cx: 100,
                        cy: 100,
                        r: radius,
                        fill: 'none',
                        stroke: '#f1f5f9',
                        strokeWidth: 12
                    }),
                    React.createElement('circle', {
                        key: 'progress',
                        cx: 100,
                        cy: 100,
                        r: radius,
                        fill: 'none',
                        stroke: rate > 0.9 ? '#10b981' : rate > 0.8 ? '#f59e0b' : '#ef4444',
                        strokeWidth: 12,
                        strokeLinecap: 'round',
                        strokeDasharray,
                        strokeDashoffset,
                        transform: 'rotate(-90 100 100)',
                        className: 'gauge-progress'
                    })
                ]),
                React.createElement('div', { key: 'value', className: 'gauge-value' }, [
                    React.createElement('span', { key: 'percentage', className: 'gauge-percentage' }, 
                        Math.round(rate * 100) + '%'
                    ),
                    React.createElement('span', { key: 'label', className: 'gauge-label' }, 'Occupied')
                ])
            ])
        ]);
    };

    // KPI Grid Component
    const KPIGrid = () => {
        const kpis = [
            { key: 'totalRevenue', label: 'Total Revenue', value: reportData.kpis.totalRevenue, format: 'currency', trend: reportData.kpis.revenueGrowth },
            { key: 'avgRent', label: 'Average Rent', value: reportData.kpis.avgRent, format: 'currency', trend: reportData.kpis.rentGrowth },
            { key: 'noi', label: 'Net Operating Income', value: reportData.kpis.noi, format: 'currency', trend: 0.023 },
            { key: 'collectionRate', label: 'Collection Rate', value: reportData.kpis.collectionRate, format: 'percentage', trend: 0.012 },
            { key: 'maintenanceCosts', label: 'Maintenance Costs', value: reportData.kpis.maintenanceCosts, format: 'currency', trend: -0.045 },
            { key: 'turnoverRate', label: 'Turnover Rate', value: reportData.kpis.turnoverRate, format: 'percentage', trend: -0.018 }
        ];

        const formatValue = (value, format) => {
            if (format === 'currency') {
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
            } else if (format === 'percentage') {
                return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1 }).format(value);
            }
            return value.toLocaleString();
        };

        return React.createElement('div', { className: 'chart-widget kpi-grid' }, [
            React.createElement('div', { key: 'header', className: 'chart-header' }, [
                React.createElement('h3', { key: 'title' }, 'Key Performance Indicators')
            ]),
            React.createElement('div', { key: 'grid', className: 'kpi-grid-container' }, 
                kpis.map(kpi =>
                    React.createElement('div', { key: kpi.key, className: 'kpi-card' }, [
                        React.createElement('div', { key: 'value', className: 'kpi-value' }, 
                            formatValue(kpi.value, kpi.format)
                        ),
                        React.createElement('div', { key: 'label', className: 'kpi-label' }, kpi.label),
                        React.createElement('div', { key: 'trend', className: `kpi-trend ${kpi.trend >= 0 ? 'positive' : 'negative'}` }, [
                            React.createElement('i', { 
                                key: 'icon',
                                className: `fas fa-arrow-${kpi.trend >= 0 ? 'up' : 'down'}`
                            }),
                            ' ',
                            Math.abs(kpi.trend * 100).toFixed(1) + '%'
                        ])
                    ])
                )
            )
        ]);
    };

    // Property Performance Heatmap
    const PropertyHeatmap = () => {
        const properties = Object.keys(reportData.propertyPerformance);
        const metrics = ['revenue', 'occupancy', 'maintenance', 'satisfaction', 'noi'];

        return React.createElement('div', { className: 'chart-widget property-heatmap' }, [
            React.createElement('div', { key: 'header', className: 'chart-header' }, [
                React.createElement('h3', { key: 'title' }, 'Property Performance Matrix')
            ]),
            React.createElement('div', { key: 'heatmap', className: 'heatmap-container' }, [
                React.createElement('div', { key: 'labels', className: 'heatmap-labels' }, 
                    metrics.map(metric =>
                        React.createElement('div', { key: metric, className: 'metric-label' }, 
                            metric.charAt(0).toUpperCase() + metric.slice(1)
                        )
                    )
                ),
                React.createElement('div', { key: 'grid', className: 'heatmap-grid' }, 
                    properties.map(property =>
                        React.createElement('div', { key: property, className: 'property-row' }, [
                            React.createElement('div', { key: 'name', className: 'property-name' }, property),
                            ...metrics.map(metric => {
                                const value = reportData.propertyPerformance[property][metric];
                                const intensity = Math.round(value * 100);
                                return React.createElement('div', {
                                    key: metric,
                                    className: 'heatmap-cell',
                                    style: {
                                        backgroundColor: `hsl(${value > 0.8 ? 120 : value > 0.6 ? 60 : 0}, 70%, ${85 - intensity * 0.3}%)`,
                                        color: intensity > 50 ? 'white' : 'black'
                                    },
                                    title: `${property} ${metric}: ${Math.round(value * 100)}%`
                                }, Math.round(value * 100) + '%');
                            })
                        ])
                    )
                )
            ])
        ]);
    };

    // Dashboard View
    const DashboardView = () => {
        return React.createElement('div', { className: 'dashboard-view' }, [
            React.createElement('div', { key: 'filters', className: 'dashboard-sidebar' }, [
                FiltersPanel()
            ]),
            React.createElement('div', { key: 'content', className: 'dashboard-content' }, [
                React.createElement('div', { key: 'row1', className: 'dashboard-row' }, [
                    React.createElement('div', { key: 'revenue', className: 'widget-large' }, [
                        RevenueChart()
                    ]),
                    React.createElement('div', { key: 'occupancy', className: 'widget-small' }, [
                        OccupancyGauge()
                    ])
                ]),
                React.createElement('div', { key: 'row2', className: 'dashboard-row' }, [
                    React.createElement('div', { key: 'kpis', className: 'widget-large' }, [
                        KPIGrid()
                    ]),
                    React.createElement('div', { key: 'heatmap', className: 'widget-large' }, [
                        PropertyHeatmap()
                    ])
                ])
            ])
        ]);
    };

    // Essential Reports Components
    const RentRollReport = () => {
        const rentRollData = [
            { unit: '101', tenant: 'Sarah Johnson', rent: 2400, lease_start: '2024-01-15', lease_end: '2024-12-31', status: 'Current', balance: 0 },
            { unit: '102', tenant: 'Michael Chen', rent: 2350, lease_start: '2023-11-01', lease_end: '2024-10-31', status: 'Current', balance: 0 },
            { unit: '103', tenant: 'Emily Davis', rent: 2500, lease_start: '2024-03-01', lease_end: '2025-02-28', status: 'Current', balance: 0 },
            { unit: '104', tenant: 'Vacant', rent: 2450, lease_start: null, lease_end: null, status: 'Vacant', balance: 0 },
            { unit: '105', tenant: 'David Wilson', rent: 2300, lease_start: '2024-02-15', lease_end: '2025-01-31', status: 'Late', balance: 2300 },
            { unit: '201', tenant: 'Lisa Garcia', rent: 2600, lease_start: '2023-12-01', lease_end: '2024-11-30', status: 'Current', balance: 0 },
            { unit: '202', tenant: 'James Rodriguez', rent: 2550, lease_start: '2024-04-01', lease_end: '2025-03-31', status: 'Current', balance: 0 },
            { unit: '203', tenant: 'Vacant', rent: 2500, lease_start: null, lease_end: null, status: 'Vacant', balance: 0 },
            { unit: '204', tenant: 'Amanda White', rent: 2450, lease_start: '2024-01-01', lease_end: '2024-12-31', status: 'Notice', balance: 0 },
            { unit: '205', tenant: 'Robert Taylor', rent: 2700, lease_start: '2023-09-15', lease_end: '2024-08-31', status: 'Current', balance: 0 }
        ];

        return React.createElement('div', { className: 'report-container rent-roll' }, [
            React.createElement('div', { key: 'header', className: 'report-header' }, [
                React.createElement('h2', { key: 'title' }, 'Rent Roll Report'),
                React.createElement('div', { key: 'summary', className: 'report-summary' }, [
                    React.createElement('span', { key: 'total' }, `Total Units: ${rentRollData.length}`),
                    React.createElement('span', { key: 'occupied' }, `Occupied: ${rentRollData.filter(r => r.status !== 'Vacant').length}`),
                    React.createElement('span', { key: 'revenue' }, `Monthly Revenue: $${rentRollData.filter(r => r.status !== 'Vacant').reduce((sum, r) => sum + r.rent, 0).toLocaleString()}`)
                ])
            ]),
            React.createElement('div', { key: 'table', className: 'report-table-container' }, [
                React.createElement('table', { className: 'report-table' }, [
                    React.createElement('thead', { key: 'head' }, [
                        React.createElement('tr', { key: 'row' }, [
                            React.createElement('th', { key: 'unit' }, 'Unit'),
                            React.createElement('th', { key: 'tenant' }, 'Tenant'),
                            React.createElement('th', { key: 'rent' }, 'Rent'),
                            React.createElement('th', { key: 'lease_start' }, 'Lease Start'),
                            React.createElement('th', { key: 'lease_end' }, 'Lease End'),
                            React.createElement('th', { key: 'status' }, 'Status'),
                            React.createElement('th', { key: 'balance' }, 'Balance')
                        ])
                    ]),
                    React.createElement('tbody', { key: 'body' }, 
                        rentRollData.map((row, index) =>
                            React.createElement('tr', { key: index, className: `status-${row.status.toLowerCase()}` }, [
                                React.createElement('td', { key: 'unit' }, row.unit),
                                React.createElement('td', { key: 'tenant' }, row.tenant),
                                React.createElement('td', { key: 'rent' }, `$${row.rent.toLocaleString()}`),
                                React.createElement('td', { key: 'lease_start' }, row.lease_start || '-'),
                                React.createElement('td', { key: 'lease_end' }, row.lease_end || '-'),
                                React.createElement('td', { key: 'status' }, [
                                    React.createElement('span', { className: `status-badge ${row.status.toLowerCase()}` }, row.status)
                                ]),
                                React.createElement('td', { key: 'balance' }, row.balance > 0 ? `$${row.balance.toLocaleString()}` : '$0')
                            ])
                        )
                    )
                ])
            ])
        ]);
    };

    const IncomeStatementReport = () => {
        const incomeData = {
            revenue: {
                rental_income: 24750,
                late_fees: 350,
                parking_fees: 1200,
                laundry_income: 450,
                other_income: 200
            },
            expenses: {
                management_fees: 2475,
                maintenance: 3200,
                utilities: 1800,
                insurance: 1200,
                property_taxes: 2100,
                marketing: 400,
                office_supplies: 150,
                legal_professional: 500
            }
        };

        const totalRevenue = Object.values(incomeData.revenue).reduce((sum, val) => sum + val, 0);
        const totalExpenses = Object.values(incomeData.expenses).reduce((sum, val) => sum + val, 0);
        const netIncome = totalRevenue - totalExpenses;

        return React.createElement('div', { className: 'report-container income-statement' }, [
            React.createElement('div', { key: 'header', className: 'report-header' }, [
                React.createElement('h2', { key: 'title' }, 'Income Statement'),
                React.createElement('div', { key: 'period', className: 'report-period' }, 'For the Month Ending: ' + new Date().toLocaleDateString())
            ]),
            React.createElement('div', { key: 'content', className: 'income-statement-content' }, [
                React.createElement('div', { key: 'revenue', className: 'income-section' }, [
                    React.createElement('h3', { key: 'title' }, 'Revenue'),
                    React.createElement('div', { key: 'items', className: 'income-items' }, 
                        Object.entries(incomeData.revenue).map(([key, value]) =>
                            React.createElement('div', { key, className: 'income-item' }, [
                                React.createElement('span', { key: 'label' }, key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
                                React.createElement('span', { key: 'value' }, `$${value.toLocaleString()}`)
                            ])
                        )
                    ),
                    React.createElement('div', { key: 'total', className: 'income-total' }, [
                        React.createElement('span', { key: 'label' }, 'Total Revenue'),
                        React.createElement('span', { key: 'value' }, `$${totalRevenue.toLocaleString()}`)
                    ])
                ]),
                React.createElement('div', { key: 'expenses', className: 'income-section' }, [
                    React.createElement('h3', { key: 'title' }, 'Expenses'),
                    React.createElement('div', { key: 'items', className: 'income-items' }, 
                        Object.entries(incomeData.expenses).map(([key, value]) =>
                            React.createElement('div', { key, className: 'income-item' }, [
                                React.createElement('span', { key: 'label' }, key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())),
                                React.createElement('span', { key: 'value' }, `$${value.toLocaleString()}`)
                            ])
                        )
                    ),
                    React.createElement('div', { key: 'total', className: 'income-total' }, [
                        React.createElement('span', { key: 'label' }, 'Total Expenses'),
                        React.createElement('span', { key: 'value' }, `$${totalExpenses.toLocaleString()}`)
                    ])
                ]),
                React.createElement('div', { key: 'net', className: 'net-income-section' }, [
                    React.createElement('div', { key: 'total', className: 'net-income-total' }, [
                        React.createElement('span', { key: 'label' }, 'Net Operating Income'),
                        React.createElement('span', { key: 'value', className: netIncome >= 0 ? 'positive' : 'negative' }, 
                            `$${netIncome.toLocaleString()}`
                        )
                    ])
                ])
            ])
        ]);
    };

    const DelinquencyReport = () => {
        const delinquencyData = [
            { unit: '105', tenant: 'David Wilson', amount: 2300, days: 15, category: '0-30', contact_attempts: 3, last_payment: '2024-06-15' },
            { unit: '304', tenant: 'Mark Johnson', amount: 4950, days: 45, category: '31-60', contact_attempts: 8, last_payment: '2024-05-01' },
            { unit: '207', tenant: 'Jennifer Brown', amount: 1150, days: 12, category: '0-30', contact_attempts: 2, last_payment: '2024-07-02' },
            { unit: '401', tenant: 'Carlos Martinez', amount: 7200, days: 78, category: '60+', contact_attempts: 12, last_payment: '2024-04-20' },
            { unit: '302', tenant: 'Angela Davis', amount: 2800, days: 38, category: '31-60', contact_attempts: 6, last_payment: '2024-05-15' }
        ];

        const totalDelinquent = delinquencyData.reduce((sum, row) => sum + row.amount, 0);

        return React.createElement('div', { className: 'report-container delinquency' }, [
            React.createElement('div', { key: 'header', className: 'report-header' }, [
                React.createElement('h2', { key: 'title' }, 'Delinquency Report'),
                React.createElement('div', { key: 'summary', className: 'delinquency-summary' }, [
                    React.createElement('div', { key: 'total', className: 'summary-item' }, [
                        React.createElement('span', { key: 'label' }, 'Total Delinquent'),
                        React.createElement('span', { key: 'value', className: 'amount-large' }, `$${totalDelinquent.toLocaleString()}`)
                    ]),
                    React.createElement('div', { key: 'count', className: 'summary-item' }, [
                        React.createElement('span', { key: 'label' }, 'Delinquent Units'),
                        React.createElement('span', { key: 'value' }, delinquencyData.length)
                    ])
                ])
            ]),
            React.createElement('div', { key: 'table', className: 'report-table-container' }, [
                React.createElement('table', { className: 'report-table' }, [
                    React.createElement('thead', { key: 'head' }, [
                        React.createElement('tr', { key: 'row' }, [
                            React.createElement('th', { key: 'unit' }, 'Unit'),
                            React.createElement('th', { key: 'tenant' }, 'Tenant'),
                            React.createElement('th', { key: 'amount' }, 'Amount'),
                            React.createElement('th', { key: 'days' }, 'Days Late'),
                            React.createElement('th', { key: 'category' }, 'Category'),
                            React.createElement('th', { key: 'contacts' }, 'Contact Attempts'),
                            React.createElement('th', { key: 'last_payment' }, 'Last Payment')
                        ])
                    ]),
                    React.createElement('tbody', { key: 'body' }, 
                        delinquencyData.map((row, index) =>
                            React.createElement('tr', { key: index, className: `category-${row.category.replace(/[^a-zA-Z0-9]/g, '')}` }, [
                                React.createElement('td', { key: 'unit' }, row.unit),
                                React.createElement('td', { key: 'tenant' }, row.tenant),
                                React.createElement('td', { key: 'amount', className: 'amount' }, `$${row.amount.toLocaleString()}`),
                                React.createElement('td', { key: 'days' }, row.days),
                                React.createElement('td', { key: 'category' }, [
                                    React.createElement('span', { className: `category-badge ${row.category.replace(/[^a-zA-Z0-9]/g, '')}` }, row.category)
                                ]),
                                React.createElement('td', { key: 'contacts' }, row.contact_attempts),
                                React.createElement('td', { key: 'last_payment' }, row.last_payment)
                            ])
                        )
                    )
                ])
            ])
        ]);
    };

    const OccupancyReport = () => {
        const occupancyData = {
            current_month: {
                total_units: 10,
                occupied: 8,
                vacant: 2,
                rate: 80,
                vacant_units: ['104', '203']
            },
            trends: [
                { month: 'Jan 2024', occupied: 9, rate: 90 },
                { month: 'Feb 2024', occupied: 8, rate: 80 },
                { month: 'Mar 2024', occupied: 9, rate: 90 },
                { month: 'Apr 2024', occupied: 8, rate: 80 },
                { month: 'May 2024', occupied: 7, rate: 70 },
                { month: 'Jun 2024', occupied: 8, rate: 80 }
            ]
        };

        return React.createElement('div', { className: 'report-container occupancy' }, [
            React.createElement('div', { key: 'header', className: 'report-header' }, [
                React.createElement('h2', { key: 'title' }, 'Occupancy Report'),
                React.createElement('div', { key: 'current', className: 'occupancy-current' }, [
                    React.createElement('div', { key: 'rate', className: 'occupancy-rate' }, [
                        React.createElement('span', { key: 'value', className: 'rate-value' }, `${occupancyData.current_month.rate}%`),
                        React.createElement('span', { key: 'label' }, 'Current Occupancy')
                    ]),
                    React.createElement('div', { key: 'units', className: 'unit-breakdown' }, [
                        React.createElement('span', { key: 'occupied' }, `${occupancyData.current_month.occupied} Occupied`),
                        React.createElement('span', { key: 'vacant' }, `${occupancyData.current_month.vacant} Vacant`)
                    ])
                ])
            ]),
            React.createElement('div', { key: 'content', className: 'occupancy-content' }, [
                React.createElement('div', { key: 'vacant', className: 'vacant-units' }, [
                    React.createElement('h3', { key: 'title' }, 'Vacant Units'),
                    React.createElement('div', { key: 'list', className: 'vacant-list' }, 
                        occupancyData.current_month.vacant_units.map(unit =>
                            React.createElement('div', { key: unit, className: 'vacant-unit' }, [
                                React.createElement('span', { key: 'unit' }, `Unit ${unit}`),
                                React.createElement('span', { key: 'status' }, 'Available')
                            ])
                        )
                    )
                ]),
                React.createElement('div', { key: 'trends', className: 'occupancy-trends' }, [
                    React.createElement('h3', { key: 'title' }, '6-Month Trend'),
                    React.createElement('div', { key: 'chart', className: 'trend-chart' }, 
                        occupancyData.trends.map(trend =>
                            React.createElement('div', { key: trend.month, className: 'trend-bar' }, [
                                React.createElement('div', { key: 'bar', className: 'bar', style: { height: `${trend.rate}%` } }),
                                React.createElement('span', { key: 'month' }, trend.month.split(' ')[0]),
                                React.createElement('span', { key: 'rate' }, `${trend.rate}%`)
                            ])
                        )
                    )
                ])
            ])
        ]);
    };

    const MaintenanceSummaryReport = () => {
        const maintenanceData = {
            summary: {
                total_requests: 47,
                completed: 32,
                in_progress: 12,
                scheduled: 3,
                total_cost: 8750
            },
            by_category: [
                { category: 'Plumbing', count: 15, cost: 3200, avg_time: 2.5 },
                { category: 'Electrical', count: 8, cost: 2100, avg_time: 3.2 },
                { category: 'HVAC', count: 12, cost: 2800, avg_time: 4.1 },
                { category: 'Appliances', count: 7, cost: 450, avg_time: 1.8 },
                { category: 'General', count: 5, cost: 200, avg_time: 1.2 }
            ],
            recent_requests: [
                { unit: '101', category: 'Plumbing', description: 'Leaky faucet in kitchen', status: 'Completed', cost: 125, date: '2024-07-10' },
                { unit: '205', category: 'HVAC', description: 'AC not cooling properly', status: 'In Progress', cost: 0, date: '2024-07-12' },
                { unit: '304', category: 'Electrical', description: 'Outlet not working', status: 'Scheduled', cost: 0, date: '2024-07-13' }
            ]
        };

        return React.createElement('div', { className: 'report-container maintenance' }, [
            React.createElement('div', { key: 'header', className: 'report-header' }, [
                React.createElement('h2', { key: 'title' }, 'Maintenance Summary'),
                React.createElement('div', { key: 'summary', className: 'maintenance-summary' }, [
                    React.createElement('div', { key: 'total', className: 'summary-stat' }, [
                        React.createElement('span', { key: 'value' }, maintenanceData.summary.total_requests),
                        React.createElement('span', { key: 'label' }, 'Total Requests')
                    ]),
                    React.createElement('div', { key: 'completed', className: 'summary-stat' }, [
                        React.createElement('span', { key: 'value' }, maintenanceData.summary.completed),
                        React.createElement('span', { key: 'label' }, 'Completed')
                    ]),
                    React.createElement('div', { key: 'cost', className: 'summary-stat' }, [
                        React.createElement('span', { key: 'value' }, `$${maintenanceData.summary.total_cost.toLocaleString()}`),
                        React.createElement('span', { key: 'label' }, 'Total Cost')
                    ])
                ])
            ]),
            React.createElement('div', { key: 'content', className: 'maintenance-content' }, [
                React.createElement('div', { key: 'categories', className: 'category-breakdown' }, [
                    React.createElement('h3', { key: 'title' }, 'By Category'),
                    React.createElement('div', { key: 'table', className: 'category-table' }, 
                        maintenanceData.by_category.map(cat =>
                            React.createElement('div', { key: cat.category, className: 'category-row' }, [
                                React.createElement('span', { key: 'category' }, cat.category),
                                React.createElement('span', { key: 'count' }, `${cat.count} requests`),
                                React.createElement('span', { key: 'cost' }, `$${cat.cost.toLocaleString()}`),
                                React.createElement('span', { key: 'time' }, `${cat.avg_time}h avg`)
                            ])
                        )
                    )
                ]),
                React.createElement('div', { key: 'recent', className: 'recent-requests' }, [
                    React.createElement('h3', { key: 'title' }, 'Recent Requests'),
                    React.createElement('div', { key: 'list', className: 'request-list' }, 
                        maintenanceData.recent_requests.map((req, index) =>
                            React.createElement('div', { key: index, className: 'request-item' }, [
                                React.createElement('div', { key: 'info', className: 'request-info' }, [
                                    React.createElement('span', { key: 'unit', className: 'unit' }, `Unit ${req.unit}`),
                                    React.createElement('span', { key: 'category', className: 'category' }, req.category),
                                    React.createElement('span', { key: 'description' }, req.description)
                                ]),
                                React.createElement('div', { key: 'status', className: 'request-status' }, [
                                    React.createElement('span', { key: 'badge', className: `status-badge ${req.status.toLowerCase().replace(' ', '-')}` }, req.status),
                                    React.createElement('span', { key: 'cost' }, req.cost > 0 ? `$${req.cost}` : 'Pending'),
                                    React.createElement('span', { key: 'date' }, req.date)
                                ])
                            ])
                        )
                    )
                ])
            ])
        ]);
    };

    // Reports View
    const ReportsView = () => {
        const [selectedReport, setSelectedReport] = React.useState('rent-roll');
        
        const reports = [
            { id: 'rent-roll', name: 'Rent Roll', icon: 'fa-list', component: RentRollReport },
            { id: 'income-statement', name: 'Income Statement', icon: 'fa-chart-line', component: IncomeStatementReport },
            { id: 'delinquency', name: 'Delinquency Report', icon: 'fa-exclamation-triangle', component: DelinquencyReport },
            { id: 'occupancy', name: 'Occupancy Report', icon: 'fa-home', component: OccupancyReport },
            { id: 'maintenance', name: 'Maintenance Summary', icon: 'fa-tools', component: MaintenanceSummaryReport }
        ];

        const selectedReportComponent = reports.find(r => r.id === selectedReport)?.component;

        return React.createElement('div', { className: 'reports-view' }, [
            React.createElement('div', { key: 'sidebar', className: 'reports-sidebar' }, [
                React.createElement('h3', { key: 'title' }, 'Essential Reports'),
                React.createElement('div', { key: 'list', className: 'reports-list' }, 
                    reports.map(report =>
                        React.createElement('button', {
                            key: report.id,
                            className: `report-item ${selectedReport === report.id ? 'active' : ''}`,
                            onClick: () => setSelectedReport(report.id)
                        }, [
                            React.createElement('i', { key: 'icon', className: `fas ${report.icon}` }),
                            React.createElement('span', { key: 'name' }, report.name)
                        ])
                    )
                )
            ]),
            React.createElement('div', { key: 'content', className: 'reports-content' }, [
                selectedReportComponent && React.createElement(selectedReportComponent, { key: selectedReport })
            ])
        ]);
    };

    // Main Render
    return React.createElement('div', { className: 'world-class-reporting' }, [
        ReportingHeader(),
        React.createElement('div', { key: 'content', className: 'reporting-content' }, [
            viewMode === 'dashboard' && DashboardView(),
            viewMode === 'builder' && ReportsView(),
            viewMode === 'analytics' && React.createElement('div', { className: 'analytics-view' }, 'Advanced Analytics Coming Soon')
        ])
    ]);
    
    } catch (err) {
        setError(err);
        return React.createElement('div', { className: 'error-boundary-reporting' }, [
            React.createElement('h2', { key: 'title' }, 'Reports Error'),
            React.createElement('p', { key: 'message' }, 'There was an error rendering the reports. Please try again.'),
            React.createElement('button', { 
                key: 'retry',
                onClick: () => setError(null),
                className: 'btn btn-primary'
            }, 'Retry')
        ]);
    }
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.WorldClassReporting = WorldClassReporting;