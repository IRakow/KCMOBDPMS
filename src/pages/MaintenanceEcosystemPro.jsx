// MaintenanceEcosystemPro.jsx - World-Class AI-Powered Maintenance System
const MaintenanceEcosystemPro = () => {
    const [activeView, setActiveView] = React.useState('dashboard');
    const [currentRequest, setCurrentRequest] = React.useState(null);
    const [aiConversation, setAiConversation] = React.useState([]);
    const [selectedProperty, setSelectedProperty] = React.useState('all');
    const [showVendorModal, setShowVendorModal] = React.useState(false);
    const [showRequestModal, setShowRequestModal] = React.useState(false);
    const [activeFilter, setActiveFilter] = React.useState('all');
    
    // Mock data for demonstration
    const [maintenanceData, setMaintenanceData] = React.useState({
        stats: {
            openTickets: 23,
            inProgress: 8,
            completedToday: 5,
            avgResponseTime: '2.3 hrs',
            vendorRating: 4.8,
            monthlySpend: 45280
        },
        tickets: [
            {
                id: 'MNT-2024-001',
                title: 'Water leak in bathroom',
                property: 'Sunset Apartments',
                unit: '203',
                tenant: 'Sarah Johnson',
                category: 'plumbing',
                priority: 'high',
                status: 'in_progress',
                created: '2025-01-14T08:30:00',
                vendor: 'AquaFix Plumbing',
                estimatedCost: 350,
                aiScore: 85,
                photos: 2
            },
            {
                id: 'MNT-2024-002',
                title: 'AC not cooling properly',
                property: 'Downtown Plaza',
                unit: '1205',
                tenant: 'Michael Chen',
                category: 'hvac',
                priority: 'medium',
                status: 'open',
                created: '2025-01-14T10:15:00',
                vendor: null,
                estimatedCost: null,
                aiScore: 65,
                photos: 1
            },
            {
                id: 'MNT-2024-003',
                title: 'Electrical outlet sparking',
                property: 'Garden Complex',
                unit: '405',
                tenant: 'Emily Davis',
                category: 'electrical',
                priority: 'urgent',
                status: 'open',
                created: '2025-01-14T11:45:00',
                vendor: null,
                estimatedCost: null,
                aiScore: 95,
                photos: 3
            }
        ],
        vendors: [
            {
                id: 1,
                name: 'AquaFix Plumbing',
                category: 'plumbing',
                rating: 4.9,
                jobs: 127,
                avgResponse: '45 min',
                avgCost: 285,
                available: true,
                license: 'CA-PLM-98765'
            },
            {
                id: 2,
                name: 'PowerPro Electric',
                category: 'electrical',
                rating: 4.8,
                jobs: 89,
                avgResponse: '1.2 hrs',
                avgCost: 425,
                available: true,
                license: 'CA-ELC-54321'
            },
            {
                id: 3,
                name: 'CoolBreeze HVAC',
                category: 'hvac',
                rating: 4.7,
                jobs: 156,
                avgResponse: '2 hrs',
                avgCost: 520,
                available: false,
                license: 'CA-HVC-12345'
            }
        ]
    });

    // Professional category configuration
    const maintenanceCategories = {
        plumbing: {
            icon: 'fa-faucet',
            color: '#3b82f6',
            label: 'Plumbing',
            bgColor: 'rgba(59, 130, 246, 0.1)'
        },
        electrical: {
            icon: 'fa-bolt',
            color: '#f59e0b',
            label: 'Electrical',
            bgColor: 'rgba(245, 158, 11, 0.1)'
        },
        hvac: {
            icon: 'fa-snowflake',
            color: '#ef4444',
            label: 'HVAC',
            bgColor: 'rgba(239, 68, 68, 0.1)'
        },
        appliance: {
            icon: 'fa-blender',
            color: '#10b981',
            label: 'Appliance',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        general: {
            icon: 'fa-hammer',
            color: '#8b5cf6',
            label: 'General',
            bgColor: 'rgba(139, 92, 246, 0.1)'
        }
    };

    const priorityConfig = {
        low: { color: '#10b981', label: 'Low', icon: 'fa-circle' },
        medium: { color: '#f59e0b', label: 'Medium', icon: 'fa-circle' },
        high: { color: '#ef4444', label: 'High', icon: 'fa-circle' },
        urgent: { color: '#dc2626', label: 'Urgent', icon: 'fa-exclamation-circle' }
    };

    const statusConfig = {
        open: { color: '#3b82f6', label: 'Open', icon: 'fa-inbox' },
        in_progress: { color: '#f59e0b', label: 'In Progress', icon: 'fa-clock' },
        pending_vendor: { color: '#8b5cf6', label: 'Pending Vendor', icon: 'fa-user-clock' },
        completed: { color: '#10b981', label: 'Completed', icon: 'fa-check-circle' },
        cancelled: { color: '#6b7280', label: 'Cancelled', icon: 'fa-times-circle' }
    };

    // Dashboard View Component
    const DashboardView = () => {
        return React.createElement('div', { className: 'maintenance-dashboard-pro' }, [
            // Stats Cards
            React.createElement('div', { key: 'stats', className: 'stats-grid' }, [
                React.createElement('div', { key: 'open', className: 'stat-card' }, [
                    React.createElement('div', { key: 'icon', className: 'stat-icon-wrapper blue' }, 
                        React.createElement('i', { className: 'fas fa-tools' })
                    ),
                    React.createElement('div', { key: 'content', className: 'stat-content' }, [
                        React.createElement('h3', { key: 'value' }, maintenanceData.stats.openTickets),
                        React.createElement('p', { key: 'label' }, 'Open Tickets'),
                        React.createElement('span', { key: 'trend', className: 'stat-trend up' }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-arrow-up' }),
                            ' 12% vs last week'
                        ])
                    ])
                ]),
                React.createElement('div', { key: 'progress', className: 'stat-card' }, [
                    React.createElement('div', { key: 'icon', className: 'stat-icon-wrapper orange' }, 
                        React.createElement('i', { className: 'fas fa-spinner' })
                    ),
                    React.createElement('div', { key: 'content', className: 'stat-content' }, [
                        React.createElement('h3', { key: 'value' }, maintenanceData.stats.inProgress),
                        React.createElement('p', { key: 'label' }, 'In Progress'),
                        React.createElement('span', { key: 'subtitle', className: 'stat-subtitle' }, 
                            '3 vendors on-site'
                        )
                    ])
                ]),
                React.createElement('div', { key: 'response', className: 'stat-card' }, [
                    React.createElement('div', { key: 'icon', className: 'stat-icon-wrapper green' }, 
                        React.createElement('i', { className: 'fas fa-clock' })
                    ),
                    React.createElement('div', { key: 'content', className: 'stat-content' }, [
                        React.createElement('h3', { key: 'value' }, maintenanceData.stats.avgResponseTime),
                        React.createElement('p', { key: 'label' }, 'Avg Response Time'),
                        React.createElement('span', { key: 'trend', className: 'stat-trend down' }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-arrow-down' }),
                            ' 18% improvement'
                        ])
                    ])
                ]),
                React.createElement('div', { key: 'spend', className: 'stat-card' }, [
                    React.createElement('div', { key: 'icon', className: 'stat-icon-wrapper purple' }, 
                        React.createElement('i', { className: 'fas fa-dollar-sign' })
                    ),
                    React.createElement('div', { key: 'content', className: 'stat-content' }, [
                        React.createElement('h3', { key: 'value' }, `$${(maintenanceData.stats.monthlySpend / 1000).toFixed(1)}K`),
                        React.createElement('p', { key: 'label' }, 'Monthly Spend'),
                        React.createElement('span', { key: 'subtitle', className: 'stat-subtitle' }, 
                            'Budget: $50K'
                        )
                    ])
                ])
            ]),

            // Recent Tickets Section
            React.createElement('div', { key: 'recent', className: 'recent-tickets-section' }, [
                React.createElement('div', { key: 'header', className: 'section-header' }, [
                    React.createElement('h2', { key: 'title' }, 'Recent Maintenance Requests'),
                    React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                        React.createElement('button', { 
                            key: 'view-all',
                            className: 'btn-text',
                            onClick: () => setActiveView('tickets')
                        }, 'View All')
                    ])
                ]),
                React.createElement('div', { key: 'tickets', className: 'tickets-list' },
                    maintenanceData.tickets.slice(0, 5).map(ticket =>
                        React.createElement('div', { key: ticket.id, className: 'ticket-card' }, [
                            React.createElement('div', { key: 'header', className: 'ticket-header' }, [
                                React.createElement('div', { key: 'info', className: 'ticket-info' }, [
                                    React.createElement('h4', { key: 'title' }, ticket.title),
                                    React.createElement('div', { key: 'meta', className: 'ticket-meta' }, [
                                        React.createElement('span', { key: 'id', className: 'ticket-id' }, ticket.id),
                                        React.createElement('span', { key: 'dot1', className: 'meta-separator' }, '•'),
                                        React.createElement('span', { key: 'property' }, ticket.property),
                                        React.createElement('span', { key: 'dot2', className: 'meta-separator' }, '•'),
                                        React.createElement('span', { key: 'unit' }, `Unit ${ticket.unit}`)
                                    ])
                                ]),
                                React.createElement('div', { key: 'badges', className: 'ticket-badges' }, [
                                    React.createElement('span', { 
                                        key: 'category',
                                        className: 'category-badge',
                                        style: { 
                                            backgroundColor: maintenanceCategories[ticket.category].bgColor,
                                            color: maintenanceCategories[ticket.category].color
                                        }
                                    }, [
                                        React.createElement('i', { 
                                            key: 'icon',
                                            className: `fas ${maintenanceCategories[ticket.category].icon}`
                                        }),
                                        ' ',
                                        maintenanceCategories[ticket.category].label
                                    ]),
                                    React.createElement('span', { 
                                        key: 'priority',
                                        className: 'priority-badge',
                                        style: { color: priorityConfig[ticket.priority].color }
                                    }, [
                                        React.createElement('i', { 
                                            key: 'icon',
                                            className: `fas ${priorityConfig[ticket.priority].icon}`
                                        }),
                                        ' ',
                                        priorityConfig[ticket.priority].label
                                    ]),
                                    React.createElement('span', { 
                                        key: 'status',
                                        className: 'status-badge',
                                        style: { color: statusConfig[ticket.status].color }
                                    }, [
                                        React.createElement('i', { 
                                            key: 'icon',
                                            className: `fas ${statusConfig[ticket.status].icon}`
                                        }),
                                        ' ',
                                        statusConfig[ticket.status].label
                                    ])
                                ])
                            ]),
                            React.createElement('div', { key: 'footer', className: 'ticket-footer' }, [
                                React.createElement('div', { key: 'tenant', className: 'tenant-info' }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-user' }),
                                    ' ',
                                    ticket.tenant
                                ]),
                                ticket.vendor && React.createElement('div', { key: 'vendor', className: 'vendor-info' }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-hard-hat' }),
                                    ' ',
                                    ticket.vendor
                                ]),
                                React.createElement('div', { key: 'time', className: 'time-info' }, 
                                    getTimeAgo(ticket.created)
                                )
                            ])
                        ])
                    )
                )
            ]),

            // AI Insights Section
            React.createElement('div', { key: 'insights', className: 'ai-insights-section' }, [
                React.createElement('div', { key: 'header', className: 'section-header' }, [
                    React.createElement('h2', { key: 'title' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                        ' AI Insights & Predictions'
                    ])
                ]),
                React.createElement('div', { key: 'insights-grid', className: 'insights-grid' }, [
                    React.createElement('div', { key: 'insight1', className: 'insight-card warning' }, [
                        React.createElement('div', { key: 'icon', className: 'insight-icon' },
                            React.createElement('i', { className: 'fas fa-exclamation-triangle' })
                        ),
                        React.createElement('div', { key: 'content', className: 'insight-content' }, [
                            React.createElement('h4', { key: 'title' }, 'HVAC System Alert'),
                            React.createElement('p', { key: 'desc' }, 
                                '3 units in Building A showing similar AC issues. Recommend preventive maintenance check.'
                            ),
                            React.createElement('button', { key: 'action', className: 'insight-action' }, 
                                'Schedule Inspection'
                            )
                        ])
                    ]),
                    React.createElement('div', { key: 'insight2', className: 'insight-card success' }, [
                        React.createElement('div', { key: 'icon', className: 'insight-icon' },
                            React.createElement('i', { className: 'fas fa-chart-line' })
                        ),
                        React.createElement('div', { key: 'content', className: 'insight-content' }, [
                            React.createElement('h4', { key: 'title' }, 'Cost Optimization'),
                            React.createElement('p', { key: 'desc' }, 
                                'Bundle 5 pending plumbing tasks in Sunset Apartments to save ~$450 on service calls.'
                            ),
                            React.createElement('button', { key: 'action', className: 'insight-action' }, 
                                'View Details'
                            )
                        ])
                    ])
                ])
            ])
        ]);
    };

    // Tickets View Component
    const TicketsView = () => {
        const filteredTickets = maintenanceData.tickets.filter(ticket => {
            if (activeFilter === 'all') return true;
            return ticket.status === activeFilter;
        });

        return React.createElement('div', { className: 'tickets-view-pro' }, [
            // Header with filters
            React.createElement('div', { key: 'header', className: 'view-header' }, [
                React.createElement('div', { key: 'title-section', className: 'title-section' }, [
                    React.createElement('h1', { key: 'title' }, 'Maintenance Tickets'),
                    React.createElement('div', { key: 'stats', className: 'header-stats' }, [
                        React.createElement('span', { key: 'total' }, [
                            React.createElement('strong', {}, maintenanceData.tickets.length),
                            ' TOTAL'
                        ]),
                        React.createElement('span', { key: 'open' }, [
                            React.createElement('strong', {}, maintenanceData.tickets.filter(t => t.status === 'open').length),
                            ' OPEN'
                        ]),
                        React.createElement('span', { key: 'progress' }, [
                            React.createElement('strong', {}, maintenanceData.tickets.filter(t => t.status === 'in_progress').length),
                            ' IN PROGRESS'
                        ])
                    ])
                ]),
                React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                    React.createElement('button', { key: 'filter', className: 'btn btn-secondary' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-filter' }),
                        ' Filter'
                    ]),
                    React.createElement('button', { 
                        key: 'new',
                        className: 'btn btn-primary',
                        onClick: () => setShowRequestModal(true)
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                        ' New Request'
                    ])
                ])
            ]),

            // Filter tabs
            React.createElement('div', { key: 'filters', className: 'filter-tabs' }, 
                ['all', 'open', 'in_progress', 'completed'].map(filter =>
                    React.createElement('button', {
                        key: filter,
                        className: `filter-tab ${activeFilter === filter ? 'active' : ''}`,
                        onClick: () => setActiveFilter(filter)
                    }, filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' '))
                )
            ),

            // Tickets grid
            React.createElement('div', { key: 'grid', className: 'tickets-grid' },
                filteredTickets.map(ticket =>
                    React.createElement('div', { 
                        key: ticket.id, 
                        className: 'ticket-card-pro',
                        onClick: () => setCurrentRequest(ticket)
                    }, [
                        React.createElement('div', { key: 'header', className: 'card-header' }, [
                            React.createElement('div', { key: 'title-row', className: 'title-row' }, [
                                React.createElement('h3', { key: 'title' }, ticket.title),
                                React.createElement('span', { 
                                    key: 'priority',
                                    className: `priority-indicator ${ticket.priority}`,
                                    style: { backgroundColor: priorityConfig[ticket.priority].color }
                                })
                            ]),
                            React.createElement('div', { key: 'id', className: 'ticket-id' }, ticket.id)
                        ]),
                        React.createElement('div', { key: 'body', className: 'card-body' }, [
                            React.createElement('div', { key: 'property-info', className: 'info-row' }, [
                                React.createElement('i', { key: 'icon', className: 'fas fa-building' }),
                                ' ',
                                React.createElement('span', { key: 'text' }, `${ticket.property} - Unit ${ticket.unit}`)
                            ]),
                            React.createElement('div', { key: 'tenant-info', className: 'info-row' }, [
                                React.createElement('i', { key: 'icon', className: 'fas fa-user' }),
                                ' ',
                                React.createElement('span', { key: 'text' }, ticket.tenant)
                            ]),
                            ticket.vendor && React.createElement('div', { key: 'vendor-info', className: 'info-row' }, [
                                React.createElement('i', { key: 'icon', className: 'fas fa-hard-hat' }),
                                ' ',
                                React.createElement('span', { key: 'text' }, ticket.vendor)
                            ])
                        ]),
                        React.createElement('div', { key: 'footer', className: 'card-footer' }, [
                            React.createElement('div', { key: 'category', className: 'category-tag' }, [
                                React.createElement('i', { 
                                    key: 'icon',
                                    className: `fas ${maintenanceCategories[ticket.category].icon}`,
                                    style: { color: maintenanceCategories[ticket.category].color }
                                }),
                                ' ',
                                maintenanceCategories[ticket.category].label
                            ]),
                            React.createElement('div', { key: 'meta', className: 'meta-info' }, [
                                ticket.photos > 0 && React.createElement('span', { key: 'photos', className: 'photo-count' }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-camera' }),
                                    ' ',
                                    ticket.photos
                                ]),
                                React.createElement('span', { key: 'time', className: 'time-ago' }, 
                                    getTimeAgo(ticket.created)
                                )
                            ])
                        ])
                    ])
                )
            )
        ]);
    };

    // Vendors View Component - Use the comprehensive vendor management system
    const VendorsView = () => {
        return React.createElement((window.AppModules && window.AppModules.VendorManagementSystem) || 
            (() => React.createElement('div', { className: 'vendors-view-pro' }, 'Loading vendor management system...'))
        );
    };

    // Helper function for time ago
    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes} min ago`;
        } else if (hours < 24) {
            return `${hours} hrs ago`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days} ${days === 1 ? 'day' : 'days'} ago`;
        }
    };

    // Main render
    return React.createElement('div', { className: 'maintenance-ecosystem-pro' }, [
        // Navigation
        React.createElement('div', { key: 'nav', className: 'ecosystem-nav' }, [
            React.createElement('div', { key: 'nav-items', className: 'nav-items' }, [
                React.createElement('button', {
                    key: 'dashboard',
                    className: `nav-item ${activeView === 'dashboard' ? 'active' : ''}`,
                    onClick: () => setActiveView('dashboard')
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-tachometer-alt' }),
                    ' Dashboard'
                ]),
                React.createElement('button', {
                    key: 'tickets',
                    className: `nav-item ${activeView === 'tickets' ? 'active' : ''}`,
                    onClick: () => setActiveView('tickets')
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-ticket-alt' }),
                    ' Tickets'
                ]),
                React.createElement('button', {
                    key: 'vendors',
                    className: `nav-item ${activeView === 'vendors' ? 'active' : ''}`,
                    onClick: () => setActiveView('vendors')
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-hard-hat' }),
                    ' Vendors'
                ]),
                React.createElement('button', {
                    key: 'ai-triage',
                    className: `nav-item ${activeView === 'ai-triage' ? 'active' : ''}`,
                    onClick: () => setActiveView('ai-triage')
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                    ' AI Triage'
                ]),
                React.createElement('button', {
                    key: 'analytics',
                    className: `nav-item ${activeView === 'analytics' ? 'active' : ''}`,
                    onClick: () => setActiveView('analytics')
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-chart-bar' }),
                    ' Analytics'
                ])
            ]),
            React.createElement('div', { key: 'property-selector', className: 'property-selector' }, [
                React.createElement('label', { key: 'label' }, 'Property:'),
                React.createElement('select', {
                    key: 'select',
                    value: selectedProperty,
                    onChange: (e) => setSelectedProperty(e.target.value),
                    className: 'property-select'
                }, [
                    React.createElement('option', { key: 'all', value: 'all' }, 'All Properties'),
                    React.createElement('option', { key: 'sunset', value: 'sunset' }, 'Sunset Apartments'),
                    React.createElement('option', { key: 'downtown', value: 'downtown' }, 'Downtown Plaza'),
                    React.createElement('option', { key: 'garden', value: 'garden' }, 'Garden Complex')
                ])
            ])
        ]),

        // Content Area
        React.createElement('div', { key: 'content', className: 'ecosystem-content' }, 
            activeView === 'dashboard' ? DashboardView() :
            activeView === 'tickets' ? React.createElement((window.AppModules && window.AppModules.MaintenanceCommand) || 
                (() => React.createElement('div', {}, 'Loading Maintenance Command Center...'))) :
            activeView === 'vendors' ? VendorsView() :
            activeView === 'ai-triage' ? React.createElement((window.AppModules && window.AppModules.TenantMaintenanceChat) || 
                (() => React.createElement('div', {}, 'Loading AI Triage...')), {
                    property: selectedProperty === 'all' ? 'All Properties' : selectedProperty,
                    unit: 'Demo',
                    tenant: { first_name: 'Demo', last_name: 'User' }
                }) :
            React.createElement('div', { className: 'coming-soon' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-hard-hat fa-3x' }),
                React.createElement('h2', { key: 'title' }, 'Coming Soon'),
                React.createElement('p', { key: 'desc' }, 'This feature is under development')
            ])
        )
    ]);
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.MaintenanceEcosystemPro = MaintenanceEcosystemPro;