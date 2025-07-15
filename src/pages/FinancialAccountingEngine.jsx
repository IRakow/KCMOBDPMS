// FinancialAccountingEngine.jsx - JP Morgan Grade Financial System
const FinancialAccountingEngine = (() => {
    // Component factory helper
    const ComponentFactory = {
        createComponent: (name, options = {}) => (componentFunc) => {
            const Component = (props) => {
                const [error, setError] = React.useState(null);
                
                if (error && options.withErrorBoundary) {
                    return React.createElement('div', { className: 'error-boundary' },
                        React.createElement('h3', {}, 'Error in ' + name),
                        React.createElement('p', {}, error.message)
                    );
                }
                
                try {
                    const helpers = {
                        useLocalState: (initialState) => {
                            const [state, setState] = React.useState(initialState);
                            const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
                            return [state, updateState];
                        },
                        useAsyncState: (asyncFunc, deps = []) => {
                            const [state, setState] = React.useState({ loading: true, data: null, error: null });
                            
                            React.useEffect(() => {
                                let mounted = true;
                                const fetchData = async () => {
                                    try {
                                        setState({ loading: true, data: null, error: null });
                                        const data = await asyncFunc();
                                        if (mounted) setState({ loading: false, data, error: null });
                                    } catch (error) {
                                        if (mounted) setState({ loading: false, data: null, error });
                                    }
                                };
                                fetchData();
                                return () => { mounted = false; };
                            }, deps);
                            
                            const refetch = async () => {
                                try {
                                    setState({ loading: true, data: state.data, error: null });
                                    const data = await asyncFunc();
                                    setState({ loading: false, data, error: null });
                                } catch (error) {
                                    setState({ loading: false, data: null, error });
                                }
                            };
                            
                            return { ...state, refetch };
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
                } catch (err) {
                    if (options.withErrorBoundary) {
                        setError(err);
                        return null;
                    }
                    throw err;
                }
            };
            
            Component.displayName = name;
            return Component;
        }
    };

    const Engine = ComponentFactory.createComponent('FinancialAccountingEngine', {
        withPerformanceTracking: true,
        withErrorBoundary: true
    })((props, helpers) => {
        const { useLocalState, useAsyncState, formatCurrency, formatPercentage } = helpers;
        
        const [state, updateState] = useLocalState({
            activeModule: 'dashboard',
            selectedPeriod: { start: '2025-01-01', end: '2025-01-31' },
            basisType: 'accrual', // 'accrual' or 'cash'
            selectedEntity: null,
            selectedProperty: null,
            reportFilters: {},
            realTimeUpdates: true
        });

        // Financial Controls Component - Horizontal Layout
        const FinancialControls = ({ selectedPeriod, basisType, selectedEntity, selectedProperty, onPeriodChange, onBasisChange, onEntityChange, onPropertyChange }) => {
            return React.createElement('div', { 
                style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '16px 30px',
                    position: 'sticky',
                    top: '0',
                    zIndex: '100',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    minHeight: '60px',
                }
            }, [
                // Period Selector
                React.createElement('div', { 
                    key: 'period', 
                    style: {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '8px',
                        flex: '1',
                    }
                }, [
                    React.createElement('label', { key: 'label', className: 'control-label' }, 'Period'),
                    React.createElement('select', {
                        key: 'select',
                        value: `${selectedPeriod.start}_${selectedPeriod.end}`,
                        onChange: (e) => {
                            const [start, end] = e.target.value.split('_');
                            onPeriodChange({ start, end });
                        },
                        className: 'control-select'
                    }, [
                        React.createElement('option', { key: 'jan', value: '2025-01-01_2025-01-31' }, 'January 2025'),
                        React.createElement('option', { key: 'q1', value: '2025-01-01_2025-03-31' }, 'Q1 2025'),
                        React.createElement('option', { key: 'ytd', value: '2025-01-01_2025-12-31' }, 'Year to Date'),
                        React.createElement('option', { key: 'custom', value: 'custom' }, 'Custom Range...')
                    ])
                ]),
                
                // Basis Type Selector
                React.createElement('div', { 
                    key: 'basis', 
                    style: {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '8px',
                        flex: '1',
                    }
                }, [
                    React.createElement('label', { key: 'label', className: 'control-label' }, 'Basis'),
                    React.createElement('div', { key: 'buttons', className: 'basis-toggle-horizontal' }, [
                        React.createElement('button', {
                            key: 'accrual',
                            className: `basis-btn-horizontal ${basisType === 'accrual' ? 'active' : ''}`,
                            onClick: () => onBasisChange('accrual')
                        }, 'Accrual'),
                        React.createElement('button', {
                            key: 'cash',
                            className: `basis-btn-horizontal ${basisType === 'cash' ? 'active' : ''}`,
                            onClick: () => onBasisChange('cash')
                        }, 'Cash')
                    ])
                ]),
                
                // Entity Selector
                React.createElement('div', { 
                    key: 'entity', 
                    style: {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '8px',
                        flex: '1',
                    }
                }, [
                    React.createElement('label', { key: 'label', className: 'control-label' }, 'Entity'),
                    React.createElement('select', {
                        key: 'select',
                        value: selectedEntity || '',
                        onChange: (e) => onEntityChange(e.target.value),
                        className: 'control-select'
                    }, [
                        React.createElement('option', { key: 'all', value: '' }, 'All Entities'),
                        React.createElement('option', { key: 'e1', value: 'bdpms-llc' }, 'BDPMS LLC'),
                        React.createElement('option', { key: 'e2', value: 'sunset-holdings' }, 'Sunset Holdings'),
                        React.createElement('option', { key: 'e3', value: 'downtown-management' }, 'Downtown Management')
                    ])
                ]),
                
                // Property Selector
                React.createElement('div', { 
                    key: 'property', 
                    style: {
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '8px',
                        flex: '1',
                    }
                }, [
                    React.createElement('label', { key: 'label', className: 'control-label' }, 'Property'),
                    React.createElement('select', {
                        key: 'select',
                        value: selectedProperty || '',
                        onChange: (e) => onPropertyChange(e.target.value),
                        className: 'control-select'
                    }, [
                        React.createElement('option', { key: 'all', value: '' }, 'All Properties'),
                        React.createElement('option', { key: 'p1', value: 'sunset-apts' }, 'Sunset Apartments'),
                        React.createElement('option', { key: 'p2', value: 'downtown-plaza' }, 'Downtown Plaza'),
                        React.createElement('option', { key: 'p3', value: 'garden-complex' }, 'Garden Complex')
                    ])
                ])
            ]);
        };

        // Core Financial Modules Navigation
        const financialModules = [
            {
                id: 'dashboard',
                title: 'Financial Dashboard',
                icon: 'fa-chart-line',
                description: 'Real-time KPIs & Performance'
            },
            {
                id: 'general-ledger',
                title: 'General Ledger',
                icon: 'fa-book',
                description: 'Double-Entry GL & Journal Entries'
            },
            {
                id: 'trial-balance',
                title: 'Trial Balance',
                icon: 'fa-balance-scale',
                description: 'Account Balances & Verification'
            },
            {
                id: 'financial-statements',
                title: 'Financial Statements',
                icon: 'fa-file-invoice-dollar',
                description: 'P&L, Balance Sheet, Cash Flow'
            },
            {
                id: 'accounts-receivable',
                title: 'Accounts Receivable',
                icon: 'fa-hand-holding-usd',
                description: 'Rent Roll & AR Aging'
            },
            {
                id: 'payment-processing',
                title: 'Payment Processing',
                icon: 'fa-credit-card',
                description: 'Valor PayTech Integration'
            },
            {
                id: 'accounts-payable',
                title: 'Accounts Payable',
                icon: 'fa-credit-card',
                description: 'Vendor Bills & AP Aging'
            },
            {
                id: 'bank-reconciliation',
                title: 'Bank Reconciliation',
                icon: 'fa-university',
                description: 'Bank Feed Matching & Clearing'
            },
            {
                id: 'budgeting',
                title: 'Budgeting & Forecasting',
                icon: 'fa-calendar-alt',
                description: 'Budget vs Actual Analysis'
            },
            {
                id: 'owner-statements',
                title: 'Owner Statements',
                icon: 'fa-user-tie',
                description: 'Owner Equity & Distributions'
            },
            {
                id: 'tax-compliance',
                title: 'Tax & Compliance',
                icon: 'fa-file-alt',
                description: '1099s, Sales Tax, Regulatory'
            },
            {
                id: 'ai-insights',
                title: 'AI Financial Insights',
                icon: 'fa-brain',
                description: 'ML Predictions & Anomaly Detection'
            },
            {
                id: 'integrations',
                title: 'Integrations',
                icon: 'fa-plug',
                description: 'QuickBooks, Banks, APIs'
            }
        ];

        const renderFinancialDashboard = () => {
            // Use the financial dashboard if available, otherwise show placeholder
            if (window.AppModules && window.AppModules.FinancialDashboard) {
                return React.createElement(window.AppModules.FinancialDashboard, {
                    period: state.selectedPeriod,
                    basisType: state.basisType,
                    entity: state.selectedEntity,
                    property: state.selectedProperty
                });
            }
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Financial Dashboard'),
                React.createElement('p', { key: 'desc' }, 'Financial dashboard module will be displayed here.')
            ]);
        };

        const renderGeneralLedger = () => {
            if (window.AppModules && window.AppModules.GeneralLedgerModule) {
                return React.createElement(window.AppModules.GeneralLedgerModule, {
                    period: state.selectedPeriod,
                    filters: state.reportFilters
                });
            }
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'General Ledger'),
                React.createElement('p', { key: 'desc' }, 'General ledger module will be displayed here.')
            ]);
        };

        const renderTrialBalance = () => {
            if (window.AppModules && window.AppModules.TrialBalanceModule) {
                return React.createElement(window.AppModules.TrialBalanceModule, {
                    asOfDate: state.selectedPeriod.end,
                    basisType: state.basisType,
                    dimensions: {
                        entity: state.selectedEntity,
                        property: state.selectedProperty
                    }
                });
            }
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Trial Balance'),
                React.createElement('p', { key: 'desc' }, 'Trial balance module will be displayed here.')
            ]);
        };

        const renderFinancialStatements = () => {
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Financial Statements'),
                React.createElement('p', { key: 'desc' }, 'P&L, Balance Sheet, and Cash Flow statements will be displayed here.')
            ]);
        };

        const renderAccountsReceivable = () => {
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Accounts Receivable'),
                React.createElement('p', { key: 'desc' }, 'Rent roll and AR aging reports will be displayed here.')
            ]);
        };

        const renderPaymentProcessing = () => {
            const [paymentData, setPaymentData] = React.useState({
                todayTotal: 0,
                weekTotal: 0,
                monthTotal: 0,
                pendingCount: 0,
                failedCount: 0,
                recentPayments: []
            });

            React.useEffect(() => {
                loadPaymentData();
            }, []);

            const loadPaymentData = async () => {
                try {
                    if (window.ValorPayTechService) {
                        const today = new Date();
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        
                        // Get payment history
                        const history = await window.ValorPayTechService.getPaymentHistory({
                            limit: 50,
                            dateRange: `${monthAgo.toISOString()},${today.toISOString()}`
                        });
                        
                        // Calculate totals
                        let todayTotal = 0, weekTotal = 0, monthTotal = 0;
                        let pendingCount = 0, failedCount = 0;
                        
                        history.payments.forEach(payment => {
                            const paymentDate = new Date(payment.createdAt);
                            if (payment.status === 'paid') {
                                monthTotal += payment.amount;
                                if (paymentDate >= weekAgo) weekTotal += payment.amount;
                                if (paymentDate.toDateString() === today.toDateString()) todayTotal += payment.amount;
                            } else if (payment.status === 'pending') {
                                pendingCount++;
                            } else if (payment.status === 'failed') {
                                failedCount++;
                            }
                        });
                        
                        setPaymentData({
                            todayTotal,
                            weekTotal,
                            monthTotal,
                            pendingCount,
                            failedCount,
                            recentPayments: history.payments.slice(0, 10)
                        });
                    }
                } catch (error) {
                    console.error('Error loading payment data:', error);
                }
            };

            return React.createElement('div', { key: 'payment-processing', className: 'payment-processing-module' }, [
                React.createElement('h3', { key: 'title' }, 'Valor PayTech Payment Processing'),
                
                // Summary Cards
                React.createElement('div', { key: 'summary', className: 'payment-summary-cards' }, [
                    React.createElement('div', { key: 'today', className: 'summary-card' }, [
                        React.createElement('h4', { key: 'h4' }, 'Today'),
                        React.createElement('p', { key: 'amount', className: 'amount' }, formatCurrency(paymentData.todayTotal))
                    ]),
                    React.createElement('div', { key: 'week', className: 'summary-card' }, [
                        React.createElement('h4', { key: 'h4' }, 'This Week'),
                        React.createElement('p', { key: 'amount', className: 'amount' }, formatCurrency(paymentData.weekTotal))
                    ]),
                    React.createElement('div', { key: 'month', className: 'summary-card' }, [
                        React.createElement('h4', { key: 'h4' }, 'This Month'),
                        React.createElement('p', { key: 'amount', className: 'amount' }, formatCurrency(paymentData.monthTotal))
                    ]),
                    React.createElement('div', { key: 'pending', className: 'summary-card warning' }, [
                        React.createElement('h4', { key: 'h4' }, 'Pending'),
                        React.createElement('p', { key: 'count', className: 'count' }, paymentData.pendingCount)
                    ]),
                    React.createElement('div', { key: 'failed', className: 'summary-card danger' }, [
                        React.createElement('h4', { key: 'h4' }, 'Failed'),
                        React.createElement('p', { key: 'count', className: 'count' }, paymentData.failedCount)
                    ])
                ]),
                
                // Recent Payments
                React.createElement('div', { key: 'recent', className: 'recent-payments' }, [
                    React.createElement('h4', { key: 'title' }, 'Recent Payments'),
                    React.createElement('table', { key: 'table', className: 'payments-table' }, [
                        React.createElement('thead', { key: 'thead' }, 
                            React.createElement('tr', {}, [
                                React.createElement('th', { key: 'date' }, 'Date'),
                                React.createElement('th', { key: 'tenant' }, 'Tenant'),
                                React.createElement('th', { key: 'property' }, 'Property'),
                                React.createElement('th', { key: 'amount' }, 'Amount'),
                                React.createElement('th', { key: 'status' }, 'Status'),
                                React.createElement('th', { key: 'method' }, 'Method')
                            ])
                        ),
                        React.createElement('tbody', { key: 'tbody' }, 
                            paymentData.recentPayments.map((payment, index) =>
                                React.createElement('tr', { key: payment.id || index }, [
                                    React.createElement('td', { key: 'date' }, new Date(payment.createdAt).toLocaleDateString()),
                                    React.createElement('td', { key: 'tenant' }, payment.metadata?.tenant_name || 'Unknown'),
                                    React.createElement('td', { key: 'property' }, payment.metadata?.property_name || 'Unknown'),
                                    React.createElement('td', { key: 'amount' }, formatCurrency(payment.amount)),
                                    React.createElement('td', { key: 'status' }, 
                                        React.createElement('span', { 
                                            className: `status-badge ${payment.status}` 
                                        }, payment.status)
                                    ),
                                    React.createElement('td', { key: 'method' }, payment.paymentMethod || 'Valor PayTech')
                                ])
                            )
                        )
                    ])
                ]),
                
                // Actions
                React.createElement('div', { key: 'actions', className: 'payment-actions' }, [
                    React.createElement('button', { 
                        key: 'run-cycle',
                        className: 'btn btn-primary',
                        onClick: () => {
                            if (window.AppModules?.PaymentAutomationEngine) {
                                updateState({ activeModule: 'dashboard' });
                                window.location.hash = '#payment-automation';
                            }
                        }
                    }, 'Run Collection Cycle'),
                    React.createElement('button', { 
                        key: 'export',
                        className: 'btn btn-secondary'
                    }, 'Export Report')
                ])
            ]);
        };

        const renderAccountsPayable = () => {
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Accounts Payable'),
                React.createElement('p', { key: 'desc' }, 'Vendor bills and AP aging reports will be displayed here.')
            ]);
        };

        const renderBankReconciliation = () => {
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Bank Reconciliation'),
                React.createElement('p', { key: 'desc' }, 'Bank feed matching and reconciliation will be displayed here.')
            ]);
        };

        const renderBudgeting = () => {
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Budgeting & Forecasting'),
                React.createElement('p', { key: 'desc' }, 'Budget vs actual analysis will be displayed here.')
            ]);
        };

        const renderOwnerStatements = () => {
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Owner Statements'),
                React.createElement('p', { key: 'desc' }, 'Owner equity and distribution statements will be displayed here.')
            ]);
        };

        const renderTaxCompliance = () => {
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Tax & Compliance'),
                React.createElement('p', { key: 'desc' }, '1099s, sales tax, and regulatory compliance will be displayed here.')
            ]);
        };

        const renderAIInsights = () => {
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'AI Financial Insights'),
                React.createElement('p', { key: 'desc' }, 'ML predictions and anomaly detection will be displayed here.')
            ]);
        };

        const renderIntegrations = () => {
            return React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Integrations'),
                React.createElement('p', { key: 'desc' }, 'QuickBooks, bank, and API integrations will be displayed here.')
            ]);
        };

        const renderModuleContent = () => {
            switch (state.activeModule) {
                case 'dashboard': return renderFinancialDashboard();
                case 'general-ledger': return renderGeneralLedger();
                case 'trial-balance': return renderTrialBalance();
                case 'financial-statements': return renderFinancialStatements();
                case 'accounts-receivable': return renderAccountsReceivable();
                case 'payment-processing': return renderPaymentProcessing();
                case 'accounts-payable': return renderAccountsPayable();
                case 'bank-reconciliation': return renderBankReconciliation();
                case 'budgeting': return renderBudgeting();
                case 'owner-statements': return renderOwnerStatements();
                case 'tax-compliance': return renderTaxCompliance();
                case 'ai-insights': return renderAIInsights();
                case 'integrations': return renderIntegrations();
                default: return renderFinancialDashboard();
            }
        };

        return React.createElement('div', { className: 'financial-accounting-engine' }, [
            // Global Financial Controls
            React.createElement(FinancialControls, {
                key: 'controls',
                selectedPeriod: state.selectedPeriod,
                basisType: state.basisType,
                selectedEntity: state.selectedEntity,
                selectedProperty: state.selectedProperty,
                onPeriodChange: (period) => updateState({ selectedPeriod: period }),
                onBasisChange: (basis) => updateState({ basisType: basis }),
                onEntityChange: (entity) => updateState({ selectedEntity: entity }),
                onPropertyChange: (property) => updateState({ selectedProperty: property })
            }),

            // Financial Module Navigation
            React.createElement('div', { key: 'nav', className: 'financial-modules-nav' },
                React.createElement('div', { className: 'financial-modules-nav-container' },
                    financialModules.map(module =>
                        React.createElement('button', {
                            key: module.id,
                            className: `financial-module-btn ${state.activeModule === module.id ? 'active' : ''}`,
                            onClick: () => updateState({ activeModule: module.id }),
                            title: module.description
                        }, [
                            React.createElement('i', { key: 'icon', className: `fas ${module.icon}` }),
                            React.createElement('span', { key: 'title' }, module.title)
                        ])
                    )
                )
            ),

            // Module Content Area
            React.createElement('div', { key: 'content', className: 'financial-module-content' },
                renderModuleContent()
            )
        ]);
    });

    return Engine;
})();

// Export the main component
window.AppModules = window.AppModules || {};
window.AppModules.FinancialAccountingEngine = FinancialAccountingEngine;