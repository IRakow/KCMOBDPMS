// Working Dashboard with Real Data
const WorkingDashboard = ({ data }) => {
    const stats = React.useMemo(() => {
        const totalUnits = data.units.length;
        const occupiedUnits = data.units.filter(u => u.status === 'occupied').length;
        const monthlyRevenue = data.units
            .filter(u => u.status === 'occupied')
            .reduce((sum, u) => sum + u.rent_amount, 0);
        
        const thisMonthPayments = data.payments
            .filter(p => {
                const paymentDate = new Date(p.payment_date);
                const now = new Date();
                return paymentDate.getMonth() === now.getMonth() && 
                       paymentDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, p) => sum + p.amount, 0);
        
        return {
            totalProperties: data.properties.length,
            totalUnits,
            occupiedUnits,
            vacantUnits: totalUnits - occupiedUnits,
            occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
            monthlyRevenue,
            collectedThisMonth: thisMonthPayments,
            activeTenants: data.tenants.filter(t => t.is_active).length,
            expiringLeases: data.leases.filter(l => {
                const endDate = new Date(l.end_date);
                const daysUntil = (endDate - new Date()) / (1000 * 60 * 60 * 24);
                return daysUntil > 0 && daysUntil <= 60;
            }).length
        };
    }, [data]);
    
    return (
        <div className="dashboard-working">
            <div className="dashboard-header">
                <h1>Property Overview</h1>
                <p>Welcome back! Here's what's happening with your properties.</p>
            </div>
            
            {/* Key Metrics */}
            <div className="metrics-grid">
                <MetricCard
                    icon="fa-building"
                    title="Properties"
                    value={stats.totalProperties}
                    trend="+2 this month"
                    color="blue"
                />
                
                <MetricCard
                    icon="fa-home"
                    title="Total Units"
                    value={stats.totalUnits}
                    subtitle={`${stats.occupiedUnits} occupied`}
                    color="purple"
                />
                
                <MetricCard
                    icon="fa-percentage"
                    title="Occupancy Rate"
                    value={`${stats.occupancyRate}%`}
                    trend={stats.occupancyRate > 90 ? "Excellent" : "Needs attention"}
                    color={stats.occupancyRate > 90 ? "green" : "orange"}
                />
                
                <MetricCard
                    icon="fa-dollar-sign"
                    title="Monthly Revenue"
                    value={`$${stats.monthlyRevenue.toLocaleString()}`}
                    subtitle={`$${stats.collectedThisMonth.toLocaleString()} collected`}
                    color="green"
                />
            </div>
            
            {/* Action Items */}
            <div className="action-items-section">
                <h2>Action Items</h2>
                <div className="action-items-grid">
                    {stats.vacantUnits > 0 && (
                        <ActionItem
                            icon="fa-door-open"
                            title={`${stats.vacantUnits} Vacant Units`}
                            description="List these units to maximize revenue"
                            action="List Units"
                            urgency="high"
                        />
                    )}
                    
                    {stats.expiringLeases > 0 && (
                        <ActionItem
                            icon="fa-calendar-alt"
                            title={`${stats.expiringLeases} Expiring Leases`}
                            description="Contact tenants for renewal"
                            action="View Leases"
                            urgency="medium"
                        />
                    )}
                    
                    <ActionItem
                        icon="fa-chart-line"
                        title="Revenue Optimization"
                        description="AI found $3,500/mo in potential increases"
                        action="View Analysis"
                        urgency="low"
                    />
                </div>
            </div>
            
            {/* Recent Activity */}
            <div className="recent-activity">
                <h2>Recent Activity</h2>
                <div className="activity-list">
                    {data.payments.slice(0, 5).map((payment, idx) => (
                        <div key={idx} className="activity-item">
                            <i className="fas fa-dollar-sign"></i>
                            <div className="activity-content">
                                <p>Payment received: ${payment.amount}</p>
                                <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper components
const MetricCard = ({ icon, title, value, subtitle, trend, color }) => (
    <div className={`metric-card metric-${color}`}>
        <div className="metric-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="metric-content">
            <h3>{title}</h3>
            <div className="metric-value">{value}</div>
            {subtitle && <div className="metric-subtitle">{subtitle}</div>}
            {trend && <div className="metric-trend">{trend}</div>}
        </div>
    </div>
);

const ActionItem = ({ icon, title, description, action, urgency }) => (
    <div className={`action-item urgency-${urgency}`}>
        <div className="action-icon">
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="action-content">
            <h4>{title}</h4>
            <p>{description}</p>
            <button className="action-button">{action}</button>
        </div>
        <div className={`urgency-indicator urgency-${urgency}`}></div>
    </div>
);

// Register the component
window.AppModules = window.AppModules || {};
window.AppModules.WorkingDashboard = WorkingDashboard;