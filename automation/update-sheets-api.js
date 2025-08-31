#!/usr/bin/env node
/**
 * Google Sheets API Updater
 * A safer alternative using official Google Sheets API
 */

const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const SPREADSHEET_ID = '1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk';

class GoogleSheetsAPIUpdater {
    constructor() {
        this.auth = null;
        this.sheets = null;
    }

    async authorize() {
        try {
            const credentials = JSON.parse(await fs.readFile(CREDENTIALS_PATH));
            const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
            
            const oAuth2Client = new google.auth.OAuth2(
                client_id, 
                client_secret, 
                redirect_uris[0]
            );

            try {
                const token = JSON.parse(await fs.readFile(TOKEN_PATH));
                oAuth2Client.setCredentials(token);
                this.auth = oAuth2Client;
            } catch (err) {
                this.auth = await this.getNewToken(oAuth2Client);
            }
            
            this.sheets = google.sheets({ version: 'v4', auth: this.auth });
            console.log('✅ Authorized successfully');
        } catch (err) {
            console.error('❌ Error loading credentials:', err);
            console.log('\n📝 To set up Google Sheets API:');
            console.log('1. Go to https://console.cloud.google.com/');
            console.log('2. Create a new project or select existing');
            console.log('3. Enable Google Sheets API');
            console.log('4. Create credentials (OAuth 2.0 Client ID)');
            console.log('5. Download and save as credentials.json in automation folder');
            process.exit(1);
        }
    }

    async getNewToken(oAuth2Client) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });
        
        console.log('🔗 Authorize this app by visiting:', authUrl);
        
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
                    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
                    console.log('✅ Token stored to', TOKEN_PATH);
                    resolve(oAuth2Client);
                } catch (err) {
                    reject(err);
                }
            });
        });
    }

    async updateProducts() {
        console.log('🛍️ Updating products...');
        
        // Read products CSV
        const csvContent = await fs.readFile(
            path.join(__dirname, '..', 'products-for-sheets.csv'), 
            'utf-8'
        );
        
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true
        });
        
        // Prepare data for sheets
        const headers = Object.keys(records[0]);
        const values = [
            headers,
            ...records.map(record => headers.map(h => record[h]))
        ];
        
        // Clear existing data
        await this.sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Products!A:Z',
        });
        
        // Update with new data
        const response = await this.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Products!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
        
        console.log(`✅ Updated ${response.data.updatedRows} rows in Products sheet`);
    }

    async updateSettings() {
        console.log('⚙️ Updating settings...');
        
        // Read settings CSV
        const csvContent = await fs.readFile(
            path.join(__dirname, '..', 'settings-for-sheets.csv'), 
            'utf-8'
        );
        
        const records = parse(csvContent, {
            columns: true,
            skip_empty_lines: true
        });
        
        // Prepare data for sheets
        const headers = Object.keys(records[0]);
        const values = [
            headers,
            ...records.map(record => headers.map(h => record[h]))
        ];
        
        // Clear existing data
        await this.sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Settings!A:Z',
        });
        
        // Update with new data
        const response = await this.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Settings!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values },
        });
        
        console.log(`✅ Updated ${response.data.updatedRows} rows in Settings sheet`);
    }

    async createOrdersSheetIfNeeded() {
        // Get current sheets
        const response = await this.sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });
        
        const sheets = response.data.sheets.map(s => s.properties.title);
        
        if (!sheets.includes('Orders')) {
            console.log('📋 Creating Orders sheet...');
            
            await this.sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                requestBody: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: 'Orders'
                            }
                        }
                    }]
                }
            });
            
            // Add headers
            const headers = [
                ['Order ID', 'Timestamp', 'Status', 'First Name', 'Last Name', 
                 'Email', 'Phone', 'Address', 'Products', 'Total Price', 
                 'Payment Status', 'Comments']
            ];
            
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: 'Orders!A1',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: headers },
            });
            
            console.log('✅ Created Orders sheet');
        }
    }
}

async function main() {
    const updater = new GoogleSheetsAPIUpdater();
    const command = process.argv[2] || 'all';
    
    try {
        await updater.authorize();
        
        switch(command) {
            case 'products':
                await updater.updateProducts();
                break;
            case 'settings':
                await updater.updateSettings();
                break;
            case 'setup':
                await updater.createOrdersSheetIfNeeded();
                break;
            case 'all':
                await updater.updateProducts();
                await updater.updateSettings();
                await updater.createOrdersSheetIfNeeded();
                break;
            default:
                console.error(`Unknown command: ${command}`);
                console.log('Usage: node update-sheets-api.js [products|settings|setup|all]');
        }
        
        console.log('✨ All done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GoogleSheetsAPIUpdater;