# Pack 182 Mums - Automation Scripts

This folder contains automation scripts to update Google Sheets with product and settings data.

## Quick Start

### 1. Install Dependencies
```bash
cd automation
npm install
```

### 2. Set Up Google API Credentials

Follow Option 1 from PLAYWRIGHT_SETUP.md:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project named "Pack182-Mums"
3. Enable Google Sheets API
4. Create OAuth 2.0 credentials (Desktop app type)
5. Download the JSON file
6. Save it as `automation/credentials.json`

### 3. Authorize the Application
```bash
npm run setup
```

This will:
- Open a browser window for authorization
- Ask you to grant permissions
- Save the token for future use

### 4. Test the Connection
```bash
npm test
```

### 5. Update Google Sheets

Update everything:
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

## Files in This Directory

- `package.json` - Node.js dependencies and scripts
- `setup-auth.js` - Initial OAuth2 setup script
- `update-sheets-api.js` - Main update script
- `test-connection.js` - Connection test script
- `.gitignore` - Prevents credentials from being committed

## Security Notes

⚠️ **NEVER commit these files:**
- `credentials.json` - Your OAuth2 client credentials
- `token.json` - Your access token
- `service-account.json` - Service account key (if using)

These files are automatically ignored by Git.

## Troubleshooting

### "credentials.json not found"
- Make sure you've downloaded the OAuth2 credentials from Google Cloud Console
- Save the file as `credentials.json` in this folder

### "token.json not found"
- Run `npm run setup` to authorize the application

### "Permission denied" or "404 Not Found"
- Check that the spreadsheet ID is correct in `update-sheets-api.js`
- Make sure the spreadsheet is accessible by your Google account

### "Invalid grant" error
- Your token has expired
- Run `npm run setup` again to get a new token

## Manual Update (If Automation Fails)

1. Open the CSV files in the parent directory
2. Copy all content (Ctrl+A, Ctrl+C)
3. Open the Google Sheet
4. Paste into the appropriate sheet
5. Use Data → Split text to columns if needed