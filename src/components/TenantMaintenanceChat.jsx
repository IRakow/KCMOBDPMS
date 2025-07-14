// TenantMaintenanceChat.jsx - Speech-to-Speech Maintenance Conversations
const TenantMaintenanceChat = ({ property, unit, tenant, onRequestCreated }) => {
    const [isListening, setIsListening] = React.useState(false);
    const [isSpeaking, setIsSpeaking] = React.useState(false);
    const [conversation, setConversation] = React.useState([]);
    const [currentTranscript, setCurrentTranscript] = React.useState('');
    const [maintenanceContext, setMaintenanceContext] = React.useState({
        category: null,
        severity: null,
        details: {},
        photos: [],
        stage: 'greeting' // greeting, category, details, photos, confirmation
    });
    const [voiceEnabled, setVoiceEnabled] = React.useState(() => {
        // Check global silence mode first
        return window.silenceMode !== true;
    });
    const recognitionRef = React.useRef(null);
    const audioContextRef = React.useRef(null);

    // Initialize services
    const voiceService = React.useMemo(() => {
        return new (window.ElevenLabsVoiceService || window.MockElevenLabsVoiceService)();
    }, []);

    const visionService = React.useMemo(() => {
        return new (window.GeminiVisionService || window.MockGeminiVisionService)();
    }, []);

    // Initialize speech recognition
    React.useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognitionRef.current = recognition;

            recognition.onresult = handleSpeechResult;
            recognition.onerror = handleSpeechError;
            recognition.onend = () => setIsListening(false);
        }

        // Initialize audio context for voice activity detection
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Listen for silence mode changes
    React.useEffect(() => {
        const handleSilenceModeChange = (event) => {
            setVoiceEnabled(!event.detail);
            if (event.detail && isListening) {
                stopListening();
            }
        };

        window.addEventListener('silenceModeChanged', handleSilenceModeChange);
        return () => window.removeEventListener('silenceModeChanged', handleSilenceModeChange);
    }, [isListening]);

    // Start conversation
    React.useEffect(() => {
        startConversation();
    }, []);

    const startConversation = async () => {
        const greeting = `Hello ${tenant?.first_name || 'there'}! I'm your AI maintenance assistant. How can I help you today? You can tell me about any maintenance issues you're experiencing.`;
        
        addMessage('ai', greeting);
        if (voiceEnabled) {
            await speak(greeting);
        }
    };

    // Handle speech recognition results
    const handleSpeechResult = (event) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        
        if (event.results[current].isFinal) {
            setCurrentTranscript('');
            processUserInput(transcript);
        } else {
            setCurrentTranscript(transcript);
        }
    };

    const handleSpeechError = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
            addMessage('ai', "I didn't hear anything. Please try speaking again.");
        }
    };

    // Process user input
    const processUserInput = async (input) => {
        addMessage('user', input);
        setIsListening(false);

        // Log voice conversation in ConversationLogService
        window.ConversationLogService?.logConversation({
            type: 'voice',
            participantId: tenant?.id || 'anonymous',
            participantName: tenant?.name || 'Tenant',
            participantType: 'tenant',
            propertyName: property?.name || 'Unknown Property',
            unitNumber: unit?.number || '',
            content: input,
            channel: 'maintenance_chat',
            isInbound: true,
            metadata: {
                voiceTranscription: true,
                maintenanceStage: maintenanceContext.stage,
                category: maintenanceContext.category,
                severity: maintenanceContext.severity
            }
        });

        // Analyze input based on current stage
        const response = await analyzeInput(input);
        
        if (response.message) {
            addMessage('ai', response.message);
            
            // Log AI response
            window.ConversationLogService?.logAIConversation({
                conversationType: 'voice',
                userId: tenant?.id || 'anonymous',
                userName: tenant?.name || 'Tenant',
                userType: 'tenant',
                propertyContext: {
                    propertyId: property?.id,
                    propertyName: property?.name,
                    unitNumber: unit?.number
                },
                aiModel: 'maintenance-assistant',
                prompt: input,
                response: response.message,
                metadata: {
                    intent: 'maintenance_request',
                    entities: {
                        category: maintenanceContext.category,
                        severity: maintenanceContext.severity,
                        stage: maintenanceContext.stage
                    },
                    confidence: response.confidence || 0.9
                },
                conversationContext: maintenanceContext
            });
            
            if (voiceEnabled) {
                await speak(response.message);
            }
        }

        // Update context
        if (response.updateContext) {
            setMaintenanceContext(prev => ({
                ...prev,
                ...response.updateContext
            }));
        }

        // Auto-continue listening if not complete
        if (response.continueListening && voiceEnabled) {
            setTimeout(() => startListening(), 1000);
        }
    };

    // Analyze user input with AI
    const analyzeInput = async (input) => {
        const lowerInput = input.toLowerCase();
        const { stage } = maintenanceContext;

        // Category detection
        if (stage === 'greeting' || stage === 'category') {
            if (lowerInput.includes('leak') || lowerInput.includes('water') || lowerInput.includes('pipe')) {
                return {
                    message: "I understand you have a plumbing issue. Can you tell me more? Where is the leak located and how severe is it?",
                    updateContext: { category: 'plumbing', stage: 'details' },
                    continueListening: true
                };
            } else if (lowerInput.includes('electric') || lowerInput.includes('outlet') || lowerInput.includes('light')) {
                return {
                    message: "I see you're having an electrical issue. For your safety, can you describe what's happening? Are there any sparks, burning smells, or power outages?",
                    updateContext: { category: 'electrical', stage: 'details' },
                    continueListening: true
                };
            } else if (lowerInput.includes('heat') || lowerInput.includes('cool') || lowerInput.includes('ac') || lowerInput.includes('temperature')) {
                return {
                    message: "I understand you're having HVAC issues. Is your unit not cooling, not heating, or making unusual noises?",
                    updateContext: { category: 'hvac', stage: 'details' },
                    continueListening: true
                };
            } else if (lowerInput.includes('appliance') || lowerInput.includes('dishwasher') || lowerInput.includes('fridge')) {
                return {
                    message: "I see you have an appliance issue. Which appliance is having problems and what's happening with it?",
                    updateContext: { category: 'appliance', stage: 'details' },
                    continueListening: true
                };
            }
        }

        // Severity detection
        if (stage === 'details') {
            let severity = 'medium';
            let urgent = false;

            if (lowerInput.includes('emergency') || lowerInput.includes('flooding') || 
                lowerInput.includes('fire') || lowerInput.includes('danger')) {
                severity = 'emergency';
                urgent = true;
            } else if (lowerInput.includes('bad') || lowerInput.includes('severe') || 
                      lowerInput.includes('major')) {
                severity = 'high';
            } else if (lowerInput.includes('minor') || lowerInput.includes('small')) {
                severity = 'low';
            }

            if (urgent) {
                return {
                    message: "This sounds like an emergency! I'm immediately alerting our maintenance team. For your safety, please stay away from the affected area. Can you send me a photo of the issue?",
                    updateContext: { 
                        severity,
                        details: { description: input },
                        stage: 'photos'
                    },
                    continueListening: false
                };
            }

            return {
                message: "Thank you for the details. Would you be able to take a photo of the issue? This will help our team prepare the right tools and parts.",
                updateContext: { 
                    severity,
                    details: { description: input },
                    stage: 'photos'
                },
                continueListening: true
            };
        }

        // Photo stage
        if (stage === 'photos') {
            if (lowerInput.includes('yes') || lowerInput.includes('sure') || lowerInput.includes('okay')) {
                return {
                    message: "Great! Please use the camera button below to take or upload photos. I'll analyze them instantly to better understand the issue.",
                    updateContext: { stage: 'awaiting_photos' },
                    continueListening: false
                };
            } else if (lowerInput.includes('no') || lowerInput.includes('can\'t')) {
                return {
                    message: "No problem! I'll create the maintenance request with the information you've provided. Our team will assess the issue when they arrive. Is there anything else you'd like to add?",
                    updateContext: { stage: 'additional_info' },
                    continueListening: true
                };
            }
        }

        // Additional info
        if (stage === 'additional_info') {
            if (lowerInput.includes('no') || lowerInput.includes('that\'s all')) {
                return await createMaintenanceRequest();
            } else {
                return {
                    message: "I've noted that additional information. Let me create your maintenance request now.",
                    updateContext: { 
                        details: { 
                            ...maintenanceContext.details,
                            additionalNotes: input 
                        }
                    },
                    continueListening: false
                };
            }
        }

        // Default response
        return {
            message: "I'm not sure I understood that. Could you please describe your maintenance issue? For example, you can say 'My kitchen sink is leaking' or 'The AC is not cooling'.",
            continueListening: true
        };
    };

    // Create maintenance request
    const createMaintenanceRequest = async () => {
        const request = {
            property,
            unit,
            tenant,
            category: maintenanceContext.category,
            severity: maintenanceContext.severity,
            description: maintenanceContext.details.description,
            additionalNotes: maintenanceContext.details.additionalNotes,
            photos: maintenanceContext.photos,
            conversation: conversation,
            created: new Date().toISOString(),
            status: 'new',
            source: 'voice_assistant'
        };

        // In production, this would save to database
        if (onRequestCreated) {
            onRequestCreated(request);
        }

        const confirmationMessage = `Perfect! I've created maintenance request ${generateTicketNumber()}. ${
            maintenanceContext.severity === 'emergency' 
                ? 'Our emergency team has been notified and will contact you within 30 minutes.' 
                : 'Our team will review this and contact you within 2-4 hours.'
        } You'll receive updates via text and email. Is there anything else I can help you with?`;

        return {
            message: confirmationMessage,
            updateContext: { stage: 'complete' },
            continueListening: false
        };
    };

    // Generate ticket number
    const generateTicketNumber = () => {
        return `MNT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    };

    // Start/stop listening
    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true);
            recognitionRef.current.start();
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            setIsListening(false);
            recognitionRef.current.stop();
        }
    };

    // Text-to-speech
    const speak = async (text) => {
        setIsSpeaking(true);
        
        try {
            const result = await voiceService.generateMaintenanceFeedback(text);
            if (result.success) {
                await voiceService.playAudio(result.audioUrl, {
                    onEnd: () => setIsSpeaking(false)
                });
            } else if (result.fallback && result.speak) {
                const controls = result.speak();
                // Wait for speech to complete
                setTimeout(() => setIsSpeaking(false), text.length * 50);
            }
        } catch (error) {
            console.error('Error speaking:', error);
            setIsSpeaking(false);
        }
    };

    // Add message to conversation
    const addMessage = (type, content) => {
        setConversation(prev => [...prev, {
            type,
            content,
            timestamp: new Date().toISOString()
        }]);
    };

    // Handle photo upload
    const handlePhotoAnalysis = async (photoData) => {
        const { analysis } = photoData;
        
        setMaintenanceContext(prev => ({
            ...prev,
            photos: [...prev.photos, photoData],
            severity: analysis.severity === 'Emergency' ? 'emergency' : 
                     analysis.severity === 'High' ? 'high' : 
                     prev.severity,
            details: {
                ...prev.details,
                aiAnalysis: analysis
            }
        }));

        const message = `Thank you for the photo. Based on my analysis, ${analysis.issue}. ${
            analysis.safetyHazard 
                ? 'This appears to be a safety hazard. ' 
                : ''
        }I'm assigning this as ${analysis.severity} priority. The estimated repair cost is $${
            analysis.costRange.min
        }-$${analysis.costRange.max}. Shall I proceed with creating the maintenance request?`;

        addMessage('ai', message);
        if (voiceEnabled) {
            await speak(message);
        }

        setMaintenanceContext(prev => ({ ...prev, stage: 'confirmation' }));
    };

    // Handle text input
    const handleTextSubmit = (text) => {
        if (text.trim()) {
            processUserInput(text);
        }
    };

    return React.createElement('div', { className: 'tenant-maintenance-chat' }, [
        // Header
        React.createElement('div', { key: 'header', className: 'chat-header' }, [
            React.createElement('h3', { key: 'title' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-tools' }),
                ' Maintenance Assistant'
            ]),
            React.createElement('div', { key: 'controls', className: 'voice-controls' }, [
                React.createElement('label', { key: 'toggle', className: 'voice-toggle' }, [
                    React.createElement('input', {
                        key: 'checkbox',
                        type: 'checkbox',
                        checked: voiceEnabled,
                        onChange: (e) => {
                            setVoiceEnabled(e.target.checked);
                            if (!e.target.checked && isListening) {
                                stopListening();
                            }
                        }
                    }),
                    React.createElement('span', { key: 'label' }, 'Voice Mode')
                ])
            ])
        ]),

        // Conversation Area
        React.createElement('div', { key: 'conversation', className: 'conversation-area' },
            conversation.map((msg, idx) =>
                React.createElement('div', {
                    key: idx,
                    className: `message ${msg.type}`
                }, [
                    React.createElement('div', { key: 'avatar', className: 'message-avatar' },
                        React.createElement('i', { 
                            className: `fas fa-${msg.type === 'user' ? 'user' : 'robot'}`
                        })
                    ),
                    React.createElement('div', { key: 'content', className: 'message-content' }, [
                        React.createElement('div', { key: 'text', className: 'message-text' }, 
                            msg.content
                        ),
                        React.createElement('div', { key: 'time', className: 'message-time' }, 
                            new Date(msg.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })
                        )
                    ])
                ])
            ),
            currentTranscript && React.createElement('div', { 
                key: 'transcript',
                className: 'message user transcribing'
            }, [
                React.createElement('div', { key: 'avatar', className: 'message-avatar' },
                    React.createElement('i', { className: 'fas fa-user' })
                ),
                React.createElement('div', { key: 'content', className: 'message-content' }, [
                    React.createElement('div', { key: 'text', className: 'message-text' }, 
                        currentTranscript
                    ),
                    React.createElement('div', { key: 'indicator', className: 'typing-indicator' }, [
                        React.createElement('span', { key: 's1' }),
                        React.createElement('span', { key: 's2' }),
                        React.createElement('span', { key: 's3' })
                    ])
                ])
            ])
        ),

        // Voice Input
        voiceEnabled && React.createElement('div', { key: 'voice-input', className: 'voice-input-section' }, [
            React.createElement('button', {
                key: 'mic',
                className: `voice-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'disabled' : ''}`,
                onClick: isListening ? stopListening : startListening,
                disabled: isSpeaking
            }, [
                React.createElement('i', { 
                    key: 'icon',
                    className: `fas fa-${isListening ? 'stop' : 'microphone'}`
                }),
                React.createElement('span', { key: 'text' }, 
                    isListening ? 'Stop' : 'Hold to speak'
                )
            ]),
            isListening && React.createElement('div', { key: 'wave', className: 'voice-wave' }, [
                React.createElement('span', { key: 'w1' }),
                React.createElement('span', { key: 'w2' }),
                React.createElement('span', { key: 'w3' }),
                React.createElement('span', { key: 'w4' }),
                React.createElement('span', { key: 'w5' })
            ])
        ]),

        // Photo Upload (when needed)
        maintenanceContext.stage === 'awaiting_photos' && 
        React.createElement(window.AppModules.MaintenancePhotoAnalyzer, {
            key: 'photo-analyzer',
            category: maintenanceContext.category,
            property,
            unit,
            onAnalysisComplete: handlePhotoAnalysis
        }),

        // Text Input
        React.createElement('div', { key: 'text-input', className: 'text-input-section' }, [
            React.createElement('input', {
                key: 'input',
                type: 'text',
                placeholder: voiceEnabled ? 'Or type your message...' : 'Type your message...',
                onKeyPress: (e) => {
                    if (e.key === 'Enter') {
                        handleTextSubmit(e.target.value);
                        e.target.value = '';
                    }
                }
            }),
            React.createElement('button', {
                key: 'send',
                className: 'send-button',
                onClick: (e) => {
                    const input = e.target.previousSibling;
                    handleTextSubmit(input.value);
                    input.value = '';
                }
            }, React.createElement('i', { className: 'fas fa-paper-plane' }))
        ]),

        // Quick Actions
        React.createElement('div', { key: 'quick-actions', className: 'quick-actions' }, 
            ['Leak', 'No Heat', 'No AC', 'Electrical Issue'].map(action =>
                React.createElement('button', {
                    key: action,
                    className: 'quick-action',
                    onClick: () => processUserInput(`I have a ${action.toLowerCase()}`)
                }, action)
            )
        )
    ]);
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.TenantMaintenanceChat = TenantMaintenanceChat;