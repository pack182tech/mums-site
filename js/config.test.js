// TEST Configuration file for the Mums Ordering System
// This file is for testing the donation features without affecting production

const CONFIG = {
    // Version
    VERSION: '1.5.0-test',
    
    // TEST Google Apps Script Web App URL
    // Instructions:
    // 1. Open your Google Apps Script project
    // 2. Click "Deploy" > "Test deployments"
    // 3. Create a new test deployment
    // 4. Copy the test URL here
    API_URL: 'YOUR_TEST_DEPLOYMENT_URL_HERE',
    
    // Alternative: Use the production URL but with a test spreadsheet
    // API_URL: 'https://script.google.com/macros/s/AKfycbwFihgdlUthlTMhKp8Ea0P1QUi198WibKsgCC-4XLDOyr42qObexjLyRMQfEHWTJE-vqg/exec',
    
    // Local storage keys (prefixed for test)
    STORAGE_KEYS: {
        CUSTOMER_INFO: 'mums_test_customer_info',
        CART: 'mums_test_cart',
        LAST_ORDER: 'mums_test_last_order'
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
    
    // Debug mode (always on for testing)
    DEBUG: true,
    
    // Test mode indicator
    TEST_MODE: true
};

// Helper function to log debug messages
function debugLog(...args) {
    if (CONFIG.DEBUG) {
        console.log('[Mums TEST System]', ...args);
    }
}

// Add visual indicator for test mode
document.addEventListener('DOMContentLoaded', () => {
    if (CONFIG.TEST_MODE) {
        // Add test mode banner
        const banner = document.createElement('div');
        banner.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; background: #ff9800; color: white; text-align: center; padding: 5px; z-index: 10000; font-weight: bold;';
        banner.textContent = '⚠️ TEST MODE - Orders will not affect production ⚠️';
        document.body.appendChild(banner);
        
        // Update version footer
        const versionFooter = document.getElementById('version-footer');
        if (versionFooter) {
            versionFooter.style.background = '#ff9800';
            versionFooter.style.color = 'white';
        }
    }
});