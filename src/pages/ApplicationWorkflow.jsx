// ApplicationWorkflow.jsx - Complete Application & Leasing Workflow Management
const ApplicationWorkflow = (() => {
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

    return ComponentFactory.createComponent('ApplicationWorkflow')((props, helpers) => {
        const { useLocalState, formatDate } = helpers;
        
        const [state, updateState] = useLocalState({
            applications: [],
            filterStatus: 'all',
            sortBy: 'dateReceived',
            selectedApplication: null,
            showAIAnalysis: false,
            bulkAction: null,
            searchQuery: ''
        });

        // Load applications
        React.useEffect(() => {
            loadApplications();
        }, [state.filterStatus, state.sortBy]);

        const loadApplications = async () => {
            // Simulate API call
            const mockApplications = [
                {
                    id: 'APP001',
                    applicant: {
                        name: 'Sarah Johnson',
                        email: 'sarah.j@email.com',
                        phone: '(555) 123-4567'
                    },
                    property: 'Sunset Apartments',
                    unit: '3B',
                    dateReceived: '2025-01-10T10:30:00',
                    status: 'pending_review',
                    aiScore: 92,
                    creditScore: 750,
                    incomeVerified: true,
                    documentsComplete: true,
                    flags: [],
                    stage: 'screening'
                },
                {
                    id: 'APP002',
                    applicant: {
                        name: 'Mike Chen',
                        email: 'mchen@email.com',
                        phone: '(555) 234-5678'
                    },
                    property: 'Downtown Plaza',
                    unit: '5A',
                    dateReceived: '2025-01-09T14:20:00',
                    status: 'approved',
                    aiScore: 88,
                    creditScore: 720,
                    incomeVerified: true,
                    documentsComplete: true,
                    flags: [],
                    stage: 'lease_pending'
                },
                {
                    id: 'APP003',
                    applicant: {
                        name: 'Emma Davis',
                        email: 'emma.d@email.com',
                        phone: '(555) 345-6789'
                    },
                    property: 'Garden Complex',
                    unit: '2C',
                    dateReceived: '2025-01-11T09:15:00',
                    status: 'pending_documents',
                    aiScore: 78,
                    creditScore: 680,
                    incomeVerified: false,
                    documentsComplete: false,
                    flags: ['missing_income_proof'],
                    stage: 'documentation'
                }
            ];

            const filtered = mockApplications.filter(app => 
                state.filterStatus === 'all' || app.status === state.filterStatus
            );

            const sorted = filtered.sort((a, b) => {
                switch (state.sortBy) {
                    case 'dateReceived':
                        return new Date(b.dateReceived) - new Date(a.dateReceived);
                    case 'aiScore':
                        return b.aiScore - a.aiScore;
                    case 'applicantName':
                        return a.applicant.name.localeCompare(b.applicant.name);
                    default:
                        return 0;
                }
            });

            updateState({ applications: sorted });
        };

        const workflowStages = [
            { id: 'received', label: 'Received', icon: 'fa-inbox' },
            { id: 'screening', label: 'Screening', icon: 'fa-search' },
            { id: 'documentation', label: 'Documents', icon: 'fa-file-alt' },
            { id: 'approval', label: 'Approval', icon: 'fa-check' },
            { id: 'lease_pending', label: 'Lease Pending', icon: 'fa-file-contract' },
            { id: 'completed', label: 'Completed', icon: 'fa-check-circle' }
        ];

        const statusColors = {
            pending_review: 'warning',
            pending_documents: 'info',
            approved: 'success',
            rejected: 'danger',
            lease_pending: 'primary',
            completed: 'success'
        };

        return React.createElement('div', { className: 'application-workflow' }, [
            // Header
            React.createElement('div', { key: 'header', className: 'workflow-header' }, [
                React.createElement('h1', { key: 'title' }, 'Application Management'),
                React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                    React.createElement('div', { key: 'search', className: 'search-box' }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-search' }),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            placeholder: 'Search applications...',
                            value: state.searchQuery,
                            onChange: (e) => updateState({ searchQuery: e.target.value })
                        })
                    ]),
                    React.createElement('button', {
                        key: 'ai-analysis',
                        className: `btn btn-ai ${state.showAIAnalysis ? 'active' : ''}`,
                        onClick: () => updateState({ showAIAnalysis: !state.showAIAnalysis })
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                        'AI Analysis'
                    ])
                ])
            ]),

            // Workflow Pipeline View
            React.createElement('div', { key: 'pipeline', className: 'workflow-pipeline' },
                workflowStages.map(stage =>
                    React.createElement('div', { key: stage.id, className: 'pipeline-stage' }, [
                        React.createElement('div', { key: 'header', className: 'stage-header' }, [
                            React.createElement('i', { key: 'icon', className: `fas ${stage.icon}` }),
                            React.createElement('h3', { key: 'label' }, stage.label),
                            React.createElement('span', { key: 'count', className: 'stage-count' },
                                state.applications.filter(app => app.stage === stage.id).length
                            )
                        ]),
                        React.createElement('div', { key: 'cards', className: 'stage-cards' },
                            state.applications
                                .filter(app => app.stage === stage.id)
                                .map(app =>
                                    React.createElement(ApplicationCard, {
                                        key: app.id,
                                        application: app,
                                        onSelect: () => updateState({ selectedApplication: app }),
                                        onAction: (action) => handleApplicationAction(app.id, action)
                                    })
                                )
                        )
                    ])
                )
            ),

            // Filters and Controls
            React.createElement('div', { key: 'controls', className: 'workflow-controls' }, [
                React.createElement('div', { key: 'filters', className: 'filter-section' }, [
                    React.createElement('select', {
                        key: 'status',
                        value: state.filterStatus,
                        onChange: (e) => updateState({ filterStatus: e.target.value })
                    }, [
                        React.createElement('option', { key: 'all', value: 'all' }, 'All Applications'),
                        React.createElement('option', { key: 'pending_review', value: 'pending_review' }, 'Pending Review'),
                        React.createElement('option', { key: 'pending_documents', value: 'pending_documents' }, 'Missing Documents'),
                        React.createElement('option', { key: 'approved', value: 'approved' }, 'Approved'),
                        React.createElement('option', { key: 'rejected', value: 'rejected' }, 'Rejected')
                    ]),
                    React.createElement('select', {
                        key: 'sort',
                        value: state.sortBy,
                        onChange: (e) => updateState({ sortBy: e.target.value })
                    }, [
                        React.createElement('option', { key: 'date', value: 'dateReceived' }, 'Date Received'),
                        React.createElement('option', { key: 'score', value: 'aiScore' }, 'AI Score'),
                        React.createElement('option', { key: 'name', value: 'applicantName' }, 'Applicant Name')
                    ])
                ]),
                React.createElement('div', { key: 'bulk', className: 'bulk-actions' }, [
                    React.createElement('button', {
                        key: 'approve',
                        className: 'btn btn-success',
                        onClick: () => handleBulkAction('approve')
                    }, 'Bulk Approve'),
                    React.createElement('button', {
                        key: 'request-docs',
                        className: 'btn btn-info',
                        onClick: () => handleBulkAction('request_documents')
                    }, 'Request Documents')
                ])
            ]),

            // AI Analysis Panel
            state.showAIAnalysis && React.createElement(AIAnalysisPanel, {
                key: 'ai-panel',
                applications: state.applications,
                onClose: () => updateState({ showAIAnalysis: false })
            }),

            // Application Detail Modal
            state.selectedApplication && React.createElement(ApplicationDetailModal, {
                key: 'detail',
                application: state.selectedApplication,
                onClose: () => updateState({ selectedApplication: null }),
                onAction: (action) => handleApplicationAction(state.selectedApplication.id, action)
            })
        ]);

        function handleApplicationAction(appId, action) {
            console.log(`Action ${action} for application ${appId}`);
            // Handle various actions: approve, reject, request docs, etc.
            
            if (action === 'approve') {
                // Move to lease generation
                window.location.hash = `#/lease/create?application=${appId}`;
            }
        }

        function handleBulkAction(action) {
            const selectedApps = state.applications.filter(app => app.selected);
            console.log(`Bulk action ${action} for ${selectedApps.length} applications`);
        }
    });
})();

// Application Card Component
const ApplicationCard = ComponentFactory.createComponent('ApplicationCard')((props, helpers) => {
    const { application, onSelect, onAction } = props;
    const { formatDate } = helpers;
    
    const getScoreColor = (score) => {
        if (score >= 90) return 'excellent';
        if (score >= 80) return 'good';
        if (score >= 70) return 'fair';
        return 'poor';
    };
    
    return React.createElement('div', { 
        className: 'application-card',
        onClick: onSelect
    }, [
        React.createElement('div', { key: 'header', className: 'card-header' }, [
            React.createElement('div', { key: 'applicant', className: 'applicant-info' }, [
                React.createElement('h4', { key: 'name' }, application.applicant.name),
                React.createElement('p', { key: 'unit' }, `${application.property} - Unit ${application.unit}`)
            ]),
            React.createElement('div', { 
                key: 'score', 
                className: `ai-score ${getScoreColor(application.aiScore)}` 
            }, [
                React.createElement('span', { key: 'label' }, 'AI Score'),
                React.createElement('span', { key: 'value' }, application.aiScore)
            ])
        ]),
        
        React.createElement('div', { key: 'details', className: 'card-details' }, [
            React.createElement('div', { key: 'credit', className: 'detail-item' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-credit-card' }),
                React.createElement('span', {}, `Credit: ${application.creditScore}`)
            ]),
            React.createElement('div', { key: 'income', className: 'detail-item' }, [
                React.createElement('i', { 
                    key: 'icon', 
                    className: `fas fa-${application.incomeVerified ? 'check-circle' : 'times-circle'}` 
                }),
                React.createElement('span', {}, 'Income Verified')
            ]),
            React.createElement('div', { key: 'docs', className: 'detail-item' }, [
                React.createElement('i', { 
                    key: 'icon', 
                    className: `fas fa-${application.documentsComplete ? 'check-circle' : 'exclamation-circle'}` 
                }),
                React.createElement('span', {}, 'Documents')
            ])
        ]),
        
        application.flags.length > 0 && React.createElement('div', { 
            key: 'flags', 
            className: 'card-flags' 
        },
            application.flags.map(flag =>
                React.createElement('span', { key: flag, className: 'flag-badge' }, 
                    flag.replace(/_/g, ' ')
                )
            )
        ),
        
        React.createElement('div', { key: 'footer', className: 'card-footer' }, [
            React.createElement('span', { key: 'date', className: 'received-date' }, 
                formatDate(application.dateReceived)
            ),
            React.createElement('div', { key: 'actions', className: 'quick-actions' }, [
                React.createElement('button', {
                    key: 'approve',
                    className: 'action-btn approve',
                    onClick: (e) => {
                        e.stopPropagation();
                        onAction('approve');
                    },
                    title: 'Approve'
                }, React.createElement('i', { className: 'fas fa-check' })),
                React.createElement('button', {
                    key: 'message',
                    className: 'action-btn message',
                    onClick: (e) => {
                        e.stopPropagation();
                        onAction('message');
                    },
                    title: 'Message'
                }, React.createElement('i', { className: 'fas fa-comment' }))
            ])
        ])
    ]);
});

// AI Analysis Panel
const AIAnalysisPanel = ComponentFactory.createComponent('AIAnalysisPanel')((props, helpers) => {
    const { applications, onClose } = props;
    
    // Calculate AI insights
    const insights = {
        averageScore: Math.round(applications.reduce((sum, app) => sum + app.aiScore, 0) / applications.length),
        highQuality: applications.filter(app => app.aiScore >= 85).length,
        needsAttention: applications.filter(app => app.flags.length > 0).length,
        approvalRate: Math.round((applications.filter(app => app.status === 'approved').length / applications.length) * 100),
        averageProcessingTime: '2.3 days',
        recommendations: [
            {
                type: 'opportunity',
                message: '3 high-scoring applicants waiting for review',
                action: 'Review Now'
            },
            {
                type: 'warning',
                message: '2 applications missing income verification',
                action: 'Request Documents'
            },
            {
                type: 'insight',
                message: 'Applications from referrals have 15% higher approval rate',
                action: 'View Report'
            }
        ]
    };
    
    return React.createElement('div', { className: 'ai-analysis-panel' }, [
        React.createElement('div', { key: 'header', className: 'panel-header' }, [
            React.createElement('h3', { key: 'title' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                'AI Application Insights'
            ]),
            React.createElement('button', {
                key: 'close',
                className: 'close-btn',
                onClick: onClose
            }, '×')
        ]),
        
        React.createElement('div', { key: 'metrics', className: 'ai-metrics' }, [
            React.createElement('div', { key: 'avg-score', className: 'metric' }, [
                React.createElement('span', { key: 'value' }, insights.averageScore),
                React.createElement('span', { key: 'label' }, 'Avg AI Score')
            ]),
            React.createElement('div', { key: 'high-quality', className: 'metric' }, [
                React.createElement('span', { key: 'value' }, insights.highQuality),
                React.createElement('span', { key: 'label' }, 'High Quality')
            ]),
            React.createElement('div', { key: 'attention', className: 'metric' }, [
                React.createElement('span', { key: 'value' }, insights.needsAttention),
                React.createElement('span', { key: 'label' }, 'Need Attention')
            ]),
            React.createElement('div', { key: 'approval', className: 'metric' }, [
                React.createElement('span', { key: 'value' }, `${insights.approvalRate}%`),
                React.createElement('span', { key: 'label' }, 'Approval Rate')
            ])
        ]),
        
        React.createElement('div', { key: 'recommendations', className: 'ai-recommendations' }, [
            React.createElement('h4', { key: 'title' }, 'AI Recommendations'),
            insights.recommendations.map((rec, idx) =>
                React.createElement('div', { 
                    key: idx, 
                    className: `recommendation ${rec.type}` 
                }, [
                    React.createElement('div', { key: 'content' }, [
                        React.createElement('i', { 
                            key: 'icon', 
                            className: `fas fa-${
                                rec.type === 'opportunity' ? 'lightbulb' :
                                rec.type === 'warning' ? 'exclamation-triangle' : 
                                'chart-line'
                            }` 
                        }),
                        React.createElement('p', { key: 'message' }, rec.message)
                    ]),
                    React.createElement('button', { 
                        key: 'action',
                        className: 'rec-action-btn' 
                    }, rec.action)
                ])
            )
        ]),
        
        React.createElement('div', { key: 'insights', className: 'processing-insights' }, [
            React.createElement('h4', { key: 'title' }, 'Processing Insights'),
            React.createElement('div', { key: 'chart', className: 'insights-chart' },
                React.createElement('p', {}, 'Average processing time: ', 
                    React.createElement('strong', {}, insights.averageProcessingTime)
                )
            )
        ])
    ]);
});

// Application Detail Modal
const ApplicationDetailModal = ComponentFactory.createComponent('ApplicationDetailModal')((props, helpers) => {
    const { application, onClose, onAction } = props;
    const { formatDate } = helpers;
    
    const [activeTab, setActiveTab] = React.useState('overview');
    
    const tabs = [
        { id: 'overview', label: 'Overview', icon: 'fa-info-circle' },
        { id: 'documents', label: 'Documents', icon: 'fa-file-alt' },
        { id: 'screening', label: 'Screening', icon: 'fa-shield-alt' },
        { id: 'communication', label: 'Communication', icon: 'fa-comment' },
        { id: 'timeline', label: 'Timeline', icon: 'fa-clock' }
    ];
    
    return React.createElement('div', { 
        className: 'modal-overlay',
        onClick: onClose
    },
        React.createElement('div', { 
            className: 'modal-content application-detail-modal',
            onClick: (e) => e.stopPropagation()
        }, [
            // Header
            React.createElement('div', { key: 'header', className: 'modal-header' }, [
                React.createElement('div', { key: 'title-section' }, [
                    React.createElement('h2', { key: 'name' }, application.applicant.name),
                    React.createElement('p', { key: 'unit' }, 
                        `${application.property} - Unit ${application.unit}`
                    )
                ]),
                React.createElement('button', {
                    key: 'close',
                    className: 'close-btn',
                    onClick: onClose
                }, '×')
            ]),
            
            // Tabs
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
            
            // Tab Content
            React.createElement('div', { key: 'content', className: 'modal-body' }, [
                activeTab === 'overview' && renderOverviewTab(),
                activeTab === 'documents' && renderDocumentsTab(),
                activeTab === 'screening' && renderScreeningTab(),
                activeTab === 'communication' && renderCommunicationTab(),
                activeTab === 'timeline' && renderTimelineTab()
            ]),
            
            // Actions
            React.createElement('div', { key: 'actions', className: 'modal-footer' }, [
                React.createElement('button', {
                    key: 'reject',
                    className: 'btn btn-danger',
                    onClick: () => onAction('reject')
                }, 'Reject Application'),
                React.createElement('button', {
                    key: 'request-info',
                    className: 'btn btn-secondary',
                    onClick: () => onAction('request_info')
                }, 'Request More Info'),
                React.createElement('button', {
                    key: 'approve',
                    className: 'btn btn-success',
                    onClick: () => onAction('approve')
                }, 'Approve & Generate Lease')
            ])
        ])
    );
    
    function renderOverviewTab() {
        return React.createElement('div', { className: 'tab-content overview-tab' }, [
            React.createElement('div', { key: 'score', className: 'ai-score-section' }, [
                React.createElement('h3', {}, 'AI Screening Score'),
                React.createElement('div', { className: 'score-display' }, [
                    React.createElement('div', { className: 'score-circle' }, application.aiScore),
                    React.createElement('div', { className: 'score-breakdown' }, [
                        React.createElement('div', { className: 'score-item' }, [
                            React.createElement('span', {}, 'Credit Score'),
                            React.createElement('strong', {}, application.creditScore)
                        ]),
                        React.createElement('div', { className: 'score-item' }, [
                            React.createElement('span', {}, 'Income Verification'),
                            React.createElement('strong', {}, application.incomeVerified ? 'Verified' : 'Pending')
                        ]),
                        React.createElement('div', { className: 'score-item' }, [
                            React.createElement('span', {}, 'Rental History'),
                            React.createElement('strong', {}, 'Positive')
                        ])
                    ])
                ])
            ]),
            
            React.createElement('div', { key: 'details', className: 'applicant-details' }, [
                React.createElement('h3', {}, 'Applicant Information'),
                React.createElement('div', { className: 'detail-grid' }, [
                    React.createElement('div', { className: 'detail-item' }, [
                        React.createElement('label', {}, 'Email'),
                        React.createElement('span', {}, application.applicant.email)
                    ]),
                    React.createElement('div', { className: 'detail-item' }, [
                        React.createElement('label', {}, 'Phone'),
                        React.createElement('span', {}, application.applicant.phone)
                    ]),
                    React.createElement('div', { className: 'detail-item' }, [
                        React.createElement('label', {}, 'Current Address'),
                        React.createElement('span', {}, '456 Oak Street, Apt 2B')
                    ]),
                    React.createElement('div', { className: 'detail-item' }, [
                        React.createElement('label', {}, 'Move-in Date'),
                        React.createElement('span', {}, 'March 1, 2025')
                    ])
                ])
            ])
        ]);
    }
    
    function renderDocumentsTab() {
        const documents = [
            { name: 'Government ID', status: 'verified', type: 'id' },
            { name: 'Proof of Income', status: 'verified', type: 'income' },
            { name: 'Bank Statements', status: 'pending', type: 'bank' },
            { name: 'References', status: 'verified', type: 'references' }
        ];
        
        return React.createElement('div', { className: 'tab-content documents-tab' }, [
            React.createElement('h3', {}, 'Submitted Documents'),
            React.createElement('div', { className: 'documents-list' },
                documents.map((doc, idx) =>
                    React.createElement('div', { 
                        key: idx, 
                        className: `document-item ${doc.status}` 
                    }, [
                        React.createElement('i', { 
                            key: 'icon', 
                            className: `fas fa-${doc.status === 'verified' ? 'check-circle' : 'clock'}` 
                        }),
                        React.createElement('span', { key: 'name' }, doc.name),
                        React.createElement('span', { key: 'status', className: 'doc-status' }, doc.status),
                        React.createElement('button', { key: 'view', className: 'view-doc-btn' }, 'View')
                    ])
                )
            )
        ]);
    }
    
    function renderScreeningTab() {
        return React.createElement('div', { className: 'tab-content screening-tab' }, [
            React.createElement('h3', {}, 'Background Screening Results'),
            React.createElement('div', { className: 'screening-results' }, [
                React.createElement('div', { className: 'screening-item pass' }, [
                    React.createElement('i', { className: 'fas fa-check-circle' }),
                    React.createElement('div', {}, [
                        React.createElement('h4', {}, 'Criminal Background Check'),
                        React.createElement('p', {}, 'No records found')
                    ])
                ]),
                React.createElement('div', { className: 'screening-item pass' }, [
                    React.createElement('i', { className: 'fas fa-check-circle' }),
                    React.createElement('div', {}, [
                        React.createElement('h4', {}, 'Eviction History'),
                        React.createElement('p', {}, 'No evictions on record')
                    ])
                ]),
                React.createElement('div', { className: 'screening-item warning' }, [
                    React.createElement('i', { className: 'fas fa-exclamation-triangle' }),
                    React.createElement('div', {}, [
                        React.createElement('h4', {}, 'Credit Report'),
                        React.createElement('p', {}, 'One late payment in last 12 months')
                    ])
                ])
            ])
        ]);
    }
    
    function renderCommunicationTab() {
        return React.createElement('div', { className: 'tab-content communication-tab' }, [
            React.createElement('h3', {}, 'Communication History'),
            React.createElement('div', { className: 'messages-list' }, [
                {
                    type: 'outgoing',
                    message: 'Thank you for your application. We need your bank statements.',
                    date: '2025-01-11 10:30 AM'
                },
                {
                    type: 'incoming',
                    message: 'I'll upload them right away. Thank you!',
                    date: '2025-01-11 11:15 AM'
                }
            ].map((msg, idx) =>
                React.createElement('div', { 
                    key: idx, 
                    className: `message ${msg.type}` 
                }, [
                    React.createElement('p', { key: 'text' }, msg.message),
                    React.createElement('span', { key: 'date' }, msg.date)
                ])
            )),
            React.createElement('div', { className: 'new-message' }, [
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Type a message...'
                }),
                React.createElement('button', {}, 'Send')
            ])
        ]);
    }
    
    function renderTimelineTab() {
        const events = [
            { action: 'Application Submitted', date: '2025-01-10 10:30 AM', status: 'completed' },
            { action: 'AI Screening Completed', date: '2025-01-10 10:35 AM', status: 'completed' },
            { action: 'Documents Requested', date: '2025-01-11 09:00 AM', status: 'completed' },
            { action: 'Awaiting Bank Statements', date: 'Pending', status: 'pending' }
        ];
        
        return React.createElement('div', { className: 'tab-content timeline-tab' }, [
            React.createElement('h3', {}, 'Application Timeline'),
            React.createElement('div', { className: 'timeline' },
                events.map((event, idx) =>
                    React.createElement('div', { 
                        key: idx, 
                        className: `timeline-event ${event.status}` 
                    }, [
                        React.createElement('div', { key: 'marker', className: 'timeline-marker' }),
                        React.createElement('div', { key: 'content', className: 'timeline-content' }, [
                            React.createElement('h4', {}, event.action),
                            React.createElement('span', {}, event.date)
                        ])
                    ])
                )
            )
        ]);
    }
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.ApplicationWorkflow = ApplicationWorkflow;
window.AppModules.ApplicationCard = ApplicationCard;
window.AppModules.AIAnalysisPanel = AIAnalysisPanel;
window.AppModules.ApplicationDetailModal = ApplicationDetailModal;