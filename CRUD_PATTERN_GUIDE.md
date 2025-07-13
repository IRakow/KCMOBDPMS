# CRUD Module Pattern Guide

## Quick Start - Create a New Module in 2 Minutes!

### 1. Basic Module (Minimal Configuration)

```javascript
// Create a simple Vendors module
const VendorsCrud = window.CrudModulePattern.createModule({
    moduleName: 'vendors',
    endpoint: '/vendors'
});

// That's it! You get:
// ✅ List view with search
// ✅ Add/Edit/Delete functionality  
// ✅ Loading states
// ✅ Error handling
// ✅ Global state integration
```

### 2. Module with Custom Modal

```javascript
// 1. Create your modal component
const VendorModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        name: item?.name || '',
        email: item?.email || '',
        phone: item?.phone || '',
        category: item?.category || 'general'
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
        onClose();
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>{item ? 'Edit' : 'Add'} Vendor</h2>
                <form onSubmit={handleSubmit}>
                    {/* Your form fields */}
                </form>
            </div>
        </div>
    );
};

// 2. Create the module with modal
const VendorsCrud = window.CrudModulePattern.createModule({
    moduleName: 'vendors',
    endpoint: '/vendors',
    modalComponent: VendorModal
});
```

### 3. Full-Featured Module

```javascript
const VendorsCrud = window.CrudModulePattern.createModule({
    moduleName: 'vendors',
    moduleNameSingular: 'vendor',
    endpoint: '/vendors',
    stateKey: 'vendors',
    searchable: true,
    defaultView: 'grid', // or 'table'
    
    // Table columns for table view
    columns: [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        {
            key: 'status',
            label: 'Status',
            render: (vendor) => (
                `<span class="badge ${vendor.active ? 'active' : 'inactive'}">
                    ${vendor.active ? 'Active' : 'Inactive'}
                </span>`
            )
        }
    ],
    
    // Filters
    filters: [
        {
            key: 'category',
            label: 'Category',
            options: [
                { value: 'plumbing', label: 'Plumbing' },
                { value: 'electrical', label: 'Electrical' },
                { value: 'general', label: 'General' }
            ]
        }
    ],
    
    // Custom card for grid view
    cardRenderer: ({ item, onEdit, onDelete }) => (
        <div className="vendor-card">
            <h3>{item.name}</h3>
            <p>{item.email}</p>
            <p>{item.phone}</p>
            <div className="actions">
                <button onClick={onEdit}>Edit</button>
                <button onClick={onDelete}>Delete</button>
            </div>
        </div>
    ),
    
    // Modal component
    modalComponent: VendorModal,
    
    // Calculate additional stats
    calculateStats: (vendors) => ({
        active: vendors.filter(v => v.active).length,
        inactive: vendors.filter(v => !v.active).length
    })
});
```

## Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `moduleName` | string | required | Plural name (e.g., 'vendors') |
| `moduleNameSingular` | string | auto | Singular name (removes 's') |
| `endpoint` | string | required | API endpoint |
| `stateKey` | string | moduleName | Global state key |
| `searchable` | boolean | true | Enable search box |
| `defaultView` | string | 'grid' | Initial view mode |
| `columns` | array | [] | Table column config |
| `filters` | array | [] | Filter dropdowns |
| `cardRenderer` | function | null | Custom card component |
| `modalComponent` | component | null | Add/Edit modal |
| `calculateStats` | function | null | Calculate custom stats |

## Using Your Module

### 1. Register it
```javascript
window.AppModules.VendorsCrud = VendorsCrud;
```

### 2. Add to your routing
```javascript
case 'vendors':
    return <VendorsCrud />;
```

### 3. Navigate to it
```javascript
<button onClick={() => window.navigateTo('/vendors')}>
    Vendors
</button>
```

## Features You Get For Free

1. **Data Management**
   - Automatic loading from API
   - Global state integration
   - Real-time updates

2. **UI Components**
   - Search functionality
   - Filter dropdowns
   - Grid/Table view toggle
   - Loading states
   - Error handling
   - Empty states

3. **CRUD Operations**
   - Create with modal
   - Edit with modal
   - Delete with confirmation
   - Success/Error notifications

4. **Responsive Design**
   - Mobile-friendly grid
   - Adaptive layouts
   - Touch-friendly actions

## Tips

1. **Quick Prototype**: Start with just `moduleName` and `endpoint`
2. **Add Features Gradually**: Add modal, then filters, then custom cards
3. **Reuse Modals**: Create a base modal component and extend it
4. **Consistent Styling**: Use the provided CSS classes
5. **Global State**: Access data anywhere with `window.AppState.getState('vendors')`

## Example: Complete Module in 50 Lines

```javascript
// 1. Modal (20 lines)
const PaymentModal = ({ item, onClose, onSave }) => {
    const [amount, setAmount] = React.useState(item?.amount || '');
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>Record Payment</h2>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSave({ amount: parseFloat(amount) });
                    onClose();
                }}>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        required 
                    />
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
};

// 2. Module (10 lines)
const PaymentsCrud = window.CrudModulePattern.createModule({
    moduleName: 'payments',
    endpoint: '/payments',
    modalComponent: PaymentModal,
    columns: [
        { key: 'date', label: 'Date' },
        { key: 'amount', label: 'Amount', render: p => `$${p.amount}` },
        { key: 'status', label: 'Status' }
    ]
});

// 3. Register (1 line)
window.AppModules.PaymentsCrud = PaymentsCrud;

// Done! Full CRUD module with all features ✨
```

## Need Help?

- Check existing modules: `LeasesCrud.jsx`, `MaintenanceCrud.jsx`
- Use browser DevTools to inspect `window.CrudModulePattern`
- All modules follow the same pattern - consistency is key!