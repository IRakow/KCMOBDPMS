// AIMaintenanceModal.jsx - AI-Powered Maintenance Management System
const AIMaintenanceModal = (() => {
    const ComponentFactory = {
        createComponent: (name) => (componentFunc) => {
            const Component = (props) => {
                const helpers = {
                    useLocalState: (initialState) => {
                        const [state, setState] = React.useState(initialState);
                        const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
                        return [state, updateState];
                    },
                    useAsyncState: (asyncFunc, deps = []) => {
                        const [state, setState] = React.useState({ loading: false, data: null, error: null });
                        
                        React.useEffect(() => {
                            let mounted = true;
                            const fetchData = async () => {
                                try {
                                    setState({ loading: true, data: null, error: null });
                                    const data = await asyncFunc();
                                    if (mounted) setState({ loading: false, data, error: null });
                                } catch (error) {
                                    if (mounted) setState({ loading: false, data: null, error });
                                }
                            };
                            if (deps.length === 0 || deps.some(d => d)) {
                                fetchData();
                            }
                            return () => { mounted = false; };
                        }, deps);
                        
                        return state;
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('AIMaintenanceModal')((props, helpers) => {
        const { tenant, step, request, chatMessages, onUpdateRequest, onUpdateChat, onChangeStep, onClose } = props;
        const { useLocalState, useAsyncState } = helpers;

        const [state, updateState] = useLocalState({
            currentInput: '',
            showEmergencyOptions: false,
            selectedCategory: null,
            selectedUrgency: null,
            aiThinking: false,
            uploadedImages: [],
            vendorScheduling: false,
            selectedVendor: null,
            proposedSchedule: null,
            maintenanceHistory: []
        });

        // AI Maintenance Categories with smart prioritization
        const maintenanceCategories = [
            { id: 'plumbing', name: 'Plumbing', icon: 'fa-faucet', urgencyScore: 85 },
            { id: 'electrical', name: 'Electrical', icon: 'fa-bolt', urgencyScore: 90 },
            { id: 'hvac', name: 'Heating/Cooling', icon: 'fa-temperature-high', urgencyScore: 80 },
            { id: 'appliance', name: 'Appliances', icon: 'fa-blender', urgencyScore: 60 },
            { id: 'door-window', name: 'Doors/Windows', icon: 'fa-door-open', urgencyScore: 40 },
            { id: 'pest', name: 'Pest Control', icon: 'fa-bug', urgencyScore: 70 },
            { id: 'other', name: 'Other', icon: 'fa-tools', urgencyScore: 50 }
        ];

        // AI Chat Bot for troubleshooting
        const processAIResponse = async (userInput) => {
            updateState({ aiThinking: true });
            
            try {
                // Simulate AI processing
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const aiResponse = await generateAIResponse(userInput, request);
                
                const updatedMessages = [...chatMessages, 
                    { role: 'user', content: userInput, timestamp: new Date() },
                    { role: 'ai', content: aiResponse.message, timestamp: new Date(), suggestions: aiResponse.suggestions }
                ];
                
                onUpdateChat(updatedMessages);
                
                // Update request based on AI analysis
                if (aiResponse.category) {
                    onUpdateRequest({ category: aiResponse.category });
                }
                if (aiResponse.urgencyScore) {
                    onUpdateRequest({ urgencyScore: aiResponse.urgencyScore });
                }
                if (aiResponse.resolved) {
                    onChangeStep('resolved');
                } else if (aiResponse.needsVendor) {
                    onChangeStep('vendor');
                }
                
            } catch (error) {
                console.error('AI processing error:', error);
            } finally {
                updateState({ aiThinking: false, currentInput: '' });
            }
        };

        const generateAIResponse = async (input, requestData) => {
            // In production, this would call your AI service
            const lowerInput = input.toLowerCase();
            
            // Smart troubleshooting based on common issues
            if (lowerInput.includes('no power') || lowerInput.includes('outlet')) {
                return {
                    message: "I can help with that! Let's troubleshoot your power issue:\n\n1. First, check if other outlets in the same room are working\n2. Look for your circuit breaker panel (usually in a closet or garage)\n3. Check if any switches are in the 'OFF' position or between ON and OFF\n4. Try resetting any GFCI outlets (they have TEST/RESET buttons)\n\nDid any of these steps resolve the issue?",
                    suggestions: ['Yes, it's fixed!', 'No, still no power', 'I can't find the breaker panel'],
                    category: 'electrical',
                    urgencyScore: 75
                };
            }
            
            if (lowerInput.includes('leak') || lowerInput.includes('water')) {
                return {
                    message: "A water leak needs immediate attention! Please help me assess the severity:\n\n⚠️ Is water actively flowing or dripping?\n📍 Where is the leak located?\n💧 How much water - drops, steady stream, or flooding?\n\nFor now, please:\n1. Turn off water valve if accessible\n2. Place buckets/towels to contain water\n3. Move any valuables away from the area",
                    suggestions: ['Small drip', 'Steady leak', 'Major flooding - EMERGENCY'],
                    category: 'plumbing',
                    urgencyScore: 95,
                    needsVendor: true
                };
            }
            
            if (lowerInput.includes('fixed') || lowerInput.includes('working now')) {
                return {
                    message: "Great news! I'm glad we could resolve that together. I'll close this request and make a note for future reference. Is there anything else you need help with?",
                    resolved: true
                };
            }
            
            // Default response for unrecognized issues
            return {
                message: "I understand you're experiencing an issue. Can you provide more details about:\n\n• What specifically isn't working?\n• When did this start?\n• Any unusual sounds, smells, or sights?\n\nYou can also upload photos to help me better understand the problem.",
                suggestions: ['Upload photo', 'Describe more', 'It's urgent'],
                category: 'other',
                urgencyScore: 50
            };
        };

        const handleImageUpload = (event) => {
            const files = Array.from(event.target.files);
            const newImages = files.map(file => ({
                id: Date.now() + Math.random(),
                file,
                preview: URL.createObjectURL(file),
                name: file.name
            }));
            updateState({ uploadedImages: [...state.uploadedImages, ...newImages] });
            onUpdateRequest({ images: [...(request.images || []), ...newImages] });
        };

        const renderStep = () => {
            switch (step) {
                case 'initial':
                    return renderInitialStep();
                case 'chat':
                    return renderChatStep();
                case 'vendor':
                    return renderVendorStep();
                case 'scheduling':
                    return renderSchedulingStep();
                case 'resolved':
                    return renderResolvedStep();
                case 'confirmation':
                    return renderConfirmationStep();
                default:
                    return renderInitialStep();
            }
        };

        const renderInitialStep = () => {
            return React.createElement('div', { className: 'maintenance-step initial-step' }, [
                React.createElement('h3', { key: 'title' }, 'What can we help you with today?'),
                React.createElement('p', { key: 'subtitle' }, 'Select a category or describe your issue'),
                
                // Emergency Button
                React.createElement('button', {
                    key: 'emergency',
                    className: 'emergency-btn',
                    onClick: () => updateState({ showEmergencyOptions: true })
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-exclamation-triangle' }),
                    'Emergency Issue'
                ]),

                // Category Grid
                React.createElement('div', { key: 'categories', className: 'category-grid' },
                    maintenanceCategories.map(category =>
                        React.createElement('button', {
                            key: category.id,
                            className: 'category-btn',
                            onClick: () => {
                                onUpdateRequest({ category: category.id, categoryName: category.name });
                                updateState({ selectedCategory: category.id });
                                onChangeStep('chat');
                            }
                        }, [
                            React.createElement('i', { key: 'icon', className: `fas ${category.icon}` }),
                            React.createElement('span', { key: 'name' }, category.name)
                        ])
                    )
                ),

                // Or describe issue
                React.createElement('div', { key: 'describe', className: 'describe-section' }, [
                    React.createElement('p', { key: 'label' }, 'Or describe your issue:'),
                    React.createElement('textarea', {
                        key: 'input',
                        placeholder: 'Example: My kitchen sink is dripping...',
                        value: state.currentInput,
                        onChange: (e) => updateState({ currentInput: e.target.value }),
                        rows: 3
                    }),
                    React.createElement('button', {
                        key: 'submit',
                        className: 'submit-description-btn',
                        onClick: () => {
                            if (state.currentInput.trim()) {
                                onUpdateRequest({ description: state.currentInput });
                                processAIResponse(state.currentInput);
                                onChangeStep('chat');
                            }
                        },
                        disabled: !state.currentInput.trim()
                    }, 'Get Help')
                ])
            ]);
        };

        const renderChatStep = () => {
            return React.createElement('div', { className: 'maintenance-step chat-step' }, [
                React.createElement('div', { key: 'chat-header', className: 'chat-header' }, [
                    React.createElement('h3', { key: 'title' }, 'AI Maintenance Assistant'),
                    React.createElement('p', { key: 'subtitle' }, 'I'll help troubleshoot and resolve your issue')
                ]),

                // Chat Messages
                React.createElement('div', { key: 'chat-messages', className: 'chat-messages' }, [
                    // Initial AI greeting
                    React.createElement('div', { key: 'greeting', className: 'message ai-message' }, [
                        React.createElement('div', { key: 'avatar', className: 'ai-avatar' },
                            React.createElement('i', { className: 'fas fa-robot' })
                        ),
                        React.createElement('div', { key: 'content', className: 'message-content' }, 
                            `Hi! I'm here to help with your ${request.categoryName || 'maintenance'} issue. Let me ask a few questions to better understand the problem.`
                        )
                    ]),

                    // Dynamic messages
                    ...chatMessages.map((msg, idx) =>
                        React.createElement('div', { 
                            key: idx, 
                            className: `message ${msg.role}-message` 
                        }, [
                            msg.role === 'ai' && React.createElement('div', { 
                                key: 'avatar', 
                                className: 'ai-avatar' 
                            }, React.createElement('i', { className: 'fas fa-robot' })),
                            
                            React.createElement('div', { key: 'content', className: 'message-content' }, [
                                React.createElement('p', { key: 'text' }, msg.content),
                                
                                // Quick reply suggestions
                                msg.suggestions && React.createElement('div', { 
                                    key: 'suggestions', 
                                    className: 'quick-suggestions' 
                                },
                                    msg.suggestions.map((suggestion, sIdx) =>
                                        React.createElement('button', {
                                            key: sIdx,
                                            className: 'suggestion-btn',
                                            onClick: () => processAIResponse(suggestion)
                                        }, suggestion)
                                    )
                                )
                            ]),
                            
                            React.createElement('span', { 
                                key: 'time', 
                                className: 'message-time' 
                            }, new Date(msg.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            }))
                        ])
                    ),

                    // AI thinking indicator
                    state.aiThinking && React.createElement('div', { 
                        key: 'thinking', 
                        className: 'message ai-message thinking' 
                    }, [
                        React.createElement('div', { key: 'avatar', className: 'ai-avatar' },
                            React.createElement('i', { className: 'fas fa-robot' })
                        ),
                        React.createElement('div', { key: 'dots', className: 'thinking-dots' }, [
                            React.createElement('span', { key: 'd1' }),
                            React.createElement('span', { key: 'd2' }),
                            React.createElement('span', { key: 'd3' })
                        ])
                    ])
                ]),

                // Input Area
                React.createElement('div', { key: 'input-area', className: 'chat-input-area' }, [
                    React.createElement('div', { key: 'attachments', className: 'attachment-section' }, [
                        React.createElement('input', {
                            key: 'file-input',
                            type: 'file',
                            id: 'image-upload',
                            accept: 'image/*',
                            multiple: true,
                            style: { display: 'none' },
                            onChange: handleImageUpload
                        }),
                        React.createElement('label', {
                            key: 'upload-btn',
                            htmlFor: 'image-upload',
                            className: 'upload-btn'
                        }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-camera' }),
                            'Add Photos'
                        ]),
                        
                        // Uploaded images preview
                        state.uploadedImages.length > 0 && React.createElement('div', { 
                            key: 'previews', 
                            className: 'image-previews' 
                        },
                            state.uploadedImages.map(img =>
                                React.createElement('div', { key: img.id, className: 'image-preview' }, [
                                    React.createElement('img', { 
                                        key: 'img',
                                        src: img.preview, 
                                        alt: img.name 
                                    }),
                                    React.createElement('button', {
                                        key: 'remove',
                                        className: 'remove-image',
                                        onClick: () => {
                                            updateState({ 
                                                uploadedImages: state.uploadedImages.filter(i => i.id !== img.id) 
                                            });
                                        }
                                    }, '×')
                                ])
                            )
                        )
                    ]),
                    
                    React.createElement('div', { key: 'input-row', className: 'input-row' }, [
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            placeholder: 'Type your response...',
                            value: state.currentInput,
                            onChange: (e) => updateState({ currentInput: e.target.value }),
                            onKeyPress: (e) => {
                                if (e.key === 'Enter' && state.currentInput.trim() && !state.aiThinking) {
                                    processAIResponse(state.currentInput);
                                }
                            },
                            disabled: state.aiThinking
                        }),
                        React.createElement('button', {
                            key: 'send',
                            className: 'send-btn',
                            onClick: () => processAIResponse(state.currentInput),
                            disabled: !state.currentInput.trim() || state.aiThinking
                        }, React.createElement('i', { className: 'fas fa-paper-plane' }))
                    ])
                ]),

                // Skip to vendor button
                React.createElement('button', {
                    key: 'skip',
                    className: 'skip-to-vendor',
                    onClick: () => onChangeStep('vendor')
                }, 'Skip troubleshooting - Request vendor')
            ]);
        };

        const renderVendorStep = () => {
            // Mock vendor data
            const vendors = [
                {
                    id: 1,
                    name: 'Quick Fix Plumbing',
                    category: 'plumbing',
                    rating: 4.8,
                    reviews: 156,
                    responseTime: '< 2 hours',
                    rate: '$125/hr',
                    availability: 'Available now',
                    previousJobs: 23
                },
                {
                    id: 2,
                    name: 'Pro Plumbers LLC',
                    category: 'plumbing',
                    rating: 4.6,
                    reviews: 89,
                    responseTime: '< 4 hours',
                    rate: '$110/hr',
                    availability: 'Available today',
                    previousJobs: 15
                }
            ];

            return React.createElement('div', { className: 'maintenance-step vendor-step' }, [
                React.createElement('h3', { key: 'title' }, 'Recommended Vendors'),
                React.createElement('p', { key: 'subtitle' }, 
                    `Based on your ${request.categoryName || 'maintenance'} issue and urgency score of ${request.urgencyScore || 50}/100`
                ),

                React.createElement('div', { key: 'vendors', className: 'vendor-list' },
                    vendors.map(vendor =>
                        React.createElement('div', {
                            key: vendor.id,
                            className: `vendor-card ${state.selectedVendor?.id === vendor.id ? 'selected' : ''}`,
                            onClick: () => updateState({ selectedVendor: vendor })
                        }, [
                            React.createElement('div', { key: 'header', className: 'vendor-header' }, [
                                React.createElement('h4', { key: 'name' }, vendor.name),
                                React.createElement('div', { key: 'rating', className: 'vendor-rating' }, [
                                    React.createElement('i', { key: 'star', className: 'fas fa-star' }),
                                    React.createElement('span', { key: 'score' }, vendor.rating),
                                    React.createElement('span', { key: 'reviews' }, `(${vendor.reviews})`),
                                ])
                            ]),
                            
                            React.createElement('div', { key: 'details', className: 'vendor-details' }, [
                                React.createElement('div', { key: 'response', className: 'detail-item' }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-clock' }),
                                    vendor.responseTime
                                ]),
                                React.createElement('div', { key: 'rate', className: 'detail-item' }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-dollar-sign' }),
                                    vendor.rate
                                ]),
                                React.createElement('div', { key: 'availability', className: 'detail-item' }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-calendar-check' }),
                                    vendor.availability
                                ])
                            ]),
                            
                            React.createElement('div', { key: 'history', className: 'vendor-history' },
                                `${vendor.previousJobs} previous jobs at ${tenant.property}`
                            )
                        ])
                    )
                ),

                React.createElement('button', {
                    key: 'continue',
                    className: 'continue-btn',
                    onClick: () => onChangeStep('scheduling'),
                    disabled: !state.selectedVendor
                }, 'Continue to Scheduling')
            ]);
        };

        const renderSchedulingStep = () => {
            const timeSlots = [
                { time: '8:00 AM - 10:00 AM', available: true },
                { time: '10:00 AM - 12:00 PM', available: true },
                { time: '12:00 PM - 2:00 PM', available: false },
                { time: '2:00 PM - 4:00 PM', available: true },
                { time: '4:00 PM - 6:00 PM', available: true }
            ];

            return React.createElement('div', { className: 'maintenance-step scheduling-step' }, [
                React.createElement('h3', { key: 'title' }, 'Schedule Your Appointment'),
                React.createElement('p', { key: 'vendor' }, 
                    `with ${state.selectedVendor?.name}`
                ),

                React.createElement('div', { key: 'calendar', className: 'scheduling-calendar' }, [
                    React.createElement('div', { key: 'date-picker', className: 'date-picker' }, [
                        React.createElement('h4', { key: 'label' }, 'Select Date'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'date',
                            min: new Date().toISOString().split('T')[0],
                            onChange: (e) => onUpdateRequest({ scheduledDate: e.target.value })
                        })
                    ]),

                    React.createElement('div', { key: 'time-slots', className: 'time-slots' }, [
                        React.createElement('h4', { key: 'label' }, 'Available Times'),
                        React.createElement('div', { key: 'slots', className: 'slots-grid' },
                            timeSlots.map((slot, idx) =>
                                React.createElement('button', {
                                    key: idx,
                                    className: `time-slot ${!slot.available ? 'unavailable' : ''} ${
                                        request.scheduledTime === slot.time ? 'selected' : ''
                                    }`,
                                    onClick: () => slot.available && onUpdateRequest({ scheduledTime: slot.time }),
                                    disabled: !slot.available
                                }, slot.time)
                            )
                        )
                    ])
                ]),

                React.createElement('div', { key: 'access', className: 'access-instructions' }, [
                    React.createElement('h4', { key: 'title' }, 'Access Instructions'),
                    React.createElement('textarea', {
                        key: 'input',
                        placeholder: 'Will you be home? Any special instructions for the vendor?',
                        rows: 3,
                        onChange: (e) => onUpdateRequest({ accessInstructions: e.target.value })
                    })
                ]),

                React.createElement('button', {
                    key: 'confirm',
                    className: 'confirm-btn',
                    onClick: () => {
                        // Create 3-way chat and submit request
                        submitMaintenanceRequest();
                        onChangeStep('confirmation');
                    },
                    disabled: !request.scheduledDate || !request.scheduledTime
                }, 'Confirm Appointment')
            ]);
        };

        const renderResolvedStep = () => {
            return React.createElement('div', { className: 'maintenance-step resolved-step' }, [
                React.createElement('div', { key: 'icon', className: 'success-icon' },
                    React.createElement('i', { className: 'fas fa-check-circle' })
                ),
                React.createElement('h3', { key: 'title' }, 'Great! Issue Resolved'),
                React.createElement('p', { key: 'message' }, 
                    'We're glad we could help you resolve this issue without needing a service visit.'
                ),
                React.createElement('div', { key: 'summary', className: 'resolution-summary' }, [
                    React.createElement('h4', { key: 'title' }, 'Resolution Summary'),
                    React.createElement('p', { key: 'text' }, 
                        'Your issue was resolved through AI-assisted troubleshooting. This interaction has been logged for future reference.'
                    )
                ]),
                React.createElement('button', {
                    key: 'close',
                    className: 'close-btn',
                    onClick: onClose
                }, 'Close')
            ]);
        };

        const renderConfirmationStep = () => {
            return React.createElement('div', { className: 'maintenance-step confirmation-step' }, [
                React.createElement('div', { key: 'icon', className: 'success-icon' },
                    React.createElement('i', { className: 'fas fa-calendar-check' })
                ),
                React.createElement('h3', { key: 'title' }, 'Maintenance Request Submitted'),
                React.createElement('div', { key: 'details', className: 'confirmation-details' }, [
                    React.createElement('p', { key: 'vendor' }, [
                        React.createElement('strong', {}, 'Vendor: '),
                        state.selectedVendor?.name
                    ]),
                    React.createElement('p', { key: 'date' }, [
                        React.createElement('strong', {}, 'Date: '),
                        request.scheduledDate
                    ]),
                    React.createElement('p', { key: 'time' }, [
                        React.createElement('strong', {}, 'Time: '),
                        request.scheduledTime
                    ]),
                    React.createElement('p', { key: 'tracking' }, [
                        React.createElement('strong', {}, 'Tracking #: '),
                        'MNT-' + Date.now().toString().substr(-6)
                    ])
                ]),
                React.createElement('div', { key: 'next-steps', className: 'next-steps' }, [
                    React.createElement('h4', { key: 'title' }, 'What happens next?'),
                    React.createElement('ul', { key: 'list' }, [
                        React.createElement('li', { key: '1' }, 
                            'You'll receive a confirmation text and email'
                        ),
                        React.createElement('li', { key: '2' }, 
                            'A 3-way chat has been created with you, the vendor, and property management'
                        ),
                        React.createElement('li', { key: '3' }, 
                            'The vendor will confirm the appointment within 30 minutes'
                        ),
                        React.createElement('li', { key: '4' }, 
                            'You can track progress in the maintenance tab'
                        )
                    ])
                ]),
                React.createElement('button', {
                    key: 'done',
                    className: 'done-btn',
                    onClick: onClose
                }, 'Done')
            ]);
        };

        const submitMaintenanceRequest = async () => {
            try {
                const requestData = {
                    ...request,
                    tenantId: tenant.id,
                    unitId: tenant.unitId,
                    propertyId: tenant.propertyId,
                    vendorId: state.selectedVendor?.id,
                    aiChatLog: chatMessages,
                    urgencyScore: request.urgencyScore || 50,
                    createdAt: new Date().toISOString(),
                    status: 'scheduled'
                };

                // Submit to backend
                await window.ApiService.post('/api/maintenance/requests', requestData);

                // Create 3-way chat
                await window.ApiService.post('/api/maintenance/create-chat', {
                    requestId: requestData.id,
                    participants: [tenant.id, state.selectedVendor.id, 'property-manager']
                });

                // Send notifications
                await window.ApiService.post('/api/notifications/send', {
                    type: 'maintenance_scheduled',
                    recipients: [tenant.phone, tenant.email],
                    data: requestData
                });

            } catch (error) {
                console.error('Failed to submit maintenance request:', error);
            }
        };

        return React.createElement('div', { 
            className: 'modal-overlay ai-maintenance-modal',
            onClick: onClose
        },
            React.createElement('div', { 
                className: 'modal-content maintenance-modal-content',
                onClick: (e) => e.stopPropagation()
            }, [
                // Header
                React.createElement('div', { key: 'header', className: 'modal-header' }, [
                    React.createElement('button', {
                        key: 'back',
                        className: 'back-btn',
                        onClick: () => {
                            const steps = ['initial', 'chat', 'vendor', 'scheduling', 'confirmation'];
                            const currentIndex = steps.indexOf(step);
                            if (currentIndex > 0) {
                                onChangeStep(steps[currentIndex - 1]);
                            }
                        },
                        style: { visibility: step !== 'initial' && step !== 'resolved' && step !== 'confirmation' ? 'visible' : 'hidden' }
                    }, React.createElement('i', { className: 'fas fa-arrow-left' })),
                    
                    React.createElement('h2', { key: 'title' }, 'Maintenance Request'),
                    
                    React.createElement('button', {
                        key: 'close',
                        className: 'close-btn',
                        onClick: onClose
                    }, '×')
                ]),

                // Progress Bar
                step !== 'resolved' && React.createElement('div', { key: 'progress', className: 'maintenance-progress' }, [
                    React.createElement('div', { 
                        className: 'progress-bar',
                        style: { 
                            width: step === 'initial' ? '20%' : 
                                   step === 'chat' ? '40%' :
                                   step === 'vendor' ? '60%' :
                                   step === 'scheduling' ? '80%' : '100%'
                        }
                    })
                ]),

                // Step Content
                React.createElement('div', { key: 'body', className: 'modal-body' },
                    renderStep()
                ),

                // Emergency Options
                state.showEmergencyOptions && React.createElement('div', { 
                    key: 'emergency-overlay', 
                    className: 'emergency-overlay' 
                },
                    React.createElement('div', { className: 'emergency-options' }, [
                        React.createElement('h3', { key: 'title' }, 'Emergency Contacts'),
                        React.createElement('button', {
                            key: 'call-911',
                            className: 'emergency-contact-btn critical',
                            onClick: () => window.location.href = 'tel:911'
                        }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-phone' }),
                            React.createElement('div', { key: 'content' }, [
                                React.createElement('strong', { key: 'number' }, '911'),
                                React.createElement('span', { key: 'desc' }, 'Life-threatening emergencies')
                            ])
                        ]),
                        React.createElement('button', {
                            key: 'call-maintenance',
                            className: 'emergency-contact-btn',
                            onClick: () => window.location.href = 'tel:1-800-555-0123'
                        }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-phone' }),
                            React.createElement('div', { key: 'content' }, [
                                React.createElement('strong', { key: 'number' }, '24/7 Emergency Maintenance'),
                                React.createElement('span', { key: 'desc' }, '1-800-555-0123')
                            ])
                        ]),
                        React.createElement('button', {
                            key: 'cancel',
                            className: 'cancel-emergency',
                            onClick: () => updateState({ showEmergencyOptions: false })
                        }, 'Cancel')
                    ])
                )
            ])
        );
    });
})();

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.AIMaintenanceModal = AIMaintenanceModal;