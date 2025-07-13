const DraggableWidget = ({ widget, index, editMode, onMove, onRemove, onResize, children }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = React.useState({ x: 0, y: 0, w: 0, h: 0 });
    const [currentPosition, setCurrentPosition] = React.useState({ 
        x: widget.position.x,
        y: widget.position.y
    });
    const [currentSize, setCurrentSize] = React.useState({
        w: widget.position.w,
        h: widget.position.h
    });
    const widgetRef = React.useRef(null);

    const handleMouseDown = (e) => {
        if (!editMode) return;
        
        // Only start drag from the drag handle
        if (!e.target.closest('.widget-drag-handle') && e.target.tagName !== 'DIV') {
            return;
        }
        
        setDragStart({
            x: e.clientX,
            y: e.clientY
        });
        setIsDragging(true);
        e.preventDefault();
    };

    React.useEffect(() => {
        setCurrentPosition({
            x: widget.position.x,
            y: widget.position.y
        });
        setCurrentSize({
            w: widget.position.w,
            h: widget.position.h
        });
    }, [widget.position]);

    React.useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e) => {
            const container = document.querySelector('.grid-layout');
            if (!container) return;
            
            const rect = container.getBoundingClientRect();
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            
            // Convert pixel movement to grid units
            const gridCellWidth = rect.width / 4;
            const gridCellHeight = 96;
            
            const gridDeltaX = Math.round(deltaX / gridCellWidth);
            const gridDeltaY = Math.round(deltaY / gridCellHeight);
            
            // Calculate new position
            const newX = widget.position.x + gridDeltaX;
            const newY = widget.position.y + gridDeltaY;
            
            // Constrain to grid bounds
            const maxX = 4 - widget.position.w;
            const constrainedX = Math.max(0, Math.min(newX, maxX));
            const constrainedY = Math.max(0, newY);
            
            setCurrentPosition({
                x: constrainedX,
                y: constrainedY
            });
        };

        const handleMouseUp = (e) => {
            setIsDragging(false);
            
            // Update widget position if it changed
            if (currentPosition.x !== widget.position.x || currentPosition.y !== widget.position.y) {
                onMove(widget.id, currentPosition);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'grabbing';

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        };
    }, [isDragging, dragStart, widget, onMove, currentPosition]);

    const handleResizeStart = (e) => {
        if (!editMode) return;
        
        e.stopPropagation();
        e.preventDefault();
        
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            w: widget.position.w,
            h: widget.position.h
        });
        setIsResizing(true);
    };

    React.useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e) => {
            const container = document.querySelector('.grid-layout');
            if (!container) return;
            
            const rect = container.getBoundingClientRect();
            const gridCellWidth = rect.width / 4;
            const gridCellHeight = 96;
            
            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;
            
            const gridDeltaW = Math.round(deltaX / gridCellWidth);
            const gridDeltaH = Math.round(deltaY / gridCellHeight);
            
            // Calculate new size
            const newW = Math.max(1, Math.min(4 - widget.position.x, resizeStart.w + gridDeltaW));
            const newH = Math.max(1, resizeStart.h + gridDeltaH);
            
            setCurrentSize({ w: newW, h: newH });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            
            // Update widget size if it changed
            if (currentSize.w !== widget.position.w || currentSize.h !== widget.position.h) {
                if (onResize) {
                    onResize(widget.id, currentSize);
                }
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'se-resize';

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
        };
    }, [isResizing, resizeStart, widget, onResize, currentSize]);

    const widgetStyle = {
        position: 'absolute',
        left: `${currentPosition.x * 25}%`,
        top: `${currentPosition.y * 96}px`,
        width: `${currentSize.w * 25 - 2}%`,
        height: `${currentSize.h * 96 - 16}px`,
        transition: (isDragging || isResizing) ? 'none' : 'all 300ms ease',
        cursor: editMode ? 'grab' : 'default',
        zIndex: (isDragging || isResizing) ? 100 : 1
    };

    return (
        <div 
            ref={widgetRef}
            className={`glass-widget widget-${currentSize.w}x${currentSize.h} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
            style={widgetStyle}
            onMouseDown={handleMouseDown}
        >
            {editMode && (
                <>
                    <div className="widget-drag-handle" style={{ cursor: 'grab' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <circle cx="4" cy="4" r="1.5" opacity="0.6"/>
                            <circle cx="8" cy="4" r="1.5" opacity="0.6"/>
                            <circle cx="12" cy="4" r="1.5" opacity="0.6"/>
                            <circle cx="4" cy="8" r="1.5" opacity="0.6"/>
                            <circle cx="8" cy="8" r="1.5" opacity="0.6"/>
                            <circle cx="12" cy="8" r="1.5" opacity="0.6"/>
                            <circle cx="4" cy="12" r="1.5" opacity="0.6"/>
                            <circle cx="8" cy="12" r="1.5" opacity="0.6"/>
                            <circle cx="12" cy="12" r="1.5" opacity="0.6"/>
                        </svg>
                    </div>
                    <button 
                        className="widget-remove-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(widget.id);
                        }}
                    >
                        ×
                    </button>
                    <div 
                        className="widget-resize-handle"
                        onMouseDown={handleResizeStart}
                    />
                </>
            )}
            {children}
        </div>
    );
};