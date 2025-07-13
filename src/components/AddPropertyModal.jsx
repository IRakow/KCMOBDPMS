// Add Property Modal using Component Factory Pattern
const AddPropertyModal = ComponentFactory.createComponent('AddPropertyModal', {
  // Private helpers specific to this component
  privateHelpers: {
    validateForm: (formData) => {
      const errors = {};
      
      // Required field validation
      if (!formData.name?.trim()) {
        errors.name = 'Property name is required';
      }
      
      if (!formData.address?.street?.trim()) {
        errors['address.street'] = 'Street address is required';
      }
      
      if (!formData.address?.city?.trim()) {
        errors['address.city'] = 'City is required';
      }
      
      if (!formData.address?.state?.trim()) {
        errors['address.state'] = 'State is required';
      } else if (formData.address.state.length !== 2) {
        errors['address.state'] = 'State must be 2 characters';
      }
      
      if (!formData.address?.zip?.trim()) {
        errors['address.zip'] = 'ZIP code is required';
      } else if (!/^\d{5}(-\d{4})?$/.test(formData.address.zip)) {
        errors['address.zip'] = 'Invalid ZIP code format';
      }
      
      if (!formData.total_units || formData.total_units < 1) {
        errors.total_units = 'Total units must be at least 1';
      }
      
      // Business logic validation
      if (formData.total_units > 1000) {
        errors.total_units = 'Total units cannot exceed 1000';
      }
      
      return errors;
    },
    
    sanitizeFormData: (formData) => {
      return {
        ...formData,
        name: formData.name?.trim(),
        address: {
          street: formData.address?.street?.trim(),
          city: formData.address?.city?.trim(),
          state: formData.address?.state?.trim()?.toUpperCase(),
          zip: formData.address?.zip?.trim()
        },
        total_units: parseInt(formData.total_units) || 1,
        valor_merchant_id: formData.valor_merchant_id?.trim() || null
      };
    },
    
    getInitialFormData: () => ({
      name: '',
      property_type: 'residential',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'United States',
      total_units: 1,
      features: [],
      amenities: {},
      description: ''
    }),
    
    handleKeyboardNavigation: (e, onClose) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    
    formatZipCode: (value) => {
      // Auto-format ZIP code (12345 or 12345-6789)
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 5) {
        return cleaned;
      }
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}`;
    },
    
    getStateOptions: () => [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ]
  },
  
  // Default props
  defaultProps: {
    title: 'Add New Property',
    submitText: 'Create Property',
    cancelText: 'Cancel'
  },
  
  // Prop types for development validation
  propTypes: {
    onClose: 'function',
    onSave: 'function',
    title: 'string',
    submitText: 'string',
    cancelText: 'string',
    initialData: 'object'
  },
  
  // Enable performance tracking and error boundary
  withPerformanceTracking: true,
  withErrorBoundary: true
  
})((props, helpers, ref) => {
  // Destructure props
  const { 
    onClose, 
    onSave, 
    title, 
    submitText, 
    cancelText, 
    initialData 
  } = props;
  
  // Destructure helpers
  const { 
    useLocalState,
    useAsyncState,
    classNames,
    debounce,
    validateForm,
    sanitizeFormData,
    getInitialFormData,
    handleKeyboardNavigation,
    formatZipCode,
    getStateOptions
  } = helpers;
  
  // Component state
  const [state, updateState] = useLocalState({
    formData: initialData || getInitialFormData(),
    errors: {},
    touched: {},
    isSubmitting: false,
    isDirty: false
  });
  
  // Auto-save draft (debounced)
  const saveDraft = React.useMemo(
    () => debounce((formData) => {
      localStorage.setItem('propertyFormDraft', JSON.stringify(formData));
    }, 1000),
    []
  );
  
  // Load draft on mount
  React.useEffect(() => {
    if (!initialData) {
      const draft = localStorage.getItem('propertyFormDraft');
      if (draft) {
        try {
          const draftData = JSON.parse(draft);
          updateState({ formData: draftData, isDirty: true });
        } catch (error) {
          console.warn('Failed to load form draft:', error);
        }
      }
    }
  }, []);
  
  // Save draft when form changes
  React.useEffect(() => {
    if (state.isDirty) {
      saveDraft(state.formData);
    }
  }, [state.formData, state.isDirty]);
  
  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => handleKeyboardNavigation(e, onClose);
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  // Focus management
  React.useEffect(() => {
    // Focus first input when modal opens
    const firstInput = document.querySelector('.modal input[type="text"]');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }, []);
  
  // Event handlers
  const updateField = (field, value) => {
    const updatedFormData = { ...state.formData };
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedFormData[parent] = {
        ...updatedFormData[parent],
        [child]: value
      };
    } else {
      updatedFormData[field] = value;
    }
    
    // Clear error for this field
    const newErrors = { ...state.errors };
    delete newErrors[field];
    
    updateState({
      formData: updatedFormData,
      errors: newErrors,
      touched: { ...state.touched, [field]: true },
      isDirty: true
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (state.isSubmitting) return;
    
    updateState({ isSubmitting: true });
    
    try {
      // Validate form
      const sanitizedData = sanitizeFormData(state.formData);
      const validationErrors = validateForm(sanitizedData);
      
      if (Object.keys(validationErrors).length > 0) {
        updateState({ 
          errors: validationErrors, 
          isSubmitting: false,
          touched: Object.keys(validationErrors).reduce((acc, key) => ({
            ...acc,
            [key]: true
          }), {})
        });
        
        // Focus first error field
        const firstErrorField = document.querySelector(`[data-field="${Object.keys(validationErrors)[0]}"]`);
        if (firstErrorField) {
          firstErrorField.focus();
        }
        
        return;
      }
      
      // Save property
      await onSave(sanitizedData);
      
      // Clear draft on successful save
      localStorage.removeItem('propertyFormDraft');
      
      onClose();
      
    } catch (error) {
      updateState({ 
        isSubmitting: false,
        errors: { submit: error.message || 'Failed to save property' }
      });
    }
  };
  
  const handleCancel = () => {
    if (state.isDirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmLeave) return;
    }
    
    // Clear draft
    localStorage.removeItem('propertyFormDraft');
    onClose();
  };
  
  const handleZipChange = (value) => {
    const formatted = formatZipCode(value);
    updateField('address.zip', formatted);
  };
  
  // Render helpers
  const renderFormGroup = (label, field, type = 'text', options = {}) => {
    const { 
      required = false, 
      placeholder = '', 
      maxLength,
      min,
      max,
      children,
      helpText
    } = options;
    
    const error = state.errors[field];
    const touched = state.touched[field];
    const hasError = error && touched;
    
    return React.createElement('div', { 
      className: classNames('form-group', hasError && 'has-error') 
    }, [
      React.createElement('label', { 
        key: 'label',
        htmlFor: field.replace('.', '_')
      }, [
        label,
        required && React.createElement('span', { 
          key: 'required', 
          className: 'required' 
        }, ' *')
      ]),
      
      children || React.createElement('input', {
        key: 'input',
        type,
        id: field.replace('.', '_'),
        'data-field': field,
        className: classNames('form-control', hasError && 'is-invalid'),
        value: field.includes('.') ? 
          state.formData[field.split('.')[0]]?.[field.split('.')[1]] || '' :
          state.formData[field] || '',
        onChange: (e) => updateField(field, e.target.value),
        placeholder,
        maxLength,
        min,
        max,
        required,
        disabled: state.isSubmitting,
        'aria-describedby': hasError ? `${field.replace('.', '_')}_error` : undefined
      }),
      
      helpText && React.createElement('small', {
        key: 'help',
        className: 'form-text text-muted'
      }, helpText),
      
      hasError && React.createElement('div', {
        key: 'error',
        id: `${field.replace('.', '_')}_error`,
        className: 'invalid-feedback',
        role: 'alert'
      }, error)
    ]);
  };
  
  const renderStateSelect = () => {
    const stateOptions = getStateOptions();
    
    return React.createElement('select', {
      id: 'address_state',
      'data-field': 'address.state',
      className: classNames(
        'form-control', 
        state.errors['address.state'] && state.touched['address.state'] && 'is-invalid'
      ),
      value: state.formData.address?.state || '',
      onChange: (e) => updateField('address.state', e.target.value),
      required: true,
      disabled: state.isSubmitting
    }, [
      React.createElement('option', { key: 'empty', value: '' }, 'Select State'),
      ...stateOptions.map(state =>
        React.createElement('option', { key: state, value: state }, state)
      )
    ]);
  };
  
  const renderPropertyTypeSelect = () => {
    const propertyTypes = [
      { value: 'residential', label: 'Residential' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'mixed', label: 'Mixed Use' },
      { value: 'industrial', label: 'Industrial' }
    ];
    
    return React.createElement('select', {
      id: 'property_type',
      'data-field': 'property_type',
      className: 'form-control',
      value: state.formData.property_type || 'residential',
      onChange: (e) => updateField('property_type', e.target.value),
      disabled: state.isSubmitting
    },
      propertyTypes.map(type =>
        React.createElement('option', { key: type.value, value: type.value }, type.label)
      )
    );
  };
  
  // Main render
  return React.createElement('div', {
    className: 'modal-overlay',
    onClick: handleCancel,
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': 'modal-title'
  }, [
    React.createElement('div', {
      key: 'modal',
      className: 'modal modal-lg',
      onClick: (e) => e.stopPropagation()
    }, [
      // Header
      React.createElement('div', { 
        key: 'header',
        className: 'modal-header' 
      }, [
        React.createElement('h2', { 
          key: 'title',
          id: 'modal-title',
          className: 'modal-title'
        }, title),
        
        React.createElement('button', {
          key: 'close',
          type: 'button',
          className: 'close-btn',
          onClick: handleCancel,
          'aria-label': 'Close modal'
        }, '×')
      ]),
      
      // Form
      React.createElement('form', {
        key: 'form',
        onSubmit: handleSubmit,
        className: 'modal-body',
        noValidate: true
      }, [
        // Basic Info Section
        React.createElement('div', { key: 'basic-info', className: 'form-section' }, [
          React.createElement('h3', { key: 'title' }, 'Basic Information'),
          
          renderFormGroup('Property Name', 'name', 'text', { 
            required: true,
            placeholder: 'Enter property name'
          }),
          
          renderFormGroup('Property Type', 'property_type', 'select', {
            children: renderPropertyTypeSelect()
          }),
          
          renderFormGroup('Description', 'description', 'textarea', {
            placeholder: 'Optional description of the property',
            children: React.createElement('textarea', {
              id: 'description',
              'data-field': 'description',
              className: 'form-control',
              value: state.formData.description || '',
              onChange: (e) => updateField('description', e.target.value),
              placeholder: 'Optional description of the property',
              rows: 3,
              disabled: state.isSubmitting
            })
          })
        ]),
        
        // Address Section
        React.createElement('div', { key: 'address-info', className: 'form-section' }, [
          React.createElement('h3', { key: 'title' }, 'Address Information'),
          
          renderFormGroup('Street Address', 'address.street', 'text', { 
            required: true,
            placeholder: '123 Main Street'
          }),
          
          React.createElement('div', { key: 'address-row', className: 'form-row' }, [
            React.createElement('div', { key: 'city', className: 'col-md-6' },
              renderFormGroup('City', 'address.city', 'text', { 
                required: true,
                placeholder: 'City name'
              })
            ),
            
            React.createElement('div', { key: 'state', className: 'col-md-3' },
              renderFormGroup('State', 'address.state', 'select', { 
                required: true,
                children: renderStateSelect()
              })
            ),
            
            React.createElement('div', { key: 'zip', className: 'col-md-3' },
              renderFormGroup('ZIP Code', 'address.zip', 'text', { 
                required: true,
                placeholder: '12345',
                maxLength: 10,
                helpText: 'Format: 12345 or 12345-6789'
              })
            )
          ])
        ]),
        
        // Property Details Section
        React.createElement('div', { key: 'details-info', className: 'form-section' }, [
          React.createElement('h3', { key: 'title' }, 'Property Details'),
          
          React.createElement('div', { key: 'details-row', className: 'form-row' }, [
            React.createElement('div', { key: 'units', className: 'col-md-6' },
              renderFormGroup('Total Units', 'total_units', 'number', { 
                required: true,
                min: 1,
                max: 1000,
                helpText: 'Number of rental units'
              })
            ),
            
            React.createElement('div', { key: 'merchant', className: 'col-md-6' },
              renderFormGroup('Valor Merchant ID', 'valor_merchant_id', 'text', { 
                placeholder: 'Optional - uses default if empty',
                helpText: 'For payment processing integration'
              })
            )
          ])
        ]),
        
        // Submit Error
        state.errors.submit && React.createElement('div', {
          key: 'submit-error',
          className: 'alert alert-danger',
          role: 'alert'
        }, state.errors.submit)
      ]),
      
      // Footer
      React.createElement('div', { 
        key: 'footer',
        className: 'modal-footer' 
      }, [
        React.createElement('button', {
          key: 'cancel',
          type: 'button',
          className: 'btn btn-secondary',
          onClick: handleCancel,
          disabled: state.isSubmitting
        }, cancelText),
        
        React.createElement('button', {
          key: 'submit',
          type: 'submit',
          className: 'btn btn-primary',
          disabled: state.isSubmitting,
          onClick: handleSubmit
        }, [
          state.isSubmitting && React.createElement('span', { 
            key: 'spinner',
            className: 'spinner-border spinner-border-sm',
            'aria-hidden': true
          }),
          state.isSubmitting ? ' Creating...' : submitText
        ])
      ])
    ])
  ]);
});

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.AddPropertyModal = AddPropertyModal;