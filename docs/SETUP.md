# Quick Setup Guide

Get your Cub Scouts Mums Ordering System running in 15 minutes!

## Step 1: Copy the Google Sheet Template (5 minutes)

1. **Create Google Sheet**
   ```
   1. Go to sheets.google.com
   2. Create new blank spreadsheet
   3. Name it "Cub Scouts Mums Orders"
   ```

2. **Add Apps Script**
   ```
   1. Extensions → Apps Script
   2. Delete default code
   3. Copy/paste Code.gs content
   4. File → New → Script
   5. Name it "SetupSheet"
   6. Copy/paste SetupSheet.gs content
   7. Save project
   ```

3. **Run Setup**
   ```
   1. Select setupSpreadsheet function
   2. Click Run ▶️
   3. Approve permissions
   4. Check spreadsheet has 3 tabs
   ```

4. **Deploy API**
   ```
   1. Deploy → New Deployment
   2. Type: Web app
   3. Execute as: Me
   4. Access: Anyone
   5. Deploy
   6. COPY THE URL! (Important!)
      6.1 URL is https://script.google.com/macros/s/AKfycbxbrEIYpV66wGYGI9bn0X6GpZDJLlr7YOHscwa8m7OlkNIAue-PgrkFJjP2YNcGzHC2LQ/exec
      6.2 Deployment ID is AKfycbxbrEIYpV66wGYGI9bn0X6GpZDJLlr7YOHscwa8m7OlkNIAue-PgrkFJjP2YNcGzHC2LQ
   ```

## Step 2: Set Up GitHub Pages (5 minutes)

1. **Fork Repository** (Skip if you own this repo)
   ```
   1. Go to github.com/pack182tech/mums-site
   2. Click Fork button
   3. Wait for fork to complete
   ```
   
   **Note**: If you already own this repository, skip to step 2.

2. **Update Configuration**
   ```
   1. Go to your repository
   2. Open js/config.js
   3. Click edit (pencil icon)
   4. Replace YOUR_DEPLOYMENT_ID with your Web App URL
   5. Commit changes
   ```

3. **Enable GitHub Pages**
   ```
   1. Settings → Pages
   2. Source: Deploy from branch
   3. Branch: main
   4. Folder: / (root)
   5. Save
   6. Wait 2-3 minutes
   7. Site ready at: https://pack182tech.github.io/mums-site
   ```

## Step 3: Configure Venmo (3 minutes)

1. **Get Venmo QR Code**
   ```
   1. Open Venmo app
   2. Go to your profile
   3. Tap QR code
   4. Screenshot it
   5. Upload to imgur.com
   6. Copy image URL
   ```

2. **Update Settings**
   ```
   1. Go to your site/admin.html
   2. Login as Demo Admin
   3. Go to Settings tab
   4. Add Venmo handle
   5. Add QR code URL
   6. Save
   ```

## Step 4: Test Everything (2 minutes)

1. **Test Order Flow**
   ```
   1. Go to your site
   2. Add products to cart
   3. Fill out order form
   4. Submit order
   5. Check confirmation screen
   ```

2. **Test Admin**
   ```
   1. Go to /admin.html
   2. Login as demo
   3. Check orders appear
   4. Test status updates
   ```

## You're Done! 🎉

Your site is now live and ready for orders!

### Important URLs to Save:
- **Your Site**: https://pack182tech.github.io/mums-site
- **Admin Panel**: https://pack182tech.github.io/mums-site/admin.html
- **Google Sheet**: [Your sheet URL]
- **Apps Script**: [Your script URL]

### Next Steps:
1. Add real products with photos
2. Customize welcome message
3. Set pickup location/time
4. Share site URL with pack families
5. Set up Google Sign-In (optional, for better security)

### Need Help?
- Check the [Admin Guide](ADMIN_GUIDE.md)
- Review the main [README](../README.md)
- Test in demo mode first

## Optional: Google Sign-In Setup (10 minutes)

For better security, set up real Google Sign-In:

1. **Google Cloud Console**
   ```
   1. Go to console.cloud.google.com
   2. New Project → Name: "Mums Orders"
   3. APIs → Enable APIs → Search "Google Sign-In"
   4. Enable API
   ```

2. **Create Credentials**
   ```
   1. Credentials → Create → OAuth client ID
   2. Type: Web application
   3. Name: "Mums Admin"
   4. Authorized origins: Add your GitHub Pages URL
   5. Create
   6. Copy Client ID
   ```

3. **Update Admin Page**
   ```
   1. Edit admin.html
   2. Replace YOUR_GOOGLE_CLIENT_ID (2 places)
   3. Commit changes
   4. Test login
   ```

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Failed to load products" | Check Web App URL in config.js |
| Products not showing | Re-run setupSpreadsheet function |
| Can't login to admin | Use demo mode or check Client ID |
| Orders not saving | Re-deploy Apps Script |
| Site not loading | Wait 5 minutes for GitHub Pages |

## Sample Data for Testing

### Sample Products (already included):
- 6" Yellow Mum - $15
- 6" Purple Mum - $15
- 8" Orange Mum - $20
- 10" Mixed Color - $30
- Hanging Basket - $35

### Test Order Info:
```
Name: John Doe
Email: test@example.com
Phone: 123-456-7890
Address: 123 Main St, City, ST 12345
```

## Checklist Before Going Live

- [ ] Web App URL updated in config.js
- [ ] GitHub Pages enabled and working
- [ ] Products added with real photos
- [ ] Venmo QR code uploaded
- [ ] Welcome message customized
- [ ] Pickup location/time set
- [ ] Test order placed successfully
- [ ] Admin dashboard accessible
- [ ] Payment instructions clear
- [ ] Contact email updated

Ready to go! Share your site URL and start taking orders! 🌻