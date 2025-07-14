// MaintenanceCommand.jsx - AI-Powered Maintenance Command Center
const MaintenanceCommand = () => {
    const [view, setView] = React.useState('kanban'); // kanban, timeline, analytics, history
    const [workOrders, setWorkOrders] = React.useState([]);
    const [selectedOrder, setSelectedOrder] = React.useState(null);
    const [showChatInterface, setShowChatInterface] = React.useState(false);
    const [filters, setFilters] = React.useState({
        property: 'all',
        status: 'all',
        priority: 'all',
        dateRange: 'last30days'
    });

    // Work order statuses for Kanban
    const kanbanColumns = {
        new: { title: 'New', color: '#3b82f6', icon: 'fa-inbox' },
        triaging: { title: 'AI Triaging', color: '#8b5cf6', icon: 'fa-brain' },
        assigned: { title: 'Vendor Assigned', color: '#f59e0b', icon: 'fa-user-check' },
        in_progress: { title: 'In Progress', color: '#10b981', icon: 'fa-hammer' },
        awaiting_parts: { title: 'Awaiting Parts', color: '#ec4899', icon: 'fa-box' },
        pending_approval: { title: 'Pending Approval', color: '#6366f1', icon: 'fa-clipboard-check' },
        completed: { title: 'Completed', color: '#059669', icon: 'fa-check-circle' },
        closed: { title: 'Closed', color: '#6b7280', icon: 'fa-archive' }
    };

    // Load work orders
    React.useEffect(() => {
        loadWorkOrders();
        // Set up real-time updates
        const interval = setInterval(checkForUpdates, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [filters]);

    const loadWorkOrders = async () => {
        // In production, this would fetch from API
        setWorkOrders(generateMockWorkOrders());
    };

    const checkForUpdates = async () => {
        // Check for aging requests and send reminders
        const agingOrders = workOrders.filter(order => {
            const daysOld = Math.floor((new Date() - new Date(order.created)) / (1000 * 60 * 60 * 24));
            return order.status === 'new' && daysOld > 2;
        });

        agingOrders.forEach(order => {
            sendAutomaticReminder(order);
        });
    };

    const sendAutomaticReminder = (order) => {
        console.log(`Sending reminder for aging request: ${order.id}`);
        // In production, this would trigger notifications
    };

    // Generate mock work orders
    const generateMockWorkOrders = () => {
        return [
            {
                id: 'WO-2024-001',
                title: 'Water leak under kitchen sink',
                property: 'Sunset Apartments',
                unit: '203',
                tenant: { name: 'Sarah Johnson', id: 'tenant-1' },
                status: 'in_progress',
                priority: 'high',
                category: 'plumbing',
                created: '2025-01-12T10:30:00',
                updated: '2025-01-14T14:20:00',
                vendor: { name: 'AquaFix Plumbing', id: 'vendor-1' },
                estimatedCost: 350,
                aiScore: 85,
                conversation: [
                    { type: 'tenant', message: 'Water is leaking from under the sink', timestamp: '2025-01-12T10:30:00' },
                    { type: 'ai', message: 'I can see this is urgent. Let me analyze the photos you provided.', timestamp: '2025-01-12T10:31:00' },
                    { type: 'ai', message: 'Based on the images, this appears to be a pipe joint issue. Assigning AquaFix Plumbing.', timestamp: '2025-01-12T10:32:00' },
                    { type: 'vendor', message: 'On my way. ETA 45 minutes.', timestamp: '2025-01-12T11:00:00' }
                ],
                photos: 2,
                voiceNotes: 1
            },
            {
                id: 'WO-2024-002',
                title: 'AC not cooling - urgent',
                property: 'Downtown Plaza',
                unit: '1205',
                tenant: { name: 'Michael Chen', id: 'tenant-2' },
                status: 'awaiting_parts',
                priority: 'high',
                category: 'hvac',
                created: '2025-01-13T15:45:00',
                updated: '2025-01-14T09:00:00',
                vendor: { name: 'CoolBreeze HVAC', id: 'vendor-3' },
                estimatedCost: 520,
                aiScore: 78,
                partsOrdered: [
                    { name: 'Compressor Capacitor', cost: 85, eta: '2025-01-15' }
                ]
            },
            {
                id: 'WO-2024-003',
                title: 'Preventive HVAC maintenance',
                property: 'Garden Complex',
                unit: 'Common Area',
                tenant: null,
                status: 'new',
                priority: 'low',
                category: 'hvac',
                created: '2025-01-14T08:00:00',
                updated: '2025-01-14T08:00:00',
                aiRecommendation: 'Bundle with 3 other HVAC requests in Building A to save $200',
                recurring: true,
                recurrencePattern: 'quarterly'
            },
            {
                id: 'WO-2024-004',
                title: 'Dishwasher not draining',
                property: 'Sunset Apartments',
                unit: '105',
                tenant: { name: 'Emily Davis', id: 'tenant-3' },
                status: 'completed',
                priority: 'medium',
                category: 'appliance',
                created: '2025-01-10T14:30:00',
                updated: '2025-01-11T16:45:00',
                completed: '2025-01-11T16:45:00',
                vendor: { name: 'AppliancePro', id: 'vendor-4' },
                actualCost: 225,
                rating: null,
                awaitingFeedback: true
            }
        ];
    };

    // Kanban View Component
    const KanbanView = () => {
        const ordersByStatus = React.useMemo(() => {
            const grouped = {};
            Object.keys(kanbanColumns).forEach(status => {
                grouped[status] = workOrders.filter(order => order.status === status);
            });
            return grouped;
        }, [workOrders]);

        const handleDragStart = (e, order) => {
            e.dataTransfer.setData('orderId', order.id);
        };

        const handleDragOver = (e) => {
            e.preventDefault();
        };

        const handleDrop = (e, newStatus) => {
            e.preventDefault();
            const orderId = e.dataTransfer.getData('orderId');
            updateOrderStatus(orderId, newStatus);
        };

        return React.createElement('div', { className: 'kanban-board' },
            Object.entries(kanbanColumns).map(([status, config]) =>
                React.createElement('div', {
                    key: status,
                    className: 'kanban-column',
                    onDragOver: handleDragOver,
                    onDrop: (e) => handleDrop(e, status)
                }, [
                    React.createElement('div', { key: 'header', className: 'column-header' }, [
                        React.createElement('div', { key: 'title', className: 'column-title' }, [
                            React.createElement('i', { 
                                key: 'icon',
                                className: `fas ${config.icon}`,
                                style: { color: config.color }
                            }),
                            React.createElement('span', { key: 'text' }, config.title),
                            React.createElement('span', { key: 'count', className: 'column-count' }, 
                                ordersByStatus[status].length
                            )
                        ]),
                        status === 'new' && React.createElement('button', {
                            key: 'ai-triage',
                            className: 'ai-triage-btn',
                            onClick: () => triageNewOrders()
                        }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                            ' AI Triage All'
                        ])
                    ]),
                    React.createElement('div', { key: 'cards', className: 'column-cards' },
                        ordersByStatus[status].map(order =>
                            React.createElement(WorkOrderCard, {
                                key: order.id,
                                order,
                                onSelect: () => setSelectedOrder(order),
                                draggable: true,
                                onDragStart: (e) => handleDragStart(e, order)
                            })
                        )
                    )
                ])
            )
        );
    };

    // Work Order Card Component
    const WorkOrderCard = ({ order, onSelect, draggable, onDragStart }) => {
        const priorityColors = {
            low: '#10b981',
            medium: '#f59e0b', 
            high: '#ef4444',
            urgent: '#dc2626'
        };

        return React.createElement('div', {
            className: 'work-order-card',
            onClick: onSelect,
            draggable,
            onDragStart
        }, [
            React.createElement('div', { key: 'header', className: 'card-header' }, [
                React.createElement('span', { key: 'id', className: 'order-id' }, order.id),
                React.createElement('span', { 
                    key: 'priority',
                    className: 'priority-dot',
                    style: { backgroundColor: priorityColors[order.priority] },
                    title: `${order.priority} priority`
                })
            ]),
            React.createElement('h4', { key: 'title', className: 'order-title' }, order.title),
            React.createElement('div', { key: 'meta', className: 'order-meta' }, [
                React.createElement('span', { key: 'location' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-building' }),
                    ` ${order.property} - ${order.unit}`
                ]),
                order.tenant && React.createElement('span', { key: 'tenant' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-user' }),
                    ` ${order.tenant.name}`
                ])
            ]),
            order.vendor && React.createElement('div', { key: 'vendor', className: 'order-vendor' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-hard-hat' }),
                ` ${order.vendor.name}`
            ]),
            React.createElement('div', { key: 'footer', className: 'card-footer' }, [
                React.createElement('span', { key: 'time', className: 'time-ago' }, 
                    getTimeAgo(order.updated)
                ),
                React.createElement('div', { key: 'indicators', className: 'indicators' }, [
                    order.photos > 0 && React.createElement('i', { 
                        key: 'photos',
                        className: 'fas fa-camera',
                        title: `${order.photos} photos`
                    }),
                    order.voiceNotes > 0 && React.createElement('i', { 
                        key: 'voice',
                        className: 'fas fa-microphone',
                        title: `${order.voiceNotes} voice notes`
                    }),
                    order.conversation && React.createElement('i', { 
                        key: 'chat',
                        className: 'fas fa-comments',
                        title: 'Has conversation'
                    }),
                    order.awaitingFeedback && React.createElement('i', { 
                        key: 'feedback',
                        className: 'fas fa-star',
                        title: 'Awaiting feedback',
                        style: { color: '#f59e0b' }
                    })
                ])
            ])
        ]);
    };

    // Timeline View Component
    const TimelineView = () => {
        const sortedOrders = [...workOrders].sort((a, b) => 
            new Date(b.updated) - new Date(a.updated)
        );

        return React.createElement('div', { className: 'timeline-view' },
            sortedOrders.map((order, index) =>
                React.createElement('div', { key: order.id, className: 'timeline-item' }, [
                    React.createElement('div', { key: 'marker', className: 'timeline-marker' }, [
                        React.createElement('div', { 
                            key: 'dot',
                            className: `marker-dot ${order.status}`,
                            style: { backgroundColor: kanbanColumns[order.status]?.color }
                        }),
                        index < sortedOrders.length - 1 && 
                        React.createElement('div', { key: 'line', className: 'timeline-line' })
                    ]),
                    React.createElement('div', { key: 'content', className: 'timeline-content' }, [
                        React.createElement('div', { key: 'time', className: 'timeline-time' }, 
                            formatDateTime(order.updated)
                        ),
                        React.createElement(WorkOrderCard, {
                            key: 'card',
                            order,
                            onSelect: () => setSelectedOrder(order)
                        })
                    ])
                ])
            )
        );
    };

    // AI Chat Interface
    const AIChatInterface = () => {
        const [query, setQuery] = React.useState('');
        const [chatHistory, setChatHistory] = React.useState([]);
        const [isProcessing, setIsProcessing] = React.useState(false);

        const handleQuery = async () => {
            if (!query.trim()) return;

            const userMessage = { type: 'user', content: query, timestamp: new Date() };
            setChatHistory(prev => [...prev, userMessage]);
            setQuery('');
            setIsProcessing(true);

            // Process AI query
            const response = await processAIQuery(query);
            
            const aiMessage = { type: 'ai', content: response, timestamp: new Date() };
            setChatHistory(prev => [...prev, aiMessage]);
            setIsProcessing(false);
        };

        return React.createElement('div', { className: 'ai-chat-interface' }, [
            React.createElement('div', { key: 'header', className: 'chat-header' }, [
                React.createElement('h3', { key: 'title' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                    ' AI Maintenance Assistant'
                ]),
                React.createElement('button', {
                    key: 'close',
                    className: 'close-btn',
                    onClick: () => setShowChatInterface(false)
                }, React.createElement('i', { className: 'fas fa-times' }))
            ]),
            React.createElement('div', { key: 'history', className: 'chat-history' },
                chatHistory.map((msg, index) =>
                    React.createElement('div', {
                        key: index,
                        className: `chat-message ${msg.type}`
                    }, [
                        React.createElement('div', { key: 'avatar', className: 'message-avatar' },
                            React.createElement('i', { 
                                className: `fas fa-${msg.type === 'user' ? 'user' : 'robot'}`
                            })
                        ),
                        React.createElement('div', { key: 'content', className: 'message-content' }, [
                            React.createElement('div', { key: 'text', className: 'message-text' }, 
                                msg.content
                            ),
                            React.createElement('div', { key: 'time', className: 'message-time' }, 
                                formatTime(msg.timestamp)
                            )
                        ])
                    ])
                )
            ),
            React.createElement('div', { key: 'input', className: 'chat-input' }, [
                React.createElement('input', {
                    key: 'field',
                    type: 'text',
                    placeholder: 'Ask about maintenance history, vendors, or insights...',
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    onKeyPress: (e) => e.key === 'Enter' && handleQuery()
                }),
                React.createElement('button', {
                    key: 'send',
                    onClick: handleQuery,
                    disabled: isProcessing || !query.trim()
                }, isProcessing ? 
                    React.createElement('i', { className: 'fas fa-spinner fa-spin' }) :
                    React.createElement('i', { className: 'fas fa-paper-plane' })
                )
            ])
        ]);
    };

    // Process AI queries
    const processAIQuery = async (query) => {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1000));

        const lowerQuery = query.toLowerCase();

        // Roof repair query
        if (lowerQuery.includes('roof') && lowerQuery.includes('maple')) {
            return `Based on maintenance records, the roof at Maple Apartments was last repaired on March 15, 2024. The work was done by SkyHigh Roofing for $12,500. It was a partial replacement of the west section due to storm damage. The next scheduled inspection is due in September 2025.`;
        }

        // Vendor performance query
        if (lowerQuery.includes('plumber') && lowerQuery.includes('fast')) {
            return `Analysis of 127 plumbing jobs shows that AquaFix Plumbing resolves drain issues 30% faster than the average (2.3 hours vs 3.3 hours). They also have a 98% first-time fix rate. PowerDrain Plumbing is second fastest at 2.8 hours average.`;
        }

        // Cost analysis
        if (lowerQuery.includes('maintenance') && lowerQuery.includes('cost')) {
            return `This month's maintenance costs are $18,420, which is 12% below the monthly average of $20,932. HVAC repairs account for 35% of costs, followed by plumbing at 28%. I've identified an opportunity to save ~$2,400/month by bundling recurring maintenance tasks.`;
        }

        // General response
        return `I can help you search maintenance records, analyze vendor performance, track costs, and identify patterns. Try asking specific questions like "What's the repair history for unit 203?" or "Which vendor handles electrical issues fastest?"`;
    };

    // Update order status
    const updateOrderStatus = (orderId, newStatus) => {
        setWorkOrders(prev => prev.map(order => 
            order.id === orderId ? { ...order, status: newStatus, updated: new Date().toISOString() } : order
        ));

        // Trigger automations based on status change
        if (newStatus === 'completed') {
            setTimeout(() => requestTenantFeedback(orderId), 300000); // 5 minutes later
        }
    };

    // Request tenant feedback
    const requestTenantFeedback = (orderId) => {
        const order = workOrders.find(o => o.id === orderId);
        if (order && order.tenant) {
            console.log(`Sending feedback request to ${order.tenant.name} for order ${orderId}`);
            // In production, this would send notification
        }
    };

    // Triage new orders with AI
    const triageNewOrders = () => {
        const newOrders = workOrders.filter(o => o.status === 'new');
        newOrders.forEach(order => {
            // Simulate AI triage
            setTimeout(() => {
                updateOrderStatus(order.id, 'triaging');
                setTimeout(() => {
                    updateOrderStatus(order.id, 'assigned');
                }, 2000);
            }, 1000);
        });
    };

    // Helper functions
    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Main render
    return React.createElement('div', { className: 'maintenance-command' }, [
        // Header
        React.createElement('div', { key: 'header', className: 'command-header' }, [
            React.createElement('div', { key: 'title-section' }, [
                React.createElement('h1', { key: 'title' }, 'Maintenance Command Center'),
                React.createElement('p', { key: 'subtitle' }, 'Complete visibility and AI-powered insights')
            ]),
            React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                React.createElement('button', {
                    key: 'chat',
                    className: 'btn btn-secondary',
                    onClick: () => setShowChatInterface(true)
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                    ' AI Assistant'
                ]),
                React.createElement('button', {
                    key: 'new',
                    className: 'btn btn-primary'
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                    ' New Request'
                ])
            ])
        ]),

        // View Tabs
        React.createElement('div', { key: 'tabs', className: 'view-tabs' }, 
            [
                { id: 'kanban', label: 'Kanban Board', icon: 'fa-columns' },
                { id: 'timeline', label: 'Timeline', icon: 'fa-stream' },
                { id: 'analytics', label: 'Analytics', icon: 'fa-chart-bar' },
                { id: 'history', label: 'History', icon: 'fa-history' }
            ].map(tab =>
                React.createElement('button', {
                    key: tab.id,
                    className: `view-tab ${view === tab.id ? 'active' : ''}`,
                    onClick: () => setView(tab.id)
                }, [
                    React.createElement('i', { key: 'icon', className: `fas ${tab.icon}` }),
                    ' ',
                    tab.label
                ])
            )
        ),

        // Content Area
        React.createElement('div', { key: 'content', className: 'command-content' },
            view === 'kanban' ? KanbanView() :
            view === 'timeline' ? TimelineView() :
            React.createElement('div', { className: 'coming-soon' }, 'Coming soon...')
        ),

        // Selected Order Detail Modal
        selectedOrder && React.createElement(WorkOrderDetail, {
            key: 'detail',
            order: selectedOrder,
            onClose: () => setSelectedOrder(null),
            onUpdate: (updatedOrder) => {
                setWorkOrders(prev => prev.map(o => 
                    o.id === updatedOrder.id ? updatedOrder : o
                ));
                setSelectedOrder(updatedOrder);
            }
        }),

        // AI Chat Interface
        showChatInterface && AIChatInterface()
    ]);
};

// Work Order Detail Component
const WorkOrderDetail = ({ order, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = React.useState('conversation');
    
    return React.createElement('div', { className: 'work-order-detail-modal' }, [
        React.createElement('div', { key: 'backdrop', className: 'modal-backdrop', onClick: onClose }),
        React.createElement('div', { key: 'content', className: 'modal-content' }, [
            React.createElement('div', { key: 'header', className: 'modal-header' }, [
                React.createElement('h2', { key: 'title' }, order.title),
                React.createElement('button', {
                    key: 'close',
                    className: 'close-btn',
                    onClick: onClose
                }, React.createElement('i', { className: 'fas fa-times' }))
            ]),
            
            // Tabs
            React.createElement('div', { key: 'tabs', className: 'detail-tabs' },
                ['conversation', 'details', 'history', 'costs'].map(tab =>
                    React.createElement('button', {
                        key: tab,
                        className: `detail-tab ${activeTab === tab ? 'active' : ''}`,
                        onClick: () => setActiveTab(tab)
                    }, tab.charAt(0).toUpperCase() + tab.slice(1))
                )
            ),

            // Tab Content
            React.createElement('div', { key: 'tab-content', className: 'tab-content' },
                activeTab === 'conversation' && order.conversation ?
                    React.createElement('div', { className: 'conversation-log' },
                        order.conversation.map((msg, idx) =>
                            React.createElement('div', {
                                key: idx,
                                className: `conversation-message ${msg.type}`
                            }, [
                                React.createElement('div', { key: 'avatar', className: 'msg-avatar' },
                                    React.createElement('i', { 
                                        className: `fas fa-${
                                            msg.type === 'tenant' ? 'user' : 
                                            msg.type === 'vendor' ? 'hard-hat' : 
                                            'robot'
                                        }`
                                    })
                                ),
                                React.createElement('div', { key: 'content' }, [
                                    React.createElement('div', { key: 'text', className: 'msg-text' }, 
                                        msg.message
                                    ),
                                    React.createElement('div', { key: 'time', className: 'msg-time' }, 
                                        new Date(msg.timestamp).toLocaleString()
                                    )
                                ])
                            ])
                        )
                    ) :
                React.createElement('div', { className: 'empty-state' }, 'No data available')
            )
        ])
    ]);
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.MaintenanceCommand = MaintenanceCommand;