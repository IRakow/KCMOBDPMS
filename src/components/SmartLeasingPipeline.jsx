// SmartLeasingPipeline.jsx - AI-powered application scoring
const SmartLeasingPipeline = () => {
    const [pipeline, setPipeline] = React.useState({
        inquiries: [],
        applications: [],
        approved: [],
        leases: []
    });
    const [selectedStage, setSelectedStage] = React.useState('applications');
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        loadPipeline();
    }, []);
    
    const loadPipeline = async () => {
        try {
            setLoading(true);
            const data = await window.ApiService.get('/api/leasing-pipeline');
            
            // AI scores each application
            const scoredApplications = await Promise.all(
                (data.applications || []).map(async (app) => {
                    try {
                        const score = await window.ApiService.post('/api/ai/score-application', {
                            application: app
                        });
                        return { ...app, ai_score: score };
                    } catch (error) {
                        console.error('Failed to score application:', error);
                        return { ...app, ai_score: null };
                    }
                })
            );
            
            setPipeline({
                ...data,
                applications: scoredApplications.sort((a, b) => 
                    (b.ai_score?.score || 0) - (a.ai_score?.score || 0)
                )
            });
        } catch (error) {
            window.Toast.error('Failed to load pipeline data');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading AI-powered pipeline...</p>
            </div>
        );
    }
    
    return (
        <div className="smart-leasing-pipeline">
            <div className="pipeline-header">
                <h1>AI-Powered Leasing Pipeline</h1>
                <div className="pipeline-stats">
                    <div className="stat">
                        <span className="stat-value">{pipeline.inquiries?.length || 0}</span>
                        <span className="stat-label">Active Inquiries</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{pipeline.applications?.length || 0}</span>
                        <span className="stat-label">Applications</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">
                            {pipeline.applications?.filter(a => a.ai_score?.score > 80).length || 0}
                        </span>
                        <span className="stat-label">Recommended by AI</span>
                    </div>
                </div>
            </div>
            
            {selectedStage === 'applications' && (
                <div className="applications-view">
                    <div className="view-header">
                        <h2>Applications - AI Scored & Ranked</h2>
                        <div className="score-legend">
                            <span className="legend-item recommended">
                                <span className="color-box"></span>
                                80-100: Recommended
                            </span>
                            <span className="legend-item moderate">
                                <span className="color-box"></span>
                                60-79: Review Needed
                            </span>
                            <span className="legend-item risky">
                                <span className="color-box"></span>
                                0-59: High Risk
                            </span>
                        </div>
                    </div>
                    
                    <div className="applications-list">
                        {pipeline.applications.map(app => (
                            <ApplicationCard 
                                key={app.id}
                                application={app}
                                aiScore={app.ai_score}
                                onUpdate={loadPipeline}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Application Card with AI Scoring
const ApplicationCard = ({ application, aiScore, onUpdate }) => {
    const [expanded, setExpanded] = React.useState(false);
    const scoreClass = !aiScore ? 'pending' :
                      aiScore.score >= 80 ? 'recommended' : 
                      aiScore.score >= 60 ? 'moderate' : 'risky';
    
    const handleApprove = async () => {
        try {
            await window.ApiService.post(`/api/applications/${application.id}/approve`, {
                ai_score: aiScore,
                approved_by: 'manager'
            });
            window.Toast.success('Application approved!');
            onUpdate();
        } catch (error) {
            window.Toast.error('Failed to approve application');
        }
    };
    
    const handleDeny = async () => {
        try {
            await window.ApiService.post(`/api/applications/${application.id}/deny`, {
                ai_score: aiScore,
                denied_by: 'manager'
            });
            window.Toast.success('Application denied');
            onUpdate();
        } catch (error) {
            window.Toast.error('Failed to deny application');
        }
    };
    
    return (
        <div className={`application-card ${scoreClass}`}>
            <div className="app-header">
                <div className="applicant-info">
                    <h3>{application.first_name} {application.last_name}</h3>
                    <p>{application.email} • {application.phone}</p>
                    <p className="unit-applied">Applied for: Unit {application.unit_number}</p>
                </div>
                
                <div className="ai-score-display">
                    {aiScore ? (
                        <div className={`score-circle ${scoreClass}`}>
                            <span className="score-number">{aiScore.score}</span>
                            <span className="score-label">AI Score</span>
                        </div>
                    ) : (
                        <div className="score-circle pending">
                            <span className="score-label">Scoring...</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* AI Summary */}
            {aiScore && (
                <div className="ai-summary">
                    <h4>
                        <i className="fas fa-robot"></i>
                        AI Analysis Summary
                    </h4>
                    <div className="summary-grid">
                        <div className="summary-item">
                            <span className="label">Income Verification:</span>
                            <span className={`value ${aiScore.income_verified ? 'verified' : 'unverified'}`}>
                                {aiScore.income_verified ? '✓ Verified' : '⚠ Needs Verification'}
                            </span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Credit Score:</span>
                            <span className="value">{aiScore.credit_score || 'Pending'}</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Rent-to-Income:</span>
                            <span className="value">{aiScore.rent_to_income_ratio}%</span>
                        </div>
                        <div className="summary-item">
                            <span className="label">Background Check:</span>
                            <span className={`value ${aiScore.background_clear ? 'clear' : 'flagged'}`}>
                                {aiScore.background_clear ? '✓ Clear' : '⚠ Review Needed'}
                            </span>
                        </div>
                    </div>
                    
                    {aiScore.flags && aiScore.flags.length > 0 && (
                        <div className="ai-flags">
                            <h5>Risk Factors:</h5>
                            <ul>
                                {aiScore.flags.map((flag, idx) => (
                                    <li key={idx} className="flag-item">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        {flag}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {aiScore.strengths && aiScore.strengths.length > 0 && (
                        <div className="ai-strengths">
                            <h5>Strengths:</h5>
                            <ul>
                                {aiScore.strengths.map((strength, idx) => (
                                    <li key={idx} className="strength-item">
                                        <i className="fas fa-check-circle"></i>
                                        {strength}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
            
            <div className="app-actions">
                <button 
                    className="btn-expand"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'Hide Details' : 'View Full Application'}
                </button>
                <button 
                    className="btn-approve"
                    onClick={handleApprove}
                >
                    <i className="fas fa-check"></i>
                    Approve
                </button>
                <button 
                    className="btn-deny"
                    onClick={handleDeny}
                >
                    <i className="fas fa-times"></i>
                    Deny
                </button>
                <button className="btn-request-info">
                    <i className="fas fa-info-circle"></i>
                    Request More Info
                </button>
            </div>
        </div>
    );
};

// Register components
window.AppModules = window.AppModules || {};
window.AppModules.SmartLeasingPipeline = SmartLeasingPipeline;
window.AppModules.ApplicationCard = ApplicationCard;