// Main application logic for the Mums Ordering System

// Global variables
let cart = [];
let products = [];
let settings = {};
let currentOrderId = null;

// Version tracking
const APP_VERSION = '1.0.7';
console.log(`Main App v${APP_VERSION} loaded`);

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    debugLog('Initializing application... (Monopage version)');
    
    // Check for scout name in URL and display it
    const urlParams = new URLSearchParams(window.location.search);
    const scoutName = urlParams.get('scout');
    if (scoutName) {
        const scoutNameDisplay = document.getElementById('header-scout-name');
        if (scoutNameDisplay) {
            scoutNameDisplay.textContent = decodeURIComponent(scoutName);
        }
    }
    
    // Load saved cart
    loadCart();
    
    // Load settings and products
    await loadSettings();
    await loadProducts();
    
    // MONOPAGE: Show catalog immediately and update cart icon
    document.getElementById('catalog-screen').style.display = 'block';
    updateCartIcon();
    
    // Set up form handlers
    setupFormHandlers();
    
    // Auto-save form data
    setupAutoSave();
    
    // Load saved customer info
    loadCustomerInfo();
    
    debugLog('Application initialized - Catalog shown automatically');
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
    
    // Add donation card first
    const donationCard = createDonationCard();
    grid.appendChild(donationCard);
    
    products.forEach(product => {
        if (product.available === true || product.available === 'TRUE' || product.available === 'true') {
            const productCard = createProductCard(product);
            grid.appendChild(productCard);
        }
    });
}

// Create donation support card
function createDonationCard() {
    const card = document.createElement('div');
    card.className = 'product-card donate-product-card';
    
    card.innerHTML = `
        <div class="donate-icon">🎁</div>
        <h3 class="donate-title">Support Pack 182</h3>
        <p class="donate-description">
            Can't buy mums? You can still help!<br>
            • Donate mums to the community<br>
            • Make a direct donation<br>
            • Volunteer your time & talents
        </p>
        <button onclick="showSupportOptions()" class="btn btn-primary" style="background: linear-gradient(135deg, #FFC107 0%, #4CAF50 100%);">
            Explore Support Options
        </button>
    `;
    
    return card;
}

// Create a product card element
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Determine available colors based on product type
    let colorOptions = ['Yellow', 'Orange', 'Red', 'Purple', 'White'];
    if (product.id === 'APPLE') {
        colorOptions = ['Yellow', 'Orange', 'Red']; // Apple basket only has 3 colors
    } else if (product.id === 'OVAL') {
        colorOptions = ['Tricolor']; // Oval pot only available in Tricolor
    }
    
    // Create color rows with individual quantity selectors
    const colorRows = colorOptions.map(color => {
        // Get quantity for this specific color
        const colorQty = cart.filter(item => item.id === product.id && item.color === color)
                             .reduce((sum, item) => sum + item.quantity, 0);
        
        return `
            <div class="color-quantity-row" style="display: flex; align-items: center; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                <span class="color-name" style="flex: 1; font-weight: 500;">${color}</span>
                <div class="quantity-controls" style="display: flex; align-items: center; gap: 5px;">
                    <button onclick="updateColorQuantity('${product.id}', '${color}', -1)" 
                            class="btn-quantity" style="width: 25px; height: 25px; padding: 0; font-size: 16px;">-</button>
                    <input type="number" 
                           id="qty-${product.id}-${color}" 
                           value="${colorQty}" 
                           min="0" 
                           max="99" 
                           onchange="setColorQuantity('${product.id}', '${color}', this.value)" 
                           class="quantity-input" 
                           style="width: 40px; text-align: center; padding: 2px;">
                    <button onclick="updateColorQuantity('${product.id}', '${color}', 1)" 
                            class="btn-quantity" style="width: 25px; height: 25px; padding: 0; font-size: 16px;">+</button>
                </div>
            </div>
        `;
    }).join('');
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image_url || 'https://via.placeholder.com/300'}" 
                 alt="${product.title}"
                 loading="lazy"
                 crossorigin="anonymous">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <p class="product-description">${product.description || ''}</p>
            <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
            
            <div class="color-quantities" style="margin-top: 15px;">
                ${colorRows}
            </div>
        </div>
    `;
    
    return card;
}

// New color-specific cart management functions
function updateColorQuantity(productId, color, delta) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Get current quantity from the input field directly to ensure consistency
    const input = document.getElementById(`qty-${productId}-${color}`);
    const currentQty = input ? parseInt(input.value) || 0 : 0;
    const newQty = Math.max(0, Math.min(99, currentQty + delta));
    
    setColorQuantity(productId, color, newQty);
}

function setColorQuantity(productId, color, quantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    quantity = parseInt(quantity) || 0;
    quantity = Math.max(0, Math.min(99, quantity));
    
    if (quantity <= 0) {
        // Remove items with this product ID and color from cart
        cart = cart.filter(item => !(item.id === productId && item.color === color));
        // Set quantity to 0 explicitly for display
        quantity = 0;
    } else {
        // Find existing item with same product ID AND color
        const existingItem = cart.find(item => item.id === productId && item.color === color);
        
        if (existingItem) {
            // Update quantity for existing color variant
            existingItem.quantity = quantity;
        } else {
            // Add new color variant as separate line item
            cart.push({
                id: productId,
                color: color,
                title: product.title,
                price: parseFloat(product.price),
                quantity: quantity
            });
        }
    }
    
    // Update the input field for this specific color
    const input = document.getElementById(`qty-${productId}-${color}`);
    if (input) {
        input.value = quantity;
    }
    
    updateCartSummary();
    updateCartIcon();
    saveCart();
    debugLog(`Cart updated: ${productId} (${color}) = ${quantity}`);
}

// Keep these for backward compatibility if needed
function updateQuantity(productId, delta) {
    // This is now deprecated - use updateColorQuantity instead
    console.warn('updateQuantity is deprecated, use updateColorQuantity');
}

function setQuantity(productId, quantity) {
    // This is now deprecated - use setColorQuantity instead
    console.warn('setQuantity is deprecated, use setColorQuantity');
}

function getCartQuantity(productId) {
    // Get total quantity for all colors of this product
    return cart
        .filter(item => item.id === productId)
        .reduce((sum, item) => sum + item.quantity, 0);
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
    
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        const colorText = item.color ? ` - ${item.color}` : '';
        
        // Show minus sign for qty > 1, X for qty = 1
        const removeBtn = item.quantity > 1 
            ? `<button onclick="decrementCartItem(${index})" class="btn-remove" title="Remove one">−</button>`
            : `<button onclick="removeFromCart(${index})" class="btn-remove" title="Remove item">×</button>`;
        
        html += `
            <div class="cart-item">
                <span>${item.title}${colorText}</span>
                <span>
                    ${item.quantity} × $${item.price.toFixed(2)} = $${subtotal.toFixed(2)}
                    ${removeBtn}
                </span>
            </div>
        `;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = `$${total.toFixed(2)}`;
    proceedBtn.disabled = false;
    
    // Update cart icon count
    updateCartIcon();
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
            // No longer need to restore selectedColors as we're using per-color quantities now
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
        address: `${form.street.value}\n${form.city.value}, ${form.state.value} ${form.zip.value}`
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
                // Parse address back into fields if it exists
                if (data.address) {
                    const addressLines = data.address.split('\n');
                    if (addressLines[0]) form.street.value = addressLines[0];
                    if (addressLines[1]) {
                        const cityStateZip = addressLines[1].match(/(.+),\s*([A-Z]{2})\s*(\d{5})/);
                        if (cityStateZip) {
                            form.city.value = cityStateZip[1] || '';
                            form.state.value = cityStateZip[2] || '';
                            form.zip.value = cityStateZip[3] || '';
                        }
                    }
                }
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
    
    // Check if new address fields exist, handle gracefully
    let address;
    if (form.street && form.city && form.state && form.zip) {
        // New format with separate fields
        address = `${form.street.value}\n${form.city.value}, ${form.state.value} ${form.zip.value}`;
    } else if (form.address) {
        // Old format with single field (fallback)
        address = form.address.value;
    } else {
        showError('Address fields are missing. Please refresh the page.');
        return;
    }
    
    // Validate phone format
    if (!CONFIG.VALIDATION.PHONE.test(form.phone.value)) {
        showError('Please enter phone number in format: 123-456-7890');
        return;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Get selected payment method
    const paymentMethodInput = form.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodInput ? paymentMethodInput.value : 'Zelle';
    
    // Prepare order data
    const orderData = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        address: address,
        products: cart,
        totalPrice: total,
        comments: form.comments.value,
        paymentMethod: paymentMethod
    };
    
    debugLog('Order data being submitted:', orderData);
    
    // Save customer info for next time
    saveCustomerInfo();
    
    // Submit order
    showLoading(true);
    try {
        const response = await sheetsAPI.submitOrder(orderData);
        
        if (response.success) {
            currentOrderId = response.orderId;
            showConfirmation(response.orderId, total, paymentMethod);
            
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
    
    // Update catalog title from settings
    const catalogTitle = document.getElementById('catalog-title');
    if (catalogTitle && settings.catalog_title) {
        catalogTitle.textContent = settings.catalog_title;
    }
    
    // Update catalog subtitle from settings
    const catalogSubtitle = document.getElementById('catalog-subtitle');
    if (catalogSubtitle && settings.catalog_subtitle) {
        catalogSubtitle.textContent = settings.catalog_subtitle;
        catalogSubtitle.style.display = 'block';
    } else if (catalogSubtitle) {
        catalogSubtitle.style.display = 'none';
    }
    
    // Show cart icon (always visible on catalog screen)
    updateCartIcon();
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
    
    // Show pickup modal after a short delay
    setTimeout(() => {
        showPickupModal();
    }, 500);
    
    // Set order details
    document.getElementById('confirmation-order-id').textContent = orderId;
    document.getElementById('confirmation-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('receipt-order-total').textContent = `$${total.toFixed(2)}`;
    
    // Set date
    const orderDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('order-date').textContent = orderDate;
    
    // Set customer information
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    document.getElementById('receipt-customer-name').textContent = `${firstName} ${lastName}`;
    document.getElementById('receipt-customer-email').textContent = document.getElementById('email').value;
    document.getElementById('receipt-customer-phone').textContent = document.getElementById('phone').value;
    
    const address = `${document.getElementById('street').value}, ${document.getElementById('city').value}, ${document.getElementById('state').value} ${document.getElementById('zip').value}`;
    document.getElementById('receipt-customer-address').textContent = address;
    
    // Populate order items table
    const itemsContainer = document.getElementById('receipt-items');
    let itemsHTML = '';
    cart.forEach(item => {
        itemsHTML += `
            <tr>
                <td>${item.title}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">$${item.price.toFixed(2)}</td>
                <td style="text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
            </tr>`;
    });
    itemsContainer.innerHTML = itemsHTML;
    
    // Update payment order ID in footer
    document.getElementById('payment-order-id-footer').textContent = orderId;
    
    // Set Zelle QR code with memo included
    const zelleQR = document.getElementById('zelle-qr');
    if (zelleQR) {
        const zelleEmail = settings.zelle_email || 'threebridgespack182@gmail.com';
        // Create QR data with email and memo
        const memo = `Order: ${orderId}`;
        const qrData = `ZELLE:${zelleEmail}?memo=${encodeURIComponent(memo)}`;
        
        // Use custom QR URL from settings or generate with memo
        const qrUrl = settings.zelle_qr_url && !settings.zelle_qr_url.includes('${orderId}') 
            ? settings.zelle_qr_url  // Use static QR if configured
            : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
        
        zelleQR.src = qrUrl;
        zelleQR.style.display = 'block';
    }
    
    // Update Zelle email from settings
    const zelleEmailElement = document.getElementById('zelle-email');
    if (zelleEmailElement && settings.zelle_email) {
        zelleEmailElement.textContent = settings.zelle_email;
    }
    
    // Set pickup details
    const pickupInfo = `${settings.pickup_location || 'Location TBD'}<br>${settings.pickup_date || 'Date TBD'}`;
    const pickupDetails = document.getElementById('pickup-details');
    const pickupDetailsCompact = document.getElementById('pickup-details-compact');
    if (pickupDetails) pickupDetails.innerHTML = pickupInfo;
    if (pickupDetailsCompact) pickupDetailsCompact.innerHTML = pickupInfo;
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
    
    // Hide cart icon when leaving catalog screen
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.style.display = 'none';
    }
}

// Cart UI functions
function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartSummary();
    renderProducts(); // Update product quantities
}

function decrementCartItem(index) {
    if (cart[index] && cart[index].quantity > 1) {
        cart[index].quantity--;
        saveCart();
        updateCartSummary();
        renderProducts(); // Update product quantities
    }
}

function updateCartIcon() {
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const catalogScreen = document.getElementById('catalog-screen');
    
    if (cartIcon && cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Only show cart icon on catalog screen, and always show it (even with 0 items)
        const isOnCatalogScreen = catalogScreen && catalogScreen.style.display !== 'none';
        cartIcon.style.display = isOnCatalogScreen ? 'flex' : 'none';
    }
}

function scrollToCart() {
    // Navigate to the order form page to show the order summary
    if (cart.length > 0) {
        showOrderForm();
    } else {
        // If cart is empty, just scroll to the cart summary on the current page
        const cartSummary = document.querySelector('.cart-summary');
        if (cartSummary) {
            cartSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
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

function showPickupModal() {
    // Check for scout name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const scoutName = urlParams.get('scout');
    
    // Update thank you message based on scout name
    const thankYouElement = document.getElementById('pickup-thank-you');
    if (thankYouElement) {
        if (scoutName && scoutName.trim() !== '') {
            thankYouElement.textContent = `${scoutName} thanks you for your support!`;
        } else {
            thankYouElement.textContent = 'We thank you for your support!';
        }
    }
    
    document.getElementById('pickup-modal').style.display = 'flex';
}

function closePickupModal() {
    document.getElementById('pickup-modal').style.display = 'none';
}

// Donation Support Functions
function showSupportOptions() {
    document.getElementById('support-modal').style.display = 'flex';
}

function closeSupportModal() {
    document.getElementById('support-modal').style.display = 'none';
}

// Donate Mums Functions
function showDonateMums() {
    closeSupportModal();
    // Scroll to product grid and highlight donation options
    const catalogScreen = document.getElementById('catalog-screen');
    if (catalogScreen) {
        catalogScreen.scrollIntoView({ behavior: 'smooth' });
        // Add donation mode flag
        window.donationMode = true;
        showError('Select the mums you\'d like to donate, then proceed to checkout. You can specify the recipient in the order form.');
    }
}

// Direct Donation Functions
let selectedDonationAmount = 0;

function selectDonationAmount(amount) {
    selectedDonationAmount = amount;
    
    // Update button states
    document.querySelectorAll('.donation-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.getAttribute('data-amount') == amount) {
            btn.classList.add('selected');
        }
    });
    
    // Clear custom amount if preset selected
    document.getElementById('custom-donation').value = '';
    
    // Show impact message
    showDonationImpact(amount);
}

function showDonationImpact(amount) {
    const impactDiv = document.getElementById('donation-impact');
    const impacts = {
        10: 'Provides a Scout handbook for one scout',
        25: 'Supplies camping gear for the pack',
        50: 'Funds activity supplies for meetings',
        100: 'Helps sponsor a scout\'s camp experience'
    };
    
    if (impactDiv) {
        const message = impacts[amount] || `Your $${amount} donation makes a real difference!`;
        impactDiv.querySelector('p').textContent = message;
        impactDiv.style.display = 'block';
    }
}

function processDonation() {
    // Get donation amount
    const customAmount = document.getElementById('custom-donation').value;
    const amount = customAmount || selectedDonationAmount;
    
    if (!amount || amount <= 0) {
        showError('Please select or enter a donation amount');
        return;
    }
    
    // Close modal and proceed to order form with donation
    closeSupportModal();
    
    // Add donation to cart as special item
    cart.push({
        id: 'DONATION',
        title: 'Direct Donation to Pack 182',
        price: parseFloat(amount),
        quantity: 1,
        isDonation: true
    });
    
    saveCart();
    updateCartSummary();
    showOrderForm();
}

// Volunteer Functions
function showVolunteerForm() {
    // Get selected volunteer options
    const selectedOptions = [];
    document.querySelectorAll('input[name="volunteer-type"]:checked').forEach(checkbox => {
        selectedOptions.push(checkbox.value);
    });
    
    const message = document.getElementById('volunteer-message').value;
    
    if (selectedOptions.length === 0 && !message) {
        showError('Please select at least one way you\'d like to help or provide a message');
        return;
    }
    
    // Store volunteer interest
    window.volunteerInterest = {
        types: selectedOptions,
        message: message
    };
    
    // Close modal and go to simplified contact form
    closeSupportModal();
    showOrderForm();
    
    // Hide payment section for volunteer signups
    const paymentSection = document.querySelector('.payment-options');
    if (paymentSection && window.volunteerInterest) {
        paymentSection.style.display = 'none';
    }
}

// Update custom donation on input
document.addEventListener('DOMContentLoaded', () => {
    const customDonationInput = document.getElementById('custom-donation');
    if (customDonationInput) {
        customDonationInput.addEventListener('input', (e) => {
            const amount = parseFloat(e.target.value);
            if (amount > 0) {
                selectedDonationAmount = amount;
                document.querySelectorAll('.donation-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                showDonationImpact(amount);
            }
        });
    }
});