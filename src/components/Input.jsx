const Input = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    error,
    helper,
    required = false,
    disabled = false,
    autoComplete,
    className = ''
}) => {
    return (
        <div className="input-group">
            {label && (
                <label htmlFor={name} className="input-label">
                    {label}
                    {required && <span style={{ color: 'var(--color-error)' }}> *</span>}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                autoComplete={autoComplete}
                className={`input-field ${error ? 'input-error' : ''} ${className}`}
            />
            {error && <div className="input-error-message">{error}</div>}
            {helper && !error && <div className="input-helper">{helper}</div>}
        </div>
    );
};