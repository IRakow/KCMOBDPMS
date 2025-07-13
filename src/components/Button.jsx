const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false,
    block = false,
    onClick,
    type = 'button',
    className = ''
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        size !== 'md' && `btn-${size}`,
        block && 'btn-block',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading ? <span className="loading-spinner"></span> : children}
        </button>
    );
};