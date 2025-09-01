# 🚨 FIX DEPLOYMENT - Quick Steps

## The Problem
- Your Google Sheets has the correct data (ID: `1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk`)
- The Code.gs has the correct spreadsheet ID
- BUT the website is using an OLD deployment URL that points to old data

## The Solution - 2 Steps

### Step 1: Deploy the Google Apps Script
1. Go to: https://script.google.com/home/projects/1RTnXs2Squ6qea3sDCol93L_VMsaCfm6WTv0KZXGl8Z3xP2R1lYIOmUcB/edit
2. Make sure Code.gs has this at line 5:
   ```javascript
   const SPREADSHEET_ID = '1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk';
   ```
3. Click **Deploy** button (top right)
4. Select **New deployment**
5. Settings:
   - Type: **Web app**
   - Description: "Updated deployment with correct spreadsheet"
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**
7. **COPY THE WEB APP URL** (looks like: `https://script.google.com/macros/s/AKfycb.../exec`)

### Step 2: Update the Website Config
Update `/Users/jimmcgowan/Jim/BoySchools/mums-site/js/config.js`:

Replace line 6:
```javascript
API_URL: 'https://script.google.com/macros/s/AKfycbxbrEIYpV66wGYGI9bn0X6GpZDJLlr7YOHscwa8m7OlkNIAue-PgrkFJjP2YNcGzHC2LQ/exec',
```

With your NEW deployment URL from Step 1:
```javascript
API_URL: 'YOUR_NEW_URL_HERE',
```

### Step 3: Test
1. Open the website (index.html)
2. Products should now show the updated data from your spreadsheet

## Quick Check
Your spreadsheet with correct data:
https://docs.google.com/spreadsheets/d/1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk/edit

The Code.gs should read from this same spreadsheet ID.