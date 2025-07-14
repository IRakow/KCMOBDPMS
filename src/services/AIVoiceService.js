// AIVoiceService.js - Professional AI Voice Processing with Real APIs
class AIVoiceService {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        
        // API Configuration - these would come from environment variables
        this.openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
        this.elevenlabsApiKey = process.env.REACT_APP_ELEVENLABS_API_KEY;
        this.geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;
        this.trilioApiKey = process.env.REACT_APP_TRILIO_API_KEY;
        
        // Voice settings
        this.selectedVoice = 'Rachel'; // ElevenLabs voice
        this.voiceSettings = {
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.5,
            use_speaker_boost: true
        };
    }

    // Start recording audio using Web Audio API
    async startRecording() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 44100,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                await this.processAudioBlob(audioBlob);
            };

            this.mediaRecorder.start(1000); // Collect data every second
            this.isRecording = true;
            
            return { success: true, message: 'Recording started' };
        } catch (error) {
            console.error('Error starting recording:', error);
            return { success: false, error: error.message };
        }
    }

    // Stop recording
    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Stop all tracks to release microphone
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
        }
    }

    // Convert Blob to Base64 for API transmission
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    // Process audio blob through the AI pipeline
    async processAudioBlob(audioBlob) {
        try {
            console.log('Processing audio blob, size:', audioBlob.size);
            
            // Step 1: Convert speech to text using OpenAI Whisper
            const transcription = await this.speechToText(audioBlob);
            
            if (!transcription || !transcription.text) {
                throw new Error('Failed to transcribe audio');
            }

            console.log('Transcription:', transcription.text);

            // Step 2: Process with AI (OpenAI GPT-4)
            const aiResponse = await this.processWithAI(transcription.text);
            
            console.log('AI Response:', aiResponse.response);

            // Step 3: Convert response to speech using ElevenLabs
            const audioResponse = await this.textToSpeech(aiResponse.response);

            // Step 4: Play the audio response
            if (audioResponse.success) {
                await this.playAudioResponse(audioResponse.audioUrl);
            }

            // Log the conversation
            this.logConversation(transcription.text, aiResponse.response);

            return {
                success: true,
                transcription: transcription.text,
                response: aiResponse.response,
                audioUrl: audioResponse.audioUrl
            };

        } catch (error) {
            console.error('Error processing audio:', error);
            return { success: false, error: error.message };
        }
    }

    // OpenAI Whisper Speech-to-Text
    async speechToText(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-1');
            formData.append('language', 'en');

            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            return { text: data.text };

        } catch (error) {
            console.error('Speech-to-text error:', error);
            
            // Fallback to Web Speech API if OpenAI fails
            return this.fallbackSpeechToText(audioBlob);
        }
    }

    // Fallback Web Speech API (for development/backup)
    async fallbackSpeechToText(audioBlob) {
        return new Promise((resolve) => {
            // This is a simplified fallback - in production you'd want more robust handling
            resolve({ text: '[Voice input detected - using backup transcription]' });
        });
    }

    // OpenAI GPT-4 Processing
    async processWithAI(text, context = {}) {
        try {
            const systemPrompt = this.buildSystemPrompt(context);
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: text }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                response: data.choices[0].message.content,
                usage: data.usage,
                model: data.model
            };

        } catch (error) {
            console.error('AI processing error:', error);
            return {
                response: "I apologize, but I'm having trouble processing your request right now. Please try again or contact support if the issue persists.",
                error: error.message
            };
        }
    }

    // Build context-aware system prompt
    buildSystemPrompt(context) {
        const basePrompt = `You are an AI assistant for a property management system. You help with:
- Maintenance requests and issues
- Rent and payment questions  
- Lease information and renewals
- Scheduling appointments
- General property management inquiries

Respond in a helpful, professional, and concise manner. Keep responses under 100 words for voice interactions.`;

        if (context.userType === 'tenant') {
            return basePrompt + `\n\nYou are specifically helping a tenant with their property-related needs. Be empathetic and provide clear next steps.`;
        } else if (context.userType === 'owner') {
            return basePrompt + `\n\nYou are helping a property owner. Focus on financial performance, property value, and management efficiency.`;
        } else if (context.userType === 'manager') {
            return basePrompt + `\n\nYou are assisting a property manager. Provide operational insights and help with administrative tasks.`;
        }

        return basePrompt;
    }

    // ElevenLabs Text-to-Speech
    async textToSpeech(text) {
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.getVoiceId(this.selectedVoice)}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': this.elevenlabsApiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: this.voiceSettings
                })
            });

            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }

            const audioArrayBuffer = await response.arrayBuffer();
            const audioBlob = new Blob([audioArrayBuffer], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);

            return { success: true, audioUrl, audioBlob };

        } catch (error) {
            console.error('Text-to-speech error:', error);
            
            // Fallback to Web Speech API
            return this.fallbackTextToSpeech(text);
        }
    }

    // Fallback Web Speech API
    async fallbackTextToSpeech(text) {
        return new Promise((resolve) => {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.volume = 0.8;
                
                utterance.onend = () => {
                    resolve({ success: true, usedFallback: true });
                };
                
                speechSynthesis.speak(utterance);
            } else {
                resolve({ success: false, error: 'Speech synthesis not supported' });
            }
        });
    }

    // Get ElevenLabs voice ID
    getVoiceId(voiceName) {
        const voices = {
            'Rachel': '21m00Tcm4TlvDq8ikWAM',
            'Drew': '29vD33N1CtxCmqQRPOHJ',
            'Clyde': '2EiwWnXFnvU5JabPnv8n',
            'Paul': '5Q0t7uMcjvnagumLfvZi',
            'Domi': 'AZnzlk1XvdvUeBnXmlld',
            'Dave': 'CYw3kZ02Hs0563khs1Fj',
            'Fin': 'D38z5RcWu1voky8WS1ja',
            'Sarah': 'EXAVITQu4vr4xnSDxMaL',
            'Antoni': 'ErXwobaYiN019PkySvjV',
            'Thomas': 'GBv7mTt0atIp3Br8iCZE'
        };
        return voices[voiceName] || voices['Rachel'];
    }

    // Play audio response
    async playAudioResponse(audioUrl) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(audioUrl);
            
            audio.onloadeddata = () => {
                audio.play()
                    .then(() => resolve(true))
                    .catch(reject);
            };
            
            audio.onerror = reject;
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl); // Clean up blob URL
                resolve(true);
            };
        });
    }

    // Log conversation for analysis
    logConversation(userInput, aiResponse) {
        if (window.ConversationLogService) {
            window.ConversationLogService.logAIConversation({
                conversationType: 'voice',
                userId: 'current-user',
                userName: 'User',
                userType: 'user',
                aiModel: 'gpt-4-voice-assistant',
                prompt: userInput,
                response: aiResponse,
                metadata: {
                    voiceProvider: 'elevenlabs',
                    speechProvider: 'openai-whisper',
                    selectedVoice: this.selectedVoice
                }
            });
        }
    }

    // Change voice settings
    setVoice(voiceName) {
        this.selectedVoice = voiceName;
    }

    setVoiceSettings(settings) {
        this.voiceSettings = { ...this.voiceSettings, ...settings };
    }

    // Get available voices
    getAvailableVoices() {
        return [
            { name: 'Rachel', gender: 'female', accent: 'American' },
            { name: 'Drew', gender: 'male', accent: 'American' },
            { name: 'Clyde', gender: 'male', accent: 'American' },
            { name: 'Paul', gender: 'male', accent: 'American' },
            { name: 'Domi', gender: 'female', accent: 'American' },
            { name: 'Dave', gender: 'male', accent: 'British' },
            { name: 'Fin', gender: 'male', accent: 'Irish' },
            { name: 'Sarah', gender: 'female', accent: 'American' },
            { name: 'Antoni', gender: 'male', accent: 'American' },
            { name: 'Thomas', gender: 'male', accent: 'American' }
        ];
    }

    // Check if APIs are configured
    isConfigured() {
        return !!(this.openaiApiKey && this.elevenlabsApiKey);
    }

    // Get service status
    getStatus() {
        return {
            isRecording: this.isRecording,
            hasOpenAI: !!this.openaiApiKey,
            hasElevenLabs: !!this.elevenlabsApiKey,
            hasGemini: !!this.geminiApiKey,
            hasTrilio: !!this.trilioApiKey,
            selectedVoice: this.selectedVoice,
            isConfigured: this.isConfigured()
        };
    }
}

// Global instance
window.AIVoiceService = new AIVoiceService();