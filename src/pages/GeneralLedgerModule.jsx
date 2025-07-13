// GeneralLedgerModule.jsx - General Ledger Module
const GeneralLedgerModule = (() => {
    const ComponentFactory = {
        createComponent: (name, options = {}) => (componentFunc) => {
            const Component = (props) => {
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
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('GeneralLedgerModule', {})((props, helpers) => {
        const { period, filters } = props;
        const { useLocalState, useAsyncState, formatCurrency } = helpers;

        const [state, updateState] = useLocalState({
            selectedAccount: null,
            showJournalEntry: false,
            newJEData: {},
            searchQuery: '',
            sortBy: 'date',
            sortOrder: 'desc'
        });

        const glData = useAsyncState(async () => {
            // Simulate API call - return sample data
            await new Promise(resolve => setTimeout(resolve, 800));
            return {
                transactions: [
                    {
                        je_number: 'JE202501-0001',
                        je_date: '2025-01-15',
                        memo: 'January Rent Collection',
                        source_module: 'AR',
                        lines: [
                            { account: '1100 - Cash', debit: 125000, credit: 0, property: 'Sunset Apartments' },
                            { account: '4100 - Rental Income', debit: 0, credit: 125000, property: 'Sunset Apartments' }
                        ]
                    },
                    {
                        je_number: 'JE202501-0002',
                        je_date: '2025-01-10',
                        memo: 'Property Management Fee',
                        source_module: 'AP',
                        lines: [
                            { account: '6100 - Management Fees', debit: 20000, credit: 0, property: 'All Properties' },
                            { account: '2100 - Accounts Payable', debit: 0, credit: 20000, property: 'All Properties' }
                        ]
                    },
                    {
                        je_number: 'JE202501-0003',
                        je_date: '2025-01-08',
                        memo: 'Maintenance and Repairs',
                        source_module: 'AP',
                        lines: [
                            { account: '6200 - Maintenance', debit: 5500, credit: 0, property: 'Downtown Plaza' },
                            { account: '1100 - Cash', debit: 0, credit: 5500, property: 'Downtown Plaza' }
                        ]
                    }
                ]
            };
        }, [period, filters, state.searchQuery, state.sortBy, state.sortOrder]);

        const chartOfAccounts = useAsyncState(async () => {
            // Simulate chart of accounts
            await new Promise(resolve => setTimeout(resolve, 500));
            return [
                { id: '1100', name: '1100 - Cash', type: 'Asset' },
                { id: '1200', name: '1200 - Accounts Receivable', type: 'Asset' },
                { id: '2100', name: '2100 - Accounts Payable', type: 'Liability' },
                { id: '3100', name: '3100 - Owner Equity', type: 'Equity' },
                { id: '4100', name: '4100 - Rental Income', type: 'Revenue' },
                { id: '6100', name: '6100 - Management Fees', type: 'Expense' },
                { id: '6200', name: '6200 - Maintenance', type: 'Expense' }
            ];
        }, []);

        const createJournalEntry = async (jeData) => {
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                updateState({ showJournalEntry: false, newJEData: {} });
                glData.refetch();
                window.Toast && window.Toast.success('Journal entry created successfully');
            } catch (error) {
                window.Toast && window.Toast.error('Failed to create journal entry: ' + error.message);
            }
        };

        return React.createElement('div', { className: 'general-ledger-module' }, [
            // GL Controls
            React.createElement('div', { key: 'controls', className: 'gl-controls' }, [
                React.createElement('div', { key: 'search', className: 'gl-search' },
                    React.createElement('input', {
                        type: 'text',
                        placeholder: 'Search transactions...',
                        value: state.searchQuery,
                        onChange: (e) => updateState({ searchQuery: e.target.value })
                    })
                ),
                
                React.createElement('button', {
                    key: 'new-je',
                    className: 'btn btn-primary',
                    onClick: () => updateState({ showJournalEntry: true })
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                    'New Journal Entry'
                ])
            ]),

            // GL Transaction List
            React.createElement('div', { key: 'transactions', className: 'gl-transactions' },
                glData.loading 
                    ? React.createElement('div', { className: 'loading' }, 'Loading transactions...')
                    : React.createElement(GLTransactionList, {
                        transactions: glData.data?.transactions || [],
                        accounts: chartOfAccounts.data || [],
                        onTransactionClick: (transaction) => updateState({ selectedTransaction: transaction })
                    })
            ),

            // New Journal Entry Modal
            state.showJournalEntry && React.createElement(JournalEntryModal, {
                key: 'je-modal',
                accounts: chartOfAccounts.data || [],
                onSave: createJournalEntry,
                onClose: () => updateState({ showJournalEntry: false })
            })
        ]);
    });
})();

// GL Transaction List Component
const GLTransactionList = (() => {
    return (props) => {
        const { transactions, onTransactionClick } = props;
        
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount || 0);
        };
        
        return React.createElement('div', { className: 'transaction-list' },
            transactions.map((transaction, index) =>
                React.createElement('div', { 
                    key: index, 
                    className: 'transaction-item',
                    onClick: () => onTransactionClick && onTransactionClick(transaction)
                }, [
                    React.createElement('div', { key: 'date', className: 'transaction-date' }, transaction.je_date),
                    React.createElement('div', { key: 'info', className: 'transaction-info' }, [
                        React.createElement('div', { key: 'number', className: 'transaction-number' }, transaction.je_number),
                        React.createElement('div', { key: 'desc', className: 'transaction-description' }, transaction.memo),
                        React.createElement('div', { key: 'source', className: 'transaction-source' }, 
                            `Source: ${transaction.source_module}`
                        )
                    ]),
                    React.createElement('div', { key: 'lines', className: 'transaction-lines' },
                        transaction.lines.map((line, lineIndex) =>
                            React.createElement('div', { key: lineIndex, className: 'line-item' }, [
                                React.createElement('span', { key: 'account', className: 'line-account' }, line.account),
                                line.debit > 0 && React.createElement('span', { key: 'debit', className: 'amount-debit' }, 
                                    formatCurrency(line.debit)
                                ),
                                line.credit > 0 && React.createElement('span', { key: 'credit', className: 'amount-credit' }, 
                                    formatCurrency(line.credit)
                                ),
                                React.createElement('span', { key: 'property', className: 'line-property' }, line.property)
                            ])
                        )
                    ),
                    React.createElement('div', { key: 'actions', className: 'transaction-actions' }, [
                        React.createElement('button', { key: 'view', className: 'action-btn' }, 
                            React.createElement('i', { className: 'fas fa-eye' })
                        ),
                        React.createElement('button', { key: 'print', className: 'action-btn' }, 
                            React.createElement('i', { className: 'fas fa-print' })
                        )
                    ])
                ])
            )
        );
    };
})();

// Journal Entry Modal Component
const JournalEntryModal = (() => {
    const ComponentFactory = {
        createComponent: (name) => (componentFunc) => {
            const Component = (props) => {
                const helpers = {
                    useLocalState: (initialState) => {
                        const [state, setState] = React.useState(initialState);
                        const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
                        return [state, updateState];
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('JournalEntryModal')((props, helpers) => {
        const { accounts, onSave, onClose } = props;
        const [state, updateState] = helpers.useLocalState({
            date: new Date().toISOString().split('T')[0],
            memo: '',
            lines: [
                { account: '', debit: 0, credit: 0, description: '' },
                { account: '', debit: 0, credit: 0, description: '' }
            ]
        });

        const addLine = () => {
            updateState({
                lines: [...state.lines, { account: '', debit: 0, credit: 0, description: '' }]
            });
        };

        const updateLine = (index, field, value) => {
            const newLines = [...state.lines];
            newLines[index][field] = value;
            updateState({ lines: newLines });
        };

        const removeLine = (index) => {
            const newLines = state.lines.filter((_, i) => i !== index);
            updateState({ lines: newLines });
        };

        const getTotalDebits = () => {
            return state.lines.reduce((sum, line) => sum + parseFloat(line.debit || 0), 0);
        };

        const getTotalCredits = () => {
            return state.lines.reduce((sum, line) => sum + parseFloat(line.credit || 0), 0);
        };

        const isBalanced = () => {
            return Math.abs(getTotalDebits() - getTotalCredits()) < 0.01;
        };

        const handleSave = () => {
            if (!isBalanced()) {
                alert('Journal entry must be balanced!');
                return;
            }
            onSave({
                je_date: state.date,
                memo: state.memo,
                lines: state.lines
            });
        };

        return React.createElement('div', { className: 'modal-overlay', onClick: onClose },
            React.createElement('div', { 
                className: 'modal-content journal-entry-modal',
                onClick: (e) => e.stopPropagation()
            }, [
                React.createElement('div', { key: 'header', className: 'modal-header' }, [
                    React.createElement('h2', { key: 'title' }, 'New Journal Entry'),
                    React.createElement('button', { 
                        key: 'close',
                        className: 'close-btn',
                        onClick: onClose
                    }, '×')
                ]),
                
                React.createElement('div', { key: 'body', className: 'modal-body' }, [
                    React.createElement('div', { key: 'form-row', className: 'form-row' }, [
                        React.createElement('div', { key: 'date', className: 'form-group' }, [
                            React.createElement('label', { key: 'label' }, 'Date'),
                            React.createElement('input', {
                                key: 'input',
                                type: 'date',
                                value: state.date,
                                onChange: (e) => updateState({ date: e.target.value })
                            })
                        ]),
                        React.createElement('div', { key: 'memo', className: 'form-group flex-grow' }, [
                            React.createElement('label', { key: 'label' }, 'Memo'),
                            React.createElement('input', {
                                key: 'input',
                                type: 'text',
                                value: state.memo,
                                onChange: (e) => updateState({ memo: e.target.value }),
                                placeholder: 'Enter description...'
                            })
                        ])
                    ]),
                    
                    React.createElement('div', { key: 'lines', className: 'je-lines' }, [
                        React.createElement('table', { key: 'table', className: 'je-lines-table' }, [
                            React.createElement('thead', { key: 'thead' },
                                React.createElement('tr', {}, [
                                    React.createElement('th', { key: 'account' }, 'Account'),
                                    React.createElement('th', { key: 'desc' }, 'Description'),
                                    React.createElement('th', { key: 'debit' }, 'Debit'),
                                    React.createElement('th', { key: 'credit' }, 'Credit'),
                                    React.createElement('th', { key: 'actions' }, '')
                                ])
                            ),
                            React.createElement('tbody', { key: 'tbody' },
                                state.lines.map((line, index) =>
                                    React.createElement('tr', { key: index }, [
                                        React.createElement('td', { key: 'account' },
                                            React.createElement('select', {
                                                value: line.account,
                                                onChange: (e) => updateLine(index, 'account', e.target.value)
                                            }, [
                                                React.createElement('option', { key: 'empty', value: '' }, 'Select account...'),
                                                ...accounts.map(account =>
                                                    React.createElement('option', { 
                                                        key: account.id, 
                                                        value: account.name 
                                                    }, account.name)
                                                )
                                            ])
                                        ),
                                        React.createElement('td', { key: 'desc' },
                                            React.createElement('input', {
                                                type: 'text',
                                                value: line.description,
                                                onChange: (e) => updateLine(index, 'description', e.target.value)
                                            })
                                        ),
                                        React.createElement('td', { key: 'debit' },
                                            React.createElement('input', {
                                                type: 'number',
                                                value: line.debit || '',
                                                onChange: (e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0),
                                                min: '0',
                                                step: '0.01'
                                            })
                                        ),
                                        React.createElement('td', { key: 'credit' },
                                            React.createElement('input', {
                                                type: 'number',
                                                value: line.credit || '',
                                                onChange: (e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0),
                                                min: '0',
                                                step: '0.01'
                                            })
                                        ),
                                        React.createElement('td', { key: 'actions' },
                                            state.lines.length > 2 && React.createElement('button', {
                                                className: 'remove-line-btn',
                                                onClick: () => removeLine(index)
                                            }, '×')
                                        )
                                    ])
                                )
                            )
                        ]),
                        React.createElement('button', {
                            key: 'add-line',
                            className: 'add-line-btn',
                            onClick: addLine
                        }, '+ Add Line')
                    ]),
                    
                    React.createElement('div', { key: 'totals', className: 'je-totals' }, [
                        React.createElement('div', { key: 'debit', className: 'total-item' }, [
                            React.createElement('span', { key: 'label' }, 'Total Debits:'),
                            React.createElement('span', { key: 'value' }, `$${getTotalDebits().toFixed(2)}`)
                        ]),
                        React.createElement('div', { key: 'credit', className: 'total-item' }, [
                            React.createElement('span', { key: 'label' }, 'Total Credits:'),
                            React.createElement('span', { key: 'value' }, `$${getTotalCredits().toFixed(2)}`)
                        ]),
                        React.createElement('div', { 
                            key: 'balance', 
                            className: `total-item ${isBalanced() ? 'balanced' : 'unbalanced'}` 
                        }, [
                            React.createElement('span', { key: 'label' }, 'Status:'),
                            React.createElement('span', { key: 'value' }, isBalanced() ? 'Balanced' : 'Unbalanced')
                        ])
                    ])
                ]),
                
                React.createElement('div', { key: 'footer', className: 'modal-footer' }, [
                    React.createElement('button', {
                        key: 'cancel',
                        className: 'btn btn-secondary',
                        onClick: onClose
                    }, 'Cancel'),
                    React.createElement('button', {
                        key: 'save',
                        className: 'btn btn-primary',
                        onClick: handleSave,
                        disabled: !isBalanced()
                    }, 'Save Journal Entry')
                ])
            ])
        );
    });
})();

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.GeneralLedgerModule = GeneralLedgerModule;