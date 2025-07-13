const AdminPortalV3 = ({ user, onLogout }) => {
    const [activePage, setActivePage] = React.useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [dashboardMounted, setDashboardMounted] = React.useState(false);
    
    React.useEffect(() => {
        console.log('AdminPortalV3 - activePage changed to:', activePage);
        if (activePage === 'dashboard') {
            setDashboardMounted(true);
        }
    }, [activePage]);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
        { id: 'ai-insights', label: 'AI Insights', icon: 'fa-robot' },
        { id: 'properties', label: 'Properties', icon: 'fa-building' },
        { id: 'units', label: 'Units', icon: 'fa-door-open' },
        { id: 'tenants', label: 'Tenants', icon: 'fa-users' },
        { id: 'leases', label: 'Leases', icon: 'fa-file-contract' },
        { id: 'messaging', label: 'Messages', icon: 'fa-comments' },
        { id: 'calendar', label: 'Quantum Calendar', icon: 'fa-calendar-alt' },
        { id: 'maintenance', label: 'Maintenance', icon: 'fa-wrench' },
        { id: 'accounting', label: 'Accounting', icon: 'fa-calculator' },
        { id: 'reports', label: 'Reports', icon: 'fa-chart-bar' },
    ];

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <SimpleDashboard user={user} />;
            case 'ai-insights':
                return React.createElement((window.AppModules && window.AppModules.AIDashboard) || (() => React.createElement('div', {}, 'AI Dashboard loading...')));
            case 'properties':
                return React.createElement((window.AppModules && window.AppModules.PropertiesFixed) || (() => React.createElement('div', {}, 'PropertiesFixed component not loaded')));
            case 'units':
                return React.createElement((window.AppModules && window.AppModules.Units) || (() => React.createElement('div', {}, 'Units component not loaded')));
            case 'tenants':
                return React.createElement((window.AppModules && window.AppModules.Tenants) || (() => React.createElement('div', {}, 'Tenants component not loaded')));
            case 'leases':
                return React.createElement((window.AppModules && window.AppModules.Leases) || (() => React.createElement('div', {}, 'Leases component not loaded')));
            case 'messaging':
                return React.createElement((window.AppModules && window.AppModules.ProfessionalMail) || (() => React.createElement('div', {}, 'Mail component not loaded')));
            case 'calendar':
                return React.createElement((window.AppModules && window.AppModules.QuantumCalendar) || (() => React.createElement('div', {}, 'Calendar component not loaded')));
            case 'maintenance':
                return React.createElement((window.AppModules && window.AppModules.Maintenance) || (() => React.createElement('div', {}, 'Maintenance component not loaded')));
            case 'accounting':
                return React.createElement((window.AppModules && window.AppModules.Accounting) || (() => React.createElement('div', {}, 'Accounting component not loaded')));
            case 'reports':
                return React.createElement((window.AppModules && window.AppModules.Reports) || (() => React.createElement('div', {}, 'Reports component not loaded')));
            default:
                return (
                    <div className="page-content-v2">
                        <div className="content-placeholder">
                            <h2>{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h2>
                            <p>This page is under construction. Features will be added soon.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="admin-v2">
            {/* AI Assistant Floating Button - Available on all pages */}
            {React.createElement((window.AppModules && window.AppModules.AIAssistant) || (() => null))}
            
            {/* Sidebar */}
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
                        onPageChange={(newPage) => {
                            console.log('Sidebar changing page from', activePage, 'to', newPage);
                            setActivePage(newPage);
                        }}
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
                {activePage === 'dashboard' ? (
                    // Dashboard has its own layout, render it directly
                    renderContent()
                ) : (
                    // Other pages use the standard layout with topbar
                    <>
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
                                    <span className="notification-badge">3</span>
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
                                    {activePage}
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
                            {renderContent()}
                        </main>
                    </>
                )}
            </div>
        </div>
    );
};