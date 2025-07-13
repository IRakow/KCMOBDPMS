// AIShowingScheduler.jsx - Natural language showing scheduler
const AIShowingScheduler = ({ unitId = null, embedded = false }) => {
    const [showings, setShowings] = React.useState([]);
    const [chatMode, setChatMode] = React.useState(true);
    const [message, setMessage] = React.useState('');
    const [conversation, setConversation] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    
    const getAvailableTimes = () => {
        // Get available times for the next 7 days
        const times = [];
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            
            // Skip past dates
            if (i === 0 && date.getHours() >= 17) continue;
            
            // Add morning and afternoon slots
            ['10:00 AM', '2:00 PM', '4:00 PM'].forEach(time => {
                times.push({
                    date: date.toISOString().split('T')[0],
                    time: time,
                    available: true
                });
            });
        }
        return times;
    };
    
    const getAgentCalendars = () => {
        // In production, this would fetch real agent availability
        return [
            { agent_id: 'agent1', name: 'Sarah Miller', available: true },
            { agent_id: 'agent2', name: 'John Smith', available: true }
        ];
    };
    
    const handleScheduleRequest = async (request) => {
        setLoading(true);
        try {
            // Parse natural language like "I'd like to see unit 101 next Tuesday"
            const response = await window.ApiService.post('/api/ai/schedule-showing', {
                request: request,
                unit_id: unitId,
                available_times: getAvailableTimes(),
                agent_calendars: getAgentCalendars()
            });
            
            if (response.clarification_needed) {
                setConversation(prev => [...prev, 
                    { role: 'user', content: request },
                    { role: 'assistant', content: response.clarification_message, options: response.time_options }
                ]);
                return;
            }
            
            // Schedule the showing
            const showing = await window.ApiService.post('/api/showings', response.showing_details);
            
            // Send confirmation
            await window.ApiService.post('/api/ai/send-confirmation', {
                showing: showing,
                method: 'sms_and_email'
            });
            
            // Set follow-up
            await window.ApiService.post('/api/ai/schedule-followup', {
                showing_id: showing.id,
                delay_hours: 1 // Follow up 1 hour after showing
            });
            
            setConversation(prev => [...prev,
                { role: 'user', content: request },
                { 
                    role: 'assistant', 
                    content: `Perfect! I've scheduled your tour for ${showing.formatted_time}. You'll receive a confirmation shortly.`,
                    showing: showing
                }
            ]);
            
            window.Toast.success('Tour scheduled successfully!');
            
        } catch (error) {
            setConversation(prev => [...prev,
                { role: 'user', content: request },
                { 
                    role: 'assistant', 
                    content: "I'm sorry, I couldn't schedule that tour. Please try a different time or contact our office directly."
                }
            ]);
            window.Toast.error('Failed to schedule tour');
        } finally {
            setLoading(false);
            setMessage('');
        }
    };
    
    const handleTimeOptionClick = async (option) => {
        await handleScheduleRequest(`Schedule tour for ${option.date} at ${option.time}`);
    };
    
    return (
        <div className={`ai-showing-scheduler ${embedded ? 'embedded' : ''}`}>
            <div className="scheduler-header">
                <h3>
                    <i className="fas fa-calendar-alt"></i>
                    Schedule a Tour
                </h3>
                <button 
                    className="mode-toggle"
                    onClick={() => setChatMode(!chatMode)}
                >
                    <i className={`fas fa-${chatMode ? 'calendar' : 'comments'}`}></i>
                    {chatMode ? 'Calendar View' : 'Chat Mode'}
                </button>
            </div>
            
            {chatMode ? (
                <div className="chat-scheduler">
                    <div className="chat-intro">
                        <p>Just tell me when you'd like to visit! Try something like:</p>
                        <div className="example-messages">
                            <button onClick={() => setMessage("I'd like to see the unit tomorrow at 2pm")}>
                                "Tomorrow at 2pm"
                            </button>
                            <button onClick={() => setMessage("Can I schedule a tour for next Tuesday?")}>
                                "Next Tuesday"
                            </button>
                            <button onClick={() => setMessage("What times are available this weekend?")}>
                                "This weekend"
                            </button>
                        </div>
                    </div>
                    
                    <div className="chat-messages">
                        {conversation.map((msg, idx) => (
                            <div key={idx} className={`chat-message ${msg.role}`}>
                                <div className="message-content">
                                    {msg.content}
                                    {msg.options && (
                                        <div className="time-options">
                                            {msg.options.map((option, oidx) => (
                                                <button 
                                                    key={oidx}
                                                    onClick={() => handleTimeOptionClick(option)}
                                                    className="time-option"
                                                >
                                                    {option.date} at {option.time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {msg.showing && (
                                        <div className="showing-confirmation">
                                            <i className="fas fa-check-circle"></i>
                                            Tour confirmed for {msg.showing.formatted_time}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message assistant">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="e.g., 'I'd like to see unit 205 tomorrow at 3pm'"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && message.trim()) {
                                    handleScheduleRequest(message);
                                }
                            }}
                            disabled={loading}
                        />
                        <button 
                            onClick={() => message.trim() && handleScheduleRequest(message)}
                            disabled={loading || !message.trim()}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="calendar-scheduler">
                    <h4>Select a time slot:</h4>
                    <div className="time-slots-grid">
                        {getAvailableTimes().slice(0, 12).map((slot, idx) => (
                            <button 
                                key={idx}
                                className="time-slot"
                                onClick={() => handleScheduleRequest(`Schedule tour for ${slot.date} at ${slot.time}`)}
                            >
                                <div className="slot-date">
                                    {new Date(slot.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="slot-time">{slot.time}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.AIShowingScheduler = AIShowingScheduler;