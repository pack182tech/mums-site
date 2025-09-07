# Deployment Instructions for Scout Name Feature

## Overview
This deployment adds Scout name tracking functionality with three parallel sites sharing the same backend:
1. **Main site** (existing): https://pack182tech.github.io/mums-site/
2. **Scout name version**: https://pack182tech.github.io/mums-site/scoutname/
3. **Leaderboard**: https://pack182tech.github.io/mums-site/leaderboard/

## Steps to Deploy

### 1. Push the Feature Branch
```bash
git push origin scout_name
```

### 2. Merge to Master
```bash
git checkout master
git merge scout_name
git push origin master
```

### 3. Update Google Sheets Backend

#### Add Scout Name Column to Orders Sheet:
1. Open your Google Sheets with orders data
2. Add a new column after "timestamp" called "scout_name"
3. This column will store the scout's name from new orders

#### Update Google Apps Script:
In your Google Apps Script (Code.gs), update the order submission handler to include scout_name:

```javascript
// In the order submission function, add:
const scoutName = orderData.scoutName || '';

// When writing to sheet, include scout_name in the row data:
sheet.appendRow([
  orderId,
  timestamp,
  scoutName,  // Add this line
  firstName,
  lastName,
  // ... rest of the fields
]);
```

#### Add Scout Help Text to Settings:
1. In your Settings sheet, add a new row:
   - Key: `scout_help_text`
   - Value: `Help the scout you are supporting earn a badge by entering their name here.`

### 4. Verify Deployment

Once GitHub Pages updates (usually within 2-5 minutes):

#### Test URLs:
- **Main site** (unchanged): https://pack182tech.github.io/mums-site/
- **Scout name version**: https://pack182tech.github.io/mums-site/scoutname/
- **Leaderboard**: https://pack182tech.github.io/mums-site/leaderboard/
- **Admin panel**: https://pack182tech.github.io/mums-site/admin.html

#### Test Features:
1. **Scout Name Order Form** (/scoutname):
   - Verify Scout name field appears above Contact Information
   - Confirm help text displays
   - Place a test order and verify scout name is saved

2. **Admin Panel** (/admin.html):
   - Check new "Scout Names" tab between "Inventory Summary" and "Settings"
   - Verify Scout filter dropdown in Orders tab
   - Confirm scout_help_text field in Settings tab
   - Test scout name standardization feature

3. **Leaderboard** (/leaderboard):
   - Verify it loads and displays scouts
   - Check animations and auto-refresh (30 seconds)
   - Confirm revenue calculations are correct

### 5. Communication

Notify pack members about the new features:
- Share the scout name order form URL: https://pack182tech.github.io/mums-site/scoutname/
- Share the leaderboard URL: https://pack182tech.github.io/mums-site/leaderboard/
- Explain that scouts can now track their individual sales

## Important Notes

- The scout name version (/scoutname) shares the same backend as the main site
- Orders from both sites will appear in the same admin panel
- The leaderboard updates automatically every 30 seconds
- Scout names can be standardized in the admin panel to merge variations (e.g., "Johnny" and "John Smith")

## Rollback Instructions

If issues occur:
```bash
git checkout master
git reset --hard HEAD~1  # Remove the merge commit
git push origin master --force
```

## Support

For any issues or questions about the deployment, check:
- GitHub Pages build status: https://github.com/pack182tech/mums-site/actions
- Browser console for JavaScript errors
- Network tab for API call failures