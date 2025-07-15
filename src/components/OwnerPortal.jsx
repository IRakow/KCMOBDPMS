// OwnerPortal.jsx - Comprehensive Property Owner Dashboard
const OwnerPortal = () => {
    const [selectedProperty, setSelectedProperty] = React.useState('all');
    const [activeTab, setActiveTab] = React.useState('overview');
    const [timeRange, setTimeRange] = React.useState('30d');
    const [ownerData, setOwnerData] = React.useState({});
    
    // Connect to maintenance store
    const maintenanceStore = window.useMaintenanceStore ? window.useMaintenanceStore() : null;

    React.useEffect(() => {
        loadOwnerData();
        loadPaymentData();
    }, [selectedProperty, timeRange]);

    const loadOwnerData = () => {
        // Mock comprehensive owner data
        const mockData = {
            owner: {
                name: 'Robert Thompson',
                email: 'robert.thompson@email.com',
                phone: '(555) 987-6543',
                properties_count: 3,
                total_units: 24,
                portfolio_value: 4200000
            },
            properties: [
                {
                    id: 'prop_001',
                    name: 'Sunset Apartments',
                    address: '123 Sunset Blvd, Los Angeles, CA',
                    units: 10,
                    occupied: 9,
                    occupancy_rate: 90,
                    monthly_rent: 23500,
                    monthly_expenses: 8200,
                    net_income: 15300,
                    property_value: 1800000,
                    roi: 10.2,
                    acquisition_date: '2019-03-15',
                    management_fee_rate: 0.08
                },
                {
                    id: 'prop_002',
                    name: 'Downtown Plaza',
                    address: '456 Main St, Los Angeles, CA',
                    units: 8,
                    occupied: 7,
                    occupancy_rate: 87.5,
                    monthly_rent: 21600,
                    monthly_expenses: 7100,
                    net_income: 14500,
                    property_value: 1600000,
                    roi: 10.9,
                    acquisition_date: '2020-08-22',
                    management_fee_rate: 0.08
                },
                {
                    id: 'prop_003',
                    name: 'Garden Complex',
                    address: '789 Garden Ave, Los Angeles, CA',
                    units: 6,
                    occupied: 6,
                    occupancy_rate: 100,
                    monthly_rent: 18000,
                    monthly_expenses: 5800,
                    net_income: 12200,
                    property_value: 1400000,
                    roi: 10.5,
                    acquisition_date: '2021-01-10',
                    management_fee_rate: 0.08
                }
            ],
            financial_summary: {
                total_monthly_income: 63100,
                total_monthly_expenses: 21100,
                total_net_income: 42000,
                ytd_income: 378600,
                ytd_expenses: 126600,
                ytd_net: 252000,
                management_fees: 5048,
                average_roi: 10.5,
                cash_flow_trend: 'positive'
            },
            recent_transactions: [
                {
                    id: 'txn_001',
                    date: '2024-07-01',
                    type: 'rent_collection',
                    description: 'July Rent Collection - Sunset Apartments',
                    amount: 23500,
                    property: 'Sunset Apartments'
                },
                {
                    id: 'txn_002',
                    date: '2024-07-01',
                    type: 'rent_collection',
                    description: 'July Rent Collection - Downtown Plaza',
                    amount: 21600,
                    property: 'Downtown Plaza'
                },
                {
                    id: 'txn_003',
                    date: '2024-06-28',
                    type: 'expense',
                    description: 'HVAC Maintenance - Garden Complex',
                    amount: -850,
                    property: 'Garden Complex'
                },
                {
                    id: 'txn_004',
                    date: '2024-06-25',
                    type: 'expense',
                    description: 'Management Fee - June',
                    amount: -5048,
                    property: 'All Properties'
                }
            ],
            maintenance_requests: [
                {
                    id: 'maint_001',
                    property: 'Sunset Apartments',
                    unit: '205',
                    description: 'AC not cooling properly',
                    status: 'in_progress',
                    priority: 'high',
                    estimated_cost: 450,
                    created_date: '2024-07-12',
                    completion_date: null
                },
                {
                    id: 'maint_002',
                    property: 'Downtown Plaza',
                    unit: '312',
                    description: 'Kitchen faucet leak',
                    status: 'completed',
                    priority: 'medium',
                    estimated_cost: 125,
                    actual_cost: 110,
                    created_date: '2024-07-08',
                    completion_date: '2024-07-10'
                }
            ],
            market_insights: {
                avg_market_rent: 2580,
                your_avg_rent: 2629,
                market_position: 'above_market',
                rent_growth_potential: 3.2,
                area_appreciation: 8.5,
                competition_analysis: {
                    nearby_properties: 15,
                    avg_occupancy: 91.2,
                    your_occupancy: 92.5
                }
            },
            upcoming_events: [
                {
                    id: 'event_001',
                    type: 'lease_expiration',
                    property: 'Sunset Apartments',
                    unit: '104',
                    tenant: 'Sarah Johnson',
                    date: '2024-08-31',
                    action_required: 'Renewal discussion needed'
                },
                {
                    id: 'event_002',
                    type: 'inspection',
                    property: 'Garden Complex',
                    unit: 'All Units',
                    date: '2024-07-20',
                    action_required: 'Annual inspection scheduled'
                }
            ]
        };

        setOwnerData(mockData);
    };

    const loadPaymentData = async () => {
        try {
            if (window.ValorPayTechService) {
                const today = new Date();
                const startDate = timeRange === '30d' ? new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) :
                                 timeRange === '90d' ? new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000) :
                                 timeRange === '1y' ? new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000) :
                                 new Date(today.getFullYear(), 0, 1); // YTD
                
                const history = await window.ValorPayTechService.getPaymentHistory({
                    limit: 200,
                    dateRange: `${startDate.toISOString()},${today.toISOString()}`
                });
                
                // Process payment data for owner properties
                if (history.payments && ownerData.properties) {
                    const propertyIds = selectedProperty === 'all' 
                        ? ownerData.properties.map(p => p.id) 
                        : [selectedProperty];
                    
                    const relevantPayments = history.payments.filter(payment => 
                        propertyIds.includes(payment.propertyId) && payment.status === 'paid'
                    );
                    
                    // Calculate real-time payment metrics
                    const totalCollected = relevantPayments.reduce((sum, p) => sum + p.amount, 0);
                    const paymentsByProperty = {};
                    
                    relevantPayments.forEach(payment => {
                        if (!paymentsByProperty[payment.propertyId]) {
                            paymentsByProperty[payment.propertyId] = {
                                total: 0,
                                count: 0,
                                onTime: 0,
                                late: 0
                            };
                        }
                        paymentsByProperty[payment.propertyId].total += payment.amount;
                        paymentsByProperty[payment.propertyId].count++;
                        
                        // Check if payment was on time
                        const dueDate = new Date(payment.metadata?.due_date);
                        const paidDate = new Date(payment.createdAt);
                        if (paidDate <= dueDate) {
                            paymentsByProperty[payment.propertyId].onTime++;
                        } else {
                            paymentsByProperty[payment.propertyId].late++;
                        }
                    });
                    
                    // Update owner data with real payment info
                    setOwnerData(prev => ({
                        ...prev,
                        payment_metrics: {
                            total_collected: totalCollected,
                            collection_rate: (totalCollected / (prev.financial_summary?.total_monthly_income * (timeRange === '30d' ? 1 : timeRange === '90d' ? 3 : timeRange === '1y' ? 12 : new Date().getMonth() + 1))) * 100,
                            by_property: paymentsByProperty,
                            recent_payments: relevantPayments.slice(0, 10)
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading payment data:', error);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            completed: '#10b981',
            in_progress: '#f59e0b',
            pending: '#6b7280',
            overdue: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
        };
        return colors[priority] || '#6b7280';
    };

    // Overview Tab Component
    const OverviewTab = () => (
        <div className="overview-tab">
            {/* Portfolio Summary Cards */}
            <div className="portfolio-summary">
                <div className="summary-card total-value">
                    <div className="card-icon">
                        <i className="fas fa-building"></i>
                    </div>
                    <div className="card-content">
                        <div className="card-value">{formatCurrency(ownerData.owner?.portfolio_value)}</div>
                        <div className="card-label">Portfolio Value</div>
                        <div className="card-change positive">+8.5% YoY</div>
                    </div>
                </div>

                <div className="summary-card monthly-income">
                    <div className="card-icon">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="card-content">
                        <div className="card-value">{formatCurrency(ownerData.financial_summary?.total_monthly_income)}</div>
                        <div className="card-label">Monthly Income</div>
                        <div className="card-change positive">+3.2% vs last month</div>
                    </div>
                </div>

                <div className="summary-card net-income">
                    <div className="card-icon">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="card-content">
                        <div className="card-value">{formatCurrency(ownerData.financial_summary?.total_net_income)}</div>
                        <div className="card-label">Monthly Net Income</div>
                        <div className="card-change positive">ROI: {ownerData.financial_summary?.average_roi}%</div>
                    </div>
                </div>

                <div className="summary-card occupancy">
                    <div className="card-icon">
                        <i className="fas fa-home"></i>
                    </div>
                    <div className="card-content">
                        <div className="card-value">92.5%</div>
                        <div className="card-label">Portfolio Occupancy</div>
                        <div className="card-change positive">Above market average</div>
                    </div>
                </div>
            </div>

            {/* Properties Overview */}
            <div className="properties-overview">
                <h3>Property Performance</h3>
                <div className="properties-grid">
                    {ownerData.properties?.map(property => (
                        <div key={property.id} className="property-card">
                            <div className="property-header">
                                <h4>{property.name}</h4>
                                <div className="occupancy-badge" style={{ 
                                    backgroundColor: property.occupancy_rate >= 95 ? '#10b981' : 
                                                   property.occupancy_rate >= 85 ? '#f59e0b' : '#ef4444'
                                }}>
                                    {property.occupancy_rate}%
                                </div>
                            </div>
                            <div className="property-address">{property.address}</div>
                            <div className="property-metrics">
                                <div className="metric">
                                    <span className="metric-label">Monthly Revenue</span>
                                    <span className="metric-value">{formatCurrency(property.monthly_rent)}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Net Income</span>
                                    <span className="metric-value">{formatCurrency(property.net_income)}</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">ROI</span>
                                    <span className="metric-value">{property.roi}%</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-label">Units</span>
                                    <span className="metric-value">{property.occupied}/{property.units}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {ownerData.recent_transactions?.slice(0, 5).map(transaction => (
                        <div key={transaction.id} className="activity-item">
                            <div className="activity-icon" style={{
                                backgroundColor: transaction.type === 'rent_collection' ? '#10b981' : '#f59e0b'
                            }}>
                                <i className={`fas fa-${transaction.type === 'rent_collection' ? 'dollar-sign' : 'wrench'}`}></i>
                            </div>
                            <div className="activity-content">
                                <div className="activity-description">{transaction.description}</div>
                                <div className="activity-meta">
                                    <span>{transaction.property}</span>
                                    <span>{formatDate(transaction.date)}</span>
                                </div>
                            </div>
                            <div className={`activity-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                                {formatCurrency(Math.abs(transaction.amount))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Financials Tab Component
    const FinancialsTab = () => (
        <div className="financials-tab">
            {/* Valor PayTech Payment Summary */}
            {ownerData.payment_metrics && (
                <div className="payment-summary-section">
                    <h3>Real-Time Payment Status (Valor PayTech)</h3>
                    <div className="payment-metrics-grid">
                        <div className="payment-metric">
                            <i className="fas fa-dollar-sign"></i>
                            <div>
                                <h4>Total Collected</h4>
                                <p className="amount">{formatCurrency(ownerData.payment_metrics.total_collected)}</p>
                            </div>
                        </div>
                        <div className="payment-metric">
                            <i className="fas fa-percentage"></i>
                            <div>
                                <h4>Collection Rate</h4>
                                <p className="percentage">{ownerData.payment_metrics.collection_rate?.toFixed(1)}%</p>
                            </div>
                        </div>
                        <div className="payment-metric">
                            <i className="fas fa-clock"></i>
                            <div>
                                <h4>On-Time Payments</h4>
                                <p className="count">{Object.values(ownerData.payment_metrics.by_property || {}).reduce((sum, p) => sum + p.onTime, 0)}</p>
                            </div>
                        </div>
                        <div className="payment-metric">
                            <i className="fas fa-exclamation-triangle"></i>
                            <div>
                                <h4>Late Payments</h4>
                                <p className="count warning">{Object.values(ownerData.payment_metrics.by_property || {}).reduce((sum, p) => sum + p.late, 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Financial Summary */}
            <div className="financial-summary">
                <h3>Financial Summary</h3>
                <div className="financial-grid">
                    <div className="financial-section">
                        <h4>Income</h4>
                        <div className="financial-items">
                            <div className="financial-item">
                                <span>Gross Rental Income</span>
                                <span>{formatCurrency(ownerData.financial_summary?.total_monthly_income)}</span>
                            </div>
                            <div className="financial-item">
                                <span>Other Income</span>
                                <span>{formatCurrency(1200)}</span>
                            </div>
                            <div className="financial-item total">
                                <span>Total Income</span>
                                <span>{formatCurrency((ownerData.financial_summary?.total_monthly_income || 0) + 1200)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="financial-section">
                        <h4>Expenses</h4>
                        <div className="financial-items">
                            <div className="financial-item">
                                <span>Management Fees</span>
                                <span>{formatCurrency(ownerData.financial_summary?.management_fees)}</span>
                            </div>
                            <div className="financial-item">
                                <span>Maintenance & Repairs</span>
                                <span>{formatCurrency(3200)}</span>
                            </div>
                            <div className="financial-item">
                                <span>Insurance</span>
                                <span>{formatCurrency(1800)}</span>
                            </div>
                            <div className="financial-item">
                                <span>Property Taxes</span>
                                <span>{formatCurrency(4200)}</span>
                            </div>
                            <div className="financial-item">
                                <span>Utilities</span>
                                <span>{formatCurrency(2100)}</span>
                            </div>
                            <div className="financial-item">
                                <span>Other Expenses</span>
                                <span>{formatCurrency(1500)}</span>
                            </div>
                            <div className="financial-item total">
                                <span>Total Expenses</span>
                                <span>{formatCurrency(ownerData.financial_summary?.total_monthly_expenses)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="net-income-summary">
                    <div className="net-income-card">
                        <h4>Monthly Net Operating Income</h4>
                        <div className="net-amount">{formatCurrency(ownerData.financial_summary?.total_net_income)}</div>
                        <div className="net-margin">Profit Margin: {Math.round((ownerData.financial_summary?.total_net_income / ownerData.financial_summary?.total_monthly_income) * 100)}%</div>
                    </div>
                    <div className="ytd-summary">
                        <h4>Year-to-Date Performance</h4>
                        <div className="ytd-metrics">
                            <div className="ytd-metric">
                                <span>YTD Income</span>
                                <span>{formatCurrency(ownerData.financial_summary?.ytd_income)}</span>
                            </div>
                            <div className="ytd-metric">
                                <span>YTD Expenses</span>
                                <span>{formatCurrency(ownerData.financial_summary?.ytd_expenses)}</span>
                            </div>
                            <div className="ytd-metric net">
                                <span>YTD Net Income</span>
                                <span>{formatCurrency(ownerData.financial_summary?.ytd_net)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="transaction-history">
                <h3>Transaction History</h3>
                <div className="transactions-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Property</th>
                                <th>Amount</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ownerData.recent_transactions?.map(transaction => (
                                <tr key={transaction.id}>
                                    <td>{formatDate(transaction.date)}</td>
                                    <td>{transaction.description}</td>
                                    <td>{transaction.property}</td>
                                    <td className={transaction.amount > 0 ? 'positive' : 'negative'}>
                                        {formatCurrency(Math.abs(transaction.amount))}
                                    </td>
                                    <td>
                                        <span className={`type-badge ${transaction.type}`}>
                                            {transaction.type.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    // Maintenance Tab Component
    const MaintenanceTab = () => {
        // Get live maintenance data from store
        const liveRequests = maintenanceStore?.actions?.getRequests() || [];
        const analytics = maintenanceStore?.actions?.getAnalytics() || {};
        
        const activeRequests = liveRequests.filter(req => 
            req.status !== 'completed' && req.status !== 'cancelled'
        );
        const completedThisMonth = liveRequests.filter(req => {
            const created = new Date(req.createdAt);
            const now = new Date();
            return req.status === 'completed' && 
                   created.getMonth() === now.getMonth() && 
                   created.getFullYear() === now.getFullYear();
        });

        const totalMonthlyCost = completedThisMonth.reduce((sum, req) => 
            sum + (req.actualCost || req.estimatedCost || 0), 0
        );

        return (
            <div className="maintenance-tab">
                <div className="maintenance-summary">
                    <h3>Maintenance Overview</h3>
                    <div className="maintenance-stats">
                        <div className="stat-card">
                            <div className="stat-value">{activeRequests.length}</div>
                            <div className="stat-label">Active Requests</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{completedThisMonth.length}</div>
                            <div className="stat-label">Completed This Month</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{formatCurrency(totalMonthlyCost)}</div>
                            <div className="stat-label">Monthly Maintenance Cost</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{analytics.avgResolutionTime || '2.1'}</div>
                            <div className="stat-label">Avg Days to Complete</div>
                        </div>
                    </div>
                </div>

                <div className="maintenance-requests">
                    <h3>Recent Maintenance Requests</h3>
                    <div className="requests-list">
                        {liveRequests.slice(0, 5).map(request => (
                            <div key={request.id} className="request-card">
                                <div className="request-header">
                                    <div className="request-info">
                                        <h4>{request.property} - Unit {request.unit}</h4>
                                        <p>{request.title || request.description}</p>
                                    </div>
                                    <div className="request-badges">
                                        <span 
                                            className="status-badge"
                                            style={{ backgroundColor: getStatusColor(request.status) }}
                                        >
                                            {request.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span 
                                            className="priority-badge"
                                            style={{ backgroundColor: getPriorityColor(request.priority) }}
                                        >
                                            {request.priority.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="request-details">
                                    <div className="detail-item">
                                        <span>Created:</span>
                                        <span>{formatDate(request.createdAt)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span>Estimated Cost:</span>
                                        <span>{formatCurrency(request.estimatedCost)}</span>
                                    </div>
                                    {request.completedAt && (
                                        <div className="detail-item">
                                            <span>Completed:</span>
                                            <span>{formatDate(request.completedAt)}</span>
                                        </div>
                                    )}
                                    {request.actualCost && (
                                        <div className="detail-item">
                                            <span>Actual Cost:</span>
                                            <span>{formatCurrency(request.actualCost)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );

    // Market Insights Tab Component
    const MarketInsightsTab = () => (
        <div className="market-insights-tab">
            <div className="market-overview">
                <h3>Market Position</h3>
                <div className="market-cards">
                    <div className="market-card">
                        <div className="market-header">
                            <h4>Rental Rates</h4>
                            <div className="market-status above-market">Above Market</div>
                        </div>
                        <div className="market-comparison">
                            <div className="comparison-item">
                                <span>Your Average Rent</span>
                                <span className="value">{formatCurrency(ownerData.market_insights?.your_avg_rent)}</span>
                            </div>
                            <div className="comparison-item">
                                <span>Market Average</span>
                                <span className="value">{formatCurrency(ownerData.market_insights?.avg_market_rent)}</span>
                            </div>
                            <div className="comparison-item premium">
                                <span>Premium</span>
                                <span className="value">+{formatCurrency(ownerData.market_insights?.your_avg_rent - ownerData.market_insights?.avg_market_rent)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="market-card">
                        <div className="market-header">
                            <h4>Occupancy Performance</h4>
                            <div className="market-status above-market">Outperforming</div>
                        </div>
                        <div className="market-comparison">
                            <div className="comparison-item">
                                <span>Your Occupancy</span>
                                <span className="value">92.5%</span>
                            </div>
                            <div className="comparison-item">
                                <span>Market Average</span>
                                <span className="value">{ownerData.market_insights?.competition_analysis?.avg_occupancy}%</span>
                            </div>
                            <div className="comparison-item premium">
                                <span>Advantage</span>
                                <span className="value">+{(92.5 - ownerData.market_insights?.competition_analysis?.avg_occupancy).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="market-card">
                        <div className="market-header">
                            <h4>Growth Potential</h4>
                            <div className="market-status positive">Strong</div>
                        </div>
                        <div className="market-comparison">
                            <div className="comparison-item">
                                <span>Rent Growth Potential</span>
                                <span className="value">+{ownerData.market_insights?.rent_growth_potential}%</span>
                            </div>
                            <div className="comparison-item">
                                <span>Area Appreciation</span>
                                <span className="value">+{ownerData.market_insights?.area_appreciation}%</span>
                            </div>
                            <div className="comparison-item">
                                <span>Nearby Properties</span>
                                <span className="value">{ownerData.market_insights?.competition_analysis?.nearby_properties}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="ai-recommendations">
                <h3>AI-Powered Recommendations</h3>
                <div className="recommendations-list">
                    <div className="recommendation-card high-impact">
                        <div className="recommendation-header">
                            <i className="fas fa-lightbulb"></i>
                            <div>
                                <h4>Rent Optimization Opportunity</h4>
                                <span className="impact-badge">High Impact</span>
                            </div>
                        </div>
                        <p>Based on market analysis, you can safely increase rents by 3-5% on lease renewals. This could generate an additional <strong>{formatCurrency(1890)}/month</strong>.</p>
                        <div className="recommendation-actions">
                            <button className="btn btn-primary">View Details</button>
                            <button className="btn btn-secondary">Schedule Review</button>
                        </div>
                    </div>

                    <div className="recommendation-card medium-impact">
                        <div className="recommendation-header">
                            <i className="fas fa-tools"></i>
                            <div>
                                <h4>Preventive Maintenance Schedule</h4>
                                <span className="impact-badge">Medium Impact</span>
                            </div>
                        </div>
                        <p>AI predicts HVAC maintenance needs for Sunset Apartments within 30 days. Scheduling now could save <strong>{formatCurrency(1200)}</strong> in emergency repairs.</p>
                        <div className="recommendation-actions">
                            <button className="btn btn-primary">Schedule Maintenance</button>
                            <button className="btn btn-secondary">Learn More</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="owner-portal">
            {/* Header */}
            <div className="owner-portal-header">
                <div className="header-left">
                    <h1>Owner Portal</h1>
                    <p>Welcome back, {ownerData.owner?.name}</p>
                </div>
                <div className="header-controls">
                    <select 
                        value={selectedProperty}
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        className="property-selector"
                    >
                        <option value="all">All Properties</option>
                        {ownerData.properties?.map(property => (
                            <option key={property.id} value={property.id}>
                                {property.name}
                            </option>
                        ))}
                    </select>
                    <select 
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="time-selector"
                    >
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                        <option value="ytd">Year to Date</option>
                    </select>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="portal-tabs">
                {['overview', 'financials', 'maintenance', 'market-insights'].map(tab => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        <i className={`fas fa-${
                            tab === 'overview' ? 'tachometer-alt' :
                            tab === 'financials' ? 'chart-line' :
                            tab === 'maintenance' ? 'tools' :
                            'market'
                        }`}></i>
                        {tab.replace('-', ' ').toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="portal-content">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'financials' && <FinancialsTab />}
                {activeTab === 'maintenance' && <MaintenanceTab />}
                {activeTab === 'market-insights' && <MarketInsightsTab />}
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.OwnerPortal = OwnerPortal;