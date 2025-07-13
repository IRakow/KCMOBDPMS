// ResidentPortal.jsx - Amazing Mobile-First Resident Portal
const ResidentPortal = (() => {
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
                        
                        return state;
                    },
                    formatCurrency: (amount) => {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(amount || 0);
                    },
                    formatDate: (date) => {
                        return new Date(date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('ResidentPortal', {})((props, helpers) => {
        const { useLocalState, useAsyncState, formatCurrency, formatDate } = helpers;
        
        const [state, updateState] = useLocalState({
            activeView: 'dashboard',
            showPayment: false,
            showMaintenance: false,
            maintenanceStep: 'initial',
            newMaintenanceRequest: {},
            aiChatMessages: [],
            showNotifications: false,
            mobileMenuOpen: false
        });

        // Load tenant data
        const tenantData = useAsyncState(async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                name: 'Sarah Johnson',
                unit: '3B',
                property: 'Sunset Apartments',
                rentAmount: 2500,
                dueDate: '1st',
                balance: 0,
                leaseEnd: '2025-12-31',
                profileImage: null,
                notifications: 3,
                maintenanceRequests: {
                    open: 1,
                    inProgress: 0,
                    completed: 5
                },
                paymentHistory: [
                    { date: '2025-01-01', amount: 2500, status: 'paid', method: 'Valor' },
                    { date: '2024-12-01', amount: 2500, status: 'paid', method: 'Valor' }
                ],
                documents: [
                    { name: 'Lease Agreement', date: '2024-01-15', type: 'lease' },
                    { name: 'Move-in Inspection', date: '2024-01-10', type: 'inspection' }
                ]
            };
        }, []);

        if (tenantData.loading) {
            return React.createElement('div', { className: 'resident-portal-loading' }, [
                React.createElement('div', { key: 'spinner', className: 'portal-spinner' }),
                React.createElement('p', { key: 'text' }, 'Loading your portal...')
            ]);
        }

        const tenant = tenantData.data || {};

        return React.createElement('div', { className: 'resident-portal' }, [
            // Mobile Header
            React.createElement('header', { key: 'header', className: 'portal-header' }, [
                React.createElement('div', { key: 'header-content', className: 'header-content' }, [
                    React.createElement('button', {
                        key: 'menu',
                        className: 'mobile-menu-btn',
                        onClick: () => updateState({ mobileMenuOpen: !state.mobileMenuOpen })
                    }, React.createElement('i', { className: 'fas fa-bars' })),
                    
                    React.createElement('div', { key: 'title', className: 'portal-title' }, [
                        React.createElement('h1', { key: 'name' }, tenant.property),
                        React.createElement('p', { key: 'unit' }, `Unit ${tenant.unit}`)
                    ]),
                    
                    React.createElement('button', {
                        key: 'notifications',
                        className: 'notification-btn',
                        onClick: () => updateState({ showNotifications: !state.showNotifications })
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-bell' }),
                        tenant.notifications > 0 && React.createElement('span', { key: 'badge', className: 'notification-badge' }, tenant.notifications)
                    ])
                ])
            ]),

            // Quick Actions Bar
            React.createElement('div', { key: 'quick-actions', className: 'quick-actions-bar' }, [
                React.createElement('button', {
                    key: 'pay',
                    className: 'quick-action-btn primary',
                    onClick: () => updateState({ showPayment: true })
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-credit-card' }),
                    React.createElement('span', { key: 'text' }, 'Pay Rent')
                ]),
                
                React.createElement('button', {
                    key: 'maintenance',
                    className: 'quick-action-btn',
                    onClick: () => updateState({ showMaintenance: true })
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-tools' }),
                    React.createElement('span', { key: 'text' }, 'Maintenance')
                ]),
                
                React.createElement('button', {
                    key: 'documents',
                    className: 'quick-action-btn',
                    onClick: () => updateState({ activeView: 'documents' })
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-file-alt' }),
                    React.createElement('span', { key: 'text' }, 'Documents')
                ])
            ]),

            // Main Content Area
            React.createElement('main', { key: 'main', className: 'portal-main' }, [
                // Dashboard View
                state.activeView === 'dashboard' && React.createElement(ResidentDashboard, {
                    key: 'dashboard',
                    tenant: tenant,
                    onPayRent: () => updateState({ showPayment: true }),
                    onNewMaintenance: () => updateState({ showMaintenance: true })
                }),

                // Documents View
                state.activeView === 'documents' && React.createElement(DocumentsView, {
                    key: 'documents',
                    documents: tenant.documents || []
                })
            ]),

            // Payment Modal (Valor Integration)
            state.showPayment && React.createElement(ValorPaymentModal, {
                key: 'payment',
                tenant: tenant,
                onClose: () => updateState({ showPayment: false }),
                onSuccess: () => {
                    window.Toast?.success('Payment successful!');
                    updateState({ showPayment: false });
                }
            }),

            // AI Maintenance Modal
            state.showMaintenance && React.createElement(AIMaintenanceModal, {
                key: 'maintenance',
                tenant: tenant,
                step: state.maintenanceStep,
                request: state.newMaintenanceRequest,
                chatMessages: state.aiChatMessages,
                onUpdateRequest: (updates) => updateState({ 
                    newMaintenanceRequest: { ...state.newMaintenanceRequest, ...updates }
                }),
                onUpdateChat: (messages) => updateState({ aiChatMessages: messages }),
                onChangeStep: (step) => updateState({ maintenanceStep: step }),
                onClose: () => updateState({ 
                    showMaintenance: false,
                    maintenanceStep: 'initial',
                    newMaintenanceRequest: {},
                    aiChatMessages: []
                })
            }),

            // Mobile Navigation Menu
            state.mobileMenuOpen && React.createElement('div', { 
                key: 'mobile-menu',
                className: 'mobile-menu-overlay',
                onClick: () => updateState({ mobileMenuOpen: false })
            }, 
                React.createElement('div', { 
                    className: 'mobile-menu',
                    onClick: (e) => e.stopPropagation()
                }, [
                    React.createElement('div', { key: 'header', className: 'menu-header' }, [
                        React.createElement('h2', { key: 'name' }, tenant.name),
                        React.createElement('p', { key: 'unit' }, `Unit ${tenant.unit}`)
                    ]),
                    React.createElement('nav', { key: 'nav', className: 'menu-items' }, [
                        ['Dashboard', 'fa-home', 'dashboard'],
                        ['Payments', 'fa-credit-card', 'payments'],
                        ['Maintenance', 'fa-tools', 'maintenance'],
                        ['Documents', 'fa-file-alt', 'documents'],
                        ['Profile', 'fa-user', 'profile'],
                        ['Settings', 'fa-cog', 'settings']
                    ].map(([label, icon, view]) =>
                        React.createElement('button', {
                            key: view,
                            className: `menu-item ${state.activeView === view ? 'active' : ''}`,
                            onClick: () => {
                                updateState({ activeView: view, mobileMenuOpen: false });
                            }
                        }, [
                            React.createElement('i', { key: 'icon', className: `fas ${icon}` }),
                            React.createElement('span', { key: 'label' }, label)
                        ])
                    )),
                    React.createElement('button', {
                        key: 'logout',
                        className: 'menu-item logout',
                        onClick: () => window.location.href = '/logout'
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-sign-out-alt' }),
                        React.createElement('span', { key: 'label' }, 'Sign Out')
                    ])
                ])
            )
        ]);
    });
})();

// Resident Dashboard Component
const ResidentDashboard = ComponentFactory.createComponent('ResidentDashboard', {})((props, helpers) => {
    const { tenant, onPayRent, onNewMaintenance } = props;
    const { formatCurrency, formatDate } = helpers;

    return React.createElement('div', { className: 'resident-dashboard' }, [
        // Rent Status Card
        React.createElement('div', { key: 'rent-status', className: 'dashboard-card rent-status-card' }, [
            React.createElement('div', { key: 'header', className: 'card-header' }, [
                React.createElement('h3', { key: 'title' }, 'Rent Status'),
                React.createElement('span', { key: 'status', className: 'status-badge paid' }, 'Current')
            ]),
            React.createElement('div', { key: 'amount', className: 'rent-amount' }, [
                React.createElement('span', { key: 'label' }, 'Monthly Rent'),
                React.createElement('span', { key: 'value' }, formatCurrency(tenant.rentAmount))
            ]),
            React.createElement('div', { key: 'due', className: 'rent-due' }, [
                React.createElement('span', { key: 'label' }, 'Due on the'),
                React.createElement('span', { key: 'value' }, tenant.dueDate)
            ]),
            tenant.balance > 0 && React.createElement('div', { key: 'balance', className: 'outstanding-balance' }, [
                React.createElement('span', { key: 'label' }, 'Outstanding Balance'),
                React.createElement('span', { key: 'value' }, formatCurrency(tenant.balance))
            ]),
            React.createElement('button', {
                key: 'pay-btn',
                className: 'pay-rent-btn',
                onClick: onPayRent
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-credit-card' }),
                'Pay Rent Now'
            ])
        ]),

        // Maintenance Overview
        React.createElement('div', { key: 'maintenance', className: 'dashboard-card maintenance-card' }, [
            React.createElement('div', { key: 'header', className: 'card-header' }, [
                React.createElement('h3', { key: 'title' }, 'Maintenance'),
                React.createElement('button', {
                    key: 'new',
                    className: 'new-request-btn',
                    onClick: onNewMaintenance
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                    'New Request'
                ])
            ]),
            React.createElement('div', { key: 'stats', className: 'maintenance-stats' }, [
                React.createElement('div', { key: 'open', className: 'stat' }, [
                    React.createElement('span', { key: 'value', className: 'stat-value' }, tenant.maintenanceRequests?.open || 0),
                    React.createElement('span', { key: 'label', className: 'stat-label' }, 'Open')
                ]),
                React.createElement('div', { key: 'progress', className: 'stat' }, [
                    React.createElement('span', { key: 'value', className: 'stat-value' }, tenant.maintenanceRequests?.inProgress || 0),
                    React.createElement('span', { key: 'label', className: 'stat-label' }, 'In Progress')
                ]),
                React.createElement('div', { key: 'completed', className: 'stat' }, [
                    React.createElement('span', { key: 'value', className: 'stat-value' }, tenant.maintenanceRequests?.completed || 0),
                    React.createElement('span', { key: 'label', className: 'stat-label' }, 'Completed')
                ])
            ])
        ]),

        // Recent Activity
        React.createElement('div', { key: 'activity', className: 'dashboard-card activity-card' }, [
            React.createElement('h3', { key: 'title' }, 'Recent Activity'),
            React.createElement('div', { key: 'timeline', className: 'activity-timeline' }, [
                { icon: 'fa-check-circle', text: 'January rent paid', date: '2025-01-01', type: 'success' },
                { icon: 'fa-tools', text: 'Maintenance request completed', date: '2024-12-28', type: 'info' },
                { icon: 'fa-file-alt', text: 'Lease renewal reminder', date: '2024-12-15', type: 'warning' }
            ].map((activity, idx) =>
                React.createElement('div', { key: idx, className: `activity-item ${activity.type}` }, [
                    React.createElement('i', { key: 'icon', className: `fas ${activity.icon}` }),
                    React.createElement('div', { key: 'content', className: 'activity-content' }, [
                        React.createElement('p', { key: 'text' }, activity.text),
                        React.createElement('span', { key: 'date', className: 'activity-date' }, formatDate(activity.date))
                    ])
                ])
            ))
        ]),

        // Quick Links
        React.createElement('div', { key: 'quick-links', className: 'dashboard-card quick-links-card' }, [
            React.createElement('h3', { key: 'title' }, 'Quick Links'),
            React.createElement('div', { key: 'links', className: 'quick-links-grid' }, [
                { icon: 'fa-file-contract', label: 'View Lease', action: 'viewLease' },
                { icon: 'fa-history', label: 'Payment History', action: 'paymentHistory' },
                { icon: 'fa-user-shield', label: 'Renters Insurance', action: 'insurance' },
                { icon: 'fa-question-circle', label: 'FAQ', action: 'faq' }
            ].map(link =>
                React.createElement('button', {
                    key: link.action,
                    className: 'quick-link',
                    onClick: () => console.log(`Navigate to ${link.action}`)
                }, [
                    React.createElement('i', { key: 'icon', className: `fas ${link.icon}` }),
                    React.createElement('span', { key: 'label' }, link.label)
                ])
            ))
        ])
    ]);
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.ResidentPortal = ResidentPortal;
window.AppModules.ResidentDashboard = ResidentDashboard;