// AIVendorMatching.jsx - AI-Powered Vendor Matching and Scheduling System
const AIVendorMatching = (() => {
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
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        });
                    },
                    formatTime: (date) => {
                        return new Date(date).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        });
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('AIVendorMatching')((props, helpers) => {
        const { useLocalState, formatCurrency, formatDate, formatTime } = helpers;
        const { workOrder, vendors, tenantSchedule, onMatch } = props;

        const [state, updateState] = useLocalState({
            matchingResults: [],
            selectedVendor: null,
            proposedSchedule: [],
            aiRecommendation: null,
            matchingInProgress: true,
            confidenceScore: 0,
            alternativeOptions: [],
            schedulingConflicts: []
        });

        // Run AI matching when component mounts
        React.useEffect(() => {
            performAIMatching();
        }, [workOrder, vendors]);

        const performAIMatching = async () => {
            updateState({ matchingInProgress: true });
            
            // Simulate AI processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // AI Matching Algorithm
            const matches = vendors.map(vendor => {
                const score = calculateVendorScore(vendor, workOrder);
                const availability = checkVendorAvailability(vendor, workOrder);
                const estimatedCost = estimateJobCost(vendor, workOrder);
                const reasons = generateMatchReasons(vendor, workOrder, score);
                
                return {
                    vendor,
                    score,
                    availability,
                    estimatedCost,
                    reasons,
                    responseTime: vendor.avgResponseTime || 30,
                    completionTime: estimateCompletionTime(vendor, workOrder)
                };
            }).sort((a, b) => b.score - a.score);

            // Get top recommendation
            const topMatch = matches[0];
            const aiRecommendation = generateAIRecommendation(topMatch, workOrder, tenantSchedule);

            // Generate proposed schedules
            const proposedSchedule = generateScheduleOptions(topMatch, workOrder, tenantSchedule);

            updateState({
                matchingResults: matches,
                aiRecommendation,
                proposedSchedule,
                selectedVendor: topMatch.vendor,
                confidenceScore: topMatch.score,
                alternativeOptions: matches.slice(1, 4),
                matchingInProgress: false
            });
        };

        const calculateVendorScore = (vendor, workOrder) => {
            let score = 0;
            const weights = {
                expertise: 0.25,
                availability: 0.20,
                proximity: 0.15,
                rating: 0.15,
                cost: 0.15,
                responseTime: 0.10
            };

            // Expertise match
            if (vendor.specialties.some(s => s.toLowerCase().includes(workOrder.category))) {
                score += 100 * weights.expertise;
            }

            // Availability score
            if (vendor.availability === 'high') {
                score += 100 * weights.availability;
            } else if (vendor.availability === 'medium') {
                score += 60 * weights.availability;
            } else {
                score += 20 * weights.availability;
            }

            // Rating score
            score += (vendor.rating / 5) * 100 * weights.rating;

            // Response time score
            const responseScore = Math.max(0, 100 - (vendor.avgResponseTime * 2));
            score += responseScore * weights.responseTime;

            // Cost efficiency
            if (vendor.pricing === 'budget') {
                score += 80 * weights.cost;
            } else if (vendor.pricing === 'competitive') {
                score += 60 * weights.cost;
            } else {
                score += 40 * weights.cost;
            }

            // Proximity (simulated)
            const distance = Math.random() * 20; // Simulated distance in miles
            const proximityScore = Math.max(0, 100 - (distance * 5));
            score += proximityScore * weights.proximity;

            // Urgency boost
            if (workOrder.priority === 'urgent' && vendor.availability === 'high') {
                score += 10;
            }

            // Preferred vendor boost
            if (vendor.preferred) {
                score += 5;
            }

            // Past performance with similar jobs
            if (vendor.completedSimilarJobs > 10) {
                score += 5;
            }

            return Math.min(100, Math.round(score));
        };

        const checkVendorAvailability = (vendor, workOrder) => {
            // Simulate checking vendor's calendar
            const availability = {
                today: vendor.currentJobs < 3,
                tomorrow: vendor.currentJobs < 4,
                thisWeek: true,
                nextAvailable: new Date(Date.now() + (vendor.currentJobs * 24 * 60 * 60 * 1000))
            };

            return availability;
        };

        const estimateJobCost = (vendor, workOrder) => {
            const baseCost = workOrder.estimatedCost || 150;
            const pricingMultiplier = {
                budget: 0.8,
                competitive: 1.0,
                premium: 1.3
            };

            return baseCost * (pricingMultiplier[vendor.pricing] || 1.0);
        };

        const estimateCompletionTime = (vendor, workOrder) => {
            const baseTime = workOrder.estimatedDuration || 2;
            const efficiencyFactor = vendor.rating >= 4.5 ? 0.9 : 1.1;
            return Math.round(baseTime * efficiencyFactor * 10) / 10;
        };

        const generateMatchReasons = (vendor, workOrder, score) => {
            const reasons = [];

            if (vendor.specialties.some(s => s.toLowerCase().includes(workOrder.category))) {
                reasons.push({
                    type: 'expertise',
                    text: `Specializes in ${workOrder.category}`,
                    importance: 'high'
                });
            }

            if (vendor.availability === 'high') {
                reasons.push({
                    type: 'availability',
                    text: 'Available immediately',
                    importance: 'high'
                });
            }

            if (vendor.rating >= 4.8) {
                reasons.push({
                    type: 'quality',
                    text: `Excellent rating (${vendor.rating} stars)`,
                    importance: 'medium'
                });
            }

            if (vendor.avgResponseTime <= 15) {
                reasons.push({
                    type: 'responsive',
                    text: `Fast response (${vendor.avgResponseTime} min avg)`,
                    importance: 'medium'
                });
            }

            if (vendor.pricing === 'budget' && workOrder.priority !== 'urgent') {
                reasons.push({
                    type: 'cost',
                    text: 'Cost-effective option',
                    importance: 'low'
                });
            }

            if (vendor.preferred) {
                reasons.push({
                    type: 'preferred',
                    text: 'Preferred vendor',
                    importance: 'medium'
                });
            }

            return reasons;
        };

        const generateAIRecommendation = (topMatch, workOrder, tenantSchedule) => {
            const confidence = topMatch.score;
            let recommendation = '';

            if (confidence >= 90) {
                recommendation = `Excellent match! ${topMatch.vendor.companyName} is highly qualified for this ${workOrder.category} job with immediate availability.`;
            } else if (confidence >= 75) {
                recommendation = `Good match. ${topMatch.vendor.companyName} has the right expertise and can complete the job efficiently.`;
            } else {
                recommendation = `${topMatch.vendor.companyName} can handle this job, though you may want to review alternative options.`;
            }

            return {
                vendorName: topMatch.vendor.companyName,
                confidence,
                recommendation,
                estimatedArrival: topMatch.responseTime,
                estimatedCompletion: topMatch.completionTime,
                estimatedCost: topMatch.estimatedCost
            };
        };

        const generateScheduleOptions = (topMatch, workOrder, tenantSchedule) => {
            const options = [];
            const now = new Date();
            
            // Generate 3 schedule options based on tenant availability
            const tenantAvailability = parseTenantAvailability(workOrder.tenant?.availability);
            
            // Option 1: Earliest available
            const earliest = new Date(now);
            earliest.setHours(earliest.getHours() + 2);
            if (isTimeSlotAvailable(earliest, tenantAvailability)) {
                options.push({
                    id: 1,
                    type: 'earliest',
                    date: earliest,
                    label: 'Earliest Available',
                    tenantHome: true,
                    vendorAvailable: true,
                    recommended: workOrder.priority === 'urgent'
                });
            }

            // Option 2: Tenant's preferred time
            if (tenantAvailability.preferred) {
                const preferred = new Date(now);
                preferred.setDate(preferred.getDate() + 1);
                preferred.setHours(tenantAvailability.preferred.hour);
                options.push({
                    id: 2,
                    type: 'preferred',
                    date: preferred,
                    label: 'Tenant Preferred Time',
                    tenantHome: true,
                    vendorAvailable: checkVendorSlot(topMatch.vendor, preferred),
                    recommended: true
                });
            }

            // Option 3: Best for vendor efficiency (route optimization)
            const efficient = new Date(now);
            efficient.setDate(efficient.getDate() + 1);
            efficient.setHours(10);
            options.push({
                id: 3,
                type: 'efficient',
                date: efficient,
                label: 'Optimized Route Time',
                tenantHome: checkTenantAvailability(efficient, tenantAvailability),
                vendorAvailable: true,
                recommended: false,
                note: 'Vendor has other jobs nearby at this time'
            });

            return options;
        };

        const parseTenantAvailability = (availabilityString) => {
            // Parse tenant availability string into structured data
            if (!availabilityString) return { allDay: true };

            const lower = availabilityString.toLowerCase();
            if (lower.includes('after 3pm')) {
                return {
                    weekdays: { start: 15, end: 20 },
                    preferred: { hour: 15 },
                    flexible: false
                };
            } else if (lower.includes('flexible') || lower.includes('work from home')) {
                return {
                    allDay: true,
                    flexible: true,
                    preferred: { hour: 10 }
                };
            }

            return { allDay: true };
        };

        const isTimeSlotAvailable = (date, availability) => {
            const hour = date.getHours();
            if (availability.allDay) return true;
            if (availability.weekdays && date.getDay() >= 1 && date.getDay() <= 5) {
                return hour >= availability.weekdays.start && hour <= availability.weekdays.end;
            }
            return true;
        };

        const checkTenantAvailability = (date, availability) => {
            return isTimeSlotAvailable(date, availability);
        };

        const checkVendorSlot = (vendor, date) => {
            // Simulate checking vendor's calendar
            return Math.random() > 0.3; // 70% chance of availability
        };

        return React.createElement('div', { className: 'ai-vendor-matching' }, [
            // Header
            React.createElement('div', { key: 'header', className: 'matching-header' }, [
                React.createElement('h2', { key: 'title' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-brain' }),
                    'AI Vendor Matching & Scheduling'
                ]),
                React.createElement('div', { key: 'order-info', className: 'work-order-info' }, [
                    React.createElement('span', { key: 'id' }, `Work Order #${workOrder.id}`),
                    React.createElement('span', { key: 'category', className: 'category-badge' }, workOrder.category),
                    React.createElement('span', { key: 'priority', className: `priority-badge ${workOrder.priority}` }, 
                        workOrder.priority
                    )
                ])
            ]),

            // Loading State
            state.matchingInProgress && React.createElement('div', {
                key: 'loading',
                className: 'matching-loading'
            }, [
                React.createElement('div', { key: 'spinner', className: 'ai-spinner' }),
                React.createElement('h3', { key: 'text' }, 'AI is analyzing vendors and schedules...'),
                React.createElement('p', { key: 'desc' }, 'Considering expertise, availability, cost, and tenant preferences')
            ]),

            // Results
            !state.matchingInProgress && React.createElement('div', {
                key: 'results',
                className: 'matching-results'
            }, [
                // AI Recommendation
                state.aiRecommendation && React.createElement('div', {
                    key: 'recommendation',
                    className: 'ai-recommendation-box'
                }, [
                    React.createElement('div', { key: 'header', className: 'recommendation-header' }, [
                        React.createElement('h3', { key: 'title' }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-star' }),
                            'AI Recommendation'
                        ]),
                        React.createElement('div', { key: 'confidence', className: 'confidence-score' }, [
                            React.createElement('span', { key: 'label' }, 'Confidence:'),
                            React.createElement('div', { key: 'bar', className: 'confidence-bar' },
                                React.createElement('div', {
                                    className: 'confidence-fill',
                                    style: { width: `${state.aiRecommendation.confidence}%` }
                                })
                            ),
                            React.createElement('span', { key: 'percent' }, `${state.aiRecommendation.confidence}%`)
                        ])
                    ]),
                    React.createElement('p', { key: 'text', className: 'recommendation-text' }, 
                        state.aiRecommendation.recommendation
                    ),
                    React.createElement('div', { key: 'details', className: 'recommendation-details' }, [
                        React.createElement('div', { key: 'arrival' }, [
                            React.createElement('i', { className: 'fas fa-clock' }),
                            React.createElement('span', {}, `Response time: ${state.aiRecommendation.estimatedArrival} minutes`)
                        ]),
                        React.createElement('div', { key: 'duration' }, [
                            React.createElement('i', { className: 'fas fa-hourglass-half' }),
                            React.createElement('span', {}, `Completion: ${state.aiRecommendation.estimatedCompletion} hours`)
                        ]),
                        React.createElement('div', { key: 'cost' }, [
                            React.createElement('i', { className: 'fas fa-dollar-sign' }),
                            React.createElement('span', {}, `Estimated cost: ${formatCurrency(state.aiRecommendation.estimatedCost)}`)
                        ])
                    ])
                ]),

                // Schedule Options
                React.createElement('div', { key: 'schedule', className: 'schedule-options' }, [
                    React.createElement('h3', { key: 'title' }, 'Suggested Appointment Times'),
                    React.createElement('div', { key: 'options', className: 'schedule-grid' },
                        state.proposedSchedule.map(option =>
                            React.createElement('div', {
                                key: option.id,
                                className: `schedule-option ${option.recommended ? 'recommended' : ''}`
                            }, [
                                option.recommended && React.createElement('span', {
                                    key: 'badge',
                                    className: 'recommended-badge'
                                }, 'Recommended'),
                                React.createElement('h4', { key: 'label' }, option.label),
                                React.createElement('div', { key: 'datetime', className: 'option-datetime' }, [
                                    React.createElement('i', { key: 'icon', className: 'fas fa-calendar' }),
                                    React.createElement('span', { key: 'date' }, formatDate(option.date)),
                                    React.createElement('span', { key: 'time' }, formatTime(option.date))
                                ]),
                                React.createElement('div', { key: 'availability', className: 'availability-status' }, [
                                    React.createElement('div', {
                                        key: 'tenant',
                                        className: `status-item ${option.tenantHome ? 'available' : 'unavailable'}`
                                    }, [
                                        React.createElement('i', { className: `fas fa-${option.tenantHome ? 'check' : 'times'}` }),
                                        React.createElement('span', {}, 'Tenant available')
                                    ]),
                                    React.createElement('div', {
                                        key: 'vendor',
                                        className: `status-item ${option.vendorAvailable ? 'available' : 'unavailable'}`
                                    }, [
                                        React.createElement('i', { className: `fas fa-${option.vendorAvailable ? 'check' : 'times'}` }),
                                        React.createElement('span', {}, 'Vendor available')
                                    ])
                                ]),
                                option.note && React.createElement('p', {
                                    key: 'note',
                                    className: 'option-note'
                                }, option.note),
                                React.createElement('button', {
                                    key: 'select',
                                    className: 'btn btn-primary',
                                    onClick: () => selectSchedule(option)
                                }, 'Select This Time')
                            ])
                        )
                    )
                ]),

                // Top Vendor Match
                state.selectedVendor && React.createElement('div', {
                    key: 'vendor-details',
                    className: 'selected-vendor-details'
                }, [
                    React.createElement('h3', { key: 'title' }, 'Selected Vendor Details'),
                    React.createElement(VendorMatchCard, {
                        key: 'card',
                        vendor: state.selectedVendor,
                        match: state.matchingResults[0],
                        onSelect: () => confirmVendorSelection()
                    })
                ]),

                // Alternative Options
                state.alternativeOptions.length > 0 && React.createElement('div', {
                    key: 'alternatives',
                    className: 'alternative-vendors'
                }, [
                    React.createElement('h3', { key: 'title' }, 'Alternative Vendors'),
                    React.createElement('div', { key: 'list', className: 'alternatives-list' },
                        state.alternativeOptions.map((match, idx) =>
                            React.createElement(VendorMatchCard, {
                                key: match.vendor.id,
                                vendor: match.vendor,
                                match: match,
                                compact: true,
                                onSelect: () => selectAlternativeVendor(match.vendor)
                            })
                        )
                    )
                ])
            ])
        ]);

        function selectSchedule(option) {
            console.log('Selected schedule:', option);
            // Proceed with scheduling
            if (onMatch) {
                onMatch({
                    vendor: state.selectedVendor,
                    schedule: option,
                    confidence: state.confidenceScore
                });
            }
        }

        function confirmVendorSelection() {
            // Open scheduling modal or proceed to next step
            console.log('Confirmed vendor:', state.selectedVendor);
        }

        function selectAlternativeVendor(vendor) {
            updateState({ selectedVendor: vendor });
            // Re-generate schedule options for new vendor
            const match = state.matchingResults.find(m => m.vendor.id === vendor.id);
            const proposedSchedule = generateScheduleOptions(match, workOrder, tenantSchedule);
            updateState({ proposedSchedule });
        }
    });
})();

// Vendor Match Card Component
const VendorMatchCard = ComponentFactory.createComponent('VendorMatchCard')((props, helpers) => {
    const { vendor, match, compact = false, onSelect } = props;
    const { formatCurrency } = helpers;

    return React.createElement('div', {
        className: `vendor-match-card ${compact ? 'compact' : ''}`,
        onClick: onSelect
    }, [
        React.createElement('div', { key: 'header', className: 'vendor-header' }, [
            React.createElement('div', { key: 'info' }, [
                React.createElement('h4', { key: 'name' }, vendor.companyName),
                React.createElement('div', { key: 'stats', className: 'vendor-stats' }, [
                    React.createElement('span', { key: 'rating' }, [
                        React.createElement('i', { className: 'fas fa-star' }),
                        `${vendor.rating}`
                    ]),
                    React.createElement('span', { key: 'jobs' }, `${vendor.totalJobs} jobs`),
                    vendor.preferred && React.createElement('span', {
                        key: 'preferred',
                        className: 'preferred-badge'
                    }, 'Preferred')
                ])
            ]),
            React.createElement('div', { key: 'score', className: 'match-score' }, [
                React.createElement('span', { key: 'number', className: 'score-number' }, `${match.score}%`),
                React.createElement('span', { key: 'label', className: 'score-label' }, 'match')
            ])
        ]),

        !compact && React.createElement('div', { key: 'reasons', className: 'match-reasons' },
            match.reasons.map((reason, idx) =>
                React.createElement('div', {
                    key: idx,
                    className: `reason-item ${reason.importance}`
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-check-circle' }),
                    React.createElement('span', { key: 'text' }, reason.text)
                ])
            )
        ),

        React.createElement('div', { key: 'details', className: 'match-details' }, [
            React.createElement('div', { key: 'response', className: 'detail-item' }, [
                React.createElement('i', { className: 'fas fa-bolt' }),
                React.createElement('span', {}, `${match.responseTime} min response`)
            ]),
            React.createElement('div', { key: 'cost', className: 'detail-item' }, [
                React.createElement('i', { className: 'fas fa-dollar-sign' }),
                React.createElement('span', {}, formatCurrency(match.estimatedCost))
            ]),
            React.createElement('div', { key: 'availability', className: 'detail-item' }, [
                React.createElement('i', { className: 'fas fa-calendar-check' }),
                React.createElement('span', {}, match.availability.today ? 'Available today' : 'Next available tomorrow')
            ])
        ])
    ]);
});

// Export components
window.AppModules = window.AppModules || {};
window.AppModules.AIVendorMatching = AIVendorMatching;
window.AppModules.VendorMatchCard = VendorMatchCard;