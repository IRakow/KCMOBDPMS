// VendorPortal.jsx - Vendor Dashboard for Service Providers
const VendorPortal = (() => {
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
                    formatTime: (date) => {
                        return new Date(date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('VendorPortal')((props, helpers) => {
        const { useLocalState, formatCurrency, formatDate, formatTime } = helpers;
        const { vendorId, vendorData } = props;

        const [state, updateState] = useLocalState({
            activeView: 'dashboard',
            jobs: [],
            schedule: [],
            earnings: {},
            notifications: [],
            selectedJob: null,
            showChat: false,
            chatJob: null,
            availability: {},
            performance: {},
            loading: true
        });

        // Load vendor data
        React.useEffect(() => {
            loadVendorData();
        }, [vendorId]);

        const loadVendorData = async () => {
            // Simulate API calls
            const mockJobs = [
                {
                    id: 'WO001',
                    status: 'pending',
                    priority: 'high',
                    property: 'Sunset Apartments',
                    unit: '3B',
                    issue: 'Leaking faucet in kitchen',
                    tenant: {
                        name: 'Sarah Johnson',
                        phone: '(555) 123-4567',
                        availability: 'Weekdays after 3PM'
                    },
                    suggestedTime: new Date('2025-01-15T15:00:00'),
                    estimatedDuration: 1,
                    estimatedCost: 150,
                    category: 'plumbing',
                    aiNotes: 'Tenant reports slow leak, likely worn washer. Standard repair kit should suffice.',
                    chatEnabled: true
                },
                {
                    id: 'WO002',
                    status: 'in_progress',
                    priority: 'medium',
                    property: 'Downtown Plaza',
                    unit: '5A',
                    issue: 'AC not cooling properly',
                    tenant: {
                        name: 'Mike Chen',
                        phone: '(555) 234-5678',
                        availability: 'Flexible, works from home'
                    },
                    scheduledTime: new Date('2025-01-14T10:00:00'),
                    estimatedDuration: 2,
                    estimatedCost: 250,
                    category: 'hvac',
                    startTime: new Date('2025-01-14T10:15:00'),
                    chatEnabled: true
                },
                {
                    id: 'WO003',
                    status: 'completed',
                    priority: 'low',
                    property: 'Garden Complex',
                    unit: '2C',
                    issue: 'Replace light fixtures',
                    completedDate: new Date('2025-01-12T14:30:00'),
                    totalCost: 175,
                    category: 'electrical',
                    rating: 5,
                    feedback: 'Great work, very professional!'
                }
            ];

            const mockEarnings = {
                today: 425,
                thisWeek: 1850,
                thisMonth: 7250,
                pending: 400,
                averageJobValue: 185
            };

            const mockPerformance = {
                rating: 4.8,
                totalJobs: 147,
                onTimeRate: 96,
                responseTime: 15, // minutes
                specialties: ['Plumbing', 'HVAC', 'Electrical'],
                certifications: ['Licensed Plumber', 'EPA Certified']
            };

            updateState({
                jobs: mockJobs,
                earnings: mockEarnings,
                performance: mockPerformance,
                loading: false
            });
        };

        return React.createElement('div', { className: 'vendor-portal' }, [
            // Header
            React.createElement(VendorHeader, {
                key: 'header',
                vendorData: vendorData,
                activeView: state.activeView,
                onViewChange: (view) => updateState({ activeView: view }),
                notifications: state.notifications
            }),

            // Main Content
            React.createElement('div', { key: 'content', className: 'vendor-content' }, [
                state.activeView === 'dashboard' && renderDashboard(),
                state.activeView === 'jobs' && renderJobsView(),
                state.activeView === 'schedule' && renderScheduleView(),
                state.activeView === 'earnings' && renderEarningsView(),
                state.activeView === 'profile' && renderProfileView()
            ]),

            // Job Detail Modal
            state.selectedJob && React.createElement(JobDetailModal, {
                key: 'job-detail',
                job: state.selectedJob,
                onClose: () => updateState({ selectedJob: null }),
                onAccept: (jobId) => acceptJob(jobId),
                onComplete: (jobId, data) => completeJob(jobId, data),
                onOpenChat: (job) => updateState({ showChat: true, chatJob: job })
            }),

            // 3-Way Chat System
            state.showChat && React.createElement(ThreeWayChat, {
                key: 'chat',
                job: state.chatJob,
                vendorId: vendorId,
                onClose: () => updateState({ showChat: false, chatJob: null })
            })
        ]);

        // Dashboard View
        function renderDashboard() {
            const pendingJobs = state.jobs.filter(j => j.status === 'pending');
            const activeJobs = state.jobs.filter(j => j.status === 'in_progress');
            const todayJobs = state.jobs.filter(j => {
                const jobDate = j.scheduledTime || j.suggestedTime;
                return jobDate && new Date(jobDate).toDateString() === new Date().toDateString();
            });

            return React.createElement('div', { className: 'vendor-dashboard' }, [
                // Quick Stats
                React.createElement('div', { key: 'stats', className: 'dashboard-stats' }, [
                    {
                        label: 'Today\'s Earnings',
                        value: formatCurrency(state.earnings.today),
                        icon: 'fa-dollar-sign',
                        color: 'success'
                    },
                    {
                        label: 'Active Jobs',
                        value: activeJobs.length,
                        icon: 'fa-wrench',
                        color: 'primary'
                    },
                    {
                        label: 'Pending Jobs',
                        value: pendingJobs.length,
                        icon: 'fa-clock',
                        color: 'warning'
                    },
                    {
                        label: 'Rating',
                        value: `${state.performance.rating} ★`,
                        icon: 'fa-star',
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

                // Today's Schedule
                React.createElement('div', { key: 'today', className: 'today-schedule' }, [
                    React.createElement('h2', { key: 'title' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-calendar-day' }),
                        'Today\'s Schedule'
                    ]),
                    React.createElement('div', { key: 'jobs', className: 'schedule-list' },
                        todayJobs.length > 0 ? todayJobs.map(job =>
                            React.createElement(JobCard, {
                                key: job.id,
                                job: job,
                                onSelect: () => updateState({ selectedJob: job }),
                                compact: true
                            })
                        ) : React.createElement('p', { key: 'empty', className: 'empty-state' }, 
                            'No jobs scheduled for today'
                        )
                    )
                ]),

                // Pending Job Requests
                React.createElement('div', { key: 'pending', className: 'pending-requests' }, [
                    React.createElement('h2', { key: 'title' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-exclamation-circle' }),
                        'New Job Requests'
                    ]),
                    React.createElement('div', { key: 'jobs', className: 'job-requests' },
                        pendingJobs.map(job =>
                            React.createElement(JobRequestCard, {
                                key: job.id,
                                job: job,
                                onAccept: () => acceptJob(job.id),
                                onDecline: () => declineJob(job.id),
                                onViewDetails: () => updateState({ selectedJob: job })
                            })
                        )
                    )
                ])
            ]);
        }

        // Jobs List View
        function renderJobsView() {
            const [filterStatus, setFilterStatus] = React.useState('all');
            const filteredJobs = state.jobs.filter(job =>
                filterStatus === 'all' || job.status === filterStatus
            );

            return React.createElement('div', { className: 'jobs-view' }, [
                React.createElement('div', { key: 'header', className: 'view-header' }, [
                    React.createElement('h2', { key: 'title' }, 'All Jobs'),
                    React.createElement('div', { key: 'filters', className: 'job-filters' }, [
                        React.createElement('select', {
                            key: 'status',
                            value: filterStatus,
                            onChange: (e) => setFilterStatus(e.target.value)
                        }, [
                            React.createElement('option', { key: 'all', value: 'all' }, 'All Jobs'),
                            React.createElement('option', { key: 'pending', value: 'pending' }, 'Pending'),
                            React.createElement('option', { key: 'in_progress', value: 'in_progress' }, 'In Progress'),
                            React.createElement('option', { key: 'completed', value: 'completed' }, 'Completed')
                        ])
                    ])
                ]),

                React.createElement('div', { key: 'list', className: 'jobs-list' },
                    filteredJobs.map(job =>
                        React.createElement(JobCard, {
                            key: job.id,
                            job: job,
                            onSelect: () => updateState({ selectedJob: job })
                        })
                    )
                )
            ]);
        }

        // Schedule View
        function renderScheduleView() {
            const [selectedDate, setSelectedDate] = React.useState(new Date());
            
            return React.createElement('div', { className: 'schedule-view' }, [
                React.createElement('h2', { key: 'title' }, 'My Schedule'),
                React.createElement(VendorCalendar, {
                    key: 'calendar',
                    jobs: state.jobs,
                    selectedDate: selectedDate,
                    onDateSelect: setSelectedDate,
                    onJobSelect: (job) => updateState({ selectedJob: job })
                }),
                React.createElement(AvailabilityManager, {
                    key: 'availability',
                    availability: state.availability,
                    onUpdate: (availability) => updateState({ availability })
                })
            ]);
        }

        // Earnings View
        function renderEarningsView() {
            return React.createElement('div', { className: 'earnings-view' }, [
                React.createElement('h2', { key: 'title' }, 'Earnings & Payments'),
                React.createElement(EarningsOverview, {
                    key: 'overview',
                    earnings: state.earnings,
                    jobs: state.jobs
                }),
                React.createElement(PaymentHistory, {
                    key: 'history',
                    jobs: state.jobs.filter(j => j.status === 'completed')
                })
            ]);
        }

        // Profile View
        function renderProfileView() {
            return React.createElement('div', { className: 'profile-view' }, [
                React.createElement('h2', { key: 'title' }, 'My Profile'),
                React.createElement(VendorProfile, {
                    key: 'profile',
                    vendorData: vendorData,
                    performance: state.performance,
                    onUpdate: (data) => updateVendorProfile(data)
                })
            ]);
        }

        // Job Management Functions
        async function acceptJob(jobId) {
            const job = state.jobs.find(j => j.id === jobId);
            if (!job) return;

            // Update job status
            const updatedJobs = state.jobs.map(j =>
                j.id === jobId ? { ...j, status: 'scheduled', acceptedAt: new Date() } : j
            );
            updateState({ jobs: updatedJobs });

            // Open 3-way chat
            updateState({ showChat: true, chatJob: job });

            window.Toast?.success('Job accepted! Chat opened with tenant and property manager.');
        }

        async function declineJob(jobId) {
            const updatedJobs = state.jobs.filter(j => j.id !== jobId);
            updateState({ jobs: updatedJobs });
            window.Toast?.info('Job declined');
        }

        async function completeJob(jobId, completionData) {
            const updatedJobs = state.jobs.map(j =>
                j.id === jobId ? {
                    ...j,
                    status: 'completed',
                    completedDate: new Date(),
                    ...completionData
                } : j
            );
            updateState({ jobs: updatedJobs });
            window.Toast?.success('Job marked as complete!');
        }

        async function updateVendorProfile(profileData) {
            // Update vendor profile via API
            console.log('Updating profile:', profileData);
            window.Toast?.success('Profile updated successfully!');
        }
    });
})();

// Vendor Header Component
const VendorHeader = ComponentFactory.createComponent('VendorHeader')((props, helpers) => {
    const { vendorData, activeView, onViewChange, notifications } = props;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
        { id: 'jobs', label: 'Jobs', icon: 'fa-wrench' },
        { id: 'schedule', label: 'Schedule', icon: 'fa-calendar' },
        { id: 'earnings', label: 'Earnings', icon: 'fa-dollar-sign' },
        { id: 'profile', label: 'Profile', icon: 'fa-user' }
    ];

    return React.createElement('header', { className: 'vendor-header' }, [
        React.createElement('div', { key: 'brand', className: 'header-brand' }, [
            React.createElement('h1', { key: 'title' }, 'Vendor Portal'),
            React.createElement('span', { key: 'name' }, vendorData?.companyName || 'Service Provider')
        ]),

        React.createElement('nav', { key: 'nav', className: 'header-nav' },
            navItems.map(item =>
                React.createElement('button', {
                    key: item.id,
                    className: `nav-item ${activeView === item.id ? 'active' : ''}`,
                    onClick: () => onViewChange(item.id)
                }, [
                    React.createElement('i', { key: 'icon', className: `fas ${item.icon}` }),
                    React.createElement('span', { key: 'label' }, item.label)
                ])
            )
        ),

        React.createElement('div', { key: 'actions', className: 'header-actions' }, [
            React.createElement('button', {
                key: 'notifications',
                className: 'notification-btn',
                title: 'Notifications'
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-bell' }),
                notifications?.length > 0 && React.createElement('span', {
                    key: 'badge',
                    className: 'notification-badge'
                }, notifications.length)
            ]),
            React.createElement('button', {
                key: 'logout',
                className: 'logout-btn',
                title: 'Logout'
            }, React.createElement('i', { className: 'fas fa-sign-out-alt' }))
        ])
    ]);
});

// Job Card Component
const JobCard = ComponentFactory.createComponent('JobCard')((props, helpers) => {
    const { job, onSelect, compact = false } = props;
    const { formatDate, formatTime, formatCurrency } = helpers;

    const statusColors = {
        pending: 'warning',
        scheduled: 'info',
        in_progress: 'primary',
        completed: 'success'
    };

    const priorityColors = {
        low: 'secondary',
        medium: 'warning',
        high: 'danger'
    };

    return React.createElement('div', {
        className: `job-card ${job.status} ${compact ? 'compact' : ''}`,
        onClick: onSelect
    }, [
        React.createElement('div', { key: 'header', className: 'job-header' }, [
            React.createElement('div', { key: 'info' }, [
                React.createElement('h4', { key: 'id' }, `#${job.id}`),
                React.createElement('p', { key: 'property' }, `${job.property} - Unit ${job.unit}`)
            ]),
            React.createElement('div', { key: 'badges' }, [
                React.createElement('span', {
                    key: 'status',
                    className: `badge badge-${statusColors[job.status]}`
                }, job.status.replace('_', ' ')),
                React.createElement('span', {
                    key: 'priority',
                    className: `badge badge-${priorityColors[job.priority]}`
                }, job.priority)
            ])
        ]),

        React.createElement('div', { key: 'issue', className: 'job-issue' }, [
            React.createElement('i', { key: 'icon', className: `fas fa-${getCategoryIcon(job.category)}` }),
            React.createElement('p', { key: 'desc' }, job.issue)
        ]),

        !compact && job.aiNotes && React.createElement('div', {
            key: 'ai-notes',
            className: 'ai-notes'
        }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
            React.createElement('p', { key: 'notes' }, job.aiNotes)
        ]),

        React.createElement('div', { key: 'details', className: 'job-details' }, [
            (job.scheduledTime || job.suggestedTime) && React.createElement('div', {
                key: 'time',
                className: 'detail-item'
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-clock' }),
                React.createElement('span', {}, 
                    `${formatDate(job.scheduledTime || job.suggestedTime)} at ${formatTime(job.scheduledTime || job.suggestedTime)}`
                )
            ]),
            job.estimatedCost && React.createElement('div', {
                key: 'cost',
                className: 'detail-item'
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-dollar-sign' }),
                React.createElement('span', {}, `Est. ${formatCurrency(job.estimatedCost)}`)
            ]),
            job.estimatedDuration && React.createElement('div', {
                key: 'duration',
                className: 'detail-item'
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-hourglass-half' }),
                React.createElement('span', {}, `${job.estimatedDuration} hour${job.estimatedDuration > 1 ? 's' : ''}`)
            ])
        ]),

        job.status === 'completed' && job.rating && React.createElement('div', {
            key: 'rating',
            className: 'job-rating'
        }, [
            React.createElement('div', { key: 'stars' },
                [...Array(5)].map((_, i) =>
                    React.createElement('i', {
                        key: i,
                        className: `fas fa-star ${i < job.rating ? 'filled' : ''}`
                    })
                )
            ),
            job.feedback && React.createElement('p', { key: 'feedback' }, `"${job.feedback}"`)
        ])
    ]);

    function getCategoryIcon(category) {
        const icons = {
            plumbing: 'faucet',
            electrical: 'bolt',
            hvac: 'snowflake',
            appliance: 'blender',
            general: 'tools'
        };
        return icons[category] || 'wrench';
    }
});

// Job Request Card Component
const JobRequestCard = ComponentFactory.createComponent('JobRequestCard')((props, helpers) => {
    const { job, onAccept, onDecline, onViewDetails } = props;
    const { formatCurrency, formatTime } = helpers;

    return React.createElement('div', { className: 'job-request-card' }, [
        React.createElement('div', { key: 'header', className: 'request-header' }, [
            React.createElement('h4', { key: 'property' }, `${job.property} - Unit ${job.unit}`),
            React.createElement('span', {
                key: 'priority',
                className: `priority-badge ${job.priority}`
            }, job.priority.toUpperCase())
        ]),

        React.createElement('p', { key: 'issue', className: 'request-issue' }, job.issue),

        React.createElement('div', { key: 'ai-match', className: 'ai-match-info' }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
            React.createElement('span', {}, 'AI Match: '),
            React.createElement('strong', {}, '95% compatibility'),
            React.createElement('span', { className: 'match-reason' }, 
                ' - Expertise match, available at suggested time'
            )
        ]),

        React.createElement('div', { key: 'details', className: 'request-details' }, [
            React.createElement('div', { key: 'time' }, [
                React.createElement('i', { className: 'fas fa-calendar' }),
                React.createElement('span', {}, `Suggested: ${formatTime(job.suggestedTime)}`)
            ]),
            React.createElement('div', { key: 'tenant' }, [
                React.createElement('i', { className: 'fas fa-user' }),
                React.createElement('span', {}, `Tenant: ${job.tenant.name}`)
            ]),
            React.createElement('div', { key: 'est' }, [
                React.createElement('i', { className: 'fas fa-dollar-sign' }),
                React.createElement('span', {}, `Est: ${formatCurrency(job.estimatedCost)}`)
            ])
        ]),

        React.createElement('div', { key: 'actions', className: 'request-actions' }, [
            React.createElement('button', {
                key: 'decline',
                className: 'btn btn-secondary',
                onClick: onDecline
            }, 'Decline'),
            React.createElement('button', {
                key: 'details',
                className: 'btn btn-info',
                onClick: onViewDetails
            }, 'View Details'),
            React.createElement('button', {
                key: 'accept',
                className: 'btn btn-success',
                onClick: onAccept
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-check' }),
                'Accept Job'
            ])
        ])
    ]);
});

// Three-Way Chat Component
const ThreeWayChat = ComponentFactory.createComponent('ThreeWayChat')((props, helpers) => {
    const { job, vendorId, onClose } = props;
    const [messages, setMessages] = React.useState([]);
    const [inputMessage, setInputMessage] = React.useState('');
    const [typing, setTyping] = React.useState(null);

    React.useEffect(() => {
        // Initialize chat with AI coordination message
        setMessages([
            {
                id: 1,
                sender: 'ai',
                senderName: 'AI Coordinator',
                message: `I've created this chat to coordinate the ${job.issue} repair at ${job.property} Unit ${job.unit}. Let's confirm the scheduled time works for everyone.`,
                timestamp: new Date(),
                type: 'system'
            },
            {
                id: 2,
                sender: 'ai',
                senderName: 'AI Coordinator',
                message: `Suggested appointment: ${helpers.formatDate(job.suggestedTime)} at ${helpers.formatTime(job.suggestedTime)}. Tenant ${job.tenant.name} is usually available at this time.`,
                timestamp: new Date(),
                type: 'suggestion'
            }
        ]);

        // Simulate tenant response
        setTimeout(() => {
            addMessage({
                sender: 'tenant',
                senderName: job.tenant.name,
                message: 'Yes, that time works perfectly for me!',
                timestamp: new Date()
            });
        }, 3000);
    }, [job]);

    const addMessage = (messageData) => {
        setMessages(prev => [...prev, {
            id: prev.length + 1,
            ...messageData
        }]);
    };

    const sendMessage = () => {
        if (!inputMessage.trim()) return;

        addMessage({
            sender: 'vendor',
            senderName: 'You',
            message: inputMessage,
            timestamp: new Date()
        });

        setInputMessage('');

        // AI might respond with coordination help
        if (inputMessage.toLowerCase().includes('reschedule')) {
            setTimeout(() => {
                addMessage({
                    sender: 'ai',
                    senderName: 'AI Coordinator',
                    message: 'I can help reschedule. What times work better for you?',
                    timestamp: new Date(),
                    type: 'system'
                });
            }, 1000);
        }
    };

    return React.createElement('div', { className: 'three-way-chat' }, [
        React.createElement('div', { key: 'header', className: 'chat-header' }, [
            React.createElement('div', { key: 'info' }, [
                React.createElement('h3', { key: 'title' }, `Work Order #${job.id}`),
                React.createElement('p', { key: 'participants' }, 
                    `You, ${job.tenant.name}, Property Manager`
                )
            ]),
            React.createElement('button', {
                key: 'close',
                className: 'close-chat',
                onClick: onClose
            }, '×')
        ]),

        React.createElement('div', { key: 'messages', className: 'chat-messages' },
            messages.map(msg =>
                React.createElement('div', {
                    key: msg.id,
                    className: `message ${msg.sender} ${msg.type || ''}`
                }, [
                    React.createElement('div', { key: 'sender', className: 'message-sender' }, 
                        msg.senderName
                    ),
                    React.createElement('div', { key: 'content', className: 'message-content' }, 
                        msg.message
                    ),
                    React.createElement('div', { key: 'time', className: 'message-time' }, 
                        helpers.formatTime(msg.timestamp)
                    )
                ])
            ),
            typing && React.createElement('div', { key: 'typing', className: 'typing-indicator' },
                `${typing} is typing...`
            )
        ),

        React.createElement('div', { key: 'input', className: 'chat-input' }, [
            React.createElement('input', {
                key: 'field',
                type: 'text',
                placeholder: 'Type a message...',
                value: inputMessage,
                onChange: (e) => setInputMessage(e.target.value),
                onKeyPress: (e) => e.key === 'Enter' && sendMessage()
            }),
            React.createElement('button', {
                key: 'send',
                onClick: sendMessage,
                disabled: !inputMessage.trim()
            }, React.createElement('i', { className: 'fas fa-paper-plane' }))
        ])
    ]);
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.VendorPortal = VendorPortal;
window.AppModules.VendorHeader = VendorHeader;
window.AppModules.JobCard = JobCard;
window.AppModules.ThreeWayChat = ThreeWayChat;