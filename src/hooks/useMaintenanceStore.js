// useMaintenanceStore.js - React Hook for Maintenance Store Integration
const useMaintenanceStore = () => {
    const [state, setState] = React.useState(() => {
        return window.MaintenanceStore ? window.MaintenanceStore.getState() : {
            requests: [],
            vendors: [],
            categories: [],
            priorities: [],
            statuses: [],
            aiInsights: {},
            notifications: [],
            filters: {}
        };
    });

    React.useEffect(() => {
        if (!window.MaintenanceStore) return;

        const unsubscribe = window.MaintenanceStore.subscribe((newState) => {
            setState(newState);
        });

        return unsubscribe;
    }, []);

    // Actions
    const actions = React.useMemo(() => ({
        // Request management
        addRequest: (requestData) => {
            return window.MaintenanceStore?.addRequest(requestData);
        },

        updateRequest: (id, updates) => {
            return window.MaintenanceStore?.updateRequest(id, updates);
        },

        getRequest: (id) => {
            return window.MaintenanceStore?.getRequestById(id);
        },

        getRequests: (filters) => {
            return window.MaintenanceStore?.getRequests(filters) || [];
        },

        // Vendor management
        getVendors: () => {
            return window.MaintenanceStore?.getVendors() || [];
        },

        getVendor: (id) => {
            return window.MaintenanceStore?.getVendorById(id);
        },

        getVendorsByCategory: (category) => {
            return window.MaintenanceStore?.getVendorsByCategory(category) || [];
        },

        assignVendor: (requestId, vendorId) => {
            return window.MaintenanceStore?.assignVendor(requestId, vendorId);
        },

        // Analytics
        getAnalytics: () => {
            return window.MaintenanceStore?.getAnalytics() || {};
        },

        // Notifications
        addNotification: (notification) => {
            return window.MaintenanceStore?.addNotification(notification);
        },

        markNotificationRead: (id) => {
            return window.MaintenanceStore?.markNotificationRead(id);
        },

        getUnreadNotifications: () => {
            return window.MaintenanceStore?.getUnreadNotifications() || [];
        },

        // AI Analysis
        runAIAnalysis: (request) => {
            return window.MaintenanceStore?.runAIAnalysis(request);
        }
    }), []);

    return {
        ...state,
        actions
    };
};

// Export for global use
window.useMaintenanceStore = useMaintenanceStore;