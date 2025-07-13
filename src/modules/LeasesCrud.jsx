// Leases module using CRUD pattern
const LeasesModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        property_id: item?.property_id || '',
        unit_id: item?.unit_id || '',
        tenant_id: item?.tenant_id || '',
        start_date: item?.start_date || '',
        end_date: item?.end_date || '',
        rent_amount: item?.rent_amount || '',
        deposit_amount: item?.deposit_amount || '',
        lease_type: item?.lease_type || 'fixed_term',
        status: item?.status || 'draft'
    });
    const [saving, setSaving] = React.useState(false);
    
    // Load properties, units, tenants for dropdowns
    const [properties, setProperties] = React.useState([]);
    const [units, setUnits] = React.useState([]);
    const [tenants, setTenants] = React.useState([]);
    
    React.useEffect(() => {
        // Load data for dropdowns
        loadDropdownData();
    }, []);
    
    React.useEffect(() => {
        // Load units when property changes
        if (formData.property_id) {
            loadUnitsForProperty(formData.property_id);
        }
    }, [formData.property_id]);
    
    const loadDropdownData = async () => {
        try {
            const [propsRes, tenantsRes] = await Promise.all([
                window.ApiService.get('/properties'),
                window.ApiService.get('/tenants')
            ]);
            
            setProperties(propsRes.results || propsRes);
            setTenants(tenantsRes.results || tenantsRes);
        } catch (error) {
            console.error('Failed to load dropdown data:', error);
        }
    };
    
    const loadUnitsForProperty = async (propertyId) => {
        try {
            const response = await window.ApiService.get(`/properties/${propertyId}/units`);
            setUnits(response.results || response);
        } catch (error) {
            console.error('Failed to load units:', error);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            const leaseData = {
                ...formData,
                rent_amount: parseFloat(formData.rent_amount),
                deposit_amount: parseFloat(formData.deposit_amount)
            };
            
            await onSave(leaseData);
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{item ? 'Edit Lease' : 'Create New Lease'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-section">
                        <h3>Property & Unit</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Property *</label>
                                <select
                                    className="form-control"
                                    value={formData.property_id}
                                    onChange={(e) => setFormData({...formData, property_id: e.target.value, unit_id: ''})}
                                    required
                                >
                                    <option value="">Select Property</option>
                                    {properties.map(prop => (
                                        <option key={prop.id} value={prop.id}>{prop.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Unit *</label>
                                <select
                                    className="form-control"
                                    value={formData.unit_id}
                                    onChange={(e) => setFormData({...formData, unit_id: e.target.value})}
                                    required
                                    disabled={!formData.property_id}
                                >
                                    <option value="">Select Unit</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>
                                            Unit {unit.unit_number}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Tenant</h3>
                        <div className="form-group">
                            <label>Tenant *</label>
                            <select
                                className="form-control"
                                value={formData.tenant_id}
                                onChange={(e) => setFormData({...formData, tenant_id: e.target.value})}
                                required
                            >
                                <option value="">Select Tenant</option>
                                {tenants.map(tenant => (
                                    <option key={tenant.id} value={tenant.id}>
                                        {tenant.first_name} {tenant.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-section">
                        <h3>Lease Terms</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>End Date *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Monthly Rent *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.rent_amount}
                                    onChange={(e) => setFormData({...formData, rent_amount: e.target.value})}
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Security Deposit *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={formData.deposit_amount}
                                    onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                                    placeholder="0.00"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Lease Type</label>
                                <select
                                    className="form-control"
                                    value={formData.lease_type}
                                    onChange={(e) => setFormData({...formData, lease_type: e.target.value})}
                                >
                                    <option value="fixed_term">Fixed Term</option>
                                    <option value="month_to_month">Month to Month</option>
                                    <option value="short_term">Short Term</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    className="form-control"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="expiring">Expiring</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (item ? 'Update' : 'Create')} Lease
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Create the Leases page using CRUD pattern
const LeasesCrud = window.CrudModulePattern.createModule({
    moduleName: 'leases',
    moduleNameSingular: 'lease',
    endpoint: '/leases',
    stateKey: 'leases',
    searchable: true,
    defaultView: 'table',
    
    // Table columns configuration
    columns: [
        {
            key: 'property_name',
            label: 'Property',
            render: (lease) => lease.property?.name || 'N/A'
        },
        {
            key: 'unit_number',
            label: 'Unit',
            render: (lease) => lease.unit?.unit_number || 'N/A'
        },
        {
            key: 'tenant_name',
            label: 'Tenant',
            render: (lease) => lease.tenant ? 
                `${lease.tenant.first_name} ${lease.tenant.last_name}` : 'N/A'
        },
        {
            key: 'start_date',
            label: 'Start Date',
            render: (lease) => new Date(lease.start_date).toLocaleDateString()
        },
        {
            key: 'end_date',
            label: 'End Date',
            render: (lease) => new Date(lease.end_date).toLocaleDateString()
        },
        {
            key: 'rent_amount',
            label: 'Rent',
            render: (lease) => `$${lease.rent_amount?.toLocaleString()}`
        },
        {
            key: 'status',
            label: 'Status',
            render: (lease) => (
                `<span class="status-badge status-${lease.status}">
                    ${lease.status}
                </span>`
            )
        }
    ],
    
    // Filters configuration
    filters: [
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'pending', label: 'Pending' },
                { value: 'expiring', label: 'Expiring' },
                { value: 'expired', label: 'Expired' }
            ]
        }
    ],
    
    // Custom card renderer for grid view
    cardRenderer: ({ item: lease, onEdit, onDelete }) => (
        <div key={lease.id} className="lease-card">
            <div className="lease-card-header">
                <h3>{lease.property?.name || 'Unknown Property'}</h3>
                <span className={`status-badge status-${lease.status}`}>
                    {lease.status}
                </span>
            </div>
            
            <div className="lease-details">
                <div className="detail-row">
                    <i className="fas fa-door-open"></i>
                    <span>Unit {lease.unit?.unit_number || 'N/A'}</span>
                </div>
                <div className="detail-row">
                    <i className="fas fa-user"></i>
                    <span>
                        {lease.tenant ? 
                            `${lease.tenant.first_name} ${lease.tenant.last_name}` : 
                            'No Tenant'}
                    </span>
                </div>
                <div className="detail-row">
                    <i className="fas fa-calendar"></i>
                    <span>
                        {new Date(lease.start_date).toLocaleDateString()} - 
                        {new Date(lease.end_date).toLocaleDateString()}
                    </span>
                </div>
                <div className="detail-row">
                    <i className="fas fa-dollar-sign"></i>
                    <span>${lease.rent_amount?.toLocaleString()}/mo</span>
                </div>
            </div>
            
            <div className="card-actions">
                <button className="btn-icon" onClick={onEdit}>
                    <i className="fas fa-edit"></i>
                </button>
                <button className="btn-icon danger" onClick={onDelete}>
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    ),
    
    // Modal component
    modalComponent: LeasesModal,
    
    // Calculate additional stats
    calculateStats: (leases) => ({
        active: leases.filter(l => l.status === 'active').length,
        expiring: leases.filter(l => l.status === 'expiring').length,
        totalRent: leases
            .filter(l => l.status === 'active')
            .reduce((sum, l) => sum + (l.rent_amount || 0), 0)
    })
});

// Lease-specific styles
const leaseStyles = `
.lease-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
}

.lease-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.lease-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.lease-card-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.status-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.status-badge.status-active {
    background: #d1fae5;
    color: #065f46;
}

.status-badge.status-pending {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.status-expiring {
    background: #fee2e2;
    color: #991b1b;
}

.status-badge.status-expired {
    background: #f3f4f6;
    color: #6b7280;
}

.lease-details {
    margin: 16px 0;
}

.detail-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 0;
    color: #6b7280;
    font-size: 14px;
}

.detail-row i {
    width: 16px;
    color: #9ca3af;
}

.modal-large {
    max-width: 800px;
}

.form-section {
    margin-bottom: 24px;
}

.form-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
}
`;

// Inject styles
if (!document.querySelector('#lease-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'lease-styles';
    styleSheet.textContent = leaseStyles;
    document.head.appendChild(styleSheet);
}

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.LeasesCrud = LeasesCrud;