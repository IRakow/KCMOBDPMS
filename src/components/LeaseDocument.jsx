// LeaseDocument.jsx - The actual lease contract
const LeaseDocument = ({ lease, unit, tenant, property }) => {
    const [signature, setSignature] = React.useState('');
    const [signed, setSigned] = React.useState(false);
    const [showDocument, setShowDocument] = React.useState(false);
    
    const generateLeaseDocument = () => {
        const today = new Date().toLocaleDateString();
        const monthlyRentWords = numberToWords(lease.monthly_rent);
        const depositWords = numberToWords(lease.deposit_amount);
        
        return `
            <div class="lease-document">
                <div class="lease-header">
                    <h1>RESIDENTIAL LEASE AGREEMENT</h1>
                    <p>This agreement is entered into on ${today}</p>
                </div>
                
                <div class="lease-parties">
                    <h2>PARTIES</h2>
                    <p><strong>LANDLORD:</strong> ${property.company_name || 'Property Management Company'}</p>
                    <p><strong>TENANT(S):</strong> ${tenant.first_name} ${tenant.last_name}</p>
                </div>
                
                <div class="lease-property">
                    <h2>PROPERTY</h2>
                    <p>The Landlord agrees to rent to the Tenant the property located at:</p>
                    <p class="property-address">
                        <strong>Unit ${unit.unit_number}</strong><br/>
                        ${property.address.street}<br/>
                        ${property.address.city}, ${property.address.state} ${property.address.zip}
                    </p>
                </div>
                
                <div class="lease-terms">
                    <h2>TERMS</h2>
                    <p><strong>1. TERM:</strong> This lease shall commence on <strong>${new Date(lease.start_date).toLocaleDateString()}</strong> 
                    and shall terminate on <strong>${new Date(lease.end_date).toLocaleDateString()}</strong>.</p>
                    
                    <p><strong>2. RENT:</strong> Tenant agrees to pay $<strong>${lease.monthly_rent}</strong> 
                    (${monthlyRentWords} dollars) per month, due on the 1st day of each month.</p>
                    
                    <p><strong>3. SECURITY DEPOSIT:</strong> Tenant shall pay a security deposit of $<strong>${lease.deposit_amount}</strong> 
                    (${depositWords} dollars) upon signing this lease.</p>
                    
                    <p><strong>4. UTILITIES:</strong> Tenant is responsible for the following utilities: 
                    Electricity, Gas, Internet, Cable. Landlord provides: Water, Sewer, Trash.</p>
                    
                    <p><strong>5. OCCUPANCY:</strong> The premises shall be occupied by no more than ${unit.bedrooms * 2} persons.</p>
                    
                    <p><strong>6. PETS:</strong> No pets allowed without written permission from Landlord.</p>
                    
                    <p><strong>7. MAINTENANCE:</strong> Tenant shall maintain the premises in good condition and promptly report any needed repairs to Landlord.</p>
                    
                    <p><strong>8. LATE FEES:</strong> Rent received after the 5th of the month will incur a late fee of $50.</p>
                    
                    <p><strong>9. RENEWAL:</strong> ${lease.auto_renew ? 
                        'This lease will automatically renew on a month-to-month basis unless either party gives 30 days notice.' : 
                        'This lease will terminate on the end date unless renewed by mutual agreement.'}</p>
                </div>
                
                <div class="lease-rules">
                    <h2>RULES AND REGULATIONS</h2>
                    <ol>
                        <li>No loud music or noise after 10 PM</li>
                        <li>No smoking inside the unit</li>
                        <li>No alterations to the property without written permission</li>
                        <li>Tenant must obtain renter's insurance</li>
                        <li>No subletting without written permission</li>
                        <li>Parking in designated areas only</li>
                    </ol>
                </div>
                
                <div class="lease-signatures">
                    <h2>SIGNATURES</h2>
                    <div class="signature-block">
                        <div class="signature-line">
                            <p>_________________________________</p>
                            <p>Landlord/Agent</p>
                            <p>Date: ${today}</p>
                        </div>
                        <div class="signature-line">
                            <p>_________________________________</p>
                            <p>Tenant: ${tenant.first_name} ${tenant.last_name}</p>
                            <p>Date: ${today}</p>
                        </div>
                    </div>
                </div>
                
                <div class="lease-footer">
                    <p>This lease agreement constitutes the entire agreement between the parties and supersedes all prior agreements.</p>
                </div>
            </div>
        `;
    };
    
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Lease Agreement - ${tenant.first_name} ${tenant.last_name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { text-align: center; }
                        h2 { margin-top: 30px; border-bottom: 2px solid #333; padding-bottom: 5px; }
                        .property-address { background: #f5f5f5; padding: 15px; margin: 15px 0; }
                        .signature-block { display: flex; justify-content: space-between; margin-top: 50px; }
                        .signature-line { width: 45%; text-align: center; }
                        @media print { 
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${generateLeaseDocument()}
                    <script>window.print();</script>
                </body>
            </html>
        `);
    };
    
    const handleEmailLease = async () => {
        try {
            await window.ApiService.post('/api/leases/send-email', {
                lease_id: lease.id,
                recipient: tenant.email,
                document_html: generateLeaseDocument()
            });
            window.Toast.success('Lease sent to tenant!');
        } catch (error) {
            window.Toast.error('Failed to send lease');
        }
    };
    
    const handleESign = async () => {
        if (!signature.trim()) {
            window.Toast.error('Please type your name to sign');
            return;
        }
        
        try {
            await window.ApiService.post(`/api/leases/${lease.id}/sign`, {
                signature: signature,
                signed_by: 'tenant',
                signed_at: new Date().toISOString()
            });
            
            setSigned(true);
            window.Toast.success('Lease signed successfully!');
            
            // Send confirmation SMS
            if (tenant.phone) {
                await window.ApiService.post('/api/ai/smart-sms', {
                    phone: tenant.phone,
                    message: `Your lease has been signed! Move-in date: ${new Date(lease.start_date).toLocaleDateString()}`
                });
            }
        } catch (error) {
            window.Toast.error('Failed to sign lease');
        }
    };
    
    return (
        <div className="lease-document-container">
            <div className="lease-actions-bar">
                <button 
                    className="btn-primary"
                    onClick={() => setShowDocument(!showDocument)}
                >
                    <i className="fas fa-file-contract"></i>
                    {showDocument ? 'Hide' : 'View'} Lease Document
                </button>
                
                <button 
                    className="btn-secondary"
                    onClick={handlePrint}
                >
                    <i className="fas fa-print"></i>
                    Print
                </button>
                
                <button 
                    className="btn-secondary"
                    onClick={handleEmailLease}
                >
                    <i className="fas fa-envelope"></i>
                    Email to Tenant
                </button>
                
                <button 
                    className="btn-secondary"
                    onClick={() => {
                        const doc = generateLeaseDocument();
                        const blob = new Blob([doc], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `lease-${tenant.last_name}-${unit.unit_number}.html`;
                        a.click();
                    }}
                >
                    <i className="fas fa-download"></i>
                    Download
                </button>
            </div>
            
            {showDocument && (
                <div className="lease-preview">
                    <div dangerouslySetInnerHTML={{ __html: generateLeaseDocument() }} />
                    
                    {!signed && (
                        <div className="e-signature-section">
                            <h3>Electronic Signature</h3>
                            <p>Type your full legal name to sign this lease agreement:</p>
                            <input
                                type="text"
                                placeholder={`${tenant.first_name} ${tenant.last_name}`}
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                className="signature-input"
                            />
                            <button 
                                className="btn-primary"
                                onClick={handleESign}
                                disabled={!signature.trim()}
                            >
                                <i className="fas fa-signature"></i>
                                Sign Lease
                            </button>
                        </div>
                    )}
                    
                    {signed && (
                        <div className="signature-confirmation">
                            <i className="fas fa-check-circle"></i>
                            <p>Lease signed electronically on {new Date().toLocaleDateString()}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper function to convert numbers to words
function numberToWords(num) {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    
    if (num === 0) return 'zero';
    
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? '-' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    
    return num.toString(); // For larger numbers
}

// Register the component
window.AppModules = window.AppModules || {};
window.AppModules.LeaseDocument = LeaseDocument;