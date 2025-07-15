// CommunicationsHub.jsx - Centralized Communications Archive and Analytics
const CommunicationsHub = () => {
    const [activeView, setActiveView] = React.useState('overview');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [filters, setFilters] = React.useState({
        participantType: '',
        propertyId: '',
        type: '',
        priority: '',
        resolved: null,
        dateRange: { start: '', end: '' }
    });
    const [conversations, setConversations] = React.useState([]);
    const [analytics, setAnalytics] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [selectedConversation, setSelectedConversation] = React.useState(null);
    const [exportFormat, setExportFormat] = React.useState('csv');
    
    const logService = window.ConversationLogService;
    
    React.useEffect(() => {
        loadData();
    }, [activeView, searchQuery, filters]);
    
    const loadData = async () => {
        setLoading(true);
        try {
            const searchResults = logService.searchConversations(searchQuery, filters);
            setConversations(searchResults);
            
            const analyticsData = logService.getAnalytics('30d');
            setAnalytics(analyticsData);
        } catch (error) {
            console.error('Error loading communications data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleExport = () => {
        try {
            const exportData = logService.exportConversations(exportFormat, filters);
            const blob = new Blob([exportData], { 
                type: exportFormat === 'csv' ? 'text/csv' : 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `conversations_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
            a.click();
            URL.revokeObjectURL(url);
            
            window.showNotification?.('success', `Conversations exported as ${exportFormat.toUpperCase()}`);
        } catch (error) {
            console.error('Export error:', error);
            window.showNotification?.('error', 'Failed to export conversations');
        }
    };
    
    const handleArchive = () => {
        try {
            const result = logService.archiveOldConversations(365);
            window.showNotification?.('success', `Archived ${result.archived} old conversations`);
            loadData();
        } catch (error) {
            console.error('Archive error:', error);
            window.showNotification?.('error', 'Failed to archive conversations');
        }
    };
    
    const toggleResolved = (conversationId) => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            logService.markResolved(conversationId, !conversation.metadata.resolved);
            loadData();
        }
    };
    
    const formatTimeAgo = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    const getTypeIcon = (type) => {
        const icons = {
            text: 'fa-comment',
            voice: 'fa-microphone',
            ai: 'fa-robot',
            broadcast: 'fa-bullhorn',
            email: 'fa-envelope'
        };
        return icons[type] || 'fa-comment';
    };
    
    const getParticipantIcon = (type) => {
        const icons = {
            tenant: 'fa-user',
            owner: 'fa-building',
            vendor: 'fa-tools',
            admin: 'fa-user-shield',
            prospect: 'fa-user-plus'
        };
        return icons[type] || 'fa-user';
    };
    
    return (
        <div className="communications-hub">
            {/* Header */}
            <div className="hub-header">
                <div className="header-gradient">
                    <div className="floating-particles">
                        <div className="particle particle-1"></div>
                        <div className="particle particle-2"></div>
                        <div className="particle particle-3"></div>
                    </div>
                </div>
                <div className="header-content">
                    <h1>Communications Hub</h1>
                    <p>Complete conversation history and analytics</p>
                    
                    {analytics && (
                        <div className="header-stats">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-comments"></i>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{analytics.totalConversations}</span>
                                    <span className="stat-label">Total Conversations</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{analytics.averageResponseTime}m</span>
                                    <span className="stat-label">Avg Response Time</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-check-circle"></i>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{analytics.resolutionRate}%</span>
                                    <span className="stat-label">Resolution Rate</span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <i className="fas fa-robot"></i>
                                </div>
                                <div className="stat-info">
                                    <span className="stat-value">{analytics.aiAssistedConversations}</span>
                                    <span className="stat-label">AI Assisted</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="hub-navigation">
                <div className="nav-tabs">
                    {[
                        { id: 'overview', label: 'Overview', icon: 'fa-chart-line' },
                        { id: 'conversations', label: 'Conversations', icon: 'fa-comments' },
                        { id: 'analytics', label: 'Analytics', icon: 'fa-chart-bar' },
                        { id: 'ai-transcripts', label: 'AI Transcripts', icon: 'fa-robot' },
                        { id: 'export', label: 'Export & Archive', icon: 'fa-download' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-tab ${activeView === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveView(tab.id)}
                        >
                            <i className={`fas ${tab.icon}`}></i>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Content Area */}
            <div className="hub-content">
                {activeView === 'overview' && (
                    <OverviewTab analytics={analytics} conversations={conversations.slice(0, 10)} />
                )}
                
                {activeView === 'conversations' && (
                    <ConversationsTab 
                        conversations={conversations}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        filters={filters}
                        setFilters={setFilters}
                        selectedConversation={selectedConversation}
                        setSelectedConversation={setSelectedConversation}
                        toggleResolved={toggleResolved}
                        loading={loading}
                    />
                )}
                
                {activeView === 'analytics' && (
                    <AnalyticsTab analytics={analytics} />
                )}
                
                {activeView === 'ai-transcripts' && (
                    <AITranscriptsTab />
                )}
                
                {activeView === 'export' && (
                    <ExportTab 
                        exportFormat={exportFormat}
                        setExportFormat={setExportFormat}
                        handleExport={handleExport}
                        handleArchive={handleArchive}
                        filters={filters}
                        setFilters={setFilters}
                    />
                )}
            </div>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ analytics, conversations }) => {
    if (!analytics) return <div className="loading-state">Loading analytics...</div>;
    
    return (
        <div className="overview-tab">
            <div className="overview-grid">
                {/* Recent Activity */}
                <div className="overview-card recent-activity">
                    <h3>
                        <i className="fas fa-clock"></i>
                        Recent Activity
                    </h3>
                    <div className="activity-list">
                        {conversations.map(conv => (
                            <div key={conv.id} className="activity-item">
                                <div className="activity-icon">
                                    <i className={`fas ${conv.type === 'ai' ? 'fa-robot' : 'fa-comment'}`}></i>
                                </div>
                                <div className="activity-content">
                                    <p className="activity-text">
                                        <strong>{conv.participantName}</strong> - {conv.content.substring(0, 50)}...
                                    </p>
                                    <span className="activity-time">{formatTimeAgo(conv.timestamp)}</span>
                                </div>
                                <div className="activity-meta">
                                    <span className={`type-badge ${conv.type}`}>{conv.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Conversation Types */}
                <div className="overview-card conversation-types">
                    <h3>
                        <i className="fas fa-chart-pie"></i>
                        Conversation Types
                    </h3>
                    <div className="type-breakdown">
                        {Object.entries(analytics.byType || {}).map(([type, count]) => (
                            <div key={type} className="type-item">
                                <div className="type-info">
                                    <i className={`fas ${getTypeIcon(type)}`}></i>
                                    <span className="type-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                </div>
                                <span className="type-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Participant Breakdown */}
                <div className="overview-card participant-breakdown">
                    <h3>
                        <i className="fas fa-users"></i>
                        By Participant Type
                    </h3>
                    <div className="participant-chart">
                        {Object.entries(analytics.byParticipantType || {}).map(([type, count]) => (
                            <div key={type} className="participant-bar">
                                <div className="bar-info">
                                    <i className={`fas ${getParticipantIcon(type)}`}></i>
                                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}s</span>
                                </div>
                                <div className="bar-visual">
                                    <div 
                                        className="bar-fill" 
                                        style={{ 
                                            width: `${(count / analytics.totalConversations) * 100}%`,
                                            backgroundColor: getParticipantColor(type)
                                        }}
                                    ></div>
                                </div>
                                <span className="bar-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Top Properties */}
                <div className="overview-card top-properties">
                    <h3>
                        <i className="fas fa-building"></i>
                        Most Active Properties
                    </h3>
                    <div className="property-list">
                        {Object.entries(analytics.byProperty || {})
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 5)
                            .map(([property, count]) => (
                                <div key={property} className="property-item">
                                    <span className="property-name">{property || 'Unknown'}</span>
                                    <span className="property-count">{count}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Conversations Tab Component
const ConversationsTab = ({ 
    conversations, 
    searchQuery, 
    setSearchQuery, 
    filters, 
    setFilters,
    selectedConversation,
    setSelectedConversation,
    toggleResolved,
    loading 
}) => {
    return (
        <div className="conversations-tab">
            {/* Search and Filters */}
            <div className="conversations-controls">
                <div className="search-container">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                <div className="filter-row">
                    <select 
                        value={filters.participantType} 
                        onChange={(e) => setFilters({...filters, participantType: e.target.value})}
                        className="filter-select"
                    >
                        <option value="">All Participants</option>
                        <option value="tenant">Tenants</option>
                        <option value="owner">Owners</option>
                        <option value="vendor">Vendors</option>
                        <option value="admin">Admins</option>
                    </select>
                    
                    <select 
                        value={filters.type} 
                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                        className="filter-select"
                    >
                        <option value="">All Types</option>
                        <option value="text">Text</option>
                        <option value="voice">Voice</option>
                        <option value="ai">AI</option>
                        <option value="broadcast">Broadcast</option>
                    </select>
                    
                    <select 
                        value={filters.priority} 
                        onChange={(e) => setFilters({...filters, priority: e.target.value})}
                        className="filter-select"
                    >
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                    
                    <select 
                        value={filters.resolved === null ? '' : filters.resolved.toString()} 
                        onChange={(e) => setFilters({...filters, resolved: e.target.value === '' ? null : e.target.value === 'true'})}
                        className="filter-select"
                    >
                        <option value="">All Status</option>
                        <option value="false">Unresolved</option>
                        <option value="true">Resolved</option>
                    </select>
                </div>
            </div>
            
            {/* Conversations List */}
            <div className="conversations-container">
                <div className="conversations-list">
                    {loading ? (
                        <div className="loading-state">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading conversations...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-comments"></i>
                            <h3>No conversations found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <ConversationCard 
                                key={conv.id} 
                                conversation={conv}
                                selected={selectedConversation?.id === conv.id}
                                onClick={() => setSelectedConversation(conv)}
                                onToggleResolved={() => toggleResolved(conv.id)}
                            />
                        ))
                    )}
                </div>
                
                {/* Conversation Detail */}
                <div className="conversation-detail">
                    {selectedConversation ? (
                        <ConversationDetail conversation={selectedConversation} />
                    ) : (
                        <div className="detail-empty">
                            <i className="fas fa-comment-alt"></i>
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Conversation Card Component
const ConversationCard = ({ conversation, selected, onClick, onToggleResolved }) => {
    return (
        <div 
            className={`conversation-card ${selected ? 'selected' : ''} ${conversation.metadata.resolved ? 'resolved' : ''}`}
            onClick={onClick}
        >
            <div className="card-header">
                <div className="participant-info">
                    <div className={`participant-avatar ${conversation.participantType}`}>
                        <i className={`fas ${getParticipantIcon(conversation.participantType)}`}></i>
                    </div>
                    <div className="participant-details">
                        <h4>{conversation.participantName}</h4>
                        <p>{conversation.propertyName} {conversation.unitNumber && `• Unit ${conversation.unitNumber}`}</p>
                    </div>
                </div>
                <div className="conversation-meta">
                    <span className="timestamp">{formatTimeAgo(conversation.timestamp)}</span>
                    <div className="type-badges">
                        <span className={`type-badge ${conversation.type}`}>
                            <i className={`fas ${getTypeIcon(conversation.type)}`}></i>
                            {conversation.type}
                        </span>
                        {conversation.metadata.priority !== 'normal' && (
                            <span className={`priority-badge ${conversation.metadata.priority}`}>
                                {conversation.metadata.priority}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="card-content">
                {conversation.subject && (
                    <p className="conversation-subject">{conversation.subject}</p>
                )}
                <p className="conversation-preview">
                    {conversation.content.substring(0, 150)}
                    {conversation.content.length > 150 && '...'}
                </p>
            </div>
            
            <div className="card-footer">
                <div className="conversation-tags">
                    {conversation.metadata.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                    {conversation.metadata.aiAssisted && (
                        <span className="tag ai">AI Assisted</span>
                    )}
                </div>
                <div className="card-actions">
                    <button 
                        className={`resolve-btn ${conversation.metadata.resolved ? 'resolved' : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleResolved();
                        }}
                    >
                        <i className={`fas ${conversation.metadata.resolved ? 'fa-undo' : 'fa-check'}`}></i>
                        {conversation.metadata.resolved ? 'Unresolve' : 'Resolve'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Conversation Detail Component
const ConversationDetail = ({ conversation }) => {
    return (
        <div className="conversation-detail-view">
            <div className="detail-header">
                <div className="detail-participant">
                    <div className={`detail-avatar ${conversation.participantType}`}>
                        <i className={`fas ${getParticipantIcon(conversation.participantType)}`}></i>
                    </div>
                    <div className="detail-info">
                        <h3>{conversation.participantName}</h3>
                        <p>{conversation.participantType} • {conversation.propertyName}</p>
                        {conversation.unitNumber && <p>Unit {conversation.unitNumber}</p>}
                    </div>
                </div>
                <div className="detail-meta">
                    <span className="detail-timestamp">
                        {new Date(conversation.timestamp).toLocaleString()}
                    </span>
                    <div className="detail-badges">
                        <span className={`type-badge ${conversation.type}`}>
                            <i className={`fas ${getTypeIcon(conversation.type)}`}></i>
                            {conversation.type}
                        </span>
                        <span className={`channel-badge`}>
                            {conversation.metadata.channel}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="detail-content">
                {conversation.subject && (
                    <div className="detail-subject">
                        <h4>Subject</h4>
                        <p>{conversation.subject}</p>
                    </div>
                )}
                
                <div className="detail-message">
                    <h4>Message</h4>
                    <div className="message-content">
                        {conversation.content.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </div>
                
                {conversation.metadata.linkedTickets.length > 0 && (
                    <div className="detail-tickets">
                        <h4>Linked Tickets</h4>
                        <div className="ticket-list">
                            {conversation.metadata.linkedTickets.map(ticket => (
                                <div key={ticket.id} className="ticket-item">
                                    <i className={`fas ${ticket.type === 'maintenance' ? 'fa-tools' : 'fa-ticket-alt'}`}></i>
                                    <span>{ticket.title || ticket.id}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="detail-metadata">
                    <div className="metadata-grid">
                        <div className="metadata-item">
                            <label>Priority</label>
                            <span className={`priority ${conversation.metadata.priority}`}>
                                {conversation.metadata.priority}
                            </span>
                        </div>
                        <div className="metadata-item">
                            <label>Channel</label>
                            <span>{conversation.metadata.channel}</span>
                        </div>
                        <div className="metadata-item">
                            <label>Sentiment</label>
                            <span className={`sentiment ${conversation.metadata.sentiment}`}>
                                {conversation.metadata.sentiment}
                            </span>
                        </div>
                        <div className="metadata-item">
                            <label>Status</label>
                            <span className={`status ${conversation.metadata.resolved ? 'resolved' : 'open'}`}>
                                {conversation.metadata.resolved ? 'Resolved' : 'Open'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper functions
const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getTypeIcon = (type) => {
    const icons = {
        text: 'fa-comment',
        voice: 'fa-microphone',
        ai: 'fa-robot',
        broadcast: 'fa-bullhorn',
        email: 'fa-envelope'
    };
    return icons[type] || 'fa-comment';
};

const getParticipantIcon = (type) => {
    const icons = {
        tenant: 'fa-user',
        owner: 'fa-building',
        vendor: 'fa-tools',
        admin: 'fa-user-shield',
        prospect: 'fa-user-plus'
    };
    return icons[type] || 'fa-user';
};

const getParticipantColor = (type) => {
    const colors = {
        tenant: '#3b82f6',
        owner: '#8b5cf6',
        vendor: '#f59e0b',
        admin: '#ef4444',
        prospect: '#10b981'
    };
    return colors[type] || '#6b7280';
};

// Analytics Tab Component
const AnalyticsTab = ({ analytics }) => {
    if (!analytics) return <div className="loading-state">Loading analytics...</div>;
    
    return (
        <div className="analytics-tab">
            <div className="analytics-grid">
                {/* Volume Chart */}
                <div className="analytics-card">
                    <h3>
                        <i className="fas fa-chart-line"></i>
                        Daily Volume
                    </h3>
                    <div className="volume-chart">
                        {Object.entries(analytics.dailyVolume || {})
                            .slice(-7)
                            .map(([date, count]) => (
                                <div key={date} className="volume-bar">
                                    <div className="bar-container">
                                        <div 
                                            className="bar" 
                                            style={{ height: `${(count / Math.max(...Object.values(analytics.dailyVolume))) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="bar-label">{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    <span className="bar-value">{count}</span>
                                </div>
                            ))}
                    </div>
                </div>
                
                {/* Response Time */}
                <div className="analytics-card">
                    <h3>
                        <i className="fas fa-clock"></i>
                        Response Performance
                    </h3>
                    <div className="performance-metrics">
                        <div className="metric">
                            <span className="metric-label">Average Response Time</span>
                            <span className="metric-value">{analytics.averageResponseTime}m</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Resolution Rate</span>
                            <span className="metric-value">{analytics.resolutionRate}%</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">AI Assisted</span>
                            <span className="metric-value">{analytics.aiAssistedConversations}</span>
                        </div>
                    </div>
                </div>
                
                {/* Top Tags */}
                <div className="analytics-card">
                    <h3>
                        <i className="fas fa-tags"></i>
                        Popular Topics
                    </h3>
                    <div className="tags-cloud">
                        {analytics.topTags?.slice(0, 10).map(({ tag, count }) => (
                            <div key={tag} className="tag-item">
                                <span className="tag-name">{tag}</span>
                                <span className="tag-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Sentiment Analysis */}
                <div className="analytics-card">
                    <h3>
                        <i className="fas fa-smile"></i>
                        Sentiment Analysis
                    </h3>
                    <div className="sentiment-breakdown">
                        {Object.entries(analytics.sentimentAnalysis || {}).map(([sentiment, count]) => (
                            <div key={sentiment} className="sentiment-item">
                                <div className="sentiment-info">
                                    <i className={`fas ${sentiment === 'positive' ? 'fa-smile' : sentiment === 'negative' ? 'fa-frown' : 'fa-meh'}`}></i>
                                    <span>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</span>
                                </div>
                                <span className="sentiment-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// AI Transcripts Tab Component
const AITranscriptsTab = () => {
    const [transcripts, setTranscripts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedTranscript, setSelectedTranscript] = React.useState(null);
    
    React.useEffect(() => {
        loadTranscripts();
    }, []);
    
    const loadTranscripts = () => {
        setLoading(true);
        try {
            const aiTranscripts = window.ConversationLogService?.aiTranscripts || [];
            setTranscripts(aiTranscripts);
        } catch (error) {
            console.error('Error loading AI transcripts:', error);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="ai-transcripts-tab">
            <div className="transcripts-container">
                <div className="transcripts-list">
                    <div className="list-header">
                        <h3>
                            <i className="fas fa-robot"></i>
                            AI Conversation Transcripts
                        </h3>
                        <p>All AI-assisted conversations and responses</p>
                    </div>
                    
                    {loading ? (
                        <div className="loading-state">
                            <i className="fas fa-spinner fa-spin"></i>
                            <p>Loading AI transcripts...</p>
                        </div>
                    ) : transcripts.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-robot"></i>
                            <h3>No AI transcripts found</h3>
                            <p>AI conversations will appear here once they start</p>
                        </div>
                    ) : (
                        <div className="transcripts-grid">
                            {transcripts.map(transcript => (
                                <TranscriptCard 
                                    key={transcript.id}
                                    transcript={transcript}
                                    selected={selectedTranscript?.id === transcript.id}
                                    onClick={() => setSelectedTranscript(transcript)}
                                />
                            ))}
                        </div>
                    )}
                </div>
                
                {selectedTranscript && (
                    <div className="transcript-detail">
                        <TranscriptDetail 
                            transcript={selectedTranscript}
                            onClose={() => setSelectedTranscript(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Transcript Card Component
const TranscriptCard = ({ transcript, selected, onClick }) => {
    return (
        <div 
            className={`transcript-card ${selected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="transcript-header">
                <div className="transcript-user">
                    <div className={`user-avatar ${transcript.userType}`}>
                        <i className={`fas ${getParticipantIcon(transcript.userType)}`}></i>
                    </div>
                    <div className="user-info">
                        <h4>{transcript.userName}</h4>
                        <p>{transcript.userType} • {formatTimeAgo(transcript.timestamp)}</p>
                    </div>
                </div>
                <div className="transcript-meta">
                    <span className={`conversation-type ${transcript.conversationType}`}>
                        {transcript.conversationType}
                    </span>
                </div>
            </div>
            
            <div className="transcript-preview">
                <div className="prompt-preview">
                    <strong>Prompt:</strong> {transcript.prompt.substring(0, 80)}...
                </div>
                <div className="response-preview">
                    <strong>Response:</strong> {transcript.response.substring(0, 80)}...
                </div>
            </div>
            
            <div className="transcript-footer">
                <div className="transcript-tags">
                    <span className="tag ai-model">{transcript.aiModel}</span>
                    {transcript.metadata.intent && (
                        <span className="tag intent">{transcript.metadata.intent}</span>
                    )}
                </div>
                {transcript.metadata.confidence && (
                    <div className="confidence-score">
                        Confidence: {Math.round(transcript.metadata.confidence * 100)}%
                    </div>
                )}
            </div>
        </div>
    );
};

// Transcript Detail Component
const TranscriptDetail = ({ transcript, onClose }) => {
    return (
        <div className="transcript-detail-view">
            <div className="detail-header">
                <button className="close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
                <h3>AI Conversation Detail</h3>
            </div>
            
            <div className="detail-content">
                <div className="conversation-context">
                    <h4>Context</h4>
                    <div className="context-grid">
                        <div className="context-item">
                            <label>User</label>
                            <span>{transcript.userName} ({transcript.userType})</span>
                        </div>
                        <div className="context-item">
                            <label>Timestamp</label>
                            <span>{new Date(transcript.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="context-item">
                            <label>AI Model</label>
                            <span>{transcript.aiModel}</span>
                        </div>
                        <div className="context-item">
                            <label>Type</label>
                            <span>{transcript.conversationType}</span>
                        </div>
                    </div>
                </div>
                
                <div className="conversation-exchange">
                    <div className="prompt-section">
                        <h4>User Prompt</h4>
                        <div className="message-bubble user">
                            {transcript.prompt}
                        </div>
                    </div>
                    
                    <div className="response-section">
                        <h4>AI Response</h4>
                        <div className="message-bubble ai">
                            {transcript.response}
                        </div>
                    </div>
                </div>
                
                <div className="conversation-metadata">
                    <h4>Metadata</h4>
                    <div className="metadata-grid">
                        {transcript.metadata.confidence && (
                            <div className="metadata-item">
                                <label>Confidence</label>
                                <span>{Math.round(transcript.metadata.confidence * 100)}%</span>
                            </div>
                        )}
                        {transcript.metadata.intent && (
                            <div className="metadata-item">
                                <label>Intent</label>
                                <span>{transcript.metadata.intent}</span>
                            </div>
                        )}
                        {transcript.metadata.sentiment && (
                            <div className="metadata-item">
                                <label>Sentiment</label>
                                <span className={`sentiment ${transcript.metadata.sentiment}`}>
                                    {transcript.metadata.sentiment}
                                </span>
                            </div>
                        )}
                        {transcript.metadata.entities?.length > 0 && (
                            <div className="metadata-item">
                                <label>Entities</label>
                                <div className="entities-list">
                                    {transcript.metadata.entities.map((entity, i) => (
                                        <span key={i} className="entity-tag">{entity}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export Tab Component
const ExportTab = ({ exportFormat, setExportFormat, handleExport, handleArchive, filters, setFilters }) => {
    const [dateRange, setDateRange] = React.useState({ start: '', end: '' });
    
    return (
        <div className="export-tab">
            <div className="export-grid">
                {/* Export Section */}
                <div className="export-card">
                    <h3>
                        <i className="fas fa-download"></i>
                        Export Conversations
                    </h3>
                    <p>Download conversation data in various formats</p>
                    
                    <div className="export-options">
                        <div className="format-selector">
                            <label>Export Format:</label>
                            <div className="format-buttons">
                                {['csv', 'json', 'pdf'].map(format => (
                                    <button
                                        key={format}
                                        className={`format-btn ${exportFormat === format ? 'active' : ''}`}
                                        onClick={() => setExportFormat(format)}
                                    >
                                        <i className={`fas fa-file-${format === 'csv' ? 'csv' : format === 'json' ? 'code' : 'pdf'}`}></i>
                                        {format.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="date-range-selector">
                            <label>Date Range:</label>
                            <div className="date-inputs">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => {
                                        setDateRange({...dateRange, start: e.target.value});
                                        setFilters({...filters, dateRange: {...dateRange, start: e.target.value}});
                                    }}
                                    className="date-input"
                                />
                                <span>to</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => {
                                        setDateRange({...dateRange, end: e.target.value});
                                        setFilters({...filters, dateRange: {...dateRange, end: e.target.value}});
                                    }}
                                    className="date-input"
                                />
                            </div>
                        </div>
                        
                        <button className="export-btn" onClick={handleExport}>
                            <i className="fas fa-download"></i>
                            Export Data
                        </button>
                    </div>
                </div>
                
                {/* Archive Section */}
                <div className="export-card">
                    <h3>
                        <i className="fas fa-archive"></i>
                        Archive Old Conversations
                    </h3>
                    <p>Move old conversations to archive storage</p>
                    
                    <div className="archive-options">
                        <div className="archive-info">
                            <p>Conversations older than 1 year will be moved to archive storage. This helps keep the active conversation list manageable while preserving historical data.</p>
                        </div>
                        
                        <button className="archive-btn" onClick={handleArchive}>
                            <i className="fas fa-archive"></i>
                            Archive Old Conversations
                        </button>
                    </div>
                </div>
                
                {/* Statistics Section */}
                <div className="export-card">
                    <h3>
                        <i className="fas fa-chart-bar"></i>
                        Storage Statistics
                    </h3>
                    <div className="storage-stats">
                        <div className="stat-item">
                            <span className="stat-label">Active Conversations</span>
                            <span className="stat-value">{window.ConversationLogService?.logs?.length || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">AI Transcripts</span>
                            <span className="stat-value">{window.ConversationLogService?.aiTranscripts?.length || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Archived Conversations</span>
                            <span className="stat-value">{JSON.parse(localStorage.getItem('archivedConversations') || '[]').length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.CommunicationsHub = CommunicationsHub;