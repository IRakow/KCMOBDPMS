const PORTAL_ROUTES = {
    super_admin: '/',
    property_owner: '/',
    administrator: '/',
    property_manager: '/',
    maintenance_staff: '/',
    vendor: '/',
    resident: '/'
};

class AuthManager {
    constructor() {
        this.user = null;
        this.listeners = [];
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.user));
    }

    async login(email, password) {
        try {
            console.log('AuthManager: Attempting login for', email);
            const response = await window.apiClient.login(email, password);
            console.log('AuthManager: Login response:', response);
            this.user = response.user;
            this.notify();
            console.log('AuthManager: User set to:', this.user);
            return {
                success: true,
                portal: PORTAL_ROUTES[response.portal] || '/dashboard',
                user: response.user
            };
        } catch (error) {
            console.error('AuthManager: Login failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async checkAuth() {
        try {
            // Only check if we have a token
            const token = localStorage.getItem('access_token');
            if (!token) {
                this.user = null;
                this.notify();
                return false;
            }
            
            const response = await window.apiClient.getCurrentUser();
            this.user = response.user;
            this.notify();
            return true;
        } catch (error) {
            console.log('checkAuth failed:', error.message);
            this.user = null;
            this.notify();
            return false;
        }
    }

    logout() {
        window.apiClient.logout();
        this.user = null;
        this.notify();
        window.location.href = '/';
    }

    getUser() {
        return this.user;
    }

    getPortalRoute() {
        if (!this.user) return '/';
        return PORTAL_ROUTES[this.user.role] || '/dashboard';
    }
}

window.authManager = new AuthManager();