// Script to set up the Google Sheet with required structure
// Run this once to initialize your spreadsheet

function setupSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create Products sheet
  let productsSheet = ss.getSheetByName('Products');
  if (!productsSheet) {
    productsSheet = ss.insertSheet('Products');
  }
  productsSheet.clear();
  productsSheet.getRange(1, 1, 1, 6).setValues([[
    'ID', 'Title', 'Price', 'Image URL', 'Available', 'Description'
  ]]);
  
  // Add sample products
  const sampleProducts = [
    ['MUM001', '6" Yellow Mum', 15.00, 'https://via.placeholder.com/300x300/FFD700/000000?text=Yellow+Mum', true, 'Beautiful yellow chrysanthemum in 6-inch pot'],
    ['MUM002', '6" Purple Mum', 15.00, 'https://via.placeholder.com/300x300/9370DB/FFFFFF?text=Purple+Mum', true, 'Vibrant purple chrysanthemum in 6-inch pot'],
    ['MUM003', '6" Orange Mum', 15.00, 'https://via.placeholder.com/300x300/FF8C00/000000?text=Orange+Mum', true, 'Bright orange chrysanthemum in 6-inch pot'],
    ['MUM004', '8" Yellow Mum', 20.00, 'https://via.placeholder.com/300x300/FFD700/000000?text=Large+Yellow', true, 'Large yellow chrysanthemum in 8-inch pot'],
    ['MUM005', '8" Purple Mum', 20.00, 'https://via.placeholder.com/300x300/9370DB/FFFFFF?text=Large+Purple', true, 'Large purple chrysanthemum in 8-inch pot'],
    ['MUM006', '8" Orange Mum', 20.00, 'https://via.placeholder.com/300x300/FF8C00/000000?text=Large+Orange', true, 'Large orange chrysanthemum in 8-inch pot'],
    ['MUM007', '10" Mixed Color Mum', 30.00, 'https://via.placeholder.com/300x300/32CD32/FFFFFF?text=Mixed+Colors', true, 'Extra large mixed color mum in 10-inch pot'],
    ['MUM008', 'Hanging Basket Mum', 35.00, 'https://via.placeholder.com/300x300/FF69B4/000000?text=Hanging+Basket', true, 'Beautiful mum in hanging basket']
  ];
  
  if (productsSheet.getLastRow() === 1) {
    productsSheet.getRange(2, 1, sampleProducts.length, 6).setValues(sampleProducts);
  }
  
  // Format Products sheet
  productsSheet.setFrozenRows(1);
  productsSheet.getRange(1, 1, 1, 6).setFontWeight('bold').setBackground('#4CAF50').setFontColor('white');
  productsSheet.autoResizeColumns(1, 6);
  
  // Create Orders sheet (with donation fields)
  let ordersSheet = ss.getSheetByName('Orders');
  if (!ordersSheet) {
    ordersSheet = ss.insertSheet('Orders');
  }
  ordersSheet.clear();
  ordersSheet.getRange(1, 1, 1, 16).setValues([[
    'Order ID', 'Timestamp', 'Scout Name', 'First Name', 'Last Name', 'Email', 'Phone', 
    'Address', 'Products', 'Total Price', 'Comments', 'Payment Status', 
    'Payment Method', 'Order Status', 'Order Type', 'Donation Recipient'
  ]]);
  
  // Format Orders sheet
  ordersSheet.setFrozenRows(1);
  ordersSheet.getRange(1, 1, 1, 16).setFontWeight('bold').setBackground('#2196F3').setFontColor('white');
  ordersSheet.autoResizeColumns(1, 16);
  
  // Create Settings sheet
  let settingsSheet = ss.getSheetByName('Settings');
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet('Settings');
  }
  settingsSheet.clear();
  settingsSheet.getRange(1, 1, 1, 3).setValues([['Key', 'Value', 'Description']]);
  
  // Add default settings
  const defaultSettings = [
    ['welcome_title', 'Cub Scouts Pack 123 Mum Sale', 'Title shown on welcome screen'],
    ['welcome_message', 'Support our pack by purchasing beautiful fall mums! All proceeds go directly to pack activities and camping trips.', 'Main welcome message'],
    ['instructions', '1. Select your mums from our catalog\n2. Fill out the order form\n3. Submit your order\n4. Pay via Venmo using the QR code\n5. Pick up your mums on Saturday, September 21st', 'Order instructions'],
    ['admin_email', 'pack123@example.com', 'Email for order notifications'],
    ['venmo_handle', '@CubScoutsPack123', 'Venmo username'],
    ['venmo_qr_url', 'https://via.placeholder.com/200x200/000000/FFFFFF?text=Venmo+QR', 'URL to Venmo QR code image'],
    ['payment_instructions', 'Please include your Order ID in the Venmo payment description', 'Payment instructions'],
    ['pickup_location', 'Elementary School Parking Lot - 123 Main St', 'Pickup location'],
    ['pickup_date', 'Saturday, September 21st, 9am-2pm', 'Pickup date and time']
  ];
  
  settingsSheet.getRange(2, 1, defaultSettings.length, 3).setValues(defaultSettings);
  
  // Format Settings sheet
  settingsSheet.setFrozenRows(1);
  settingsSheet.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#FF9800').setFontColor('white');
  settingsSheet.autoResizeColumns(1, 3);
  
  // Create Volunteers sheet
  let volunteersSheet = ss.getSheetByName('Volunteers');
  if (!volunteersSheet) {
    volunteersSheet = ss.insertSheet('Volunteers');
  }
  volunteersSheet.clear();
  volunteersSheet.getRange(1, 1, 1, 11).setValues([[
    'Volunteer ID', 'Timestamp', 'First Name', 'Last Name', 'Email', 'Phone',
    'Volunteer Types', 'Message', 'Comments', 'Status', 'Contacted'
  ]]);
  
  // Format Volunteers sheet
  volunteersSheet.setFrozenRows(1);
  volunteersSheet.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#9C27B0').setFontColor('white');
  volunteersSheet.autoResizeColumns(1, 11);
  
  // Set spreadsheet name
  ss.rename('Cub Scouts Mums Order System');
  
  SpreadsheetApp.getUi().alert('Setup Complete! Your spreadsheet is ready to use.');
}

// Create menu item
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Mums System')
    .addItem('Initial Setup', 'setupSpreadsheet')
    .addItem('Export Orders to PDF', 'exportOrdersToPDF')
    .addSeparator()
    .addItem('About', 'showAbout')
    .addToUi();
}

// Export orders to PDF
function exportOrdersToPDF() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ordersSheet = ss.getSheetByName('Orders');
  
  if (!ordersSheet) {
    SpreadsheetApp.getUi().alert('Orders sheet not found!');
    return;
  }
  
  // Create a temporary sheet with formatted data
  const tempSheet = ss.insertSheet('Print View');
  const data = ordersSheet.getDataRange().getValues();
  
  // Copy only essential columns for printing
  const printData = data.map(row => [
    row[0], // Order ID
    row[1], // Timestamp
    `${row[2]} ${row[3]}`, // Full Name
    row[4], // Email
    row[5], // Phone
    row[8], // Total Price
    row[10], // Payment Status
    row[12] // Order Status
  ]);
  
  tempSheet.getRange(1, 1, printData.length, printData[0].length).setValues(printData);
  tempSheet.getRange(1, 1, 1, printData[0].length)
    .setValues([['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Total', 'Payment', 'Status']])
    .setFontWeight('bold');
  
  // Format for printing
  tempSheet.autoResizeColumns(1, printData[0].length);
  
  // Generate PDF URL
  const url = `https://docs.google.com/spreadsheets/d/${ss.getId()}/export?` +
    `format=pdf&` +
    `size=letter&` +
    `portrait=false&` +
    `fitw=true&` +
    `sheetnames=false&` +
    `printtitle=false&` +
    `pagenumbers=false&` +
    `gridlines=true&` +
    `fzr=false&` +
    `gid=${tempSheet.getSheetId()}`;
  
  // Show download link
  const html = `<a href="${url}" target="_blank">Click here to download Orders PDF</a>`;
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(300).setHeight(100),
    'Download PDF'
  );
  
  // Clean up temp sheet after a delay
  Utilities.sleep(5000);
  ss.deleteSheet(tempSheet);
}

// Show about dialog
function showAbout() {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Cub Scouts Mums Order System</h2>
      <p>Version 1.0</p>
      <p>This system helps manage mum sales for fundraising.</p>
      <hr>
      <p><strong>Support:</strong> contact@example.com</p>
    </div>
  `;
  
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(html).setWidth(400).setHeight(300),
    'About'
  );
}