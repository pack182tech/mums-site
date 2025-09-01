# Quick Start - Run Deployment

## 🚀 To Deploy Updates

### Option 1: Deploy Everything (Recommended)
```bash
cd automation
node deploy-all.js
```

### Option 2: Update Google Sheets Only
```bash
cd automation
node deploy-all.js sheets
```

### Option 3: Update Apps Script Only
```bash
cd automation  
node deploy-all.js gas
```

## 📝 First Time Setup

1. **On first run, you'll need to:**
   - Complete Google login manually in the browser
   - Handle any 2FA prompts
   - The script will save your session for future runs

2. **After first successful login:**
   - Future runs will use saved session
   - No manual login needed (unless session expires)

## ⚠️ Important Notes

- **Manual Login Required**: Due to Google's security, the first login must be done manually
- **Keep Browser Open**: Don't close the browser until deployment is complete
- **Session Files**: `google-session.json` will be created after first login
- **Error Screenshots**: Check `sheets-error.png` or `gas-error.png` if something fails

## 🔧 Troubleshooting

### If login keeps failing:
1. Delete `google-session.json` and `google-cookies.json`
2. Run the script again
3. Complete manual login when prompted

### If deployment fails:
1. Check the screenshots for errors
2. Try running individual scripts:
   - `node update-sheets-stealth.js` (for Sheets only)
   - `node deploy-gas-stealth.js` (for Apps Script only)

### If you see "page not found" or selector errors:
- Google may have updated their UI
- Contact for script updates

## ✅ Success Indicators

- **Google Sheets**: You'll see "✅ Google Sheets updated successfully!"
- **Apps Script**: You'll see "✅ Google Apps Script updated successfully!"
- **Screenshots**: `sheets-updated.png` and `gas-updated.png` will be created

## 📞 Need Help?

If the scripts aren't working:
1. Take a screenshot of the error
2. Check the `*.png` files in the automation folder
3. The issue is likely due to Google UI changes that require selector updates