const Sidebar = ({ menuItems, activePage, onPageChange }) => {
    const [expandedSections, setExpandedSections] = React.useState({});

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const renderMenuItem = (item, parentId = '') => {
        const itemId = parentId ? `${parentId}-${item.id}` : item.id;
        const isActive = activePage === itemId;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedSections[itemId];

        return (
            <div key={itemId} className="sidebar-item">
                <div
                    className={`sidebar-link ${isActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
                    onClick={() => {
                        if (hasChildren) {
                            toggleSection(itemId);
                        } else {
                            onPageChange(itemId);
                        }
                    }}
                >
                    <div className="sidebar-link-content">
                        {item.icon && <span className="sidebar-icon">{item.icon}</span>}
                        <span className="sidebar-label">{item.label}</span>
                    </div>
                    {hasChildren && (
                        <svg
                            className={`sidebar-chevron ${isExpanded ? 'expanded' : ''}`}
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                        >
                            <path
                                d="M6 4L10 8L6 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </div>
                {hasChildren && isExpanded && (
                    <div className="sidebar-submenu">
                        {item.children.map(child => renderMenuItem(child, itemId))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="var(--color-brand)" />
                        <path d="M24 12L12 20V36H20V28H28V36H36V20L24 12Z" fill="white" />
                    </svg>
                    <span className="sidebar-title">Property Pro</span>
                </div>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map(item => renderMenuItem(item))}
            </nav>
        </aside>
    );
};