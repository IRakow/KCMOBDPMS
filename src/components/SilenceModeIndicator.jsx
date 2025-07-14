// SilenceModeIndicator.jsx - Visual indicator for silence mode
const SilenceModeIndicator = () => {
    const [silenceMode, setSilenceMode] = React.useState(window.silenceMode === true);
    const [showTooltip, setShowTooltip] = React.useState(false);

    React.useEffect(() => {
        const handleSilenceModeChange = (event) => {
            setSilenceMode(event.detail);
            // Show tooltip briefly when mode changes
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 3000);
        };

        window.addEventListener('silenceModeChanged', handleSilenceModeChange);
        return () => window.removeEventListener('silenceModeChanged', handleSilenceModeChange);
    }, []);

    if (!silenceMode) return null;

    return React.createElement('div', { 
        className: 'silence-mode-indicator',
        onMouseEnter: () => setShowTooltip(true),
        onMouseLeave: () => setShowTooltip(false)
    }, [
        React.createElement('i', { 
            key: 'icon',
            className: 'fas fa-volume-mute'
        }),
        showTooltip && React.createElement('div', {
            key: 'tooltip',
            className: 'silence-mode-tooltip'
        }, 'Silence Mode Active - Voice features disabled')
    ]);
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.SilenceModeIndicator = SilenceModeIndicator;