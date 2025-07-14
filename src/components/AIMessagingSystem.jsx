// AIMessagingSystem.jsx - Universal AI-Powered Messaging for All User Types
const AIMessagingSystem = ({ userType, userId, userName, userProperties = [] }) => {
    const [conversations, setConversations] = React.useState([]);
    const [selectedConversation, setSelectedConversation] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [newMessage, setNewMessage] = React.useState('');
    const [isListening, setIsListening] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [showNewConversation, setShowNewConversation] = React.useState(false);
    const [aiAssistantOpen, setAiAssistantOpen] = React.useState(false);
    const [selectedProperty, setSelectedProperty] = React.useState('all');
    
    const recognitionRef = React.useRef(null);
    const logService = window.ConversationLogService;
    
    // Initialize speech recognition
    React.useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognitionRef.current = recognition;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setNewMessage(transcript);
                processAIMessage(transcript);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    React.useEffect(() => {
        loadConversations();
    }, [selectedProperty, userType, userId]);

    React.useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    const loadConversations = async () => {
        try {
            // Get conversations for current user filtered by property access
            const userConversations = logService?.searchConversations('', {
                participantType: userType,
                propertyId: selectedProperty !== 'all' ? selectedProperty : undefined
            }) || [];
            
            // Group by conversation participants and create conversation objects
            const conversationMap = new Map();
            
            userConversations.forEach(log => {
                const convKey = `${log.participantId}-${log.propertyId || 'general'}`;
                if (!conversationMap.has(convKey)) {
                    conversationMap.set(convKey, {
                        id: convKey,
                        participantId: log.participantId,
                        participantName: log.participantName,
                        participantType: log.participantType,
                        propertyId: log.propertyId,
                        propertyName: log.propertyName,
                        unitNumber: log.unitNumber,
                        lastMessage: log,
                        unreadCount: 0,
                        messageCount: 1
                    });
                } else {
                    const conv = conversationMap.get(convKey);
                    if (new Date(log.timestamp) > new Date(conv.lastMessage.timestamp)) {
                        conv.lastMessage = log;
                    }
                    conv.messageCount++;
                }
            });
            
            setConversations([...conversationMap.values()].sort((a, b) => 
                new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
            ));
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const loadMessages = async (conversationId) => {
        try {
            const conversationMessages = logService?.logs?.filter(log => 
                `${log.participantId}-${log.propertyId || 'general'}` === conversationId
            ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) || [];
            
            setMessages(conversationMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const processAIMessage = async (messageText) => {
        if (!messageText.trim()) return;

        setIsProcessing(true);
        
        try {
            // Log the user message
            const userMessage = logService?.logConversation({
                type: isListening ? 'voice' : 'text',
                participantId: userId,
                participantName: userName,
                participantType: userType,
                propertyId: selectedConversation?.propertyId,
                propertyName: selectedConversation?.propertyName,
                unitNumber: selectedConversation?.unitNumber,
                content: messageText,
                channel: 'ai_messaging_system',
                isInbound: true,
                metadata: {
                    voiceInput: isListening,
                    aiProcessed: true
                }
            });

            // Process with AI assistant
            const aiResponse = await getAIResponse(messageText, {
                userType,
                userName,
                propertyContext: selectedConversation,
                conversationHistory: messages.slice(-5) // Last 5 messages for context
            });

            // Log AI response
            logService?.logAIConversation({
                conversationType: isListening ? 'voice' : 'chat',
                userId,
                userName,
                userType,
                propertyContext: {
                    propertyId: selectedConversation?.propertyId,
                    propertyName: selectedConversation?.propertyName,
                    unitNumber: selectedConversation?.unitNumber
                },
                aiModel: 'messaging-assistant',
                prompt: messageText,
                response: aiResponse.message,
                metadata: {
                    intent: aiResponse.intent,
                    entities: aiResponse.entities,
                    confidence: aiResponse.confidence,
                    actions: aiResponse.actions
                }
            });

            // Execute any actions suggested by AI
            if (aiResponse.actions) {
                await executeAIActions(aiResponse.actions);
            }

            // Speak response if voice was used
            if (isListening && aiResponse.message) {
                await speakResponse(aiResponse.message);
            }

            // Refresh conversations and messages
            loadConversations();
            if (selectedConversation) {
                loadMessages(selectedConversation.id);
            }

        } catch (error) {
            console.error('Error processing AI message:', error);
        } finally {
            setIsProcessing(false);
            setNewMessage('');
        }
    };

    const getAIResponse = async (message, context) => {
        // Simulate AI processing - in production this would call your AI service
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const lowerMessage = message.toLowerCase();
        
        // Property management specific responses
        if (lowerMessage.includes('maintenance') || lowerMessage.includes('repair')) {
            return {
                message: "I understand you have a maintenance concern. I can help you create a maintenance request or connect you with the appropriate team. Would you like me to start a maintenance ticket for you?",
                intent: 'maintenance_request',
                entities: ['maintenance', 'repair'],
                confidence: 0.95,
                actions: ['suggest_maintenance_form']
            };
        }
        
        if (lowerMessage.includes('rent') || lowerMessage.includes('payment')) {
            return {
                message: "I can help you with rent and payment questions. Would you like me to check your payment history, set up automatic payments, or answer questions about payment methods?",
                intent: 'payment_inquiry',
                entities: ['rent', 'payment'],
                confidence: 0.92,
                actions: ['show_payment_options']
            };
        }
        
        if (lowerMessage.includes('lease') || lowerMessage.includes('renewal')) {
            return {
                message: "I can assist with lease-related questions including renewals, terms, and documentation. What specific information do you need about your lease?",
                intent: 'lease_inquiry',
                entities: ['lease', 'renewal'],
                confidence: 0.88,
                actions: ['show_lease_info']
            };
        }
        
        if (lowerMessage.includes('schedule') || lowerMessage.includes('appointment')) {
            return {
                message: "I can help you schedule appointments with property management, maintenance teams, or showings. What type of appointment would you like to schedule?",
                intent: 'scheduling',
                entities: ['schedule', 'appointment'],
                confidence: 0.90,
                actions: ['open_calendar']
            };
        }
        
        if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email')) {
            return {
                message: "I can help you get in touch with the right person. Are you looking to contact property management, maintenance, or someone else? I can also help you send a message through our system.",
                intent: 'contact_request',
                entities: ['contact', 'communication'],
                confidence: 0.87,
                actions: ['show_contacts']
            };
        }
        
        // General helpful response
        return {
            message: `Hello ${context.userName}! I'm your AI assistant for property management. I can help you with maintenance requests, rent payments, lease questions, scheduling appointments, and connecting you with the right people. What can I assist you with today?`,
            intent: 'general_assistance',
            entities: [],
            confidence: 0.75,
            actions: []
        };
    };

    const executeAIActions = async (actions) => {
        actions.forEach(action => {
            switch (action) {
                case 'suggest_maintenance_form':
                    // Could open maintenance request modal
                    console.log('AI suggests opening maintenance form');
                    break;
                case 'show_payment_options':
                    // Could show payment interface
                    console.log('AI suggests showing payment options');
                    break;
                case 'show_lease_info':
                    // Could display lease information
                    console.log('AI suggests showing lease information');
                    break;
                case 'open_calendar':
                    // Could open calendar/scheduling interface
                    console.log('AI suggests opening calendar');
                    break;
                case 'show_contacts':
                    // Could show contact directory
                    console.log('AI suggests showing contacts');
                    break;
            }
        });
    };

    const speakResponse = async (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    const sendTextMessage = () => {
        if (newMessage.trim()) {
            processAIMessage(newMessage);
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

    const getParticipantIcon = (type) => {
        const icons = {
            tenant: 'fa-user',
            owner: 'fa-building',
            vendor: 'fa-tools',
            admin: 'fa-user-shield',
            'property-manager': 'fa-clipboard-user',
            maintenance: 'fa-wrench'
        };
        return icons[type] || 'fa-user';
    };

    return (
        <div className="ai-messaging-system">
            {/* Header */}
            <div className="messaging-header">
                <div className="header-content">
                    <h2>
                        <i className="fas fa-robot"></i>
                        AI Assistant
                    </h2>
                    <p>Intelligent messaging for {userName}</p>
                </div>
                
                {/* Property Filter */}
                {userProperties.length > 1 && (
                    <div className="property-filter">
                        <select 
                            value={selectedProperty} 
                            onChange={(e) => setSelectedProperty(e.target.value)}
                            className="property-select"
                        >
                            <option value="all">All Properties</option>
                            {userProperties.map(property => (
                                <option key={property.id} value={property.id}>
                                    {property.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            
            <div className="messaging-container">
                {/* Conversations Sidebar */}
                <div className="conversations-sidebar">
                    <div className="sidebar-header">
                        <h3>Conversations</h3>
                        <button 
                            className="new-conversation-btn"
                            onClick={() => setShowNewConversation(true)}
                        >
                            <i className="fas fa-plus"></i>
                        </button>
                    </div>
                    
                    <div className="conversations-list">
                        {conversations.length === 0 ? (
                            <div className="empty-conversations">
                                <i className="fas fa-comments"></i>
                                <p>No conversations yet</p>
                                <p>Start a new conversation to get help!</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div 
                                    key={conv.id}
                                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedConversation(conv)}
                                >
                                    <div className={`participant-avatar ${conv.participantType}`}>
                                        <i className={`fas ${getParticipantIcon(conv.participantType)}`}></i>
                                    </div>
                                    <div className="conversation-info">
                                        <h4>{conv.participantName}</h4>
                                        <p className="property-info">
                                            {conv.propertyName} {conv.unitNumber && `• Unit ${conv.unitNumber}`}
                                        </p>
                                        <p className="last-message">
                                            {conv.lastMessage.content.substring(0, 50)}...
                                        </p>
                                        <span className="message-time">
                                            {formatTimeAgo(conv.lastMessage.timestamp)}
                                        </span>
                                    </div>
                                    {conv.unreadCount > 0 && (
                                        <span className="unread-badge">{conv.unreadCount}</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                {/* Chat Area */}
                <div className="chat-area">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="chat-header">
                                <div className="chat-participant">
                                    <div className={`participant-avatar ${selectedConversation.participantType}`}>
                                        <i className={`fas ${getParticipantIcon(selectedConversation.participantType)}`}></i>
                                    </div>
                                    <div className="participant-info">
                                        <h3>{selectedConversation.participantName}</h3>
                                        <p>{selectedConversation.propertyName} {selectedConversation.unitNumber && `• Unit ${selectedConversation.unitNumber}`}</p>
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <button 
                                        className="ai-assistant-btn"
                                        onClick={() => setAiAssistantOpen(!aiAssistantOpen)}
                                    >
                                        <i className="fas fa-robot"></i>
                                        AI Help
                                    </button>
                                </div>
                            </div>
                            
                            {/* Messages */}
                            <div className="messages-container">
                                {messages.length === 0 ? (
                                    <div className="empty-messages">
                                        <i className="fas fa-robot"></i>
                                        <h3>AI Assistant Ready</h3>
                                        <p>Start a conversation! I can help with:</p>
                                        <ul>
                                            <li>Maintenance requests</li>
                                            <li>Rent and payment questions</li>
                                            <li>Lease information</li>
                                            <li>Scheduling appointments</li>
                                            <li>Connecting with property staff</li>
                                        </ul>
                                    </div>
                                ) : (
                                    messages.map(message => (
                                        <div 
                                            key={message.id}
                                            className={`message ${message.participantId === userId ? 'sent' : 'received'} ${message.type === 'ai' ? 'ai-message' : ''}`}
                                        >
                                            <div className="message-content">
                                                {message.type === 'ai' && (
                                                    <div className="ai-indicator">
                                                        <i className="fas fa-robot"></i>
                                                        AI Assistant
                                                    </div>
                                                )}
                                                <p>{message.content}</p>
                                                <div className="message-meta">
                                                    <span className="message-time">
                                                        {formatTimeAgo(message.timestamp)}
                                                    </span>
                                                    {message.metadata?.voiceInput && (
                                                        <i className="fas fa-microphone voice-indicator"></i>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                
                                {isProcessing && (
                                    <div className="message received ai-message">
                                        <div className="message-content">
                                            <div className="ai-indicator">
                                                <i className="fas fa-robot"></i>
                                                AI Assistant
                                            </div>
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Message Input */}
                            <div className="message-input-container">
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendTextMessage()}
                                        placeholder="Type your message or speak..."
                                        className="message-input"
                                        disabled={isProcessing}
                                    />
                                    <div className="input-actions">
                                        <button 
                                            className={`voice-btn ${isListening ? 'listening' : ''}`}
                                            onClick={isListening ? stopListening : startListening}
                                            disabled={isProcessing}
                                        >
                                            <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                                        </button>
                                        <button 
                                            className="send-btn"
                                            onClick={sendTextMessage}
                                            disabled={!newMessage.trim() || isProcessing}
                                        >
                                            <i className="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                                {isListening && (
                                    <div className="listening-indicator">
                                        <div className="pulse-animation"></div>
                                        <span>Listening...</span>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="no-conversation-selected">
                            <i className="fas fa-robot"></i>
                            <h3>AI Assistant Ready</h3>
                            <p>Select a conversation or start a new one to get AI-powered help with property management tasks.</p>
                            <button 
                                className="start-conversation-btn"
                                onClick={() => setShowNewConversation(true)}
                            >
                                <i className="fas fa-plus"></i>
                                Start New Conversation
                            </button>
                        </div>
                    )}
                </div>
                
                {/* AI Assistant Panel */}
                {aiAssistantOpen && (
                    <div className="ai-assistant-panel">
                        <div className="panel-header">
                            <h3>
                                <i className="fas fa-robot"></i>
                                AI Assistant
                            </h3>
                            <button 
                                className="close-panel"
                                onClick={() => setAiAssistantOpen(false)}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="panel-content">
                            <div className="ai-suggestions">
                                <h4>Quick Actions</h4>
                                <div className="suggestion-buttons">
                                    <button 
                                        className="suggestion-btn"
                                        onClick={() => processAIMessage("I need help with a maintenance issue")}
                                    >
                                        <i className="fas fa-tools"></i>
                                        Maintenance Request
                                    </button>
                                    <button 
                                        className="suggestion-btn"
                                        onClick={() => processAIMessage("I have a question about my rent payment")}
                                    >
                                        <i className="fas fa-dollar-sign"></i>
                                        Payment Help
                                    </button>
                                    <button 
                                        className="suggestion-btn"
                                        onClick={() => processAIMessage("I need to schedule an appointment")}
                                    >
                                        <i className="fas fa-calendar-check"></i>
                                        Schedule Meeting
                                    </button>
                                    <button 
                                        className="suggestion-btn"
                                        onClick={() => processAIMessage("I have a question about my lease")}
                                    >
                                        <i className="fas fa-file-contract"></i>
                                        Lease Question
                                    </button>
                                </div>
                            </div>
                            
                            <div className="ai-capabilities">
                                <h4>I can help you with:</h4>
                                <ul>
                                    <li>Creating and tracking maintenance requests</li>
                                    <li>Answering rent and payment questions</li>
                                    <li>Providing lease information and renewal help</li>
                                    <li>Scheduling appointments with property staff</li>
                                    <li>Connecting you with the right people</li>
                                    <li>Property information and amenities</li>
                                    <li>Emergency contact information</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* New Conversation Modal */}
            {showNewConversation && (
                <NewConversationModal 
                    userType={userType}
                    userProperties={userProperties}
                    onClose={() => setShowNewConversation(false)}
                    onConversationCreated={(conversation) => {
                        setSelectedConversation(conversation);
                        setShowNewConversation(false);
                        loadConversations();
                    }}
                />
            )}
        </div>
    );
};

// New Conversation Modal Component
const NewConversationModal = ({ userType, userProperties, onClose, onConversationCreated }) => {
    const [selectedRecipientType, setSelectedRecipientType] = React.useState('');
    const [selectedProperty, setSelectedProperty] = React.useState('');
    const [subject, setSubject] = React.useState('');
    
    const recipientTypes = {
        tenant: ['property-manager', 'admin', 'maintenance'],
        owner: ['property-manager', 'admin', 'tenant'],
        'property-manager': ['tenant', 'owner', 'vendor', 'maintenance', 'admin'],
        admin: ['tenant', 'owner', 'property-manager', 'vendor', 'maintenance'],
        vendor: ['property-manager', 'admin', 'maintenance'],
        maintenance: ['tenant', 'property-manager', 'admin', 'vendor']
    };
    
    const startConversation = () => {
        if (selectedRecipientType && selectedProperty) {
            const conversation = {
                id: `new-${Date.now()}`,
                participantType: selectedRecipientType,
                participantName: selectedRecipientType.replace('-', ' ').toUpperCase(),
                propertyId: selectedProperty,
                propertyName: userProperties.find(p => p.id === selectedProperty)?.name || 'Property',
                subject: subject || 'New Conversation'
            };
            onConversationCreated(conversation);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="new-conversation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Start New Conversation</h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-content">
                    <div className="form-group">
                        <label>Who would you like to message?</label>
                        <select 
                            value={selectedRecipientType}
                            onChange={(e) => setSelectedRecipientType(e.target.value)}
                            className="form-select"
                        >
                            <option value="">Select recipient type...</option>
                            {(recipientTypes[userType] || []).map(type => (
                                <option key={type} value={type}>
                                    {type.replace('-', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Select Property</label>
                        <select 
                            value={selectedProperty}
                            onChange={(e) => setSelectedProperty(e.target.value)}
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
                    
                    <div className="form-group">
                        <label>Subject (optional)</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="What's this about?"
                            className="form-input"
                        />
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button 
                        className="btn-primary"
                        onClick={startConversation}
                        disabled={!selectedRecipientType || !selectedProperty}
                    >
                        Start Conversation
                    </button>
                </div>
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.AIMessagingSystem = AIMessagingSystem;