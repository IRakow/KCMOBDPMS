const App = () => {
    const [currentPage, setCurrentPage] = React.useState('login');
    const [user, setUser] = React.useState(null);

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
        return <AdminPortalV3 user={user} onLogout={() => window.authManager.logout()} />;
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                            {user.first_name} {user.last_name}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => window.authManager.logout()}>
                            Sign out
                        </Button>
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