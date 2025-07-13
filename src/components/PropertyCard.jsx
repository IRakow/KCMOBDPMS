// Property Card Component
const PropertyCard = ({ property, onDelete, onEdit }) => {
    return (
        <div className="property-card">
            <div className="property-header">
                <h3>{property.name}</h3>
                <div className="property-actions">
                    <button onClick={onEdit}>
                        <i className="fas fa-edit"></i>
                    </button>
                    <button onClick={onDelete}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div className="property-details">
                <p>
                    <i className="fas fa-map-marker-alt"></i>
                    {property.address?.street}, {property.address?.city}, {property.address?.state}
                </p>
                <p>
                    <i className="fas fa-home"></i>
                    {property.total_units || 0} units
                </p>
                <p>
                    <i className="fas fa-percentage"></i>
                    {property.occupancy_rate || 0}% occupied
                </p>
            </div>
            
            <div className="property-stats">
                <div className="stat">
                    <span className="stat-value">${property.monthly_revenue || 0}</span>
                    <span className="stat-label">Monthly Revenue</span>
                </div>
            </div>
        </div>
    );
};

// Register the component
window.AppModules = window.AppModules || {};
window.AppModules.PropertyCard = PropertyCard;