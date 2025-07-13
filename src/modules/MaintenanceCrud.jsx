// Maintenance module - created in under 2 minutes using CRUD pattern!

// Modal for adding/editing maintenance requests
const MaintenanceModal = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        property_id: item?.property_id || '',
        unit_id: item?.unit_id || '',
        title: item?.title || '',
        description: item?.description || '',
        priority: item?.priority || 'medium',
        category: item?.category || 'general',
        status: item?.status || 'open'
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
        onClose();
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{item ? 'Edit' : 'Create'} Maintenance Request</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                className="form-control"
                                value={formData.priority}
                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                className="form-control"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="general">General</option>
                                <option value="plumbing">Plumbing</option>
                                <option value="electrical">Electrical</option>
                                <option value="hvac">HVAC</option>
                                <option value="appliance">Appliance</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {item ? 'Update' : 'Create'} Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Create the complete Maintenance module with just configuration!
const MaintenanceCrud = window.CrudModulePattern.createModule({
    moduleName: 'maintenance requests',
    moduleNameSingular: 'request',
    endpoint: '/maintenance',
    stateKey: 'maintenance',
    searchable: true,
    defaultView: 'grid',
    
    // Define table columns
    columns: [
        { key: 'title', label: 'Title' },
        { key: 'priority', label: 'Priority' },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status' },
        {
            key: 'created_at',
            label: 'Created',
            render: (item) => new Date(item.created_at).toLocaleDateString()
        }
    ],
    
    // Define filters
    filters: [
        {
            key: 'priority',
            label: 'Priority',
            options: [
                { value: 'emergency', label: 'Emergency' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
            ]
        },
        {
            key: 'status',
            label: 'Status',
            options: [
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' }
            ]
        }
    ],
    
    // Custom card renderer
    cardRenderer: ({ item, onEdit, onDelete }) => (
        <div key={item.id} className="maintenance-card">
            <div className="maintenance-header">
                <h3>{item.title}</h3>
                <span className={`priority priority-${item.priority}`}>
                    {item.priority}
                </span>
            </div>
            <p className="maintenance-desc">{item.description}</p>
            <div className="maintenance-meta">
                <span><i className="fas fa-tag"></i> {item.category}</span>
                <span><i className="fas fa-clock"></i> {item.status}</span>
            </div>
            <div className="card-actions">
                <button className="btn-icon" onClick={onEdit}>
                    <i className="fas fa-edit"></i>
                </button>
                <button className="btn-icon danger" onClick={onDelete}>
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    ),
    
    // Attach the modal
    modalComponent: MaintenanceModal,
    
    // Calculate stats
    calculateStats: (items) => ({
        open: items.filter(i => i.status === 'open').length,
        emergency: items.filter(i => i.priority === 'emergency').length
    })
});

// Quick styles
const maintenanceStyles = `
.maintenance-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s;
}

.maintenance-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.maintenance-header h3 {
    margin: 0;
    font-size: 18px;
}

.priority {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
}

.priority-emergency {
    background: #fee2e2;
    color: #dc2626;
}

.priority-high {
    background: #fed7aa;
    color: #ea580c;
}

.priority-medium {
    background: #fef3c7;
    color: #d97706;
}

.priority-low {
    background: #dbeafe;
    color: #1e40af;
}

.maintenance-desc {
    color: #6b7280;
    margin: 12px 0;
    line-height: 1.5;
}

.maintenance-meta {
    display: flex;
    gap: 16px;
    font-size: 14px;
    color: #9ca3af;
    margin-bottom: 16px;
}

.maintenance-meta i {
    margin-right: 4px;
}
`;

if (!document.querySelector('#maintenance-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'maintenance-styles';
    styleSheet.textContent = maintenanceStyles;
    document.head.appendChild(styleSheet);
}

// Register
window.AppModules = window.AppModules || {};
window.AppModules.MaintenanceCrud = MaintenanceCrud;