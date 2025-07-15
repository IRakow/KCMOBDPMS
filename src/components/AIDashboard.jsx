// AIDashboard.jsx - AI Insights & Analytics Hub
const AIDashboard = () => {
    const [insights, setInsights] = React.useState([]);
    const [predictions, setPredictions] = React.useState([]);
    const [aiMetrics, setAiMetrics] = React.useState({});
    const [selectedTimeframe, setSelectedTimeframe] = React.useState('30d');
    const [activeTab, setActiveTab] = React.useState('overview');

    React.useEffect(() => {
        loadAIInsights();
    }, [selectedTimeframe]);

    const loadAIInsights = async () => {
        // Load mock AI insights
        setInsights(getMockInsights());
        setPredictions(getMockPredictions());
        setAiMetrics(getMockAIMetrics());
    };

    const getMockInsights = () => {
        return [
            {
                id: 1,
                type: 'revenue',
                title: 'Revenue Optimization Opportunity',
                description: 'AI suggests increasing rent by 3-5% for units 101-105 based on market analysis',
                confidence: 92,
                potential_impact: 12500,
                priority: 'high',
                category: 'pricing',
                action: 'Review rental rates for these units',
                icon: 'fa-chart-line'
            },
            {
                id: 2,
                type: 'maintenance',
                title: 'Predictive Maintenance Alert',
                description: 'HVAC systems in Building A likely to need service within 30 days',
                confidence: 87,
                potential_impact: 8500,
                priority: 'medium',
                category: 'maintenance',
                action: 'Schedule preventive maintenance',
                icon: 'fa-tools'
            },
            {
                id: 3,
                type: 'vacancy',
                title: 'Lease Renewal Risk',
                description: '3 high-value tenants show behavioral patterns indicating potential non-renewal',
                confidence: 78,
                potential_impact: 15200,
                priority: 'high',
                category: 'retention',
                action: 'Proactive retention outreach',
                icon: 'fa-user-times'
            },
            {
                id: 4,
                type: 'energy',
                title: 'Energy Efficiency Gains',
                description: 'Smart thermostat data suggests 18% energy savings possible with schedule optimization',
                confidence: 94,
                potential_impact: 3200,
                priority: 'medium',
                category: 'sustainability',
                action: 'Implement smart scheduling',
                icon: 'fa-leaf'
            },
            {
                id: 5,
                type: 'marketing',
                title: 'Marketing Channel Performance',
                description: 'AI analysis shows Zillow listings 40% more effective than Craigslist for your property type',
                confidence: 89,
                potential_impact: 5600,
                priority: 'low',
                category: 'marketing',
                action: 'Reallocate marketing budget',
                icon: 'fa-bullhorn'
            }
        ];
    };

    const getMockPredictions = () => {
        return [
            {
                metric: 'occupancy_rate',
                current: 94.2,
                predicted_30d: 92.8,
                predicted_90d: 95.1,
                trend: 'stable',
                confidence: 85
            },
            {
                metric: 'maintenance_costs',
                current: 12500,
                predicted_30d: 14200,
                predicted_90d: 38900,
                trend: 'increasing',
                confidence: 91
            },
            {
                metric: 'rental_income',
                current: 145000,
                predicted_30d: 147200,
                predicted_90d: 152800,
                trend: 'increasing',
                confidence: 88
            },
            {
                metric: 'vacancy_days',
                current: 23,
                predicted_30d: 19,
                predicted_90d: 15,
                trend: 'improving',
                confidence: 82
            }
        ];
    };

    const getMockAIMetrics = () => {
        return {
            total_savings: 47500,
            automation_hours: 156,
            prediction_accuracy: 89.2,
            ai_recommendations: 23,
            implemented_suggestions: 18,
            roi_improvement: 15.7
        };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getInsightIcon = (category) => {
        const icons = {
            pricing: 'fa-dollar-sign',
            maintenance: 'fa-tools',
            retention: 'fa-users',
            sustainability: 'fa-leaf',
            marketing: 'fa-bullhorn'
        };
        return icons[category] || 'fa-lightbulb';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
        };
        return colors[priority] || '#6b7280';
    };

    return (
        <div className="ai-dashboard">
            {/* Header */}
            <div className="ai-dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1 className="dashboard-title">
                            <i className="fas fa-brain"></i>
                            AI Insights
                        </h1>
                        <p className="dashboard-subtitle">
                            AI-powered analytics and predictive insights for your properties
                        </p>
                    </div>
                    <div className="header-right">
                        <select 
                            value={selectedTimeframe}
                            onChange={(e) => setSelectedTimeframe(e.target.value)}
                            className="timeframe-select"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                            <option value="1y">Last Year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* AI Metrics Cards */}
            <div className="ai-metrics-grid">
                <div className="ai-metric-card">
                    <div className="metric-icon savings">
                        <i className="fas fa-piggy-bank"></i>
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{formatCurrency(aiMetrics.total_savings)}</div>
                        <div className="metric-label">AI-Generated Savings</div>
                    </div>
                </div>
                
                <div className="ai-metric-card">
                    <div className="metric-icon automation">
                        <i className="fas fa-robot"></i>
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{aiMetrics.automation_hours}h</div>
                        <div className="metric-label">Hours Automated</div>
                    </div>
                </div>
                
                <div className="ai-metric-card">
                    <div className="metric-icon accuracy">
                        <i className="fas fa-target"></i>
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">{aiMetrics.prediction_accuracy}%</div>
                        <div className="metric-label">Prediction Accuracy</div>
                    </div>
                </div>
                
                <div className="ai-metric-card">
                    <div className="metric-icon roi">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="metric-content">
                        <div className="metric-value">+{aiMetrics.roi_improvement}%</div>
                        <div className="metric-label">ROI Improvement</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="ai-tabs">
                <button 
                    className={`ai-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    <i className="fas fa-eye"></i>
                    Overview
                </button>
                <button 
                    className={`ai-tab ${activeTab === 'insights' ? 'active' : ''}`}
                    onClick={() => setActiveTab('insights')}
                >
                    <i className="fas fa-lightbulb"></i>
                    Insights
                </button>
                <button 
                    className={`ai-tab ${activeTab === 'predictions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('predictions')}
                >
                    <i className="fas fa-crystal-ball"></i>
                    Predictions
                </button>
            </div>

            {/* Tab Content */}
            <div className="ai-tab-content">
                {activeTab === 'overview' && (
                    <div className="overview-tab">
                        <div className="insights-summary">
                            <h3>Recent AI Activity</h3>
                            <div className="activity-stats">
                                <div className="stat">
                                    <span className="stat-number">{aiMetrics.ai_recommendations}</span>
                                    <span className="stat-label">Recommendations Made</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{aiMetrics.implemented_suggestions}</span>
                                    <span className="stat-label">Suggestions Implemented</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">
                                        {Math.round((aiMetrics.implemented_suggestions / aiMetrics.ai_recommendations) * 100)}%
                                    </span>
                                    <span className="stat-label">Implementation Rate</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'insights' && (
                    <div className="insights-tab">
                        <div className="insights-list">
                            {insights.map(insight => (
                                <div key={insight.id} className="insight-card">
                                    <div className="insight-header">
                                        <div className="insight-icon" style={{ color: getPriorityColor(insight.priority) }}>
                                            <i className={`fas ${insight.icon}`}></i>
                                        </div>
                                        <div className="insight-title-section">
                                            <h4 className="insight-title">{insight.title}</h4>
                                            <div className="insight-meta">
                                                <span className={`priority-badge ${insight.priority}`}>
                                                    {insight.priority.toUpperCase()}
                                                </span>
                                                <span className="confidence-badge">
                                                    {insight.confidence}% confidence
                                                </span>
                                            </div>
                                        </div>
                                        <div className="insight-impact">
                                            <div className="impact-value">{formatCurrency(insight.potential_impact)}</div>
                                            <div className="impact-label">Potential Impact</div>
                                        </div>
                                    </div>
                                    <div className="insight-body">
                                        <p className="insight-description">{insight.description}</p>
                                        <div className="insight-actions">
                                            <button className="action-btn primary">
                                                <i className="fas fa-play"></i>
                                                {insight.action}
                                            </button>
                                            <button className="action-btn secondary">
                                                <i className="fas fa-info-circle"></i>
                                                Learn More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'predictions' && (
                    <div className="predictions-tab">
                        <div className="predictions-grid">
                            {predictions.map(prediction => (
                                <div key={prediction.metric} className="prediction-card">
                                    <div className="prediction-header">
                                        <h4 className="prediction-title">
                                            {prediction.metric.replace('_', ' ').toUpperCase()}
                                        </h4>
                                        <div className={`trend-indicator ${prediction.trend}`}>
                                            <i className={`fas fa-arrow-${
                                                prediction.trend === 'increasing' ? 'up' : 
                                                prediction.trend === 'improving' ? 'up' : 
                                                prediction.trend === 'stable' ? 'right' : 'down'
                                            }`}></i>
                                            {prediction.trend}
                                        </div>
                                    </div>
                                    <div className="prediction-values">
                                        <div className="value-item current">
                                            <span className="value-label">Current</span>
                                            <span className="value-number">
                                                {prediction.metric.includes('rate') || prediction.metric.includes('occupancy') 
                                                    ? `${prediction.current}%` 
                                                    : prediction.metric.includes('cost') || prediction.metric.includes('income')
                                                    ? formatCurrency(prediction.current)
                                                    : prediction.current
                                                }
                                            </span>
                                        </div>
                                        <div className="value-item predicted">
                                            <span className="value-label">30-Day Forecast</span>
                                            <span className="value-number">
                                                {prediction.metric.includes('rate') || prediction.metric.includes('occupancy') 
                                                    ? `${prediction.predicted_30d}%` 
                                                    : prediction.metric.includes('cost') || prediction.metric.includes('income')
                                                    ? formatCurrency(prediction.predicted_30d)
                                                    : prediction.predicted_30d
                                                }
                                            </span>
                                        </div>
                                    </div>
                                    <div className="prediction-confidence">
                                        <div className="confidence-bar">
                                            <div 
                                                className="confidence-fill" 
                                                style={{ width: `${prediction.confidence}%` }}
                                            ></div>
                                        </div>
                                        <span className="confidence-text">{prediction.confidence}% accurate</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.AIDashboard = AIDashboard;