# Fix Google Apps Script Deployment

## The Problem
The order submission is failing because the Google Apps Script is returning an HTML error page instead of JSON data. This means the deployment is not working correctly.

## Solution Steps

### 1. Check the Google Apps Script
Go to: https://script.google.com/home/projects/1RTnXs2Squ6qea3sDCol93L_VMsaCfm6WTv0KZXGl8Z3xP2R1lYIOmUcB/edit

### 2. Verify the Code.gs file has these key functions:
- `doGet(e)` - handles GET requests
- `doPost(e)` - handles POST requests
- Both should return `ContentService.createTextOutput(JSON.stringify(...))`

### 3. Deploy as Web App
1. Click **Deploy** → **New deployment**
2. Settings:
   - **Type**: Web app
   - **Description**: "Mums Order System v2"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
3. Click **Deploy**
4. **COPY THE NEW WEB APP URL**

### 4. Update the config.js
Replace the API_URL in `/js/config.js` with your new deployment URL:
```javascript
API_URL: 'YOUR_NEW_DEPLOYMENT_URL_HERE',
```

### 5. Test the API directly
Open this URL in your browser (replace with your deployment URL):
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?path=products
```

You should see JSON data, not an HTML page.

## Common Issues

### "Script function not found: doPost"
The Code.gs file is missing the doPost function. Make sure it has:
```javascript
function doPost(e) {
    return doGet(e);  // Or handle POST requests specifically
}
```

### "Authorization required"
The deployment needs to be set to "Anyone" for access.

### Still getting HTML responses
The Code.gs might have errors. Check the Apps Script editor for error indicators.

## Quick Test
After fixing, test with:
1. Load the site
2. Add items to cart
3. Try submitting an order
4. Check browser console for errors