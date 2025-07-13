// FinancialDashboard.jsx - Financial Dashboard with Real-time KPIs
const FinancialDashboard = (() => {
    const ComponentFactory = {
        createComponent: (name, options = {}) => (componentFunc) => {
            const Component = (props) => {
                const helpers = {
                    useAsyncState: (asyncFunc, deps = []) => {
                        const [state, setState] = React.useState({ loading: true, data: null, error: null });
                        
                        React.useEffect(() => {
                            let mounted = true;
                            const fetchData = async () => {
                                try {
                                    setState({ loading: true, data: null, error: null });
                                    // Simulate API call
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    const data = await asyncFunc();
                                    if (mounted) setState({ loading: false, data, error: null });
                                } catch (error) {
                                    if (mounted) setState({ loading: false, data: null, error });
                                }
                            };
                            fetchData();
                            return () => { mounted = false; };
                        }, deps);
                        
                        return state;
                    },
                    formatCurrency: (amount) => {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(amount || 0);
                    },
                    formatPercentage: (value) => {
                        return new Intl.NumberFormat('en-US', {
                            style: 'percent',
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        }).format(value || 0);
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('FinancialDashboard', {})((props, helpers) => {
        const { period, basisType, entity, property } = props;
        const { useAsyncState, formatCurrency, formatPercentage } = helpers;

        const dashboardData = useAsyncState(async () => {
            // Simulate API response with sample data
            return {
                noi: 125000,
                noiChange: 0.08,
                capRate: 0.075,
                capRateChange: 0.002,
                dscr: 1.35,
                dscrChange: 0.05,
                occupancy: 0.945,
                occupancyChange: 0.02,
                freeCashFlow: 85000,
                cashFlowChange: 0.12,
                arAging90Plus: 12500,
                arAgingChange: -0.15,
                noiTrend: [
                    { month: 'Aug', amount: 110000 },
                    { month: 'Sep', amount: 115000 },
                    { month: 'Oct', amount: 118000 },
                    { month: 'Nov', amount: 120000 },
                    { month: 'Dec', amount: 125000 }
                ],
                cashFlowWaterfall: [
                    { category: 'Revenue', amount: 200000 },
                    { category: 'Operating Expenses', amount: -75000 },
                    { category: 'NOI', amount: 125000 },
                    { category: 'Debt Service', amount: -40000 },
                    { category: 'Free Cash Flow', amount: 85000 }
                ],
                expenseBreakdown: [
                    { category: 'Property Management', amount: 20000 },
                    { category: 'Maintenance', amount: 15000 },
                    { category: 'Utilities', amount: 12000 },
                    { category: 'Insurance', amount: 10000 },
                    { category: 'Property Tax', amount: 8000 },
                    { category: 'Other', amount: 10000 }
                ],
                recentEntries: [
                    { id: 1, je_number: 'JE202501-0001', date: '2025-01-15', description: 'January Rent Collection', amount: 125000 },
                    { id: 2, je_number: 'JE202501-0002', date: '2025-01-10', description: 'Property Management Fee', amount: 20000 },
                    { id: 3, je_number: 'JE202501-0003', date: '2025-01-08', description: 'Maintenance Expenses', amount: 5500 }
                ],
                alerts: [
                    { id: 1, type: 'critical', title: 'Large AR Balance', message: '3 tenants with balances over 90 days' },
                    { id: 2, type: 'warning', title: 'Budget Variance', message: 'Maintenance expenses 15% over budget' },
                    { id: 3, type: 'info', title: 'Bank Reconciliation', message: '5 unmatched transactions pending review' }
                ]
            };
        }, [period, basisType, entity, property]);

        if (dashboardData.loading) {
            return React.createElement('div', { className: 'financial-loading' },
                React.createElement('div', { className: 'loading-spinner' }),
                React.createElement('div', {}, 'Loading financial dashboard...')
            );
        }

        const data = dashboardData.data || {};

        return React.createElement('div', { className: 'financial-dashboard' }, [
            // Key Performance Indicators
            React.createElement('div', { key: 'kpis', className: 'financial-kpi-grid' }, [
                React.createElement(FinancialKPICard, {
                    key: 'noi',
                    title: 'Net Operating Income',
                    value: formatCurrency(data.noi || 0),
                    change: data.noiChange || 0,
                    icon: 'fa-chart-line',
                    color: 'primary'
                }),
                
                React.createElement(FinancialKPICard, {
                    key: 'cap-rate',
                    title: 'Cap Rate',
                    value: formatPercentage(data.capRate || 0),
                    change: data.capRateChange || 0,
                    icon: 'fa-percentage',
                    color: 'success'
                }),
                
                React.createElement(FinancialKPICard, {
                    key: 'dscr',
                    title: 'DSCR',
                    value: (data.dscr || 0).toFixed(2) + 'x',
                    change: data.dscrChange || 0,
                    icon: 'fa-shield-alt',
                    color: data.dscr >= 1.25 ? 'success' : 'warning'
                }),
                
                React.createElement(FinancialKPICard, {
                    key: 'occupancy',
                    title: 'Economic Occupancy',
                    value: formatPercentage(data.occupancy || 0),
                    change: data.occupancyChange || 0,
                    icon: 'fa-home',
                    color: 'info'
                }),
                
                React.createElement(FinancialKPICard, {
                    key: 'cash-flow',
                    title: 'Free Cash Flow',
                    value: formatCurrency(data.freeCashFlow || 0),
                    change: data.cashFlowChange || 0,
                    icon: 'fa-money-bill-wave',
                    color: data.freeCashFlow >= 0 ? 'success' : 'danger'
                }),
                
                React.createElement(FinancialKPICard, {
                    key: 'ar-aging',
                    title: 'AR > 90 Days',
                    value: formatCurrency(data.arAging90Plus || 0),
                    change: data.arAgingChange || 0,
                    icon: 'fa-exclamation-triangle',
                    color: 'warning'
                })
            ]),

            // Financial Charts Section
            React.createElement('div', { key: 'charts', className: 'financial-charts-section' }, [
                React.createElement(NOITrendChart, {
                    key: 'noi-trend',
                    data: data.noiTrend || [],
                    period: period
                }),
                
                React.createElement(ExpenseCategoryChart, {
                    key: 'expense-breakdown',
                    data: data.expenseBreakdown || [],
                    period: period
                })
            ]),

            // Recent Transactions & Alerts
            React.createElement('div', { key: 'activity', className: 'financial-activity-section' }, [
                React.createElement(RecentJournalEntries, {
                    key: 'recent-entries',
                    entries: data.recentEntries || [],
                    limit: 10
                }),
                
                React.createElement(FinancialAlerts, {
                    key: 'alerts',
                    alerts: data.alerts || [],
                    severity: ['critical', 'warning', 'info']
                })
            ])
        ]);
    });
})();

// Financial KPI Card Component
const FinancialKPICard = (() => {
    const ComponentFactory = {
        createComponent: (name) => (componentFunc) => {
            const Component = (props) => {
                const helpers = {
                    formatPercentage: (value) => {
                        return new Intl.NumberFormat('en-US', {
                            style: 'percent',
                            minimumFractionDigits: 1,
                            maximumFractionDigits: 1
                        }).format(value || 0);
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('FinancialKPICard')((props, helpers) => {
        const { title, value, change, icon, color } = props;
        const { formatPercentage } = helpers;

        const changeColor = change >= 0 ? 'success' : 'danger';
        const changeIcon = change >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';

        return React.createElement('div', { className: `financial-kpi-card kpi-${color}` }, [
            React.createElement('div', { key: 'header', className: 'kpi-header' }, [
                React.createElement('i', { key: 'icon', className: `fas ${icon} kpi-icon` }),
                React.createElement('h3', { key: 'title', className: 'kpi-title' }, title)
            ]),
            
            React.createElement('div', { key: 'value', className: 'kpi-value' }, value),
            
            React.createElement('div', { key: 'change', className: `kpi-change change-${changeColor}` }, [
                React.createElement('i', { key: 'change-icon', className: `fas ${changeIcon}` }),
                React.createElement('span', { key: 'change-value' }, `${formatPercentage(Math.abs(change))} vs last period`)
            ])
        ]);
    });
})();

// NOI Trend Chart Component
const NOITrendChart = (() => {
    return (props) => {
        const { data, period } = props;
        
        return React.createElement('div', { className: 'chart-container noi-trend-chart' }, [
            React.createElement('div', { key: 'header', className: 'chart-header' }, [
                React.createElement('h3', { key: 'title', className: 'chart-title' }, 'NOI Trend'),
                React.createElement('span', { key: 'period', className: 'chart-period' }, 'Last 5 Months')
            ]),
            React.createElement('div', { key: 'chart', className: 'chart-content' },
                React.createElement('div', { className: 'simple-bar-chart' },
                    data.map((item, index) =>
                        React.createElement('div', { key: index, className: 'bar-item' }, [
                            React.createElement('div', { key: 'bar', className: 'bar', style: { height: `${(item.amount / 150000) * 100}%` } }),
                            React.createElement('div', { key: 'label', className: 'bar-label' }, item.month),
                            React.createElement('div', { key: 'value', className: 'bar-value' }, `$${(item.amount / 1000).toFixed(0)}k`)
                        ])
                    )
                )
            )
        ]);
    };
})();

// Expense Category Chart Component
const ExpenseCategoryChart = (() => {
    return (props) => {
        const { data, period } = props;
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        
        return React.createElement('div', { className: 'chart-container expense-chart' }, [
            React.createElement('div', { key: 'header', className: 'chart-header' }, [
                React.createElement('h3', { key: 'title', className: 'chart-title' }, 'Expense Breakdown'),
                React.createElement('span', { key: 'period', className: 'chart-period' }, 'Current Period')
            ]),
            React.createElement('div', { key: 'chart', className: 'chart-content' },
                React.createElement('div', { className: 'expense-list' },
                    data.map((item, index) =>
                        React.createElement('div', { key: index, className: 'expense-item' }, [
                            React.createElement('div', { key: 'info', className: 'expense-info' }, [
                                React.createElement('span', { key: 'category', className: 'expense-category' }, item.category),
                                React.createElement('span', { key: 'amount', className: 'expense-amount' }, 
                                    `$${(item.amount / 1000).toFixed(1)}k`
                                )
                            ]),
                            React.createElement('div', { key: 'bar', className: 'expense-bar' }, 
                                React.createElement('div', { 
                                    className: 'expense-bar-fill', 
                                    style: { width: `${(item.amount / total) * 100}%` } 
                                })
                            ),
                            React.createElement('span', { key: 'percent', className: 'expense-percent' }, 
                                `${((item.amount / total) * 100).toFixed(0)}%`
                            )
                        ])
                    )
                )
            )
        ]);
    };
})();

// Recent Journal Entries Component
const RecentJournalEntries = (() => {
    return (props) => {
        const { entries, limit } = props;
        const displayEntries = entries.slice(0, limit);
        
        return React.createElement('div', { className: 'recent-entries-container' }, [
            React.createElement('h3', { key: 'title', className: 'section-title' }, 'Recent Journal Entries'),
            React.createElement('div', { key: 'entries', className: 'entries-list' },
                displayEntries.map(entry =>
                    React.createElement('div', { key: entry.id, className: 'entry-item' }, [
                        React.createElement('div', { key: 'left', className: 'entry-left' }, [
                            React.createElement('div', { key: 'number', className: 'entry-number' }, entry.je_number),
                            React.createElement('div', { key: 'desc', className: 'entry-description' }, entry.description)
                        ]),
                        React.createElement('div', { key: 'right', className: 'entry-right' }, [
                            React.createElement('div', { key: 'amount', className: 'entry-amount' }, 
                                `$${(entry.amount / 1000).toFixed(1)}k`
                            ),
                            React.createElement('div', { key: 'date', className: 'entry-date' }, entry.date)
                        ])
                    ])
                )
            )
        ]);
    };
})();

// Financial Alerts Component
const FinancialAlerts = (() => {
    return (props) => {
        const { alerts, severity } = props;
        const filteredAlerts = alerts.filter(alert => severity.includes(alert.type));
        
        return React.createElement('div', { className: 'financial-alerts' }, [
            React.createElement('div', { key: 'header', className: 'alerts-header' }, [
                React.createElement('h3', { key: 'title' }, 'Financial Alerts'),
                React.createElement('span', { key: 'count', className: 'alert-count' }, `${filteredAlerts.length} active`)
            ]),
            React.createElement('div', { key: 'alerts', className: 'alerts-list' },
                filteredAlerts.map(alert =>
                    React.createElement('div', { key: alert.id, className: `alert-item ${alert.type}` }, [
                        React.createElement('i', { 
                            key: 'icon', 
                            className: `alert-icon fas ${
                                alert.type === 'critical' ? 'fa-exclamation-circle' :
                                alert.type === 'warning' ? 'fa-exclamation-triangle' :
                                'fa-info-circle'
                            }` 
                        }),
                        React.createElement('div', { key: 'content', className: 'alert-content' }, [
                            React.createElement('div', { key: 'title', className: 'alert-title' }, alert.title),
                            React.createElement('div', { key: 'message', className: 'alert-message' }, alert.message)
                        ])
                    ])
                )
            )
        ]);
    };
})();

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.FinancialDashboard = FinancialDashboard;
window.AppModules.FinancialKPICard = FinancialKPICard;