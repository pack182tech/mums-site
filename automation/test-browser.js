#!/usr/bin/env node
const puppeteer = require('puppeteer');
require('dotenv').config();

async function testBrowser() {
    console.log('🧪 Testing Puppeteer Browser Setup');
    console.log('===================================\n');
    
    let browser;
    
    try {
        // Test 1: Launch browser
        console.log('1. Testing browser launch...');
        browser = await puppeteer.launch({
            headless: process.env.HEADLESS === 'true',
            slowMo: parseInt(process.env.SLOW_MO || '100')
        });
        console.log('   ✅ Browser launched successfully');
        
        // Test 2: Create new page
        console.log('\n2. Testing page creation...');
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        console.log('   ✅ Page created successfully');
        
        // Test 3: Navigate to Google
        console.log('\n3. Testing navigation to Google...');
        await page.goto('https://www.google.com', { waitUntil: 'networkidle2' });
        const title = await page.title();
        console.log(`   ✅ Navigated successfully (Title: ${title})`);
        
        // Test 4: Check environment variables
        console.log('\n4. Checking environment variables...');
        
        if (process.env.GOOGLE_EMAIL) {
            console.log(`   ✅ GOOGLE_EMAIL is set: ${process.env.GOOGLE_EMAIL}`);
        } else {
            console.log('   ⚠️  GOOGLE_EMAIL not set');
        }
        
        if (process.env.GOOGLE_PASSWORD) {
            console.log('   ✅ GOOGLE_PASSWORD is set (hidden)');
        } else {
            console.log('   ⚠️  GOOGLE_PASSWORD not set');
        }
        
        if (process.env.SPREADSHEET_URL) {
            console.log(`   ✅ SPREADSHEET_URL is set`);
        } else {
            console.log('   ⚠️  SPREADSHEET_URL not set');
        }
        
        // Test 5: Try to access Google Sheets (without login)
        console.log('\n5. Testing Google Sheets access...');
        await page.goto('https://sheets.google.com', { waitUntil: 'networkidle2' });
        
        const url = page.url();
        if (url.includes('accounts.google.com')) {
            console.log('   ✅ Redirected to login page (as expected)');
        } else {
            console.log('   ℹ️  Already logged in or different behavior');
        }
        
        console.log('\n✨ All tests passed!');
        console.log('\nNext steps:');
        console.log('1. Copy .env.template to .env');
        console.log('2. Add your Google credentials');
        console.log('3. Run: npm run update-all');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Make sure Puppeteer is installed: npm install');
        console.log('2. Check your internet connection');
        console.log('3. Try running with HEADLESS=false to see what happens');
        
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the test
testBrowser();