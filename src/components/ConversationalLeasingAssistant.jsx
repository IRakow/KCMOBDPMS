// ConversationalLeasingAssistant.jsx - 24/7 AI Leasing Agent
const ConversationalLeasingAssistant = ({ embedded = false, managerView = false }) => {
    const [conversations, setConversations] = React.useState([]);
    const [activeConversation, setActiveConversation] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    
    React.useEffect(() => {
        if (managerView) {
            loadAllConversations();
        } else {
            startNewConversation();
        }
    }, [managerView]);
    
    const loadAllConversations = async () => {
        try {
            const data = await window.ApiService.get('/api/ai/conversations');
            setConversations(data || []);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };
    
    const startNewConversation = async () => {
        try {
            const response = await window.ApiService.post('/api/ai/leasing-assistant/start', {
                type: 'prospect_inquiry',
                source: embedded ? 'website' : 'portal'
            });
            
            setActiveConversation(response.conversation_id);
            setMessages([{
                role: 'assistant',
                content: "Hi! I'm your AI leasing assistant. I'm here 24/7 to help you find your perfect home. What can I help you with today?",
                suggestions: [
                    "Show me available units",
                    "Schedule a tour",
                    "What's included in rent?",
                    "Pet policy?"
                ]
            }]);
        } catch (error) {
            console.error('Failed to start conversation:', error);
        }
    };
    
    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        
        const userMsg = { role: 'user', content: input };
        setMessages([...messages, userMsg]);
        setInput('');
        setLoading(true);
        
        try {
            const response = await window.ApiService.post('/api/ai/leasing-assistant/message', {
                conversation_id: activeConversation,
                message: input,
                context: {
                    available_units: window.AppState.getState('available_units') || [],
                    user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            });
            
            const aiMsg = {
                role: 'assistant',
                content: response.message,
                actions: response.actions,
                suggestions: response.suggestions
            };
            
            setMessages(prev => [...prev, aiMsg]);
            
            // Handle actions (schedule tour, send application, etc.)
            if (response.actions) {
                handleAIActions(response.actions);
            }
            
        } catch (error) {
            console.error('AI error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm sorry, I encountered an error. Please try again or contact our leasing office directly."
            }]);
        } finally {
            setLoading(false);
        }
    };
    
    const handleAIActions = async (actions) => {
        for (const action of actions) {
            switch (action.type) {
                case 'schedule_showing':
                    await scheduleShowing(action.data);
                    break;
                case 'send_application':
                    await sendApplication(action.data);
                    break;
                case 'notify_manager':
                    await notifyManager(action.data);
                    break;
            }
        }
    };
    
    const scheduleShowing = async (data) => {
        try {
            await window.ApiService.post('/api/showings', data);
            window.Toast.success('Tour scheduled successfully!');
        } catch (error) {
            window.Toast.error('Failed to schedule tour');
        }
    };
    
    const sendApplication = async (data) => {
        try {
            await window.ApiService.post('/api/applications/send', data);
            window.Toast.success('Application sent!');
        } catch (error) {
            window.Toast.error('Failed to send application');
        }
    };
    
    const notifyManager = async (data) => {
        try {
            await window.ApiService.post('/api/notifications/manager', data);
        } catch (error) {
            console.error('Failed to notify manager:', error);
        }
    };
    
    const generateSuggestedResponse = (conversationId) => {
        // In a real implementation, this would use AI to suggest responses
        return "Thank you for your interest! I'd be happy to help you schedule a tour...";
    };
    
    if (managerView) {
        return (
            <div className="manager-conversation-viewer">
                <h2>AI Leasing Conversations</h2>
                <div className="conversation-list">
                    {conversations.map(conv => (
                        <div 
                            key={conv.id}
                            className="conversation-item"
                            onClick={() => setActiveConversation(conv.id)}
                        >
                            <div className="conv-header">
                                <span className="conv-prospect">{conv.prospect_name || 'Anonymous'}</span>
                                <span className="conv-time">{new Date(conv.created_at).toLocaleString()}</span>
                            </div>
                            <div className="conv-preview">{conv.last_message}</div>
                            <div className="conv-status">
                                {conv.status === 'needs_human' && (
                                    <span className="badge urgent">Needs Response</span>
                                )}
                                {conv.scheduled_showing && (
                                    <span className="badge success">Tour Scheduled</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                {activeConversation && (
                    <div className="conversation-detail">
                        <h3>Conversation Transcript</h3>
                        <div className="ai-suggested-response">
                            <h4>AI Suggested Response:</h4>
                            <textarea 
                                defaultValue={generateSuggestedResponse(activeConversation)}
                            />
                            <button className="send-response">Send to Prospect</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className={`leasing-assistant ${embedded ? 'embedded' : 'full'}`}>
            <div className="assistant-header">
                <div className="assistant-info">
                    <div className="ai-avatar">
                        <i className="fas fa-robot"></i>
                    </div>
                    <div>
                        <h3>AI Leasing Assistant</h3>
                        <span className="status">Available 24/7</span>
                    </div>
                </div>
            </div>
            
            <div className="assistant-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}`}>
                        {msg.role === 'assistant' && (
                            <div className="ai-avatar-small">
                                <i className="fas fa-robot"></i>
                            </div>
                        )}
                        <div className="message-content">
                            {msg.content}
                            {msg.suggestions && (
                                <div className="quick-replies">
                                    {msg.suggestions.map((suggestion, sidx) => (
                                        <button 
                                            key={sidx}
                                            onClick={() => {
                                                setInput(suggestion);
                                                sendMessage();
                                            }}
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="message assistant">
                        <div className="ai-avatar-small">
                            <i className="fas fa-robot"></i>
                        </div>
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="assistant-input">
                <input
                    type="text"
                    placeholder="Ask about units, schedule tours, application process..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.ConversationalLeasingAssistant = ConversationalLeasingAssistant;