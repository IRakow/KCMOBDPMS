// ValorPaymentModal.jsx - Tenant Payment Interface using Valor PayTech
const ValorPaymentModal = ({ tenant, lease, onClose, onSuccess }) => {
    const [paymentAmount, setPaymentAmount] = React.useState(lease?.rentAmount || 0);
    const [includeLate, setIncludeLate] = React.useState(true);
    const [paymentMethod, setPaymentMethod] = React.useState(null);
    const [savedMethods, setSavedMethods] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [step, setStep] = React.useState('amount'); // amount, method, processing, complete
    const [error, setError] = React.useState(null);
    const [paymentIntent, setPaymentIntent] = React.useState(null);
    
    const valorService = window.ValorPayTechService;

    React.useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            const methods = await valorService.getPaymentMethods(tenant.id);
            setSavedMethods(methods.payment_methods || []);
            if (methods.payment_methods.length > 0) {
                setPaymentMethod(methods.payment_methods[0]);
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        }
    };

    const calculateTotal = () => {
        let total = paymentAmount;
        if (includeLate && lease?.lateFee) {
            total += lease.lateFee;
        }
        return total;
    };

    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);
        setError(null);
    };

    const createPaymentIntent = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const intent = await valorService.createPaymentIntent({
                tenantId: tenant.id,
                propertyId: lease.propertyId,
                unitId: lease.unitId,
                leaseId: lease.id,
                amount: calculateTotal(),
                type: 'rent',
                dueDate: lease.dueDate,
                unitNumber: lease.unitNumber,
                description: `Rent payment for ${lease.unitNumber} - ${new Date().toLocaleDateString()}`,
                savePaymentMethod: paymentMethod?.id === 'new',
                customerId: tenant.valorCustomerId
            });
            
            setPaymentIntent(intent);
            setStep('processing');
            
            // If using saved payment method, process immediately
            if (paymentMethod?.id && paymentMethod.id !== 'new') {
                await processPayment(intent);
            }
        } catch (error) {
            console.error('Error creating payment intent:', error);
            setError('Failed to initialize payment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const processPayment = async (intent) => {
        setLoading(true);
        try {
            // For saved payment methods, process automatically
            if (paymentMethod?.id && paymentMethod.id !== 'new') {
                const result = await valorService.processAutomatedPayment(
                    tenant.id,
                    paymentMethod.id,
                    calculateTotal(),
                    {
                        payment_intent_id: intent.id,
                        lease_id: lease.id,
                        unit_id: lease.unitId,
                        property_id: lease.propertyId
                    }
                );
                
                if (result.status === 'completed') {
                    handlePaymentSuccess(result);
                } else if (result.status === 'requires_action') {
                    setError('Additional authentication required. Please check your banking app.');
                } else {
                    setError('Payment failed. Please try another payment method.');
                }
            } else {
                // For new payment methods, would integrate with Valor's hosted payment form
                // This is a placeholder for the actual implementation
                setError('New payment method setup coming soon. Please use a saved method.');
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            setError('Payment processing failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (result) => {
        setStep('complete');
        
        // Update local state
        window.showNotification?.('success', 'Payment processed successfully!');
        
        // Notify parent component
        if (onSuccess) {
            onSuccess({
                paymentId: result.id,
                amount: calculateTotal(),
                paymentDate: new Date().toISOString(),
                paymentMethod: paymentMethod.type
            });
        }
        
        // Close modal after delay
        setTimeout(() => {
            onClose();
        }, 3000);
    };

    const renderAmountStep = () => (
        <div className="payment-step amount-step">
            <h3>Payment Amount</h3>
            
            <div className="amount-details">
                <div className="amount-row">
                    <span>Monthly Rent:</span>
                    <span>${lease?.rentAmount?.toFixed(2) || '0.00'}</span>
                </div>
                
                {lease?.lateFee > 0 && (
                    <div className="amount-row late-fee">
                        <label>
                            <input
                                type="checkbox"
                                checked={includeLate}
                                onChange={(e) => setIncludeLate(e.target.checked)}
                            />
                            <span>Late Fee:</span>
                        </label>
                        <span>${lease.lateFee.toFixed(2)}</span>
                    </div>
                )}
                
                <div className="amount-row total">
                    <span>Total Due:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                </div>
            </div>
            
            <div className="custom-amount">
                <label>Or enter custom amount:</label>
                <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="amount-input"
                />
            </div>
            
            <div className="step-actions">
                <button className="btn btn-secondary" onClick={onClose}>
                    Cancel
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={() => setStep('method')}
                    disabled={calculateTotal() <= 0}
                >
                    Continue
                </button>
            </div>
        </div>
    );

    const renderMethodStep = () => (
        <div className="payment-step method-step">
            <h3>Payment Method</h3>
            
            <div className="payment-methods">
                {savedMethods.map(method => (
                    <div 
                        key={method.id} 
                        className={`payment-method-card ${paymentMethod?.id === method.id ? 'selected' : ''}`}
                        onClick={() => handlePaymentMethodChange(method)}
                    >
                        <div className="method-icon">
                            {method.type === 'card' && <i className="fas fa-credit-card"></i>}
                            {method.type === 'ach_debit' && <i className="fas fa-university"></i>}
                        </div>
                        <div className="method-details">
                            <div className="method-type">{method.brand || method.bank_name}</div>
                            <div className="method-last4">****{method.last4}</div>
                        </div>
                        {method.is_default && <span className="default-badge">Default</span>}
                    </div>
                ))}
                
                <div 
                    className={`payment-method-card add-new ${paymentMethod?.id === 'new' ? 'selected' : ''}`}
                    onClick={() => handlePaymentMethodChange({ id: 'new' })}
                >
                    <div className="method-icon">
                        <i className="fas fa-plus"></i>
                    </div>
                    <div className="method-details">
                        <div className="method-type">Add New Payment Method</div>
                        <div className="method-last4">Credit Card or Bank Account</div>
                    </div>
                </div>
            </div>
            
            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}
            
            <div className="step-actions">
                <button className="btn btn-secondary" onClick={() => setStep('amount')}>
                    Back
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={createPaymentIntent}
                    disabled={!paymentMethod || loading}
                >
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Processing...
                        </>
                    ) : (
                        `Pay $${calculateTotal().toFixed(2)}`
                    )}
                </button>
            </div>
        </div>
    );

    const renderProcessingStep = () => (
        <div className="payment-step processing-step">
            <div className="processing-animation">
                <i className="fas fa-spinner fa-spin"></i>
            </div>
            <h3>Processing Payment</h3>
            <p>Please wait while we process your payment...</p>
            <p className="processing-amount">${calculateTotal().toFixed(2)}</p>
        </div>
    );

    const renderCompleteStep = () => (
        <div className="payment-step complete-step">
            <div className="success-animation">
                <i className="fas fa-check-circle"></i>
            </div>
            <h3>Payment Successful!</h3>
            <p>Your payment of ${calculateTotal().toFixed(2)} has been processed.</p>
            <div className="receipt-details">
                <div className="receipt-row">
                    <span>Confirmation #:</span>
                    <span>{paymentIntent?.id || 'PAY-' + Date.now()}</span>
                </div>
                <div className="receipt-row">
                    <span>Date:</span>
                    <span>{new Date().toLocaleString()}</span>
                </div>
            </div>
            <button className="btn btn-primary" onClick={onClose}>
                Done
            </button>
        </div>
    );

    return (
        <div className="valor-payment-modal-overlay" onClick={onClose}>
            <div className="valor-payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Make Payment</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="modal-body">
                    {step === 'amount' && renderAmountStep()}
                    {step === 'method' && renderMethodStep()}
                    {step === 'processing' && renderProcessingStep()}
                    {step === 'complete' && renderCompleteStep()}
                </div>
                
                <div className="modal-footer">
                    <div className="security-note">
                        <i className="fas fa-lock"></i>
                        <span>Secured by Valor PayTech</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.ValorPaymentModal = ValorPaymentModal;