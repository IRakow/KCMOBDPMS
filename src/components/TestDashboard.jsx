const TestDashboard = ({ user }) => {
    React.useEffect(() => {
        console.log('TestDashboard mounted');
        return () => {
            console.log('TestDashboard unmounted');
        };
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '40px',
            textAlign: 'center'
        }}>
            <h1>Test Dashboard</h1>
            <p>If you can see this, the dashboard is working!</p>
            <p>User: {user?.first_name} {user?.last_name}</p>
        </div>
    );
};