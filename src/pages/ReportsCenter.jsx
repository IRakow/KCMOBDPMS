// ReportsCenter.jsx - World-Class Reports System Better Than AppFolio
const ReportsCenter = () => {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeCategory, setActiveCategory] = React.useState('all');
    const [expandedCategories, setExpandedCategories] = React.useState(new Set(['diagnostic', 'leasing', 'financial']));
    const [favoriteReports, setFavoriteReports] = React.useState(new Set());
    const [recentReports, setRecentReports] = React.useState([]);
    const [showReportBuilder, setShowReportBuilder] = React.useState(false);
    const [selectedReport, setSelectedReport] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    
    // Connect to services
    const reportDataService = window.ReportDataService;
    
    // Report categories with real data connections
    const reportCategories = {
        diagnostic: {
            name: 'Diagnostic Reports',
            icon: 'fa-stethoscope',
            color: '#3b82f6',
            reports: [
                { id: 'email-errors', name: 'Email Delivery Errors', description: 'Track failed email notifications', dataSource: 'notifications' },
                { id: 'late-fee-analysis', name: 'Late Fee Policy Comparison', description: 'Analyze late fee effectiveness', dataSource: 'payments' },
                { id: 'payment-success', name: 'Payment Success Rate', description: 'Valor PayTech transaction analysis', dataSource: 'valor' },
                { id: 'system-health', name: 'System Health Dashboard', description: 'Overall platform performance', dataSource: 'system' }
            ]
        },
        leasing: {
            name: 'Leasing Reports',
            icon: 'fa-file-contract',
            color: '#8b5cf6',
            reports: [
                { id: 'guest-cards', name: 'Guest Card Inquiries', description: 'Track prospective tenant interactions', dataSource: 'leads' },
                { id: 'conversion-funnel', name: 'Leasing Funnel Performance', description: 'Inquiry to lease conversion', dataSource: 'leases' },
                { id: 'renewal-summary', name: 'Renewal Summary', description: 'Upcoming lease renewals', dataSource: 'leases' },
                { id: 'occupancy-summary', name: 'Occupancy Summary', description: 'Current and projected occupancy', dataSource: 'units' },
                { id: 'lease-expiration', name: 'Lease Expiration Detail', description: 'Detailed expiration timeline', dataSource: 'leases' },
                { id: 'unit-vacancy', name: 'Unit Vacancy Detail', description: 'Vacant unit analysis', dataSource: 'units' },
                { id: 'showings', name: 'Showings Report', description: 'Property showing metrics', dataSource: 'calendar' },
                { id: 'rental-applications', name: 'Rental Applications', description: 'Application status tracking', dataSource: 'applications' }
            ]
        },
        financial: {
            name: 'Financial Reports',
            icon: 'fa-chart-line',
            color: '#10b981',
            reports: [
                { id: 'income-statement', name: 'Income Statement', description: 'P&L by property', dataSource: 'accounting' },
                { id: 'balance-sheet', name: 'Balance Sheet', description: 'Assets and liabilities', dataSource: 'accounting' },
                { id: 'cash-flow', name: 'Cash Flow Statement', description: 'Cash movement analysis', dataSource: 'accounting' },
                { id: 'rent-roll', name: 'Rent Roll', description: 'Current tenant rent details', dataSource: 'leases' },
                { id: 'ar-aging', name: 'AR Aging', description: 'Accounts receivable aging', dataSource: 'payments' },
                { id: 'delinquency', name: 'Delinquency Report', description: 'Overdue payments analysis', dataSource: 'payments' },
                { id: 'budget-variance', name: 'Budget vs Actual', description: 'Budget variance analysis', dataSource: 'accounting' },
                { id: 'expense-analysis', name: 'Expense Analysis', description: 'Detailed expense breakdown', dataSource: 'accounting' }
            ]
        },
        maintenance: {
            name: 'Maintenance Reports',
            icon: 'fa-tools',
            color: '#f59e0b',
            reports: [
                { id: 'work-order-summary', name: 'Work Order Summary', description: 'Maintenance request overview', dataSource: 'maintenance' },
                { id: 'vendor-performance', name: 'Vendor Performance', description: 'Vendor KPIs and ratings', dataSource: 'vendors' },
                { id: 'maintenance-costs', name: 'Maintenance Cost Analysis', description: 'Cost by property and type', dataSource: 'maintenance' },
                { id: 'preventive-schedule', name: 'Preventive Maintenance', description: 'Scheduled maintenance tracking', dataSource: 'maintenance' },
                { id: 'unit-turn-time', name: 'Unit Turn Time', description: 'Time to make units ready', dataSource: 'maintenance' },
                { id: 'vendor-directory', name: 'Vendor Directory', description: 'Complete vendor listing', dataSource: 'vendors' }
            ]
        },
        owner: {
            name: 'Owner Reports',
            icon: 'fa-building',
            color: '#6366f1',
            reports: [
                { id: 'owner-statement', name: 'Owner Statement', description: 'Monthly owner statements', dataSource: 'accounting' },
                { id: 'owner-statement-ytd', name: 'Owner Statement (YTD)', description: 'Year-to-date performance', dataSource: 'accounting' },
                { id: 'owner-directory', name: 'Owner Directory', description: 'Owner contact information', dataSource: 'owners' },
                { id: 'distribution-summary', name: 'Distribution Summary', description: 'Owner payment history', dataSource: 'payments' },
                { id: 'investment-analysis', name: 'Investment Analysis', description: 'ROI and cap rate analysis', dataSource: 'accounting' }
            ]
        },
        property: {
            name: 'Property & Unit Reports',
            icon: 'fa-home',
            color: '#ec4899',
            reports: [
                { id: 'property-summary', name: 'Property Summary', description: 'Overview of all properties', dataSource: 'properties' },
                { id: 'unit-directory', name: 'Unit Directory', description: 'Complete unit listing', dataSource: 'units' },
                { id: 'amenities-report', name: 'Amenities by Property', description: 'Property features matrix', dataSource: 'properties' },
                { id: 'insurance-schedule', name: 'Insurance Schedule', description: 'Insurance coverage details', dataSource: 'properties' },
                { id: 'property-photos', name: 'Property Photo Report', description: 'Marketing photo inventory', dataSource: 'media' }
            ]
        },
        tenant: {
            name: 'Tenant Reports',
            icon: 'fa-users',
            color: '#14b8a6',
            reports: [
                { id: 'tenant-directory', name: 'Tenant Directory', description: 'Current tenant listing', dataSource: 'tenants' },
                { id: 'tenant-ledger', name: 'Tenant Ledger', description: 'Individual tenant transactions', dataSource: 'payments' },
                { id: 'move-in-out', name: 'Move In/Out Report', description: 'Tenant turnover tracking', dataSource: 'leases' },
                { id: 'tenant-screening', name: 'Screening Results', description: 'Background check summary', dataSource: 'applications' },
                { id: 'emergency-contacts', name: 'Emergency Contacts', description: 'Tenant emergency info', dataSource: 'tenants' }
            ]
        },
        transaction: {
            name: 'Transaction Reports',
            icon: 'fa-exchange-alt',
            color: '#f97316',
            reports: [
                { id: 'payment-history', name: 'Payment History', description: 'All payment transactions', dataSource: 'valor' },
                { id: 'deposit-registry', name: 'Security Deposit Registry', description: 'Deposit tracking', dataSource: 'payments' },
                { id: 'bank-reconciliation', name: 'Bank Reconciliation', description: 'Bank account matching', dataSource: 'accounting' },
                { id: 'valor-settlements', name: 'Valor PayTech Settlements', description: 'Payment processor details', dataSource: 'valor' },
                { id: 'refund-history', name: 'Refund History', description: 'Refund transaction log', dataSource: 'valor' }
            ]
        }
    };
    
    React.useEffect(() => {
        loadRecentReports();
        loadFavorites();
    }, []);
    
    const loadRecentReports = () => {
        const recent = JSON.parse(localStorage.getItem('recentReports') || '[]');
        setRecentReports(recent.slice(0, 5));
    };
    
    const loadFavorites = () => {
        const favs = JSON.parse(localStorage.getItem('favoriteReports') || '[]');
        setFavoriteReports(new Set(favs));
    };
    
    const toggleCategory = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };
    
    const toggleFavorite = (reportId, e) => {
        e.stopPropagation();
        const newFavorites = new Set(favoriteReports);
        if (newFavorites.has(reportId)) {
            newFavorites.delete(reportId);
        } else {
            newFavorites.add(reportId);
        }
        setFavoriteReports(newFavorites);
        localStorage.setItem('favoriteReports', JSON.stringify([...newFavorites]));
    };
    
    const runReport = async (report, categoryId) => {
        setLoading(true);
        
        // Add to recent reports
        const recent = [{ ...report, categoryId, timestamp: new Date().toISOString() }];
        const existing = recentReports.filter(r => r.id !== report.id);
        const newRecent = [...recent, ...existing].slice(0, 5);
        setRecentReports(newRecent);
        localStorage.setItem('recentReports', JSON.stringify(newRecent));
        
        try {
            // Get current property context if available
            const propertyId = window.currentProperty !== 'all' ? window.currentProperty : null;
            
            // Fetch data using the centralized ReportDataService
            const reportData = await reportDataService.fetchReportData(
                report.id, 
                report.dataSource,
                {
                    propertyId,
                    dateRange: getDateRange()
                }
            );
            
            setSelectedReport({
                ...report,
                categoryId,
                data: reportData,
                generatedAt: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Error generating report:', error);
            window.showNotification?.('error', 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };
    
    // Helper to get date range for reports
    const getDateRange = () => {
        const end = new Date().toISOString();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        return { start, end };
    };
    
    
    // Export functionality
    const exportReport = async (format) => {
        if (!selectedReport) return;
        
        try {
            window.showNotification?.('info', `Exporting report as ${format.toUpperCase()}...`);
            
            const exportService = window.ReportExportService;
            const reportName = `${selectedReport.name}_${new Date().toISOString().split('T')[0]}`;
            
            switch (format) {
                case 'pdf':
                    await exportService.exportToPDF(selectedReport.data, reportName);
                    break;
                case 'excel':
                    await exportService.exportToExcel(selectedReport.data, reportName);
                    break;
                case 'csv':
                    await exportService.exportToCSV(selectedReport.data, reportName);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
            
            window.showNotification?.('success', `Report exported successfully as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export error:', error);
            window.showNotification?.('error', `Failed to export report: ${error.message}`);
        }
    };
    
    // Schedule report functionality
    const scheduleReport = (report) => {
        // TODO: Implement report scheduling
        window.showNotification?.('info', 'Report scheduling coming soon');
    };
    
    // Email report functionality
    const emailReport = (report) => {
        // TODO: Implement email functionality
        window.showNotification?.('info', 'Email functionality coming soon');
    };
    
    // Filter reports based on search
    const filteredReports = React.useMemo(() => {
        const query = searchQuery.toLowerCase();
        const filtered = {};
        
        Object.entries(reportCategories).forEach(([categoryId, category]) => {
            const matchingReports = category.reports.filter(report => 
                report.name.toLowerCase().includes(query) ||
                report.description.toLowerCase().includes(query)
            );
            
            if (matchingReports.length > 0 || category.name.toLowerCase().includes(query)) {
                filtered[categoryId] = {
                    ...category,
                    reports: matchingReports
                };
            }
        });
        
        return filtered;
    }, [searchQuery]);
    
    return (
        <div className="reports-center">
            {/* Beautiful Header */}
            <div className="reports-header">
                <div className="header-content">
                    <h1>Reports Center</h1>
                    <div className="header-actions">
                        <button className="btn-report-builder" onClick={() => setShowReportBuilder(true)}>
                            <i className="fas fa-magic"></i>
                            Report Builder
                        </button>
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="reports-search">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search reports by name, description, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                {/* Quick Filters */}
                <div className="report-filters">
                    <button 
                        className={`filter-tab ${activeCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('all')}
                    >
                        All Reports
                    </button>
                    <button 
                        className={`filter-tab ${activeCategory === 'favorites' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('favorites')}
                    >
                        <i className="fas fa-star"></i>
                        Favorites
                    </button>
                    <button 
                        className={`filter-tab ${activeCategory === 'recent' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('recent')}
                    >
                        <i className="fas fa-clock"></i>
                        Recent
                    </button>
                    <button 
                        className={`filter-tab ${activeCategory === 'scheduled' ? 'active' : ''}`}
                        onClick={() => setActiveCategory('scheduled')}
                    >
                        <i className="fas fa-calendar-check"></i>
                        Scheduled
                    </button>
                </div>
            </div>
            
            {/* Main Content Area */}
            <div className="reports-content">
                {/* Left Sidebar - Report Categories */}
                <div className="reports-sidebar">
                    {Object.entries(filteredReports).map(([categoryId, category]) => (
                        <div key={categoryId} className="report-category">
                            <div 
                                className="category-header"
                                onClick={() => toggleCategory(categoryId)}
                                style={{ borderLeftColor: category.color }}
                            >
                                <div className="category-title">
                                    <i className={`fas ${category.icon}`} style={{ color: category.color }}></i>
                                    <span>{category.name}</span>
                                    <span className="report-count">{category.reports.length}</span>
                                </div>
                                <i className={`fas fa-chevron-${expandedCategories.has(categoryId) ? 'up' : 'down'}`}></i>
                            </div>
                            
                            {expandedCategories.has(categoryId) && (
                                <div className="category-reports">
                                    {category.reports.map(report => (
                                        <div 
                                            key={report.id} 
                                            className="report-item"
                                            onClick={() => runReport(report, categoryId)}
                                        >
                                            <div className="report-info">
                                                <h4>{report.name}</h4>
                                                <p>{report.description}</p>
                                            </div>
                                            <div className="report-actions">
                                                <button 
                                                    className={`btn-favorite ${favoriteReports.has(report.id) ? 'active' : ''}`}
                                                    onClick={(e) => toggleFavorite(report.id, e)}
                                                >
                                                    <i className={`${favoriteReports.has(report.id) ? 'fas' : 'far'} fa-star`}></i>
                                                </button>
                                                <button className="btn-schedule" onClick={(e) => {
                                                    e.stopPropagation();
                                                    scheduleReport(report);
                                                }}>
                                                    <i className="far fa-calendar-plus"></i>
                                                </button>
                                                <button className="btn-more">
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Right Content - Report Display */}
                <div className="report-display">
                    {loading ? (
                        <div className="report-loading">
                            <div className="loading-animation">
                                <i className="fas fa-chart-line fa-spin"></i>
                            </div>
                            <h3>Generating Report...</h3>
                            <p>Analyzing data and creating visualizations</p>
                        </div>
                    ) : selectedReport ? (
                        <div className="report-viewer">
                            <div className="report-viewer-header">
                                <div className="report-title">
                                    <h2>{selectedReport.name}</h2>
                                    <p>Generated: {new Date(selectedReport.generatedAt).toLocaleString()}</p>
                                </div>
                                <div className="report-actions">
                                    <button className="btn-export" onClick={() => exportReport('pdf')}>
                                        <i className="fas fa-file-pdf"></i>
                                        Export PDF
                                    </button>
                                    <button className="btn-export" onClick={() => exportReport('excel')}>
                                        <i className="fas fa-file-excel"></i>
                                        Export Excel
                                    </button>
                                    <button className="btn-export" onClick={() => exportReport('csv')}>
                                        <i className="fas fa-file-csv"></i>
                                        Export CSV
                                    </button>
                                    <button className="btn-email" onClick={() => emailReport(selectedReport)}>
                                        <i className="fas fa-envelope"></i>
                                        Email
                                    </button>
                                    <button className="btn-print" onClick={() => window.print()}>
                                        <i className="fas fa-print"></i>
                                        Print
                                    </button>
                                </div>
                            </div>
                            
                            <div className="report-content">
                                {/* Dynamic report content based on type */}
                                {selectedReport.id === 'income-statement' && (
                                    <IncomeStatementReport data={selectedReport.data} />
                                )}
                                {selectedReport.id === 'payment-history' && (
                                    <PaymentHistoryReport data={selectedReport.data} />
                                )}
                                {/* Add more report components as needed */}
                                
                                {/* Default report display */}
                                {!['income-statement', 'payment-history'].includes(selectedReport.id) && (
                                    <div className="default-report">
                                        <pre>{JSON.stringify(selectedReport.data, null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="report-empty">
                            <i className="fas fa-chart-bar"></i>
                            <h3>Select a Report</h3>
                            <p>Choose a report from the left sidebar to view</p>
                            
                            {recentReports.length > 0 && (
                                <div className="recent-reports-quick">
                                    <h4>Recent Reports</h4>
                                    <div className="recent-list">
                                        {recentReports.map(report => (
                                            <button 
                                                key={report.id}
                                                className="recent-report-btn"
                                                onClick={() => runReport(report, report.categoryId)}
                                            >
                                                <i className={`fas ${reportCategories[report.categoryId]?.icon}`}></i>
                                                {report.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Income Statement Report Component
const IncomeStatementReport = ({ data }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };
    
    return (
        <div className="income-statement-report">
            <h3>Income Statement</h3>
            <div className="statement-section">
                <h4>Revenue</h4>
                <div className="line-item">
                    <span>Rental Income</span>
                    <span>{formatCurrency(data.income_statement?.revenue?.rental_income)}</span>
                </div>
                <div className="line-item">
                    <span>Late Fees</span>
                    <span>{formatCurrency(data.income_statement?.revenue?.late_fees)}</span>
                </div>
                <div className="line-item">
                    <span>Other Income</span>
                    <span>{formatCurrency(data.income_statement?.revenue?.other_income)}</span>
                </div>
                <div className="line-item total">
                    <span>Total Revenue</span>
                    <span>{formatCurrency(data.income_statement?.revenue?.total)}</span>
                </div>
            </div>
            
            <div className="statement-section">
                <h4>Expenses</h4>
                <div className="line-item">
                    <span>Maintenance</span>
                    <span>{formatCurrency(data.income_statement?.expenses?.maintenance)}</span>
                </div>
                <div className="line-item">
                    <span>Utilities</span>
                    <span>{formatCurrency(data.income_statement?.expenses?.utilities)}</span>
                </div>
                <div className="line-item">
                    <span>Management Fees</span>
                    <span>{formatCurrency(data.income_statement?.expenses?.management)}</span>
                </div>
                <div className="line-item">
                    <span>Insurance</span>
                    <span>{formatCurrency(data.income_statement?.expenses?.insurance)}</span>
                </div>
                <div className="line-item">
                    <span>Property Taxes</span>
                    <span>{formatCurrency(data.income_statement?.expenses?.taxes)}</span>
                </div>
                <div className="line-item total">
                    <span>Total Expenses</span>
                    <span>{formatCurrency(data.income_statement?.expenses?.total)}</span>
                </div>
            </div>
            
            <div className="statement-section">
                <div className="line-item net-income">
                    <span>Net Income</span>
                    <span>{formatCurrency(data.income_statement?.net_income)}</span>
                </div>
            </div>
        </div>
    );
};

// Payment History Report Component
const PaymentHistoryReport = ({ data }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    };
    
    return (
        <div className="payment-history-report">
            <h3>Payment Transaction History</h3>
            <table className="report-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Tenant</th>
                        <th>Property</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {data.history?.payments?.map((payment, index) => (
                        <tr key={payment.id || index}>
                            <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                            <td>{payment.metadata?.tenant_name || 'Unknown'}</td>
                            <td>{payment.metadata?.property_name || 'Unknown'}</td>
                            <td>{formatCurrency(payment.amount)}</td>
                            <td>{payment.paymentMethod}</td>
                            <td>
                                <span className={`status-badge ${payment.status}`}>
                                    {payment.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.ReportsCenter = ReportsCenter;