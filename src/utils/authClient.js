// Authentication utilities for the frontend

const API_BASE_URL = 'http://localhost:8000/api';

class AuthClient {
    constructor() {
        this.token = localStorage.getItem('access_token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    // Register a new user
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // Login user
    async login(email, password) {
        try {
            // Create form data for OAuth2 compatibility
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${API_BASE_URL}/auth/token`, {
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
            
            // Store token and decode user info
            this.token = data.access_token;
            localStorage.setItem('access_token', this.token);
            
            // Decode JWT to get user info (you might want to use a proper JWT library)
            const payload = this.decodeToken(this.token);
            this.user = {
                email: payload.sub,
                company_id: payload.company_id,
                role: payload.role
            };
            localStorage.setItem('user', JSON.stringify(this.user));

            return { token: this.token, user: this.user };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    // Logout user
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token && !this.isTokenExpired();
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Get auth headers for API requests
    getAuthHeaders() {
        if (!this.token) {
            return {};
        }
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }

    // Make authenticated API request
    async request(url, options = {}) {
        const headers = {
            ...options.headers,
            ...this.getAuthHeaders(),
        };

        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Token expired or invalid
            this.logout();
            window.location.href = '/login';
            throw new Error('Authentication required');
        }

        return response;
    }

    // Decode JWT token (basic implementation)
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

    // Check if token is expired
    isTokenExpired() {
        if (!this.token) return true;
        
        try {
            const payload = this.decodeToken(this.token);
            if (!payload || !payload.exp) return true;
            
            const expirationTime = payload.exp * 1000; // Convert to milliseconds
            return Date.now() >= expirationTime;
        } catch {
            return true;
        }
    }

    // Get user role
    getUserRole() {
        return (this.user && this.user.role) || null;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.user && this.user.role === role;
    }

    // Check if user has any of the specified roles
    hasAnyRole(roles) {
        return this.user && roles.includes(this.user.role);
    }
}

// Create singleton instance
const authClient = new AuthClient();

// Export for use in components
window.authClient = authClient;