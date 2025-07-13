// Working Units Component that connects to the backend
const UnitsWorking = () => {
    const [units, setUnits] = React.useState([]);
    const [properties, setProperties] = React.useState([]);
    const [selectedProperty, setSelectedProperty] = React.useState('all');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [viewMode, setViewMode] = React.useState('grid');
    const [showAddUnit, setShowAddUnit] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    
    // Subscribe to global state and load data
    React.useEffect(() => {
        // Initial load
        loadData();
        
        // Subscribe to global state changes
        const unsubProperties = window.AppState.subscribe('properties', (props) => {
            setProperties(props);
        });
        const unsubUnits = window.AppState.subscribe('units', (units) => {
            setUnits(units);
        });
        
        // Cleanup subscriptions
        return () => {
            unsubProperties();
            unsubUnits();
        };
    }, []);
    
    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use ApiService for all requests
            const [propsResponse, unitsResponse] = await Promise.all([
                window.ApiService.get('/properties'),
                window.ApiService.get('/units')
            ]);
            
            // Extract data from responses
            const propsData = propsResponse.results || [];
            const unitsData = unitsResponse.results || [];
            
            // Update global state
            window.AppState.setState('properties', propsData);
            window.AppState.setState('units', unitsData);
            
            // Update local state
            setProperties(propsData);
            setUnits(unitsData);
            
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
            
            // Show notification if available
            if (window.showNotification) {
                window.showNotification('error', 'Failed to load data: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Filter units based on selected filters
    const filteredUnits = React.useMemo(() => {
        let filtered = [...units];
        
        // Filter by property
        if (selectedProperty !== 'all') {
            filtered = filtered.filter(unit => unit.property_id === selectedProperty);
        }
        
        // Filter by status
        if (statusFilter !== 'all') {
            const statusMap = {
                'vacant': 'available',
                'occupied': 'occupied',
                'maintenance': 'maintenance'
            };
            const mappedStatus = statusMap[statusFilter] || statusFilter;
            filtered = filtered.filter(unit => unit.status === mappedStatus);
        }
        
        return filtered;
    }, [units, selectedProperty, statusFilter]);
    
    // Calculate statistics
    const stats = React.useMemo(() => {
        const total = units.length;
        const occupied = units.filter(u => u.status === 'occupied').length;
        const vacant = units.filter(u => u.status === 'available').length;
        const maintenance = units.filter(u => u.status === 'maintenance').length;
        const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
        const potentialRevenue = units.reduce((sum, u) => sum + (u.market_rent || u.rent_amount || 0), 0);
        const actualRevenue = units.filter(u => u.status === 'occupied').reduce((sum, u) => sum + (u.rent_amount || 0), 0);
        const revenueLoss = potentialRevenue - actualRevenue;
        
        return { total, occupied, vacant, maintenance, occupancyRate, potentialRevenue, actualRevenue, revenueLoss };
    }, [units]);
    
    if (loading && units.length === 0) {
        return (
            <div className="units-loading">
                <div className="loading-spinner"></div>
                <p>Loading units...</p>
            </div>
        );
    }
    
    return (
        <div className="units-page-beautiful">
            {/* Smart Insights Bar */}
            <div className="insights-bar-gradient">
                <div className="insight-card glass urgent">
                    <div className="insight-icon-wrapper">
                        <i className="fas fa-exclamation-circle"></i>
                    </div>
                    <div className="insight-content">
                        <h4>{stats.vacant} Units Available</h4>
                        <p>Potential revenue: ${stats.revenueLoss.toLocaleString()}/mo</p>
                    </div>
                    <button className="insight-action">
                        List Units
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
                
                <div className="insight-card glass warning">
                    <div className="insight-icon-wrapper">
                        <i className="fas fa-tools"></i>
                    </div>
                    <div className="insight-content">
                        <h4>{stats.maintenance} Under Maintenance</h4>
                        <p>Complete repairs to list</p>
                    </div>
                    <button className="insight-action">
                        View Status
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
                
                <div className="insight-card glass success">
                    <div className="insight-icon-wrapper">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="insight-content">
                        <h4>{stats.occupancyRate}% Occupancy</h4>
                        <p>Revenue: ${stats.actualRevenue.toLocaleString()}/mo</p>
                    </div>
                    <button className="insight-action">
                        View Trends
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
            
            {/* Beautiful Header */}
            <div className="page-header-beautiful">
                <div className="header-content-wrapper">
                    <div className="header-titles">
                        <h1 className="page-title-large">Units</h1>
                        <p className="page-subtitle-muted">
                            Manage {stats.total} units across your properties
                        </p>
                    </div>
                    <div className="header-stats-row">
                        <div className="mini-stat">
                            <span className="mini-stat-value">{stats.occupied}</span>
                            <span className="mini-stat-label">Occupied</span>
                        </div>
                        <div className="mini-stat">
                            <span className="mini-stat-value">{stats.vacant}</span>
                            <span className="mini-stat-label">Vacant</span>
                        </div>
                        <div className="mini-stat">
                            <span className="mini-stat-value">${(stats.actualRevenue / 1000).toFixed(1)}k</span>
                            <span className="mini-stat-label">Monthly Revenue</span>
                        </div>
                    </div>
                </div>
                <div className="header-actions-group">
                    <button className="btn-beautiful secondary" onClick={loadData} disabled={loading}>
                        <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                    <button className="btn-beautiful primary" onClick={() => setShowAddUnit(true)}>
                        <i className="fas fa-plus"></i>
                        Add Unit
                    </button>
                </div>
            </div>
            
            {/* Error Display */}
            {error && (
                <div className="error-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                    <button onClick={loadData}>Retry</button>
                </div>
            )}
            
            {/* Advanced Filters Bar */}
            <div className="filters-bar-modern">
                <div className="filter-group">
                    <select 
                        className="filter-select-modern"
                        value={selectedProperty}
                        onChange={(e) => setSelectedProperty(e.target.value)}
                    >
                        <option value="all">All Properties</option>
                        {properties.map(prop => (
                            <option key={prop.id} value={prop.id}>
                                {prop.name}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="filter-pills-group">
                    <button 
                        className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All Units
                        <span className="pill-count">{stats.total}</span>
                    </button>
                    <button 
                        className={`filter-pill ${statusFilter === 'vacant' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('vacant')}
                    >
                        <span className="pill-dot vacant"></span>
                        Vacant
                        <span className="pill-count">{stats.vacant}</span>
                    </button>
                    <button 
                        className={`filter-pill ${statusFilter === 'occupied' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('occupied')}
                    >
                        <span className="pill-dot occupied"></span>
                        Occupied
                        <span className="pill-count">{stats.occupied}</span>
                    </button>
                    <button 
                        className={`filter-pill ${statusFilter === 'maintenance' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('maintenance')}
                    >
                        <span className="pill-dot maintenance"></span>
                        Maintenance
                        <span className="pill-count">{stats.maintenance}</span>
                    </button>
                </div>
                
                <div className="view-mode-toggle">
                    <button 
                        className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <i className="fas fa-th-large"></i>
                    </button>
                    <button 
                        className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <i className="fas fa-list"></i>
                    </button>
                    <button 
                        className={`view-mode-btn ${viewMode === 'floor' ? 'active' : ''}`}
                        onClick={() => setViewMode('floor')}
                    >
                        <i className="fas fa-building"></i>
                    </button>
                </div>
            </div>
            
            {/* Units Grid */}
            <div className="units-container">
                {filteredUnits.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-building"></i>
                        <h3>No units found</h3>
                        <p>
                            {units.length === 0 
                                ? "Add your first unit to get started"
                                : "Try adjusting your filters"}
                        </p>
                        {units.length === 0 && (
                            <button 
                                className="btn-beautiful primary"
                                onClick={() => setShowAddUnit(true)}
                            >
                                <i className="fas fa-plus"></i>
                                Add First Unit
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="units-grid-beautiful">
                        {filteredUnits.map(unit => (
                            <UnitCardWorking key={unit.id} unit={unit} onUpdate={loadData} />
                        ))}
                    </div>
                )}
            </div>
            
            {/* Add Unit Modal */}
            {showAddUnit && (
                <AddUnitModal 
                    properties={properties}
                    onClose={() => setShowAddUnit(false)}
                    onSave={() => {
                        setShowAddUnit(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
};

// Working Unit Card Component
const UnitCardWorking = ({ unit, onUpdate }) => {
    const getStatusColor = (status) => {
        switch(status) {
            case 'available': return '#10b981';
            case 'occupied': return '#3b82f6';
            case 'maintenance': return '#f59e0b';
            default: return '#6b7280';
        }
    };
    
    const getStatusDisplay = (status) => {
        switch(status) {
            case 'available': return 'VACANT';
            case 'occupied': return 'OCCUPIED';
            case 'maintenance': return 'MAINTENANCE';
            default: return status.toUpperCase();
        }
    };
    
    const isExpiringSoon = unit.lease_end && 
        new Date(unit.lease_end) - new Date() < 60 * 24 * 60 * 60 * 1000;
    
    return (
        <div className={`unit-card-beautiful ${unit.status}`}>
            {/* Status Ribbon */}
            <div className="status-ribbon" style={{ backgroundColor: getStatusColor(unit.status) }}>
                {getStatusDisplay(unit.status)}
            </div>
            
            {/* Card Header */}
            <div className="unit-card-header">
                <div className="unit-identity">
                    <h3 className="unit-number">Unit {unit.unit_number}</h3>
                    <p className="property-name">{unit.property_name}</p>
                </div>
                <div className="unit-actions">
                    <button className="action-btn-glass">
                        <i className="fas fa-eye"></i>
                    </button>
                    <button className="action-btn-glass">
                        <i className="fas fa-edit"></i>
                    </button>
                </div>
            </div>
            
            {/* Unit Specs */}
            <div className="unit-specs">
                <div className="spec">
                    <i className="fas fa-bed"></i>
                    <span>{unit.bedrooms} Bed</span>
                </div>
                <div className="spec">
                    <i className="fas fa-bath"></i>
                    <span>{unit.bathrooms} Bath</span>
                </div>
                {unit.square_feet && (
                    <div className="spec">
                        <i className="fas fa-ruler-combined"></i>
                        <span>{unit.square_feet} sqft</span>
                    </div>
                )}
            </div>
            
            {/* Amenities Tags */}
            {unit.amenities && unit.amenities.length > 0 && (
                <div className="amenities-row">
                    {unit.amenities.slice(0, 2).map((amenity, idx) => (
                        <span key={idx} className="amenity-tag">{amenity}</span>
                    ))}
                    {unit.amenities.length > 2 && (
                        <span className="amenity-tag more">+{unit.amenities.length - 2}</span>
                    )}
                </div>
            )}
            
            {/* Status-Specific Content */}
            {unit.status === 'occupied' && unit.tenant_name && (
                <div className="tenant-section">
                    <div className="tenant-info">
                        <div className="tenant-avatar">
                            {unit.tenant_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="tenant-details">
                            <p className="tenant-name">{unit.tenant_name}</p>
                            {unit.lease_end && (
                                <p className="lease-end">
                                    Lease ends {new Date(unit.lease_end).toLocaleDateString()}
                                    {isExpiringSoon && <span className="expiring-badge">Expiring Soon</span>}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {unit.status === 'available' && (
                <div className="vacancy-alert">
                    <i className="fas fa-clock"></i>
                    <span>Vacant for {unit.days_on_market || 0} days</span>
                </div>
            )}
            
            {unit.status === 'maintenance' && (
                <div className="maintenance-alert">
                    <i className="fas fa-tools"></i>
                    <span>Under maintenance</span>
                </div>
            )}
            
            {/* Rent Section */}
            <div className="rent-section-beautiful">
                <div className="rent-display">
                    <span className="rent-amount">${unit.rent_amount || unit.market_rent || 0}</span>
                    <span className="rent-period">/month</span>
                </div>
                {unit.market_rent > unit.rent_amount && (
                    <div className="market-opportunity">
                        <i className="fas fa-trending-up"></i>
                        ${unit.market_rent - unit.rent_amount} below market
                    </div>
                )}
            </div>
            
            {/* Quick Actions */}
            <div className="unit-quick-actions">
                {unit.status === 'available' && (
                    <>
                        <button className="quick-action-btn primary">
                            <i className="fas fa-bullhorn"></i>
                            List Unit
                        </button>
                        <button className="quick-action-btn secondary">
                            <i className="fas fa-calendar"></i>
                            Schedule Tour
                        </button>
                    </>
                )}
                {unit.status === 'occupied' && (
                    <>
                        <button className="quick-action-btn secondary">
                            <i className="fas fa-envelope"></i>
                            Message Tenant
                        </button>
                        <button className="quick-action-btn secondary">
                            <i className="fas fa-file-invoice"></i>
                            View Lease
                        </button>
                    </>
                )}
                {unit.status === 'maintenance' && (
                    <>
                        <button className="quick-action-btn warning">
                            <i className="fas fa-tasks"></i>
                            Update Status
                        </button>
                        <button className="quick-action-btn secondary">
                            <i className="fas fa-clipboard-check"></i>
                            View Work Orders
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Working Add Unit Modal
const AddUnitModal = ({ properties, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        property_id: '',
        unit_number: '',
        bedrooms: 1,
        bathrooms: 1,
        square_feet: '',
        rent_amount: '',
        deposit_amount: '',
        amenities: []
    });
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        
        try {
            // Prepare data with proper types
            const unitData = {
                ...formData,
                rent_amount: parseFloat(formData.rent_amount),
                deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
                square_feet: formData.square_feet ? parseFloat(formData.square_feet) : null
            };
            
            // Use ApiService to create unit
            await window.ApiService.post('/units', unitData);
            
            // Show success notification
            if (window.showNotification) {
                window.showNotification('success', 'Unit added successfully!');
            }
            
            // Trigger parent callback
            onSave();
        } catch (error) {
            console.error('Error creating unit:', error);
            setError(error.message);
            
            // Show error notification
            if (window.showNotification) {
                window.showNotification('error', error.message);
            }
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-beautiful" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Unit</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body">
                    {error && (
                        <div className="error-message">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>Property *</label>
                        <select 
                            className="form-control"
                            value={formData.property_id}
                            onChange={(e) => setFormData({...formData, property_id: e.target.value})}
                            required
                        >
                            <option value="">Select a property</option>
                            {properties.map(prop => (
                                <option key={prop.id} value={prop.id}>
                                    {prop.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Unit Number *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.unit_number}
                            onChange={(e) => setFormData({...formData, unit_number: e.target.value})}
                            placeholder="e.g., 101, A, 2B"
                            required
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Bedrooms</label>
                            <select 
                                className="form-control"
                                value={formData.bedrooms}
                                onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                            >
                                <option value="0">Studio</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4+</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Bathrooms</label>
                            <select 
                                className="form-control"
                                value={formData.bathrooms}
                                onChange={(e) => setFormData({...formData, bathrooms: parseFloat(e.target.value)})}
                            >
                                <option value="1">1</option>
                                <option value="1.5">1.5</option>
                                <option value="2">2</option>
                                <option value="2.5">2.5</option>
                                <option value="3">3+</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Square Feet</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.square_feet}
                                onChange={(e) => setFormData({...formData, square_feet: e.target.value})}
                                placeholder="e.g., 750"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Monthly Rent *</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.rent_amount}
                                onChange={(e) => setFormData({...formData, rent_amount: e.target.value})}
                                placeholder="e.g., 1500"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Security Deposit</label>
                        <input
                            type="number"
                            className="form-control"
                            value={formData.deposit_amount}
                            onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                            placeholder="Leave empty to use rent amount"
                        />
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Creating...' : 'Create Unit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal styles
const modalStyles = `
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal.modal-beautiful {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
}

.close-btn {
    width: 36px;
    height: 36px;
    border: none;
    background: #f3f4f6;
    border-radius: 8px;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #e5e7eb;
    color: #374151;
}

.modal-body {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
    font-size: 14px;
}

.form-control {
    width: 100%;
    padding: 10px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 15px;
    transition: all 0.2s;
}

.form-control:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.modal-footer {
    padding: 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: #6366f1;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #4f46e5;
    transform: translateY(-1px);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f3f4f6;
    color: #4b5563;
}

.btn-secondary:hover {
    background: #e5e7eb;
}

.error-message {
    background: #fee2e2;
    color: #dc2626;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.error-banner {
    background: #fef2f2;
    color: #991b1b;
    padding: 16px 24px;
    margin: 0 24px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.error-banner button {
    margin-left: auto;
    padding: 6px 12px;
    background: white;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #991b1b;
    cursor: pointer;
}

.error-banner button:hover {
    background: #fee2e2;
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
    color: #6b7280;
}

.empty-state i {
    font-size: 64px;
    color: #e5e7eb;
    margin-bottom: 24px;
}

.empty-state h3 {
    font-size: 24px;
    color: #374151;
    margin: 0 0 8px 0;
}

.empty-state p {
    font-size: 16px;
    margin: 0 0 24px 0;
}
`;

// Inject modal styles
if (!document.querySelector('#units-modal-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'units-modal-styles';
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
}

// Export for use
window.UnitsWorking = UnitsWorking;

// Also register as Units for AdminPortalV3
window.AppModules = window.AppModules || {};
window.AppModules.Units = UnitsWorking;