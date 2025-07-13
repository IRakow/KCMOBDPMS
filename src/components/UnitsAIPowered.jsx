const UnitsAIPowered = () => {
    const [units, setUnits] = React.useState([]);
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [aiInsights, setAiInsights] = React.useState(null);
    const [aiRecommendations, setAiRecommendations] = React.useState([]);
    const [showAIAssistant, setShowAIAssistant] = React.useState(false);
    
    React.useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        try {
            const [propertiesResponse, unitsResponse] = await Promise.all([
                window.ApiService.get('/properties'),
                window.ApiService.get('/units')
            ]);
            
            const propertiesData = propertiesResponse?.results || propertiesResponse || [];
            const unitsData = unitsResponse?.results || unitsResponse || [];
            
            setProperties(propertiesData);
            setUnits(unitsData);
            
            // Generate AI insights after data loads
            if (unitsData.length > 0) {
                generateAIInsights(unitsData);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // AI-Powered Insights
    const generateAIInsights = async (unitsData) => {
        // Simulate AI analysis (replace with actual AI API call)
        const insights = {
            optimalRentPrices: analyzeMarketRates(unitsData),
            maintenancePredictions: predictMaintenanceNeeds(unitsData),
            tenantRiskScores: analyzeTenantRisks(unitsData),
            marketingRecommendations: generateMarketingStrategy(unitsData),
            revenueOptimization: calculateRevenueOpportunities(unitsData)
        };
        
        setAiInsights(insights);
        generateRecommendations(insights);
    };
    
    const generateRecommendations = (insights) => {
        const recommendations = [];
        
        // Dynamic AI recommendations based on data
        if (insights.revenueOptimization.potentialIncrease > 5000) {
            recommendations.push({
                type: 'revenue',
                priority: 'high',
                title: 'Revenue Optimization Opportunity',
                description: `AI detected you could increase monthly revenue by $${insights.revenueOptimization.potentialIncrease.toLocaleString()}`,
                action: 'Adjust rent prices to market rates',
                units: insights.revenueOptimization.undervaluedUnits
            });
        }
        
        if (insights.maintenancePredictions.urgentUnits.length > 0) {
            recommendations.push({
                type: 'maintenance',
                priority: 'urgent',
                title: 'Preventive Maintenance Alert',
                description: `${insights.maintenancePredictions.urgentUnits.length} units likely need maintenance soon`,
                action: 'Schedule inspections',
                units: insights.maintenancePredictions.urgentUnits
            });
        }
        
        recommendations.push({
            type: 'marketing',
            priority: 'medium',
            title: 'Marketing Optimization',
            description: 'AI suggests updating property listings with seasonal keywords',
            action: 'Update listings now',
            units: units.filter(u => u.status === 'available').slice(0, 3)
        });
        
        setAiRecommendations(recommendations);
    };
    
    const getAIDataForUnit = (unit, insights) => {
        if (!insights) return { score: 85 };
        
        const baseScore = 75 + Math.random() * 20;
        const suggestedRent = unit.market_rent ? unit.market_rent * (1 + (Math.random() * 0.2 - 0.1)) : null;
        const maintenanceRisk = Math.random() > 0.7 ? Math.floor(Math.random() * 90) + 30 : null;
        const marketingScore = Math.floor(Math.random() * 40) + 60;
        
        return {
            score: Math.round(baseScore),
            suggestedRent: suggestedRent ? Math.round(suggestedRent) : null,
            maintenanceRisk,
            marketingScore
        };
    };
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading AI-powered insights...</p>
            </div>
        );
    }
    
    return (
        <div className="units-ai-container">
            {/* AI Assistant Button - Floating */}
            <button 
                className="ai-assistant-fab"
                onClick={() => setShowAIAssistant(!showAIAssistant)}
            >
                <i className="fas fa-robot"></i>
                <span className="ai-pulse"></span>
            </button>
            
            {/* AI Insights Banner */}
            <div className="ai-insights-banner">
                <div className="ai-banner-content">
                    <div className="ai-banner-icon">
                        <i className="fas fa-brain"></i>
                    </div>
                    <div className="ai-banner-text">
                        <h3>AI Property Intelligence Active</h3>
                        <p>Real-time analysis of {units.length} units across your portfolio</p>
                    </div>
                    <div className="ai-metrics">
                        <div className="ai-metric">
                            <span className="metric-label">AI Confidence</span>
                            <span className="metric-value">94%</span>
                        </div>
                        <div className="ai-metric">
                            <span className="metric-label">Predictions Made</span>
                            <span className="metric-value">127</span>
                        </div>
                        <div className="ai-metric">
                            <span className="metric-label">Revenue Found</span>
                            <span className="metric-value">$12.5k</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* AI Recommendations Cards */}
            {aiRecommendations.length > 0 && (
                <div className="ai-recommendations-section">
                    <h3 className="ai-section-title">
                        <i className="fas fa-lightbulb"></i>
                        AI Recommendations
                    </h3>
                    <div className="ai-recommendations-grid">
                        {aiRecommendations.map((rec, idx) => (
                            <AIRecommendationCard key={idx} recommendation={rec} />
                        ))}
                    </div>
                </div>
            )}
            
            {/* Smart Unit Cards with AI Indicators */}
            <div className="units-container">
                <div className="units-grid-ai">
                    {units.map(unit => (
                        <UnitCardWithAI 
                            key={unit.id} 
                            unit={unit} 
                            properties={properties}
                            aiData={getAIDataForUnit(unit, aiInsights)}
                        />
                    ))}
                </div>
            </div>
            
            {/* AI Assistant Sidebar */}
            {showAIAssistant && (
                <AIAssistantSidebar 
                    units={units}
                    insights={aiInsights}
                    onClose={() => setShowAIAssistant(false)}
                />
            )}
        </div>
    );
};

// AI Recommendation Card Component
const AIRecommendationCard = ({ recommendation }) => {
    const [expanded, setExpanded] = React.useState(false);
    
    return (
        <div className={`ai-recommendation-card ${recommendation.priority}`}>
            <div className="rec-header">
                <div className="rec-icon">
                    {recommendation.type === 'revenue' && <i className="fas fa-dollar-sign"></i>}
                    {recommendation.type === 'maintenance' && <i className="fas fa-tools"></i>}
                    {recommendation.type === 'marketing' && <i className="fas fa-bullhorn"></i>}
                </div>
                <div className="rec-content">
                    <h4>{recommendation.title}</h4>
                    <p>{recommendation.description}</p>
                </div>
                <button className="rec-action" onClick={() => setExpanded(!expanded)}>
                    {recommendation.action}
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>
            {expanded && (
                <div className="rec-details">
                    <h5>Affected Units:</h5>
                    <div className="affected-units">
                        {recommendation.units?.map(unit => (
                            <span key={unit.id || Math.random()} className="unit-tag">
                                Unit {unit.unit_number || unit.id}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Enhanced Unit Card with AI
const UnitCardWithAI = ({ unit, properties, aiData }) => {
    const getPropertyName = () => {
        const property = properties.find(p => p.id === unit.property_id);
        return property ? property.name : 'Unknown Property';
    };
    
    const getScoreColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 75) return '#3b82f6';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
    };
    
    return (
        <div className="unit-card-ai">
            {/* AI Score Badge */}
            <div className="ai-score-badge" style={{backgroundColor: getScoreColor(aiData.score)}}>
                <i className="fas fa-brain"></i>
                {aiData.score}%
            </div>
            
            {/* Standard unit info */}
            <div className="unit-header">
                <h3>Unit {unit.unit_number}</h3>
                <p>{getPropertyName()}</p>
            </div>
            
            {/* Unit Specs */}
            <div className="unit-specs">
                <div className="spec">
                    <i className="fas fa-bed"></i>
                    <span>{unit.bedrooms || 0} Bed</span>
                </div>
                <div className="spec">
                    <i className="fas fa-bath"></i>
                    <span>{unit.bathrooms || 0} Bath</span>
                </div>
                <div className="spec">
                    <i className="fas fa-ruler-combined"></i>
                    <span>{unit.square_feet || 0} sqft</span>
                </div>
            </div>
            
            {/* AI Insights for this unit */}
            <div className="ai-unit-insights">
                {aiData.suggestedRent && (
                    <div className="ai-insight-item">
                        <i className="fas fa-chart-line"></i>
                        <span>Suggested rent: ${aiData.suggestedRent}</span>
                        {aiData.suggestedRent > (unit.market_rent || 0) && (
                            <span className="potential-increase">
                                +${aiData.suggestedRent - (unit.market_rent || 0)}/mo
                            </span>
                        )}
                    </div>
                )}
                
                {aiData.maintenanceRisk && (
                    <div className="ai-insight-item warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>Maintenance likely in {aiData.maintenanceRisk} days</span>
                    </div>
                )}
                
                {aiData.marketingScore && (
                    <div className="ai-insight-item">
                        <i className="fas fa-bullhorn"></i>
                        <span>Marketing effectiveness: {aiData.marketingScore}%</span>
                    </div>
                )}
            </div>
            
            {/* Current Rent */}
            <div className="unit-footer">
                <div className="rent-info">
                    <span className="rent-amount">${unit.market_rent || 0}</span>
                    <span className="rent-period">/month</span>
                </div>
                <div className="unit-status">
                    <span className={`status-badge ${unit.status}`}>
                        {unit.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                </div>
            </div>
            
            {/* AI-Powered Actions */}
            <div className="ai-actions">
                <button className="ai-action-btn">
                    <i className="fas fa-magic"></i>
                    AI Optimize
                </button>
                <button className="ai-action-btn">
                    <i className="fas fa-chart-bar"></i>
                    Predict
                </button>
            </div>
        </div>
    );
};

// AI Assistant Sidebar
const AIAssistantSidebar = ({ units, insights, onClose }) => {
    const [query, setQuery] = React.useState('');
    const [conversation, setConversation] = React.useState([
        {
            type: 'ai',
            message: "Hi! I'm your AI property assistant. I can help you optimize rents, predict maintenance, find revenue opportunities, and more. What would you like to know?"
        }
    ]);
    
    const generateAIResponse = (query, units, insights) => {
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('rent') || lowerQuery.includes('price')) {
            return `Based on my analysis of ${units.length} units, I recommend increasing rents on 3 undervalued units by an average of $125/month. This could generate an additional $375 monthly revenue. Would you like specific recommendations?`;
        }
        
        if (lowerQuery.includes('maintenance')) {
            const maintenanceUnits = Math.floor(units.length * 0.2);
            return `I've identified ${maintenanceUnits} units that may need preventive maintenance within the next 60 days. Early intervention could save you approximately $2,400 in emergency repairs. Shall I prioritize them by urgency?`;
        }
        
        if (lowerQuery.includes('vacant') || lowerQuery.includes('empty')) {
            const vacantUnits = units.filter(u => u.status === 'available').length;
            return `You currently have ${vacantUnits} vacant units. Based on market trends, I suggest adjusting pricing on 2 units and enhancing marketing for faster leasing. Expected time to lease: 18 days with my recommendations.`;
        }
        
        if (lowerQuery.includes('revenue') || lowerQuery.includes('income')) {
            const totalRevenue = units.reduce((sum, u) => sum + (u.market_rent || 0), 0);
            return `Your current portfolio generates $${totalRevenue.toLocaleString()}/month. I've identified $12,500 in potential additional monthly revenue through rent optimization, reduced vacancy, and operational efficiency improvements.`;
        }
        
        return `Great question! I'm analyzing your portfolio data to provide the best insights. With ${units.length} units under management, I can help with rent optimization, maintenance predictions, vacancy reduction, and revenue maximization. What specific area interests you most?`;
    };
    
    const handleQuery = async () => {
        if (!query.trim()) return;
        
        // Add user message
        const newUserMessage = { type: 'user', message: query };
        setConversation(prev => [...prev, newUserMessage]);
        
        // Clear input immediately
        const currentQuery = query;
        setQuery('');
        
        // Simulate AI response
        setTimeout(() => {
            const aiResponse = generateAIResponse(currentQuery, units, insights);
            setConversation(prev => [...prev, { type: 'ai', message: aiResponse }]);
        }, 1000);
    };
    
    return (
        <div className="ai-assistant-sidebar">
            <div className="ai-sidebar-header">
                <h3>
                    <i className="fas fa-robot"></i>
                    AI Property Assistant
                </h3>
                <button className="close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <div className="ai-conversation">
                {conversation.map((msg, idx) => (
                    <div key={idx} className={`ai-message ${msg.type}`}>
                        {msg.type === 'ai' && <i className="fas fa-robot"></i>}
                        <div className="message-content">{msg.message}</div>
                    </div>
                ))}
            </div>
            
            <div className="ai-input-area">
                <input
                    type="text"
                    placeholder="Ask me anything about your properties..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                />
                <button onClick={handleQuery}>
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};

// AI Analysis Helper Functions
const analyzeMarketRates = (units) => {
    return {
        averageRent: units.reduce((sum, u) => sum + (u.market_rent || 0), 0) / units.length,
        undervaluedUnits: units.filter(u => Math.random() > 0.7).slice(0, 3),
        marketTrend: 'increasing'
    };
};

const predictMaintenanceNeeds = (units) => {
    return {
        urgentUnits: units.filter(u => Math.random() > 0.8).slice(0, 2),
        scheduledMaintenance: units.filter(u => Math.random() > 0.6).slice(0, 5),
        estimatedCosts: Math.floor(Math.random() * 5000) + 2000
    };
};

const analyzeTenantRisks = (units) => {
    return {
        highRiskTenants: units.filter(u => u.status === 'occupied' && Math.random() > 0.9),
        paymentHistoryScore: Math.floor(Math.random() * 20) + 80,
        renewalProbability: Math.floor(Math.random() * 30) + 70
    };
};

const generateMarketingStrategy = (units) => {
    return {
        optimizedListings: units.filter(u => u.status === 'available'),
        suggestedKeywords: ['luxury', 'modern', 'updated', 'convenient'],
        expectedLeaseTime: Math.floor(Math.random() * 30) + 15
    };
};

const calculateRevenueOpportunities = (units) => {
    return {
        potentialIncrease: Math.floor(Math.random() * 10000) + 5000,
        undervaluedUnits: units.filter(u => Math.random() > 0.6).slice(0, 4),
        optimizationScore: Math.floor(Math.random() * 30) + 70
    };
};