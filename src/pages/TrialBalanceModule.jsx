// TrialBalanceModule.jsx - Trial Balance Module
const TrialBalanceModule = (() => {
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
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('TrialBalanceModule', {})((props, helpers) => {
        const { asOfDate, basisType, dimensions } = props;
        const { useAsyncState, formatCurrency } = helpers;

        const trialBalanceData = useAsyncState(async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                accounts: [
                    // Assets
                    { id: '1000', name: '1000 - Cash and Cash Equivalents', debit_balance: 850000, credit_balance: 0, account_type: 'Asset' },
                    { id: '1100', name: '1100 - Operating Cash', debit_balance: 425000, credit_balance: 0, account_type: 'Asset' },
                    { id: '1200', name: '1200 - Accounts Receivable', debit_balance: 125000, credit_balance: 0, account_type: 'Asset' },
                    { id: '1300', name: '1300 - Prepaid Expenses', debit_balance: 25000, credit_balance: 0, account_type: 'Asset' },
                    { id: '1500', name: '1500 - Fixed Assets', debit_balance: 5500000, credit_balance: 0, account_type: 'Asset' },
                    { id: '1510', name: '1510 - Accumulated Depreciation', debit_balance: 0, credit_balance: 450000, account_type: 'Asset' },
                    
                    // Liabilities
                    { id: '2100', name: '2100 - Accounts Payable', debit_balance: 0, credit_balance: 85000, account_type: 'Liability' },
                    { id: '2200', name: '2200 - Accrued Expenses', debit_balance: 0, credit_balance: 35000, account_type: 'Liability' },
                    { id: '2300', name: '2300 - Security Deposits', debit_balance: 0, credit_balance: 180000, account_type: 'Liability' },
                    { id: '2500', name: '2500 - Notes Payable', debit_balance: 0, credit_balance: 2800000, account_type: 'Liability' },
                    
                    // Equity
                    { id: '3100', name: '3100 - Owner Capital', debit_balance: 0, credit_balance: 2500000, account_type: 'Equity' },
                    { id: '3200', name: '3200 - Retained Earnings', debit_balance: 0, credit_balance: 850000, account_type: 'Equity' },
                    { id: '3300', name: '3300 - Current Year Income', debit_balance: 0, credit_balance: 125000, account_type: 'Equity' },
                    
                    // Revenue
                    { id: '4100', name: '4100 - Rental Income', debit_balance: 0, credit_balance: 1500000, account_type: 'Revenue' },
                    { id: '4200', name: '4200 - Late Fees', debit_balance: 0, credit_balance: 25000, account_type: 'Revenue' },
                    { id: '4300', name: '4300 - Other Income', debit_balance: 0, credit_balance: 15000, account_type: 'Revenue' },
                    
                    // Expenses
                    { id: '6100', name: '6100 - Property Management', debit_balance: 180000, credit_balance: 0, account_type: 'Expense' },
                    { id: '6200', name: '6200 - Maintenance & Repairs', debit_balance: 125000, credit_balance: 0, account_type: 'Expense' },
                    { id: '6300', name: '6300 - Utilities', debit_balance: 85000, credit_balance: 0, account_type: 'Expense' },
                    { id: '6400', name: '6400 - Insurance', debit_balance: 65000, credit_balance: 0, account_type: 'Expense' },
                    { id: '6500', name: '6500 - Property Tax', debit_balance: 120000, credit_balance: 0, account_type: 'Expense' },
                    { id: '6600', name: '6600 - Interest Expense', debit_balance: 140000, credit_balance: 0, account_type: 'Expense' },
                    { id: '6900', name: '6900 - Other Expenses', debit_balance: 35000, credit_balance: 0, account_type: 'Expense' }
                ],
                totals: {
                    debits: 7675000,
                    credits: 7675000
                }
            };
        }, [asOfDate, basisType, dimensions]);

        if (trialBalanceData.loading) {
            return React.createElement('div', { className: 'financial-loading' }, 
                React.createElement('div', { className: 'loading-spinner' }),
                'Generating trial balance...'
            );
        }

        const data = trialBalanceData.data || {};
        const accounts = data.accounts || [];
        const totals = data.totals || { debits: 0, credits: 0 };
        const isBalanced = Math.abs(totals.debits - totals.credits) < 0.01;

        const exportToPDF = () => {
            console.log('Exporting trial balance to PDF...');
            // Implement PDF export
        };

        const exportToExcel = () => {
            console.log('Exporting trial balance to Excel...');
            // Implement Excel export
        };

        // Group accounts by type
        const accountsByType = accounts.reduce((acc, account) => {
            if (!acc[account.account_type]) {
                acc[account.account_type] = [];
            }
            acc[account.account_type].push(account);
            return acc;
        }, {});

        return React.createElement('div', { className: 'trial-balance-module' }, [
            // TB Header with Balance Check
            React.createElement('div', { key: 'header', className: 'tb-header' }, [
                React.createElement('h2', { key: 'title' }, `Trial Balance - ${asOfDate}`),
                React.createElement('div', { 
                    key: 'balance-check',
                    className: `balance-indicator ${isBalanced ? 'balanced' : 'unbalanced'}`
                }, [
                    React.createElement('i', { 
                        key: 'icon',
                        className: `fas ${isBalanced ? 'fa-check-circle' : 'fa-exclamation-triangle'}`
                    }),
                    React.createElement('span', { key: 'text' }, 
                        isBalanced ? 'In Balance' : 'Out of Balance!'
                    )
                ])
            ]),

            // Basis Type Indicator
            React.createElement('div', { key: 'basis', className: 'tb-basis-indicator' },
                `Basis: ${basisType === 'cash' ? 'Cash' : 'Accrual'}`
            ),

            // Trial Balance Table
            React.createElement('div', { key: 'table', className: 'tb-table-container' },
                React.createElement('table', { className: 'trial-balance-table' }, [
                    React.createElement('thead', { key: 'thead' },
                        React.createElement('tr', {}, [
                            React.createElement('th', { key: 'account' }, 'Account'),
                            React.createElement('th', { key: 'debit' }, 'Debit'),
                            React.createElement('th', { key: 'credit' }, 'Credit')
                        ])
                    ),
                    
                    React.createElement('tbody', { key: 'tbody' }, [
                        // Assets
                        accountsByType['Asset'] && [
                            React.createElement('tr', { key: 'asset-header', className: 'section-header' },
                                React.createElement('td', { colSpan: 3 }, React.createElement('strong', {}, 'ASSETS'))
                            ),
                            ...accountsByType['Asset'].map(account =>
                                React.createElement('tr', { key: account.id }, [
                                    React.createElement('td', { key: 'name', className: 'account-name' }, account.name),
                                    React.createElement('td', { key: 'debit', className: 'amount' },
                                        account.debit_balance > 0 ? formatCurrency(account.debit_balance) : '-'
                                    ),
                                    React.createElement('td', { key: 'credit', className: 'amount' },
                                        account.credit_balance > 0 ? formatCurrency(account.credit_balance) : '-'
                                    )
                                ])
                            )
                        ],
                        
                        // Liabilities
                        accountsByType['Liability'] && [
                            React.createElement('tr', { key: 'liability-header', className: 'section-header' },
                                React.createElement('td', { colSpan: 3 }, React.createElement('strong', {}, 'LIABILITIES'))
                            ),
                            ...accountsByType['Liability'].map(account =>
                                React.createElement('tr', { key: account.id }, [
                                    React.createElement('td', { key: 'name', className: 'account-name' }, account.name),
                                    React.createElement('td', { key: 'debit', className: 'amount' },
                                        account.debit_balance > 0 ? formatCurrency(account.debit_balance) : '-'
                                    ),
                                    React.createElement('td', { key: 'credit', className: 'amount' },
                                        account.credit_balance > 0 ? formatCurrency(account.credit_balance) : '-'
                                    )
                                ])
                            )
                        ],
                        
                        // Equity
                        accountsByType['Equity'] && [
                            React.createElement('tr', { key: 'equity-header', className: 'section-header' },
                                React.createElement('td', { colSpan: 3 }, React.createElement('strong', {}, 'EQUITY'))
                            ),
                            ...accountsByType['Equity'].map(account =>
                                React.createElement('tr', { key: account.id }, [
                                    React.createElement('td', { key: 'name', className: 'account-name' }, account.name),
                                    React.createElement('td', { key: 'debit', className: 'amount' },
                                        account.debit_balance > 0 ? formatCurrency(account.debit_balance) : '-'
                                    ),
                                    React.createElement('td', { key: 'credit', className: 'amount' },
                                        account.credit_balance > 0 ? formatCurrency(account.credit_balance) : '-'
                                    )
                                ])
                            )
                        ],
                        
                        // Revenue
                        accountsByType['Revenue'] && [
                            React.createElement('tr', { key: 'revenue-header', className: 'section-header' },
                                React.createElement('td', { colSpan: 3 }, React.createElement('strong', {}, 'REVENUE'))
                            ),
                            ...accountsByType['Revenue'].map(account =>
                                React.createElement('tr', { key: account.id }, [
                                    React.createElement('td', { key: 'name', className: 'account-name' }, account.name),
                                    React.createElement('td', { key: 'debit', className: 'amount' },
                                        account.debit_balance > 0 ? formatCurrency(account.debit_balance) : '-'
                                    ),
                                    React.createElement('td', { key: 'credit', className: 'amount' },
                                        account.credit_balance > 0 ? formatCurrency(account.credit_balance) : '-'
                                    )
                                ])
                            )
                        ],
                        
                        // Expenses
                        accountsByType['Expense'] && [
                            React.createElement('tr', { key: 'expense-header', className: 'section-header' },
                                React.createElement('td', { colSpan: 3 }, React.createElement('strong', {}, 'EXPENSES'))
                            ),
                            ...accountsByType['Expense'].map(account =>
                                React.createElement('tr', { key: account.id }, [
                                    React.createElement('td', { key: 'name', className: 'account-name' }, account.name),
                                    React.createElement('td', { key: 'debit', className: 'amount' },
                                        account.debit_balance > 0 ? formatCurrency(account.debit_balance) : '-'
                                    ),
                                    React.createElement('td', { key: 'credit', className: 'amount' },
                                        account.credit_balance > 0 ? formatCurrency(account.credit_balance) : '-'
                                    )
                                ])
                            )
                        ]
                    ]),
                    
                    React.createElement('tfoot', { key: 'tfoot' },
                        React.createElement('tr', { className: 'totals-row' }, [
                            React.createElement('td', { key: 'label' }, React.createElement('strong', {}, 'TOTALS')),
                            React.createElement('td', { key: 'debit-total', className: 'amount' },
                                React.createElement('strong', {}, formatCurrency(totals.debits))
                            ),
                            React.createElement('td', { key: 'credit-total', className: 'amount' },
                                React.createElement('strong', {}, formatCurrency(totals.credits))
                            )
                        ])
                    )
                ])
            ),

            // Variance Display (if not balanced)
            !isBalanced && React.createElement('div', { key: 'variance', className: 'tb-variance' }, [
                React.createElement('span', { key: 'label' }, 'Variance: '),
                React.createElement('span', { key: 'amount', className: 'variance-amount' }, 
                    formatCurrency(Math.abs(totals.debits - totals.credits))
                )
            ]),

            // Export Options
            React.createElement('div', { key: 'exports', className: 'tb-export-options' }, [
                React.createElement('button', {
                    key: 'pdf',
                    className: 'btn btn-outline',
                    onClick: exportToPDF
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-file-pdf' }),
                    'Export PDF'
                ]),
                
                React.createElement('button', {
                    key: 'excel',
                    className: 'btn btn-outline',
                    onClick: exportToExcel
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-file-excel' }),
                    'Export Excel'
                ])
            ])
        ]);
    });
})();

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.TrialBalanceModule = TrialBalanceModule;