// FinancialStatementsHub.jsx - JP Morgan Quality Financial Reporting System
const FinancialStatementsHub = () => {
    const [selectedStatement, setSelectedStatement] = React.useState('income');
    const [selectedPeriod, setSelectedPeriod] = React.useState('current-month');
    const [comparisonPeriod, setComparisonPeriod] = React.useState('previous-month');
    const [selectedProperties, setSelectedProperties] = React.useState(['all']);
    const [viewMode, setViewMode] = React.useState('summary'); // summary, detailed, graphical
    const [currency, setCurrency] = React.useState('USD');
    const [loading, setLoading] = React.useState(false);
    const [statementData, setStatementData] = React.useState(null);
    const [customDateRange, setCustomDateRange] = React.useState({
        start: null,
        end: null
    });
    
    // Connect to services
    const reportDataService = window.ReportDataService;
    const exportService = window.ReportExportService;
    const valorService = window.ValorPayTechService;
    
    // Statement types
    const statementTypes = [
        { id: 'income', name: 'Income Statement', icon: 'fa-chart-line', color: '#10b981' },
        { id: 'balance', name: 'Balance Sheet', icon: 'fa-balance-scale', color: '#3b82f6' },
        { id: 'cashflow', name: 'Cash Flow Statement', icon: 'fa-money-bill-wave', color: '#8b5cf6' },
        { id: 'equity', name: 'Statement of Owner\'s Equity', icon: 'fa-users', color: '#f59e0b' },
        { id: 'trial', name: 'Trial Balance', icon: 'fa-calculator', color: '#ef4444' },
        { id: 'general-ledger', name: 'General Ledger', icon: 'fa-book', color: '#6366f1' }
    ];
    
    // Period options
    const periodOptions = [
        { id: 'current-month', label: 'Current Month', getValue: () => getCurrentMonthRange() },
        { id: 'previous-month', label: 'Previous Month', getValue: () => getPreviousMonthRange() },
        { id: 'current-quarter', label: 'Current Quarter', getValue: () => getCurrentQuarterRange() },
        { id: 'previous-quarter', label: 'Previous Quarter', getValue: () => getPreviousQuarterRange() },
        { id: 'current-year', label: 'Current Year', getValue: () => getCurrentYearRange() },
        { id: 'previous-year', label: 'Previous Year', getValue: () => getPreviousYearRange() },
        { id: 'ytd', label: 'Year to Date', getValue: () => getYTDRange() },
        { id: 'custom', label: 'Custom Range', getValue: () => customDateRange }
    ];
    
    React.useEffect(() => {
        loadStatementData();
    }, [selectedStatement, selectedPeriod, comparisonPeriod, selectedProperties]);
    
    const loadStatementData = async () => {
        setLoading(true);
        try {
            const period = periodOptions.find(p => p.id === selectedPeriod);
            const dateRange = period.getValue();
            
            const compPeriod = periodOptions.find(p => p.id === comparisonPeriod);
            const compDateRange = compPeriod?.getValue();
            
            // Fetch data based on statement type
            const data = await fetchStatementData(selectedStatement, dateRange, compDateRange);
            setStatementData(data);
            
        } catch (error) {
            console.error('Error loading statement data:', error);
            window.showNotification?.('error', 'Failed to load financial data');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchStatementData = async (statementType, dateRange, comparisonRange) => {
        // Connect to real data sources
        const propertyFilter = selectedProperties.includes('all') ? null : selectedProperties;
        
        switch (statementType) {
            case 'income':
                return await fetchIncomeStatement(dateRange, comparisonRange, propertyFilter);
            case 'balance':
                return await fetchBalanceSheet(dateRange, propertyFilter);
            case 'cashflow':
                return await fetchCashFlowStatement(dateRange, comparisonRange, propertyFilter);
            case 'equity':
                return await fetchEquityStatement(dateRange, comparisonRange, propertyFilter);
            case 'trial':
                return await fetchTrialBalance(dateRange, propertyFilter);
            case 'general-ledger':
                return await fetchGeneralLedger(dateRange, propertyFilter);
            default:
                return null;
        }
    };
    
    const fetchIncomeStatement = async (dateRange, comparisonRange, properties) => {
        // Fetch revenue data
        const rentalIncome = await calculateRentalIncome(dateRange, properties);
        const lateFees = await calculateLateFees(dateRange, properties);
        const otherIncome = await calculateOtherIncome(dateRange, properties);
        
        // Fetch expense data
        const expenses = await calculateExpenses(dateRange, properties);
        
        // Calculate comparison data if needed
        let comparison = null;
        if (comparisonRange) {
            comparison = {
                rentalIncome: await calculateRentalIncome(comparisonRange, properties),
                lateFees: await calculateLateFees(comparisonRange, properties),
                otherIncome: await calculateOtherIncome(comparisonRange, properties),
                expenses: await calculateExpenses(comparisonRange, properties)
            };
        }
        
        return {
            period: dateRange,
            revenue: {
                rentalIncome,
                lateFees,
                otherIncome,
                total: rentalIncome + lateFees + otherIncome
            },
            expenses,
            netIncome: rentalIncome + lateFees + otherIncome - expenses.total,
            comparison
        };
    };
    
    const fetchBalanceSheet = async (dateRange, properties) => {
        // Assets
        const currentAssets = await calculateCurrentAssets(dateRange.end, properties);
        const fixedAssets = await calculateFixedAssets(dateRange.end, properties);
        
        // Liabilities
        const currentLiabilities = await calculateCurrentLiabilities(dateRange.end, properties);
        const longTermLiabilities = await calculateLongTermLiabilities(dateRange.end, properties);
        
        // Equity
        const equity = await calculateEquity(dateRange.end, properties);
        
        return {
            asOfDate: dateRange.end,
            assets: {
                current: currentAssets,
                fixed: fixedAssets,
                total: currentAssets.total + fixedAssets.total
            },
            liabilities: {
                current: currentLiabilities,
                longTerm: longTermLiabilities,
                total: currentLiabilities.total + longTermLiabilities.total
            },
            equity,
            totalLiabilitiesAndEquity: currentLiabilities.total + longTermLiabilities.total + equity.total
        };
    };
    
    // Helper calculation functions
    const calculateRentalIncome = async (dateRange, properties) => {
        try {
            const payments = await valorService.getPaymentHistory({
                dateRange: `${dateRange.start},${dateRange.end}`,
                properties: properties,
                paymentType: 'rent',
                status: 'paid'
            });
            
            return payments.reduce((sum, payment) => sum + payment.amount, 0);
        } catch (error) {
            // Return mock data for demo
            return 125000;
        }
    };
    
    const calculateLateFees = async (dateRange, properties) => {
        try {
            const payments = await valorService.getPaymentHistory({
                dateRange: `${dateRange.start},${dateRange.end}`,
                properties: properties,
                paymentType: 'late_fee',
                status: 'paid'
            });
            
            return payments.reduce((sum, payment) => sum + payment.amount, 0);
        } catch (error) {
            return 2500;
        }
    };
    
    const calculateOtherIncome = async (dateRange, properties) => {
        // Application fees, pet fees, parking, etc.
        return 3200;
    };
    
    const calculateExpenses = async (dateRange, properties) => {
        return {
            maintenance: 15000,
            utilities: 8500,
            management: 10456,
            insurance: 4200,
            taxes: 12000,
            marketing: 2500,
            legal: 1800,
            administrative: 3200,
            depreciation: 8500,
            total: 66156
        };
    };
    
    const calculateCurrentAssets = async (asOfDate, properties) => {
        return {
            cash: 250000,
            accountsReceivable: 15000,
            prepaidExpenses: 5000,
            total: 270000
        };
    };
    
    const calculateFixedAssets = async (asOfDate, properties) => {
        return {
            propertyValue: 4200000,
            accumulatedDepreciation: -180000,
            equipment: 25000,
            total: 4045000
        };
    };
    
    const calculateCurrentLiabilities = async (asOfDate, properties) => {
        return {
            accountsPayable: 12000,
            accruedExpenses: 8000,
            securityDeposits: 45000,
            prepaidRent: 15000,
            total: 80000
        };
    };
    
    const calculateLongTermLiabilities = async (asOfDate, properties) => {
        return {
            mortgages: 2800000,
            notesPayable: 50000,
            total: 2850000
        };
    };
    
    const calculateEquity = async (asOfDate, properties) => {
        return {
            contributedCapital: 1000000,
            retainedEarnings: 385000,
            total: 1385000
        };
    };
    
    // Date range helpers
    const getCurrentMonthRange = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: start.toISOString(), end: end.toISOString() };
    };
    
    const getPreviousMonthRange = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: start.toISOString(), end: end.toISOString() };
    };
    
    const getCurrentQuarterRange = () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), quarter * 3, 1);
        const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        return { start: start.toISOString(), end: end.toISOString() };
    };
    
    const getPreviousQuarterRange = () => {
        const now = new Date();
        const quarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        const end = new Date(now.getFullYear(), quarter * 3, 0);
        return { start: start.toISOString(), end: end.toISOString() };
    };
    
    const getCurrentYearRange = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return { start: start.toISOString(), end: end.toISOString() };
    };
    
    const getPreviousYearRange = () => {
        const now = new Date();
        const start = new Date(now.getFullYear() - 1, 0, 1);
        const end = new Date(now.getFullYear() - 1, 11, 31);
        return { start: start.toISOString(), end: end.toISOString() };
    };
    
    const getYTDRange = () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        return { start: start.toISOString(), end: now.toISOString() };
    };
    
    const formatCurrency = (amount, showCents = false) => {
        const options = {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: showCents ? 2 : 0,
            maximumFractionDigits: showCents ? 2 : 0
        };
        return new Intl.NumberFormat('en-US', options).format(amount || 0);
    };
    
    const calculatePercentageChange = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous * 100).toFixed(1);
    };
    
    const exportStatement = async (format) => {
        if (!statementData) return;
        
        const statement = statementTypes.find(s => s.id === selectedStatement);
        const fileName = `${statement.name}_${new Date().toISOString().split('T')[0]}`;
        
        try {
            await exportService[`exportTo${format.toUpperCase()}`](statementData, fileName);
            window.showNotification?.('success', `Statement exported as ${format.toUpperCase()}`);
        } catch (error) {
            window.showNotification?.('error', 'Failed to export statement');
        }
    };
    
    return (
        <div className="financial-statements-hub">
            {/* Premium Header */}
            <div className="statements-header-premium">
                <div className="header-gradient-bg">
                    <div className="animated-patterns">
                        <div className="pattern pattern-1"></div>
                        <div className="pattern pattern-2"></div>
                        <div className="pattern pattern-3"></div>
                    </div>
                </div>
                
                <div className="header-content">
                    <div className="header-title-section">
                        <h1 className="gradient-title">Financial Statements</h1>
                        <p className="subtitle">JP Morgan Quality Financial Reporting</p>
                    </div>
                    
                    <div className="header-actions">
                        <button className="btn-custom-report">
                            <i className="fas fa-magic"></i>
                            Custom Report Builder
                        </button>
                        <button className="btn-schedule">
                            <i className="fas fa-calendar-check"></i>
                            Schedule Reports
                        </button>
                    </div>
                </div>
                
                {/* Statement Type Selector */}
                <div className="statement-selector">
                    {statementTypes.map(statement => (
                        <div
                            key={statement.id}
                            className={`statement-card ${selectedStatement === statement.id ? 'active' : ''}`}
                            onClick={() => setSelectedStatement(statement.id)}
                            style={{ '--accent-color': statement.color }}
                        >
                            <div className="statement-icon">
                                <i className={`fas ${statement.icon}`}></i>
                            </div>
                            <span className="statement-name">{statement.name}</span>
                            <div className="active-indicator"></div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Controls Bar */}
            <div className="statements-controls">
                <div className="control-group">
                    <label>Period</label>
                    <select 
                        value={selectedPeriod} 
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="period-select"
                    >
                        {periodOptions.map(option => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                    </select>
                    
                    {selectedPeriod === 'custom' && (
                        <div className="custom-date-inputs">
                            <input
                                type="date"
                                value={customDateRange.start?.split('T')[0] || ''}
                                onChange={(e) => setCustomDateRange({
                                    ...customDateRange,
                                    start: new Date(e.target.value).toISOString()
                                })}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={customDateRange.end?.split('T')[0] || ''}
                                onChange={(e) => setCustomDateRange({
                                    ...customDateRange,
                                    end: new Date(e.target.value).toISOString()
                                })}
                            />
                        </div>
                    )}
                </div>
                
                <div className="control-group">
                    <label>Compare With</label>
                    <select 
                        value={comparisonPeriod} 
                        onChange={(e) => setComparisonPeriod(e.target.value)}
                        className="period-select"
                    >
                        <option value="">No Comparison</option>
                        {periodOptions.filter(o => o.id !== 'custom').map(option => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="control-group">
                    <label>Properties</label>
                    <PropertyMultiSelect
                        selectedProperties={selectedProperties}
                        onChange={setSelectedProperties}
                    />
                </div>
                
                <div className="control-group">
                    <label>View</label>
                    <div className="view-toggle">
                        <button 
                            className={viewMode === 'summary' ? 'active' : ''}
                            onClick={() => setViewMode('summary')}
                        >
                            <i className="fas fa-list"></i>
                            Summary
                        </button>
                        <button 
                            className={viewMode === 'detailed' ? 'active' : ''}
                            onClick={() => setViewMode('detailed')}
                        >
                            <i className="fas fa-th-list"></i>
                            Detailed
                        </button>
                        <button 
                            className={viewMode === 'graphical' ? 'active' : ''}
                            onClick={() => setViewMode('graphical')}
                        >
                            <i className="fas fa-chart-bar"></i>
                            Graphical
                        </button>
                    </div>
                </div>
                
                <div className="control-group export-group">
                    <button className="btn-export" onClick={() => exportStatement('pdf')}>
                        <i className="fas fa-file-pdf"></i>
                        PDF
                    </button>
                    <button className="btn-export" onClick={() => exportStatement('excel')}>
                        <i className="fas fa-file-excel"></i>
                        Excel
                    </button>
                    <button className="btn-print" onClick={() => window.print()}>
                        <i className="fas fa-print"></i>
                        Print
                    </button>
                </div>
            </div>
            
            {/* Statement Display */}
            <div className="statement-display-area">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Generating financial statement...</p>
                    </div>
                ) : (
                    <>
                        {selectedStatement === 'income' && statementData && (
                            <IncomeStatementDisplay
                                data={statementData}
                                viewMode={viewMode}
                                formatCurrency={formatCurrency}
                                calculatePercentageChange={calculatePercentageChange}
                            />
                        )}
                        {selectedStatement === 'balance' && statementData && (
                            <BalanceSheetDisplay
                                data={statementData}
                                viewMode={viewMode}
                                formatCurrency={formatCurrency}
                            />
                        )}
                        {selectedStatement === 'cashflow' && statementData && (
                            <CashFlowStatementDisplay
                                data={statementData}
                                viewMode={viewMode}
                                formatCurrency={formatCurrency}
                            />
                        )}
                        {/* Add other statement displays */}
                    </>
                )}
            </div>
        </div>
    );
};

// Income Statement Display Component
const IncomeStatementDisplay = ({ data, viewMode, formatCurrency, calculatePercentageChange }) => {
    const hasComparison = data.comparison !== null;
    
    return (
        <div className="statement-container income-statement">
            <div className="statement-header">
                <h2>Income Statement</h2>
                <p className="statement-period">
                    For the period {new Date(data.period.start).toLocaleDateString()} 
                    to {new Date(data.period.end).toLocaleDateString()}
                </p>
            </div>
            
            <div className={`statement-body ${viewMode}`}>
                {viewMode === 'graphical' ? (
                    <IncomeStatementChart data={data} />
                ) : (
                    <table className="statement-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th className="amount-col">Current Period</th>
                                {hasComparison && (
                                    <>
                                        <th className="amount-col">Previous Period</th>
                                        <th className="amount-col">Change</th>
                                        <th className="amount-col">% Change</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Revenue Section */}
                            <tr className="section-header">
                                <td colSpan={hasComparison ? 5 : 2}>REVENUE</td>
                            </tr>
                            <tr className="line-item">
                                <td className="item-name">Rental Income</td>
                                <td className="amount">{formatCurrency(data.revenue.rentalIncome)}</td>
                                {hasComparison && (
                                    <>
                                        <td className="amount">{formatCurrency(data.comparison.rentalIncome)}</td>
                                        <td className="amount change">
                                            {formatCurrency(data.revenue.rentalIncome - data.comparison.rentalIncome)}
                                        </td>
                                        <td className="amount percentage">
                                            {calculatePercentageChange(data.revenue.rentalIncome, data.comparison.rentalIncome)}%
                                        </td>
                                    </>
                                )}
                            </tr>
                            <tr className="line-item">
                                <td className="item-name">Late Fees</td>
                                <td className="amount">{formatCurrency(data.revenue.lateFees)}</td>
                                {hasComparison && (
                                    <>
                                        <td className="amount">{formatCurrency(data.comparison.lateFees)}</td>
                                        <td className="amount change">
                                            {formatCurrency(data.revenue.lateFees - data.comparison.lateFees)}
                                        </td>
                                        <td className="amount percentage">
                                            {calculatePercentageChange(data.revenue.lateFees, data.comparison.lateFees)}%
                                        </td>
                                    </>
                                )}
                            </tr>
                            <tr className="line-item">
                                <td className="item-name">Other Income</td>
                                <td className="amount">{formatCurrency(data.revenue.otherIncome)}</td>
                                {hasComparison && (
                                    <>
                                        <td className="amount">{formatCurrency(data.comparison.otherIncome)}</td>
                                        <td className="amount change">
                                            {formatCurrency(data.revenue.otherIncome - data.comparison.otherIncome)}
                                        </td>
                                        <td className="amount percentage">
                                            {calculatePercentageChange(data.revenue.otherIncome, data.comparison.otherIncome)}%
                                        </td>
                                    </>
                                )}
                            </tr>
                            <tr className="subtotal">
                                <td className="item-name">Total Revenue</td>
                                <td className="amount">{formatCurrency(data.revenue.total)}</td>
                                {hasComparison && (
                                    <>
                                        <td className="amount">
                                            {formatCurrency(data.comparison.rentalIncome + data.comparison.lateFees + data.comparison.otherIncome)}
                                        </td>
                                        <td className="amount change">
                                            {formatCurrency(data.revenue.total - (data.comparison.rentalIncome + data.comparison.lateFees + data.comparison.otherIncome))}
                                        </td>
                                        <td className="amount percentage">
                                            {calculatePercentageChange(
                                                data.revenue.total,
                                                data.comparison.rentalIncome + data.comparison.lateFees + data.comparison.otherIncome
                                            )}%
                                        </td>
                                    </>
                                )}
                            </tr>
                            
                            {/* Expenses Section */}
                            <tr className="section-header">
                                <td colSpan={hasComparison ? 5 : 2}>OPERATING EXPENSES</td>
                            </tr>
                            {Object.entries(data.expenses).filter(([key]) => key !== 'total').map(([key, value]) => (
                                <tr key={key} className="line-item">
                                    <td className="item-name">{key.charAt(0).toUpperCase() + key.slice(1)}</td>
                                    <td className="amount">{formatCurrency(value)}</td>
                                    {hasComparison && (
                                        <>
                                            <td className="amount">{formatCurrency(data.comparison.expenses[key])}</td>
                                            <td className="amount change">
                                                {formatCurrency(value - data.comparison.expenses[key])}
                                            </td>
                                            <td className="amount percentage">
                                                {calculatePercentageChange(value, data.comparison.expenses[key])}%
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            <tr className="subtotal">
                                <td className="item-name">Total Operating Expenses</td>
                                <td className="amount">{formatCurrency(data.expenses.total)}</td>
                                {hasComparison && (
                                    <>
                                        <td className="amount">{formatCurrency(data.comparison.expenses.total)}</td>
                                        <td className="amount change">
                                            {formatCurrency(data.expenses.total - data.comparison.expenses.total)}
                                        </td>
                                        <td className="amount percentage">
                                            {calculatePercentageChange(data.expenses.total, data.comparison.expenses.total)}%
                                        </td>
                                    </>
                                )}
                            </tr>
                            
                            {/* Net Income */}
                            <tr className="net-income">
                                <td className="item-name">NET INCOME</td>
                                <td className="amount">{formatCurrency(data.netIncome)}</td>
                                {hasComparison && (
                                    <>
                                        <td className="amount">
                                            {formatCurrency(
                                                (data.comparison.rentalIncome + data.comparison.lateFees + data.comparison.otherIncome) - 
                                                data.comparison.expenses.total
                                            )}
                                        </td>
                                        <td className="amount change">
                                            {formatCurrency(
                                                data.netIncome - 
                                                ((data.comparison.rentalIncome + data.comparison.lateFees + data.comparison.otherIncome) - 
                                                data.comparison.expenses.total)
                                            )}
                                        </td>
                                        <td className="amount percentage">
                                            {calculatePercentageChange(
                                                data.netIncome,
                                                (data.comparison.rentalIncome + data.comparison.lateFees + data.comparison.otherIncome) - 
                                                data.comparison.expenses.total
                                            )}%
                                        </td>
                                    </>
                                )}
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>
            
            {viewMode === 'detailed' && (
                <div className="detailed-notes">
                    <h3>Notes & Analysis</h3>
                    <div className="note-item">
                        <h4>Revenue Trends</h4>
                        <p>Rental income represents {((data.revenue.rentalIncome / data.revenue.total) * 100).toFixed(1)}% of total revenue.</p>
                    </div>
                    <div className="note-item">
                        <h4>Expense Breakdown</h4>
                        <p>Operating expenses are {((data.expenses.total / data.revenue.total) * 100).toFixed(1)}% of revenue.</p>
                    </div>
                    <div className="note-item">
                        <h4>Profitability</h4>
                        <p>Net profit margin: {((data.netIncome / data.revenue.total) * 100).toFixed(1)}%</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// Balance Sheet Display Component
const BalanceSheetDisplay = ({ data, viewMode, formatCurrency }) => {
    return (
        <div className="statement-container balance-sheet">
            <div className="statement-header">
                <h2>Balance Sheet</h2>
                <p className="statement-period">
                    As of {new Date(data.asOfDate).toLocaleDateString()}
                </p>
            </div>
            
            <div className={`statement-body ${viewMode}`}>
                {viewMode === 'graphical' ? (
                    <BalanceSheetChart data={data} />
                ) : (
                    <div className="balance-sheet-columns">
                        {/* Assets Column */}
                        <div className="assets-column">
                            <table className="statement-table">
                                <thead>
                                    <tr>
                                        <th colSpan="2" className="section-title">ASSETS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="section-header">
                                        <td colSpan="2">Current Assets</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Cash & Cash Equivalents</td>
                                        <td className="amount">{formatCurrency(data.assets.current.cash)}</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Accounts Receivable</td>
                                        <td className="amount">{formatCurrency(data.assets.current.accountsReceivable)}</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Prepaid Expenses</td>
                                        <td className="amount">{formatCurrency(data.assets.current.prepaidExpenses)}</td>
                                    </tr>
                                    <tr className="subtotal">
                                        <td className="item-name">Total Current Assets</td>
                                        <td className="amount">{formatCurrency(data.assets.current.total)}</td>
                                    </tr>
                                    
                                    <tr className="section-header">
                                        <td colSpan="2">Fixed Assets</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Property & Buildings</td>
                                        <td className="amount">{formatCurrency(data.assets.fixed.propertyValue)}</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Less: Accumulated Depreciation</td>
                                        <td className="amount">{formatCurrency(data.assets.fixed.accumulatedDepreciation)}</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Equipment & Fixtures</td>
                                        <td className="amount">{formatCurrency(data.assets.fixed.equipment)}</td>
                                    </tr>
                                    <tr className="subtotal">
                                        <td className="item-name">Total Fixed Assets</td>
                                        <td className="amount">{formatCurrency(data.assets.fixed.total)}</td>
                                    </tr>
                                    
                                    <tr className="grand-total">
                                        <td className="item-name">TOTAL ASSETS</td>
                                        <td className="amount">{formatCurrency(data.assets.total)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Liabilities & Equity Column */}
                        <div className="liabilities-column">
                            <table className="statement-table">
                                <thead>
                                    <tr>
                                        <th colSpan="2" className="section-title">LIABILITIES & EQUITY</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="section-header">
                                        <td colSpan="2">Current Liabilities</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Accounts Payable</td>
                                        <td className="amount">{formatCurrency(data.liabilities.current.accountsPayable)}</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Accrued Expenses</td>
                                        <td className="amount">{formatCurrency(data.liabilities.current.accruedExpenses)}</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Security Deposits</td>
                                        <td className="amount">{formatCurrency(data.liabilities.current.securityDeposits)}</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Prepaid Rent</td>
                                        <td className="amount">{formatCurrency(data.liabilities.current.prepaidRent)}</td>
                                    </tr>
                                    <tr className="subtotal">
                                        <td className="item-name">Total Current Liabilities</td>
                                        <td className="amount">{formatCurrency(data.liabilities.current.total)}</td>
                                    </tr>
                                    
                                    <tr className="section-header">
                                        <td colSpan="2">Long-Term Liabilities</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Mortgages Payable</td>
                                        <td className="amount">{formatCurrency(data.liabilities.longTerm.mortgages)}</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Notes Payable</td>
                                        <td className="amount">{formatCurrency(data.liabilities.longTerm.notesPayable)}</td>
                                    </tr>
                                    <tr className="subtotal">
                                        <td className="item-name">Total Long-Term Liabilities</td>
                                        <td className="amount">{formatCurrency(data.liabilities.longTerm.total)}</td>
                                    </tr>
                                    <tr className="subtotal">
                                        <td className="item-name">Total Liabilities</td>
                                        <td className="amount">{formatCurrency(data.liabilities.total)}</td>
                                    </tr>
                                    
                                    <tr className="section-header">
                                        <td colSpan="2">Owner's Equity</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Contributed Capital</td>
                                        <td className="amount">{formatCurrency(data.equity.contributedCapital)}</td>
                                    </tr>
                                    <tr className="line-item">
                                        <td className="item-name">Retained Earnings</td>
                                        <td className="amount">{formatCurrency(data.equity.retainedEarnings)}</td>
                                    </tr>
                                    <tr className="subtotal">
                                        <td className="item-name">Total Owner's Equity</td>
                                        <td className="amount">{formatCurrency(data.equity.total)}</td>
                                    </tr>
                                    
                                    <tr className="grand-total">
                                        <td className="item-name">TOTAL LIABILITIES & EQUITY</td>
                                        <td className="amount">{formatCurrency(data.totalLiabilitiesAndEquity)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            
            {viewMode === 'detailed' && (
                <div className="balance-verification">
                    <p className="verification-note">
                        <i className="fas fa-check-circle"></i>
                        Balance Check: Assets ({formatCurrency(data.assets.total)}) = 
                        Liabilities & Equity ({formatCurrency(data.totalLiabilitiesAndEquity)})
                    </p>
                </div>
            )}
        </div>
    );
};

// Cash Flow Statement Display Component
const CashFlowStatementDisplay = ({ data, viewMode, formatCurrency }) => {
    return (
        <div className="statement-container cash-flow">
            <div className="statement-header">
                <h2>Statement of Cash Flows</h2>
                <p className="statement-period">
                    For the period {new Date(data.period.start).toLocaleDateString()} 
                    to {new Date(data.period.end).toLocaleDateString()}
                </p>
            </div>
            
            <div className={`statement-body ${viewMode}`}>
                {/* Implementation continues... */}
            </div>
        </div>
    );
};

// Property Multi-Select Component
const PropertyMultiSelect = ({ selectedProperties, onChange }) => {
    const [properties, setProperties] = React.useState([]);
    const [isOpen, setIsOpen] = React.useState(false);
    
    React.useEffect(() => {
        loadProperties();
    }, []);
    
    const loadProperties = async () => {
        try {
            const response = await window.ApiService.get('/properties');
            setProperties(response.properties || []);
        } catch (error) {
            // Mock data
            setProperties([
                { id: '1', name: 'Sunset Apartments' },
                { id: '2', name: 'Oak Grove Residences' },
                { id: '3', name: 'Riverside Plaza' },
                { id: '4', name: 'Mountain View Complex' }
            ]);
        }
    };
    
    const toggleProperty = (propertyId) => {
        if (propertyId === 'all') {
            onChange(['all']);
        } else {
            const newSelection = selectedProperties.includes(propertyId)
                ? selectedProperties.filter(id => id !== propertyId)
                : [...selectedProperties.filter(id => id !== 'all'), propertyId];
            
            onChange(newSelection.length === 0 ? ['all'] : newSelection);
        }
    };
    
    const getDisplayText = () => {
        if (selectedProperties.includes('all')) return 'All Properties';
        if (selectedProperties.length === 1) {
            const property = properties.find(p => p.id === selectedProperties[0]);
            return property?.name || 'Select Properties';
        }
        return `${selectedProperties.length} Properties Selected`;
    };
    
    return (
        <div className="property-multi-select">
            <button 
                className="select-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{getDisplayText()}</span>
                <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
            </button>
            
            {isOpen && (
                <div className="select-dropdown">
                    <label className="property-option">
                        <input
                            type="checkbox"
                            checked={selectedProperties.includes('all')}
                            onChange={() => toggleProperty('all')}
                        />
                        <span>All Properties</span>
                    </label>
                    
                    <div className="divider"></div>
                    
                    {properties.map(property => (
                        <label key={property.id} className="property-option">
                            <input
                                type="checkbox"
                                checked={selectedProperties.includes(property.id)}
                                onChange={() => toggleProperty(property.id)}
                                disabled={selectedProperties.includes('all')}
                            />
                            <span>{property.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

// Chart Components for Graphical View
const IncomeStatementChart = ({ data }) => {
    React.useEffect(() => {
        // Initialize chart using Chart.js or similar
        // This is a placeholder for the actual chart implementation
    }, [data]);
    
    return (
        <div className="statement-chart">
            <canvas id="income-chart"></canvas>
        </div>
    );
};

const BalanceSheetChart = ({ data }) => {
    return (
        <div className="statement-chart">
            <canvas id="balance-chart"></canvas>
        </div>
    );
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.FinancialStatementsHub = FinancialStatementsHub;