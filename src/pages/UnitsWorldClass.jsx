// UnitsWorldClass.jsx - Enterprise-grade Units Management
const UnitsWorldClass = () => {
    const [units, setUnits] = React.useState([]);
    const [view, setView] = React.useState('grid'); // grid, list, map, analytics
    const [selectedUnits, setSelectedUnits] = React.useState([]);
    const [filters, setFilters] = React.useState({
        search: '',
        properties: [],
        status: [],
        bedrooms: [],
        priceRange: { min: null, max: null },
        amenities: [],
        availability: 'all'
    });
    const [sortBy, setSortBy] = React.useState('unit');
    const [sortOrder, setSortOrder] = React.useState('asc');
    const [showFilters, setShowFilters] = React.useState(true);
    const [bulkAction, setBulkAction] = React.useState('');
    const [customColumns, setCustomColumns] = React.useState([
        'unit', 'property', 'status', 'tenant', 'rent', 'market', 'bedrooms', 'sqft', 'available'
    ]);

    // Load units data
    React.useEffect(() => {
        loadUnits();
    }, [filters, sortBy, sortOrder]);

    const loadUnits = async () => {
        // In production, this would fetch from API
        setUnits(generateMockUnits());
    };

    // Generate comprehensive mock data
    const generateMockUnits = () => {
        const properties = [
            'Sunset Apartments', 'Downtown Plaza', 'Garden Complex', 
            'Riverside Tower', 'Park View Residences'
        ];
        const statuses = ['occupied', 'vacant', 'maintenance', 'reserved'];
        const units = [];

        for (let i = 0; i < 150; i++) {
            const property = properties[Math.floor(Math.random() * properties.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const bedrooms = Math.floor(Math.random() * 4) + 1;
            const baseRent = 1000 + (bedrooms * 500) + (Math.random() * 1000);
            
            units.push({
                id: i + 1,
                unit: `${Math.floor(i / 50) + 1}${String(i % 50 + 1).padStart(2, '0')}`,
                property,
                building: `Building ${String.fromCharCode(65 + Math.floor(i / 50))}`,
                floor: Math.floor((i % 50) / 10) + 1,
                status,
                tenant: status === 'occupied' ? `Tenant ${i + 1}` : null,
                bedrooms,
                bathrooms: bedrooms > 1 ? 2 : 1,
                sqft: 600 + (bedrooms * 200) + Math.floor(Math.random() * 200),
                rent: Math.round(baseRent),
                marketRent: Math.round(baseRent * (0.95 + Math.random() * 0.15)),
                deposit: Math.round(baseRent * 1.5),
                leaseStart: status === 'occupied' ? '2024-01-01' : null,
                leaseEnd: status === 'occupied' ? '2025-01-01' : null,
                moveIn: status === 'occupied' ? '2024-01-01' : null,
                lastRenovation: '2023-06-15',
                amenities: ['Parking', 'Storage', 'Balcony', 'In-Unit Laundry']
                    .filter(() => Math.random() > 0.5),
                utilities: ['Water', 'Trash', 'Gas'].filter(() => Math.random() > 0.3),
                petsAllowed: Math.random() > 0.5,
                furnished: Math.random() > 0.8,
                daysVacant: status === 'vacant' ? Math.floor(Math.random() * 60) : 0,
                turnoverCost: status === 'vacant' ? Math.round(Math.random() * 2000) : 0,
                maintenanceRequests: Math.floor(Math.random() * 5),
                paymentStatus: status === 'occupied' ? 
                    (Math.random() > 0.1 ? 'current' : 'late') : null,
                notes: ''
            });
        }
        return units;
    };

    // Calculate metrics
    const calculateMetrics = () => {
        const total = units.length;
        const occupied = units.filter(u => u.status === 'occupied').length;
        const vacant = units.filter(u => u.status === 'vacant').length;
        const maintenance = units.filter(u => u.status === 'maintenance').length;
        const reserved = units.filter(u => u.status === 'reserved').length;
        
        const totalRent = units
            .filter(u => u.status === 'occupied')
            .reduce((sum, u) => sum + u.rent, 0);
        const potentialRent = units.reduce((sum, u) => sum + u.marketRent, 0);
        const avgDaysVacant = vacant > 0 ? 
            units.filter(u => u.status === 'vacant')
                .reduce((sum, u) => sum + u.daysVacant, 0) / vacant : 0;

        return {
            total,
            occupied,
            vacant,
            maintenance,
            reserved,
            occupancyRate: ((occupied / total) * 100).toFixed(1),
            vacancyRate: ((vacant / total) * 100).toFixed(1),
            totalRent,
            potentialRent,
            rentLoss: potentialRent - totalRent,
            avgDaysVacant: avgDaysVacant.toFixed(0),
            economicOccupancy: ((totalRent / potentialRent) * 100).toFixed(1)
        };
    };

    const metrics = calculateMetrics();

    // Filter units
    const filteredUnits = React.useMemo(() => {
        return units.filter(unit => {
            // Search filter
            if (filters.search) {
                const search = filters.search.toLowerCase();
                if (!unit.unit.toLowerCase().includes(search) &&
                    !unit.property.toLowerCase().includes(search) &&
                    !(unit.tenant && unit.tenant.toLowerCase().includes(search))) {
                    return false;
                }
            }

            // Property filter
            if (filters.properties.length > 0 && !filters.properties.includes(unit.property)) {
                return false;
            }

            // Status filter
            if (filters.status.length > 0 && !filters.status.includes(unit.status)) {
                return false;
            }

            // Bedrooms filter
            if (filters.bedrooms.length > 0 && !filters.bedrooms.includes(unit.bedrooms)) {
                return false;
            }

            // Price range filter
            if (filters.priceRange.min && unit.rent < filters.priceRange.min) return false;
            if (filters.priceRange.max && unit.rent > filters.priceRange.max) return false;

            return true;
        }).sort((a, b) => {
            const aVal = a[sortBy];
            const bVal = b[sortBy];
            const modifier = sortOrder === 'asc' ? 1 : -1;
            
            if (typeof aVal === 'string') {
                return aVal.localeCompare(bVal) * modifier;
            }
            return (aVal - bVal) * modifier;
        });
    }, [units, filters, sortBy, sortOrder]);

    // Header Component
    const Header = () => {
        return React.createElement('div', { className: 'units-header-pro' }, [
            React.createElement('div', { key: 'title-section', className: 'header-title-section' }, [
                React.createElement('h1', { key: 'title' }, 'Units'),
                React.createElement('p', { key: 'subtitle', className: 'header-subtitle' }, 
                    `${filteredUnits.length} of ${units.length} units shown`
                )
            ]),
            React.createElement('div', { key: 'actions', className: 'header-actions' }, [
                React.createElement('button', { 
                    key: 'filters',
                    className: 'btn-icon',
                    onClick: () => setShowFilters(!showFilters),
                    title: 'Toggle Filters'
                }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-filter' }),
                    showFilters && React.createElement('span', { key: 'dot', className: 'active-dot' })
                ]),
                React.createElement('div', { key: 'view-toggle', className: 'view-toggle' }, 
                    ['grid', 'list', 'map', 'analytics'].map(v =>
                        React.createElement('button', {
                            key: v,
                            className: `view-btn ${view === v ? 'active' : ''}`,
                            onClick: () => setView(v)
                        }, [
                            React.createElement('i', { 
                                key: 'icon',
                                className: `fas fa-${
                                    v === 'grid' ? 'th' : 
                                    v === 'list' ? 'list' : 
                                    v === 'map' ? 'map-marked-alt' : 
                                    'chart-bar'
                                }`
                            })
                        ])
                    )
                ),
                React.createElement('button', { key: 'export', className: 'btn btn-secondary' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-download' }),
                    ' Export'
                ]),
                React.createElement('button', { key: 'add', className: 'btn btn-primary' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-plus' }),
                    ' Add Unit'
                ])
            ])
        ]);
    };

    // Metrics Cards
    const MetricsCards = () => {
        const cards = [
            {
                title: 'Occupancy Rate',
                value: `${metrics.occupancyRate}%`,
                subtitle: `${metrics.occupied} of ${metrics.total} units`,
                icon: 'fa-home',
                color: '#10b981',
                trend: '+2.3%',
                trendUp: true
            },
            {
                title: 'Vacant Units',
                value: metrics.vacant,
                subtitle: `${metrics.avgDaysVacant} avg days`,
                icon: 'fa-door-open',
                color: '#f59e0b',
                trend: metrics.vacant > 0 ? `$${(metrics.rentLoss / 1000).toFixed(1)}K lost` : 'No loss',
                trendUp: false
            },
            {
                title: 'Monthly Revenue',
                value: `$${(metrics.totalRent / 1000).toFixed(1)}K`,
                subtitle: `of $${(metrics.potentialRent / 1000).toFixed(1)}K potential`,
                icon: 'fa-dollar-sign',
                color: '#3b82f6',
                trend: '+5.2%',
                trendUp: true
            },
            {
                title: 'Maintenance',
                value: metrics.maintenance,
                subtitle: 'Units under repair',
                icon: 'fa-tools',
                color: '#ef4444',
                trend: '2 scheduled today',
                trendUp: null
            }
        ];

        return React.createElement('div', { className: 'metrics-cards-grid' },
            cards.map((card, idx) =>
                React.createElement('div', { key: idx, className: 'metric-card-pro' }, [
                    React.createElement('div', { key: 'header', className: 'metric-card-header' }, [
                        React.createElement('div', { 
                            key: 'icon',
                            className: 'metric-icon',
                            style: { backgroundColor: `${card.color}20`, color: card.color }
                        }, React.createElement('i', { className: `fas ${card.icon}` })),
                        React.createElement('div', { key: 'menu', className: 'metric-menu' },
                            React.createElement('i', { className: 'fas fa-ellipsis-h' })
                        )
                    ]),
                    React.createElement('div', { key: 'value', className: 'metric-value' }, card.value),
                    React.createElement('div', { key: 'title', className: 'metric-title' }, card.title),
                    React.createElement('div', { key: 'subtitle', className: 'metric-subtitle' }, card.subtitle),
                    card.trend && React.createElement('div', { 
                        key: 'trend',
                        className: `metric-trend ${card.trendUp ? 'up' : card.trendUp === false ? 'down' : ''}`
                    }, [
                        card.trendUp !== null && React.createElement('i', { 
                            key: 'icon',
                            className: `fas fa-arrow-${card.trendUp ? 'up' : 'down'}`
                        }),
                        ' ',
                        card.trend
                    ])
                ])
            )
        );
    };

    // Filters Panel
    const FiltersPanel = () => {
        if (!showFilters) return null;

        return React.createElement('div', { className: 'filters-panel-pro' }, [
            React.createElement('div', { key: 'search', className: 'filter-section' }, [
                React.createElement('div', { key: 'search-box', className: 'search-box-pro' }, [
                    React.createElement('i', { key: 'icon', className: 'fas fa-search' }),
                    React.createElement('input', {
                        key: 'input',
                        type: 'text',
                        placeholder: 'Search units, properties, tenants...',
                        value: filters.search,
                        onChange: (e) => setFilters({ ...filters, search: e.target.value })
                    })
                ])
            ]),
            
            React.createElement('div', { key: 'filters', className: 'filters-row' }, [
                // Status Filter
                React.createElement('div', { key: 'status', className: 'filter-group' }, [
                    React.createElement('label', { key: 'label' }, 'Status'),
                    React.createElement('div', { key: 'options', className: 'filter-options' }, 
                        ['occupied', 'vacant', 'maintenance', 'reserved'].map(status =>
                            React.createElement('button', {
                                key: status,
                                className: `filter-chip ${filters.status.includes(status) ? 'active' : ''}`,
                                onClick: () => {
                                    const newStatus = filters.status.includes(status)
                                        ? filters.status.filter(s => s !== status)
                                        : [...filters.status, status];
                                    setFilters({ ...filters, status: newStatus });
                                }
                            }, [
                                React.createElement('span', { 
                                    key: 'dot',
                                    className: `status-dot ${status}`
                                }),
                                status.charAt(0).toUpperCase() + status.slice(1)
                            ])
                        )
                    )
                ]),

                // Bedrooms Filter
                React.createElement('div', { key: 'bedrooms', className: 'filter-group' }, [
                    React.createElement('label', { key: 'label' }, 'Bedrooms'),
                    React.createElement('div', { key: 'options', className: 'filter-options' }, 
                        [1, 2, 3, 4].map(num =>
                            React.createElement('button', {
                                key: num,
                                className: `filter-chip ${filters.bedrooms.includes(num) ? 'active' : ''}`,
                                onClick: () => {
                                    const newBedrooms = filters.bedrooms.includes(num)
                                        ? filters.bedrooms.filter(b => b !== num)
                                        : [...filters.bedrooms, num];
                                    setFilters({ ...filters, bedrooms: newBedrooms });
                                }
                            }, `${num} BR`)
                        )
                    )
                ]),

                // Price Range
                React.createElement('div', { key: 'price', className: 'filter-group' }, [
                    React.createElement('label', { key: 'label' }, 'Rent Range'),
                    React.createElement('div', { key: 'inputs', className: 'range-inputs' }, [
                        React.createElement('input', {
                            key: 'min',
                            type: 'number',
                            placeholder: 'Min',
                            value: filters.priceRange.min || '',
                            onChange: (e) => setFilters({
                                ...filters,
                                priceRange: { ...filters.priceRange, min: e.target.value ? parseInt(e.target.value) : null }
                            })
                        }),
                        React.createElement('span', { key: 'dash' }, '-'),
                        React.createElement('input', {
                            key: 'max',
                            type: 'number',
                            placeholder: 'Max',
                            value: filters.priceRange.max || '',
                            onChange: (e) => setFilters({
                                ...filters,
                                priceRange: { ...filters.priceRange, max: e.target.value ? parseInt(e.target.value) : null }
                            })
                        })
                    ])
                ]),

                // Clear Filters
                React.createElement('button', {
                    key: 'clear',
                    className: 'btn-text',
                    onClick: () => setFilters({
                        search: '',
                        properties: [],
                        status: [],
                        bedrooms: [],
                        priceRange: { min: null, max: null },
                        amenities: [],
                        availability: 'all'
                    })
                }, 'Clear All')
            ])
        ]);
    };

    // Grid View
    const GridView = () => {
        return React.createElement('div', { className: 'units-grid-pro' },
            filteredUnits.map(unit =>
                React.createElement('div', { 
                    key: unit.id,
                    className: `unit-card-pro ${unit.status}`,
                    onClick: () => console.log('View unit:', unit.id)
                }, [
                    React.createElement('div', { key: 'header', className: 'unit-card-header' }, [
                        React.createElement('div', { key: 'unit-info' }, [
                            React.createElement('h3', { key: 'unit' }, unit.unit),
                            React.createElement('p', { key: 'property' }, unit.property)
                        ]),
                        React.createElement('div', { 
                            key: 'status',
                            className: `unit-status ${unit.status}`
                        }, unit.status)
                    ]),
                    
                    React.createElement('div', { key: 'details', className: 'unit-details' }, [
                        React.createElement('div', { key: 'specs', className: 'unit-specs' }, [
                            React.createElement('span', { key: 'bed' }, [
                                React.createElement('i', { key: 'icon', className: 'fas fa-bed' }),
                                ` ${unit.bedrooms}`
                            ]),
                            React.createElement('span', { key: 'bath' }, [
                                React.createElement('i', { key: 'icon', className: 'fas fa-bath' }),
                                ` ${unit.bathrooms}`
                            ]),
                            React.createElement('span', { key: 'sqft' }, `${unit.sqft} sqft`)
                        ]),
                        
                        unit.status === 'occupied' && React.createElement('div', { 
                            key: 'tenant',
                            className: 'unit-tenant'
                        }, [
                            React.createElement('i', { key: 'icon', className: 'fas fa-user' }),
                            ' ',
                            unit.tenant
                        ]),
                        
                        React.createElement('div', { key: 'rent', className: 'unit-rent' }, [
                            React.createElement('span', { key: 'amount', className: 'rent-amount' }, 
                                `$${unit.rent.toLocaleString()}`
                            ),
                            React.createElement('span', { key: 'month' }, '/mo'),
                            unit.marketRent > unit.rent && React.createElement('span', { 
                                key: 'market',
                                className: 'market-rent'
                            }, `Market: $${unit.marketRent.toLocaleString()}`)
                        ])
                    ]),
                    
                    React.createElement('div', { key: 'footer', className: 'unit-card-footer' }, [
                        unit.status === 'vacant' && React.createElement('span', { 
                            key: 'vacant',
                            className: 'vacant-days'
                        }, `Vacant ${unit.daysVacant} days`),
                        
                        React.createElement('div', { key: 'actions', className: 'unit-actions' }, [
                            React.createElement('button', { 
                                key: 'view',
                                className: 'btn-icon-small',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    console.log('View details');
                                }
                            }, React.createElement('i', { className: 'fas fa-eye' })),
                            React.createElement('button', { 
                                key: 'edit',
                                className: 'btn-icon-small',
                                onClick: (e) => {
                                    e.stopPropagation();
                                    console.log('Edit unit');
                                }
                            }, React.createElement('i', { className: 'fas fa-edit' }))
                        ])
                    ])
                ])
            )
        );
    };

    // List View
    const ListView = () => {
        const columns = [
            { key: 'unit', label: 'Unit', sortable: true },
            { key: 'property', label: 'Property', sortable: true },
            { key: 'status', label: 'Status', sortable: true },
            { key: 'tenant', label: 'Tenant', sortable: true },
            { key: 'bedrooms', label: 'Bed', sortable: true },
            { key: 'bathrooms', label: 'Bath', sortable: true },
            { key: 'sqft', label: 'Sq Ft', sortable: true },
            { key: 'rent', label: 'Rent', sortable: true },
            { key: 'marketRent', label: 'Market', sortable: true },
            { key: 'available', label: 'Available', sortable: false }
        ];

        return React.createElement('div', { className: 'units-list-pro' }, [
            // Bulk Actions Bar
            selectedUnits.length > 0 && React.createElement('div', { 
                key: 'bulk-actions',
                className: 'bulk-actions-bar'
            }, [
                React.createElement('span', { key: 'count' }, 
                    `${selectedUnits.length} units selected`
                ),
                React.createElement('div', { key: 'actions', className: 'bulk-actions' }, [
                    React.createElement('button', { key: 'email', className: 'btn-text' }, 
                        'Email Tenants'
                    ),
                    React.createElement('button', { key: 'export', className: 'btn-text' }, 
                        'Export Selected'
                    ),
                    React.createElement('button', { key: 'update', className: 'btn-text' }, 
                        'Bulk Update'
                    )
                ])
            ]),

            // Table
            React.createElement('div', { key: 'table-wrapper', className: 'table-wrapper' },
                React.createElement('table', { className: 'units-table' }, [
                    React.createElement('thead', { key: 'head' },
                        React.createElement('tr', {},
                            [
                                React.createElement('th', { key: 'checkbox' },
                                    React.createElement('input', {
                                        type: 'checkbox',
                                        checked: selectedUnits.length === filteredUnits.length,
                                        onChange: (e) => {
                                            if (e.target.checked) {
                                                setSelectedUnits(filteredUnits.map(u => u.id));
                                            } else {
                                                setSelectedUnits([]);
                                            }
                                        }
                                    })
                                ),
                                ...columns.filter(col => customColumns.includes(col.key)).map(col =>
                                    React.createElement('th', {
                                        key: col.key,
                                        className: col.sortable ? 'sortable' : '',
                                        onClick: col.sortable ? () => {
                                            if (sortBy === col.key) {
                                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                                            } else {
                                                setSortBy(col.key);
                                                setSortOrder('asc');
                                            }
                                        } : undefined
                                    }, [
                                        col.label,
                                        col.sortable && sortBy === col.key && React.createElement('i', {
                                            key: 'sort',
                                            className: `fas fa-sort-${sortOrder === 'asc' ? 'up' : 'down'}`
                                        })
                                    ])
                                ),
                                React.createElement('th', { key: 'actions' }, 'Actions')
                            ]
                        )
                    ),
                    React.createElement('tbody', { key: 'body' },
                        filteredUnits.map(unit =>
                            React.createElement('tr', { 
                                key: unit.id,
                                className: selectedUnits.includes(unit.id) ? 'selected' : ''
                            }, [
                                React.createElement('td', { key: 'checkbox' },
                                    React.createElement('input', {
                                        type: 'checkbox',
                                        checked: selectedUnits.includes(unit.id),
                                        onChange: (e) => {
                                            if (e.target.checked) {
                                                setSelectedUnits([...selectedUnits, unit.id]);
                                            } else {
                                                setSelectedUnits(selectedUnits.filter(id => id !== unit.id));
                                            }
                                        }
                                    })
                                ),
                                customColumns.includes('unit') && React.createElement('td', { 
                                    key: 'unit',
                                    className: 'unit-cell'
                                }, unit.unit),
                                customColumns.includes('property') && React.createElement('td', { 
                                    key: 'property' 
                                }, unit.property),
                                customColumns.includes('status') && React.createElement('td', { 
                                    key: 'status' 
                                }, React.createElement('span', { 
                                    className: `status-badge ${unit.status}` 
                                }, unit.status)),
                                customColumns.includes('tenant') && React.createElement('td', { 
                                    key: 'tenant' 
                                }, unit.tenant || '-'),
                                customColumns.includes('bedrooms') && React.createElement('td', { 
                                    key: 'bedrooms' 
                                }, unit.bedrooms),
                                customColumns.includes('bathrooms') && React.createElement('td', { 
                                    key: 'bathrooms' 
                                }, unit.bathrooms),
                                customColumns.includes('sqft') && React.createElement('td', { 
                                    key: 'sqft' 
                                }, unit.sqft.toLocaleString()),
                                customColumns.includes('rent') && React.createElement('td', { 
                                    key: 'rent',
                                    className: 'rent-cell'
                                }, `$${unit.rent.toLocaleString()}`),
                                customColumns.includes('market') && React.createElement('td', { 
                                    key: 'market' 
                                }, `$${unit.marketRent.toLocaleString()}`),
                                customColumns.includes('available') && React.createElement('td', { 
                                    key: 'available' 
                                }, unit.leaseEnd || 'Now'),
                                React.createElement('td', { key: 'actions', className: 'actions-cell' }, [
                                    React.createElement('button', { 
                                        key: 'view',
                                        className: 'btn-icon-small',
                                        title: 'View Details'
                                    }, React.createElement('i', { className: 'fas fa-eye' })),
                                    React.createElement('button', { 
                                        key: 'edit',
                                        className: 'btn-icon-small',
                                        title: 'Edit'
                                    }, React.createElement('i', { className: 'fas fa-edit' })),
                                    React.createElement('button', { 
                                        key: 'more',
                                        className: 'btn-icon-small',
                                        title: 'More Actions'
                                    }, React.createElement('i', { className: 'fas fa-ellipsis-v' }))
                                ])
                            ])
                        )
                    )
                ])
            )
        ]);
    };

    // Main Render
    return React.createElement('div', { className: 'units-world-class' }, [
        Header(),
        MetricsCards(),
        FiltersPanel(),
        React.createElement('div', { key: 'content', className: 'units-content' },
            view === 'grid' ? GridView() :
            view === 'list' ? ListView() :
            view === 'map' ? React.createElement('div', { className: 'map-view' }, 'Map View Coming Soon') :
            React.createElement('div', { className: 'analytics-view' }, 'Analytics View Coming Soon')
        )
    ]);
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.UnitsWorldClass = UnitsWorldClass;