const QuickNotesWidget = ({ config, size, onUpdate }) => {
    const [notes, setNotes] = React.useState(config.notes || '');
    const [isEditing, setIsEditing] = React.useState(false);

    const isCompact = size.w === 1 && size.h === 1;
    const isLarge = size.w >= 2 || size.h >= 2;

    const handleSave = () => {
        onUpdate({ notes });
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsEditing(false);
            setNotes(config.notes || '');
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
            handleSave();
        }
    };

    // Compact view - Note count only
    if (isCompact && !isEditing) {
        const lines = notes.split('\n').filter(line => line.trim());
        const noteCount = lines.length;
        const firstLine = lines[0] || 'Click to add notes';
        
        return (
            <div className="widget-content" onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', position: 'relative' }}>
                <div className="widget-header">
                    <h3 className="widget-title">Quick Notes</h3>
                    <span style={{ fontSize: '10px', opacity: 0.5' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                            <path d={'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'}/>
                        </svg>
                    </span>
                </div>
                <div style={{ marginTop: '-4px' }}>
                    <div style={{ 
                        fontSize: '13px', 
                        lineHeight: '1.4',
                        opacity: 0.9,
                        marginBottom: '8px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {firstLine}
                    </div>
                    {noteCount > 0 && (
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '10px',
                            opacity: 0.6
                        }}>
                            <span>{noteCount} {noteCount === 1 ? 'note' : 'notes'}</span>
                            {lines.length > 1 && <span>+{lines.length - 1} more</span>}
                        </div>
                    )}
                </div>
                
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '-16px',
                    right: '-16px',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)',
                    opacity: 0,
                    transition: 'opacity 0.2s ease'
                }} className="hover-indicator" />
            </div>
        );
    }

    // Editable view
    if (isEditing) {
        return (
            <div className="widget-content">
                <div className="widget-header">
                    <h3 className="widget-title">Quick Notes</h3>
                    <div className="widget-actions">
                        <button 
                            className="widget-action-btn"
                            onClick={handleSave}
                            style={{ background: 'rgba(34, 197, 94, 0.2)' }}
                        >
                            ✓
                        </button>
                        <button 
                            className="widget-action-btn"
                            onClick={() => {
                                setIsEditing(false);
                                setNotes(config.notes || '');
                            }}
                        >
                            ×
                        </button>
                    </div>
                </div>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your notes here..."
                    autoFocus
                    style={{
                        width: '100%',
                        height: isLarge ? '120px' : '60px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '6px',
                        padding: '8px',
                        color: 'white',
                        fontSize: '13px',
                        resize: 'none',
                        outline: 'none'
                    }}
                />
                <div style={{ marginTop: '8px', fontSize: '11px', opacity: 0.5 }}>
                    Press Cmd+S to save, Esc to cancel
                </div>
            </div>
        );
    }

    // Display view
    return (
        <div className="widget-content">
            <div className="widget-header">
                <h3 className="widget-title">Quick Notes</h3>
                <button 
                    className="widget-action-btn"
                    onClick={() => setIsEditing(true)}
                >
                    <Icons.Edit />
                </button>
            </div>
            <div 
                onClick={() => setIsEditing(true)}
                style={{ 
                    cursor: 'text',
                    minHeight: '60px',
                    whiteSpace: 'pre-wrap',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    opacity: notes ? 1 : 0.5
                }}
            >
                {notes || 'Click to add notes...'}
            </div>
        </div>
    );
};