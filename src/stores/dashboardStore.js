// Dashboard Store
const dashboardInitialState = {
  // Widget management
  widgets: [
    { id: 'occupancy', type: 'occupancy', x: 0, y: 0, width: 1, height: 1, visible: true },
    { id: 'revenue', type: 'revenue', x: 1, y: 0, width: 1, height: 1, visible: true },
    { id: 'maintenance', type: 'maintenance', x: 2, y: 0, width: 1, height: 1, visible: true },
    { id: 'leases', type: 'leases', x: 3, y: 0, width: 1, height: 1, visible: true },
    { id: 'calendar', type: 'calendar', x: 0, y: 1, width: 2, height: 1, visible: true },
    { id: 'followups', type: 'followups', x: 2, y: 1, width: 2, height: 1, visible: true }
  ],
  
  // UI state
  editMode: false,
  draggingWidget: null,
  selectedWidget: null,
  gridSize: 4,
  
  // Data
  metrics: {
    occupancy: { rate: 0, occupied: 0, total: 0, change: 0 },
    revenue: { current: 0, target: 0, change: 0 },
    maintenance: { open: 0, urgent: 0, completed: 0 },
    leases: { expiring: 0, this_month: 0 }
  },
  
  calendar: {
    events: [],
    total_events: 0,
    next_event: null
  },
  
  notifications: [],
  
  // Loading states
  isLoading: false,
  isLoadingMetrics: false,
  isLoadingCalendar: false,
  error: null,
  lastUpdated: null
};

const dashboardReducers = {
  // Widget management
  ADD_WIDGET: (state, action) => {
    const newWidget = {
      id: `widget_${Date.now()}`,
      type: action.payload.type,
      x: action.payload.x || 0,
      y: action.payload.y || 0,
      width: action.payload.width || 1,
      height: action.payload.height || 1,
      visible: true
    };
    
    return {
      ...state,
      widgets: [...state.widgets, newWidget]
    };
  },

  REMOVE_WIDGET: (state, action) => ({
    ...state,
    widgets: state.widgets.filter(widget => widget.id !== action.payload.id)
  }),

  UPDATE_WIDGET: (state, action) => ({
    ...state,
    widgets: state.widgets.map(widget =>
      widget.id === action.payload.id
        ? { ...widget, ...action.payload.updates }
        : widget
    )
  }),

  MOVE_WIDGET: (state, action) => ({
    ...state,
    widgets: state.widgets.map(widget =>
      widget.id === action.payload.id
        ? { ...widget, x: action.payload.x, y: action.payload.y }
        : widget
    )
  }),

  RESIZE_WIDGET: (state, action) => ({
    ...state,
    widgets: state.widgets.map(widget =>
      widget.id === action.payload.id
        ? { ...widget, width: action.payload.width, height: action.payload.height }
        : widget
    )
  }),

  REORDER_WIDGETS: (state, action) => ({
    ...state,
    widgets: action.payload.widgets
  }),

  // UI state
  SET_EDIT_MODE: (state, action) => ({
    ...state,
    editMode: action.payload
  }),

  SET_DRAGGING_WIDGET: (state, action) => ({
    ...state,
    draggingWidget: action.payload
  }),

  SET_SELECTED_WIDGET: (state, action) => ({
    ...state,
    selectedWidget: action.payload
  }),

  // Data updates
  SET_METRICS: (state, action) => ({
    ...state,
    metrics: { ...state.metrics, ...action.payload },
    isLoadingMetrics: false,
    lastUpdated: new Date().toISOString()
  }),

  SET_CALENDAR: (state, action) => ({
    ...state,
    calendar: action.payload,
    isLoadingCalendar: false
  }),

  SET_NOTIFICATIONS: (state, action) => ({
    ...state,
    notifications: action.payload
  }),

  // Loading states
  SET_LOADING: (state, action) => ({
    ...state,
    isLoading: action.payload
  }),

  SET_LOADING_METRICS: (state, action) => ({
    ...state,
    isLoadingMetrics: action.payload
  }),

  SET_LOADING_CALENDAR: (state, action) => ({
    ...state,
    isLoadingCalendar: action.payload
  }),

  SET_ERROR: (state, action) => ({
    ...state,
    error: action.payload,
    isLoading: false,
    isLoadingMetrics: false,
    isLoadingCalendar: false
  }),

  CLEAR_ERROR: (state) => ({
    ...state,
    error: null
  }),

  // Bulk operations
  RESET_LAYOUT: (state) => ({
    ...state,
    widgets: dashboardInitialState.widgets,
    editMode: false,
    selectedWidget: null,
    draggingWidget: null
  }),

  // Restore/Reset
  '@@RESTORE': (state, action) => ({
    ...state,
    ...action.payload
  }),

  '@@RESET': () => ({ ...dashboardInitialState })
};

// Action creators
const dashboardActions = {
  // Widget actions
  addWidget: (type, x, y, width, height) => ({
    type: 'ADD_WIDGET',
    payload: { type, x, y, width, height }
  }),

  removeWidget: (id) => ({
    type: 'REMOVE_WIDGET',
    payload: { id }
  }),

  updateWidget: (id, updates) => ({
    type: 'UPDATE_WIDGET',
    payload: { id, updates }
  }),

  moveWidget: (id, x, y) => ({
    type: 'MOVE_WIDGET',
    payload: { id, x, y }
  }),

  resizeWidget: (id, width, height) => ({
    type: 'RESIZE_WIDGET',
    payload: { id, width, height }
  }),

  reorderWidgets: (widgets) => ({
    type: 'REORDER_WIDGETS',
    payload: { widgets }
  }),

  // UI actions
  setEditMode: (editMode) => ({
    type: 'SET_EDIT_MODE',
    payload: editMode
  }),

  setDraggingWidget: (widget) => ({
    type: 'SET_DRAGGING_WIDGET',
    payload: widget
  }),

  setSelectedWidget: (widget) => ({
    type: 'SET_SELECTED_WIDGET',
    payload: widget
  }),

  // Data actions
  setMetrics: (metrics) => ({
    type: 'SET_METRICS',
    payload: metrics
  }),

  setCalendar: (calendar) => ({
    type: 'SET_CALENDAR',
    payload: calendar
  }),

  setNotifications: (notifications) => ({
    type: 'SET_NOTIFICATIONS',
    payload: notifications
  }),

  // Loading actions
  setLoading: (loading) => ({
    type: 'SET_LOADING',
    payload: loading
  }),

  setLoadingMetrics: (loading) => ({
    type: 'SET_LOADING_METRICS',
    payload: loading
  }),

  setLoadingCalendar: (loading) => ({
    type: 'SET_LOADING_CALENDAR',
    payload: loading
  }),

  setError: (error) => ({
    type: 'SET_ERROR',
    payload: error
  }),

  clearError: () => ({
    type: 'CLEAR_ERROR'
  }),

  resetLayout: () => ({
    type: 'RESET_LAYOUT'
  })
};

// Dashboard service for data fetching
class DashboardService {
  constructor() {
    this.store = window.stateManager.createStore('dashboard', dashboardInitialState, dashboardReducers);
    
    // Restore persisted state (widgets layout, preferences)
    window.stateManager.restore('dashboard');
    
    // Persist widget layout changes
    window.stateManager.persist('dashboard');
    
    // Auto-refresh data every 30 seconds
    this.startAutoRefresh();
  }

  // Data fetching methods
  async loadMetrics() {
    this.store.dispatch(dashboardActions.setLoadingMetrics(true));
    
    try {
      const metrics = await window.apiClient.getDashboardMetrics();
      this.store.dispatch(dashboardActions.setMetrics(metrics));
    } catch (error) {
      this.store.dispatch(dashboardActions.setError(error.message));
    }
  }

  async loadCalendar() {
    this.store.dispatch(dashboardActions.setLoadingCalendar(true));
    
    try {
      const calendar = await window.apiClient.getCalendarEvents();
      this.store.dispatch(dashboardActions.setCalendar(calendar));
    } catch (error) {
      this.store.dispatch(dashboardActions.setError(error.message));
    }
  }

  async loadNotifications() {
    try {
      const notifications = await window.apiClient.getNotifications();
      this.store.dispatch(dashboardActions.setNotifications(notifications));
    } catch (error) {
      console.warn('Failed to load notifications:', error);
    }
  }

  async loadAll() {
    this.store.dispatch(dashboardActions.setLoading(true));
    
    try {
      await Promise.all([
        this.loadMetrics(),
        this.loadCalendar(),
        this.loadNotifications()
      ]);
    } catch (error) {
      this.store.dispatch(dashboardActions.setError(error.message));
    } finally {
      this.store.dispatch(dashboardActions.setLoading(false));
    }
  }

  // Auto-refresh functionality
  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      const state = this.store.getState();
      if (!state.isLoading && !state.editMode) {
        this.loadMetrics();
        this.loadCalendar();
      }
    }, 30000); // 30 seconds
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // React hook for components
  useDashboard() {
    return this.store.useState();
  }

  // Direct store access
  getStore() {
    return this.store;
  }

  // Subscribe to changes
  subscribe(listener) {
    return this.store.subscribe(listener);
  }
}

// Initialize dashboard service
window.dashboardService = new DashboardService();

// Export for module system
window.AppModules = window.AppModules || {};
window.AppModules.dashboardStore = {
  dashboardInitialState,
  dashboardReducers,
  dashboardActions,
  DashboardService
};