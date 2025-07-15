// ProfessionalMailWorking.jsx - Simple working version
const ProfessionalMailWorking = () => {
    console.log('ProfessionalMailWorking component loading...');
    
    // Simple state management without hooks first
    let activeTab = 'primary';
    let selectedEmail = null;
    let composing = false;
    
    const handleTabClick = (tab) => {
        console.log('Tab clicked:', tab);
        activeTab = tab;
        // Force re-render by updating the component
        const event = new CustomEvent('professionalMailUpdate');
        window.dispatchEvent(event);
    };
    
    const handleComposeClick = () => {
        console.log('Compose clicked');
        composing = true;
        const event = new CustomEvent('professionalMailUpdate');
        window.dispatchEvent(event);
    };
    
    const handleEmailClick = (email) => {
        console.log('Email clicked:', email);
        selectedEmail = email;
        const event = new CustomEvent('professionalMailUpdate');
        window.dispatchEvent(event);
    };
    
    // Mock email data
    const mockEmails = [
        {
            id: '1',
            unread: true,
            starred: false,
            important: true,
            sender: 'Sarah Johnson',
            subject: 'Maintenance Request - Unit 203',
            snippet: 'Hi, I wanted to report that the kitchen faucet is leaking...',
            time: '10:42 AM',
            hasAttachment: true,
            labels: [
                { color: '#4285f4', text: 'Sunset Apartments' },
                { color: '#ea4335', text: 'Urgent' }
            ],
            content: 'Hi there,\n\nI wanted to report that the kitchen faucet in unit 203 is leaking. It started yesterday and seems to be getting worse. Could someone please take a look at it?\n\nThanks,\nSarah Johnson\nUnit 203'
        },
        {
            id: '2',
            unread: true,
            starred: true,
            sender: 'Michael Chen',
            subject: 'Lease Renewal Question',
            snippet: 'I received the lease renewal notice and had a few questions...',
            time: '9:23 AM',
            labels: [
                { color: '#0f9d58', text: 'Downtown Plaza' },
                { color: '#f4b400', text: 'Leases' }
            ],
            content: 'Dear Management,\n\nI received the lease renewal notice and had a few questions about the terms. Could we schedule a call to discuss the details?\n\nBest regards,\nMichael Chen'
        }
    ];
    
    // Mock notes data
    const mockNotes = [
        {
            id: '1',
            title: 'Maintenance Schedule',
            content: 'Remember to schedule quarterly HVAC maintenance for all units.',
            property: 'Sunset Apartments',
            priority: 'high',
            created: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Lease Renewal Reminders',
            content: 'Send lease renewal notices 90 days before expiration.',
            property: 'Downtown Plaza',
            priority: 'medium',
            created: new Date().toISOString()
        }
    ];
    
    const renderEmailList = () => {
        if (activeTab === 'notes') {
            return (
                <div className="notes-section">
                    <div className="notes-header">
                        <h3>Notes</h3>
                        <button 
                            className="add-note-btn"
                            onClick={() => {
                                console.log('Add Note clicked');
                                alert('Add Note clicked!');
                            }}
                        >
                            <i className="fas fa-plus"></i>
                            Add Note
                        </button>
                    </div>
                    <div className="notes-list">
                        {mockNotes.map(note => (
                            <div key={note.id} className="note-item">
                                <div className="note-header">
                                    <h4 className="note-title">{note.title}</h4>
                                    <div className="note-meta">
                                        <span className="note-priority" style={{ color: note.priority === 'high' ? '#ef4444' : '#f59e0b' }}>
                                            <i className="fas fa-circle"></i>
                                            {note.priority}
                                        </span>
                                        <button 
                                            className="delete-note-btn"
                                            onClick={() => {
                                                console.log('Delete note clicked');
                                                alert('Delete note clicked!');
                                            }}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="note-content">
                                    <p>{note.content}</p>
                                </div>
                                <div className="note-footer">
                                    <span className="note-property">
                                        <i className="fas fa-building"></i>
                                        {note.property}
                                    </span>
                                    <span className="note-date">
                                        {new Date(note.created).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        
        return (
            <div className="email-items">
                {mockEmails.map(email => (
                    <div 
                        key={email.id} 
                        className={`email-item ${email.unread ? 'unread' : ''} ${selectedEmail?.id === email.id ? 'selected' : ''}`}
                        onClick={() => handleEmailClick(email)}
                    >
                        <div className="email-controls">
                            <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                            <button 
                                className="star-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Star clicked for:', email.id);
                                    alert('Star clicked!');
                                }}
                            >
                                <i className={`${email.starred ? 'fas' : 'far'} fa-star`}></i>
                            </button>
                            {email.important && (
                                <span className="importance-marker">
                                    <i className="fas fa-bookmark"></i>
                                </span>
                            )}
                        </div>
                        
                        <div className="email-content">
                            <div className="email-header">
                                <span className="sender">{email.sender}</span>
                                {email.labels && email.labels.map((label, idx) => (
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
                                <span className="subject">{email.subject}</span>
                                <span className="snippet"> - {email.snippet}</span>
                            </div>
                        </div>
                        
                        <div className="email-meta">
                            {email.hasAttachment && <i className="fas fa-paperclip attachment-icon"></i>}
                            <span className="time">{email.time}</span>
                            <button 
                                className="delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Delete clicked for:', email.id);
                                    alert('Delete clicked!');
                                }}
                                style={{marginLeft: '8px', opacity: 0.6}}
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };
    
    const renderEmailViewer = () => {
        if (!selectedEmail) {
            return (
                <div className="email-viewer">
                    <div className="viewer-placeholder">
                        <i className="fas fa-envelope-open" style={{fontSize: '48px', color: '#dadce0', marginBottom: '16px'}}></i>
                        <p style={{color: '#5f6368', fontSize: '16px'}}>Select an email to read</p>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="email-viewer">
                <div className="email-header-full">
                    <div className="email-actions">
                        <button className="action-btn" title="Archive">
                            <i className="fas fa-archive"></i>
                        </button>
                        <button className="action-btn" title="Delete" onClick={() => {
                            console.log('Delete email clicked');
                            alert('Delete email clicked!');
                        }}>
                            <i className="fas fa-trash"></i>
                        </button>
                        <button className="action-btn" title="More">
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
                
                <div className="email-content-full">
                    <div className="email-subject-full">
                        <h2>{selectedEmail.subject}</h2>
                    </div>
                    
                    <div className="email-meta-full">
                        <div className="sender-info">
                            <div className="sender-avatar">
                                {selectedEmail.sender.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="sender-details">
                                <div className="sender-name">{selectedEmail.sender}</div>
                            </div>
                        </div>
                        <div className="email-time-full">
                            {selectedEmail.time}
                        </div>
                    </div>
                    
                    <div className="email-body-full">
                        <div className="email-text">
                            {selectedEmail.content.split('\n').map((line, idx) => (
                                <p key={idx}>{line}</p>
                            ))}
                        </div>
                    </div>
                    
                    <div className="email-actions-full">
                        <button className="reply-btn" onClick={() => {
                            console.log('Reply clicked');
                            alert('Reply clicked!');
                        }}>
                            <i className="fas fa-reply"></i>
                            Reply
                        </button>
                        <button className="reply-all-btn" onClick={() => {
                            console.log('Reply All clicked');
                            alert('Reply All clicked!');
                        }}>
                            <i className="fas fa-reply-all"></i>
                            Reply all
                        </button>
                        <button className="forward-btn" onClick={() => {
                            console.log('Forward clicked');
                            alert('Forward clicked!');
                        }}>
                            <i className="fas fa-share"></i>
                            Forward
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    console.log('ProfessionalMailWorking about to render');
    
    return (
        <div className="professional-mail">
            {/* Clean Header like Gmail */}
            <div className="mail-header">
                <div className="header-left">
                    <button className="menu-btn" onClick={() => {
                        console.log('Menu clicked');
                        alert('Menu clicked!');
                    }}>
                        <i className="fas fa-bars"></i>
                    </button>
                    <h1 className="mail-title">Mail</h1>
                </div>
                
                <div className="mail-search">
                    <div className="search-container">
                        <button className="search-icon" onClick={() => {
                            console.log('Search clicked');
                            alert('Search clicked!');
                        }}>
                            <i className="fas fa-search"></i>
                        </button>
                        <input 
                            type="text" 
                            placeholder="Search mail"
                            className="search-input"
                            onChange={(e) => console.log('Search:', e.target.value)}
                        />
                        <button className="search-options" onClick={() => {
                            console.log('Search options clicked');
                            alert('Search options clicked!');
                        }}>
                            <i className="fas fa-sliders-h"></i>
                        </button>
                    </div>
                </div>
                
                <div className="header-right">
                    <button className="header-btn" onClick={() => {
                        console.log('Settings clicked');
                        alert('Settings clicked!');
                    }}>
                        <i className="fas fa-cog"></i>
                    </button>
                    <div className="user-avatar">JA</div>
                </div>
            </div>
            
            {/* Main Container */}
            <div className="mail-container">
                {/* Professional Sidebar */}
                <div className="mail-sidebar">
                    <button className="compose-btn" onClick={handleComposeClick}>
                        <i className="fas fa-plus"></i>
                        Compose
                    </button>
                    
                    <div className="folder-list">
                        <div className="folder-item active">
                            <i className="fas fa-inbox"></i>
                            <span>Inbox</span>
                            <span className="count">127</span>
                        </div>
                        <div className="folder-item">
                            <i className="fas fa-star"></i>
                            <span>Starred</span>
                        </div>
                        <div className="folder-item">
                            <i className="fas fa-paper-plane"></i>
                            <span>Sent</span>
                        </div>
                        <div className="folder-item">
                            <i className="fas fa-file"></i>
                            <span>Drafts</span>
                            <span className="count">3</span>
                        </div>
                    </div>
                </div>
                
                {/* Email List */}
                <div className="mail-list">
                    {/* Toolbar */}
                    <div className="list-toolbar">
                        <div className="toolbar-section">
                            <input type="checkbox" className="select-all" />
                            <button className="toolbar-btn" onClick={() => {
                                console.log('Refresh clicked');
                                alert('Refresh clicked!');
                            }}>
                                <i className="fas fa-redo"></i>
                            </button>
                            <button className="toolbar-btn" onClick={() => {
                                console.log('More actions clicked');
                                alert('More actions clicked!');
                            }}>
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
                        </div>
                    </div>
                    
                    {/* Tab Bar */}
                    <div className="tab-bar">
                        <div 
                            className={`tab ${activeTab === 'primary' ? 'active' : ''}`}
                            onClick={() => handleTabClick('primary')}
                        >
                            <i className="fas fa-inbox"></i>
                            Primary
                        </div>
                        <div 
                            className={`tab ${activeTab === 'promotions' ? 'active' : ''}`}
                            onClick={() => handleTabClick('promotions')}
                        >
                            <i className="fas fa-tag"></i>
                            Promotions
                        </div>
                        <div 
                            className={`tab ${activeTab === 'updates' ? 'active' : ''}`}
                            onClick={() => handleTabClick('updates')}
                        >
                            <i className="fas fa-users"></i>
                            Updates
                        </div>
                        <div 
                            className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                            onClick={() => handleTabClick('notes')}
                        >
                            <i className="fas fa-sticky-note"></i>
                            Notes
                        </div>
                    </div>
                    
                    {/* Email Items */}
                    {renderEmailList()}
                </div>
                
                {/* Email Content Panel */}
                <div className="mail-content">
                    {renderEmailViewer()}
                </div>
            </div>
            
            {/* Compose Window */}
            {composing && (
                <div className="compose-window">
                    <div className="compose-header">
                        <span>New Message</span>
                        <div className="compose-actions">
                            <button onClick={() => {
                                console.log('Close compose clicked');
                                composing = false;
                                alert('Close compose clicked!');
                            }}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="compose-recipients">
                        <div className="recipient-row">
                            <span className="field-label">To</span>
                            <input 
                                type="text" 
                                placeholder="Recipients"
                                onChange={(e) => console.log('To:', e.target.value)}
                            />
                        </div>
                        <div className="recipient-row">
                            <input 
                                type="text" 
                                className="subject-input"
                                placeholder="Subject"
                                onChange={(e) => console.log('Subject:', e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="compose-editor">
                        <textarea 
                            className="compose-content"
                            placeholder="Compose email"
                            onChange={(e) => console.log('Content:', e.target.value)}
                        />
                    </div>
                    
                    <div className="compose-footer">
                        <button className="send-btn" onClick={() => {
                            console.log('Send clicked');
                            alert('Send clicked!');
                        }}>
                            Send
                        </button>
                        <button className="compose-delete" onClick={() => {
                            console.log('Delete draft clicked');
                            alert('Delete draft clicked!');
                        }}>
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Register component globally
if (typeof window !== 'undefined') {
    window.AppModules = window.AppModules || {};
    window.AppModules.ProfessionalMailWorking = ProfessionalMailWorking;
}