// MaintenanceVoiceAssistant.jsx - Voice-enabled maintenance assistant
const MaintenanceVoiceAssistant = ({ analysis, onComplete }) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentAudio, setCurrentAudio] = React.useState(null);
    const [voiceEnabled, setVoiceEnabled] = React.useState(() => {
        // Check global silence mode first
        return window.silenceMode !== true;
    });
    const [volume, setVolume] = React.useState(0.8);
    const [status, setStatus] = React.useState('ready');
    const [transcript, setTranscript] = React.useState('');
    
    // Initialize voice service
    const voiceService = React.useMemo(() => {
        return new (window.ElevenLabsVoiceService || window.MockElevenLabsVoiceService)();
    }, []);

    // Listen for silence mode changes
    React.useEffect(() => {
        const handleSilenceModeChange = (event) => {
            setVoiceEnabled(!event.detail);
            if (event.detail && isPlaying) {
                stopPlayback();
            }
        };

        window.addEventListener('silenceModeChanged', handleSilenceModeChange);
        return () => window.removeEventListener('silenceModeChanged', handleSilenceModeChange);
    }, [isPlaying]);

    // Play maintenance feedback
    const playFeedback = React.useCallback(async () => {
        if (!voiceEnabled || !analysis) return;
        
        setStatus('generating');
        setIsPlaying(true);
        
        try {
            // Generate voice feedback based on analysis
            const script = voiceService.generateMaintenanceScript(analysis);
            setTranscript(script);
            
            const audioResult = await voiceService.generateMaintenanceFeedback(script, {
                voiceId: 'rachel'
            });
            
            if (audioResult.success) {
                setStatus('playing');
                const playback = await voiceService.playAudio(audioResult.audioUrl, {
                    volume,
                    onEnd: () => {
                        setIsPlaying(false);
                        setStatus('complete');
                        if (onComplete) onComplete();
                    },
                    onError: (error) => {
                        console.error('Playback error:', error);
                        setIsPlaying(false);
                        setStatus('error');
                    }
                });
                
                setCurrentAudio(playback);
            } else if (audioResult.fallback && audioResult.speak) {
                // Use fallback browser TTS
                setStatus('playing');
                const controls = audioResult.speak();
                setCurrentAudio({
                    ...controls,
                    success: true
                });
                
                // Estimate completion time
                setTimeout(() => {
                    setIsPlaying(false);
                    setStatus('complete');
                    if (onComplete) onComplete();
                }, script.length * 60); // Rough estimate: 60ms per character
            }
        } catch (error) {
            console.error('Error playing feedback:', error);
            setStatus('error');
            setIsPlaying(false);
        }
    }, [analysis, voiceEnabled, volume, voiceService, onComplete]);

    // Stop playback
    const stopPlayback = () => {
        if (currentAudio && currentAudio.stop) {
            currentAudio.stop();
        }
        setIsPlaying(false);
        setCurrentAudio(null);
        setStatus('ready');
    };

    // Auto-play on mount if analysis is available
    React.useEffect(() => {
        if (analysis && voiceEnabled && status === 'ready') {
            playFeedback();
        }
    }, [analysis]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (currentAudio && currentAudio.stop) {
                currentAudio.stop();
            }
        };
    }, [currentAudio]);

    return React.createElement('div', { className: 'maintenance-voice-assistant' }, [
        // Voice Controls
        React.createElement('div', { key: 'controls', className: 'voice-controls' }, [
            React.createElement('div', { key: 'header', className: 'controls-header' }, [
                React.createElement('h4', { key: 'title' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-microphone-alt' }),
                    ' Voice Assistant'
                ]),
                React.createElement('label', { key: 'toggle', className: 'voice-toggle' }, [
                    React.createElement('input', {
                        key: 'checkbox',
                        type: 'checkbox',
                        checked: voiceEnabled,
                        onChange: (e) => setVoiceEnabled(e.target.checked)
                    }),
                    React.createElement('span', { key: 'slider', className: 'toggle-slider' })
                ])
            ]),
            
            // Playback controls
            voiceEnabled && React.createElement('div', { key: 'playback', className: 'playback-controls' }, [
                React.createElement('button', {
                    key: 'play',
                    className: `play-button ${isPlaying ? 'playing' : ''}`,
                    onClick: isPlaying ? stopPlayback : playFeedback,
                    disabled: status === 'generating'
                }, [
                    React.createElement('i', { 
                        key: 'icon',
                        className: `fas fa-${isPlaying ? 'stop' : 'play'}`
                    }),
                    React.createElement('span', { key: 'text' }, 
                        status === 'generating' ? 'Generating...' :
                        isPlaying ? 'Stop' : 'Play Feedback'
                    )
                ]),
                
                // Volume control
                React.createElement('div', { key: 'volume', className: 'volume-control' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-volume-up' }),
                    React.createElement('input', {
                        key: 'slider',
                        type: 'range',
                        min: '0',
                        max: '1',
                        step: '0.1',
                        value: volume,
                        onChange: (e) => setVolume(parseFloat(e.target.value))
                    })
                ])
            ])
        ]),

        // Voice Visualization
        isPlaying && React.createElement('div', { key: 'visualization', className: 'voice-visualization' }, [
            React.createElement('div', { key: 'wave1', className: 'sound-wave' }),
            React.createElement('div', { key: 'wave2', className: 'sound-wave' }),
            React.createElement('div', { key: 'wave3', className: 'sound-wave' }),
            React.createElement('div', { key: 'wave4', className: 'sound-wave' }),
            React.createElement('div', { key: 'wave5', className: 'sound-wave' })
        ]),

        // Transcript
        transcript && React.createElement('div', { key: 'transcript', className: 'voice-transcript' }, [
            React.createElement('div', { key: 'header', className: 'transcript-header' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-align-left' }),
                ' Transcript'
            ]),
            React.createElement('p', { key: 'text' }, transcript)
        ]),

        // Quick Actions (voice-triggered)
        analysis && React.createElement('div', { key: 'actions', className: 'voice-actions' }, [
            React.createElement('h5', { key: 'title' }, 'Voice Commands Available:'),
            React.createElement('div', { key: 'commands', className: 'command-list' }, [
                React.createElement('div', { key: 'cmd1', className: 'command-item' }, [
                    React.createElement('span', { key: 'trigger', className: 'command-trigger' }, 
                        '"Repeat"'
                    ),
                    React.createElement('span', { key: 'desc', className: 'command-desc' }, 
                        'Replay the feedback'
                    )
                ]),
                React.createElement('div', { key: 'cmd2', className: 'command-item' }, [
                    React.createElement('span', { key: 'trigger', className: 'command-trigger' }, 
                        '"Send to email"'
                    ),
                    React.createElement('span', { key: 'desc', className: 'command-desc' }, 
                        'Email the analysis'
                    )
                ]),
                React.createElement('div', { key: 'cmd3', className: 'command-item' }, [
                    React.createElement('span', { key: 'trigger', className: 'command-trigger' }, 
                        '"Call vendor"'
                    ),
                    React.createElement('span', { key: 'desc', className: 'command-desc' }, 
                        'Contact assigned vendor'
                    )
                ])
            ])
        ])
    ]);
};

// Voice-enabled maintenance request component
const VoiceMaintenanceRequest = () => {
    const [isListening, setIsListening] = React.useState(false);
    const [transcript, setTranscript] = React.useState('');
    const [category, setCategory] = React.useState(null);
    const [stage, setStage] = React.useState('welcome'); // welcome, category, description, photo, complete
    
    // Speech recognition setup
    const recognition = React.useMemo(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            return recognition;
        }
        return null;
    }, []);

    // Voice service
    const voiceService = React.useMemo(() => {
        return new (window.ElevenLabsVoiceService || window.MockElevenLabsVoiceService)();
    }, []);

    // Start listening
    const startListening = () => {
        if (!recognition) {
            alert('Speech recognition is not supported in your browser');
            return;
        }

        setIsListening(true);
        recognition.start();

        recognition.onresult = (event) => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;
            setTranscript(transcript);
            
            if (event.results[current].isFinal) {
                processVoiceCommand(transcript.toLowerCase());
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    };

    // Process voice commands
    const processVoiceCommand = async (command) => {
        // Category detection
        if (stage === 'category') {
            if (command.includes('plumb')) {
                setCategory('plumbing');
                setStage('description');
                await speakPrompt('Got it. Please describe the plumbing issue.');
            } else if (command.includes('electric')) {
                setCategory('electrical');
                setStage('description');
                await speakPrompt('I understand. Please describe the electrical issue.');
            } else if (command.includes('heat') || command.includes('cool') || command.includes('air')) {
                setCategory('hvac');
                setStage('description');
                await speakPrompt('HVAC issue noted. Please describe what\'s happening.');
            }
        }
    };

    // Speak prompt
    const speakPrompt = async (text) => {
        const result = await voiceService.generateMaintenanceFeedback(text);
        if (result.success) {
            await voiceService.playAudio(result.audioUrl);
        } else if (result.fallback && result.speak) {
            result.speak();
        }
    };

    // Initialize with welcome message
    React.useEffect(() => {
        if (stage === 'welcome') {
            const prompts = voiceService.generateMaintenancePrompts();
            speakPrompt(prompts.welcome);
            setStage('category');
        }
    }, []);

    return React.createElement('div', { className: 'voice-maintenance-request' }, [
        React.createElement('div', { key: 'header', className: 'voice-header' }, [
            React.createElement('h3', { key: 'title' }, 'Voice-Activated Maintenance Request'),
            React.createElement('p', { key: 'desc' }, 'Speak to report your maintenance issue')
        ]),

        React.createElement('button', {
            key: 'mic',
            className: `voice-button ${isListening ? 'listening' : ''}`,
            onClick: isListening ? () => recognition.stop() : startListening
        }, [
            React.createElement('i', { 
                key: 'icon',
                className: `fas fa-microphone${isListening ? '' : '-slash'}`
            }),
            React.createElement('span', { key: 'text' }, 
                isListening ? 'Listening...' : 'Click to speak'
            )
        ]),

        transcript && React.createElement('div', { key: 'transcript', className: 'live-transcript' }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-quote-left' }),
            ' ',
            transcript
        ]),

        React.createElement('div', { key: 'stage', className: 'request-stage' }, [
            React.createElement('span', { key: 'label' }, 'Current Step: '),
            React.createElement('span', { key: 'value' }, stage.charAt(0).toUpperCase() + stage.slice(1))
        ])
    ]);
};

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.MaintenanceVoiceAssistant = MaintenanceVoiceAssistant;
window.AppModules.VoiceMaintenanceRequest = VoiceMaintenanceRequest;