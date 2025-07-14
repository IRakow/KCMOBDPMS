// PaymentAutomationEngine.jsx - World-Class Payment Processing & Automation with Valor PayTech
const PaymentAutomationEngine = () => {
    const [activeView, setActiveView] = React.useState('dashboard');
    const [paymentData, setPaymentData] = React.useState({});
    const [automationRules, setAutomationRules] = React.useState({
        lateFees: {
            gracePeriod: 5,
            flatFee: 50,
            percentageFee: 0.05,
            maxFee: 500,
            enabled: true
        },
        reminders: {
            daysBeforeDue: [7, 3, 1],
            channels: ['email', 'sms', 'push'],
            enabled: true
        },
        retryLogic: {
            maxAttempts: 3,
            retryDelays: [1, 3, 7], // days
            enabled: true
        }
    });
    const [loading, setLoading] = React.useState(false);
    const [valorService] = React.useState(() => window.ValorPayTechService);

    // Real-time payment data from Valor PayTech
    React.useEffect(() => {
        loadPaymentData();
        // Set up real-time webhook listener
        const webhookHandler = (event) => {
            if (event.data.type === 'valor_payment_update') {
                handlePaymentUpdate(event.data.payload);
            }
        };
        window.addEventListener('message', webhookHandler);
        return () => window.removeEventListener('message', webhookHandler);
    }, []);

    const loadPaymentData = async () => {
        setLoading(true);
        try {
            // Load payment history from Valor PayTech
            const history = await valorService.getPaymentHistory({
                limit: 100,
                dateRange: 'this_month'
            });
            
            // Process and update tenant payments
            if (history.payments) {
                updateTenantPayments(history.payments);
            }
            
            // Load payment analytics
            const analytics = await valorService.getPaymentAnalytics(
                { start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] },
                'month'
            );
            
            if (analytics) {
                updateAutomationStats(analytics);
            }
        } catch (error) {
            console.error('Error loading payment data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentUpdate = (payload) => {
        // Real-time payment status update
        setTenantPayments(prev => {
            const index = prev.findIndex(p => p.tenantId === payload.tenantId);
            if (index !== -1) {
                const updated = [...prev];
                updated[index] = { ...updated[index], ...payload };
                return updated;
            }
            return prev;
        });
    };

    // Payment automation state
    const [automationStats, setAutomationStats] = React.useState({
        totalCollected: 125000,
        collectionRate: 97.5,
        avgPaymentTime: 2.3,
        automatedPayments: 85,
        manualPayments: 15,
        failedPayments: 3,
        lateFees: 1200,
        paymentPlans: 8,
        avgProcessingTime: 45,
        successRate: 98.2
    });

    const [tenantPayments, setTenantPayments] = React.useState([
        {
            id: 'PAY-2024-001',
            tenantId: 'tenant_001',
            tenantName: 'Sarah Johnson',
            property: 'Sunset Apartments',
            unit: '205',
            rentAmount: 2500,
            balance: 0,
            dueDate: '2024-08-01',
            paidDate: '2024-07-29',
            paymentMethod: 'ACH - Chase ****4567',
            status: 'paid',
            automated: true,
            lateFee: 0,
            phone: '(555) 123-4567',
            email: 'sarah.j@email.com',
            autopayEnabled: true,
            paymentHistory: [
                { date: '2024-07-01', amount: 2500, method: 'ACH', status: 'completed' },
                { date: '2024-06-01', amount: 2500, method: 'ACH', status: 'completed' },
                { date: '2024-05-01', amount: 2500, method: 'ACH', status: 'completed' }
            ]
        },
        {
            id: 'PAY-2024-002',
            tenantId: 'tenant_002',
            tenantName: 'Michael Chen',
            property: 'Downtown Plaza',
            unit: '312',
            rentAmount: 3200,
            balance: 3200,
            dueDate: '2024-08-01',
            paidDate: null,
            paymentMethod: 'Card - Visa ****1234',
            status: 'pending',
            automated: true,
            lateFee: 0,
            phone: '(555) 234-5678',
            email: 'mchen@company.com',
            autopayEnabled: true,
            scheduledRetry: '2024-08-02T10:00:00Z',
            paymentHistory: [
                { date: '2024-07-01', amount: 3200, method: 'Card', status: 'completed' },
                { date: '2024-06-01', amount: 3200, method: 'Card', status: 'completed' }
            ]
        },
        {
            id: 'PAY-2024-003',
            tenantId: 'tenant_003',
            tenantName: 'Emily Rodriguez',
            property: 'Garden Complex',
            unit: '101',
            rentAmount: 2800,
            balance: 3080, // includes late fee
            dueDate: '2024-07-01',
            paidDate: null,
            paymentMethod: 'Card - Amex ****9876',
            status: 'overdue',
            automated: false,
            lateFee: 280,
            daysLate: 14,
            phone: '(555) 345-6789',
            email: 'emily.r@startup.io',
            autopayEnabled: false,
            paymentPlan: {
                id: 'PP-001',
                totalAmount: 3080,
                installments: 3,
                paidInstallments: 0,
                nextDueDate: '2024-08-15',
                nextAmount: 1027
            },
            paymentHistory: [
                { date: '2024-06-01', amount: 2800, method: 'Card', status: 'completed' },
                { date: '2024-05-01', amount: 2800, method: 'Card', status: 'completed' }
            ]
        }
    ]);

    React.useEffect(() => {
        loadPaymentData();
        loadAutomationRules();
    }, []);

    const loadPaymentData = async () => {
        setLoading(true);
        try {
            // Simulate API call to load payment data
            setTimeout(() => {
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error loading payment data:', error);
            setLoading(false);
        }
    };

    const loadAutomationRules = () => {
        setAutomationRules({
            rentReminders: {
                enabled: true,
                days: [7, 3, 1], // days before due date
                methods: ['email', 'sms']
            },
            lateFees: {
                enabled: true,
                gracePeriod: 5, // days
                flatFee: 50,
                percentageFee: 10, // percent of rent
                maxFee: 500
            },
            autoRetry: {
                enabled: true,
                attempts: 3,
                intervals: [1, 3, 7] // days between attempts
            },
            paymentPlans: {
                enabled: true,
                maxInstallments: 6,
                setupFee: 25,
                interestRate: 0 // no interest
            }
        });
    };

    // Dashboard View Component
    const DashboardView = () => (
        <div className="payment-automation-dashboard">
            {/* Key Metrics */}
            <div className="metrics-grid">
                <div className="metric-card revenue">
                    <div className="metric-icon">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="metric-content">
                        <h3>${(automationStats.totalCollected / 1000).toFixed(0)}K</h3>
                        <p>Total Collected</p>
                        <span className="metric-change positive">+12.5% vs last month</span>
                    </div>
                </div>

                <div className="metric-card collection-rate">
                    <div className="metric-icon">
                        <i className="fas fa-percentage"></i>
                    </div>
                    <div className="metric-content">
                        <h3>{automationStats.collectionRate}%</h3>
                        <p>Collection Rate</p>
                        <span className="metric-change positive">+2.1% improvement</span>
                    </div>
                </div>

                <div className="metric-card automation">
                    <div className="metric-icon">
                        <i className="fas fa-robot"></i>
                    </div>
                    <div className="metric-content">
                        <h3>{automationStats.automatedPayments}%</h3>
                        <p>Automated Payments</p>
                        <span className="metric-change positive">Target: 90%</span>
                    </div>
                </div>

                <div className="metric-card processing-time">
                    <div className="metric-icon">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="metric-content">
                        <h3>{automationStats.avgProcessingTime}s</h3>
                        <p>Avg Processing Time</p>
                        <span className="metric-change positive">-15s improvement</span>
                    </div>
                </div>
            </div>

            {/* Real-time Payment Status */}
            <div className="payment-status-section">
                <h2>Real-time Payment Status</h2>
                <div className="status-cards">
                    <div className="status-card paid">
                        <div className="status-header">
                            <h3>Paid</h3>
                            <span className="count">{tenantPayments.filter(p => p.status === 'paid').length}</span>
                        </div>
                        <div className="status-amount">${tenantPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.rentAmount, 0).toLocaleString()}</div>
                    </div>

                    <div className="status-card pending">
                        <div className="status-header">
                            <h3>Pending AutoPay</h3>
                            <span className="count">{tenantPayments.filter(p => p.status === 'pending').length}</span>
                        </div>
                        <div className="status-amount">${tenantPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.balance, 0).toLocaleString()}</div>
                    </div>

                    <div className="status-card overdue">
                        <div className="status-header">
                            <h3>Overdue</h3>
                            <span className="count">{tenantPayments.filter(p => p.status === 'overdue').length}</span>
                        </div>
                        <div className="status-amount">${tenantPayments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.balance, 0).toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div className="ai-insights-section">
                <h2><i className="fas fa-brain"></i> AI Payment Insights</h2>
                <div className="insights-grid">
                    <div className="insight-card prediction">
                        <div className="insight-header">
                            <i className="fas fa-chart-line"></i>
                            <h4>Collection Prediction</h4>
                        </div>
                        <p>AI predicts 96.8% collection rate this month based on payment patterns and tenant behavior.</p>
                        <div className="insight-actions">
                            <button className="btn-insight">View Details</button>
                        </div>
                    </div>

                    <div className="insight-card risk">
                        <div className="insight-header">
                            <i className="fas fa-exclamation-triangle"></i>
                            <h4>Payment Risk Alert</h4>
                        </div>
                        <p>3 tenants showing unusual payment patterns. Recommend proactive outreach to prevent defaults.</p>
                        <div className="insight-actions">
                            <button className="btn-insight">Contact Tenants</button>
                        </div>
                    </div>

                    <div className="insight-card optimization">
                        <div className="insight-header">
                            <i className="fas fa-lightbulb"></i>
                            <h4>Process Optimization</h4>
                        </div>
                        <p>Enabling autopay for 5 more tenants could increase automation rate to 92% and reduce late payments by 30%.</p>
                        <div className="insight-actions">
                            <button className="btn-insight">Send Invites</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Automated Collections View Component
    const AutomatedCollectionsView = () => (
        <div className="automated-collections">
            <div className="collections-header">
                <h2>Automated Rent Collection</h2>
                <div className="collection-controls">
                    <button className="btn btn-primary" onClick={runCollectionCycle}>
                        <i className="fas fa-play"></i>
                        Run Collection Cycle
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowSettings(true)}>
                        <i className="fas fa-cog"></i>
                        Settings
                    </button>
                </div>
            </div>

            {/* Collection Timeline */}
            <div className="collection-timeline">
                <h3>This Month's Collection Timeline</h3>
                <div className="timeline">
                    <div className="timeline-item completed">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                            <h4>July 25 - Rent Reminders Sent</h4>
                            <p>Email and SMS reminders sent to 45 tenants</p>
                            <span className="timeline-result">98% response rate</span>
                        </div>
                    </div>

                    <div className="timeline-item completed">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                            <h4>August 1 - Autopay Processing</h4>
                            <p>Automated payments processed for 38 tenants</p>
                            <span className="timeline-result">$95,200 collected</span>
                        </div>
                    </div>

                    <div className="timeline-item active">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                            <h4>August 2 - Retry Failed Payments</h4>
                            <p>Processing retries for 3 failed autopay attempts</p>
                            <span className="timeline-result">In Progress</span>
                        </div>
                    </div>

                    <div className="timeline-item pending">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                            <h4>August 6 - Late Fee Application</h4>
                            <p>Apply late fees to overdue accounts</p>
                            <span className="timeline-result">Scheduled</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tenant Payment Status */}
            <div className="tenant-payments-list">
                <h3>Tenant Payment Status</h3>
                <div className="payments-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Property</th>
                                <th>Amount</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Payment Method</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenantPayments.map(payment => (
                                <tr key={payment.id} className={`payment-row ${payment.status}`}>
                                    <td>
                                        <div className="tenant-info">
                                            <strong>{payment.tenantName}</strong>
                                            <small>Unit {payment.unit}</small>
                                        </div>
                                    </td>
                                    <td>{payment.property}</td>
                                    <td>
                                        <div className="amount-info">
                                            <strong>${payment.rentAmount.toLocaleString()}</strong>
                                            {payment.lateFee > 0 && (
                                                <small className="late-fee">+${payment.lateFee} late fee</small>
                                            )}
                                        </div>
                                    </td>
                                    <td>{new Date(payment.dueDate).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${payment.status}`}>
                                            {payment.status === 'paid' && <i className="fas fa-check"></i>}
                                            {payment.status === 'pending' && <i className="fas fa-clock"></i>}
                                            {payment.status === 'overdue' && <i className="fas fa-exclamation-triangle"></i>}
                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                        </span>
                                        {payment.automated && (
                                            <span className="automation-badge">
                                                <i className="fas fa-robot"></i>
                                                Auto
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="payment-method">
                                            {payment.paymentMethod}
                                            {payment.autopayEnabled && (
                                                <small className="autopay-enabled">AutoPay On</small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="payment-actions">
                                            {payment.status === 'overdue' && (
                                                <>
                                                    <button className="btn-action" title="Send Reminder" onClick={() => sendPaymentReminder(payment.tenantId)}>
                                                        <i className="fas fa-bell"></i>
                                                    </button>
                                                    <button className="btn-action" title="Call Tenant" onClick={() => initiateCall(payment.phone)}>
                                                        <i className="fas fa-phone"></i>
                                                    </button>
                                                    <button className="btn-action" title="Payment Plan" onClick={() => createPaymentPlan(payment)}>
                                                        <i className="fas fa-calendar-alt"></i>
                                                    </button>
                                                </>
                                            )}
                                            {payment.status === 'pending' && (
                                                <button className="btn-action" title="Retry Payment" onClick={() => retryPayment(payment)}>
                                                    <i className="fas fa-redo"></i>
                                                </button>
                                            )}
                                            <button className="btn-action" title="View Details">
                                                <i className="fas fa-eye"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Late Fee Management View
    const LateFeeManagementView = () => (
        <div className="late-fee-management">
            <div className="late-fee-header">
                <h2>Late Fee Management</h2>
                <div className="late-fee-stats">
                    <div className="stat">
                        <span className="stat-value">${automationStats.lateFees}</span>
                        <span className="stat-label">Late Fees This Month</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">8</span>
                        <span className="stat-label">Accounts with Late Fees</span>
                    </div>
                </div>
            </div>

            {/* Late Fee Rules */}
            <div className="late-fee-rules">
                <h3>Automated Late Fee Rules</h3>
                <div className="rules-grid">
                    <div className="rule-card">
                        <div className="rule-header">
                            <h4>Grace Period</h4>
                            <span className="rule-status enabled">Enabled</span>
                        </div>
                        <div className="rule-content">
                            <p><strong>{automationRules.lateFees?.gracePeriod} days</strong> after due date</p>
                            <small>No late fees applied during grace period</small>
                        </div>
                    </div>

                    <div className="rule-card">
                        <div className="rule-header">
                            <h4>Flat Fee</h4>
                            <span className="rule-status enabled">Enabled</span>
                        </div>
                        <div className="rule-content">
                            <p><strong>${automationRules.lateFees?.flatFee}</strong> base fee</p>
                            <small>Applied on first day after grace period</small>
                        </div>
                    </div>

                    <div className="rule-card">
                        <div className="rule-header">
                            <h4>Percentage Fee</h4>
                            <span className="rule-status enabled">Enabled</span>
                        </div>
                        <div className="rule-content">
                            <p><strong>{automationRules.lateFees?.percentageFee}%</strong> of rent amount</p>
                            <small>Additional daily fee after 10 days late</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overdue Accounts */}
            <div className="overdue-accounts">
                <h3>Overdue Accounts</h3>
                {tenantPayments.filter(p => p.status === 'overdue').map(payment => (
                    <div key={payment.id} className="overdue-account-card">
                        <div className="account-info">
                            <div className="tenant-details">
                                <h4>{payment.tenantName}</h4>
                                <p>{payment.property} - Unit {payment.unit}</p>
                            </div>
                            <div className="overdue-details">
                                <span className="days-late">{payment.daysLate} days late</span>
                                <span className="amount-due">${payment.balance.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="late-fee-breakdown">
                            <div className="fee-item">
                                <span>Original Rent:</span>
                                <span>${payment.rentAmount.toLocaleString()}</span>
                            </div>
                            <div className="fee-item">
                                <span>Late Fee:</span>
                                <span>${payment.lateFee.toLocaleString()}</span>
                            </div>
                            <div className="fee-item total">
                                <span>Total Due:</span>
                                <span>${payment.balance.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="account-actions">
                            <button className="btn btn-primary" onClick={() => sendLateNotice(payment)}>Send Notice</button>
                            <button className="btn btn-secondary" onClick={() => createPaymentPlan(payment)}>Payment Plan</button>
                            <button className="btn btn-outline" onClick={() => waiveLateFee(payment)}>Waive Fee</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Payment Processing Functions
    const runCollectionCycle = async () => {
        setLoading(true);
        try {
            const pendingPayments = tenantPayments.filter(p => p.status === 'pending' && p.autopayEnabled);
            
            for (const payment of pendingPayments) {
                const paymentMethods = await valorService.getPaymentMethods(payment.tenantId);
                if (paymentMethods.payment_methods.length > 0) {
                    const defaultMethod = paymentMethods.payment_methods[0];
                    await valorService.processAutomatedPayment(
                        payment.tenantId,
                        defaultMethod.id,
                        payment.balance || payment.rentAmount,
                        {
                            lease_id: payment.leaseId,
                            unit_id: payment.unitId,
                            property_id: payment.propertyId,
                            due_date: payment.dueDate
                        }
                    );
                }
            }
            
            await loadPaymentData();
            window.showNotification?.('success', 'Collection cycle completed successfully');
        } catch (error) {
            console.error('Collection cycle error:', error);
            window.showNotification?.('error', 'Error running collection cycle');
        } finally {
            setLoading(false);
        }
    };

    const sendPaymentReminder = async (tenantId) => {
        try {
            await window.ApiService?.post('/notifications/send', {
                tenantId: tenantId,
                type: 'payment_reminder',
                channels: automationRules.reminders.channels,
                data: {
                    message: 'Your rent payment is due. Please ensure timely payment to avoid late fees.'
                }
            });
            window.showNotification?.('success', 'Payment reminder sent');
        } catch (error) {
            console.error('Error sending reminder:', error);
            window.showNotification?.('error', 'Failed to send reminder');
        }
    };

    const retryPayment = async (payment) => {
        try {
            const paymentMethods = await valorService.getPaymentMethods(payment.tenantId);
            if (paymentMethods.payment_methods.length > 0) {
                await valorService.processAutomatedPayment(
                    payment.tenantId,
                    paymentMethods.payment_methods[0].id,
                    payment.balance || payment.rentAmount,
                    { retry: true, original_payment_id: payment.id }
                );
                await loadPaymentData();
                window.showNotification?.('success', 'Payment retry initiated');
            }
        } catch (error) {
            console.error('Error retrying payment:', error);
            window.showNotification?.('error', 'Failed to retry payment');
        }
    };

    const createPaymentPlan = async (payment) => {
        // This would open a modal or navigate to payment plan creation
        console.log('Creating payment plan for:', payment);
        window.showNotification?.('info', 'Payment plan feature coming soon');
    };

    const sendLateNotice = async (payment) => {
        try {
            await window.ApiService?.post('/notifications/send', {
                tenantId: payment.tenantId,
                type: 'late_notice',
                data: {
                    amount_due: payment.balance,
                    days_late: payment.daysLate,
                    late_fee: payment.lateFee
                }
            });
            window.showNotification?.('success', 'Late notice sent');
        } catch (error) {
            console.error('Error sending late notice:', error);
            window.showNotification?.('error', 'Failed to send late notice');
        }
    };

    const waiveLateFee = async (payment) => {
        if (confirm(`Waive late fee of $${payment.lateFee} for ${payment.tenantName}?`)) {
            try {
                await window.ApiService?.post(`/payments/${payment.id}/waive-fee`, {
                    amount: payment.lateFee,
                    reason: 'Manager discretion'
                });
                await loadPaymentData();
                window.showNotification?.('success', 'Late fee waived');
            } catch (error) {
                console.error('Error waiving fee:', error);
                window.showNotification?.('error', 'Failed to waive fee');
            }
        }
    };

    const initiateCall = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const updateTenantPayments = (valorPayments) => {
        // Transform Valor payments to internal format
        const transformed = valorPayments.map(vp => ({
            id: vp.id,
            tenantId: vp.tenantId,
            tenantName: vp.metadata?.tenant_name || 'Unknown Tenant',
            property: vp.metadata?.property_name || 'Unknown Property',
            unit: vp.metadata?.unit_number || 'Unknown',
            rentAmount: vp.amount,
            balance: vp.metadata?.balance || vp.amount,
            dueDate: vp.metadata?.due_date || new Date().toISOString(),
            paidDate: vp.status === 'paid' ? vp.createdAt : null,
            paymentMethod: vp.paymentMethod || 'Valor PayTech',
            status: vp.status,
            automated: vp.metadata?.automated || false,
            lateFee: vp.metadata?.late_fee || 0,
            daysLate: vp.metadata?.days_late || 0,
            phone: vp.metadata?.tenant_phone || '',
            email: vp.metadata?.tenant_email || '',
            autopayEnabled: vp.metadata?.autopay_enabled || false,
            paymentHistory: []
        }));
        
        setTenantPayments(transformed);
    };

    const updateAutomationStats = (analytics) => {
        setAutomationStats(prev => ({
            ...prev,
            totalCollected: analytics.total_collected || prev.totalCollected,
            collectionRate: analytics.collection_rate || prev.collectionRate,
            automatedPayments: analytics.automated_count || prev.automatedPayments,
            successRate: analytics.success_rate || prev.successRate
        }));
    };

    const [showSettings, setShowSettings] = React.useState(false);

    // Main render
    return (
        <div className="payment-automation-engine">
            {/* Navigation */}
            <div className="automation-nav">
                <div className="nav-items">
                    <button 
                        className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveView('dashboard')}
                    >
                        <i className="fas fa-tachometer-alt"></i>
                        Dashboard
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'collections' ? 'active' : ''}`}
                        onClick={() => setActiveView('collections')}
                    >
                        <i className="fas fa-money-bill-wave"></i>
                        Automated Collections
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'late-fees' ? 'active' : ''}`}
                        onClick={() => setActiveView('late-fees')}
                    >
                        <i className="fas fa-exclamation-circle"></i>
                        Late Fees
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'payment-plans' ? 'active' : ''}`}
                        onClick={() => setActiveView('payment-plans')}
                    >
                        <i className="fas fa-calendar-alt"></i>
                        Payment Plans
                    </button>
                    <button 
                        className={`nav-item ${activeView === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveView('analytics')}
                    >
                        <i className="fas fa-chart-bar"></i>
                        Analytics
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="automation-content">
                {loading ? (
                    <div className="loading-state">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading payment data...</p>
                    </div>
                ) : (
                    <>
                        {activeView === 'dashboard' && <DashboardView />}
                        {activeView === 'collections' && <AutomatedCollectionsView />}
                        {activeView === 'late-fees' && <LateFeeManagementView />}
                        {activeView === 'payment-plans' && (
                            <div className="payment-plans">
                                <h2>Payment Plans</h2>
                                <p>Payment plan management coming soon...</p>
                            </div>
                        )}
                        {activeView === 'analytics' && (
                            <div className="payment-analytics">
                                <h2>Payment Analytics</h2>
                                <p>Advanced payment analytics coming soon...</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.PaymentAutomationEngine = PaymentAutomationEngine;