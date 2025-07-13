// Enhanced LeaseCard component
const LeaseCard = ({ lease, unit, tenant, onTerminate }) => {
    const [showDocument, setShowDocument] = React.useState(false);
    const daysUntilExpiry = Math.floor((new Date(lease.end_date) - new Date()) / (1000 * 60 * 60 * 24));
    
    return (
        <>
            <div className={`lease-card ${lease.is_expiring_soon ? 'expiring' : ''}`}>
                <div className="lease-header">
                    <div className="lease-info">
                        <h3>Unit {unit?.unit_number} - {tenant?.first_name} {tenant?.last_name}</h3>
                        <p className="lease-property">{unit?.property_name}</p>
                    </div>
                    <div className={`lease-status ${lease.status}`}>
                        {lease.status.toUpperCase()}
                    </div>
                </div>
                
                <div className="lease-details">
                    <div className="detail-row">
                        <span className="label">Term:</span>
                        <span>{new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Monthly Rent:</span>
                        <span className="rent">${lease.monthly_rent}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Security Deposit:</span>
                        <span>${lease.deposit_amount}</span>
                    </div>
                    {lease.is_expiring_soon && (
                        <div className="expiry-warning">
                            <i className="fas fa-exclamation-triangle"></i>
                            Expires in {daysUntilExpiry} days
                        </div>
                    )}
                </div>
                
                <div className="lease-actions">
                    <button 
                        className="btn-icon"
                        onClick={() => setShowDocument(true)}
                        title="View Lease Document"
                    >
                        <i className="fas fa-file-contract"></i>
                    </button>
                    <button 
                        className="btn-icon"
                        onClick={() => {
                            // Open renewal modal
                        }}
                        title="Renew Lease"
                    >
                        <i className="fas fa-sync"></i>
                    </button>
                    <button 
                        className="btn-icon danger"
                        onClick={onTerminate}
                        title="Terminate Lease"
                    >
                        <i className="fas fa-times-circle"></i>
                    </button>
                </div>
            </div>
            
            {showDocument && (
                <div className="modal-overlay" onClick={() => setShowDocument(false)}>
                    <div className="modal large" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Lease Agreement</h2>
                            <button className="close-btn" onClick={() => setShowDocument(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <LeaseDocument 
                            lease={lease}
                            unit={unit}
                            tenant={tenant}
                            property={unit?.property}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

// Register the component
window.AppModules = window.AppModules || {};
window.AppModules.LeaseCard = LeaseCard;