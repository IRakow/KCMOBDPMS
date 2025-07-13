// Centralized API Service
window.ApiService = {
    baseURL: 'http://localhost:8000/api/v1',
    
    getHeaders() {
        const token = localStorage.getItem('access_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },
    
    async request(method, endpoint, data = null) {
        try {
            const config = {
                method,
                headers: this.getHeaders()
            };
            
            if (data && method !== 'GET') {
                config.body = JSON.stringify(data);
            }
            
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Handle unauthorized
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                    return;
                }
                
                let error;
                try {
                    const errorData = await response.json();
                    error = new Error(errorData.detail || `Request failed: ${response.status}`);
                    error.status = response.status;
                    error.data = errorData;
                } catch (e) {
                    error = new Error(`Request failed: ${response.status}`);
                    error.status = response.status;
                }
                throw error;
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Convenience methods
    get(endpoint) { 
        return this.request('GET', endpoint); 
    },
    
    post(endpoint, data) { 
        return this.request('POST', endpoint, data); 
    },
    
    put(endpoint, data) { 
        return this.request('PUT', endpoint, data); 
    },
    
    patch(endpoint, data) { 
        return this.request('PATCH', endpoint, data); 
    },
    
    delete(endpoint) { 
        return this.request('DELETE', endpoint); 
    }
};

// Global state management
window.AppState = {
    state: {
        user: null,
        properties: [],
        units: [],
        tenants: [],
        leases: [],
        maintenance: []
    },
    
    listeners: new Map(),
    
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);
        
        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(key);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    },
    
    setState(key, value) {
        this.state[key] = value;
        const listeners = this.listeners.get(key);
        if (listeners) {
            listeners.forEach(cb => cb(value));
        }
    },
    
    getState(key) {
        return this.state[key];
    },
    
    // Batch update multiple states
    setStates(updates) {
        Object.entries(updates).forEach(([key, value]) => {
            this.setState(key, value);
        });
    }
};

// Notification helper
window.showNotification = (type, message) => {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.classList.add('notification-show');
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('notification-show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
};

// Add notification styles if not already present
if (!document.querySelector('#notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 16px 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 10000;
            max-width: 400px;
        }
        
        .notification-show {
            transform: translateX(0);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .notification-success {
            border-left: 4px solid #10b981;
        }
        
        .notification-success i {
            color: #10b981;
        }
        
        .notification-error {
            border-left: 4px solid #ef4444;
        }
        
        .notification-error i {
            color: #ef4444;
        }
    `;
    document.head.appendChild(styles);
}