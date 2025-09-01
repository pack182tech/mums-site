// Main Google Apps Script for Cub Scouts Mums Ordering System
// Deploy this as a Web App with anonymous access

// Configuration
const SPREADSHEET_ID = '1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk'; // Replace with actual ID
const ADMIN_EMAILS = ['pack182tech@gmail.com']; // Replace with actual admin emails

// Handle OPTIONS requests for CORS
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Main entry point for GET requests
function doGet(e) {
  const path = e.parameter.path || 'home';
  
  try {
    switch(path) {
      case 'products':
        return getProducts();
      case 'settings':
        return getSettings();
      case 'orders':
        return getOrders(e);
      default:
        return createJsonResponse({error: 'Invalid path'}, 404);
    }
  } catch(error) {
    console.error('Error in doGet:', error);
    return createJsonResponse({error: error.toString()}, 500);
  }
}

// Main entry point for POST requests
function doPost(e) {
  const path = e.parameter.path || '';
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    switch(path) {
      case 'order':
        return submitOrder(data);
      case 'updateProduct':
        return updateProduct(data, e);
      case 'updateSettings':
        return updateSettings(data, e);
      case 'updateOrderStatus':
        return updateOrderStatus(data, e);
      default:
        return createJsonResponse({error: 'Invalid path'}, 404);
    }
  } catch(error) {
    console.error('Error in doPost:', error);
    return createJsonResponse({error: error.toString()}, 500);
  }
}

// Get all available products
function getProducts() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const products = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) { // Check if ID exists
      const product = {};
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        product[key] = row[index];
      });
      // Ensure we have an id field (might be 'id' or could be missing)
      if (!product.id && product.ID) {
        product.id = product.ID;
      }
      if (!product.id && row[0]) {
        product.id = row[0]; // Use first column as ID if no id field found
      }
      products.push(product);
    }
  }
  
  return createJsonResponse({products: products});
}

// Get site settings
function getSettings() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Settings');
  const data = sheet.getDataRange().getValues();
  const settings = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      settings[row[0]] = row[1];
    }
  }
  
  return createJsonResponse({settings: settings});
}

// Submit a new order
function submitOrder(orderData) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Orders');
  const orderId = generateOrderId();
  const timestamp = new Date();
  
  // Prepare row data
  const rowData = [
    orderId,
    timestamp,
    orderData.firstName,
    orderData.lastName,
    orderData.email,
    orderData.phone,
    orderData.address,
    JSON.stringify(orderData.products),
    orderData.totalPrice,
    orderData.comments || '',
    'PENDING', // Payment Status
    orderData.paymentMethod || 'Venmo',
    'NEW' // Order Status
  ];
  
  // Append to sheet
  sheet.appendRow(rowData);
  
  // Send notification email
  sendOrderNotification(orderId, orderData);
  
  return createJsonResponse({
    success: true,
    orderId: orderId,
    message: 'Order submitted successfully'
  });
}

// Send email notification for new order
function sendOrderNotification(orderId, orderData) {
  const subject = `New Mums Order #${orderId}`;
  const body = `
    New order received!
    
    Order ID: ${orderId}
    Customer: ${orderData.firstName} ${orderData.lastName}
    Email: ${orderData.email}
    Phone: ${orderData.phone}
    Total: $${orderData.totalPrice}
    Payment Method: ${orderData.paymentMethod || 'Venmo'}
    
    Products:
    ${formatProductsForEmail(orderData.products)}
    
    Comments: ${orderData.comments || 'None'}
    
    Please check the admin dashboard for full details.
  `;
  
  ADMIN_EMAILS.forEach(email => {
    try {
      MailApp.sendEmail(email, subject, body);
    } catch(e) {
      console.error('Failed to send email to:', email, e);
    }
  });
}

// Format products for email
function formatProductsForEmail(products) {
  return products.map(p => `- ${p.title}: ${p.quantity} x $${p.price} = $${p.quantity * p.price}`).join('\n');
}

// Generate unique order ID
function generateOrderId() {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MUM${year}${month}${day}${random}`;
}

// Get all orders (admin only)
function getOrders(e) {
  // Simple auth check - in production, implement proper OAuth
  if (!isAdminRequest(e)) {
    return createJsonResponse({error: 'Unauthorized'}, 401);
  }
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Orders');
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const orders = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      const order = {};
      headers.forEach((header, index) => {
        if (header.toLowerCase() === 'products') {
          try {
            order[header.toLowerCase()] = JSON.parse(row[index]);
          } catch(e) {
            order[header.toLowerCase()] = row[index];
          }
        } else {
          order[header.toLowerCase().replace(/\s+/g, '_')] = row[index];
        }
      });
      orders.push(order);
    }
  }
  
  return createJsonResponse({orders: orders});
}

// Update product (admin only)
function updateProduct(productData, e) {
  if (!isAdminRequest(e)) {
    return createJsonResponse({error: 'Unauthorized'}, 401);
  }
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Products');
  const data = sheet.getDataRange().getValues();
  
  // Find product row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === productData.id) {
      // Update row
      sheet.getRange(i + 1, 1, 1, 6).setValues([[
        productData.id,
        productData.title,
        productData.price,
        productData.imageUrl,
        productData.available,
        productData.description
      ]]);
      return createJsonResponse({success: true});
    }
  }
  
  return createJsonResponse({error: 'Product not found'}, 404);
}

// Update settings (admin only)
function updateSettings(settingsData, e) {
  if (!isAdminRequest(e)) {
    return createJsonResponse({error: 'Unauthorized'}, 401);
  }
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Settings');
  const data = sheet.getDataRange().getValues();
  
  Object.keys(settingsData).forEach(key => {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(settingsData[key]);
        found = true;
        break;
      }
    }
    if (!found) {
      // Add new setting
      sheet.appendRow([key, settingsData[key], '']);
    }
  });
  
  return createJsonResponse({success: true});
}

// Update order status (admin only)
function updateOrderStatus(orderData, e) {
  if (!isAdminRequest(e)) {
    return createJsonResponse({error: 'Unauthorized'}, 401);
  }
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Orders');
  const data = sheet.getDataRange().getValues();
  
  // Find order row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === orderData.orderId) {
      // Update payment and order status
      if (orderData.paymentStatus) {
        sheet.getRange(i + 1, 11).setValue(orderData.paymentStatus);
      }
      if (orderData.orderStatus) {
        sheet.getRange(i + 1, 13).setValue(orderData.orderStatus);
      }
      return createJsonResponse({success: true});
    }
  }
  
  return createJsonResponse({error: 'Order not found'}, 404);
}

// Check if request is from admin (simplified - implement proper auth in production)
function isAdminRequest(e) {
  // In production, verify OAuth token or session
  // For now, check for admin parameter (NOT SECURE - just for demo)
  return e.parameter.admin === 'true';
}

// Create JSON response with CORS headers
function createJsonResponse(data, status = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}