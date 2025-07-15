// AICalendarSystem.jsx - AI-Powered Calendar System
const AICalendarSystem = ({ userType, userId, userName, userProperties = [] }) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [events, setEvents] = React.useState([]);
    const [showEventModal, setShowEventModal] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState(null);
    const [view, setView] = React.useState('month'); // month, week, day, agenda
    const [showAIScheduler, setShowAIScheduler] = React.useState(false);
    const [aiSuggestions, setAiSuggestions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    // Event creation/editing state
    const [eventData, setEventData] = React.useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        category: 'general',
        priority: 'normal',
        attendees: [],
        propertyId: '',
        reminderMinutes: 15,
        isRecurring: false,
        recurringPattern: 'weekly',
        location: '',
        isAllDay: false
    });

    React.useEffect(() => {
        loadEvents();
    }, [currentDate, userType]);

    const loadEvents = async () => {
        setLoading(true);
        try {
            // Simulate loading events - in production this would fetch from calendar service
            const mockEvents = [
                {
                    id: '1',
                    title: 'Property Inspection - Sunset Apartments',
                    description: 'Monthly property inspection with maintenance team',
                    startDate: new Date(2025, 0, 15, 9, 0).toISOString(),
                    endDate: new Date(2025, 0, 15, 11, 0).toISOString(),
                    category: 'inspection',
                    priority: 'high',
                    propertyId: userProperties[0]?.id,
                    propertyName: userProperties[0]?.name,
                    attendees: ['maintenance@property.com', 'inspector@company.com'],
                    location: 'Sunset Apartments - Lobby',
                    createdBy: userId,
                    isAllDay: false,
                    reminderSent: false
                },
                {
                    id: '2',
                    title: 'Tenant Meeting - Unit 205',
                    description: 'Lease renewal discussion with Sarah Johnson',
                    startDate: new Date(2025, 0, 16, 14, 0).toISOString(),
                    endDate: new Date(2025, 0, 16, 15, 0).toISOString(),
                    category: 'meeting',
                    priority: 'normal',
                    propertyId: userProperties[0]?.id,
                    propertyName: userProperties[0]?.name,
                    attendees: ['sarah.johnson@email.com'],
                    location: 'Property Office',
                    createdBy: userId,
                    isAllDay: false,
                    reminderSent: false
                },
                {
                    id: '3',
                    title: 'Vendor Meeting - HVAC Maintenance',
                    description: 'Annual HVAC maintenance contract discussion',
                    startDate: new Date(2025, 0, 17, 10, 30).toISOString(),
                    endDate: new Date(2025, 0, 17, 11, 30).toISOString(),
                    category: 'vendor',
                    priority: 'medium',
                    propertyId: 'all',
                    propertyName: 'All Properties',
                    attendees: ['hvac@solutions.com'],
                    location: 'Main Office',
                    createdBy: userId,
                    isAllDay: false,
                    reminderSent: false
                },
                {
                    id: '4',
                    title: 'Owner Report Due',
                    description: 'Monthly financial reports due for all properties',
                    startDate: new Date(2025, 0, 31, 17, 0).toISOString(),
                    endDate: new Date(2025, 0, 31, 18, 0).toISOString(),
                    category: 'deadline',
                    priority: 'high',
                    propertyId: 'all',
                    propertyName: 'All Properties',
                    attendees: [],
                    location: '',
                    createdBy: userId,
                    isAllDay: false,
                    reminderSent: false
                }
            ];

            setEvents(mockEvents);
        } catch (error) {
            console.error('Error loading events:', error);
        } finally {
            setLoading(false);
        }
    };

    const createEvent = () => {
        setEventData({
            title: '',
            description: '',
            startDate: selectedDate.toISOString().split('T')[0],
            endDate: selectedDate.toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '10:00',
            category: 'general',
            priority: 'normal',
            attendees: [],
            propertyId: userProperties[0]?.id || '',
            reminderMinutes: 15,
            isRecurring: false,
            recurringPattern: 'weekly',
            location: '',
            isAllDay: false
        });
        setSelectedEvent(null);
        setShowEventModal(true);
    };

    const editEvent = (event) => {
        setEventData({
            title: event.title,
            description: event.description,
            startDate: new Date(event.startDate).toISOString().split('T')[0],
            endDate: new Date(event.endDate).toISOString().split('T')[0],
            startTime: new Date(event.startDate).toTimeString().slice(0, 5),
            endTime: new Date(event.endDate).toTimeString().slice(0, 5),
            category: event.category,
            priority: event.priority,
            attendees: event.attendees || [],
            propertyId: event.propertyId,
            reminderMinutes: 15,
            isRecurring: false,
            recurringPattern: 'weekly',
            location: event.location || '',
            isAllDay: event.isAllDay || false
        });
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const saveEvent = async () => {
        try {
            const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime}`);
            const endDateTime = new Date(`${eventData.endDate}T${eventData.endTime}`);
            
            const newEvent = {
                id: selectedEvent?.id || Date.now().toString(),
                title: eventData.title,
                description: eventData.description,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                category: eventData.category,
                priority: eventData.priority,
                propertyId: eventData.propertyId,
                propertyName: userProperties.find(p => p.id === eventData.propertyId)?.name || 'All Properties',
                attendees: eventData.attendees,
                location: eventData.location,
                createdBy: userId,
                isAllDay: eventData.isAllDay,
                reminderSent: false
            };

            if (selectedEvent) {
                // Update existing event
                setEvents(prev => prev.map(event => 
                    event.id === selectedEvent.id ? newEvent : event
                ));
            } else {
                // Add new event
                setEvents(prev => [...prev, newEvent]);
            }

            // Log event creation in conversation system
            window.ConversationLogService?.logConversation({
                type: 'calendar',
                participantId: 'system',
                participantName: 'Calendar System',
                participantType: 'system',
                propertyId: eventData.propertyId,
                propertyName: userProperties.find(p => p.id === eventData.propertyId)?.name,
                content: `${selectedEvent ? 'Updated' : 'Created'} calendar event: ${eventData.title}`,
                channel: 'calendar_system',
                metadata: {
                    eventCategory: eventData.category,
                    eventPriority: eventData.priority,
                    hasAttendees: eventData.attendees.length > 0,
                    isRecurring: eventData.isRecurring
                }
            });

            setShowEventModal(false);
            window.showNotification?.('success', `Event ${selectedEvent ? 'updated' : 'created'} successfully`);
        } catch (error) {
            console.error('Error saving event:', error);
            window.showNotification?.('error', 'Failed to save event');
        }
    };

    const deleteEvent = (eventId) => {
        setEvents(prev => prev.filter(event => event.id !== eventId));
        setShowEventModal(false);
        window.showNotification?.('success', 'Event deleted successfully');
    };

    const getAISchedulingSuggestions = async (context) => {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const suggestions = [];
        
        // Check for conflicts
        const conflictingEvents = events.filter(event => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            const proposedStart = new Date(`${context.date}T${context.time}`);
            const proposedEnd = new Date(proposedStart.getTime() + (context.duration || 60) * 60000);
            
            return (proposedStart >= eventStart && proposedStart < eventEnd) ||
                   (proposedEnd > eventStart && proposedEnd <= eventEnd);
        });
        
        if (conflictingEvents.length > 0) {
            suggestions.push({
                type: 'conflict',
                message: `Time conflict detected with "${conflictingEvents[0].title}". Consider scheduling at a different time.`,
                alternatives: [
                    { time: '09:00', reason: 'Morning slot available' },
                    { time: '14:00', reason: 'Afternoon slot available' },
                    { time: '16:00', reason: 'Late afternoon available' }
                ]
            });
        }
        
        // Suggest optimal times based on category
        if (context.category === 'inspection') {
            suggestions.push({
                type: 'optimization',
                message: 'Property inspections are typically more effective in the morning when lighting is optimal.',
                recommendation: 'Schedule between 9:00 AM - 11:00 AM for best results'
            });
        }
        
        if (context.category === 'meeting') {
            suggestions.push({
                type: 'optimization',
                message: 'Tenant meetings have higher attendance rates on weekdays.',
                recommendation: 'Consider Tuesday-Thursday, 2:00 PM - 4:00 PM for optimal scheduling'
            });
        }
        
        // Travel time optimization
        const sameDayEvents = events.filter(event => {
            const eventDate = new Date(event.startDate).toDateString();
            return eventDate === new Date(`${context.date}T${context.time}`).toDateString();
        });
        
        if (sameDayEvents.length > 0) {
            suggestions.push({
                type: 'efficiency',
                message: 'You have other events scheduled today. Consider grouping similar activities to minimize travel time.',
                relatedEvents: sameDayEvents.map(e => e.title)
            });
        }
        
        return suggestions;
    };

    const smartSchedule = async (prompt) => {
        // AI-powered event creation from natural language
        const lowerPrompt = prompt.toLowerCase();
        
        let category = 'general';
        let title = prompt;
        let duration = 60; // minutes
        let priority = 'normal';
        
        // Extract category from prompt
        if (lowerPrompt.includes('inspection') || lowerPrompt.includes('inspect')) {
            category = 'inspection';
            title = title.includes('inspection') ? title : `Property Inspection - ${title}`;
            duration = 120;
        } else if (lowerPrompt.includes('meeting') || lowerPrompt.includes('meet')) {
            category = 'meeting';
            duration = 60;
        } else if (lowerPrompt.includes('vendor') || lowerPrompt.includes('contractor')) {
            category = 'vendor';
            duration = 90;
        } else if (lowerPrompt.includes('deadline') || lowerPrompt.includes('due')) {
            category = 'deadline';
            priority = 'high';
            duration = 30;
        }
        
        // Extract time information
        let suggestedTime = '09:00';
        if (lowerPrompt.includes('morning')) suggestedTime = '09:00';
        else if (lowerPrompt.includes('afternoon')) suggestedTime = '14:00';
        else if (lowerPrompt.includes('evening')) suggestedTime = '17:00';
        
        // Pre-fill event data
        setEventData(prev => ({
            ...prev,
            title,
            category,
            priority,
            startTime: suggestedTime,
            endTime: new Date(new Date(`1970-01-01T${suggestedTime}`).getTime() + duration * 60000)
                .toTimeString().slice(0, 5)
        }));
        
        // Get AI suggestions
        const suggestions = await getAISchedulingSuggestions({
            date: eventData.startDate,
            time: suggestedTime,
            duration,
            category,
            title
        });
        
        setAiSuggestions(suggestions);
        setShowEventModal(true);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        
        return days;
    };

    const getEventsForDate = (date) => {
        if (!date) return [];
        
        return events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const getCategoryColor = (category) => {
        const colors = {
            inspection: '#3b82f6',
            meeting: '#10b981',
            vendor: '#f59e0b',
            deadline: '#ef4444',
            maintenance: '#8b5cf6',
            general: '#6b7280'
        };
        return colors[category] || colors.general;
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(prev.getMonth() + direction);
            return newDate;
        });
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="ai-calendar-system">
            {/* Header */}
            <div className="calendar-header">
                <div className="header-content">
                    <h2>
                        <i className="fas fa-calendar-alt"></i>
                        Smart Calendar
                    </h2>
                    <p>AI-powered scheduling for {userName}</p>
                </div>
                <div className="header-actions">
                    <button className="create-event-btn" onClick={createEvent}>
                        <i className="fas fa-plus"></i>
                        New Event
                    </button>
                    <button 
                        className="ai-scheduler-btn"
                        onClick={() => setShowAIScheduler(true)}
                    >
                        <i className="fas fa-robot"></i>
                        AI Schedule
                    </button>
                </div>
            </div>

            <div className="calendar-container">
                {/* Calendar Controls */}
                <div className="calendar-controls">
                    <div className="month-navigation">
                        <button className="nav-btn" onClick={() => navigateMonth(-1)}>
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                        <button className="nav-btn" onClick={() => navigateMonth(1)}>
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                    
                    <div className="view-controls">
                        {['month', 'week', 'day', 'agenda'].map(viewType => (
                            <button
                                key={viewType}
                                className={`view-btn ${view === viewType ? 'active' : ''}`}
                                onClick={() => setView(viewType)}
                            >
                                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calendar Grid */}
                {view === 'month' && (
                    <div className="calendar-grid">
                        {/* Day headers */}
                        <div className="calendar-header-row">
                            {dayNames.map(day => (
                                <div key={day} className="day-header">{day}</div>
                            ))}
                        </div>
                        
                        {/* Calendar days */}
                        <div className="calendar-body">
                            {getDaysInMonth(currentDate).map((date, index) => (
                                <CalendarDay
                                    key={index}
                                    date={date}
                                    events={date ? getEventsForDate(date) : []}
                                    isSelected={date && selectedDate.toDateString() === date.toDateString()}
                                    isToday={date && date.toDateString() === new Date().toDateString()}
                                    onClick={() => {
                                        if (date) {
                                            setSelectedDate(date);
                                        }
                                    }}
                                    onCreateEvent={() => {
                                        if (date) {
                                            setSelectedDate(date);
                                            createEvent();
                                        }
                                    }}
                                    onEditEvent={editEvent}
                                    getCategoryColor={getCategoryColor}
                                    formatTime={formatTime}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Agenda View */}
                {view === 'agenda' && (
                    <AgendaView
                        events={events}
                        onEditEvent={editEvent}
                        getCategoryColor={getCategoryColor}
                        formatTime={formatTime}
                    />
                )}
            </div>

            {/* Event Modal */}
            {showEventModal && (
                <EventModal
                    eventData={eventData}
                    setEventData={setEventData}
                    selectedEvent={selectedEvent}
                    onSave={saveEvent}
                    onDelete={deleteEvent}
                    onClose={() => setShowEventModal(false)}
                    userProperties={userProperties}
                    aiSuggestions={aiSuggestions}
                />
            )}

            {/* AI Scheduler Modal */}
            {showAIScheduler && (
                <AISchedulerModal
                    onClose={() => setShowAIScheduler(false)}
                    onSmartSchedule={smartSchedule}
                />
            )}
        </div>
    );
};

// Calendar Day Component
const CalendarDay = ({ 
    date, 
    events, 
    isSelected, 
    isToday, 
    onClick, 
    onCreateEvent, 
    onEditEvent, 
    getCategoryColor, 
    formatTime 
}) => {
    if (!date) {
        return <div className="calendar-day empty"></div>;
    }

    return (
        <div 
            className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
            onClick={onClick}
        >
            <div className="day-number">
                {date.getDate()}
                <button className="add-event-btn" onClick={(e) => {
                    e.stopPropagation();
                    onCreateEvent();
                }}>
                    <i className="fas fa-plus"></i>
                </button>
            </div>
            <div className="day-events">
                {events.slice(0, 3).map(event => (
                    <div
                        key={event.id}
                        className="event-pill"
                        style={{ backgroundColor: getCategoryColor(event.category) }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditEvent(event);
                        }}
                    >
                        <span className="event-time">{formatTime(event.startDate)}</span>
                        <span className="event-title">{event.title}</span>
                    </div>
                ))}
                {events.length > 3 && (
                    <div className="more-events">
                        +{events.length - 3} more
                    </div>
                )}
            </div>
        </div>
    );
};

// Agenda View Component
const AgendaView = ({ events, onEditEvent, getCategoryColor, formatTime }) => {
    const sortedEvents = events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    
    const groupedEvents = sortedEvents.reduce((groups, event) => {
        const date = new Date(event.startDate).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(event);
        return groups;
    }, {});

    return (
        <div className="agenda-view">
            {Object.entries(groupedEvents).map(([dateString, dayEvents]) => (
                <div key={dateString} className="agenda-day">
                    <div className="agenda-date">
                        <h3>{new Date(dateString).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</h3>
                    </div>
                    <div className="agenda-events">
                        {dayEvents.map(event => (
                            <div
                                key={event.id}
                                className="agenda-event"
                                onClick={() => onEditEvent(event)}
                            >
                                <div 
                                    className="event-indicator"
                                    style={{ backgroundColor: getCategoryColor(event.category) }}
                                ></div>
                                <div className="event-time">
                                    {formatTime(event.startDate)} - {formatTime(event.endDate)}
                                </div>
                                <div className="event-details">
                                    <h4>{event.title}</h4>
                                    <p>{event.description}</p>
                                    {event.location && (
                                        <p className="event-location">
                                            <i className="fas fa-map-marker-alt"></i>
                                            {event.location}
                                        </p>
                                    )}
                                </div>
                                <div className="event-meta">
                                    <span className={`priority-badge ${event.priority}`}>
                                        {event.priority}
                                    </span>
                                    <span className="category-badge">
                                        {event.category}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Event Modal Component
const EventModal = ({ 
    eventData, 
    setEventData, 
    selectedEvent, 
    onSave, 
    onDelete, 
    onClose, 
    userProperties, 
    aiSuggestions 
}) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="event-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{selectedEvent ? 'Edit Event' : 'Create Event'}</h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-content">
                    {aiSuggestions.length > 0 && (
                        <div className="ai-suggestions-section">
                            <h4>AI Suggestions</h4>
                            {aiSuggestions.map((suggestion, index) => (
                                <div key={index} className={`ai-suggestion ${suggestion.type}`}>
                                    <div className="suggestion-content">
                                        <i className={`fas ${
                                            suggestion.type === 'conflict' ? 'fa-exclamation-triangle' :
                                            suggestion.type === 'optimization' ? 'fa-lightbulb' :
                                            'fa-info-circle'
                                        }`}></i>
                                        <span>{suggestion.message}</span>
                                    </div>
                                    {suggestion.recommendation && (
                                        <div className="suggestion-recommendation">
                                            {suggestion.recommendation}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="form-grid">
                        <div className="form-group">
                            <label>Event Title</label>
                            <input
                                type="text"
                                value={eventData.title}
                                onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Enter event title"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                value={eventData.category}
                                onChange={(e) => setEventData(prev => ({ ...prev, category: e.target.value }))}
                                className="form-select"
                            >
                                <option value="general">General</option>
                                <option value="inspection">Property Inspection</option>
                                <option value="meeting">Meeting</option>
                                <option value="vendor">Vendor Appointment</option>
                                <option value="deadline">Deadline</option>
                                <option value="maintenance">Maintenance</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={eventData.startDate}
                                onChange={(e) => setEventData(prev => ({ ...prev, startDate: e.target.value }))}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Start Time</label>
                            <input
                                type="time"
                                value={eventData.startTime}
                                onChange={(e) => setEventData(prev => ({ ...prev, startTime: e.target.value }))}
                                className="form-input"
                                disabled={eventData.isAllDay}
                            />
                        </div>

                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={eventData.endDate}
                                onChange={(e) => setEventData(prev => ({ ...prev, endDate: e.target.value }))}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>End Time</label>
                            <input
                                type="time"
                                value={eventData.endTime}
                                onChange={(e) => setEventData(prev => ({ ...prev, endTime: e.target.value }))}
                                className="form-input"
                                disabled={eventData.isAllDay}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label>Description</label>
                            <textarea
                                value={eventData.description}
                                onChange={(e) => setEventData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Event description"
                                rows="3"
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-group">
                            <label>Property</label>
                            <select
                                value={eventData.propertyId}
                                onChange={(e) => setEventData(prev => ({ ...prev, propertyId: e.target.value }))}
                                className="form-select"
                            >
                                <option value="">Select property</option>
                                <option value="all">All Properties</option>
                                {userProperties.map(property => (
                                    <option key={property.id} value={property.id}>
                                        {property.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Priority</label>
                            <select
                                value={eventData.priority}
                                onChange={(e) => setEventData(prev => ({ ...prev, priority: e.target.value }))}
                                className="form-select"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="form-group full-width">
                            <label>Location</label>
                            <input
                                type="text"
                                value={eventData.location}
                                onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Event location"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={eventData.isAllDay}
                                    onChange={(e) => setEventData(prev => ({ ...prev, isAllDay: e.target.checked }))}
                                />
                                All Day Event
                            </label>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="footer-left">
                        {selectedEvent && (
                            <button 
                                className="btn-danger"
                                onClick={() => onDelete(selectedEvent.id)}
                            >
                                <i className="fas fa-trash"></i>
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="footer-right">
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button 
                            className="btn-primary"
                            onClick={onSave}
                            disabled={!eventData.title}
                        >
                            <i className="fas fa-save"></i>
                            {selectedEvent ? 'Update' : 'Create'} Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// AI Scheduler Modal Component
const AISchedulerModal = ({ onClose, onSmartSchedule }) => {
    const [prompt, setPrompt] = React.useState('');
    
    const quickPrompts = [
        'Schedule property inspection next Tuesday morning',
        'Meeting with tenant about lease renewal',
        'Vendor appointment for HVAC maintenance',
        'Monthly report deadline reminder',
        'Property showing for new prospect'
    ];
    
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="ai-scheduler-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>
                        <i className="fas fa-robot"></i>
                        AI Smart Scheduler
                    </h3>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-content">
                    <div className="ai-prompt-section">
                        <label>Describe what you want to schedule:</label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="E.g., 'Schedule a property inspection for Sunset Apartments next Tuesday morning'"
                            rows="3"
                            className="form-textarea"
                        />
                        <button 
                            className="ai-create-btn"
                            onClick={() => onSmartSchedule(prompt)}
                            disabled={!prompt.trim()}
                        >
                            <i className="fas fa-magic"></i>
                            Create Event with AI
                        </button>
                    </div>

                    <div className="quick-prompts">
                        <h4>Quick Examples:</h4>
                        <div className="prompt-buttons">
                            {quickPrompts.map((quickPrompt, index) => (
                                <button
                                    key={index}
                                    className="prompt-btn"
                                    onClick={() => setPrompt(quickPrompt)}
                                >
                                    {quickPrompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="ai-features">
                        <h4>AI Features:</h4>
                        <ul>
                            <li>Conflict detection and resolution</li>
                            <li>Optimal time suggestions</li>
                            <li>Travel time optimization</li>
                            <li>Automatic categorization</li>
                            <li>Smart attendee suggestions</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.AICalendarSystem = AICalendarSystem;