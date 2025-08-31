// Admin dashboard functionality

let isAuthenticated = false;
let orders = [];
let products = [];
let settings = {};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session
    const session = sessionStorage.getItem('admin_session');
    if (session) {
        isAuthenticated = true;
        showDashboard();
    }
    
    // Set up form handlers
    document.getElementById('settings-form').addEventListener('submit', handleSettingsSave);
});

// Google Sign-In callback
function handleCredentialResponse(response) {
    debugLog('Google Sign-In response received');
    // In production, verify the JWT token server-side
    // For now, just mark as authenticated
    isAuthenticated = true;
    sessionStorage.setItem('admin_session', 'true');
    showDashboard();
}

// Demo login (for testing without Google Sign-In)
function loginAsDemo() {
    isAuthenticated = true;
    sessionStorage.setItem('admin_session', 'demo');
    showDashboard();
}

// Logout
function logout() {
    isAuthenticated = false;
    sessionStorage.removeItem('admin_session');
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
}

// Show dashboard
async function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    
    // Load initial data
    await loadOrders();
    await loadProducts();
    await loadSettings();
    
    // Show orders tab by default
    showTab('orders');
}

// Tab navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).style.display = 'block';
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Mark button as active
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Refresh data if needed
    if (tabName === 'orders') {
        updateOrderStats();
    } else if (tabName === 'products') {
        renderAdminProducts();
    }
}

// Load orders
async function loadOrders() {
    showLoading(true);
    try {
        orders = await sheetsAPI.getOrders(sessionStorage.getItem('admin_session'));
        renderOrders();
        updateOrderStats();
    } catch (error) {
        console.error('Failed to load orders:', error);
        alert('Failed to load orders. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Render orders table
function renderOrders() {
    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">No orders found</td></tr>';
        return;
    }
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.className = `order-row order-status-${(order.order_status || 'NEW').toLowerCase()}`;
        
        // Parse products if needed
        let products = order.products;
        if (typeof products === 'string') {
            try {
                products = JSON.parse(products);
            } catch (e) {
                products = [];
            }
        }
        
        const productSummary = products.map(p => `${p.quantity}x ${p.title}`).join(', ');
        
        row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${formatDate(order.timestamp)}</td>
            <td>${order.first_name} ${order.last_name}</td>
            <td>
                <small>${order.email}<br>${order.phone}</small>
            </td>
            <td><small>${productSummary}</small></td>
            <td>$${parseFloat(order.total_price).toFixed(2)}</td>
            <td>
                <select onchange="updatePaymentStatus('${order.order_id}', this.value)" 
                        class="status-select payment-${(order.payment_status || 'PENDING').toLowerCase()}">
                    <option value="PENDING" ${order.payment_status === 'PENDING' ? 'selected' : ''}>Pending</option>
                    <option value="RECEIVED" ${order.payment_status === 'RECEIVED' ? 'selected' : ''}>Received</option>
                    <option value="CONFIRMED" ${order.payment_status === 'CONFIRMED' ? 'selected' : ''}>Confirmed</option>
                </select>
            </td>
            <td>
                <select onchange="updateOrderStatus('${order.order_id}', this.value)" 
                        class="status-select order-${(order.order_status || 'NEW').toLowerCase()}">
                    <option value="NEW" ${order.order_status === 'NEW' ? 'selected' : ''}>New</option>
                    <option value="PROCESSED" ${order.order_status === 'PROCESSED' ? 'selected' : ''}>Processed</option>
                    <option value="COMPLETED" ${order.order_status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                </select>
            </td>
            <td>
                <button onclick="viewOrder('${order.order_id}')" class="btn btn-small">View</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Update order statistics
function updateOrderStats() {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
    const pendingPayments = orders.filter(o => o.payment_status === 'PENDING').length;
    const newOrders = orders.filter(o => o.order_status === 'NEW').length;
    
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('pending-payments').textContent = pendingPayments;
    document.getElementById('new-orders').textContent = newOrders;
}

// Filter orders
function filterOrders() {
    const searchTerm = document.getElementById('order-search').value.toLowerCase();
    const paymentFilter = document.getElementById('payment-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    const rows = document.querySelectorAll('#orders-tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const paymentStatus = row.querySelector('.payment-select')?.value;
        const orderStatus = row.querySelector('.order-select')?.value;
        
        let show = true;
        
        if (searchTerm && !text.includes(searchTerm)) {
            show = false;
        }
        
        if (paymentFilter && paymentStatus !== paymentFilter) {
            show = false;
        }
        
        if (statusFilter && orderStatus !== statusFilter) {
            show = false;
        }
        
        row.style.display = show ? '' : 'none';
    });
}

// View order details
function viewOrder(orderId) {
    const order = orders.find(o => o.order_id === orderId);
    if (!order) return;
    
    let products = order.products;
    if (typeof products === 'string') {
        try {
            products = JSON.parse(products);
        } catch (e) {
            products = [];
        }
    }
    
    const details = `
        <div class="order-detail-grid">
            <div class="detail-section">
                <h4>Order Information</h4>
                <p><strong>Order ID:</strong> ${order.order_id}</p>
                <p><strong>Date:</strong> ${formatDate(order.timestamp)}</p>
                <p><strong>Status:</strong> ${order.order_status}</p>
                <p><strong>Payment Status:</strong> ${order.payment_status}</p>
                <p><strong>Payment Method:</strong> ${order.payment_method}</p>
            </div>
            
            <div class="detail-section">
                <h4>Customer Information</h4>
                <p><strong>Name:</strong> ${order.first_name} ${order.last_name}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Address:</strong><br>${order.address}</p>
            </div>
            
            <div class="detail-section full-width">
                <h4>Products</h4>
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td>${p.title}</td>
                                <td>${p.quantity}</td>
                                <td>$${p.price.toFixed(2)}</td>
                                <td>$${(p.quantity * p.price).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colspan="3">Total</th>
                            <th>$${parseFloat(order.total_price).toFixed(2)}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            ${order.comments ? `
            <div class="detail-section full-width">
                <h4>Comments</h4>
                <p>${order.comments}</p>
            </div>
            ` : ''}
        </div>
    `;
    
    document.getElementById('order-details').innerHTML = details;
    document.getElementById('order-modal').style.display = 'flex';
}

// Close order modal
function closeOrderModal() {
    document.getElementById('order-modal').style.display = 'none';
}

// Print order
function printOrder() {
    window.print();
}

// Update payment status
async function updatePaymentStatus(orderId, status) {
    try {
        await sheetsAPI.updateOrderStatus({
            orderId: orderId,
            paymentStatus: status
        }, sessionStorage.getItem('admin_session'));
        
        // Update local data
        const order = orders.find(o => o.order_id === orderId);
        if (order) {
            order.payment_status = status;
        }
        
        updateOrderStats();
    } catch (error) {
        console.error('Failed to update payment status:', error);
        alert('Failed to update payment status');
        loadOrders(); // Reload to revert
    }
}

// Update order status
async function updateOrderStatus(orderId, status) {
    try {
        await sheetsAPI.updateOrderStatus({
            orderId: orderId,
            orderStatus: status
        }, sessionStorage.getItem('admin_session'));
        
        // Update local data
        const order = orders.find(o => o.order_id === orderId);
        if (order) {
            order.order_status = status;
        }
        
        updateOrderStats();
    } catch (error) {
        console.error('Failed to update order status:', error);
        alert('Failed to update order status');
        loadOrders(); // Reload to revert
    }
}

// Refresh orders
function refreshOrders() {
    loadOrders();
}

// Export orders to CSV
function exportOrders() {
    let csv = 'Order ID,Date,Customer,Email,Phone,Products,Total,Payment Status,Order Status\n';
    
    orders.forEach(order => {
        let products = order.products;
        if (typeof products === 'string') {
            try {
                products = JSON.parse(products);
            } catch (e) {
                products = [];
            }
        }
        
        const productSummary = products.map(p => `${p.quantity}x ${p.title}`).join('; ');
        
        csv += `"${order.order_id}","${formatDate(order.timestamp)}","${order.first_name} ${order.last_name}",`;
        csv += `"${order.email}","${order.phone}","${productSummary}",`;
        csv += `"$${parseFloat(order.total_price).toFixed(2)}","${order.payment_status}","${order.order_status}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Load products for admin
async function loadProducts() {
    try {
        products = await sheetsAPI.getProducts();
        renderAdminProducts();
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

// Render products in admin view
function renderAdminProducts() {
    const grid = document.getElementById('admin-products-grid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = `product-card admin-product ${product.available ? '' : 'unavailable'}`;
        
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image_url || 'https://via.placeholder.com/300'}" 
                     alt="${product.title}" 
                     onerror="this.src='https://via.placeholder.com/300'">
                ${!product.available ? '<div class="unavailable-badge">Unavailable</div>' : ''}
            </div>
            <div class="product-info">
                <h3>${product.title}</h3>
                <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
                <p class="product-description">${product.description || ''}</p>
                <div class="product-actions">
                    <button onclick="editProduct('${product.id}')" class="btn btn-small">Edit</button>
                    <button onclick="toggleProductAvailability('${product.id}')" class="btn btn-small btn-secondary">
                        ${product.available ? 'Disable' : 'Enable'}
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Show add product modal
function showAddProduct() {
    document.getElementById('product-modal-title').textContent = 'Add Product';
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = 'MUM' + Date.now();
    document.getElementById('product-available').checked = true;
    document.getElementById('product-modal').style.display = 'flex';
}

// Edit product
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-title').value = product.title;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-image').value = product.image_url || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-available').checked = product.available;
    
    document.getElementById('product-modal').style.display = 'flex';
}

// Close product modal
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Save product
async function saveProduct(e) {
    e.preventDefault();
    
    const form = e.target;
    const productData = {
        id: form.id.value,
        title: form.title.value,
        price: parseFloat(form.price.value),
        imageUrl: form.image_url.value,
        description: form.description.value,
        available: form.available.checked
    };
    
    showLoading(true);
    try {
        await sheetsAPI.updateProduct(productData, sessionStorage.getItem('admin_session'));
        alert('Product saved successfully');
        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error('Failed to save product:', error);
        alert('Failed to save product');
    } finally {
        showLoading(false);
    }
}

// Toggle product availability
async function toggleProductAvailability(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const newAvailability = !product.available;
    
    try {
        await sheetsAPI.updateProduct({
            ...product,
            imageUrl: product.image_url,
            available: newAvailability
        }, sessionStorage.getItem('admin_session'));
        
        product.available = newAvailability;
        renderAdminProducts();
    } catch (error) {
        console.error('Failed to update product availability:', error);
        alert('Failed to update product availability');
    }
}

// Load settings
async function loadSettings() {
    try {
        settings = await sheetsAPI.getSettings();
        
        // Populate settings form
        const form = document.getElementById('settings-form');
        Object.keys(settings).forEach(key => {
            const input = form[key];
            if (input) {
                input.value = settings[key];
            }
        });
        
        // Update instructions preview
        updateInstructionsPreview();
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// Update instructions preview
function updateInstructionsPreview() {
    const instructionsInput = document.getElementById('instructions');
    const preview = document.getElementById('instructions-preview');
    
    if (!instructionsInput || !preview) return;
    
    const text = instructionsInput.value;
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length > 0) {
        const html = '<ol>' + 
            lines.map(line => `<li>${line.trim()}</li>`).join('') + 
            '</ol>';
        preview.innerHTML = html;
    } else {
        preview.innerHTML = '<em>No instructions entered yet</em>';
    }
}

// Add event listener for instructions input
document.addEventListener('DOMContentLoaded', function() {
    const instructionsInput = document.getElementById('instructions');
    if (instructionsInput) {
        instructionsInput.addEventListener('input', updateInstructionsPreview);
    }
});

// Save settings
async function handleSettingsSave(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const settingsData = {};
    
    for (let [key, value] of formData.entries()) {
        settingsData[key] = value;
    }
    
    showLoading(true);
    try {
        await sheetsAPI.updateSettings(settingsData, sessionStorage.getItem('admin_session'));
        alert('Settings saved successfully');
        settings = settingsData;
    } catch (error) {
        console.error('Failed to save settings:', error);
        alert('Failed to save settings');
    } finally {
        showLoading(false);
    }
}

// Helper functions
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showLoading(show) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}