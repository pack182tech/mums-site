// Google Sheets API wrapper for the Mums Ordering System

class SheetsAPI {
    constructor() {
        this.apiUrl = CONFIG.API_URL;
        this.cache = new Map();
    }

    // Generic API call method with retry logic
    async apiCall(path, method = 'GET', data = null, retries = CONFIG.MAX_RETRIES) {
        const cacheKey = `${method}-${path}-${JSON.stringify(data)}`;
        
        // Check cache for GET requests
        if (method === 'GET' && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
                debugLog('Using cached data for:', path);
                return cached.data;
            }
        }

        const url = `${this.apiUrl}?path=${path}`;
        const options = {
            method: method,
            mode: 'cors',
            credentials: 'omit'
        };

        if (data && method === 'POST') {
            options.headers = {
                'Content-Type': 'text/plain'  // Google Apps Script prefers text/plain for CORS
            };
            options.body = JSON.stringify(data);
        }

        try {
            debugLog(`API Call: ${method} ${path}`, data);
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Cache successful GET requests
            if (method === 'GET') {
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }

            debugLog('API Response:', result);
            return result;

        } catch (error) {
            debugLog('API Error:', error);
            
            if (retries > 0) {
                debugLog(`Retrying... (${retries} attempts remaining)`);
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY));
                return this.apiCall(path, method, data, retries - 1);
            }
            
            throw error;
        }
    }

    // Get all products
    async getProducts() {
        try {
            const response = await this.apiCall('products');
            return response.products || [];
        } catch (error) {
            console.error('Failed to fetch products:', error);
            return [];
        }
    }

    // Get site settings
    async getSettings() {
        try {
            const response = await this.apiCall('settings');
            return response.settings || {};
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            return this.getDefaultSettings();
        }
    }

    // Submit an order
    async submitOrder(orderData) {
        try {
            debugLog('Submitting order with data:', orderData);
            const response = await this.apiCall('order', 'POST', orderData);
            debugLog('Order submission response:', response);
            
            // Check if response has the expected structure
            if (!response || typeof response !== 'object') {
                throw new Error('Invalid response from server');
            }
            
            return response;
        } catch (error) {
            console.error('Failed to submit order - Full error:', error);
            console.error('Order data was:', orderData);
            
            // Provide more specific error message
            if (error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to order system. Please check your connection and try again.');
            } else if (error.message.includes('status: 4')) {
                throw new Error('Server error: The order system is not responding correctly. Please try again in a few moments.');
            } else {
                throw new Error(`Failed to submit order: ${error.message}`);
            }
        }
    }

    // Get orders (admin only)
    async getOrders(adminToken) {
        try {
            const response = await this.apiCall('orders&admin=true');
            return response.orders || [];
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            return [];
        }
    }

    // Update product (admin only)
    async updateProduct(productData, adminToken) {
        try {
            const response = await this.apiCall('updateProduct&admin=true', 'POST', productData);
            return response;
        } catch (error) {
            console.error('Failed to update product:', error);
            throw new Error('Failed to update product.');
        }
    }

    // Update settings (admin only)
    async updateSettings(settingsData, adminToken) {
        try {
            const response = await this.apiCall('updateSettings&admin=true', 'POST', settingsData);
            return response;
        } catch (error) {
            console.error('Failed to update settings:', error);
            throw new Error('Failed to update settings.');
        }
    }

    // Update order status (admin only)
    async updateOrderStatus(orderData, adminToken) {
        try {
            const response = await this.apiCall('updateOrderStatus&admin=true', 'POST', orderData);
            return response;
        } catch (error) {
            console.error('Failed to update order status:', error);
            throw new Error('Failed to update order status.');
        }
    }

    // Get default settings (fallback)
    getDefaultSettings() {
        return {
            welcome_title: 'Cub Scouts Mum Sale',
            welcome_message: 'Support our pack by purchasing beautiful fall mums!',
            instructions: 'Select your mums, complete the order form, and submit your order.',
            zelle_email: 'threebridgespack182@gmail.com',
            zelle_qr_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=ZELLE:threebridgespack182@gmail.com',
            venmo_handle: '@CubScouts',
            venmo_qr_url: '',
            payment_instructions: 'Please include your Order ID in the payment description.',
            pickup_location: 'School Parking Lot',
            pickup_date: 'Saturday, 9am-2pm'
        };
    }

    // Get scout names list
    async getScoutNames() {
        try {
            const response = await this.apiCall('scouts');
            return response;
        } catch (error) {
            console.error('Failed to fetch scout names:', error);
            return { scouts: [] };
        }
    }
    
    // Update scout names list
    async updateScoutNames(names) {
        try {
            const response = await this.apiCall('updateScouts', 'POST', { scouts: names });
            return response;
        } catch (error) {
            console.error('Failed to update scout names:', error);
            throw new Error('Failed to update scout names');
        }
    }
    
    // Submit volunteer interest
    async submitVolunteer(volunteerData) {
        try {
            debugLog('Submitting volunteer interest:', volunteerData);
            const response = await this.apiCall('volunteer', 'POST', volunteerData);
            debugLog('Volunteer submission response:', response);
            return response;
        } catch (error) {
            console.error('Failed to submit volunteer interest:', error);
            throw new Error(`Failed to submit volunteer interest: ${error.message}`);
        }
    }
    
    // Submit helper request
    async submitHelper(helperData) {
        try {
            debugLog('Submitting helper request:', helperData);
            const response = await this.apiCall('submitHelper', 'POST', helperData);
            debugLog('Helper submission response:', response);
            return response;
        } catch (error) {
            console.error('Failed to submit helper request:', error);
            throw new Error(`Failed to submit helper request: ${error.message}`);
        }
    }
    
    // Get helpers list (admin only)
    async getHelpers() {
        try {
            const response = await this.apiCall('helpers&admin=true');
            return response.helpers || [];
        } catch (error) {
            console.error('Failed to fetch helpers:', error);
            return [];
        }
    }
    
    // Update helper status (admin only)
    async updateHelper(helperData) {
        try {
            const response = await this.apiCall('updateHelper&admin=true', 'POST', helperData);
            return response;
        } catch (error) {
            console.error('Failed to update helper:', error);
            throw new Error('Failed to update helper status');
        }
    }
    
    // Clear cache
    clearCache() {
        this.cache.clear();
        debugLog('Cache cleared');
    }
}

// Create global instance
const sheetsAPI = new SheetsAPI();