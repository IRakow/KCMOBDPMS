// React hooks for store integration
window.AppModules = window.AppModules || {};

// Generic store hook
function useStore(storeName) {
  const store = window.stateManager.getStoreAPI(storeName);
  return store.useState();
}

// Auth hook
function useAuth() {
  const [authState, dispatch] = useStore('auth');
  
  const login = React.useCallback(async (email, password) => {
    return await window.enhancedAuthManager.login(email, password);
  }, []);
  
  const logout = React.useCallback(() => {
    window.enhancedAuthManager.logout();
  }, []);
  
  const clearError = React.useCallback(() => {
    window.enhancedAuthManager.clearError();
  }, []);
  
  return {
    ...authState,
    login,
    logout,
    clearError
  };
}

// Dashboard hook
function useDashboard() {
  const [dashboardState, dispatch] = useStore('dashboard');
  
  const actions = React.useMemo(() => ({
    // Widget management
    addWidget: (type, x, y, width, height) => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.addWidget(type, x, y, width, height));
    },
    
    removeWidget: (id) => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.removeWidget(id));
    },
    
    moveWidget: (id, x, y) => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.moveWidget(id, x, y));
    },
    
    resizeWidget: (id, width, height) => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.resizeWidget(id, width, height));
    },
    
    updateWidget: (id, updates) => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.updateWidget(id, updates));
    },
    
    // UI state
    setEditMode: (editMode) => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.setEditMode(editMode));
    },
    
    setDraggingWidget: (widget) => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.setDraggingWidget(widget));
    },
    
    setSelectedWidget: (widget) => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.setSelectedWidget(widget));
    },
    
    // Data loading
    loadMetrics: () => {
      window.dashboardService.loadMetrics();
    },
    
    loadCalendar: () => {
      window.dashboardService.loadCalendar();
    },
    
    loadAll: () => {
      window.dashboardService.loadAll();
    },
    
    // Error handling
    clearError: () => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.clearError());
    },
    
    resetLayout: () => {
      dispatch(window.AppModules.dashboardStore.dashboardActions.resetLayout());
    }
  }), [dispatch]);
  
  return {
    ...dashboardState,
    ...actions
  };
}

// Widget-specific hooks
function useWidget(widgetId) {
  const { widgets, updateWidget, removeWidget, moveWidget, resizeWidget } = useDashboard();
  
  const widget = React.useMemo(() => 
    widgets.find(w => w.id === widgetId), 
    [widgets, widgetId]
  );
  
  const actions = React.useMemo(() => ({
    update: (updates) => updateWidget(widgetId, updates),
    remove: () => removeWidget(widgetId),
    move: (x, y) => moveWidget(widgetId, x, y),
    resize: (width, height) => resizeWidget(widgetId, width, height)
  }), [widgetId, updateWidget, removeWidget, moveWidget, resizeWidget]);
  
  return {
    widget,
    ...actions
  };
}

// Metrics hook with automatic updates
function useMetrics() {
  const { metrics, isLoadingMetrics, loadMetrics } = useDashboard();
  
  React.useEffect(() => {
    loadMetrics();
  }, []);
  
  return {
    metrics,
    isLoading: isLoadingMetrics,
    refresh: loadMetrics
  };
}

// Calendar hook
function useCalendar() {
  const { calendar, isLoadingCalendar, loadCalendar } = useDashboard();
  
  React.useEffect(() => {
    loadCalendar();
  }, []);
  
  return {
    calendar,
    isLoading: isLoadingCalendar,
    refresh: loadCalendar
  };
}

// Generic async action hook
function useAsyncAction(actionFn) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  const execute = React.useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await actionFn(...args);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [actionFn]);
  
  return {
    execute,
    isLoading,
    error,
    clearError: () => setError(null)
  };
}

// Local storage hook for preferences
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = React.useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  
  const setStoredValue = React.useCallback((newValue) => {
    try {
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  }, [key]);
  
  return [value, setStoredValue];
}

// Debounced value hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Previous value hook
function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

// Export all hooks
window.AppModules.hooks = {
  useStore,
  useAuth,
  useDashboard,
  useWidget,
  useMetrics,
  useCalendar,
  useAsyncAction,
  useLocalStorage,
  useDebounce,
  usePrevious
};