# Playwright/Puppeteer Setup Requirements

## What You Need to Provide

To set up automated Google Sheets updates, I need the following from you:

### Option 1: Google API Method (Recommended - Most Secure)

1. **Google Cloud Console Access**
   - Go to: https://console.cloud.google.com/
   - Create a new project named "Pack182-Mums"
   - Enable Google Sheets API

2. **Create OAuth 2.0 Credentials**
   - In Google Cloud Console:
     - APIs & Services → Credentials
     - Create Credentials → OAuth 2.0 Client ID
     - Application type: Desktop app
     - Name: "Mums Automation"
   - Download the JSON file
   - Save as `automation/credentials.json`

3. **Run Initial Setup**
   ```bash
   cd automation
   npm install
   npm run setup
   ```
   - It will open a browser for authorization
   - Grant permissions to access Google Sheets
   - Copy the code back to terminal

### Option 2: Puppeteer Method (Less Secure)

⚠️ **Warning**: This requires storing your Google password

1. **Create `.env` file in automation folder**
   ```
   GOOGLE_EMAIL=pack182tech@gmail.com
   GOOGLE_PASSWORD=your-actual-password
   SPREADSHEET_ID=1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk
   HEADLESS=false
   ```

2. **Enable Less Secure App Access** (if using 2FA)
   - Generate an App Password at: https://myaccount.google.com/apppasswords
   - Use the app password instead of your regular password

### Option 3: Service Account Method (For Automation)

1. **Create Service Account**
   - In Google Cloud Console:
     - IAM & Admin → Service Accounts
     - Create Service Account
     - Name: "mums-automation"
   - Download JSON key file

2. **Share Sheet with Service Account**
   - Copy the service account email (ends with @...iam.gserviceaccount.com)
   - Share your Google Sheet with this email as Editor

3. **Save Credentials**
   - Save JSON as `automation/service-account.json`

## Testing the Setup

Once you have credentials set up:

```bash
# Install dependencies
cd automation
npm install

# Test updating products
npm run update-products

# Test updating settings  
npm run update-settings

# Update everything
npm run update-all
```

## Troubleshooting

### Common Issues:

1. **"Permission denied"**
   - Make sure the Google Sheet is shared with the service account email
   - Or ensure OAuth token has proper scopes

2. **"Invalid credentials"**
   - Regenerate credentials from Google Cloud Console
   - Make sure JSON file is properly formatted

3. **"Timeout error"**
   - Check internet connection
   - Try increasing timeout in script

4. **2FA Issues with Puppeteer**
   - Use App Password instead of regular password
   - Or switch to API method

## Security Best Practices

1. **Never commit credentials to Git**
   - All credential files are in .gitignore
   - Use environment variables for sensitive data

2. **Use Service Account for production**
   - More secure than OAuth for automated tasks
   - No user interaction required

3. **Rotate credentials regularly**
   - Regenerate API keys every 90 days
   - Update app passwords if compromised

## What Happens During Update

The automation script will:
1. Read data from CSV files
2. Connect to Google Sheets
3. Clear existing data in target sheets
4. Upload new data
5. Verify update success

## Manual Fallback

If automation fails, you can always:
1. Open the CSV files
2. Copy all content (Ctrl+A, Ctrl+C)
3. Paste into Google Sheets
4. Data → Split text to columns (if needed)

## Need Help?

Common commands:
```bash
# Check if Node.js is installed
node --version

# Install Node.js (if needed)
# Mac: brew install node
# Windows: Download from nodejs.org

# View automation logs
npm run update-all 2>&1 | tee update.log

# Run in debug mode
DEBUG=* npm run update-all
```

## Contact for Issues

If you encounter problems:
1. Check the error message
2. Review this document
3. Check automation/README.md
4. File an issue with error details