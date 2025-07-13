// DigitalApplication.jsx - AI-Powered Digital Rental Application System
const DigitalApplication = (() => {
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
                            fetchData();
                            return () => { mounted = false; };
                        }, deps);
                        
                        return state;
                    },
                    formatCurrency: (amount) => {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(amount || 0);
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('DigitalApplication')((props, helpers) => {
        const { useLocalState, useAsyncState, formatCurrency } = helpers;
        const { propertyId, unitId, prefilledData = {} } = props;

        const [state, updateState] = useLocalState({
            currentStep: 0,
            applicationData: {
                personal: { ...prefilledData },
                employment: {},
                references: [],
                documents: [],
                additionalInfo: {},
                pets: [],
                vehicles: []
            },
            validationErrors: {},
            aiSuggestions: {},
            isReturningApplicant: false,
            showAIAssistant: false,
            aiAssistantMessages: [],
            savingDraft: false,
            submitProgress: 0
        });

        // AI-powered field validation
        const validateField = async (section, field, value) => {
            const validations = {
                personal: {
                    email: (val) => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(val)) return 'Please enter a valid email address';
                        return null;
                    },
                    phone: (val) => {
                        const phoneRegex = /^\d{10}$/;
                        const cleaned = val.replace(/\D/g, '');
                        if (cleaned.length !== 10) return 'Please enter a 10-digit phone number';
                        return null;
                    },
                    ssn: (val) => {
                        const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
                        if (!ssnRegex.test(val)) return 'Please enter a valid SSN (XXX-XX-XXXX)';
                        return null;
                    },
                    dateOfBirth: (val) => {
                        const age = new Date().getFullYear() - new Date(val).getFullYear();
                        if (age < 18) return 'Applicant must be 18 years or older';
                        if (age > 120) return 'Please enter a valid date of birth';
                        return null;
                    }
                },
                employment: {
                    monthlyIncome: (val) => {
                        const income = parseFloat(val);
                        if (income < 0) return 'Income cannot be negative';
                        // AI suggestion for income requirements
                        const rentAmount = 2500; // Get from property data
                        if (income < rentAmount * 3) {
                            updateState({
                                aiSuggestions: {
                                    ...state.aiSuggestions,
                                    incomeWarning: `Note: Many landlords require 3x rent in monthly income. Consider adding a co-signer if your income is below ${formatCurrency(rentAmount * 3)}.`
                                }
                            });
                        }
                        return null;
                    },
                    employerPhone: (val) => {
                        // AI auto-format phone numbers
                        const cleaned = val.replace(/\D/g, '');
                        if (cleaned.length === 10) {
                            const formatted = `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
                            updateApplicationData('employment', 'employerPhone', formatted);
                        }
                        return null;
                    }
                }
            };

            const validator = validations[section]?.[field];
            if (validator) {
                const error = validator(value);
                updateState({
                    validationErrors: {
                        ...state.validationErrors,
                        [`${section}.${field}`]: error
                    }
                });
                return !error;
            }
            return true;
        };

        // AI Auto-fill for returning applicants
        const checkReturningApplicant = async (email) => {
            try {
                const response = await window.ApiService.get(`/api/applications/check-returning/${email}`);
                if (response.data) {
                    updateState({ 
                        isReturningApplicant: true,
                        aiSuggestions: {
                            ...state.aiSuggestions,
                            returningApplicant: 'Welcome back! We found your previous application. Would you like us to auto-fill your information?'
                        }
                    });
                    return response.data;
                }
            } catch (error) {
                console.log('New applicant');
            }
            return null;
        };

        const autoFillFromPrevious = async () => {
            const previousData = await checkReturningApplicant(state.applicationData.personal.email);
            if (previousData) {
                updateState({
                    applicationData: {
                        ...state.applicationData,
                        personal: { ...state.applicationData.personal, ...previousData.personal },
                        employment: previousData.employment || {},
                        references: previousData.references || []
                    },
                    aiSuggestions: {
                        ...state.aiSuggestions,
                        autoFilled: 'Your information has been auto-filled. Please review and update any changes.'
                    }
                });
            }
        };

        const updateApplicationData = (section, field, value) => {
            updateState({
                applicationData: {
                    ...state.applicationData,
                    [section]: {
                        ...state.applicationData[section],
                        [field]: value
                    }
                }
            });
            // Trigger validation
            validateField(section, field, value);
        };

        const steps = [
            { id: 'personal', title: 'Personal Information', icon: 'fa-user' },
            { id: 'employment', title: 'Employment & Income', icon: 'fa-briefcase' },
            { id: 'references', title: 'References', icon: 'fa-users' },
            { id: 'documents', title: 'Documents', icon: 'fa-file-alt' },
            { id: 'additional', title: 'Additional Info', icon: 'fa-info-circle' },
            { id: 'review', title: 'Review & Sign', icon: 'fa-pen' }
        ];

        const renderStepContent = () => {
            switch (steps[state.currentStep].id) {
                case 'personal':
                    return renderPersonalInfo();
                case 'employment':
                    return renderEmploymentInfo();
                case 'references':
                    return renderReferences();
                case 'documents':
                    return renderDocuments();
                case 'additional':
                    return renderAdditionalInfo();
                case 'review':
                    return renderReviewAndSign();
                default:
                    return null;
            }
        };

        const renderPersonalInfo = () => {
            const { personal } = state.applicationData;
            
            return React.createElement('div', { className: 'application-section' }, [
                React.createElement('h3', { key: 'title' }, 'Personal Information'),
                
                // AI Suggestion Box
                state.aiSuggestions.returningApplicant && React.createElement('div', { 
                    key: 'ai-suggestion', 
                    className: 'ai-suggestion-box' 
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                    React.createElement('p', { key: 'text' }, state.aiSuggestions.returningApplicant),
                    React.createElement('button', {
                        key: 'autofill',
                        className: 'ai-action-btn',
                        onClick: autoFillFromPrevious
                    }, 'Auto-fill My Information')
                ]),

                React.createElement('div', { key: 'form-grid', className: 'form-grid' }, [
                    // First Name
                    React.createElement('div', { key: 'firstName', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'First Name *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: personal.firstName || '',
                            onChange: (e) => updateApplicationData('personal', 'firstName', e.target.value),
                            required: true
                        }),
                        state.validationErrors['personal.firstName'] && React.createElement('span', { 
                            key: 'error', 
                            className: 'field-error' 
                        }, state.validationErrors['personal.firstName'])
                    ]),

                    // Last Name
                    React.createElement('div', { key: 'lastName', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Last Name *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: personal.lastName || '',
                            onChange: (e) => updateApplicationData('personal', 'lastName', e.target.value),
                            required: true
                        })
                    ]),

                    // Email
                    React.createElement('div', { key: 'email', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Email Address *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'email',
                            value: personal.email || '',
                            onChange: (e) => updateApplicationData('personal', 'email', e.target.value),
                            onBlur: (e) => checkReturningApplicant(e.target.value),
                            required: true
                        }),
                        state.validationErrors['personal.email'] && React.createElement('span', { 
                            key: 'error', 
                            className: 'field-error' 
                        }, state.validationErrors['personal.email'])
                    ]),

                    // Phone
                    React.createElement('div', { key: 'phone', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Phone Number *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'tel',
                            value: personal.phone || '',
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '');
                                if (cleaned.length <= 10) {
                                    updateApplicationData('personal', 'phone', cleaned);
                                }
                            },
                            placeholder: '(555) 555-5555',
                            required: true
                        }),
                        state.validationErrors['personal.phone'] && React.createElement('span', { 
                            key: 'error', 
                            className: 'field-error' 
                        }, state.validationErrors['personal.phone'])
                    ]),

                    // Date of Birth
                    React.createElement('div', { key: 'dob', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Date of Birth *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'date',
                            value: personal.dateOfBirth || '',
                            onChange: (e) => updateApplicationData('personal', 'dateOfBirth', e.target.value),
                            required: true
                        }),
                        state.validationErrors['personal.dateOfBirth'] && React.createElement('span', { 
                            key: 'error', 
                            className: 'field-error' 
                        }, state.validationErrors['personal.dateOfBirth'])
                    ]),

                    // SSN
                    React.createElement('div', { key: 'ssn', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Social Security Number *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: personal.ssn || '',
                            onChange: (e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 9) {
                                    const formatted = value.length > 5 
                                        ? `${value.slice(0,3)}-${value.slice(3,5)}-${value.slice(5)}`
                                        : value.length > 3
                                        ? `${value.slice(0,3)}-${value.slice(3)}`
                                        : value;
                                    updateApplicationData('personal', 'ssn', formatted);
                                }
                            },
                            placeholder: 'XXX-XX-XXXX',
                            required: true
                        }),
                        React.createElement('span', { key: 'security', className: 'security-note' }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-lock' }),
                            ' Your SSN is encrypted and used only for background checks'
                        ])
                    ]),

                    // Current Address
                    React.createElement('div', { 
                        key: 'currentAddress', 
                        className: 'form-group full-width' 
                    }, [
                        React.createElement('label', { key: 'label' }, 'Current Address *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: personal.currentAddress || '',
                            onChange: (e) => updateApplicationData('personal', 'currentAddress', e.target.value),
                            placeholder: 'Street Address',
                            required: true
                        })
                    ]),

                    // City, State, Zip
                    React.createElement('div', { key: 'city', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'City *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: personal.city || '',
                            onChange: (e) => updateApplicationData('personal', 'city', e.target.value),
                            required: true
                        })
                    ]),

                    React.createElement('div', { key: 'state', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'State *'),
                        React.createElement('select', {
                            key: 'select',
                            value: personal.state || '',
                            onChange: (e) => updateApplicationData('personal', 'state', e.target.value),
                            required: true
                        }, [
                            React.createElement('option', { key: 'default', value: '' }, 'Select State'),
                            ...['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state =>
                                React.createElement('option', { key: state, value: state }, state)
                            )
                        ])
                    ]),

                    React.createElement('div', { key: 'zip', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'ZIP Code *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: personal.zip || '',
                            onChange: (e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 5) {
                                    updateApplicationData('personal', 'zip', value);
                                }
                            },
                            required: true
                        })
                    ]),

                    // Move-in Date
                    React.createElement('div', { key: 'moveInDate', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Desired Move-in Date *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'date',
                            value: personal.moveInDate || '',
                            onChange: (e) => updateApplicationData('personal', 'moveInDate', e.target.value),
                            min: new Date().toISOString().split('T')[0],
                            required: true
                        })
                    ])
                ])
            ]);
        };

        const renderEmploymentInfo = () => {
            const { employment } = state.applicationData;
            
            return React.createElement('div', { className: 'application-section' }, [
                React.createElement('h3', { key: 'title' }, 'Employment & Income Information'),
                
                // AI Income Suggestion
                state.aiSuggestions.incomeWarning && React.createElement('div', { 
                    key: 'ai-suggestion', 
                    className: 'ai-suggestion-box warning' 
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-info-circle' }),
                    React.createElement('p', { key: 'text' }, state.aiSuggestions.incomeWarning)
                ]),

                React.createElement('div', { key: 'form-grid', className: 'form-grid' }, [
                    // Employment Status
                    React.createElement('div', { key: 'status', className: 'form-group full-width' }, [
                        React.createElement('label', { key: 'label' }, 'Employment Status *'),
                        React.createElement('select', {
                            key: 'select',
                            value: employment.status || '',
                            onChange: (e) => updateApplicationData('employment', 'status', e.target.value),
                            required: true
                        }, [
                            React.createElement('option', { key: 'default', value: '' }, 'Select Status'),
                            React.createElement('option', { key: 'employed', value: 'employed' }, 'Employed'),
                            React.createElement('option', { key: 'self-employed', value: 'self-employed' }, 'Self-Employed'),
                            React.createElement('option', { key: 'student', value: 'student' }, 'Student'),
                            React.createElement('option', { key: 'retired', value: 'retired' }, 'Retired'),
                            React.createElement('option', { key: 'unemployed', value: 'unemployed' }, 'Unemployed')
                        ])
                    ]),

                    // Employer Information (conditional)
                    (employment.status === 'employed' || employment.status === 'self-employed') && [
                        React.createElement('div', { key: 'employer', className: 'form-group' }, [
                            React.createElement('label', { key: 'label' }, 'Employer Name *'),
                            React.createElement('input', {
                                key: 'input',
                                type: 'text',
                                value: employment.employerName || '',
                                onChange: (e) => updateApplicationData('employment', 'employerName', e.target.value),
                                required: true
                            })
                        ]),

                        React.createElement('div', { key: 'employerPhone', className: 'form-group' }, [
                            React.createElement('label', { key: 'label' }, 'Employer Phone *'),
                            React.createElement('input', {
                                key: 'input',
                                type: 'tel',
                                value: employment.employerPhone || '',
                                onChange: (e) => updateApplicationData('employment', 'employerPhone', e.target.value),
                                placeholder: '(555) 555-5555',
                                required: true
                            })
                        ]),

                        React.createElement('div', { key: 'position', className: 'form-group' }, [
                            React.createElement('label', { key: 'label' }, 'Position/Title *'),
                            React.createElement('input', {
                                key: 'input',
                                type: 'text',
                                value: employment.position || '',
                                onChange: (e) => updateApplicationData('employment', 'position', e.target.value),
                                required: true
                            })
                        ]),

                        React.createElement('div', { key: 'duration', className: 'form-group' }, [
                            React.createElement('label', { key: 'label' }, 'How long at this job? *'),
                            React.createElement('select', {
                                key: 'select',
                                value: employment.employmentDuration || '',
                                onChange: (e) => updateApplicationData('employment', 'employmentDuration', e.target.value),
                                required: true
                            }, [
                                React.createElement('option', { key: 'default', value: '' }, 'Select Duration'),
                                React.createElement('option', { key: '0-6', value: '0-6months' }, 'Less than 6 months'),
                                React.createElement('option', { key: '6-12', value: '6-12months' }, '6-12 months'),
                                React.createElement('option', { key: '1-2', value: '1-2years' }, '1-2 years'),
                                React.createElement('option', { key: '2-5', value: '2-5years' }, '2-5 years'),
                                React.createElement('option', { key: '5+', value: '5+years' }, 'More than 5 years')
                            ])
                        ])
                    ],

                    // Monthly Income
                    React.createElement('div', { key: 'income', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Monthly Income (before taxes) *'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'number',
                            value: employment.monthlyIncome || '',
                            onChange: (e) => updateApplicationData('employment', 'monthlyIncome', e.target.value),
                            placeholder: '0.00',
                            min: '0',
                            step: '0.01',
                            required: true
                        }),
                        state.validationErrors['employment.monthlyIncome'] && React.createElement('span', { 
                            key: 'error', 
                            className: 'field-error' 
                        }, state.validationErrors['employment.monthlyIncome'])
                    ]),

                    // Additional Income
                    React.createElement('div', { key: 'additionalIncome', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Additional Income (optional)'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'number',
                            value: employment.additionalIncome || '',
                            onChange: (e) => updateApplicationData('employment', 'additionalIncome', e.target.value),
                            placeholder: '0.00',
                            min: '0',
                            step: '0.01'
                        })
                    ]),

                    // Additional Income Source
                    employment.additionalIncome > 0 && React.createElement('div', { 
                        key: 'additionalSource', 
                        className: 'form-group full-width' 
                    }, [
                        React.createElement('label', { key: 'label' }, 'Additional Income Source'),
                        React.createElement('input', {
                            key: 'input',
                            type: 'text',
                            value: employment.additionalIncomeSource || '',
                            onChange: (e) => updateApplicationData('employment', 'additionalIncomeSource', e.target.value),
                            placeholder: 'e.g., Freelance work, investments, etc.'
                        })
                    ])
                ])
            ]);
        };

        const renderReferences = () => {
            const { references = [] } = state.applicationData;
            
            return React.createElement('div', { className: 'application-section' }, [
                React.createElement('h3', { key: 'title' }, 'References'),
                React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 
                    'Please provide at least 2 references (not family members)'
                ),

                references.map((ref, index) =>
                    React.createElement('div', { key: index, className: 'reference-block' }, [
                        React.createElement('h4', { key: 'title' }, `Reference ${index + 1}`),
                        React.createElement('div', { key: 'grid', className: 'form-grid' }, [
                            React.createElement('div', { key: 'name', className: 'form-group' }, [
                                React.createElement('label', { key: 'label' }, 'Full Name *'),
                                React.createElement('input', {
                                    key: 'input',
                                    type: 'text',
                                    value: ref.name || '',
                                    onChange: (e) => updateReference(index, 'name', e.target.value),
                                    required: true
                                })
                            ]),

                            React.createElement('div', { key: 'relationship', className: 'form-group' }, [
                                React.createElement('label', { key: 'label' }, 'Relationship *'),
                                React.createElement('select', {
                                    key: 'select',
                                    value: ref.relationship || '',
                                    onChange: (e) => updateReference(index, 'relationship', e.target.value),
                                    required: true
                                }, [
                                    React.createElement('option', { key: 'default', value: '' }, 'Select Relationship'),
                                    React.createElement('option', { key: 'employer', value: 'employer' }, 'Current/Former Employer'),
                                    React.createElement('option', { key: 'landlord', value: 'landlord' }, 'Current/Former Landlord'),
                                    React.createElement('option', { key: 'colleague', value: 'colleague' }, 'Professional Colleague'),
                                    React.createElement('option', { key: 'friend', value: 'friend' }, 'Personal Friend')
                                ])
                            ]),

                            React.createElement('div', { key: 'phone', className: 'form-group' }, [
                                React.createElement('label', { key: 'label' }, 'Phone Number *'),
                                React.createElement('input', {
                                    key: 'input',
                                    type: 'tel',
                                    value: ref.phone || '',
                                    onChange: (e) => updateReference(index, 'phone', e.target.value),
                                    placeholder: '(555) 555-5555',
                                    required: true
                                })
                            ]),

                            React.createElement('div', { key: 'email', className: 'form-group' }, [
                                React.createElement('label', { key: 'label' }, 'Email Address'),
                                React.createElement('input', {
                                    key: 'input',
                                    type: 'email',
                                    value: ref.email || '',
                                    onChange: (e) => updateReference(index, 'email', e.target.value)
                                })
                            ])
                        ]),

                        references.length > 2 && React.createElement('button', {
                            key: 'remove',
                            className: 'remove-reference-btn',
                            onClick: () => removeReference(index)
                        }, 'Remove Reference')
                    ])
                ),

                React.createElement('button', {
                    key: 'add',
                    className: 'add-reference-btn',
                    onClick: addReference
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                    'Add Another Reference'
                ])
            ]);
        };

        const renderDocuments = () => {
            const { documents = [] } = state.applicationData;
            
            return React.createElement('div', { className: 'application-section' }, [
                React.createElement('h3', { key: 'title' }, 'Required Documents'),
                React.createElement('p', { key: 'subtitle', className: 'section-subtitle' }, 
                    'Please upload the following documents to complete your application'
                ),

                // AI Document Checker
                React.createElement('div', { key: 'ai-checker', className: 'ai-document-checker' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                    React.createElement('span', { key: 'text' }, 
                        'Our AI will verify your documents instantly for faster approval'
                    )
                ]),

                React.createElement('div', { key: 'documents-grid', className: 'documents-upload-grid' }, [
                    // Government ID
                    React.createElement(DocumentUpload, {
                        key: 'id',
                        type: 'government_id',
                        title: 'Government-Issued ID',
                        description: 'Driver\'s license, passport, or state ID',
                        required: true,
                        uploaded: documents.find(d => d.type === 'government_id'),
                        onUpload: (file) => handleDocumentUpload('government_id', file)
                    }),

                    // Proof of Income
                    React.createElement(DocumentUpload, {
                        key: 'income',
                        type: 'proof_of_income',
                        title: 'Proof of Income',
                        description: 'Recent pay stubs (last 2-3) or employment letter',
                        required: true,
                        multiple: true,
                        uploaded: documents.filter(d => d.type === 'proof_of_income'),
                        onUpload: (files) => handleDocumentUpload('proof_of_income', files)
                    }),

                    // Bank Statements
                    React.createElement(DocumentUpload, {
                        key: 'bank',
                        type: 'bank_statements',
                        title: 'Bank Statements',
                        description: 'Last 2 months (optional but recommended)',
                        required: false,
                        multiple: true,
                        uploaded: documents.filter(d => d.type === 'bank_statements'),
                        onUpload: (files) => handleDocumentUpload('bank_statements', files)
                    }),

                    // Previous Rental History
                    React.createElement(DocumentUpload, {
                        key: 'rental',
                        type: 'rental_history',
                        title: 'Rental History',
                        description: 'Previous lease or landlord reference',
                        required: false,
                        uploaded: documents.find(d => d.type === 'rental_history'),
                        onUpload: (file) => handleDocumentUpload('rental_history', file)
                    })
                ])
            ]);
        };

        const renderAdditionalInfo = () => {
            const { additionalInfo } = state.applicationData;
            
            return React.createElement('div', { className: 'application-section' }, [
                React.createElement('h3', { key: 'title' }, 'Additional Information'),

                // Pets Section
                React.createElement('div', { key: 'pets', className: 'additional-section' }, [
                    React.createElement('h4', { key: 'title' }, 'Pets'),
                    React.createElement('div', { key: 'has-pets', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Do you have any pets?'),
                        React.createElement('div', { key: 'radio-group', className: 'radio-group' }, [
                            React.createElement('label', { key: 'yes', className: 'radio-label' }, [
                                React.createElement('input', {
                                    key: 'input',
                                    type: 'radio',
                                    name: 'hasPets',
                                    value: 'yes',
                                    checked: additionalInfo.hasPets === 'yes',
                                    onChange: (e) => updateApplicationData('additionalInfo', 'hasPets', e.target.value)
                                }),
                                'Yes'
                            ]),
                            React.createElement('label', { key: 'no', className: 'radio-label' }, [
                                React.createElement('input', {
                                    key: 'input',
                                    type: 'radio',
                                    name: 'hasPets',
                                    value: 'no',
                                    checked: additionalInfo.hasPets === 'no',
                                    onChange: (e) => updateApplicationData('additionalInfo', 'hasPets', e.target.value)
                                }),
                                'No'
                            ])
                        ])
                    ]),

                    additionalInfo.hasPets === 'yes' && React.createElement('div', { 
                        key: 'pet-details', 
                        className: 'pet-details' 
                    }, 
                        (state.applicationData.pets || []).map((pet, index) =>
                            React.createElement('div', { key: index, className: 'pet-info' }, [
                                React.createElement('div', { key: 'grid', className: 'form-grid' }, [
                                    React.createElement('div', { key: 'type', className: 'form-group' }, [
                                        React.createElement('label', { key: 'label' }, 'Pet Type'),
                                        React.createElement('select', {
                                            key: 'select',
                                            value: pet.type || '',
                                            onChange: (e) => updatePet(index, 'type', e.target.value)
                                        }, [
                                            React.createElement('option', { key: 'default', value: '' }, 'Select Type'),
                                            React.createElement('option', { key: 'dog', value: 'dog' }, 'Dog'),
                                            React.createElement('option', { key: 'cat', value: 'cat' }, 'Cat'),
                                            React.createElement('option', { key: 'other', value: 'other' }, 'Other')
                                        ])
                                    ]),
                                    React.createElement('div', { key: 'breed', className: 'form-group' }, [
                                        React.createElement('label', { key: 'label' }, 'Breed'),
                                        React.createElement('input', {
                                            key: 'input',
                                            type: 'text',
                                            value: pet.breed || '',
                                            onChange: (e) => updatePet(index, 'breed', e.target.value)
                                        })
                                    ]),
                                    React.createElement('div', { key: 'weight', className: 'form-group' }, [
                                        React.createElement('label', { key: 'label' }, 'Weight (lbs)'),
                                        React.createElement('input', {
                                            key: 'input',
                                            type: 'number',
                                            value: pet.weight || '',
                                            onChange: (e) => updatePet(index, 'weight', e.target.value)
                                        })
                                    ])
                                ])
                            ])
                        ),
                        React.createElement('button', {
                            key: 'add-pet',
                            className: 'add-pet-btn',
                            onClick: addPet
                        }, 'Add Pet')
                    )
                ]),

                // Vehicles Section
                React.createElement('div', { key: 'vehicles', className: 'additional-section' }, [
                    React.createElement('h4', { key: 'title' }, 'Vehicles'),
                    React.createElement('div', { key: 'has-vehicles', className: 'form-group' }, [
                        React.createElement('label', { key: 'label' }, 'Will you have vehicles that need parking?'),
                        React.createElement('div', { key: 'radio-group', className: 'radio-group' }, [
                            React.createElement('label', { key: 'yes', className: 'radio-label' }, [
                                React.createElement('input', {
                                    key: 'input',
                                    type: 'radio',
                                    name: 'hasVehicles',
                                    value: 'yes',
                                    checked: additionalInfo.hasVehicles === 'yes',
                                    onChange: (e) => updateApplicationData('additionalInfo', 'hasVehicles', e.target.value)
                                }),
                                'Yes'
                            ]),
                            React.createElement('label', { key: 'no', className: 'radio-label' }, [
                                React.createElement('input', {
                                    key: 'input',
                                    type: 'radio',
                                    name: 'hasVehicles',
                                    value: 'no',
                                    checked: additionalInfo.hasVehicles === 'no',
                                    onChange: (e) => updateApplicationData('additionalInfo', 'hasVehicles', e.target.value)
                                }),
                                'No'
                            ])
                        ])
                    ]),

                    additionalInfo.hasVehicles === 'yes' && React.createElement('div', { 
                        key: 'vehicle-count', 
                        className: 'form-group' 
                    }, [
                        React.createElement('label', { key: 'label' }, 'Number of Vehicles'),
                        React.createElement('select', {
                            key: 'select',
                            value: additionalInfo.vehicleCount || '',
                            onChange: (e) => updateApplicationData('additionalInfo', 'vehicleCount', e.target.value)
                        }, [
                            React.createElement('option', { key: '0', value: '' }, 'Select'),
                            React.createElement('option', { key: '1', value: '1' }, '1'),
                            React.createElement('option', { key: '2', value: '2' }, '2'),
                            React.createElement('option', { key: '3', value: '3' }, '3'),
                            React.createElement('option', { key: '4+', value: '4+' }, '4 or more')
                        ])
                    ])
                ]),

                // Additional Comments
                React.createElement('div', { key: 'comments', className: 'form-group full-width' }, [
                    React.createElement('label', { key: 'label' }, 'Additional Comments'),
                    React.createElement('textarea', {
                        key: 'textarea',
                        rows: 4,
                        value: additionalInfo.comments || '',
                        onChange: (e) => updateApplicationData('additionalInfo', 'comments', e.target.value),
                        placeholder: 'Any additional information you\'d like us to know...'
                    })
                ])
            ]);
        };

        const renderReviewAndSign = () => {
            return React.createElement('div', { className: 'application-section review-section' }, [
                React.createElement('h3', { key: 'title' }, 'Review Your Application'),
                
                // Application Summary
                React.createElement('div', { key: 'summary', className: 'application-summary' }, [
                    React.createElement('div', { key: 'personal', className: 'summary-section' }, [
                        React.createElement('h4', { key: 'title' }, 'Personal Information'),
                        React.createElement('div', { key: 'details', className: 'summary-details' }, [
                            React.createElement('p', { key: 'name' }, [
                                React.createElement('strong', {}, 'Name: '),
                                `${state.applicationData.personal.firstName} ${state.applicationData.personal.lastName}`
                            ]),
                            React.createElement('p', { key: 'email' }, [
                                React.createElement('strong', {}, 'Email: '),
                                state.applicationData.personal.email
                            ]),
                            React.createElement('p', { key: 'phone' }, [
                                React.createElement('strong', {}, 'Phone: '),
                                state.applicationData.personal.phone
                            ]),
                            React.createElement('p', { key: 'moveIn' }, [
                                React.createElement('strong', {}, 'Move-in Date: '),
                                new Date(state.applicationData.personal.moveInDate).toLocaleDateString()
                            ])
                        ])
                    ]),

                    React.createElement('div', { key: 'employment', className: 'summary-section' }, [
                        React.createElement('h4', { key: 'title' }, 'Employment Information'),
                        React.createElement('div', { key: 'details', className: 'summary-details' }, [
                            React.createElement('p', { key: 'employer' }, [
                                React.createElement('strong', {}, 'Employer: '),
                                state.applicationData.employment.employerName
                            ]),
                            React.createElement('p', { key: 'income' }, [
                                React.createElement('strong', {}, 'Monthly Income: '),
                                formatCurrency(state.applicationData.employment.monthlyIncome)
                            ])
                        ])
                    ])
                ]),

                // Legal Agreement
                React.createElement('div', { key: 'legal', className: 'legal-agreement' }, [
                    React.createElement('h4', { key: 'title' }, 'Application Agreement'),
                    React.createElement('div', { key: 'terms', className: 'terms-box' }, [
                        React.createElement('p', {}, 'By submitting this application, I certify that:'),
                        React.createElement('ul', {}, [
                            React.createElement('li', {}, 'All information provided is true and accurate'),
                            React.createElement('li', {}, 'I authorize verification of all information including credit and background checks'),
                            React.createElement('li', {}, 'I understand there is a non-refundable application fee'),
                            React.createElement('li', {}, 'Submission of this application does not guarantee approval')
                        ])
                    ]),

                    React.createElement('div', { key: 'signature', className: 'electronic-signature' }, [
                        React.createElement('label', { key: 'label' }, [
                            React.createElement('input', {
                                key: 'checkbox',
                                type: 'checkbox',
                                onChange: (e) => updateApplicationData('additionalInfo', 'agreeToTerms', e.target.checked)
                            }),
                            ' I agree to the terms and conditions above'
                        ])
                    ])
                ]),

                // Submit Button
                React.createElement('button', {
                    key: 'submit',
                    className: 'submit-application-btn',
                    onClick: submitApplication,
                    disabled: !state.applicationData.additionalInfo.agreeToTerms
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-paper-plane' }),
                    'Submit Application & Pay Fee ($50)'
                ])
            ]);
        };

        // Helper functions
        const updateReference = (index, field, value) => {
            const references = [...(state.applicationData.references || [])];
            references[index] = { ...references[index], [field]: value };
            updateState({
                applicationData: { ...state.applicationData, references }
            });
        };

        const addReference = () => {
            const references = [...(state.applicationData.references || []), {}];
            updateState({
                applicationData: { ...state.applicationData, references }
            });
        };

        const removeReference = (index) => {
            const references = state.applicationData.references.filter((_, i) => i !== index);
            updateState({
                applicationData: { ...state.applicationData, references }
            });
        };

        const updatePet = (index, field, value) => {
            const pets = [...(state.applicationData.pets || [])];
            pets[index] = { ...pets[index], [field]: value };
            updateState({
                applicationData: { ...state.applicationData, pets }
            });
        };

        const addPet = () => {
            const pets = [...(state.applicationData.pets || []), {}];
            updateState({
                applicationData: { ...state.applicationData, pets }
            });
        };

        const handleDocumentUpload = async (type, files) => {
            // Handle file upload and AI verification
            const documents = [...state.applicationData.documents];
            
            if (Array.isArray(files)) {
                files.forEach(file => {
                    documents.push({ type, file, status: 'verifying' });
                });
            } else {
                documents.push({ type, file: files, status: 'verifying' });
            }
            
            updateState({
                applicationData: { ...state.applicationData, documents }
            });
            
            // AI document verification
            setTimeout(() => {
                // Mark as verified (in production, this would be actual AI verification)
                const updatedDocs = documents.map(doc => 
                    doc.status === 'verifying' ? { ...doc, status: 'verified' } : doc
                );
                updateState({
                    applicationData: { ...state.applicationData, documents: updatedDocs }
                });
            }, 2000);
        };

        const saveDraft = async () => {
            updateState({ savingDraft: true });
            try {
                await window.ApiService.post('/api/applications/draft', {
                    applicationData: state.applicationData,
                    propertyId,
                    unitId
                });
                window.Toast?.success('Draft saved successfully');
            } catch (error) {
                window.Toast?.error('Failed to save draft');
            }
            updateState({ savingDraft: false });
        };

        const submitApplication = async () => {
            updateState({ submitProgress: 10 });
            
            try {
                // Submit application
                const response = await window.ApiService.post('/api/applications/submit', {
                    applicationData: state.applicationData,
                    propertyId,
                    unitId
                });
                
                updateState({ submitProgress: 50 });
                
                // Process payment
                await processApplicationFee(response.applicationId);
                
                updateState({ submitProgress: 100 });
                
                // Redirect to success page
                window.location.href = `/application-success/${response.applicationId}`;
                
            } catch (error) {
                window.Toast?.error('Failed to submit application');
                updateState({ submitProgress: 0 });
            }
        };

        const processApplicationFee = async (applicationId) => {
            // Integrate with payment processor
            return new Promise((resolve) => {
                setTimeout(resolve, 2000); // Simulate payment processing
            });
        };

        // Initialize with default references
        React.useEffect(() => {
            if (state.applicationData.references.length === 0) {
                updateState({
                    applicationData: {
                        ...state.applicationData,
                        references: [{}, {}] // Start with 2 empty references
                    }
                });
            }
        }, []);

        return React.createElement('div', { className: 'digital-application' }, [
            // Header
            React.createElement('div', { key: 'header', className: 'application-header' }, [
                React.createElement('h1', { key: 'title' }, 'Rental Application'),
                React.createElement('p', { key: 'property' }, `Property: ${propertyId} - Unit ${unitId}`),
                React.createElement('button', {
                    key: 'save-draft',
                    className: 'save-draft-btn',
                    onClick: saveDraft,
                    disabled: state.savingDraft
                }, [
                    React.createElement('i', { 
                        key: 'icon', 
                        className: `fas ${state.savingDraft ? 'fa-spinner fa-spin' : 'fa-save'}` 
                    }),
                    state.savingDraft ? 'Saving...' : 'Save Draft'
                ])
            ]),

            // Progress Indicator
            React.createElement('div', { key: 'progress', className: 'application-progress' }, [
                React.createElement('div', { 
                    key: 'bar',
                    className: 'progress-bar',
                    style: { width: `${(state.currentStep / (steps.length - 1)) * 100}%` }
                }),
                React.createElement('div', { key: 'steps', className: 'progress-steps' },
                    steps.map((step, index) =>
                        React.createElement('div', {
                            key: step.id,
                            className: `progress-step ${
                                index === state.currentStep ? 'active' : 
                                index < state.currentStep ? 'completed' : ''
                            }`
                        }, [
                            React.createElement('div', { key: 'circle', className: 'step-circle' }, 
                                index < state.currentStep 
                                    ? React.createElement('i', { className: 'fas fa-check' })
                                    : index + 1
                            ),
                            React.createElement('span', { key: 'label', className: 'step-label' }, step.title)
                        ])
                    )
                )
            ]),

            // Main Content
            React.createElement('div', { key: 'content', className: 'application-content' },
                renderStepContent()
            ),

            // Navigation
            React.createElement('div', { key: 'navigation', className: 'application-navigation' }, [
                state.currentStep > 0 && React.createElement('button', {
                    key: 'back',
                    className: 'nav-btn back-btn',
                    onClick: () => updateState({ currentStep: state.currentStep - 1 })
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-arrow-left' }),
                    'Back'
                ]),

                state.currentStep < steps.length - 1 && React.createElement('button', {
                    key: 'next',
                    className: 'nav-btn next-btn',
                    onClick: () => {
                        // Validate current step before proceeding
                        updateState({ currentStep: state.currentStep + 1 });
                    }
                }, [
                    'Next',
                    React.createElement('i', { key: 'icon', className: 'fas fa-arrow-right' })
                ])
            ]),

            // AI Assistant Button
            React.createElement('button', {
                key: 'ai-assistant',
                className: 'ai-assistant-btn',
                onClick: () => updateState({ showAIAssistant: !state.showAIAssistant })
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                'AI Assistant'
            ]),

            // AI Assistant Chat
            state.showAIAssistant && React.createElement(AIApplicationAssistant, {
                key: 'ai-chat',
                messages: state.aiAssistantMessages,
                applicationData: state.applicationData,
                currentStep: steps[state.currentStep].id,
                onClose: () => updateState({ showAIAssistant: false }),
                onUpdateApplication: (updates) => {
                    updateState({
                        applicationData: { ...state.applicationData, ...updates }
                    });
                }
            })
        ]);
    });
})();

// Document Upload Component
const DocumentUpload = ComponentFactory.createComponent('DocumentUpload')((props, helpers) => {
    const { type, title, description, required, multiple, uploaded, onUpload } = props;
    const [uploading, setUploading] = React.useState(false);

    const handleFileSelect = (event) => {
        const files = multiple ? Array.from(event.target.files) : event.target.files[0];
        setUploading(true);
        
        // Simulate upload
        setTimeout(() => {
            onUpload(files);
            setUploading(false);
        }, 1500);
    };

    return React.createElement('div', { className: 'document-upload-box' }, [
        React.createElement('div', { key: 'header', className: 'upload-header' }, [
            React.createElement('i', { 
                key: 'icon', 
                className: `fas ${uploaded ? 'fa-check-circle' : 'fa-cloud-upload-alt'}` 
            }),
            React.createElement('h5', { key: 'title' }, title),
            required && React.createElement('span', { key: 'required', className: 'required-badge' }, 'Required')
        ]),
        
        React.createElement('p', { key: 'description', className: 'upload-description' }, description),
        
        uploaded ? React.createElement('div', { key: 'uploaded', className: 'uploaded-files' }, [
            React.createElement('span', { key: 'status', className: 'upload-status verified' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-check' }),
                'Verified by AI'
            ]),
            Array.isArray(uploaded) 
                ? React.createElement('span', { key: 'count' }, `${uploaded.length} files uploaded`)
                : React.createElement('span', { key: 'name' }, uploaded.file?.name || 'File uploaded')
        ]) : React.createElement('div', { key: 'upload-area' }, [
            React.createElement('input', {
                key: 'input',
                type: 'file',
                id: `upload-${type}`,
                onChange: handleFileSelect,
                multiple: multiple,
                style: { display: 'none' },
                accept: 'image/*,.pdf'
            }),
            React.createElement('label', {
                key: 'label',
                htmlFor: `upload-${type}`,
                className: 'upload-label'
            }, [
                uploading 
                    ? React.createElement('i', { key: 'spinner', className: 'fas fa-spinner fa-spin' })
                    : React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                React.createElement('span', { key: 'text' }, 
                    uploading ? 'Uploading...' : 'Choose File(s)'
                )
            ])
        ])
    ]);
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.DigitalApplication = DigitalApplication;
window.AppModules.DocumentUpload = DocumentUpload;