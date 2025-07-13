const AutomationHub = () => {
    const [automations, setAutomations] = React.useState([
        {
            id: 1,
            name: "Smart Rent Collection",
            description: "AI follows up with late payments, sends reminders, and escalates intelligently",
            enabled: true,
            stats: { saved_hours: 12, money_collected: 45000, success_rate: 94 },
            icon: "fa-dollar-sign",
            color: "gradient-success"
        },
        {
            id: 2,
            name: "Maintenance Triage AI",
            description: "Automatically categorizes, prioritizes, and assigns maintenance requests",
            enabled: true,
            stats: { requests_handled: 234, avg_response_time: "2 mins", tenant_satisfaction: 98 },
            icon: "fa-tools",
            color: "gradient-warning"
        },
        {
            id: 3,
            name: "Intelligent Tenant Screening",
            description: "AI analyzes applications, runs background checks, and ranks candidates",
            enabled: false,
            stats: { applications_processed: 89, bad_tenants_avoided: 12, time_saved: "8 hrs/week" },
            icon: "fa-user-check",
            color: "gradient-primary"
        },
        {
            id: 4,
            name: "Dynamic Pricing Engine",
            description: "AI continuously adjusts rent prices based on market data and demand",
            enabled: true,
            stats: { revenue_increase: "18%", units_optimized: 47, market_analysis: "Daily" },
            icon: "fa-chart-line",
            color: "gradient-purple"
        },
        {
            id: 5,
            name: "Vacancy Prevention AI",
            description: "Predicts tenant churn and automatically triggers retention campaigns",
            enabled: true,
            stats: { churn_reduced: "31%", tenants_retained: 23, campaigns_sent: 156 },
            icon: "fa-home",
            color: "gradient-blue"
        },
        {
            id: 6,
            name: "Energy Optimization",
            description: "Smart building controls that learn patterns and reduce utility costs",
            enabled: false,
            stats: { energy_saved: "24%", cost_reduction: "$3,200", carbon_offset: "2.1 tons" },
            icon: "fa-leaf",
            color: "gradient-green"
        }
    ]);
    
    const [showBuilder, setShowBuilder] = React.useState(false);
    const [selectedAutomation, setSelectedAutomation] = React.useState(null);
    
    const toggleAutomation = (id) => {
        setAutomations(prev => prev.map(auto => 
            auto.id === id ? { ...auto, enabled: !auto.enabled } : auto
        ));
        
        // Voice notification when toggling
        const automation = automations.find(a => a.id === id);
        if (automation && window.speechSynthesis) {
            const message = automation.enabled 
                ? `${automation.name} has been disabled`
                : `${automation.name} is now active and monitoring your properties`;
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    };
    
    const totalStats = React.useMemo(() => {
        const activeAutomations = automations.filter(a => a.enabled);
        return {
            savedHours: activeAutomations.reduce((sum, auto) => {
                if (auto.stats.saved_hours) return sum + auto.stats.saved_hours;
                if (auto.stats.time_saved?.includes('hrs')) {
                    return sum + parseInt(auto.stats.time_saved);
                }
                return sum + Math.floor(Math.random() * 10 + 5);
            }, 0),
            extraRevenue: activeAutomations.reduce((sum, auto) => {
                if (auto.stats.money_collected) return sum + auto.stats.money_collected;
                if (auto.stats.revenue_increase) return sum + 15000;
                return sum + Math.floor(Math.random() * 10000 + 5000);
            }, 0),
            successRate: Math.round(
                activeAutomations.reduce((sum, auto) => {
                    if (auto.stats.success_rate) return sum + auto.stats.success_rate;
                    if (auto.stats.tenant_satisfaction) return sum + auto.stats.tenant_satisfaction;
                    return sum + Math.floor(Math.random() * 10 + 85);
                }, 0) / activeAutomations.length
            )
        };
    }, [automations]);
    
    return (
        <div className="automation-hub">
            {/* Stunning Header */}
            <div className="automation-header-premium">
                <div className="header-background">
                    <div className="animated-grid"></div>
                    <div className="floating-particles"></div>
                </div>
                <div className="header-content">
                    <h1 className="header-title-glow">
                        <i className="fas fa-robot"></i>
                        Automation Center
                    </h1>
                    <p className="header-subtitle">
                        Your AI employees work 24/7, never take breaks, and get smarter every day
                    </p>
                    <div className="automation-stats-row">
                        <div className="stat-card-glow">
                            <div className="stat-value">{totalStats.savedHours} hrs</div>
                            <div className="stat-label">Saved This Month</div>
                        </div>
                        <div className="stat-card-glow">
                            <div className="stat-value">${(totalStats.extraRevenue / 1000).toFixed(1)}k</div>
                            <div className="stat-label">Extra Revenue</div>
                        </div>
                        <div className="stat-card-glow">
                            <div className="stat-value">{totalStats.successRate}%</div>
                            <div className="stat-label">Automation Success</div>
                        </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <button className="quick-action-btn primary">
                            <i className="fas fa-play"></i>
                            Run All Automations
                        </button>
                        <button className="quick-action-btn secondary">
                            <i className="fas fa-chart-bar"></i>
                            View Analytics
                        </button>
                        <button 
                            className="quick-action-btn tertiary"
                            onClick={() => setShowBuilder(true)}
                        >
                            <i className="fas fa-plus"></i>
                            Create Automation
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Active Automations */}
            <div className="automations-container">
                <div className="automations-grid">
                    {automations.map(automation => (
                        <AutomationCard 
                            key={automation.id} 
                            automation={automation}
                            onToggle={() => toggleAutomation(automation.id)}
                            onConfigure={() => setSelectedAutomation(automation)}
                        />
                    ))}
                    
                    {/* Add New Automation Card */}
                    <div 
                        className="automation-card add-new"
                        onClick={() => setShowBuilder(true)}
                    >
                        <div className="add-new-content">
                            <div className="add-new-icon">
                                <i className="fas fa-plus-circle"></i>
                            </div>
                            <h3>Create Custom Automation</h3>
                            <p>Build your own AI workflow with drag & drop</p>
                            <div className="add-new-features">
                                <span>• Triggers & Actions</span>
                                <span>• AI Decision Trees</span>
                                <span>• Custom Logic</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Automation Builder Modal */}
            {showBuilder && (
                <AutomationBuilder 
                    onClose={() => setShowBuilder(false)}
                    onSave={(newAutomation) => {
                        setAutomations(prev => [...prev, { ...newAutomation, id: Date.now() }]);
                        setShowBuilder(false);
                    }}
                />
            )}
            
            {/* Configuration Modal */}
            {selectedAutomation && (
                <AutomationConfig 
                    automation={selectedAutomation}
                    onClose={() => setSelectedAutomation(null)}
                    onSave={(updatedAutomation) => {
                        setAutomations(prev => prev.map(auto => 
                            auto.id === updatedAutomation.id ? updatedAutomation : auto
                        ));
                        setSelectedAutomation(null);
                    }}
                />
            )}
        </div>
    );
};

// Beautiful Automation Card
const AutomationCard = ({ automation, onToggle, onConfigure }) => {
    const [isProcessing, setIsProcessing] = React.useState(false);
    
    const handleToggle = async () => {
        setIsProcessing(true);
        setTimeout(() => {
            onToggle();
            setIsProcessing(false);
        }, 1500);
    };
    
    const formatStatValue = (value) => {
        if (typeof value === 'number') {
            if (value > 1000) return `${(value / 1000).toFixed(1)}k`;
            return value.toString();
        }
        return value;
    };
    
    const formatStatKey = (key) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    return (
        <div className={`automation-card ${automation.color} ${automation.enabled ? 'active' : 'inactive'} ${isProcessing ? 'processing' : ''}`}>
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="processing-overlay">
                    <div className="processing-spinner"></div>
                    <span>{automation.enabled ? 'Stopping...' : 'Starting...'}</span>
                </div>
            )}
            
            {/* Card Header */}
            <div className="automation-header">
                <div className="automation-icon">
                    <i className={`fas ${automation.icon}`}></i>
                </div>
                <div className="automation-status">
                    <span className={`status-indicator ${automation.enabled ? 'active' : 'inactive'}`}>
                        {automation.enabled ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </div>
                <div className="automation-toggle">
                    <label className="toggle-switch">
                        <input 
                            type="checkbox" 
                            checked={automation.enabled}
                            onChange={handleToggle}
                            disabled={isProcessing}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>
            </div>
            
            {/* Card Content */}
            <div className="automation-content">
                <h3 className="automation-name">{automation.name}</h3>
                <p className="automation-description">{automation.description}</p>
                
                {/* Performance Stats */}
                <div className="automation-stats">
                    {Object.entries(automation.stats).map(([key, value]) => (
                        <div key={key} className="stat-item">
                            <div className="stat-value">{formatStatValue(value)}</div>
                            <div className="stat-key">{formatStatKey(key)}</div>
                        </div>
                    ))}
                </div>
                
                {/* Action Buttons */}
                <div className="automation-actions">
                    <button 
                        className="automation-btn primary"
                        onClick={onConfigure}
                    >
                        <i className="fas fa-cog"></i>
                        Configure
                    </button>
                    <button className="automation-btn secondary">
                        <i className="fas fa-chart-bar"></i>
                        Analytics
                    </button>
                </div>
            </div>
            
            {/* Live Activity Indicator */}
            {automation.enabled && (
                <div className="live-activity">
                    <div className="activity-pulse"></div>
                    <span>Live Activity</span>
                </div>
            )}
        </div>
    );
};

// Automation Builder Modal
const AutomationBuilder = ({ onClose, onSave }) => {
    const [automationName, setAutomationName] = React.useState('');
    const [automationDescription, setAutomationDescription] = React.useState('');
    const [selectedTrigger, setSelectedTrigger] = React.useState('');
    const [selectedAction, setSelectedAction] = React.useState('');
    const [selectedIcon, setSelectedIcon] = React.useState('fa-robot');
    
    const triggers = [
        { id: 'payment_late', name: 'Payment is Late', icon: 'fa-clock' },
        { id: 'maintenance_request', name: 'Maintenance Request Submitted', icon: 'fa-tools' },
        { id: 'lease_expiring', name: 'Lease Expiring Soon', icon: 'fa-calendar' },
        { id: 'tenant_application', name: 'New Tenant Application', icon: 'fa-user-plus' },
        { id: 'vacancy_detected', name: 'Unit Becomes Vacant', icon: 'fa-home' }
    ];
    
    const actions = [
        { id: 'send_sms', name: 'Send SMS Message', icon: 'fa-sms' },
        { id: 'send_email', name: 'Send Email', icon: 'fa-envelope' },
        { id: 'create_task', name: 'Create Task', icon: 'fa-tasks' },
        { id: 'schedule_showing', name: 'Schedule Showing', icon: 'fa-calendar-plus' },
        { id: 'run_background_check', name: 'Run Background Check', icon: 'fa-shield-alt' }
    ];
    
    const iconOptions = [
        'fa-robot', 'fa-dollar-sign', 'fa-tools', 'fa-user-check', 'fa-chart-line',
        'fa-home', 'fa-leaf', 'fa-bell', 'fa-cog', 'fa-magic'
    ];
    
    const handleSave = () => {
        if (!automationName || !selectedTrigger || !selectedAction) return;
        
        const newAutomation = {
            name: automationName,
            description: automationDescription || `Automatically ${selectedAction.replace('_', ' ')} when ${selectedTrigger.replace('_', ' ')}`,
            enabled: false,
            stats: { 
                executions: 0, 
                success_rate: 100, 
                time_saved: "0 hrs" 
            },
            icon: selectedIcon,
            color: 'gradient-primary',
            trigger: selectedTrigger,
            action: selectedAction
        };
        
        onSave(newAutomation);
    };
    
    return (
        <div className="automation-builder-modal">
            <div className="builder-container">
                <div className="builder-header">
                    <h2>
                        <i className="fas fa-magic"></i>
                        Create Custom Automation
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="builder-content">
                    {/* Basic Info */}
                    <div className="builder-section">
                        <h3>Basic Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Automation Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Smart Late Fee Collection"
                                    value={automationName}
                                    onChange={(e) => setAutomationName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Icon</label>
                                <div className="icon-selector">
                                    {iconOptions.map(icon => (
                                        <button
                                            key={icon}
                                            className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                                            onClick={() => setSelectedIcon(icon)}
                                        >
                                            <i className={`fas ${icon}`}></i>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                placeholder="Describe what this automation does..."
                                value={automationDescription}
                                onChange={(e) => setAutomationDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Trigger Selection */}
                    <div className="builder-section">
                        <h3>When should this run?</h3>
                        <div className="trigger-grid">
                            {triggers.map(trigger => (
                                <div
                                    key={trigger.id}
                                    className={`trigger-card ${selectedTrigger === trigger.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedTrigger(trigger.id)}
                                >
                                    <i className={`fas ${trigger.icon}`}></i>
                                    <span>{trigger.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Action Selection */}
                    <div className="builder-section">
                        <h3>What should happen?</h3>
                        <div className="action-grid">
                            {actions.map(action => (
                                <div
                                    key={action.id}
                                    className={`action-card ${selectedAction === action.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedAction(action.id)}
                                >
                                    <i className={`fas ${action.icon}`}></i>
                                    <span>{action.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="builder-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="btn-primary"
                        onClick={handleSave}
                        disabled={!automationName || !selectedTrigger || !selectedAction}
                    >
                        <i className="fas fa-save"></i>
                        Create Automation
                    </button>
                </div>
            </div>
        </div>
    );
};

// Configuration Modal
const AutomationConfig = ({ automation, onClose, onSave }) => {
    const [settings, setSettings] = React.useState({
        frequency: 'immediate',
        conditions: [],
        notifications: true,
        escalation: false
    });
    
    return (
        <div className="automation-config-modal">
            <div className="config-container">
                <div className="config-header">
                    <h2>
                        <i className={`fas ${automation.icon}`}></i>
                        Configure {automation.name}
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="config-content">
                    <div className="config-section">
                        <h3>Execution Settings</h3>
                        <div className="setting-group">
                            <label>Frequency</label>
                            <select 
                                value={settings.frequency}
                                onChange={(e) => setSettings({...settings, frequency: e.target.value})}
                            >
                                <option value="immediate">Immediate</option>
                                <option value="hourly">Every Hour</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </div>
                        
                        <div className="setting-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications}
                                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                                />
                                Send notifications when automation runs
                            </label>
                        </div>
                        
                        <div className="setting-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={settings.escalation}
                                    onChange={(e) => setSettings({...settings, escalation: e.target.checked})}
                                />
                                Enable automatic escalation
                            </label>
                        </div>
                    </div>
                </div>
                
                <div className="config-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="btn-primary"
                        onClick={() => onSave({...automation, settings})}
                    >
                        <i className="fas fa-save"></i>
                        Save Configuration
                    </button>
                </div>
            </div>
        </div>
    );
};