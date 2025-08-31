# Pack 182 Mums - Browser Automation Scripts

This folder contains Puppeteer browser automation scripts to update Google Sheets with product and settings data.

## Quick Start

### 1. Install Dependencies
```bash
cd automation
npm install
```

### 2. Set Up Your Credentials

Copy the template and add your Google credentials:
```bash
cp .env.template .env
```

Edit `.env` and add:
- Your Google email (pack182tech@gmail.com)
- Your Google password or App Password (if using 2FA)

⚠️ **Security Note**: If you have 2-Factor Authentication enabled:
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Generate an app-specific password
3. Use that password instead of your regular password

### 3. Test the Browser Setup
```bash
npm test
```

This will verify that Puppeteer can launch and navigate properly.

### 4. Update Google Sheets

Update everything (products, settings, and create Orders sheet):
```bash
npm run update-all
```

Update only products:
```bash
npm run update-products
```

Update only settings:
```bash
npm run update-settings
```

## What Gets Updated

### Products Sheet
- Reads from: `../products-for-sheets.csv`
- Updates: Products sheet in Google Sheets
- Columns: id, title, description, price, image_url, available, category

### Settings Sheet
- Reads from: `../settings-for-sheets.csv`
- Updates: Settings sheet in Google Sheets
- Columns: Key, Value

### Orders Sheet
- Created automatically if it doesn't exist
- Used by the web app to save orders

## How It Works

The automation uses Puppeteer to:
1. Launch a Chrome browser (visible or headless)
2. Log into your Google account
3. Navigate to your Google Sheets
4. Select each sheet (Products, Settings, Orders)
5. Clear existing data
6. Paste new data from CSV files

## Files in This Directory

- `package.json` - Node.js dependencies and scripts
- `update-sheets.js` - Main browser automation script
- `test-browser.js` - Browser test script
- `.env.template` - Template for credentials
- `.env` - Your actual credentials (DO NOT COMMIT)
- `.gitignore` - Prevents credentials from being committed

## Security Notes

⚠️ **NEVER commit these files:**
- `.env` - Contains your Google password
- `error-screenshot.png` - May contain sensitive data

These files are automatically ignored by Git.

## Troubleshooting

### "Missing credentials" error
- Make sure you've created `.env` file from `.env.template`
- Add your Google email and password

### "Login failed" error
- Check your email and password in `.env`
- If using 2FA, create an App Password
- Try setting `HEADLESS=false` to see what's happening

### "Cannot find sheet" error
- Make sure the Google Sheet has the correct tabs: Products, Settings
- The script will create Orders tab if it doesn't exist

### Browser doesn't close
- Press Ctrl+C to stop the script
- The browser should close automatically

## Manual Update (If Automation Fails)

1. Open the CSV files in the parent directory
2. Copy all content (Ctrl+A, Ctrl+C)
3. Open the Google Sheet
4. Paste into the appropriate sheet
5. Use Data → Split text to columns if needed