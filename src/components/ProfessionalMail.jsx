// ProfessionalMail.jsx - Clean, Light, Professional
const ProfessionalMail = () => {
    const [selectedFolder, setSelectedFolder] = React.useState('inbox');
    const [selectedEmails, setSelectedEmails] = React.useState([]);
    const [composing, setComposing] = React.useState(false);
    const [emailView, setEmailView] = React.useState('comfortable'); // comfortable, compact, spacious
    
    return (
        <div className="professional-mail">
            {/* Clean Header like Gmail */}
            <div className="mail-header">
                <div className="header-left">
                    <button className="menu-btn">
                        <i className="fas fa-bars"></i>
                    </button>
                    <img src="/logo.png" alt="PropertyPro" className="mail-logo" />
                    <h1 className="mail-title">Mail</h1>
                </div>
                
                <div className="mail-search">
                    <div className="search-container">
                        <button className="search-icon">
                            <i className="fas fa-search"></i>
                        </button>
                        <input 
                            type="text" 
                            placeholder="Search mail"
                            className="search-input"
                        />
                        <button className="search-options">
                            <i className="fas fa-sliders-h"></i>
                        </button>
                    </div>
                </div>
                
                <div className="header-right">
                    <button className="header-btn">
                        <i className="fas fa-question-circle"></i>
                    </button>
                    <button className="header-btn">
                        <i className="fas fa-cog"></i>
                    </button>
                    <button className="header-btn">
                        <i className="fas fa-th"></i>
                    </button>
                    <div className="user-avatar">JA</div>
                </div>
            </div>
            
            {/* Main Container */}
            <div className="mail-container">
                {/* Professional Sidebar */}
                <div className="mail-sidebar">
                    <button className="compose-btn" onClick={() => setComposing(true)}>
                        <i className="fas fa-plus"></i>
                        Compose
                    </button>
                    
                    <div className="folder-list">
                        <FolderItem
                            icon="fa-inbox"
                            label="Inbox"
                            count={127}
                            active={selectedFolder === 'inbox'}
                            onClick={() => setSelectedFolder('inbox')}
                        />
                        <FolderItem
                            icon="fa-star"
                            label="Starred"
                            active={selectedFolder === 'starred'}
                            onClick={() => setSelectedFolder('starred')}
                        />
                        <FolderItem
                            icon="fa-clock"
                            label="Snoozed"
                            active={selectedFolder === 'snoozed'}
                            onClick={() => setSelectedFolder('snoozed')}
                        />
                        <FolderItem
                            icon="fa-paper-plane"
                            label="Sent"
                            active={selectedFolder === 'sent'}
                            onClick={() => setSelectedFolder('sent')}
                        />
                        <FolderItem
                            icon="fa-file"
                            label="Drafts"
                            count={3}
                            active={selectedFolder === 'drafts'}
                            onClick={() => setSelectedFolder('drafts')}
                        />
                        
                        <div className="folder-section">
                            <h4>Property Labels</h4>
                            <PropertyLabel
                                color="#4285f4"
                                label="Sunset Apartments"
                                count={45}
                            />
                            <PropertyLabel
                                color="#0f9d58"
                                label="Downtown Plaza"
                                count={23}
                            />
                            <PropertyLabel
                                color="#f4b400"
                                label="Garden Complex"
                                count={18}
                            />
                        </div>
                        
                        <div className="folder-section">
                            <h4>Categories</h4>
                            <CategoryLabel
                                icon="fa-users"
                                label="Tenants"
                                count={89}
                            />
                            <CategoryLabel
                                icon="fa-home"
                                label="Owners"
                                count={34}
                            />
                            <CategoryLabel
                                icon="fa-tools"
                                label="Maintenance"
                                count={56}
                            />
                            <CategoryLabel
                                icon="fa-file-contract"
                                label="Leases"
                                count={12}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Email List */}
                <div className="mail-list">
                    {/* Toolbar */}
                    <div className="list-toolbar">
                        <div className="toolbar-section">
                            <input type="checkbox" className="select-all" />
                            <button className="toolbar-btn dropdown">
                                <i className="fas fa-caret-down"></i>
                            </button>
                            <button className="toolbar-btn">
                                <i className="fas fa-redo"></i>
                            </button>
                            <button className="toolbar-btn">
                                <i className="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                        
                        <div className="toolbar-section">
                            <span className="email-count">1-50 of 843</span>
                            <button className="toolbar-btn">
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <button className="toolbar-btn">
                                <i className="fas fa-chevron-right"></i>
                            </button>
                            <button className="toolbar-btn dropdown">
                                <i className="fas fa-keyboard"></i>
                            </button>
                        </div>
                    </div>
                    
                    {/* Tab Bar */}
                    <div className="tab-bar">
                        <div className="tab active">
                            <i className="fas fa-inbox"></i>
                            Primary
                        </div>
                        <div className="tab">
                            <i className="fas fa-tag"></i>
                            Promotions
                        </div>
                        <div className="tab">
                            <i className="fas fa-users"></i>
                            Updates
                        </div>
                    </div>
                    
                    {/* Email Items */}
                    <div className="email-items">
                        <EmailItem
                            unread={true}
                            starred={false}
                            important={true}
                            sender="Sarah Johnson"
                            subject="Maintenance Request - Unit 203"
                            snippet="Hi, I wanted to report that the kitchen faucet is leaking. It started yesterday and seems to be getting worse..."
                            time="10:42 AM"
                            hasAttachment={true}
                            labels={[
                                { color: '#4285f4', text: 'Sunset Apartments' },
                                { color: '#ea4335', text: 'Urgent' }
                            ]}
                        />
                        
                        <EmailItem
                            unread={true}
                            starred={true}
                            sender="Michael Chen"
                            subject="Lease Renewal Question"
                            snippet="I received the lease renewal notice and had a few questions about the terms. Could we schedule a call to discuss..."
                            time="9:23 AM"
                            labels={[
                                { color: '#0f9d58', text: 'Downtown Plaza' },
                                { color: '#f4b400', text: 'Leases' }
                            ]}
                        />
                        
                        <EmailItem
                            unread={false}
                            starred={false}
                            sender="Property Owner - Smith Trust"
                            subject="Monthly Statement Ready"
                            snippet="Your monthly property management statement for October 2024 is now available. Total collected rent: $45,320..."
                            time="Yesterday"
                            hasAttachment={true}
                            labels={[
                                { color: '#673ab7', text: 'Owners' },
                                { color: '#4285f4', text: 'Financial' }
                            ]}
                        />
                    </div>
                </div>
                
                {/* Email Content Panel */}
                <div className="mail-content">
                    <EmailViewer />
                </div>
            </div>
            
            {/* Compose Window */}
            {composing && <ComposeWindow onClose={() => setComposing(false)} />}
        </div>
    );
};

// Folder Item Component
const FolderItem = ({ icon, label, count, active, onClick }) => {
    return (
        <div className={`folder-item ${active ? 'active' : ''}`} onClick={onClick}>
            <i className={`fas ${icon}`}></i>
            <span>{label}</span>
            {count && <span className="count">{count}</span>}
        </div>
    );
};

// Property Label Component
const PropertyLabel = ({ color, label, count }) => {
    return (
        <div className="property-label" style={{ '--label-color': color }}>
            <span>{label}</span>
            {count && <span className="count">{count}</span>}
        </div>
    );
};

// Category Label Component
const CategoryLabel = ({ icon, label, count }) => {
    return (
        <div className="category-label">
            <i className={`fas ${icon}`}></i>
            <span>{label}</span>
            {count && <span className="count">{count}</span>}
        </div>
    );
};

// Email Item Component
const EmailItem = ({ unread, starred, important, sender, subject, snippet, time, hasAttachment, labels }) => {
    return (
        <div className={`email-item ${unread ? 'unread' : ''}`}>
            <div className="email-controls">
                <input type="checkbox" />
                <button className="star-btn">
                    <i className={`${starred ? 'fas' : 'far'} fa-star`}></i>
                </button>
                {important && (
                    <span className="importance-marker">
                        <i className="fas fa-bookmark"></i>
                    </span>
                )}
            </div>
            
            <div className="email-content">
                <div className="email-header">
                    <span className="sender">{sender}</span>
                    {labels && labels.map((label, idx) => (
                        <span 
                            key={idx} 
                            className="email-label"
                            style={{backgroundColor: label.color}}
                        >
                            {label.text}
                        </span>
                    ))}
                </div>
                
                <div className="email-body">
                    <span className="subject">{subject}</span>
                    <span className="snippet"> - {snippet}</span>
                </div>
            </div>
            
            <div className="email-meta">
                {hasAttachment && <i className="fas fa-paperclip attachment-icon"></i>}
                <span className="time">{time}</span>
            </div>
        </div>
    );
};

// Email Viewer Component
const EmailViewer = () => {
    return (
        <div className="email-viewer">
            <div className="viewer-placeholder">
                <i className="fas fa-envelope-open" style={{fontSize: '48px', color: '#dadce0', marginBottom: '16px'}}></i>
                <p style={{color: '#5f6368', fontSize: '16px'}}>Select an email to read</p>
            </div>
        </div>
    );
};

// Professional Compose Window
const ComposeWindow = ({ onClose }) => {
    const [to, setTo] = React.useState('');
    const [subject, setSubject] = React.useState('');
    const [content, setContent] = React.useState('');
    const [showCc, setShowCc] = React.useState(false);
    
    return (
        <div className="compose-window">
            <div className="compose-header">
                <span>New Message</span>
                <div className="compose-actions">
                    <button><i className="fas fa-minus"></i></button>
                    <button><i className="fas fa-expand"></i></button>
                    <button onClick={onClose}><i className="fas fa-times"></i></button>
                </div>
            </div>
            
            <div className="compose-recipients">
                <div className="recipient-row">
                    <span className="field-label">To</span>
                    <input 
                        type="text" 
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        placeholder="Recipients"
                    />
                    <button onClick={() => setShowCc(!showCc)}>Cc Bcc</button>
                </div>
                
                {showCc && (
                    <>
                        <div className="recipient-row">
                            <span className="field-label">Cc</span>
                            <input type="text" />
                        </div>
                        <div className="recipient-row">
                            <span className="field-label">Bcc</span>
                            <input type="text" />
                        </div>
                    </>
                )}
                
                <div className="recipient-row">
                    <input 
                        type="text" 
                        className="subject-input"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="compose-editor">
                <div className="editor-toolbar">
                    <button><i className="fas fa-bold"></i></button>
                    <button><i className="fas fa-italic"></i></button>
                    <button><i className="fas fa-underline"></i></button>
                    <button><i className="fas fa-text-height"></i></button>
                    <button><i className="fas fa-palette"></i></button>
                    <button><i className="fas fa-link"></i></button>
                    <button><i className="fas fa-list-ol"></i></button>
                    <button><i className="fas fa-list-ul"></i></button>
                    <button><i className="fas fa-quote-right"></i></button>
                    <button><i className="fas fa-align-left"></i></button>
                    <button><i className="fas fa-align-center"></i></button>
                    <button><i className="fas fa-align-right"></i></button>
                </div>
                
                <textarea 
                    className="compose-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Compose email"
                />
            </div>
            
            <div className="compose-footer">
                <button className="send-btn">
                    Send
                    <i className="fas fa-caret-down"></i>
                </button>
                
                <div className="compose-tools">
                    <button><i className="fas fa-text-height"></i></button>
                    <button><i className="fas fa-paperclip"></i></button>
                    <button><i className="fas fa-link"></i></button>
                    <button><i className="fas fa-smile"></i></button>
                    <button><i className="fas fa-image"></i></button>
                    <button><i className="fas fa-lock"></i></button>
                    <button><i className="fas fa-pen"></i></button>
                </div>
                
                <button className="compose-more">
                    <i className="fas fa-ellipsis-v"></i>
                </button>
                
                <button className="compose-delete">
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

// Register component globally
if (typeof window !== 'undefined') {
    window.AppModules = window.AppModules || {};
    window.AppModules.ProfessionalMail = ProfessionalMail;
}