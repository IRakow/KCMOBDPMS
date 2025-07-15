const AdminPortalV3 = ({ user, onLogout }) => {
    const [activePage, setActivePage] = React.useState('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    const [dashboardMounted, setDashboardMounted] = React.useState(false);
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [silenceMode, setSilenceMode] = React.useState(() => {
        // Load silence mode preference from localStorage
        return localStorage.getItem('silenceMode') === 'true';
    });
    
    React.useEffect(() => {
        console.log('AdminPortalV3 - activePage changed to:', activePage);
        if (activePage === 'dashboard') {
            setDashboardMounted(true);
        }
    }, [activePage]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.user-menu-v2')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu]);

    React.useEffect(() => {
        // Save silence mode preference and broadcast to all components
        localStorage.setItem('silenceMode', silenceMode);
        window.silenceMode = silenceMode;
        window.dispatchEvent(new CustomEvent('silenceModeChanged', { detail: silenceMode }));
    }, [silenceMode]);

    // Add keyboard shortcut for silence mode (Ctrl/Cmd + Shift + S)
    React.useEffect(() => {
        const handleKeyPress = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                setSilenceMode(prev => !prev);
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => document.removeEventListener('keydown', handleKeyPress);
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-home' },
        { id: 'leads', label: 'Lead Management', icon: 'fa-user-plus' },
        { id: 'ai-insights', label: 'AI Insights', icon: 'fa-robot' },
        { id: 'properties', label: 'Properties', icon: 'fa-building' },
        { id: 'units', label: 'Units', icon: 'fa-door-open' },
        { id: 'tenants', label: 'Tenants', icon: 'fa-users' },
        { id: 'leases', label: 'Leases', icon: 'fa-file-contract' },
        { id: 'owner-portal', label: 'Owner Portal', icon: 'fa-crown' },
        { id: 'messaging', label: 'Messages', icon: 'fa-comments' },
        { id: 'calendar', label: 'Calendar', icon: 'fa-calendar-alt' },
        { id: 'maintenance', label: 'Maintenance', icon: 'fa-wrench' },
        { id: 'accounting', label: 'Accounting', icon: 'fa-calculator' },
        { id: 'reports', label: 'Reports', icon: 'fa-chart-bar' },
    ];

    const renderContent = () => {
        switch (activePage) {
            case 'dashboard':
                return <SimpleDashboard user={user} />;
            case 'leads':
                return React.createElement((window.AppModules && window.AppModules.LeadManagementSystem) || (() => React.createElement('div', {}, 'Lead Management System loading...')));
            case 'ai-insights':
                return React.createElement((window.AppModules && window.AppModules.AIDashboard) || (() => React.createElement('div', {}, 'AI Dashboard loading...')));
            case 'properties':
                return React.createElement((window.AppModules && window.AppModules.PropertiesFixed) || (() => React.createElement('div', {}, 'PropertiesFixed component not loaded')));
            case 'units':
                return React.createElement((window.AppModules && window.AppModules.UnitsWorldClass) || (() => React.createElement('div', {}, 'Units component not loaded')));
            case 'tenants':
                return React.createElement((window.AppModules && window.AppModules.Tenants) || (() => React.createElement('div', {}, 'Tenants component not loaded')));
            case 'leases':
                return React.createElement((window.AppModules && window.AppModules.Leases) || (() => React.createElement('div', {}, 'Leases component not loaded')));
            case 'owner-portal':
                return React.createElement((window.AppModules && window.AppModules.OwnerPortal) || (() => React.createElement('div', {}, 'Owner Portal loading...')));
            case 'messaging':
                return React.createElement((window.AppModules && window.AppModules.GmailClone) || (() => React.createElement('div', {}, 'Mail component not loaded')));
            case 'calendar':
                return React.createElement((window.AppModules && window.AppModules.SimpleCalendar) || (() => React.createElement('div', {}, 'Calendar component not loaded')));
            case 'maintenance':
                return React.createElement((window.AppModules && window.AppModules.MaintenanceEcosystemPro) || (() => React.createElement('div', {}, 'Maintenance component not loaded')));
            case 'accounting':
                return React.createElement((window.AppModules && window.AppModules.FinancialAccountingEngine) || (() => React.createElement('div', {}, 'Accounting component not loaded')));
            case 'reports':
                return React.createElement((window.AppModules && window.AppModules.ReportsCenter) || (() => React.createElement('div', {}, 'Reports component not loaded')));
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
            
            {/* Silence Mode Indicator */}
            {React.createElement((window.AppModules && window.AppModules.SilenceModeIndicator) || (() => null))}
            
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
                    // All other pages use the standard layout with topbar
                    <>
                        {/* Top Navigation - Always show for non-dashboard pages */}
                        <header className="topbar-v2">
                            <div className="topbar-left">
                                <SearchBar placeholder="Search properties, tenants, payments..." />
                            </div>
                            
                            {/* Property Switcher */}
                            {React.createElement(
                                (window.AppModules && window.AppModules.PropertySwitcher) || (() => null),
                                {
                                    currentProperty: window.currentProperty || 'all',
                                    onPropertyChange: (propertyId) => {
                                        window.currentProperty = propertyId;
                                        // Trigger re-render of components that need property context
                                        window.dispatchEvent(new CustomEvent('propertyChanged', { detail: propertyId }));
                                    }
                                }
                            )}
                            
                            <div className="topbar-right">
                                <button className="topbar-button">
                                    {window.AppModules && window.AppModules.Icons ? 
                                        React.createElement(window.AppModules.Icons.Plus) : 
                                        React.createElement('i', { className: 'fas fa-plus' })
                                    }
                                    <span>New</span>
                                </button>
                                
                                <button className="icon-button-v2">
                                    {window.AppModules && window.AppModules.Icons ? 
                                        React.createElement(window.AppModules.Icons.Bell) : 
                                        React.createElement('i', { className: 'fas fa-bell' })
                                    }
                                    <span className="notification-badge">3</span>
                                </button>
                                
                                <div className="user-menu-v2" onClick={() => setShowUserMenu(!showUserMenu)}>
                                    <img 
                                        src={`https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=1e40af&color=fff`} 
                                        alt="User avatar" 
                                        className="user-avatar"
                                    />
                                    <div className="user-info">
                                        <div className="user-name">{user.first_name} {user.last_name}</div>
                                        <div className="user-role">Super Admin</div>
                                    </div>
                                    {window.AppModules && window.AppModules.Icons ? 
                                        React.createElement(window.AppModules.Icons.ChevronDown) : 
                                        React.createElement('i', { className: 'fas fa-chevron-down' })
                                    }
                                    
                                    {showUserMenu && (
                                        <div className="user-dropdown">
                                            <div className="dropdown-item" onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Profile clicked');
                                            }}>
                                                <i className="fas fa-user"></i>
                                                <span>Profile</span>
                                            </div>
                                            <div className="dropdown-item" onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Settings clicked');
                                            }}>
                                                <i className="fas fa-cog"></i>
                                                <span>Settings</span>
                                            </div>
                                            <div className="dropdown-item" onClick={(e) => {
                                                e.stopPropagation();
                                                setSilenceMode(!silenceMode);
                                            }}>
                                                <i className={`fas fa-volume-${silenceMode ? 'mute' : 'up'}`}></i>
                                                <span>
                                                    {silenceMode ? 'Enable Voice Mode' : 'Enable Silence Mode'}
                                                </span>
                                                <div style={{
                                                    marginLeft: 'auto',
                                                    width: '40px',
                                                    height: '20px',
                                                    backgroundColor: silenceMode ? '#ef4444' : '#10b981',
                                                    borderRadius: '10px',
                                                    position: 'relative',
                                                    transition: 'background-color 0.3s',
                                                    cursor: 'pointer'
                                                }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '2px',
                                                        left: silenceMode ? '2px' : '20px',
                                                        width: '16px',
                                                        height: '16px',
                                                        backgroundColor: 'white',
                                                        borderRadius: '50%',
                                                        transition: 'left 0.3s',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                                                    }}></div>
                                                </div>
                                            </div>
                                            <div className="dropdown-divider"></div>
                                            <div className="dropdown-item logout" onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Are you sure you want to logout?')) {
                                                    onLogout();
                                                }
                                            }}>
                                                <i className="fas fa-sign-out-alt"></i>
                                                <span>Logout</span>
                                            </div>
                                        </div>
                                    )}
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
                                        {window.AppModules && window.AppModules.Icons ? 
                                            React.createElement(window.AppModules.Icons.Filter) : 
                                            React.createElement('i', { className: 'fas fa-filter' })
                                        }
                                        Filter
                                    </button>
                                    <button className="secondary-button">
                                        {window.AppModules && window.AppModules.Icons ? 
                                            React.createElement(window.AppModules.Icons.Download) : 
                                            React.createElement('i', { className: 'fas fa-download' })
                                        }
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