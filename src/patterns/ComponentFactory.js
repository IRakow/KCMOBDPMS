// Component Factory Pattern for consistent component structure
const ComponentFactory = (() => {
  // Private utilities shared across all components
  const privateUtils = {
    formatCurrency: (amount, currency = 'USD') => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      }).format(amount);
    },
    
    formatDate: (date, options = {}) => {
      const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
    },
    
    formatPercentage: (value, decimals = 1) => {
      return `${value.toFixed(decimals)}%`;
    },
    
    generateId: () => {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    classNames: (...classes) => {
      return classes.filter(Boolean).join(' ');
    },
    
    deepClone: (obj) => {
      return JSON.parse(JSON.stringify(obj));
    }
  };

  // Component state management helpers
  const stateHelpers = {
    useLocalState: (initialState) => {
      const [state, setState] = React.useState(initialState);
      
      const updateState = (updates) => {
        setState(prev => ({ ...prev, ...updates }));
      };
      
      const resetState = () => {
        setState(initialState);
      };
      
      return [state, updateState, resetState];
    },
    
    useAsyncState: (asyncFn, deps = []) => {
      const [state, setState] = React.useState({
        data: null,
        loading: true,
        error: null
      });
      
      React.useEffect(() => {
        let cancelled = false;
        
        const executeAsync = async () => {
          setState(prev => ({ ...prev, loading: true, error: null }));
          
          try {
            const result = await asyncFn();
            if (!cancelled) {
              setState({ data: result, loading: false, error: null });
            }
          } catch (error) {
            if (!cancelled) {
              setState({ data: null, loading: false, error: error.message });
            }
          }
        };
        
        executeAsync();
        
        return () => { cancelled = true; };
      }, deps);
      
      return state;
    }
  };

  // Performance optimization helpers
  const performanceHelpers = {
    memoize: (fn) => {
      const cache = new Map();
      return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
          return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
      };
    },
    
    withPerformanceTracking: (componentName, Component) => {
      return React.forwardRef((props, ref) => {
        React.useEffect(() => {
          if (window.PerformanceMonitor) {
            window.PerformanceMonitor.start(`${componentName}-mount`);
            return () => {
              window.PerformanceMonitor.end(`${componentName}-mount`);
            };
          }
        }, []);
        
        return React.createElement(Component, { ...props, ref });
      });
    }
  };

  // Factory function to create components with consistent patterns
  const createComponent = (name, config) => {
    const {
      privateHelpers = {},
      defaultProps = {},
      propTypes = {},
      withPerformanceTracking = false,
      withErrorBoundary = false
    } = config;
    
    return (componentFunction) => {
      // Combine private helpers with shared utilities
      const allHelpers = { ...privateUtils, ...stateHelpers, ...privateHelpers };
      
      // Create the component with access to helpers
      const Component = React.forwardRef((props, ref) => {
        // Merge with default props
        const finalProps = { ...defaultProps, ...props };
        
        // Performance tracking
        React.useEffect(() => {
          if (withPerformanceTracking && window.PerformanceMonitor) {
            window.PerformanceMonitor.start(`${name}-render`);
            return () => {
              window.PerformanceMonitor.end(`${name}-render`);
            };
          }
        });
        
        // Call the component function with helpers and props
        return componentFunction(finalProps, allHelpers, ref);
      });
      
      // Set display name for debugging
      Component.displayName = name;
      
      // Add prop types validation in development
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && Object.keys(propTypes).length > 0) {
        Component.propTypes = propTypes;
      }
      
      // Wrap with error boundary if requested
      if (withErrorBoundary) {
        return withComponentErrorBoundary(name, Component);
      }
      
      return Component;
    };
  };

  // Error boundary wrapper
  const withComponentErrorBoundary = (componentName, Component) => {
    class ComponentErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
      }
      
      static getDerivedStateFromError(error) {
        return { hasError: true, error };
      }
      
      componentDidCatch(error, errorInfo) {
        console.error(`Error in ${componentName}:`, error, errorInfo);
        
        // Send to error reporting service
        if (window.errorReporting) {
          window.errorReporting.captureException(error, {
            component: componentName,
            errorInfo
          });
        }
      }
      
      render() {
        if (this.state.hasError) {
          return React.createElement('div', {
            className: 'component-error',
            style: {
              padding: '16px',
              border: '1px solid #ff6b6b',
              borderRadius: '4px',
              backgroundColor: '#ffe0e0',
              color: '#d63031'
            }
          }, [
            React.createElement('h4', { key: 'title' }, `Error in ${componentName}`),
            React.createElement('p', { key: 'message' }, (this.state.error && this.state.error.message) || 'Unknown error'),
            React.createElement('button', {
              key: 'retry',
              onClick: () => this.setState({ hasError: false, error: null }),
              style: {
                marginTop: '8px',
                padding: '4px 8px',
                backgroundColor: '#d63031',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }
            }, 'Retry')
          ]);
        }
        
        return React.createElement(Component, this.props);
      }
    }
    
    ComponentErrorBoundary.displayName = `ErrorBoundary(${componentName})`;
    return ComponentErrorBoundary;
  };

  // Higher-order component for common functionality
  const withCommonProps = (Component) => {
    return React.forwardRef((props, ref) => {
      // Add common props that all components might need
      const commonProps = {
        theme: 'light', // Could come from context
        locale: 'en-US',
        ...props
      };
      
      return React.createElement(Component, { ...commonProps, ref });
    });
  };

  // Export factory and utilities
  return {
    createComponent,
    withCommonProps,
    withComponentErrorBoundary,
    privateUtils,
    stateHelpers,
    performanceHelpers
  };
})();

// Export for module system
window.AppModules = window.AppModules || {};
window.AppModules.ComponentFactory = ComponentFactory;