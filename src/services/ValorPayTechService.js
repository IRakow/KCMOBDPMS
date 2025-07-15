// ValorPayTechService.js - Valor PayTech Payment Processing Integration
class ValorPayTechService {
    constructor() {
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'https://sandbox.valorpaytech.com/api/v1'
            : 'https://api.valorpaytech.com/api/v1';
        
        // Valor PayTech credentials (will be replaced with env vars in production)
        this.merchantId = process.env.REACT_APP_VALOR_MERCHANT_ID || 'TEST_MERCHANT_001';
        this.apiKey = process.env.REACT_APP_VALOR_API_KEY || 'test_key_development';
        this.webhookSecret = process.env.REACT_APP_VALOR_WEBHOOK_SECRET || 'webhook_secret';
        
        // Payment status mapping
        this.statusMap = {
            'processing': 'pending',
            'completed': 'paid',
            'failed': 'failed',
            'refunded': 'refunded',
            'cancelled': 'cancelled'
        };
        
        // Initialize payment queue for retry logic
        this.paymentQueue = [];
        this.retryAttempts = 3;
        this.retryDelay = 5000; // 5 seconds
    }

    // Get authorization headers
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Merchant-ID': this.merchantId,
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Idempotency-Key': this.generateIdempotencyKey()
        };
    }

    // Generate unique idempotency key for each request
    generateIdempotencyKey() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Create a payment intent for rent collection
    async createPaymentIntent(paymentData) {
        try {
            const payload = {
                amount: Math.round(paymentData.amount * 100), // Convert to cents
                currency: 'USD',
                payment_method_types: ['card', 'ach_debit'],
                metadata: {
                    tenant_id: paymentData.tenantId,
                    property_id: paymentData.propertyId,
                    unit_id: paymentData.unitId,
                    payment_type: paymentData.type || 'rent',
                    due_date: paymentData.dueDate,
                    lease_id: paymentData.leaseId,
                    description: paymentData.description || `Rent payment for ${paymentData.unitNumber}`
                },
                capture_method: 'automatic',
                setup_future_usage: paymentData.savePaymentMethod ? 'on_session' : null,
                customer: paymentData.customerId || null
            };

            const response = await fetch(`${this.baseURL}/payment_intents`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Payment intent creation failed: ${response.status}`);
            }

            const data = await response.json();
            
            // Store payment intent in local system
            await this.storePaymentRecord({
                intentId: data.id,
                tenantId: paymentData.tenantId,
                amount: paymentData.amount,
                status: 'created',
                createdAt: new Date().toISOString()
            });

            return data;
        } catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }

    // Process automated recurring payment
    async processAutomatedPayment(tenantId, paymentMethodId, amount, metadata = {}) {
        try {
            const payload = {
                amount: Math.round(amount * 100),
                currency: 'USD',
                payment_method: paymentMethodId,
                customer: tenantId,
                confirm: true,
                off_session: true,
                metadata: {
                    ...metadata,
                    automated: true,
                    initiated_at: new Date().toISOString()
                }
            };

            const response = await fetch(`${this.baseURL}/payments`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (data.status === 'requires_action') {
                // Payment requires additional authentication
                await this.notifyTenantAuthentication(tenantId, data.id);
            }

            return data;
        } catch (error) {
            console.error('Automated payment failed:', error);
            // Add to retry queue
            this.addToRetryQueue({ tenantId, paymentMethodId, amount, metadata });
            throw error;
        }
    }

    // Set up recurring payment schedule
    async setupRecurringPayment(tenantId, paymentMethodId, schedule) {
        try {
            const payload = {
                customer: tenantId,
                payment_method: paymentMethodId,
                schedule: {
                    interval: schedule.interval || 'monthly',
                    interval_count: schedule.intervalCount || 1,
                    day_of_month: schedule.dayOfMonth || 1,
                    start_date: schedule.startDate,
                    end_date: schedule.endDate
                },
                metadata: {
                    lease_id: schedule.leaseId,
                    unit_id: schedule.unitId,
                    property_id: schedule.propertyId
                }
            };

            const response = await fetch(`${this.baseURL}/subscriptions`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });

            return await response.json();
        } catch (error) {
            console.error('Error setting up recurring payment:', error);
            throw error;
        }
    }

    // Get payment methods for a tenant
    async getPaymentMethods(tenantId) {
        try {
            const response = await fetch(`${this.baseURL}/customers/${tenantId}/payment_methods`, {
                headers: this.getHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            return { payment_methods: [] };
        }
    }

    // Process refund
    async processRefund(paymentId, amount, reason) {
        try {
            const payload = {
                payment_intent: paymentId,
                amount: Math.round(amount * 100),
                reason: reason,
                metadata: {
                    refunded_at: new Date().toISOString(),
                    refunded_by: window.authManager?.user?.id || 'system'
                }
            };

            const response = await fetch(`${this.baseURL}/refunds`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(payload)
            });

            return await response.json();
        } catch (error) {
            console.error('Error processing refund:', error);
            throw error;
        }
    }

    // Get payment history for reporting
    async getPaymentHistory(filters = {}) {
        try {
            const params = new URLSearchParams({
                limit: filters.limit || 100,
                starting_after: filters.startingAfter || '',
                ending_before: filters.endingBefore || '',
                created: filters.dateRange || '',
                status: filters.status || ''
            });

            const response = await fetch(`${this.baseURL}/payments?${params}`, {
                headers: this.getHeaders()
            });

            const data = await response.json();
            
            // Transform data for internal use
            return this.transformPaymentData(data);
        } catch (error) {
            console.error('Error fetching payment history:', error);
            return { payments: [], hasMore: false };
        }
    }

    // Transform Valor PayTech data to internal format
    transformPaymentData(valorData) {
        return {
            payments: valorData.data.map(payment => ({
                id: payment.id,
                tenantId: payment.metadata?.tenant_id,
                propertyId: payment.metadata?.property_id,
                unitId: payment.metadata?.unit_id,
                amount: payment.amount / 100,
                status: this.statusMap[payment.status] || payment.status,
                paymentMethod: payment.payment_method_details?.type,
                createdAt: new Date(payment.created * 1000).toISOString(),
                description: payment.description,
                metadata: payment.metadata
            })),
            hasMore: valorData.has_more,
            totalCount: valorData.total_count
        };
    }

    // Webhook handler for real-time updates
    async handleWebhook(event, signature) {
        try {
            // Verify webhook signature
            if (!this.verifyWebhookSignature(event, signature)) {
                throw new Error('Invalid webhook signature');
            }

            const eventData = JSON.parse(event);
            
            switch (eventData.type) {
                case 'payment_intent.succeeded':
                    await this.handlePaymentSuccess(eventData.data);
                    break;
                case 'payment_intent.failed':
                    await this.handlePaymentFailure(eventData.data);
                    break;
                case 'charge.refunded':
                    await this.handleRefund(eventData.data);
                    break;
                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdate(eventData.data);
                    break;
                default:
                    console.log('Unhandled webhook event:', eventData.type);
            }

            return { received: true };
        } catch (error) {
            console.error('Webhook processing error:', error);
            throw error;
        }
    }

    // Verify webhook signature
    verifyWebhookSignature(payload, signature) {
        // Implement signature verification using webhookSecret
        // This is a simplified version - use proper HMAC verification in production
        return true; // Placeholder
    }

    // Handle successful payment
    async handlePaymentSuccess(paymentData) {
        // Update local payment records
        await this.updatePaymentStatus(paymentData.id, 'paid');
        
        // Notify accounting system
        if (window.ApiService) {
            await window.ApiService.post('/accounting/payment-received', {
                paymentId: paymentData.id,
                tenantId: paymentData.metadata.tenant_id,
                amount: paymentData.amount / 100,
                receivedAt: new Date().toISOString()
            });
        }
        
        // Update tenant balance
        await this.updateTenantBalance(paymentData.metadata.tenant_id, paymentData.amount / 100);
        
        // Send confirmation to tenant
        await this.sendPaymentConfirmation(paymentData);
    }

    // Handle failed payment
    async handlePaymentFailure(paymentData) {
        await this.updatePaymentStatus(paymentData.id, 'failed');
        
        // Notify property manager
        if (window.showNotification) {
            window.showNotification('error', `Payment failed for tenant ${paymentData.metadata.tenant_id}`);
        }
        
        // Add to retry queue if automated
        if (paymentData.metadata.automated) {
            this.addToRetryQueue({
                paymentId: paymentData.id,
                tenantId: paymentData.metadata.tenant_id,
                amount: paymentData.amount / 100
            });
        }
    }

    // Retry failed payments
    async retryFailedPayments() {
        for (const payment of this.paymentQueue) {
            if (payment.attempts < this.retryAttempts) {
                try {
                    await this.processAutomatedPayment(
                        payment.tenantId,
                        payment.paymentMethodId,
                        payment.amount,
                        { ...payment.metadata, retry_attempt: payment.attempts + 1 }
                    );
                    
                    // Remove from queue on success
                    this.paymentQueue = this.paymentQueue.filter(p => p.id !== payment.id);
                } catch (error) {
                    payment.attempts++;
                    payment.lastAttempt = new Date().toISOString();
                }
            }
        }
    }

    // Add payment to retry queue
    addToRetryQueue(paymentData) {
        this.paymentQueue.push({
            id: `retry_${Date.now()}`,
            ...paymentData,
            attempts: 0,
            addedAt: new Date().toISOString()
        });
    }

    // Store payment record locally
    async storePaymentRecord(record) {
        // Store in localStorage for now, should be in database
        const payments = JSON.parse(localStorage.getItem('valor_payments') || '[]');
        payments.push(record);
        localStorage.setItem('valor_payments', JSON.stringify(payments));
    }

    // Update payment status
    async updatePaymentStatus(paymentId, status) {
        const payments = JSON.parse(localStorage.getItem('valor_payments') || '[]');
        const index = payments.findIndex(p => p.intentId === paymentId);
        if (index !== -1) {
            payments[index].status = status;
            payments[index].updatedAt = new Date().toISOString();
            localStorage.setItem('valor_payments', JSON.stringify(payments));
        }
    }

    // Update tenant balance
    async updateTenantBalance(tenantId, amount) {
        if (window.ApiService) {
            await window.ApiService.patch(`/tenants/${tenantId}/balance`, {
                adjustment: -amount,
                type: 'payment',
                timestamp: new Date().toISOString()
            });
        }
    }

    // Send payment confirmation
    async sendPaymentConfirmation(paymentData) {
        if (window.ApiService) {
            await window.ApiService.post('/notifications/send', {
                tenantId: paymentData.metadata.tenant_id,
                type: 'payment_confirmation',
                data: {
                    amount: paymentData.amount / 100,
                    paymentId: paymentData.id,
                    date: new Date().toISOString()
                }
            });
        }
    }

    // Notify tenant about authentication requirement
    async notifyTenantAuthentication(tenantId, paymentId) {
        if (window.ApiService) {
            await window.ApiService.post('/notifications/send', {
                tenantId: tenantId,
                type: 'payment_authentication_required',
                data: {
                    paymentId: paymentId,
                    message: 'Your payment requires additional authentication. Please check your banking app.'
                }
            });
        }
    }

    // Initialize retry timer
    startRetryTimer() {
        setInterval(() => {
            this.retryFailedPayments();
        }, this.retryDelay);
    }

    // Get payment analytics for reporting
    async getPaymentAnalytics(dateRange, groupBy = 'day') {
        try {
            const response = await fetch(`${this.baseURL}/analytics/payments?${new URLSearchParams({
                start_date: dateRange.start,
                end_date: dateRange.end,
                group_by: groupBy
            })}`, {
                headers: this.getHeaders()
            });

            return await response.json();
        } catch (error) {
            console.error('Error fetching payment analytics:', error);
            return null;
        }
    }
}

// Initialize and export service
window.ValorPayTechService = new ValorPayTechService();

// Start retry timer
window.ValorPayTechService.startRetryTimer();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValorPayTechService;
}