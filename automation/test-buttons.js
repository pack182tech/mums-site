#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');

async function testButtons() {
    console.log('🧪 Testing Button Functionality');
    console.log('================================\n');
    
    let browser;
    
    try {
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            devtools: false
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        // Navigate to GitHub Pages site instead of local file
        const siteUrl = 'https://pack182tech.github.io/mums-site/';
        console.log(`📍 Opening: ${siteUrl}\n`);
        
        await page.goto(siteUrl, { waitUntil: 'networkidle2' });
        
        // Wait for page load
        await page.waitForSelector('#welcome-title', { timeout: 10000 });
        console.log('✅ Page loaded\n');
        
        // Click "Place an Order Here"
        console.log('Clicking "Place an Order Here"...');
        await page.click('button.btn-primary');
        
        // Wait for products to load
        await page.waitForSelector('.product-card', { timeout: 10000 });
        const productCount = await page.$$eval('.product-card', cards => cards.length);
        console.log(`✅ Found ${productCount} products\n`);
        
        // Test first product
        console.log('Testing first product:');
        
        // Select a color first
        const firstColorBtn = await page.$('.product-card:first-child .color-btn');
        if (firstColorBtn) {
            console.log('  Selecting color...');
            await firstColorBtn.click();
            await new Promise(r => setTimeout(r, 500));
        }
        
        // Check the current quantity
        const initialQty = await page.$eval('.product-card:first-child .quantity-input', 
            el => el.value);
        console.log(`  Initial quantity: ${initialQty}`);
        
        // Click the + button
        console.log('  Clicking + button...');
        await page.click('.product-card:first-child .btn-quantity:last-child');
        await new Promise(r => setTimeout(r, 500));
        
        // Check new quantity
        const newQty = await page.$eval('.product-card:first-child .quantity-input', 
            el => el.value);
        console.log(`  New quantity: ${newQty}`);
        
        if (parseInt(newQty) > parseInt(initialQty)) {
            console.log('  ✅ + button works!');
        } else {
            console.log('  ❌ + button did not increase quantity');
        }
        
        // Check cart summary
        const cartTotal = await page.$eval('#cart-total', el => el.textContent);
        console.log(`\nCart total: ${cartTotal}`);
        
        // Take screenshot
        await page.screenshot({ path: 'button-test.png' });
        console.log('\n📸 Screenshot saved as button-test.png');
        
        console.log('\n✨ Test complete! Browser will remain open for inspection.');
        console.log('Press Ctrl+C to close.');
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        if (browser) await browser.close();
        process.exit(1);
    }
}

testButtons();