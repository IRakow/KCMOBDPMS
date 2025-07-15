// LeadManagementSystem.jsx - AI-Powered Lead Management & Scoring
const LeadManagementSystem = () => {
    const [leads, setLeads] = React.useState([]);
    const [selectedLead, setSelectedLead] = React.useState(null);
    const [viewMode, setViewMode] = React.useState('pipeline'); // pipeline, analytics, campaigns
    const [filterStatus, setFilterStatus] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showLeadModal, setShowLeadModal] = React.useState(false);

    React.useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = () => {
        // Mock lead data with AI scoring
        const mockLeads = [
            {
                id: 'lead_001',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                phone: '(555) 123-4567',
                status: 'hot',
                ai_score: 92,
                source: 'Website',
                property_interest: 'Sunset Apartments - Unit 205',
                budget: 2500,
                move_in_date: '2024-08-15',
                created_at: '2024-07-10T10:30:00Z',
                last_contact: '2024-07-13T14:20:00Z',
                interactions: 8,
                engagement_score: 95,
                qualification_status: 'qualified',
                ai_insights: {
                    likelihood_to_lease: 'Very High (92%)',
                    predicted_revenue: 2400,
                    risk_factors: [],
                    next_best_action: 'Schedule showing immediately',
                    timeline_prediction: '3-5 days to lease'
                },
                activities: [
                    { type: 'email_open', timestamp: '2024-07-13T14:20:00Z', description: 'Opened property tour email' },
                    { type: 'website_visit', timestamp: '2024-07-13T12:15:00Z', description: 'Viewed unit photos 3 times' },
                    { type: 'inquiry', timestamp: '2024-07-12T16:30:00Z', description: 'Asked about pet policy' }
                ],
                tags: ['high-priority', 'qualified', 'ready-to-move']
            },
            {
                id: 'lead_002',
                name: 'Michael Chen',
                email: 'mchen@company.com',
                phone: '(555) 234-5678',
                status: 'warm',
                ai_score: 76,
                source: 'Zillow',
                property_interest: 'Downtown Plaza - Unit 312',
                budget: 2800,
                move_in_date: '2024-09-01',
                created_at: '2024-07-08T09:15:00Z',
                last_contact: '2024-07-11T11:45:00Z',
                interactions: 4,
                engagement_score: 72,
                qualification_status: 'in_progress',
                ai_insights: {
                    likelihood_to_lease: 'Moderate (76%)',
                    predicted_revenue: 2800,
                    risk_factors: ['Price sensitivity', 'Comparing multiple options'],
                    next_best_action: 'Send competitive analysis and schedule call',
                    timeline_prediction: '7-10 days to decision'
                },
                activities: [
                    { type: 'form_submit', timestamp: '2024-07-11T11:45:00Z', description: 'Submitted application inquiry' },
                    { type: 'phone_call', timestamp: '2024-07-10T15:20:00Z', description: '15-minute qualification call' }
                ],
                tags: ['zillow-lead', 'price-sensitive', 'comparing-options']
            },
            {
                id: 'lead_003',
                name: 'Emily Rodriguez',
                email: 'emily.r@startup.io',
                phone: '(555) 345-6789',
                status: 'cold',
                ai_score: 45,
                source: 'Referral',
                property_interest: 'Garden Complex - Studio',
                budget: 1800,
                move_in_date: '2024-10-01',
                created_at: '2024-07-05T14:22:00Z',
                last_contact: '2024-07-07T10:30:00Z',
                interactions: 2,
                engagement_score: 38,
                qualification_status: 'unqualified',
                ai_insights: {
                    likelihood_to_lease: 'Low (45%)',
                    predicted_revenue: 1800,
                    risk_factors: ['Low engagement', 'Long timeline', 'Budget constraints'],
                    next_best_action: 'Add to nurture campaign, check back in 30 days',
                    timeline_prediction: '45-60 days to decision'
                },
                activities: [
                    { type: 'email_reply', timestamp: '2024-07-07T10:30:00Z', description: 'Replied to welcome email' },
                    { type: 'referral', timestamp: '2024-07-05T14:22:00Z', description: 'Referred by current tenant Lisa Garcia' }
                ],
                tags: ['referral', 'long-timeline', 'nurture-campaign']
            },
            {
                id: 'lead_004',
                name: 'David Wilson',
                email: 'dwilson.consulting@gmail.com',
                phone: '(555) 456-7890',
                status: 'hot',
                ai_score: 88,
                source: 'Facebook Ads',
                property_interest: 'Riverside Tower - Unit 1204',
                budget: 3200,
                move_in_date: '2024-08-01',
                created_at: '2024-07-09T11:10:00Z',
                last_contact: '2024-07-13T09:15:00Z',
                interactions: 12,
                engagement_score: 89,
                qualification_status: 'qualified',
                ai_insights: {
                    likelihood_to_lease: 'Very High (88%)',
                    predicted_revenue: 3200,
                    risk_factors: ['High expectations for amenities'],
                    next_best_action: 'Highlight premium amenities during showing',
                    timeline_prediction: '2-4 days to lease'
                },
                activities: [
                    { type: 'showing_scheduled', timestamp: '2024-07-13T09:15:00Z', description: 'Scheduled showing for July 15th' },
                    { type: 'website_visit', timestamp: '2024-07-12T19:45:00Z', description: 'Spent 18 minutes on amenities page' },
                    { type: 'chat_conversation', timestamp: '2024-07-11T16:30:00Z', description: '22-minute chat about lease terms' }
                ],
                tags: ['facebook-lead', 'premium-seeker', 'showing-scheduled']
            }
        ];

        setLeads(mockLeads);
    };

    const getLeadsByStatus = (status) => {
        return leads.filter(lead => status === 'all' || lead.status === status);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getStatusColor = (status) => {
        const colors = {
            hot: '#dc2626',
            warm: '#f59e0b',
            cold: '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredLeads = leads.filter(lead => {
        const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
        const matchesSearch = !searchTerm || 
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.property_interest.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Pipeline View Component
    const PipelineView = () => {
        const statusColumns = [
            { key: 'cold', title: 'Cold Leads', color: '#6b7280' },
            { key: 'warm', title: 'Warm Leads', color: '#f59e0b' },
            { key: 'hot', title: 'Hot Leads', color: '#dc2626' }
        ];

        return (
            <div className="pipeline-view">
                <div className="pipeline-header">
                    <div className="pipeline-stats">
                        <div className="stat-card">
                            <span className="stat-value">{leads.length}</span>
                            <span className="stat-label">Total Leads</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{leads.filter(l => l.status === 'hot').length}</span>
                            <span className="stat-label">Hot Leads</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{Math.round(leads.reduce((sum, l) => sum + l.ai_score, 0) / leads.length)}%</span>
                            <span className="stat-label">Avg AI Score</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{formatCurrency(leads.reduce((sum, l) => sum + l.ai_insights.predicted_revenue, 0))}</span>
                            <span className="stat-label">Pipeline Value</span>
                        </div>
                    </div>
                    <div className="pipeline-controls">
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowLeadModal(true)}
                        >
                            <i className="fas fa-plus"></i> Add Lead
                        </button>
                    </div>
                </div>

                <div className="pipeline-columns">
                    {statusColumns.map(column => {
                        const columnLeads = filteredLeads.filter(lead => lead.status === column.key);
                        return (
                            <div key={column.key} className="pipeline-column">
                                <div className="column-header" style={{ borderColor: column.color }}>
                                    <h3 style={{ color: column.color }}>{column.title}</h3>
                                    <span className="lead-count">{columnLeads.length}</span>
                                </div>
                                <div className="column-content">
                                    {columnLeads.map(lead => (
                                        <div 
                                            key={lead.id} 
                                            className="lead-card"
                                            onClick={() => setSelectedLead(lead)}
                                        >
                                            <div className="lead-header">
                                                <div className="lead-name">{lead.name}</div>
                                                <div 
                                                    className="ai-score" 
                                                    style={{ backgroundColor: getScoreColor(lead.ai_score) }}
                                                >
                                                    {lead.ai_score}
                                                </div>
                                            </div>
                                            <div className="lead-details">
                                                <div className="lead-property">{lead.property_interest}</div>
                                                <div className="lead-budget">{formatCurrency(lead.budget)}/month</div>
                                                <div className="lead-source">{lead.source}</div>
                                            </div>
                                            <div className="lead-insights">
                                                <div className="insight-item">
                                                    <i className="fas fa-brain"></i>
                                                    {lead.ai_insights.likelihood_to_lease}
                                                </div>
                                                <div className="next-action">
                                                    <i className="fas fa-lightbulb"></i>
                                                    {lead.ai_insights.next_best_action}
                                                </div>
                                            </div>
                                            <div className="lead-footer">
                                                <span className="last-contact">
                                                    Last: {formatDate(lead.last_contact)}
                                                </span>
                                                <div className="lead-tags">
                                                    {lead.tags.slice(0, 2).map(tag => (
                                                        <span key={tag} className="tag">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Lead Detail Modal
    const LeadDetailModal = ({ lead, onClose }) => {
        const [activeTab, setActiveTab] = React.useState('overview');

        if (!lead) return null;

        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="lead-detail-modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <div className="lead-header-info">
                            <h2>{lead.name}</h2>
                            <div className="lead-meta">
                                <span className={`status-badge ${lead.status}`}>
                                    {lead.status.toUpperCase()}
                                </span>
                                <span className="ai-score-large" style={{ backgroundColor: getScoreColor(lead.ai_score) }}>
                                    AI Score: {lead.ai_score}
                                </span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="modal-tabs">
                        {['overview', 'ai-insights', 'activity', 'communication'].map(tab => (
                            <button
                                key={tab}
                                className={`tab ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.replace('-', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="modal-content">
                        {activeTab === 'overview' && (
                            <div className="overview-tab">
                                <div className="contact-info">
                                    <h3>Contact Information</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Email:</label>
                                            <span>{lead.email}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Phone:</label>
                                            <span>{lead.phone}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Source:</label>
                                            <span>{lead.source}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Property Interest:</label>
                                            <span>{lead.property_interest}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Budget:</label>
                                            <span>{formatCurrency(lead.budget)}/month</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Move-in Date:</label>
                                            <span>{new Date(lead.move_in_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="qualification-status">
                                    <h3>Qualification Status</h3>
                                    <div className="qualification-grid">
                                        <div className="qual-item">
                                            <label>Status:</label>
                                            <span className={`qual-badge ${lead.qualification_status}`}>
                                                {lead.qualification_status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="qual-item">
                                            <label>Interactions:</label>
                                            <span>{lead.interactions}</span>
                                        </div>
                                        <div className="qual-item">
                                            <label>Engagement Score:</label>
                                            <span>{lead.engagement_score}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ai-insights' && (
                            <div className="ai-insights-tab">
                                <div className="ai-prediction">
                                    <h3>AI Predictions</h3>
                                    <div className="prediction-grid">
                                        <div className="prediction-item">
                                            <label>Likelihood to Lease:</label>
                                            <span className="prediction-value">
                                                {lead.ai_insights.likelihood_to_lease}
                                            </span>
                                        </div>
                                        <div className="prediction-item">
                                            <label>Predicted Revenue:</label>
                                            <span className="prediction-value">
                                                {formatCurrency(lead.ai_insights.predicted_revenue)}
                                            </span>
                                        </div>
                                        <div className="prediction-item">
                                            <label>Timeline Prediction:</label>
                                            <span className="prediction-value">
                                                {lead.ai_insights.timeline_prediction}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="ai-recommendations">
                                    <h3>AI Recommendations</h3>
                                    <div className="recommendation-card">
                                        <div className="next-action">
                                            <i className="fas fa-lightbulb"></i>
                                            <strong>Next Best Action:</strong>
                                            <p>{lead.ai_insights.next_best_action}</p>
                                        </div>
                                    </div>
                                </div>

                                {lead.ai_insights.risk_factors.length > 0 && (
                                    <div className="risk-factors">
                                        <h3>Risk Factors</h3>
                                        <div className="risk-list">
                                            {lead.ai_insights.risk_factors.map((risk, index) => (
                                                <div key={index} className="risk-item">
                                                    <i className="fas fa-exclamation-triangle"></i>
                                                    {risk}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div className="activity-tab">
                                <h3>Activity Timeline</h3>
                                <div className="activity-timeline">
                                    {lead.activities.map((activity, index) => (
                                        <div key={index} className="activity-item">
                                            <div className="activity-icon">
                                                <i className={`fas fa-${
                                                    activity.type === 'email_open' ? 'envelope-open' :
                                                    activity.type === 'website_visit' ? 'globe' :
                                                    activity.type === 'phone_call' ? 'phone' :
                                                    activity.type === 'form_submit' ? 'wpforms' :
                                                    activity.type === 'showing_scheduled' ? 'calendar' :
                                                    activity.type === 'chat_conversation' ? 'comments' :
                                                    'circle'
                                                }`}></i>
                                            </div>
                                            <div className="activity-content">
                                                <div className="activity-description">
                                                    {activity.description}
                                                </div>
                                                <div className="activity-timestamp">
                                                    {formatDate(activity.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'communication' && (
                            <div className="communication-tab">
                                <div className="communication-actions">
                                    <h3>Quick Actions</h3>
                                    <div className="action-buttons">
                                        <button className="action-btn email">
                                            <i className="fas fa-envelope"></i>
                                            Send Email
                                        </button>
                                        <button className="action-btn call">
                                            <i className="fas fa-phone"></i>
                                            Schedule Call
                                        </button>
                                        <button className="action-btn text">
                                            <i className="fas fa-sms"></i>
                                            Send SMS
                                        </button>
                                        <button className="action-btn showing">
                                            <i className="fas fa-calendar-plus"></i>
                                            Schedule Showing
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="communication-templates">
                                    <h3>AI-Generated Templates</h3>
                                    <div className="template-list">
                                        <div className="template-item">
                                            <strong>Follow-up Email</strong>
                                            <p>AI suggests: "Hi {lead.name}, I noticed you viewed our {lead.property_interest} listing multiple times. Would you like to schedule a private tour this week?"</p>
                                        </div>
                                        <div className="template-item">
                                            <strong>Competitive Advantage</strong>
                                            <p>AI suggests: "Based on your budget and timeline, I think you'll love our {lead.property_interest}. Here's how we compare to other options you're considering..."</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Close
                        </button>
                        <button className="btn btn-primary">
                            Update Lead
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="lead-management-system">
            <div className="lms-header">
                <div className="header-left">
                    <h1>Lead Management</h1>
                    <p>AI-powered lead scoring and pipeline management</p>
                </div>
                <div className="header-controls">
                    <div className="view-mode-selector">
                        {['pipeline', 'analytics', 'campaigns'].map(mode => (
                            <button
                                key={mode}
                                className={`mode-btn ${viewMode === mode ? 'active' : ''}`}
                                onClick={() => setViewMode(mode)}
                            >
                                <i className={`fas fa-${
                                    mode === 'pipeline' ? 'stream' : 
                                    mode === 'analytics' ? 'chart-line' : 
                                    'bullhorn'
                                }`}></i>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lms-content">
                {viewMode === 'pipeline' && <PipelineView />}
                {viewMode === 'analytics' && (
                    <div className="analytics-view">
                        <h2>Lead Analytics Dashboard</h2>
                        <p>Advanced analytics and conversion tracking coming soon...</p>
                    </div>
                )}
                {viewMode === 'campaigns' && (
                    <div className="campaigns-view">
                        <h2>Marketing Campaigns</h2>
                        <p>Email automation and nurture campaigns coming soon...</p>
                    </div>
                )}
            </div>

            {selectedLead && (
                <LeadDetailModal 
                    lead={selectedLead} 
                    onClose={() => setSelectedLead(null)} 
                />
            )}
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.LeadManagementSystem = LeadManagementSystem;