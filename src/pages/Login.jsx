const Login = () => {
    const [formData, setFormData] = React.useState({
        email: '',
        password: ''
    });
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await window.authManager.login(formData.email, formData.password);
        
        if (result.success) {
            window.location.href = result.portal;
        } else {
            setError(result.error || 'Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="var(--color-brand)" />
                        <path d="M24 12L12 20V36H20V28H28V36H36V20L24 12Z" fill="white" />
                    </svg>
                </div>
                
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to access your portal</p>

                {error && <div className="form-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        block
                        loading={loading}
                        disabled={!formData.email || !formData.password}
                    >
                        Sign in
                    </Button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                        Portal access:
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                        Super Admin • Property Owner • Administrator<br />
                        Property Manager • Maintenance Staff • Vendor • Resident
                    </p>
                </div>
            </div>
        </div>
    );
};