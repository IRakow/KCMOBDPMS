// LeasingSystem.jsx - Enterprise Leasing Management System
const LeasingSystem = () => {
    const [activeSection, setActiveSection] = React.useState('dashboard');
    const [activeSub, setActiveSub] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [globalFilter, setGlobalFilter] = React.useState('all');
    
    // Navigation structure matching the requirements
    const navigation = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'fa-chart-pie',
            color: '#6366f1',
            description: 'Overview & Critical Alerts'
        },
        {
            id: 'active-leases',
            label: 'Active Leases',
            icon: 'fa-file-contract',
            color: '#059669',
            description: '1,247 Active',
            badge: '247',
            subMenu: [
                { id: 'all-leases', label: 'All Leases', count: 1247 },
                { id: 'by-property', label: 'By Property', count: 15 },
                { id: 'by-status', label: 'By Status' },
                { id: 'expiring-soon', label: 'Expiring Soon', count: 23, urgent: true },
                { id: 'month-to-month', label: 'Month-to-Month', count: 45 }
            ]
        },
        {
            id: 'applications',
            label: 'Applications',
            icon: 'fa-user-plus',
            color: '#dc2626',
            description: '89 Pending',
            badge: '89',
            subMenu: [
                { id: 'new-applications', label: 'New Applications', count: 23, urgent: true },
                { id: 'in-screening', label: 'In Screening', count: 34 },
                { id: 'approved-pending', label: 'Approved/Pending', count: 18 },
                { id: 'waitlist', label: 'Waitlist', count: 12 },
                { id: 'archived-denied', label: 'Archived/Denied', count: 156 }
            ]
        },
        {
            id: 'operations',
            label: 'Lease Operations',
            icon: 'fa-cogs',
            color: '#7c3aed',
            description: 'Create & Manage',
            subMenu: [
                { id: 'create-lease', label: 'Create New Lease', action: true },
                { id: 'renewals', label: 'Renewals', count: 67, subItems: [
                    { id: 'eligible-renewal', label: 'Eligible for Renewal', count: 45 },
                    { id: 'offers-sent', label: 'Renewal Offers Sent', count: 12 },
                    { id: 'renewals-progress', label: 'Renewals in Progress', count: 8 },
                    { id: 'renewal-history', label: 'Renewal History' }
                ]},
                { id: 'transfers', label: 'Transfers', count: 5 },
                { id: 'modifications', label: 'Lease Modifications', count: 12 },
                { id: 'terminations', label: 'Early Terminations', count: 3 }
            ]
        },
        {
            id: 'documents',
            label: 'Documents',
            icon: 'fa-folder',
            color: '#ea580c',
            description: 'Templates & Forms',
            subMenu: [
                { id: 'lease-templates', label: 'Lease Templates', count: 12 },
                { id: 'addendums', label: 'Addendums Library', count: 45 },
                { id: 'notices', label: 'Notices & Letters', count: 78 },
                { id: 'applications-forms', label: 'Application Forms', count: 8 },
                { id: 'checklists', label: 'Move-in/out Checklists', count: 15 }
            ]
        },
        {
            id: 'tenants',
            label: 'Tenant Management',
            icon: 'fa-users',
            color: '#0891b2',
            description: '1,247 Tenants',
            subMenu: [
                { id: 'all-tenants', label: 'All Tenants', count: 1247 },
                { id: 'tenant-profiles', label: 'Tenant Profiles' },
                { id: 'emergency-contacts', label: 'Emergency Contacts' },
                { id: 'tenant-documents', label: 'Tenant Documents' },
                { id: 'communication-history', label: 'Communication History' }
            ]
        },
        {
            id: 'compliance',
            label: 'Compliance',
            icon: 'fa-shield-alt',
            color: '#be185d',
            description: 'Notices & Legal',
            subMenu: [
                { id: 'disclosures', label: 'Required Disclosures' },
                { id: 'notice-generator', label: 'Notice Generator', subItems: [
                    { id: 'rent-increase', label: 'Rent Increase Notice' },
                    { id: 'non-renewal', label: 'Non-renewal Notice' },
                    { id: 'lease-violation', label: 'Lease Violation Notice' },
                    { id: 'entry-notice', label: 'Entry Notice' },
                    { id: 'custom-notice', label: 'Custom Notice' }
                ]},
                { id: 'sent-notices', label: 'Sent Notices', count: 234 },
                { id: 'compliance-calendar', label: 'Compliance Calendar' }
            ]
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: 'fa-chart-bar',
            color: '#059669',
            description: 'Analytics & Insights',
            subMenu: [
                { id: 'rent-roll', label: 'Rent Roll' },
                { id: 'expiration-report', label: 'Lease Expiration Report' },
                { id: 'vacancy-report', label: 'Vacancy Report' },
                { id: 'lease-abstract', label: 'Lease Abstract' },
                { id: 'renewal-analysis', label: 'Renewal Analysis' },
                { id: 'deposit-report', label: 'Deposit Report' },
                { id: 'custom-reports', label: 'Custom Reports' }
            ]
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: 'fa-cog',
            color: '#6b7280',
            description: 'Configuration',
            subMenu: [
                { id: 'lease-templates-settings', label: 'Lease Templates' },
                { id: 'screening-criteria', label: 'Screening Criteria' },
                { id: 'renewal-rules', label: 'Renewal Rules' },
                { id: 'fee-schedule', label: 'Fee Schedule' },
                { id: 'document-settings', label: 'Document Settings' },
                { id: 'notifications', label: 'Notification Preferences' }
            ]
        }
    ];

    const handleNavigation = (sectionId, subId = '') => {
        setActiveSection(sectionId);
        setActiveSub(subId);
    };

    const renderMainContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <LeasingDashboard />;
            case 'active-leases':
                return <ActiveLeases activeSub={activeSub} />;
            case 'applications':
                return <ApplicationsPipeline activeSub={activeSub} />;
            case 'operations':
                return <LeaseOperations activeSub={activeSub} />;
            case 'documents':
                return <DocumentsLibrary activeSub={activeSub} />;
            case 'tenants':
                return <TenantManagement activeSub={activeSub} />;
            case 'compliance':
                return <ComplianceCenter activeSub={activeSub} />;
            case 'reports':
                return <ReportsCenter activeSub={activeSub} />;
            case 'settings':
                return <LeasingSettings activeSub={activeSub} />;
            default:
                return <LeasingDashboard />;
        }
    };

    return (
        <div className="leasing-system">
            {/* Global Header */}
            <div className="leasing-header">
                <div className="header-left">
                    <div className="breadcrumb-nav">
                        <button className="back-btn" onClick={() => window.history.back()}>
                            <i className="fas fa-arrow-left"></i>
                            Back to Portal
                        </button>
                        <span className="breadcrumb-separator">/</span>
                        <span className="current-page">Leasing Management</span>
                    </div>
                    <div className="system-title">
                        <i className="fas fa-home-heart"></i>
                        <h1>Leasing Management</h1>
                        <span className="system-subtitle">Enterprise Property Leasing System</span>
                    </div>
                </div>
                
                <div className="header-center">
                    <div className="global-search">
                        <i className="fas fa-search"></i>
                        <input 
                            type="text"
                            placeholder="Search leases, tenants, applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="search-filters">
                            <button className="filter-btn">
                                <i className="fas fa-filter"></i>
                                Filters
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="header-right">
                    <div className="global-stats">
                        <div className="stat-item">
                            <span className="stat-value">1,247</span>
                            <span className="stat-label">Active Leases</span>
                        </div>
                        <div className="stat-item urgent">
                            <span className="stat-value">23</span>
                            <span className="stat-label">Expiring Soon</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">89</span>
                            <span className="stat-label">Pending Apps</span>
                        </div>
                    </div>
                    
                    <div className="header-actions">
                        <button className="header-btn">
                            <i className="fas fa-plus"></i>
                            Quick Create
                        </button>
                        <button className="header-btn secondary">
                            <i className="fas fa-bell"></i>
                            <span className="notification-dot">5</span>
                        </button>
                        
                        <div className="user-profile-menu">
                            <div className="user-avatar">
                                <i className="fas fa-user-circle"></i>
                            </div>
                            <div className="user-info">
                                <span className="user-name">John Manager</span>
                                <span className="user-role">Property Manager</span>
                            </div>
                            <div className="profile-dropdown">
                                <button className="dropdown-btn">
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                                <div className="dropdown-menu">
                                    <a href="#" className="dropdown-item">
                                        <i className="fas fa-user"></i>
                                        Profile Settings
                                    </a>
                                    <a href="#" className="dropdown-item">
                                        <i className="fas fa-cog"></i>
                                        Preferences
                                    </a>
                                    <div className="dropdown-divider"></div>
                                    <a href="#" className="dropdown-item logout" onClick={() => {
                                        if (confirm('Are you sure you want to log out?')) {
                                            // Handle logout logic here
                                            window.location.href = '/login';
                                        }
                                    }}>
                                        <i className="fas fa-sign-out-alt"></i>
                                        Log Out
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="leasing-layout">
                {/* Enhanced Navigation Sidebar */}
                <div className="leasing-nav">
                    <div className="nav-content">
                        {navigation.map((section) => (
                            <NavigationSection
                                key={section.id}
                                section={section}
                                active={activeSection === section.id}
                                activeSub={activeSub}
                                onNavigate={handleNavigation}
                            />
                        ))}
                    </div>
                    
                    <div className="nav-footer">
                        <div className="system-health">
                            <div className="health-indicator">
                                <div className="health-dot online"></div>
                                <span>System Healthy</span>
                            </div>
                            <div className="last-sync">
                                Last sync: 2 min ago
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="leasing-content">
                    {renderMainContent()}
                </div>
            </div>
        </div>
    );
};

// Enhanced Navigation Section Component
const NavigationSection = ({ section, active, activeSub, onNavigate }) => {
    const [expanded, setExpanded] = React.useState(active);
    
    React.useEffect(() => {
        if (active) setExpanded(true);
    }, [active]);

    return (
        <div className={`nav-section ${active ? 'active' : ''}`}>
            <div 
                className="nav-item main"
                onClick={() => {
                    onNavigate(section.id);
                    setExpanded(!expanded);
                }}
            >
                <div className="nav-icon" style={{color: section.color}}>
                    <i className={`fas ${section.icon}`}></i>
                </div>
                <div className="nav-content">
                    <div className="nav-label">
                        {section.label}
                        {section.badge && (
                            <span className="nav-badge">{section.badge}</span>
                        )}
                    </div>
                    <div className="nav-description">{section.description}</div>
                </div>
                {section.subMenu && (
                    <div className="nav-chevron">
                        <i className={`fas fa-chevron-${expanded ? 'down' : 'right'}`}></i>
                    </div>
                )}
            </div>
            
            {section.subMenu && expanded && (
                <div className="nav-submenu">
                    {section.subMenu.map((sub) => (
                        <SubMenuItem
                            key={sub.id}
                            item={sub}
                            active={activeSub === sub.id}
                            onNavigate={() => onNavigate(section.id, sub.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// Sub Menu Item Component
const SubMenuItem = ({ item, active, onNavigate }) => {
    const [subExpanded, setSubExpanded] = React.useState(false);
    
    return (
        <div className="submenu-item">
            <div 
                className={`nav-subitem ${active ? 'active' : ''} ${item.urgent ? 'urgent' : ''}`}
                onClick={() => {
                    onNavigate();
                    if (item.subItems) setSubExpanded(!subExpanded);
                }}
            >
                <div className="subitem-content">
                    <span className="subitem-label">{item.label}</span>
                    {item.count && (
                        <span className={`subitem-count ${item.urgent ? 'urgent' : ''}`}>
                            {item.count}
                        </span>
                    )}
                    {item.action && (
                        <span className="action-indicator">
                            <i className="fas fa-plus"></i>
                        </span>
                    )}
                </div>
                {item.subItems && (
                    <i className={`fas fa-chevron-${subExpanded ? 'down' : 'right'} sub-chevron`}></i>
                )}
            </div>
            
            {item.subItems && subExpanded && (
                <div className="nav-subsubmenu">
                    {item.subItems.map((subItem) => (
                        <div key={subItem.id} className="nav-subsubitem">
                            <span>{subItem.label}</span>
                            {subItem.count && <span className="count">{subItem.count}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Enterprise Leasing Dashboard Component
const LeasingDashboard = () => {
    const [timeFilter, setTimeFilter] = React.useState('today');
    const [refreshing, setRefreshing] = React.useState(false);
    
    const dashboardStats = {
        todayActivity: {
            newApplications: 12,
            scheduledTours: 18,
            leasesSigned: 5,
            moveIns: 3,
            moveOuts: 2,
            renewalsSent: 8
        },
        criticalAlerts: [
            { id: 1, type: 'urgent', icon: 'fa-exclamation-triangle', title: 'Lease Expiring Today', count: 3, action: 'Review Now' },
            { id: 2, type: 'warning', icon: 'fa-clock', title: 'Pending Applications', count: 23, action: 'Process' },
            { id: 3, type: 'info', icon: 'fa-calendar-check', title: 'Tours Scheduled', count: 18, action: 'View Schedule' }
        ],
        expirationPipeline: {
            next30Days: 45,
            next60Days: 78,
            next90Days: 123,
            renewalRate: 85.4
        },
        recentActivity: [
            { id: 1, type: 'application', tenant: 'Sarah Johnson', property: 'Sunset Apartments', unit: '205', status: 'approved', time: '10 min ago' },
            { id: 2, type: 'lease', tenant: 'Michael Chen', property: 'Downtown Plaza', unit: '1204', status: 'signed', time: '25 min ago' },
            { id: 3, type: 'tour', tenant: 'Emily Davis', property: 'Garden Complex', unit: '302', status: 'scheduled', time: '1 hour ago' },
            { id: 4, type: 'renewal', tenant: 'Robert Wilson', property: 'Sunset Apartments', unit: '108', status: 'sent', time: '2 hours ago' },
            { id: 5, type: 'application', tenant: 'Lisa Anderson', property: 'Downtown Plaza', unit: '715', status: 'screening', time: '3 hours ago' }
        ]
    };
    
    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1500);
    };
    
    return (
        <div className="leasing-dashboard">
            {/* Dashboard Header */}
            <div className="dashboard-header">
                <div className="header-info">
                    <h1>Leasing Dashboard</h1>
                    <p>Real-time overview of your leasing operations</p>
                </div>
                
                <div className="header-controls">
                    <div className="time-filter">
                        <button 
                            className={timeFilter === 'today' ? 'active' : ''}
                            onClick={() => setTimeFilter('today')}
                        >
                            Today
                        </button>
                        <button 
                            className={timeFilter === 'week' ? 'active' : ''}
                            onClick={() => setTimeFilter('week')}
                        >
                            This Week
                        </button>
                        <button 
                            className={timeFilter === 'month' ? 'active' : ''}
                            onClick={() => setTimeFilter('month')}
                        >
                            This Month
                        </button>
                    </div>
                    
                    <button 
                        className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
                        onClick={handleRefresh}
                    >
                        <i className="fas fa-sync-alt"></i>
                        Refresh
                    </button>
                </div>
            </div>
            
            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Today's Activity Cards */}
                <div className="activity-cards">
                    <h2>Today's Activity</h2>
                    <div className="cards-grid">
                        <ActivityCard
                            icon="fa-user-plus"
                            title="New Applications"
                            value={dashboardStats.todayActivity.newApplications}
                            change="+15%"
                            trend="up"
                            color="#6366f1"
                        />
                        <ActivityCard
                            icon="fa-calendar-check"
                            title="Scheduled Tours"
                            value={dashboardStats.todayActivity.scheduledTours}
                            change="+8%"
                            trend="up"
                            color="#059669"
                        />
                        <ActivityCard
                            icon="fa-file-signature"
                            title="Leases Signed"
                            value={dashboardStats.todayActivity.leasesSigned}
                            change="+12%"
                            trend="up"
                            color="#7c3aed"
                        />
                        <ActivityCard
                            icon="fa-key"
                            title="Move-ins"
                            value={dashboardStats.todayActivity.moveIns}
                            change="+0%"
                            trend="neutral"
                            color="#ea580c"
                        />
                        <ActivityCard
                            icon="fa-door-open"
                            title="Move-outs"
                            value={dashboardStats.todayActivity.moveOuts}
                            change="-5%"
                            trend="down"
                            color="#dc2626"
                        />
                        <ActivityCard
                            icon="fa-redo"
                            title="Renewals Sent"
                            value={dashboardStats.todayActivity.renewalsSent}
                            change="+25%"
                            trend="up"
                            color="#0891b2"
                        />
                    </div>
                </div>
                
                {/* Critical Alerts */}
                <div className="critical-alerts">
                    <h2>Critical Alerts</h2>
                    <div className="alerts-list">
                        {dashboardStats.criticalAlerts.map((alert) => (
                            <AlertCard key={alert.id} alert={alert} />
                        ))}
                    </div>
                </div>
                
                {/* Expiration Pipeline */}
                <div className="expiration-pipeline">
                    <h2>Lease Expiration Pipeline</h2>
                    <div className="pipeline-chart">
                        <ExpirationCard
                            period="Next 30 Days"
                            count={dashboardStats.expirationPipeline.next30Days}
                            urgent={true}
                        />
                        <ExpirationCard
                            period="Next 60 Days"
                            count={dashboardStats.expirationPipeline.next60Days}
                            urgent={false}
                        />
                        <ExpirationCard
                            period="Next 90 Days"
                            count={dashboardStats.expirationPipeline.next90Days}
                            urgent={false}
                        />
                        <div className="renewal-rate">
                            <div className="rate-circle">
                                <span className="rate-value">{dashboardStats.expirationPipeline.renewalRate}%</span>
                                <span className="rate-label">Renewal Rate</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Recent Activity Feed */}
                <div className="recent-activity">
                    <h2>Recent Activity</h2>
                    <div className="activity-feed">
                        {dashboardStats.recentActivity.map((activity) => (
                            <ActivityFeedItem key={activity.id} activity={activity} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Activity Card Component
const ActivityCard = ({ icon, title, value, change, trend, color }) => (
    <div className="activity-card">
        <div className="card-icon" style={{ backgroundColor: `${color}20`, color: color }}>
            <i className={`fas ${icon}`}></i>
        </div>
        <div className="card-content">
            <div className="card-value">{value}</div>
            <div className="card-title">{title}</div>
            <div className={`card-change ${trend}`}>
                <i className={`fas fa-arrow-${trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'right'}`}></i>
                {change}
            </div>
        </div>
    </div>
);

// Alert Card Component
const AlertCard = ({ alert }) => (
    <div className={`alert-card ${alert.type}`}>
        <div className="alert-icon">
            <i className={`fas ${alert.icon}`}></i>
        </div>
        <div className="alert-content">
            <div className="alert-title">{alert.title}</div>
            <div className="alert-count">{alert.count} items require attention</div>
        </div>
        <button className="alert-action">
            {alert.action}
            <i className="fas fa-arrow-right"></i>
        </button>
    </div>
);

// Expiration Card Component
const ExpirationCard = ({ period, count, urgent }) => (
    <div className={`expiration-card ${urgent ? 'urgent' : ''}`}>
        <div className="expiration-count">{count}</div>
        <div className="expiration-period">{period}</div>
        {urgent && <div className="urgent-indicator">Urgent</div>}
    </div>
);

// Activity Feed Item Component
const ActivityFeedItem = ({ activity }) => {
    const getActivityIcon = (type) => {
        switch (type) {
            case 'application': return 'fa-user-plus';
            case 'lease': return 'fa-file-contract';
            case 'tour': return 'fa-calendar-check';
            case 'renewal': return 'fa-redo';
            default: return 'fa-circle';
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return '#059669';
            case 'signed': return '#7c3aed';
            case 'scheduled': return '#0891b2';
            case 'sent': return '#ea580c';
            case 'screening': return '#6366f1';
            default: return '#6b7280';
        }
    };
    
    return (
        <div className="activity-item">
            <div className="activity-icon" style={{ backgroundColor: `${getStatusColor(activity.status)}20` }}>
                <i className={`fas ${getActivityIcon(activity.type)}`} style={{ color: getStatusColor(activity.status) }}></i>
            </div>
            <div className="activity-details">
                <div className="activity-main">
                    <span className="tenant-name">{activity.tenant}</span>
                    <span className="activity-description">
                        {activity.type === 'application' && 'submitted application for'}
                        {activity.type === 'lease' && 'signed lease for'}
                        {activity.type === 'tour' && 'scheduled tour for'}
                        {activity.type === 'renewal' && 'renewal offer sent for'}
                    </span>
                </div>
                <div className="activity-location">
                    {activity.property} - Unit {activity.unit}
                </div>
            </div>
            <div className="activity-meta">
                <div className={`activity-status ${activity.status}`}>
                    {activity.status}
                </div>
                <div className="activity-time">{activity.time}</div>
            </div>
        </div>
    );
};

const ActiveLeases = ({ activeSub }) => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedProperty, setSelectedProperty] = React.useState('all');
    const [selectedStatus, setSelectedStatus] = React.useState('all');
    const [sortBy, setSortBy] = React.useState('tenant');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [viewMode, setViewMode] = React.useState('table');
    const [selectedLeases, setSelectedLeases] = React.useState([]);
    
    // Sample lease data
    const allLeases = [
        {
            id: 'L001',
            tenant: 'Sarah Johnson',
            property: 'Sunset Apartments',
            unit: '205',
            startDate: '2023-01-15',
            endDate: '2024-01-14',
            rentAmount: 2850,
            status: 'active',
            leaseType: 'fixed',
            daysToExpiry: 42,
            renewalStatus: 'pending',
            lastPayment: '2023-12-01',
            phone: '(555) 123-4567',
            email: 'sarah.j@email.com'
        },
        {
            id: 'L002',
            tenant: 'Michael Chen',
            property: 'Downtown Plaza',
            unit: '1204',
            startDate: '2023-03-01',
            endDate: '2024-02-29',
            rentAmount: 3200,
            status: 'active',
            leaseType: 'fixed',
            daysToExpiry: 89,
            renewalStatus: 'offered',
            lastPayment: '2023-12-01',
            phone: '(555) 234-5678',
            email: 'mchen@email.com'
        },
        {
            id: 'L003',
            tenant: 'Emily Davis',
            property: 'Garden Complex',
            unit: '302',
            startDate: '2022-06-15',
            endDate: '2024-06-14',
            rentAmount: 2650,
            status: 'active',
            leaseType: 'fixed',
            daysToExpiry: 184,
            renewalStatus: 'none',
            lastPayment: '2023-12-01',
            phone: '(555) 345-6789',
            email: 'emily.davis@email.com'
        },
        {
            id: 'L004',
            tenant: 'Robert Wilson',
            property: 'Sunset Apartments',
            unit: '108',
            startDate: '2023-05-01',
            endDate: null,
            rentAmount: 2750,
            status: 'active',
            leaseType: 'month-to-month',
            daysToExpiry: null,
            renewalStatus: 'none',
            lastPayment: '2023-12-01',
            phone: '(555) 456-7890',
            email: 'rwilson@email.com'
        },
        {
            id: 'L005',
            tenant: 'Lisa Anderson',
            property: 'Downtown Plaza',
            unit: '715',
            startDate: '2023-08-15',
            endDate: '2024-08-14',
            rentAmount: 3100,
            status: 'active',
            leaseType: 'fixed',
            daysToExpiry: 256,
            renewalStatus: 'none',
            lastPayment: '2023-12-01',
            phone: '(555) 567-8901',
            email: 'l.anderson@email.com'
        },
        {
            id: 'L006',
            tenant: 'David Kumar',
            property: 'Garden Complex',
            unit: '101',
            startDate: '2023-12-20',
            endDate: '2024-01-05',
            rentAmount: 2550,
            status: 'expiring',
            leaseType: 'fixed',
            daysToExpiry: 3,
            renewalStatus: 'none',
            lastPayment: '2023-12-01',
            phone: '(555) 678-9012',
            email: 'dkumar@email.com'
        }
    ];
    
    const properties = ['All Properties', 'Sunset Apartments', 'Downtown Plaza', 'Garden Complex'];
    const statuses = ['All Statuses', 'Active', 'Expiring Soon', 'Month-to-Month'];
    
    // Filter leases based on active sub-section and search
    const getFilteredLeases = () => {
        let filtered = [...allLeases];
        
        // Apply sub-section filters
        switch (activeSub) {
            case 'by-property':
                if (selectedProperty !== 'all') {
                    filtered = filtered.filter(lease => lease.property === selectedProperty);
                }
                break;
            case 'by-status':
                if (selectedStatus !== 'all') {
                    if (selectedStatus === 'Active') {
                        filtered = filtered.filter(lease => lease.status === 'active');
                    } else if (selectedStatus === 'Expiring Soon') {
                        filtered = filtered.filter(lease => lease.daysToExpiry && lease.daysToExpiry <= 30);
                    } else if (selectedStatus === 'Month-to-Month') {
                        filtered = filtered.filter(lease => lease.leaseType === 'month-to-month');
                    }
                }
                break;
            case 'expiring-soon':
                filtered = filtered.filter(lease => lease.daysToExpiry && lease.daysToExpiry <= 30);
                break;
            case 'month-to-month':
                filtered = filtered.filter(lease => lease.leaseType === 'month-to-month');
                break;
            default:
                // All leases
                break;
        }
        
        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(lease => 
                lease.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lease.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lease.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
                lease.id.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy === 'rentAmount') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        return filtered;
    };
    
    const filteredLeases = getFilteredLeases();
    
    const getSectionTitle = () => {
        switch (activeSub) {
            case 'by-property': return 'Leases by Property';
            case 'by-status': return 'Leases by Status';
            case 'expiring-soon': return 'Expiring Soon';
            case 'month-to-month': return 'Month-to-Month Leases';
            default: return 'All Active Leases';
        }
    };
    
    const handleSelectLease = (leaseId) => {
        setSelectedLeases(prev => 
            prev.includes(leaseId) 
                ? prev.filter(id => id !== leaseId)
                : [...prev, leaseId]
        );
    };
    
    const handleBulkAction = (action) => {
        console.log(`Performing ${action} on leases:`, selectedLeases);
        setSelectedLeases([]);
    };
    
    return (
        <div className="active-leases">
            {/* Section Header */}
            <div className="section-header">
                <div className="header-left">
                    <h1>{getSectionTitle()}</h1>
                    <p>{filteredLeases.length} lease{filteredLeases.length !== 1 ? 's' : ''} found</p>
                </div>
                
                <div className="header-actions">
                    <button className="action-btn primary">
                        <i className="fas fa-plus"></i>
                        Create Lease
                    </button>
                    <button className="action-btn secondary">
                        <i className="fas fa-download"></i>
                        Export
                    </button>
                </div>
            </div>
            
            {/* Filters and Search */}
            <div className="filters-section">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <i className="fas fa-search"></i>
                        <input
                            type="text"
                            placeholder="Search by tenant, property, unit, or lease ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button 
                                className="clear-search"
                                onClick={() => setSearchQuery('')}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="filter-controls">
                    {(activeSub === 'by-property' || activeSub === 'all-leases') && (
                        <select 
                            value={selectedProperty} 
                            onChange={(e) => setSelectedProperty(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Properties</option>
                            <option value="Sunset Apartments">Sunset Apartments</option>
                            <option value="Downtown Plaza">Downtown Plaza</option>
                            <option value="Garden Complex">Garden Complex</option>
                        </select>
                    )}
                    
                    {(activeSub === 'by-status' || activeSub === 'all-leases') && (
                        <select 
                            value={selectedStatus} 
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Expiring Soon">Expiring Soon</option>
                            <option value="Month-to-Month">Month-to-Month</option>
                        </select>
                    )}
                    
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                    >
                        <option value="tenant">Sort by Tenant</option>
                        <option value="property">Sort by Property</option>
                        <option value="unit">Sort by Unit</option>
                        <option value="rentAmount">Sort by Rent</option>
                        <option value="endDate">Sort by End Date</option>
                    </select>
                    
                    <button 
                        className="sort-order-btn"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                        <i className={`fas fa-sort-amount-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
                    </button>
                    
                    <div className="view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            <i className="fas fa-table"></i>
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <i className="fas fa-th"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedLeases.length > 0 && (
                <div className="bulk-actions">
                    <div className="selection-info">
                        <span>{selectedLeases.length} lease{selectedLeases.length !== 1 ? 's' : ''} selected</span>
                        <button onClick={() => setSelectedLeases([])} className="clear-selection">
                            Clear Selection
                        </button>
                    </div>
                    <div className="bulk-action-buttons">
                        <button onClick={() => handleBulkAction('renew')} className="bulk-btn">
                            <i className="fas fa-redo"></i>
                            Send Renewals
                        </button>
                        <button onClick={() => handleBulkAction('notice')} className="bulk-btn">
                            <i className="fas fa-envelope"></i>
                            Send Notice
                        </button>
                        <button onClick={() => handleBulkAction('export')} className="bulk-btn">
                            <i className="fas fa-download"></i>
                            Export Selected
                        </button>
                    </div>
                </div>
            )}
            
            {/* Leases Content */}
            <div className="leases-content">
                {viewMode === 'table' ? (
                    <LeaseTable 
                        leases={filteredLeases}
                        selectedLeases={selectedLeases}
                        onSelectLease={handleSelectLease}
                        onSelectAll={(selectAll) => {
                            setSelectedLeases(selectAll ? filteredLeases.map(l => l.id) : []);
                        }}
                    />
                ) : (
                    <LeaseGrid 
                        leases={filteredLeases}
                        selectedLeases={selectedLeases}
                        onSelectLease={handleSelectLease}
                    />
                )}
            </div>
        </div>
    );
};

const ApplicationsPipeline = ({ activeSub }) => (
    <div className="content-placeholder">
        <h2>Applications & Prospects</h2>
        <p>Active section: {activeSub || 'new-applications'}</p>
    </div>
);

const LeaseOperations = ({ activeSub }) => (
    <div className="content-placeholder">
        <h2>Lease Operations</h2>
        <p>Active section: {activeSub || 'create-lease'}</p>
    </div>
);

const DocumentsLibrary = ({ activeSub }) => (
    <div className="content-placeholder">
        <h2>Documents Library</h2>
        <p>Active section: {activeSub || 'lease-templates'}</p>
    </div>
);

const TenantManagement = ({ activeSub }) => (
    <div className="content-placeholder">
        <h2>Tenant Management</h2>
        <p>Active section: {activeSub || 'all-tenants'}</p>
    </div>
);

const ComplianceCenter = ({ activeSub }) => (
    <div className="content-placeholder">
        <h2>Compliance Center</h2>
        <p>Active section: {activeSub || 'disclosures'}</p>
    </div>
);

const ReportsCenter = ({ activeSub }) => (
    <div className="content-placeholder">
        <h2>Reports Center</h2>
        <p>Active section: {activeSub || 'rent-roll'}</p>
    </div>
);

const LeasingSettings = ({ activeSub }) => (
    <div className="content-placeholder">
        <h2>Leasing Settings</h2>
        <p>Active section: {activeSub || 'lease-templates-settings'}</p>
    </div>
);

// Lease Table Component
const LeaseTable = ({ leases, selectedLeases, onSelectLease, onSelectAll }) => {
    const formatCurrency = (amount) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };
    
    const getStatusBadge = (lease) => {
        if (lease.daysToExpiry && lease.daysToExpiry <= 7) {
            return <span className="status-badge urgent">Expiring Soon</span>;
        } else if (lease.daysToExpiry && lease.daysToExpiry <= 30) {
            return <span className="status-badge warning">Expires Soon</span>;
        } else if (lease.leaseType === 'month-to-month') {
            return <span className="status-badge info">Month-to-Month</span>;
        } else {
            return <span className="status-badge success">Active</span>;
        }
    };
    
    const getRenewalBadge = (status) => {
        switch (status) {
            case 'pending':
                return <span className="renewal-badge pending">Renewal Pending</span>;
            case 'offered':
                return <span className="renewal-badge offered">Offer Sent</span>;
            default:
                return null;
        }
    };
    
    return (
        <div className="lease-table-container">
            <table className="lease-table">
                <thead>
                    <tr>
                        <th className="checkbox-col">
                            <input
                                type="checkbox"
                                checked={selectedLeases.length === leases.length && leases.length > 0}
                                onChange={(e) => onSelectAll(e.target.checked)}
                                className="table-checkbox"
                            />
                        </th>
                        <th>Tenant</th>
                        <th>Property & Unit</th>
                        <th>Lease Term</th>
                        <th>Rent Amount</th>
                        <th>Status</th>
                        <th>Renewal</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leases.map((lease) => (
                        <tr key={lease.id} className={selectedLeases.includes(lease.id) ? 'selected' : ''}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedLeases.includes(lease.id)}
                                    onChange={() => onSelectLease(lease.id)}
                                    className="table-checkbox"
                                />
                            </td>
                            <td>
                                <div className="tenant-info">
                                    <div className="tenant-name">{lease.tenant}</div>
                                    <div className="tenant-contact">
                                        <span>{lease.phone}</span>
                                        <span>{lease.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="property-info">
                                    <div className="property-name">{lease.property}</div>
                                    <div className="unit-number">Unit {lease.unit}</div>
                                </div>
                            </td>
                            <td>
                                <div className="lease-term">
                                    <div className="start-date">Start: {formatDate(lease.startDate)}</div>
                                    <div className="end-date">
                                        {lease.endDate ? `End: ${formatDate(lease.endDate)}` : 'Month-to-Month'}
                                    </div>
                                    {lease.daysToExpiry && (
                                        <div className={`days-remaining ${lease.daysToExpiry <= 30 ? 'urgent' : ''}`}>
                                            {lease.daysToExpiry} days remaining
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td>
                                <div className="rent-amount">{formatCurrency(lease.rentAmount)}</div>
                                <div className="last-payment">Last: {formatDate(lease.lastPayment)}</div>
                            </td>
                            <td>
                                {getStatusBadge(lease)}
                            </td>
                            <td>
                                {getRenewalBadge(lease.renewalStatus)}
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button className="action-btn-sm view" title="View Lease">
                                        <i className="fas fa-eye"></i>
                                    </button>
                                    <button className="action-btn-sm edit" title="Edit Lease">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="action-btn-sm more" title="More Actions">
                                        <i className="fas fa-ellipsis-v"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {leases.length === 0 && (
                <div className="empty-state">
                    <i className="fas fa-file-contract"></i>
                    <h3>No leases found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
};

// Lease Grid Component
const LeaseGrid = ({ leases, selectedLeases, onSelectLease }) => {
    const formatCurrency = (amount) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };
    
    return (
        <div className="lease-grid">
            {leases.map((lease) => (
                <div 
                    key={lease.id} 
                    className={`lease-card ${selectedLeases.includes(lease.id) ? 'selected' : ''}`}
                >
                    <div className="card-header">
                        <input
                            type="checkbox"
                            checked={selectedLeases.includes(lease.id)}
                            onChange={() => onSelectLease(lease.id)}
                            className="card-checkbox"
                        />
                        <div className="lease-id">#{lease.id}</div>
                    </div>
                    
                    <div className="card-content">
                        <div className="tenant-section">
                            <h3 className="tenant-name">{lease.tenant}</h3>
                            <div className="contact-info">
                                <span className="phone">{lease.phone}</span>
                                <span className="email">{lease.email}</span>
                            </div>
                        </div>
                        
                        <div className="property-section">
                            <div className="property-name">{lease.property}</div>
                            <div className="unit-info">Unit {lease.unit}</div>
                        </div>
                        
                        <div className="financial-section">
                            <div className="rent-amount">{formatCurrency(lease.rentAmount)}/month</div>
                            <div className="last-payment">Last payment: {formatDate(lease.lastPayment)}</div>
                        </div>
                        
                        <div className="lease-details">
                            <div className="lease-term">
                                <span>Start: {formatDate(lease.startDate)}</span>
                                <span>
                                    {lease.endDate ? `End: ${formatDate(lease.endDate)}` : 'Month-to-Month'}
                                </span>
                            </div>
                            {lease.daysToExpiry && (
                                <div className={`expiry-warning ${lease.daysToExpiry <= 30 ? 'urgent' : ''}`}>
                                    <i className="fas fa-clock"></i>
                                    {lease.daysToExpiry} days remaining
                                </div>
                            )}
                        </div>
                        
                        <div className="status-section">
                            {lease.daysToExpiry && lease.daysToExpiry <= 7 && (
                                <span className="status-badge urgent">Expiring Soon</span>
                            )}
                            {lease.daysToExpiry && lease.daysToExpiry > 7 && lease.daysToExpiry <= 30 && (
                                <span className="status-badge warning">Expires Soon</span>
                            )}
                            {lease.leaseType === 'month-to-month' && (
                                <span className="status-badge info">Month-to-Month</span>
                            )}
                            {(!lease.daysToExpiry || lease.daysToExpiry > 30) && lease.leaseType !== 'month-to-month' && (
                                <span className="status-badge success">Active</span>
                            )}
                            
                            {lease.renewalStatus === 'pending' && (
                                <span className="renewal-badge pending">Renewal Pending</span>
                            )}
                            {lease.renewalStatus === 'offered' && (
                                <span className="renewal-badge offered">Offer Sent</span>
                            )}
                        </div>
                    </div>
                    
                    <div className="card-actions">
                        <button className="card-action-btn primary">
                            <i className="fas fa-eye"></i>
                            View Details
                        </button>
                        <button className="card-action-btn secondary">
                            <i className="fas fa-edit"></i>
                            Edit
                        </button>
                        <button className="card-action-btn secondary">
                            <i className="fas fa-ellipsis-h"></i>
                            More
                        </button>
                    </div>
                </div>
            ))}
            
            {leases.length === 0 && (
                <div className="empty-state">
                    <i className="fas fa-file-contract"></i>
                    <h3>No leases found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
};

// Register component globally
if (typeof window !== 'undefined') {
    window.AppModules = window.AppModules || {};
    window.AppModules.LeasingSystem = LeasingSystem;
}