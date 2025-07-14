// ElevenLabsVoiceService.js - AI voice feedback for maintenance requests
class ElevenLabsVoiceService {
    constructor() {
        this.apiKey = process.env.ELEVEN_LABS_API_KEY || '';
        this.apiUrl = 'https://api.elevenlabs.io/v1';
        this.defaultVoiceId = 'rachel'; // Professional female voice
        this.voices = {
            rachel: { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Professional, warm' },
            adam: { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Professional, clear' },
            bella: { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Friendly, conversational' }
        };
    }

    // Convert text to speech for maintenance feedback
    async generateMaintenanceFeedback(text, options = {}) {
        try {
            const voiceId = options.voiceId || this.voices[this.defaultVoiceId].id;
            
            const response = await fetch(`${this.apiUrl}/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.75,
                        similarity_boost: 0.85,
                        style: 0.5,
                        use_speaker_boost: true
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Eleven Labs API error: ${response.statusText}`);
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            
            return {
                success: true,
                audioUrl,
                audioBlob,
                duration: await this.getAudioDuration(audioUrl)
            };
        } catch (error) {
            console.error('Error generating voice feedback:', error);
            return this.getFallbackAudio(text);
        }
    }

    // Generate contextual maintenance feedback based on analysis
    generateMaintenanceScript(analysis) {
        const { issue, severity, safetyHazard, repairType, estimatedTime, costRange } = analysis;
        
        let script = '';
        
        // Greeting based on severity
        if (severity === 'Emergency') {
            script += "I've identified an emergency maintenance issue that requires immediate attention. ";
        } else if (severity === 'High') {
            script += "I've detected a high-priority maintenance issue. ";
        } else {
            script += "Thank you for reporting this maintenance issue. ";
        }
        
        // Issue description
        script += `Based on my analysis, ${issue}. `;
        
        // Safety warning if applicable
        if (safetyHazard) {
            script += "Please note: This poses a safety hazard. For your safety, please avoid the affected area until repairs are completed. ";
        }
        
        // Repair information
        script += `This will require ${repairType.toLowerCase()}, which typically takes ${estimatedTime}. `;
        
        // Cost information
        script += `The estimated cost ranges from ${costRange.min} to ${costRange.max} dollars. `;
        
        // Next steps based on severity
        if (severity === 'Emergency') {
            script += "I'm immediately notifying our emergency maintenance team. Someone will contact you within the next 30 minutes. ";
        } else if (severity === 'High') {
            script += "I'm prioritizing this with our maintenance team. You can expect someone to contact you within 2 to 4 hours. ";
        } else {
            script += "I've logged this request with our maintenance team. They will schedule the repair within 1 to 2 business days. ";
        }
        
        // Closing
        script += "You'll receive a confirmation email shortly with your ticket number and updates. Is there anything else you'd like me to know about this issue?";
        
        return script;
    }

    // Generate voice prompts for maintenance flow
    generateMaintenancePrompts() {
        return {
            welcome: "Welcome to our AI-powered maintenance assistant. How can I help you today?",
            
            categorySelection: "I can help with plumbing, electrical, HVAC, appliance, or general maintenance issues. Which category best describes your problem?",
            
            photoRequest: "To better understand the issue, please take a photo or upload one. I'll analyze it instantly to provide accurate assistance.",
            
            analyzing: "Thank you. I'm analyzing your photo now. This will just take a moment.",
            
            additionalInfo: "Is there anything else you'd like me to know about this issue? For example, when it started or if it's getting worse?",
            
            confirmation: "Perfect! I've created maintenance ticket number {ticketId}. You'll receive updates via email and text message.",
            
            emergency: "This appears to be an emergency. I'm immediately alerting our on-call maintenance team. Please stay safe and away from the affected area.",
            
            vendorAssigned: "Good news! I've assigned {vendorName} to handle your repair. They have a {rating} star rating and will contact you within {responseTime}.",
            
            scheduling: "The vendor has availability on {date} at {time}. Would this work for you?",
            
            complete: "Thank you for using our maintenance service. Your request has been successfully submitted. Have a great day!"
        };
    }

    // Play audio with controls
    async playAudio(audioUrl, options = {}) {
        const audio = new Audio(audioUrl);
        
        // Set options
        audio.volume = options.volume || 0.8;
        audio.playbackRate = options.speed || 1.0;
        
        // Add event handlers
        if (options.onEnd) {
            audio.addEventListener('ended', options.onEnd);
        }
        
        if (options.onError) {
            audio.addEventListener('error', options.onError);
        }
        
        try {
            await audio.play();
            return {
                success: true,
                audio,
                stop: () => {
                    audio.pause();
                    audio.currentTime = 0;
                },
                pause: () => audio.pause(),
                resume: () => audio.play()
            };
        } catch (error) {
            console.error('Error playing audio:', error);
            return { success: false, error };
        }
    }

    // Get audio duration
    async getAudioDuration(audioUrl) {
        return new Promise((resolve) => {
            const audio = new Audio(audioUrl);
            audio.addEventListener('loadedmetadata', () => {
                resolve(audio.duration);
            });
            audio.addEventListener('error', () => {
                resolve(0);
            });
        });
    }

    // Fallback audio generation using browser TTS
    async getFallbackAudio(text) {
        if ('speechSynthesis' in window) {
            return {
                success: false,
                fallback: true,
                speak: () => {
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.rate = 0.95;
                    utterance.pitch = 1.0;
                    utterance.volume = 0.8;
                    
                    // Try to use a professional voice
                    const voices = speechSynthesis.getVoices();
                    const preferredVoice = voices.find(v => 
                        v.name.includes('Google') || v.name.includes('Microsoft')
                    );
                    if (preferredVoice) {
                        utterance.voice = preferredVoice;
                    }
                    
                    speechSynthesis.speak(utterance);
                    
                    return {
                        stop: () => speechSynthesis.cancel(),
                        pause: () => speechSynthesis.pause(),
                        resume: () => speechSynthesis.resume()
                    };
                }
            };
        }
        
        return {
            success: false,
            error: 'Voice synthesis not supported'
        };
    }

    // Batch generate multiple prompts
    async generateMaintenanceFlow(analysis) {
        const prompts = this.generateMaintenancePrompts();
        const script = this.generateMaintenanceScript(analysis);
        
        // Generate all audio files
        const audioPromises = {
            feedback: this.generateMaintenanceFeedback(script),
            emergency: analysis.severity === 'Emergency' ? 
                this.generateMaintenanceFeedback(prompts.emergency) : null
        };
        
        const results = await Promise.all(
            Object.entries(audioPromises)
                .filter(([_, promise]) => promise !== null)
                .map(async ([key, promise]) => ({
                    key,
                    audio: await promise
                }))
        );
        
        return results.reduce((acc, { key, audio }) => {
            acc[key] = audio;
            return acc;
        }, {});
    }
}

// Mock service for testing without API key
class MockElevenLabsVoiceService extends ElevenLabsVoiceService {
    async generateMaintenanceFeedback(text, options = {}) {
        // Use browser's speech synthesis as mock
        return this.getFallbackAudio(text);
    }
    
    async generateMaintenanceFlow(analysis) {
        const script = this.generateMaintenanceScript(analysis);
        return {
            feedback: await this.getFallbackAudio(script),
            emergency: analysis.severity === 'Emergency' ? 
                await this.getFallbackAudio(this.generateMaintenancePrompts().emergency) : null
        };
    }
}

// Export service
window.ElevenLabsVoiceService = window.ElevenLabsVoiceService || (
    process.env.ELEVEN_LABS_API_KEY ? ElevenLabsVoiceService : MockElevenLabsVoiceService
);