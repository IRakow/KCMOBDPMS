// MaintenanceKanban.jsx - Complete Maintenance Workflow with Kanban & Timeline Views
const MaintenanceKanban = (() => {
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
                            month: 'short',
                            day: 'numeric'
                        });
                    },
                    formatDateTime: (date) => {
                        return new Date(date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });
                    },
                    getTimeSince: (date) => {
                        const now = new Date();
                        const then = new Date(date);
                        const diffMs = now - then;
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffMins = Math.floor(diffMs / (1000 * 60));
                        
                        if (diffDays > 0) return `${diffDays}d ago`;
                        if (diffHours > 0) return `${diffHours}h ago`;
                        return `${diffMins}m ago`;
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('MaintenanceKanban')((props, helpers) => {
        const { useLocalState, formatDate, formatDateTime, getTimeSince } = helpers;
        const { companyId, userRole } = props;

        const [state, updateState] = useLocalState({
            viewMode: 'kanban', // kanban | timeline | calendar
            workOrders: [],
            filters: {
                property: 'all',
                priority: 'all',
                category: 'all',
                assignee: 'all',
                dateRange: 'week'
            },
            selectedOrder: null,
            showDetailModal: false,
            draggedItem: null,
            searchQuery: '',
            aiChatOpen: false,
            aiQuery: '',
            maintenanceHistory: [],
            predictiveInsights: []
        });

        // Load maintenance data
        React.useEffect(() => {
            loadMaintenanceData();
            loadPredictiveInsights();
        }, [state.filters]);

        const loadMaintenanceData = async () => {
            // Simulate API call
            const mockWorkOrders = [
                {
                    id: 'WO201',
                    title: 'Leaking kitchen faucet',
                    property: 'Sunset Apartments',
                    unit: '3B',
                    tenant: 'Sarah Johnson',
                    category: 'plumbing',
                    priority: 'high',
                    status: 'new',
                    createdAt: new Date('2025-01-13T09:00:00'),
                    description: 'Kitchen faucet has been dripping constantly for 2 days',
                    aiUrgencyScore: 85,
                    estimatedCost: 150,
                    photos: ['faucet1.jpg'],
                    chatMessages: 3
                },
                {
                    id: 'WO202',
                    title: 'AC not cooling properly',
                    property: 'Downtown Plaza',
                    unit: '5A',
                    tenant: 'Mike Chen',
                    category: 'hvac',
                    priority: 'medium',
                    status: 'in_progress',
                    assignedTo: 'CoolBreeze HVAC',
                    assignedAt: new Date('2025-01-12T14:00:00'),
                    scheduledFor: new Date('2025-01-14T10:00:00'),
                    createdAt: new Date('2025-01-11T16:00:00'),
                    description: 'AC running but not cooling. Tenant reports room temp at 78°F',
                    aiUrgencyScore: 72,
                    estimatedCost: 250,
                    chatMessages: 8,
                    vendorETA: '10:00 AM - 12:00 PM'
                },
                {
                    id: 'WO203',
                    title: 'Toilet running constantly',
                    property: 'Garden Complex',
                    unit: '2C',
                    tenant: 'Emma Davis',
                    category: 'plumbing',
                    priority: 'medium',
                    status: 'awaiting_parts',
                    assignedTo: 'ABC Plumbing',
                    createdAt: new Date('2025-01-10T11:00:00'),
                    description: 'Toilet flapper needs replacement. Part ordered.',
                    aiUrgencyScore: 65,
                    estimatedCost: 75,
                    partsOrdered: true,
                    expectedDelivery: new Date('2025-01-15T12:00:00'),
                    chatMessages: 5
                },
                {
                    id: 'WO204',
                    title: 'Replace smoke detector batteries',
                    property: 'Sunset Apartments',
                    unit: '1A',
                    tenant: 'John Williams',
                    category: 'safety',
                    priority: 'low',
                    status: 'scheduled',
                    assignedTo: 'In-house Maintenance',
                    scheduledFor: new Date('2025-01-16T09:00:00'),
                    createdAt: new Date('2025-01-09T08:00:00'),
                    description: 'Annual smoke detector maintenance',
                    aiUrgencyScore: 45,
                    estimatedCost: 25,
                    chatMessages: 1
                },
                {
                    id: 'WO205',
                    title: 'Window seal repair',
                    property: 'Downtown Plaza',
                    unit: '8B',
                    tenant: 'Lisa Anderson',
                    category: 'general',
                    priority: 'low',
                    status: 'completed',
                    assignedTo: 'HandyPro Services',
                    completedAt: new Date('2025-01-12T15:30:00'),
                    createdAt: new Date('2025-01-08T10:00:00'),
                    description: 'Window seal letting in cold air',
                    aiUrgencyScore: 35,
                    totalCost: 120,
                    rating: 5,
                    feedback: 'Quick and professional service!',
                    chatMessages: 6
                }
            ];

            const mockHistory = [
                {
                    id: 'H001',
                    action: 'status_change',
                    workOrderId: 'WO202',
                    from: 'new',
                    to: 'in_progress',
                    timestamp: new Date('2025-01-12T14:00:00'),
                    user: 'System',
                    note: 'Vendor assigned and notified'
                },
                {
                    id: 'H002',
                    action: 'vendor_message',
                    workOrderId: 'WO202',
                    timestamp: new Date('2025-01-12T14:30:00'),
                    user: 'CoolBreeze HVAC',
                    note: 'Confirmed appointment for tomorrow at 10 AM'
                },
                {
                    id: 'H003',
                    action: 'created',
                    workOrderId: 'WO201',
                    timestamp: new Date('2025-01-13T09:00:00'),
                    user: 'AI Assistant',
                    note: 'Work order created from tenant chat'
                }
            ];

            updateState({ 
                workOrders: mockWorkOrders,
                maintenanceHistory: mockHistory
            });
        };

        const loadPredictiveInsights = async () => {
            // Simulate AI predictive maintenance insights
            const insights = [
                {
                    id: 'PI001',
                    type: 'upcoming',
                    title: 'HVAC Filter Replacements Due',
                    description: '12 units need HVAC filter replacements in the next 2 weeks',
                    units: ['3A', '3B', '4C', '5A', '5B', '6A', '7B', '8A', '8B', '9A', '10B', '11C'],
                    estimatedCost: 600,
                    dueDate: new Date('2025-01-28'),
                    priority: 'medium',
                    action: 'Schedule Bulk Service'
                },
                {
                    id: 'PI002',
                    type: 'pattern',
                    title: 'Increased Plumbing Issues - Building B',
                    description: '40% increase in plumbing issues in Building B. Possible main line issue.',
                    affectedUnits: 8,
                    trend: 'increasing',
                    recommendation: 'Schedule inspection of main water line',
                    priority: 'high'
                },
                {
                    id: 'PI003',
                    type: 'seasonal',
                    title: 'Winter Preparation Checklist',
                    description: 'Seasonal maintenance tasks for cold weather preparation',
                    tasks: ['Gutter cleaning', 'Heating system checks', 'Pipe insulation'],
                    estimatedCost: 2500,
                    deadline: new Date('2025-02-01'),
                    priority: 'medium'
                }
            ];

            updateState({ predictiveInsights: insights });
        };

        const kanbanColumns = [
            { id: 'new', title: 'New Requests', color: 'danger', icon: 'fa-inbox' },
            { id: 'in_progress', title: 'In Progress', color: 'primary', icon: 'fa-wrench' },
            { id: 'awaiting_parts', title: 'Awaiting Parts', color: 'warning', icon: 'fa-box' },
            { id: 'scheduled', title: 'Scheduled', color: 'info', icon: 'fa-calendar' },
            { id: 'completed', title: 'Completed', color: 'success', icon: 'fa-check-circle' }
        ];

        return React.createElement('div', { className: 'maintenance-kanban' }, [
            // Header
            React.createElement('div', { key: 'header', className: 'kanban-header' }, [
                React.createElement('div', { key: 'title-section' }, [
                    React.createElement('h1', { key: 'title' }, 'Maintenance Management'),
                    React.createElement('div', { key: 'stats', className: 'header-stats' }, [
                        React.createElement('span', { key: 'total' }, 
                            `${state.workOrders.filter(wo => wo.status !== 'completed').length} Active`
                        ),
                        React.createElement('span', { key: 'urgent' }, 
                            `${state.workOrders.filter(wo => wo.priority === 'high').length} Urgent`
                        ),
                        React.createElement('span', { key: 'overdue' }, 
                            `${state.workOrders.filter(wo => isOverdue(wo)).length} Overdue`
                        )
                    ])
                ]),
                React.createElement('div', { key: 'controls', className: 'header-controls' }, [
                    React.createElement('div', { key: 'search', className: 'search-box' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-search' }),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            placeholder: 'Search work orders...',
                            value: state.searchQuery,
                            onChange: (e) => updateState({ searchQuery: e.target.value })
                        })
                    ]),
                    React.createElement('div', { key: 'view-toggle', className: 'view-toggle' }, [
                        { id: 'kanban', icon: 'fa-th', label: 'Kanban' },
                        { id: 'timeline', icon: 'fa-stream', label: 'Timeline' },
                        { id: 'calendar', icon: 'fa-calendar-alt', label: 'Calendar' }
                    ].map(view =>
                        React.createElement('button', {
                            key: view.id,
                            className: `view-btn ${state.viewMode === view.id ? 'active' : ''}`,
                            onClick: () => updateState({ viewMode: view.id }),
                            title: view.label
                        }, React.createElement('i', { className: `fas ${view.icon}` }))
                    )),
                    React.createElement('button', {
                        key: 'ai-chat',
                        className: 'btn btn-ai',
                        onClick: () => updateState({ aiChatOpen: !state.aiChatOpen })
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                        'AI Assistant'
                    ])
                ])
            ]),

            // Filters
            React.createElement('div', { key: 'filters', className: 'kanban-filters' }, [
                React.createElement('select', {
                    key: 'property',
                    value: state.filters.property,
                    onChange: (e) => updateState({ 
                        filters: { ...state.filters, property: e.target.value }
                    })
                }, [
                    React.createElement('option', { key: 'all', value: 'all' }, 'All Properties'),
                    React.createElement('option', { key: 'sunset', value: 'sunset' }, 'Sunset Apartments'),
                    React.createElement('option', { key: 'downtown', value: 'downtown' }, 'Downtown Plaza'),
                    React.createElement('option', { key: 'garden', value: 'garden' }, 'Garden Complex')
                ]),
                React.createElement('select', {
                    key: 'priority',
                    value: state.filters.priority,
                    onChange: (e) => updateState({ 
                        filters: { ...state.filters, priority: e.target.value }
                    })
                }, [
                    React.createElement('option', { key: 'all', value: 'all' }, 'All Priorities'),
                    React.createElement('option', { key: 'high', value: 'high' }, 'High Priority'),
                    React.createElement('option', { key: 'medium', value: 'medium' }, 'Medium Priority'),
                    React.createElement('option', { key: 'low', value: 'low' }, 'Low Priority')
                ]),
                React.createElement('select', {
                    key: 'category',
                    value: state.filters.category,
                    onChange: (e) => updateState({ 
                        filters: { ...state.filters, category: e.target.value }
                    })
                }, [
                    React.createElement('option', { key: 'all', value: 'all' }, 'All Categories'),
                    React.createElement('option', { key: 'plumbing', value: 'plumbing' }, 'Plumbing'),
                    React.createElement('option', { key: 'electrical', value: 'electrical' }, 'Electrical'),
                    React.createElement('option', { key: 'hvac', value: 'hvac' }, 'HVAC'),
                    React.createElement('option', { key: 'general', value: 'general' }, 'General')
                ]),
                React.createElement('button', {
                    key: 'add-order',
                    className: 'btn btn-primary'
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                    'New Work Order'
                ])
            ]),

            // Predictive Insights Bar
            state.predictiveInsights.length > 0 && React.createElement('div', {
                key: 'insights',
                className: 'predictive-insights-bar'
            }, [
                React.createElement('h3', { key: 'title' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-lightbulb' }),
                    'AI Predictive Insights'
                ]),
                React.createElement('div', { key: 'insights', className: 'insights-scroll' },
                    state.predictiveInsights.map(insight =>
                        React.createElement('div', {
                            key: insight.id,
                            className: `insight-card ${insight.priority}`
                        }, [
                            React.createElement('div', { key: 'content' }, [
                                React.createElement('h4', { key: 'title' }, insight.title),
                                React.createElement('p', { key: 'desc' }, insight.description)
                            ]),
                            insight.action && React.createElement('button', {
                                key: 'action',
                                className: 'insight-action'
                            }, insight.action)
                        ])
                    )
                )
            ]),

            // Main Content Area
            React.createElement('div', { key: 'content', className: 'kanban-content' }, [
                state.viewMode === 'kanban' && renderKanbanView(),
                state.viewMode === 'timeline' && renderTimelineView(),
                state.viewMode === 'calendar' && renderCalendarView()
            ]),

            // Work Order Detail Modal
            state.showDetailModal && React.createElement(WorkOrderDetailModal, {
                key: 'detail-modal',
                workOrder: state.selectedOrder,
                onClose: () => updateState({ showDetailModal: false, selectedOrder: null }),
                onUpdate: (updates) => updateWorkOrder(state.selectedOrder.id, updates),
                maintenanceHistory: state.maintenanceHistory.filter(h => h.workOrderId === state.selectedOrder.id)
            }),

            // AI Chat Assistant
            state.aiChatOpen && React.createElement(MaintenanceAIChat, {
                key: 'ai-chat',
                workOrders: state.workOrders,
                onClose: () => updateState({ aiChatOpen: false }),
                onQuery: (query) => handleAIQuery(query)
            })
        ]);

        // Kanban View
        function renderKanbanView() {
            const filteredOrders = filterWorkOrders(state.workOrders);

            return React.createElement('div', { className: 'kanban-board' },
                kanbanColumns.map(column =>
                    React.createElement('div', {
                        key: column.id,
                        className: `kanban-column ${column.color}`,
                        onDragOver: handleDragOver,
                        onDrop: (e) => handleDrop(e, column.id)
                    }, [
                        React.createElement('div', { key: 'header', className: 'column-header' }, [
                            React.createElement('i', { key: 'icon', className: `fas ${column.icon}` }),
                            React.createElement('h3', { key: 'title' }, column.title),
                            React.createElement('span', { key: 'count', className: 'column-count' },
                                filteredOrders.filter(wo => wo.status === column.id).length
                            )
                        ]),
                        React.createElement('div', { key: 'cards', className: 'column-cards' },
                            filteredOrders
                                .filter(wo => wo.status === column.id)
                                .map(order =>
                                    React.createElement(WorkOrderCard, {
                                        key: order.id,
                                        order: order,
                                        onSelect: () => updateState({ 
                                            selectedOrder: order, 
                                            showDetailModal: true 
                                        }),
                                        onDragStart: (e) => handleDragStart(e, order),
                                        draggable: true
                                    })
                                )
                        )
                    ])
                )
            );
        }

        // Timeline View
        function renderTimelineView() {
            const filteredOrders = filterWorkOrders(state.workOrders);
            const timelineEvents = generateTimelineEvents(filteredOrders, state.maintenanceHistory);

            return React.createElement('div', { className: 'timeline-view' },
                timelineEvents.map((event, idx) =>
                    React.createElement('div', {
                        key: event.id,
                        className: `timeline-event ${event.type}`
                    }, [
                        React.createElement('div', { key: 'marker', className: 'timeline-marker' },
                            React.createElement('i', { className: `fas ${getEventIcon(event)}` })
                        ),
                        React.createElement('div', { key: 'content', className: 'timeline-content' }, [
                            React.createElement('div', { key: 'header', className: 'event-header' }, [
                                React.createElement('h4', { key: 'title' }, event.title),
                                React.createElement('span', { key: 'time', className: 'event-time' }, 
                                    formatDateTime(event.timestamp)
                                )
                            ]),
                            React.createElement('p', { key: 'desc', className: 'event-description' }, 
                                event.description
                            ),
                            event.workOrder && React.createElement('div', {
                                key: 'details',
                                className: 'event-details'
                            }, [
                                React.createElement('span', { key: 'property' }, event.workOrder.property),
                                React.createElement('span', { key: 'unit' }, `Unit ${event.workOrder.unit}`),
                                React.createElement('span', { 
                                    key: 'priority',
                                    className: `priority-badge ${event.workOrder.priority}`
                                }, event.workOrder.priority)
                            ])
                        ])
                    ])
                )
            );
        }

        // Calendar View (simplified)
        function renderCalendarView() {
            return React.createElement('div', { className: 'calendar-view' },
                React.createElement('div', { className: 'calendar-placeholder' }, [
                    React.createElement('i', { className: 'fas fa-calendar-alt' }),
                    React.createElement('p', {}, 'Calendar view showing scheduled maintenance')
                ])
            );
        }

        // Helper Functions
        function filterWorkOrders(orders) {
            return orders.filter(order => {
                const matchesSearch = !state.searchQuery || 
                    order.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                    order.tenant.toLowerCase().includes(state.searchQuery.toLowerCase());
                
                const matchesProperty = state.filters.property === 'all' || 
                    order.property.toLowerCase().includes(state.filters.property);
                
                const matchesPriority = state.filters.priority === 'all' || 
                    order.priority === state.filters.priority;
                
                const matchesCategory = state.filters.category === 'all' || 
                    order.category === state.filters.category;

                return matchesSearch && matchesProperty && matchesPriority && matchesCategory;
            });
        }

        function isOverdue(workOrder) {
            if (workOrder.status === 'completed') return false;
            const created = new Date(workOrder.createdAt);
            const now = new Date();
            const daysSince = (now - created) / (1000 * 60 * 60 * 24);
            
            if (workOrder.priority === 'high' && daysSince > 1) return true;
            if (workOrder.priority === 'medium' && daysSince > 3) return true;
            if (workOrder.priority === 'low' && daysSince > 7) return true;
            
            return false;
        }

        function handleDragStart(e, order) {
            updateState({ draggedItem: order });
            e.dataTransfer.effectAllowed = 'move';
        }

        function handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }

        function handleDrop(e, newStatus) {
            e.preventDefault();
            if (state.draggedItem) {
                updateWorkOrder(state.draggedItem.id, { status: newStatus });
                updateState({ draggedItem: null });
            }
        }

        function updateWorkOrder(orderId, updates) {
            const updatedOrders = state.workOrders.map(wo =>
                wo.id === orderId ? { ...wo, ...updates } : wo
            );
            updateState({ workOrders: updatedOrders });
            
            // Log history
            const historyEntry = {
                id: `H${Date.now()}`,
                action: 'status_change',
                workOrderId: orderId,
                from: state.workOrders.find(wo => wo.id === orderId).status,
                to: updates.status,
                timestamp: new Date(),
                user: 'Property Manager'
            };
            updateState({ 
                maintenanceHistory: [...state.maintenanceHistory, historyEntry]
            });
        }

        function generateTimelineEvents(orders, history) {
            const events = [];
            
            // Add work order events
            orders.forEach(order => {
                events.push({
                    id: `WO-${order.id}`,
                    type: 'work_order',
                    title: order.title,
                    description: `Created by ${order.tenant}`,
                    timestamp: order.createdAt,
                    workOrder: order
                });
                
                if (order.completedAt) {
                    events.push({
                        id: `WO-${order.id}-complete`,
                        type: 'completion',
                        title: `${order.title} - Completed`,
                        description: `Completed by ${order.assignedTo}`,
                        timestamp: order.completedAt,
                        workOrder: order
                    });
                }
            });
            
            // Add history events
            history.forEach(entry => {
                const order = orders.find(wo => wo.id === entry.workOrderId);
                if (order) {
                    events.push({
                        id: entry.id,
                        type: entry.action,
                        title: `${order.title} - ${entry.action.replace('_', ' ')}`,
                        description: entry.note || `Changed by ${entry.user}`,
                        timestamp: entry.timestamp,
                        workOrder: order
                    });
                }
            });
            
            // Sort by timestamp
            return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        }

        function getEventIcon(event) {
            const icons = {
                work_order: 'fa-wrench',
                completion: 'fa-check-circle',
                status_change: 'fa-exchange-alt',
                vendor_message: 'fa-comment',
                created: 'fa-plus-circle'
            };
            return icons[event.type] || 'fa-circle';
        }

        async function handleAIQuery(query) {
            // Process AI query about maintenance
            const lowerQuery = query.toLowerCase();
            
            if (lowerQuery.includes('overdue')) {
                const overdue = state.workOrders.filter(isOverdue);
                return `There are ${overdue.length} overdue work orders. The most urgent is "${overdue[0]?.title}" at ${overdue[0]?.property}.`;
            }
            
            if (lowerQuery.includes('cost') || lowerQuery.includes('spend')) {
                const totalCost = state.workOrders.reduce((sum, wo) => 
                    sum + (wo.totalCost || wo.estimatedCost || 0), 0
                );
                return `Total maintenance costs this period: $${totalCost}. Average cost per work order: $${Math.round(totalCost / state.workOrders.length)}.`;
            }
            
            if (lowerQuery.includes('vendor')) {
                const vendors = [...new Set(state.workOrders.map(wo => wo.assignedTo).filter(Boolean))];
                return `Currently working with ${vendors.length} vendors. Most active: ${vendors[0]}.`;
            }
            
            return "I can help you with maintenance queries. Try asking about overdue items, costs, or vendor performance.";
        }
    });
})();

// Work Order Card Component
const WorkOrderCard = ComponentFactory.createComponent('WorkOrderCard')((props, helpers) => {
    const { order, onSelect, onDragStart, draggable } = props;
    const { formatDate, getTimeSince } = helpers;

    const priorityColors = {
        high: 'danger',
        medium: 'warning',
        low: 'secondary'
    };

    const categoryIcons = {
        plumbing: 'fa-faucet',
        electrical: 'fa-bolt',
        hvac: 'fa-snowflake',
        general: 'fa-tools',
        safety: 'fa-shield-alt'
    };

    return React.createElement('div', {
        className: `work-order-card ${order.priority}`,
        onClick: onSelect,
        draggable: draggable,
        onDragStart: onDragStart
    }, [
        React.createElement('div', { key: 'header', className: 'card-header' }, [
            React.createElement('div', { key: 'title-section' }, [
                React.createElement('h4', { key: 'title' }, order.title),
                React.createElement('p', { key: 'location' }, `${order.property} - Unit ${order.unit}`)
            ]),
            React.createElement('span', {
                key: 'priority',
                className: `priority-indicator ${priorityColors[order.priority]}`
            })
        ]),

        React.createElement('div', { key: 'body', className: 'card-body' }, [
            React.createElement('div', { key: 'category', className: 'card-category' }, [
                React.createElement('i', { className: `fas ${categoryIcons[order.category]}` }),
                React.createElement('span', {}, order.category)
            ]),
            order.aiUrgencyScore && React.createElement('div', {
                key: 'ai-score',
                className: 'ai-urgency-indicator'
            }, [
                React.createElement('span', { className: 'score-label' }, 'AI Urgency:'),
                React.createElement('div', { className: 'score-bar' },
                    React.createElement('div', {
                        className: 'score-fill',
                        style: { width: `${order.aiUrgencyScore}%` }
                    })
                ),
                React.createElement('span', { className: 'score-value' }, order.aiUrgencyScore)
            ])
        ]),

        React.createElement('div', { key: 'footer', className: 'card-footer' }, [
            React.createElement('div', { key: 'tenant', className: 'tenant-info' }, [
                React.createElement('i', { className: 'fas fa-user' }),
                React.createElement('span', {}, order.tenant)
            ]),
            React.createElement('div', { key: 'time', className: 'time-info' }, [
                React.createElement('i', { className: 'fas fa-clock' }),
                React.createElement('span', {}, getTimeSince(order.createdAt))
            ]),
            order.chatMessages > 0 && React.createElement('div', {
                key: 'chat',
                className: 'chat-indicator'
            }, [
                React.createElement('i', { className: 'fas fa-comment' }),
                React.createElement('span', {}, order.chatMessages)
            ])
        ]),

        order.assignedTo && React.createElement('div', {
            key: 'assigned',
            className: 'assigned-vendor'
        }, [
            React.createElement('i', { className: 'fas fa-user-check' }),
            React.createElement('span', {}, order.assignedTo)
        ]),

        order.scheduledFor && React.createElement('div', {
            key: 'scheduled',
            className: 'scheduled-time'
        }, [
            React.createElement('i', { className: 'fas fa-calendar-check' }),
            React.createElement('span', {}, formatDate(order.scheduledFor)),
            order.vendorETA && React.createElement('span', { className: 'eta' }, order.vendorETA)
        ])
    ]);
});

// Maintenance AI Chat Component
const MaintenanceAIChat = ComponentFactory.createComponent('MaintenanceAIChat')((props, helpers) => {
    const { workOrders, onClose, onQuery } = props;
    const [messages, setMessages] = React.useState([
        {
            id: 1,
            sender: 'ai',
            text: 'Hello! I can help you query maintenance data. Try asking about overdue items, costs, vendor performance, or specific properties.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = React.useState('');

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Add user message
        const userMessage = {
            id: messages.length + 1,
            sender: 'user',
            text: input,
            timestamp: new Date()
        };
        setMessages([...messages, userMessage]);

        // Get AI response
        const response = await onQuery(input);
        const aiMessage = {
            id: messages.length + 2,
            sender: 'ai',
            text: response,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        setInput('');
    };

    const quickQueries = [
        'Show overdue work orders',
        'What are the maintenance costs this month?',
        'Which vendor is most active?',
        'Any emergency repairs needed?'
    ];

    return React.createElement('div', { className: 'maintenance-ai-chat' }, [
        React.createElement('div', { key: 'header', className: 'chat-header' }, [
            React.createElement('h3', { key: 'title' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                'Maintenance AI Assistant'
            ]),
            React.createElement('button', {
                key: 'close',
                className: 'close-btn',
                onClick: onClose
            }, '×')
        ]),

        React.createElement('div', { key: 'messages', className: 'chat-messages' },
            messages.map(msg =>
                React.createElement('div', {
                    key: msg.id,
                    className: `message ${msg.sender}`
                }, [
                    React.createElement('div', { key: 'bubble', className: 'message-bubble' }, msg.text),
                    React.createElement('div', { key: 'time', className: 'message-time' }, 
                        helpers.formatTime(msg.timestamp)
                    )
                ])
            )
        ),

        React.createElement('div', { key: 'quick', className: 'quick-queries' },
            quickQueries.map((query, idx) =>
                React.createElement('button', {
                    key: idx,
                    className: 'quick-query-btn',
                    onClick: () => setInput(query)
                }, query)
            )
        ),

        React.createElement('div', { key: 'input', className: 'chat-input' }, [
            React.createElement('input', {
                key: 'field',
                type: 'text',
                placeholder: 'Ask about maintenance...',
                value: input,
                onChange: (e) => setInput(e.target.value),
                onKeyPress: (e) => e.key === 'Enter' && sendMessage()
            }),
            React.createElement('button', {
                key: 'send',
                onClick: sendMessage,
                disabled: !input.trim()
            }, React.createElement('i', { className: 'fas fa-paper-plane' }))
        ])
    ]);
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.MaintenanceKanban = MaintenanceKanban;
window.AppModules.WorkOrderCard = WorkOrderCard;
window.AppModules.MaintenanceAIChat = MaintenanceAIChat;