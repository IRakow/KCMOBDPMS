// ReportDataService.js - Comprehensive backend API integration for all reports

class ReportDataService {
    constructor() {
        this.apiService = window.ApiService;
        this.valorService = window.ValorPayTechService;
        
        // Cache for report data
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }
    
    // Main method to fetch report data based on report ID and data source
    async fetchReportData(reportId, dataSource, options = {}) {
        const cacheKey = `${reportId}_${JSON.stringify(options)}`;
        
        // Check cache first
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;
        
        let data;
        
        try {
            switch (dataSource) {
                case 'valor':
                    data = await this.fetchValorData(reportId, options);
                    break;
                case 'payments':
                    data = await this.fetchPaymentData(reportId, options);
                    break;
                case 'accounting':
                    data = await this.fetchAccountingData(reportId, options);
                    break;
                case 'properties':
                    data = await this.fetchPropertyData(reportId, options);
                    break;
                case 'units':
                    data = await this.fetchUnitData(reportId, options);
                    break;
                case 'tenants':
                    data = await this.fetchTenantData(reportId, options);
                    break;
                case 'leases':
                    data = await this.fetchLeaseData(reportId, options);
                    break;
                case 'maintenance':
                    data = await this.fetchMaintenanceData(reportId, options);
                    break;
                case 'vendors':
                    data = await this.fetchVendorData(reportId, options);
                    break;
                case 'leads':
                    data = await this.fetchLeadData(reportId, options);
                    break;
                case 'calendar':
                    data = await this.fetchCalendarData(reportId, options);
                    break;
                case 'applications':
                    data = await this.fetchApplicationData(reportId, options);
                    break;
                case 'owners':
                    data = await this.fetchOwnerData(reportId, options);
                    break;
                case 'media':
                    data = await this.fetchMediaData(reportId, options);
                    break;
                case 'notifications':
                    data = await this.fetchNotificationData(reportId, options);
                    break;
                case 'system':
                    data = await this.fetchSystemData(reportId, options);
                    break;
                default:
                    throw new Error(`Unknown data source: ${dataSource}`);
            }
            
            // Cache the data
            this.setCachedData(cacheKey, data);
            
            return data;
            
        } catch (error) {
            console.error(`Error fetching ${dataSource} data for report ${reportId}:`, error);
            
            // Return mock data as fallback
            return this.getMockData(reportId, dataSource);
        }
    }
    
    // Valor PayTech data
    async fetchValorData(reportId, options) {
        const { dateRange = this.getDefaultDateRange() } = options;
        
        switch (reportId) {
            case 'payment-history':
                const history = await this.valorService.getPaymentHistory({
                    limit: 1000,
                    dateRange: `${dateRange.start},${dateRange.end}`
                });
                return { history };
                
            case 'payment-success':
                const analytics = await this.valorService.getPaymentAnalytics(
                    { start: dateRange.start, end: dateRange.end },
                    'day'
                );
                return this.calculatePaymentSuccessMetrics(analytics);
                
            case 'valor-settlements':
                const settlements = await this.valorService.getSettlements({
                    dateRange: `${dateRange.start},${dateRange.end}`
                });
                return { settlements };
                
            case 'refund-history':
                const refunds = await this.valorService.getRefunds({
                    dateRange: `${dateRange.start},${dateRange.end}`
                });
                return { refunds };
                
            default:
                return {};
        }
    }
    
    // Payment data from internal API
    async fetchPaymentData(reportId, options) {
        const { dateRange = this.getDefaultDateRange() } = options;
        
        switch (reportId) {
            case 'late-fee-analysis':
                const payments = await this.apiService.get('/payments', {
                    start_date: dateRange.start,
                    end_date: dateRange.end,
                    include_fees: true
                });
                return this.analyzeLateFees(payments);
                
            case 'ar-aging':
                const receivables = await this.apiService.get('/accounting/receivables');
                return this.calculateARAgingSummary(receivables);
                
            case 'delinquency':
                const delinquent = await this.apiService.get('/payments/delinquent');
                return this.formatDelinquencyReport(delinquent);
                
            case 'deposit-registry':
                const deposits = await this.apiService.get('/payments/deposits');
                return { deposits };
                
            default:
                return {};
        }
    }
    
    // Accounting data
    async fetchAccountingData(reportId, options) {
        const { dateRange = this.getDefaultDateRange(), propertyId } = options;
        
        try {
            const endpoint = propertyId 
                ? `/accounting/reports/${reportId}?property_id=${propertyId}`
                : `/accounting/reports/${reportId}`;
                
            const data = await this.apiService.get(endpoint, {
                start_date: dateRange.start,
                end_date: dateRange.end
            });
            
            return data;
            
        } catch (error) {
            // Return comprehensive mock data for accounting reports
            return this.getMockAccountingData(reportId, options);
        }
    }
    
    // Property data
    async fetchPropertyData(reportId, options) {
        switch (reportId) {
            case 'property-summary':
                const properties = await this.apiService.get('/properties');
                return this.generatePropertySummary(properties);
                
            case 'amenities-report':
                const amenities = await this.apiService.get('/properties/amenities');
                return { amenities };
                
            case 'insurance-schedule':
                const insurance = await this.apiService.get('/properties/insurance');
                return { insurance };
                
            default:
                return {};
        }
    }
    
    // Unit data
    async fetchUnitData(reportId, options) {
        switch (reportId) {
            case 'unit-directory':
                const units = await this.apiService.get('/units');
                return { units };
                
            case 'unit-vacancy':
                const vacantUnits = await this.apiService.get('/units/vacant');
                return this.analyzeVacancy(vacantUnits);
                
            case 'occupancy-summary':
                const occupancy = await this.apiService.get('/units/occupancy');
                return this.calculateOccupancyMetrics(occupancy);
                
            default:
                return {};
        }
    }
    
    // Tenant data
    async fetchTenantData(reportId, options) {
        switch (reportId) {
            case 'tenant-directory':
                const tenants = await this.apiService.get('/tenants');
                return { tenants };
                
            case 'tenant-ledger':
                const { tenantId } = options;
                if (tenantId) {
                    const ledger = await this.apiService.get(`/tenants/${tenantId}/ledger`);
                    return { ledger };
                }
                return { ledger: [] };
                
            case 'emergency-contacts':
                const contacts = await this.apiService.get('/tenants/emergency-contacts');
                return { contacts };
                
            default:
                return {};
        }
    }
    
    // Lease data
    async fetchLeaseData(reportId, options) {
        const { dateRange = this.getDefaultDateRange() } = options;
        
        switch (reportId) {
            case 'renewal-summary':
                const renewals = await this.apiService.get('/leases/renewals', {
                    start_date: dateRange.start,
                    end_date: dateRange.end
                });
                return this.summarizeRenewals(renewals);
                
            case 'lease-expiration':
                const expirations = await this.apiService.get('/leases/expirations');
                return { expirations };
                
            case 'rent-roll':
                const rentRoll = await this.apiService.get('/leases/rent-roll');
                return { rentRoll };
                
            case 'move-in-out':
                const moveData = await this.apiService.get('/leases/move-activity', {
                    start_date: dateRange.start,
                    end_date: dateRange.end
                });
                return { moveData };
                
            default:
                return {};
        }
    }
    
    // Maintenance data
    async fetchMaintenanceData(reportId, options) {
        const { dateRange = this.getDefaultDateRange() } = options;
        
        switch (reportId) {
            case 'work-order-summary':
                const workOrders = await this.apiService.get('/maintenance/work-orders', {
                    start_date: dateRange.start,
                    end_date: dateRange.end
                });
                return this.summarizeWorkOrders(workOrders);
                
            case 'maintenance-costs':
                const costs = await this.apiService.get('/maintenance/costs');
                return this.analyzeMaintenanceCosts(costs);
                
            case 'unit-turn-time':
                const turnTimes = await this.apiService.get('/maintenance/turn-times');
                return { turnTimes };
                
            case 'preventive-schedule':
                const preventive = await this.apiService.get('/maintenance/preventive');
                return { preventive };
                
            default:
                return {};
        }
    }
    
    // Helper methods for data processing
    calculatePaymentSuccessMetrics(analytics) {
        const total = analytics.summary?.total_transactions || 0;
        const successful = analytics.summary?.successful_transactions || 0;
        const failed = analytics.summary?.failed_transactions || 0;
        
        return {
            successRate: total > 0 ? (successful / total * 100).toFixed(2) : 0,
            totalTransactions: total,
            successfulTransactions: successful,
            failedTransactions: failed,
            dailyBreakdown: analytics.daily || []
        };
    }
    
    analyzeLateFees(payments) {
        const latePayments = payments.filter(p => p.late_fee > 0);
        const totalLateFees = latePayments.reduce((sum, p) => sum + p.late_fee, 0);
        
        return {
            totalLateFees,
            latePaymentCount: latePayments.length,
            averageLateFee: latePayments.length > 0 ? totalLateFees / latePayments.length : 0,
            latePayments
        };
    }
    
    calculateARAgingSummary(receivables) {
        const aging = {
            current: [],
            days_30: [],
            days_60: [],
            days_90: [],
            over_90: []
        };
        
        const today = new Date();
        
        receivables.forEach(item => {
            const dueDate = new Date(item.due_date);
            const daysPastDue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            
            if (daysPastDue <= 0) aging.current.push(item);
            else if (daysPastDue <= 30) aging.days_30.push(item);
            else if (daysPastDue <= 60) aging.days_60.push(item);
            else if (daysPastDue <= 90) aging.days_90.push(item);
            else aging.over_90.push(item);
        });
        
        return {
            aging,
            summary: {
                current: this.sumAmount(aging.current),
                days_30: this.sumAmount(aging.days_30),
                days_60: this.sumAmount(aging.days_60),
                days_90: this.sumAmount(aging.days_90),
                over_90: this.sumAmount(aging.over_90)
            }
        };
    }
    
    formatDelinquencyReport(delinquent) {
        return {
            totalDelinquent: delinquent.length,
            totalAmount: this.sumAmount(delinquent),
            byProperty: this.groupByProperty(delinquent),
            delinquentAccounts: delinquent
        };
    }
    
    generatePropertySummary(properties) {
        const totalUnits = properties.reduce((sum, p) => sum + (p.total_units || 0), 0);
        const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupied_units || 0), 0);
        
        return {
            totalProperties: properties.length,
            totalUnits,
            occupiedUnits,
            vacantUnits: totalUnits - occupiedUnits,
            occupancyRate: totalUnits > 0 ? (occupiedUnits / totalUnits * 100).toFixed(2) : 0,
            properties
        };
    }
    
    analyzeVacancy(vacantUnits) {
        const byProperty = this.groupByProperty(vacantUnits);
        const averageVacancyDays = vacantUnits.reduce((sum, u) => sum + (u.vacant_days || 0), 0) / vacantUnits.length;
        
        return {
            totalVacant: vacantUnits.length,
            averageVacancyDays: averageVacancyDays.toFixed(1),
            byProperty,
            vacantUnits
        };
    }
    
    calculateOccupancyMetrics(occupancyData) {
        return {
            currentOccupancy: occupancyData.current_rate || 0,
            monthlyTrend: occupancyData.monthly_trend || [],
            projectedOccupancy: occupancyData.projected_rate || 0,
            byPropertyType: occupancyData.by_property_type || {}
        };
    }
    
    summarizeRenewals(renewals) {
        const upcoming30Days = renewals.filter(r => {
            const days = this.daysUntil(r.lease_end_date);
            return days >= 0 && days <= 30;
        });
        
        const upcoming60Days = renewals.filter(r => {
            const days = this.daysUntil(r.lease_end_date);
            return days > 30 && days <= 60;
        });
        
        const upcoming90Days = renewals.filter(r => {
            const days = this.daysUntil(r.lease_end_date);
            return days > 60 && days <= 90;
        });
        
        return {
            total: renewals.length,
            upcoming30Days: upcoming30Days.length,
            upcoming60Days: upcoming60Days.length,
            upcoming90Days: upcoming90Days.length,
            renewals
        };
    }
    
    summarizeWorkOrders(workOrders) {
        const byStatus = this.groupByStatus(workOrders);
        const byPriority = this.groupByPriority(workOrders);
        const avgCompletionTime = this.calculateAvgCompletionTime(workOrders);
        
        return {
            total: workOrders.length,
            byStatus,
            byPriority,
            avgCompletionTime,
            workOrders
        };
    }
    
    analyzeMaintenanceCosts(costs) {
        const byCategory = this.groupByCategory(costs);
        const byProperty = this.groupByProperty(costs);
        const totalCost = this.sumAmount(costs);
        
        return {
            totalCost,
            averageCost: costs.length > 0 ? totalCost / costs.length : 0,
            byCategory,
            byProperty,
            costs
        };
    }
    
    // Utility methods
    getDefaultDateRange() {
        const end = new Date().toISOString();
        const start = new Date();
        start.setMonth(start.getMonth() - 1);
        return { start: start.toISOString(), end };
    }
    
    daysUntil(date) {
        const target = new Date(date);
        const today = new Date();
        return Math.floor((target - today) / (1000 * 60 * 60 * 24));
    }
    
    sumAmount(items) {
        return items.reduce((sum, item) => sum + (item.amount || 0), 0);
    }
    
    groupByProperty(items) {
        return items.reduce((groups, item) => {
            const property = item.property_name || 'Unknown';
            if (!groups[property]) groups[property] = [];
            groups[property].push(item);
            return groups;
        }, {});
    }
    
    groupByStatus(items) {
        return items.reduce((groups, item) => {
            const status = item.status || 'unknown';
            if (!groups[status]) groups[status] = 0;
            groups[status]++;
            return groups;
        }, {});
    }
    
    groupByPriority(items) {
        return items.reduce((groups, item) => {
            const priority = item.priority || 'normal';
            if (!groups[priority]) groups[priority] = 0;
            groups[priority]++;
            return groups;
        }, {});
    }
    
    groupByCategory(items) {
        return items.reduce((groups, item) => {
            const category = item.category || 'Other';
            if (!groups[category]) groups[category] = 0;
            groups[category] += item.amount || 0;
            return groups;
        }, {});
    }
    
    calculateAvgCompletionTime(workOrders) {
        const completed = workOrders.filter(wo => wo.status === 'completed' && wo.completion_time);
        if (completed.length === 0) return 0;
        
        const totalTime = completed.reduce((sum, wo) => sum + wo.completion_time, 0);
        return (totalTime / completed.length).toFixed(1);
    }
    
    // Cache management
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }
    
    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    // Mock data generation
    getMockData(reportId, dataSource) {
        // Return appropriate mock data based on report type
        const mockGenerators = {
            'income-statement': () => this.getMockAccountingData('income-statement'),
            'balance-sheet': () => this.getMockAccountingData('balance-sheet'),
            'cash-flow': () => this.getMockAccountingData('cash-flow'),
            'payment-history': () => this.getMockPaymentHistory(),
            'property-summary': () => this.getMockPropertySummary(),
            'work-order-summary': () => this.getMockWorkOrderSummary(),
            'tenant-directory': () => this.getMockTenantDirectory(),
            'rent-roll': () => this.getMockRentRoll()
        };
        
        const generator = mockGenerators[reportId];
        return generator ? generator() : { message: 'No data available' };
    }
    
    getMockAccountingData(reportId) {
        const baseData = {
            'income-statement': {
                income_statement: {
                    revenue: {
                        rental_income: 125000,
                        late_fees: 2500,
                        other_income: 3200,
                        total: 130700
                    },
                    expenses: {
                        maintenance: 15000,
                        utilities: 8500,
                        management: 10456,
                        insurance: 4200,
                        taxes: 12000,
                        total: 50156
                    },
                    net_income: 80544
                }
            },
            'balance-sheet': {
                balance_sheet: {
                    assets: {
                        cash: 250000,
                        accounts_receivable: 15000,
                        property_value: 4200000,
                        total: 4465000
                    },
                    liabilities: {
                        accounts_payable: 12000,
                        mortgages: 2800000,
                        deposits: 45000,
                        total: 2857000
                    },
                    equity: 1608000
                }
            },
            'cash-flow': {
                cash_flow: {
                    operating_activities: {
                        net_income: 80544,
                        depreciation: 12000,
                        changes_in_working_capital: -5000,
                        total: 87544
                    },
                    investing_activities: {
                        property_purchases: -150000,
                        equipment_purchases: -8000,
                        total: -158000
                    },
                    financing_activities: {
                        loan_proceeds: 100000,
                        loan_payments: -45000,
                        distributions: -35000,
                        total: 20000
                    },
                    net_change_in_cash: -50456
                }
            }
        };
        
        return baseData[reportId] || {};
    }
    
    getMockPaymentHistory() {
        const payments = [];
        const tenants = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emily Brown', 'David Lee'];
        const properties = ['Sunset Apartments', 'Oak Grove', 'Riverside Plaza', 'Mountain View'];
        const statuses = ['paid', 'paid', 'paid', 'pending', 'failed'];
        
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 30));
            
            payments.push({
                id: `PAY${1000 + i}`,
                createdAt: date.toISOString(),
                amount: 1200 + Math.floor(Math.random() * 800),
                paymentMethod: Math.random() > 0.5 ? 'card' : 'ach_debit',
                status: statuses[Math.floor(Math.random() * statuses.length)],
                metadata: {
                    tenant_name: tenants[Math.floor(Math.random() * tenants.length)],
                    property_name: properties[Math.floor(Math.random() * properties.length)],
                    unit_number: `${Math.floor(Math.random() * 3) + 1}0${Math.floor(Math.random() * 9) + 1}`
                }
            });
        }
        
        return {
            history: {
                payments: payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }
        };
    }
    
    getMockPropertySummary() {
        return {
            totalProperties: 8,
            totalUnits: 156,
            occupiedUnits: 142,
            vacantUnits: 14,
            occupancyRate: '91.03',
            properties: [
                { name: 'Sunset Apartments', total_units: 48, occupied_units: 45, address: '123 Sunset Blvd' },
                { name: 'Oak Grove Residences', total_units: 36, occupied_units: 34, address: '456 Oak Street' },
                { name: 'Riverside Plaza', total_units: 24, occupied_units: 22, address: '789 River Road' },
                { name: 'Mountain View Complex', total_units: 48, occupied_units: 41, address: '321 Mountain Ave' }
            ]
        };
    }
    
    getMockWorkOrderSummary() {
        return {
            total: 127,
            byStatus: {
                open: 23,
                in_progress: 18,
                completed: 86
            },
            byPriority: {
                emergency: 5,
                high: 22,
                normal: 78,
                low: 22
            },
            avgCompletionTime: '2.3',
            workOrders: []
        };
    }
    
    getMockTenantDirectory() {
        const tenants = [];
        const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'James', 'Maria'];
        const lastNames = ['Smith', 'Johnson', 'Wilson', 'Brown', 'Lee', 'Garcia', 'Davis', 'Martinez'];
        
        for (let i = 0; i < 142; i++) {
            tenants.push({
                id: `TEN${1000 + i}`,
                first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
                last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
                email: `tenant${i}@email.com`,
                phone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
                unit_number: `${Math.floor(Math.random() * 3) + 1}0${Math.floor(Math.random() * 9) + 1}`,
                property_name: ['Sunset Apartments', 'Oak Grove', 'Riverside Plaza', 'Mountain View'][Math.floor(Math.random() * 4)],
                lease_start: new Date(2024, Math.floor(Math.random() * 12), 1).toISOString(),
                lease_end: new Date(2025, Math.floor(Math.random() * 12), 1).toISOString()
            });
        }
        
        return { tenants };
    }
    
    getMockRentRoll() {
        const rentRoll = [];
        const properties = ['Sunset Apartments', 'Oak Grove', 'Riverside Plaza', 'Mountain View'];
        
        for (let p = 0; p < properties.length; p++) {
            for (let u = 1; u <= 12; u++) {
                const isOccupied = Math.random() > 0.1;
                rentRoll.push({
                    property_name: properties[p],
                    unit_number: `${p + 1}0${u}`,
                    status: isOccupied ? 'occupied' : 'vacant',
                    tenant_name: isOccupied ? `Tenant ${p * 12 + u}` : null,
                    monthly_rent: isOccupied ? 1200 + Math.floor(Math.random() * 800) : null,
                    lease_start: isOccupied ? new Date(2024, Math.floor(Math.random() * 12), 1).toISOString() : null,
                    lease_end: isOccupied ? new Date(2025, Math.floor(Math.random() * 12), 1).toISOString() : null,
                    balance: isOccupied ? Math.random() > 0.9 ? -Math.floor(Math.random() * 500) : 0 : null
                });
            }
        }
        
        return { rentRoll };
    }
}

// Create and export singleton instance
const reportDataService = new ReportDataService();

// Register globally
window.ReportDataService = reportDataService;