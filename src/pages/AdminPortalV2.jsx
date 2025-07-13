const AdminPortalV2 = ({ user, onLogout }) => {
    const [activePage, setActivePage] = React.useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [notifications, setNotifications] = React.useState(3);

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: Icons.Dashboard
        },
        {
            id: 'management',
            label: 'Management',
            icon: Icons.Building,
            children: [
                { id: 'properties', label: 'Properties' },
                { id: 'leads', label: 'Leads' },
                { id: 'applications', label: 'Applications' },
                { id: 'leases', label: 'Leases' },
                { id: 'users', label: 'Users' }
            ]
        },
        {
            id: 'marketing',
            label: 'Marketing',
            icon: Icons.Megaphone,
            children: [
                { id: 'campaigns', label: 'Marketing' },
                { id: 'listings', label: 'Listings' }
            ]
        },
        {
            id: 'operations',
            label: 'Operations',
            icon: Icons.Settings,
            children: [
                { id: 'messages', label: 'Messages' },
                { id: 'maintenance', label: 'Maintenance' },
                { id: 'payments', label: 'Payments' },
                { id: 'documents', label: 'Documents' }
            ]
        },
        {
            id: 'community',
            label: 'Community',
            icon: Icons.People,
            children: [
                { id: 'announcements', label: 'Announcements' },
                { id: 'contracts', label: 'Contracts' },
                { id: 'vendors', label: 'Vendors' }
            ]
        },
        {
            id: 'financial',
            label: 'Financial',
            icon: Icons.Dollar,
            children: [
                { id: 'accounting', label: 'Accounting' },
                { id: 'general-ledger', label: 'General Ledger' },
                { id: 'chart-of-accounts', label: 'Chart of Accounts' },
                { id: 'tenant-billing', label: 'Tenant Billing' },
                { id: 'bank-reconciliation', label: 'Bank Reconciliation' },
                { id: 'financial-reports', label: 'Financial Reports' }
            ]
        },
        {
            id: 'security',
            label: 'Security & Compliance',
            icon: Icons.Shield,
            children: [
                { id: 'permissions', label: 'Permissions' },
                { id: 'audit-logs', label: 'Audit Logs' }
            ]
        }
    ];

    const renderDashboard = () => (
        <>
            <div className="dashboard-metrics">
                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Total Properties</span>
                        <span className="metric-trend positive">+12.5%</span>
                    </div>
                    <div className="metric-value">156</div>
                    <div className="metric-subtitle">Active properties</div>
                </div>
                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Occupancy Rate</span>
                        <span className="metric-trend positive">+3.2%</span>
                    </div>
                    <div className="metric-value">89%</div>
                    <div className="metric-subtitle">1,108 of 1,245 units</div>
                </div>
                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Monthly Revenue</span>
                        <span className="metric-trend positive">+8.1%</span>
                    </div>
                    <div className="metric-value">$2.4M</div>
                    <div className="metric-subtitle">Collected this month</div>
                </div>
                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Active Leases</span>
                        <span className="metric-trend negative">-2.3%</span>
                    </div>
                    <div className="metric-value">1,248</div>
                    <div className="metric-subtitle">12 expiring soon</div>
                </div>
            </div>

            <div className="dashboard-grid-2">
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Recent Activity</h3>
                        <button className="text-button">View all</button>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon new">
                                <Icons.Plus />
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">New lease signed</div>
                                <div className="activity-subtitle">Unit 4B at Sunset Apartments</div>
                            </div>
                            <div className="activity-time">2 min ago</div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon payment">
                                <Icons.Dollar />
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">Payment received</div>
                                <div className="activity-subtitle">$1,850 from John Doe</div>
                            </div>
                            <div className="activity-time">1 hour ago</div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon maintenance">
                                <Icons.Wrench />
                            </div>
                            <div className="activity-content">
                                <div className="activity-title">Maintenance completed</div>
                                <div className="activity-subtitle">HVAC repair at Building C</div>
                            </div>
                            <div className="activity-time">3 hours ago</div>
                        </div>
                    </div>
                </div>
                
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Quick Stats</h3>
                        <button className="text-button">Customize</button>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-label">Applications</div>
                            <div className="stat-value">23</div>
                            <div className="stat-subtext">Pending review</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Maintenance</div>
                            <div className="stat-value">18</div>
                            <div className="stat-subtext">Open requests</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Messages</div>
                            <div className="stat-value">47</div>
                            <div className="stat-subtext">Unread</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Overdue</div>
                            <div className="stat-value">$24.8K</div>
                            <div className="stat-subtext">12 tenants</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="admin-v2">
            {/* Premium Sidebar */}
            <aside className={`sidebar-v2 ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header-v2">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                                <rect width="48" height="48" rx="10" fill="var(--color-blue-600)" />
                                <path d="M24 12L12 20V36H20V28H28V36H36V20L24 12Z" fill="white" />
                            </svg>
                        </div>
                        {!sidebarCollapsed && <span className="logo-text">PropertyPro</span>}
                    </div>
                </div>

                <nav className="sidebar-nav-v2">
                    <SidebarV2 
                        menuItems={menuItems}
                        activePage={activePage}
                        onPageChange={setActivePage}
                        collapsed={sidebarCollapsed}
                    />
                </nav>

                <div className="sidebar-footer-v2">
                    <button 
                        className="collapse-button"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d={sidebarCollapsed ? "M10 4L6 8L10 12" : "M6 4L10 8L6 12"} 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-v2">
                {/* Top Navigation */}
                <header className="topbar-v2">
                    <div className="topbar-left">
                        <SearchBar placeholder="Search properties, tenants, payments..." />
                    </div>
                    
                    <div className="topbar-right">
                        <button className="topbar-button">
                            <Icons.Plus />
                            <span>New</span>
                        </button>
                        
                        <button className="icon-button-v2">
                            <Icons.Bell />
                            {notifications > 0 && <span className="notification-badge">{notifications}</span>}
                        </button>
                        
                        <div className="user-menu-v2">
                            <img 
                                src={`https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=1e40af&color=fff`} 
                                alt="User avatar" 
                                className="user-avatar"
                            />
                            <div className="user-info">
                                <div className="user-name">{user.first_name} {user.last_name}</div>
                                <div className="user-role">Super Admin</div>
                            </div>
                            <Icons.ChevronDown />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="content-v2">
                    <div className="page-header-v2">
                        <h1 className="page-title-v2">
                            {activePage === 'dashboard' ? 'Dashboard' : 'Page Content'}
                        </h1>
                        <div className="page-actions">
                            <button className="secondary-button">
                                <Icons.Filter />
                                Filter
                            </button>
                            <button className="secondary-button">
                                <Icons.Download />
                                Export
                            </button>
                        </div>
                    </div>

                    <div className="page-content-v2">
                        {activePage === 'dashboard' ? renderDashboard() : (
                            <div className="content-placeholder">
                                <p>{activePage} content will be displayed here</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};