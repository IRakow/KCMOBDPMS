// /documents/front new/src/pages/Units.jsx
const Units = () => {
    const [units, setUnits] = React.useState([]);
    const [properties, setProperties] = React.useState([]);
    const [selectedProperty, setSelectedProperty] = React.useState('all');
    const [viewMode, setViewMode] = React.useState('grid'); // grid, list, floor
    const [filters, setFilters] = React.useState({
        search: '',
        status: 'all', // all, vacant, occupied, maintenance
        type: 'all'
    });
    const [showAddUnit, setShowAddUnit] = React.useState(false);
    const [viewingUnit, setViewingUnit] = React.useState(null);
    const [editingUnit, setEditingUnit] = React.useState(null);
    
    // Mock data for demo
    const mockUnits = [
        {
            id: 1,
            unit_number: '101',
            property_id: 1,
            property_name: 'Sunset Apartments',
            status: 'occupied',
            bedrooms: 2,
            bathrooms: 2,
            square_feet: 950,
            rent_amount: 2200,
            market_rent: 2400,
            tenant_name: 'John Smith',
            lease_end_date: '2024-10-15',
            floor: 1
        },
        {
            id: 2,
            unit_number: '102',
            property_id: 1,
            property_name: 'Sunset Apartments',
            status: 'vacant',
            bedrooms: 1,
            bathrooms: 1,
            square_feet: 750,
            rent_amount: 1800,
            market_rent: 1850,
            days_vacant: 15,
            floor: 1
        },
        {
            id: 3,
            unit_number: '201',
            property_id: 1,
            property_name: 'Sunset Apartments',
            status: 'maintenance',
            bedrooms: 3,
            bathrooms: 2,
            square_feet: 1200,
            rent_amount: 2800,
            market_rent: 2900,
            floor: 2
        },
        {
            id: 4,
            unit_number: '202',
            property_id: 1,
            property_name: 'Sunset Apartments',
            status: 'occupied',
            bedrooms: 2,
            bathrooms: 2,
            square_feet: 950,
            rent_amount: 2250,
            market_rent: 2400,
            tenant_name: 'Sarah Johnson',
            lease_end_date: '2025-03-20',
            floor: 2
        },
        {
            id: 5,
            unit_number: 'A1',
            property_id: 2,
            property_name: 'Downtown Office Plaza',
            status: 'vacant',
            bedrooms: 0,
            bathrooms: 2,
            square_feet: 2500,
            rent_amount: 5000,
            market_rent: 5200,
            days_vacant: 45,
            floor: 1
        }
    ];
    
    const mockProperties = [
        { id: 1, name: 'Sunset Apartments', total_units: 24 },
        { id: 2, name: 'Downtown Office Plaza', total_units: 8 },
        { id: 3, name: 'Garden View Townhomes', total_units: 16 }
    ];
    
    React.useEffect(() => {
        // Load mock data
        setUnits(mockUnits);
        setProperties(mockProperties);
    }, []);
    
    // Helper functions
    const calculateOccupancy = (unitsList) => {
        if (!unitsList.length) return 0;
        const occupied = unitsList.filter(u => u.status === 'occupied').length;
        return Math.round((occupied / unitsList.length) * 100);
    };
    
    const countVacant = (unitsList) => {
        return unitsList.filter(u => u.status === 'vacant').length;
    };
    
    const calculateAvgRent = (unitsList) => {
        if (!unitsList.length) return '$0';
        const total = unitsList.reduce((sum, u) => sum + (u.rent_amount || 0), 0);
        return `$${Math.round(total / unitsList.length).toLocaleString()}`;
    };
    
    const countByStatus = (unitsList, status) => {
        return unitsList.filter(u => u.status === status).length;
    };
    
    const daysBetween = (date1, date2) => {
        const oneDay = 24 * 60 * 60 * 1000;
        return Math.round(Math.abs((date1 - date2) / oneDay));
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    // Filter units based on criteria
    const filteredUnits = units.filter(unit => {
        if (selectedProperty !== 'all' && unit.property_id !== parseInt(selectedProperty)) {
            return false;
        }
        if (filters.status !== 'all' && unit.status !== filters.status) {
            return false;
        }
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            const searchableText = `${unit.unit_number} ${unit.property_name} ${unit.tenant_name || ''}`.toLowerCase();
            if (!searchableText.includes(searchLower)) {
                return false;
            }
        }
        return true;
    });
    
    return (
        <div className="units-page">
            {/* Smart Insights Bar */}
            <div className="insights-bar">
                <InsightCard
                    type="alert"
                    icon="fa-door-open"
                    title="5 Units Vacant > 30 Days"
                    subtitle="Potential revenue loss: $7,500/mo"
                    action="View Units"
                    onClick={() => setFilters({...filters, status: 'vacant'})}
                />
                
                <InsightCard
                    type="warning"
                    icon="fa-tools"
                    title="3 Units Need Maintenance"
                    subtitle="Schedule repairs to avoid vacancies"
                    action="Schedule"
                />
                
                <InsightCard
                    type="success"
                    icon="fa-dollar-sign"
                    title="Market Rent Opportunity"
                    subtitle="12 units below market rate"
                    action="Analyze"
                />
            </div>
            
            {/* Page Header with Stats */}
            <div className="page-header">
                <div className="header-content">
                    <h1>Units Management</h1>
                    <div className="header-stats">
                        <StatBadge 
                            label="Total Units" 
                            value={units.length}
                            icon="fa-door-open"
                        />
                        <StatBadge 
                            label="Occupied" 
                            value={`${calculateOccupancy(units)}%`}
                            icon="fa-users"
                            trend="+2.3%"
                            trendUp={true}
                        />
                        <StatBadge 
                            label="Available Now" 
                            value={countVacant(units)}
                            icon="fa-key"
                        />
                        <StatBadge 
                            label="Avg Rent" 
                            value={calculateAvgRent(units)}
                            icon="fa-dollar-sign"
                            trend="+$45"
                            trendUp={true}
                        />
                    </div>
                </div>
                
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <i className="fas fa-upload"></i>
                        Import Units
                    </button>
                    <button 
                        className="btn btn-primary"
                        onClick={() => setShowAddUnit(true)}
                    >
                        <i className="fas fa-plus"></i>
                        Add Unit
                    </button>
                </div>
            </div>
            
            {/* Advanced Filters Bar */}
            <div className="filters-bar">
                <div className="property-selector">
                    <select 
                        value={selectedProperty}
                        onChange={(e) => setSelectedProperty(e.target.value)}
                        className="property-dropdown"
                    >
                        <option value="all">All Properties</option>
                        {properties.map(prop => (
                            <option key={prop.id} value={prop.id}>
                                {prop.name} ({prop.total_units} units)
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search unit number, tenant, features..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                </div>
                
                <div className="filter-pills">
                    <FilterPill
                        label="All Status"
                        active={filters.status === 'all'}
                        onClick={() => setFilters({...filters, status: 'all'})}
                        count={units.length}
                    />
                    <FilterPill
                        label="Vacant"
                        active={filters.status === 'vacant'}
                        onClick={() => setFilters({...filters, status: 'vacant'})}
                        count={countByStatus(units, 'vacant')}
                        color="success"
                    />
                    <FilterPill
                        label="Occupied"
                        active={filters.status === 'occupied'}
                        onClick={() => setFilters({...filters, status: 'occupied'})}
                        count={countByStatus(units, 'occupied')}
                        color="primary"
                    />
                    <FilterPill
                        label="Maintenance"
                        active={filters.status === 'maintenance'}
                        onClick={() => setFilters({...filters, status: 'maintenance'})}
                        count={countByStatus(units, 'maintenance')}
                        color="warning"
                    />
                </div>
                
                <div className="view-toggle">
                    <button 
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        <i className="fas fa-th"></i>
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        <i className="fas fa-list"></i>
                    </button>
                    <button 
                        className={`view-btn ${viewMode === 'floor' ? 'active' : ''}`}
                        onClick={() => setViewMode('floor')}
                    >
                        <i className="fas fa-building"></i>
                    </button>
                </div>
            </div>
            
            {/* Units Display */}
            {viewMode === 'grid' && (
                <div className="units-grid">
                    {filteredUnits.map(unit => (
                        <UnitCard 
                            key={unit.id} 
                            unit={unit}
                            onView={() => setViewingUnit(unit)}
                            onEdit={() => setEditingUnit(unit)}
                            daysBetween={daysBetween}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
            )}
            
            {viewMode === 'list' && (
                <UnitsTable 
                    units={filteredUnits}
                    onView={setViewingUnit}
                    onEdit={setEditingUnit}
                />
            )}
            
            {viewMode === 'floor' && (
                <FloorPlanView 
                    units={filteredUnits}
                    onUnitClick={setViewingUnit}
                />
            )}
        </div>
    );
};

// Insight Card Component
const InsightCard = ({ type, icon, title, subtitle, action, onClick }) => {
    return (
        <div className={`insight-card ${type}`}>
            <div className={`insight-icon ${type}`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div className="insight-content">
                <h4>{title}</h4>
                <p>{subtitle}</p>
            </div>
            {action && (
                <button className="insight-action" onClick={onClick}>
                    {action}
                </button>
            )}
        </div>
    );
};

// Stat Badge Component
const StatBadge = ({ label, value, icon, trend, trendUp }) => {
    return (
        <div className="stat-badge">
            <i className={`fas ${icon}`}></i>
            <div className="stat-content">
                <span className="stat-value">{value}</span>
                <span className="stat-label">{label}</span>
                {trend && (
                    <span className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
                        <i className={`fas fa-arrow-${trendUp ? 'up' : 'down'}`}></i>
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
};

// Filter Pill Component
const FilterPill = ({ label, active, onClick, count, color }) => {
    return (
        <button 
            className={`filter-pill ${active ? 'active' : ''} ${color || ''}`}
            onClick={onClick}
        >
            {label} ({count})
        </button>
    );
};

// Enhanced Unit Card Component
const UnitCard = ({ unit, onView, onEdit, daysBetween, formatDate }) => {
    const statusColors = {
        vacant: 'success',
        occupied: 'primary',
        maintenance: 'warning'
    };
    
    const isAvailableSoon = unit.status === 'occupied' && 
        unit.lease_end_date && 
        daysBetween(new Date(), new Date(unit.lease_end_date)) <= 60;
    
    return (
        <div className={`unit-card ${unit.status}`}>
            {/* Quick Actions */}
            <div className="unit-actions">
                <button className="action-btn" onClick={onView}>
                    <i className="fas fa-eye"></i>
                </button>
                <button className="action-btn" onClick={onEdit}>
                    <i className="fas fa-edit"></i>
                </button>
                {unit.status === 'vacant' && (
                    <button className="action-btn primary">
                        <i className="fas fa-user-plus"></i>
                    </button>
                )}
            </div>
            
            {/* Unit Header */}
            <div className="unit-header">
                <h3 className="unit-number">{unit.unit_number}</h3>
                <span className={`status-badge ${statusColors[unit.status]}`}>
                    {unit.status}
                </span>
            </div>
            
            {/* Property Info */}
            <p className="unit-property">
                <i className="fas fa-building"></i>
                {unit.property_name}
            </p>
            
            {/* Unit Details */}
            <div className="unit-details">
                <div className="detail">
                    <i className="fas fa-bed"></i>
                    <span>{unit.bedrooms} bed</span>
                </div>
                <div className="detail">
                    <i className="fas fa-bath"></i>
                    <span>{unit.bathrooms} bath</span>
                </div>
                <div className="detail">
                    <i className="fas fa-ruler-combined"></i>
                    <span>{unit.square_feet} sqft</span>
                </div>
            </div>
            
            {/* Status-specific Info */}
            {unit.status === 'occupied' && (
                <div className="tenant-info">
                    <div className="tenant-avatar">
                        {unit.tenant_name?.charAt(0)}
                    </div>
                    <div>
                        <p className="tenant-name">{unit.tenant_name}</p>
                        <p className="lease-info">
                            Lease ends: {formatDate(unit.lease_end_date)}
                            {isAvailableSoon && (
                                <span className="badge warning">Ending Soon</span>
                            )}
                        </p>
                    </div>
                </div>
            )}
            
            {unit.status === 'vacant' && (
                <div className="vacancy-info">
                    <p className="days-vacant">
                        <i className="fas fa-calendar-times"></i>
                        Vacant for {unit.days_vacant} days
                    </p>
                    <p className="potential-loss">
                        Lost revenue: ${Math.round(unit.days_vacant * (unit.rent_amount / 30))}
                    </p>
                </div>
            )}
            
            {/* Rent Info */}
            <div className="rent-section">
                <div className="rent-amount">
                    <span className="amount">${unit.rent_amount}</span>
                    <span className="period">/month</span>
                </div>
                {unit.market_rent && unit.rent_amount < unit.market_rent && (
                    <div className="market-comparison">
                        <i className="fas fa-chart-line"></i>
                        Below market by ${unit.market_rent - unit.rent_amount}
                    </div>
                )}
            </div>
            
            {/* Quick Actions Footer */}
            <div className="unit-footer">
                {unit.status === 'vacant' && (
                    <>
                        <button className="btn-small primary">
                            <i className="fas fa-bullhorn"></i>
                            List Unit
                        </button>
                        <button className="btn-small secondary">
                            <i className="fas fa-calendar"></i>
                            Schedule Tour
                        </button>
                    </>
                )}
                {unit.status === 'occupied' && (
                    <>
                        <button className="btn-small secondary">
                            <i className="fas fa-tools"></i>
                            Maintenance
                        </button>
                        <button className="btn-small secondary">
                            <i className="fas fa-envelope"></i>
                            Message
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// Units Table Component (for list view)
const UnitsTable = ({ units, onView, onEdit }) => {
    return (
        <div className="units-table-container">
            <table className="units-table">
                <thead>
                    <tr>
                        <th>Unit</th>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Tenant</th>
                        <th>Rent</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {units.map(unit => (
                        <tr key={unit.id}>
                            <td className="unit-number">{unit.unit_number}</td>
                            <td>{unit.property_name}</td>
                            <td>{unit.bedrooms}BR/{unit.bathrooms}BA</td>
                            <td>
                                <span className={`status-badge ${unit.status}`}>
                                    {unit.status}
                                </span>
                            </td>
                            <td>{unit.tenant_name || '-'}</td>
                            <td>${unit.rent_amount}</td>
                            <td>
                                <button className="action-btn" onClick={() => onView(unit)}>
                                    <i className="fas fa-eye"></i>
                                </button>
                                <button className="action-btn" onClick={() => onEdit(unit)}>
                                    <i className="fas fa-edit"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Floor Plan View Component
const FloorPlanView = ({ units, onUnitClick }) => {
    const floors = [...new Set(units.map(u => u.floor))].sort();
    
    return (
        <div className="floor-plan-container">
            {floors.map(floor => (
                <div key={floor} className="floor-section">
                    <h3>Floor {floor}</h3>
                    <div className="floor-units">
                        {units
                            .filter(u => u.floor === floor)
                            .map(unit => (
                                <div 
                                    key={unit.id}
                                    className={`floor-unit ${unit.status}`}
                                    onClick={() => onUnitClick(unit)}
                                >
                                    <span className="unit-label">{unit.unit_number}</span>
                                    <span className="unit-type">{unit.bedrooms}BR</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.Units = Units;