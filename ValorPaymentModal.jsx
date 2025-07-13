// ValorPaymentModal.jsx - Valor Payment System Integration
const ValorPaymentModal = (() => {
    const ComponentFactory = {
        createComponent: (name) => (componentFunc) => {
            const Component = (props) => {
                const helpers = {
                    useLocalState: (initialState) => {
                        const [state, setState] = React.useState(initialState);
                        const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
                        return [state, updateState];
                    },
                    formatCurrency: (amount) => {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                        }).format(amount || 0);
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('ValorPaymentModal')((props, helpers) => {
        const { tenant, onClose, onSuccess } = props;
        const { useLocalState, formatCurrency } = helpers;

        const [state, updateState] = useLocalState({
            paymentAmount: tenant.rentAmount || 2500,
            customAmount: false,
            paymentMethod: 'checking',
            savePaymentMethod: true,
            autopayEnabled: false,
            autopayDate: '1',
            processing: false,
            step: 'amount', // amount, method, confirm, processing, success
            savedPaymentMethods: [
                { id: 1, type: 'checking', last4: '4567', name: 'Chase Checking', isDefault: true },
                { id: 2, type: 'card', last4: '1234', name: 'Visa', brand: 'visa' }
            ],
            selectedPaymentMethodId: 1,
            newPaymentMethod: {}
        });

        const handlePayment = async () => {
            updateState({ processing: true, step: 'processing' });
            
            try {
                // Initialize Valor payment
                const valorConfig = {
                    amount: state.paymentAmount * 100, // Convert to cents
                    currency: 'USD',
                    description: `Rent payment - Unit ${tenant.unit}`,
                    paymentMethodId: state.selectedPaymentMethodId,
                    savePaymentMethod: state.savePaymentMethod,
                    tenantId: tenant.id,
                    propertyId: tenant.propertyId
                };

                // Simulate Valor API call
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // In production: const result = await window.ValorPaymentSDK.processPayment(valorConfig);
                
                updateState({ step: 'success' });
                
                // Send SMS receipt
                await sendSMSReceipt({
                    phone: tenant.phone,
                    amount: state.paymentAmount,
                    confirmationNumber: 'VLR-' + Date.now().toString().substr(-8)
                });
                
                setTimeout(() => {
                    onSuccess();
                }, 2000);
                
            } catch (error) {
                console.error('Payment failed:', error);
                window.Toast?.error('Payment failed. Please try again.');
                updateState({ processing: false, step: 'method' });
            }
        };

        const sendSMSReceipt = async (data) => {
            // In production, this would call your SMS service
            console.log('Sending SMS receipt:', data);
        };

        const renderStep = () => {
            switch (state.step) {
                case 'amount':
                    return renderAmountStep();
                case 'method':
                    return renderMethodStep();
                case 'confirm':
                    return renderConfirmStep();
                case 'processing':
                    return renderProcessingStep();
                case 'success':
                    return renderSuccessStep();
                default:
                    return renderAmountStep();
            }
        };

        const renderAmountStep = () => {
            return React.createElement('div', { className: 'payment-step amount-step' }, [
                React.createElement('h3', { key: 'title' }, 'How much would you like to pay?'),
                
                React.createElement('div', { key: 'options', className: 'amount-options' }, [
                    React.createElement('button', {
                        key: 'full',
                        className: `amount-option ${!state.customAmount ? 'selected' : ''}`,
                        onClick: () => updateState({ customAmount: false, paymentAmount: tenant.rentAmount })
                    }, [
                        React.createElement('span', { key: 'label' }, 'Full Rent Amount'),
                        React.createElement('span', { key: 'amount', className: 'amount' }, formatCurrency(tenant.rentAmount))
                    ]),
                    
                    tenant.balance > 0 && React.createElement('button', {
                        key: 'balance',
                        className: `amount-option ${state.customAmount && state.paymentAmount === tenant.balance ? 'selected' : ''}`,
                        onClick: () => updateState({ customAmount: true, paymentAmount: tenant.balance })
                    }, [
                        React.createElement('span', { key: 'label' }, 'Outstanding Balance'),
                        React.createElement('span', { key: 'amount', className: 'amount' }, formatCurrency(tenant.balance))
                    ]),
                    
                    React.createElement('button', {
                        key: 'custom',
                        className: `amount-option ${state.customAmount && state.paymentAmount !== tenant.balance ? 'selected' : ''}`,
                        onClick: () => updateState({ customAmount: true })
                    }, [
                        React.createElement('span', { key: 'label' }, 'Custom Amount'),
                        React.createElement('div', { key: 'input-wrapper', className: 'custom-amount-input' },
                            React.createElement('input', {
                                type: 'number',
                                value: state.paymentAmount,
                                onChange: (e) => updateState({ paymentAmount: parseFloat(e.target.value) || 0 }),
                                onClick: (e) => e.stopPropagation(),
                                placeholder: '0.00',
                                min: '0',
                                step: '0.01'
                            })
                        )
                    ])
                ]),

                React.createElement('div', { key: 'autopay', className: 'autopay-section' }, [
                    React.createElement('label', { key: 'label', className: 'autopay-label' }, [
                        React.createElement('input', {
                            key: 'checkbox',
                            type: 'checkbox',
                            checked: state.autopayEnabled,
                            onChange: (e) => updateState({ autopayEnabled: e.target.checked })
                        }),
                        React.createElement('span', { key: 'text' }, 'Set up AutoPay for future rent')
                    ]),
                    
                    state.autopayEnabled && React.createElement('div', { key: 'date', className: 'autopay-date' }, [
                        React.createElement('span', { key: 'label' }, 'AutoPay on the'),
                        React.createElement('select', {
                            key: 'select',
                            value: state.autopayDate,
                            onChange: (e) => updateState({ autopayDate: e.target.value })
                        }, 
                            Array.from({ length: 28 }, (_, i) => i + 1).map(day =>
                                React.createElement('option', { key: day, value: day }, 
                                    `${day}${day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}`
                                )
                            )
                        ),
                        React.createElement('span', { key: 'suffix' }, 'of each month')
                    ])
                ]),

                React.createElement('button', {
                    key: 'continue',
                    className: 'continue-btn',
                    onClick: () => updateState({ step: 'method' }),
                    disabled: state.paymentAmount <= 0
                }, 'Continue to Payment Method')
            ]);
        };

        const renderMethodStep = () => {
            return React.createElement('div', { className: 'payment-step method-step' }, [
                React.createElement('h3', { key: 'title' }, 'Select Payment Method'),
                
                React.createElement('div', { key: 'saved-methods', className: 'saved-payment-methods' },
                    state.savedPaymentMethods.map(method =>
                        React.createElement('button', {
                            key: method.id,
                            className: `payment-method ${state.selectedPaymentMethodId === method.id ? 'selected' : ''}`,
                            onClick: () => updateState({ selectedPaymentMethodId: method.id })
                        }, [
                            React.createElement('div', { key: 'icon', className: 'method-icon' },
                                React.createElement('i', { 
                                    className: `fas ${method.type === 'checking' ? 'fa-university' : 'fa-credit-card'}` 
                                })
                            ),
                            React.createElement('div', { key: 'details', className: 'method-details' }, [
                                React.createElement('span', { key: 'name', className: 'method-name' }, method.name),
                                React.createElement('span', { key: 'last4', className: 'method-last4' }, 
                                    `${method.type === 'checking' ? 'Account' : 'Card'} ending in ${method.last4}`
                                )
                            ]),
                            method.isDefault && React.createElement('span', { 
                                key: 'default', 
                                className: 'default-badge' 
                            }, 'Default')
                        ])
                    )
                ),

                React.createElement('button', {
                    key: 'add-new',
                    className: 'add-payment-method',
                    onClick: () => console.log('Add new payment method')
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                    'Add New Payment Method'
                ]),

                React.createElement('div', { key: 'valor-secure', className: 'valor-security' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-lock' }),
                    React.createElement('span', { key: 'text' }, 'Secured by Valor Payment Systems'),
                    React.createElement('img', { 
                        key: 'badges',
                        src: '/images/payment-badges.png',
                        alt: 'Security badges',
                        className: 'security-badges'
                    })
                ]),

                React.createElement('div', { key: 'buttons', className: 'step-buttons' }, [
                    React.createElement('button', {
                        key: 'back',
                        className: 'back-btn',
                        onClick: () => updateState({ step: 'amount' })
                    }, 'Back'),
                    React.createElement('button', {
                        key: 'continue',
                        className: 'continue-btn',
                        onClick: () => updateState({ step: 'confirm' })
                    }, 'Review Payment')
                ])
            ]);
        };

        const renderConfirmStep = () => {
            const selectedMethod = state.savedPaymentMethods.find(m => m.id === state.selectedPaymentMethodId);
            
            return React.createElement('div', { className: 'payment-step confirm-step' }, [
                React.createElement('h3', { key: 'title' }, 'Confirm Payment'),
                
                React.createElement('div', { key: 'summary', className: 'payment-summary' }, [
                    React.createElement('div', { key: 'amount', className: 'summary-item' }, [
                        React.createElement('span', { key: 'label' }, 'Payment Amount'),
                        React.createElement('span', { key: 'value', className: 'amount' }, formatCurrency(state.paymentAmount))
                    ]),
                    
                    React.createElement('div', { key: 'to', className: 'summary-item' }, [
                        React.createElement('span', { key: 'label' }, 'Paying To'),
                        React.createElement('span', { key: 'value' }, tenant.property)
                    ]),
                    
                    React.createElement('div', { key: 'unit', className: 'summary-item' }, [
                        React.createElement('span', { key: 'label' }, 'Unit'),
                        React.createElement('span', { key: 'value' }, tenant.unit)
                    ]),
                    
                    React.createElement('div', { key: 'method', className: 'summary-item' }, [
                        React.createElement('span', { key: 'label' }, 'Payment Method'),
                        React.createElement('span', { key: 'value' }, 
                            `${selectedMethod?.name} (...${selectedMethod?.last4})`
                        )
                    ]),
                    
                    state.autopayEnabled && React.createElement('div', { 
                        key: 'autopay', 
                        className: 'summary-item autopay-info' 
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-sync-alt' }),
                        React.createElement('span', { key: 'text' }, 
                            `AutoPay enabled for the ${state.autopayDate}${
                                state.autopayDate === '1' ? 'st' : 
                                state.autopayDate === '2' ? 'nd' : 
                                state.autopayDate === '3' ? 'rd' : 'th'
                            } of each month`
                        )
                    ])
                ]),

                React.createElement('div', { key: 'terms', className: 'payment-terms' }, [
                    React.createElement('p', {}, 
                        'By confirming this payment, you authorize the charge to your selected payment method. A receipt will be sent via email and SMS.'
                    )
                ]),

                React.createElement('div', { key: 'buttons', className: 'step-buttons' }, [
                    React.createElement('button', {
                        key: 'back',
                        className: 'back-btn',
                        onClick: () => updateState({ step: 'method' })
                    }, 'Back'),
                    React.createElement('button', {
                        key: 'pay',
                        className: 'pay-now-btn',
                        onClick: handlePayment
                    }, [
                        React.createElement('i', { key: 'icon', className: 'fas fa-lock' }),
                        `Pay ${formatCurrency(state.paymentAmount)}`
                    ])
                ])
            ]);
        };

        const renderProcessingStep = () => {
            return React.createElement('div', { className: 'payment-step processing-step' }, [
                React.createElement('div', { key: 'spinner', className: 'processing-spinner' }, [
                    React.createElement('div', { className: 'spinner' }),
                    React.createElement('img', { 
                        key: 'logo',
                        src: '/images/valor-logo.png',
                        alt: 'Valor',
                        className: 'valor-logo'
                    })
                ]),
                React.createElement('h3', { key: 'title' }, 'Processing Payment...'),
                React.createElement('p', { key: 'text' }, 'Please do not close this window'),
                React.createElement('div', { key: 'secure', className: 'secure-badge' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-shield-alt' }),
                    'Secure 256-bit Encryption'
                ])
            ]);
        };

        const renderSuccessStep = () => {
            const confirmationNumber = 'VLR-' + Date.now().toString().substr(-8);
            
            return React.createElement('div', { className: 'payment-step success-step' }, [
                React.createElement('div', { key: 'icon', className: 'success-icon' },
                    React.createElement('i', { className: 'fas fa-check-circle' })
                ),
                React.createElement('h3', { key: 'title' }, 'Payment Successful!'),
                React.createElement('p', { key: 'amount', className: 'success-amount' }, 
                    formatCurrency(state.paymentAmount)
                ),
                React.createElement('div', { key: 'confirmation', className: 'confirmation-details' }, [
                    React.createElement('p', { key: 'number' }, [
                        'Confirmation #: ',
                        React.createElement('strong', {}, confirmationNumber)
                    ]),
                    React.createElement('p', { key: 'receipt' }, 
                        'A receipt has been sent to your email and phone'
                    )
                ]),
                state.autopayEnabled && React.createElement('div', { 
                    key: 'autopay-confirmed', 
                    className: 'autopay-confirmed' 
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-check' }),
                    'AutoPay has been set up successfully'
                ])
            ]);
        };

        return React.createElement('div', { 
            className: 'modal-overlay valor-payment-modal',
            onClick: state.step !== 'processing' ? onClose : undefined
        },
            React.createElement('div', { 
                className: 'modal-content payment-modal-content',
                onClick: (e) => e.stopPropagation()
            }, [
                // Header
                state.step !== 'processing' && state.step !== 'success' && React.createElement('div', { 
                    key: 'header', 
                    className: 'modal-header' 
                }, [
                    React.createElement('h2', { key: 'title' }, 'Make a Payment'),
                    React.createElement('button', {
                        key: 'close',
                        className: 'close-btn',
                        onClick: onClose
                    }, '×')
                ]),

                // Progress Indicator
                state.step !== 'processing' && state.step !== 'success' && React.createElement('div', { 
                    key: 'progress', 
                    className: 'payment-progress' 
                }, [
                    React.createElement('div', { 
                        key: 'bar',
                        className: 'progress-bar',
                        style: { 
                            width: state.step === 'amount' ? '33%' : 
                                   state.step === 'method' ? '66%' : '100%' 
                        }
                    })
                ]),

                // Step Content
                React.createElement('div', { key: 'body', className: 'modal-body' },
                    renderStep()
                )
            ])
        );
    });
})();

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.ValorPaymentModal = ValorPaymentModal;