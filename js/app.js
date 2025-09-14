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
        
        // Update support modal settings
        const supportModalTitle = document.getElementById('support-modal-title');
        if (supportModalTitle) {
            supportModalTitle.textContent = settings.support_modal_title || '🎁 Other Ways to Support Pack 182';
        }
        const supportModalDescription = document.getElementById('support-modal-description');
        if (supportModalDescription) {
            supportModalDescription.textContent = settings.support_modal_description || 'Choose how you\'d like to help our scouts!';
        }
        
        // Update contact modal settings
        const contactModalTitle = document.getElementById('contact-modal-title');
        if (contactModalTitle) {
            contactModalTitle.textContent = settings.contact_modal_title || '💝 Help Pack 182';
        }
        const contactModalDescription = document.getElementById('contact-modal-description');
        if (contactModalDescription) {
            contactModalDescription.textContent = settings.contact_modal_description || 'Thank you for your interest! Someone from Pack 182 will reach out to discuss how you can help.';
        }
        
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
    // Fix image URL for subdirectory pages and handle various URL formats
    let imageUrl = product.image_url || 'https://via.placeholder.com/300';
    
    // If the URL is not absolute (doesn't start with http:// or https://)
    if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        // If we're in a subdirectory, prepend '../'
        if (window.location.pathname.includes('/scoutname/')) {
            // Only prepend if it doesn't already have '../'
            if (!imageUrl.startsWith('../')) {
                imageUrl = '../' + imageUrl;
            }
        }
    }
    
    // Log for debugging
    debugLog('Product image URL:', product.title, 'Original:', product.image_url, 'Fixed:', imageUrl);
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${imageUrl}" 
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
    
    // Check if this is a test order
    const firstName = form.firstName.value.trim().toLowerCase();
    const lastName = form.lastName.value.trim().toLowerCase();
    const isTestOrder = (firstName === 'test' || lastName === 'test');
    
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
    
    // Check if this is a volunteer signup
    if (window.volunteerInterest) {
        // Handle volunteer signup differently
        const volunteerData = {
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            email: form.email.value,
            phone: form.phone.value,
            volunteerTypes: window.volunteerInterest.types,
            message: window.volunteerInterest.message,
            comments: form.comments.value
        };
        
        submitVolunteerInterest(volunteerData);
        return;
    }
    
    // Check for donations and donation recipients
    const hasDonation = cart.some(item => item.isDonation);
    const hasDonatedMums = window.donationMode && cart.some(item => !item.isDonation);
    
    // Get scout name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const scoutName = urlParams.get('scout') || '';
    
    // Prepare order data
    const orderData = {
        scoutName: scoutName ? decodeURIComponent(scoutName) : '',
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        phone: form.phone.value,
        address: address,
        products: cart,
        totalPrice: total,
        comments: form.comments.value,
        paymentMethod: paymentMethod,
        orderType: hasDonation ? 'donation' : (hasDonatedMums ? 'donated_mums' : 'standard'),
        donationRecipient: hasDonatedMums ? (form.donationRecipient?.value || 'Three Bridges Reformed Church') : null
    };
    
    debugLog('Order data being submitted:', orderData);
    
    // Save customer info for next time
    saveCustomerInfo();
    
    if (isTestOrder) {
        // For test orders, show the modal but still proceed to confirmation
        showTestOrderModal();
        
        // Generate a test order ID
        const testOrderId = 'TEST' + Date.now().toString(36).toUpperCase();
        currentOrderId = testOrderId;
        
        // Show confirmation page after a delay to let user see the modal
        setTimeout(() => {
            showConfirmation(testOrderId, total, paymentMethod);
            
            // Clear cart like normal
            cart = [];
            saveCart();
        }, 2000);
    } else {
        // Submit order normally for non-test orders
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
    
    // Show donation thank you message if this is a donation
    if (window.donationMode && window.donationRecipient) {
        // Create and show donation thank you modal
        const thankYouModal = document.createElement('div');
        thankYouModal.className = 'modal';
        thankYouModal.style.display = 'flex';
        thankYouModal.style.zIndex = '10000';
        thankYouModal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; padding: 50px; text-align: center;">
                <h2 style="color: #4CAF50; margin-bottom: 20px; font-size: 2rem;">🙏 Thank You for Your Donation!</h2>
                <p style="font-size: 1.2rem; color: #333; line-height: 1.8; margin-bottom: 25px;">
                    Your generous donation to <strong>${window.donationRecipient}</strong> will make a meaningful impact in our community.
                </p>
                <p style="font-size: 1.1rem; color: #666; line-height: 1.6;">
                    Order ID: <strong>${orderId}</strong><br>
                    Donation Amount: <strong>$${total.toFixed(2)}</strong>
                </p>
                <button onclick="this.closest('.modal').remove();" 
                        class="btn btn-primary" style="background: #4CAF50; margin-top: 30px; padding: 15px 30px; font-size: 1.1rem;">
                    Continue to Receipt
                </button>
            </div>
        `;
        document.body.appendChild(thankYouModal);
        
        // Clear donation mode after showing message
        window.donationMode = false;
        window.donationRecipient = '';
    } else {
        // Show pickup modal after a short delay for regular orders
        setTimeout(() => {
            showPickupModal();
        }, 500);
    }
    
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
    
    // Update Zelle payment information from settings
    const zellePrefixElement = document.getElementById('zelle-prefix');
    if (zellePrefixElement && settings.zelle_prefix) {
        zellePrefixElement.textContent = settings.zelle_prefix;
    }
    
    const zelleRecipientName = document.getElementById('zelle-recipient-name');
    if (zelleRecipientName) {
        const fullName = (settings.zelle_first_name && settings.zelle_last_name) ? 
            `${settings.zelle_first_name} ${settings.zelle_last_name}` : 
            'Boy Scouts of America';
        zelleRecipientName.textContent = fullName;
    }
    
    const zelleEmailElement = document.getElementById('zelle-email');
    if (zelleEmailElement && settings.zelle_email) {
        zelleEmailElement.textContent = settings.zelle_email;
    }
    
    const zelleMemoInstruction = document.getElementById('zelle-memo-instruction');
    if (zelleMemoInstruction && settings.zelle_memo_instruction) {
        zelleMemoInstruction.textContent = settings.zelle_memo_instruction;
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
    
    // Update pickup date/time and location from settings
    const pickupDateTime = document.getElementById('modal-pickup-datetime');
    const pickupLocation = document.getElementById('modal-pickup-location');
    
    if (pickupDateTime) {
        // Combine pickup_date and pickup_time if both exist, otherwise use just pickup_date
        const dateTime = settings.pickup_time ? 
            `${settings.pickup_date || 'Date TBD'}<br>${settings.pickup_time}` :
            (settings.pickup_date || 'Date & Time TBD');
        pickupDateTime.innerHTML = dateTime;
    }
    
    if (pickupLocation) {
        // Display pickup location and address if available
        const location = settings.pickup_address ? 
            `${settings.pickup_location || 'Location TBD'}<br>${settings.pickup_address}` :
            (settings.pickup_location || 'Location TBD');
        pickupLocation.innerHTML = location;
    }
    
    document.getElementById('pickup-modal').style.display = 'flex';
}

function closePickupModal() {
    document.getElementById('pickup-modal').style.display = 'none';
}

// Test Order Modal Functions
function showTestOrderModal() {
    // Update message from settings if available
    const messageElement = document.getElementById('test-order-message');
    if (messageElement && settings.test_order_message) {
        messageElement.textContent = settings.test_order_message;
    }
    
    // Show the modal
    document.getElementById('test-order-modal').style.display = 'flex';
    
    // Auto-close after 2 seconds to proceed with flow
    setTimeout(() => {
        closeTestOrderModal();
    }, 2000);
}

function closeTestOrderModal() {
    document.getElementById('test-order-modal').style.display = 'none';
}

// Donation Support Functions
function showSupportOptions() {
    document.getElementById('support-modal').style.display = 'flex';
}

function closeSupportModal() {
    document.getElementById('support-modal').style.display = 'none';
}

// Donate to Church Function
function donateToChurch() {
    closeSupportModal();
    // Set donation mode for church
    window.donationMode = true;
    window.donationRecipient = 'Three Bridges Reformed Church';
    
    // Show info message
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; padding: 50px;">
            <h3 style="color: #003F87; margin-bottom: 20px; font-size: 1.5rem;">⛪ Donating to Three Bridges Reformed Church</h3>
            <p style="margin-bottom: 30px; line-height: 1.6; font-size: 1.1rem;">Please select the mums you'd like to donate. Your entire order will be donated to the church.</p>
            <button onclick="this.closest('.modal').remove(); document.getElementById('catalog-screen').scrollIntoView({ behavior: 'smooth' });" 
                    class="btn btn-primary" style="background: #4CAF50; width: 100%; padding: 15px; font-size: 1.1rem; margin-bottom: 10px;">Select Mums to Donate</button>
            <button onclick="this.closest('.modal').remove(); window.donationMode = false; window.donationRecipient = '';" 
                    class="btn btn-secondary" style="background: #9E9E9E; color: white; width: 100%; padding: 15px; font-size: 1.1rem; border: none; border-radius: 5px; cursor: pointer;">No thanks</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Request Other Help Function
function requestOtherHelp() {
    closeSupportModal();
    document.getElementById('contact-modal').style.display = 'flex';
}

// Close Contact Modal
function closeContactModal() {
    document.getElementById('contact-modal').style.display = 'none';
}

// Submit Contact Request
async function submitContactRequest(event) {
    event.preventDefault();
    
    // Get the current scout name if available
    const scoutName = document.getElementById('scout-name')?.value || 
                     localStorage.getItem('scoutName') || '';
    
    const contactData = {
        name: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        scoutName: scoutName,
        type: 'other_help_inquiry'
    };
    
    showLoading(true);
    try {
        // Submit helper contact request to Sheets
        const helperData = {
            id: 'HELPER-' + Date.now(),
            name: contactData.name,
            email: contactData.email,
            scoutName: contactData.scoutName || 'Not specified',
            date: new Date().toISOString(),
            contacted: false,
            contactedBy: '',
            type: 'other_help'
        };
        
        const response = await sheetsAPI.submitHelper(helperData);
        
        // Debug logging to see what we're getting
        console.log('Helper submission response:', response);
        
        if (response && response.success) {
            // Show thank you message
            const thankYouModal = document.createElement('div');
            thankYouModal.className = 'modal';
            thankYouModal.style.display = 'flex';
            thankYouModal.style.zIndex = '10000';
            thankYouModal.innerHTML = `
                <div class="modal-content" style="max-width: 400px; padding: 40px; text-align: center;">
                    <h2 style="color: #4CAF50; margin-bottom: 20px;">✅ Thank You!</h2>
                    <p style="font-size: 1.1rem; color: #333; line-height: 1.6;">Thanks! We'll reach out to you shortly to discuss how you can help Pack 182.</p>
                </div>
            `;
            document.body.appendChild(thankYouModal);
            
            // Auto-dismiss after 3 seconds
            setTimeout(() => {
                thankYouModal.remove();
                closeContactModal();
            }, 3000);
        } else {
            console.error('Invalid response from API:', response);
            throw new Error(response?.error || response?.message || 'Failed to submit request - please check if Google Apps Script is updated');
        }
    } catch (error) {
        console.error('Contact request failed:', error);
        showError('Failed to submit contact request. Please try again or email pack182tech@gmail.com directly.');
    } finally {
        showLoading(false);
    }
}

// Show Success Message
function showSuccess(message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px; text-align: center;">
            <h3 style="color: #4CAF50; margin-bottom: 15px;">✓ Success!</h3>
            <p style="margin-bottom: 20px;">${message}</p>
            <button onclick="this.closest('.modal').remove();" class="btn btn-primary" style="background: #4CAF50;">OK</button>
        </div>
    `;
    document.body.appendChild(modal);
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

// Submit volunteer interest
async function submitVolunteerInterest(volunteerData) {
    showLoading(true);
    try {
        const response = await sheetsAPI.submitVolunteer(volunteerData);
        
        if (response.success) {
            // Show special confirmation for volunteers
            hideAllScreens();
            showVolunteerConfirmation(volunteerData);
            
            // Clear volunteer interest
            window.volunteerInterest = null;
        } else {
            throw new Error(response.message || 'Failed to submit volunteer interest');
        }
    } catch (error) {
        console.error('Volunteer submission failed:', error);
        showError(error.message || 'Failed to submit volunteer interest. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Show volunteer confirmation
function showVolunteerConfirmation(volunteerData) {
    const confirmationScreen = document.getElementById('confirmation-screen');
    confirmationScreen.style.display = 'block';
    
    // Customize confirmation for volunteers
    document.getElementById('confirmation-order-id').textContent = 'VOLUNTEER-' + Date.now();
    document.getElementById('confirmation-total').textContent = 'Thank You!';
    document.getElementById('receipt-order-total').textContent = 'Volunteer Interest Submitted';
    
    // Update customer info
    document.getElementById('receipt-customer-name').textContent = `${volunteerData.firstName} ${volunteerData.lastName}`;
    document.getElementById('receipt-customer-email').textContent = volunteerData.email;
    document.getElementById('receipt-customer-phone').textContent = volunteerData.phone;
    
    // Update items to show volunteer interests
    const itemsContainer = document.getElementById('receipt-items');
    let itemsHTML = '<tr><td colspan="4" style="text-align: center;">Thank you for your interest in volunteering!</td></tr>';
    volunteerData.volunteerTypes.forEach(type => {
        const typeLabels = {
            'events': 'Help at pack events',
            'equipment': 'Donate camping equipment',
            'space': 'Provide meeting space',
            'skills': 'Share professional skills',
            'transport': 'Help with transportation'
        };
        itemsHTML += `<tr><td colspan="4">✓ ${typeLabels[type] || type}</td></tr>`;
    });
    if (volunteerData.message) {
        itemsHTML += `<tr><td colspan="4">Message: ${volunteerData.message}</td></tr>`;
    }
    itemsContainer.innerHTML = itemsHTML;
    
    // Hide payment info for volunteers
    document.querySelector('.payment-section-compact').style.display = 'none';
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