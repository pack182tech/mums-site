// Configuration file for the Mums Ordering System
// Replace with your actual Google Apps Script Web App URL

const CONFIG = {
    // Version
    VERSION: '1.3.2',
    
    // Google Apps Script Web App URL
    API_URL: 'https://script.google.com/macros/s/AKfycbypeSDKhPrEKOZw3_PJJ-w1Ck8lbLq1IEYqAMe3gm8AYVd_-d6o4uXyA_uhcFc73dC3/exec',
    
    // Local storage keys
    STORAGE_KEYS: {
        CUSTOMER_INFO: 'mums_customer_info',
        CART: 'mums_cart',
        LAST_ORDER: 'mums_last_order'
    },
    
    // Form validation patterns
    VALIDATION: {
        PHONE: /^\d{3}-\d{3}-\d{4}$/,
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    
    // Auto-save interval (milliseconds)
    AUTO_SAVE_INTERVAL: 5000,
    
    // Cache duration (milliseconds)
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    
    // Retry settings
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    
    // Debug mode
    DEBUG: true
};

// Helper function to log debug messages
function debugLog(...args) {
    if (CONFIG.DEBUG) {
        console.log('[Mums System]', ...args);
    }
}