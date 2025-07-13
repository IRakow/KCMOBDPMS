// API Client for backend communication
const API_BASE_URL = 'http://localhost:8001/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('access_token');
        // Mock users for demo
        this.mockUsers = {
            'admin@example.com': { 
                password: 'admin123',
                user: {
                    id: 1,
                    email: 'admin@example.com',
                    first_name: 'John',
                    last_name: 'Admin',
                    role: 'super_admin',
                    is_active: true
                }
            },
            'owner@example.com': {
                password: 'owner123',
                user: {
                    id: 2,
                    email: 'owner@example.com',
                    first_name: 'Jane',
                    last_name: 'Owner',
                    role: 'property_owner',
                    is_active: true
                }
            },
            'manager@example.com': {
                password: 'manager123',
                user: {
                    id: 3,
                    email: 'manager@example.com',
                    first_name: 'Mike',
                    last_name: 'Manager',
                    role: 'property_manager',
                    is_active: true
                }
            },
            'resident@example.com': {
                password: 'resident123',
                user: {
                    id: 4,
                    email: 'resident@example.com',
                    first_name: 'Bob',
                    last_name: 'Resident',
                    role: 'resident',
                    is_active: true
                }
            }
        };
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('access_token', token);
        } else {
            localStorage.removeItem('access_token');
        }
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        if (options.body && typeof options.body !== 'string') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            
            // Handle empty responses
            if (response.status === 204) {
                return null;
            }
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            // If backend is not running, use mock data
            if (error.message.includes('Failed to fetch')) {
                console.warn('Backend not available, using mock data');
                return this.getMockResponse(endpoint, options);
            }
            throw error;
        }
    }
    
    getMockResponse(endpoint, options) {
        // Mock responses for when backend is not available
        if (endpoint === '/auth/login' && options.method === 'POST') {
            const { email, password } = JSON.parse(options.body);
            const mockUser = this.mockUsers[email];
            
            if (mockUser && mockUser.password === password) {
                const token = 'mock_token_' + email + '_' + Date.now();
                localStorage.setItem('user_email', email);
                return {
                    access_token: token,
                    user: mockUser.user,
                    portal: mockUser.user.role
                };
            }
            throw new Error('Invalid credentials');
        }
        
        if (endpoint === '/auth/me' || endpoint === '/v1/auth/me') {
            if (this.token) {
                // Return the user based on the stored email in localStorage
                const storedEmail = localStorage.getItem('user_email');
                if (storedEmail && this.mockUsers[storedEmail]) {
                    return { user: this.mockUsers[storedEmail].user };
                }
                // Fallback to admin
                return { user: this.mockUsers['admin@example.com'].user };
            }
            throw new Error('Not authenticated');
        }
        
        if (endpoint === '/dashboard/metrics') {
            return {
                occupancy: { rate: 92, occupied: 184, total: 200, change: 3.5 },
                revenue: { current: 2500000, target: 3000000, change: 12.5 },
                maintenance: { open: 18, urgent: 3, completed: 45 },
                leases: { expiring: 8, this_month: 3 }
            };
        }
        
        throw new Error('No mock data available');
    }

    async login(email, password) {
        try {
            // Use OAuth2 form data format for token endpoint
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            
            const url = `${API_BASE_URL}/v1/auth/token`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData,
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }
            
            const data = await response.json();
            this.setToken(data.access_token);
            
            // For mock token, use stored email
            if (data.access_token.startsWith('mock_token_')) {
                const storedEmail = localStorage.getItem('user_email');
                const mockUser = this.mockUsers[storedEmail];
                if (mockUser) {
                    return {
                        access_token: data.access_token,
                        user: mockUser.user,
                        portal: mockUser.user.role
                    };
                }
                // Fallback
                return {
                    access_token: data.access_token,
                    user: this.mockUsers['admin@example.com'].user,
                    portal: 'super_admin'
                };
            }
            
            // For real JWT tokens, decode them
            const payload = this.decodeToken(data.access_token);
            if (!payload) {
                throw new Error('Invalid token format');
            }
            
            return {
                access_token: data.access_token,
                user: {
                    email: payload.sub,
                    role: payload.role,
                    company_id: payload.company_id
                },
                portal: payload.role
            };
        } catch (error) {
            // If backend is not available, use mock login
            if (error.message.includes('Failed to fetch')) {
                console.warn('Backend not available, using mock login');
                const mockUser = this.mockUsers[email];
                
                if (mockUser && mockUser.password === password) {
                    const token = 'mock_token_' + Date.now();
                    this.setToken(token);
                    return {
                        access_token: token,
                        user: mockUser.user,
                        portal: mockUser.user.role
                    };
                }
                throw new Error('Invalid credentials');
            }
            throw error;
        }
    }
    
    decodeToken(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid token');
            }
            
            const payload = JSON.parse(atob(parts[1]));
            return payload;
        } catch (error) {
            console.error('Token decode error:', error);
            return null;
        }
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: userData,
        });
    }

    async getCurrentUser() {
        return this.request('/v1/auth/me');
    }

    async logout() {
        this.setToken(null);
        localStorage.removeItem('user_email');
    }
    
    // Dashboard API methods
    async getDashboardMetrics(propertyId = null) {
        const params = propertyId ? `?property_id=${propertyId}` : '';
        return this.request(`/dashboard/metrics${params}`);
    }
    
    async getCalendarEvents(propertyId = null) {
        const params = propertyId ? `?property_id=${propertyId}` : '';
        return this.request(`/dashboard/calendar${params}`);
    }
    
    async getNotifications(limit = 10) {
        return this.request(`/dashboard/notifications?limit=${limit}`);
    }
    
    // Property API methods
    async getProperties(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/properties${queryString ? '?' + queryString : ''}`);
    }
    
    async getProperty(propertyId) {
        return this.request(`/properties/${propertyId}`);
    }
    
    async getPropertyStatistics(propertyId) {
        return this.request(`/properties/${propertyId}/statistics`);
    }
}

window.apiClient = new ApiClient();