// PropertiesFixed.jsx - Complete working version
const PropertiesFixed = () => {
    const [properties, setProperties] = React.useState([
        {
            id: 1,
            name: 'Sunset Apartments',
            type: 'RESIDENTIAL',
            address: '123 Sunset Blvd, Los Angeles, CA 90028',
            units: 24,
            occupancy: 91.7,
            revenue: 62700
        },
        {
            id: 2,
            name: 'Downtown Office Plaza',
            type: 'COMMERCIAL',
            address: '456 Business Ave, San Francisco, CA 94105',
            units: 8,
            occupancy: 75,
            revenue: 51000
        },
        {
            id: 3,
            name: 'Garden View Townhomes',
            type: 'RESIDENTIAL',
            address: '789 Garden St, Austin, TX 78701',
            units: 16,
            occupancy: 87.5,
            revenue: 30800
        }
    ]);
    
    const [searchTerm, setSearchTerm] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState('All Types');
    const [statusFilter, setStatusFilter] = React.useState('All Status');
    
    return (
        <div className="properties-page-fixed">
            {/* Alert Cards Section */}
            <div className="alerts-container">
                <div className="alert-item warning">
                    <div className="alert-icon-wrapper warning">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="alert-content">
                        <h4>3 Properties Need Attention</h4>
                        <p>High vacancy rates detected</p>
                    </div>
                    <button className="alert-button">View</button>
                </div>
                
                <div className="alert-item success">
                    <div className="alert-icon-wrapper success">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="alert-content">
                        <h4>Revenue Up 12%</h4>
                        <p>Compared to last month</p>
                    </div>
                </div>
                
                <div className="alert-item info">
                    <div className="alert-icon-wrapper info">
                        <i className="fas fa-lightbulb"></i>
                    </div>
                    <div className="alert-content">
                        <h4>Optimization Available</h4>
                        <p>2 properties below market rent</p>
                    </div>
                    <button className="alert-button">Review</button>
                </div>
            </div>
            
            {/* Main Header */}
            <div className="properties-header">
                <div className="header-content">
                    <h1>Properties</h1>
                    <div className="header-stats">
                        <span><strong>3</strong> TOTAL</span>
                        <span><strong>88%</strong> OCCUPIED</span>
                        <span><strong>$144.5K</strong> MONTHLY REVENUE</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <i className="fas fa-filter"></i>
                        Filter
                    </button>
                    <button className="btn btn-secondary">
                        <i className="fas fa-download"></i>
                        Export
                    </button>
                    <button className="btn btn-primary">
                        <i className="fas fa-plus"></i>
                        Add Property
                    </button>
                </div>
            </div>
            
            {/* Search and Filter Bar */}
            <div className="search-filter-bar">
                <div className="search-input-wrapper">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search properties, addresses, units..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select 
                    className="filter-dropdown"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option>All Types</option>
                    <option>Residential</option>
                    <option>Commercial</option>
                </select>
                
                <select 
                    className="filter-dropdown"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Maintenance</option>
                </select>
            </div>
            
            {/* Properties List */}
            <div className="properties-list">
                {properties.map(property => (
                    <div key={property.id} className="property-item">
                        <div className="property-header">
                            <h3>{property.name}</h3>
                            <span className="property-type">{property.type}</span>
                        </div>
                        
                        <p className="property-address">{property.address}</p>
                        
                        <div className="property-stats">
                            <div className="stat">
                                <div className="stat-value">{property.units}</div>
                                <div className="stat-label">UNITS</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value" style={{color: property.occupancy > 90 ? '#22c55e' : '#f59e0b'}}>
                                    {property.occupancy}%
                                </div>
                                <div className="stat-label">OCCUPIED</div>
                            </div>
                            <div className="stat">
                                <div className="stat-value">${(property.revenue / 1000).toFixed(1)}K</div>
                                <div className="stat-label">REVENUE</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.PropertiesFixed = PropertiesFixed;