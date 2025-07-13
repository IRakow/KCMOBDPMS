// FinancialControls.jsx - Global Financial Controls Component
const FinancialControls = (() => {
    const ComponentFactory = {
        createComponent: (name, options = {}) => (componentFunc) => {
            const Component = (props) => {
                const helpers = {
                    useLocalState: (initialState) => {
                        const [state, setState] = React.useState(initialState);
                        const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
                        return [state, updateState];
                    }
                };
                return componentFunc(props, helpers);
            };
            Component.displayName = name;
            return Component;
        }
    };

    return ComponentFactory.createComponent('FinancialControls', {})((props, helpers) => {
        const {
            selectedPeriod,
            basisType,
            selectedEntity,
            selectedProperty,
            onPeriodChange,
            onBasisChange,
            onEntityChange,
            onPropertyChange
        } = props;
        
        const [state, updateState] = helpers.useLocalState({
            showCustomPeriod: false,
            customStart: '',
            customEnd: ''
        });

        // Sample entities and properties for demo
        const entities = [
            { id: null, name: 'All Entities' },
            { id: 'entity-1', name: 'Main Property Holdings LLC' },
            { id: 'entity-2', name: 'Downtown Investments LLC' },
            { id: 'entity-3', name: 'Suburban Properties LLC' }
        ];

        const properties = [
            { id: null, name: 'All Properties' },
            { id: 'prop-1', name: 'Sunset Apartments' },
            { id: 'prop-2', name: 'Downtown Plaza' },
            { id: 'prop-3', name: 'Garden Complex' }
        ];

        const handleQuickPeriod = (type) => {
            const today = new Date();
            let start, end;

            switch (type) {
                case 'mtd':
                    start = new Date(today.getFullYear(), today.getMonth(), 1);
                    end = today;
                    break;
                case 'qtd':
                    const quarter = Math.floor(today.getMonth() / 3);
                    start = new Date(today.getFullYear(), quarter * 3, 1);
                    end = today;
                    break;
                case 'ytd':
                    start = new Date(today.getFullYear(), 0, 1);
                    end = today;
                    break;
                case 'lastMonth':
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    start = lastMonth;
                    end = new Date(today.getFullYear(), today.getMonth(), 0);
                    break;
                case 'lastQuarter':
                    const lastQ = Math.floor((today.getMonth() - 3) / 3);
                    start = new Date(today.getFullYear(), lastQ * 3, 1);
                    end = new Date(today.getFullYear(), (lastQ + 1) * 3, 0);
                    break;
                case 'lastYear':
                    start = new Date(today.getFullYear() - 1, 0, 1);
                    end = new Date(today.getFullYear() - 1, 11, 31);
                    break;
                default:
                    return;
            }

            onPeriodChange({
                start: start.toISOString().split('T')[0],
                end: end.toISOString().split('T')[0]
            });
        };

        return React.createElement('div', { className: 'financial-controls' },
            React.createElement('div', { className: 'financial-controls-grid' }, [
                // Period Selection
                React.createElement('div', { key: 'period', className: 'period-selector' }, [
                    React.createElement('label', { key: 'label' }, 'Period:'),
                    React.createElement('input', {
                        key: 'start',
                        type: 'date',
                        className: 'period-input',
                        value: selectedPeriod.start,
                        onChange: (e) => onPeriodChange({ ...selectedPeriod, start: e.target.value })
                    }),
                    React.createElement('span', { key: 'to' }, 'to'),
                    React.createElement('input', {
                        key: 'end',
                        type: 'date',
                        className: 'period-input',
                        value: selectedPeriod.end,
                        onChange: (e) => onPeriodChange({ ...selectedPeriod, end: e.target.value })
                    }),
                    React.createElement('div', { key: 'quick', className: 'quick-periods' }, [
                        React.createElement('button', {
                            key: 'mtd',
                            onClick: () => handleQuickPeriod('mtd'),
                            className: 'quick-period-btn'
                        }, 'MTD'),
                        React.createElement('button', {
                            key: 'qtd',
                            onClick: () => handleQuickPeriod('qtd'),
                            className: 'quick-period-btn'
                        }, 'QTD'),
                        React.createElement('button', {
                            key: 'ytd',
                            onClick: () => handleQuickPeriod('ytd'),
                            className: 'quick-period-btn'
                        }, 'YTD'),
                        React.createElement('button', {
                            key: 'lastMonth',
                            onClick: () => handleQuickPeriod('lastMonth'),
                            className: 'quick-period-btn'
                        }, 'Last Month'),
                        React.createElement('button', {
                            key: 'lastQuarter',
                            onClick: () => handleQuickPeriod('lastQuarter'),
                            className: 'quick-period-btn'
                        }, 'Last Quarter')
                    ])
                ]),

                // Basis Type Toggle
                React.createElement('div', { key: 'basis', className: 'basis-toggle' }, [
                    React.createElement('button', {
                        key: 'accrual',
                        className: `basis-option ${basisType === 'accrual' ? 'active' : ''}`,
                        onClick: () => onBasisChange('accrual')
                    }, 'Accrual'),
                    React.createElement('button', {
                        key: 'cash',
                        className: `basis-option ${basisType === 'cash' ? 'active' : ''}`,
                        onClick: () => onBasisChange('cash')
                    }, 'Cash')
                ]),

                // Entity Selector
                React.createElement('select', {
                    key: 'entity',
                    className: 'entity-selector',
                    value: selectedEntity?.id || '',
                    onChange: (e) => {
                        const entity = entities.find(ent => ent.id === e.target.value);
                        onEntityChange(entity);
                    }
                }, entities.map(entity =>
                    React.createElement('option', {
                        key: entity.id || 'all',
                        value: entity.id || ''
                    }, entity.name)
                )),

                // Property Selector
                React.createElement('select', {
                    key: 'property',
                    className: 'property-selector',
                    value: selectedProperty?.id || '',
                    onChange: (e) => {
                        const property = properties.find(prop => prop.id === e.target.value);
                        onPropertyChange(property);
                    }
                }, properties.map(property =>
                    React.createElement('option', {
                        key: property.id || 'all',
                        value: property.id || ''
                    }, property.name)
                )),

                // Export Button
                React.createElement('button', {
                    key: 'export',
                    className: 'export-btn',
                    onClick: () => {
                        console.log('Export financial data');
                    }
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-download' }),
                    React.createElement('span', { key: 'text' }, 'Export')
                ])
            ])
        );
    });
})();

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.FinancialControls = FinancialControls;