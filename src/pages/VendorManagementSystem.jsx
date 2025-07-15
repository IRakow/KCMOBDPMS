// VendorManagementSystem.jsx - World-Class Vendor Management with AI
const VendorManagementSystem = () => {
    const [vendors, setVendors] = React.useState([]);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [showDetailModal, setShowDetailModal] = React.useState(false);
    const [showAssignModal, setShowAssignModal] = React.useState(false);
    const [assigningVendor, setAssigningVendor] = React.useState(null);
    const [selectedVendor, setSelectedVendor] = React.useState(null);
    const [filters, setFilters] = React.useState({
        category: 'all',
        status: 'all',
        rating: 'all'
    });
    const [searchTerm, setSearchTerm] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    // Connect to maintenance store for work orders
    const maintenanceStore = window.useMaintenanceStore ? window.useMaintenanceStore() : null;

    // Load vendors from database
    React.useEffect(() => {
        loadVendors();
    }, []);

    const loadVendors = async () => {
        setLoading(true);
        try {
            if (window.ApiService && typeof window.ApiService.get === 'function') {
                const response = await window.ApiService.get('/vendors');
                setVendors(response.data);
            } else {
                // Mock data for demonstration
                setVendors(mockVendors);
            }
        } catch (error) {
            console.error('Error loading vendors:', error);
            setVendors(mockVendors);
        } finally {
            setLoading(false);
        }
    };

    // Mock vendor data
    const mockVendors = [
        {
            id: 1,
            name: 'AquaFix Plumbing Services',
            category: 'plumbing',
            email: 'contact@aquafix.com',
            phone: '(555) 123-4567',
            license: 'CA-PLM-98765',
            insurance: {
                carrier: 'State Farm',
                policy: 'GL-123456',
                expires: '2025-12-31',
                coverage: 2000000
            },
            rating: 4.9,
            totalJobs: 127,
            completedJobs: 125,
            avgResponseTime: 45, // minutes
            avgCompletionTime: 180, // minutes
            avgCost: 285,
            specialties: ['Emergency repairs', 'Leak detection', 'Pipe replacement'],
            serviceAreas: ['Los Angeles', 'Santa Monica', 'Beverly Hills'],
            availability: {
                monday: { start: '07:00', end: '18:00' },
                tuesday: { start: '07:00', end: '18:00' },
                wednesday: { start: '07:00', end: '18:00' },
                thursday: { start: '07:00', end: '18:00' },
                friday: { start: '07:00', end: '18:00' },
                saturday: { start: '08:00', end: '16:00' },
                sunday: { start: '10:00', end: '14:00', emergency: true }
            },
            performanceScore: 95,
            aiScore: 92,
            status: 'active',
            preferredVendor: true,
            documents: [
                { type: 'license', name: 'Plumbing License', verified: true },
                { type: 'insurance', name: 'GL Insurance', verified: true },
                { type: 'w9', name: 'W-9 Form', verified: true }
            ],
            reviews: [
                {
                    id: 1,
                    tenant: 'Sarah Johnson',
                    property: 'Sunset Apartments',
                    rating: 5,
                    date: '2025-01-10',
                    comment: 'Fast response, professional service. Fixed the leak quickly.'
                },
                {
                    id: 2,
                    tenant: 'Michael Chen',
                    property: 'Downtown Plaza',
                    rating: 5,
                    date: '2025-01-05',
                    comment: 'Excellent work on bathroom renovation. Clean and efficient.'
                }
            ]
        },
        {
            id: 2,
            name: 'PowerPro Electric',
            category: 'electrical',
            email: 'service@powerpro.com',
            phone: '(555) 234-5678',
            license: 'CA-ELC-54321',
            insurance: {
                carrier: 'Allstate',
                policy: 'GL-789012',
                expires: '2025-11-30',
                coverage: 3000000
            },
            rating: 4.8,
            totalJobs: 89,
            completedJobs: 88,
            avgResponseTime: 72, // minutes
            avgCompletionTime: 240, // minutes
            avgCost: 425,
            specialties: ['Panel upgrades', 'EV charger installation', 'Emergency repairs'],
            serviceAreas: ['Los Angeles', 'Pasadena', 'Glendale'],
            availability: {
                monday: { start: '06:00', end: '20:00' },
                tuesday: { start: '06:00', end: '20:00' },
                wednesday: { start: '06:00', end: '20:00' },
                thursday: { start: '06:00', end: '20:00' },
                friday: { start: '06:00', end: '20:00' },
                saturday: { start: '08:00', end: '18:00' },
                sunday: { emergency: true }
            },
            performanceScore: 93,
            aiScore: 90,
            status: 'active',
            preferredVendor: true,
            documents: [
                { type: 'license', name: 'Electrical License', verified: true },
                { type: 'insurance', name: 'GL Insurance', verified: true },
                { type: 'certification', name: 'NFPA Certification', verified: true }
            ]
        },
        {
            id: 3,
            name: 'CoolBreeze HVAC Solutions',
            category: 'hvac',
            email: 'info@coolbreezehvac.com',
            phone: '(555) 345-6789',
            license: 'CA-HVC-12345',
            insurance: {
                carrier: 'Progressive',
                policy: 'GL-345678',
                expires: '2025-10-31',
                coverage: 2500000
            },
            rating: 4.7,
            totalJobs: 156,
            completedJobs: 150,
            avgResponseTime: 120, // minutes
            avgCompletionTime: 360, // minutes
            avgCost: 520,
            specialties: ['AC repair', 'Heating systems', 'Preventive maintenance'],
            serviceAreas: ['Los Angeles County'],
            availability: {
                monday: { start: '07:00', end: '19:00' },
                tuesday: { start: '07:00', end: '19:00' },
                wednesday: { start: '07:00', end: '19:00' },
                thursday: { start: '07:00', end: '19:00' },
                friday: { start: '07:00', end: '19:00' },
                saturday: { start: '09:00', end: '17:00' },
                sunday: { emergency: true }
            },
            performanceScore: 88,
            aiScore: 85,
            status: 'busy',
            preferredVendor: false,
            documents: [
                { type: 'license', name: 'HVAC License', verified: true },
                { type: 'insurance', name: 'GL Insurance', verified: true },
                { type: 'epa', name: 'EPA Certification', verified: true }
            ]
        }
    ];

    // Vendor categories configuration
    const vendorCategories = {
        plumbing: { icon: 'fa-faucet', color: '#3b82f6', label: 'Plumbing' },
        electrical: { icon: 'fa-bolt', color: '#f59e0b', label: 'Electrical' },
        hvac: { icon: 'fa-snowflake', color: '#ef4444', label: 'HVAC' },
        appliance: { icon: 'fa-blender', color: '#10b981', label: 'Appliance' },
        landscaping: { icon: 'fa-tree', color: '#059669', label: 'Landscaping' },
        general: { icon: 'fa-hammer', color: '#8b5cf6', label: 'General' },
        cleaning: { icon: 'fa-broom', color: '#ec4899', label: 'Cleaning' },
        pest: { icon: 'fa-bug', color: '#a78bfa', label: 'Pest Control' }
    };

    // Filter vendors based on search and filters
    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            vendor.phone.includes(searchTerm);
        
        const matchesCategory = filters.category === 'all' || vendor.category === filters.category;
        const matchesStatus = filters.status === 'all' || vendor.status === filters.status;
        const matchesRating = filters.rating === 'all' || 
                            (filters.rating === 'high' && vendor.rating >= 4.5) ||
                            (filters.rating === 'medium' && vendor.rating >= 3.5 && vendor.rating < 4.5) ||
                            (filters.rating === 'low' && vendor.rating < 3.5);
        
        return matchesSearch && matchesCategory && matchesStatus && matchesRating;
    });

    // AI-powered vendor scoring
    const calculateVendorScore = (vendor) => {
        const factors = {
            rating: vendor.rating * 20, // Max 100
            responseTime: Math.max(0, 100 - (vendor.avgResponseTime / 2)), // Faster is better
            completionRate: (vendor.completedJobs / vendor.totalJobs) * 100,
            costEfficiency: Math.max(0, 100 - (vendor.avgCost / 10)), // Lower cost is better
            documentCompliance: vendor.documents.filter(d => d.verified).length * 10,
            availability: Object.keys(vendor.availability).length * 5
        };

        const weights = {
            rating: 0.3,
            responseTime: 0.2,
            completionRate: 0.2,
            costEfficiency: 0.1,
            documentCompliance: 0.1,
            availability: 0.1
        };

        let score = 0;
        for (const [factor, value] of Object.entries(factors)) {
            score += value * weights[factor];
        }

        return Math.round(score);
    };

    // Smart vendor matching for maintenance requests
    const matchVendorToRequest = (request, vendors) => {
        const categoryVendors = vendors.filter(v => v.category === request.category && v.status === 'active');
        
        const scoredVendors = categoryVendors.map(vendor => {
            let score = calculateVendorScore(vendor);
            
            // Bonus for preferred vendors
            if (vendor.preferredVendor) score += 10;
            
            // Penalty for busy vendors
            if (vendor.status === 'busy') score -= 20;
            
            // Bonus for matching service area
            if (vendor.serviceAreas.includes(request.property.area)) score += 15;
            
            // Urgency matching
            if (request.priority === 'urgent' && vendor.avgResponseTime < 60) score += 20;
            
            return { ...vendor, matchScore: score };
        });

        return scoredVendors.sort((a, b) => b.matchScore - a.matchScore);
    };

    // Add new vendor
    const handleAddVendor = async (vendorData) => {
        try {
            if (window.ApiService && typeof window.ApiService.post === 'function') {
                const response = await window.ApiService.post('/vendors', vendorData);
                setVendors([...vendors, response.data]);
            } else {
                // Mock add
                const newVendor = {
                    ...vendorData,
                    id: vendors.length + 1,
                    totalJobs: 0,
                    completedJobs: 0,
                    rating: 0,
                    reviews: [],
                    performanceScore: 0,
                    aiScore: 0
                };
                setVendors([...vendors, newVendor]);
            }
            setShowAddModal(false);
        } catch (error) {
            console.error('Error adding vendor:', error);
        }
    };

    // Update vendor status
    const updateVendorStatus = async (vendorId, status) => {
        try {
            if (window.ApiService && typeof window.ApiService.patch === 'function') {
                await window.ApiService.patch(`/vendors/${vendorId}`, { status });
            }
            setVendors(vendors.map(v => v.id === vendorId ? { ...v, status } : v));
        } catch (error) {
            console.error('Error updating vendor status:', error);
        }
    };

    // Render vendor card
    const VendorCard = ({ vendor }) => {
        const category = vendorCategories[vendor.category];
        const score = calculateVendorScore(vendor);

        return React.createElement('div', {
            className: 'vendor-card',
            onClick: () => {
                setSelectedVendor(vendor);
                setShowDetailModal(true);
            }
        }, [
            // Header
            React.createElement('div', { key: 'header', className: 'vendor-card-header' }, [
                React.createElement('div', { key: 'avatar', className: 'vendor-avatar', style: { backgroundColor: category.color + '20' } },
                    React.createElement('i', { className: `fas ${category.icon}`, style: { color: category.color } })
                ),
                React.createElement('div', { key: 'info', className: 'vendor-basic-info' }, [
                    React.createElement('h3', { key: 'name' }, vendor.name),
                    React.createElement('p', { key: 'category' }, category.label),
                    React.createElement('div', { key: 'rating', className: 'vendor-rating' }, [
                        ...Array(5).fill(0).map((_, i) =>
                            React.createElement('i', {
                                key: i,
                                className: `fas fa-star ${i < Math.floor(vendor.rating) ? 'filled' : ''}`
                            })
                        ),
                        React.createElement('span', { key: 'value' }, ` ${vendor.rating} (${vendor.totalJobs} jobs)`)
                    ])
                ]),
                React.createElement('div', { key: 'badges', className: 'vendor-badges' }, [
                    vendor.preferredVendor && React.createElement('span', { 
                        key: 'preferred',
                        className: 'badge badge-preferred'
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-star' }),
                        ' Preferred'
                    ]),
                    React.createElement('span', { 
                        key: 'status',
                        className: `badge badge-${vendor.status}`
                    }, vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1))
                ])
            ]),

            // Performance metrics
            React.createElement('div', { key: 'metrics', className: 'vendor-metrics' }, [
                React.createElement('div', { key: 'metric1', className: 'metric' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-clock' }),
                    React.createElement('div', { key: 'content' }, [
                        React.createElement('span', { key: 'value', className: 'metric-value' }, 
                            vendor.avgResponseTime < 60 ? `${vendor.avgResponseTime}m` : `${Math.round(vendor.avgResponseTime / 60)}h`
                        ),
                        React.createElement('span', { key: 'label', className: 'metric-label' }, 'Avg Response')
                    ])
                ]),
                React.createElement('div', { key: 'metric2', className: 'metric' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-dollar-sign' }),
                    React.createElement('div', { key: 'content' }, [
                        React.createElement('span', { key: 'value', className: 'metric-value' }, `$${vendor.avgCost}`),
                        React.createElement('span', { key: 'label', className: 'metric-label' }, 'Avg Cost')
                    ])
                ]),
                React.createElement('div', { key: 'metric3', className: 'metric' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-check-circle' }),
                    React.createElement('div', { key: 'content' }, [
                        React.createElement('span', { key: 'value', className: 'metric-value' }, 
                            `${Math.round((vendor.completedJobs / vendor.totalJobs) * 100)}%`
                        ),
                        React.createElement('span', { key: 'label', className: 'metric-label' }, 'Completion')
                    ])
                ])
            ]),

            // AI Score
            React.createElement('div', { key: 'ai-score', className: 'vendor-ai-score' }, [
                React.createElement('div', { key: 'score-label', className: 'ai-score-label' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                    ' AI Score'
                ]),
                React.createElement('div', { key: 'score-bar', className: 'ai-score-bar' }, [
                    React.createElement('div', { 
                        key: 'fill',
                        className: 'ai-score-fill',
                        style: { 
                            width: `${score}%`,
                            backgroundColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
                        }
                    }),
                    React.createElement('span', { key: 'value', className: 'ai-score-value' }, `${score}/100`)
                ])
            ]),

            // Contact info
            React.createElement('div', { key: 'contact', className: 'vendor-contact' }, [
                React.createElement('a', { 
                    key: 'email',
                    href: `mailto:${vendor.email}`,
                    className: 'contact-link',
                    onClick: (e) => e.stopPropagation()
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-envelope' }),
                    ' Email'
                ]),
                React.createElement('a', { 
                    key: 'phone',
                    href: `tel:${vendor.phone}`,
                    className: 'contact-link',
                    onClick: (e) => e.stopPropagation()
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-phone' }),
                    ' Call'
                ]),
                React.createElement('button', { 
                    key: 'assign',
                    className: 'btn-assign',
                    onClick: (e) => {
                        e.stopPropagation();
                        setAssigningVendor(vendor);
                        setShowAssignModal(true);
                    }
                }, 'Assign Job')
            ])
        ]);
    };

    // Main render
    return React.createElement('div', { className: 'vendor-management-system' }, [
        // Header
        React.createElement('div', { key: 'header', className: 'vms-header' }, [
            React.createElement('div', { key: 'title-section' }, [
                React.createElement('h1', { key: 'title' }, 'Vendor Management'),
                React.createElement('p', { key: 'subtitle' }, 
                    'AI-powered vendor matching and performance tracking'
                )
            ]),
            React.createElement('button', {
                key: 'add-btn',
                className: 'btn btn-primary',
                onClick: () => setShowAddModal(true)
            }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                ' Add Vendor'
            ])
        ]),

        // Search and filters
        React.createElement('div', { key: 'controls', className: 'vms-controls' }, [
            React.createElement('div', { key: 'search', className: 'search-box' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-search' }),
                React.createElement('input', {
                    key: 'input',
                    type: 'text',
                    placeholder: 'Search vendors...',
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value)
                })
            ]),
            React.createElement('div', { key: 'filters', className: 'filter-group' }, [
                React.createElement('select', {
                    key: 'category',
                    value: filters.category,
                    onChange: (e) => setFilters({ ...filters, category: e.target.value }),
                    className: 'filter-select'
                }, [
                    React.createElement('option', { key: 'all', value: 'all' }, 'All Categories'),
                    ...Object.entries(vendorCategories).map(([key, cat]) =>
                        React.createElement('option', { key, value: key }, cat.label)
                    )
                ]),
                React.createElement('select', {
                    key: 'status',
                    value: filters.status,
                    onChange: (e) => setFilters({ ...filters, status: e.target.value }),
                    className: 'filter-select'
                }, [
                    React.createElement('option', { key: 'all', value: 'all' }, 'All Status'),
                    React.createElement('option', { key: 'active', value: 'active' }, 'Active'),
                    React.createElement('option', { key: 'busy', value: 'busy' }, 'Busy'),
                    React.createElement('option', { key: 'inactive', value: 'inactive' }, 'Inactive')
                ]),
                React.createElement('select', {
                    key: 'rating',
                    value: filters.rating,
                    onChange: (e) => setFilters({ ...filters, rating: e.target.value }),
                    className: 'filter-select'
                }, [
                    React.createElement('option', { key: 'all', value: 'all' }, 'All Ratings'),
                    React.createElement('option', { key: 'high', value: 'high' }, '4.5+ Stars'),
                    React.createElement('option', { key: 'medium', value: 'medium' }, '3.5-4.5 Stars'),
                    React.createElement('option', { key: 'low', value: 'low' }, 'Below 3.5 Stars')
                ])
            ])
        ]),

        // Vendor grid
        React.createElement('div', { key: 'grid', className: 'vendors-grid' },
            loading ? 
                React.createElement('div', { className: 'loading-state' }, 'Loading vendors...') :
            filteredVendors.length === 0 ?
                React.createElement('div', { className: 'empty-state' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-hard-hat fa-3x' }),
                    React.createElement('p', { key: 'text' }, 'No vendors found')
                ]) :
            filteredVendors.map(vendor => 
                React.createElement(VendorCard, { key: vendor.id, vendor })
            )
        ),

        // Job Assignment Modal
        showAssignModal && React.createElement(JobAssignmentModal, {
            key: 'assign-modal',
            vendor: assigningVendor,
            onClose: () => {
                setShowAssignModal(false);
                setAssigningVendor(null);
            },
            onAssign: (requestId, vendorId) => {
                if (maintenanceStore?.actions?.assignVendor) {
                    maintenanceStore.actions.assignVendor(requestId, vendorId);
                    setShowAssignModal(false);
                    setAssigningVendor(null);
                } else {
                    alert('Maintenance system not available');
                }
            }
        })
    ]);
};

// Job Assignment Modal Component
const JobAssignmentModal = ({ vendor, onClose, onAssign }) => {
    const [selectedRequest, setSelectedRequest] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    
    // Get unassigned maintenance requests from the store
    const maintenanceStore = window.useMaintenanceStore ? window.useMaintenanceStore() : null;
    const unassignedRequests = maintenanceStore?.actions?.getRequests({ status: 'submitted' }) || [];
    
    // Filter requests that match vendor's category
    const matchingRequests = unassignedRequests.filter(request => 
        request.category === vendor?.category || vendor?.category === 'general'
    );

    const handleAssign = async () => {
        if (!selectedRequest || !vendor) return;
        
        setLoading(true);
        try {
            await onAssign(selectedRequest.id, vendor.id);
            // Show success message
            alert(`Successfully assigned ${vendor.name} to maintenance request ${selectedRequest.id}`);
        } catch (error) {
            alert('Failed to assign vendor. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority) => {
        const colors = {
            emergency: '#ef4444',
            urgent: '#f97316',
            high: '#f59e0b',
            medium: '#10b981',
            low: '#6b7280'
        };
        return colors[priority] || '#6b7280';
    };

    return React.createElement('div', { 
        className: 'modal-overlay',
        onClick: onClose
    }, [
        React.createElement('div', { 
            key: 'modal',
            className: 'job-assignment-modal',
            onClick: (e) => e.stopPropagation()
        }, [
            // Header
            React.createElement('div', { key: 'header', className: 'modal-header' }, [
                React.createElement('h2', { key: 'title' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-user-hard-hat' }),
                    ` Assign Job to ${vendor?.name}`
                ]),
                React.createElement('button', { 
                    key: 'close',
                    className: 'close-btn',
                    onClick: onClose
                }, React.createElement('i', { className: 'fas fa-times' }))
            ]),

            // Body
            React.createElement('div', { key: 'body', className: 'modal-body' }, [
                // Vendor info
                React.createElement('div', { key: 'vendor-info', className: 'vendor-summary' }, [
                    React.createElement('h3', { key: 'title' }, 'Vendor Information'),
                    React.createElement('div', { key: 'details', className: 'vendor-details' }, [
                        React.createElement('p', { key: 'category' }, [
                            React.createElement('strong', {}, 'Category: '),
                            vendor?.category?.charAt(0).toUpperCase() + vendor?.category?.slice(1)
                        ]),
                        React.createElement('p', { key: 'rating' }, [
                            React.createElement('strong', {}, 'Rating: '),
                            `${vendor?.rating}/5.0 ⭐`
                        ]),
                        React.createElement('p', { key: 'response' }, [
                            React.createElement('strong', {}, 'Avg Response: '),
                            `${vendor?.responseTime} hours`
                        ])
                    ])
                ]),

                // Available requests
                React.createElement('div', { key: 'requests', className: 'requests-section' }, [
                    React.createElement('h3', { key: 'title' }, 'Available Work Orders'),
                    matchingRequests.length === 0 ?
                        React.createElement('div', { key: 'empty', className: 'empty-requests' }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-clipboard-check fa-2x' }),
                            React.createElement('p', { key: 'text' }, 'No unassigned requests match this vendor\'s expertise')
                        ]) :
                        React.createElement('div', { key: 'list', className: 'requests-list' },
                            matchingRequests.map(request =>
                                React.createElement('div', {
                                    key: request.id,
                                    className: `request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`,
                                    onClick: () => setSelectedRequest(request)
                                }, [
                                    React.createElement('div', { key: 'info', className: 'request-info' }, [
                                        React.createElement('h4', { key: 'title' }, request.title || request.description),
                                        React.createElement('p', { key: 'location' }, `${request.property} - Unit ${request.unit}`),
                                        React.createElement('p', { key: 'tenant' }, `Tenant: ${request.tenant?.name}`)
                                    ]),
                                    React.createElement('div', { key: 'meta', className: 'request-meta' }, [
                                        React.createElement('span', { 
                                            key: 'priority',
                                            className: 'priority-badge',
                                            style: { color: getPriorityColor(request.priority) }
                                        }, [
                                            React.createElement('i', { key: 'icon', className: 'fas fa-exclamation-circle' }),
                                            ` ${request.priority.toUpperCase()}`
                                        ]),
                                        React.createElement('span', { key: 'date', className: 'created-date' }, 
                                            formatDate(request.createdAt)
                                        ),
                                        React.createElement('span', { key: 'cost', className: 'estimated-cost' }, 
                                            `Est: $${request.estimatedCost || 'TBD'}`
                                        )
                                    ])
                                ])
                            )
                        )
                ])
            ]),

            // Footer
            React.createElement('div', { key: 'footer', className: 'modal-footer' }, [
                React.createElement('button', { 
                    key: 'cancel',
                    className: 'btn btn-secondary',
                    onClick: onClose
                }, 'Cancel'),
                React.createElement('button', { 
                    key: 'assign',
                    className: 'btn btn-primary',
                    disabled: !selectedRequest || loading,
                    onClick: handleAssign
                }, loading ? 'Assigning...' : 'Assign Vendor')
            ])
        ])
    ]);
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.VendorManagementSystem = VendorManagementSystem;