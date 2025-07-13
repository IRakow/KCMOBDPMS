// Replace your current Units page with this beauty
const UnitsWorldClass = () => {
    const [units, setUnits] = React.useState([]);
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedProperty, setSelectedProperty] = React.useState('all');
    const [viewMode, setViewMode] = React.useState('grid');
    const [statusFilter, setStatusFilter] = React.useState('all');
    const [showAddUnit, setShowAddUnit] = React.useState(false);
    
    React.useEffect(() => {
        loadData();
    }, [selectedProperty, statusFilter]);
    
    const loadData = async () => {
        try {
            const [propertiesResponse, unitsResponse] = await Promise.all([
                window.ApiService.get('/properties'),
                window.ApiService.get('/units')
            ]);
            
            const propertiesData = propertiesResponse?.results || propertiesResponse || [];
            const unitsData = unitsResponse?.results || unitsResponse || [];
            
            setProperties(propertiesData);
            setUnits(unitsData);
            
            if (window.AppState) {
                window.AppState.setState('properties', propertiesData);
                window.AppState.setState('units', unitsData);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
            if (window.Toast) {
                window.Toast.error('Failed to load data');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Calculate statistics
    const stats = React.useMemo(() => {
        let filteredUnits = units;
        
        // Apply property filter
        if (selectedProperty !== 'all') {
            filteredUnits = filteredUnits.filter(unit => unit.property_id === selectedProperty);
        }
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filteredUnits = filteredUnits.filter(unit => unit.status === statusFilter);
        }
        
        const total = filteredUnits.length;
        const available = filteredUnits.filter(u => u.status === 'available').length;
        const occupied = filteredUnits.filter(u => u.status === 'occupied').length;
        const maintenance = filteredUnits.filter(u => u.status === 'maintenance').length;
        const vacant = available; // Available units are vacant
        
        const monthlyRevenue = filteredUnits
            .filter(u => u.status === 'occupied')
            .reduce((sum, u) => sum + (u.market_rent || 0), 0);
        
        const potentialRevenue = filteredUnits
            .reduce((sum, u) => sum + (u.market_rent || 0), 0);
        
        const lostRevenue = potentialRevenue - monthlyRevenue;
        
        return {
            total,
            vacant,
            occupied,
            maintenance,
            available,
            occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
            monthlyRevenue,
            potentialRevenue,
            lostRevenue,
            filteredUnits
        };
    }, [units, selectedProperty, statusFilter]);
    
    return (
        <div className="units-page-world-class">
            <div className="page-container">
                {/* Smart Insights Bar */}
                <div className="insights-bar">
                    {stats.vacant > 0 && (
                        <div className="insight-card urgent">
                            <div className="insight-icon">
                                <i className="fas fa-door-open"></i>
                            </div>
                            <div className="insight-content">
                                <h4>{stats.vacant} Vacant Units</h4>
                                <p>Lost revenue: ${stats.lostRevenue.toLocaleString()}/mo</p>
                            </div>
                            <button className="insight-action">
                                List Now
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>
                    )}
                    
                    {stats.maintenance > 0 && (
                        <div className="insight-card warning">
                            <div className="insight-icon">
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
                    )}
                    
                    <div className="insight-card success">
                        <div className="insight-icon">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <div className="insight-content">
                            <h4>{stats.occupancyRate}% Occupancy</h4>
                            <p>Revenue: ${stats.monthlyRevenue.toLocaleString()}/mo</p>
                        </div>
                        <button className="insight-action">
                            Optimize
                            <i className="fas fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
                
                {/* Main Header - Clean and Clear */}
                <div className="page-header-clean">
                    <div className="header-left">
                        <h1 className="page-title">Units</h1>
                        <p className="page-subtitle">
                            Manage {stats.total} units across your properties
                        </p>
                        <div className="header-stats">
                            <div className="stat-item">
                                <span className="stat-value">{stats.occupied}</span>
                                <span className="stat-label">Occupied</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{stats.vacant}</span>
                                <span className="stat-label">Vacant</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">${(stats.monthlyRevenue / 1000).toFixed(1)}k</span>
                                <span className="stat-label">Monthly</span>
                            </div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button className="btn-secondary">
                            <i className="fas fa-file-export"></i>
                            Export
                        </button>
                        <button 
                            className="btn-primary"
                            onClick={() => setShowAddUnit(true)}
                        >
                            <i className="fas fa-plus"></i>
                            Add Unit
                        </button>
                    </div>
                </div>
                
                {/* Advanced Filters */}
                <div className="filters-section">
                    <div className="filter-group">
                        <label>Property</label>
                        <select 
                            className="filter-select"
                            value={selectedProperty}
                            onChange={(e) => setSelectedProperty(e.target.value)}
                        >
                            <option value="all">All Properties</option>
                            {properties.map(prop => (
                                <option key={prop.id} value={prop.id}>
                                    {prop.name} ({prop.total_units || 0} units)
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="status-pills">
                        <button 
                            className={`status-pill ${statusFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('all')}
                        >
                            All Units
                            <span className="pill-count">{stats.total}</span>
                        </button>
                        <button 
                            className={`status-pill vacant ${statusFilter === 'available' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('available')}
                        >
                            <span className="status-dot vacant"></span>
                            Available
                            <span className="pill-count">{stats.available}</span>
                        </button>
                        <button 
                            className={`status-pill occupied ${statusFilter === 'occupied' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('occupied')}
                        >
                            <span className="status-dot occupied"></span>
                            Occupied
                            <span className="pill-count">{stats.occupied}</span>
                        </button>
                        <button 
                            className={`status-pill maintenance ${statusFilter === 'maintenance' ? 'active' : ''}`}
                            onClick={() => setStatusFilter('maintenance')}
                        >
                            <span className="status-dot maintenance"></span>
                            Maintenance
                            <span className="pill-count">{stats.maintenance}</span>
                        </button>
                    </div>
                    
                    <div className="view-controls">
                        <button 
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <i className="fas fa-th-large"></i>
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <i className="fas fa-list"></i>
                        </button>
                    </div>
                </div>
                
                {/* Units Display */}
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading units...</p>
                    </div>
                ) : stats.filteredUnits.length === 0 ? (
                    <div className="empty-state-beautiful">
                        <div className="empty-icon">
                            <i className="fas fa-door-open"></i>
                        </div>
                        <h3>No units found</h3>
                        <p>Add your first unit to get started managing your properties</p>
                        <button 
                            className="btn-primary"
                            onClick={() => setShowAddUnit(true)}
                        >
                            <i className="fas fa-plus"></i>
                            Add Your First Unit
                        </button>
                    </div>
                ) : (
                    <div className={`units-container ${viewMode}`}>
                        {viewMode === 'grid' ? (
                            <div className="units-grid">
                                {stats.filteredUnits.map(unit => (
                                    <UnitCardBeautiful 
                                        key={unit.id} 
                                        unit={unit} 
                                        properties={properties}
                                    />
                                ))}
                            </div>
                        ) : (
                            <UnitsListView units={stats.filteredUnits} properties={properties} />
                        )}
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

// Beautiful Unit Card
const UnitCardBeautiful = ({ unit, properties }) => {
    const statusColors = {
        available: '#10b981',
        occupied: '#3b82f6',
        maintenance: '#f59e0b',
        reserved: '#8b5cf6'
    };
    
    const getPropertyName = () => {
        const property = properties.find(p => p.id === unit.property_id);
        return property ? property.name : 'Unknown Property';
    };
    
    const getStatusLabel = (status) => {
        switch(status) {
            case 'available': return 'AVAILABLE';
            case 'occupied': return 'OCCUPIED';
            case 'maintenance': return 'MAINTENANCE';
            case 'reserved': return 'RESERVED';
            default: return status?.toUpperCase() || 'UNKNOWN';
        }
    };
    
    return (
        <div className={`unit-card ${unit.status}`}>
            <div 
                className="unit-status-indicator" 
                style={{backgroundColor: statusColors[unit.status] || '#6b7280'}}
            >
                {getStatusLabel(unit.status)}
            </div>
            
            <div className="unit-header">
                <h3>Unit {unit.unit_number}</h3>
                <p className="unit-property">{getPropertyName()}</p>
            </div>
            
            <div className="unit-specs">
                <div className="spec">
                    <i className="fas fa-bed"></i>
                    <span>{unit.bedrooms || 0} Bed</span>
                </div>
                <div className="spec">
                    <i className="fas fa-bath"></i>
                    <span>{unit.bathrooms || 0} Bath</span>
                </div>
                <div className="spec">
                    <i className="fas fa-ruler-combined"></i>
                    <span>{unit.square_feet || 0} sqft</span>
                </div>
            </div>
            
            {unit.status === 'occupied' && unit.tenant_name && (
                <div className="tenant-info">
                    <div className="tenant-avatar">
                        {unit.tenant_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <p className="tenant-name">{unit.tenant_name}</p>
                        <p className="lease-end">Lease ends {unit.lease_end_date || 'N/A'}</p>
                    </div>
                </div>
            )}
            
            {unit.status === 'available' && (
                <div className="vacancy-info">
                    <i className="fas fa-clock"></i>
                    <span>Ready to rent</span>
                </div>
            )}
            
            <div className="unit-footer">
                <div className="rent-info">
                    <span className="rent-amount">${unit.market_rent || 0}</span>
                    <span className="rent-period">/month</span>
                </div>
                <div className="unit-actions">
                    <button className="action-btn">
                        <i className="fas fa-eye"></i>
                    </button>
                    <button className="action-btn">
                        <i className="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

// List View Component
const UnitsListView = ({ units, properties }) => {
    const getPropertyName = (propertyId) => {
        const property = properties.find(p => p.id === propertyId);
        return property ? property.name : 'Unknown Property';
    };
    
    return (
        <div className="units-list-view">
            <div className="list-header">
                <div className="list-col">Unit</div>
                <div className="list-col">Property</div>
                <div className="list-col">Type</div>
                <div className="list-col">Status</div>
                <div className="list-col">Rent</div>
                <div className="list-col">Actions</div>
            </div>
            {units.map(unit => (
                <div key={unit.id} className="list-row">
                    <div className="list-col">
                        <strong>#{unit.unit_number}</strong>
                        <br />
                        <small>{unit.bedrooms}bd • {unit.bathrooms}ba • {unit.square_feet}sqft</small>
                    </div>
                    <div className="list-col">{getPropertyName(unit.property_id)}</div>
                    <div className="list-col">{unit.unit_type?.replace('_', ' ') || 'N/A'}</div>
                    <div className="list-col">
                        <span className={`status-badge ${unit.status}`}>
                            {unit.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                    </div>
                    <div className="list-col">
                        <strong>${unit.market_rent || 0}</strong>/mo
                    </div>
                    <div className="list-col">
                        <button className="action-btn-small">
                            <i className="fas fa-eye"></i>
                        </button>
                        <button className="action-btn-small">
                            <i className="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Simple Add Unit Modal (you can enhance this)
const AddUnitModal = ({ properties, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        unit_number: '',
        property_id: '',
        unit_type: 'one_bedroom',
        bedrooms: 1,
        bathrooms: 1,
        square_feet: '',
        market_rent: '',
        status: 'available'
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await window.ApiService.post('/units', formData);
            onSave();
        } catch (error) {
            console.error('Error adding unit:', error);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Unit</h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Unit Number</label>
                            <input
                                type="text"
                                value={formData.unit_number}
                                onChange={e => setFormData({...formData, unit_number: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Property</label>
                            <select
                                value={formData.property_id}
                                onChange={e => setFormData({...formData, property_id: e.target.value})}
                                required
                            >
                                <option value="">Select Property</option>
                                {properties.map(prop => (
                                    <option key={prop.id} value={prop.id}>{prop.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Bedrooms</label>
                            <input
                                type="number"
                                value={formData.bedrooms}
                                onChange={e => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Bathrooms</label>
                            <input
                                type="number"
                                step="0.5"
                                value={formData.bathrooms}
                                onChange={e => setFormData({...formData, bathrooms: parseFloat(e.target.value)})}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label>Square Feet</label>
                            <input
                                type="number"
                                value={formData.square_feet}
                                onChange={e => setFormData({...formData, square_feet: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Market Rent</label>
                            <input
                                type="number"
                                value={formData.market_rent}
                                onChange={e => setFormData({...formData, market_rent: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="available">Available</option>
                                <option value="occupied">Occupied</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="reserved">Reserved</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Add Unit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};