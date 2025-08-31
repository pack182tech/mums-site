// Main application logic for the Mums Ordering System

// Global variables
let cart = [];
let products = [];
let settings = {};
let currentOrderId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    debugLog('Initializing application...');
    
    // Load saved cart
    loadCart();
    
    // Load settings and products
    await loadSettings();
    await loadProducts();
    
    // Set up form handlers
    setupFormHandlers();
    
    // Auto-save form data
    setupAutoSave();
    
    // Load saved customer info
    loadCustomerInfo();
    
    debugLog('Application initialized');
});

// Load settings from API
async function loadSettings() {
    showLoading(true);
    try {
        settings = await sheetsAPI.getSettings();
        
        // Update welcome screen
        document.getElementById('welcome-title').textContent = settings.welcome_title || 'Cub Scouts Mum Sale';
        document.getElementById('welcome-message').textContent = settings.welcome_message || '';
        
        // Format instructions as a numbered list
        const instructionsText = settings.instructions || '';
        const instructionsList = instructionsText.split(/\d+\.\s+/).filter(item => item.trim());
        if (instructionsList.length > 0) {
            const formattedInstructions = '<ol>' + 
                instructionsList.map(item => `<li>${item.trim()}</li>`).join('') + 
                '</ol>';
            document.getElementById('instructions').innerHTML = formattedInstructions;
        } else {
            document.getElementById('instructions').innerHTML = instructionsText.replace(/\n/g, '<br>');
        }
        
        debugLog('Settings loaded:', settings);
    } catch (error) {
        console.error('Failed to load settings:', error);
        showError('Failed to load settings. Please refresh the page.');
    } finally {
        showLoading(false);
    }
}

// Load products from API
async function loadProducts() {
    try {
        products = await sheetsAPI.getProducts();
        debugLog('Products loaded:', products);
        renderProducts();
    } catch (error) {
        console.error('Failed to load products:', error);
        showError('Failed to load products. Please refresh the page.');
    }
}

// Render products in the catalog
function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        if (product.available === true || product.available === 'TRUE' || product.available === 'true') {
            const productCard = createProductCard(product);
            grid.appendChild(productCard);
        }
    });
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const quantity = getCartQuantity(product.id);
    
    // Determine available colors based on product type
    let colorOptions = ['Yellow', 'Orange', 'Red', 'Purple', 'White'];
    if (product.id === 'APPLE') {
        colorOptions = ['Yellow', 'Orange', 'Red']; // Apple basket only has 3 colors
    }
    
    const colorButtons = colorOptions.map(color => 
        `<button class="color-btn" data-color="${color}" onclick="selectColor('${product.id}', '${color}', this)">
            ${color}
        </button>`
    ).join('');
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image_url || 'https://via.placeholder.com/300'}" 
                 alt="${product.title}" 
                 onerror="this.src='https://via.placeholder.com/300'">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${product.description || ''}</p>
            <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
            
            <div class="color-selection">
                <label>Select Color:</label>
                <div class="color-buttons" id="colors-${product.id}">
                    ${colorButtons}
                </div>
            </div>
            
            <div class="quantity-controls">
                <button onclick="updateQuantity('${product.id}', -1)" class="btn-quantity">-</button>
                <input type="number" id="qty-${product.id}" value="${quantity}" min="0" max="99" 
                       onchange="setQuantity('${product.id}', this.value)" class="quantity-input">
                <button onclick="updateQuantity('${product.id}', 1)" class="btn-quantity">+</button>
            </div>
        </div>
    `;
    
    return card;
}

// Cart management functions
function updateQuantity(productId, delta) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const currentQty = getCartQuantity(productId);
    const newQty = Math.max(0, Math.min(99, currentQty + delta));
    
    setQuantity(productId, newQty);
}

// Track selected colors
let selectedColors = {};

// Color selection function
function selectColor(productId, color, button) {
    // Remove active class from siblings
    const container = button.parentElement;
    container.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected
    button.classList.add('active');
    
    // Store the selection
    selectedColors[productId] = color;
    
    debugLog(`Selected ${color} for product ${productId}`);
}

function setQuantity(productId, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    quantity = parseInt(quantity) || 0;
    
    // Check if color is selected
    if (quantity > 0 && !selectedColors[productId]) {
        alert('Please select a color first');
        document.getElementById(`qty-${productId}`).value = 0;
        return;
    }
    
    if (quantity <= 0) {
        // Remove from cart
        cart = cart.filter(item => item.id !== productId);
        delete selectedColors[productId];
    } else {
        // Update or add to cart
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity = quantity;
            existingItem.color = selectedColors[productId];
        } else {
            cart.push({
                id: productId,
                color: selectedColors[productId],
                title: product.title,
                price: parseFloat(product.price),
                quantity: quantity
            });
        }
    }
    
    // Update UI
    document.getElementById(`qty-${productId}`).value = quantity;
    updateCartSummary();
    saveCart();
}

function getCartQuantity(productId) {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
}

function updateCartSummary() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const proceedBtn = document.getElementById('proceed-btn');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>No items selected</p>';
        cartTotal.textContent = '$0.00';
        proceedBtn.disabled = true;
        return;
    }
    
    let total = 0;
    let html = '';
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <div class="cart-item">
                <span>${item.title} - ${item.color}</span>
                <span>${item.quantity} × $${item.price.toFixed(2)} = $${subtotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = `$${total.toFixed(2)}`;
    proceedBtn.disabled = false;
}

// Local storage functions
function saveCart() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CART, JSON.stringify(cart));
    debugLog('Cart saved:', cart);
}

function loadCart() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.CART);
    if (saved) {
        try {
            cart = JSON.parse(saved);
            debugLog('Cart loaded:', cart);
            updateCartSummary();
        } catch (error) {
            console.error('Failed to load cart:', error);
        }
    }
}

function saveCustomerInfo() {
    const form = document.getElementById('order-form');
    const data = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        address: form.address.value
    };
    localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOMER_INFO, JSON.stringify(data));
    debugLog('Customer info saved');
}

function loadCustomerInfo() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOMER_INFO);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            const form = document.getElementById('order-form');
            if (form) {
                form.firstName.value = data.firstName || '';
                form.lastName.value = data.lastName || '';
                form.email.value = data.email || '';
                form.phone.value = data.phone || '';
                form.address.value = data.address || '';
                debugLog('Customer info loaded');
            }
        } catch (error) {
            console.error('Failed to load customer info:', error);
        }
    }
}

// Form handling
function setupFormHandlers() {
    const form = document.getElementById('order-form');
    if (form) {
        form.addEventListener('submit', handleOrderSubmit);
        
        // Phone number formatting
        const phoneInput = form.phone;
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6, 10);
            } else if (value.length >= 3) {
                value = value.slice(0, 3) + '-' + value.slice(3);
            }
            e.target.value = value;
        });
    }
}

function setupAutoSave() {
    setInterval(() => {
        const form = document.getElementById('order-form');
        if (form && document.getElementById('order-form-screen').style.display !== 'none') {
            saveCustomerInfo();
        }
    }, CONFIG.AUTO_SAVE_INTERVAL);
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    
    if (cart.length === 0) {
        showError('Please select at least one product');
        return;
    }
    
    const form = e.target;
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Validate phone format
    if (!CONFIG.VALIDATION.PHONE.test(form.phone.value)) {
        showError('Please enter phone number in format: 123-456-7890');
        return;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Prepare order data
    const orderData = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        address: form.address.value,
        products: cart,
        totalPrice: total,
        comments: form.comments.value,
        paymentMethod: form.paymentMethod.value
    };
    
    // Save customer info for next time
    saveCustomerInfo();
    
    // Submit order
    showLoading(true);
    try {
        const response = await sheetsAPI.submitOrder(orderData);
        
        if (response.success) {
            currentOrderId = response.orderId;
            showConfirmation(response.orderId, total, form.paymentMethod.value);
            
            // Clear cart
            cart = [];
            saveCart();
            
            // Save order to history
            const orderHistory = {
                orderId: response.orderId,
                date: new Date().toISOString(),
                total: total
            };
            localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_ORDER, JSON.stringify(orderHistory));
        } else {
            throw new Error(response.message || 'Failed to submit order');
        }
    } catch (error) {
        console.error('Order submission failed:', error);
        showError(error.message || 'Failed to submit order. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Screen navigation
function showWelcome() {
    hideAllScreens();
    document.getElementById('welcome-screen').style.display = 'block';
}

function showCatalog() {
    hideAllScreens();
    document.getElementById('catalog-screen').style.display = 'block';
    updateCartSummary();
}

function showOrderForm() {
    if (cart.length === 0) {
        showError('Please select at least one product');
        return;
    }
    
    hideAllScreens();
    document.getElementById('order-form-screen').style.display = 'block';
    
    // Update order summary
    const summary = document.getElementById('order-summary');
    let html = '<div class="order-items">';
    let total = 0;
    
    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        html += `
            <div class="order-item">
                <span>${item.title}</span>
                <span>${item.quantity} × $${item.price.toFixed(2)} = $${subtotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    html += `</div>
        <div class="order-total">
            <strong>Total:</strong> <strong>$${total.toFixed(2)}</strong>
        </div>`;
    
    summary.innerHTML = html;
    
    // Load saved customer info
    loadCustomerInfo();
}

function showConfirmation(orderId, total, paymentMethod) {
    hideAllScreens();
    document.getElementById('confirmation-screen').style.display = 'block';
    
    // Set order details
    document.getElementById('confirmation-order-id').textContent = orderId;
    document.getElementById('confirmation-total').textContent = `$${total.toFixed(2)}`;
    
    // Show payment instructions based on method
    if (paymentMethod === 'Venmo') {
        document.getElementById('venmo-section').style.display = 'block';
        document.getElementById('other-payment-section').style.display = 'none';
        
        // Set Venmo details
        document.getElementById('venmo-handle').textContent = settings.venmo_handle || '@CubScouts';
        document.getElementById('payment-note').textContent = 
            `Please include Order ID: ${orderId} in your payment note`;
        
        // Set QR code if available
        const qrImg = document.getElementById('venmo-qr');
        if (settings.venmo_qr_url) {
            qrImg.src = settings.venmo_qr_url;
            qrImg.style.display = 'block';
        } else {
            qrImg.style.display = 'none';
        }
    } else {
        document.getElementById('venmo-section').style.display = 'none';
        document.getElementById('other-payment-section').style.display = 'block';
        
        let instructions = '';
        if (paymentMethod === 'Cash') {
            instructions = `Please bring cash payment when picking up your order. Order ID: ${orderId}`;
        } else if (paymentMethod === 'Check') {
            instructions = `Please make check payable to "Cub Scouts Pack" and bring when picking up. Order ID: ${orderId}`;
        }
        document.getElementById('other-payment-instructions').textContent = instructions;
    }
    
    // Set pickup details
    const pickupInfo = `${settings.pickup_location || 'Location TBD'}<br>${settings.pickup_date || 'Date TBD'}`;
    document.getElementById('pickup-details').innerHTML = pickupInfo;
}

function startNewOrder() {
    cart = [];
    saveCart();
    showWelcome();
}

function hideAllScreens() {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
}

// UI helpers
function showLoading(show) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
    if (show && typeof updateLoadingText === 'function') {
        updateLoadingText();
    }
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').style.display = 'flex';
}

function closeErrorModal() {
    document.getElementById('error-modal').style.display = 'none';
}