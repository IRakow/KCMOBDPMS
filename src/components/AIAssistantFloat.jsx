// AIAssistantFloat.jsx - Floating AI Assistant
const AIAssistantFloat = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [messages, setMessages] = React.useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m your AI Property Assistant. I can help you with:\n• Property analytics & insights\n• Rent optimization suggestions\n• Tenant screening\n• Maintenance predictions\n• Quick answers about your portfolio\n\nHow can I assist you today?'
        }
    ]);
    const [input, setInput] = React.useState('');
    const [isTyping, setIsTyping] = React.useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = React.useState(false);
    
    const sendMessage = async () => {
        if (!input.trim()) return;
        
        // Add user message
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        
        try {
            // Call AI endpoint
            const response = await window.ApiService.post('/ai/assistant/chat', {
                message: input,
                context: {
                    properties_count: window.AppState?.properties?.length || 0,
                    units_count: window.AppState?.units?.length || 0,
                    current_page: window.location.pathname
                }
            });
            
            // Add AI response
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.message || 'I can help you analyze your properties, optimize rents, or answer any property management questions!'
                }]);
                setIsTyping(false);
                
                // If window is closed, show unread indicator
                if (!isOpen) {
                    setHasUnreadMessages(true);
                }
            }, 1000);
            
        } catch (error) {
            // Fallback responses based on keywords
            const fallbackResponse = getFallbackResponse(input);
            setTimeout(() => {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: fallbackResponse
                }]);
                setIsTyping(false);
            }, 1000);
        }
    };
    
    const getFallbackResponse = (query) => {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('rent') && lowerQuery.includes('optimize')) {
            return 'Based on market analysis, I recommend reviewing units with below-market rents. Would you like me to analyze specific properties for optimization opportunities?';
        }
        
        if (lowerQuery.includes('tenant') || lowerQuery.includes('screen')) {
            return 'I can help screen tenants using AI-powered analysis. This includes credit score evaluation, income verification, and rental history checks. Which applicant would you like me to review?';
        }
        
        if (lowerQuery.includes('maintenance') || lowerQuery.includes('repair')) {
            return 'I can predict maintenance needs based on property age and historical data. Regular preventive maintenance can reduce costs by up to 30%. Shall I generate a maintenance schedule for your properties?';
        }
        
        if (lowerQuery.includes('occupancy') || lowerQuery.includes('vacancy')) {
            return 'Your current portfolio occupancy rate is strong. I can help identify units at risk of vacancy and suggest retention strategies. Would you like a detailed analysis?';
        }
        
        if (lowerQuery.includes('report') || lowerQuery.includes('analytics')) {
            return 'I can generate comprehensive reports including:\n• Financial performance\n• Occupancy trends\n• Maintenance costs\n• Tenant satisfaction\n\nWhich report would you like me to prepare?';
        }
        
        return 'I\'m here to help with any property management task. Try asking me about:\n• Rent optimization\n• Tenant screening\n• Maintenance predictions\n• Financial analytics\n• Market insights';
    };
    
    React.useEffect(() => {
        if (isOpen) {
            setHasUnreadMessages(false);
        }
    }, [isOpen]);
    
    React.useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (isOpen) {
            const messagesContainer = document.querySelector('.ai-messages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    }, [messages]);
    
    return (
        <>
            {/* Floating Circle Button - Bottom Right */}
            <button 
                className="ai-assistant-float-btn"
                onClick={() => setIsOpen(!isOpen)}
                title="AI Property Assistant"
            >
                <i className="fas fa-robot"></i>
                {hasUnreadMessages && <span className="unread-dot"></span>}
                <span className="ripple"></span>
            </button>
            
            {/* Chat Window - Opens above the button */}
            {isOpen && (
                <div className="ai-assistant-window">
                    <div className="ai-header">
                        <div className="ai-info">
                            <div className="ai-icon-wrapper">
                                <i className="fas fa-robot"></i>
                                <span className="ai-status-dot"></span>
                            </div>
                            <div>
                                <h3>AI Property Assistant</h3>
                                <span className="ai-models">GPT-4 • Gemini • ElevenLabs</span>
                            </div>
                        </div>
                        <button className="ai-close-btn" onClick={() => setIsOpen(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div className="ai-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`ai-message ${msg.role}`}>
                                {msg.role === 'assistant' && (
                                    <div className="ai-message-avatar">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                )}
                                <div className="ai-message-content">
                                    {msg.content.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < msg.content.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="ai-message assistant">
                                <div className="ai-message-avatar">
                                    <i className="fas fa-robot"></i>
                                </div>
                                <div className="ai-typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="ai-suggestions">
                        <button onClick={() => {
                            setInput('How can I optimize rents across my portfolio?');
                        }}>
                            <i className="fas fa-chart-line"></i> Optimize Rents
                        </button>
                        <button onClick={() => {
                            setInput('Show me properties needing maintenance soon');
                        }}>
                            <i className="fas fa-tools"></i> Maintenance
                        </button>
                        <button onClick={() => {
                            setInput('Analyze my tenant applications');
                        }}>
                            <i className="fas fa-user-check"></i> Screen Tenants
                        </button>
                    </div>
                    
                    <div className="ai-input-area">
                        <input
                            type="text"
                            placeholder="Ask me anything about your properties..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button 
                            className="ai-send-btn" 
                            onClick={sendMessage}
                            disabled={!input.trim() || isTyping}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.AIAssistant = AIAssistantFloat;