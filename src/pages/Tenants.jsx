const Tenants = () => {
    const [tenants, setTenants] = React.useState([]);
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showAddModal, setShowAddModal] = React.useState(false);
    const [viewingTenant, setViewingTenant] = React.useState(null);
    const [filters, setFilters] = React.useState({
        search: '',
        property: 'all',
        status: 'all' // all, active, past, applicant
    });
    
    React.useEffect(() => {
        // Load mock data immediately to prevent loading states
        setTenants(getMockTenants());
        setProperties(getMockProperties());
        setLoading(false);
        
        // Then try to load from API
        loadTenants();
        loadProperties();
    }, [filters]);
    
    const loadTenants = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filters.property !== 'all') params.append('property_id', filters.property);
            if (filters.status !== 'all') params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);
            
            const response = await fetch(`http://localhost:8000/api/v1/tenants?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            
            const data = await response.json();
            setTenants(data);
        } catch (error) {
            console.error('Failed to load tenants:', error);
            // Use mock data when API fails
            setTenants(getMockTenants());
        } finally {
            setLoading(false);
        }
    };
    
    const loadProperties = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/properties', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            const data = await response.json();
            setProperties(data);
        } catch (error) {
            console.error('Failed to load properties:', error);
            // Use mock data when API fails
            setProperties(getMockProperties());
        }
    };

    const getMockTenants = () => {
        return [
            {
                id: 1,
                first_name: 'John',
                last_name: 'Smith',
                email: 'john.smith@email.com',
                phone: '(555) 123-4567',
                status: 'active',
                property_name: 'Sunset Apartments',
                unit_number: '101',
                lease_start_date: '2024-01-15',
                lease_end_date: '2025-01-15',
                rent_amount: 2200,
                security_deposit: 2200,
                payment_status: 'current',
                emergency_contact: 'Jane Smith',
                emergency_phone: '(555) 987-6543'
            },
            {
                id: 2,
                first_name: 'Sarah',
                last_name: 'Johnson',
                email: 'sarah.j@email.com',
                phone: '(555) 234-5678',
                status: 'active',
                property_name: 'Downtown Plaza',
                unit_number: 'A12',
                lease_start_date: '2023-08-01',
                lease_end_date: '2024-08-31',
                rent_amount: 2800,
                security_deposit: 2800,
                payment_status: 'current',
                emergency_contact: 'Mike Johnson',
                emergency_phone: '(555) 876-5432'
            },
            {
                id: 3,
                first_name: 'Michael',
                last_name: 'Chen',
                email: 'mchen@email.com',
                phone: '(555) 345-6789',
                status: 'active',
                property_name: 'Garden Complex',
                unit_number: '305',
                lease_start_date: '2024-02-01',
                lease_end_date: '2025-02-01',
                rent_amount: 1900,
                security_deposit: 1900,
                payment_status: 'overdue',
                emergency_contact: 'Lisa Chen',
                emergency_phone: '(555) 765-4321'
            },
            {
                id: 4,
                first_name: 'Emily',
                last_name: 'Davis',
                email: 'emily.d@email.com',
                phone: '(555) 456-7890',
                status: 'applicant',
                property_name: 'Sunset Apartments',
                unit_number: '205',
                lease_start_date: null,
                lease_end_date: null,
                rent_amount: 2400,
                security_deposit: null,
                payment_status: 'pending',
                emergency_contact: 'Robert Davis',
                emergency_phone: '(555) 654-3210'
            },
            {
                id: 5,
                first_name: 'David',
                last_name: 'Wilson',
                email: 'dwilson@email.com',
                phone: '(555) 567-8901',
                status: 'active',
                property_name: 'Riverside Tower',
                unit_number: '1204',
                lease_start_date: '2023-11-01',
                lease_end_date: '2024-11-01',
                rent_amount: 3200,
                security_deposit: 3200,
                payment_status: 'current',
                emergency_contact: 'Mary Wilson',
                emergency_phone: '(555) 543-2109'
            }
        ];
    };

    const getMockProperties = () => {
        return [
            { id: 1, name: 'Sunset Apartments' },
            { id: 2, name: 'Downtown Plaza' },
            { id: 3, name: 'Garden Complex' },
            { id: 4, name: 'Riverside Tower' }
        ];
    };
    
    return (
        <div className="tenants-page">
            {/* Smart Insights */}
            <div className="insights-row">
                <InsightCard
                    type="warning"
                    icon="fa-clock"
                    title="5 Leases Expiring Soon"
                    subtitle="Within next 60 days"
                    action="View Leases"
                />
                <InsightCard
                    type="alert"
                    icon="fa-exclamation-circle"
                    title="3 Overdue Payments"
                    subtitle="Total: $4,850"
                    action="Send Reminders"
                />
                <InsightCard
                    type="info"
                    icon="fa-user-check"
                    title="8 New Applications"
                    subtitle="Awaiting review"
                    action="Review"
                />
            </div>
            
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Tenants</h1>
                    <p className="subtitle">Manage tenant profiles and applications</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <i className="fas fa-plus"></i>
                    Add Tenant
                </button>
            </div>
            
            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by name, email, phone..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                </div>
                
                <select 
                    className="filter-select"
                    value={filters.property}
                    onChange={(e) => setFilters({...filters, property: e.target.value})}
                >
                    <option value="all">All Properties</option>
                    {properties.map(prop => (
                        <option key={prop.id} value={prop.id}>{prop.name}</option>
                    ))}
                </select>
                
                <div className="status-filters">
                    <button 
                        className={`filter-btn ${filters.status === 'all' ? 'active' : ''}`}
                        onClick={() => setFilters({...filters, status: 'all'})}
                    >
                        All ({tenants.length})
                    </button>
                    <button 
                        className={`filter-btn ${filters.status === 'active' ? 'active' : ''}`}
                        onClick={() => setFilters({...filters, status: 'active'})}
                    >
                        Active ({tenants.filter(t => t.status === 'active').length})
                    </button>
                    <button 
                        className={`filter-btn ${filters.status === 'applicant' ? 'active' : ''}`}
                        onClick={() => setFilters({...filters, status: 'applicant'})}
                    >
                        Applicants ({tenants.filter(t => t.status === 'applicant').length})
                    </button>
                </div>
            </div>
            
            {/* Tenants Grid */}
            {loading ? (
                <LoadingState />
            ) : (
                <div className="tenants-grid">
                    {tenants.map(tenant => (
                        <TenantCard 
                            key={tenant.id}
                            tenant={tenant}
                            onView={() => setViewingTenant(tenant)}
                        />
                    ))}
                </div>
            )}
            
            {/* Modals */}
            {showAddModal && (
                <AddTenantModal 
                    onClose={() => setShowAddModal(false)}
                    onSave={() => {
                        setShowAddModal(false);
                        loadTenants();
                    }}
                />
            )}
            
            {viewingTenant && (
                <TenantDetailsModal
                    tenant={viewingTenant}
                    onClose={() => setViewingTenant(null)}
                />
            )}
        </div>
    );
};

// Insight Card Component
const InsightCard = ({ type, icon, title, subtitle, action }) => {
    const handleActionClick = () => {
        console.log(`Action clicked: ${action}`);
        // Add specific action handling here
    };
    
    return (
        <div className={`insight-card ${type}`}>
            <div className={`insight-icon ${type}`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div className="insight-content">
                <h4>{title || 'No title'}</h4>
                <p>{subtitle || 'No subtitle'}</p>
            </div>
            <button className="insight-action" onClick={handleActionClick}>
                {action || 'Action'}
            </button>
        </div>
    );
};

// Loading State Component
const LoadingState = () => {
    return (
        <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tenants...</p>
        </div>
    );
};

// Tenant Card Component
const TenantCard = ({ tenant, onView }) => {
    const getStatusColor = (status) => {
        switch(status) {
            case 'active': return 'success';
            case 'past': return 'secondary';
            case 'applicant': return 'warning';
            default: return 'secondary';
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    return (
        <div className="tenant-card" onClick={onView}>
            <div className="tenant-header">
                <div className="tenant-avatar">
                    {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                </div>
                <div className="tenant-info">
                    <h3>{tenant.first_name} {tenant.last_name}</h3>
                    <p className="tenant-email">{tenant.email}</p>
                </div>
                <span className={`status-badge ${getStatusColor(tenant.status)}`}>
                    {tenant.status}
                </span>
            </div>
            
            <div className="tenant-details">
                <div className="detail-item">
                    <i className="fas fa-building"></i>
                    <span>{tenant.property_name} - Unit {tenant.unit_number}</span>
                </div>
                <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{tenant.phone}</span>
                </div>
                <div className="detail-item">
                    <i className="fas fa-calendar"></i>
                    <span>Since {formatDate(tenant.lease_start_date)}</span>
                </div>
            </div>
            
            <div className="tenant-stats">
                <div className="stat">
                    <span className="label">Rent</span>
                    <span className="value">${tenant.rent_amount}/mo</span>
                </div>
                <div className="stat">
                    <span className="label">Payment Status</span>
                    <span className={`value ${tenant.payment_status === 'current' ? 'text-success' : 'text-danger'}`}>
                        {tenant.payment_status}
                    </span>
                </div>
                <div className="stat">
                    <span className="label">Lease Ends</span>
                    <span className="value">{formatDate(tenant.lease_end_date)}</span>
                </div>
            </div>
            
            <div className="tenant-actions">
                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); }}>
                    <i className="fas fa-envelope"></i>
                </button>
                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); }}>
                    <i className="fas fa-phone"></i>
                </button>
                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); }}>
                    <i className="fas fa-file-invoice-dollar"></i>
                </button>
            </div>
        </div>
    );
};

// Add Tenant Modal
const AddTenantModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        ssn_last_four: '',
        emergency_contact: {
            name: '',
            phone: '',
            relationship: ''
        },
        employment: {
            employer: '',
            position: '',
            income: '',
            start_date: ''
        }
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/v1/tenants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                showToast('success', 'Tenant added successfully');
                onSave();
            }
        } catch (error) {
            showToast('error', 'Failed to add tenant');
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Tenant</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Emergency Contact</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Contact Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.emergency_contact.name}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        emergency_contact: {...formData.emergency_contact, name: e.target.value}
                                    })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Phone</label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={formData.emergency_contact.phone}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        emergency_contact: {...formData.emergency_contact, phone: e.target.value}
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Add Tenant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Tenant Details Modal
const TenantDetailsModal = ({ tenant, onClose }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Tenant Details</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    <div className="tenant-detail-sections">
                        <div className="detail-section">
                            <h3>Personal Information</h3>
                            <div className="detail-grid">
                                <div className="detail">
                                    <label>Full Name</label>
                                    <span>{tenant.first_name} {tenant.last_name}</span>
                                </div>
                                <div className="detail">
                                    <label>Email</label>
                                    <span>{tenant.email}</span>
                                </div>
                                <div className="detail">
                                    <label>Phone</label>
                                    <span>{tenant.phone}</span>
                                </div>
                                <div className="detail">
                                    <label>Status</label>
                                    <span>{tenant.status}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="detail-section">
                            <h3>Lease Information</h3>
                            <div className="detail-grid">
                                <div className="detail">
                                    <label>Property</label>
                                    <span>{tenant.property_name}</span>
                                </div>
                                <div className="detail">
                                    <label>Unit</label>
                                    <span>{tenant.unit_number}</span>
                                </div>
                                <div className="detail">
                                    <label>Lease Start</label>
                                    <span>{formatDate(tenant.lease_start_date)}</span>
                                </div>
                                <div className="detail">
                                    <label>Lease End</label>
                                    <span>{formatDate(tenant.lease_end_date)}</span>
                                </div>
                                <div className="detail">
                                    <label>Monthly Rent</label>
                                    <span>${tenant.rent_amount}</span>
                                </div>
                                <div className="detail">
                                    <label>Security Deposit</label>
                                    <span>${tenant.security_deposit || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="detail-section">
                            <h3>Payment History</h3>
                            <div className="payment-status">
                                <span>Current Payment Status:</span>
                                <span className={`status ${tenant.payment_status === 'current' ? 'current' : 'overdue'}`}>
                                    {tenant.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    <button className="btn btn-primary">
                        <i className="fas fa-edit"></i>
                        Edit Tenant
                    </button>
                </div>
            </div>
        </div>
    );
};

// Toast notification helper
const showToast = (type, message) => {
    // This would typically use a toast library or custom implementation
    console.log(`Toast [${type}]: ${message}`);
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.Tenants = Tenants;