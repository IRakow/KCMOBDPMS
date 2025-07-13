// Authentication Store
const authInitialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: localStorage.getItem('access_token'),
  loginAttempts: 0,
  lastLogin: null
};

const authReducers = {
  // Authentication actions
  LOGIN_START: (state, action) => ({
    ...state,
    isLoading: true,
    error: null
  }),

  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    user: action.payload.user,
    token: action.payload.token,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    loginAttempts: 0,
    lastLogin: new Date().toISOString()
  }),

  LOGIN_FAILURE: (state, action) => ({
    ...state,
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: action.payload.error,
    loginAttempts: state.loginAttempts + 1
  }),

  LOGOUT: (state) => ({
    ...authInitialState,
    isLoading: false,
    token: null
  }),

  SET_USER: (state, action) => ({
    ...state,
    user: action.payload.user,
    isAuthenticated: true,
    isLoading: false
  }),

  CLEAR_ERROR: (state) => ({
    ...state,
    error: null
  }),

  SET_LOADING: (state, action) => ({
    ...state,
    isLoading: action.payload
  }),

  // Restore from localStorage
  '@@RESTORE': (state, action) => ({
    ...state,
    ...action.payload
  }),

  // Reset to initial state
  '@@RESET': () => ({ ...authInitialState, isLoading: false })
};

// Action creators
const authActions = {
  loginStart: () => ({ type: 'LOGIN_START' }),
  
  loginSuccess: (user, token) => ({
    type: 'LOGIN_SUCCESS',
    payload: { user, token }
  }),
  
  loginFailure: (error) => ({
    type: 'LOGIN_FAILURE',
    payload: { error }
  }),
  
  logout: () => ({ type: 'LOGOUT' }),
  
  setUser: (user) => ({
    type: 'SET_USER',
    payload: { user }
  }),
  
  clearError: () => ({ type: 'CLEAR_ERROR' }),
  
  setLoading: (isLoading) => ({
    type: 'SET_LOADING',
    payload: isLoading
  })
};

// Enhanced auth manager with state integration
class EnhancedAuthManager {
  constructor() {
    this.store = window.stateManager.createStore('auth', authInitialState, authReducers);
    
    // Restore persisted state
    window.stateManager.restore('auth');
    
    // Persist state changes
    window.stateManager.persist('auth');
    
    // Check authentication on init
    this.checkAuth();
  }

  async login(email, password) {
    this.store.dispatch(authActions.loginStart());
    
    try {
      const response = await window.apiClient.login(email, password);
      
      this.store.dispatch(authActions.loginSuccess(response.user, response.access_token));
      
      return {
        success: true,
        portal: this.getPortalRoute(),
        user: response.user
      };
    } catch (error) {
      this.store.dispatch(authActions.loginFailure(error.message));
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkAuth() {
    const { token } = this.store.getState();
    
    if (!token) {
      this.store.dispatch(authActions.setLoading(false));
      return false;
    }

    try {
      const response = await window.apiClient.getCurrentUser();
      this.store.dispatch(authActions.setUser(response.user));
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  logout() {
    window.apiClient.logout();
    this.store.dispatch(authActions.logout());
    localStorage.removeItem('app_store_auth');
    window.location.href = '/';
  }

  getUser() {
    return this.store.getState().user;
  }

  getPortalRoute() {
    const user = this.getUser();
    if (!user) return '/';
    
    const PORTAL_ROUTES = {
      super_admin: '/',
      property_owner: '/',
      administrator: '/',
      property_manager: '/',
      maintenance_staff: '/',
      vendor: '/',
      resident: '/'
    };
    
    return PORTAL_ROUTES[user.role] || '/dashboard';
  }

  // React hook for components
  useAuth() {
    return this.store.useState();
  }

  // Subscribe to auth changes
  subscribe(listener) {
    return this.store.subscribe(listener);
  }

  clearError() {
    this.store.dispatch(authActions.clearError());
  }
}

// Initialize enhanced auth manager
window.enhancedAuthManager = new EnhancedAuthManager();

// Export for module system
window.AppModules = window.AppModules || {};
window.AppModules.authStore = {
  authInitialState,
  authReducers,
  authActions,
  EnhancedAuthManager
};