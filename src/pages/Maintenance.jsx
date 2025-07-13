const Maintenance = () => {
    const [workOrders, setWorkOrders] = React.useState([]);
    const [showCreateModal, setShowCreateModal] = React.useState(false);
    const [filters, setFilters] = React.useState({
        status: 'all', // all, open, in_progress, completed
        priority: 'all', // all, emergency, high, normal, low
        property: 'all'
    });
    
    React.useEffect(() => {
        loadWorkOrders();
    }, [filters]);
    
    const loadWorkOrders = async () => {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== 'all') params.append(key, value);
            });
            
            const response = await fetch(`http://localhost:8000/api/maintenance/work-orders?${params}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
            });
            
            const data = await response.json();
            setWorkOrders(data);
        } catch (error) {
            console.error('Failed to load work orders:', error);
            // Use mock data for demo
            setWorkOrders(mockWorkOrders);
        }
    };
    
    const stats = React.useMemo(() => {
        const open = workOrders.filter(w => w.status === 'open').length;
        const inProgress = workOrders.filter(w => w.status === 'in_progress').length;
        const emergency = workOrders.filter(w => w.priority === 'emergency').length;
        
        return { open, inProgress, emergency };
    }, [workOrders]);
    
    return (
        <div className="maintenance-page">
            {/* Emergency Alert */}
            {stats.emergency > 0 && (
                <div className="emergency-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{stats.emergency} Emergency Work Orders Require Immediate Attention</span>
                    <button onClick={() => setFilters({...filters, priority: 'emergency'})}>
                        View Emergency Orders
                    </button>
                </div>
            )}
            
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Maintenance</h1>
                    <p className="subtitle">{stats.open + stats.inProgress} active work orders</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <i className="fas fa-plus"></i>
                    Create Work Order
                </button>
            </div>
            
            {/* Quick Stats */}
            <div className="maintenance-stats">
                <div className="stat-card">
                    <div className="stat-icon open">
                        <i className="fas fa-clipboard-list"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.open}</div>
                        <div className="stat-label">Open</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon progress">
                        <i className="fas fa-tools"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inProgress}</div>
                        <div className="stat-label">In Progress</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon emergency">
                        <i className="fas fa-exclamation-circle"></i>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.emergency}</div>
                        <div className="stat-label">Emergency</div>
                    </div>
                </div>
            </div>
            
            {/* Filters */}
            <div className="filters-bar">
                <select 
                    className="filter-select"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                </select>
                
                <select 
                    className="filter-select"
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                >
                    <option value="all">All Priorities</option>
                    <option value="emergency">Emergency</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                </select>
            </div>
            
            {/* Work Orders List */}
            <div className="work-orders-list">
                {workOrders.map(order => (
                    <WorkOrderCard 
                        key={order.id} 
                        order={order}
                        onUpdate={() => loadWorkOrders()}
                    />
                ))}
            </div>
            
            {/* Create Modal */}
            {showCreateModal && (
                <CreateWorkOrderModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={() => {
                        setShowCreateModal(false);
                        loadWorkOrders();
                    }}
                />
            )}
        </div>
    );
};

// Work Order Card
const WorkOrderCard = ({ order, onUpdate }) => {
    const priorityColors = {
        emergency: 'danger',
        high: 'warning',
        normal: 'info',
        low: 'secondary'
    };
    
    const statusColors = {
        open: 'warning',
        in_progress: 'info',
        completed: 'success'
    };
    
    const updateStatus = async (newStatus) => {
        try {
            await fetch(`http://localhost:8000/api/maintenance/work-orders/${order.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            onUpdate();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };
    
    return (
        <div className={`work-order-card ${order.priority}`}>
            <div className="order-header">
                <div className="order-info">
                    <h3>{order.title}</h3>
                    <p className="order-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {order.property_name} - Unit {order.unit_number}
                    </p>
                </div>
                <div className="order-badges">
                    <span className={`priority-badge ${priorityColors[order.priority]}`}>
                        {order.priority}
                    </span>
                    <span className={`status-badge ${statusColors[order.status]}`}>
                        {order.status.replace('_', ' ')}
                    </span>
                </div>
            </div>
            
            <div className="order-details">
                <p>{order.description}</p>
                <div className="order-meta">
                    <span>
                        <i className="fas fa-user"></i>
                        {order.reported_by}
                    </span>
                    <span>
                        <i className="fas fa-calendar"></i>
                        {formatDate(order.created_at)}
                    </span>
                    {order.assigned_to && (
                        <span>
                            <i className="fas fa-hard-hat"></i>
                            {order.assigned_to}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="order-actions">
                {order.status === 'open' && (
                    <>
                        <button 
                            className="btn-small"
                            onClick={() => updateStatus('in_progress')}
                        >
                            Start Work
                        </button>
                        <button className="btn-small">
                            Assign Vendor
                        </button>
                    </>
                )}
                {order.status === 'in_progress' && (
                    <button 
                        className="btn-small success"
                        onClick={() => updateStatus('completed')}
                    >
                        Mark Complete
                    </button>
                )}
                <button className="btn-small">
                    View Details
                </button>
            </div>
        </div>
    );
};

// Create Work Order Modal (Simplified)
const CreateWorkOrderModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        priority: 'normal',
        property_id: '',
        unit_id: '',
        category: 'general'
    });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await fetch('http://localhost:8000/api/maintenance/work-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify(formData)
            });
            
            onSave();
        } catch (error) {
            console.error('Failed to create work order:', error);
            onSave(); // Still close for demo
        }
    };
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create Work Order</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Title</label>
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
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
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
                                <option value="normal">Normal</option>
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
                                <option value="appliances">Appliances</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create Work Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Mock data for demo
const mockWorkOrders = [
    {
        id: 1,
        title: 'Leaking Faucet in Kitchen',
        description: 'The kitchen faucet has been dripping constantly for the past week.',
        priority: 'high',
        status: 'open',
        property_name: 'Sunset Apartments',
        unit_number: '205',
        reported_by: 'John Smith',
        created_at: '2024-07-10',
        category: 'plumbing'
    },
    {
        id: 2,
        title: 'AC Unit Not Cooling',
        description: 'The air conditioning unit is running but not producing cold air.',
        priority: 'emergency',
        status: 'in_progress',
        property_name: 'Garden View Townhomes',
        unit_number: '410',
        reported_by: 'Sarah Johnson',
        created_at: '2024-07-11',
        assigned_to: 'Mike\'s HVAC Services',
        category: 'hvac'
    },
    {
        id: 3,
        title: 'Broken Window Lock',
        description: 'The lock on the bedroom window is broken and won\'t secure properly.',
        priority: 'normal',
        status: 'open',
        property_name: 'Downtown Office Plaza',
        unit_number: 'B12',
        reported_by: 'Michael Chen',
        created_at: '2024-07-09',
        category: 'general'
    },
    {
        id: 4,
        title: 'Electrical Outlet Sparking',
        description: 'The outlet in the living room sparked when plugging in a device.',
        priority: 'emergency',
        status: 'open',
        property_name: 'Sunset Apartments',
        unit_number: '308',
        reported_by: 'Lisa Park',
        created_at: '2024-07-12',
        category: 'electrical'
    },
    {
        id: 5,
        title: 'Dishwasher Not Draining',
        description: 'Water remains in the dishwasher after the cycle completes.',
        priority: 'normal',
        status: 'completed',
        property_name: 'Garden View Townhomes',
        unit_number: '305',
        reported_by: 'Emily Davis',
        created_at: '2024-07-08',
        assigned_to: 'ProFix Appliances',
        category: 'appliances'
    }
];