// QuantumCalendar.jsx - The Calendar Google Wishes They Built
const QuantumCalendar = () => {
    const [view, setView] = React.useState('quantum'); // quantum, timeline, spatial, predictive
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [events, setEvents] = React.useState([]);
    const [aiPredictions, setAiPredictions] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        loadEvents();
    }, [selectedDate, view]);
    
    const loadEvents = async () => {
        try {
            setLoading(true);
            const response = await window.ApiService.get('/calendar/events', {
                params: {
                    date: selectedDate.toISOString(),
                    view: view
                }
            });
            setEvents(response.events || []);
            setAiPredictions(response.predictions || []);
        } catch (error) {
            console.error('Failed to load events:', error);
            // Use mock data for development
            setEvents(getMockEvents());
            setAiPredictions(getMockPredictions());
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="quantum-calendar">
            {/* Holographic Header */}
            <div className="calendar-header-holographic">
                <div className="header-depth-layers">
                    <div className="layer-back"></div>
                    <div className="layer-mid"></div>
                    <div className="layer-front">
                        <h1 className="calendar-title">Quantum Calendar</h1>
                        <p className="calendar-subtitle">AI predicts your future schedule</p>
                    </div>
                </div>
                
                {/* View Switcher - Like Tony Stark's UI */}
                <div className="view-switcher-3d">
                    <button 
                        className={`view-btn ${view === 'quantum' ? 'active' : ''}`}
                        onClick={() => setView('quantum')}
                    >
                        <div className="btn-hologram">
                            <i className="fas fa-atom"></i>
                            <span>Quantum</span>
                        </div>
                    </button>
                    <button 
                        className={`view-btn ${view === 'timeline' ? 'active' : ''}`}
                        onClick={() => setView('timeline')}
                    >
                        <div className="btn-hologram">
                            <i className="fas fa-stream"></i>
                            <span>Timeline</span>
                        </div>
                    </button>
                    <button 
                        className={`view-btn ${view === 'spatial' ? 'active' : ''}`}
                        onClick={() => setView('spatial')}
                    >
                        <div className="btn-hologram">
                            <i className="fas fa-cube"></i>
                            <span>3D View</span>
                        </div>
                    </button>
                    <button 
                        className={`view-btn ${view === 'predictive' ? 'active' : ''}`}
                        onClick={() => setView('predictive')}
                    >
                        <div className="btn-hologram">
                            <i className="fas fa-brain"></i>
                            <span>AI Predict</span>
                        </div>
                    </button>
                </div>
            </div>
            
            {/* Main Calendar Views */}
            {view === 'quantum' && <QuantumView events={events} predictions={aiPredictions} />}
            {view === 'timeline' && <TimelineView events={events} selectedDate={selectedDate} />}
            {view === 'spatial' && <SpatialView events={events} />}
            {view === 'predictive' && <PredictiveView predictions={aiPredictions} />}
            
            {/* Smart Event Creator FAB */}
            <SmartEventCreator onEventCreated={loadEvents} />
        </div>
    );
};

// QUANTUM VIEW - Multiple Timelines at Once
const QuantumView = ({ events, predictions }) => {
    const categorizeEvents = () => {
        const now = new Date();
        const past = [];
        const present = [];
        const future = [];
        
        events.forEach(event => {
            const eventDate = new Date(event.start_time);
            const diff = eventDate - now;
            const hoursDiff = diff / (1000 * 60 * 60);
            
            if (hoursDiff < -1) {
                past.push(event);
            } else if (hoursDiff >= -1 && hoursDiff <= 1) {
                present.push(event);
            } else {
                future.push(event);
            }
        });
        
        return { past, present, future };
    };
    
    const { past, present, future } = categorizeEvents();
    
    return (
        <div className="quantum-view">
            {/* Floating Time Ribbons */}
            <div className="time-ribbons">
                <div className="ribbon past">
                    <h3>Past Events</h3>
                    <div className="events-flow">
                        {past.map(event => (
                            <EventCard key={event.id} {...event} status="completed" />
                        ))}
                        {past.length === 0 && (
                            <div className="empty-state">No recent events</div>
                        )}
                    </div>
                </div>
                
                <div className="ribbon present">
                    <h3>Now</h3>
                    <div className="events-flow active">
                        {present.map(event => (
                            <EventCard key={event.id} {...event} status="active" pulse={true} />
                        ))}
                        {present.length === 0 && (
                            <div className="empty-state">No ongoing events</div>
                        )}
                    </div>
                </div>
                
                <div className="ribbon future">
                    <h3>Future</h3>
                    <div className="events-flow">
                        {future.map(event => (
                            <EventCard key={event.id} {...event} status="upcoming" />
                        ))}
                        {future.length === 0 && (
                            <div className="empty-state">No upcoming events</div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Quantum Grid - Shows Multiple Possible Timelines */}
            <div className="quantum-grid">
                <div className="timeline-strand primary">
                    <h4>Primary Timeline</h4>
                    <div className="events-quantum">
                        <div className="quantum-path">
                            {events.slice(0, 5).map((event, idx) => (
                                <div key={event.id} className="quantum-node" style={{left: `${idx * 20}%`}}>
                                    <div className="node-content">
                                        <i className={`fas ${getEventIcon(event.type)}`}></i>
                                    </div>
                                    <div className="node-label">{event.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {predictions.length > 0 && (
                    <div className="timeline-strand alternate">
                        <h4>AI Predicted Timeline</h4>
                        <div className="events-quantum altered">
                            <div className="quantum-path">
                                {predictions.slice(0, 5).map((prediction, idx) => (
                                    <div key={prediction.id} className="quantum-node predicted" style={{left: `${idx * 20}%`}}>
                                        <div className="node-content">
                                            <i className="fas fa-robot"></i>
                                        </div>
                                        <div className="node-label">{prediction.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Event Card Component
const EventCard = ({ id, type, title, time, property, status, pulse, description }) => {
    const timeStr = React.useMemo(() => {
        if (typeof time === 'string') return time;
        return formatTimeAgo(time);
    }, [time]);
    
    return (
        <div className={`event-card ${status}`} data-pulse={pulse}>
            <div className="event-header">
                <div className={`event-icon ${type}`}>
                    <i className={`fas ${getEventIcon(type)}`}></i>
                </div>
                <div className="event-info">
                    <h4>{title}</h4>
                    <p className="event-property">{property}</p>
                </div>
            </div>
            {description && <p className="event-description">{description}</p>}
            <div className="event-footer">
                <span className="event-time">
                    <i className="far fa-clock"></i> {timeStr}
                </span>
                <span className={`event-status ${status}`}>{status}</span>
            </div>
        </div>
    );
};

// TIMELINE VIEW - Gorgeous Horizontal Flow
const TimelineView = ({ events, selectedDate }) => {
    const [zoomLevel, setZoomLevel] = React.useState(1);
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const timelineRef = React.useRef(null);
    
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute
        
        return () => clearInterval(timer);
    }, []);
    
    const jumpToNow = () => {
        if (timelineRef.current) {
            const nowPosition = calculateTimePosition(currentTime);
            timelineRef.current.scrollLeft = nowPosition - window.innerWidth / 2;
        }
    };
    
    const calculateTimePosition = (time) => {
        const hours = time.getHours();
        const minutes = time.getMinutes();
        return (hours * 200) + (minutes * 200 / 60); // 200px per hour
    };
    
    const groupEventsByProperty = () => {
        const grouped = {};
        events.forEach(event => {
            const property = event.property_name || 'Unassigned';
            if (!grouped[property]) {
                grouped[property] = [];
            }
            grouped[property].push(event);
        });
        return grouped;
    };
    
    const propertyEvents = groupEventsByProperty();
    
    return (
        <div className="timeline-view">
            {/* Time Navigator */}
            <div className="time-navigator">
                <button className="time-jump" onClick={jumpToNow}>
                    <i className="fas fa-crosshairs"></i>
                    Now
                </button>
                
                <div className="zoom-control">
                    <button onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.2))}>
                        <i className="fas fa-search-minus"></i>
                    </button>
                    <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.2))}>
                        <i className="fas fa-search-plus"></i>
                    </button>
                </div>
            </div>
            
            {/* Infinite Scrolling Timeline */}
            <div 
                className="timeline-container" 
                ref={timelineRef}
                style={{transform: `scale(${zoomLevel})`}}
            >
                <div className="timeline-track">
                    {/* Property Lanes */}
                    {Object.entries(propertyEvents).map(([property, events]) => (
                        <div key={property} className="property-lane">
                            <div className="lane-header">
                                <div className="property-icon">
                                    <i className="fas fa-building"></i>
                                </div>
                                <span>{property}</span>
                            </div>
                            <div className="events-track">
                                {events.map(event => (
                                    <TimelineEvent key={event.id} {...event} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Time Markers */}
                <div className="time-markers">
                    <div 
                        className="current-time-indicator" 
                        style={{left: `${calculateTimePosition(currentTime)}px`}}
                    />
                    {generateTimeMarkers()}
                </div>
            </div>
        </div>
    );
};

// Timeline Event Component
const TimelineEvent = ({ id, start_time, duration = 60, title, type, assignee }) => {
    const startDate = new Date(start_time);
    const left = (startDate.getHours() * 200) + (startDate.getMinutes() * 200 / 60);
    const width = (duration / 60) * 200; // Convert minutes to pixels
    
    return (
        <div 
            className={`timeline-event ${type}`}
            style={{ left: `${left}px`, width: `${width}px` }}
        >
            <div className="event-content">
                <h5>{title}</h5>
                {assignee && <p className="event-assignee">{assignee}</p>}
            </div>
            <div className="event-time-label">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    );
};

// 3D SPATIAL VIEW - Mind-Blowing
const SpatialView = ({ events }) => {
    const canvasRef = React.useRef(null);
    const [selectedEvent, setSelectedEvent] = React.useState(null);
    
    React.useEffect(() => {
        // Initialize Three.js 3D calendar
        if (canvasRef.current) {
            init3DCalendar(canvasRef.current, events);
        }
    }, [events]);
    
    return (
        <div className="spatial-view">
            <div className="controls-overlay">
                <div className="spatial-controls">
                    <button><i className="fas fa-arrows-alt"></i> Rotate</button>
                    <button><i className="fas fa-search-plus"></i> Zoom</button>
                    <button><i className="fas fa-layer-group"></i> Layers</button>
                </div>
            </div>
            
            <canvas ref={canvasRef} id="spatial-calendar"></canvas>
            
            {/* Floating Event Details */}
            {selectedEvent && (
                <div className="floating-event-details">
                    <div className="holographic-card">
                        <h3>{selectedEvent.title}</h3>
                        <p>{selectedEvent.description}</p>
                        <div className="event-meta">
                            <span><i className="fas fa-building"></i> {selectedEvent.property}</span>
                            <span><i className="fas fa-clock"></i> {selectedEvent.time}</span>
                        </div>
                        <button onClick={() => setSelectedEvent(null)}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            )}
            
            {/* 3D View Placeholder */}
            <div className="spatial-placeholder">
                <div className="orbit-container">
                    <div className="orbit orbit-1">
                        <div className="planet event-planet">
                            <i className="fas fa-calendar"></i>
                        </div>
                    </div>
                    <div className="orbit orbit-2">
                        <div className="planet event-planet">
                            <i className="fas fa-clock"></i>
                        </div>
                    </div>
                    <div className="orbit orbit-3">
                        <div className="planet event-planet">
                            <i className="fas fa-bell"></i>
                        </div>
                    </div>
                </div>
                <p className="spatial-hint">3D visualization coming soon</p>
            </div>
        </div>
    );
};

// AI PREDICTIVE VIEW - The Future
const PredictiveView = ({ predictions: initialPredictions }) => {
    const [predictions, setPredictions] = React.useState(initialPredictions || []);
    const [confidence, setConfidence] = React.useState({});
    const [insights, setInsights] = React.useState([]);
    
    React.useEffect(() => {
        generateAIPredictions();
    }, []);
    
    const generateAIPredictions = async () => {
        try {
            const response = await window.ApiService.get('/calendar/ai-predictions');
            setPredictions(response.predictions || getMockPredictions());
            setInsights(response.insights || getMockInsights());
        } catch (error) {
            // Use mock data
            setPredictions(getMockPredictions());
            setInsights(getMockInsights());
        }
    };
    
    const acceptPrediction = async (prediction) => {
        try {
            await window.ApiService.post('/calendar/events', {
                ...prediction,
                ai_generated: true
            });
            // Refresh predictions
            generateAIPredictions();
        } catch (error) {
            console.error('Failed to accept prediction:', error);
        }
    };
    
    return (
        <div className="predictive-view">
            {/* AI Insights Panel */}
            <div className="ai-insights-panel">
                <div className="ai-brain-visual">
                    <div className="neural-network">
                        <svg viewBox="0 0 300 300" className="neural-svg">
                            {/* Neural network visualization */}
                            <circle cx="150" cy="150" r="80" fill="none" stroke="rgba(88, 199, 250, 0.3)" strokeWidth="2">
                                <animate attributeName="r" values="80;90;80" dur="3s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="150" cy="150" r="60" fill="none" stroke="rgba(167, 123, 243, 0.3)" strokeWidth="2">
                                <animate attributeName="r" values="60;70;60" dur="2.5s" repeatCount="indefinite" />
                            </circle>
                            <circle cx="150" cy="150" r="40" fill="none" stroke="rgba(255, 107, 107, 0.3)" strokeWidth="2">
                                <animate attributeName="r" values="40;50;40" dur="2s" repeatCount="indefinite" />
                            </circle>
                        </svg>
                    </div>
                </div>
                
                <div className="insights-cards">
                    {insights.map((insight, idx) => (
                        <InsightCard key={idx} {...insight} />
                    ))}
                </div>
            </div>
            
            {/* Predicted Calendar */}
            <div className="predicted-calendar">
                <h3>AI-Generated Optimal Schedule</h3>
                <div className="prediction-timeline">
                    {predictions.map(prediction => (
                        <PredictedEvent
                            key={prediction.id}
                            {...prediction}
                            onAccept={() => acceptPrediction(prediction)}
                            onModify={() => modifyPrediction(prediction)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Insight Card Component
const InsightCard = ({ type, title, description, action, confidence }) => {
    return (
        <div className="insight-card" data-type={type}>
            <div className="insight-header">
                <div className={`insight-icon ${type}`}>
                    <i className={`fas ${getInsightIcon(type)}`}></i>
                </div>
                <div className="confidence-meter">
                    <div className="confidence-circle" style={{'--confidence': `${confidence}%`}}>
                        {confidence}%
                    </div>
                </div>
            </div>
            <h4>{title}</h4>
            <p>{description}</p>
            {action && (
                <button className="insight-action">
                    {action} <i className="fas fa-arrow-right"></i>
                </button>
            )}
        </div>
    );
};

// Predicted Event Component
const PredictedEvent = ({ id, title, description, suggested_time, reason, confidence, onAccept, onModify }) => {
    const formattedTime = new Date(suggested_time).toLocaleString();
    
    return (
        <div className="predicted-event">
            <div className="prediction-header">
                <h4>{title}</h4>
                <div className="confidence-badge" style={{'--confidence': confidence}}>
                    {confidence}% confident
                </div>
            </div>
            <p className="prediction-description">{description}</p>
            <div className="prediction-meta">
                <span><i className="fas fa-clock"></i> {formattedTime}</span>
                <span className="ai-reason"><i className="fas fa-lightbulb"></i> {reason}</span>
            </div>
            <div className="prediction-actions">
                <button className="accept-btn" onClick={onAccept}>
                    <i className="fas fa-check"></i> Accept
                </button>
                <button className="modify-btn" onClick={onModify}>
                    <i className="fas fa-edit"></i> Modify
                </button>
            </div>
        </div>
    );
};

// Smart Event Creator
const SmartEventCreator = ({ onEventCreated }) => {
    const [isCreating, setIsCreating] = React.useState(false);
    const [eventType, setEventType] = React.useState('');
    const [aiSuggestions, setAiSuggestions] = React.useState([]);
    const [formData, setFormData] = React.useState({
        title: '',
        type: '',
        date: '',
        time: '',
        duration: 60,
        property: '',
        description: ''
    });
    
    const handleVoiceInput = () => {
        // Initialize voice recognition
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                parseNaturalLanguage(transcript);
            };
            
            recognition.start();
        }
    };
    
    const parseNaturalLanguage = async (text) => {
        try {
            const response = await window.ApiService.post('/calendar/parse-natural', { text });
            setFormData({
                ...formData,
                ...response.parsed_data
            });
        } catch (error) {
            console.error('Failed to parse natural language:', error);
        }
    };
    
    const createEvent = async () => {
        try {
            await window.ApiService.post('/calendar/events', formData);
            setIsCreating(false);
            onEventCreated();
        } catch (error) {
            console.error('Failed to create event:', error);
        }
    };
    
    return (
        <div className="smart-event-creator">
            <button 
                className="create-event-fab"
                onClick={() => setIsCreating(true)}
            >
                <div className="fab-layers">
                    <i className="fas fa-plus"></i>
                    <div className="fab-ring"></div>
                </div>
            </button>
            
            {isCreating && (
                <div className="creation-panel">
                    <div className="creation-header">
                        <h3>Create Event</h3>
                        <div className="header-actions">
                            <button onClick={handleVoiceInput} className="voice-btn">
                                <i className="fas fa-microphone"></i>
                                Voice Input
                            </button>
                            <button onClick={() => setIsCreating(false)} className="close-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="smart-suggestions">
                        <h4>AI Suggestions based on your patterns:</h4>
                        <div className="suggestion-cards">
                            <SuggestionCard
                                title="Schedule Monthly Inspections"
                                description="You usually inspect properties on the first Monday"
                                onClick={() => setFormData({
                                    ...formData,
                                    title: 'Monthly Property Inspection',
                                    type: 'inspection',
                                    duration: 120
                                })}
                            />
                            <SuggestionCard
                                title="Batch Maintenance Windows"
                                description="Group similar repairs for efficiency"
                                onClick={() => setFormData({
                                    ...formData,
                                    title: 'Maintenance Window',
                                    type: 'maintenance',
                                    duration: 240
                                })}
                            />
                        </div>
                    </div>
                    
                    <div className="quick-templates">
                        {['Showing', 'Maintenance', 'Inspection', 'Meeting', 'Deadline'].map(type => (
                            <button 
                                key={type}
                                className={`template-btn ${eventType === type ? 'active' : ''}`}
                                onClick={() => {
                                    setEventType(type);
                                    setFormData({ ...formData, type: type.toLowerCase() });
                                }}
                            >
                                <div className="template-icon">
                                    <i className={`fas ${getEventIcon(type.toLowerCase())}`}></i>
                                </div>
                                <span>{type}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="event-form">
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="form-input"
                        />
                        
                        <div className="form-row">
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                className="form-input"
                            />
                            <input
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({...formData, time: e.target.value})}
                                className="form-input"
                            />
                        </div>
                        
                        <select
                            value={formData.property}
                            onChange={(e) => setFormData({...formData, property: e.target.value})}
                            className="form-input"
                        >
                            <option value="">Select Property</option>
                            <option value="sunset-apartments">Sunset Apartments</option>
                            <option value="downtown-plaza">Downtown Plaza</option>
                            <option value="garden-complex">Garden Complex</option>
                        </select>
                        
                        <textarea
                            placeholder="Description (optional)"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="form-input"
                            rows="3"
                        />
                        
                        <button className="create-btn" onClick={createEvent}>
                            Create Event
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Suggestion Card Component
const SuggestionCard = ({ title, description, onClick }) => {
    return (
        <div className="suggestion-card" onClick={onClick}>
            <h5>{title}</h5>
            <p>{description}</p>
        </div>
    );
};

// Helper Functions
const getEventIcon = (type) => {
    const icons = {
        maintenance: 'fa-tools',
        showing: 'fa-eye',
        inspection: 'fa-clipboard-check',
        meeting: 'fa-users',
        deadline: 'fa-calendar-check',
        lease: 'fa-file-contract',
        payment: 'fa-dollar-sign'
    };
    return icons[type] || 'fa-calendar';
};

const getInsightIcon = (type) => {
    const icons = {
        warning: 'fa-exclamation-triangle',
        opportunity: 'fa-lightbulb',
        pattern: 'fa-chart-line',
        recommendation: 'fa-thumbs-up'
    };
    return icons[type] || 'fa-info-circle';
};

const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
};

const generateTimeMarkers = () => {
    const markers = [];
    for (let hour = 0; hour < 24; hour++) {
        markers.push(
            <div key={hour} className="time-marker" style={{left: `${hour * 200}px`}}>
                <span>{hour}:00</span>
            </div>
        );
    }
    return markers;
};

const init3DCalendar = (canvas, events) => {
    // Three.js initialization would go here
    console.log('Initializing 3D calendar with', events.length, 'events');
};

// Mock Data Functions
const getMockEvents = () => {
    return [
        {
            id: '1',
            type: 'maintenance',
            title: 'HVAC Repair Completed',
            start_time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            property_name: 'Sunset Apartments',
            description: 'Annual HVAC maintenance completed successfully'
        },
        {
            id: '2',
            type: 'showing',
            title: 'Property Tour - Unit 205',
            start_time: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
            property_name: 'Downtown Plaza',
            description: 'Prospective tenant viewing'
        },
        {
            id: '3',
            type: 'lease',
            title: 'Lease Renewal Due',
            start_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
            property_name: 'Garden Complex',
            description: 'Unit 302 lease expires in 2 weeks'
        }
    ];
};

const getMockPredictions = () => {
    return [
        {
            id: 'p1',
            title: 'Schedule HVAC Inspection',
            description: 'Based on maintenance history, HVAC systems need inspection',
            suggested_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
            reason: 'Quarterly maintenance due',
            confidence: 85
        },
        {
            id: 'p2',
            title: 'Optimize Showing Times',
            description: 'Best time slots for property tours based on conversion data',
            suggested_time: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
            reason: 'Historical data shows 40% higher conversion',
            confidence: 92
        }
    ];
};

const getMockInsights = () => {
    return [
        {
            type: 'warning',
            title: 'Maintenance Surge Predicted',
            description: 'AI detects 73% chance of increased HVAC issues next month due to weather patterns',
            action: 'Pre-schedule technicians',
            confidence: 73
        },
        {
            type: 'opportunity',
            title: 'Optimal Showing Times',
            description: 'AI suggests scheduling tours Tue/Thu 2-4pm for 40% higher conversion',
            action: 'Auto-optimize schedule',
            confidence: 89
        },
        {
            type: 'pattern',
            title: 'Tenant Behavior Pattern',
            description: 'Renewal likelihood increases 60% with maintenance response under 24hrs',
            action: 'View analytics',
            confidence: 95
        }
    ];
};

// Register component
window.AppModules = window.AppModules || {};
window.AppModules.QuantumCalendar = QuantumCalendar;