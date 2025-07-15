const App = () => {
    const [currentPage, setCurrentPage] = React.useState('login');
    const [user, setUser] = React.useState(null);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const [silenceMode, setSilenceMode] = React.useState(() => {
        return localStorage.getItem('silenceMode') === 'true';
    });

    React.useEffect(() => {
        const unsubscribe = window.authManager.subscribe(setUser);
        window.authManager.checkAuth();
        return unsubscribe;
    }, []);

    React.useEffect(() => {
        const path = window.location.pathname;
        if (path === '/' || path === '/login') {
            setCurrentPage('login');
        } else {
            setCurrentPage(path.slice(1));
        }
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown && !event.target.closest('.user-dropdown-container')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showDropdown]);

    React.useEffect(() => {
        // Save and broadcast silence mode changes
        localStorage.setItem('silenceMode', silenceMode);
        window.silenceMode = silenceMode;
        window.dispatchEvent(new CustomEvent('silenceModeChanged', { detail: silenceMode }));
    }, [silenceMode]);

    if (currentPage === 'login' && !user) {
        return <Login />;
    }

    if (!user) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh' 
            }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (user.role === 'super_admin') {
        const adminPortal = <AdminPortalV3 user={user} onLogout={() => window.authManager.logout()} />;
        
        // Wrap with PropertyProvider if available
        if (window.AppModules && window.AppModules.PropertyProvider) {
            return React.createElement(window.AppModules.PropertyProvider, {}, adminPortal);
        }
        
        return adminPortal;
    }

    const portalName = user.role.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-alt)' }}>
            <header style={{
                backgroundColor: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                padding: '16px 0'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1 style={{ fontSize: '20px', fontWeight: '600' }}>
                        {portalName} Portal
                    </h1>
                    <div className="user-dropdown-container" style={{ position: 'relative' }}>
                        <div 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s',
                                backgroundColor: showDropdown ? 'var(--color-surface-hover)' : 'transparent'
                            }}
                            onClick={() => setShowDropdown(!showDropdown)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = showDropdown ? 'var(--color-surface-hover)' : 'transparent'}
                        >
                            <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
                                {user.first_name} {user.last_name}
                            </span>
                            <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`} style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}></i>
                        </div>
                        
                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '8px',
                                minWidth: '200px',
                                backgroundColor: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                zIndex: 1000
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderBottom: '1px solid var(--color-border)',
                                    fontSize: '12px',
                                    color: 'var(--color-text-secondary)'
                                }}>
                                    {portalName} Portal
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        fontSize: '14px',
                                        color: 'var(--color-text-primary)'
                                    }}
                                    onClick={() => console.log('Profile clicked')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className="fas fa-user" style={{ width: '16px' }}></i>
                                    <span>Profile</span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        fontSize: '14px',
                                        color: 'var(--color-text-primary)'
                                    }}
                                    onClick={() => console.log('Settings clicked')}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className="fas fa-cog" style={{ width: '16px' }}></i>
                                    <span>Settings</span>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        fontSize: '14px',
                                        color: 'var(--color-text-primary)'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSilenceMode(!silenceMode);
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className={`fas fa-volume-${silenceMode ? 'mute' : 'up'}`} style={{ width: '16px' }}></i>
                                    <span>{silenceMode ? 'Enable Voice Mode' : 'Enable Silence Mode'}</span>
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
                                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }}></div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        fontSize: '14px',
                                        color: 'var(--color-error)',
                                        borderRadius: '0 0 8px 8px'
                                    }}
                                    onClick={() => {
                                        if (confirm('Are you sure you want to logout?')) {
                                            window.authManager.logout();
                                        }
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <i className="fas fa-sign-out-alt" style={{ width: '16px' }}></i>
                                    <span>Logout</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
                <Card>
                    <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>
                        Welcome to your {portalName} Portal
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        This portal is currently under construction. Features specific to your role will be added here.
                    </p>
                </Card>
            </main>
        </div>
    );
};