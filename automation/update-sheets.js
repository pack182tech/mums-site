#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('csv-parse/sync');
require('dotenv').config();

class GoogleSheetsAutomation {
    constructor() {
        this.browser = null;
        this.page = null;
        this.email = process.env.GOOGLE_EMAIL;
        this.password = process.env.GOOGLE_PASSWORD;
        this.spreadsheetUrl = process.env.SPREADSHEET_URL;
        this.headless = process.env.HEADLESS === 'true';
        this.slowMo = parseInt(process.env.SLOW_MO || '100');
    }

    async init() {
        console.log('🚀 Starting browser...');
        this.browser = await puppeteer.launch({
            headless: this.headless,
            slowMo: this.slowMo,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 800 });
    }

    async login() {
        console.log('🔐 Logging into Google...');
        
        try {
            // Navigate to Google Sheets
            await this.page.goto('https://sheets.google.com', { 
                waitUntil: 'networkidle2' 
            });
            
            // Check if already logged in
            const isLoggedIn = await this.page.evaluate(() => {
                return !window.location.href.includes('accounts.google.com');
            });
            
            if (isLoggedIn) {
                console.log('✅ Already logged in');
                return;
            }
            
            // Enter email
            await this.page.waitForSelector('input[type="email"]', { timeout: 5000 });
            await this.page.type('input[type="email"]', this.email);
            await this.page.click('#identifierNext');
            
            // Wait for password field
            await this.page.waitForSelector('input[type="password"]', { 
                visible: true,
                timeout: 10000 
            });
            await this.delay(1000);
            
            // Enter password
            await this.page.type('input[type="password"]', this.password);
            await this.page.click('#passwordNext');
            
            // Wait for navigation
            await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
            
            console.log('✅ Login successful');
            
        } catch (error) {
            console.error('❌ Login failed:', error.message);
            console.log('\nTroubleshooting:');
            console.log('1. Check your email and password in .env file');
            console.log('2. If using 2FA, create an App Password:');
            console.log('   https://myaccount.google.com/apppasswords');
            throw error;
        }
    }

    async openSpreadsheet() {
        console.log('📊 Opening spreadsheet...');
        
        await this.page.goto(this.spreadsheetUrl, {
            waitUntil: 'networkidle2'
        });
        
        // Wait for sheets to load
        await this.page.waitForSelector('.docs-sheet-tab', { timeout: 10000 });
        console.log('✅ Spreadsheet loaded');
    }

    async selectSheet(sheetName) {
        console.log(`📑 Selecting ${sheetName} sheet...`);
        
        // Find and click the sheet tab
        const tabs = await this.page.$$('.docs-sheet-tab-name');
        let found = false;
        
        for (const tab of tabs) {
            const text = await tab.evaluate(el => el.textContent);
            if (text === sheetName) {
                await tab.click();
                found = true;
                await this.delay(1000);
                break;
            }
        }
        
        if (!found) {
            console.log(`⚠️  ${sheetName} sheet not found, creating it...`);
            await this.createSheet(sheetName);
        }
    }

    async createSheet(sheetName) {
        // Click add sheet button
        await this.page.click('.docs-sheet-tab-add');
        await this.delay(500);
        
        // Type sheet name
        await this.page.keyboard.type(sheetName);
        await this.page.keyboard.press('Enter');
        await this.delay(1000);
    }

    async clearSheet() {
        console.log('🧹 Clearing sheet...');
        
        // Select all cells (Ctrl+A)
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('a');
        await this.page.keyboard.up('Control');
        
        // Delete content
        await this.page.keyboard.press('Delete');
        await this.delay(500);
    }

    async pasteCSVData(csvContent) {
        console.log('📋 Pasting data...');
        
        // Click on cell A1
        await this.page.click('.grid-table-container');
        await this.delay(500);
        
        // Copy CSV content to clipboard
        await this.page.evaluate((data) => {
            const textarea = document.createElement('textarea');
            textarea.value = data;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }, csvContent);
        
        // Paste data (Ctrl+V)
        await this.page.keyboard.down('Control');
        await this.page.keyboard.press('v');
        await this.page.keyboard.up('Control');
        
        // Wait for paste to complete
        await this.delay(2000);
        
        console.log('✅ Data pasted successfully');
    }

    async updateProducts() {
        console.log('\n📦 Updating Products sheet...');
        
        // Read CSV file
        const csvPath = path.join(__dirname, '..', 'products-for-sheets.csv');
        const csvContent = await fs.readFile(csvPath, 'utf-8');
        
        // Select Products sheet
        await this.selectSheet('Products');
        await this.clearSheet();
        await this.pasteCSVData(csvContent);
        
        console.log('✅ Products updated');
    }

    async updateSettings() {
        console.log('\n⚙️  Updating Settings sheet...');
        
        // Read CSV file
        const csvPath = path.join(__dirname, '..', 'settings-for-sheets.csv');
        const csvContent = await fs.readFile(csvPath, 'utf-8');
        
        // Select Settings sheet
        await this.selectSheet('Settings');
        await this.clearSheet();
        await this.pasteCSVData(csvContent);
        
        console.log('✅ Settings updated');
    }

    async createOrdersSheet() {
        console.log('\n📋 Checking Orders sheet...');
        
        await this.selectSheet('Orders');
        
        // Add headers if sheet was just created
        const headers = 'Order ID\tTimestamp\tStatus\tFirst Name\tLast Name\tEmail\tPhone\tAddress\tProducts\tTotal Price\tPayment Status\tComments';
        
        // Check if headers exist
        const cellContent = await this.page.evaluate(() => {
            const cell = document.querySelector('.cell-input');
            return cell ? cell.textContent : '';
        });
        
        if (!cellContent || cellContent.trim() === '') {
            console.log('Adding headers to Orders sheet...');
            await this.pasteCSVData(headers);
        }
        
        console.log('✅ Orders sheet ready');
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

async function main() {
    const command = process.argv[2] || 'all';
    
    console.log('Pack 182 Mums - Google Sheets Browser Automation');
    console.log('================================================\n');
    
    // Check for required environment variables
    if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
        console.error('❌ Missing credentials!');
        console.log('\n1. Copy .env.template to .env');
        console.log('2. Add your Google email and password');
        console.log('3. If using 2FA, use an App Password instead');
        process.exit(1);
    }
    
    const automation = new GoogleSheetsAutomation();
    
    try {
        await automation.init();
        await automation.login();
        await automation.openSpreadsheet();
        
        switch(command) {
            case 'products':
                await automation.updateProducts();
                break;
            case 'settings':
                await automation.updateSettings();
                break;
            case 'orders':
                await automation.createOrdersSheet();
                break;
            case 'all':
                await automation.updateProducts();
                await automation.updateSettings();
                await automation.createOrdersSheet();
                break;
            default:
                console.log('Unknown command:', command);
                console.log('Usage: node update-sheets.js [products|settings|orders|all]');
        }
        
        console.log('\n✨ Update complete!');
        console.log('View your spreadsheet:', process.env.SPREADSHEET_URL);
        
    } catch (error) {
        console.error('\n❌ Automation failed:', error.message);
        
        // Take screenshot for debugging
        if (automation.page) {
            const screenshotPath = path.join(__dirname, 'error-screenshot.png');
            await automation.page.screenshot({ path: screenshotPath });
            console.log('📸 Screenshot saved:', screenshotPath);
        }
        
        process.exit(1);
        
    } finally {
        await automation.close();
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = GoogleSheetsAutomation;