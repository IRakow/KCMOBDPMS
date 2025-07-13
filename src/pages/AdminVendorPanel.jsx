// AdminVendorPanel.jsx - Property Manager's Vendor Management System
const AdminVendorPanel = (() => {
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
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('AdminVendorPanel')((props, helpers) => {
        const { useLocalState, formatCurrency, formatDate } = helpers;
        const { companyId, userId, userRole } = props;

        const [state, updateState] = useLocalState({
            activeView: 'dashboard',
            vendors: [],
            workOrders: [],
            aiInsights: {},
            selectedVendor: null,
            showVendorModal: false,
            showMatchingModal: false,
            currentWorkOrder: null,
            performanceData: {},
            preferredVendors: [],
            loading: true
        });

        // Load admin data
        React.useEffect(() => {
            loadAdminData();
        }, [companyId]);

        const loadAdminData = async () => {
            // Simulate API calls
            const mockVendors = [
                {
                    id: 'V001',
                    companyName: 'ABC Plumbing',
                    contactName: 'John Smith',
                    email: 'john@abcplumbing.com',
                    phone: '(555) 123-4567',
                    specialties: ['Plumbing', 'Water Heater'],
                    rating: 4.8,
                    totalJobs: 156,
                    avgResponseTime: 15,
                    avgCompletionTime: 2.5,
                    pricing: 'competitive',
                    insurance: true,
                    licensed: true,
                    preferred: true,
                    aiScore: 94,
                    availability: 'high',
                    currentJobs: 3,
                    completedThisMonth: 12
                },
                {
                    id: 'V002',
                    companyName: 'Lightning Electric',
                    contactName: 'Sarah Johnson',
                    email: 'sarah@lightningelectric.com',
                    phone: '(555) 234-5678',
                    specialties: ['Electrical', 'Lighting', 'Panel Upgrade'],
                    rating: 4.9,
                    totalJobs: 98,
                    avgResponseTime: 10,
                    avgCompletionTime: 3,
                    pricing: 'premium',
                    insurance: true,
                    licensed: true,
                    preferred: false,
                    aiScore: 91,
                    availability: 'medium',
                    currentJobs: 5,
                    completedThisMonth: 8
                },
                {
                    id: 'V003',
                    companyName: 'CoolBreeze HVAC',
                    contactName: 'Mike Chen',
                    email: 'mike@coolbreezehvac.com',
                    phone: '(555) 345-6789',
                    specialties: ['HVAC', 'AC Repair', 'Heating'],
                    rating: 4.7,
                    totalJobs: 203,
                    avgResponseTime: 20,
                    avgCompletionTime: 4,
                    pricing: 'budget',
                    insurance: true,
                    licensed: true,
                    preferred: true,
                    aiScore: 88,
                    availability: 'high',
                    currentJobs: 2,
                    completedThisMonth: 15
                }
            ];

            const mockWorkOrders = [
                {
                    id: 'WO101',
                    property: 'Sunset Apartments',
                    unit: '3B',
                    issue: 'Leaking kitchen faucet',
                    category: 'plumbing',
                    priority: 'high',
                    status: 'unassigned',
                    createdAt: new Date('2025-01-13T10:00:00'),
                    tenant: 'Sarah Williams',
                    estimatedCost: 150,
                    aiUrgencyScore: 85,
                    aiRecommendedVendors: ['V001', 'V004']
                },
                {
                    id: 'WO102',
                    property: 'Downtown Plaza',
                    unit: '5A',
                    issue: 'No power in bedroom outlets',
                    category: 'electrical',
                    priority: 'urgent',
                    status: 'assigned',
                    assignedTo: 'V002',
                    scheduledFor: new Date('2025-01-14T14:00:00'),
                    createdAt: new Date('2025-01-12T16:00:00'),
                    tenant: 'Robert Johnson',
                    estimatedCost: 200,
                    aiUrgencyScore: 92
                }
            ];

            const mockAIInsights = {
                vendorPerformance: {
                    topPerformer: 'Lightning Electric',
                    fastestResponse: 'ABC Plumbing',
                    bestValue: 'CoolBreeze HVAC',
                    highestRated: 'Lightning Electric'
                },
                maintenanceTrends: {
                    mostCommonIssue: 'Plumbing (35%)',
                    avgResolutionTime: '2.8 days',
                    peakRequestTime: 'Monday mornings',
                    seasonalAlert: 'AC maintenance season approaching'
                },
                costAnalysis: {
                    avgJobCost: 185,
                    monthlySpend: 4850,
                    projectedSavings: 650,
                    suggestion: 'Consider annual contracts for 15% savings'
                }
            };

            updateState({
                vendors: mockVendors,
                workOrders: mockWorkOrders,
                aiInsights: mockAIInsights,
                loading: false
            });
        };

        return React.createElement('div', { className: 'admin-vendor-panel' }, [
            // Header
            React.createElement('header', { key: 'header', className: 'admin-header' }, [
                React.createElement('h1', { key: 'title' }, 'Vendor Management'),
                React.createElement('nav', { key: 'nav', className: 'admin-nav' }, [
                    { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt' },
                    { id: 'vendors', label: 'Vendors', icon: 'fa-users' },
                    { id: 'workorders', label: 'Work Orders', icon: 'fa-clipboard-list' },
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
            React.createElement('div', { key: 'content', className: 'admin-content' }, [
                state.activeView === 'dashboard' && renderDashboard(),
                state.activeView === 'vendors' && renderVendorsView(),
                state.activeView === 'workorders' && renderWorkOrdersView(),
                state.activeView === 'analytics' && renderAnalyticsView(),
                state.activeView === 'settings' && renderSettingsView()
            ]),

            // Vendor Detail Modal
            state.showVendorModal && React.createElement(VendorDetailModal, {
                key: 'vendor-modal',
                vendor: state.selectedVendor,
                onClose: () => updateState({ showVendorModal: false, selectedVendor: null }),
                onUpdate: (vendorData) => updateVendor(vendorData)
            }),

            // AI Vendor Matching Modal
            state.showMatchingModal && React.createElement(AIVendorMatchingModal, {
                key: 'matching-modal',
                workOrder: state.currentWorkOrder,
                vendors: state.vendors,
                onAssign: (vendorId) => assignVendor(state.currentWorkOrder.id, vendorId),
                onClose: () => updateState({ showMatchingModal: false, currentWorkOrder: null })
            })
        ]);

        // Dashboard View
        function renderDashboard() {
            const activeWorkOrders = state.workOrders.filter(wo => wo.status !== 'completed');
            const unassignedOrders = state.workOrders.filter(wo => wo.status === 'unassigned');

            return React.createElement('div', { className: 'vendor-dashboard' }, [
                // AI Insights Panel
                React.createElement('div', { key: 'insights', className: 'ai-insights-panel' }, [
                    React.createElement('h2', { key: 'title' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                        'AI Insights & Recommendations'
                    ]),
                    React.createElement('div', { key: 'cards', className: 'insights-grid' }, [
                        React.createElement('div', { key: 'performance', className: 'insight-card' }, [
                            React.createElement('h3', {}, 'Vendor Performance'),
                            React.createElement('div', { className: 'insight-metrics' }, [
                                React.createElement('div', { className: 'metric' }, [
                                    React.createElement('label', {}, 'Top Performer'),
                                    React.createElement('span', {}, state.aiInsights.vendorPerformance?.topPerformer)
                                ]),
                                React.createElement('div', { className: 'metric' }, [
                                    React.createElement('label', {}, 'Fastest Response'),
                                    React.createElement('span', {}, state.aiInsights.vendorPerformance?.fastestResponse)
                                ])
                            ])
                        ]),
                        React.createElement('div', { key: 'trends', className: 'insight-card' }, [
                            React.createElement('h3', {}, 'Maintenance Trends'),
                            React.createElement('div', { className: 'trend-alert' }, [
                                React.createElement('i', { className: 'fas fa-exclamation-circle' }),
                                React.createElement('span', {}, state.aiInsights.maintenanceTrends?.seasonalAlert)
                            ]),
                            React.createElement('p', {}, `Most common: ${state.aiInsights.maintenanceTrends?.mostCommonIssue}`)
                        ]),
                        React.createElement('div', { key: 'cost', className: 'insight-card' }, [
                            React.createElement('h3', {}, 'Cost Analysis'),
                            React.createElement('div', { className: 'cost-metrics' }, [
                                React.createElement('div', { className: 'metric' }, [
                                    React.createElement('label', {}, 'Monthly Spend'),
                                    React.createElement('span', {}, formatCurrency(state.aiInsights.costAnalysis?.monthlySpend))
                                ]),
                                React.createElement('div', { className: 'metric suggestion' }, [
                                    React.createElement('i', { className: 'fas fa-lightbulb' }),
                                    React.createElement('span', {}, state.aiInsights.costAnalysis?.suggestion)
                                ])
                            ])
                        ])
                    ])
                ]),

                // Quick Stats
                React.createElement('div', { key: 'stats', className: 'quick-stats' }, [
                    {
                        label: 'Active Work Orders',
                        value: activeWorkOrders.length,
                        icon: 'fa-wrench',
                        color: 'primary'
                    },
                    {
                        label: 'Unassigned',
                        value: unassignedOrders.length,
                        icon: 'fa-exclamation-triangle',
                        color: 'warning'
                    },
                    {
                        label: 'Active Vendors',
                        value: state.vendors.length,
                        icon: 'fa-users',
                        color: 'success'
                    },
                    {
                        label: 'Avg Response Time',
                        value: '18 min',
                        icon: 'fa-clock',
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
                            React.createElement('span', { key: 'label', className: 'stat-label' }, stat.label)
                        ])
                    ])
                )),

                // Unassigned Work Orders
                unassignedOrders.length > 0 && React.createElement('div', {
                    key: 'unassigned',
                    className: 'unassigned-orders'
                }, [
                    React.createElement('h2', { key: 'title' }, 'Unassigned Work Orders'),
                    React.createElement('div', { key: 'list', className: 'work-order-list' },
                        unassignedOrders.map(order =>
                            React.createElement(WorkOrderCard, {
                                key: order.id,
                                order: order,
                                onAssign: () => updateState({
                                    showMatchingModal: true,
                                    currentWorkOrder: order
                                })
                            })
                        )
                    )
                ])
            ]);
        }

        // Vendors View
        function renderVendorsView() {
            const [filterCategory, setFilterCategory] = React.useState('all');
            const [showOnlyPreferred, setShowOnlyPreferred] = React.useState(false);

            const filteredVendors = state.vendors.filter(vendor => {
                if (showOnlyPreferred && !vendor.preferred) return false;
                if (filterCategory === 'all') return true;
                return vendor.specialties.some(s => s.toLowerCase().includes(filterCategory.toLowerCase()));
            });

            return React.createElement('div', { className: 'vendors-view' }, [
                React.createElement('div', { key: 'header', className: 'view-header' }, [
                    React.createElement('h2', { key: 'title' }, 'Vendor Directory'),
                    React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                        React.createElement('button', {
                            key: 'add',
                            className: 'btn btn-primary',
                            onClick: () => addNewVendor()
                        }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                            'Add Vendor'
                        ])
                    ])
                ]),

                React.createElement('div', { key: 'filters', className: 'vendor-filters' }, [
                    React.createElement('select', {
                        key: 'category',
                        value: filterCategory,
                        onChange: (e) => setFilterCategory(e.target.value)
                    }, [
                        React.createElement('option', { key: 'all', value: 'all' }, 'All Categories'),
                        React.createElement('option', { key: 'plumbing', value: 'plumbing' }, 'Plumbing'),
                        React.createElement('option', { key: 'electrical', value: 'electrical' }, 'Electrical'),
                        React.createElement('option', { key: 'hvac', value: 'hvac' }, 'HVAC'),
                        React.createElement('option', { key: 'general', value: 'general' }, 'General')
                    ]),
                    React.createElement('label', { key: 'preferred', className: 'preferred-filter' }, [
                        React.createElement('input', {
                            type: 'checkbox',
                            checked: showOnlyPreferred,
                            onChange: (e) => setShowOnlyPreferred(e.target.checked)
                        }),
                        'Show only preferred vendors'
                    ])
                ]),

                React.createElement('div', { key: 'grid', className: 'vendors-grid' },
                    filteredVendors.map(vendor =>
                        React.createElement(VendorCard, {
                            key: vendor.id,
                            vendor: vendor,
                            onSelect: () => updateState({
                                selectedVendor: vendor,
                                showVendorModal: true
                            }),
                            onTogglePreferred: () => togglePreferredVendor(vendor.id)
                        })
                    )
                )
            ]);
        }

        // Work Orders View with Kanban
        function renderWorkOrdersView() {
            const stages = [
                { id: 'unassigned', label: 'Unassigned', color: 'danger' },
                { id: 'assigned', label: 'Assigned', color: 'warning' },
                { id: 'in_progress', label: 'In Progress', color: 'info' },
                { id: 'completed', label: 'Completed', color: 'success' }
            ];

            return React.createElement('div', { className: 'work-orders-view' }, [
                React.createElement('div', { key: 'header', className: 'view-header' }, [
                    React.createElement('h2', { key: 'title' }, 'Work Order Management'),
                    React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                        React.createElement('button', {
                            key: 'ai-assign',
                            className: 'btn btn-ai'
                        }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                            'AI Auto-Assign All'
                        ])
                    ])
                ]),

                React.createElement('div', { key: 'kanban', className: 'kanban-board' },
                    stages.map(stage =>
                        React.createElement('div', {
                            key: stage.id,
                            className: `kanban-column ${stage.color}`
                        }, [
                            React.createElement('div', { key: 'header', className: 'column-header' }, [
                                React.createElement('h3', { key: 'title' }, stage.label),
                                React.createElement('span', { key: 'count', className: 'order-count' },
                                    state.workOrders.filter(wo => wo.status === stage.id).length
                                )
                            ]),
                            React.createElement('div', { key: 'orders', className: 'column-orders' },
                                state.workOrders
                                    .filter(wo => wo.status === stage.id)
                                    .map(order =>
                                        React.createElement(WorkOrderKanbanCard, {
                                            key: order.id,
                                            order: order,
                                            vendors: state.vendors,
                                            onStatusChange: (newStatus) => updateWorkOrderStatus(order.id, newStatus),
                                            onAssign: () => updateState({
                                                showMatchingModal: true,
                                                currentWorkOrder: order
                                            })
                                        })
                                    )
                            )
                        ])
                    )
                )
            ]);
        }

        // Analytics View
        function renderAnalyticsView() {
            return React.createElement('div', { className: 'analytics-view' }, [
                React.createElement('h2', { key: 'title' }, 'Vendor Analytics & Performance'),
                React.createElement(VendorAnalytics, {
                    key: 'analytics',
                    vendors: state.vendors,
                    workOrders: state.workOrders,
                    timeRange: 'month'
                })
            ]);
        }

        // Settings View
        function renderSettingsView() {
            return React.createElement('div', { className: 'settings-view' }, [
                React.createElement('h2', { key: 'title' }, 'Vendor Settings'),
                React.createElement(VendorSettings, {
                    key: 'settings',
                    companyId: companyId,
                    preferredVendors: state.preferredVendors,
                    onUpdate: (settings) => updateVendorSettings(settings)
                })
            ]);
        }

        // Vendor Management Functions
        async function assignVendor(workOrderId, vendorId) {
            const updatedOrders = state.workOrders.map(wo =>
                wo.id === workOrderId
                    ? { ...wo, status: 'assigned', assignedTo: vendorId, assignedAt: new Date() }
                    : wo
            );
            updateState({
                workOrders: updatedOrders,
                showMatchingModal: false,
                currentWorkOrder: null
            });

            // Notify vendor through their portal
            window.Toast?.success('Vendor assigned successfully! They have been notified.');
        }

        function togglePreferredVendor(vendorId) {
            const updatedVendors = state.vendors.map(v =>
                v.id === vendorId ? { ...v, preferred: !v.preferred } : v
            );
            updateState({ vendors: updatedVendors });
        }

        function updateWorkOrderStatus(orderId, newStatus) {
            const updatedOrders = state.workOrders.map(wo =>
                wo.id === orderId ? { ...wo, status: newStatus } : wo
            );
            updateState({ workOrders: updatedOrders });
        }
    });
})();

// Work Order Card Component
const WorkOrderCard = ComponentFactory.createComponent('WorkOrderCard')((props, helpers) => {
    const { order, onAssign } = props;
    const { formatDate } = helpers;

    const priorityColors = {
        low: 'secondary',
        medium: 'warning',
        high: 'danger',
        urgent: 'danger'
    };

    return React.createElement('div', { className: 'work-order-card' }, [
        React.createElement('div', { key: 'header', className: 'order-header' }, [
            React.createElement('div', { key: 'info' }, [
                React.createElement('h4', { key: 'id' }, `#${order.id}`),
                React.createElement('p', { key: 'location' }, `${order.property} - Unit ${order.unit}`)
            ]),
            React.createElement('span', {
                key: 'priority',
                className: `priority-badge ${priorityColors[order.priority]}`
            }, order.priority.toUpperCase())
        ]),

        React.createElement('p', { key: 'issue', className: 'order-issue' }, order.issue),

        React.createElement('div', { key: 'ai-score', className: 'ai-urgency' }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-exclamation-triangle' }),
            React.createElement('span', {}, 'AI Urgency Score: '),
            React.createElement('strong', {}, `${order.aiUrgencyScore}/100`)
        ]),

        React.createElement('div', { key: 'details', className: 'order-details' }, [
            React.createElement('span', { key: 'tenant' }, [
                React.createElement('i', { className: 'fas fa-user' }),
                order.tenant
            ]),
            React.createElement('span', { key: 'created' }, [
                React.createElement('i', { className: 'fas fa-clock' }),
                formatDate(order.createdAt)
            ])
        ]),

        React.createElement('button', {
            key: 'assign',
            className: 'btn btn-primary btn-block',
            onClick: onAssign
        }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-user-plus' }),
            'Assign Vendor'
        ])
    ]);
});

// AI Vendor Matching Modal
const AIVendorMatchingModal = ComponentFactory.createComponent('AIVendorMatchingModal')((props, helpers) => {
    const { workOrder, vendors, onAssign, onClose } = props;
    const { formatCurrency } = helpers;

    // AI matching logic
    const getVendorMatches = () => {
        return vendors
            .filter(v => v.specialties.some(s => s.toLowerCase().includes(workOrder.category)))
            .map(vendor => {
                let score = 0;
                let reasons = [];

                // Availability score
                if (vendor.availability === 'high') {
                    score += 30;
                    reasons.push('Available immediately');
                }

                // Rating score
                score += vendor.rating * 10;
                if (vendor.rating >= 4.8) {
                    reasons.push('Excellent rating');
                }

                // Response time score
                if (vendor.avgResponseTime <= 15) {
                    score += 20;
                    reasons.push('Fast response time');
                }

                // Price consideration
                if (workOrder.priority === 'urgent' && vendor.pricing !== 'premium') {
                    score += 10;
                } else if (vendor.pricing === 'budget') {
                    score += 15;
                    reasons.push('Cost-effective');
                }

                // Preferred vendor bonus
                if (vendor.preferred) {
                    score += 10;
                    reasons.push('Preferred vendor');
                }

                return {
                    ...vendor,
                    matchScore: Math.min(score, 100),
                    matchReasons: reasons
                };
            })
            .sort((a, b) => b.matchScore - a.matchScore);
    };

    const matches = getVendorMatches();
    const topMatch = matches[0];

    return React.createElement('div', { 
        className: 'modal-overlay',
        onClick: onClose
    },
        React.createElement('div', {
            className: 'modal-content ai-matching-modal',
            onClick: (e) => e.stopPropagation()
        }, [
            React.createElement('div', { key: 'header', className: 'modal-header' }, [
                React.createElement('h2', { key: 'title' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                    'AI Vendor Matching'
                ]),
                React.createElement('button', {
                    key: 'close',
                    className: 'close-btn',
                    onClick: onClose
                }, '×')
            ]),

            React.createElement('div', { key: 'order-info', className: 'work-order-summary' }, [
                React.createElement('h3', {}, `Work Order #${workOrder.id}`),
                React.createElement('p', {}, workOrder.issue),
                React.createElement('div', { className: 'order-meta' }, [
                    React.createElement('span', {}, `${workOrder.property} - Unit ${workOrder.unit}`),
                    React.createElement('span', { className: `priority ${workOrder.priority}` }, 
                        workOrder.priority.toUpperCase()
                    )
                ])
            ]),

            topMatch && React.createElement('div', { 
                key: 'recommendation', 
                className: 'ai-recommendation' 
            }, [
                React.createElement('h3', {}, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-star' }),
                    'AI Recommendation'
                ]),
                React.createElement('div', { className: 'recommended-vendor' }, [
                    React.createElement('div', { className: 'vendor-info' }, [
                        React.createElement('h4', {}, topMatch.companyName),
                        React.createElement('div', { className: 'match-score' }, [
                            React.createElement('span', { className: 'score' }, `${topMatch.matchScore}%`),
                            React.createElement('span', { className: 'label' }, 'match')
                        ])
                    ]),
                    React.createElement('div', { className: 'match-reasons' },
                        topMatch.matchReasons.map((reason, idx) =>
                            React.createElement('span', { key: idx, className: 'reason-badge' }, [
                                React.createElement('i', { className: 'fas fa-check' }),
                                reason
                            ])
                        )
                    ),
                    React.createElement('button', {
                        className: 'btn btn-success',
                        onClick: () => onAssign(topMatch.id)
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-check' }),
                        'Assign Recommended Vendor'
                    ])
                ])
            ]),

            React.createElement('div', { key: 'alternatives', className: 'vendor-alternatives' }, [
                React.createElement('h3', {}, 'Other Matches'),
                React.createElement('div', { className: 'vendor-list' },
                    matches.slice(1, 4).map(vendor =>
                        React.createElement('div', {
                            key: vendor.id,
                            className: 'vendor-option'
                        }, [
                            React.createElement('div', { className: 'vendor-details' }, [
                                React.createElement('h4', {}, vendor.companyName),
                                React.createElement('div', { className: 'vendor-stats' }, [
                                    React.createElement('span', {}, `${vendor.rating} ★`),
                                    React.createElement('span', {}, `${vendor.avgResponseTime} min response`),
                                    React.createElement('span', {}, vendor.pricing)
                                ])
                            ]),
                            React.createElement('div', { className: 'vendor-actions' }, [
                                React.createElement('span', { className: 'match-score' }, `${vendor.matchScore}%`),
                                React.createElement('button', {
                                    className: 'btn btn-primary btn-sm',
                                    onClick: () => onAssign(vendor.id)
                                }, 'Assign')
                            ])
                        ])
                    )
                )
            ])
        ])
    );
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.AdminVendorPanel = AdminVendorPanel;
window.AppModules.WorkOrderCard = WorkOrderCard;
window.AppModules.AIVendorMatchingModal = AIVendorMatchingModal;