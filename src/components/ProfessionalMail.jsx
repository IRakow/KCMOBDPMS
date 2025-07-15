// ProfessionalMail.jsx - Clean, Light, Professional
// Ensure React is available
const React = window.React || {};
const { useState, useEffect, useRef } = React;

// Check if React hooks are available
if (!useState || !useEffect) {
    console.error('React hooks not available! Make sure React is loaded.');
}

const ProfessionalMail = () => {
    console.log('ProfessionalMail component loading...');
    
    // Use fallback if hooks not available
    const [selectedFolder, setSelectedFolder] = useState ? useState('inbox') : ['inbox', () => {}];
    const [selectedEmails, setSelectedEmails] = useState ? useState([]) : [[], () => {}];
    const [composing, setComposing] = useState ? useState(false) : [false, () => {}];
    const [emailView, setEmailView] = useState ? useState('comfortable') : ['comfortable', () => {}];
    const [activeTab, setActiveTab] = useState ? useState('primary') : ['primary', () => {}];
    const [emails, setEmails] = useState ? useState([]) : [[], () => {}];
    const [selectedEmail, setSelectedEmail] = useState ? useState(null) : [null, () => {}];
    const [loading, setLoading] = useState ? useState(true) : [true, () => {}];
    const [searchQuery, setSearchQuery] = useState ? useState('') : ['', () => {}];
    const [notes, setNotes] = useState ? useState([]) : [[], () => {}];
    
    // Load emails on component mount
    useEffect(() => {
        loadEmails();
    }, [selectedFolder, activeTab]);
    
    const loadEmails = async () => {
        setLoading(true);
        try {
            // Mock data for different tabs and folders
            const mockEmails = {
                primary: [
                    {
                        id: '1',
                        unread: true,
                        starred: false,
                        important: true,
                        sender: 'Sarah Johnson',
                        subject: 'Maintenance Request - Unit 203',
                        snippet: 'Hi, I wanted to report that the kitchen faucet is leaking. It started yesterday and seems to be getting worse...',
                        time: '10:42 AM',
                        hasAttachment: true,
                        labels: [
                            { color: '#4285f4', text: 'Sunset Apartments' },
                            { color: '#ea4335', text: 'Urgent' }
                        ],
                        content: 'Hi there,\n\nI wanted to report that the kitchen faucet in unit 203 is leaking. It started yesterday and seems to be getting worse. Could someone please take a look at it?\n\nThanks,\nSarah Johnson\nUnit 203',
                        from: 'sarah.johnson@email.com',
                        to: 'management@property.com',
                        date: new Date().toISOString()
                    },
                    {
                        id: '2',
                        unread: true,
                        starred: true,
                        sender: 'Michael Chen',
                        subject: 'Lease Renewal Question',
                        snippet: 'I received the lease renewal notice and had a few questions about the terms. Could we schedule a call to discuss...',
                        time: '9:23 AM',
                        labels: [
                            { color: '#0f9d58', text: 'Downtown Plaza' },
                            { color: '#f4b400', text: 'Leases' }
                        ],
                        content: 'Dear Management,\n\nI received the lease renewal notice and had a few questions about the terms. Could we schedule a call to discuss the details?\n\nBest regards,\nMichael Chen',
                        from: 'michael.chen@email.com',
                        to: 'management@property.com',
                        date: new Date(Date.now() - 1000 * 60 * 60).toISOString()
                    }
                ],
                updates: [
                    {
                        id: '3',
                        unread: false,
                        starred: false,
                        sender: 'Property System',
                        subject: 'Monthly Report Generated',
                        snippet: 'Your monthly property report for October 2024 has been generated and is ready for review...',
                        time: 'Yesterday',
                        hasAttachment: true,
                        labels: [
                            { color: '#673ab7', text: 'System' },
                            { color: '#4285f4', text: 'Reports' }
                        ],
                        content: 'Your monthly property report for October 2024 has been generated and is ready for review.',
                        from: 'system@property.com',
                        to: 'management@property.com',
                        date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
                    }
                ],
                notes: []
            };
            
            setEmails(mockEmails[activeTab] || []);
        } catch (error) {
            console.error('Failed to load emails:', error);
            setEmails([]);
        } finally {
            setLoading(false);
        }
    };
    
    const loadNotes = async () => {
        const mockNotes = [
            {
                id: '1',
                title: 'Maintenance Schedule',
                content: 'Remember to schedule quarterly HVAC maintenance for all units.',
                created: new Date().toISOString(),
                property: 'Sunset Apartments',
                priority: 'high'
            },
            {
                id: '2',
                title: 'Lease Renewal Reminders',
                content: 'Send lease renewal notices 90 days before expiration.',
                created: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                property: 'Downtown Plaza',
                priority: 'medium'
            }
        ];
        setNotes(mockNotes);
    };
    
    useEffect(() => {
        if (activeTab === 'notes') {
            loadNotes();
        }
    }, [activeTab]);
    
    const handleEmailClick = (email) => {
        console.log('Email clicked:', email);
        setSelectedEmail(email);
        if (email.unread) {
            setEmails(prevEmails => 
                prevEmails.map(e => 
                    e.id === email.id ? { ...e, unread: false } : e
                )
            );
        }
    };
    
    const handleDeleteEmail = (emailId) => {
        setEmails(prevEmails => prevEmails.filter(e => e.id !== emailId));
        if (selectedEmail?.id === emailId) {
            setSelectedEmail(null);
        }
    };
    
    const handleStarToggle = (emailId) => {
        setEmails(prevEmails => 
            prevEmails.map(e => 
                e.id === emailId ? { ...e, starred: !e.starred } : e
            )
        );
    };
    
    const filteredEmails = emails.filter(email => 
        email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.snippet.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    console.log('ProfessionalMail about to render with state:', {
        activeTab, 
        emails: emails.length, 
        selectedEmail: selectedEmail?.id,
        loading,
        composing
    });
    
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                    <button className="compose-btn" onClick={() => {
                        console.log('Compose button clicked');
                        setComposing(true);
                    }}>
                        <i className="fas fa-plus"></i>
                        Compose
                    </button>
                    
                    <div className="folder-list">
                        <FolderItem
                            icon="fa-inbox"
                            label="Inbox"
                            count={127}
                            active={selectedFolder === 'inbox'}
                            onClick={() => {
                                console.log('Inbox folder clicked');
                                setSelectedFolder('inbox');
                            }}
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
                        <div 
                            className={`tab ${activeTab === 'primary' ? 'active' : ''}`}
                            onClick={() => {
                                console.log('Primary tab clicked');
                                setActiveTab('primary');
                            }}
                        >
                            <i className="fas fa-inbox"></i>
                            Primary
                        </div>
                        <div 
                            className={`tab ${activeTab === 'promotions' ? 'active' : ''}`}
                            onClick={() => {
                                console.log('Promotions tab clicked');
                                setActiveTab('promotions');
                            }}
                        >
                            <i className="fas fa-tag"></i>
                            Promotions
                        </div>
                        <div 
                            className={`tab ${activeTab === 'updates' ? 'active' : ''}`}
                            onClick={() => {
                                console.log('Updates tab clicked');
                                setActiveTab('updates');
                            }}
                        >
                            <i className="fas fa-users"></i>
                            Updates
                        </div>
                        <div 
                            className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                            onClick={() => {
                                console.log('Notes tab clicked');
                                setActiveTab('notes');
                            }}
                        >
                            <i className="fas fa-sticky-note"></i>
                            Notes
                        </div>
                    </div>
                    
                    {/* Email Items */}
                    <div className="email-items">
                        {activeTab === 'notes' ? (
                            <NotesSection 
                                notes={notes} 
                                onAddNote={(note) => setNotes([...notes, { ...note, id: Date.now().toString() }])}
                                onDeleteNote={(noteId) => setNotes(notes.filter(n => n.id !== noteId))}
                            />
                        ) : loading ? (
                            <div className="loading-emails">
                                <i className="fas fa-spinner fa-spin"></i>
                                <p>Loading emails...</p>
                            </div>
                        ) : filteredEmails.length === 0 ? (
                            <div className="no-emails">
                                <i className="fas fa-inbox" style={{fontSize: '48px', color: '#dadce0', marginBottom: '16px'}}></i>
                                <p>No emails found</p>
                            </div>
                        ) : (
                            filteredEmails.map(email => (
                                <EmailItem
                                    key={email.id}
                                    email={email}
                                    selected={selectedEmail?.id === email.id}
                                    onEmailClick={() => handleEmailClick(email)}
                                    onStarToggle={() => handleStarToggle(email.id)}
                                    onDelete={() => handleDeleteEmail(email.id)}
                                />
                            ))
                        )}
                    </div>
                </div>
                
                {/* Email Content Panel */}
                <div className="mail-content">
                    <EmailViewer 
                        selectedEmail={selectedEmail}
                        onReply={(email) => {
                            setComposing(true);
                            // Pre-fill compose window with reply data
                        }}
                        onDelete={() => selectedEmail && handleDeleteEmail(selectedEmail.id)}
                    />
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
const EmailItem = ({ email, selected, onEmailClick, onStarToggle, onDelete }) => {
    const { unread, starred, important, sender, subject, snippet, time, hasAttachment, labels } = email;
    
    return (
        <div 
            className={`email-item ${unread ? 'unread' : ''} ${selected ? 'selected' : ''}`}
            onClick={onEmailClick}
        >
            <div className="email-controls">
                <input type="checkbox" onClick={(e) => e.stopPropagation()} />
                <button 
                    className="star-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onStarToggle();
                    }}
                >
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
                <button 
                    className="delete-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    style={{marginLeft: '8px', opacity: 0.6}}
                >
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

// Email Viewer Component
const EmailViewer = ({ selectedEmail, onReply, onDelete }) => {
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
                    <button className="action-btn" title="Report spam">
                        <i className="fas fa-ban"></i>
                    </button>
                    <button className="action-btn" title="Delete" onClick={onDelete}>
                        <i className="fas fa-trash"></i>
                    </button>
                    <button className="action-btn" title="Mark as unread">
                        <i className="fas fa-envelope"></i>
                    </button>
                    <button className="action-btn" title="Add to tasks">
                        <i className="fas fa-plus"></i>
                    </button>
                    <button className="action-btn" title="Move to">
                        <i className="fas fa-folder"></i>
                    </button>
                    <button className="action-btn" title="More">
                        <i className="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>
            
            <div className="email-content-full">
                <div className="email-subject-full">
                    <h2>{selectedEmail.subject}</h2>
                    <div className="email-labels-full">
                        {selectedEmail.labels && selectedEmail.labels.map((label, idx) => (
                            <span 
                                key={idx} 
                                className="email-label"
                                style={{backgroundColor: label.color}}
                            >
                                {label.text}
                            </span>
                        ))}
                    </div>
                </div>
                
                <div className="email-meta-full">
                    <div className="sender-info">
                        <div className="sender-avatar">
                            {selectedEmail.sender.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div className="sender-details">
                            <div className="sender-name">{selectedEmail.sender}</div>
                            <div className="sender-email">&lt;{selectedEmail.from}&gt;</div>
                        </div>
                    </div>
                    <div className="email-time-full">
                        {new Date(selectedEmail.date).toLocaleString()}
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
                    <button className="reply-btn" onClick={() => onReply(selectedEmail)}>
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

// Notes Section Component
const NotesSection = ({ notes, onAddNote, onDeleteNote }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newNote, setNewNote] = useState({
        title: '',
        content: '',
        property: '',
        priority: 'medium'
    });
    
    const handleAddNote = () => {
        if (newNote.title.trim() && newNote.content.trim()) {
            onAddNote({
                ...newNote,
                created: new Date().toISOString()
            });
            setNewNote({
                title: '',
                content: '',
                property: '',
                priority: 'medium'
            });
            setShowAddForm(false);
        }
    };
    
    return (
        <div className="notes-section">
            <div className="notes-header">
                <h3>Notes</h3>
                <button 
                    className="add-note-btn"
                    onClick={() => {
                        console.log('Add Note button clicked');
                        setShowAddForm(true);
                    }}
                >
                    <i className="fas fa-plus"></i>
                    Add Note
                </button>
            </div>
            
            {showAddForm && (
                <div className="add-note-form">
                    <input
                        type="text"
                        placeholder="Note title..."
                        value={newNote.title}
                        onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                        className="note-title-input"
                    />
                    <textarea
                        placeholder="Note content..."
                        value={newNote.content}
                        onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                        className="note-content-input"
                        rows="3"
                    />
                    <div className="note-form-meta">
                        <select 
                            value={newNote.property}
                            onChange={(e) => setNewNote({...newNote, property: e.target.value})}
                            className="note-property-select"
                        >
                            <option value="">Select Property</option>
                            <option value="Sunset Apartments">Sunset Apartments</option>
                            <option value="Downtown Plaza">Downtown Plaza</option>
                            <option value="Garden Complex">Garden Complex</option>
                        </select>
                        <select 
                            value={newNote.priority}
                            onChange={(e) => setNewNote({...newNote, priority: e.target.value})}
                            className="note-priority-select"
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                    <div className="note-form-actions">
                        <button 
                            className="save-note-btn"
                            onClick={handleAddNote}
                        >
                            Save Note
                        </button>
                        <button 
                            className="cancel-note-btn"
                            onClick={() => setShowAddForm(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            
            <div className="notes-list">
                {notes.length === 0 ? (
                    <div className="no-notes">
                        <i className="fas fa-sticky-note" style={{fontSize: '48px', color: '#dadce0', marginBottom: '16px'}}></i>
                        <p>No notes yet. Add your first note!</p>
                    </div>
                ) : (
                    notes.map(note => (
                        <NoteItem 
                            key={note.id}
                            note={note}
                            onDelete={() => onDeleteNote(note.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

// Note Item Component
const NoteItem = ({ note, onDelete }) => {
    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };
    
    return (
        <div className="note-item">
            <div className="note-header">
                <h4 className="note-title">{note.title}</h4>
                <div className="note-meta">
                    <span 
                        className="note-priority"
                        style={{ color: getPriorityColor(note.priority) }}
                    >
                        <i className="fas fa-circle"></i>
                        {note.priority}
                    </span>
                    <button 
                        className="delete-note-btn"
                        onClick={onDelete}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div className="note-content">
                <p>{note.content}</p>
            </div>
            <div className="note-footer">
                {note.property && (
                    <span className="note-property">
                        <i className="fas fa-building"></i>
                        {note.property}
                    </span>
                )}
                <span className="note-date">
                    {new Date(note.created).toLocaleDateString()}
                </span>
            </div>
        </div>
    );
};

// Professional Compose Window
const ComposeWindow = ({ onClose }) => {
    const [to, setTo] = useState('');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [showCc, setShowCc] = useState(false);
    
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