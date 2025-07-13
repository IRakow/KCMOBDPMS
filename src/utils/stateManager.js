// Centralized State Management System
class StateManager {
  constructor() {
    this.stores = new Map();
    this.listeners = new Map();
    this.middleware = [];
    this.devtools = window.__REDUX_DEVTOOLS_EXTENSION__?.connect?.({
      name: 'Property Management System'
    });
  }

  // Create a new store
  createStore(name, initialState = {}, reducers = {}) {
    if (this.stores.has(name)) {
      console.warn(`Store '${name}' already exists. Overwriting...`);
    }

    const store = {
      name,
      state: { ...initialState },
      reducers: { ...reducers },
      subscribers: new Set()
    };

    this.stores.set(name, store);
    this.listeners.set(name, new Set());

    // Notify devtools
    if (this.devtools) {
      this.devtools.send(`INIT_STORE_${name}`, store.state);
    }

    return this.getStoreAPI(name);
  }

  // Get store API for components
  getStoreAPI(storeName) {
    const store = this.stores.get(storeName);
    if (!store) {
      throw new Error(`Store '${storeName}' not found`);
    }

    return {
      // Get current state
      getState: () => ({ ...store.state }),
      
      // Subscribe to state changes
      subscribe: (listener) => {
        const listeners = this.listeners.get(storeName);
        listeners.add(listener);
        
        // Return unsubscribe function
        return () => {
          listeners.delete(listener);
        };
      },
      
      // Dispatch action
      dispatch: (action) => {
        this.dispatch(storeName, action);
      },
      
      // React hook for easy integration
      useState: () => {
        const [state, setState] = React.useState(store.state);
        
        React.useEffect(() => {
          const unsubscribe = this.subscribe(storeName, setState);
          return unsubscribe;
        }, []);
        
        return [state, (action) => this.dispatch(storeName, action)];
      }
    };
  }

  // Subscribe to store changes
  subscribe(storeName, listener) {
    const listeners = this.listeners.get(storeName);
    if (!listeners) {
      throw new Error(`Store '${storeName}' not found`);
    }
    
    listeners.add(listener);
    
    return () => {
      listeners.delete(listener);
    };
  }

  // Dispatch action to store
  dispatch(storeName, action) {
    const store = this.stores.get(storeName);
    if (!store) {
      throw new Error(`Store '${storeName}' not found`);
    }

    const { type, payload } = action;
    const reducer = store.reducers[type];
    
    if (!reducer && type !== '@@INIT') {
      console.warn(`No reducer found for action type '${type}' in store '${storeName}'`);
      return;
    }

    // Apply middleware
    let processedAction = action;
    for (const middleware of this.middleware) {
      processedAction = middleware(store.state, processedAction, storeName);
    }

    // Execute reducer
    const previousState = { ...store.state };
    if (reducer) {
      store.state = reducer(store.state, processedAction);
    }

    // Notify subscribers
    const listeners = this.listeners.get(storeName);
    listeners.forEach(listener => {
      listener({ ...store.state });
    });

    // Notify devtools
    if (this.devtools) {
      this.devtools.send(`${storeName}/${type}`, store.state);
    }

    // Log state changes in development
    if (typeof process === 'undefined' || !process.env || process.env.NODE_ENV !== 'production') {
      console.group(`🏪 ${storeName} Store Update`);
      console.log('Action:', processedAction);
      console.log('Previous State:', previousState);
      console.log('New State:', store.state);
      console.groupEnd();
    }
  }

  // Add middleware
  use(middleware) {
    this.middleware.push(middleware);
  }

  // Get all stores (for debugging)
  getAllStores() {
    const result = {};
    this.stores.forEach((store, name) => {
      result[name] = { ...store.state };
    });
    return result;
  }

  // Reset store to initial state
  reset(storeName) {
    const store = this.stores.get(storeName);
    if (!store) {
      throw new Error(`Store '${storeName}' not found`);
    }

    this.dispatch(storeName, { type: '@@RESET' });
  }

  // Persist store to localStorage
  persist(storeName, key) {
    const store = this.stores.get(storeName);
    if (!store) return;

    const persistKey = key || `app_store_${storeName}`;
    
    // Save current state
    localStorage.setItem(persistKey, JSON.stringify(store.state));
    
    // Subscribe to future changes
    this.subscribe(storeName, (state) => {
      localStorage.setItem(persistKey, JSON.stringify(state));
    });
  }

  // Restore store from localStorage
  restore(storeName, key) {
    const persistKey = key || `app_store_${storeName}`;
    const savedState = localStorage.getItem(persistKey);
    
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        this.dispatch(storeName, { 
          type: '@@RESTORE', 
          payload: state 
        });
        return true;
      } catch (error) {
        console.error(`Failed to restore state for store '${storeName}':`, error);
        localStorage.removeItem(persistKey);
      }
    }
    return false;
  }
}

// Built-in middleware
const loggerMiddleware = (state, action, storeName) => {
  if (action.type.startsWith('@@')) return action;
  
  console.log(`📤 [${storeName}] ${action.type}`, action.payload);
  return action;
};

const timestampMiddleware = (state, action, storeName) => {
  return {
    ...action,
    timestamp: Date.now()
  };
};

// Create global state manager
window.stateManager = new StateManager();

// Add default middleware in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.stateManager.use(timestampMiddleware);
  window.stateManager.use(loggerMiddleware);
}

// Export for module system
window.AppModules = window.AppModules || {};
window.AppModules.StateManager = StateManager;