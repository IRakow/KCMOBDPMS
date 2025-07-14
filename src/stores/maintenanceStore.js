// maintenanceStore.js - Centralized Maintenance State Management
class MaintenanceStore {
    constructor() {
        this.listeners = [];
        this.state = {
            requests: [],
            vendors: [],
            categories: [],
            priorities: [],
            statuses: [],
            aiInsights: {},
            notifications: [],
            currentUser: null,
            filters: {
                status: 'all',
                priority: 'all',
                category: 'all',
                property: 'all',
                assignedTo: 'all'
            }
        };

        this.initializeData();
        this.setupEventListeners();
    }

    // Initialize with comprehensive mock data
    initializeData() {
        this.state.categories = [
            { id: 'plumbing', name: 'Plumbing', icon: 'fa-tint', color: '#3b82f6' },
            { id: 'electrical', name: 'Electrical', icon: 'fa-bolt', color: '#f59e0b' },
            { id: 'hvac', name: 'HVAC', icon: 'fa-snowflake', color: '#10b981' },
            { id: 'appliance', name: 'Appliances', icon: 'fa-blender', color: '#8b5cf6' },
            { id: 'general', name: 'General Maintenance', icon: 'fa-hammer', color: '#6b7280' },
            { id: 'emergency', name: 'Emergency', icon: 'fa-exclamation-triangle', color: '#ef4444' }
        ];

        this.state.priorities = [
            { id: 'emergency', name: 'Emergency', color: '#ef4444', score: 100 },
            { id: 'urgent', name: 'Urgent', color: '#f97316', score: 80 },
            { id: 'high', name: 'High', color: '#f59e0b', score: 60 },
            { id: 'medium', name: 'Medium', color: '#10b981', score: 40 },
            { id: 'low', name: 'Low', color: '#6b7280', score: 20 }
        ];

        this.state.statuses = [
            { id: 'submitted', name: 'Submitted', color: '#6b7280' },
            { id: 'assigned', name: 'Assigned', color: '#3b82f6' },
            { id: 'in_progress', name: 'In Progress', color: '#f59e0b' },
            { id: 'pending_parts', name: 'Pending Parts', color: '#8b5cf6' },
            { id: 'completed', name: 'Completed', color: '#10b981' },
            { id: 'cancelled', name: 'Cancelled', color: '#ef4444' }
        ];

        this.state.vendors = [
            {
                id: 'vendor_001',
                name: 'ABC Plumbing Services',
                category: 'plumbing',
                rating: 4.8,
                responseTime: 2.5,
                completionRate: 96,
                avgCost: 185,
                phone: '(555) 123-4567',
                email: 'dispatch@abcplumbing.com',
                availability: 'available',
                specialties: ['Emergency repairs', 'Leak detection', 'Pipe replacement'],
                insurance: true,
                licensed: true,
                preferredVendor: true
            },
            {
                id: 'vendor_002',
                name: 'PowerTech Electrical',
                category: 'electrical',
                rating: 4.9,
                responseTime: 1.8,
                completionRate: 98,
                avgCost: 220,
                phone: '(555) 234-5678',
                email: 'service@powertech.com',
                availability: 'available',
                specialties: ['Panel upgrades', 'Outlet installation', 'Emergency electrical'],
                insurance: true,
                licensed: true,
                preferredVendor: true
            },
            {
                id: 'vendor_003',
                name: 'Climate Control Experts',
                category: 'hvac',
                rating: 4.7,
                responseTime: 3.2,
                completionRate: 94,
                avgCost: 275,
                phone: '(555) 345-6789',
                email: 'info@climateexperts.com',
                availability: 'busy',
                specialties: ['AC repair', 'Heating systems', 'Preventive maintenance'],
                insurance: true,
                licensed: true,
                preferredVendor: false
            }
        ];

        this.state.requests = [
            {
                id: 'req_001',
                property: 'Sunset Apartments',
                unit: '205',
                tenant: {
                    name: 'Sarah Johnson',
                    phone: '(555) 987-6543',
                    email: 'sarah.j@email.com'
                },
                title: 'AC not cooling properly',
                description: 'The air conditioning unit in the living room is running but not producing cold air. Checked the thermostat and it shows correct temperature but feels warm.',
                category: 'hvac',
                priority: 'high',
                status: 'assigned',
                assignedVendor: 'vendor_003',
                estimatedCost: 450,
                actualCost: null,
                photos: ['/images/ac-unit-photo.jpg'],
                createdAt: '2024-07-12T14:30:00Z',
                updatedAt: '2024-07-12T16:45:00Z',
                scheduledDate: '2024-07-15T10:00:00Z',
                aiAnalysis: {
                    likelyIssue: 'Refrigerant leak or compressor issue',
                    estimatedCost: '300-600',
                    urgency: 85,
                    suggestedVendor: 'vendor_003',
                    troubleshootingSteps: [
                        'Check air filter',
                        'Verify thermostat settings',
                        'Inspect visible refrigerant lines'
                    ]
                },
                timeline: [
                    { timestamp: '2024-07-12T14:30:00Z', action: 'Request submitted', user: 'Tenant' },
                    { timestamp: '2024-07-12T14:45:00Z', action: 'AI analysis completed', user: 'System' },
                    { timestamp: '2024-07-12T16:45:00Z', action: 'Assigned to Climate Control Experts', user: 'Admin' }
                ],
                tenantAccessible: true,
                ownerVisible: true
            },
            {
                id: 'req_002',
                property: 'Downtown Plaza',
                unit: '312',
                tenant: {
                    name: 'Michael Chen',
                    phone: '(555) 876-5432',
                    email: 'mchen@company.com'
                },
                title: 'Kitchen faucet leak',
                description: 'Water dripping from under the kitchen sink. Appears to be coming from the faucet connection.',
                category: 'plumbing',
                priority: 'medium',
                status: 'completed',
                assignedVendor: 'vendor_001',
                estimatedCost: 125,
                actualCost: 110,
                photos: ['/images/sink-leak-photo.jpg'],
                createdAt: '2024-07-08T09:15:00Z',
                updatedAt: '2024-07-10T15:30:00Z',
                completedAt: '2024-07-10T15:30:00Z',
                aiAnalysis: {
                    likelyIssue: 'Loose connection or worn O-ring',
                    estimatedCost: '75-150',
                    urgency: 45,
                    suggestedVendor: 'vendor_001',
                    troubleshootingSteps: [
                        'Check if shut-off valves are properly closed',
                        'Examine visible connections for looseness',
                        'Look for mineral buildup'
                    ]
                },
                timeline: [
                    { timestamp: '2024-07-08T09:15:00Z', action: 'Request submitted', user: 'Tenant' },
                    { timestamp: '2024-07-08T09:30:00Z', action: 'AI analysis completed', user: 'System' },
                    { timestamp: '2024-07-08T11:20:00Z', action: 'Assigned to ABC Plumbing', user: 'Admin' },
                    { timestamp: '2024-07-10T10:00:00Z', action: 'Work started', user: 'Vendor' },
                    { timestamp: '2024-07-10T15:30:00Z', action: 'Work completed', user: 'Vendor' }
                ],
                tenantRating: 5,
                tenantFeedback: 'Quick response and professional service. Fixed perfectly.',
                tenantAccessible: true,
                ownerVisible: true
            },
            {
                id: 'req_003',
                property: 'Garden Complex',
                unit: '101',
                tenant: {
                    name: 'Emily Rodriguez',
                    phone: '(555) 765-4321',
                    email: 'emily.r@startup.io'
                },
                title: 'Electrical outlet not working',
                description: 'Master bedroom outlet stopped working. No power to any devices plugged in. Other outlets in room work fine.',
                category: 'electrical',
                priority: 'medium',
                status: 'in_progress',
                assignedVendor: 'vendor_002',
                estimatedCost: 180,
                actualCost: null,
                photos: [],
                createdAt: '2024-07-13T16:20:00Z',
                updatedAt: '2024-07-14T09:15:00Z',
                scheduledDate: '2024-07-14T14:00:00Z',
                aiAnalysis: {
                    likelyIssue: 'GFCI trip or wiring issue',
                    estimatedCost: '100-250',
                    urgency: 55,
                    suggestedVendor: 'vendor_002',
                    troubleshootingSteps: [
                        'Check circuit breaker panel',
                        'Look for GFCI outlets that may have tripped',
                        'Test outlet with different device'
                    ]
                },
                timeline: [
                    { timestamp: '2024-07-13T16:20:00Z', action: 'Request submitted', user: 'Tenant' },
                    { timestamp: '2024-07-13T16:35:00Z', action: 'AI troubleshooting completed', user: 'System' },
                    { timestamp: '2024-07-14T09:15:00Z', action: 'Assigned to PowerTech Electrical', user: 'Admin' }
                ],
                tenantAccessible: true,
                ownerVisible: true
            }
        ];

        this.state.aiInsights = {
            totalRequests: 15,
            completedThisMonth: 12,
            averageResolutionTime: 2.3,
            costSavingsFromAI: 3200,
            predictiveMaintenance: [
                {
                    property: 'Sunset Apartments',
                    prediction: 'HVAC filter replacement needed in Units 203, 204, 206',
                    confidence: 89,
                    estimatedCost: 150,
                    suggestedDate: '2024-07-20'
                },
                {
                    property: 'Downtown Plaza',
                    prediction: 'Water heater in Unit 405 showing signs of inefficiency',
                    confidence: 76,
                    estimatedCost: 1200,
                    suggestedDate: '2024-08-15'
                }
            ],
            trendingIssues: [
                { category: 'hvac', count: 8, trend: 'increasing' },
                { category: 'plumbing', count: 5, trend: 'stable' },
                { category: 'electrical', count: 2, trend: 'decreasing' }
            ]
        };

        this.notifyListeners();
    }

    // Event listeners for cross-component communication
    setupEventListeners() {
        window.addEventListener('maintenanceRequestCreated', (event) => {
            this.addRequest(event.detail);
        });

        window.addEventListener('maintenanceRequestUpdated', (event) => {
            this.updateRequest(event.detail.id, event.detail.updates);
        });

        window.addEventListener('vendorAssigned', (event) => {
            this.assignVendor(event.detail.requestId, event.detail.vendorId);
        });
    }

    // Subscription management
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener(this.state));
    }

    // State getters
    getState() {
        return { ...this.state };
    }

    getRequests(filters = {}) {
        let requests = [...this.state.requests];

        // Apply filters
        if (filters.status && filters.status !== 'all') {
            requests = requests.filter(req => req.status === filters.status);
        }
        if (filters.priority && filters.priority !== 'all') {
            requests = requests.filter(req => req.priority === filters.priority);
        }
        if (filters.category && filters.category !== 'all') {
            requests = requests.filter(req => req.category === filters.category);
        }
        if (filters.property && filters.property !== 'all') {
            requests = requests.filter(req => req.property === filters.property);
        }

        return requests;
    }

    getRequestById(id) {
        return this.state.requests.find(req => req.id === id);
    }

    getVendors() {
        return [...this.state.vendors];
    }

    getVendorById(id) {
        return this.state.vendors.find(vendor => vendor.id === id);
    }

    getVendorsByCategory(category) {
        return this.state.vendors.filter(vendor => vendor.category === category);
    }

    // State mutators
    addRequest(requestData) {
        const newRequest = {
            id: `req_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'submitted',
            timeline: [{
                timestamp: new Date().toISOString(),
                action: 'Request submitted',
                user: requestData.submittedBy || 'Tenant'
            }],
            tenantAccessible: true,
            ownerVisible: true,
            ...requestData
        };

        // Run AI analysis
        this.runAIAnalysis(newRequest);

        this.state.requests.unshift(newRequest);
        this.notifyListeners();

        // Emit event for other components
        window.dispatchEvent(new CustomEvent('maintenanceRequestAdded', { 
            detail: newRequest 
        }));

        return newRequest.id;
    }

    updateRequest(id, updates) {
        const requestIndex = this.state.requests.findIndex(req => req.id === id);
        if (requestIndex === -1) return false;

        const currentRequest = this.state.requests[requestIndex];
        const updatedRequest = {
            ...currentRequest,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Add timeline entry for significant updates
        if (updates.status && updates.status !== currentRequest.status) {
            updatedRequest.timeline = [
                ...currentRequest.timeline,
                {
                    timestamp: new Date().toISOString(),
                    action: `Status changed to ${updates.status}`,
                    user: updates.updatedBy || 'System'
                }
            ];
        }

        this.state.requests[requestIndex] = updatedRequest;
        this.notifyListeners();

        // Emit event for other components
        window.dispatchEvent(new CustomEvent('maintenanceRequestUpdated', { 
            detail: updatedRequest 
        }));

        return true;
    }

    assignVendor(requestId, vendorId) {
        const vendor = this.getVendorById(vendorId);
        if (!vendor) return false;

        const updates = {
            assignedVendor: vendorId,
            status: 'assigned',
            updatedBy: 'Admin'
        };

        this.updateRequest(requestId, updates);

        // Create 3-way chat notification
        this.createVendorChat(requestId, vendorId);

        return true;
    }

    createVendorChat(requestId, vendorId) {
        const request = this.getRequestById(requestId);
        const vendor = this.getVendorById(vendorId);

        if (!request || !vendor) return;

        const chatData = {
            requestId,
            participants: [
                { type: 'tenant', name: request.tenant.name, contact: request.tenant.phone },
                { type: 'vendor', name: vendor.name, contact: vendor.phone },
                { type: 'admin', name: 'Property Manager', contact: '(555) 000-0000' }
            ],
            createdAt: new Date().toISOString()
        };

        // Emit event to create chat
        window.dispatchEvent(new CustomEvent('maintenanceChatCreated', { 
            detail: chatData 
        }));
    }

    // AI Analysis simulation
    runAIAnalysis(request) {
        // Simulate AI processing delay
        setTimeout(() => {
            const aiAnalysis = this.generateAIAnalysis(request);
            this.updateRequest(request.id, { aiAnalysis });
        }, 2000);
    }

    generateAIAnalysis(request) {
        const category = request.category;
        const description = request.description.toLowerCase();

        let likelyIssue = 'General maintenance required';
        let estimatedCost = '100-200';
        let urgency = 50;

        // Analyze based on category and description
        if (category === 'plumbing') {
            if (description.includes('leak')) {
                likelyIssue = 'Pipe leak or connection issue';
                estimatedCost = '75-250';
                urgency = description.includes('major') ? 90 : 60;
            }
        } else if (category === 'electrical') {
            if (description.includes('outlet') || description.includes('power')) {
                likelyIssue = 'Electrical outlet or wiring issue';
                estimatedCost = '100-300';
                urgency = 65;
            }
        } else if (category === 'hvac') {
            if (description.includes('cooling') || description.includes('cold')) {
                likelyIssue = 'Refrigerant or compressor issue';
                estimatedCost = '200-600';
                urgency = 75;
            }
        }

        // Find best vendor match
        const categoryVendors = this.getVendorsByCategory(category);
        const suggestedVendor = categoryVendors.length > 0 
            ? categoryVendors.sort((a, b) => b.rating - a.rating)[0].id 
            : null;

        return {
            likelyIssue,
            estimatedCost,
            urgency,
            suggestedVendor,
            troubleshootingSteps: this.generateTroubleshootingSteps(category, description),
            analyzedAt: new Date().toISOString()
        };
    }

    generateTroubleshootingSteps(category, description) {
        const steps = {
            plumbing: [
                'Check if water shut-off valves are accessible',
                'Look for visible leaks or water damage',
                'Verify water pressure in other fixtures'
            ],
            electrical: [
                'Check circuit breaker panel for tripped breakers',
                'Test other outlets in the same room',
                'Look for GFCI outlets that may have tripped'
            ],
            hvac: [
                'Check air filter condition',
                'Verify thermostat settings and battery',
                'Inspect visible ductwork for damage'
            ],
            appliance: [
                'Check power connection and outlet',
                'Verify appliance settings and controls',
                'Look for error codes or indicator lights'
            ]
        };

        return steps[category] || [
            'Document the issue with photos if possible',
            'Note when the problem first occurred',
            'Check if the issue affects other areas'
        ];
    }

    // Analytics and insights
    getAnalytics() {
        const requests = this.state.requests;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const recentRequests = requests.filter(req => 
            new Date(req.createdAt) >= thirtyDaysAgo
        );

        const completedRequests = requests.filter(req => req.status === 'completed');
        
        const avgResolutionTime = completedRequests.length > 0
            ? completedRequests.reduce((sum, req) => {
                const created = new Date(req.createdAt);
                const completed = new Date(req.completedAt || req.updatedAt);
                return sum + (completed - created) / (1000 * 60 * 60 * 24); // days
            }, 0) / completedRequests.length
            : 0;

        return {
            totalRequests: requests.length,
            recentRequests: recentRequests.length,
            completedRequests: completedRequests.length,
            avgResolutionTime: avgResolutionTime.toFixed(1),
            categoryBreakdown: this.getCategoryBreakdown(recentRequests),
            priorityBreakdown: this.getPriorityBreakdown(recentRequests),
            statusBreakdown: this.getStatusBreakdown(requests)
        };
    }

    getCategoryBreakdown(requests) {
        return this.state.categories.map(category => ({
            ...category,
            count: requests.filter(req => req.category === category.id).length
        }));
    }

    getPriorityBreakdown(requests) {
        return this.state.priorities.map(priority => ({
            ...priority,
            count: requests.filter(req => req.priority === priority.id).length
        }));
    }

    getStatusBreakdown(requests) {
        return this.state.statuses.map(status => ({
            ...status,
            count: requests.filter(req => req.status === status.id).length
        }));
    }

    // Notifications
    addNotification(notification) {
        const newNotification = {
            id: `notif_${Date.now()}`,
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };

        this.state.notifications.unshift(newNotification);
        this.notifyListeners();

        return newNotification.id;
    }

    markNotificationRead(id) {
        const notification = this.state.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.notifyListeners();
        }
    }

    getUnreadNotifications() {
        return this.state.notifications.filter(n => !n.read);
    }
}

// Create global instance
window.MaintenanceStore = window.MaintenanceStore || new MaintenanceStore();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MaintenanceStore;
}