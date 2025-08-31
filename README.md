# Cub Scouts Mums Ordering System

A free, web-based ordering system for Cub Scouts fundraising mum sales. Built with vanilla JavaScript and Google Sheets as the backend.

## Features

- 📱 Mobile-responsive design
- 🛒 Product catalog with real-time cart updates
- 📝 Smart order form with auto-save
- 💳 Venmo payment integration
- 👤 Admin dashboard for order management
- 📊 Google Sheets database
- 💰 Zero hosting costs
- 🖨️ Print-friendly receipts

## Quick Start

### Prerequisites
- Google account
- GitHub account (for hosting)
- Basic web browser

### Setup Steps

1. **Set up Google Sheets Database**
   - Create a new Google Sheet
   - Open Apps Script (Extensions > Apps Script)
   - Copy the code from `google-apps-script/Code.gs`
   - Run the setup function to initialize sheets

2. **Deploy Google Apps Script**
   - Click "Deploy" > "New Deployment"
   - Choose "Web app" as type
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Copy the Web App URL

3. **Configure the Frontend**
   - Fork this repository
   - Edit `js/config.js` and update:
     - `API_URL` with your Web App URL
     - Google Client ID (for admin auth)
   
4. **Enable GitHub Pages**
   - Go to Settings > Pages
   - Source: Deploy from branch
   - Branch: main, folder: / (root)
   - Save and wait for deployment

5. **Set up Google Sign-In (Optional)**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google Sign-In API
   - Create OAuth 2.0 credentials
   - Add your GitHub Pages URL to authorized origins
   - Update `admin.html` with your Client ID

## Project Structure

```
mums-site/
├── index.html              # Public order form
├── admin.html              # Admin dashboard
├── css/
│   ├── styles.css          # Main styles
│   ├── admin.css           # Admin styles
│   └── print.css           # Print styles
├── js/
│   ├── config.js           # Configuration
│   ├── sheets-api.js       # API wrapper
│   ├── app.js              # Main app logic
│   └── admin.js            # Admin logic
├── google-apps-script/
│   ├── Code.gs             # Backend API
│   └── SetupSheet.gs       # Sheet setup
└── docs/
    └── ADMIN_GUIDE.md      # Admin documentation
```

## Usage

### For Customers
1. Visit the site
2. Browse available mums
3. Add products to cart
4. Fill out order form
5. Submit order
6. Pay via Venmo using QR code
7. Receive confirmation with Order ID

### For Administrators
1. Access `/admin.html`
2. Sign in with Google account
3. Manage orders, products, and settings
4. Track payment status
5. Export orders to CSV
6. Update welcome messages

## Configuration

### Google Sheets Structure

**Products Sheet:**
- ID, Title, Price, Image URL, Available, Description

**Orders Sheet:**
- Order ID, Timestamp, Customer Info, Products, Payment Status, Order Status

**Settings Sheet:**
- Site configuration key-value pairs

### Environment Variables

Edit `js/config.js`:
```javascript
const CONFIG = {
    API_URL: 'YOUR_WEB_APP_URL',
    DEBUG: false
};
```

## Testing

1. **Local Testing:**
   - Use a local web server (e.g., `python -m http.server`)
   - Test all form validations
   - Verify cart calculations

2. **Demo Mode:**
   - Admin dashboard has demo login option
   - Test without Google Sign-In setup

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API calls failing | Check Web App URL in config.js |
| Orders not saving | Verify Google Sheets permissions |
| Images not loading | Use HTTPS URLs for images |
| Admin can't login | Check Google Client ID configuration |

## Support

For issues or questions:
- Check the [Admin Guide](docs/ADMIN_GUIDE.md)
- Review the setup documentation
- Test in demo mode first

## License

This project is provided as-is for Cub Scouts fundraising purposes.

## Credits

Built for Cub Scouts Pack fundraising activities.