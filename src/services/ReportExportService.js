// ReportExportService.js - Handles exporting reports to various formats

class ReportExportService {
    constructor() {
        this.exportFormats = {
            pdf: {
                mimeType: 'application/pdf',
                extension: '.pdf'
            },
            excel: {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                extension: '.xlsx'
            },
            csv: {
                mimeType: 'text/csv',
                extension: '.csv'
            }
        };
    }
    
    // Export report to PDF format
    async exportToPDF(reportData, reportName) {
        try {
            // Create PDF content structure
            const pdfContent = {
                content: [],
                styles: {
                    header: {
                        fontSize: 24,
                        bold: true,
                        margin: [0, 0, 0, 20],
                        color: '#1e293b'
                    },
                    subheader: {
                        fontSize: 18,
                        bold: true,
                        margin: [0, 20, 0, 10],
                        color: '#374151'
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 13,
                        color: '#6b7280',
                        fillColor: '#f9fafb'
                    },
                    tableCell: {
                        fontSize: 12,
                        color: '#374151'
                    },
                    label: {
                        fontSize: 12,
                        color: '#6b7280',
                        margin: [0, 0, 0, 5]
                    },
                    value: {
                        fontSize: 14,
                        color: '#1e293b',
                        margin: [0, 0, 0, 10]
                    }
                },
                defaultStyle: {
                    font: 'Helvetica'
                }
            };
            
            // Add report header
            pdfContent.content.push({
                text: reportName,
                style: 'header'
            });
            
            // Add generation date
            pdfContent.content.push({
                text: `Generated: ${new Date().toLocaleString()}`,
                style: 'label',
                margin: [0, 0, 0, 30]
            });
            
            // Handle different report types
            if (reportData.income_statement) {
                this.addIncomeStatementToPDF(pdfContent, reportData.income_statement);
            } else if (reportData.balance_sheet) {
                this.addBalanceSheetToPDF(pdfContent, reportData.balance_sheet);
            } else if (reportData.history?.payments) {
                this.addPaymentHistoryToPDF(pdfContent, reportData.history.payments);
            } else if (Array.isArray(reportData)) {
                this.addTableDataToPDF(pdfContent, reportData, reportName);
            } else {
                this.addGenericDataToPDF(pdfContent, reportData);
            }
            
            // Use browser's print functionality to generate PDF
            return this.generatePDFFromContent(pdfContent, reportName);
            
        } catch (error) {
            console.error('PDF export error:', error);
            throw new Error('Failed to export report to PDF');
        }
    }
    
    // Export report to Excel format
    async exportToExcel(reportData, reportName) {
        try {
            // Create workbook structure
            const workbook = {
                sheets: [],
                metadata: {
                    created: new Date().toISOString(),
                    reportName: reportName
                }
            };
            
            // Handle different report types
            if (reportData.income_statement) {
                workbook.sheets.push(this.createIncomeStatementSheet(reportData.income_statement));
            }
            
            if (reportData.balance_sheet) {
                workbook.sheets.push(this.createBalanceSheetSheet(reportData.balance_sheet));
            }
            
            if (reportData.history?.payments) {
                workbook.sheets.push(this.createPaymentHistorySheet(reportData.history.payments));
            }
            
            if (Array.isArray(reportData)) {
                workbook.sheets.push(this.createDataTableSheet(reportData, reportName));
            }
            
            // If no specific format, create generic sheet
            if (workbook.sheets.length === 0) {
                workbook.sheets.push(this.createGenericSheet(reportData, reportName));
            }
            
            // Convert to Excel format and download
            return this.generateExcelFile(workbook, reportName);
            
        } catch (error) {
            console.error('Excel export error:', error);
            throw new Error('Failed to export report to Excel');
        }
    }
    
    // Export report to CSV format
    async exportToCSV(reportData, reportName) {
        try {
            let csvContent = '';
            
            // Handle array data (like payment history)
            if (Array.isArray(reportData)) {
                if (reportData.length > 0) {
                    // Extract headers from first object
                    const headers = Object.keys(reportData[0]);
                    csvContent = headers.join(',') + '\n';
                    
                    // Add data rows
                    reportData.forEach(row => {
                        const values = headers.map(header => {
                            const value = row[header];
                            // Escape quotes and wrap in quotes if contains comma
                            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                                return `"${value.replace(/"/g, '""')}"`;
                            }
                            return value;
                        });
                        csvContent += values.join(',') + '\n';
                    });
                }
            }
            // Handle payment history specifically
            else if (reportData.history?.payments) {
                const payments = reportData.history.payments;
                csvContent = 'Date,Tenant,Property,Amount,Method,Status\n';
                payments.forEach(payment => {
                    csvContent += `${new Date(payment.createdAt).toLocaleDateString()},`;
                    csvContent += `"${payment.metadata?.tenant_name || 'Unknown'}",`;
                    csvContent += `"${payment.metadata?.property_name || 'Unknown'}",`;
                    csvContent += `${payment.amount},`;
                    csvContent += `${payment.paymentMethod},`;
                    csvContent += `${payment.status}\n`;
                });
            }
            // Handle financial statements
            else if (reportData.income_statement || reportData.balance_sheet) {
                csvContent = this.financialStatementToCSV(reportData);
            }
            // Generic object to CSV
            else {
                csvContent = this.objectToCSV(reportData);
            }
            
            // Download CSV file
            this.downloadFile(csvContent, `${reportName}.csv`, 'text/csv');
            
        } catch (error) {
            console.error('CSV export error:', error);
            throw new Error('Failed to export report to CSV');
        }
    }
    
    // Helper: Add Income Statement to PDF
    addIncomeStatementToPDF(pdfContent, data) {
        pdfContent.content.push({
            text: 'Income Statement',
            style: 'subheader'
        });
        
        // Revenue section
        pdfContent.content.push({
            text: 'Revenue',
            style: 'label',
            bold: true,
            margin: [0, 10, 0, 10]
        });
        
        const revenueData = [
            ['Rental Income', this.formatCurrency(data.revenue?.rental_income)],
            ['Late Fees', this.formatCurrency(data.revenue?.late_fees)],
            ['Other Income', this.formatCurrency(data.revenue?.other_income)],
            ['Total Revenue', this.formatCurrency(data.revenue?.total)]
        ];
        
        pdfContent.content.push({
            table: {
                widths: ['*', 100],
                body: revenueData
            },
            layout: {
                hLineWidth: function(i, node) {
                    return i === node.table.body.length - 1 ? 2 : 0;
                },
                vLineWidth: () => 0,
                paddingTop: () => 8,
                paddingBottom: () => 8
            }
        });
        
        // Expenses section
        pdfContent.content.push({
            text: 'Expenses',
            style: 'label',
            bold: true,
            margin: [0, 20, 0, 10]
        });
        
        const expenseData = [
            ['Maintenance', this.formatCurrency(data.expenses?.maintenance)],
            ['Utilities', this.formatCurrency(data.expenses?.utilities)],
            ['Management Fees', this.formatCurrency(data.expenses?.management)],
            ['Insurance', this.formatCurrency(data.expenses?.insurance)],
            ['Property Taxes', this.formatCurrency(data.expenses?.taxes)],
            ['Total Expenses', this.formatCurrency(data.expenses?.total)]
        ];
        
        pdfContent.content.push({
            table: {
                widths: ['*', 100],
                body: expenseData
            },
            layout: {
                hLineWidth: function(i, node) {
                    return i === node.table.body.length - 1 ? 2 : 0;
                },
                vLineWidth: () => 0,
                paddingTop: () => 8,
                paddingBottom: () => 8
            }
        });
        
        // Net Income
        pdfContent.content.push({
            text: 'Net Income',
            style: 'label',
            bold: true,
            margin: [0, 20, 0, 10]
        });
        
        pdfContent.content.push({
            text: this.formatCurrency(data.net_income),
            style: 'value',
            bold: true,
            fontSize: 18,
            color: data.net_income >= 0 ? '#10b981' : '#ef4444'
        });
    }
    
    // Helper: Add Payment History to PDF
    addPaymentHistoryToPDF(pdfContent, payments) {
        pdfContent.content.push({
            text: 'Payment Transaction History',
            style: 'subheader'
        });
        
        const tableBody = [
            // Header row
            [
                { text: 'Date', style: 'tableHeader' },
                { text: 'Tenant', style: 'tableHeader' },
                { text: 'Property', style: 'tableHeader' },
                { text: 'Amount', style: 'tableHeader' },
                { text: 'Method', style: 'tableHeader' },
                { text: 'Status', style: 'tableHeader' }
            ]
        ];
        
        // Data rows
        payments.forEach(payment => {
            tableBody.push([
                { text: new Date(payment.createdAt).toLocaleDateString(), style: 'tableCell' },
                { text: payment.metadata?.tenant_name || 'Unknown', style: 'tableCell' },
                { text: payment.metadata?.property_name || 'Unknown', style: 'tableCell' },
                { text: this.formatCurrency(payment.amount), style: 'tableCell' },
                { text: payment.paymentMethod, style: 'tableCell' },
                { text: payment.status, style: 'tableCell', color: this.getStatusColor(payment.status) }
            ]);
        });
        
        pdfContent.content.push({
            table: {
                headerRows: 1,
                widths: ['auto', '*', '*', 'auto', 'auto', 'auto'],
                body: tableBody
            },
            layout: {
                hLineWidth: (i) => i === 1 ? 1 : 0,
                vLineWidth: () => 0,
                hLineColor: () => '#e5e7eb',
                paddingTop: () => 8,
                paddingBottom: () => 8
            }
        });
    }
    
    // Helper: Generate PDF from content
    generatePDFFromContent(content, filename) {
        // Create a new window with print-friendly content
        const printWindow = window.open('', '_blank');
        
        // Build HTML content
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    @page { margin: 1in; }
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    h1 { color: #1e293b; margin-bottom: 10px; }
                    h2 { color: #374151; margin-top: 30px; margin-bottom: 15px; }
                    .date { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #f9fafb; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
                    td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
                    .total-row { font-weight: bold; border-top: 2px solid #e5e7eb; }
                    .net-income { font-size: 24px; font-weight: bold; margin: 20px 0; }
                    .positive { color: #10b981; }
                    .negative { color: #ef4444; }
                    @media print {
                        body { margin: 0; }
                    }
                </style>
            </head>
            <body>
                ${this.contentToHTML(content)}
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.print();
            printWindow.onafterprint = () => {
                printWindow.close();
            };
        };
    }
    
    // Helper: Convert content structure to HTML
    contentToHTML(content) {
        let html = '';
        
        content.content.forEach(item => {
            if (typeof item === 'string') {
                html += `<p>${item}</p>`;
            } else if (item.text) {
                const style = item.style || '';
                if (style === 'header') {
                    html += `<h1>${item.text}</h1>`;
                } else if (style === 'subheader') {
                    html += `<h2>${item.text}</h2>`;
                } else if (style === 'label' && item.text.includes('Generated:')) {
                    html += `<div class="date">${item.text}</div>`;
                } else if (style === 'value' && item.bold) {
                    const colorClass = item.color === '#10b981' ? 'positive' : item.color === '#ef4444' ? 'negative' : '';
                    html += `<div class="net-income ${colorClass}">${item.text}</div>`;
                } else {
                    html += `<p>${item.text}</p>`;
                }
            } else if (item.table) {
                html += this.tableToHTML(item.table);
            }
        });
        
        return html;
    }
    
    // Helper: Convert table to HTML
    tableToHTML(table) {
        let html = '<table>';
        
        table.body.forEach((row, rowIndex) => {
            html += '<tr>';
            row.forEach(cell => {
                const isHeader = rowIndex === 0 && table.headerRows === 1;
                const tag = isHeader ? 'th' : 'td';
                const text = typeof cell === 'string' ? cell : cell.text;
                const isTotal = text && (text.includes('Total') || text === 'Net Income');
                const className = isTotal ? 'total-row' : '';
                html += `<${tag} class="${className}">${text}</${tag}>`;
            });
            html += '</tr>';
        });
        
        html += '</table>';
        return html;
    }
    
    // Helper: Generate Excel file
    generateExcelFile(workbook, filename) {
        // For now, we'll use a simplified CSV approach
        // In production, you would use a library like SheetJS
        
        let csvContent = '';
        
        workbook.sheets.forEach((sheet, index) => {
            if (index > 0) csvContent += '\n\n';
            
            // Add sheet name
            csvContent += `Sheet: ${sheet.name}\n\n`;
            
            // Add headers
            if (sheet.headers) {
                csvContent += sheet.headers.join(',') + '\n';
            }
            
            // Add data
            sheet.data.forEach(row => {
                csvContent += row.join(',') + '\n';
            });
        });
        
        // Download as CSV (Excel can open CSV files)
        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    }
    
    // Helper: Create Income Statement sheet
    createIncomeStatementSheet(data) {
        return {
            name: 'Income Statement',
            headers: ['Item', 'Amount'],
            data: [
                ['REVENUE', ''],
                ['Rental Income', this.formatCurrency(data.revenue?.rental_income)],
                ['Late Fees', this.formatCurrency(data.revenue?.late_fees)],
                ['Other Income', this.formatCurrency(data.revenue?.other_income)],
                ['Total Revenue', this.formatCurrency(data.revenue?.total)],
                ['', ''],
                ['EXPENSES', ''],
                ['Maintenance', this.formatCurrency(data.expenses?.maintenance)],
                ['Utilities', this.formatCurrency(data.expenses?.utilities)],
                ['Management Fees', this.formatCurrency(data.expenses?.management)],
                ['Insurance', this.formatCurrency(data.expenses?.insurance)],
                ['Property Taxes', this.formatCurrency(data.expenses?.taxes)],
                ['Total Expenses', this.formatCurrency(data.expenses?.total)],
                ['', ''],
                ['NET INCOME', this.formatCurrency(data.net_income)]
            ]
        };
    }
    
    // Helper: Create Payment History sheet
    createPaymentHistorySheet(payments) {
        return {
            name: 'Payment History',
            headers: ['Date', 'Tenant', 'Property', 'Amount', 'Method', 'Status'],
            data: payments.map(payment => [
                new Date(payment.createdAt).toLocaleDateString(),
                payment.metadata?.tenant_name || 'Unknown',
                payment.metadata?.property_name || 'Unknown',
                this.formatCurrency(payment.amount),
                payment.paymentMethod,
                payment.status
            ])
        };
    }
    
    // Helper: Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0);
    }
    
    // Helper: Get status color
    getStatusColor(status) {
        const colors = {
            paid: '#10b981',
            pending: '#f59e0b',
            failed: '#ef4444'
        };
        return colors[status] || '#6b7280';
    }
    
    // Helper: Download file
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
    
    // Helper: Convert object to CSV
    objectToCSV(obj) {
        let csv = '';
        
        const addRow = (key, value, indent = 0) => {
            const indentStr = '  '.repeat(indent);
            if (typeof value === 'object' && value !== null) {
                csv += `${indentStr}${key}\n`;
                Object.entries(value).forEach(([k, v]) => {
                    addRow(k, v, indent + 1);
                });
            } else {
                csv += `${indentStr}${key},${value}\n`;
            }
        };
        
        Object.entries(obj).forEach(([key, value]) => {
            addRow(key, value);
        });
        
        return csv;
    }
    
    // Helper: Convert financial statement to CSV
    financialStatementToCSV(data) {
        let csv = 'Category,Item,Amount\n';
        
        if (data.income_statement) {
            const stmt = data.income_statement;
            
            // Revenue
            csv += `Revenue,Rental Income,${stmt.revenue?.rental_income || 0}\n`;
            csv += `Revenue,Late Fees,${stmt.revenue?.late_fees || 0}\n`;
            csv += `Revenue,Other Income,${stmt.revenue?.other_income || 0}\n`;
            csv += `Revenue,Total Revenue,${stmt.revenue?.total || 0}\n`;
            
            // Expenses
            csv += `Expenses,Maintenance,${stmt.expenses?.maintenance || 0}\n`;
            csv += `Expenses,Utilities,${stmt.expenses?.utilities || 0}\n`;
            csv += `Expenses,Management Fees,${stmt.expenses?.management || 0}\n`;
            csv += `Expenses,Insurance,${stmt.expenses?.insurance || 0}\n`;
            csv += `Expenses,Property Taxes,${stmt.expenses?.taxes || 0}\n`;
            csv += `Expenses,Total Expenses,${stmt.expenses?.total || 0}\n`;
            
            // Net Income
            csv += `Summary,Net Income,${stmt.net_income || 0}\n`;
        }
        
        return csv;
    }
}

// Create and export singleton instance
const reportExportService = new ReportExportService();

// Register globally
window.ReportExportService = reportExportService;