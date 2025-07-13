const SearchBar = ({ onSearch, placeholder = "Search anything..." }) => {
    const [query, setQuery] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);
    const [showCommand, setShowCommand] = React.useState(false);
    
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommand(true);
            }
            if (e.key === 'Escape') {
                setShowCommand(false);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearch = (e) => {
        setQuery(e.target.value);
        if (onSearch) onSearch(e.target.value);
    };

    return (
        <>
            <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
                <Icons.Search />
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="search-input"
                />
                <kbd className="search-shortcut">
                    <Icons.Command /> K
                </kbd>
            </div>

            {showCommand && (
                <div className="command-palette-overlay" onClick={() => setShowCommand(false)}>
                    <div className="command-palette" onClick={e => e.stopPropagation()}>
                        <div className="command-header">
                            <Icons.Search />
                            <input
                                type="text"
                                placeholder="Type a command or search..."
                                className="command-input"
                                autoFocus
                            />
                        </div>
                        <div className="command-sections">
                            <div className="command-section">
                                <div className="command-section-title">Quick Actions</div>
                                <div className="command-item">
                                    <Icons.Plus />
                                    <span>New Property</span>
                                    <kbd>P</kbd>
                                </div>
                                <div className="command-item">
                                    <Icons.Users />
                                    <span>Add Tenant</span>
                                    <kbd>T</kbd>
                                </div>
                                <div className="command-item">
                                    <Icons.Document />
                                    <span>Create Lease</span>
                                    <kbd>L</kbd>
                                </div>
                            </div>
                            <div className="command-section">
                                <div className="command-section-title">Navigate</div>
                                <div className="command-item">
                                    <Icons.Dashboard />
                                    <span>Dashboard</span>
                                </div>
                                <div className="command-item">
                                    <Icons.Building />
                                    <span>Properties</span>
                                </div>
                                <div className="command-item">
                                    <Icons.Dollar />
                                    <span>Payments</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};