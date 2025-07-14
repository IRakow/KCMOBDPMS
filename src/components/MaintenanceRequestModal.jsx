// MaintenanceRequestModal.jsx - AI-Powered Maintenance Request System
const MaintenanceRequestModal = ({ isOpen, onClose, tenantInfo }) => {
    const maintenanceStore = window.useMaintenanceStore ? window.useMaintenanceStore() : null;
    const [currentStep, setCurrentStep] = React.useState('category');
    const [formData, setFormData] = React.useState({
        category: '',
        title: '',
        description: '',
        priority: 'medium',
        photos: [],
        unit: tenantInfo?.unit || '',
        property: tenantInfo?.property || '',
        tenant: tenantInfo || {}
    });
    const [aiChat, setAiChat] = React.useState([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [troubleshootingResults, setTroubleshootingResults] = React.useState(null);

    const categories = [
        { id: 'plumbing', name: 'Plumbing', icon: 'fa-tint', description: 'Leaks, clogs, water issues' },
        { id: 'electrical', name: 'Electrical', icon: 'fa-bolt', description: 'Outlets, lighting, power issues' },
        { id: 'hvac', name: 'HVAC', icon: 'fa-snowflake', description: 'Heating, cooling, ventilation' },
        { id: 'appliance', name: 'Appliances', icon: 'fa-blender', description: 'Washer, dryer, dishwasher' },
        { id: 'general', name: 'General', icon: 'fa-hammer', description: 'Other maintenance issues' },
        { id: 'emergency', name: 'Emergency', icon: 'fa-exclamation-triangle', description: 'Urgent safety issues' }
    ];

    React.useEffect(() => {
        if (isOpen) {
            // Reset form when modal opens
            setCurrentStep('category');
            setFormData({
                category: '',
                title: '',
                description: '',
                priority: 'medium',
                photos: [],
                unit: tenantInfo?.unit || '',
                property: tenantInfo?.property || '',
                tenant: tenantInfo || {}
            });
            setAiChat([]);
            setTroubleshootingResults(null);
        }
    }, [isOpen, tenantInfo]);

    // AI Troubleshooting based on category and description
    const runAITroubleshooting = React.useCallback(async () => {
        if (!formData.description || formData.description.length < 10) return;

        const aiMessage = {
            id: Date.now(),
            type: 'ai',
            content: 'Let me analyze your issue and suggest some troubleshooting steps...',
            timestamp: new Date().toISOString()
        };

        setAiChat(prev => [...prev, aiMessage]);

        // Simulate AI analysis
        setTimeout(() => {
            const troubleshooting = generateTroubleshootingSteps(formData.category, formData.description);
            setTroubleshootingResults(troubleshooting);
            
            const responseMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: `Based on your description, here are some steps you can try first. If these don't solve the issue, I'll help you submit a work order.`,
                troubleshooting,
                timestamp: new Date().toISOString()
            };

            setAiChat(prev => [...prev, responseMessage]);
        }, 2000);
    }, [formData.category, formData.description]);

    const generateTroubleshootingSteps = (category, description) => {
        const desc = description.toLowerCase();
        
        const troubleshootingGuides = {
            plumbing: {
                'clog': [
                    'Try using a plunger for 30 seconds',
                    'Pour hot water down the drain',
                    'Check if other drains are affected'
                ],
                'leak': [
                    'Turn off water supply to the area',
                    'Place a bucket to catch water',
                    'Check if the leak is from a connection'
                ],
                'default': [
                    'Check if water shut-off valves are accessible',
                    'Try running water in other fixtures',
                    'Look for visible water damage'
                ]
            },
            electrical: {
                'outlet': [
                    'Check if circuit breaker has tripped',
                    'Look for GFCI outlets and reset if needed',
                    'Test the outlet with a different device'
                ],
                'light': [
                    'Try replacing the light bulb',
                    'Check the light switch',
                    'Test other lights in the room'
                ],
                'default': [
                    'Check circuit breaker panel',
                    'Try resetting any GFCI outlets',
                    'Unplug devices and try again'
                ]
            },
            hvac: {
                'cooling': [
                    'Check if air filter needs replacement',
                    'Verify thermostat settings and battery',
                    'Make sure all vents are open and unobstructed'
                ],
                'heating': [
                    'Check thermostat settings and battery',
                    'Verify air filter is clean',
                    'Check if all vents are open'
                ],
                'default': [
                    'Check and replace air filter if dirty',
                    'Verify thermostat settings',
                    'Check that vents aren\'t blocked'
                ]
            }
        };

        const categoryGuide = troubleshootingGuides[category] || troubleshootingGuides.general;
        
        // Find specific guide based on description keywords
        for (const [keyword, steps] of Object.entries(categoryGuide)) {
            if (keyword !== 'default' && desc.includes(keyword)) {
                return {
                    category,
                    specificIssue: keyword,
                    steps,
                    estimatedTime: '5-10 minutes',
                    safetyNote: getSafetyNote(category, keyword)
                };
            }
        }

        return {
            category,
            specificIssue: 'general',
            steps: categoryGuide.default,
            estimatedTime: '5-10 minutes',
            safetyNote: getSafetyNote(category, 'general')
        };
    };

    const getSafetyNote = (category, issue) => {
        const safetyNotes = {
            electrical: 'Safety First: Turn off power at the circuit breaker before any electrical work.',
            plumbing: 'Important: Turn off water supply if there\'s active leaking.',
            emergency: 'Emergency: If this is a safety hazard, call emergency services immediately.'
        };

        return safetyNotes[category] || 'Please be careful and stop if you feel unsafe.';
    };

    const handleCategorySelect = (category) => {
        setFormData(prev => ({ ...prev, category }));
        setCurrentStep('description');
    };

    const handleDescriptionSubmit = () => {
        if (formData.description.length < 10) {
            alert('Please provide more details about the issue.');
            return;
        }
        
        setCurrentStep('troubleshooting');
        runAITroubleshooting();
    };

    const handleTroubleshootingComplete = (resolved) => {
        if (resolved) {
            // Issue was resolved, close modal
            onClose();
            // Could add success notification here
        } else {
            // Continue with work order submission
            setCurrentStep('photos');
        }
    };

    const handlePhotoUpload = (event) => {
        const files = Array.from(event.target.files);
        // In a real app, you'd upload to a service and get URLs
        const photoUrls = files.map(file => URL.createObjectURL(file));
        setFormData(prev => ({ 
            ...prev, 
            photos: [...prev.photos, ...photoUrls] 
        }));
    };

    const removePhoto = (index) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async () => {
        if (!maintenanceStore?.actions?.addRequest) {
            alert('Maintenance system not available. Please try again later.');
            return;
        }

        setIsSubmitting(true);

        try {
            const requestData = {
                ...formData,
                submittedBy: 'Tenant',
                aiTroubleshooting: troubleshootingResults,
                chatHistory: aiChat
            };

            const requestId = maintenanceStore.actions.addRequest(requestData);
            
            // Success feedback
            alert('Maintenance request submitted successfully! You\'ll receive updates via email and in your portal.');
            
            onClose();
        } catch (error) {
            console.error('Error submitting maintenance request:', error);
            alert('There was an error submitting your request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="maintenance-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <i className="fas fa-tools"></i>
                        Maintenance Request
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    {/* Progress Indicator */}
                    <div className="progress-indicator">
                        <div className={`step ${currentStep === 'category' ? 'active' : currentStep === 'description' || currentStep === 'troubleshooting' || currentStep === 'photos' || currentStep === 'review' ? 'completed' : ''}`}>1</div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep === 'description' ? 'active' : currentStep === 'troubleshooting' || currentStep === 'photos' || currentStep === 'review' ? 'completed' : ''}`}>2</div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep === 'troubleshooting' ? 'active' : currentStep === 'photos' || currentStep === 'review' ? 'completed' : ''}`}>3</div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep === 'photos' ? 'active' : currentStep === 'review' ? 'completed' : ''}`}>4</div>
                        <div className="step-line"></div>
                        <div className={`step ${currentStep === 'review' ? 'active' : ''}`}>5</div>
                    </div>

                    {/* Step 1: Category Selection */}
                    {currentStep === 'category' && (
                        <div className="step-content">
                            <h3>What type of issue are you experiencing?</h3>
                            <div className="category-grid">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        className={`category-btn ${formData.category === category.id ? 'selected' : ''}`}
                                        onClick={() => handleCategorySelect(category.id)}
                                    >
                                        <i className={`fas ${category.icon}`}></i>
                                        <span className="category-name">{category.name}</span>
                                        <span className="category-description">{category.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Description */}
                    {currentStep === 'description' && (
                        <div className="step-content">
                            <h3>Tell us about the issue</h3>
                            <div className="form-group">
                                <label>Issue Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Brief summary of the issue"
                                />
                            </div>
                            <div className="form-group">
                                <label>Detailed Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Please describe the issue in detail. When did it start? Is it affecting other areas?"
                                    rows="4"
                                />
                            </div>
                            <div className="form-group">
                                <label>Priority Level</label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                                >
                                    <option value="low">Low - Can wait a few days</option>
                                    <option value="medium">Medium - Should be fixed this week</option>
                                    <option value="high">High - Needs attention soon</option>
                                    <option value="urgent">Urgent - Needs immediate attention</option>
                                    <option value="emergency">Emergency - Safety hazard</option>
                                </select>
                            </div>
                            <div className="step-actions">
                                <button className="btn btn-secondary" onClick={() => setCurrentStep('category')}>
                                    Back
                                </button>
                                <button className="btn btn-primary" onClick={handleDescriptionSubmit}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: AI Troubleshooting */}
                    {currentStep === 'troubleshooting' && (
                        <div className="step-content">
                            <h3>AI Troubleshooting Assistant</h3>
                            <div className="ai-chat">
                                <div className="chat-messages">
                                    {aiChat.map(message => (
                                        <div key={message.id} className={`message ${message.type}`}>
                                            <div className="message-content">
                                                {message.content}
                                                {message.troubleshooting && (
                                                    <div className="troubleshooting-steps">
                                                        <div className="safety-note">
                                                            <i className="fas fa-exclamation-triangle"></i>
                                                            {message.troubleshooting.safetyNote}
                                                        </div>
                                                        <h4>Try these steps:</h4>
                                                        <ol>
                                                            {message.troubleshooting.steps.map((step, index) => (
                                                                <li key={index}>{step}</li>
                                                            ))}
                                                        </ol>
                                                        <p className="estimated-time">
                                                            Estimated time: {message.troubleshooting.estimatedTime}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {troubleshootingResults && (
                                <div className="troubleshooting-actions">
                                    <h4>Did these steps resolve your issue?</h4>
                                    <div className="action-buttons">
                                        <button 
                                            className="btn btn-success"
                                            onClick={() => handleTroubleshootingComplete(true)}
                                        >
                                            <i className="fas fa-check"></i>
                                            Yes, issue resolved!
                                        </button>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => handleTroubleshootingComplete(false)}
                                        >
                                            <i className="fas fa-arrow-right"></i>
                                            No, submit work order
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Photos */}
                    {currentStep === 'photos' && (
                        <div className="step-content">
                            <h3>Add Photos (Optional)</h3>
                            <p>Photos help our maintenance team understand the issue better and bring the right tools.</p>
                            
                            <div className="photo-upload">
                                <input
                                    type="file"
                                    id="photo-upload"
                                    multiple
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    style={{ display: 'none' }}
                                />
                                <label htmlFor="photo-upload" className="upload-btn">
                                    <i className="fas fa-camera"></i>
                                    Add Photos
                                </label>
                            </div>

                            {formData.photos.length > 0 && (
                                <div className="photo-preview">
                                    {formData.photos.map((photo, index) => (
                                        <div key={index} className="photo-item">
                                            <img src={photo} alt={`Issue photo ${index + 1}`} />
                                            <button 
                                                className="remove-photo"
                                                onClick={() => removePhoto(index)}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="step-actions">
                                <button className="btn btn-secondary" onClick={() => setCurrentStep('troubleshooting')}>
                                    Back
                                </button>
                                <button className="btn btn-primary" onClick={() => setCurrentStep('review')}>
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Review & Submit */}
                    {currentStep === 'review' && (
                        <div className="step-content">
                            <h3>Review Your Request</h3>
                            <div className="request-summary">
                                <div className="summary-section">
                                    <h4>Issue Details</h4>
                                    <p><strong>Category:</strong> {categories.find(c => c.id === formData.category)?.name}</p>
                                    <p><strong>Title:</strong> {formData.title}</p>
                                    <p><strong>Priority:</strong> {formData.priority}</p>
                                    <p><strong>Description:</strong> {formData.description}</p>
                                </div>
                                
                                <div className="summary-section">
                                    <h4>Location</h4>
                                    <p><strong>Property:</strong> {formData.property}</p>
                                    <p><strong>Unit:</strong> {formData.unit}</p>
                                </div>

                                {formData.photos.length > 0 && (
                                    <div className="summary-section">
                                        <h4>Photos</h4>
                                        <p>{formData.photos.length} photo(s) attached</p>
                                    </div>
                                )}
                            </div>

                            <div className="step-actions">
                                <button className="btn btn-secondary" onClick={() => setCurrentStep('photos')}>
                                    Back
                                </button>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.MaintenanceRequestModal = MaintenanceRequestModal;