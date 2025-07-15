// GeminiVisionService.js - AI-powered photo analysis for maintenance
class GeminiVisionService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
    }

    // Analyze maintenance photo and provide insights
    async analyzeMaintenancePhoto(imageData, context = {}) {
        try {
            const prompt = this.buildMaintenancePrompt(context);
            
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            {
                                text: prompt
                            },
                            {
                                inline_data: {
                                    mime_type: imageData.mimeType || 'image/jpeg',
                                    data: imageData.base64
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.statusText}`);
            }

            const data = await response.json();
            const analysis = data.candidates[0].content.parts[0].text;
            
            return this.parseMaintenanceAnalysis(analysis, context);
        } catch (error) {
            console.error('Error analyzing photo with Gemini:', error);
            return this.getFallbackAnalysis(context);
        }
    }

    // Build context-aware prompt for maintenance analysis
    buildMaintenancePrompt(context) {
        const { category, description, property, unit } = context;
        
        return `You are an expert property maintenance analyst. Analyze this photo of a maintenance issue and provide detailed insights.

Context:
- Property: ${property || 'Unknown'}
- Unit: ${unit || 'Unknown'}
- Category: ${category || 'General'}
- Tenant Description: "${description || 'No description provided'}"

Please analyze the image and provide:

1. ISSUE IDENTIFICATION:
   - What specific maintenance issue(s) can you see?
   - What is the likely cause?

2. SEVERITY ASSESSMENT:
   - Rate severity: Low/Medium/High/Emergency
   - Explain why this severity level

3. SAFETY CONCERNS:
   - Are there any immediate safety hazards?
   - Does this require urgent attention?

4. REPAIR RECOMMENDATIONS:
   - What type of repair is needed?
   - Estimated time for repair
   - Special equipment or expertise required?

5. VENDOR MATCHING:
   - What type of specialist is needed? (plumber, electrician, etc.)
   - Any specific skills required?

6. COST ESTIMATION:
   - Rough cost range for the repair
   - Factors that might affect cost

7. PREVENTION TIPS:
   - How can this be prevented in the future?
   - Any maintenance recommendations?

Format your response as JSON with these exact keys:
{
    "issue": "description of the issue",
    "severity": "Low|Medium|High|Emergency",
    "safetyHazard": true|false,
    "safetyDetails": "any safety concerns",
    "repairType": "type of repair needed",
    "estimatedTime": "time estimate",
    "vendorType": "plumber|electrician|hvac|general|other",
    "specialSkills": ["skill1", "skill2"],
    "costRange": { "min": 100, "max": 500 },
    "preventionTips": ["tip1", "tip2"],
    "additionalNotes": "any other observations"
}`;
    }

    // Parse AI response into structured data
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
}

// Export service
window.GeminiVisionService = window.GeminiVisionService || (
    process.env.GEMINI_API_KEY ? GeminiVisionService : MockGeminiVisionService
);