// SmartLeaseGenerator.jsx - AI-powered lease with smart clauses
const SmartLeaseGenerator = ({ unit, tenant, application }) => {
    const [lease, setLease] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [showPreview, setShowPreview] = React.useState(false);
    
    const isMiddleOfMonth = (date) => {
        const moveInDate = new Date(date);
        return moveInDate.getDate() > 1 && moveInDate.getDate() < 28;
    };
    
    const generateSmartLease = async () => {
        setLoading(true);
        
        try {
            // AI analyzes context and adds appropriate clauses
            const response = await window.ApiService.post('/api/ai/generate-lease', {
                unit: unit,
                tenant: tenant,
                application: application,
                context: {
                    move_in_date: application.move_in_date,
                    pets: application.pets,
                    special_requests: application.special_requests,
                    parking_needed: application.parking_needed,
                    roommates: application.roommates
                }
            });
            
            setLease(response.lease);
            
            // AI added these smart clauses based on context
            console.log('AI-added clauses:', response.ai_additions);
            
            window.Toast.success('Smart lease generated successfully!');
            
        } catch (error) {
            window.Toast.error('Failed to generate lease');
            console.error('Lease generation error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const approveLease = async () => {
        try {
            await window.ApiService.post('/api/leases/create-from-ai', {
                lease: lease,
                unit_id: unit.id,
                tenant_id: tenant.id,
                application_id: application.id
            });
            
            // Send for signature
            await window.ApiService.post('/api/leases/send-for-signature', {
                lease_id: lease.id,
                tenant_email: tenant.email
            });
            
            window.Toast.success('Lease created and sent for signature!');
            
        } catch (error) {
            window.Toast.error('Failed to create lease');
        }
    };
    
    return (
        <div className="smart-lease-generator">
            <div className="generator-header">
                <h2>AI-Powered Lease Generation</h2>
                <p>AI will analyze the context and add appropriate clauses automatically</p>
            </div>
            
            <div className="ai-recommendations">
                <h3>AI Recommendations Based on Application:</h3>
                <ul>
                    {application.move_in_date && isMiddleOfMonth(application.move_in_date) && (
                        <li>
                            <i className="fas fa-check-circle"></i>
                            Add prorated rent clause for mid-month move-in
                        </li>
                    )}
                    {application.pets && application.pets.length > 0 && (
                        <li>
                            <i className="fas fa-check-circle"></i>
                            Include pet addendum with deposit requirements
                            <ul>
                                {application.pets.map((pet, idx) => (
                                    <li key={idx}>{pet.type}: {pet.breed}, {pet.weight}lbs</li>
                                ))}
                            </ul>
                        </li>
                    )}
                    {application.parking_needed && (
                        <li>
                            <i className="fas fa-check-circle"></i>
                            Add parking space assignment clause
                        </li>
                    )}
                    {application.roommates && application.roommates.length > 0 && (
                        <li>
                            <i className="fas fa-check-circle"></i>
                            Include co-tenant addendum for {application.roommates.length} roommate(s)
                        </li>
                    )}
                    {application.special_requests && (
                        <li>
                            <i className="fas fa-info-circle"></i>
                            Review special requests: "{application.special_requests}"
                        </li>
                    )}
                </ul>
            </div>
            
            <button 
                className="generate-lease-btn"
                onClick={generateSmartLease}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <div className="spinner"></div>
                        AI is creating your lease...
                    </>
                ) : (
                    <>
                        <i className="fas fa-magic"></i>
                        Generate Smart Lease
                    </>
                )}
            </button>
            
            {lease && (
                <div className="lease-preview">
                    <div className="preview-header">
                        <h3>Generated Lease</h3>
                        <button 
                            className="preview-toggle"
                            onClick={() => setShowPreview(!showPreview)}
                        >
                            <i className={`fas fa-${showPreview ? 'eye-slash' : 'eye'}`}></i>
                            {showPreview ? 'Hide' : 'Show'} Full Lease
                        </button>
                    </div>
                    
                    <div className="ai-additions-highlight">
                        <h4>AI Added These Clauses:</h4>
                        {lease.ai_clauses && lease.ai_clauses.map((clause, idx) => (
                            <div key={idx} className="ai-clause">
                                <span className="clause-type">{clause.type}</span>
                                <p>{clause.text}</p>
                                <small className="clause-reason">
                                    <i className="fas fa-info-circle"></i>
                                    Added because: {clause.reason}
                                </small>
                            </div>
                        ))}
                    </div>
                    
                    {showPreview && (
                        <div className="full-lease-preview">
                            <h4>Full Lease Document</h4>
                            <div className="lease-document-preview">
                                {/* Would render the full lease here */}
                                <p>Lease Term: {lease.term_months} months</p>
                                <p>Monthly Rent: ${lease.monthly_rent}</p>
                                <p>Security Deposit: ${lease.security_deposit}</p>
                                <p>Move-in Date: {new Date(lease.move_in_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="lease-actions">
                        <button 
                            className="approve-lease"
                            onClick={approveLease}
                        >
                            <i className="fas fa-check"></i>
                            Approve & Send for Signature
                        </button>
                        <button className="edit-lease">
                            <i className="fas fa-edit"></i>
                            Edit Lease
                        </button>
                        <button className="regenerate-lease" onClick={generateSmartLease}>
                            <i className="fas fa-redo"></i>
                            Regenerate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.SmartLeaseGenerator = SmartLeaseGenerator;