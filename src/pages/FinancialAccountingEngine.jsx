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
            const [ledgerData, setLedgerData] = React.useState({
                accounts: [],
                selectedAccount: null,
                transactions: [],
                loading: true
            });

            React.useEffect(() => {
                loadLedgerData();
            }, []);

            const loadLedgerData = async () => {
                try {
                    // Mock chart of accounts
                    const mockAccounts = [
                        { code: '1000', name: 'Cash - Operating', type: 'Asset', balance: 250000 },
                        { code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 15000 },
                        { code: '1200', name: 'Prepaid Expenses', type: 'Asset', balance: 5000 },
                        { code: '1500', name: 'Property & Buildings', type: 'Asset', balance: 4200000 },
                        { code: '2000', name: 'Accounts Payable', type: 'Liability', balance: -12000 },
                        { code: '2200', name: 'Security Deposits Held', type: 'Liability', balance: -45000 },
                        { code: '2500', name: 'Mortgage Payable', type: 'Liability', balance: -2800000 },
                        { code: '3000', name: 'Owner Equity', type: 'Equity', balance: -1000000 },
                        { code: '4000', name: 'Rental Income', type: 'Revenue', balance: -125000 },
                        { code: '4100', name: 'Late Fee Income', type: 'Revenue', balance: -2500 },
                        { code: '5000', name: 'Maintenance Expense', type: 'Expense', balance: 15000 },
                        { code: '5100', name: 'Utilities Expense', type: 'Expense', balance: 8500 },
                        { code: '5200', name: 'Management Fees', type: 'Expense', balance: 10456 },
                        { code: '5300', name: 'Insurance Expense', type: 'Expense', balance: 4200 },
                        { code: '5400', name: 'Property Tax', type: 'Expense', balance: 12000 }
                    ];

                    setLedgerData({
                        accounts: mockAccounts,
                        selectedAccount: null,
                        transactions: [],
                        loading: false
                    });
                } catch (error) {
                    console.error('Error loading ledger data:', error);
                    setLedgerData(prev => ({ ...prev, loading: false }));
                }
            };

            const loadAccountTransactions = async (accountCode) => {
                // Mock transactions for selected account
                const mockTransactions = [
                    { date: '2025-07-14', description: 'July Rent Collection - Unit A101', debit: accountCode.startsWith('4') ? 0 : 1200, credit: accountCode.startsWith('4') ? 1200 : 0 },
                    { date: '2025-07-13', description: 'Maintenance - Plumbing Repair', debit: accountCode.startsWith('5') ? 850 : 0, credit: accountCode.startsWith('5') ? 0 : 850 },
                    { date: '2025-07-12', description: 'Insurance Payment', debit: accountCode === '5300' ? 350 : 0, credit: accountCode === '5300' ? 0 : 350 },
                    { date: '2025-07-11', description: 'Property Tax Payment', debit: accountCode === '5400' ? 1000 : 0, credit: accountCode === '5400' ? 0 : 1000 },
                    { date: '2025-07-10', description: 'Late Fee Collection', debit: accountCode === '4100' ? 0 : 50, credit: accountCode === '4100' ? 50 : 0 }
                ];

                setLedgerData(prev => ({
                    ...prev,
                    selectedAccount: accountCode,
                    transactions: mockTransactions
                }));
            };

            if (ledgerData.loading) {
                return React.createElement('div', { className: 'loading-state' }, [
                    React.createElement('i', { key: 'spinner', className: 'fas fa-spinner fa-spin' }),
                    React.createElement('p', { key: 'text' }, 'Loading general ledger...')
                ]);
            }

            return React.createElement('div', { className: 'gl-module' }, [
                React.createElement('h3', { key: 'title' }, 'General Ledger'),
                
                React.createElement('div', { key: 'content', className: 'gl-content' }, [
                    // Chart of Accounts
                    React.createElement('div', { key: 'accounts', className: 'gl-accounts' }, [
                        React.createElement('h4', { key: 'title' }, 'Chart of Accounts'),
                        React.createElement('table', { key: 'table', className: 'financial-table' }, [
                            React.createElement('thead', { key: 'head' }, [
                                React.createElement('tr', { key: 'row' }, [
                                    React.createElement('th', { key: 'code' }, 'Code'),
                                    React.createElement('th', { key: 'account' }, 'Account Name'),
                                    React.createElement('th', { key: 'type' }, 'Type'),
                                    React.createElement('th', { key: 'balance' }, 'Balance'),
                                    React.createElement('th', { key: 'action' }, 'Action')
                                ])
                            ]),
                            React.createElement('tbody', { key: 'body' }, 
                                ledgerData.accounts.map((account, index) =>
                                    React.createElement('tr', { key: index }, [
                                        React.createElement('td', { key: 'code' }, account.code),
                                        React.createElement('td', { key: 'name' }, account.name),
                                        React.createElement('td', { key: 'type' }, account.type),
                                        React.createElement('td', { key: 'balance', className: 'amount' }, 
                                            `$${Math.abs(account.balance).toLocaleString()}`
                                        ),
                                        React.createElement('td', { key: 'action' }, 
                                            React.createElement('button', {
                                                className: 'btn-view-transactions',
                                                onClick: () => loadAccountTransactions(account.code)
                                            }, 'View')
                                        )
                                    ])
                                )
                            )
                        ])
                    ]),

                    // Account Transactions
                    ledgerData.selectedAccount && React.createElement('div', { key: 'transactions', className: 'gl-transactions' }, [
                        React.createElement('h4', { key: 'title' }, `Transactions - ${ledgerData.selectedAccount}`),
                        React.createElement('table', { key: 'table', className: 'financial-table' }, [
                            React.createElement('thead', { key: 'head' }, [
                                React.createElement('tr', { key: 'row' }, [
                                    React.createElement('th', { key: 'date' }, 'Date'),
                                    React.createElement('th', { key: 'desc' }, 'Description'),
                                    React.createElement('th', { key: 'debit' }, 'Debit'),
                                    React.createElement('th', { key: 'credit' }, 'Credit')
                                ])
                            ]),
                            React.createElement('tbody', { key: 'body' }, 
                                ledgerData.transactions.map((trans, index) =>
                                    React.createElement('tr', { key: index }, [
                                        React.createElement('td', { key: 'date' }, new Date(trans.date).toLocaleDateString()),
                                        React.createElement('td', { key: 'desc' }, trans.description),
                                        React.createElement('td', { key: 'debit', className: 'amount' }, 
                                            trans.debit > 0 ? `$${trans.debit.toLocaleString()}` : ''
                                        ),
                                        React.createElement('td', { key: 'credit', className: 'amount' }, 
                                            trans.credit > 0 ? `$${trans.credit.toLocaleString()}` : ''
                                        )
                                    ])
                                )
                            )
                        ])
                    ])
                ])
            ]);
        };

        const renderTrialBalance = () => {
            const [trialBalanceData, setTrialBalanceData] = React.useState({
                accounts: [],
                totals: { debits: 0, credits: 0, isBalanced: false },
                loading: true
            });

            React.useEffect(() => {
                loadTrialBalanceData();
            }, []);

            const loadTrialBalanceData = async () => {
                try {
                    // Mock trial balance data
                    const mockAccounts = [
                        // Assets
                        { code: '1000', name: 'Cash - Operating', type: 'Asset', debit: 250000, credit: 0 },
                        { code: '1100', name: 'Accounts Receivable', type: 'Asset', debit: 15000, credit: 0 },
                        { code: '1200', name: 'Prepaid Expenses', type: 'Asset', debit: 5000, credit: 0 },
                        { code: '1500', name: 'Property & Buildings', type: 'Asset', debit: 4200000, credit: 0 },
                        { code: '1600', name: 'Accumulated Depreciation', type: 'Contra-Asset', debit: 0, credit: 180000 },
                        { code: '1700', name: 'Equipment', type: 'Asset', debit: 25000, credit: 0 },
                        
                        // Liabilities
                        { code: '2000', name: 'Accounts Payable', type: 'Liability', debit: 0, credit: 12000 },
                        { code: '2100', name: 'Accrued Expenses', type: 'Liability', debit: 0, credit: 8000 },
                        { code: '2200', name: 'Security Deposits', type: 'Liability', debit: 0, credit: 45000 },
                        { code: '2300', name: 'Prepaid Rent', type: 'Liability', debit: 0, credit: 15000 },
                        { code: '2500', name: 'Mortgage Payable', type: 'Liability', debit: 0, credit: 2800000 },
                        
                        // Equity
                        { code: '3000', name: 'Owner Capital', type: 'Equity', debit: 0, credit: 1000000 },
                        { code: '3100', name: 'Retained Earnings', type: 'Equity', debit: 0, credit: 385000 },
                        
                        // Revenue
                        { code: '4000', name: 'Rental Income', type: 'Revenue', debit: 0, credit: 125000 },
                        { code: '4100', name: 'Late Fee Income', type: 'Revenue', debit: 0, credit: 2500 },
                        { code: '4200', name: 'Other Income', type: 'Revenue', debit: 0, credit: 3200 },
                        
                        // Expenses
                        { code: '5000', name: 'Maintenance Expense', type: 'Expense', debit: 15000, credit: 0 },
                        { code: '5100', name: 'Utilities Expense', type: 'Expense', debit: 8500, credit: 0 },
                        { code: '5200', name: 'Management Fees', type: 'Expense', debit: 10456, credit: 0 },
                        { code: '5300', name: 'Insurance Expense', type: 'Expense', debit: 4200, credit: 0 },
                        { code: '5400', name: 'Property Tax', type: 'Expense', debit: 12000, credit: 0 },
                        { code: '5500', name: 'Marketing Expense', type: 'Expense', debit: 2500, credit: 0 },
                        { code: '5600', name: 'Legal & Professional', type: 'Expense', debit: 1800, credit: 0 },
                        { code: '5700', name: 'Administrative', type: 'Expense', debit: 3200, credit: 0 },
                        { code: '5800', name: 'Depreciation Expense', type: 'Expense', debit: 8500, credit: 0 }
                    ];

                    const totalDebits = mockAccounts.reduce((sum, acc) => sum + acc.debit, 0);
                    const totalCredits = mockAccounts.reduce((sum, acc) => sum + acc.credit, 0);

                    setTrialBalanceData({
                        accounts: mockAccounts,
                        totals: {
                            debits: totalDebits,
                            credits: totalCredits,
                            isBalanced: Math.abs(totalDebits - totalCredits) < 0.01
                        },
                        loading: false
                    });
                } catch (error) {
                    console.error('Error loading trial balance:', error);
                    setTrialBalanceData(prev => ({ ...prev, loading: false }));
                }
            };

            if (trialBalanceData.loading) {
                return React.createElement('div', { className: 'loading-state' }, [
                    React.createElement('i', { key: 'spinner', className: 'fas fa-spinner fa-spin' }),
                    React.createElement('p', { key: 'text' }, 'Loading trial balance...')
                ]);
            }

            const groupedAccounts = {
                'Assets': trialBalanceData.accounts.filter(acc => acc.type === 'Asset'),
                'Contra-Assets': trialBalanceData.accounts.filter(acc => acc.type === 'Contra-Asset'),
                'Liabilities': trialBalanceData.accounts.filter(acc => acc.type === 'Liability'),
                'Equity': trialBalanceData.accounts.filter(acc => acc.type === 'Equity'),
                'Revenue': trialBalanceData.accounts.filter(acc => acc.type === 'Revenue'),
                'Expenses': trialBalanceData.accounts.filter(acc => acc.type === 'Expense')
            };

            return React.createElement('div', { className: 'tb-module' }, [
                React.createElement('h3', { key: 'title' }, 'Trial Balance'),
                React.createElement('p', { key: 'date' }, `As of ${new Date().toLocaleDateString()}`),
                
                React.createElement('table', { key: 'table', className: 'financial-table trial-balance-table' }, [
                    React.createElement('thead', { key: 'head' }, [
                        React.createElement('tr', { key: 'row' }, [
                            React.createElement('th', { key: 'code' }, 'Account Code'),
                            React.createElement('th', { key: 'name' }, 'Account Name'),
                            React.createElement('th', { key: 'debit' }, 'Debit'),
                            React.createElement('th', { key: 'credit' }, 'Credit')
                        ])
                    ]),
                    React.createElement('tbody', { key: 'body' }, [
                        ...Object.entries(groupedAccounts).map(([groupName, accounts]) => [
                            // Group header
                            React.createElement('tr', { key: `header-${groupName}`, className: 'group-header' }, [
                                React.createElement('td', { key: 'header', colSpan: 4 }, groupName)
                            ]),
                            // Group accounts
                            ...accounts.map((account, index) =>
                                React.createElement('tr', { key: `${groupName}-${index}` }, [
                                    React.createElement('td', { key: 'code' }, account.code),
                                    React.createElement('td', { key: 'name' }, account.name),
                                    React.createElement('td', { key: 'debit', className: 'amount' }, 
                                        account.debit > 0 ? `$${account.debit.toLocaleString()}` : ''
                                    ),
                                    React.createElement('td', { key: 'credit', className: 'amount' }, 
                                        account.credit > 0 ? `$${account.credit.toLocaleString()}` : ''
                                    )
                                ])
                            )
                        ]).flat(),
                        
                        // Totals row
                        React.createElement('tr', { key: 'totals', className: 'totals-row' }, [
                            React.createElement('td', { key: 'empty1' }, ''),
                            React.createElement('td', { key: 'total-label' }, React.createElement('strong', {}, 'TOTALS')),
                            React.createElement('td', { key: 'total-debit', className: 'amount total' }, 
                                React.createElement('strong', {}, `$${trialBalanceData.totals.debits.toLocaleString()}`)
                            ),
                            React.createElement('td', { key: 'total-credit', className: 'amount total' }, 
                                React.createElement('strong', {}, `$${trialBalanceData.totals.credits.toLocaleString()}`)
                            )
                        ])
                    ])
                ]),

                // Balance verification
                React.createElement('div', { key: 'verification', className: 'balance-verification' }, [
                    React.createElement('div', { 
                        key: 'status', 
                        className: `balance-status ${trialBalanceData.totals.isBalanced ? 'balanced' : 'unbalanced'}`
                    }, [
                        React.createElement('i', { 
                            key: 'icon', 
                            className: `fas ${trialBalanceData.totals.isBalanced ? 'fa-check-circle' : 'fa-exclamation-triangle'}`
                        }),
                        React.createElement('span', { key: 'text' }, 
                            trialBalanceData.totals.isBalanced ? 
                            'Trial Balance is in balance' : 
                            `Out of balance by $${Math.abs(trialBalanceData.totals.debits - trialBalanceData.totals.credits).toLocaleString()}`
                        )
                    ])
                ])
            ]);
        };

        const renderFinancialStatements = () => {
            return React.createElement((window.AppModules && window.AppModules.FinancialStatementsHub) || (() => React.createElement('div', { className: 'module-placeholder' }, [
                React.createElement('h3', { key: 'title' }, 'Financial Statements'),
                React.createElement('p', { key: 'desc' }, 'Loading Financial Statements module...')
            ])));
        };

        const renderAccountsReceivable = () => {
            const [arData, setArData] = React.useState({
                rentRoll: [],
                aging: { current: 0, days30: 0, days60: 0, days90: 0 },
                totalReceivable: 0,
                loading: true
            });

            React.useEffect(() => {
                loadARData();
            }, []);

            const loadARData = async () => {
                try {
                    // Mock AR data - in real implementation, this would come from backend
                    const mockRentRoll = [
                        { tenant: 'John Smith', unit: 'A101', rentAmount: 1200, balance: 0, status: 'Current' },
                        { tenant: 'Mary Johnson', unit: 'B205', rentAmount: 1400, balance: 1400, status: '30 Days' },
                        { tenant: 'David Wilson', unit: 'C304', rentAmount: 1100, balance: 2200, status: '60 Days' },
                        { tenant: 'Sarah Davis', unit: 'A203', rentAmount: 1300, balance: 0, status: 'Current' },
                        { tenant: 'Mike Brown', unit: 'B102', rentAmount: 1250, balance: 1250, status: '30 Days' }
                    ];

                    const aging = {
                        current: mockRentRoll.filter(t => t.status === 'Current').reduce((sum, t) => sum + t.balance, 0),
                        days30: mockRentRoll.filter(t => t.status === '30 Days').reduce((sum, t) => sum + t.balance, 0),
                        days60: mockRentRoll.filter(t => t.status === '60 Days').reduce((sum, t) => sum + t.balance, 0),
                        days90: mockRentRoll.filter(t => t.status === '90+ Days').reduce((sum, t) => sum + t.balance, 0)
                    };

                    setArData({
                        rentRoll: mockRentRoll,
                        aging,
                        totalReceivable: aging.days30 + aging.days60 + aging.days90,
                        loading: false
                    });
                } catch (error) {
                    console.error('Error loading AR data:', error);
                    setArData(prev => ({ ...prev, loading: false }));
                }
            };

            if (arData.loading) {
                return React.createElement('div', { className: 'loading-state' }, [
                    React.createElement('i', { key: 'spinner', className: 'fas fa-spinner fa-spin' }),
                    React.createElement('p', { key: 'text' }, 'Loading AR data...')
                ]);
            }

            return React.createElement('div', { className: 'ar-module' }, [
                React.createElement('h3', { key: 'title' }, 'Accounts Receivable'),
                
                // AR Summary Cards
                React.createElement('div', { key: 'summary', className: 'ar-summary' }, [
                    React.createElement('div', { key: 'card1', className: 'ar-card' }, [
                        React.createElement('h4', { key: 'title' }, 'Total Receivable'),
                        React.createElement('span', { key: 'amount', className: 'amount' }, `$${arData.totalReceivable.toLocaleString()}`)
                    ]),
                    React.createElement('div', { key: 'card2', className: 'ar-card' }, [
                        React.createElement('h4', { key: 'title' }, '30 Days'),
                        React.createElement('span', { key: 'amount', className: 'amount warning' }, `$${arData.aging.days30.toLocaleString()}`)
                    ]),
                    React.createElement('div', { key: 'card3', className: 'ar-card' }, [
                        React.createElement('h4', { key: 'title' }, '60 Days'),
                        React.createElement('span', { key: 'amount', className: 'amount danger' }, `$${arData.aging.days60.toLocaleString()}`)
                    ]),
                    React.createElement('div', { key: 'card4', className: 'ar-card' }, [
                        React.createElement('h4', { key: 'title' }, '90+ Days'),
                        React.createElement('span', { key: 'amount', className: 'amount critical' }, `$${arData.aging.days90.toLocaleString()}`)
                    ])
                ]),

                // Rent Roll Table
                React.createElement('div', { key: 'rentroll', className: 'rent-roll-section' }, [
                    React.createElement('h4', { key: 'title' }, 'Current Rent Roll'),
                    React.createElement('table', { key: 'table', className: 'financial-table' }, [
                        React.createElement('thead', { key: 'head' }, [
                            React.createElement('tr', { key: 'row' }, [
                                React.createElement('th', { key: 'tenant' }, 'Tenant'),
                                React.createElement('th', { key: 'unit' }, 'Unit'),
                                React.createElement('th', { key: 'rent' }, 'Monthly Rent'),
                                React.createElement('th', { key: 'balance' }, 'Balance'),
                                React.createElement('th', { key: 'status' }, 'Status')
                            ])
                        ]),
                        React.createElement('tbody', { key: 'body' }, 
                            arData.rentRoll.map((tenant, index) =>
                                React.createElement('tr', { key: index }, [
                                    React.createElement('td', { key: 'tenant' }, tenant.tenant),
                                    React.createElement('td', { key: 'unit' }, tenant.unit),
                                    React.createElement('td', { key: 'rent' }, `$${tenant.rentAmount.toLocaleString()}`),
                                    React.createElement('td', { key: 'balance' }, `$${tenant.balance.toLocaleString()}`),
                                    React.createElement('td', { key: 'status' }, 
                                        React.createElement('span', { 
                                            className: `status-badge ${tenant.status === 'Current' ? 'current' : 'overdue'}` 
                                        }, tenant.status)
                                    )
                                ])
                            )
                        )
                    ])
                ])
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

            const formatCurrency = (amount) => {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                }).format(amount || 0);
            };

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
                    } else {
                        // Mock data when Valor service isn't available
                        setPaymentData({
                            todayTotal: 4850,
                            weekTotal: 28750,
                            monthTotal: 125640,
                            pendingCount: 3,
                            failedCount: 1,
                            recentPayments: [
                                { id: '1', createdAt: new Date().toISOString(), amount: 1200, status: 'paid', paymentMethod: 'ACH', metadata: { tenant_name: 'John Smith', property_name: 'Sunset Apartments' }},
                                { id: '2', createdAt: new Date(Date.now() - 24*60*60*1000).toISOString(), amount: 1400, status: 'paid', paymentMethod: 'Credit Card', metadata: { tenant_name: 'Mary Johnson', property_name: 'Oak Grove' }},
                                { id: '3', createdAt: new Date(Date.now() - 48*60*60*1000).toISOString(), amount: 1100, status: 'pending', paymentMethod: 'ACH', metadata: { tenant_name: 'David Wilson', property_name: 'Riverside Plaza' }},
                                { id: '4', createdAt: new Date(Date.now() - 72*60*60*1000).toISOString(), amount: 1250, status: 'paid', paymentMethod: 'ACH', metadata: { tenant_name: 'Sarah Davis', property_name: 'Mountain View' }},
                                { id: '5', createdAt: new Date(Date.now() - 96*60*60*1000).toISOString(), amount: 800, status: 'failed', paymentMethod: 'Credit Card', metadata: { tenant_name: 'Mike Brown', property_name: 'Sunset Apartments' }}
                            ]
                        });
                    }
                } catch (error) {
                    console.error('Error loading payment data:', error);
                    // Fallback to mock data on error
                    setPaymentData({
                        todayTotal: 4850,
                        weekTotal: 28750,
                        monthTotal: 125640,
                        pendingCount: 3,
                        failedCount: 1,
                        recentPayments: [
                            { id: '1', createdAt: new Date().toISOString(), amount: 1200, status: 'paid', paymentMethod: 'ACH', metadata: { tenant_name: 'John Smith', property_name: 'Sunset Apartments' }},
                            { id: '2', createdAt: new Date(Date.now() - 24*60*60*1000).toISOString(), amount: 1400, status: 'paid', paymentMethod: 'Credit Card', metadata: { tenant_name: 'Mary Johnson', property_name: 'Oak Grove' }}
                        ]
                    });
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
                            onClick: () => {
                                updateState({ activeModule: module.id });
                                // Scroll to top when changing modules
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            },
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