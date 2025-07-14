// PropertySwitcher.jsx - Global Property Context Switcher
const PropertySwitcher = ({ currentProperty, onPropertyChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [properties, setProperties] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        loadProperties();
    }, []);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadProperties = async () => {
        try {
            if (window.ApiService && typeof window.ApiService.get === 'function') {
                const response = await window.ApiService.get('/properties');
                setProperties(response.data);
            } else {
                // Mock data for demonstration
                setProperties(mockProperties);
            }
        } catch (error) {
            console.error('Error loading properties:', error);
            setProperties(mockProperties);
        } finally {
            setLoading(false);
        }
    };

    const mockProperties = [
        {
            id: 'all',
            name: 'All Properties',
            type: 'all',
            units: 48,
            owner: null,
            icon: 'fa-building'
        },
        {
            id: 'sunset-apts',
            name: 'Sunset Apartments',
            type: 'residential',
            address: '123 Sunset Blvd, Los Angeles, CA',
            units: 24,
            owner: 'BDPMS LLC',
            ownerId: 'owner-1',
            managementCompany: 'PropertyPro Management',
            icon: 'fa-home'
        },
        {
            id: 'downtown-plaza',
            name: 'Downtown Plaza',
            type: 'commercial',
            address: '456 Business Ave, San Francisco, CA',
            units: 8,
            owner: 'Smith Trust',
            ownerId: 'owner-2',
            managementCompany: 'PropertyPro Management',
            icon: 'fa-building'
        },
        {
            id: 'garden-complex',
            name: 'Garden Complex',
            type: 'residential',
            address: '789 Garden St, Austin, TX',
            units: 16,
            owner: 'Johnson Properties',
            ownerId: 'owner-3',
            managementCompany: 'PropertyPro Management',
            icon: 'fa-tree'
        }
    ];

    // Group properties by owner
    const groupedProperties = React.useMemo(() => {
        const groups = {};
        const filtered = properties.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.owner && p.owner.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        filtered.forEach(property => {
            if (property.id === 'all') {
                groups['all'] = groups['all'] || { owner: 'All Properties', properties: [] };
                groups['all'].properties.push(property);
            } else {
                const owner = property.owner || 'Unassigned';
                groups[owner] = groups[owner] || { owner, properties: [] };
                groups[owner].properties.push(property);
            }
        });

        return groups;
    }, [properties, searchTerm]);

    const selectedProperty = properties.find(p => p.id === currentProperty) || properties[0];

    return React.createElement('div', { 
        className: 'property-switcher',
        ref: dropdownRef
    }, [
        // Trigger Button
        React.createElement('button', {
            key: 'trigger',
            className: 'property-switcher-trigger',
            onClick: () => setIsOpen(!isOpen)
        }, [
            React.createElement('div', { key: 'info', className: 'trigger-info' }, [
                React.createElement('div', { key: 'label', className: 'trigger-label' }, 'Property'),
                React.createElement('div', { key: 'value', className: 'trigger-value' }, [
                    React.createElement('i', { 
                        key: 'icon',
                        className: `fas ${selectedProperty?.icon || 'fa-building'}`
                    }),
                    React.createElement('span', { key: 'name' }, selectedProperty?.name || 'Select Property'),
                    selectedProperty?.owner && React.createElement('span', { 
                        key: 'owner',
                        className: 'property-owner'
                    }, ` • ${selectedProperty.owner}`)
                ])
            ]),
            React.createElement('i', { 
                key: 'chevron',
                className: `fas fa-chevron-${isOpen ? 'up' : 'down'} trigger-chevron`
            })
        ]),

        // Dropdown
        isOpen && React.createElement('div', { 
            key: 'dropdown',
            className: 'property-switcher-dropdown'
        }, [
            // Search
            React.createElement('div', { key: 'search', className: 'dropdown-search' }, [
                React.createElement('i', { key: 'icon', className: 'fas fa-search' }),
                React.createElement('input', {
                    key: 'input',
                    type: 'text',
                    placeholder: 'Search properties or owners...',
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value),
                    onClick: (e) => e.stopPropagation()
                })
            ]),

            // Properties List
            React.createElement('div', { key: 'list', className: 'dropdown-list' },
                loading ? 
                    React.createElement('div', { className: 'dropdown-loading' }, 'Loading properties...') :
                Object.entries(groupedProperties).length === 0 ?
                    React.createElement('div', { className: 'dropdown-empty' }, 'No properties found') :
                Object.entries(groupedProperties).map(([owner, group]) =>
                    React.createElement('div', { key: owner, className: 'property-group' }, [
                        owner !== 'all' && React.createElement('div', { 
                            key: 'header',
                            className: 'group-header'
                        }, owner),
                        ...group.properties.map(property =>
                            React.createElement('div', {
                                key: property.id,
                                className: `property-option ${property.id === currentProperty ? 'active' : ''}`,
                                onClick: () => {
                                    onPropertyChange(property.id);
                                    setIsOpen(false);
                                    setSearchTerm('');
                                }
                            }, [
                                React.createElement('div', { key: 'icon', className: 'option-icon' },
                                    React.createElement('i', { className: `fas ${property.icon}` })
                                ),
                                React.createElement('div', { key: 'info', className: 'option-info' }, [
                                    React.createElement('div', { key: 'name', className: 'option-name' }, 
                                        property.name
                                    ),
                                    property.address && React.createElement('div', { 
                                        key: 'address',
                                        className: 'option-address'
                                    }, property.address)
                                ]),
                                React.createElement('div', { key: 'meta', className: 'option-meta' }, [
                                    React.createElement('span', { key: 'units', className: 'unit-count' }, 
                                        `${property.units} units`
                                    ),
                                    property.id === currentProperty && React.createElement('i', { 
                                        key: 'check',
                                        className: 'fas fa-check'
                                    })
                                ])
                            ])
                        )
                    ])
                )
            ),

            // Footer
            React.createElement('div', { key: 'footer', className: 'dropdown-footer' }, [
                React.createElement('button', { 
                    key: 'manage',
                    className: 'footer-action',
                    onClick: () => {
                        setIsOpen(false);
                        // Navigate to properties page
                        if (window.setActivePage) {
                            window.setActivePage('properties');
                        }
                    }
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-cog' }),
                    ' Manage Properties'
                ])
            ])
        ])
    ]);
};

// Property Context Provider
const PropertyContext = React.createContext({
    currentProperty: 'all',
    setCurrentProperty: () => {},
    properties: [],
    currentPropertyData: null
});

const PropertyProvider = ({ children }) => {
    const [currentProperty, setCurrentProperty] = React.useState(() => {
        // Load from localStorage if available
        return localStorage.getItem('selectedProperty') || 'all';
    });
    const [properties, setProperties] = React.useState([]);

    React.useEffect(() => {
        // Save to localStorage when changed
        localStorage.setItem('selectedProperty', currentProperty);
    }, [currentProperty]);

    React.useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            if (window.ApiService && typeof window.ApiService.get === 'function') {
                const response = await window.ApiService.get('/properties');
                setProperties(response.data);
            } else {
                // Use mock data
                setProperties([
                    {
                        id: 'all',
                        name: 'All Properties',
                        type: 'all'
                    },
                    {
                        id: 'sunset-apts',
                        name: 'Sunset Apartments',
                        type: 'residential',
                        owner: 'BDPMS LLC'
                    },
                    {
                        id: 'downtown-plaza',
                        name: 'Downtown Plaza',
                        type: 'commercial',
                        owner: 'Smith Trust'
                    },
                    {
                        id: 'garden-complex',
                        name: 'Garden Complex',
                        type: 'residential',
                        owner: 'Johnson Properties'
                    }
                ]);
            }
        } catch (error) {
            console.error('Error loading properties:', error);
        }
    };

    const currentPropertyData = properties.find(p => p.id === currentProperty);

    return React.createElement(PropertyContext.Provider, {
        value: {
            currentProperty,
            setCurrentProperty,
            properties,
            currentPropertyData
        }
    }, children);
};

// Hook to use property context
const useProperty = () => {
    const context = React.useContext(PropertyContext);
    if (!context) {
        throw new Error('useProperty must be used within a PropertyProvider');
    }
    return context;
};

// Export components and hooks
window.AppModules = window.AppModules || {};
window.AppModules.PropertySwitcher = PropertySwitcher;
window.AppModules.PropertyProvider = PropertyProvider;
window.AppModules.PropertyContext = PropertyContext;
window.AppModules.useProperty = useProperty;