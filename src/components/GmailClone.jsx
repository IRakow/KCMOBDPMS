// GmailClone.jsx - Exact Gmail Replica for Property Management
const GmailClone = () => {
    console.log('GmailClone component loading...');
    
    // Component State
    const state = {
        activeTab: 'primary',
        selectedEmail: null,
        emails: [],
        loading: false,
        composing: false,
        sidebarCollapsed: false,
        selectedEmails: new Set(),
        searchQuery: '',
        notes: [],
        showNoteForm: false,
        currentUser: { name: 'Property Manager', email: 'manager@property.com' }
    };
    
    // Update component
    const updateComponent = () => {
        const container = document.querySelector('.gmail-clone-container');
        if (container) {
            container.innerHTML = '';
            const newElement = React.createElement(GmailClone);
            ReactDOM.render(newElement, container);
        }
    };
    
    // Mock Data
    const mockEmails = {
        primary: [
            {
                id: '1',
                from: 'Sarah Johnson',
                fromEmail: 'sarah.johnson@tenant.com',
                subject: 'Maintenance Request - Kitchen Faucet Leak',
                snippet: 'Hi, I wanted to report that the kitchen faucet in unit 203 is leaking. It started yesterday and seems to be getting worse...',
                body: 'Hi Property Management,\n\nI wanted to report that the kitchen faucet in unit 203 is leaking. It started yesterday and seems to be getting worse. Could someone please take a look at it as soon as possible?\n\nThe leak is coming from the base of the faucet and is causing water to pool on the counter.\n\nThanks,\nSarah Johnson\nUnit 203\nPhone: (555) 123-4567',
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                isRead: false,
                isStarred: false,
                isImportant: true,
                labels: ['Property: Sunset Apartments', 'Priority: High', 'Category: Maintenance'],
                hasAttachments: false
            },
            {
                id: '2',
                from: 'Michael Chen',
                fromEmail: 'michael.chen@tenant.com',
                subject: 'Lease Renewal Question',
                snippet: 'I received the lease renewal notice and had a few questions about the terms. Could we schedule a call to discuss...',
                body: 'Dear Property Management,\n\nI received the lease renewal notice and had a few questions about the terms. Could we schedule a call to discuss the details?\n\nSpecifically, I wanted to ask about:\n1. The rent increase percentage\n2. The new lease term options\n3. Any changes to the amenities\n\nPlease let me know your availability.\n\nBest regards,\nMichael Chen\nUnit 105\nPhone: (555) 987-6543',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                isRead: false,
                isStarred: true,
                isImportant: false,
                labels: ['Property: Downtown Plaza', 'Category: Leases'],
                hasAttachments: true
            },
            {
                id: '3',
                from: 'Jennifer Williams',
                fromEmail: 'jennifer.williams@owner.com',
                subject: 'Monthly Property Report Review',
                snippet: 'Thank you for the detailed monthly report. I have a few questions about the vacancy rates and maintenance costs...',
                body: 'Hi Team,\n\nThank you for the detailed monthly report. I have a few questions about the vacancy rates and maintenance costs.\n\nCould you provide more details on:\n- The increase in maintenance requests\n- Current marketing efforts for vacant units\n- Projected rental income for next month\n\nI\'d like to schedule a call to discuss these items in detail.\n\nBest,\nJennifer Williams\nProperty Owner - Garden Complex',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
                isRead: true,
                isStarred: false,
                isImportant: false,
                labels: ['Property: Garden Complex', 'Category: Reports'],
                hasAttachments: true
            }
        ],
        updates: [
            {
                id: '4',
                from: 'Property Management System',
                fromEmail: 'system@property.com',
                subject: 'Monthly Financial Report Generated',
                snippet: 'Your monthly financial report for October 2024 has been generated and is ready for review...',
                body: 'Your monthly financial report for October 2024 has been generated and is ready for review.\n\nReport Summary:\n- Total Rent Collected: $45,320\n- Maintenance Expenses: $3,240\n- Vacancy Rate: 3.2%\n- Net Operating Income: $42,080\n\nThe full report is attached to this email.',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
                isRead: true,
                isStarred: false,
                isImportant: false,
                labels: ['Category: System', 'Type: Report'],
                hasAttachments: true
            }
        ],
        promotions: []
    };
    
    const mockNotes = [
        {
            id: 'note1',
            title: 'Quarterly HVAC Maintenance',
            content: 'Schedule HVAC maintenance for all units in Sunset Apartments. Contact preferred vendor: ABC HVAC Services (555) 111-2222',
            property: 'Sunset Apartments',
            priority: 'high',
            created: new Date(Date.now() - 1000 * 60 * 60 * 2),
            tags: ['maintenance', 'hvac', 'quarterly']
        },
        {
            id: 'note2',
            title: 'Lease Renewal Campaign',
            content: 'Send lease renewal notices to tenants 90 days before expiration. Prepare incentive packages for long-term tenants.',
            property: 'All Properties',
            priority: 'medium',
            created: new Date(Date.now() - 1000 * 60 * 60 * 24),
            tags: ['leases', 'renewal', 'campaign']
        },
        {
            id: 'note3',
            title: 'Vendor Performance Review',
            content: 'Review performance of current maintenance vendors. Consider new contracts for landscaping and cleaning services.',
            property: 'Multiple Properties',
            priority: 'low',
            created: new Date(Date.now() - 1000 * 60 * 60 * 48),
            tags: ['vendors', 'review', 'contracts']
        }
    ];
    
    // Initialize emails
    state.emails = mockEmails[state.activeTab] || [];
    state.notes = mockNotes;
    
    // Event Handlers
    const handleTabClick = (tab) => {
        console.log('Tab clicked:', tab);
        state.activeTab = tab;
        state.emails = mockEmails[tab] || [];
        state.selectedEmail = null;
        updateComponent();
    };
    
    const handleEmailClick = (email) => {
        console.log('Email clicked:', email);
        state.selectedEmail = email;
        if (!email.isRead) {
            email.isRead = true;
        }
        updateComponent();
    };
    
    const handleStarToggle = (email) => {
        console.log('Star toggled:', email);
        email.isStarred = !email.isStarred;
        updateComponent();
    };
    
    const handleEmailSelect = (email) => {
        if (state.selectedEmails.has(email.id)) {
            state.selectedEmails.delete(email.id);
        } else {
            state.selectedEmails.add(email.id);
        }
        updateComponent();
    };
    
    const handleCompose = () => {
        console.log('Compose clicked');
        state.composing = true;
        updateComponent();
    };
    
    const handleCloseCompose = () => {
        console.log('Close compose clicked');
        state.composing = false;
        updateComponent();
    };
    
    const handleSendEmail = () => {
        console.log('Send email clicked');
        alert('Email sent successfully!');
        state.composing = false;
        updateComponent();
    };
    
    const handleDeleteEmail = (email) => {
        console.log('Delete email:', email);
        state.emails = state.emails.filter(e => e.id !== email.id);
        if (state.selectedEmail?.id === email.id) {
            state.selectedEmail = null;
        }
        updateComponent();
    };
    
    const handleAddNote = (noteData) => {
        console.log('Add note:', noteData);
        const newNote = {
            id: 'note' + Date.now(),
            ...noteData,
            created: new Date(),
            tags: noteData.tags || []
        };
        state.notes.push(newNote);
        state.showNoteForm = false;
        updateComponent();
    };
    
    const handleDeleteNote = (noteId) => {
        console.log('Delete note:', noteId);
        state.notes = state.notes.filter(note => note.id !== noteId);
        updateComponent();
    };
    
    const formatTime = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    };
    
    // Render Functions
    const renderSidebar = () => {
        return (
            <div className="gmail-sidebar">
                <button 
                    className="compose-button"
                    onClick={handleCompose}
                >
                    <i className="fas fa-plus"></i>
                    <span>Compose</span>
                </button>
                
                <div className="sidebar-menu">
                    <div className="menu-item active">
                        <i className="fas fa-inbox"></i>
                        <span>Inbox</span>
                        <span className="count">127</span>
                    </div>
                    <div className="menu-item">
                        <i className="fas fa-star"></i>
                        <span>Starred</span>
                    </div>
                    <div className="menu-item">
                        <i className="fas fa-clock"></i>
                        <span>Snoozed</span>
                    </div>
                    <div className="menu-item">
                        <i className="fas fa-paper-plane"></i>
                        <span>Sent</span>
                    </div>
                    <div className="menu-item">
                        <i className="fas fa-file-alt"></i>
                        <span>Drafts</span>
                        <span className="count">3</span>
                    </div>
                    <div className="menu-item">
                        <i className="fas fa-tag"></i>
                        <span>Categories</span>
                    </div>
                </div>
                
                <div className="sidebar-section">
                    <h4>Property Labels</h4>
                    <div className="label-item">
                        <div className="label-dot" style={{backgroundColor: '#4285f4'}}></div>
                        <span>Sunset Apartments</span>
                        <span className="count">45</span>
                    </div>
                    <div className="label-item">
                        <div className="label-dot" style={{backgroundColor: '#0f9d58'}}></div>
                        <span>Downtown Plaza</span>
                        <span className="count">23</span>
                    </div>
                    <div className="label-item">
                        <div className="label-dot" style={{backgroundColor: '#f4b400'}}></div>
                        <span>Garden Complex</span>
                        <span className="count">18</span>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderEmailList = () => {
        if (state.activeTab === 'notes') {
            return renderNotesList();
        }
        
        return (
            <div className="email-list">
                <div className="email-toolbar">
                    <div className="toolbar-left">
                        <input 
                            type="checkbox" 
                            className="select-all"
                            onChange={(e) => {
                                if (e.target.checked) {
                                    state.emails.forEach(email => state.selectedEmails.add(email.id));
                                } else {
                                    state.selectedEmails.clear();
                                }
                                updateComponent();
                            }}
                        />
                        <button className="toolbar-btn" onClick={() => {
                            state.emails.forEach(email => {
                                if (state.selectedEmails.has(email.id)) {
                                    handleDeleteEmail(email);
                                }
                            });
                            state.selectedEmails.clear();
                        }}>
                            <i className="fas fa-trash"></i>
                        </button>
                        <button className="toolbar-btn">
                            <i className="fas fa-archive"></i>
                        </button>
                        <button className="toolbar-btn">
                            <i className="fas fa-ban"></i>
                        </button>
                        <button className="toolbar-btn">
                            <i className="fas fa-redo"></i>
                        </button>
                        <button className="toolbar-btn">
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                    <div className="toolbar-right">
                        <span className="email-count">1-{state.emails.length} of {state.emails.length}</span>
                        <button className="toolbar-btn">
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <button className="toolbar-btn">
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
                
                <div className="email-tabs">
                    <div 
                        className={`tab ${state.activeTab === 'primary' ? 'active' : ''}`}
                        onClick={() => handleTabClick('primary')}
                    >
                        <i className="fas fa-inbox"></i>
                        <span>Primary</span>
                    </div>
                    <div 
                        className={`tab ${state.activeTab === 'updates' ? 'active' : ''}`}
                        onClick={() => handleTabClick('updates')}
                    >
                        <i className="fas fa-users"></i>
                        <span>Updates</span>
                    </div>
                    <div 
                        className={`tab ${state.activeTab === 'promotions' ? 'active' : ''}`}
                        onClick={() => handleTabClick('promotions')}
                    >
                        <i className="fas fa-tag"></i>
                        <span>Promotions</span>
                    </div>
                    <div 
                        className={`tab ${state.activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => handleTabClick('notes')}
                    >
                        <i className="fas fa-sticky-note"></i>
                        <span>Notes</span>
                    </div>
                </div>
                
                <div className="email-items">
                    {state.emails.map(email => (
                        <div 
                            key={email.id}
                            className={`email-item ${!email.isRead ? 'unread' : ''} ${state.selectedEmail?.id === email.id ? 'selected' : ''}`}
                            onClick={() => handleEmailClick(email)}
                        >
                            <div className="email-controls">
                                <input 
                                    type="checkbox"
                                    checked={state.selectedEmails.has(email.id)}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleEmailSelect(email);
                                    }}
                                />
                                <button 
                                    className={`star-btn ${email.isStarred ? 'starred' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStarToggle(email);
                                    }}
                                >
                                    <i className={`${email.isStarred ? 'fas' : 'far'} fa-star`}></i>
                                </button>
                                {email.isImportant && (
                                    <div className="important-marker">
                                        <i className="fas fa-bookmark"></i>
                                    </div>
                                )}
                            </div>
                            
                            <div className="email-content">
                                <div className="email-header">
                                    <span className="sender">{email.from}</span>
                                    <div className="email-labels">
                                        {email.labels.map((label, idx) => (
                                            <span key={idx} className="email-label">{label}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="email-body">
                                    <span className="subject">{email.subject}</span>
                                    <span className="snippet"> - {email.snippet}</span>
                                </div>
                            </div>
                            
                            <div className="email-meta">
                                {email.hasAttachments && (
                                    <i className="fas fa-paperclip"></i>
                                )}
                                <span className="time">{formatTime(email.timestamp)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    const renderNotesList = () => {
        return (
            <div className="notes-container">
                <div className="notes-header">
                    <h3>Notes</h3>
                    <button 
                        className="add-note-btn"
                        onClick={() => {
                            state.showNoteForm = true;
                            updateComponent();
                        }}
                    >
                        <i className="fas fa-plus"></i>
                        Add Note
                    </button>
                </div>
                
                {state.showNoteForm && (
                    <div className="note-form">
                        <input 
                            type="text" 
                            placeholder="Note title..."
                            className="note-title-input"
                            id="noteTitle"
                        />
                        <textarea 
                            placeholder="Note content..."
                            className="note-content-input"
                            id="noteContent"
                            rows="4"
                        ></textarea>
                        <div className="note-form-meta">
                            <select className="note-property-select" id="noteProperty">
                                <option value="">Select Property</option>
                                <option value="Sunset Apartments">Sunset Apartments</option>
                                <option value="Downtown Plaza">Downtown Plaza</option>
                                <option value="Garden Complex">Garden Complex</option>
                                <option value="All Properties">All Properties</option>
                            </select>
                            <select className="note-priority-select" id="notePriority">
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                            </select>
                        </div>
                        <div className="note-form-actions">
                            <button 
                                className="save-note-btn"
                                onClick={() => {
                                    const title = document.getElementById('noteTitle').value;
                                    const content = document.getElementById('noteContent').value;
                                    const property = document.getElementById('noteProperty').value;
                                    const priority = document.getElementById('notePriority').value;
                                    
                                    if (title && content) {
                                        handleAddNote({
                                            title,
                                            content,
                                            property: property || 'General',
                                            priority
                                        });
                                    }
                                }}
                            >
                                Save Note
                            </button>
                            <button 
                                className="cancel-note-btn"
                                onClick={() => {
                                    state.showNoteForm = false;
                                    updateComponent();
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="notes-list">
                    {state.notes.map(note => (
                        <div key={note.id} className="note-item">
                            <div className="note-header">
                                <h4 className="note-title">{note.title}</h4>
                                <div className="note-actions">
                                    <span className={`note-priority priority-${note.priority}`}>
                                        <i className="fas fa-circle"></i>
                                        {note.priority}
                                    </span>
                                    <button 
                                        className="delete-note-btn"
                                        onClick={() => handleDeleteNote(note.id)}
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
                                    {formatTime(note.created)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    const renderEmailViewer = () => {
        if (!state.selectedEmail) {
            return (
                <div className="email-viewer">
                    <div className="empty-state">
                        <i className="fas fa-envelope-open"></i>
                        <h3>Select an email to read</h3>
                        <p>Choose an email from your inbox to view it here</p>
                    </div>
                </div>
            );
        }
        
        const email = state.selectedEmail;
        
        return (
            <div className="email-viewer">
                <div className="email-viewer-header">
                    <div className="viewer-actions">
                        <button className="viewer-btn" onClick={() => handleDeleteEmail(email)}>
                            <i className="fas fa-trash"></i>
                        </button>
                        <button className="viewer-btn">
                            <i className="fas fa-archive"></i>
                        </button>
                        <button className="viewer-btn">
                            <i className="fas fa-ban"></i>
                        </button>
                        <button className="viewer-btn">
                            <i className="fas fa-folder"></i>
                        </button>
                        <button className="viewer-btn">
                            <i className="fas fa-tag"></i>
                        </button>
                        <button className="viewer-btn">
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
                
                <div className="email-viewer-content">
                    <div className="email-subject">
                        <h2>{email.subject}</h2>
                        <div className="email-labels">
                            {email.labels.map((label, idx) => (
                                <span key={idx} className="email-label">{label}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="email-details">
                        <div className="sender-info">
                            <div className="sender-avatar">
                                {email.from.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="sender-details">
                                <div className="sender-name">{email.from}</div>
                                <div className="sender-email">&lt;{email.fromEmail}&gt;</div>
                                <div className="email-time">
                                    {email.timestamp.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        
                        <div className="email-actions">
                            <button className="action-btn" onClick={() => handleStarToggle(email)}>
                                <i className={`${email.isStarred ? 'fas' : 'far'} fa-star`}></i>
                            </button>
                            <button className="action-btn">
                                <i className="fas fa-reply"></i>
                            </button>
                            <button className="action-btn">
                                <i className="fas fa-ellipsis-v"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="email-body">
                        {email.body.split('\n').map((line, idx) => (
                            <p key={idx}>{line}</p>
                        ))}
                    </div>
                    
                    <div className="email-reply-actions">
                        <button className="reply-btn" onClick={() => {
                            state.composing = true;
                            updateComponent();
                        }}>
                            <i className="fas fa-reply"></i>
                            Reply
                        </button>
                        <button className="reply-all-btn">
                            <i className="fas fa-reply-all"></i>
                            Reply all
                        </button>
                        <button className="forward-btn">
                            <i className="fas fa-share"></i>
                            Forward
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    const renderComposeWindow = () => {
        if (!state.composing) return null;
        
        return (
            <div className="compose-window">
                <div className="compose-header">
                    <span>New Message</span>
                    <div className="compose-actions">
                        <button onClick={() => {
                            state.composing = false;
                            updateComponent();
                        }}>
                            <i className="fas fa-minus"></i>
                        </button>
                        <button>
                            <i className="fas fa-expand"></i>
                        </button>
                        <button onClick={handleCloseCompose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div className="compose-form">
                    <div className="form-row">
                        <span className="form-label">To</span>
                        <input 
                            type="email" 
                            className="form-input"
                            placeholder="Recipients"
                            id="composeTo"
                        />
                    </div>
                    <div className="form-row">
                        <span className="form-label">Subject</span>
                        <input 
                            type="text" 
                            className="form-input"
                            placeholder="Subject"
                            id="composeSubject"
                        />
                    </div>
                    <div className="form-row">
                        <textarea 
                            className="compose-body"
                            placeholder="Compose email..."
                            id="composeBody"
                            rows="15"
                        ></textarea>
                    </div>
                </div>
                
                <div className="compose-footer">
                    <button className="send-btn" onClick={handleSendEmail}>
                        <i className="fas fa-paper-plane"></i>
                        Send
                    </button>
                    <div className="compose-tools">
                        <button className="tool-btn">
                            <i className="fas fa-paperclip"></i>
                        </button>
                        <button className="tool-btn">
                            <i className="fas fa-image"></i>
                        </button>
                        <button className="tool-btn">
                            <i className="fas fa-link"></i>
                        </button>
                        <button className="tool-btn">
                            <i className="fas fa-smile"></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    console.log('GmailClone about to render');
    
    return (
        <div className="gmail-clone">
            <div className="gmail-header">
                <div className="header-left">
                    <button className="menu-btn">
                        <i className="fas fa-bars"></i>
                    </button>
                    <div className="logo">
                        <span>Property Mail</span>
                    </div>
                </div>
                
                <div className="header-search">
                    <div className="search-box">
                        <button className="search-btn">
                            <i className="fas fa-search"></i>
                        </button>
                        <input 
                            type="text" 
                            placeholder="Search mail"
                            className="search-input"
                            value={state.searchQuery}
                            onChange={(e) => {
                                state.searchQuery = e.target.value;
                                console.log('Search:', e.target.value);
                            }}
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
                    <div className="user-avatar">
                        {state.currentUser.name.split(' ').map(n => n[0]).join('')}
                    </div>
                </div>
            </div>
            
            <div className="gmail-body">
                {renderSidebar()}
                <div className="gmail-content">
                    {renderEmailList()}
                    {renderEmailViewer()}
                </div>
            </div>
            
            {renderComposeWindow()}
        </div>
    );
};

// Register component globally
if (typeof window !== 'undefined') {
    window.AppModules = window.AppModules || {};
    window.AppModules.GmailClone = GmailClone;
}