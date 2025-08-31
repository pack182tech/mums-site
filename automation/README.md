# Google Sheets Automation

This folder contains scripts to automatically update your Google Sheets with product and settings data.

## Two Methods Available

### Method 1: Google Sheets API (Recommended) ✅

Safer and more reliable using official Google API.

#### Setup:

1. **Install dependencies:**
   ```bash
   cd automation
   npm install
   ```

2. **Set up Google Cloud credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google Sheets API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Desktop app
   - Download JSON file
   - Save as `credentials.json` in this folder

3. **Run the script:**
   ```bash
   # First time - will ask you to authorize
   npm run setup
   
   # Update products
   npm run update-products
   
   # Update settings
   npm run update-settings
   
   # Update everything
   npm run update-all
   ```

### Method 2: Puppeteer Browser Automation

Uses browser automation (less secure, requires your Google password).

#### Setup:

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your credentials:**
   ```
   GOOGLE_EMAIL=your-email@gmail.com
   GOOGLE_PASSWORD=your-password
   SPREADSHEET_ID=1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk
   ```

3. **Run:**
   ```bash
   npm run puppeteer-update
   ```

## What Gets Updated

- **Products Sheet**: All product bundles from `products-for-sheets.csv`
- **Settings Sheet**: All settings from `settings-for-sheets.csv`
- **Orders Sheet**: Created if doesn't exist (for storing orders)

## Security Notes

⚠️ **NEVER commit these files:**
- `.env` (contains passwords)
- `credentials.json` (contains API keys)
- `token.json` (contains auth tokens)

Add them to `.gitignore`:
```bash
echo ".env" >> ../.gitignore
echo "credentials.json" >> ../.gitignore
echo "token.json" >> ../.gitignore
```

## Manual Update

If automation doesn't work, you can still manually copy/paste:
1. Open the CSV files in the parent directory
2. Copy all content
3. Paste into Google Sheets
4. Use Data → Split text to columns if needed