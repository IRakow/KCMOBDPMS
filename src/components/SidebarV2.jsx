const SidebarV2 = ({ menuItems, activePage, onPageChange, collapsed }) => {
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
        const Icon = item.icon;

        return (
            <div key={itemId} className="nav-item">
                <button
                    className={`nav-link ${isActive ? 'active' : ''} ${hasChildren ? 'has-children' : ''}`}
                    onClick={() => {
                        if (hasChildren) {
                            toggleSection(itemId);
                        } else {
                            onPageChange(itemId);
                        }
                    }}
                    title={collapsed ? item.label : ''}
                >
                    <div className="nav-link-content">
                        {Icon && (
                            <span className="nav-icon">
                                <Icon />
                            </span>
                        )}
                        {!collapsed && <span className="nav-label">{item.label}</span>}
                    </div>
                    {hasChildren && !collapsed && (
                        <Icons.ChevronDown 
                            style={{
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 200ms ease'
                            }}
                        />
                    )}
                </button>
                
                {hasChildren && isExpanded && !collapsed && (
                    <div className="nav-submenu">
                        {item.children.map(child => (
                            <button
                                key={child.id}
                                className={`nav-sublink ${activePage === `${item.id}-${child.id}` ? 'active' : ''}`}
                                onClick={() => onPageChange(`${item.id}-${child.id}`)}
                            >
                                {child.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="nav-menu">
            {menuItems.map(item => renderMenuItem(item))}
        </div>
    );
};