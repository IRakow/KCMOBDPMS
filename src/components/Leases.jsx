// Leases Management Component
const Leases = () => {
    const [leases, setLeases] = React.useState([]);
    const [units, setUnits] = React.useState([]);
    const [tenants, setTenants] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [showAddModal, setShowAddModal] = React.useState(false);
    
    React.useEffect(() => {
        loadData();
    }, []);
    
    const loadData = async () => {
        try {
            setLoading(true);
            const [leasesData, unitsData, tenantsData] = await Promise.all([
                window.ApiService.get('/leases'),
                window.ApiService.get('/units'),
                window.ApiService.get('/tenants')
            ]);
            
            setLeases(leasesData || []);
            setUnits(unitsData || []);
            setTenants(tenantsData || []);
        } catch (error) {
            window.Toast.error('Failed to load leases');
        } finally {
            setLoading(false);
        }
    };
    
    const handleTerminateLease = async (leaseId) => {
        if (!confirm('Are you sure you want to terminate this lease?')) return;
        
        try {
            await window.ApiService.post(`/leases/${leaseId}/terminate`, {
                termination_date: new Date().toISOString().split('T')[0],
                reason: 'Terminated by property manager'
            });
            
            window.Toast.success('Lease terminated successfully');
            await loadData();
        } catch (error) {
            window.Toast.error('Failed to terminate lease');
        }
    };
    
    const handleCreateLease = async (leaseData) => {
        try {
            await window.ApiService.post('/leases', leaseData);
            window.Toast.success('Lease created successfully');
            setShowAddModal(false);
            await loadData();
        } catch (error) {
            window.Toast.error('Failed to create lease: ' + error.message);
        }
    };
    
    // Calculate stats
    const stats = React.useMemo(() => {
        const active = leases.filter(l => l.status === 'active').length;
        const expiring = leases.filter(l => l.is_expiring_soon).length;
        const monthlyRevenue = leases
            .filter(l => l.status === 'active')
            .reduce((sum, l) => sum + l.monthly_rent, 0);
        
        return {
            total: leases.length,
            active,
            expiring,
            monthlyRevenue
        };
    }, [leases]);
    
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading leases...</p>
            </div>
        );
    }
    
    return (
        <div className="leases-page">
            <div className="page-header">
                <div>
                    <h1>Lease Management</h1>
                    <p>Manage {stats.total} leases across your properties</p>
                </div>
                <button 
                    className="btn-primary"
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="fas fa-plus"></i>
                    New Lease
                </button>
            </div>
            
            {/* Stats Cards */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-file-contract"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.active}</div>
                        <div className="stat-label">Active Leases</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon warning">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.expiring}</div>
                        <div className="stat-label">Expiring Soon</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon success">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">${stats.monthlyRevenue.toLocaleString()}</div>
                        <div className="stat-label">Monthly Revenue</div>
                    </div>
                </div>
            </div>
            
            {/* Lease Cards */}
            <div className="leases-grid">
                {leases.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-file-contract"></i>
                        <h3>No leases yet</h3>
                        <p>Create your first lease to get started</p>
                        <button 
                            className="btn-primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            Create First Lease
                        </button>
                    </div>
                ) : (
                    leases.map(lease => {
                        const unit = units.find(u => u.id === lease.unit_id);
                        const tenant = tenants.find(t => t.id === lease.tenant_id);
                        
                        return (
                            <LeaseCard
                                key={lease.id}
                                lease={lease}
                                unit={unit}
                                tenant={tenant}
                                onTerminate={() => handleTerminateLease(lease.id)}
                            />
                        );
                    })
                )}
            </div>
            
            {/* Add Lease Modal */}
            {showAddModal && (
                <AddLeaseModal
                    units={units.filter(u => u.status === 'vacant')}
                    tenants={tenants}
                    onClose={() => setShowAddModal(false)}
                    onSave={handleCreateLease}
                />
            )}
        </div>
    );
};

// Add Lease Modal Component
const AddLeaseModal = ({ units, tenants, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        unit_id: '',
        tenant_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        monthly_rent: '',
        deposit_amount: '',
        auto_renew: false
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.unit_id || !formData.tenant_id) {
            window.Toast.error('Please select both unit and tenant');
            return;
        }
        
        onSave(formData);
    };
    
    React.useEffect(() => {
        // Auto-fill rent amount when unit is selected
        if (formData.unit_id) {
            const unit = units.find(u => u.id === formData.unit_id);
            if (unit) {
                setFormData(prev => ({
                    ...prev,
                    monthly_rent: unit.rent_amount.toString(),
                    deposit_amount: unit.rent_amount.toString()
                }));
            }
        }
    }, [formData.unit_id, units]);
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Lease</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Unit *</label>
                        <select
                            value={formData.unit_id}
                            onChange={(e) => setFormData({...formData, unit_id: e.target.value})}
                            required
                        >
                            <option value="">Select Unit</option>
                            {units.map(unit => (
                                <option key={unit.id} value={unit.id}>
                                    Unit {unit.unit_number} - {unit.property_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Tenant *</label>
                        <select
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
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Start Date *</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>End Date *</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                min={formData.start_date}
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Monthly Rent *</label>
                            <input
                                type="number"
                                value={formData.monthly_rent}
                                onChange={(e) => setFormData({...formData, monthly_rent: e.target.value})}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Security Deposit *</label>
                            <input
                                type="number"
                                value={formData.deposit_amount}
                                onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.auto_renew}
                                onChange={(e) => setFormData({...formData, auto_renew: e.target.checked})}
                            />
                            Auto-renew lease
                        </label>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Create Lease
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Register components
window.AppModules = window.AppModules || {};
window.AppModules.Leases = Leases;