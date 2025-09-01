# Automated Deployment Guide

## Overview
This guide explains how to use the improved automation scripts that bypass Google's bot detection using stealth techniques and session persistence.

## Prerequisites
1. Node.js installed (v14 or higher)
2. Google account credentials
3. CSV file with product data (`products-for-sheets.csv`)

## Installation
```bash
cd automation
npm install
```

## Configuration
Create a `.env` file in the automation directory with:
```
GOOGLE_EMAIL=your-email@gmail.com
GOOGLE_PASSWORD=your-password
SPREADSHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
```

**Note:** If you have 2FA enabled, you may need to use an App Password or complete manual login on first run.

## Available Scripts

### 1. Main Deployment Script (Recommended)
```bash
node deploy-all.js [command]
```

Commands:
- `all` - Updates both Google Sheets and Apps Script (default)
- `sheets` - Updates Google Sheets only  
- `gas` - Updates Google Apps Script only

**Features:**
- Session persistence (login once, reuse for future runs)
- Anti-detection with stealth techniques
- Colored console output for better readability
- Automatic screenshots for verification

### 2. Individual Scripts

#### Update Google Sheets with Stealth
```bash
node update-sheets-stealth.js
```
Updates the Products sheet with data from `products-for-sheets.csv`

#### Deploy Google Apps Script with Stealth
```bash
node deploy-gas-stealth.js
```
Updates and deploys the Code.gs file to Google Apps Script

### 3. Legacy Scripts (May be blocked by Google)
- `update-sheets-playwright.js` - Original Playwright version
- `deploy-gas.js` - Original Puppeteer version
- `update-sheets.js` - Basic Puppeteer version

## First Time Setup

1. **Run the main script:**
   ```bash
   node deploy-all.js
   ```

2. **Manual login required on first run:**
   - A browser window will open
   - Complete the Google login manually
   - Handle any 2FA or security challenges
   - The script will save your session for future use

3. **Session saved:**
   - After successful login, sessions are saved in:
     - `google-session.json`
     - `google-cookies.json`
   - Future runs will use these saved sessions

## Troubleshooting

### Authentication Issues
- **Problem:** Google blocks automated login
- **Solution:** Complete manual login in the browser window. The script will wait up to 5 minutes.

### Session Expired
- **Problem:** Saved session no longer valid
- **Solution:** Delete `google-session.json` and `google-cookies.json`, then run again to create new session.

### Selector Issues
- **Problem:** Script can't find elements (Google UI changed)
- **Solution:** The scripts try multiple selectors. If all fail, update the selectors in the script.

### Deployment Not Working
- **Problem:** Apps Script deployment fails
- **Solution:** Complete the deployment manually in the browser after the code is updated.

## How It Works

### Anti-Detection Features
1. **Stealth Plugin:** Removes automation indicators
2. **Browser Arguments:** Disables automation flags
3. **Human-like Behavior:** Random delays, slow typing
4. **Session Persistence:** Avoids repeated logins
5. **Real User Agent:** Mimics actual Chrome browser

### Process Flow
1. Launch browser with stealth configuration
2. Check for saved session
3. Navigate to target (Sheets/Apps Script)
4. Authenticate if needed (manual or saved session)
5. Perform updates
6. Save session for next time
7. Keep browser open for verification

## Best Practices

1. **Run during off-peak hours** to avoid rate limiting
2. **Keep sessions fresh** by running at least weekly
3. **Monitor for UI changes** and update selectors as needed
4. **Use manual login** when automated login fails
5. **Save screenshots** for audit trail

## Security Notes

- Credentials are stored in `.env` file (add to .gitignore)
- Session files contain auth tokens (keep secure)
- Consider using App Passwords for enhanced security
- Never commit credentials or session files to git

## Support

If scripts fail after Google updates their UI:
1. Check browser console for errors
2. Update selectors in the scripts
3. Try manual login first to establish session
4. Consider using the individual scripts instead of deploy-all.js