// /documents/front new/src/pages/Payments.jsx
const Payments = () => {
    const [payments, setPayments] = React.useState([]);
    const [upcomingPayments, setUpcomingPayments] = React.useState([]);
    const [overduePayments, setOverduePayments] = React.useState([]);
    const [showCollectPayment, setShowCollectPayment] = React.useState(false);
    const [stats, setStats] = React.useState({
        collected: 0,
        pending: 0,
        overdue: 0
    });
    
    // Mock data
    const mockPayments = [
        {
            id: 1,
            date: '2024-07-01',
            tenant_name: 'John Smith',
            property_name: 'Sunset Apartments',
            unit_number: '101',
            amount: 2200,
            method: 'Card',
            status: 'completed',
            transaction_id: 'PAY-001234'
        },
        {
            id: 2,
            date: '2024-07-01',
            tenant_name: 'Sarah Johnson',
            property_name: 'Downtown Office Plaza',
            unit_number: 'A1',
            amount: 5000,
            method: 'ACH',
            status: 'completed',
            transaction_id: 'PAY-001235'
        },
        {
            id: 3,
            date: '2024-06-28',
            tenant_name: 'Michael Chen',
            property_name: 'Garden View Townhomes',
            unit_number: '305',
            amount: 1800,
            method: 'Card',
            status: 'completed',
            transaction_id: 'PAY-001233'
        }
    ];
    
    const mockOverduePayments = [
        {
            id: 1,
            tenant_name: 'Emily Davis',
            unit_number: '204',
            amount: 2000,
            due_date: '2024-06-01',
            days_overdue: 30,
            phone: '(555) 456-7890',
            email: 'emily.davis@email.com'
        },
        {
            id: 2,
            tenant_name: 'Robert Wilson',
            unit_number: '302',
            amount: 1500,
            due_date: '2024-06-15',
            days_overdue: 16,
            phone: '(555) 567-8901',
            email: 'rwilson@email.com'
        }
    ];
    
    const mockUpcomingPayments = [
        {
            id: 1,
            tenant_name: 'Lisa Anderson',
            unit_number: '405',
            amount: 2300,
            due_date: '2024-08-01'
        },
        {
            id: 2,
            tenant_name: 'James Martinez',
            unit_number: '106',
            amount: 1900,
            due_date: '2024-08-01'
        }
    ];
    
    React.useEffect(() => {
        // Simulate loading data
        setPayments(mockPayments);
        setOverduePayments(mockOverduePayments);
        setUpcomingPayments(mockUpcomingPayments);
        
        // Calculate stats
        const collected = mockPayments.reduce((sum, p) => sum + p.amount, 0);
        const overdue = mockOverduePayments.reduce((sum, p) => sum + p.amount, 0);
        const pending = mockUpcomingPayments.reduce((sum, p) => sum + p.amount, 0);
        
        setStats({ collected, pending, overdue });
    }, []);
    
    const formatNumber = (num) => {
        return num.toLocaleString();
    };
    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    const showToast = (type, message) => {
        console.log(`${type}: ${message}`);
    };
    
    return (
        <div className="payments-page">
            {/* Revenue Dashboard */}
            <div className="revenue-dashboard">
                <div className="revenue-card primary">
                    <div className="card-icon">
                        <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="card-content">
                        <h3>Collected This Month</h3>
                        <div className="amount">${formatNumber(stats.collected)}</div>
                        <div className="trend positive">
                            <i className="fas fa-arrow-up"></i>
                            12% vs last month
                        </div>
                    </div>
                </div>
                
                <div className="revenue-card warning">
                    <div className="card-icon">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="card-content">
                        <h3>Pending Payments</h3>
                        <div className="amount">${formatNumber(stats.pending)}</div>
                        <div className="count">{upcomingPayments.length} payments</div>
                    </div>
                </div>
                
                <div className="revenue-card danger">
                    <div className="card-icon">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="card-content">
                        <h3>Overdue</h3>
                        <div className="amount">${formatNumber(stats.overdue)}</div>
                        <div className="count">{overduePayments.length} payments</div>
                    </div>
                </div>
            </div>
            
            {/* Quick Actions */}
            <div className="payment-actions">
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowCollectPayment(true)}
                >
                    <i className="fas fa-credit-card"></i>
                    Collect Payment
                </button>
                <button className="btn btn-secondary">
                    <i className="fas fa-paper-plane"></i>
                    Send Reminders
                </button>
                <button className="btn btn-secondary">
                    <i className="fas fa-file-invoice"></i>
                    Generate Invoices
                </button>
            </div>
            
            {/* Overdue Payments Alert */}
            {overduePayments.length > 0 && (
                <div className="overdue-alert">
                    <h3>Overdue Payments Requiring Action</h3>
                    <div className="overdue-list">
                        {overduePayments.map(payment => (
                            <div key={payment.id} className="overdue-item">
                                <div className="tenant-info">
                                    <strong>{payment.tenant_name}</strong>
                                    <span>{payment.unit_number}</span>
                                </div>
                                <div className="overdue-details">
                                    <span className="amount">${payment.amount}</span>
                                    <span className="days-overdue">
                                        {payment.days_overdue} days overdue
                                    </span>
                                </div>
                                <div className="overdue-actions">
                                    <button className="btn-small">
                                        <i className="fas fa-phone"></i>
                                        Call
                                    </button>
                                    <button className="btn-small">
                                        <i className="fas fa-envelope"></i>
                                        Email
                                    </button>
                                    <button className="btn-small primary">
                                        <i className="fas fa-credit-card"></i>
                                        Collect
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Recent Payments */}
            <div className="recent-payments">
                <h3>Recent Payments</h3>
                <table className="payments-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Tenant</th>
                            <th>Property/Unit</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map(payment => (
                            <PaymentRow 
                                key={payment.id} 
                                payment={payment} 
                                formatDate={formatDate}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Collect Payment Modal */}
            {showCollectPayment && (
                <CollectPaymentModal
                    onClose={() => setShowCollectPayment(false)}
                    onSuccess={() => {
                        setShowCollectPayment(false);
                        // Reload payments
                        setPayments([...payments]);
                    }}
                    showToast={showToast}
                />
            )}
        </div>
    );
};

// Payment Row Component
const PaymentRow = ({ payment, formatDate }) => {
    const getStatusBadge = (status) => {
        const statusClasses = {
            completed: 'status-success',
            pending: 'status-warning',
            failed: 'status-danger'
        };
        return statusClasses[status] || 'status-secondary';
    };
    
    return (
        <tr>
            <td>{formatDate(payment.date)}</td>
            <td>
                <div className="tenant-cell">
                    <strong>{payment.tenant_name}</strong>
                </div>
            </td>
            <td>
                <div className="property-cell">
                    <div>{payment.property_name}</div>
                    <small>Unit {payment.unit_number}</small>
                </div>
            </td>
            <td className="amount-cell">${payment.amount.toLocaleString()}</td>
            <td>{payment.method}</td>
            <td>
                <span className={`status-badge ${getStatusBadge(payment.status)}`}>
                    {payment.status}
                </span>
            </td>
            <td>
                <div className="action-buttons">
                    <button className="btn-icon" title="View details">
                        <i className="fas fa-eye"></i>
                    </button>
                    <button className="btn-icon" title="Download receipt">
                        <i className="fas fa-download"></i>
                    </button>
                </div>
            </td>
        </tr>
    );
};

// Collect Payment Modal with Valor Integration
const CollectPaymentModal = ({ onClose, onSuccess, showToast }) => {
    const [selectedTenant, setSelectedTenant] = React.useState(null);
    const [paymentMethod, setPaymentMethod] = React.useState('card');
    const [amount, setAmount] = React.useState('');
    const [processing, setProcessing] = React.useState(false);
    const [cardDetails, setCardDetails] = React.useState({
        number: '',
        expiry: '',
        cvv: ''
    });
    
    const processPayment = async () => {
        setProcessing(true);
        
        // Simulate payment processing
        setTimeout(() => {
            showToast('success', 'Payment processed successfully');
            setProcessing(false);
            onSuccess();
        }, 2000);
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal-md" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Collect Payment</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    {/* Tenant Selection */}
                    <div className="form-group">
                        <label>Select Tenant</label>
                        <TenantSearch onSelect={setSelectedTenant} />
                    </div>
                    
                    {selectedTenant && (
                        <>
                            <div className="selected-tenant">
                                <div className="tenant-details">
                                    <strong>{selectedTenant.name}</strong>
                                    <span>{selectedTenant.unit_number}</span>
                                    <span>Balance: ${selectedTenant.balance}</span>
                                </div>
                            </div>
                            
                            {/* Payment Amount */}
                            <div className="form-group">
                                <label>Amount</label>
                                <div className="amount-input">
                                    <span className="currency">$</span>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="quick-amounts">
                                    <button 
                                        className="amount-btn"
                                        onClick={() => setAmount(selectedTenant.rent_amount)}
                                    >
                                        Full Rent (${selectedTenant.rent_amount})
                                    </button>
                                    <button 
                                        className="amount-btn"
                                        onClick={() => setAmount(selectedTenant.balance)}
                                    >
                                        Full Balance (${selectedTenant.balance})
                                    </button>
                                </div>
                            </div>
                            
                            {/* Payment Method */}
                            <div className="form-group">
                                <label>Payment Method</label>
                                <div className="payment-methods">
                                    <label className={`method-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <i className="fas fa-credit-card"></i>
                                        <span>Credit/Debit Card</span>
                                    </label>
                                    <label className={`method-option ${paymentMethod === 'ach' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            value="ach"
                                            checked={paymentMethod === 'ach'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <i className="fas fa-university"></i>
                                        <span>Bank Transfer (ACH)</span>
                                    </label>
                                </div>
                            </div>
                            
                            {/* Card Details (if card selected) */}
                            {paymentMethod === 'card' && (
                                <div className="card-details">
                                    <div className="form-group">
                                        <label>Card Number</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="1234 5678 9012 3456"
                                            value={cardDetails.number}
                                            onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Expiry Date</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="MM/YY"
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>CVV</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="123"
                                                value={cardDetails.cvv}
                                                onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="btn btn-primary"
                        onClick={processPayment}
                        disabled={!selectedTenant || !amount || processing}
                    >
                        {processing ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Processing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-lock"></i>
                                Process Payment
                            </>
                        )}
                    </button>
                </div>
                
                {/* Valor Security Badge */}
                <div className="security-footer">
                    <i className="fas fa-shield-alt"></i>
                    <span>Payments secured by Valor PayTech</span>
                </div>
            </div>
        </div>
    );
};

// Tenant Search Component
const TenantSearch = ({ onSelect }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showResults, setShowResults] = React.useState(false);
    
    const mockTenants = [
        { id: 1, name: 'John Smith', unit_number: '101', balance: 2200, rent_amount: 2200 },
        { id: 2, name: 'Sarah Johnson', unit_number: 'A1', balance: 5000, rent_amount: 5000 },
        { id: 3, name: 'Michael Chen', unit_number: '305', balance: 0, rent_amount: 1800 }
    ];
    
    const filteredTenants = mockTenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.unit_number.includes(searchTerm)
    );
    
    return (
        <div className="tenant-search">
            <input
                type="text"
                className="form-control"
                placeholder="Search by name or unit number..."
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
            />
            
            {showResults && searchTerm && (
                <div className="search-results">
                    {filteredTenants.map(tenant => (
                        <div 
                            key={tenant.id}
                            className="search-result-item"
                            onClick={() => {
                                onSelect(tenant);
                                setSearchTerm(tenant.name);
                                setShowResults(false);
                            }}
                        >
                            <div>
                                <strong>{tenant.name}</strong>
                                <span className="unit">Unit {tenant.unit_number}</span>
                            </div>
                            <span className="balance">Balance: ${tenant.balance}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.Payments = Payments;