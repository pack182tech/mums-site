# Testing Guide for Donation Features

## Quick Start Testing (No Backend)

1. **Start local server:**
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # OR Node.js
   npx http-server
   ```

2. **Open in browser:**
   - http://localhost:8000/test.html

3. **Test UI features:**
   - Click "Other Ways to Support Pack 182" button
   - Explore all three donation options
   - Test form validations
   - Check responsive design

## Full Testing with Backend

### Option 1: Test Deployment (Recommended)

1. **Create Test Google Sheet:**
   - Make a copy of your production spreadsheet
   - Name it "Mums Site - TEST"
   - Note the spreadsheet ID from the URL

2. **Create Test Apps Script Deployment:**
   - Open Google Apps Script project
   - Update `SPREADSHEET_ID` to your test sheet ID
   - Click Deploy > New Deployment
   - Name it "Test Deployment - Donations"
   - Deploy and copy the URL

3. **Update test config:**
   - Edit `js/config.test.js`
   - Replace `YOUR_TEST_DEPLOYMENT_URL_HERE` with your test URL

4. **Test locally:**
   ```bash
   python3 -m http.server 8000
   open http://localhost:8000/test.html
   ```

### Option 2: GitHub Pages Test Branch

1. **Push donate branch:**
   ```bash
   git push origin donate
   ```

2. **Create test site:**
   - Go to GitHub repo Settings > Pages
   - Deploy from `donate` branch
   - Access at: `https://[username].github.io/[repo]/`

3. **Use test config:**
   - Create `config.test.js` in the branch
   - Update index.html to load test config

## Test Scenarios

### 1. Donate Mums Flow
- [ ] Click "Other Ways to Support" button
- [ ] Select "Donate Mums to the Community"
- [ ] Choose mums from catalog
- [ ] Complete order form
- [ ] Specify donation recipient
- [ ] Submit order
- [ ] Verify confirmation shows donation type

### 2. Direct Donation Flow
- [ ] Open support modal
- [ ] Select donation amount ($10, $25, $50, $100)
- [ ] Verify impact message appears
- [ ] Test custom amount input
- [ ] Complete donation form
- [ ] Submit donation
- [ ] Check receipt shows as donation

### 3. Volunteer Signup Flow
- [ ] Open support modal
- [ ] Select volunteer options:
  - [ ] Help at pack events
  - [ ] Donate equipment
  - [ ] Provide meeting space
  - [ ] Share skills
  - [ ] Transportation
- [ ] Enter volunteer message
- [ ] Submit form
- [ ] Verify confirmation (no payment shown)

### 4. Backend Verification
- [ ] Check Orders sheet has new columns:
  - Order Type
  - Donation Recipient
- [ ] Verify Volunteers sheet created
- [ ] Confirm email notifications sent
- [ ] Test admin dashboard shows donations

## Testing Checklist

### Frontend
- [ ] Modal opens/closes properly
- [ ] All buttons functional
- [ ] Forms validate correctly
- [ ] Mobile responsive
- [ ] Cart updates for donations
- [ ] Confirmation pages display correctly

### Backend
- [ ] Orders save with donation type
- [ ] Volunteers sheet populates
- [ ] Email notifications work
- [ ] No CORS errors
- [ ] Data formats correctly

### Edge Cases
- [ ] $0 volunteer signup
- [ ] Mixed cart (regular + donation)
- [ ] Multiple donation types
- [ ] Form validation errors
- [ ] Network error handling

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Ensure Apps Script deployed with "Anyone" access |
| No test banner | Check config.test.js is loaded |
| Sheet not found | Run SetupSheet.gs in test spreadsheet |
| Emails not sending | Check ADMIN_EMAILS in Code.gs |

## Rolling Back

If issues arise during testing:

```bash
# Switch back to master branch
git checkout master

# Or revert specific files
git checkout master -- index.html
git checkout master -- js/app.js
```

## Deployment Checklist

Before deploying to production:

1. [ ] All test scenarios pass
2. [ ] Remove test.html file
3. [ ] Remove config.test.js
4. [ ] Update production Apps Script
5. [ ] Test one real order on production
6. [ ] Monitor first few live donations

## Test Data Cleanup

After testing:
1. Delete test orders from spreadsheet
2. Clear test volunteers
3. Remove test deployments
4. Clean browser localStorage:
   ```javascript
   localStorage.clear();
   ```