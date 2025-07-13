// MaintenanceDashboard.jsx - Complete Maintenance Visibility & Predictive Analytics
const MaintenanceDashboard = (() => {
    const ComponentFactory = {
        createComponent: (name) => (componentFunc) => {
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
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('MaintenanceDashboard')((props, helpers) => {
        const { useLocalState, useAsyncState } = helpers;
        
        const [state, updateState] = useLocalState({
            viewMode: 'kanban', // kanban, timeline, list
            filterStatus: 'all',
            selectedRequest: null,
            showPredictiveInsights: false,
            timeRange: '30days'
        });

        // Load maintenance data with AI predictions
        const maintenanceData = useAsyncState(async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            return {
                requests: [
                    {
                        id: 'MNT-001',
                        title: 'Kitchen sink leak',
                        unit: '3B',
                        tenant: 'Sarah Johnson',
                        category: 'plumbing',
                        status: 'in_progress',
                        urgencyScore: 85,
                        createdAt: '2025-01-10T10:30:00',
                        vendor: 'Quick Fix Plumbing',
                        scheduledFor: '2025-01-11T14:00:00',
                        estimatedCost: 125,
                        aiNotes: 'AI detected potential pipe corrosion. Recommend full inspection.',
                        chatActivity: 12
                    },
                    {
                        id: 'MNT-002',
                        title: 'AC not cooling properly',
                        unit: '5A',
                        tenant: 'Mike Chen',
                        category: 'hvac',
                        status: 'scheduled',
                        urgencyScore: 70,
                        createdAt: '2025-01-09T15:45:00',
                        vendor: 'Cool Air Services',
                        scheduledFor: '2025-01-12T09:00:00',
                        estimatedCost: 200,
                        aiNotes: 'Pattern detected: 3rd HVAC issue this summer. System may need replacement.',
                        chatActivity: 8
                    },
                    {
                        id: 'MNT-003',
                        title: 'Broken door lock',
                        unit: '2C',
                        tenant: 'Emma Davis',
                        category: 'security',
                        status: 'new',
                        urgencyScore: 95,
                        createdAt: '2025-01-11T08:00:00',
                        vendor: null,
                        aiNotes: 'HIGH PRIORITY: Security issue. Immediate vendor dispatch recommended.',
                        chatActivity: 3
                    }
                ],
                predictiveInsights: {
                    upcomingMaintenance: [
                        {
                            type: 'HVAC Service',
                            units: ['1A', '1B', '2A', '2B'],
                            predictedDate: '2025-02-15',
                            reason: 'Annual service due based on historical patterns',
                            estimatedCost: 800,
                            preventionTip: 'Schedule group service for cost savings'
                        },
                        {
                            type: 'Plumbing Inspection',
                            units: ['3A', '3B', '3C'],
                            predictedDate: '2025-02-01',
                            reason: 'Water pressure anomaly detected in building sensors',
                            estimatedCost: 300,
                            preventionTip: 'Early inspection can prevent major leaks'
                        }
                    ],
                    vendorPerformance: [
                        {
                            vendor: 'Quick Fix Plumbing',
                            avgResponseTime: '2.5 hours',
                            completionRate: '96%',
                            avgRating: 4.8,
                            recommendation: 'Top performer - prioritize for urgent issues'
                        },
                        {
                            vendor: 'HandyPro Services',
                            avgResponseTime: '4 hours',
                            completionRate: '88%',
                            avgRating: 4.2,
                            recommendation: 'Good for non-urgent repairs'
                        }
                    ]
                },
                statistics: {
                    totalRequests: 145,
                    avgResolutionTime: '2.3 days',
                    firstTimeFixRate: '87%',
                    tenantSatisfaction: '4.6/5',
                    costSavings: '$2,450 (from AI troubleshooting)'
                }
            };
        }, [state.timeRange]);

        if (maintenanceData.loading) {
            return React.createElement('div', { className: 'maintenance-loading' },
                React.createElement('div', { className: 'spinner' })
            );
        }

        const data = maintenanceData.data || {};

        return React.createElement('div', { className: 'maintenance-dashboard' }, [
            // Dashboard Header
            React.createElement('div', { key: 'header', className: 'dashboard-header' }, [
                React.createElement('h2', { key: 'title' }, 'Maintenance Command Center'),
                React.createElement('div', { key: 'controls', className: 'header-controls' }, [
                    // View Mode Toggle
                    React.createElement('div', { key: 'view-toggle', className: 'view-toggle' }, [
                        ['kanban', 'fa-columns', 'Kanban'],
                        ['timeline', 'fa-stream', 'Timeline'],
                        ['list', 'fa-list', 'List']
                    ].map(([mode, icon, label]) =>
                        React.createElement('button', {
                            key: mode,
                            className: `view-btn ${state.viewMode === mode ? 'active' : ''}`,
                            onClick: () => updateState({ viewMode: mode }),
                            title: label
                        }, React.createElement('i', { className: `fas ${icon}` }))
                    )),
                    
                    // AI Insights Toggle
                    React.createElement('button', {
                        key: 'ai-toggle',
                        className: `ai-insights-btn ${state.showPredictiveInsights ? 'active' : ''}`,
                        onClick: () => updateState({ showPredictiveInsights: !state.showPredictiveInsights })
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                        'AI Insights'
                    ])
                ])
            ]),

            // Key Metrics
            React.createElement('div', { key: 'metrics', className: 'maintenance-metrics' }, [
                {
                    label: 'Open Requests',
                    value: data.requests?.filter(r => r.status !== 'completed').length || 0,
                    icon: 'fa-tools',
                    color: 'primary'
                },
                {
                    label: 'Avg Resolution',
                    value: data.statistics?.avgResolutionTime || 'N/A',
                    icon: 'fa-clock',
                    color: 'info'
                },
                {
                    label: 'First-Time Fix',
                    value: data.statistics?.firstTimeFixRate || 'N/A',
                    icon: 'fa-check-circle',
                    color: 'success'
                },
                {
                    label: 'AI Savings',
                    value: data.statistics?.costSavings || '$0',
                    icon: 'fa-piggy-bank',
                    color: 'warning'
                }
            ].map((metric, idx) =>
                React.createElement('div', { 
                    key: idx, 
                    className: `metric-card ${metric.color}` 
                }, [
                    React.createElement('i', { key: 'icon', className: `fas ${metric.icon}` }),
                    React.createElement('div', { key: 'content', className: 'metric-content' }, [
                        React.createElement('span', { key: 'value', className: 'metric-value' }, metric.value),
                        React.createElement('span', { key: 'label', className: 'metric-label' }, metric.label)
                    ])
                ])
            )),

            // Main Content Area
            React.createElement('div', { key: 'content', className: 'dashboard-content' }, [
                // Predictive Insights Panel
                state.showPredictiveInsights && React.createElement(PredictiveMaintenancePanel, {
                    key: 'predictive',
                    insights: data.predictiveInsights,
                    onSchedulePreventive: (maintenance) => {
                        console.log('Schedule preventive maintenance:', maintenance);
                    }
                }),

                // Maintenance Requests View
                React.createElement('div', { key: 'requests', className: 'maintenance-requests' }, [
                    state.viewMode === 'kanban' && React.createElement(MaintenanceKanban, {
                        key: 'kanban',
                        requests: data.requests || [],
                        onSelectRequest: (request) => updateState({ selectedRequest: request })
                    }),
                    
                    state.viewMode === 'timeline' && React.createElement(MaintenanceTimeline, {
                        key: 'timeline',
                        requests: data.requests || [],
                        onSelectRequest: (request) => updateState({ selectedRequest: request })
                    }),
                    
                    state.viewMode === 'list' && React.createElement(MaintenanceList, {
                        key: 'list',
                        requests: data.requests || [],
                        onSelectRequest: (request) => updateState({ selectedRequest: request })
                    })
                ])
            ]),

            // Request Detail Modal
            state.selectedRequest && React.createElement(MaintenanceDetailModal, {
                key: 'detail',
                request: state.selectedRequest,
                onClose: () => updateState({ selectedRequest: null }),
                onUpdateStatus: (status) => {
                    console.log('Update status:', status);
                }
            })
        ]);
    });
})();

// Maintenance Kanban View
const MaintenanceKanban = ComponentFactory.createComponent('MaintenanceKanban')((props, helpers) => {
    const { requests, onSelectRequest } = props;
    
    const columns = [
        { id: 'new', title: 'New Requests', color: '#ef4444' },
        { id: 'scheduled', title: 'Scheduled', color: '#f59e0b' },
        { id: 'in_progress', title: 'In Progress', color: '#3b82f6' },
        { id: 'awaiting_parts', title: 'Awaiting Parts', color: '#8b5cf6' },
        { id: 'completed', title: 'Completed', color: '#10b981' }
    ];

    return React.createElement('div', { className: 'maintenance-kanban' },
        columns.map(column =>
            React.createElement('div', { key: column.id, className: 'kanban-column' }, [
                React.createElement('div', { 
                    key: 'header', 
                    className: 'column-header',
                    style: { borderTopColor: column.color }
                }, [
                    React.createElement('h3', { key: 'title' }, column.title),
                    React.createElement('span', { key: 'count', className: 'column-count' },
                        requests.filter(r => r.status === column.id).length
                    )
                ]),
                
                React.createElement('div', { key: 'cards', className: 'column-cards' },
                    requests
                        .filter(r => r.status === column.id)
                        .map(request =>
                            React.createElement('div', {
                                key: request.id,
                                className: 'maintenance-card',
                                onClick: () => onSelectRequest(request)
                            }, [
                                React.createElement('div', { key: 'header', className: 'card-header' }, [
                                    React.createElement('span', { key: 'id', className: 'request-id' }, request.id),
                                    React.createElement('span', { 
                                        key: 'urgency', 
                                        className: `urgency-badge urgency-${
                                            request.urgencyScore >= 80 ? 'high' : 
                                            request.urgencyScore >= 50 ? 'medium' : 'low'
                                        }` 
                                    }, request.urgencyScore)
                                ]),
                                
                                React.createElement('h4', { key: 'title' }, request.title),
                                React.createElement('p', { key: 'unit' }, `Unit ${request.unit} - ${request.tenant}`),
                                
                                request.vendor && React.createElement('div', { 
                                    key: 'vendor', 
                                    className: 'card-vendor' 
                                }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-user-tie' }),
                                    request.vendor
                                ]),
                                
                                request.scheduledFor && React.createElement('div', { 
                                    key: 'schedule', 
                                    className: 'card-schedule' 
                                }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-calendar' }),
                                    new Date(request.scheduledFor).toLocaleDateString()
                                ]),
                                
                                request.aiNotes && React.createElement('div', { 
                                    key: 'ai-note', 
                                    className: 'card-ai-note' 
                                }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                                    request.aiNotes
                                ]),
                                
                                React.createElement('div', { key: 'footer', className: 'card-footer' }, [
                                    React.createElement('span', { key: 'category', className: 'card-category' },
                                        React.createElement('i', { className: `fas fa-${getCategoryIcon(request.category)}` })
                                    ),
                                    request.chatActivity > 0 && React.createElement('span', { 
                                        key: 'chat', 
                                        className: 'card-chat' 
                                    }, [
                                        React.createElement('i', { key: 'icon', className: 'fas fa-comment' }),
                                        request.chatActivity
                                    ])
                                ])
                            ])
                        )
                )
            ])
        )
    );
});

// Predictive Maintenance Panel
const PredictiveMaintenancePanel = ComponentFactory.createComponent('PredictiveMaintenancePanel')((props, helpers) => {
    const { insights, onSchedulePreventive } = props;
    
    return React.createElement('div', { className: 'predictive-maintenance-panel' }, [
        React.createElement('h3', { key: 'title' }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-crystal-ball' }),
            'AI Predictive Insights'
        ]),
        
        // Upcoming Maintenance Predictions
        React.createElement('div', { key: 'predictions', className: 'maintenance-predictions' }, [
            React.createElement('h4', { key: 'title' }, 'Predicted Maintenance Needs'),
            React.createElement('div', { key: 'list', className: 'predictions-list' },
                insights?.upcomingMaintenance?.map((prediction, idx) =>
                    React.createElement('div', { key: idx, className: 'prediction-card' }, [
                        React.createElement('div', { key: 'header', className: 'prediction-header' }, [
                            React.createElement('h5', { key: 'type' }, prediction.type),
                            React.createElement('span', { key: 'date', className: 'prediction-date' },
                                `Due: ${new Date(prediction.predictedDate).toLocaleDateString()}`
                            )
                        ]),
                        React.createElement('p', { key: 'units', className: 'affected-units' },
                            `Units: ${prediction.units.join(', ')}`
                        ),
                        React.createElement('p', { key: 'reason', className: 'prediction-reason' },
                            React.createElement('i', { className: 'fas fa-info-circle' }),
                            ' ',
                            prediction.reason
                        ),
                        React.createElement('div', { key: 'footer', className: 'prediction-footer' }, [
                            React.createElement('span', { key: 'cost', className: 'estimated-cost' },
                                `Est. $${prediction.estimatedCost}`
                            ),
                            React.createElement('button', {
                                key: 'schedule',
                                className: 'schedule-btn',
                                onClick: () => onSchedulePreventive(prediction)
                            }, 'Schedule Now')
                        ]),
                        React.createElement('div', { key: 'tip', className: 'prevention-tip' }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-lightbulb' }),
                            prediction.preventionTip
                        ])
                    ])
                )
            )
        ]),
        
        // Vendor Performance Insights
        React.createElement('div', { key: 'vendors', className: 'vendor-insights' }, [
            React.createElement('h4', { key: 'title' }, 'Vendor Performance Analysis'),
            React.createElement('div', { key: 'list', className: 'vendor-performance-list' },
                insights?.vendorPerformance?.map((vendor, idx) =>
                    React.createElement('div', { key: idx, className: 'vendor-performance-card' }, [
                        React.createElement('h5', { key: 'name' }, vendor.vendor),
                        React.createElement('div', { key: 'metrics', className: 'vendor-metrics' }, [
                            React.createElement('div', { key: 'response', className: 'metric' }, [
                                React.createElement('i', { key: 'icon', className: 'fas fa-clock' }),
                                React.createElement('span', { key: 'label' }, 'Response: '),
                                React.createElement('strong', { key: 'value' }, vendor.avgResponseTime)
                            ]),
                            React.createElement('div', { key: 'completion', className: 'metric' }, [
                                React.createElement('i', { key: 'icon', className: 'fas fa-check' }),
                                React.createElement('span', { key: 'label' }, 'Completion: '),
                                React.createElement('strong', { key: 'value' }, vendor.completionRate)
                            ]),
                            React.createElement('div', { key: 'rating', className: 'metric' }, [
                                React.createElement('i', { key: 'icon', className: 'fas fa-star' }),
                                React.createElement('span', { key: 'label' }, 'Rating: '),
                                React.createElement('strong', { key: 'value' }, vendor.avgRating)
                            ])
                        ]),
                        React.createElement('p', { key: 'recommendation', className: 'ai-recommendation' },
                            React.createElement('i', { className: 'fas fa-robot' }),
                            ' ',
                            vendor.recommendation
                        )
                    ])
                )
            )
        ])
    ]);
});

// Utility Functions
function getCategoryIcon(category) {
    const icons = {
        plumbing: 'faucet',
        electrical: 'bolt',
        hvac: 'temperature-high',
        appliance: 'blender',
        security: 'lock',
        pest: 'bug',
        other: 'tools'
    };
    return icons[category] || 'tools';
}

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.MaintenanceDashboard = MaintenanceDashboard;
window.AppModules.MaintenanceKanban = MaintenanceKanban;
window.AppModules.PredictiveMaintenancePanel = PredictiveMaintenancePanel;