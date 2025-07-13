const Card = ({ 
    title, 
    children, 
    hoverable = false,
    className = '',
    style = {}
}) => {
    const classes = [
        'card',
        hoverable && 'card-hover',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} style={style}>
            {title && <h3 className="card-title">{title}</h3>}
            <div className="card-content">
                {children}
            </div>
        </div>
    );
};