// Enhanced Development Tools
const EnhancedDevTools = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('overview');
  const [metrics, setMetrics] = React.useState({});
  const [logs, setLogs] = React.useState([]);
  const [networkRequests, setNetworkRequests] = React.useState([]);
  const [storeStates, setStoreStates] = React.useState({});

  // Real-time metrics collection
  React.useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = {
        cache: window.cache ? {
          size: window.cache.cache.size,
          stats: window.cache.getStats(),
          hitRate: window.cache.getStats().hitRate
        } : 'Not available',
        
        performance: window.PerformanceMonitor ? {
          score: window.PerformanceMonitor.calculatePerformanceScore(),
          slowest: window.PerformanceMonitor.getSlowestOperations(5),
          webVitals: window.PerformanceMonitor.getWebVitals()
        } : 'Not available',
        
        memory: performance.memory ? {
          used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
          total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
          limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
        } : 'Not available',
        
        stores: window.stateManager ? window.stateManager.getAllStores() : {},
        
        modules: Object.keys(window.AppModules || {}),
        
        api: {
          baseURL: window.api?.baseURL || 'Not available',
          hasToken: !!localStorage.getItem('access_token')
        }
      };
      
      setMetrics(newMetrics);
      setStoreStates(newMetrics.stores);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Console log interceptor
  React.useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type, args) => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => [...prev.slice(-49), {
        id: Date.now() + Math.random(),
        type,
        timestamp,
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ')
      }]);
    };

    console.log = (...args) => {
      addLog('log', args);
      originalLog.apply(console, args);
    };

    console.error = (...args) => {
      addLog('error', args);
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      addLog('warn', args);
      originalWarn.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Network request interceptor
  React.useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const [url, options] = args;
      
      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();
        
        setNetworkRequests(prev => [...prev.slice(-19), {
          id: Date.now() + Math.random(),
          url: typeof url === 'string' ? url : url.url,
          method: options?.method || 'GET',
          status: response.status,
          duration: endTime - startTime,
          timestamp: new Date(startTime).toLocaleTimeString(),
          success: response.ok
        }]);
        
        return response;
      } catch (error) {
        const endTime = Date.now();
        
        setNetworkRequests(prev => [...prev.slice(-19), {
          id: Date.now() + Math.random(),
          url: typeof url === 'string' ? url : url.url,
          method: options?.method || 'GET',
          status: 'Failed',
          duration: endTime - startTime,
          timestamp: new Date(startTime).toLocaleTimeString(),
          success: false,
          error: error.message
        }]);
        
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const tabs = [
    { id: 'overview', label: '📊 Overview', icon: '📊' },
    { id: 'performance', label: '⚡ Performance', icon: '⚡' },
    { id: 'cache', label: '💾 Cache', icon: '💾' },
    { id: 'state', label: '🗃️ State', icon: '🗃️' },
    { id: 'network', label: '🌐 Network', icon: '🌐' },
    { id: 'logs', label: '📝 Logs', icon: '📝' },
    { id: 'tools', label: '🛠️ Tools', icon: '🛠️' }
  ];

  const renderOverview = () => (
    <div className="dev-section">
      <div className="dev-grid">
        <div className="dev-card">
          <h4>🏗️ Architecture</h4>
          <p>Modules: {metrics.modules?.length || 0}</p>
          <p>Stores: {Object.keys(metrics.stores || {}).length}</p>
          <p>Cache Entries: {metrics.cache?.size || 0}</p>
        </div>
        
        <div className="dev-card">
          <h4>📈 Performance</h4>
          <p>Score: {metrics.performance?.score || 'N/A'}/100</p>
          <p>Memory: {metrics.memory?.used || 'N/A'}</p>
          <p>Cache Hit Rate: {metrics.cache?.hitRate || 'N/A'}</p>
        </div>
        
        <div className="dev-card">
          <h4>🔐 Authentication</h4>
          <p>Token: {metrics.api?.hasToken ? '✅ Present' : '❌ Missing'}</p>
          <p>API: {metrics.api?.baseURL || 'Not configured'}</p>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="dev-section">
      <h4>⚡ Performance Metrics</h4>
      {metrics.performance !== 'Not available' ? (
        <>
          <div className="dev-metric">
            <strong>Performance Score: {metrics.performance?.score || 0}/100</strong>
          </div>
          
          <h5>Slowest Operations:</h5>
          <div className="dev-list">
            {metrics.performance?.slowest?.map((op, i) => (
              <div key={i} className="dev-list-item">
                <span>{op.name}</span>
                <span className="dev-metric-value">{op.maxTime?.toFixed(2)}ms</span>
              </div>
            )) || []}
          </div>
          
          <h5>Web Vitals:</h5>
          <div className="dev-list">
            {Object.entries(metrics.performance?.webVitals || {}).map(([key, value]) => (
              <div key={key} className="dev-list-item">
                <span>{key}</span>
                <span className="dev-metric-value">{value?.avgTime?.toFixed(2) || 'N/A'}ms</span>
              </div>
            ))}
          </div>
          
          <button 
            className="dev-button"
            onClick={() => window.PerformanceMonitor?.export()}
          >
            📤 Export Performance Report
          </button>
        </>
      ) : (
        <p>Performance monitoring not available</p>
      )}
    </div>
  );

  const renderCache = () => (
    <div className="dev-section">
      <h4>💾 Cache Management</h4>
      {metrics.cache !== 'Not available' ? (
        <>
          <div className="dev-stats">
            <div>Size: {metrics.cache.size} entries</div>
            <div>Hit Rate: {metrics.cache.hitRate}</div>
            <div>Memory: {metrics.cache.stats?.memoryUsage || 'N/A'}</div>
          </div>
          
          <div className="dev-actions">
            <button 
              className="dev-button"
              onClick={() => {
                window.cache.clear();
                console.log('Cache cleared');
              }}
            >
              🗑️ Clear Cache
            </button>
            
            <button 
              className="dev-button"
              onClick={() => {
                const stats = window.cache.getStats();
                console.log('Cache Stats:', stats);
              }}
            >
              📊 Log Stats
            </button>
            
            <button 
              className="dev-button"
              onClick={() => {
                const data = window.cache.export();
                console.log('Cache Export:', data);
              }}
            >
              📤 Export Cache
            </button>
          </div>
        </>
      ) : (
        <p>Cache not available</p>
      )}
    </div>
  );

  const renderState = () => (
    <div className="dev-section">
      <h4>🗃️ Application State</h4>
      <div className="dev-state-viewer">
        {Object.entries(storeStates).map(([storeName, state]) => (
          <details key={storeName} className="dev-store">
            <summary>{storeName} Store</summary>
            <pre className="dev-code">{JSON.stringify(state, null, 2)}</pre>
          </details>
        ))}
      </div>
      
      <div className="dev-actions">
        <button 
          className="dev-button"
          onClick={() => {
            const allStores = window.stateManager?.getAllStores();
            console.log('All Store States:', allStores);
          }}
        >
          📝 Log All States
        </button>
      </div>
    </div>
  );

  const renderNetwork = () => (
    <div className="dev-section">
      <h4>🌐 Network Requests</h4>
      <div className="dev-network-list">
        {networkRequests.slice().reverse().map(req => (
          <div key={req.id} className={`dev-network-item ${req.success ? 'success' : 'error'}`}>
            <div className="dev-network-method">{req.method}</div>
            <div className="dev-network-url">{req.url}</div>
            <div className="dev-network-status">{req.status}</div>
            <div className="dev-network-time">{req.duration}ms</div>
            <div className="dev-network-timestamp">{req.timestamp}</div>
          </div>
        ))}
      </div>
      
      <button 
        className="dev-button"
        onClick={() => setNetworkRequests([])}
      >
        🗑️ Clear Network Log
      </button>
    </div>
  );

  const renderLogs = () => (
    <div className="dev-section">
      <h4>📝 Console Logs</h4>
      <div className="dev-logs">
        {logs.slice().reverse().map(log => (
          <div key={log.id} className={`dev-log-item ${log.type}`}>
            <span className="dev-log-time">{log.timestamp}</span>
            <span className="dev-log-type">{log.type.toUpperCase()}</span>
            <pre className="dev-log-message">{log.message}</pre>
          </div>
        ))}
      </div>
      
      <button 
        className="dev-button"
        onClick={() => setLogs([])}
      >
        🗑️ Clear Logs
      </button>
    </div>
  );

  const renderTools = () => (
    <div className="dev-section">
      <h4>🛠️ Development Tools</h4>
      
      <div className="dev-tool-group">
        <h5>State Management</h5>
        <button onClick={() => window.stateManager?.reset('auth')}>Reset Auth Store</button>
        <button onClick={() => window.stateManager?.reset('dashboard')}>Reset Dashboard Store</button>
      </div>
      
      <div className="dev-tool-group">
        <h5>Performance</h5>
        <button onClick={() => window.PerformanceMonitor?.clear()}>Clear Performance Data</button>
        <button onClick={() => window.PerformanceMonitor?.export()}>Export Performance Report</button>
      </div>
      
      <div className="dev-tool-group">
        <h5>Storage</h5>
        <button onClick={() => localStorage.clear()}>Clear Local Storage</button>
        <button onClick={() => sessionStorage.clear()}>Clear Session Storage</button>
      </div>
      
      <div className="dev-tool-group">
        <h5>Debugging</h5>
        <button onClick={() => console.log('App Modules:', window.AppModules)}>Log App Modules</button>
        <button onClick={() => console.log('Global State:', window.stateManager?.getAllStores())}>Log Global State</button>
        <button onClick={() => console.log('Performance:', window.PerformanceMonitor?.getReport())}>Log Performance Report</button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'performance': return renderPerformance();
      case 'cache': return renderCache();
      case 'state': return renderState();
      case 'network': return renderNetwork();
      case 'logs': return renderLogs();
      case 'tools': return renderTools();
      default: return renderOverview();
    }
  };

  if (!isOpen) {
    return (
      <div className="dev-tools-toggle" onClick={() => setIsOpen(true)}>
        🛠️ Dev Tools
      </div>
    );
  }

  return (
    <div className="dev-tools-panel">
      <div className="dev-tools-header">
        <h3>🛠️ Development Tools</h3>
        <button className="dev-close" onClick={() => setIsOpen(false)}>×</button>
      </div>
      
      <div className="dev-tools-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`dev-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
          </button>
        ))}
      </div>
      
      <div className="dev-tools-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Add development tools in development environment only
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  document.addEventListener('DOMContentLoaded', () => {
    // Create dev tools container
    const devRoot = document.createElement('div');
    devRoot.id = 'dev-tools-root';
    document.body.appendChild(devRoot);
    
    // Add development styles
    const style = document.createElement('style');
    style.textContent = `
      #dev-tools-root {
        position: fixed;
        top: 0;
        right: 0;
        z-index: 10000;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 12px;
      }
      
      .dev-tools-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        z-index: 10001;
      }
      
      .dev-tools-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        height: 100vh;
        background: #1a1a1a;
        color: #fff;
        overflow-y: auto;
        box-shadow: -4px 0 12px rgba(0,0,0,0.3);
      }
      
      .dev-tools-header {
        padding: 16px;
        background: #333;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .dev-tools-tabs {
        display: flex;
        background: #2a2a2a;
        overflow-x: auto;
      }
      
      .dev-tab {
        background: none;
        border: none;
        color: #ccc;
        padding: 12px 8px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
      }
      
      .dev-tab.active {
        color: #fff;
        border-bottom-color: #007acc;
      }
      
      .dev-tools-content {
        padding: 16px;
      }
      
      .dev-section h4 {
        margin: 0 0 12px 0;
        color: #007acc;
      }
      
      .dev-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }
      
      .dev-card {
        background: #2a2a2a;
        padding: 12px;
        border-radius: 4px;
      }
      
      .dev-list {
        background: #2a2a2a;
        border-radius: 4px;
        padding: 8px;
      }
      
      .dev-list-item {
        display: flex;
        justify-content: space-between;
        padding: 4px 0;
        border-bottom: 1px solid #444;
      }
      
      .dev-button {
        background: #007acc;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin: 4px;
      }
      
      .dev-code {
        background: #000;
        padding: 8px;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 11px;
      }
      
      .dev-network-item {
        display: grid;
        grid-template-columns: 50px 1fr 60px 60px 80px;
        gap: 8px;
        padding: 4px 8px;
        border-bottom: 1px solid #444;
        font-size: 11px;
      }
      
      .dev-network-item.success {
        background: rgba(0, 255, 0, 0.1);
      }
      
      .dev-network-item.error {
        background: rgba(255, 0, 0, 0.1);
      }
      
      .dev-log-item {
        display: flex;
        gap: 8px;
        padding: 4px 8px;
        border-bottom: 1px solid #444;
        font-size: 11px;
      }
      
      .dev-log-item.error {
        background: rgba(255, 0, 0, 0.1);
      }
      
      .dev-log-item.warn {
        background: rgba(255, 255, 0, 0.1);
      }
      
      .dev-tool-group {
        margin-bottom: 16px;
      }
      
      .dev-tool-group h5 {
        margin: 0 0 8px 0;
        color: #ccc;
      }
    `;
    document.head.appendChild(style);
    
    // Render dev tools
    ReactDOM.createRoot(devRoot).render(<EnhancedDevTools />);
  });
}

// Export for module system
window.AppModules = window.AppModules || {};
window.AppModules.DevTools = EnhancedDevTools;