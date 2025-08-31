# Administrator Guide

Complete guide for managing the Cub Scouts Mums Ordering System.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Daily Operations](#daily-operations)
3. [Managing Orders](#managing-orders)
4. [Managing Products](#managing-products)
5. [Site Settings](#site-settings)
6. [Payment Reconciliation](#payment-reconciliation)
7. [Troubleshooting](#troubleshooting)

## Initial Setup

### 1. Google Sheets Setup

1. **Create a new Google Sheet**
   - Go to [sheets.google.com](https://sheets.google.com)
   - Create a new blank spreadsheet
   - Name it "Cub Scouts Mums Orders"

2. **Install the Apps Script**
   - Click Extensions > Apps Script
   - Delete any existing code
   - Copy all code from `google-apps-script/Code.gs`
   - Create a new file named "SetupSheet"
   - Copy code from `google-apps-script/SetupSheet.gs`
   - Save the project (name it "Mums Order System")

3. **Run Initial Setup**
   - In Apps Script, select `setupSpreadsheet` function
   - Click "Run" button
   - Grant necessary permissions when prompted
   - Return to your spreadsheet - it should now have 3 sheets

4. **Deploy as Web App**
   - In Apps Script, click "Deploy" > "New Deployment"
   - Type: Web app
   - Description: "Mums Order API"
   - Execute as: Me
   - Who has access: Anyone
   - Click "Deploy"
   - **IMPORTANT: Copy the Web App URL**

### 2. GitHub Pages Setup

1. **Fork the Repository**
   - Go to the GitHub repository
   - Click "Fork" button
   - Clone to your computer: `git clone https://github.com/YOUR_USERNAME/mums-site`

2. **Configure the Site**
   - Open `js/config.js`
   - Replace `YOUR_DEPLOYMENT_ID` with your Web App URL
   - Save and commit changes

3. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Click Save
   - Your site will be available at: `https://YOUR_USERNAME.github.io/mums-site`

### 3. Google Sign-In Setup (Optional but Recommended)

1. **Create Google Cloud Project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project or select existing
   - Enable "Google Sign-In API"

2. **Create OAuth Credentials**
   - Go to APIs & Services > Credentials
   - Create Credentials > OAuth client ID
   - Application type: Web application
   - Name: "Mums Admin"
   - Authorized JavaScript origins: Add your GitHub Pages URL
   - Copy the Client ID

3. **Update Admin Page**
   - Edit `admin.html`
   - Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID
   - Commit and push changes

## Daily Operations

### Morning Routine
1. Check for new orders in admin dashboard
2. Review payment pending orders
3. Check Venmo for payments received
4. Update payment status for confirmed payments
5. Send any necessary follow-up emails

### Evening Routine
1. Final order check for the day
2. Update order statuses (NEW → PROCESSED)
3. Export daily orders if needed
4. Check product availability

## Managing Orders

### Viewing Orders
1. Navigate to `yoursite.github.io/mums-site/admin.html`
2. Sign in with your Google account
3. Orders tab shows all orders with:
   - Order ID
   - Customer information
   - Products ordered
   - Payment status
   - Order status

### Order Statuses

**Payment Status:**
- `PENDING` - Awaiting payment
- `RECEIVED` - Payment seen in Venmo
- `CONFIRMED` - Payment verified and cleared

**Order Status:**
- `NEW` - Just submitted
- `PROCESSED` - Being prepared
- `COMPLETED` - Ready/delivered

### Filtering Orders
- Use search box for customer names or order IDs
- Filter by payment status
- Filter by order status
- Combine filters for specific views

### Exporting Orders
1. Click "Export to CSV" button
2. File downloads automatically
3. Open in Excel or Google Sheets
4. Use for:
   - Bulk order preparation
   - Financial records
   - Pick-up checklists

## Managing Products

### Adding New Products
1. Go to Products tab
2. Click "Add Product"
3. Fill in:
   - Product ID (e.g., MUM009)
   - Title
   - Price
   - Image URL (use free image hosting)
   - Description
4. Check "Available" box
5. Click Save

### Editing Products
1. Find product in grid
2. Click "Edit" button
3. Modify any fields
4. Save changes

### Disabling Products (Sold Out)
1. Find product
2. Click "Disable" button
3. Product remains in system but hidden from customers

### Image Requirements
- Use HTTPS URLs only
- Recommended size: 300x300 pixels
- Free image hosting options:
  - [Imgur](https://imgur.com)
  - [ImgBB](https://imgbb.com)
  - GitHub repository

## Site Settings

### Welcome Screen
- **Title**: Main heading on homepage
- **Message**: Introductory text
- **Instructions**: Step-by-step ordering guide

### Payment Settings
- **Venmo Handle**: Your @username
- **QR Code URL**: Link to QR code image
- **Instructions**: Payment note requirements

### Pickup Information
- **Location**: Address or landmark
- **Date/Time**: When to pick up orders

### Updating Settings
1. Go to Settings tab
2. Modify any fields
3. Click "Save Settings"
4. Changes appear immediately on public site

## Payment Reconciliation

### Daily Process
1. **Check Venmo App**
   - Look for payments with Order IDs
   - Match amounts to order totals
   
2. **Update Payment Status**
   - Find order in dashboard
   - Change payment status dropdown
   - PENDING → RECEIVED → CONFIRMED

3. **Handle Issues**
   - Missing Order ID: Match by amount and name
   - Wrong amount: Contact customer
   - No payment after 48 hours: Send reminder

### Payment Methods

**Venmo (Recommended):**
- Instant notification
- Easy to track with Order IDs
- No fees for personal accounts

**Cash:**
- Mark as RECEIVED when promised
- Mark as CONFIRMED when collected

**Check:**
- Mark as RECEIVED when received
- Mark as CONFIRMED when cleared

## Troubleshooting

### Common Issues

**"Failed to load products"**
- Check Google Apps Script deployment
- Verify Web App URL in config.js
- Re-deploy Apps Script if needed

**Orders not appearing**
- Refresh the page
- Check Google Sheets directly
- Verify Apps Script is running

**Can't sign in to admin**
- Check Google Client ID
- Verify authorized domains
- Try demo mode for testing

**Images not showing**
- Use HTTPS URLs only
- Check if image host is working
- Replace with placeholder if needed

### Google Sheets Direct Access

If the admin dashboard isn't working:
1. Open your Google Sheet directly
2. Orders are in the "Orders" sheet
3. Update statuses manually
4. Products in "Products" sheet
5. Settings in "Settings" sheet

### Emergency Procedures

**Site is down:**
1. Share Google Form backup (create from Sheet)
2. Accept orders via email/phone
3. Enter manually later

**Can't access admin:**
1. Use Google Sheets directly
2. Grant access to backup admin
3. Check from different browser/device

## Best Practices

### Security
- Never share the Google Apps Script URL publicly
- Limit admin access to trusted individuals
- Regularly review order data
- Don't store sensitive payment information

### Customer Service
- Respond to orders within 24 hours
- Send confirmation emails for large orders
- Keep welcome message updated
- Provide clear pickup instructions

### Data Management
- Export orders weekly for backup
- Archive old orders after season
- Keep product images under 500KB
- Test site on mobile regularly

### Seasonal Preparation
1. **Before Sale:**
   - Update all products
   - Test order flow completely
   - Set up Venmo QR code
   - Train backup administrators

2. **During Sale:**
   - Check orders twice daily
   - Update availability promptly
   - Respond to customer questions
   - Track payment reconciliation

3. **After Sale:**
   - Export all data
   - Calculate totals
   - Archive spreadsheet
   - Document lessons learned

## Support Resources

### Getting Help
1. Check this guide first
2. Review README.md
3. Test in demo mode
4. Check browser console for errors

### Useful Links
- [Google Sheets Help](https://support.google.com/sheets)
- [Google Apps Script Docs](https://developers.google.com/apps-script)
- [GitHub Pages Docs](https://pages.github.com)

### Backup Contacts
Document your setup:
- Google Apps Script URL: ________________
- GitHub Repository: ________________
- Admin Google Account: ________________
- Venmo Handle: ________________

## Quick Reference Card

### Daily Checklist
- [ ] Check new orders
- [ ] Review Venmo payments
- [ ] Update payment statuses
- [ ] Mark processed orders
- [ ] Check product availability
- [ ] Respond to questions

### Order Processing Flow
1. NEW order received → Email notification
2. Check Venmo for payment
3. Update to PAYMENT RECEIVED
4. Process order → Mark PROCESSED
5. Customer pickup → Mark COMPLETED

### Important URLs
- Public Site: `https://[username].github.io/mums-site`
- Admin Dashboard: `https://[username].github.io/mums-site/admin.html`
- Google Sheet: `https://docs.google.com/spreadsheets/d/[id]`
- Apps Script: `https://script.google.com/[project]`