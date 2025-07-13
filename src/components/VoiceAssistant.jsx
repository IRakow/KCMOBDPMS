const VoiceAssistant = () => {
    const [isListening, setIsListening] = React.useState(false);
    const [transcript, setTranscript] = React.useState('');
    const [messages, setMessages] = React.useState([]);
    const [isProcessing, setIsProcessing] = React.useState(false);
    
    // Initialize speech recognition
    const recognition = React.useMemo(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            
            recognition.onresult = (event) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript;
                setTranscript(transcript);
                
                // If final result, process it
                if (event.results[current].isFinal) {
                    processVoiceCommand(transcript);
                }
            };
            
            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
            
            return recognition;
        }
        return null;
    }, []);
    
    const processVoiceCommand = async (text) => {
        setIsProcessing(true);
        setTranscript('');
        
        try {
            // Add user message
            setMessages(prev => [...prev, { type: 'user', text }]);
            
            // For demo, use mock AI responses
            const response = await getMockAIResponse(text);
            
            // Add assistant message
            setMessages(prev => [...prev, 
                { type: 'assistant', text: response.message }
            ]);
            
            // Speak the response
            speak(response.message);
            
            // Execute any actions
            if (response.action) {
                executeAction(response.action);
            }
            
        } catch (error) {
            console.error('Voice processing error:', error);
            setMessages(prev => [...prev, 
                { type: 'assistant', text: 'Sorry, I couldn\'t process that command.' }
            ]);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const getMockAIResponse = async (text) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const lowerText = text.toLowerCase();
        
        // Navigation commands
        if (lowerText.includes('vacant units') || lowerText.includes('show me vacant')) {
            return {
                message: 'I\'ll show you all vacant units. Navigating to the units page with vacant filter applied.',
                action: { type: 'navigate', path: '/units', filters: { status: 'vacant' } }
            };
        }
        
        if (lowerText.includes('properties')) {
            return {
                message: 'Taking you to the properties page.',
                action: { type: 'navigate', path: '/properties' }
            };
        }
        
        if (lowerText.includes('maintenance') || lowerText.includes('work order')) {
            return {
                message: 'Opening the maintenance section.',
                action: { type: 'navigate', path: '/maintenance' }
            };
        }
        
        // Query commands
        if (lowerText.includes('occupancy rate')) {
            return {
                message: 'Your current occupancy rate is 87%. You have 156 occupied units out of 180 total units across all properties.'
            };
        }
        
        if (lowerText.includes('how many') && lowerText.includes('tenant')) {
            return {
                message: 'You currently have 156 active tenants across all your properties.'
            };
        }
        
        if (lowerText.includes('overdue payment')) {
            return {
                message: 'You have 3 overdue payments totaling $4,850. The tenants have been notified.'
            };
        }
        
        // Action commands
        if (lowerText.includes('create') && lowerText.includes('work order')) {
            return {
                message: 'I\'ll help you create a work order. Opening the create work order form now.',
                action: { type: 'openModal', modal: 'createWorkOrder' }
            };
        }
        
        // Default response
        return {
            message: 'I can help you navigate the system, check property statistics, or create new records. Try saying "Show me vacant units" or "What\'s the occupancy rate?"'
        };
    };
    
    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };
    
    const executeAction = (action) => {
        switch (action.type) {
            case 'navigate':
                // In a real app, you'd use proper routing
                window.location.href = action.path;
                break;
            case 'openModal':
                // Trigger modal opening event
                window.dispatchEvent(new CustomEvent('openModal', { detail: action.modal }));
                break;
            case 'filter':
                // Apply filters to current view
                window.dispatchEvent(new CustomEvent('applyFilters', { detail: action.filters }));
                break;
        }
    };
    
    const toggleListening = () => {
        if (!recognition) {
            alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }
        
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
            setMessages([]); // Clear previous messages
        }
        setIsListening(!isListening);
    };
    
    const clearMessages = () => {
        setMessages([]);
        setTranscript('');
    };
    
    return (
        <>
            {/* Floating Voice Button */}
            <div className="voice-assistant-button" onClick={toggleListening}>
                <div className={`voice-button ${isListening ? 'listening' : ''}`}>
                    <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                </div>
                {isListening && (
                    <div className="voice-ripple"></div>
                )}
            </div>
            
            {/* Voice Chat Interface */}
            {isListening && (
                <div className="voice-chat-panel">
                    <div className="voice-header">
                        <h3>AI Assistant</h3>
                        <div className="voice-header-actions">
                            <button onClick={clearMessages} title="Clear messages">
                                <i className="fas fa-trash"></i>
                            </button>
                            <button onClick={toggleListening}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="voice-messages">
                        {messages.length === 0 && (
                            <div className="voice-welcome">
                                <p>👋 Hi! I'm your AI assistant.</p>
                                <p>Try saying:</p>
                                <ul>
                                    <li>"Show me vacant units"</li>
                                    <li>"What's the occupancy rate?"</li>
                                    <li>"Create a work order"</li>
                                    <li>"Take me to properties"</li>
                                </ul>
                            </div>
                        )}
                        
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`voice-message ${msg.type}`}>
                                <div className="message-content">
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        
                        {isProcessing && (
                            <div className="voice-message assistant">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="voice-input">
                        <div className="waveform">
                            {isListening && <AudioWaveform />}
                        </div>
                        <p className="transcript">{transcript || 'Listening...'}</p>
                    </div>
                </div>
            )}
        </>
    );
};

// Audio Waveform Visualization
const AudioWaveform = () => {
    const canvasRef = React.useRef(null);
    
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let animationId;
        
        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw waveform bars
            const bars = 40;
            const barWidth = canvas.width / bars;
            
            for (let i = 0; i < bars; i++) {
                const height = Math.random() * canvas.height * 0.7 + canvas.height * 0.1;
                const x = i * barWidth;
                const y = (canvas.height - height) / 2;
                
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(x, y, barWidth - 2, height);
            }
            
            animationId = requestAnimationFrame(draw);
        };
        
        draw();
        
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, []);
    
    return <canvas ref={canvasRef} className="waveform-canvas" />;
};

// Export for use in other components
window.VoiceAssistant = VoiceAssistant;