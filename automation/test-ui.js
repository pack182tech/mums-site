#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');

async function testUI() {
    console.log('🧪 Testing Pack 182 Mums UI with Puppeteer');
    console.log('==========================================\n');
    
    let browser;
    let page;
    
    try {
        // Launch browser
        console.log('🚀 Launching browser...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 500, // Slow down to see what's happening
            devtools: true
        });
        
        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        
        // Enable console logging
        page.on('console', msg => {
            if (msg.type() === 'error') {
                console.log('❌ Console Error:', msg.text());
            } else if (msg.type() === 'warning') {
                console.log('⚠️  Console Warning:', msg.text());
            }
        });
        
        // Navigate to the local site
        const siteUrl = `file://${path.resolve(__dirname, '../index.html')}`;
        console.log(`📍 Navigating to: ${siteUrl}\n`);
        await page.goto(siteUrl, { waitUntil: 'networkidle2' });
        
        // Wait for page to load
        await page.waitForSelector('#welcome-title', { timeout: 5000 });
        console.log('✅ Page loaded\n');
        
        // Click "Place an Order Here" button
        console.log('🔘 Clicking "Place an Order Here" button...');
        await page.click('button.btn-primary');
        
        // Wait for catalog to load
        await page.waitForSelector('.product-card', { timeout: 5000 });
        console.log('✅ Catalog loaded\n');
        
        // Test the first product's buttons
        console.log('🧪 Testing first product card...');
        
        // Check if color buttons exist
        const colorButtons = await page.$$('.product-card:first-child .color-btn');
        console.log(`   Found ${colorButtons.length} color buttons`);
        
        // Click the first color button
        if (colorButtons.length > 0) {
            console.log('   Clicking first color button...');
            await colorButtons[0].click();
            await page.waitForTimeout(500);
        }
        
        // Try to click the + button
        console.log('   Looking for + button...');
        const plusButtonSelector = '.product-card:first-child .btn-quantity:last-child';
        
        // Check if button exists
        const plusButton = await page.$(plusButtonSelector);
        if (plusButton) {
            console.log('   ✅ Found + button');
            
            // Get onclick attribute
            const onclickAttr = await page.evaluate((selector) => {
                const btn = document.querySelector(selector);
                return btn ? btn.getAttribute('onclick') : null;
            }, plusButtonSelector);
            console.log(`   onclick attribute: ${onclickAttr}`);
            
            // Try to click it
            console.log('   Clicking + button...');
            await plusButton.click();
            await page.waitForTimeout(1000);
            
            // Check if quantity changed
            const quantityValue = await page.evaluate(() => {
                const input = document.querySelector('.product-card:first-child .quantity-input');
                return input ? input.value : 'not found';
            });
            console.log(`   Quantity value after click: ${quantityValue}`);
            
            // Check for any JavaScript errors
            const jsErrors = await page.evaluate(() => {
                return window.jsErrors || [];
            });
            if (jsErrors.length > 0) {
                console.log('   ❌ JavaScript errors detected:', jsErrors);
            }
        } else {
            console.log('   ❌ + button not found!');
        }
        
        // Check the - button
        console.log('\n   Looking for - button...');
        const minusButtonSelector = '.product-card:first-child .btn-quantity:first-child';
        const minusButton = await page.$(minusButtonSelector);
        
        if (minusButton) {
            console.log('   ✅ Found - button');
            const onclickAttr = await page.evaluate((selector) => {
                const btn = document.querySelector(selector);
                return btn ? btn.getAttribute('onclick') : null;
            }, minusButtonSelector);
            console.log(`   onclick attribute: ${onclickAttr}`);
        } else {
            console.log('   ❌ - button not found!');
        }
        
        // Check if updateQuantity function exists
        console.log('\n🔍 Checking if JavaScript functions exist...');
        const functionsExist = await page.evaluate(() => {
            return {
                updateQuantity: typeof updateQuantity !== 'undefined',
                selectColor: typeof selectColor !== 'undefined',
                setQuantity: typeof setQuantity !== 'undefined',
                products: typeof products !== 'undefined' ? products.length : 'undefined',
                cart: typeof cart !== 'undefined' ? cart.length : 'undefined'
            };
        });
        console.log('   Function availability:', functionsExist);
        
        // Get any error messages
        const errors = await page.evaluate(() => {
            const errorModal = document.getElementById('error-modal');
            const errorMessage = document.getElementById('error-message');
            if (errorModal && errorModal.style.display !== 'none' && errorMessage) {
                return errorMessage.textContent;
            }
            return null;
        });
        
        if (errors) {
            console.log(`\n❌ Error modal shown: ${errors}`);
        }
        
        console.log('\n📊 Test Summary:');
        console.log('================');
        
        // Take a screenshot
        const screenshotPath = path.join(__dirname, 'ui-test-screenshot.png');
        await page.screenshot({ path: screenshotPath });
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        
        if (page) {
            const screenshotPath = path.join(__dirname, 'error-screenshot.png');
            await page.screenshot({ path: screenshotPath });
            console.log(`📸 Error screenshot saved: ${screenshotPath}`);
        }
        
    } finally {
        console.log('\nPress Ctrl+C to close the browser...');
        // Keep browser open for inspection
        await new Promise(() => {});
    }
}

// Run the test
testUI();