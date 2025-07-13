const FollowUpsWidget = ({ data, size, config }) => {
    if (!data) return null;

    const isCompact = size.w === 1 && size.h === 1;
    const isWide = size.w === 2 && size.h === 1;
    const isTall = size.w === 1 && size.h === 2;
    const isLarge = size.w >= 2 && size.h >= 2;

    // Compact view (1x1) - Task count
    if (isCompact) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Follow-ups</h3>
                </div>
                <div className="metric-value">{data.total || 0}</div>
                <div className="metric-label">tasks</div>
                {data.overdue > 0 && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#fca5a5' }}>
                        {data.overdue} overdue
                    </div>
                )}
            </div>
        );
    }

    // Task list view for other sizes
    const maxTasks = isWide ? 3 : (isTall ? 4 : 6);
    const tasks = data.tasks?.slice(0, maxTasks) || [];

    return (
        <div className="widget-content">
            <div className="widget-header">
                <h3 className="widget-title">Follow-up Tasks</h3>
                {!isCompact && (
                    <button className="widget-action-btn">
                        <Icons.Plus />
                    </button>
                )}
            </div>
            
            <div className="widget-list">
                {tasks.length > 0 ? (
                    tasks.map((task, idx) => (
                        <div key={idx} className="widget-list-item" style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => {}}
                                    style={{
                                        marginTop: '2px',
                                        cursor: 'pointer',
                                        accentColor: 'var(--color-brand)'
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div className={`list-item-title ${task.completed ? 'completed' : ''}`} 
                                         style={{
                                             textDecoration: task.completed ? 'line-through' : 'none',
                                             opacity: task.completed ? 0.6 : 1
                                         }}>
                                        {task.title}
                                    </div>
                                    <div className="list-item-subtitle" style={{
                                        color: getDueColor(task.due),
                                        fontSize: '11px'
                                    }}>
                                        Due: {task.due}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', opacity: 0.6, padding: '20px' }}>
                        <div style={{ marginBottom: '8px' }}>✓</div>
                        <div style={{ fontSize: '13px' }}>All caught up!</div>
                    </div>
                )}
            </div>
            
            {data.total > tasks.length && (
                <div style={{ 
                    marginTop: '12px', 
                    textAlign: 'center', 
                    fontSize: '12px', 
                    opacity: 0.7 
                }}>
                    +{data.total - tasks.length} more tasks
                </div>
            )}
        </div>
    );
};

const getDueColor = (due) => {
    if (due === 'Today' || due === 'Overdue') return '#ef4444';
    if (due === 'Tomorrow') return '#f59e0b';
    return 'inherit';
};