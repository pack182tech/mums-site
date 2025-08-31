# Engineering Plan: Cub Scouts Mums Ordering System

## Executive Summary

A zero-cost, browser-based ordering system for Cub Scouts mums sales that prioritizes simplicity, accessibility, and ease of maintenance. The solution leverages free Google services for a complete end-to-end system.

## Proposed Architecture

### Technology Stack

**Frontend:**
- HTML5/CSS3/Vanilla JavaScript (no framework dependencies)
- Hosted on GitHub Pages (free static hosting)
- Mobile-first responsive design

**Backend/Data Storage:**
- Google Sheets as database
- Google Apps Script for business logic
- Google Forms as backup order collection method

**Authentication:**
- Google Sign-In for admin access
- No authentication required for order placement (public form)

**Notifications:**
- Gmail for automated email notifications via Apps Script

## System Components

### 1. Public Order Form (index.html)
- Welcome screen with admin-editable content
- Product catalog display with images
- Order form with smart features:
  - LocalStorage for saving customer information
  - Auto-complete from previous orders
  - Real-time price calculation
  - Form validation
- Payment instructions with Venmo QR code/handle
- Mobile-optimized interface

### 2. Admin Dashboard (admin.html)
- Google Sign-In authentication
- Manage products (add/edit/disable)
- Edit welcome screen content
- View and export orders
- Print-friendly order summaries

### 3. Google Sheets Database Structure

**Sheet 1: Products**
| Column | Purpose |
|--------|---------|
| ID | Unique product identifier |
| Title | Product name |
| Price | Product price |
| Image URL | Link to product image |
| Available | TRUE/FALSE availability flag |
| Description | Optional product description |

**Sheet 2: Orders**
| Column | Purpose |
|--------|---------|
| Order ID | Auto-generated unique ID |
| Timestamp | Order submission time |
| First Name | Customer first name |
| Last Name | Customer last name |
| Email | Customer email |
| Phone | Customer phone |
| Address | Physical address |
| Products | JSON string of ordered items |
| Total Price | Calculated total |
| Comments | Optional customer comments |
| Payment Status | PENDING/RECEIVED/CONFIRMED |
| Payment Method | Venmo/Cash/Check |
| Status | NEW/PROCESSED/COMPLETED |

**Sheet 3: Settings**
| Column | Purpose |
|--------|---------|
| Key | Setting identifier |
| Value | Setting value |
| Description | Setting description |

Settings include:
- welcome_title
- welcome_message
- instructions
- admin_email
- venmo_handle
- venmo_qr_url
- payment_instructions

### 4. Google Apps Script Functions

```javascript
// Core API endpoints via doGet/doPost
- getProducts() // Fetch available products
- getSettings() // Fetch site settings
- submitOrder() // Process new order
- sendOrderNotification() // Email admin
- updateProduct() // Admin: modify product
- updateSettings() // Admin: update welcome screen
- getOrders() // Admin: fetch all orders
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. Set up Google Sheets with initial structure
2. Create Google Apps Script project
3. Implement basic API endpoints
4. Set up GitHub repository and Pages hosting
5. Create basic HTML structure

### Phase 2: Public Interface (Week 2)
1. Build product catalog display
2. Implement order form with validation
3. Add LocalStorage for data persistence
4. Integrate with Google Sheets API
5. Implement real-time price calculation
6. Add payment instructions with Venmo QR code
7. Mobile responsiveness testing

### Phase 3: Admin Features (Week 3)
1. Implement Google Sign-In
2. Build admin dashboard
3. Product management interface
4. Welcome screen editor
5. Payment settings configuration
6. Order viewing with payment tracking
7. Print styling for orders

### Phase 4: Polish & Testing (Week 4)
1. Cross-browser testing
2. Mobile device testing
3. Load testing with sample data
4. Security review
5. Documentation for administrators
6. Deployment and handover

## File Structure

```
mums-site/
├── index.html           # Public order form
├── admin.html          # Admin dashboard
├── css/
│   ├── styles.css      # Main styles
│   └── print.css       # Print-specific styles
├── js/
│   ├── app.js          # Main application logic
│   ├── admin.js        # Admin functionality
│   └── sheets-api.js   # Google Sheets integration
├── images/
│   └── logo.png        # Cub Scouts logo
├── docs/
│   ├── ADMIN_GUIDE.md  # Administrator documentation
│   └── SETUP.md        # Initial setup instructions
└── README.md           # Project overview

Google Apps Script (separate):
├── Code.gs             # Main script
├── API.gs              # API handlers
└── Email.gs            # Email notifications
```

## Security Considerations

1. **Data Protection:**
   - No sensitive payment data stored (Venmo handles payments externally)
   - Customer data in private Google Sheet
   - Admin-only access to full order details
   - Payment confirmation handled manually by admin

2. **Authentication:**
   - Google OAuth for admin access
   - Public form requires no login
   - Rate limiting via Apps Script quotas

3. **Input Validation:**
   - Client-side validation for UX
   - Server-side validation in Apps Script
   - SQL injection not possible (no SQL)

## Cost Analysis

- **Hosting:** $0 (GitHub Pages)
- **Database:** $0 (Google Sheets)
- **Backend:** $0 (Google Apps Script)
- **Payment Processing:** $0 (Venmo peer-to-peer, no fees for personal accounts)
- **Domain:** Optional (~$12/year)
- **Total Required Cost:** $0

## Deployment Steps

1. Create Google account for Cub Scouts pack
2. Set up Google Sheets with template
3. Deploy Google Apps Script as Web App
4. Fork GitHub repository
5. Configure GitHub Pages
6. Update API endpoints in JavaScript
7. Set up Venmo account and generate QR code
8. Configure payment instructions in settings
9. Test end-to-end flow including payment instructions
10. Train administrators on payment reconciliation

## Maintenance Requirements

**Daily:**
- Check for new orders (automated email)

**Weekly:**
- Review and process orders
- Reconcile Venmo payments with orders
- Update product availability

**Monthly:**
- Update welcome message as needed
- Archive old orders

**Annually:**
- Clean up previous year's data
- Update product catalog for new season

## Success Metrics

1. **Technical:**
   - Page load time < 3 seconds
   - Mobile-friendly score > 95
   - Zero hosting costs maintained

2. **Business:**
   - Order submission success rate > 95%
   - Admin task completion < 5 minutes
   - Customer data retention for repeat orders

3. **User Experience:**
   - Form completion time < 2 minutes
   - Zero authentication friction for customers
   - Clear order confirmation with payment instructions
   - Easy Venmo payment flow

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Google Sheets API limits | Implement caching, batch operations |
| Lost orders | Email confirmation, backup to Google Forms |
| Admin lockout | Multiple admin accounts, recovery docs |
| Browser compatibility | Progressive enhancement, fallbacks |
| Mobile issues | Mobile-first design, extensive testing |
| Payment tracking | Manual reconciliation process, clear order IDs |
| Venmo account issues | Alternative payment methods (cash/check) |

## Payment Implementation Details

### Venmo Integration Approach
Since Venmo doesn't offer a free API for small organizations, we'll use a manual reconciliation approach:

1. **Order Submission:**
   - Customer completes order form
   - System displays Venmo QR code and payment instructions
   - Order saved with "Payment Pending" status
   - Customer adds Order ID to Venmo payment memo

2. **Payment Reconciliation:**
   - Admin checks Venmo transactions daily
   - Matches Order IDs in payment memos
   - Updates order payment status in dashboard
   - System sends confirmation email when marked paid

3. **User Experience:**
   - Clear payment amount displayed
   - One-tap Venmo QR code on mobile
   - Fallback to username/handle display
   - Alternative payment methods available

## Alternative Approaches Considered

1. **Firebase:** More complex, potential future costs
2. **Netlify Forms:** Limited free tier, vendor lock-in
3. **WordPress:** Requires hosting, maintenance overhead
4. **Square/Shopify:** Transaction fees (2.9% + $0.30), overkill for needs
5. **PayPal/Stripe:** Transaction fees, complex integration

## Conclusion

This engineering plan delivers a robust, zero-cost solution that meets all requirements while remaining simple enough for non-technical administrators to maintain. The use of familiar Google services reduces the learning curve and ensures long-term sustainability.