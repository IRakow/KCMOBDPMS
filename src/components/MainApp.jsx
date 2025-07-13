// MainApp.jsx - Main Application Router with Authentication
const MainApp = (() => {
    const ComponentFactory = {
        createComponent: (name) => (componentFunc) => {
            const Component = (props) => {
                const helpers = {
                    useLocalState: (initialState) => {
                        const [state, setState] = React.useState(initialState);
                        const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
                        return [state, updateState];
                    },
                    formatDate: (date) => {
                        return new Date(date).toLocaleDateString('en-US', {
                            month: 'long',
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

    return ComponentFactory.createComponent('MainApp')((props, helpers) => {
        const { useLocalState } = helpers;

        const [state, updateState] = useLocalState({
            isAuthenticated: false,
            currentUser: null,
            currentView: 'login',
            userRole: null,
            companyData: null,
            loading: false
        });

        // Check for existing session on mount
        React.useEffect(() => {
            checkExistingSession();
        }, []);

        const checkExistingSession = () => {
            const savedUser = localStorage.getItem('currentUser');
            const savedAuth = localStorage.getItem('isAuthenticated');
            
            if (savedUser && savedAuth === 'true') {
                const userData = JSON.parse(savedUser);
                updateState({
                    isAuthenticated: true,
                    currentUser: userData,
                    userRole: userData.role,
                    companyData: userData.company,
                    currentView: getDefaultView(userData.role)
                });
            }
        };

        const getDefaultView = (role) => {
            switch (role) {
                case 'super_admin':
                    return 'super_admin';
                case 'property_manager':
                case 'admin':
                    return 'dashboard';
                case 'resident':
                    return 'resident_portal';
                case 'vendor':
                    return 'vendor_portal';
                default:
                    return 'dashboard';
            }
        };

        const handleLogin = async (credentials) => {
            updateState({ loading: true });
            
            try {
                // Simulate authentication - replace with real API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Mock user data based on login
                const mockUsers = {
                    'admin@demo.com': {
                        id: 'USR001',
                        name: 'John Admin',
                        email: 'admin@demo.com',
                        role: 'property_manager',
                        company: {
                            id: 'COMP001',
                            name: 'Demo Property Management',
                            plan: 'professional'
                        },
                        permissions: ['all']
                    },
                    'superadmin@system.com': {
                        id: 'SA001',
                        name: 'System Administrator',
                        email: 'superadmin@system.com',
                        role: 'super_admin',
                        company: null,
                        permissions: ['platform_admin']
                    },
                    'vendor@demo.com': {
                        id: 'VND001',
                        name: 'ABC Plumbing',
                        email: 'vendor@demo.com',
                        role: 'vendor',
                        company: {
                            id: 'VND_COMP001',
                            name: 'ABC Plumbing Services'
                        },
                        permissions: ['vendor_portal']
                    },
                    'resident@demo.com': {
                        id: 'RES001',
                        name: 'Jane Resident',
                        email: 'resident@demo.com',
                        role: 'resident',
                        company: null,
                        unit: '3B',
                        property: 'Sunset Apartments',
                        permissions: ['resident_portal']
                    }
                };

                const user = mockUsers[credentials.email];
                if (!user) {
                    throw new Error('Invalid credentials');
                }

                // Store session
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('isAuthenticated', 'true');

                updateState({
                    isAuthenticated: true,
                    currentUser: user,
                    userRole: user.role,
                    companyData: user.company,
                    currentView: getDefaultView(user.role),
                    loading: false
                });

                // Show success toast
                showToast('Login successful!', 'success');

            } catch (error) {
                showToast(error.message || 'Login failed', 'error');
                updateState({ loading: false });
            }
        };

        const handleLogout = () => {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('isAuthenticated');
            
            updateState({
                isAuthenticated: false,
                currentUser: null,
                currentView: 'login',
                userRole: null,
                companyData: null
            });

            showToast('Logged out successfully', 'info');
        };

        const showToast = (message, type = 'info') => {
            // Create toast notification
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                ${type === 'success' ? 'background: #10b981;' : ''}
                ${type === 'error' ? 'background: #ef4444;' : ''}
                ${type === 'info' ? 'background: #3b82f6;' : ''}
            `;
            
            document.body.appendChild(toast);
            
            // Animate in
            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(0)';
            }, 100);
            
            // Remove after 3 seconds
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 3000);
        };

        // Make toast available globally
        React.useEffect(() => {
            window.Toast = {
                success: (msg) => showToast(msg, 'success'),
                error: (msg) => showToast(msg, 'error'),
                info: (msg) => showToast(msg, 'info')
            };
        }, []);

        if (!state.isAuthenticated) {
            return React.createElement(LoginPage, {
                onLogin: handleLogin,
                loading: state.loading
            });
        }

        return React.createElement('div', { className: 'main-app' }, [
            React.createElement(AppHeader, {
                key: 'header',
                user: state.currentUser,
                currentView: state.currentView,
                onViewChange: (view) => updateState({ currentView: view }),
                onLogout: handleLogout
            }),
            React.createElement('main', { key: 'main', className: 'app-main' },
                renderCurrentView()
            )
        ]);

        function renderCurrentView() {
            switch (state.currentView) {
                case 'super_admin':
                    return React.createElement(window.AppModules.SuperAdminPanel, {
                        superAdminId: state.currentUser.id
                    });
                
                case 'dashboard':
                    return React.createElement(DashboardSelector, {
                        userRole: state.userRole,
                        onSelectModule: (view) => updateState({ currentView: view })
                    });
                
                case 'financial_dashboard':
                    return React.createElement(window.AppModules.FinancialDashboard, {
                        companyId: state.companyData?.id,
                        userRole: state.userRole
                    });
                
                case 'financial_accounting':
                    return React.createElement(window.AppModules.FinancialAccountingEngine, {
                        companyId: state.companyData?.id
                    });
                
                case 'leasing_system':
                    return React.createElement(window.AppModules.LeasingSystem, {
                        companyId: state.companyData?.id
                    });
                
                case 'resident_portal':
                    return React.createElement(window.AppModules.ResidentPortal, {
                        tenantId: state.currentUser.id,
                        unit: state.currentUser.unit,
                        property: state.currentUser.property
                    });
                
                case 'vendor_portal':
                    return React.createElement(window.AppModules.VendorPortal, {
                        vendorId: state.currentUser.id,
                        vendorData: state.currentUser
                    });
                
                case 'admin_vendor_panel':
                    return React.createElement(window.AppModules.AdminVendorPanel, {
                        companyId: state.companyData?.id,
                        userId: state.currentUser.id,
                        userRole: state.userRole
                    });
                
                case 'maintenance_kanban':
                    return React.createElement(window.AppModules.MaintenanceKanban, {
                        companyId: state.companyData?.id,
                        userRole: state.userRole
                    });
                
                case 'digital_applications':
                    return React.createElement(window.AppModules.DigitalApplication, {
                        propertyId: 'PROP001',
                        unitId: 'UNIT001'
                    });
                
                case 'elease_signing':
                    return React.createElement(window.AppModules.ELeaseSigningSystem, {
                        companyId: state.companyData?.id
                    });
                
                case 'application_workflow':
                    return React.createElement(window.AppModules.ApplicationWorkflow, {
                        companyId: state.companyData?.id
                    });
                
                default:
                    return React.createElement('div', { className: 'error-view' }, [
                        React.createElement('h2', { key: 'title' }, 'Page Not Found'),
                        React.createElement('p', { key: 'desc' }, 'The requested page could not be found.'),
                        React.createElement('button', {
                            key: 'back',
                            className: 'btn btn-primary',
                            onClick: () => updateState({ currentView: getDefaultView(state.userRole) })
                        }, 'Go to Dashboard')
                    ]);
            }
        }
    });
})();

// Login Page Component
const LoginPage = ComponentFactory.createComponent('LoginPage')((props, helpers) => {
    const { onLogin, loading } = props;
    const { useLocalState } = helpers;

    const [state, updateState] = useLocalState({
        email: '',
        password: '',
        showDemo: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (state.email && state.password) {
            onLogin({ email: state.email, password: state.password });
        }
    };

    const demoAccounts = [
        { email: 'admin@demo.com', role: 'Property Manager', desc: 'Full property management access' },
        { email: 'superadmin@system.com', role: 'Super Admin', desc: 'Platform administration' },
        { email: 'vendor@demo.com', role: 'Vendor', desc: 'Service provider portal' },
        { email: 'resident@demo.com', role: 'Resident', desc: 'Tenant portal access' }
    ];

    return React.createElement('div', { className: 'login-page' }, [
        React.createElement('div', { key: 'container', className: 'login-container' }, [
            React.createElement('div', { key: 'form', className: 'login-form' }, [
                React.createElement('div', { key: 'header', className: 'login-header' }, [
                    React.createElement('h1', { key: 'title' }, 'Property Management System'),
                    React.createElement('p', { key: 'subtitle' }, 'Sign in to your account')
                ]),

                React.createElement('form', { key: 'form', onSubmit: handleSubmit }, [
                    React.createElement('div', { key: 'email', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Email Address'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'email',
                            value: state.email,
                            onChange: (e) => updateState({ email: e.target.value }),
                            placeholder: 'Enter your email',
                            required: true
                        })
                    ]),

                    React.createElement('div', { key: 'password', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Password'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'password',
                            value: state.password,
                            onChange: (e) => updateState({ password: e.target.value }),
                            placeholder: 'Enter your password',
                            required: true
                        })
                    ]),

                    React.createElement('button', {
                        key: 'submit',
                        type: 'submit',
                        className: 'login-btn',
                        disabled: loading
                    }, loading ? 'Signing in...' : 'Sign In')
                ]),

                React.createElement('div', { key: 'demo', className: 'demo-section' }, [
                    React.createElement('button', {
                        key: 'toggle',
                        type: 'button',
                        className: 'demo-toggle',
                        onClick: () => updateState({ showDemo: !state.showDemo })
                    }, state.showDemo ? 'Hide Demo Accounts' : 'Show Demo Accounts'),

                    state.showDemo && React.createElement('div', { key: 'accounts', className: 'demo-accounts' },
                        demoAccounts.map((account, idx) =>
                            React.createElement('div', {
                                key: idx,
                                className: 'demo-account',
                                onClick: () => updateState({
                                    email: account.email,
                                    password: 'demo123'
                                })
                            }, [
                                React.createElement('div', { key: 'role', className: 'account-role' }, account.role),
                                React.createElement('div', { key: 'email', className: 'account-email' }, account.email),
                                React.createElement('div', { key: 'desc', className: 'account-desc' }, account.desc)
                            ])
                        )
                    )
                ])
            ])
        ])
    ]);
});

// App Header Component
const AppHeader = ComponentFactory.createComponent('AppHeader')((props, helpers) => {
    const { user, currentView, onViewChange, onLogout } = props;

    const getNavItems = () => {
        switch (user.role) {
            case 'super_admin':
                return [
                    { id: 'super_admin', label: 'Platform Admin', icon: 'fa-crown' }
                ];
            
            case 'property_manager':
            case 'admin':
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
                    { id: 'financial_dashboard', label: 'Financial', icon: 'fa-chart-line' },
                    { id: 'leasing_system', label: 'Leasing', icon: 'fa-key' },
                    { id: 'maintenance_kanban', label: 'Maintenance', icon: 'fa-wrench' },
                    { id: 'admin_vendor_panel', label: 'Vendors', icon: 'fa-users' }
                ];
            
            case 'vendor':
                return [
                    { id: 'vendor_portal', label: 'My Jobs', icon: 'fa-briefcase' }
                ];
            
            case 'resident':
                return [
                    { id: 'resident_portal', label: 'My Home', icon: 'fa-home' }
                ];
            
            default:
                return [];
        }
    };

    return React.createElement('header', { className: 'app-header' }, [
        React.createElement('div', { key: 'brand', className: 'app-brand' }, [
            React.createElement('h1', { key: 'title' }, 'PropertyOS'),
            user.company && React.createElement('span', { key: 'company' }, user.company.name)
        ]),

        React.createElement('nav', { key: 'nav', className: 'app-nav' },
            getNavItems().map(item =>
                React.createElement('button', {
                    key: item.id,
                    className: `nav-item ${currentView === item.id ? 'active' : ''}`,
                    onClick: () => onViewChange(item.id)
                }, [
                    React.createElement('i', { key: 'icon', className: `fas ${item.icon}` }),
                    React.createElement('span', { key: 'label' }, item.label)
                ])
            )
        ),

        React.createElement('div', { key: 'user', className: 'user-section' }, [
            React.createElement('div', { key: 'info', className: 'user-info' }, [
                React.createElement('span', { key: 'name', className: 'user-name' }, user.name),
                React.createElement('span', { key: 'role', className: 'user-role' }, user.role.replace('_', ' '))
            ]),
            React.createElement('button', {
                key: 'logout',
                className: 'logout-btn',
                onClick: onLogout,
                title: 'Logout'
            }, React.createElement('i', { className: 'fas fa-sign-out-alt' }))
        ])
    ]);
});

// Dashboard Selector Component
const DashboardSelector = ComponentFactory.createComponent('DashboardSelector')((props, helpers) => {
    const { userRole, onSelectModule } = props;

    const modules = [
        {
            id: 'financial_dashboard',
            title: 'Financial Management',
            description: 'Accounting, reporting, and financial analytics',
            icon: 'fa-chart-line',
            color: 'blue'
        },
        {
            id: 'leasing_system',
            title: 'Leasing & Applications',
            description: 'Tenant applications and lease management',
            icon: 'fa-key',
            color: 'green'
        },
        {
            id: 'maintenance_kanban',
            title: 'Maintenance Management',
            description: 'Work orders, vendors, and maintenance tracking',
            icon: 'fa-wrench',
            color: 'orange'
        },
        {
            id: 'admin_vendor_panel',
            title: 'Vendor Management',
            description: 'Vendor directory and performance tracking',
            icon: 'fa-users',
            color: 'purple'
        },
        {
            id: 'digital_applications',
            title: 'Digital Applications',
            description: 'Online rental applications with AI validation',
            icon: 'fa-file-alt',
            color: 'teal'
        },
        {
            id: 'elease_signing',
            title: 'E-Lease Signing',
            description: 'Digital lease generation and DocuSign integration',
            icon: 'fa-file-signature',
            color: 'indigo'
        }
    ];

    return React.createElement('div', { className: 'dashboard-selector' }, [
        React.createElement('div', { key: 'header', className: 'selector-header' }, [
            React.createElement('h1', { key: 'title' }, 'Property Management Dashboard'),
            React.createElement('p', { key: 'desc' }, 'Select a module to get started')
        ]),

        React.createElement('div', { key: 'grid', className: 'modules-grid' },
            modules.map(module =>
                React.createElement('div', {
                    key: module.id,
                    className: `module-card ${module.color}`,
                    onClick: () => onSelectModule(module.id)
                }, [
                    React.createElement('div', { key: 'icon', className: 'module-icon' },
                        React.createElement('i', { className: `fas ${module.icon}` })
                    ),
                    React.createElement('div', { key: 'content', className: 'module-content' }, [
                        React.createElement('h3', { key: 'title' }, module.title),
                        React.createElement('p', { key: 'desc' }, module.description)
                    ]),
                    React.createElement('div', { key: 'arrow', className: 'module-arrow' },
                        React.createElement('i', { className: 'fas fa-arrow-right' })
                    )
                ])
            )
        )
    ]);
});

// Export the main app
window.AppModules = window.AppModules || {};
window.AppModules.MainApp = MainApp;