// Working Properties Component with correct API integration
const PropertiesWorking = () => {
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [showAddModal, setShowAddModal] = React.useState(false);
    
    // Load data on mount and subscribe to global state
    React.useEffect(() => {
        loadProperties();
        
        // Subscribe to global properties state
        const unsubscribe = window.AppState.subscribe('properties', setProperties);
        return unsubscribe;
    }, []);
    
    const loadProperties = async () => {
        console.log('Loading properties...');
        try {
            setLoading(true);
            setError(null);
            
            // Use ApiService
            const response = await window.ApiService.get('/properties');
            console.log('Properties response:', response);
            
            // Extract results array from response
            const propertiesData = response.results || [];
            
            // Update local and global state
            setProperties(propertiesData);
            window.AppState.setState('properties', propertiesData);
            
            if (window.showNotification) {
                window.showNotification('success', `Loaded ${propertiesData.length} properties`);
            }
            
        } catch (err) {
            console.error('Failed to load properties:', err);
            setError(err.message);
            
            if (window.showNotification) {
                window.showNotification('error', 'Failed to load properties');
            }
        } finally {
            setLoading(false);
        }
    };
    
    const handleAddProperty = async (formData) => {
        try {
            console.log('Adding property:', formData);
            
            // Transform the nested address to flat fields for API
            const apiData = {
                name: formData.name,
                property_type: formData.property_type,
                address_line1: formData.address_line1,
                address_line2: formData.address_line2 || '',
                city: formData.city,
                state: formData.state,
                postal_code: formData.postal_code,
                country: formData.country || 'United States',
                total_units: formData.total_units,
                year_built: formData.year_built,
                features: formData.features || [],
                amenities: formData.amenities || {}
            };
            
            const newProperty = await window.ApiService.post('/properties', apiData);
            console.log('Property created:', newProperty);
            
            // Refresh the list
            await loadProperties();
            setShowAddModal(false);
            
            if (window.showNotification) {
                window.showNotification('success', 'Property added successfully!');
            }
            
        } catch (err) {
            console.error('Failed to add property:', err);
            if (window.showNotification) {
                window.showNotification('error', 'Failed to add property: ' + err.message);
            }
        }
    };
    
    // Calculate stats
    const stats = React.useMemo(() => {
        const totalUnits = properties.reduce((sum, p) => sum + (p.total_units || 0), 0);
        const avgOccupancy = properties.length > 0 
            ? properties.reduce((sum, p) => sum + (p.occupancy_rate || 0), 0) / properties.length
            : 0;
        
        return {
            count: properties.length,
            totalUnits,
            avgOccupancy: Math.round(avgOccupancy)
        };
    }, [properties]);
    
    if (loading && properties.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading properties...</p>
            </div>
        );
    }
    
    return (
        <div className="properties-page-modern">
            {/* Header */}
            <div className="page-header-modern">
                <div className="header-content">
                    <h1>Properties</h1>
                    <p className="subtitle">Manage {stats.count} properties with {stats.totalUnits} total units</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn btn-secondary"
                        onClick={loadProperties}
                        disabled={loading}
                    >
                        <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
                        Refresh
                    </button>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="fas fa-plus"></i>
                        Add Property
                    </button>
                </div>
            </div>
            
            {/* Stats Bar */}
            <div className="stats-bar">
                <div className="stat-card">
                    <div className="stat-value">{stats.count}</div>
                    <div className="stat-label">Properties</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalUnits}</div>
                    <div className="stat-label">Total Units</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.avgOccupancy}%</div>
                    <div className="stat-label">Avg Occupancy</div>
                </div>
            </div>
            
            {/* Error State */}
            {error && (
                <div className="error-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                    <button onClick={loadProperties}>Retry</button>
                </div>
            )}
            
            {/* Empty State */}
            {!loading && !error && properties.length === 0 && (
                <div className="empty-state-modern">
                    <i className="fas fa-building"></i>
                    <h3>No Properties Yet</h3>
                    <p>Add your first property to get started</p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowAddModal(true)}
                    >
                        <i className="fas fa-plus"></i>
                        Add Your First Property
                    </button>
                </div>
            )}
            
            {/* Properties Grid */}
            {!loading && !error && properties.length > 0 && (
                <div className="properties-grid-modern">
                    {properties.map(property => (
                        <PropertyCard key={property.id} property={property} onUpdate={loadProperties} />
                    ))}
                </div>
            )}
            
            {/* Add Property Modal */}
            {showAddModal && (
                <AddPropertyModal
                    onClose={() => setShowAddModal(false)}
                    onSave={handleAddProperty}
                />
            )}
        </div>
    );
};

// Property Card Component
const PropertyCard = ({ property, onUpdate }) => {
    const handleEdit = () => {
        // TODO: Implement edit
        console.log('Edit property:', property.id);
    };
    
    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this property?')) {
            try {
                await window.ApiService.delete(`/properties/${property.id}`);
                if (window.showNotification) {
                    window.showNotification('success', 'Property deleted');
                }
                onUpdate();
            } catch (error) {
                if (window.showNotification) {
                    window.showNotification('error', 'Failed to delete property');
                }
            }
        }
    };
    
    return (
        <div className="property-card-modern">
            <div className="property-card-header">
                <h3>{property.name}</h3>
                <div className="property-actions">
                    <button className="btn-icon" onClick={handleEdit}>
                        <i className="fas fa-edit"></i>
                    </button>
                    <button className="btn-icon danger" onClick={handleDelete}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div className="property-details">
                <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{property.full_address || `${property.city}, ${property.state}`}</span>
                </div>
                <div className="detail-item">
                    <i className="fas fa-home"></i>
                    <span>{property.total_units} units</span>
                </div>
                <div className="detail-item">
                    <i className="fas fa-chart-pie"></i>
                    <span>{property.occupancy_rate || 0}% occupied</span>
                </div>
                {property.year_built && (
                    <div className="detail-item">
                        <i className="fas fa-calendar"></i>
                        <span>Built {property.year_built}</span>
                    </div>
                )}
            </div>
            
            <div className="property-stats">
                <div className="stat">
                    <span className="stat-label">Type</span>
                    <span className="stat-value">{property.property_type}</span>
                </div>
                <div className="stat">
                    <span className="stat-label">Vacant</span>
                    <span className="stat-value">{property.vacant_units || 0}</span>
                </div>
            </div>
        </div>
    );
};

// Add Property Modal
const AddPropertyModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        name: '',
        property_type: 'single_family',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        total_units: 1,
        year_built: new Date().getFullYear(),
        features: []
    });
    const [saving, setSaving] = React.useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-modern" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Property</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Property Name *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            placeholder="e.g., Sunset Apartments"
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Property Type *</label>
                        <select
                            className="form-control"
                            value={formData.property_type}
                            onChange={e => setFormData({...formData, property_type: e.target.value})}
                        >
                            <option value="single_family">Single Family</option>
                            <option value="multi_family">Multi Family</option>
                            <option value="apartment">Apartment Complex</option>
                            <option value="condo">Condo</option>
                            <option value="townhouse">Townhouse</option>
                            <option value="commercial">Commercial</option>
                        </select>
                    </div>
                    
                    <div className="form-section">
                        <h3>Address</h3>
                        
                        <div className="form-group">
                            <label>Street Address *</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.address_line1}
                                onChange={e => setFormData({...formData, address_line1: e.target.value})}
                                placeholder="123 Main Street"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Address Line 2</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.address_line2}
                                onChange={e => setFormData({...formData, address_line2: e.target.value})}
                                placeholder="Apt, Suite, Floor (optional)"
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>City *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.city}
                                    onChange={e => setFormData({...formData, city: e.target.value})}
                                    placeholder="Austin"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>State *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.state}
                                    onChange={e => setFormData({...formData, state: e.target.value})}
                                    placeholder="TX"
                                    maxLength="2"
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>ZIP Code *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.postal_code}
                                    onChange={e => setFormData({...formData, postal_code: e.target.value})}
                                    placeholder="78701"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Total Units *</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.total_units}
                                onChange={e => setFormData({...formData, total_units: parseInt(e.target.value)})}
                                min="1"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Year Built</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.year_built}
                                onChange={e => setFormData({...formData, year_built: parseInt(e.target.value)})}
                                min="1900"
                                max={new Date().getFullYear()}
                            />
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Creating...' : 'Create Property'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Styles for modern properties page
const propertiesStyles = `
.properties-page-modern {
    padding: 24px;
    background: #f8fafc;
    min-height: 100vh;
}

.page-header-modern {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    color: #1f2937;
}

.subtitle {
    margin: 4px 0 0 0;
    color: #6b7280;
}

.header-actions {
    display: flex;
    gap: 12px;
}

.stats-bar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.stat-value {
    font-size: 36px;
    font-weight: 700;
    color: #1f2937;
}

.stat-label {
    font-size: 14px;
    color: #6b7280;
    margin-top: 4px;
}

.properties-grid-modern {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.property-card-modern {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
}

.property-card-modern:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.property-card-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 20px;
}

.property-card-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2937;
}

.property-actions {
    display: flex;
    gap: 8px;
}

.property-details {
    margin-bottom: 20px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 0;
    color: #6b7280;
    font-size: 14px;
}

.detail-item i {
    width: 16px;
    color: #9ca3af;
}

.property-stats {
    display: flex;
    gap: 24px;
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
}

.property-stats .stat {
    display: flex;
    flex-direction: column;
}

.property-stats .stat-label {
    font-size: 12px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.property-stats .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-top: 2px;
}

.modal-modern {
    max-width: 600px;
    width: 90%;
}

.form-section {
    margin: 24px 0;
}

.form-section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
}

.empty-state-modern {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state-modern i {
    font-size: 64px;
    color: #e5e7eb;
    margin-bottom: 24px;
}

.empty-state-modern h3 {
    font-size: 24px;
    color: #1f2937;
    margin: 0 0 8px 0;
}

.empty-state-modern p {
    color: #6b7280;
    margin: 0 0 24px 0;
}
`;

// Inject styles
if (!document.querySelector('#properties-working-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'properties-working-styles';
    styleSheet.textContent = propertiesStyles;
    document.head.appendChild(styleSheet);
}

// Register component
window.PropertiesWorking = PropertiesWorking;
window.AppModules = window.AppModules || {};
window.AppModules.PropertiesWorking = PropertiesWorking;