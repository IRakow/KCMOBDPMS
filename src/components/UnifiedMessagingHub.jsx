// UnifiedMessagingHub.jsx - Beautiful as the Properties page
const UnifiedMessagingHub = () => {
    const [activeView, setActiveView] = React.useState('all');
    const [selectedConversation, setSelectedConversation] = React.useState(null);
    const [conversations, setConversations] = React.useState([]);
    const [showCompose, setShowCompose] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        loadConversations();
    }, [activeView]);
    
    const loadConversations = async () => {
        try {
            setLoading(true);
            const params = activeView !== 'all' ? `?type=${activeView}` : '';
            const response = await window.ApiService.get(`/messaging/conversations${params}`);
            
            // Mock data for development
            const mockConversations = [
                {
                    id: '1',
                    participant_name: 'Sarah Johnson',
                    participant_type: 'tenant',
                    participant_avatar: null,
                    property_name: 'Sunset Apartments',
                    unit_number: '205',
                    last_message: {
                        content: 'Hi, I noticed the AC is making a strange noise. Can someone take a look?',
                        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
                        is_from_me: false
                    },
                    unread_count: 2,
                    urgent: true,
                    linked_ticket: { type: 'maintenance' }
                },
                {
                    id: '2',
                    participant_name: 'Mark Thompson',
                    participant_type: 'owner',
                    participant_avatar: null,
                    property_name: 'Oak Grove Residences',
                    unit_number: null,
                    last_message: {
                        content: 'Thanks for the monthly report. Everything looks great!',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                        is_from_me: true
                    },
                    unread_count: 0,
                    urgent: false
                },
                {
                    id: '3',
                    participant_name: 'Mike Wilson',
                    participant_type: 'vendor',
                    participant_avatar: null,
                    property_name: 'Multiple Properties',
                    unit_number: null,
                    last_message: {
                        content: 'All repairs at Sunset Apartments have been completed',
                        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
                        is_from_me: false
                    },
                    unread_count: 1,
                    urgent: false
                }
            ];
            
            setConversations(response.conversations || mockConversations);
        } catch (error) {
            console.error('Failed to load conversations:', error);
            // Use mock data on error
            setConversations([]);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="messaging-hub-premium">
            {/* Stunning Header */}
            <div className="messaging-hero">
                <div className="hero-gradient-bg">
                    <div className="floating-orbs">
                        <div className="orb orb-1"></div>
                        <div className="orb orb-2"></div>
                        <div className="orb orb-3"></div>
                    </div>
                </div>
                <div className="hero-content">
                    <h1 className="hero-title">Unified Communications</h1>
                    <p className="hero-subtitle">Every conversation, beautifully organized</p>
                    
                    {/* Live Stats */}
                    <div className="live-stats">
                        <div className="stat-bubble">
                            <div className="stat-icon">
                                <i className="fas fa-comments"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">127</span>
                                <span className="stat-label">Active Chats</span>
                            </div>
                        </div>
                        <div className="stat-bubble urgent">
                            <div className="stat-icon">
                                <i className="fas fa-bell"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">12</span>
                                <span className="stat-label">Need Response</span>
                            </div>
                        </div>
                        <div className="stat-bubble success">
                            <div className="stat-icon">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">98%</span>
                                <span className="stat-label">Response Rate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Glass Morphism Container */}
            <div className="messaging-container">
                {/* Sidebar - Beautiful Glass Effect */}
                <div className="messaging-sidebar-premium">
                    <button 
                        className="compose-btn-premium"
                        onClick={() => setShowCompose(true)}
                    >
                        <div className="btn-gradient">
                            <i className="fas fa-feather-alt"></i>
                            <span>Compose</span>
                        </div>
                        <div className="btn-glow"></div>
                    </button>
                    
                    {/* Filter Pills */}
                    <div className="filter-pills">
                        {[
                            { id: 'all', label: 'All Messages', icon: 'fa-inbox', count: 342 },
                            { id: 'tenants', label: 'Tenants', icon: 'fa-users', count: 156 },
                            { id: 'owners', label: 'Owners', icon: 'fa-home', count: 89 },
                            { id: 'vendors', label: 'Vendors', icon: 'fa-tools', count: 67 },
                            { id: 'unread', label: 'Unread', icon: 'fa-circle', count: 23 }
                        ].map(filter => (
                            <button
                                key={filter.id}
                                className={`filter-pill ${activeView === filter.id ? 'active' : ''}`}
                                onClick={() => setActiveView(filter.id)}
                            >
                                <i className={`fas ${filter.icon}`}></i>
                                <span>{filter.label}</span>
                                <span className="pill-count">{filter.count}</span>
                            </button>
                        ))}
                    </div>
                    
                    {/* AI Assistant Prompt */}
                    <div className="ai-assistant-card">
                        <div className="ai-gradient">
                            <i className="fas fa-robot"></i>
                        </div>
                        <div className="ai-content">
                            <h4>AI Assistant</h4>
                            <p>I can help draft responses, summarize conversations, or find important messages</p>
                            <button className="ai-activate">
                                <span>Ask AI</span>
                                <i className="fas fa-sparkles"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Conversations List - Glass Cards */}
                <div className="conversations-list-premium">
                    <div className="list-header-premium">
                        <div className="search-container">
                            <i className="fas fa-search"></i>
                            <input 
                                type="text" 
                                placeholder="Search conversations..."
                                className="search-input-premium"
                            />
                            <div className="search-glow"></div>
                        </div>
                    </div>
                    
                    <div className="conversations-scroll">
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading conversations...</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <ConversationCardPremium
                                    key={conv.id}
                                    conversation={conv}
                                    selected={selectedConversation?.id === conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                />
                            ))
                        )}
                    </div>
                </div>
                
                {/* Conversation View - Stunning Design */}
                <div className="conversation-view-premium">
                    {selectedConversation ? (
                        <ConversationDetailPremium
                            conversation={selectedConversation}
                            onClose={() => setSelectedConversation(null)}
                        />
                    ) : (
                        <div className="empty-state-premium">
                            <div className="empty-illustration">
                                <div className="chat-bubbles">
                                    <div className="bubble bubble-1"></div>
                                    <div className="bubble bubble-2"></div>
                                    <div className="bubble bubble-3"></div>
                                </div>
                            </div>
                            <h3>Select a conversation</h3>
                            <p>Choose a message from the list to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Compose Modal */}
            {showCompose && (
                <ComposeModalPremium onClose={() => setShowCompose(false)} />
            )}
        </div>
    );
};

// Helper functions
const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
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

const getParticipantIcon = (type) => {
    const icons = {
        tenant: 'fa-user',
        owner: 'fa-home',
        vendor: 'fa-tools',
        prospect: 'fa-user-plus'
    };
    return icons[type] || 'fa-user';
};

// Premium Conversation Card
const ConversationCardPremium = ({ conversation, selected, onClick }) => {
    const getStatusColor = () => {
        if (conversation.urgent) return '#ef4444';
        if (conversation.unread_count > 0) return '#3b82f6';
        return '#10b981';
    };
    
    const getParticipantAvatar = () => {
        if (conversation.participant_avatar) {
            return <img src={conversation.participant_avatar} alt="" />;
        }
        
        const initials = conversation.participant_name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
            
        return <span className="avatar-initials">{initials}</span>;
    };
    
    return (
        <div 
            className={`conversation-card-premium ${selected ? 'selected' : ''}`}
            onClick={onClick}
        >
            <div className="card-glow" style={{ '--glow-color': getStatusColor() }}></div>
            
            <div className="card-content">
                <div className="participant-row">
                    <div className={`participant-avatar ${conversation.participant_type}`}>
                        {getParticipantAvatar()}
                        <div className="status-dot" style={{ backgroundColor: getStatusColor() }}></div>
                    </div>
                    
                    <div className="participant-info">
                        <h4>{conversation.participant_name}</h4>
                        <p className="participant-meta">
                            <i className={`fas ${getParticipantIcon(conversation.participant_type)}`}></i>
                            {conversation.property_name}
                            {conversation.unit_number && ` • Unit ${conversation.unit_number}`}
                        </p>
                    </div>
                    
                    <div className="conversation-meta">
                        <span className="timestamp">{formatTimeAgo(conversation.last_message.created_at)}</span>
                        {conversation.unread_count > 0 && (
                            <span className="unread-badge">{conversation.unread_count}</span>
                        )}
                    </div>
                </div>
                
                <div className="message-preview">
                    <p className={conversation.last_message.is_from_me ? 'from-me' : ''}>
                        {conversation.last_message.is_from_me && <span className="you-prefix">You: </span>}
                        {conversation.last_message.content}
                    </p>
                </div>
                
                {conversation.linked_ticket && (
                    <div className="linked-indicators">
                        {conversation.linked_ticket.type === 'maintenance' && (
                            <span className="indicator maintenance">
                                <i className="fas fa-tools"></i>
                                Maintenance Request
                            </span>
                        )}
                        {conversation.urgent && (
                            <span className="indicator urgent">
                                <i className="fas fa-exclamation-circle"></i>
                                Urgent
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Premium Conversation Detail
const ConversationDetailPremium = ({ conversation, onClose }) => {
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const messagesEndRef = React.useRef(null);
    
    React.useEffect(() => {
        loadMessages();
    }, [conversation.id]);
    
    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const loadMessages = async () => {
        try {
            setLoading(true);
            const response = await window.ApiService.get(`/messaging/conversations/${conversation.id}/messages`);
            
            // Mock messages for development
            const mockMessages = [
                {
                    id: '1',
                    content: conversation.last_message.content,
                    is_from_me: conversation.last_message.is_from_me,
                    created_at: conversation.last_message.created_at,
                    sender_name: conversation.last_message.is_from_me ? 'You' : conversation.participant_name
                },
                {
                    id: '2',
                    content: 'I understand your concern. Let me look into this right away.',
                    is_from_me: true,
                    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
                    sender_name: 'You'
                },
                {
                    id: '3',
                    content: 'I\'ve scheduled a technician to visit tomorrow at 2 PM. They\'ll call 30 minutes before arrival.',
                    is_from_me: true,
                    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
                    sender_name: 'You'
                },
                {
                    id: '4',
                    content: 'That works perfectly! Thank you for the quick response.',
                    is_from_me: false,
                    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
                    sender_name: conversation.participant_name
                }
            ];
            
            setMessages(response.messages || mockMessages);
        } catch (error) {
            console.error('Failed to load messages:', error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        
        const message = {
            id: Date.now().toString(),
            content: newMessage,
            is_from_me: true,
            created_at: new Date().toISOString(),
            sender_name: 'You'
        };
        
        setMessages([...messages, message]);
        setNewMessage('');
        
        try {
            await window.ApiService.post(`/messaging/conversations/${conversation.id}/messages`, {
                content: newMessage
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };
    
    return (
        <div className="conversation-detail-premium">
            <div className="detail-header">
                <div className="header-left">
                    <button className="back-btn" onClick={onClose}>
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div className={`header-avatar ${conversation.participant_type}`}>
                        {conversation.participant_avatar ? (
                            <img src={conversation.participant_avatar} alt="" />
                        ) : (
                            <span>{conversation.participant_name.split(' ').map(n => n[0]).join('').toUpperCase()}</span>
                        )}
                    </div>
                    <div className="header-info">
                        <h3>{conversation.participant_name}</h3>
                        <p>
                            {conversation.property_name}
                            {conversation.unit_number && ` • Unit ${conversation.unit_number}`}
                        </p>
                    </div>
                </div>
                
                <div className="header-actions">
                    <button className="action-btn">
                        <i className="fas fa-phone"></i>
                    </button>
                    <button className="action-btn">
                        <i className="fas fa-video"></i>
                    </button>
                    <button className="action-btn">
                        <i className="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            
            <div className="messages-container">
                {loading ? (
                    <div className="loading-messages">
                        <div className="spinner"></div>
                        <p>Loading conversation...</p>
                    </div>
                ) : (
                    <>
                        {messages.map(message => (
                            <MessageBubblePremium key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
            
            <div className="message-input-container">
                <div className="input-actions">
                    <button className="attach-btn">
                        <i className="fas fa-paperclip"></i>
                    </button>
                </div>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="message-input"
                />
                <button 
                    className="send-btn"
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};

// Premium Message Bubble
const MessageBubblePremium = ({ message }) => {
    return (
        <div className={`message-bubble-premium ${message.is_from_me ? 'from-me' : 'from-them'}`}>
            <div className="bubble-content">
                <p>{message.content}</p>
                <span className="message-time">{formatTimeAgo(message.created_at)}</span>
            </div>
        </div>
    );
};

// Premium Compose Modal
const ComposeModalPremium = ({ onClose }) => {
    const [recipient, setRecipient] = React.useState('');
    const [recipientType, setRecipientType] = React.useState('tenant');
    const [subject, setSubject] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [showResults, setShowResults] = React.useState(false);
    
    const searchRecipients = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        
        // Mock search results
        const mockResults = [
            { id: '1', name: 'Sarah Johnson', type: 'tenant', property: 'Sunset Apartments', unit: '205' },
            { id: '2', name: 'Sarah Williams', type: 'tenant', property: 'Oak Grove', unit: '102' },
            { id: '3', name: 'Mark Thompson', type: 'owner', property: 'Oak Grove Residences' }
        ].filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
        
        setSearchResults(mockResults);
        setShowResults(true);
    };
    
    const selectRecipient = (result) => {
        setRecipient(result.name);
        setRecipientType(result.type);
        setShowResults(false);
    };
    
    const sendMessage = async () => {
        if (!recipient || !message) return;
        
        try {
            await window.ApiService.post('/messaging/conversations', {
                recipient,
                recipient_type: recipientType,
                subject,
                message
            });
            onClose();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="compose-modal-premium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Message</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="form-group">
                        <label>To:</label>
                        <div className="recipient-search">
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => {
                                    setRecipient(e.target.value);
                                    searchRecipients(e.target.value);
                                }}
                                placeholder="Search by name..."
                                className="form-input"
                            />
                            {showResults && searchResults.length > 0 && (
                                <div className="search-results">
                                    {searchResults.map(result => (
                                        <div 
                                            key={result.id}
                                            className="search-result"
                                            onClick={() => selectRecipient(result)}
                                        >
                                            <i className={`fas ${getParticipantIcon(result.type)}`}></i>
                                            <div>
                                                <p className="result-name">{result.name}</p>
                                                <p className="result-meta">
                                                    {result.property}
                                                    {result.unit && ` • Unit ${result.unit}`}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Subject (optional):</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="What's this about?"
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Message:</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="form-textarea"
                            rows="6"
                        />
                    </div>
                    
                    <div className="quick-templates">
                        <p>Quick Templates:</p>
                        <div className="template-chips">
                            <button 
                                className="template-chip"
                                onClick={() => setMessage('Hi! Just wanted to follow up on your maintenance request. Our team will be there tomorrow.')}
                            >
                                Maintenance Update
                            </button>
                            <button 
                                className="template-chip"
                                onClick={() => setMessage('Thank you for your payment. Your account is now current.')}
                            >
                                Payment Confirmation
                            </button>
                            <button 
                                className="template-chip"
                                onClick={() => setMessage('Hi! I wanted to check in and see how everything is going with your unit.')}
                            >
                                Check-in
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button 
                        className="btn-primary"
                        onClick={sendMessage}
                        disabled={!recipient || !message}
                    >
                        <i className="fas fa-paper-plane"></i>
                        Send Message
                    </button>
                </div>
            </div>
        </div>
    );
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.UnifiedMessagingHub = UnifiedMessagingHub;