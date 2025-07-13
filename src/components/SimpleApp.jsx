// SimpleApp.jsx - Simplified Main Application
const SimpleApp = () => {
    const [state, setState] = React.useState({
        isAuthenticated: false,
        currentUser: null,
        currentView: 'login',
        userRole: null,
        loading: false
    });

    // Check for existing session on mount
    React.useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        const savedAuth = localStorage.getItem('isAuthenticated');
        
        if (savedUser && savedAuth === 'true') {
            const userData = JSON.parse(savedUser);
            setState(prev => ({
                ...prev,
                isAuthenticated: true,
                currentUser: userData,
                userRole: userData.role,
                currentView: getDefaultView(userData.role)
            }));
        }
    }, []);

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
        setState(prev => ({ ...prev, loading: true }));
        
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const mockUsers = {
                'admin@demo.com': {
                    id: 'USR001',
                    name: 'John Admin',
                    email: 'admin@demo.com',
                    role: 'property_manager',
                    company: { id: 'COMP001', name: 'Demo Property Management' }
                },
                'superadmin@system.com': {
                    id: 'SA001',
                    name: 'System Administrator',
                    email: 'superadmin@system.com',
                    role: 'super_admin',
                    company: null
                },
                'vendor@demo.com': {
                    id: 'VND001',
                    name: 'ABC Plumbing',
                    email: 'vendor@demo.com',
                    role: 'vendor',
                    company: { id: 'VND_COMP001', name: 'ABC Plumbing Services' }
                },
                'resident@demo.com': {
                    id: 'RES001',
                    name: 'Jane Resident',
                    email: 'resident@demo.com',
                    role: 'resident',
                    unit: '3B',
                    property: 'Sunset Apartments'
                }
            };

            const user = mockUsers[credentials.email];
            if (!user) {
                throw new Error('Invalid credentials');
            }

            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');

            setState(prev => ({
                ...prev,
                isAuthenticated: true,
                currentUser: user,
                userRole: user.role,
                currentView: getDefaultView(user.role),
                loading: false
            }));

            showToast('Login successful!', 'success');

        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
            setState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAuthenticated');
        
        setState({
            isAuthenticated: false,
            currentUser: null,
            currentView: 'login',
            userRole: null,
            loading: false
        });

        showToast('Logged out successfully', 'info');
    };

    const showToast = (message, type = 'info') => {
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
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 100);
        
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
        return React.createElement(SimpleLoginPage, {
            onLogin: handleLogin,
            loading: state.loading
        });
    }

    return React.createElement('div', { className: 'main-app' }, [
        React.createElement(SimpleHeader, {
            key: 'header',
            user: state.currentUser,
            currentView: state.currentView,
            onViewChange: (view) => setState(prev => ({ ...prev, currentView: view })),
            onLogout: handleLogout
        }),
        React.createElement('main', { key: 'main', className: 'app-main' },
            renderCurrentView()
        )
    ]);

    function renderCurrentView() {
        switch (state.currentView) {
            case 'super_admin':
                if (window.AppModules && window.AppModules.SuperAdminPanel) {
                    return React.createElement(window.AppModules.SuperAdminPanel, {
                        superAdminId: state.currentUser.id
                    });
                }
                break;
            
            case 'dashboard':
                return React.createElement(SimpleDashboard, {
                    userRole: state.userRole,
                    onSelectModule: (view) => setState(prev => ({ ...prev, currentView: view }))
                });
            
            case 'leasing_system':
                if (window.AppModules && window.AppModules.LeasingSystem) {
                    return React.createElement(window.AppModules.LeasingSystem, {
                        companyId: state.currentUser.company?.id
                    });
                }
                break;
            
            case 'resident_portal':
                if (window.AppModules && window.AppModules.ResidentPortal) {
                    return React.createElement(window.AppModules.ResidentPortal, {
                        tenantId: state.currentUser.id,
                        unit: state.currentUser.unit,
                        property: state.currentUser.property
                    });
                }
                break;
            
            case 'vendor_portal':
                if (window.AppModules && window.AppModules.VendorPortal) {
                    return React.createElement(window.AppModules.VendorPortal, {
                        vendorId: state.currentUser.id,
                        vendorData: state.currentUser
                    });
                }
                break;
            
            default:
                return React.createElement('div', { 
                    style: { padding: '40px', textAlign: 'center' }
                }, [
                    React.createElement('h2', { key: 'title' }, 'Module Loading...'),
                    React.createElement('p', { key: 'desc' }, `Attempting to load: ${state.currentView}`),
                    React.createElement('button', {
                        key: 'back',
                        onClick: () => setState(prev => ({ ...prev, currentView: 'dashboard' })),
                        style: {
                            padding: '10px 20px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }
                    }, 'Back to Dashboard')
                ]);
        }
    }
};

// Simple Login Page
const SimpleLoginPage = ({ onLogin, loading }) => {
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
        showDemo: false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.email && formData.password) {
            onLogin({ email: formData.email, password: formData.password });
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
                    React.createElement('h1', { key: 'title' }, 'PropertyOS'),
                    React.createElement('p', { key: 'subtitle' }, 'Property Management System')
                ]),

                React.createElement('form', { key: 'form', onSubmit: handleSubmit }, [
                    React.createElement('div', { key: 'email', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Email'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'email',
                            value: formData.email,
                            onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })),
                            placeholder: 'Enter your email',
                            required: true
                        })
                    ]),

                    React.createElement('div', { key: 'password', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Password'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'password',
                            value: formData.password,
                            onChange: (e) => setFormData(prev => ({ ...prev, password: e.target.value })),
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
                        onClick: () => setFormData(prev => ({ ...prev, showDemo: !prev.showDemo }))
                    }, formData.showDemo ? 'Hide Demo Accounts' : 'Show Demo Accounts'),

                    formData.showDemo && React.createElement('div', { key: 'accounts', className: 'demo-accounts' },
                        demoAccounts.map((account, idx) =>
                            React.createElement('div', {
                                key: idx,
                                className: 'demo-account',
                                onClick: () => setFormData(prev => ({
                                    ...prev,
                                    email: account.email,
                                    password: 'demo123'
                                }))
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
};

// Simple Header
const SimpleHeader = ({ user, currentView, onViewChange, onLogout }) => {
    const getNavItems = () => {
        switch (user.role) {
            case 'super_admin':
                return [{ id: 'super_admin', label: 'Platform Admin', icon: 'fa-crown' }];
            case 'property_manager':
            case 'admin':
                return [
                    { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
                    { id: 'leasing_system', label: 'Leasing', icon: 'fa-key' }
                ];
            case 'vendor':
                return [{ id: 'vendor_portal', label: 'My Jobs', icon: 'fa-briefcase' }];
            case 'resident':
                return [{ id: 'resident_portal', label: 'My Home', icon: 'fa-home' }];
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
};

// Simple Dashboard
const SimpleDashboard = ({ userRole, onSelectModule }) => {
    const modules = [
        {
            id: 'leasing_system',
            title: 'Leasing System',
            description: 'Manage leases and applications',
            icon: 'fa-key',
            color: 'blue'
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
                    ])
                ])
            )
        )
    ]);
};

// Export
window.AppModules = window.AppModules || {};
window.AppModules.SimpleApp = SimpleApp;