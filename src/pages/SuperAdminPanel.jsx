// SuperAdminPanel.jsx - Multi-Tenant SaaS Management for Property Management Platform
const SuperAdminPanel = (() => {
    const ComponentFactory = {
        createComponent: (name) => (componentFunc) => {
            const Component = (props) => {
                const helpers = {
                    useLocalState: (initialState) => {
                        const [state, setState] = React.useState(initialState);
                        const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
                        return [state, updateState];
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
                    },
                    formatBytes: (bytes) => {
                        if (bytes === 0) return '0 Bytes';
                        const k = 1024;
                        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('SuperAdminPanel')((props, helpers) => {
        const { useLocalState, formatCurrency, formatDate, formatBytes } = helpers;
        const { superAdminId } = props;

        const [state, updateState] = useLocalState({
            activeView: 'dashboard',
            clients: [],
            selectedClient: null,
            showClientModal: false,
            showUserModal: false,
            selectedUser: null,
            platformStats: {},
            systemHealth: {},
            aiUsageMetrics: {},
            billingData: {},
            searchQuery: '',
            filterPlan: 'all',
            loading: true
        });

        // Load super admin data
        React.useEffect(() => {
            loadSuperAdminData();
            const interval = setInterval(loadSystemHealth, 30000); // Update every 30s
            return () => clearInterval(interval);
        }, []);

        const loadSuperAdminData = async () => {
            // Simulate API calls
            const mockClients = [
                {
                    id: 'CLIENT001',
                    companyName: 'Sunset Property Management',
                    contactName: 'John Smith',
                    email: 'john@sunsetpm.com',
                    phone: '(555) 123-4567',
                    plan: 'professional',
                    status: 'active',
                    createdAt: '2024-06-15',
                    properties: 25,
                    units: 450,
                    activeUsers: 12,
                    monthlyRevenue: 2500,
                    storageUsed: 15000000000, // 15GB
                    aiCreditsUsed: 8500,
                    aiCreditsLimit: 10000,
                    features: ['ai_maintenance', 'vendor_portal', 'tenant_portal', 'accounting'],
                    customDomain: 'portal.sunsetpm.com',
                    lastActivity: new Date('2025-01-13T14:30:00')
                },
                {
                    id: 'CLIENT002',
                    companyName: 'Metro Realty Group',
                    contactName: 'Sarah Johnson',
                    email: 'sarah@metrorealty.com',
                    phone: '(555) 234-5678',
                    plan: 'enterprise',
                    status: 'active',
                    createdAt: '2024-03-22',
                    properties: 75,
                    units: 1200,
                    activeUsers: 35,
                    monthlyRevenue: 7500,
                    storageUsed: 45000000000, // 45GB
                    aiCreditsUsed: 25000,
                    aiCreditsLimit: 50000,
                    features: ['ai_maintenance', 'vendor_portal', 'tenant_portal', 'accounting', 'api_access', 'white_label'],
                    customDomain: 'manage.metrorealty.com',
                    lastActivity: new Date('2025-01-13T16:00:00'),
                    subsidiaries: [
                        { id: 'SUB001', name: 'Metro East', units: 400 },
                        { id: 'SUB002', name: 'Metro West', units: 350 },
                        { id: 'SUB003', name: 'Metro Downtown', units: 450 }
                    ]
                },
                {
                    id: 'CLIENT003',
                    companyName: 'Green Leaf Properties',
                    contactName: 'Mike Chen',
                    email: 'mike@greenleaf.com',
                    phone: '(555) 345-6789',
                    plan: 'starter',
                    status: 'trial',
                    createdAt: '2025-01-05',
                    properties: 5,
                    units: 85,
                    activeUsers: 3,
                    monthlyRevenue: 0,
                    storageUsed: 500000000, // 500MB
                    aiCreditsUsed: 250,
                    aiCreditsLimit: 1000,
                    features: ['ai_maintenance', 'tenant_portal'],
                    trialEndsAt: '2025-02-05',
                    lastActivity: new Date('2025-01-12T10:00:00')
                }
            ];

            const mockPlatformStats = {
                totalClients: 156,
                activeClients: 142,
                totalProperties: 3500,
                totalUnits: 45000,
                totalUsers: 2800,
                monthlyRecurringRevenue: 185000,
                averageRevenuePerClient: 1185,
                clientGrowthRate: 12.5,
                churnRate: 2.1,
                nps: 72
            };

            const mockSystemHealth = {
                apiUptime: 99.98,
                avgResponseTime: 145,
                activeConnections: 342,
                queuedJobs: 28,
                errorRate: 0.02,
                storageUsed: 2500000000000, // 2.5TB
                storageTotal: 10000000000000, // 10TB
                lastBackup: new Date('2025-01-13T06:00:00')
            };

            const mockAIUsageMetrics = {
                totalRequests: 450000,
                requestsToday: 12500,
                averageProcessingTime: 850,
                topFeatures: [
                    { feature: 'Maintenance AI', usage: 35 },
                    { feature: 'Lease Generation', usage: 25 },
                    { feature: 'Vendor Matching', usage: 20 },
                    { feature: 'Application Screening', usage: 20 }
                ],
                costPerRequest: 0.02,
                monthlyAICost: 9000
            };

            updateState({
                clients: mockClients,
                platformStats: mockPlatformStats,
                systemHealth: mockSystemHealth,
                aiUsageMetrics: mockAIUsageMetrics,
                loading: false
            });
        };

        const loadSystemHealth = async () => {
            // Update system health metrics
            const health = {
                ...state.systemHealth,
                activeConnections: Math.floor(Math.random() * 100) + 300,
                queuedJobs: Math.floor(Math.random() * 50),
                avgResponseTime: Math.floor(Math.random() * 50) + 120
            };
            updateState({ systemHealth: health });
        };

        return React.createElement('div', { className: 'super-admin-panel' }, [
            // Header
            React.createElement('header', { key: 'header', className: 'super-admin-header' }, [
                React.createElement('div', { key: 'brand', className: 'header-brand' }, [
                    React.createElement('h1', { key: 'title' }, 'Platform Admin'),
                    React.createElement('span', { key: 'label', className: 'admin-badge' }, 'SUPER ADMIN')
                ]),
                React.createElement('nav', { key: 'nav', className: 'admin-nav' }, [
                    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
                    { id: 'clients', label: 'Clients', icon: 'fa-building' },
                    { id: 'billing', label: 'Billing', icon: 'fa-credit-card' },
                    { id: 'system', label: 'System', icon: 'fa-server' },
                    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
                    { id: 'settings', label: 'Settings', icon: 'fa-cog' }
                ].map(item =>
                    React.createElement('button', {
                        key: item.id,
                        className: `nav-item ${state.activeView === item.id ? 'active' : ''}`,
                        onClick: () => updateState({ activeView: item.id })
                    }, [
                        React.createElement('i', { key: 'icon', className: `fas ${item.icon}` }),
                        React.createElement('span', { key: 'label' }, item.label)
                    ])
                ))
            ]),

            // Main Content
            React.createElement('div', { key: 'content', className: 'super-admin-content' }, [
                state.activeView === 'dashboard' && renderDashboard(),
                state.activeView === 'clients' && renderClientsView(),
                state.activeView === 'billing' && renderBillingView(),
                state.activeView === 'system' && renderSystemView(),
                state.activeView === 'analytics' && renderAnalyticsView(),
                state.activeView === 'settings' && renderSettingsView()
            ]),

            // Client Detail Modal
            state.showClientModal && React.createElement(ClientDetailModal, {
                key: 'client-modal',
                client: state.selectedClient,
                onClose: () => updateState({ showClientModal: false, selectedClient: null }),
                onUpdate: (clientData) => updateClient(clientData),
                onManageUsers: (client) => manageClientUsers(client)
            }),

            // User Management Modal
            state.showUserModal && React.createElement(UserManagementModal, {
                key: 'user-modal',
                client: state.selectedClient,
                user: state.selectedUser,
                onClose: () => updateState({ showUserModal: false, selectedUser: null }),
                onSave: (userData) => saveUser(userData)
            })
        ]);

        // Dashboard View
        function renderDashboard() {
            return React.createElement('div', { className: 'super-dashboard' }, [
                // Platform Overview
                React.createElement('div', { key: 'overview', className: 'platform-overview' }, [
                    React.createElement('h2', { key: 'title' }, 'Platform Overview'),
                    React.createElement('div', { key: 'stats', className: 'overview-stats' }, [
                        {
                            label: 'Total Clients',
                            value: state.platformStats.totalClients,
                            change: '+12',
                            icon: 'fa-building',
                            color: 'primary'
                        },
                        {
                            label: 'Active Users',
                            value: state.platformStats.totalUsers,
                            change: '+156',
                            icon: 'fa-users',
                            color: 'success'
                        },
                        {
                            label: 'MRR',
                            value: formatCurrency(state.platformStats.monthlyRecurringRevenue),
                            change: '+8.5%',
                            icon: 'fa-dollar-sign',
                            color: 'success'
                        },
                        {
                            label: 'Total Units',
                            value: state.platformStats.totalUnits.toLocaleString(),
                            change: '+2,500',
                            icon: 'fa-home',
                            color: 'info'
                        }
                    ].map((stat, idx) =>
                        React.createElement('div', {
                            key: idx,
                            className: `stat-card ${stat.color}`
                        }, [
                            React.createElement('i', { key: 'icon', className: `fas ${stat.icon}` }),
                            React.createElement('div', { key: 'content' }, [
                                React.createElement('span', { key: 'value', className: 'stat-value' }, stat.value),
                                React.createElement('span', { key: 'label', className: 'stat-label' }, stat.label),
                                React.createElement('span', { key: 'change', className: 'stat-change' }, stat.change)
                            ])
                        ])
                    ))
                ]),

                // System Health
                React.createElement('div', { key: 'health', className: 'system-health-widget' }, [
                    React.createElement('h2', { key: 'title' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-heartbeat' }),
                        'System Health'
                    ]),
                    React.createElement('div', { key: 'metrics', className: 'health-metrics' }, [
                        React.createElement('div', { key: 'uptime', className: 'metric' }, [
                            React.createElement('label', {}, 'API Uptime'),
                            React.createElement('div', { className: 'metric-value' }, [
                                React.createElement('span', { className: 'value' }, `${state.systemHealth.apiUptime}%`),
                                React.createElement('div', { className: 'progress' },
                                    React.createElement('div', {
                                        className: 'progress-bar',
                                        style: { width: `${state.systemHealth.apiUptime}%` }
                                    })
                                )
                            ])
                        ]),
                        React.createElement('div', { key: 'response', className: 'metric' }, [
                            React.createElement('label', {}, 'Avg Response Time'),
                            React.createElement('span', { className: 'value' }, `${state.systemHealth.avgResponseTime}ms`)
                        ]),
                        React.createElement('div', { key: 'connections', className: 'metric' }, [
                            React.createElement('label', {}, 'Active Connections'),
                            React.createElement('span', { className: 'value' }, state.systemHealth.activeConnections)
                        ]),
                        React.createElement('div', { key: 'storage', className: 'metric' }, [
                            React.createElement('label', {}, 'Storage Used'),
                            React.createElement('div', { className: 'metric-value' }, [
                                React.createElement('span', { className: 'value' },
                                    `${formatBytes(state.systemHealth.storageUsed)} / ${formatBytes(state.systemHealth.storageTotal)}`
                                ),
                                React.createElement('div', { className: 'progress' },
                                    React.createElement('div', {
                                        className: 'progress-bar',
                                        style: { width: `${(state.systemHealth.storageUsed / state.systemHealth.storageTotal) * 100}%` }
                                    })
                                )
                            ])
                        ])
                    ])
                ]),

                // AI Usage
                React.createElement('div', { key: 'ai-usage', className: 'ai-usage-widget' }, [
                    React.createElement('h2', { key: 'title' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                        'AI Platform Usage'
                    ]),
                    React.createElement('div', { key: 'stats', className: 'ai-stats' }, [
                        React.createElement('div', { key: 'requests', className: 'stat' }, [
                            React.createElement('span', { className: 'value' }, 
                                state.aiUsageMetrics.requestsToday?.toLocaleString()
                            ),
                            React.createElement('span', { className: 'label' }, 'Requests Today')
                        ]),
                        React.createElement('div', { key: 'cost', className: 'stat' }, [
                            React.createElement('span', { className: 'value' }, 
                                formatCurrency(state.aiUsageMetrics.requestsToday * state.aiUsageMetrics.costPerRequest)
                            ),
                            React.createElement('span', { className: 'label' }, 'Today\'s AI Cost')
                        ])
                    ]),
                    React.createElement('div', { key: 'features', className: 'ai-features' },
                        state.aiUsageMetrics.topFeatures?.map((feature, idx) =>
                            React.createElement('div', { key: idx, className: 'feature-usage' }, [
                                React.createElement('span', { key: 'name' }, feature.feature),
                                React.createElement('div', { key: 'bar', className: 'usage-bar' },
                                    React.createElement('div', {
                                        className: 'bar-fill',
                                        style: { width: `${feature.usage}%` }
                                    })
                                ),
                                React.createElement('span', { key: 'percent' }, `${feature.usage}%`)
                            ])
                        )
                    )
                ]),

                // Recent Activity
                React.createElement('div', { key: 'activity', className: 'recent-activity' }, [
                    React.createElement('h2', { key: 'title' }, 'Recent Client Activity'),
                    React.createElement('div', { key: 'list', className: 'activity-list' },
                        state.clients.slice(0, 5).map(client =>
                            React.createElement('div', { key: client.id, className: 'activity-item' }, [
                                React.createElement('div', { key: 'info' }, [
                                    React.createElement('h4', {}, client.companyName),
                                    React.createElement('p', {}, `Last active: ${helpers.formatDate(client.lastActivity)}`)
                                ]),
                                React.createElement('span', {
                                    key: 'status',
                                    className: `status-badge ${client.status}`
                                }, client.status)
                            ])
                        )
                    )
                ])
            ]);
        }

        // Clients View
        function renderClientsView() {
            const filteredClients = state.clients.filter(client => {
                const matchesSearch = client.companyName.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                    client.contactName.toLowerCase().includes(state.searchQuery.toLowerCase());
                const matchesPlan = state.filterPlan === 'all' || client.plan === state.filterPlan;
                return matchesSearch && matchesPlan;
            });

            return React.createElement('div', { className: 'clients-view' }, [
                React.createElement('div', { key: 'header', className: 'view-header' }, [
                    React.createElement('h2', { key: 'title' }, 'Client Management'),
                    React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                        React.createElement('button', {
                            key: 'add',
                            className: 'btn btn-primary',
                            onClick: () => createNewClient()
                        }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                            'Add Client'
                        ])
                    ])
                ]),

                React.createElement('div', { key: 'filters', className: 'client-filters' }, [
                    React.createElement('div', { key: 'search', className: 'search-box' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-search' }),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            placeholder: 'Search clients...',
                            value: state.searchQuery,
                            onChange: (e) => updateState({ searchQuery: e.target.value })
                        })
                    ]),
                    React.createElement('select', {
                        key: 'plan',
                        value: state.filterPlan,
                        onChange: (e) => updateState({ filterPlan: e.target.value })
                    }, [
                        React.createElement('option', { key: 'all', value: 'all' }, 'All Plans'),
                        React.createElement('option', { key: 'starter', value: 'starter' }, 'Starter'),
                        React.createElement('option', { key: 'professional', value: 'professional' }, 'Professional'),
                        React.createElement('option', { key: 'enterprise', value: 'enterprise' }, 'Enterprise')
                    ])
                ]),

                React.createElement('div', { key: 'table', className: 'clients-table' },
                    React.createElement('table', {}, [
                        React.createElement('thead', { key: 'head' },
                            React.createElement('tr', {}, [
                                React.createElement('th', { key: 'company' }, 'Company'),
                                React.createElement('th', { key: 'contact' }, 'Contact'),
                                React.createElement('th', { key: 'plan' }, 'Plan'),
                                React.createElement('th', { key: 'units' }, 'Units'),
                                React.createElement('th', { key: 'users' }, 'Users'),
                                React.createElement('th', { key: 'revenue' }, 'MRR'),
                                React.createElement('th', { key: 'status' }, 'Status'),
                                React.createElement('th', { key: 'actions' }, 'Actions')
                            ])
                        ),
                        React.createElement('tbody', { key: 'body' },
                            filteredClients.map(client =>
                                React.createElement('tr', { key: client.id }, [
                                    React.createElement('td', { key: 'company' }, [
                                        React.createElement('strong', {}, client.companyName),
                                        client.subsidiaries && React.createElement('span', {
                                            className: 'subsidiary-count'
                                        }, ` (${client.subsidiaries.length} subsidiaries)`)
                                    ]),
                                    React.createElement('td', { key: 'contact' }, [
                                        React.createElement('div', {}, client.contactName),
                                        React.createElement('small', {}, client.email)
                                    ]),
                                    React.createElement('td', { key: 'plan' },
                                        React.createElement('span', {
                                            className: `plan-badge ${client.plan}`
                                        }, client.plan)
                                    ),
                                    React.createElement('td', { key: 'units' }, client.units),
                                    React.createElement('td', { key: 'users' }, client.activeUsers),
                                    React.createElement('td', { key: 'revenue' }, formatCurrency(client.monthlyRevenue)),
                                    React.createElement('td', { key: 'status' },
                                        React.createElement('span', {
                                            className: `status-badge ${client.status}`
                                        }, client.status)
                                    ),
                                    React.createElement('td', { key: 'actions', className: 'client-actions' }, [
                                        React.createElement('button', {
                                            key: 'view',
                                            className: 'action-btn',
                                            title: 'View Details',
                                            onClick: () => updateState({
                                                selectedClient: client,
                                                showClientModal: true
                                            })
                                        }, React.createElement('i', { className: 'fas fa-eye' })),
                                        React.createElement('button', {
                                            key: 'users',
                                            className: 'action-btn',
                                            title: 'Manage Users',
                                            onClick: () => manageClientUsers(client)
                                        }, React.createElement('i', { className: 'fas fa-users' })),
                                        React.createElement('button', {
                                            key: 'login',
                                            className: 'action-btn',
                                            title: 'Login as Client',
                                            onClick: () => loginAsClient(client)
                                        }, React.createElement('i', { className: 'fas fa-sign-in-alt' }))
                                    ])
                                ])
                            )
                        )
                    ])
                )
            ]);
        }

        // System View
        function renderSystemView() {
            return React.createElement('div', { className: 'system-view' }, [
                React.createElement('h2', { key: 'title' }, 'System Management'),
                
                // Server Status
                React.createElement('div', { key: 'servers', className: 'server-status' }, [
                    React.createElement('h3', {}, 'Server Status'),
                    React.createElement('div', { className: 'server-grid' }, [
                        { name: 'API Server 1', status: 'online', load: 35 },
                        { name: 'API Server 2', status: 'online', load: 42 },
                        { name: 'Database Primary', status: 'online', load: 28 },
                        { name: 'Database Replica', status: 'online', load: 25 },
                        { name: 'Redis Cache', status: 'online', load: 15 },
                        { name: 'AI Processing', status: 'online', load: 68 }
                    ].map((server, idx) =>
                        React.createElement('div', {
                            key: idx,
                            className: `server-card ${server.status}`
                        }, [
                            React.createElement('div', { className: 'server-header' }, [
                                React.createElement('h4', {}, server.name),
                                React.createElement('span', {
                                    className: `status-indicator ${server.status}`
                                })
                            ]),
                            React.createElement('div', { className: 'server-load' }, [
                                React.createElement('span', {}, `Load: ${server.load}%`),
                                React.createElement('div', { className: 'load-bar' },
                                    React.createElement('div', {
                                        className: 'load-fill',
                                        style: { width: `${server.load}%` }
                                    })
                                )
                            ])
                        ])
                    ))
                ]),

                // Feature Flags
                React.createElement('div', { key: 'features', className: 'feature-flags' }, [
                    React.createElement('h3', {}, 'Feature Flags'),
                    React.createElement('div', { className: 'feature-list' }, [
                        { name: 'AI Maintenance Assistant', key: 'ai_maintenance', enabled: true },
                        { name: 'Advanced Analytics', key: 'advanced_analytics', enabled: true },
                        { name: 'Beta Features', key: 'beta_features', enabled: false },
                        { name: 'New UI Dashboard', key: 'new_dashboard', enabled: false }
                    ].map(feature =>
                        React.createElement('div', { key: feature.key, className: 'feature-flag' }, [
                            React.createElement('span', {}, feature.name),
                            React.createElement('label', { className: 'toggle-switch' }, [
                                React.createElement('input', {
                                    type: 'checkbox',
                                    checked: feature.enabled,
                                    onChange: () => toggleFeatureFlag(feature.key)
                                }),
                                React.createElement('span', { className: 'toggle-slider' })
                            ])
                        ])
                    ))
                ])
            ]);
        }

        // Client Management Functions
        function createNewClient() {
            // Open client creation modal
            updateState({
                selectedClient: {
                    companyName: '',
                    contactName: '',
                    email: '',
                    phone: '',
                    plan: 'starter',
                    status: 'pending'
                },
                showClientModal: true
            });
        }

        function manageClientUsers(client) {
            updateState({
                selectedClient: client,
                showUserModal: true
            });
        }

        function loginAsClient(client) {
            // Implement secure impersonation
            console.log('Logging in as client:', client.companyName);
            window.Toast?.info(`Switching to ${client.companyName} account...`);
        }

        async function updateClient(clientData) {
            // Update client via API
            console.log('Updating client:', clientData);
            window.Toast?.success('Client updated successfully!');
        }

        async function saveUser(userData) {
            // Save user via API
            console.log('Saving user:', userData);
            window.Toast?.success('User saved successfully!');
        }

        function toggleFeatureFlag(flagKey) {
            // Toggle feature flag
            console.log('Toggling feature:', flagKey);
        }
    });
})();

// Client Detail Modal
const ClientDetailModal = ComponentFactory.createComponent('ClientDetailModal')((props, helpers) => {
    const { client, onClose, onUpdate, onManageUsers } = props;
    const { formatCurrency, formatDate, formatBytes } = helpers;
    
    const [formData, setFormData] = React.useState(client || {});
    const [activeTab, setActiveTab] = React.useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'fa-info-circle' },
        { id: 'usage', label: 'Usage & Limits', icon: 'fa-chart-line' },
        { id: 'billing', label: 'Billing', icon: 'fa-credit-card' },
        { id: 'features', label: 'Features', icon: 'fa-cog' },
        { id: 'activity', label: 'Activity Log', icon: 'fa-history' }
    ];

    return React.createElement('div', {
        className: 'modal-overlay',
        onClick: onClose
    },
        React.createElement('div', {
            className: 'modal-content client-detail-modal',
            onClick: (e) => e.stopPropagation()
        }, [
            React.createElement('div', { key: 'header', className: 'modal-header' }, [
                React.createElement('h2', { key: 'title' }, client.id ? client.companyName : 'New Client'),
                React.createElement('button', {
                    key: 'close',
                    className: 'close-btn',
                    onClick: onClose
                }, '×')
            ]),

            React.createElement('div', { key: 'tabs', className: 'modal-tabs' },
                tabs.map(tab =>
                    React.createElement('button', {
                        key: tab.id,
                        className: `tab-btn ${activeTab === tab.id ? 'active' : ''}`,
                        onClick: () => setActiveTab(tab.id)
                    }, [
                        React.createElement('i', { key: 'icon', className: `fas ${tab.icon}` }),
                        React.createElement('span', { key: 'label' }, tab.label)
                    ])
                )
            ),

            React.createElement('div', { key: 'content', className: 'modal-body' }, [
                activeTab === 'overview' && renderOverviewTab(),
                activeTab === 'usage' && renderUsageTab(),
                activeTab === 'billing' && renderBillingTab(),
                activeTab === 'features' && renderFeaturesTab(),
                activeTab === 'activity' && renderActivityTab()
            ]),

            React.createElement('div', { key: 'footer', className: 'modal-footer' }, [
                React.createElement('button', {
                    key: 'cancel',
                    className: 'btn btn-secondary',
                    onClick: onClose
                }, 'Cancel'),
                React.createElement('button', {
                    key: 'users',
                    className: 'btn btn-info',
                    onClick: () => onManageUsers(client)
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-users' }),
                    'Manage Users'
                ]),
                React.createElement('button', {
                    key: 'save',
                    className: 'btn btn-primary',
                    onClick: () => onUpdate(formData)
                }, 'Save Changes')
            ])
        ])
    );

    function renderOverviewTab() {
        return React.createElement('div', { className: 'tab-content overview-tab' }, [
            React.createElement('div', { key: 'form', className: 'client-form' }, [
                React.createElement('div', { key: 'row1', className: 'form-row' }, [
                    React.createElement('div', { key: 'company', className: 'form-group' }, [
                        React.createElement('label', {}, 'Company Name'),
                        React.createElement('input', {
                            type: 'text',
                            value: formData.companyName || '',
                            onChange: (e) => setFormData({ ...formData, companyName: e.target.value })
                        })
                    ]),
                    React.createElement('div', { key: 'contact', className: 'form-group' }, [
                        React.createElement('label', {}, 'Contact Name'),
                        React.createElement('input', {
                            type: 'text',
                            value: formData.contactName || '',
                            onChange: (e) => setFormData({ ...formData, contactName: e.target.value })
                        })
                    ])
                ]),
                React.createElement('div', { key: 'row2', className: 'form-row' }, [
                    React.createElement('div', { key: 'email', className: 'form-group' }, [
                        React.createElement('label', {}, 'Email'),
                        React.createElement('input', {
                            type: 'email',
                            value: formData.email || '',
                            onChange: (e) => setFormData({ ...formData, email: e.target.value })
                        })
                    ]),
                    React.createElement('div', { key: 'phone', className: 'form-group' }, [
                        React.createElement('label', {}, 'Phone'),
                        React.createElement('input', {
                            type: 'tel',
                            value: formData.phone || '',
                            onChange: (e) => setFormData({ ...formData, phone: e.target.value })
                        })
                    ])
                ]),
                React.createElement('div', { key: 'row3', className: 'form-row' }, [
                    React.createElement('div', { key: 'plan', className: 'form-group' }, [
                        React.createElement('label', {}, 'Plan'),
                        React.createElement('select', {
                            value: formData.plan || 'starter',
                            onChange: (e) => setFormData({ ...formData, plan: e.target.value })
                        }, [
                            React.createElement('option', { key: 'starter', value: 'starter' }, 'Starter'),
                            React.createElement('option', { key: 'professional', value: 'professional' }, 'Professional'),
                            React.createElement('option', { key: 'enterprise', value: 'enterprise' }, 'Enterprise')
                        ])
                    ]),
                    React.createElement('div', { key: 'status', className: 'form-group' }, [
                        React.createElement('label', {}, 'Status'),
                        React.createElement('select', {
                            value: formData.status || 'active',
                            onChange: (e) => setFormData({ ...formData, status: e.target.value })
                        }, [
                            React.createElement('option', { key: 'trial', value: 'trial' }, 'Trial'),
                            React.createElement('option', { key: 'active', value: 'active' }, 'Active'),
                            React.createElement('option', { key: 'suspended', value: 'suspended' }, 'Suspended'),
                            React.createElement('option', { key: 'cancelled', value: 'cancelled' }, 'Cancelled')
                        ])
                    ])
                ])
            ]),

            formData.subsidiaries && React.createElement('div', { key: 'subsidiaries', className: 'subsidiaries-section' }, [
                React.createElement('h3', {}, 'Subsidiaries'),
                React.createElement('div', { className: 'subsidiary-list' },
                    formData.subsidiaries.map(sub =>
                        React.createElement('div', { key: sub.id, className: 'subsidiary-item' }, [
                            React.createElement('span', { className: 'sub-name' }, sub.name),
                            React.createElement('span', { className: 'sub-units' }, `${sub.units} units`)
                        ])
                    )
                )
            ])
        ]);
    }

    function renderUsageTab() {
        return React.createElement('div', { className: 'tab-content usage-tab' }, [
            React.createElement('div', { key: 'storage', className: 'usage-section' }, [
                React.createElement('h3', {}, 'Storage Usage'),
                React.createElement('div', { className: 'usage-metric' }, [
                    React.createElement('div', { className: 'usage-header' }, [
                        React.createElement('span', {}, formatBytes(client.storageUsed)),
                        React.createElement('span', {}, ' / 100 GB')
                    ]),
                    React.createElement('div', { className: 'usage-bar' },
                        React.createElement('div', {
                            className: 'usage-fill',
                            style: { width: `${(client.storageUsed / 100000000000) * 100}%` }
                        })
                    )
                ])
            ]),

            React.createElement('div', { key: 'ai', className: 'usage-section' }, [
                React.createElement('h3', {}, 'AI Credits'),
                React.createElement('div', { className: 'usage-metric' }, [
                    React.createElement('div', { className: 'usage-header' }, [
                        React.createElement('span', {}, client.aiCreditsUsed?.toLocaleString()),
                        React.createElement('span', {}, ` / ${client.aiCreditsLimit?.toLocaleString()}`)
                    ]),
                    React.createElement('div', { className: 'usage-bar' },
                        React.createElement('div', {
                            className: 'usage-fill ai',
                            style: { width: `${(client.aiCreditsUsed / client.aiCreditsLimit) * 100}%` }
                        })
                    ),
                    React.createElement('button', { className: 'btn btn-sm btn-primary' }, 'Add Credits')
                ])
            ]),

            React.createElement('div', { key: 'limits', className: 'limits-section' }, [
                React.createElement('h3', {}, 'Account Limits'),
                React.createElement('div', { className: 'limits-grid' }, [
                    { label: 'Properties', current: client.properties, limit: 100 },
                    { label: 'Units', current: client.units, limit: 2000 },
                    { label: 'Active Users', current: client.activeUsers, limit: 50 },
                    { label: 'API Calls/Day', current: 8500, limit: 10000 }
                ].map((limit, idx) =>
                    React.createElement('div', { key: idx, className: 'limit-item' }, [
                        React.createElement('label', {}, limit.label),
                        React.createElement('span', {}, `${limit.current} / ${limit.limit}`)
                    ])
                ))
            ])
        ]);
    }

    function renderFeaturesTab() {
        const allFeatures = [
            { key: 'ai_maintenance', label: 'AI Maintenance Assistant', category: 'AI' },
            { key: 'vendor_portal', label: 'Vendor Portal', category: 'Core' },
            { key: 'tenant_portal', label: 'Tenant Portal', category: 'Core' },
            { key: 'accounting', label: 'Accounting Integration', category: 'Finance' },
            { key: 'api_access', label: 'API Access', category: 'Developer' },
            { key: 'white_label', label: 'White Label Branding', category: 'Enterprise' },
            { key: 'custom_reports', label: 'Custom Reports', category: 'Analytics' },
            { key: 'bulk_operations', label: 'Bulk Operations', category: 'Core' }
        ];

        return React.createElement('div', { className: 'tab-content features-tab' }, [
            React.createElement('h3', {}, 'Enabled Features'),
            React.createElement('div', { className: 'features-grid' },
                allFeatures.map(feature =>
                    React.createElement('div', {
                        key: feature.key,
                        className: `feature-item ${client.features?.includes(feature.key) ? 'enabled' : 'disabled'}`
                    }, [
                        React.createElement('label', {}, [
                            React.createElement('input', {
                                type: 'checkbox',
                                checked: client.features?.includes(feature.key) || false,
                                onChange: (e) => toggleFeature(feature.key, e.target.checked)
                            }),
                            React.createElement('span', { className: 'feature-label' }, feature.label),
                            React.createElement('span', { className: 'feature-category' }, feature.category)
                        ])
                    ])
                )
            )
        ]);
    }

    function toggleFeature(featureKey, enabled) {
        const updatedFeatures = enabled
            ? [...(formData.features || []), featureKey]
            : (formData.features || []).filter(f => f !== featureKey);
        
        setFormData({ ...formData, features: updatedFeatures });
    }
});

// User Management Modal
const UserManagementModal = ComponentFactory.createComponent('UserManagementModal')((props, helpers) => {
    const { client, user, onClose, onSave } = props;
    const [users, setUsers] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState(user);
    const [showUserForm, setShowUserForm] = React.useState(false);

    React.useEffect(() => {
        loadClientUsers();
    }, [client]);

    const loadClientUsers = async () => {
        // Simulate loading users
        const mockUsers = [
            {
                id: 'USER001',
                name: 'John Smith',
                email: 'john@company.com',
                role: 'admin',
                status: 'active',
                lastLogin: new Date('2025-01-13T10:00:00'),
                permissions: ['all']
            },
            {
                id: 'USER002',
                name: 'Sarah Johnson',
                email: 'sarah@company.com',
                role: 'manager',
                status: 'active',
                lastLogin: new Date('2025-01-12T14:30:00'),
                permissions: ['properties', 'tenants', 'maintenance']
            },
            {
                id: 'USER003',
                name: 'Mike Chen',
                email: 'mike@company.com',
                role: 'staff',
                status: 'active',
                lastLogin: new Date('2025-01-11T09:15:00'),
                permissions: ['maintenance', 'tenants']
            }
        ];
        setUsers(mockUsers);
    };

    return React.createElement('div', {
        className: 'modal-overlay',
        onClick: onClose
    },
        React.createElement('div', {
            className: 'modal-content user-management-modal',
            onClick: (e) => e.stopPropagation()
        }, [
            React.createElement('div', { key: 'header', className: 'modal-header' }, [
                React.createElement('h2', { key: 'title' }, `${client.companyName} - User Management`),
                React.createElement('button', {
                    key: 'close',
                    className: 'close-btn',
                    onClick: onClose
                }, '×')
            ]),

            React.createElement('div', { key: 'content', className: 'modal-body' }, [
                !showUserForm ? renderUserList() : renderUserForm()
            ])
        ])
    );

    function renderUserList() {
        return React.createElement('div', { className: 'user-list-view' }, [
            React.createElement('div', { key: 'actions', className: 'list-actions' }, [
                React.createElement('button', {
                    className: 'btn btn-primary',
                    onClick: () => {
                        setSelectedUser(null);
                        setShowUserForm(true);
                    }
                }, [
                    React.createElement('i', { className: 'fas fa-plus' }),
                    'Add User'
                ])
            ]),

            React.createElement('div', { key: 'list', className: 'users-list' },
                users.map(user =>
                    React.createElement('div', { key: user.id, className: 'user-item' }, [
                        React.createElement('div', { className: 'user-info' }, [
                            React.createElement('h4', {}, user.name),
                            React.createElement('p', {}, user.email),
                            React.createElement('span', { className: `role-badge ${user.role}` }, user.role)
                        ]),
                        React.createElement('div', { className: 'user-meta' }, [
                            React.createElement('span', { className: `status ${user.status}` }, user.status),
                            React.createElement('span', { className: 'last-login' }, 
                                `Last login: ${helpers.formatDate(user.lastLogin)}`
                            )
                        ]),
                        React.createElement('div', { className: 'user-actions' }, [
                            React.createElement('button', {
                                className: 'action-btn',
                                onClick: () => {
                                    setSelectedUser(user);
                                    setShowUserForm(true);
                                }
                            }, React.createElement('i', { className: 'fas fa-edit' })),
                            React.createElement('button', {
                                className: 'action-btn danger',
                                onClick: () => deleteUser(user.id)
                            }, React.createElement('i', { className: 'fas fa-trash' }))
                        ])
                    ])
                )
            )
        ]);
    }

    function renderUserForm() {
        const [formData, setFormData] = React.useState(selectedUser || {
            name: '',
            email: '',
            role: 'staff',
            permissions: []
        });

        return React.createElement('div', { className: 'user-form-view' }, [
            React.createElement('h3', {}, selectedUser ? 'Edit User' : 'Create User'),
            React.createElement('div', { className: 'user-form' }, [
                React.createElement('div', { className: 'form-group' }, [
                    React.createElement('label', {}, 'Name'),
                    React.createElement('input', {
                        type: 'text',
                        value: formData.name,
                        onChange: (e) => setFormData({ ...formData, name: e.target.value })
                    })
                ]),
                React.createElement('div', { className: 'form-group' }, [
                    React.createElement('label', {}, 'Email'),
                    React.createElement('input', {
                        type: 'email',
                        value: formData.email,
                        onChange: (e) => setFormData({ ...formData, email: e.target.value })
                    })
                ]),
                React.createElement('div', { className: 'form-group' }, [
                    React.createElement('label', {}, 'Role'),
                    React.createElement('select', {
                        value: formData.role,
                        onChange: (e) => setFormData({ ...formData, role: e.target.value })
                    }, [
                        React.createElement('option', { value: 'admin' }, 'Admin'),
                        React.createElement('option', { value: 'manager' }, 'Manager'),
                        React.createElement('option', { value: 'staff' }, 'Staff'),
                        React.createElement('option', { value: 'readonly' }, 'Read Only')
                    ])
                ]),
                React.createElement('div', { className: 'form-group' }, [
                    React.createElement('label', {}, 'Permissions'),
                    React.createElement('div', { className: 'permissions-grid' }, [
                        'properties', 'tenants', 'maintenance', 'accounting', 'reports', 'settings'
                    ].map(perm =>
                        React.createElement('label', { key: perm, className: 'permission-item' }, [
                            React.createElement('input', {
                                type: 'checkbox',
                                checked: formData.permissions?.includes(perm) || false,
                                onChange: (e) => {
                                    const perms = e.target.checked
                                        ? [...(formData.permissions || []), perm]
                                        : (formData.permissions || []).filter(p => p !== perm);
                                    setFormData({ ...formData, permissions: perms });
                                }
                            }),
                            React.createElement('span', {}, perm)
                        ])
                    ))
                ])
            ]),
            React.createElement('div', { className: 'form-actions' }, [
                React.createElement('button', {
                    className: 'btn btn-secondary',
                    onClick: () => setShowUserForm(false)
                }, 'Cancel'),
                React.createElement('button', {
                    className: 'btn btn-primary',
                    onClick: () => {
                        onSave(formData);
                        setShowUserForm(false);
                    }
                }, selectedUser ? 'Update User' : 'Create User')
            ])
        ]);
    }

    function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            setUsers(users.filter(u => u.id !== userId));
            window.Toast?.success('User deleted');
        }
    }
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.SuperAdminPanel = SuperAdminPanel;
window.AppModules.ClientDetailModal = ClientDetailModal;
window.AppModules.UserManagementModal = UserManagementModal;