const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

// If modifying these scopes, delete token.json
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

async function authorize() {
  let credentials;
  
  try {
    const credentialsFile = await fs.readFile(CREDENTIALS_PATH);
    credentials = JSON.parse(credentialsFile);
  } catch (err) {
    console.error('Error loading client secret file:', err);
    console.log('\n📋 Please follow these steps:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select existing');
    console.log('3. Enable Google Sheets API');
    console.log('4. Create credentials (OAuth 2.0 Client ID)');
    console.log('5. Download the JSON file');
    console.log('6. Save it as automation/credentials.json');
    process.exit(1);
  }

  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token
  try {
    const token = await fs.readFile(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    console.log('✅ Authorization already complete! Token found.');
    return oAuth2Client;
  } catch (err) {
    // Need to get a new token
    return getNewToken(oAuth2Client);
  }
}

async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  
  console.log('\n🔐 Authorize this app by visiting this url:');
  console.log(authUrl);
  console.log('\n');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', async (code) => {
      rl.close();
      
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(tokens);
        
        // Store the token to disk for later program executions
        await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
        console.log('\n✅ Token stored to', TOKEN_PATH);
        console.log('You can now run npm run update-all');
        
        resolve(oAuth2Client);
      } catch (err) {
        console.error('Error retrieving access token', err);
        reject(err);
      }
    });
  });
}

// Run the authorization
authorize().then(() => {
  console.log('\n🎉 Setup complete!');
  console.log('Available commands:');
  console.log('  npm run update-products  - Update products in Google Sheets');
  console.log('  npm run update-settings  - Update settings in Google Sheets');
  console.log('  npm run update-all       - Update everything');
}).catch(console.error);