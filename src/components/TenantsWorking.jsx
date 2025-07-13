// Example: Tenants module using the Module Pattern
const TenantsWorking = window.ModulePattern.createDataModule({
    moduleName: 'tenants',
    apiEndpoint: '/tenants',
    stateKey: 'tenants',
    
    renderContent: ({ data: tenants, refreshing, refresh }) => {
        // Create CRUD operations
        const tenantOps = window.ModulePattern.createCrudOperations('/tenants', 'tenants');
        
        const [showAddModal, setShowAddModal] = React.useState(false);
        const [selectedTenant, setSelectedTenant] = React.useState(null);
        
        const handleAddTenant = async (tenantData) => {
            try {
                await tenantOps.create(tenantData);
                setShowAddModal(false);
                refresh(); // Reload data
            } catch (error) {
                console.error('Failed to add tenant:', error);
            }
        };
        
        const handleUpdateTenant = async (id, updates) => {
            try {
                await tenantOps.update(id, updates);
                setSelectedTenant(null);
            } catch (error) {
                console.error('Failed to update tenant:', error);
            }
        };
        
        const handleDeleteTenant = async (id) => {
            if (confirm('Are you sure you want to delete this tenant?')) {
                try {
                    await tenantOps.delete(id);
                } catch (error) {
                    console.error('Failed to delete tenant:', error);
                }
            }
        };
        
        return (
            <div className="tenants-page">
                {/* Header */}
                <div className="page-header">
                    <div>
                        <h1>Tenants</h1>
                        <p>Manage {tenants.length} tenants</p>
                    </div>
                    <div className="header-actions">
                        <button 
                            className="btn btn-secondary" 
                            onClick={refresh}
                            disabled={refreshing}
                        >
                            <i className={`fas fa-sync ${refreshing ? 'fa-spin' : ''}`}></i>
                            Refresh
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            <i className="fas fa-plus"></i>
                            Add Tenant
                        </button>
                    </div>
                </div>
                
                {/* Tenants Grid */}
                <div className="tenants-grid">
                    {tenants.map(tenant => (
                        <div key={tenant.id} className="tenant-card">
                            <div className="tenant-header">
                                <div className="tenant-avatar">
                                    {tenant.first_name?.[0]}{tenant.last_name?.[0]}
                                </div>
                                <div className="tenant-info">
                                    <h3>{tenant.first_name} {tenant.last_name}</h3>
                                    <p>{tenant.email}</p>
                                    <p>{tenant.phone}</p>
                                </div>
                            </div>
                            <div className="tenant-actions">
                                <button 
                                    className="btn-icon"
                                    onClick={() => setSelectedTenant(tenant)}
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                    className="btn-icon danger"
                                    onClick={() => handleDeleteTenant(tenant.id)}
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Add/Edit Modal */}
                {(showAddModal || selectedTenant) && (
                    <TenantModal
                        tenant={selectedTenant}
                        onClose={() => {
                            setShowAddModal(false);
                            setSelectedTenant(null);
                        }}
                        onSave={selectedTenant 
                            ? (data) => handleUpdateTenant(selectedTenant.id, data)
                            : handleAddTenant
                        }
                    />
                )}
            </div>
        );
    },
    
    renderEmpty: () => (
        <div className="empty-state">
            <i className="fas fa-users"></i>
            <h3>No Tenants Yet</h3>
            <p>Add your first tenant to get started</p>
            <button 
                className="btn btn-primary"
                onClick={() => document.querySelector('.btn-primary').click()}
            >
                <i className="fas fa-plus"></i>
                Add First Tenant
            </button>
        </div>
    )
});

// Tenant Modal Component
const TenantModal = ({ tenant, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        first_name: tenant?.first_name || '',
        last_name: tenant?.last_name || '',
        email: tenant?.email || '',
        phone: tenant?.phone || '',
        date_of_birth: tenant?.date_of_birth || '',
        emergency_contact_name: tenant?.emergency_contact_name || '',
        emergency_contact_phone: tenant?.emergency_contact_phone || ''
    });
    const [saving, setSaving] = React.useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{tenant ? 'Edit Tenant' : 'Add New Tenant'}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.first_name}
                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Last Name *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.last_name}
                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Phone *</label>
                        <input
                            type="tel"
                            className="form-control"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            className="form-control"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                        />
                    </div>
                    
                    <h3 style={{ marginTop: '24px', marginBottom: '16px' }}>Emergency Contact</h3>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Contact Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.emergency_contact_name}
                                onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input
                                type="tel"
                                className="form-control"
                                value={formData.emergency_contact_phone}
                                onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : (tenant ? 'Update' : 'Create')} Tenant
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Styles for Tenants page
const tenantStyles = `
.tenants-page {
    padding: 24px;
}

.tenants-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    margin-top: 24px;
}

.tenant-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
}

.tenant-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.tenant-header {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
}

.tenant-avatar {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 20px;
    flex-shrink: 0;
}

.tenant-info h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
}

.tenant-info p {
    margin: 2px 0;
    color: #6b7280;
    font-size: 14px;
}

.tenant-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    border-top: 1px solid #f3f4f6;
    margin-top: 16px;
    padding-top: 16px;
}

.btn-icon {
    width: 36px;
    height: 36px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    color: #6b7280;
}

.btn-icon:hover {
    background: #f3f4f6;
    color: #374151;
}

.btn-icon.danger:hover {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fecaca;
}
`;

// Inject styles
if (!document.querySelector('#tenant-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'tenant-styles';
    styleSheet.textContent = tenantStyles;
    document.head.appendChild(styleSheet);
}

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.TenantsWorking = TenantsWorking;