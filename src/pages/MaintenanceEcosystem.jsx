// MaintenanceEcosystem.jsx - World-Class AI-Powered Maintenance System
const MaintenanceEcosystem = () => {
    const [activeView, setActiveView] = React.useState('dashboard');
    const [currentRequest, setCurrentRequest] = React.useState(null);
    const [aiConversation, setAiConversation] = React.useState([]);
    const [maintenanceData, setMaintenanceData] = React.useState({
        tickets: [],
        vendors: [],
        analytics: {}
    });

    // AI Triage System - Better than MagicDoor
    const AITriageEngine = {
        categories: {
            electrical: {
                icon: '⚡',
                color: '#f59e0b',
                questions: [
                    {
                        id: 'scope',
                        question: 'Is the issue affecting one outlet, one room, or multiple rooms?',
                        options: ['One outlet', 'One room', 'Multiple rooms', 'Entire unit'],
                        followUp: {
                            'One outlet': {
                                solution: 'Try resetting the GFCI outlet. Look for a small "Reset" button on the outlet itself or nearby outlets (often in bathrooms/kitchens). Press it firmly.',
                                canResolve: true,
                                priority: 20
                            },
                            'One room': {
                                question: 'Have you checked your circuit breaker panel?',
                                priority: 40
                            },
                            'Multiple rooms': {
                                escalate: true,
                                priority: 80,
                                vendorType: 'electrical'
                            },
                            'Entire unit': {
                                escalate: true,
                                priority: 95,
                                emergency: true,
                                vendorType: 'electrical'
                            }
                        }
                    }
                ]
            },
            plumbing: {
                icon: '🚿',
                color: '#3b82f6',
                questions: [
                    {
                        id: 'type',
                        question: 'What type of plumbing issue are you experiencing?',
                        options: ['Leak/Water damage', 'Clogged drain', 'No hot water', 'Low water pressure'],
                        followUp: {
                            'Leak/Water damage': {
                                question: 'How severe is the leak?',
                                options: ['Dripping', 'Steady stream', 'Flooding'],
                                priority: { 'Dripping': 60, 'Steady stream': 85, 'Flooding': 100 },
                                emergency: { 'Flooding': true }
                            },
                            'Clogged drain': {
                                solution: 'Try using a plunger first. For sinks, ensure the overflow hole is covered. For tough clogs, try 1/2 cup baking soda followed by 1/2 cup vinegar, wait 30 min, then flush with hot water.',
                                canResolve: true,
                                priority: 30
                            }
                        }
                    }
                ]
            },
            hvac: {
                icon: '❄️',
                color: '#ef4444',
                questions: [
                    {
                        id: 'issue',
                        question: 'What\'s wrong with your heating/cooling?',
                        options: ['Not cooling', 'Not heating', 'Strange noise', 'Bad smell'],
                        followUp: {
                            'Not cooling': {
                                question: 'Have you checked if the thermostat is set to "Cool" and the temperature is set below room temperature?',
                                solution: 'Also check: 1) Air filter (replace if dirty), 2) Circuit breaker for AC unit, 3) Ensure all vents are open',
                                canResolve: true,
                                priority: 70
                            }
                        }
                    }
                ]
            },
            appliance: {
                icon: '🔧',
                color: '#10b981',
                questions: [
                    {
                        id: 'appliance',
                        question: 'Which appliance needs repair?',
                        options: ['Refrigerator', 'Dishwasher', 'Washer/Dryer', 'Oven/Stove'],
                        followUp: {
                            'Refrigerator': {
                                question: 'What\'s the issue?',
                                options: ['Not cooling', 'Making noise', 'Leaking water', 'Ice maker broken']
                            }
                        }
                    }
                ]
            },
            general: {
                icon: '🏠',
                color: '#6b7280',
                questions: []
            }
        },

        calculatePriority(category, answers) {
            let basePriority = 50;
            // Complex priority calculation based on multiple factors
            if (answers.includes('Flooding') || answers.includes('Entire unit')) {
                return 100;
            }
            if (answers.includes('Multiple rooms') || answers.includes('Steady stream')) {
                return 85;
            }
            // Add time-based urgency
            const hour = new Date().getHours();
            if (hour < 7 || hour > 22) basePriority += 10; // After hours
            
            return Math.min(basePriority, 100);
        },

        generateTicket(category, description, priority, photos = []) {
            return {
                id: Date.now(),
                category,
                description,
                priority,
                status: 'pending_assignment',
                created: new Date().toISOString(),
                tenant: { name: 'Current Tenant', unit: '101' },
                photos,
                aiNotes: aiConversation,
                estimatedCost: this.estimateCost(category, priority)
            };
        },

        estimateCost(category, priority) {
            const baseCosts = {
                electrical: { min: 75, max: 300 },
                plumbing: { min: 100, max: 500 },
                hvac: { min: 150, max: 800 },
                appliance: { min: 80, max: 400 },
                general: { min: 50, max: 200 }
            };
            const range = baseCosts[category] || baseCosts.general;
            return {
                min: range.min,
                max: priority > 80 ? range.max * 1.5 : range.max
            };
        }
    };

    // Smart Vendor Matching Engine
    const VendorMatchingEngine = {
        vendors: [
            {
                id: 1,
                name: "ProElectric Solutions",
                specialties: ['electrical'],
                rating: 4.8,
                responseTime: 2, // hours
                availability: 'available',
                preferred: true,
                rates: { hourly: 85, emergency: 150 },
                certifications: ['Licensed Electrician', 'EPA Certified']
            },
            {
                id: 2,
                name: "QuickFix Plumbing",
                specialties: ['plumbing'],
                rating: 4.6,
                responseTime: 1,
                availability: '24/7',
                preferred: false,
                rates: { hourly: 95, emergency: 180 }
            },
            {
                id: 3,
                name: "AllTemp HVAC",
                specialties: ['hvac'],
                rating: 4.9,
                responseTime: 4,
                availability: 'business_hours',
                preferred: true,
                rates: { hourly: 110, emergency: 200 },
                certifications: ['NATE Certified', 'EPA 608']
            }
        ],

        matchVendor(ticket) {
            const eligibleVendors = this.vendors.filter(v => 
                v.specialties.includes(ticket.category)
            );

            // Score vendors based on multiple factors
            const scoredVendors = eligibleVendors.map(vendor => {
                let score = 0;
                
                // Preference bonus
                if (vendor.preferred) score += 30;
                
                // Rating bonus (0-50 points)
                score += vendor.rating * 10;
                
                // Response time (faster = better)
                score += Math.max(0, 20 - vendor.responseTime * 5);
                
                // Availability bonus
                if (vendor.availability === '24/7') score += 20;
                else if (vendor.availability === 'available') score += 10;
                
                // Cost consideration (lower = better)
                const costScore = 100 - vendor.rates.hourly;
                score += costScore * 0.2;
                
                // Emergency availability for high priority
                if (ticket.priority > 80 && vendor.availability === '24/7') {
                    score += 25;
                }
                
                return { ...vendor, matchScore: score };
            });

            return scoredVendors.sort((a, b) => b.matchScore - a.matchScore);
        }
    };

    // Render the main dashboard
    const renderDashboard = () => (
        <div className="maintenance-dashboard">
            <div className="dashboard-header">
                <h1>AI-Powered Maintenance Hub</h1>
                <div className="dashboard-stats">
                    <div className="stat-card urgent">
                        <div className="stat-icon">🚨</div>
                        <div className="stat-content">
                            <div className="stat-value">3</div>
                            <div className="stat-label">Urgent Issues</div>
                        </div>
                    </div>
                    <div className="stat-card pending">
                        <div className="stat-icon">⏳</div>
                        <div className="stat-content">
                            <div className="stat-value">12</div>
                            <div className="stat-label">Pending</div>
                        </div>
                    </div>
                    <div className="stat-card resolved">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <div className="stat-value">89%</div>
                            <div className="stat-label">Resolution Rate</div>
                        </div>
                    </div>
                    <div className="stat-card ai-resolved">
                        <div className="stat-icon">🤖</div>
                        <div className="stat-content">
                            <div className="stat-value">42%</div>
                            <div className="stat-label">AI Resolved</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="quick-actions">
                    <button 
                        className="action-btn tenant-request"
                        onClick={() => setActiveView('tenant-request')}
                    >
                        <i className="fas fa-plus-circle"></i>
                        Tenant Request Portal
                    </button>
                    <button 
                        className="action-btn vendor-portal"
                        onClick={() => setActiveView('vendor-dashboard')}
                    >
                        <i className="fas fa-tools"></i>
                        Vendor Dashboard
                    </button>
                    <button 
                        className="action-btn preferences"
                        onClick={() => setActiveView('preferences')}
                    >
                        <i className="fas fa-cog"></i>
                        Vendor Preferences
                    </button>
                </div>

                <div className="tickets-overview">
                    <h2>Active Maintenance Tickets</h2>
                    <div className="tickets-grid">
                        {renderTicketCards()}
                    </div>
                </div>
            </div>
        </div>
    );

    // Tenant Self-Service Portal
    const renderTenantRequest = () => {
        const [step, setStep] = React.useState('category');
        const [selectedCategory, setSelectedCategory] = React.useState(null);
        const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
        const [answers, setAnswers] = React.useState([]);
        const [description, setDescription] = React.useState('');
        const [photos, setPhotos] = React.useState([]);

        const handleCategorySelect = (category) => {
            setSelectedCategory(category);
            setStep('ai-triage');
            // Initialize AI conversation
            setAiConversation([{
                type: 'ai',
                message: `I'll help you with your ${category} issue. Let me ask a few questions to see if we can resolve this quickly.`
            }]);
        };

        const handleAnswer = (answer) => {
            const newAnswers = [...answers, answer];
            setAnswers(newAnswers);
            
            // Check if we have a solution
            const question = AITriageEngine.categories[selectedCategory].questions[currentQuestionIndex];
            const followUp = question.followUp[answer];
            
            if (followUp && followUp.canResolve) {
                setAiConversation([...aiConversation, {
                    type: 'ai',
                    message: followUp.solution
                }]);
                setStep('ai-solution');
            } else if (followUp && followUp.escalate) {
                const priority = AITriageEngine.calculatePriority(selectedCategory, newAnswers);
                setCurrentRequest({
                    category: selectedCategory,
                    priority,
                    emergency: followUp.emergency
                });
                setStep('details');
            } else {
                // More questions needed
                if (currentQuestionIndex < AITriageEngine.categories[selectedCategory].questions.length - 1) {
                    setCurrentQuestionIndex(currentQuestionIndex + 1);
                } else {
                    setStep('details');
                }
            }
        };

        if (step === 'category') {
            return (
                <div className="tenant-maintenance-request">
                    <div className="request-step">
                        <h2>What type of issue are you experiencing?</h2>
                        <p>Select a category to get started</p>
                        
                        <div className="category-grid">
                            {Object.entries(AITriageEngine.categories).map(([key, cat]) => (
                                <div 
                                    key={key}
                                    className="category-card"
                                    style={{'--category-color': cat.color}}
                                    onClick={() => handleCategorySelect(key)}
                                >
                                    <div className="category-icon" style={{color: cat.color}}>
                                        {cat.icon}
                                    </div>
                                    <div className="category-name">
                                        {key.charAt(0).toUpperCase() + key.slice(1)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'ai-triage' && selectedCategory) {
            const question = AITriageEngine.categories[selectedCategory].questions[currentQuestionIndex];
            
            return (
                <div className="tenant-maintenance-request">
                    <div className="request-step">
                        <div className="ai-assistant">
                            <div className="ai-avatar">🤖</div>
                            <div className="ai-content">
                                <h3>AI Maintenance Assistant</h3>
                                <p>I'm here to help resolve your issue quickly</p>
                            </div>
                        </div>

                        <div className="ai-question">
                            <h4>{question.question}</h4>
                            <div className="answer-options">
                                {question.options.map(option => (
                                    <button
                                        key={option}
                                        className="option-btn"
                                        onClick={() => handleAnswer(option)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'ai-solution') {
            return (
                <div className="tenant-maintenance-request">
                    <div className="request-step">
                        <div className="ai-resolution">
                            <h4>💡 Try This Solution</h4>
                            <p>{aiConversation[aiConversation.length - 1].message}</p>
                            <div className="resolution-actions">
                                <button className="btn-success">
                                    <i className="fas fa-check"></i>
                                    This Worked!
                                </button>
                                <button 
                                    className="btn-secondary"
                                    onClick={() => setStep('details')}
                                >
                                    Still Need Help
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (step === 'details') {
            return (
                <div className="tenant-maintenance-request">
                    <div className="request-step">
                        <h2>Additional Details</h2>
                        <p>Help us understand the issue better</p>

                        <div className="form-group">
                            <label>Describe the issue in detail</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Please provide any additional information..."
                            />
                        </div>

                        <div className="form-group">
                            <label>How urgent is this?</label>
                            <div className="urgency-options">
                                <button className="urgency-btn">Can wait</button>
                                <button className="urgency-btn">Soon please</button>
                                <button className="urgency-btn selected">Urgent</button>
                                <button className="urgency-btn">Emergency</button>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Add Photos (Optional but helpful)</label>
                            <div className="photo-upload">
                                <i className="fas fa-camera" style={{fontSize: '48px', color: '#9ca3af'}}></i>
                                <p>Click to upload photos</p>
                                <input type="file" accept="image/*" multiple hidden />
                            </div>
                        </div>

                        <button 
                            className="btn-primary btn-block"
                            onClick={() => handleSubmitRequest()}
                        >
                            Submit Request
                        </button>
                    </div>
                </div>
            );
        }

        if (step === 'success') {
            return (
                <div className="tenant-maintenance-request">
                    <div className="request-step success">
                        <div style={{fontSize: '64px', marginBottom: '24px'}}>✅</div>
                        <h2>Request Submitted Successfully!</h2>
                        <p>Ticket #MW-2024-{Math.floor(Math.random() * 9999)}</p>
                        
                        <div className="success-details">
                            <p><strong>Priority Score:</strong> {currentRequest?.priority || 75}/100</p>
                            <p><strong>Estimated Response:</strong> Within 2-4 hours</p>
                            <p><strong>Matched Vendor:</strong> ProElectric Solutions</p>
                        </div>

                        <button 
                            className="btn-primary"
                            onClick={() => setActiveView('dashboard')}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            );
        }
    };

    // Vendor Dashboard
    const renderVendorDashboard = () => (
        <div className="vendor-portal">
            <div className="vendor-dashboard">
                <div className="vendor-header">
                    <div className="vendor-info">
                        <h1>ProElectric Solutions Dashboard</h1>
                        <p>Licensed Electrical Contractor • 4.8★ Rating</p>
                    </div>
                    <div className="vendor-quick-stats">
                        <div className="stat-card">
                            <div className="stat-value">5</div>
                            <div className="stat-label">Today's Jobs</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">2</div>
                            <div className="stat-label">Urgent</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">98%</div>
                            <div className="stat-label">On-Time</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="vendor-jobs">
                <h2>Assigned Work Orders</h2>
                <div className="jobs-list">
                    {renderVendorJobs()}
                </div>
            </div>
        </div>
    );

    // Vendor Preferences System
    const renderPreferences = () => (
        <div className="vendor-preferences">
            <div className="preferences-header">
                <h2>Vendor Management & Preferences</h2>
                <p>Configure your preferred vendors and auto-assignment rules</p>
            </div>

            <div className="vendor-categories">
                {Object.entries(AITriageEngine.categories).map(([category, config]) => (
                    <div key={category} className="category-section">
                        <h3>{config.icon} {category} Vendors</h3>
                        <div className="vendor-grid">
                            {VendorMatchingEngine.vendors
                                .filter(v => v.specialties.includes(category))
                                .map(vendor => (
                                    <div key={vendor.id} className="vendor-preference-card">
                                        <div className="vendor-info">
                                            <h4>{vendor.name}</h4>
                                            <div className="vendor-details">
                                                <span>⭐ {vendor.rating}</span>
                                                <span>⏱️ {vendor.responseTime}hr response</span>
                                                <span>💵 ${vendor.rates.hourly}/hr</span>
                                            </div>
                                        </div>
                                        <div className="preference-controls">
                                            <select defaultValue={vendor.preferred ? 'preferred' : 'approved'}>
                                                <option value="preferred">Preferred</option>
                                                <option value="approved">Approved</option>
                                                <option value="backup">Backup Only</option>
                                                <option value="blocked">Do Not Use</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="auto-assignment-section">
                <h3>Auto-Assignment Rules</h3>
                <div className="rules-config">
                    <div className="rule-group">
                        <input type="checkbox" id="auto-assign" defaultChecked />
                        <label htmlFor="auto-assign">
                            Automatically assign vendors for requests under
                        </label>
                        <select defaultValue="500">
                            <option value="200">$200</option>
                            <option value="500">$500</option>
                            <option value="1000">$1,000</option>
                        </select>
                    </div>
                    <div className="rule-group">
                        <input type="checkbox" id="emergency-rules" defaultChecked />
                        <label htmlFor="emergency-rules">
                            For emergencies, authorize up to
                        </label>
                        <select defaultValue="2000">
                            <option value="1000">$1,000</option>
                            <option value="2000">$2,000</option>
                            <option value="5000">$5,000</option>
                        </select>
                    </div>
                    <div className="rule-group">
                        <input type="checkbox" id="tenant-coordination" defaultChecked />
                        <label htmlFor="tenant-coordination">
                            Enable AI-powered 3-way coordination chat
                        </label>
                    </div>
                </div>
            </div>

            <div className="preferences-actions">
                <button className="btn-primary">
                    Save Preferences
                </button>
            </div>
        </div>
    );

    // Helper render functions
    const renderTicketCards = () => {
        const mockTickets = [
            {
                id: 1,
                category: 'plumbing',
                priority: 95,
                status: 'in_progress',
                description: 'Water leak in Unit 203 bathroom',
                tenant: 'Sarah Johnson',
                assignedVendor: 'QuickFix Plumbing',
                created: '2 hours ago'
            },
            {
                id: 2,
                category: 'electrical',
                priority: 40,
                status: 'pending_assignment',
                description: 'Outlet not working in bedroom',
                tenant: 'Mike Chen',
                aiStatus: 'AI suggested GFCI reset',
                created: '4 hours ago'
            },
            {
                id: 3,
                category: 'hvac',
                priority: 70,
                status: 'scheduled',
                description: 'AC not cooling properly',
                tenant: 'Lisa Park',
                assignedVendor: 'AllTemp HVAC',
                scheduledFor: 'Tomorrow 2:00 PM',
                created: '1 day ago'
            }
        ];

        return mockTickets.map(ticket => (
            <div key={ticket.id} className={`ticket-card priority-${ticket.priority > 80 ? 'high' : ticket.priority > 50 ? 'medium' : 'low'}`}>
                <div className="ticket-header">
                    <span className={`ticket-category ${ticket.category}`}>
                        {AITriageEngine.categories[ticket.category].icon} {ticket.category}
                    </span>
                    <span className="ticket-priority">
                        Priority: {ticket.priority}
                    </span>
                </div>
                <h4>{ticket.description}</h4>
                <div className="ticket-meta">
                    <span><i className="fas fa-user"></i> {ticket.tenant}</span>
                    <span><i className="fas fa-clock"></i> {ticket.created}</span>
                </div>
                {ticket.assignedVendor && (
                    <div className="ticket-assignment">
                        <i className="fas fa-tools"></i> {ticket.assignedVendor}
                        {ticket.scheduledFor && <span> • {ticket.scheduledFor}</span>}
                    </div>
                )}
                {ticket.aiStatus && (
                    <div className="ticket-ai-status">
                        <i className="fas fa-robot"></i> {ticket.aiStatus}
                    </div>
                )}
            </div>
        ));
    };

    const renderVendorJobs = () => {
        const jobs = [
            {
                id: 1,
                priority: 95,
                address: '123 Main St, Unit 203',
                issue: 'Electrical outlet sparking',
                tenant: 'John Smith',
                phone: '(555) 123-4567',
                timeWindow: '2:00 PM - 4:00 PM',
                status: 'accepted'
            },
            {
                id: 2,
                priority: 40,
                address: '456 Oak Ave, Unit 105',
                issue: 'Bedroom outlet not working',
                tenant: 'Jane Doe',
                phone: '(555) 987-6543',
                timeWindow: 'Flexible',
                status: 'pending'
            }
        ];

        return jobs.map(job => (
            <div key={job.id} className="vendor-job-card">
                <div className="job-priority">
                    <span className={`priority-badge ${job.priority > 80 ? 'high' : 'medium'}`}>
                        Priority: {job.priority}
                    </span>
                </div>
                <h4>{job.issue}</h4>
                <div className="job-details">
                    <p><i className="fas fa-map-marker-alt"></i> {job.address}</p>
                    <p><i className="fas fa-user"></i> {job.tenant} • {job.phone}</p>
                    <p><i className="fas fa-clock"></i> {job.timeWindow}</p>
                </div>
                <div className="job-actions">
                    {job.status === 'pending' ? (
                        <>
                            <button className="btn-success">Accept Job</button>
                            <button className="btn-secondary">Decline</button>
                        </>
                    ) : (
                        <>
                            <button className="btn-primary">Start Navigation</button>
                            <button className="btn-secondary">Update Status</button>
                        </>
                    )}
                </div>
            </div>
        ));
    };

    const handleSubmitRequest = () => {
        const priority = currentRequest?.priority || AITriageEngine.calculatePriority(selectedCategory, answers);
        const ticket = AITriageEngine.generateTicket(
            selectedCategory,
            description,
            priority,
            photos
        );
        
        // Match vendor
        const matchedVendors = VendorMatchingEngine.matchVendor(ticket);
        
        // Simulate creating the ticket
        console.log('Created ticket:', ticket);
        console.log('Matched vendors:', matchedVendors);
        
        // Show success
        setStep('success');
    };

    // Main render based on active view
    return (
        <div className="maintenance-ecosystem">
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'tenant-request' && renderTenantRequest()}
            {activeView === 'vendor-dashboard' && renderVendorDashboard()}
            {activeView === 'preferences' && renderPreferences()}
        </div>
    );
};

// Export for use in admin portal
window.AppModules = window.AppModules || {};
window.AppModules.MaintenanceEcosystem = MaintenanceEcosystem;