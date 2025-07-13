const Leases = () => {
    const [leases, setLeases] = React.useState([]);
    const [showCreateLease, setShowCreateLease] = React.useState(false);
    const [filters, setFilters] = React.useState({
        status: 'all', // all, active, expiring, expired
        property: 'all',
        search: ''
    });
    
    React.useEffect(() => {
        loadLeases();
    }, [filters]);
    
    const loadLeases = async () => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value && value !== 'all') params.append(key, value);
            });
            
            const response = await fetch(`http://localhost:8000/api/leases?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            
            const data = await response.json();
            setLeases(data);
        } catch (error) {
            console.error('Failed to load leases:', error);
            // Use mock data for demo
            setLeases(mockLeases);
        }
    };
    
    // Helper functions
    const daysBetween = (date1, date2) => {
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };
    
    const showToast = (type, message) => {
        console.log(`Toast [${type}]: ${message}`);
    };
    
    const viewLease = (lease) => {
        console.log('View lease:', lease);
        // Implement view lease logic
    };
    
    const renewLease = (lease) => {
        console.log('Renew lease:', lease);
        // Implement renew lease logic
    };
    
    // Calculate lease statistics
    const stats = React.useMemo(() => {
        const active = leases.filter(l => l.status === 'active').length;
        const expiringSoon = leases.filter(l => {
            const daysLeft = daysBetween(new Date(), new Date(l.end_date));
            return daysLeft > 0 && daysLeft <= 60;
        }).length;
        
        const totalMonthlyRent = leases
            .filter(l => l.status === 'active')
            .reduce((sum, l) => sum + l.rent_amount, 0);
        
        return { active, expiringSoon, totalMonthlyRent };
    }, [leases]);
    
    return (
        <div className="leases-page">
            {/* Alerts Bar */}
            <div className="alerts-bar">
                <AlertCard
                    type="warning"
                    icon="fa-clock"
                    title={`${stats.expiringSoon} Leases Expiring Soon`}
                    subtitle="Action needed within 60 days"
                    action="Review"
                    onClick={() => setFilters({...filters, status: 'expiring'})}
                />
                <AlertCard
                    type="info"
                    icon="fa-file-signature"
                    title="5 Renewals Available"
                    subtitle="Send renewal offers"
                    action="Send Offers"
                />
                <AlertCard
                    type="success"
                    icon="fa-dollar-sign"
                    title={`$${formatNumber(stats.totalMonthlyRent)} Monthly`}
                    subtitle="Total rent from active leases"
                />
            </div>
            
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Lease Management</h1>
                    <p className="subtitle">{stats.active} active leases</p>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateLease(true)}
                >
                    <i className="fas fa-plus"></i>
                    Create Lease
                </button>
            </div>
            
            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by tenant, unit, property..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                    />
                </div>
                
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${filters.status === 'all' ? 'active' : ''}`}
                        onClick={() => setFilters({...filters, status: 'all'})}
                    >
                        All Leases
                    </button>
                    <button 
                        className={`filter-btn ${filters.status === 'active' ? 'active' : ''}`}
                        onClick={() => setFilters({...filters, status: 'active'})}
                    >
                        Active
                    </button>
                    <button 
                        className={`filter-btn ${filters.status === 'expiring' ? 'active' : ''}`}
                        onClick={() => setFilters({...filters, status: 'expiring'})}
                    >
                        Expiring Soon
                    </button>
                    <button 
                        className={`filter-btn ${filters.status === 'expired' ? 'active' : ''}`}
                        onClick={() => setFilters({...filters, status: 'expired'})}
                    >
                        Expired
                    </button>
                </div>
            </div>
            
            {/* Leases Table */}
            <div className="leases-table-container">
                <table className="leases-table">
                    <thead>
                        <tr>
                            <th>Tenant</th>
                            <th>Property / Unit</th>
                            <th>Term</th>
                            <th>Rent</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leases.map(lease => (
                            <LeaseRow 
                                key={lease.id} 
                                lease={lease}
                                onView={() => viewLease(lease)}
                                onRenew={() => renewLease(lease)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Create Lease Modal */}
            {showCreateLease && (
                <CreateLeaseModal
                    onClose={() => setShowCreateLease(false)}
                    onSave={() => {
                        setShowCreateLease(false);
                        loadLeases();
                    }}
                />
            )}
        </div>
    );
};

// Alert Card Component
const AlertCard = ({ type, icon, title, subtitle, action, onClick }) => {
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

// Lease Row Component
const LeaseRow = ({ lease, onView, onRenew }) => {
    const daysBetween = (date1, date2) => {
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    const daysRemaining = daysBetween(new Date(), new Date(lease.end_date));
    const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 60;
    
    return (
        <tr className={isExpiringSoon ? 'expiring-soon' : ''}>
            <td>
                <div className="tenant-cell">
                    <div className="tenant-avatar">
                        {lease.tenant_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div className="tenant-name">{lease.tenant_name}</div>
                        <div className="tenant-email">{lease.tenant_email}</div>
                    </div>
                </div>
            </td>
            <td>
                <div className="property-cell">
                    <div className="property-name">{lease.property_name}</div>
                    <div className="unit-number">Unit {lease.unit_number}</div>
                </div>
            </td>
            <td>
                <div className="term-cell">
                    <div>{formatDate(lease.start_date)} - {formatDate(lease.end_date)}</div>
                    <div className="term-length">{lease.term_months} months</div>
                </div>
            </td>
            <td>
                <div className="rent-cell">
                    <div className="rent-amount">${lease.rent_amount}/mo</div>
                    <div className="deposit">Deposit: ${lease.security_deposit}</div>
                </div>
            </td>
            <td>
                <div className="status-cell">
                    <span className={`lease-status ${lease.status}`}>
                        {lease.status}
                    </span>
                    {isExpiringSoon && (
                        <div className="expiry-warning">
                            {daysRemaining} days left
                        </div>
                    )}
                </div>
            </td>
            <td>
                <div className="actions-cell">
                    <button className="btn-icon" onClick={onView}>
                        <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn-icon">
                        <i className="fas fa-download"></i>
                    </button>
                    {isExpiringSoon && (
                        <button className="btn-icon primary" onClick={onRenew}>
                            <i className="fas fa-redo"></i>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

// Create Lease Modal
const CreateLeaseModal = ({ onClose, onSave }) => {
    const [step, setStep] = React.useState(1); // 1: Select Unit, 2: Select Tenant, 3: Lease Terms
    const [selectedUnit, setSelectedUnit] = React.useState(null);
    const [selectedTenant, setSelectedTenant] = React.useState(null);
    const [leaseTerms, setLeaseTerms] = React.useState({
        start_date: '',
        term_months: 12,
        rent_amount: '',
        security_deposit: '',
        pet_deposit: 0,
        utilities_included: [],
        late_fee: 50,
        grace_period_days: 5
    });
    
    const handleSubmit = async () => {
        const leaseData = {
            unit_id: selectedUnit.id,
            tenant_id: selectedTenant.id,
            ...leaseTerms
        };
        
        try {
            const response = await fetch('http://localhost:8000/api/leases', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(leaseData)
            });
            
            if (response.ok) {
                showToast('success', 'Lease created successfully');
                onSave();
            }
        } catch (error) {
            showToast('error', 'Failed to create lease');
        }
    };
    
    const showToast = (type, message) => {
        console.log(`Toast [${type}]: ${message}`);
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Lease</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    {/* Progress Steps */}
                    <div className="lease-steps">
                        <div className={`step ${step >= 1 ? 'active' : ''}`}>
                            <span className="step-number">1</span>
                            <span className="step-label">Select Unit</span>
                        </div>
                        <div className={`step ${step >= 2 ? 'active' : ''}`}>
                            <span className="step-number">2</span>
                            <span className="step-label">Select Tenant</span>
                        </div>
                        <div className={`step ${step >= 3 ? 'active' : ''}`}>
                            <span className="step-number">3</span>
                            <span className="step-label">Lease Terms</span>
                        </div>
                    </div>
                    
                    {/* Step Content */}
                    {step === 1 && (
                        <UnitSelection 
                            onSelect={(unit) => {
                                setSelectedUnit(unit);
                                setLeaseTerms({...leaseTerms, rent_amount: unit.rent_amount});
                                setStep(2);
                            }}
                        />
                    )}
                    
                    {step === 2 && (
                        <TenantSelection 
                            onSelect={(tenant) => {
                                setSelectedTenant(tenant);
                                setStep(3);
                            }}
                        />
                    )}
                    
                    {step === 3 && (
                        <LeaseTermsForm
                            unit={selectedUnit}
                            tenant={selectedTenant}
                            terms={leaseTerms}
                            onChange={setLeaseTerms}
                            onSubmit={handleSubmit}
                        />
                    )}
                </div>
                
                <div className="modal-footer">
                    {step > 1 && (
                        <button 
                            className="btn btn-secondary"
                            onClick={() => setStep(step - 1)}
                        >
                            Back
                        </button>
                    )}
                    {step < 3 && (
                        <button 
                            className="btn btn-primary"
                            disabled={!selectedUnit && step === 1}
                            onClick={() => setStep(step + 1)}
                        >
                            Next
                        </button>
                    )}
                    {step === 3 && (
                        <button 
                            className="btn btn-primary"
                            onClick={handleSubmit}
                        >
                            Create Lease
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Unit Selection Component
const UnitSelection = ({ onSelect }) => {
    const mockUnits = [
        {
            id: 1,
            property_name: 'Sunset Apartments',
            unit_number: '205',
            bedrooms: 2,
            bathrooms: 2,
            rent_amount: 2400,
            status: 'vacant'
        },
        {
            id: 2,
            property_name: 'Garden View Townhomes',
            unit_number: '410',
            bedrooms: 3,
            bathrooms: 2.5,
            rent_amount: 2100,
            status: 'vacant'
        },
        {
            id: 3,
            property_name: 'Downtown Office Plaza',
            unit_number: 'B12',
            bedrooms: 0,
            bathrooms: 1,
            rent_amount: 3500,
            status: 'vacant'
        }
    ];
    
    return (
        <div className="unit-selection">
            <h3>Select an Available Unit</h3>
            <div className="units-grid">
                {mockUnits.map(unit => (
                    <div 
                        key={unit.id}
                        className="unit-card selectable"
                        onClick={() => onSelect(unit)}
                    >
                        <h4>{unit.property_name}</h4>
                        <p>Unit {unit.unit_number}</p>
                        <p className="rent-amount">${unit.rent_amount}/mo</p>
                        <p className="unit-type">{unit.bedrooms} BR / {unit.bathrooms} BA</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Tenant Selection Component
const TenantSelection = ({ onSelect }) => {
    const mockTenants = [
        {
            id: 1,
            first_name: 'Emily',
            last_name: 'Davis',
            name: 'Emily Davis',
            email: 'emily.d@email.com',
            phone: '(555) 123-4567',
            status: 'applicant',
            screening_result: {
                credit_score: 720,
                recommendation: 'Approve'
            }
        },
        {
            id: 2,
            first_name: 'Robert',
            last_name: 'Wilson',
            name: 'Robert Wilson',
            email: 'rwilson@email.com',
            phone: '(555) 234-5678',
            status: 'applicant',
            screening_result: {
                credit_score: 680,
                recommendation: 'Review'
            }
        },
        {
            id: 3,
            first_name: 'Lisa',
            last_name: 'Chen',
            name: 'Lisa Chen',
            email: 'lisa.chen@email.com',
            phone: '(555) 345-6789',
            status: 'applicant',
            screening_result: {
                credit_score: 750,
                recommendation: 'Approve'
            }
        }
    ];
    
    return (
        <div className="tenant-selection">
            <h3>Select a Tenant</h3>
            <div className="tenants-list">
                {mockTenants.map(tenant => (
                    <div 
                        key={tenant.id}
                        className="tenant-item selectable"
                        onClick={() => onSelect(tenant)}
                    >
                        <div className="tenant-info">
                            <h4>{tenant.name}</h4>
                            <p>{tenant.email}</p>
                            <p>{tenant.phone}</p>
                        </div>
                        {tenant.screening_result && (
                            <div className="screening-info">
                                <span>Credit Score: {tenant.screening_result.credit_score}</span>
                                <span className={`status ${tenant.screening_result.recommendation === 'Approve' ? 'success' : 'warning'}`}>
                                    {tenant.screening_result.recommendation}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Lease Terms Form Component
const LeaseTermsForm = ({ unit, tenant, terms, onChange, onSubmit }) => {
    const handleInputChange = (field, value) => {
        onChange({ ...terms, [field]: value });
    };
    
    return (
        <div className="lease-terms-form">
            <h3>Lease Terms</h3>
            
            <div className="summary-box">
                <div className="summary-item">
                    <strong>Unit:</strong> {unit.property_name} - Unit {unit.unit_number}
                </div>
                <div className="summary-item">
                    <strong>Tenant:</strong> {tenant.name}
                </div>
            </div>
            
            <div className="form-section">
                <div className="form-row">
                    <div className="form-group">
                        <label>Start Date</label>
                        <input
                            type="date"
                            className="form-control"
                            value={terms.start_date}
                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Term (Months)</label>
                        <select
                            className="form-control"
                            value={terms.term_months}
                            onChange={(e) => handleInputChange('term_months', parseInt(e.target.value))}
                        >
                            <option value={6}>6 months</option>
                            <option value={12}>12 months</option>
                            <option value={18}>18 months</option>
                            <option value={24}>24 months</option>
                        </select>
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Monthly Rent</label>
                        <input
                            type="number"
                            className="form-control"
                            value={terms.rent_amount}
                            onChange={(e) => handleInputChange('rent_amount', parseFloat(e.target.value))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Security Deposit</label>
                        <input
                            type="number"
                            className="form-control"
                            value={terms.security_deposit}
                            onChange={(e) => handleInputChange('security_deposit', parseFloat(e.target.value))}
                            required
                        />
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label>Pet Deposit</label>
                        <input
                            type="number"
                            className="form-control"
                            value={terms.pet_deposit}
                            onChange={(e) => handleInputChange('pet_deposit', parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Late Fee</label>
                        <input
                            type="number"
                            className="form-control"
                            value={terms.late_fee}
                            onChange={(e) => handleInputChange('late_fee', parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mock data for demo
const mockLeases = [
    {
        id: 1,
        tenant_name: 'John Smith',
        tenant_email: 'john.smith@email.com',
        property_name: 'Sunset Apartments',
        unit_number: '101',
        start_date: '2024-01-15',
        end_date: '2025-01-15',
        term_months: 12,
        rent_amount: 2200,
        security_deposit: 2200,
        status: 'active'
    },
    {
        id: 2,
        tenant_name: 'Sarah Johnson',
        tenant_email: 'sarah.j@email.com',
        property_name: 'Downtown Office Plaza',
        unit_number: 'A1',
        start_date: '2023-08-01',
        end_date: '2024-08-31',
        term_months: 12,
        rent_amount: 5000,
        security_deposit: 5000,
        status: 'active'
    },
    {
        id: 3,
        tenant_name: 'Michael Chen',
        tenant_email: 'mchen@email.com',
        property_name: 'Garden View Townhomes',
        unit_number: '305',
        start_date: '2024-02-01',
        end_date: '2025-02-01',
        term_months: 12,
        rent_amount: 1800,
        security_deposit: 1800,
        status: 'active'
    },
    {
        id: 4,
        tenant_name: 'Lisa Park',
        tenant_email: 'lisa.park@email.com',
        property_name: 'Sunset Apartments',
        unit_number: '308',
        start_date: '2022-06-01',
        end_date: '2024-06-01',
        term_months: 24,
        rent_amount: 2000,
        security_deposit: 2000,
        status: 'expired'
    }
];