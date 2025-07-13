// ELeaseSigningSystem.jsx - AI-Powered E-Lease Generation & DocuSign Integration
const ELeaseSigningSystem = (() => {
    const ComponentFactory = {
        createComponent: (name) => (componentFunc) => {
            const Component = (props) => {
                const helpers = {
                    useLocalState: (initialState) => {
                        const [state, setState] = React.useState(initialState);
                        const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
                        return [state, updateState];
                    },
                    formatCurrency: (amount) => {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(amount || 0);
                    },
                    formatDate: (date) => {
                        return new Date(date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        });
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('ELeaseSigningSystem')((props, helpers) => {
        const { useLocalState, formatCurrency, formatDate } = helpers;
        
        const [state, updateState] = useLocalState({
            activeView: 'dashboard',
            selectedTemplate: null,
            leaseData: {},
            aiSuggestions: [],
            showAICoPilot: false,
            aiCommand: '',
            generatingLease: false,
            previewMode: false,
            signingProgress: null,
            templates: [],
            recentLeases: [],
            pendingSignatures: []
        });

        // Load templates and recent activity
        React.useEffect(() => {
            loadTemplates();
            loadRecentActivity();
        }, []);

        const loadTemplates = async () => {
            // Simulate loading templates
            const templates = [
                {
                    id: 'standard-residential',
                    name: 'Standard Residential Lease',
                    description: '12-month residential lease agreement',
                    clauses: ['rent', 'security', 'maintenance', 'termination'],
                    popularAddons: ['pet', 'parking', 'utilities']
                },
                {
                    id: 'month-to-month',
                    name: 'Month-to-Month Agreement',
                    description: 'Flexible monthly rental agreement',
                    clauses: ['rent', 'notice', 'security', 'rules'],
                    popularAddons: ['storage', 'guest']
                },
                {
                    id: 'corporate-housing',
                    name: 'Corporate Housing Lease',
                    description: 'Short-term furnished rental',
                    clauses: ['rent', 'furnishings', 'services', 'early-termination'],
                    popularAddons: ['cleaning', 'internet']
                }
            ];
            updateState({ templates });
        };

        const loadRecentActivity = async () => {
            // Simulate loading recent leases
            const recentLeases = [
                {
                    id: 'L001',
                    tenant: 'Sarah Johnson',
                    unit: '3B',
                    status: 'signed',
                    createdDate: '2025-01-10',
                    signedDate: '2025-01-11'
                },
                {
                    id: 'L002',
                    tenant: 'Mike Chen',
                    unit: '5A',
                    status: 'pending',
                    createdDate: '2025-01-12',
                    expiresIn: '48 hours'
                }
            ];
            
            const pendingSignatures = recentLeases.filter(l => l.status === 'pending');
            updateState({ recentLeases, pendingSignatures });
        };

        return React.createElement('div', { className: 'elease-signing-system' }, [
            // Header
            React.createElement('div', { key: 'header', className: 'elease-header' }, [
                React.createElement('h1', { key: 'title' }, 'E-Lease Management'),
                React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                    React.createElement('button', {
                        key: 'new-lease',
                        className: 'btn btn-primary',
                        onClick: () => updateState({ activeView: 'create' })
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                        'Create New Lease'
                    ]),
                    React.createElement('button', {
                        key: 'ai-copilot',
                        className: `btn btn-ai ${state.showAICoPilot ? 'active' : ''}`,
                        onClick: () => updateState({ showAICoPilot: !state.showAICoPilot })
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
                        'AI CoPilot'
                    ])
                ])
            ]),

            // Main Content
            React.createElement('div', { key: 'content', className: 'elease-content' }, [
                state.activeView === 'dashboard' && renderDashboard(),
                state.activeView === 'create' && renderLeaseCreation(),
                state.activeView === 'preview' && renderLeasePreview(),
                state.activeView === 'signing' && renderSigningProcess()
            ]),

            // AI CoPilot Panel
            state.showAICoPilot && React.createElement(AICoPilotPanel, {
                key: 'ai-copilot',
                command: state.aiCommand,
                onCommandChange: (command) => updateState({ aiCommand: command }),
                onExecuteCommand: executeAICommand,
                suggestions: state.aiSuggestions
            })
        ]);

        // Dashboard View
        function renderDashboard() {
            return React.createElement('div', { className: 'elease-dashboard' }, [
                // Quick Stats
                React.createElement('div', { key: 'stats', className: 'dashboard-stats' }, [
                    {
                        label: 'Active Leases',
                        value: '47',
                        icon: 'fa-file-contract',
                        color: 'primary'
                    },
                    {
                        label: 'Pending Signatures',
                        value: state.pendingSignatures.length,
                        icon: 'fa-clock',
                        color: 'warning'
                    },
                    {
                        label: 'Expiring Soon',
                        value: '3',
                        icon: 'fa-calendar-times',
                        color: 'danger'
                    },
                    {
                        label: 'Templates',
                        value: state.templates.length,
                        icon: 'fa-file-alt',
                        color: 'info'
                    }
                ].map((stat, idx) =>
                    React.createElement('div', { 
                        key: idx, 
                        className: `stat-card ${stat.color}` 
                    }, [
                        React.createElement('i', { key: 'icon', className: `fas ${stat.icon}` }),
                        React.createElement('div', { key: 'content', className: 'stat-content' }, [
                            React.createElement('span', { key: 'value', className: 'stat-value' }, stat.value),
                            React.createElement('span', { key: 'label', className: 'stat-label' }, stat.label)
                        ])
                    ])
                )),

                // Template Gallery
                React.createElement('div', { key: 'templates', className: 'template-section' }, [
                    React.createElement('h2', { key: 'title' }, 'Lease Templates'),
                    React.createElement('div', { key: 'grid', className: 'template-grid' },
                        state.templates.map(template =>
                            React.createElement('div', {
                                key: template.id,
                                className: 'template-card',
                                onClick: () => {
                                    updateState({ 
                                        selectedTemplate: template,
                                        activeView: 'create'
                                    });
                                }
                            }, [
                                React.createElement('div', { key: 'header', className: 'template-header' }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-file-alt' }),
                                    React.createElement('h3', { key: 'name' }, template.name)
                                ]),
                                React.createElement('p', { key: 'desc', className: 'template-description' }, 
                                    template.description
                                ),
                                React.createElement('div', { key: 'footer', className: 'template-footer' }, [
                                    React.createElement('span', { key: 'clauses' }, 
                                        `${template.clauses.length} standard clauses`
                                    ),
                                    React.createElement('button', { 
                                        key: 'use',
                                        className: 'use-template-btn' 
                                    }, 'Use Template')
                                ])
                            ])
                        )
                    )
                ]),

                // Recent Activity
                React.createElement('div', { key: 'activity', className: 'recent-activity' }, [
                    React.createElement('h2', { key: 'title' }, 'Recent Leases'),
                    React.createElement('div', { key: 'list', className: 'lease-list' },
                        state.recentLeases.map(lease =>
                            React.createElement('div', {
                                key: lease.id,
                                className: `lease-item ${lease.status}`
                            }, [
                                React.createElement('div', { key: 'info', className: 'lease-info' }, [
                                    React.createElement('h4', { key: 'tenant' }, lease.tenant),
                                    React.createElement('p', { key: 'unit' }, `Unit ${lease.unit}`),
                                    React.createElement('span', { key: 'date', className: 'lease-date' }, 
                                        formatDate(lease.createdDate)
                                    )
                                ]),
                                React.createElement('div', { key: 'status', className: 'lease-status' }, [
                                    React.createElement('span', { 
                                        key: 'badge',
                                        className: `status-badge ${lease.status}` 
                                    }, lease.status),
                                    lease.expiresIn && React.createElement('span', { 
                                        key: 'expires',
                                        className: 'expires-in' 
                                    }, `Expires in ${lease.expiresIn}`)
                                ]),
                                React.createElement('button', {
                                    key: 'action',
                                    className: 'lease-action-btn'
                                }, lease.status === 'pending' ? 'Send Reminder' : 'View')
                            ])
                        )
                    )
                ])
            ]);
        }

        // Lease Creation View
        function renderLeaseCreation() {
            return React.createElement('div', { className: 'lease-creation' }, [
                React.createElement('div', { key: 'header', className: 'creation-header' }, [
                    React.createElement('button', {
                        key: 'back',
                        className: 'back-btn',
                        onClick: () => updateState({ activeView: 'dashboard' })
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-arrow-left' }),
                        'Back'
                    ]),
                    React.createElement('h2', { key: 'title' }, 
                        state.selectedTemplate 
                            ? `Creating ${state.selectedTemplate.name}`
                            : 'Create New Lease'
                    )
                ]),

                React.createElement(LeaseBuilder, {
                    key: 'builder',
                    template: state.selectedTemplate,
                    leaseData: state.leaseData,
                    onUpdateLease: (data) => updateState({ leaseData: data }),
                    onGenerateLease: generateLease
                })
            ]);
        }

        // Lease Preview View
        function renderLeasePreview() {
            return React.createElement('div', { className: 'lease-preview' }, [
                React.createElement('div', { key: 'header', className: 'preview-header' }, [
                    React.createElement('button', {
                        key: 'back',
                        className: 'back-btn',
                        onClick: () => updateState({ activeView: 'create' })
                    }, 'Back to Edit'),
                    React.createElement('h2', { key: 'title' }, 'Lease Preview'),
                    React.createElement('button', {
                        key: 'send',
                        className: 'btn btn-primary',
                        onClick: () => updateState({ activeView: 'signing' })
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-paper-plane' }),
                        'Send for Signature'
                    ])
                ]),

                React.createElement('div', { key: 'document', className: 'lease-document' },
                    React.createElement(LeaseDocument, {
                        leaseData: state.leaseData,
                        template: state.selectedTemplate
                    })
                )
            ]);
        }

        // Signing Process View
        function renderSigningProcess() {
            return React.createElement('div', { className: 'signing-process' }, [
                React.createElement('h2', { key: 'title' }, 'DocuSign Integration'),
                React.createElement(DocuSignFlow, {
                    key: 'docusign',
                    leaseData: state.leaseData,
                    onComplete: (signedLease) => {
                        window.Toast?.success('Lease signed successfully!');
                        updateState({ activeView: 'dashboard' });
                    }
                })
            ]);
        }

        // AI Command Execution
        async function executeAICommand(command) {
            updateState({ generatingLease: true });
            
            try {
                // Parse natural language command
                const parsed = await parseAICommand(command);
                
                if (parsed.action === 'create_lease') {
                    // AI generates lease based on command
                    const leaseData = await generateLeaseFromCommand(parsed);
                    updateState({
                        leaseData,
                        selectedTemplate: parsed.template,
                        activeView: 'preview',
                        generatingLease: false
                    });
                    
                    window.Toast?.success('Lease generated! Please review.');
                } else if (parsed.action === 'add_clause') {
                    // Add specific clause to existing lease
                    const updatedLease = await addAIClause(state.leaseData, parsed.clause);
                    updateState({
                        leaseData: updatedLease,
                        generatingLease: false
                    });
                    
                    window.Toast?.success(`${parsed.clause} clause added!`);
                }
            } catch (error) {
                window.Toast?.error('Could not understand command. Try again.');
                updateState({ generatingLease: false });
            }
        }

        async function parseAICommand(command) {
            // Simulate AI parsing
            const lowerCommand = command.toLowerCase();
            
            if (lowerCommand.includes('create') || lowerCommand.includes('generate')) {
                // Extract unit and tenant info
                const unitMatch = lowerCommand.match(/unit\s+(\w+)/);
                const tenantMatch = lowerCommand.match(/for\s+([^,]+)/);
                
                return {
                    action: 'create_lease',
                    unit: unitMatch ? unitMatch[1] : null,
                    tenant: tenantMatch ? tenantMatch[1].trim() : null,
                    template: lowerCommand.includes('month') ? 'month-to-month' : 'standard-residential',
                    addons: []
                };
            }
            
            if (lowerCommand.includes('add') && lowerCommand.includes('clause')) {
                const clauseTypes = ['pet', 'parking', 'early termination', 'subletting'];
                const foundClause = clauseTypes.find(c => lowerCommand.includes(c));
                
                return {
                    action: 'add_clause',
                    clause: foundClause || 'custom'
                };
            }
            
            throw new Error('Command not recognized');
        }

        async function generateLeaseFromCommand(parsed) {
            // AI generates complete lease data
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate AI processing
            
            return {
                tenant: {
                    name: parsed.tenant || 'John Doe',
                    email: 'tenant@example.com',
                    phone: '(555) 123-4567'
                },
                property: {
                    address: '123 Main St',
                    unit: parsed.unit || '101',
                    city: 'San Francisco',
                    state: 'CA',
                    zip: '94105'
                },
                terms: {
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    rentAmount: 2500,
                    securityDeposit: 2500,
                    paymentDue: 1
                },
                clauses: {
                    standard: true,
                    pet: parsed.addons?.includes('pet'),
                    parking: parsed.addons?.includes('parking'),
                    utilities: true,
                    maintenance: true
                }
            };
        }

        async function generateLease(leaseData) {
            updateState({ generatingLease: true });
            
            // AI enriches lease with smart clauses
            const enrichedLease = await enrichLeaseWithAI(leaseData);
            
            updateState({
                leaseData: enrichedLease,
                activeView: 'preview',
                generatingLease: false
            });
        }

        async function enrichLeaseWithAI(leaseData) {
            // AI adds contextual clauses
            const enriched = { ...leaseData };
            
            // Add proration clause if mid-month move-in
            const moveInDay = new Date(leaseData.terms.startDate).getDate();
            if (moveInDay !== 1) {
                enriched.clauses.proration = {
                    enabled: true,
                    amount: (leaseData.terms.rentAmount / 30) * (30 - moveInDay + 1),
                    text: `First month's rent shall be prorated from ${formatDate(leaseData.terms.startDate)} at a daily rate of ${formatCurrency(leaseData.terms.rentAmount / 30)}.`
                };
            }
            
            // Add seasonal clauses
            const moveInMonth = new Date(leaseData.terms.startDate).getMonth();
            if (moveInMonth >= 10 || moveInMonth <= 2) { // Winter months
                enriched.clauses.winterization = {
                    enabled: true,
                    text: 'Tenant agrees to maintain heating at minimum 55°F to prevent pipe freezing during winter months.'
                };
            }
            
            return enriched;
        }
    });
})();

// Lease Builder Component
const LeaseBuilder = ComponentFactory.createComponent('LeaseBuilder')((props, helpers) => {
    const { template, leaseData, onUpdateLease, onGenerateLease } = props;
    const { formatCurrency } = helpers;
    
    const [activeSection, setActiveSection] = React.useState('tenant');
    
    const sections = [
        { id: 'tenant', title: 'Tenant Information', icon: 'fa-user' },
        { id: 'property', title: 'Property Details', icon: 'fa-home' },
        { id: 'terms', title: 'Lease Terms', icon: 'fa-calendar' },
        { id: 'clauses', title: 'Clauses & Addendums', icon: 'fa-file-contract' }
    ];

    const updateSection = (section, field, value) => {
        onUpdateLease({
            ...leaseData,
            [section]: {
                ...leaseData[section],
                [field]: value
            }
        });
    };

    return React.createElement('div', { className: 'lease-builder' }, [
        // Section Navigation
        React.createElement('div', { key: 'nav', className: 'section-nav' },
            sections.map(section =>
                React.createElement('button', {
                    key: section.id,
                    className: `section-btn ${activeSection === section.id ? 'active' : ''}`,
                    onClick: () => setActiveSection(section.id)
                }, [
                    React.createElement('i', { key: 'icon', className: `fas ${section.icon}` }),
                    React.createElement('span', { key: 'title' }, section.title)
                ])
            )
        ),

        // Section Content
        React.createElement('div', { key: 'content', className: 'section-content' }, [
            activeSection === 'tenant' && renderTenantSection(),
            activeSection === 'property' && renderPropertySection(),
            activeSection === 'terms' && renderTermsSection(),
            activeSection === 'clauses' && renderClausesSection()
        ]),

        // Action Buttons
        React.createElement('div', { key: 'actions', className: 'builder-actions' }, [
            React.createElement('button', {
                key: 'save-draft',
                className: 'btn btn-secondary'
            }, 'Save as Draft'),
            React.createElement('button', {
                key: 'generate',
                className: 'btn btn-primary',
                onClick: () => onGenerateLease(leaseData)
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-magic' }),
                'Generate Lease with AI'
            ])
        ])
    ]);

    function renderTenantSection() {
        const tenant = leaseData.tenant || {};
        
        return React.createElement('div', { className: 'form-section' }, [
            React.createElement('h3', { key: 'title' }, 'Tenant Information'),
            React.createElement('div', { key: 'grid', className: 'form-grid' }, [
                React.createElement('div', { key: 'name', className: 'form-group' }, [
                    React.createElement('label', {}, 'Full Name'),
                    React.createElement('input', {
                        type: 'text',
                        value: tenant.name || '',
                        onChange: (e) => updateSection('tenant', 'name', e.target.value)
                    })
                ]),
                React.createElement('div', { key: 'email', className: 'form-group' }, [
                    React.createElement('label', {}, 'Email Address'),
                    React.createElement('input', {
                        type: 'email',
                        value: tenant.email || '',
                        onChange: (e) => updateSection('tenant', 'email', e.target.value)
                    })
                ]),
                React.createElement('div', { key: 'phone', className: 'form-group' }, [
                    React.createElement('label', {}, 'Phone Number'),
                    React.createElement('input', {
                        type: 'tel',
                        value: tenant.phone || '',
                        onChange: (e) => updateSection('tenant', 'phone', e.target.value)
                    })
                ])
            ])
        ]);
    }

    function renderPropertySection() {
        const property = leaseData.property || {};
        
        return React.createElement('div', { className: 'form-section' }, [
            React.createElement('h3', { key: 'title' }, 'Property Details'),
            React.createElement('div', { key: 'grid', className: 'form-grid' }, [
                React.createElement('div', { key: 'address', className: 'form-group full-width' }, [
                    React.createElement('label', {}, 'Property Address'),
                    React.createElement('input', {
                        type: 'text',
                        value: property.address || '',
                        onChange: (e) => updateSection('property', 'address', e.target.value)
                    })
                ]),
                React.createElement('div', { key: 'unit', className: 'form-group' }, [
                    React.createElement('label', {}, 'Unit Number'),
                    React.createElement('input', {
                        type: 'text',
                        value: property.unit || '',
                        onChange: (e) => updateSection('property', 'unit', e.target.value)
                    })
                ]),
                React.createElement('div', { key: 'city', className: 'form-group' }, [
                    React.createElement('label', {}, 'City'),
                    React.createElement('input', {
                        type: 'text',
                        value: property.city || '',
                        onChange: (e) => updateSection('property', 'city', e.target.value)
                    })
                ])
            ])
        ]);
    }

    function renderTermsSection() {
        const terms = leaseData.terms || {};
        
        return React.createElement('div', { className: 'form-section' }, [
            React.createElement('h3', { key: 'title' }, 'Lease Terms'),
            
            // AI Suggestion for mid-month move-in
            terms.startDate && new Date(terms.startDate).getDate() !== 1 && 
            React.createElement('div', { key: 'ai-suggestion', className: 'ai-suggestion-box' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-lightbulb' }),
                React.createElement('p', {}, 'AI detected mid-month move-in. A proration clause will be automatically added.')
            ]),
            
            React.createElement('div', { key: 'grid', className: 'form-grid' }, [
                React.createElement('div', { key: 'start', className: 'form-group' }, [
                    React.createElement('label', {}, 'Lease Start Date'),
                    React.createElement('input', {
                        type: 'date',
                        value: terms.startDate || '',
                        onChange: (e) => updateSection('terms', 'startDate', e.target.value)
                    })
                ]),
                React.createElement('div', { key: 'end', className: 'form-group' }, [
                    React.createElement('label', {}, 'Lease End Date'),
                    React.createElement('input', {
                        type: 'date',
                        value: terms.endDate || '',
                        onChange: (e) => updateSection('terms', 'endDate', e.target.value)
                    })
                ]),
                React.createElement('div', { key: 'rent', className: 'form-group' }, [
                    React.createElement('label', {}, 'Monthly Rent'),
                    React.createElement('input', {
                        type: 'number',
                        value: terms.rentAmount || '',
                        onChange: (e) => updateSection('terms', 'rentAmount', parseFloat(e.target.value))
                    })
                ]),
                React.createElement('div', { key: 'deposit', className: 'form-group' }, [
                    React.createElement('label', {}, 'Security Deposit'),
                    React.createElement('input', {
                        type: 'number',
                        value: terms.securityDeposit || '',
                        onChange: (e) => updateSection('terms', 'securityDeposit', parseFloat(e.target.value))
                    })
                ])
            ])
        ]);
    }

    function renderClausesSection() {
        const clauses = leaseData.clauses || {};
        
        return React.createElement('div', { className: 'form-section' }, [
            React.createElement('h3', { key: 'title' }, 'Clauses & Addendums'),
            
            React.createElement('div', { key: 'standard', className: 'clause-group' }, [
                React.createElement('h4', {}, 'Standard Clauses'),
                React.createElement('p', { className: 'clause-description' }, 
                    'These clauses are automatically included based on your template and local regulations.'
                ),
                ['Rent Payment', 'Security Deposit', 'Maintenance Responsibilities', 'Termination'].map(clause =>
                    React.createElement('div', { key: clause, className: 'clause-item included' }, [
                        React.createElement('i', { key: 'check', className: 'fas fa-check-circle' }),
                        React.createElement('span', {}, clause)
                    ])
                )
            ]),
            
            React.createElement('div', { key: 'optional', className: 'clause-group' }, [
                React.createElement('h4', {}, 'Optional Addendums'),
                [
                    { id: 'pet', label: 'Pet Addendum', description: 'Allows pets with deposit' },
                    { id: 'parking', label: 'Parking Space', description: 'Assigns specific parking' },
                    { id: 'utilities', label: 'Utilities Inclusion', description: 'Specifies included utilities' },
                    { id: 'earlyTermination', label: 'Early Termination', description: 'Allows early exit with penalty' }
                ].map(addon =>
                    React.createElement('div', { key: addon.id, className: 'addon-option' }, [
                        React.createElement('label', { className: 'addon-label' }, [
                            React.createElement('input', {
                                type: 'checkbox',
                                checked: clauses[addon.id] || false,
                                onChange: (e) => updateSection('clauses', addon.id, e.target.checked)
                            }),
                            React.createElement('div', { className: 'addon-info' }, [
                                React.createElement('span', { className: 'addon-title' }, addon.label),
                                React.createElement('span', { className: 'addon-desc' }, addon.description)
                            ])
                        ])
                    ])
                )
            ])
        ]);
    }
});

// AI CoPilot Panel
const AICoPilotPanel = ComponentFactory.createComponent('AICoPilotPanel')((props, helpers) => {
    const { command, onCommandChange, onExecuteCommand, suggestions } = props;
    
    const exampleCommands = [
        'Generate a lease for Unit 101 with a pet addendum',
        'Create month-to-month agreement for John Smith',
        'Add early termination clause to current lease',
        'Generate lease for 3B starting March 15th with parking'
    ];
    
    return React.createElement('div', { className: 'ai-copilot-panel' }, [
        React.createElement('div', { key: 'header', className: 'copilot-header' }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-robot' }),
            React.createElement('h3', { key: 'title' }, 'AI Lease Assistant')
        ]),
        
        React.createElement('div', { key: 'input', className: 'copilot-input' }, [
            React.createElement('input', {
                type: 'text',
                placeholder: 'Type a command...',
                value: command,
                onChange: (e) => onCommandChange(e.target.value),
                onKeyPress: (e) => {
                    if (e.key === 'Enter' && command.trim()) {
                        onExecuteCommand(command);
                    }
                }
            }),
            React.createElement('button', {
                onClick: () => command.trim() && onExecuteCommand(command),
                disabled: !command.trim()
            }, React.createElement('i', { className: 'fas fa-paper-plane' }))
        ]),
        
        React.createElement('div', { key: 'examples', className: 'copilot-examples' }, [
            React.createElement('p', { key: 'label' }, 'Try these commands:'),
            exampleCommands.map((example, idx) =>
                React.createElement('button', {
                    key: idx,
                    className: 'example-command',
                    onClick: () => onCommandChange(example)
                }, example)
            )
        ]),
        
        suggestions.length > 0 && React.createElement('div', { 
            key: 'suggestions', 
            className: 'copilot-suggestions' 
        }, [
            React.createElement('h4', {}, 'AI Suggestions:'),
            suggestions.map((suggestion, idx) =>
                React.createElement('div', { key: idx, className: 'suggestion-item' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-lightbulb' }),
                    React.createElement('span', {}, suggestion)
                ])
            )
        ])
    ]);
});

// DocuSign Flow Component
const DocuSignFlow = ComponentFactory.createComponent('DocuSignFlow')((props, helpers) => {
    const { leaseData, onComplete } = props;
    const [signingStatus, setSigningStatus] = React.useState('preparing');
    const [signingUrl, setSigningUrl] = React.useState(null);
    
    React.useEffect(() => {
        initiateDocuSign();
    }, []);
    
    const initiateDocuSign = async () => {
        setSigningStatus('preparing');
        
        try {
            // Simulate DocuSign API integration
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In production, this would call DocuSign API
            const mockSigningUrl = 'https://demo.docusign.net/signing/abc123';
            setSigningUrl(mockSigningUrl);
            setSigningStatus('ready');
            
            // Simulate signing completion
            setTimeout(() => {
                setSigningStatus('completed');
                onComplete({ ...leaseData, signedDate: new Date() });
            }, 10000);
            
        } catch (error) {
            setSigningStatus('error');
        }
    };
    
    return React.createElement('div', { className: 'docusign-flow' }, [
        signingStatus === 'preparing' && React.createElement('div', { 
            key: 'preparing', 
            className: 'signing-status preparing' 
        }, [
            React.createElement('div', { key: 'spinner', className: 'signing-spinner' }),
            React.createElement('h3', {}, 'Preparing Document for Signing...'),
            React.createElement('p', {}, 'Uploading lease to DocuSign and configuring signature fields')
        ]),
        
        signingStatus === 'ready' && React.createElement('div', { 
            key: 'ready', 
            className: 'signing-status ready' 
        }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-file-signature' }),
            React.createElement('h3', {}, 'Document Ready for Signing'),
            React.createElement('p', {}, 'The lease has been sent to all parties for electronic signature.'),
            React.createElement('div', { key: 'actions', className: 'signing-actions' }, [
                React.createElement('button', {
                    key: 'preview',
                    className: 'btn btn-secondary'
                }, 'Preview Document'),
                React.createElement('button', {
                    key: 'track',
                    className: 'btn btn-primary'
                }, 'Track Signing Status')
            ]),
            React.createElement('div', { key: 'embed', className: 'docusign-embed' },
                React.createElement('p', {}, 'DocuSign embedded signing would appear here')
            )
        ]),
        
        signingStatus === 'completed' && React.createElement('div', { 
            key: 'completed', 
            className: 'signing-status completed' 
        }, [
            React.createElement('i', { key: 'icon', className: 'fas fa-check-circle' }),
            React.createElement('h3', {}, 'Lease Signed Successfully!'),
            React.createElement('p', {}, 'All parties have signed the lease agreement.'),
            React.createElement('button', {
                key: 'download',
                className: 'btn btn-primary'
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-download' }),
                'Download Signed Lease'
            ])
        ])
    ]);
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.ELeaseSigningSystem = ELeaseSigningSystem;
window.AppModules.LeaseBuilder = LeaseBuilder;
window.AppModules.AICoPilotPanel = AICoPilotPanel;
window.AppModules.DocuSignFlow = DocuSignFlow;