// AIEmailSystem.jsx - AI-Powered Email System for Admins and Property Managers
const AIEmailSystem = ({ userType, userId, userName, userProperties = [] }) => {
    const [activeView, setActiveView] = React.useState('inbox');
    const [emails, setEmails] = React.useState([]);
    const [selectedEmail, setSelectedEmail] = React.useState(null);
    const [showCompose, setShowCompose] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedFolder, setSelectedFolder] = React.useState('inbox');
    const [loading, setLoading] = React.useState(true);
    const [aiAssistantOpen, setAiAssistantOpen] = React.useState(false);
    
    // Email composition state
    const [composeData, setComposeData] = React.useState({
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        priority: 'normal',
        isHtml: true,
        attachments: [],
        template: '',
        propertyContext: '',
        aiSuggestions: []
    });

    React.useEffect(() => {
        loadEmails();
    }, [selectedFolder, userType]);

    const loadEmails = async () => {
        setLoading(true);
        try {
            // Simulate email loading - in production this would connect to email service
            const mockEmails = [
                {
                    id: '1',
                    from: { email: 'tenant@example.com', name: 'Sarah Johnson' },
                    to: [{ email: `${userName.toLowerCase()}@property.com`, name: userName }],
                    subject: 'Maintenance Request Follow-up',
                    body: 'Hi, I wanted to follow up on my maintenance request from last week. The AC is still making noise.',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
                    isRead: false,
                    isStarred: false,
                    priority: 'high',
                    labels: ['maintenance', 'tenant'],
                    propertyId: userProperties[0]?.id,
                    propertyName: userProperties[0]?.name,
                    hasAttachments: false,
                    threadId: 'thread-1'
                },
                {
                    id: '2',
                    from: { email: 'owner@example.com', name: 'Mark Thompson' },
                    to: [{ email: `${userName.toLowerCase()}@property.com`, name: userName }],
                    subject: 'Monthly Property Report Request',
                    body: 'Could you please send me the monthly report for Oak Grove Residences? I need it for my tax preparation.',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
                    isRead: true,
                    isStarred: true,
                    priority: 'normal',
                    labels: ['owner', 'reports'],
                    propertyId: userProperties[1]?.id,
                    propertyName: userProperties[1]?.name,
                    hasAttachments: false,
                    threadId: 'thread-2'
                },
                {
                    id: '3',
                    from: { email: 'vendor@example.com', name: 'HVAC Solutions Inc' },
                    to: [{ email: `${userName.toLowerCase()}@property.com`, name: userName }],
                    subject: 'Quote for HVAC Maintenance Contract',
                    body: 'Please find attached our quote for annual HVAC maintenance across your properties.',
                    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                    isRead: false,
                    isStarred: false,
                    priority: 'normal',
                    labels: ['vendor', 'contracts'],
                    propertyId: 'all',
                    propertyName: 'All Properties',
                    hasAttachments: true,
                    threadId: 'thread-3'
                }
            ];

            // Filter by folder
            let filteredEmails = mockEmails;
            switch (selectedFolder) {
                case 'inbox':
                    filteredEmails = mockEmails.filter(email => !email.isArchived && !email.isDeleted);
                    break;
                case 'starred':
                    filteredEmails = mockEmails.filter(email => email.isStarred);
                    break;
                case 'sent':
                    filteredEmails = []; // Would load sent emails
                    break;
                case 'drafts':
                    filteredEmails = []; // Would load drafts
                    break;
            }

            setEmails(filteredEmails);
        } catch (error) {
            console.error('Error loading emails:', error);
        } finally {
            setLoading(false);
        }
    };

    const composeEmail = () => {
        setComposeData({
            to: '',
            cc: '',
            bcc: '',
            subject: '',
            body: '',
            priority: 'normal',
            isHtml: true,
            attachments: [],
            template: '',
            propertyContext: '',
            aiSuggestions: []
        });
        setShowCompose(true);
    };

    const replyToEmail = (email) => {
        setComposeData({
            to: email.from.email,
            cc: '',
            bcc: '',
            subject: `Re: ${email.subject}`,
            body: `\n\n---\nOn ${new Date(email.date).toLocaleString()}, ${email.from.name} wrote:\n${email.body}`,
            priority: email.priority,
            isHtml: true,
            attachments: [],
            template: '',
            propertyContext: email.propertyId,
            aiSuggestions: []
        });
        setShowCompose(true);
    };

    const getAIEmailSuggestions = async (context) => {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (context.includes('maintenance')) {
            return [
                "Thank you for your maintenance request. I've forwarded this to our maintenance team and you can expect a response within 24 hours.",
                "I understand your concern about the AC. I'll schedule a technician to inspect the unit this week. You'll receive a confirmation call.",
                "We appreciate your patience with this maintenance issue. I'm personally ensuring this gets priority attention."
            ];
        }
        
        if (context.includes('report')) {
            return [
                "I'll have your monthly property report prepared and sent to you by end of business today.",
                "Your property report is ready. I'm attaching the detailed financial summary for your review.",
                "Thank you for your request. The monthly report shows strong performance across all metrics."
            ];
        }
        
        if (context.includes('vendor') || context.includes('quote')) {
            return [
                "Thank you for your quote. I'll review the proposal and get back to you within 2 business days.",
                "I appreciate the detailed quote. I'd like to schedule a meeting to discuss the terms and timeline.",
                "Your proposal looks comprehensive. I'll need to review this with our team and will respond shortly."
            ];
        }
        
        return [
            "Thank you for your email. I'll review your request and respond as soon as possible.",
            "I've received your message and will address your concerns promptly.",
            "Thank you for reaching out. I'll look into this matter and get back to you soon."
        ];
    };

    const generateAIResponse = async (originalEmail) => {
        const suggestions = await getAIEmailSuggestions(originalEmail.body + ' ' + originalEmail.subject);
        setComposeData(prev => ({
            ...prev,
            aiSuggestions: suggestions
        }));
    };

    const useAISuggestion = (suggestion) => {
        setComposeData(prev => ({
            ...prev,
            body: suggestion + prev.body
        }));
    };

    const smartCompose = async (prompt) => {
        // AI email composition based on prompt
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const templates = {
            'maintenance update': {
                subject: 'Maintenance Update - Unit [UNIT_NUMBER]',
                body: `Dear [TENANT_NAME],

I wanted to update you on the maintenance request you submitted. Our team has completed the necessary repairs and everything should be working properly now.

If you notice any further issues, please don't hesitate to reach out to us immediately.

Thank you for your patience and for being a valued resident.

Best regards,
${userName}
Property Management`
            },
            'rent reminder': {
                subject: 'Friendly Rent Payment Reminder',
                body: `Dear [TENANT_NAME],

This is a friendly reminder that your rent payment for [PROPERTY_NAME], Unit [UNIT_NUMBER] is due on [DUE_DATE].

If you have already submitted your payment, please disregard this message. If you need assistance setting up automatic payments or have any questions, please contact our office.

Thank you for being a responsible tenant.

Best regards,
${userName}
Property Management`
            },
            'owner report': {
                subject: 'Monthly Property Report - [PROPERTY_NAME]',
                body: `Dear [OWNER_NAME],

Please find attached your monthly property report for [PROPERTY_NAME]. The report includes:

• Rental income and expenses
• Maintenance activities
• Occupancy status
• Financial summary

If you have any questions about the report or would like to discuss your property's performance, please feel free to contact me.

Best regards,
${userName}
Property Management`
            }
        };
        
        const template = templates[prompt.toLowerCase()] || {
            subject: 'Property Management Communication',
            body: `Dear [RECIPIENT_NAME],

Thank you for your message. I'll address your inquiry promptly and ensure you receive the assistance you need.

Best regards,
${userName}
Property Management`
        };
        
        setComposeData(prev => ({
            ...prev,
            subject: template.subject,
            body: template.body
        }));
    };

    const sendEmail = async () => {
        try {
            // Log email in conversation system
            window.ConversationLogService?.logConversation({
                type: 'email',
                participantId: composeData.to,
                participantName: composeData.to.split('@')[0],
                participantType: 'external',
                propertyId: composeData.propertyContext,
                content: `Subject: ${composeData.subject}\n\n${composeData.body}`,
                channel: 'email_system',
                isInbound: false,
                metadata: {
                    emailPriority: composeData.priority,
                    hasAttachments: composeData.attachments.length > 0,
                    isHtml: composeData.isHtml
                }
            });

            // Simulate sending
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            window.showNotification?.('success', 'Email sent successfully');
            setShowCompose(false);
            loadEmails();
        } catch (error) {
            console.error('Error sending email:', error);
            window.showNotification?.('error', 'Failed to send email');
        }
    };

    const markAsRead = (emailId, isRead = true) => {
        setEmails(prev => prev.map(email => 
            email.id === emailId ? { ...email, isRead } : email
        ));
    };

    const toggleStar = (emailId) => {
        setEmails(prev => prev.map(email => 
            email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
        ));
    };

    const formatTimeAgo = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffHours < 1) return 'just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    return (
        <div className="ai-email-system">
            {/* Header */}
            <div className="email-header">
                <div className="header-content">
                    <h2>
                        <i className="fas fa-envelope"></i>
                        Smart Email
                    </h2>
                    <p>AI-powered email management for {userName}</p>
                </div>
                <div className="header-actions">
                    <button className="compose-btn" onClick={composeEmail}>
                        <i className="fas fa-pen"></i>
                        Compose
                    </button>
                    <button 
                        className="ai-assistant-btn"
                        onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
                    >
                        <i className="fas fa-robot"></i>
                        AI Help
                    </button>
                </div>
            </div>

            <div className="email-container">
                {/* Sidebar */}
                <div className="email-sidebar">
                    <div className="folders-section">
                        <h3>Folders</h3>
                        <div className="folder-list">
                            {[
                                { id: 'inbox', name: 'Inbox', icon: 'fa-inbox', count: emails.filter(e => !e.isRead).length },
                                { id: 'starred', name: 'Starred', icon: 'fa-star', count: emails.filter(e => e.isStarred).length },
                                { id: 'sent', name: 'Sent', icon: 'fa-paper-plane', count: 0 },
                                { id: 'drafts', name: 'Drafts', icon: 'fa-file-alt', count: 0 },
                                { id: 'archive', name: 'Archive', icon: 'fa-archive', count: 0 }
                            ].map(folder => (
                                <button
                                    key={folder.id}
                                    className={`folder-item ${selectedFolder === folder.id ? 'active' : ''}`}
                                    onClick={() => setSelectedFolder(folder.id)}
                                >
                                    <i className={`fas ${folder.icon}`}></i>
                                    <span>{folder.name}</span>
                                    {folder.count > 0 && <span className="folder-count">{folder.count}</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="labels-section">
                        <h3>Labels</h3>
                        <div className="label-list">
                            {['maintenance', 'tenant', 'owner', 'vendor', 'reports', 'contracts'].map(label => (
                                <button key={label} className="label-item">
                                    <span className={`label-color ${label}`}></span>
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Email List */}
                <div className="email-list">
                    <div className="list-header">
                        <div className="search-container">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search emails..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="list-actions">
                            <button className="action-btn">
                                <i className="fas fa-sync"></i>
                            </button>
                            <button className="action-btn">
                                <i className="fas fa-cog"></i>
                            </button>
                        </div>
                    </div>

                    <div className="emails-container">
                        {loading ? (
                            <div className="loading-state">
                                <i className="fas fa-spinner fa-spin"></i>
                                <p>Loading emails...</p>
                            </div>
                        ) : emails.length === 0 ? (
                            <div className="empty-state">
                                <i className="fas fa-envelope-open"></i>
                                <h3>No emails in {selectedFolder}</h3>
                                <p>Your {selectedFolder} is empty</p>
                            </div>
                        ) : (
                            emails
                                .filter(email => 
                                    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    email.from.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    email.body.toLowerCase().includes(searchQuery.toLowerCase())
                                )
                                .map(email => (
                                    <EmailItem
                                        key={email.id}
                                        email={email}
                                        selected={selectedEmail?.id === email.id}
                                        onClick={() => {
                                            setSelectedEmail(email);
                                            markAsRead(email.id);
                                        }}
                                        onStar={() => toggleStar(email.id)}
                                        onReply={() => replyToEmail(email)}
                                        formatTimeAgo={formatTimeAgo}
                                        getPriorityColor={getPriorityColor}
                                    />
                                ))
                        )}
                    </div>
                </div>

                {/* Email Detail */}
                <div className="email-detail">
                    {selectedEmail ? (
                        <EmailDetail
                            email={selectedEmail}
                            onReply={() => replyToEmail(selectedEmail)}
                            onGenerateAI={() => generateAIResponse(selectedEmail)}
                            formatTimeAgo={formatTimeAgo}
                            getPriorityColor={getPriorityColor}
                        />
                    ) : (
                        <div className="no-email-selected">
                            <i className="fas fa-envelope-open-text"></i>
                            <h3>Select an email</h3>
                            <p>Choose an email from the list to read</p>
                        </div>
                    )}
                </div>

                {/* AI Assistant Panel */}
                {aiAssistantOpen && (
                    <div className="ai-email-panel">
                        <AIEmailAssistant
                            onClose={() => setAiAssistantOpen(false)}
                            onSmartCompose={smartCompose}
                            userProperties={userProperties}
                        />
                    </div>
                )}
            </div>

            {/* Compose Modal */}
            {showCompose && (
                <EmailComposeModal
                    composeData={composeData}
                    setComposeData={setComposeData}
                    onSend={sendEmail}
                    onClose={() => setShowCompose(false)}
                    onGenerateAI={generateAIResponse}
                    userProperties={userProperties}
                />
            )}
        </div>
    );
};

// Email Item Component
const EmailItem = ({ email, selected, onClick, onStar, onReply, formatTimeAgo, getPriorityColor }) => {
    return (
        <div 
            className={`email-item ${selected ? 'selected' : ''} ${!email.isRead ? 'unread' : ''}`}
            onClick={onClick}
        >
            <div className="email-checkbox">
                <input type="checkbox" />
            </div>
            <div className="email-star" onClick={(e) => { e.stopPropagation(); onStar(); }}>
                <i className={`${email.isStarred ? 'fas' : 'far'} fa-star`}></i>
            </div>
            <div className="email-from">
                <span className="from-name">{email.from.name}</span>
                <span className="from-email">{email.from.email}</span>
            </div>
            <div className="email-content">
                <div className="email-subject-line">
                    <span className="email-subject">{email.subject}</span>
                    {email.priority !== 'normal' && (
                        <span 
                            className="priority-indicator"
                            style={{ color: getPriorityColor(email.priority) }}
                        >
                            <i className="fas fa-exclamation"></i>
                        </span>
                    )}
                </div>
                <div className="email-preview">{email.body.substring(0, 100)}...</div>
                <div className="email-labels">
                    {email.labels.map(label => (
                        <span key={label} className={`email-label ${label}`}>{label}</span>
                    ))}
                </div>
            </div>
            <div className="email-meta">
                <span className="email-time">{formatTimeAgo(email.date)}</span>
                {email.hasAttachments && <i className="fas fa-paperclip"></i>}
                <div className="email-actions">
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); onReply(); }}>
                        <i className="fas fa-reply"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Email Detail Component
const EmailDetail = ({ email, onReply, onGenerateAI, formatTimeAgo, getPriorityColor }) => {
    return (
        <div className="email-detail-view">
            <div className="detail-header">
                <div className="email-subject-header">
                    <h2>{email.subject}</h2>
                    {email.priority !== 'normal' && (
                        <span 
                            className="priority-badge"
                            style={{ backgroundColor: getPriorityColor(email.priority) }}
                        >
                            {email.priority}
                        </span>
                    )}
                </div>
                <div className="detail-actions">
                    <button className="detail-action-btn" onClick={onReply}>
                        <i className="fas fa-reply"></i>
                        Reply
                    </button>
                    <button className="detail-action-btn" onClick={onGenerateAI}>
                        <i className="fas fa-robot"></i>
                        AI Suggest
                    </button>
                </div>
            </div>

            <div className="email-participants">
                <div className="participant">
                    <strong>From:</strong> {email.from.name} &lt;{email.from.email}&gt;
                </div>
                <div className="participant">
                    <strong>To:</strong> {email.to.map(t => `${t.name} <${t.email}>`).join(', ')}
                </div>
                <div className="participant">
                    <strong>Date:</strong> {new Date(email.date).toLocaleString()}
                </div>
                {email.propertyName && (
                    <div className="participant">
                        <strong>Property:</strong> {email.propertyName}
                    </div>
                )}
            </div>

            <div className="email-body">
                <div dangerouslySetInnerHTML={{ __html: email.body.replace(/\n/g, '<br>') }} />
            </div>

            {email.hasAttachments && (
                <div className="email-attachments">
                    <h4>Attachments</h4>
                    <div className="attachment-list">
                        <div className="attachment-item">
                            <i className="fas fa-file-pdf"></i>
                            <span>quote_hvac_maintenance.pdf</span>
                            <button className="download-btn">
                                <i className="fas fa-download"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// AI Email Assistant Component
const AIEmailAssistant = ({ onClose, onSmartCompose, userProperties }) => {
    const [prompt, setPrompt] = React.useState('');
    
    const quickTemplates = [
        'maintenance update',
        'rent reminder',
        'owner report',
        'lease renewal',
        'vendor response',
        'tenant welcome'
    ];
    
    return (
        <div className="ai-email-assistant">
            <div className="assistant-header">
                <h3>
                    <i className="fas fa-robot"></i>
                    AI Email Assistant
                </h3>
                <button className="close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <div className="assistant-content">
                <div className="quick-templates">
                    <h4>Quick Templates</h4>
                    <div className="template-grid">
                        {quickTemplates.map(template => (
                            <button
                                key={template}
                                className="template-btn"
                                onClick={() => onSmartCompose(template)}
                            >
                                {template.replace('-', ' ').toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="custom-prompt">
                    <h4>Custom Email</h4>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the email you want to compose..."
                        rows="3"
                    />
                    <button 
                        className="generate-btn"
                        onClick={() => onSmartCompose(prompt)}
                        disabled={!prompt.trim()}
                    >
                        <i className="fas fa-magic"></i>
                        Generate Email
                    </button>
                </div>
                
                <div className="ai-tips">
                    <h4>AI Tips</h4>
                    <ul>
                        <li>I can help draft professional responses</li>
                        <li>Generate templates for common scenarios</li>
                        <li>Suggest tone and language improvements</li>
                        <li>Auto-fill property and tenant information</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

// Email Compose Modal Component
const EmailComposeModal = ({ composeData, setComposeData, onSend, onClose, onGenerateAI, userProperties }) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    
    const handleSend = async () => {
        setIsProcessing(true);
        await onSend();
        setIsProcessing(false);
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="email-compose-modal" onClick={(e) => e.stopPropagation()}>
                <div className="compose-header">
                    <h3>Compose Email</h3>
                    <div className="compose-actions">
                        <button className="ai-help-btn" onClick={() => onGenerateAI({ subject: composeData.subject, body: composeData.body })}>
                            <i className="fas fa-robot"></i>
                            AI Help
                        </button>
                        <button className="close-btn" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div className="compose-form">
                    <div className="form-row">
                        <label>To:</label>
                        <input
                            type="email"
                            value={composeData.to}
                            onChange={(e) => setComposeData(prev => ({ ...prev, to: e.target.value }))}
                            placeholder="recipient@example.com"
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-row">
                        <label>Subject:</label>
                        <input
                            type="text"
                            value={composeData.subject}
                            onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Email subject"
                            className="form-input"
                        />
                    </div>
                    
                    <div className="form-row">
                        <label>Property Context:</label>
                        <select
                            value={composeData.propertyContext}
                            onChange={(e) => setComposeData(prev => ({ ...prev, propertyContext: e.target.value }))}
                            className="form-select"
                        >
                            <option value="">Select property...</option>
                            {userProperties.map(property => (
                                <option key={property.id} value={property.id}>
                                    {property.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-row">
                        <label>Message:</label>
                        <textarea
                            value={composeData.body}
                            onChange={(e) => setComposeData(prev => ({ ...prev, body: e.target.value }))}
                            placeholder="Type your message..."
                            rows="12"
                            className="form-textarea"
                        />
                    </div>
                    
                    {composeData.aiSuggestions.length > 0 && (
                        <div className="ai-suggestions">
                            <h4>AI Suggestions:</h4>
                            {composeData.aiSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="suggestion-btn"
                                    onClick={() => {
                                        setComposeData(prev => ({ ...prev, body: suggestion }));
                                    }}
                                >
                                    {suggestion.substring(0, 80)}...
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="compose-footer">
                    <div className="footer-left">
                        <button className="attach-btn">
                            <i className="fas fa-paperclip"></i>
                            Attach
                        </button>
                        <select
                            value={composeData.priority}
                            onChange={(e) => setComposeData(prev => ({ ...prev, priority: e.target.value }))}
                            className="priority-select"
                        >
                            <option value="low">Low Priority</option>
                            <option value="normal">Normal</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                    <div className="footer-right">
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button 
                            className="btn-primary"
                            onClick={handleSend}
                            disabled={!composeData.to || !composeData.subject || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane"></i>
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.AIEmailSystem = AIEmailSystem;