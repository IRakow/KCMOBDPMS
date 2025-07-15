// SimpleCalendar.jsx - Clean Property Management Calendar
const SimpleCalendar = () => {
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [events, setEvents] = React.useState([]);
    const [view, setView] = React.useState('month'); // month, week, day
    const [showEventModal, setShowEventModal] = React.useState(false);

    React.useEffect(() => {
        loadEvents();
    }, [currentDate, view]);

    const loadEvents = async () => {
        try {
            // Try to load from API
            if (window.ApiService) {
                const response = await window.ApiService.get('/calendar/events', {
                    params: {
                        start: getViewStartDate(),
                        end: getViewEndDate(),
                        view: view
                    }
                });
                setEvents(response.events || []);
            } else {
                // Use mock data
                setEvents(getMockEvents());
            }
        } catch (error) {
            console.error('Failed to load events:', error);
            setEvents(getMockEvents());
        }
    };

    const getMockEvents = () => {
        return [
            {
                id: 1,
                title: 'Property Inspection - Sunset Apts',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                type: 'inspection',
                property: 'Sunset Apartments',
                unit: '101'
            },
            {
                id: 2,
                title: 'Move In: Sarah Johnson',
                date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                time: '10:00',
                type: 'move_in',
                property: 'Downtown Plaza',
                unit: 'A12',
                tenant: 'Sarah Johnson'
            },
            {
                id: 3,
                title: 'Move Out: Michael Chen',
                date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                time: '14:00',
                type: 'move_out',
                property: 'Garden Complex',
                unit: '305',
                tenant: 'Michael Chen'
            },
            {
                id: 4,
                title: 'Showing - Unit 205',
                date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
                time: '16:00',
                type: 'showing',
                property: 'Sunset Apartments',
                unit: '205'
            },
            {
                id: 5,
                title: 'Lease Signing - Emily Davis',
                date: new Date(Date.now() + 345600000).toISOString().split('T')[0],
                time: '11:00',
                type: 'lease',
                property: 'Sunset Apartments',
                unit: '205'
            },
            {
                id: 6,
                title: 'Move In: David Wilson',
                date: new Date(Date.now() + 432000000).toISOString().split('T')[0],
                time: '09:30',
                type: 'move_in',
                property: 'Riverside Tower',
                unit: '1204',
                tenant: 'David Wilson'
            },
            {
                id: 7,
                title: 'Maintenance Check - HVAC',
                date: new Date(Date.now() + 518400000).toISOString().split('T')[0],
                time: '10:30',
                type: 'maintenance',
                property: 'Garden Complex'
            }
        ];
    };

    const getViewStartDate = () => {
        if (view === 'month') {
            return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        } else if (view === 'week') {
            const start = new Date(currentDate);
            start.setDate(currentDate.getDate() - currentDate.getDay());
            return start;
        } else {
            return currentDate;
        }
    };

    const getViewEndDate = () => {
        if (view === 'month') {
            return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        } else if (view === 'week') {
            const end = new Date(currentDate);
            end.setDate(currentDate.getDate() + (6 - currentDate.getDay()));
            return end;
        } else {
            return currentDate;
        }
    };

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        if (view === 'month') {
            newDate.setMonth(currentDate.getMonth() + direction);
        } else if (view === 'week') {
            newDate.setDate(currentDate.getDate() + (direction * 7));
        } else {
            newDate.setDate(currentDate.getDate() + direction);
        }
        setCurrentDate(newDate);
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric',
            day: view === 'day' ? 'numeric' : undefined
        });
    };

    const getEventTypeColor = (type) => {
        const colors = {
            inspection: '#3b82f6',
            lease: '#10b981',
            maintenance: '#f59e0b',
            showing: '#8b5cf6',
            move_in: '#059669',
            move_out: '#dc2626',
            default: '#6b7280'
        };
        return colors[type] || colors.default;
    };

    return (
        <div className="simple-calendar">
            {/* Calendar Header */}
            <div className="calendar-header">
                <div className="header-left">
                    <h1 className="calendar-title">Calendar</h1>
                    <p className="calendar-subtitle">{formatDate(currentDate)}</p>
                </div>
                
                <div className="header-center">
                    <button 
                        className="nav-btn"
                        onClick={() => navigateDate(-1)}
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                    <button 
                        className="today-btn"
                        onClick={() => setCurrentDate(new Date())}
                    >
                        Today
                    </button>
                    <button 
                        className="nav-btn"
                        onClick={() => navigateDate(1)}
                    >
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>

                <div className="header-right">
                    <div className="view-switcher">
                        <button 
                            className={`view-btn ${view === 'day' ? 'active' : ''}`}
                            onClick={() => setView('day')}
                        >
                            Day
                        </button>
                        <button 
                            className={`view-btn ${view === 'week' ? 'active' : ''}`}
                            onClick={() => setView('week')}
                        >
                            Week
                        </button>
                        <button 
                            className={`view-btn ${view === 'month' ? 'active' : ''}`}
                            onClick={() => setView('month')}
                        >
                            Month
                        </button>
                    </div>
                    <button 
                        className="new-event-btn"
                        onClick={() => setShowEventModal(true)}
                    >
                        <i className="fas fa-plus"></i>
                        New Event
                    </button>
                </div>
            </div>

            {/* Calendar Views */}
            <div className="calendar-content">
                {view === 'month' && <MonthView currentDate={currentDate} events={events} onDateSelect={setSelectedDate} />}
                {view === 'week' && <WeekView currentDate={currentDate} events={events} onDateSelect={setSelectedDate} />}
                {view === 'day' && <DayView currentDate={currentDate} events={events} />}
            </div>

            {/* New Event Modal */}
            {showEventModal && (
                <NewEventModal
                    selectedDate={selectedDate}
                    onClose={() => setShowEventModal(false)}
                    onSave={(event) => {
                        setEvents([...events, { ...event, id: Date.now() }]);
                        setShowEventModal(false);
                    }}
                />
            )}
        </div>
    );
};

// Month View Component
const MonthView = ({ currentDate, events, onDateSelect }) => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startDate.getDay();
    const daysInMonth = endDate.getDate();
    
    const weeks = [];
    let currentWeek = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
        currentWeek.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
        currentWeek.push(day);
    }
    
    // Add remaining days to complete the week
    while (currentWeek.length < 7) {
        currentWeek.push(null);
    }
    weeks.push(currentWeek);

    const getDayEvents = (day) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            .toISOString().split('T')[0];
        return events.filter(event => event.date === dateStr);
    };

    return (
        <div className="month-view">
            <div className="weekday-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday-cell">{day}</div>
                ))}
            </div>
            
            <div className="month-grid">
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="week-row">
                        {week.map((day, dayIndex) => (
                            <div 
                                key={dayIndex} 
                                className={`day-cell ${day ? 'valid-day' : 'empty-day'} ${
                                    day === new Date().getDate() && 
                                    currentDate.getMonth() === new Date().getMonth() && 
                                    currentDate.getFullYear() === new Date().getFullYear() ? 'today' : ''
                                }`}
                                onClick={() => day && onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                            >
                                {day && (
                                    <>
                                        <span className="day-number">{day}</span>
                                        <div className="day-events">
                                            {getDayEvents(day).slice(0, 3).map(event => (
                                                <div 
                                                    key={event.id} 
                                                    className="event-dot"
                                                    style={{ backgroundColor: getEventTypeColor(event.type) }}
                                                    title={event.title}
                                                >
                                                    {event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title}
                                                </div>
                                            ))}
                                            {getDayEvents(day).length > 3 && (
                                                <div className="more-events">+{getDayEvents(day).length - 3} more</div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Week View Component
const WeekView = ({ currentDate, events, onDateSelect }) => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        weekDays.push(day);
    }

    const timeSlots = [];
    for (let hour = 8; hour < 18; hour++) {
        timeSlots.push(`${hour}:00`);
    }

    const getEventForTimeSlot = (date, time) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.find(event => event.date === dateStr && event.time?.startsWith(time.split(':')[0]));
    };

    return (
        <div className="week-view">
            <div className="week-header">
                <div className="time-column-header"></div>
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="day-header">
                        <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="day-date">{day.getDate()}</div>
                    </div>
                ))}
            </div>
            
            <div className="week-grid">
                {timeSlots.map(time => (
                    <div key={time} className="time-row">
                        <div className="time-label">{time}</div>
                        {weekDays.map(day => {
                            const event = getEventForTimeSlot(day, time);
                            return (
                                <div key={`${day.toISOString()}-${time}`} className="time-slot">
                                    {event && (
                                        <div 
                                            className="event-block"
                                            style={{ backgroundColor: getEventTypeColor(event.type) }}
                                        >
                                            <div className="event-title">{event.title}</div>
                                            <div className="event-time">{event.time}</div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Day View Component
const DayView = ({ currentDate, events }) => {
    const dayEvents = events.filter(event => 
        event.date === currentDate.toISOString().split('T')[0]
    ).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    const timeSlots = [];
    for (let hour = 8; hour < 18; hour++) {
        timeSlots.push(`${hour}:00`);
    }

    return (
        <div className="day-view">
            <div className="day-header">
                <h2>{currentDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                })}</h2>
            </div>
            
            <div className="day-schedule">
                {timeSlots.map(time => {
                    const event = dayEvents.find(e => e.time?.startsWith(time.split(':')[0]));
                    return (
                        <div key={time} className="time-slot-day">
                            <div className="time-label">{time}</div>
                            <div className="slot-content">
                                {event && (
                                    <div 
                                        className="event-card"
                                        style={{ borderLeft: `4px solid ${getEventTypeColor(event.type)}` }}
                                    >
                                        <div className="event-title">{event.title}</div>
                                        <div className="event-details">
                                            {event.property && <span>{event.property}</span>}
                                            {event.unit && <span>Unit {event.unit}</span>}
                                            <span>{event.time}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// New Event Modal
const NewEventModal = ({ selectedDate, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        title: '',
        date: selectedDate.toISOString().split('T')[0],
        time: '',
        type: 'inspection',
        property: '',
        unit: '',
        description: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Event</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label>Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Date *</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Time</label>
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                            <option value="inspection">Property Inspection</option>
                            <option value="lease">Lease Meeting</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="showing">Property Showing</option>
                            <option value="move_in">Move In</option>
                            <option value="move_out">Move Out</option>
                            <option value="meeting">General Meeting</option>
                        </select>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Property</label>
                            <input
                                type="text"
                                value={formData.property}
                                onChange={(e) => setFormData({...formData, property: e.target.value})}
                                placeholder="Property name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Unit</label>
                            <input
                                type="text"
                                value={formData.unit}
                                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                placeholder="Unit number"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows="3"
                            placeholder="Additional details..."
                        />
                    </div>
                    
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Create Event
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Helper function for event colors
const getEventTypeColor = (type) => {
    const colors = {
        inspection: '#3b82f6',
        lease: '#10b981',
        maintenance: '#f59e0b',
        showing: '#8b5cf6',
        move_in: '#059669',
        move_out: '#dc2626',
        meeting: '#6b7280'
    };
    return colors[type] || colors.meeting;
};

// Export component
window.AppModules = window.AppModules || {};
window.AppModules.SimpleCalendar = SimpleCalendar;