const AdminPortal = ({ user, onLogout }) => {
    const [activePage, setActivePage] = React.useState('dashboard');

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊'
        },
        {
            id: 'management',
            label: 'Management',
            icon: '🏢',
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
            icon: '📣',
            children: [
                { id: 'campaigns', label: 'Marketing' },
                { id: 'listings', label: 'Listings' }
            ]
        },
        {
            id: 'operations',
            label: 'Operations',
            icon: '⚙️',
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
            icon: '👥',
            children: [
                { id: 'announcements', label: 'Announcements' },
                { id: 'contracts', label: 'Contracts' },
                { id: 'vendors', label: 'Vendors' }
            ]
        },
        {
            id: 'financial',
            label: 'Financial',
            icon: '💰',
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
            icon: '🔒',
            children: [
                { id: 'permissions', label: 'Permissions' },
                { id: 'audit-logs', label: 'Audit Logs' }
            ]
        }
    ];

    const getPageTitle = () => {
        const findTitle = (items, targetId, parent = '') => {
            for (const item of items) {
                const currentId = parent ? `${parent}-${item.id}` : item.id;
                if (currentId === activePage) {
                    return parent ? `${items.find(i => i.id === parent.split('-')[0])?.label} > ${item.label}` : item.label;
                }
                if (item.children) {
                    const childTitle = findTitle(item.children, targetId, item.id);
                    if (childTitle) return childTitle;
                }
            }
            return null;
        };
        return findTitle(menuItems) || 'Dashboard';
    };

    const renderPageContent = () => {
        if (activePage === 'dashboard') {
            return (
                <div className="dashboard-grid">
                    <Card className="stat-card">
                        <div className="stat-value">156</div>
                        <div className="stat-label">Total Properties</div>
                    </Card>
                    <Card className="stat-card">
                        <div className="stat-value">1,248</div>
                        <div className="stat-label">Active Leases</div>
                    </Card>
                    <Card className="stat-card">
                        <div className="stat-value">89%</div>
                        <div className="stat-label">Occupancy Rate</div>
                    </Card>
                    <Card className="stat-card">
                        <div className="stat-value">$2.4M</div>
                        <div className="stat-label">Monthly Revenue</div>
                    </Card>
                </div>
            );
        }

        return (
            <Card>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    {getPageTitle()} page content will be implemented here.
                </p>
            </Card>
        );
    };

    return (
        <div className="admin-portal">
            <Sidebar 
                menuItems={menuItems}
                activePage={activePage}
                onPageChange={setActivePage}
            />
            
            <div className="main-content">
                <header className="topbar">
                    <div className="topbar-content">
                        <h1 className="page-title">{getPageTitle()}</h1>
                        <div className="topbar-actions">
                            <button className="icon-button">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 2C13.866 2 17 5.13401 17 9C17 12.866 13.866 16 10 16C6.13401 16 3 12.866 3 9C3 5.13401 6.13401 2 10 2Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M10 5V9L13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                            <button className="icon-button">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 5C10.5523 5 11 4.55228 11 4C11 3.44772 10.5523 3 10 3C9.44772 3 9 3.44772 9 4C9 4.55228 9.44772 5 10 5Z" fill="currentColor"/>
                                    <path d="M10 7C8.34315 7 7 8.34315 7 10V14C7 14.5523 7.44772 15 8 15H12C12.5523 15 13 14.5523 13 14V10C13 8.34315 11.6569 7 10 7Z" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M15 17H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                            <div className="user-menu">
                                <span className="user-name">{user.first_name} {user.last_name}</span>
                                <Button variant="ghost" size="sm" onClick={onLogout}>
                                    Sign out
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="page-content">
                    {renderPageContent()}
                </main>
            </div>
        </div>
    );
};