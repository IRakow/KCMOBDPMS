// GeminiVisionService.js - Professional AI-powered photo analysis for maintenance
class GeminiVisionService {
    constructor() {
        this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision-latest:generateContent';
        this.maxImageSize = 20 * 1024 * 1024; // 20MB limit
        this.supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    }

    // Main photo analysis function with enhanced error handling
    async analyzeMaintenancePhoto(imageData, context = {}) {
        try {
            console.log('Starting professional maintenance photo analysis...');
            
            // Validate input data
            if (!imageData || (!imageData.base64 && !imageData.file)) {
                throw new Error('No valid image data provided');
            }

            // Handle File object if provided
            let base64Data = imageData.base64;
            let mimeType = imageData.mimeType;
            
            if (imageData.file) {
                const validation = await this.validateImage(imageData.file);
                if (!validation.valid) {
                    throw new Error(validation.error);
                }
                base64Data = await this.fileToBase64(imageData.file);
                mimeType = imageData.file.type;
            }

            const prompt = this.buildEnhancedMaintenancePrompt(context);
            
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: mimeType || 'image/jpeg',
                                    data: base64Data
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.4,
                        topK: 32,
                        topP: 1,
                        maxOutputTokens: 4096,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
                throw new Error('Invalid response from Gemini Vision API');
            }

            const analysis = data.candidates[0].content.parts[0].text;
            const result = this.parseEnhancedAnalysis(analysis, context);
            
            // Log analysis in conversation system
            this.logPhotoAnalysis(result.analysis, context);
            
            return result;
        } catch (error) {
            console.error('Error analyzing photo with Gemini:', error);
            return this.getFallbackAnalysis(context);
        }
    }

    // Validate image file
    async validateImage(imageFile) {
        if (!imageFile) {
            return { valid: false, error: 'No image file provided' };
        }

        if (!this.supportedFormats.includes(imageFile.type)) {
            return { 
                valid: false, 
                error: `Unsupported format. Supported: ${this.supportedFormats.join(', ')}` 
            };
        }

        if (imageFile.size > this.maxImageSize) {
            return { 
                valid: false, 
                error: `Image too large. Max size: ${this.maxImageSize / (1024 * 1024)}MB` 
            };
        }

        return { valid: true };
    }

    // Convert File object to base64
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Build enhanced maintenance analysis prompt
    buildEnhancedMaintenancePrompt(context) {
        const { category, description, property, unit, tenantName, location } = context;
        
        return `You are a professional property maintenance assessment AI analyzing property maintenance issues. Please provide a detailed analysis of this image in JSON format.

Property Context:
- Property: ${property || 'Unknown'}
- Unit: ${unit || 'Unknown'}
- Reporter: ${tenantName || 'Unknown'}
- Location: ${location || 'Unknown'}
- Category: ${category || 'General'}
- Description: "${description || 'No description provided'}"

Please analyze the image and provide a response in this exact JSON structure:

{
  "issueDetected": true/false,
  "category": "plumbing|electrical|hvac|structural|appliance|cosmetic|safety|other",
  "severity": "low|medium|high|emergency",
  "title": "Brief descriptive title",
  "description": "Detailed description of the issue",
  "urgency": "routine|urgent|emergency",
  "estimatedCost": {
    "min": number,
    "max": number,
    "currency": "USD"
  },
  "timeToComplete": {
    "min": number,
    "max": number,
    "unit": "hours|days"
  },
  "requiredSkills": ["skill1", "skill2"],
  "recommendedVendors": ["vendor_type1", "vendor_type2"],
  "safetyRisk": true/false,
  "requiresPermit": true/false,
  "materials": ["material1", "material2"],
  "preventiveMeasures": ["measure1", "measure2"],
  "followUpRequired": true/false,
  "additionalNotes": "Any additional observations",
  "confidence": number (0-100)
}

Analysis Guidelines:
1. Be thorough and professional
2. Consider safety implications
3. Provide realistic cost estimates
4. Include preventive measures
5. Note if emergency response is needed
6. Assess structural vs cosmetic issues
7. Consider code compliance requirements

If no maintenance issue is visible, set issueDetected to false and provide appropriate explanations.`;
    }

    // Parse enhanced AI response into structured data
    parseEnhancedAnalysis(analysisText, context) {
        try {
            // Clean the response text to extract JSON
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const analysis = JSON.parse(jsonMatch[0]);
            
            // Validate required fields
            const requiredFields = ['issueDetected', 'category', 'severity', 'title', 'description'];
            for (const field of requiredFields) {
                if (!(field in analysis)) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Set defaults for optional fields and format response
            return {
                success: true,
                analysis: {
                    issueDetected: analysis.issueDetected,
                    category: analysis.category,
                    severity: analysis.severity,
                    title: analysis.title,
                    description: analysis.description,
                    urgency: analysis.urgency || analysis.severity,
                    estimatedCost: analysis.estimatedCost || { min: 50, max: 200, currency: 'USD' },
                    timeToComplete: analysis.timeToComplete || { min: 1, max: 4, unit: 'hours' },
                    requiredSkills: analysis.requiredSkills || ['general_maintenance'],
                    recommendedVendors: analysis.recommendedVendors || ['handyman'],
                    safetyRisk: analysis.safetyRisk || false,
                    requiresPermit: analysis.requiresPermit || false,
                    materials: analysis.materials || [],
                    preventiveMeasures: analysis.preventiveMeasures || [],
                    followUpRequired: analysis.followUpRequired || false,
                    additionalNotes: analysis.additionalNotes || '',
                    confidence: analysis.confidence || 85,
                    timestamp: new Date().toISOString(),
                    model: 'gemini-1.5-pro-vision'
                }
            };

        } catch (error) {
            console.error('Error parsing enhanced analysis response:', error);
            
            // Fallback to text parsing
            return this.parseMaintenanceAnalysis(analysisText, context);
        }
    }

    // Log photo analysis in conversation system
    logPhotoAnalysis(analysis, context) {
        if (window.ConversationLogService) {
            window.ConversationLogService.logConversation({
                type: 'maintenance_photo_analysis',
                participantId: 'gemini_vision_ai',
                participantName: 'AI Photo Analyst',
                participantType: 'ai_system',
                propertyId: context.propertyId,
                propertyName: context.property,
                unitNumber: context.unit,
                content: `AI analyzed maintenance photo: ${analysis.title}. Severity: ${analysis.severity}. Confidence: ${analysis.confidence}%`,
                channel: 'maintenance_system',
                metadata: {
                    issueCategory: analysis.category,
                    severity: analysis.severity,
                    confidence: analysis.confidence,
                    estimatedCost: analysis.estimatedCost,
                    safetyRisk: analysis.safetyRisk,
                    aiModel: 'gemini-1.5-pro-vision'
                }
            });
        }
    }

    // Legacy parser for backward compatibility
    parseMaintenanceAnalysis(analysisText, context) {
        try {
            // Try to parse as JSON first
            const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    success: true,
                    analysis: {
                        ...parsed,
                        category: context.category,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
        }

        // Fallback text parsing
        return {
            success: true,
            analysis: {
                issue: this.extractSection(analysisText, 'issue') || 'Unable to determine issue',
                severity: this.extractSeverity(analysisText) || 'Medium',
                safetyHazard: analysisText.toLowerCase().includes('safety') || 
                             analysisText.toLowerCase().includes('hazard'),
                repairType: this.extractSection(analysisText, 'repair') || 'General maintenance',
                vendorType: this.extractVendorType(analysisText, context.category),
                costRange: this.extractCostRange(analysisText),
                category: context.category,
                timestamp: new Date().toISOString(),
                rawAnalysis: analysisText
            }
        };
    }

    // Extract severity level from text
    extractSeverity(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('emergency') || lowerText.includes('urgent')) return 'Emergency';
        if (lowerText.includes('high') || lowerText.includes('serious')) return 'High';
        if (lowerText.includes('low') || lowerText.includes('minor')) return 'Low';
        return 'Medium';
    }

    // Extract vendor type from analysis
    extractVendorType(text, category) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('plumb') || category === 'plumbing') return 'plumber';
        if (lowerText.includes('electric') || category === 'electrical') return 'electrician';
        if (lowerText.includes('hvac') || lowerText.includes('heating') || 
            lowerText.includes('cooling') || category === 'hvac') return 'hvac';
        if (lowerText.includes('appliance') || category === 'appliance') return 'appliance';
        return 'general';
    }

    // Extract cost range from text
    extractCostRange(text) {
        const numbers = text.match(/\$?\d+/g);
        if (numbers && numbers.length >= 2) {
            const values = numbers.map(n => parseInt(n.replace('$', '')));
            return {
                min: Math.min(...values),
                max: Math.max(...values)
            };
        }
        
        // Default ranges based on common repairs
        const lowerText = text.toLowerCase();
        if (lowerText.includes('minor') || lowerText.includes('simple')) {
            return { min: 50, max: 200 };
        }
        if (lowerText.includes('major') || lowerText.includes('extensive')) {
            return { min: 500, max: 2000 };
        }
        return { min: 150, max: 500 };
    }

    // Extract section from text
    extractSection(text, keyword) {
        const regex = new RegExp(`${keyword}[:\s]+([^.]+)`, 'i');
        const match = text.match(regex);
        return match ? match[1].trim() : null;
    }

    // Fallback analysis when API fails
    getFallbackAnalysis(context) {
        const { category = 'general' } = context;
        
        const categoryDefaults = {
            plumbing: {
                vendorType: 'plumber',
                costRange: { min: 150, max: 500 }
            },
            electrical: {
                vendorType: 'electrician',
                costRange: { min: 200, max: 600 }
            },
            hvac: {
                vendorType: 'hvac',
                costRange: { min: 300, max: 800 }
            },
            appliance: {
                vendorType: 'appliance',
                costRange: { min: 100, max: 400 }
            },
            general: {
                vendorType: 'general',
                costRange: { min: 100, max: 300 }
            }
        };

        const defaults = categoryDefaults[category] || categoryDefaults.general;

        return {
            success: false,
            analysis: {
                issue: 'Photo analysis unavailable - manual review required',
                severity: 'Medium',
                safetyHazard: false,
                repairType: `${category} repair`,
                vendorType: defaults.vendorType,
                costRange: defaults.costRange,
                category,
                timestamp: new Date().toISOString(),
                requiresManualReview: true
            }
        };
    }

    // Batch analyze multiple photos
    async analyzeMultiplePhotos(photos, context) {
        const analyses = await Promise.all(
            photos.map(photo => this.analyzeMaintenancePhoto(photo, context))
        );

        // Combine analyses for comprehensive assessment
        return this.combineAnalyses(analyses);
    }

    // Combine multiple photo analyses
    combineAnalyses(analyses) {
        const validAnalyses = analyses.filter(a => a.success);
        
        if (validAnalyses.length === 0) {
            return analyses[0]; // Return fallback
        }

        // Determine highest severity
        const severityOrder = ['Low', 'Medium', 'High', 'Emergency'];
        const maxSeverity = validAnalyses.reduce((max, curr) => {
            const currIndex = severityOrder.indexOf(curr.analysis.severity);
            const maxIndex = severityOrder.indexOf(max);
            return currIndex > maxIndex ? curr.analysis.severity : max;
        }, 'Low');

        // Combine cost ranges
        const allCosts = validAnalyses.map(a => a.analysis.costRange);
        const combinedCost = {
            min: Math.min(...allCosts.map(c => c.min)),
            max: Math.max(...allCosts.map(c => c.max))
        };

        // Check for any safety hazards
        const anySafetyHazard = validAnalyses.some(a => a.analysis.safetyHazard);

        return {
            success: true,
            analysis: {
                issue: validAnalyses.map(a => a.analysis.issue).join('; '),
                severity: maxSeverity,
                safetyHazard: anySafetyHazard,
                vendorType: validAnalyses[0].analysis.vendorType,
                costRange: combinedCost,
                category: validAnalyses[0].analysis.category,
                timestamp: new Date().toISOString(),
                photoCount: photos.length,
                individualAnalyses: validAnalyses.map(a => a.analysis)
            }
        };
    }
}

// Mock service for testing without API key
class MockGeminiVisionService extends GeminiVisionService {
    async analyzeMaintenancePhoto(imageData, context = {}) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate mock analysis based on category
        const mockAnalyses = {
            plumbing: {
                issue: "Water leak detected under sink with visible pipe corrosion",
                severity: "High",
                safetyHazard: true,
                safetyDetails: "Water damage risk to cabinets and potential mold growth",
                repairType: "Pipe replacement and leak repair",
                estimatedTime: "2-3 hours",
                vendorType: "plumber",
                specialSkills: ["Pipe fitting", "Leak detection"],
                costRange: { min: 250, max: 500 },
                preventionTips: [
                    "Regular pipe inspection every 6 months",
                    "Check for early signs of corrosion"
                ],
                additionalNotes: "Recommend checking adjacent units for similar issues"
            },
            electrical: {
                issue: "Damaged electrical outlet with visible burn marks",
                severity: "Emergency",
                safetyHazard: true,
                safetyDetails: "Fire hazard - immediate attention required",
                repairType: "Outlet replacement and circuit inspection",
                estimatedTime: "1-2 hours",
                vendorType: "electrician",
                specialSkills: ["Licensed electrician", "Circuit testing"],
                costRange: { min: 150, max: 350 },
                preventionTips: [
                    "Avoid overloading outlets",
                    "Regular electrical safety inspections"
                ],
                additionalNotes: "Circuit breaker may need inspection"
            },
            hvac: {
                issue: "AC unit showing frost buildup on coils",
                severity: "Medium",
                safetyHazard: false,
                safetyDetails: "No immediate safety concern",
                repairType: "Defrost and refrigerant check",
                estimatedTime: "2-4 hours",
                vendorType: "hvac",
                specialSkills: ["HVAC certified", "Refrigerant handling"],
                costRange: { min: 300, max: 600 },
                preventionTips: [
                    "Change filters monthly",
                    "Annual HVAC maintenance"
                ],
                additionalNotes: "May indicate refrigerant leak or airflow issue"
            }
        };

        const analysis = mockAnalyses[context.category] || {
            issue: "General maintenance issue detected",
            severity: "Medium",
            safetyHazard: false,
            repairType: "General repair",
            vendorType: "general",
            costRange: { min: 100, max: 300 }
        };

        return {
            success: true,
            analysis: {
                ...analysis,
                category: context.category,
                timestamp: new Date().toISOString(),
                mock: true
            }
        };
    }

    // Check if Gemini Vision is configured
    isConfigured() {
        return !!this.apiKey;
    }

    // Get service status
    getStatus() {
        return {
            configured: this.isConfigured(),
            apiUrl: this.apiUrl,
            maxImageSize: this.maxImageSize,
            supportedFormats: this.supportedFormats,
            model: 'gemini-1.5-pro-vision-latest'
        };
    }

    // Test connection to Gemini Vision API
    async testConnection() {
        try {
            const testResponse = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: 'Test connection' }]
                    }]
                })
            });

            return {
                success: testResponse.ok,
                status: testResponse.status,
                message: testResponse.ok ? 'Connection successful' : 'Connection failed'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    // Generate structured maintenance request from analysis
    generateMaintenanceRequest(analysis, context) {
        const priority = this.mapSeverityToPriority(analysis.severity);
        const requestId = 'MR_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

        return {
            id: requestId,
            title: analysis.title,
            description: analysis.description,
            category: analysis.category,
            priority: priority,
            urgency: analysis.urgency,
            status: 'submitted',
            propertyId: context.propertyId,
            propertyName: context.property,
            unitNumber: context.unit,
            tenantId: context.tenantId,
            tenantName: context.tenantName,
            reportedBy: context.tenantName,
            location: context.location,
            estimatedCost: analysis.estimatedCost,
            timeToComplete: analysis.timeToComplete,
            requiredSkills: analysis.requiredSkills,
            recommendedVendors: analysis.recommendedVendors,
            safetyRisk: analysis.safetyRisk,
            requiresPermit: analysis.requiresPermit,
            materials: analysis.materials,
            preventiveMeasures: analysis.preventiveMeasures,
            followUpRequired: analysis.followUpRequired,
            additionalNotes: analysis.additionalNotes,
            aiAnalysis: {
                confidence: analysis.confidence,
                processedAt: new Date().toISOString(),
                model: 'gemini-1.5-pro-vision'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            photos: [{
                id: 'photo_' + Date.now(),
                originalName: context.fileName || 'maintenance_photo.jpg',
                analyzedAt: new Date().toISOString(),
                analysisConfidence: analysis.confidence
            }]
        };
    }

    // Map severity to priority levels
    mapSeverityToPriority(severity) {
        const mapping = {
            'low': 'low',
            'medium': 'normal',
            'high': 'high',
            'emergency': 'emergency'
        };
        return mapping[severity] || 'normal';
    }
}

// Export service
window.GeminiVisionService = window.GeminiVisionService || new GeminiVisionService();