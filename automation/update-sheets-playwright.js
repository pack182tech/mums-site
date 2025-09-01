#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function updateGoogleSheets() {
    console.log('🚀 Updating Google Sheets with Playwright');
    console.log('=========================================\n');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 200
    });
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1440, height: 900 }
        });
        const page = await context.newPage();
        
        // Navigate to Google Sheets
        const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1qJvPFpgQXCGvvOAhKoYXdDYt4qCrBzrQiSM3aFLf5J0/edit';
        console.log('📊 Opening Google Sheets...');
        await page.goto(spreadsheetUrl, { waitUntil: 'domcontentloaded' });
        
        // Check if we need to login
        if (page.url().includes('accounts.google.com')) {
            console.log('🔐 Logging in to Google...\n');
            
            // Enter email
            await page.fill('input[type="email"]', process.env.GOOGLE_EMAIL);
            await page.click('#identifierNext');
            
            // Wait for password field
            await page.waitForSelector('input[type="password"]', { state: 'visible' });
            await page.waitForTimeout(1000);
            
            // Enter password
            await page.fill('input[type="password"]', process.env.GOOGLE_PASSWORD);
            await page.click('#passwordNext');
            
            // Wait for navigation
            await page.waitForNavigation({ waitUntil: 'networkidle' });
            console.log('✅ Logged in successfully\n');
        }
        
        // Wait for Sheets to load
        console.log('⏳ Waiting for spreadsheet to load...');
        await page.waitForSelector('div[role="grid"]', { timeout: 30000 });
        await page.waitForTimeout(3000);
        console.log('✅ Spreadsheet loaded\n');
        
        // Switch to Products sheet
        console.log('📋 Switching to Products sheet...');
        
        // Click on the Products tab
        const productsTab = await page.locator('div.docs-sheet-tab-name:has-text("Products")').first();
        await productsTab.click();
        await page.waitForTimeout(2000);
        
        // Select all cells (Ctrl+A)
        console.log('🗑️ Clearing existing data...');
        await page.keyboard.press('Control+A');
        await page.waitForTimeout(500);
        await page.keyboard.press('Delete');
        await page.waitForTimeout(1000);
        
        // Click on cell A1
        await page.click('div[role="gridcell"][aria-rowindex="1"][aria-colindex="1"]');
        await page.waitForTimeout(500);
        
        // Read the products CSV
        const productsPath = path.join(__dirname, '..', 'products-for-sheets.csv');
        const productsContent = await fs.readFile(productsPath, 'utf-8');
        console.log('📝 Pasting new Products data...');
        
        // Copy to clipboard and paste
        await page.evaluate((text) => {
            navigator.clipboard.writeText(text);
        }, productsContent);
        
        await page.keyboard.press('Control+V');
        await page.waitForTimeout(3000);
        console.log('✅ Products sheet updated!\n');
        
        // Take screenshot
        await page.screenshot({ path: 'sheets-updated-playwright.png' });
        console.log('📸 Screenshot saved as sheets-updated-playwright.png\n');
        
        console.log('✨ Update complete!');
        console.log('The spreadsheet has been updated with the new product images.');
        console.log('\nNext steps:');
        console.log('1. Deploy the Code.gs changes (if not already done)');
        console.log('2. Test the site to verify the new images appear');
        
        // Keep browser open for manual verification
        console.log('\nBrowser will remain open. Press Ctrl+C when done.');
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        await page.screenshot({ path: 'sheets-error-playwright.png' });
        console.log('📸 Error screenshot saved');
    } finally {
        // Browser stays open
    }
}

// Check for credentials
if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
    console.error('❌ Missing Google credentials!');
    console.log('Please create a .env file with:');
    console.log('GOOGLE_EMAIL=your-email@gmail.com');
    console.log('GOOGLE_PASSWORD=your-password');
    process.exit(1);
}

// Run
updateGoogleSheets().catch(console.error);