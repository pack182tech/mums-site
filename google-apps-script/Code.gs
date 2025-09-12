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
      case 'helpers':
        return getHelpers(e);
      case 'reachouts':
        return getReachOuts(e);
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
      case 'volunteer':
        return submitVolunteer(data);
      case 'submitHelper':
        return submitHelper(data);
      case 'updateHelper':
        return updateHelper(data, e);
      case 'submitReachOut':
        return submitReachOut(data);
      case 'updateReachOut':
        return updateReachOut(data, e);
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
  
  // Prepare row data (with scout name and donation fields)
  const rowData = [
    orderId,
    timestamp,
    orderData.scoutName || '', // Scout Name
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
    'NEW', // Order Status
    orderData.orderType || 'standard', // Order Type (standard, donation, donated_mums)
    orderData.donationRecipient || '' // Donation Recipient if applicable
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
  // Customize subject based on order type
  let subject = `New Mums Order #${orderId}`;
  if (orderData.orderType === 'donation') {
    subject = `New Donation #${orderId}`;
  } else if (orderData.orderType === 'donated_mums') {
    subject = `New Donated Mums Order #${orderId}`;
  }
  
  let body = `
    New ${orderData.orderType === 'donation' ? 'donation' : 'order'} received!
    
    Order ID: ${orderId}
    Customer: ${orderData.firstName} ${orderData.lastName}
    Email: ${orderData.email}
    Phone: ${orderData.phone}
    Total: $${orderData.totalPrice}
    Payment Method: ${orderData.paymentMethod || 'Venmo'}
    `;
  
  // Add order type specific information
  if (orderData.orderType === 'donation') {
    body += `\n    Type: Direct Monetary Donation`;
  } else if (orderData.orderType === 'donated_mums') {
    body += `\n    Type: Donated Mums
    Recipient: ${orderData.donationRecipient || 'Three Bridges Reformed Church'}`;
  }
  
  body += `
    
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

// Submit volunteer interest
function submitVolunteer(volunteerData) {
  // Check if Volunteers sheet exists, create if not
  let sheet;
  try {
    sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Volunteers');
  } catch(e) {
    // Create Volunteers sheet if it doesn't exist
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    sheet = spreadsheet.insertSheet('Volunteers');
    
    // Add headers
    const headers = [
      'Volunteer ID',
      'Timestamp',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Volunteer Types',
      'Message',
      'Comments',
      'Status',
      'Contacted'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  const volunteerId = 'VOL' + Date.now();
  const timestamp = new Date();
  
  // Prepare row data
  const rowData = [
    volunteerId,
    timestamp,
    volunteerData.firstName,
    volunteerData.lastName,
    volunteerData.email,
    volunteerData.phone,
    volunteerData.volunteerTypes ? volunteerData.volunteerTypes.join(', ') : '',
    volunteerData.message || '',
    volunteerData.comments || '',
    'NEW',
    'NO'
  ];
  
  // Append to sheet
  sheet.appendRow(rowData);
  
  // Send notification email
  sendVolunteerNotification(volunteerId, volunteerData);
  
  return createJsonResponse({
    success: true,
    volunteerId: volunteerId,
    message: 'Thank you for your interest in volunteering!'
  });
}

// Send email notification for new volunteer
function sendVolunteerNotification(volunteerId, volunteerData) {
  const subject = `New Volunteer Interest - ${volunteerData.firstName} ${volunteerData.lastName}`;
  const body = `
    New volunteer interest received!
    
    Volunteer ID: ${volunteerId}
    Name: ${volunteerData.firstName} ${volunteerData.lastName}
    Email: ${volunteerData.email}
    Phone: ${volunteerData.phone}
    
    Areas of Interest:
    ${volunteerData.volunteerTypes ? volunteerData.volunteerTypes.map(t => '- ' + t).join('\n') : 'None specified'}
    
    Message: ${volunteerData.message || 'None'}
    Comments: ${volunteerData.comments || 'None'}
    
    Please follow up with this volunteer soon!
  `;
  
  ADMIN_EMAILS.forEach(email => {
    try {
      MailApp.sendEmail(email, subject, body);
    } catch(e) {
      console.error('Failed to send email to:', email, e);
    }
  });
}

// Submit reach out request
function submitReachOut(reachOutData) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Create or get ReachOuts sheet
    let reachOutsSheet;
    try {
      reachOutsSheet = ss.getSheetByName('ReachOuts');
    } catch(e) {
      reachOutsSheet = ss.insertSheet('ReachOuts');
      // Add headers
      reachOutsSheet.getRange(1, 1, 1, 6).setValues([
        ['ID', 'Date', 'Name', 'Email', 'Scout Name', 'Status']
      ]);
      reachOutsSheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    }
    
    // Generate ID
    const reachOutId = 'RO' + Date.now();
    
    // Add reach out data
    const rowData = [
      reachOutId,
      reachOutData.date || new Date().toISOString(),
      reachOutData.name || '',
      reachOutData.email || '',
      reachOutData.scoutName || '',
      reachOutData.status || 'pending'
    ];
    
    reachOutsSheet.appendRow(rowData);
    
    // Send email notification
    sendReachOutNotification(reachOutData);
    
    return createJsonResponse({
      success: true,
      id: reachOutId,
      message: 'Reach out request submitted successfully'
    });
  } catch(error) {
    console.error('Error submitting reach out:', error);
    return createJsonResponse({success: false, error: error.toString()}, 500);
  }
}

// Get reach outs (admin only)
function getReachOuts(e) {
  if (!isAdminRequest(e)) {
    return createJsonResponse({error: 'Unauthorized'}, 403);
  }
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let reachOutsSheet;
    
    try {
      reachOutsSheet = ss.getSheetByName('ReachOuts');
    } catch(e) {
      // Sheet doesn't exist yet
      return createJsonResponse({reachouts: []});
    }
    
    const data = reachOutsSheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return createJsonResponse({reachouts: []});
    }
    
    // Convert to objects
    const headers = data[0];
    const reachouts = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // Check if ID exists
        reachouts.push({
          id: row[0],
          date: row[1],
          name: row[2],
          email: row[3],
          scoutName: row[4],
          status: row[5]
        });
      }
    }
    
    // Sort by date descending
    reachouts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return createJsonResponse({reachouts: reachouts});
  } catch(error) {
    console.error('Error fetching reach outs:', error);
    return createJsonResponse({error: error.toString()}, 500);
  }
}

// Update reach out status
function updateReachOut(data, e) {
  if (!isAdminRequest(e)) {
    return createJsonResponse({error: 'Unauthorized'}, 403);
  }
  
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const reachOutsSheet = ss.getSheetByName('ReachOuts');
    const dataRange = reachOutsSheet.getDataRange();
    const values = dataRange.getValues();
    
    // Find the reach out by ID
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === data.id) {
        // Update status
        reachOutsSheet.getRange(i + 1, 6).setValue(data.status);
        
        return createJsonResponse({
          success: true,
          message: 'Reach out status updated'
        });
      }
    }
    
    return createJsonResponse({error: 'Reach out not found'}, 404);
  } catch(error) {
    console.error('Error updating reach out:', error);
    return createJsonResponse({error: error.toString()}, 500);
  }
}

// Send email notification for reach out
function sendReachOutNotification(reachOutData) {
  const subject = `New Help Request from ${reachOutData.name}`;
  const body = `
    Someone has requested to be contacted about helping Pack 182!
    
    Name: ${reachOutData.name}
    Email: ${reachOutData.email}
    Scout Name: ${reachOutData.scoutName || 'Not specified'}
    Date: ${new Date(reachOutData.date).toLocaleString()}
    
    Please reach out to them soon to discuss how they can help the pack.
    
    You can manage all reach out requests in the admin panel.
  `;
  
  ADMIN_EMAILS.forEach(email => {
    try {
      MailApp.sendEmail(email, subject, body);
    } catch(e) {
      console.error('Failed to send email to:', email, e);
    }
  });
}

// Submit helper request
function submitHelper(helperData) {
  let sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Helpers');
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    sheet = ss.insertSheet('Helpers');
    
    // Add headers
    const headers = [
      'Helper ID',
      'Timestamp',
      'Name',
      'Email',
      'Scout Name',
      'Type',
      'Contacted',
      'Contacted By',
      'Notes'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  
  const helperId = helperData.id || 'HELPER-' + Date.now();
  const timestamp = new Date();
  
  // Prepare row data
  const rowData = [
    helperId,
    timestamp,
    helperData.name,
    helperData.email,
    helperData.scoutName || 'Not specified',
    helperData.type || 'other_help',
    helperData.contacted || false,
    helperData.contactedBy || '',
    helperData.notes || ''
  ];
  
  // Append to sheet
  sheet.appendRow(rowData);
  
  // Send notification email
  sendHelperNotification(helperId, helperData);
  
  return createJsonResponse({
    success: true,
    helperId: helperId,
    message: 'Thank you for your interest in helping Pack 182!'
  });
}

// Get helpers list (admin only)
function getHelpers(e) {
  if (!isAdminRequest(e)) {
    return createJsonResponse({error: 'Unauthorized'}, 401);
  }
  
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Helpers');
  
  if (!sheet) {
    return createJsonResponse({helpers: []});
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const helpers = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Skip empty rows
    
    helpers.push({
      id: row[0],
      timestamp: row[1],
      name: row[2],
      email: row[3],
      scoutName: row[4],
      type: row[5],
      contacted: row[6] === true || row[6] === 'TRUE' || row[6] === 'Yes',
      contactedBy: row[7],
      notes: row[8]
    });
  }
  
  return createJsonResponse({helpers: helpers});
}

// Update helper status (admin only)
function updateHelper(helperData, e) {
  if (!isAdminRequest(e)) {
    return createJsonResponse({error: 'Unauthorized'}, 401);
  }
  
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Helpers');
    if (!sheet) {
      return createJsonResponse({error: 'Helpers sheet not found'}, 404);
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === helperData.id) {
        // Update contacted status
        if (helperData.contacted !== undefined) {
          sheet.getRange(i + 1, 7).setValue(helperData.contacted);
        }
        // Update contacted by
        if (helperData.contactedBy !== undefined) {
          sheet.getRange(i + 1, 8).setValue(helperData.contactedBy);
        }
        // Update notes
        if (helperData.notes !== undefined) {
          sheet.getRange(i + 1, 9).setValue(helperData.notes);
        }
        
        return createJsonResponse({
          success: true,
          message: 'Helper status updated'
        });
      }
    }
    
    return createJsonResponse({error: 'Helper not found'}, 404);
  } catch(error) {
    console.error('Error updating helper:', error);
    return createJsonResponse({error: error.toString()}, 500);
  }
}

// Send email notification for helper
function sendHelperNotification(helperId, helperData) {
  const subject = `New Helper Request from ${helperData.name}`;
  const body = `
    Someone has requested to help Pack 182!
    
    Name: ${helperData.name}
    Email: ${helperData.email}
    Scout Name: ${helperData.scoutName || 'Not specified'}
    Type: ${helperData.type || 'other_help'}
    Date: ${new Date().toLocaleString()}
    
    Please reach out to them soon to discuss how they can help the pack.
    
    You can manage all helper requests in the admin panel.
  `;
  
  ADMIN_EMAILS.forEach(email => {
    try {
      MailApp.sendEmail(email, subject, body);
    } catch(e) {
      console.error('Failed to send email to:', email, e);
    }
  });
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