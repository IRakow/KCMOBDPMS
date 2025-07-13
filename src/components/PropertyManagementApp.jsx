// Complete Working Property Management System
const PropertyManagementApp = () => {
    const [activeSection, setActiveSection] = React.useState('dashboard');
    const [loading, setLoading] = React.useState(false);
    const [globalData, setGlobalData] = React.useState({
        properties: [],
        units: [],
        tenants: [],
        leases: [],
        payments: []
    });
    
    React.useEffect(() => {
        loadAllData();
    }, []);
    
    const loadAllData = async () => {
        setLoading(true);
        try {
            const [properties, units, tenants, leases, payments] = await Promise.all([
                window.ApiService.get('/properties'),
                window.ApiService.get('/units'),
                window.ApiService.get('/tenants'),
                window.ApiService.get('/leases'),
                window.ApiService.get('/payments')
            ]);
            
            setGlobalData({
                properties: properties || [],
                units: units || [],
                tenants: tenants || [],
                leases: leases || [],
                payments: payments || []
            });
            
            // Update global state
            window.AppState.setState('properties', properties);
            window.AppState.setState('units', units);
            window.AppState.setState('tenants', tenants);
            
        } catch (error) {
            window.Toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };
    
    const renderContent = () => {
        switch(activeSection) {
            case 'dashboard':
                return <WorkingDashboard data={globalData} />;
            case 'properties':
                return <PropertiesWorking onUpdate={loadAllData} />;
            case 'units':
                return <UnitsWorking onUpdate={loadAllData} />;
            case 'tenants':
                return <TenantsWorking onUpdate={loadAllData} />;
            case 'leases':
                return <LeasesWorking onUpdate={loadAllData} />;
            case 'payments':
                return <PaymentsWorking onUpdate={loadAllData} />;
            default:
                return <WorkingDashboard data={globalData} />;
        }
    };
    
    return (
        <div className="app-container">
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection}
                data={globalData}
            />
            <main className="main-content">
                {loading ? (
                    <div className="loading-screen">
                        <div className="spinner"></div>
                        <p>Loading your properties...</p>
                    </div>
                ) : (
                    renderContent()
                )}
            </main>
        </div>
    );
};

// Register the component
window.AppModules = window.AppModules || {};
window.AppModules.PropertyManagementApp = PropertyManagementApp;