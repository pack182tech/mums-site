#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function openGoogleAppsScript() {
    console.log('📝 Opening Google Apps Script Editor');
    console.log('=====================================\n');
    
    let browser;
    
    try {
        // Read and display the fix
        const codeGsPath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
        console.log('📋 The fix to apply in Code.gs:');
        console.log('================================');
        console.log('In the getProducts() function, after line 74, add:');
        console.log(`
      // Ensure we have an id field (might be 'id' or could be missing)
      if (!product.id && product.ID) {
        product.id = product.ID;
      }
      if (!product.id && row[0]) {
        product.id = row[0]; // Use first column as ID if no id field found
      }
`);
        console.log('================================\n');
        
        // Launch browser
        console.log('🌐 Opening browser...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 50
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        
        // Navigate to Google Apps Script
        const scriptUrl = 'https://script.google.com/home/projects/1RTnXs2Squ6qea3sDCol93L_VMsaCfm6WTv0KZXGl8Z3xP2R1lYIOmUcB/edit';
        console.log('📂 Opening Google Apps Script project...');
        await page.goto(scriptUrl, { waitUntil: 'domcontentloaded' });
        
        // Check if we need to login
        if (page.url().includes('accounts.google.com')) {
            console.log('🔐 Logging in to Google...');
            
            // Enter email
            await page.waitForSelector('input[type="email"]', { timeout: 5000 });
            await page.type('input[type="email"]', process.env.GOOGLE_EMAIL);
            await page.click('#identifierNext');
            
            // Wait for password field
            await page.waitForSelector('input[type="password"]', { visible: true, timeout: 10000 });
            await new Promise(r => setTimeout(r, 1000));
            
            // Enter password
            await page.type('input[type="password"]', process.env.GOOGLE_PASSWORD);
            await page.click('#passwordNext');
            
            console.log('✅ Logged in successfully\n');
        }
        
        console.log('✅ Google Apps Script editor should be open!');
        console.log('\n📋 Manual steps to complete:');
        console.log('1. Click on Code.gs file');
        console.log('2. Find the getProducts() function (around line 62)');
        console.log('3. After line 74 (inside the for loop), add the fix shown above');
        console.log('4. Press Ctrl+S to save');
        console.log('5. Click Deploy → New deployment');
        console.log('6. Add description: "Fix product ID issue"');
        console.log('7. Click Deploy');
        console.log('\nThe browser will remain open for you to complete these steps.');
        console.log('Press Ctrl+C when done.');
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        console.error('\n❌ Failed:', error.message);
        if (browser) await browser.close();
        process.exit(1);
    }
}

// Check for credentials
if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
    console.error('❌ Missing Google credentials!');
    console.log('Please ensure your .env file has GOOGLE_EMAIL and GOOGLE_PASSWORD');
    process.exit(1);
}

// Run
openGoogleAppsScript();