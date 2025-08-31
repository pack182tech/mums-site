const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const SPREADSHEET_ID = '1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk';

async function testConnection() {
  console.log('🔍 Testing Google Sheets connection...\n');
  
  // Check for credentials file
  try {
    await fs.access(CREDENTIALS_PATH);
    console.log('✅ credentials.json found');
  } catch {
    console.log('❌ credentials.json not found');
    console.log('   Please follow instructions in PLAYWRIGHT_SETUP.md');
    return false;
  }
  
  // Check for token file
  try {
    await fs.access(TOKEN_PATH);
    console.log('✅ token.json found');
  } catch {
    console.log('⚠️  token.json not found');
    console.log('   Run: npm run setup');
    return false;
  }
  
  // Try to connect to Google Sheets
  try {
    const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
    const token = JSON.parse(await fs.readFile(TOKEN_PATH));
    
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);
    
    const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
    
    // Test reading the spreadsheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });
    
    console.log('✅ Successfully connected to Google Sheets');
    console.log(`   Spreadsheet: ${response.data.properties.title}`);
    console.log(`   Sheets found: ${response.data.sheets.map(s => s.properties.title).join(', ')}`);
    
    // Check for required sheets
    const sheetNames = response.data.sheets.map(s => s.properties.title);
    const requiredSheets = ['Products', 'Settings', 'Orders'];
    
    console.log('\n📋 Checking required sheets:');
    for (const sheet of requiredSheets) {
      if (sheetNames.includes(sheet)) {
        console.log(`   ✅ ${sheet} sheet exists`);
      } else {
        console.log(`   ⚠️  ${sheet} sheet missing (will be created on first update)`);
      }
    }
    
    return true;
    
  } catch (err) {
    console.log('❌ Failed to connect to Google Sheets');
    console.log(`   Error: ${err.message}`);
    
    if (err.message.includes('invalid_grant')) {
      console.log('\n   Token expired. Please run: npm run setup');
    } else if (err.message.includes('404')) {
      console.log('\n   Spreadsheet not found. Check SPREADSHEET_ID in the code.');
    }
    
    return false;
  }
}

async function main() {
  console.log('Pack 182 Mums - Google Sheets Connection Test');
  console.log('==============================================\n');
  
  const success = await testConnection();
  
  if (success) {
    console.log('\n✨ Connection test passed!');
    console.log('You can now run:');
    console.log('  npm run update-products');
    console.log('  npm run update-settings');
    console.log('  npm run update-all');
  } else {
    console.log('\n❌ Connection test failed');
    console.log('Please follow the setup instructions in PLAYWRIGHT_SETUP.md');
  }
}

main().catch(console.error);