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
            return React.createElement(FinancialDashboard, {
                period: state.selectedPeriod,
                basisType: state.basisType,
                entity: state.selectedEntity,
                property: state.selectedProperty
            });
        };

        const renderGeneralLedger = () => {
            return React.createElement(GeneralLedgerModule, {
                period: state.selectedPeriod,
                filters: state.reportFilters
            });
        };

        const renderTrialBalance = () => {
            return React.createElement(TrialBalanceModule, {
                asOfDate: state.selectedPeriod.end,
                basisType: state.basisType,
                dimensions: {
                    entity: state.selectedEntity,
                    property: state.selectedProperty
                }
            });
        };

        const renderFinancialStatements = () => {
            return React.createElement(FinancialStatementsModule, {
                period: state.selectedPeriod,
                basisType: state.basisType,
                entity: state.selectedEntity
            });
        };

        const renderAccountsReceivable = () => {
            return React.createElement(AccountsReceivableModule, {
                asOfDate: state.selectedPeriod.end,
                property: state.selectedProperty
            });
        };

        const renderAccountsPayable = () => {
            return React.createElement(AccountsPayableModule, {
                asOfDate: state.selectedPeriod.end,
                property: state.selectedProperty
            });
        };

        const renderBankReconciliation = () => {
            return React.createElement(BankReconciliationModule, {
                period: state.selectedPeriod,
                entity: state.selectedEntity
            });
        };

        const renderBudgeting = () => {
            return React.createElement(BudgetingModule, {
                period: state.selectedPeriod,
                property: state.selectedProperty
            });
        };

        const renderOwnerStatements = () => {
            return React.createElement(OwnerStatementsModule, {
                period: state.selectedPeriod,
                entity: state.selectedEntity
            });
        };

        const renderTaxCompliance = () => {
            return React.createElement(TaxComplianceModule, {
                taxYear: new Date(state.selectedPeriod.end).getFullYear(),
                entity: state.selectedEntity
            });
        };

        const renderAIInsights = () => {
            return React.createElement(AIFinancialInsights, {
                period: state.selectedPeriod,
                entity: state.selectedEntity
            });
        };

        const renderIntegrations = () => {
            return React.createElement(FinancialIntegrations, {
                entity: state.selectedEntity
            });
        };

        const renderModuleContent = () => {
            switch (state.activeModule) {
                case 'dashboard': return renderFinancialDashboard();
                case 'general-ledger': return renderGeneralLedger();
                case 'trial-balance': return renderTrialBalance();
                case 'financial-statements': return renderFinancialStatements();
                case 'accounts-receivable': return renderAccountsReceivable();
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