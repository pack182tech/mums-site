#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

class GoogleSheetsUpdater {
    constructor() {
        this.browser = null;
        this.page = null;
        this.spreadsheetId = process.env.SPREADSHEET_ID;
        this.email = process.env.GOOGLE_EMAIL;
        this.password = process.env.GOOGLE_PASSWORD;
    }

    async init() {
        console.log('🚀 Launching browser...');
        this.browser = await puppeteer.launch({
            headless: process.env.HEADLESS === 'true',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 800 });
    }

    async login() {
        console.log('🔐 Logging into Google...');
        
        // Navigate to Google Sheets
        await this.page.goto(`https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/edit`, {
            waitUntil: 'networkidle2'
        });

        // Check if login is required
        const needsLogin = await this.page.$('input[type="email"]');
        
        if (needsLogin) {
            // Enter email
            await this.page.type('input[type="email"]', this.email);
            await this.page.click('#identifierNext');
            await this.page.waitForTimeout(2000);

            // Enter password
            await this.page.waitForSelector('input[type="password"]', { visible: true });
            await this.page.type('input[type="password"]', this.password);
            await this.page.click('#passwordNext');
            
            // Wait for sheets to load
            await this.page.waitForSelector('.grid-container', { timeout: 30000 });
            console.log('✅ Logged in successfully');
        } else {
            console.log('✅ Already logged in');
        }
    }

    async selectSheet(sheetName) {
        console.log(`📋 Selecting ${sheetName} sheet...`);
        
        // Click on the sheet tab
        const tabs = await this.page.$$('.docs-sheet-tab-name');
        for (const tab of tabs) {
            const text = await tab.evaluate(el => el.textContent);
            if (text === sheetName) {
                await tab.click();
                await this.page.waitForTimeout(1000);
                console.log(`✅ Selected ${sheetName} sheet`);
                return;
            }
        }
        
        throw new Error(`Sheet "${sheetName}" not found`);
    }

    async clearSheet() {
        console.log('🧹 Clearing sheet data...');
        
        // Select all cells (Ctrl+A)
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('A');
        await this.page.keyboard.up('Control');
        
        // Delete content
        await this.page.keyboard.press('Delete');
        await this.page.waitForTimeout(500);
    }

    async pasteData(data) {
        console.log('📝 Pasting data...');
        
        // Click on cell A1
        await this.page.click('.grid-container');
        await this.page.waitForTimeout(500);
        
        // Navigate to A1 using keyboard
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('Home');
        await this.page.keyboard.up('Control');
        await this.page.waitForTimeout(500);
        
        // Copy data to clipboard (convert to tab-separated)
        const tsvData = this.convertToTSV(data);
        await this.page.evaluate((text) => {
            navigator.clipboard.writeText(text);
        }, tsvData);
        
        // Paste data
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('V');
        await this.page.keyboard.up('Control');
        
        await this.page.waitForTimeout(2000);
        console.log('✅ Data pasted successfully');
    }

    convertToTSV(data) {
        if (Array.isArray(data)) {
            return data.map(row => 
                Array.isArray(row) ? row.join('\t') : row
            ).join('\n');
        }
        return data;
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
        
        // Convert to array format for sheets
        const headers = Object.keys(records[0]);
        const data = [
            headers,
            ...records.map(record => headers.map(h => record[h]))
        ];
        
        await this.selectSheet('Products');
        await this.clearSheet();
        await this.pasteData(data);
        
        console.log(`✅ Updated ${records.length} products`);
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
        
        // Convert to array format for sheets
        const headers = Object.keys(records[0]);
        const data = [
            headers,
            ...records.map(record => headers.map(h => record[h]))
        ];
        
        await this.selectSheet('Settings');
        await this.clearSheet();
        await this.pasteData(data);
        
        console.log(`✅ Updated ${records.length} settings`);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('👋 Browser closed');
        }
    }
}

async function main() {
    const updater = new GoogleSheetsUpdater();
    const command = process.argv[2] || 'all';
    
    try {
        await updater.init();
        await updater.login();
        
        switch(command) {
            case 'products':
                await updater.updateProducts();
                break;
            case 'settings':
                await updater.updateSettings();
                break;
            case 'all':
                await updater.updateProducts();
                await updater.updateSettings();
                break;
            default:
                console.error(`Unknown command: ${command}`);
                console.log('Usage: node update-sheets.js [products|settings|all]');
        }
        
        console.log('✨ All done!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await updater.close();
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GoogleSheetsUpdater;