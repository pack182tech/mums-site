// Configuration file for the Mums Ordering System
// Replace with your actual Google Apps Script Web App URL

const CONFIG = {
    // Google Apps Script Web App URL
    API_URL: 'https://script.google.com/macros/s/AKfycbxbrEIYpV66wGYGI9bn0X6GpZDJLlr7YOHscwa8m7OlkNIAue-PgrkFJjP2YNcGzHC2LQ/exec',
    
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