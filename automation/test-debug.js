#!/usr/bin/env node
const puppeteer = require('puppeteer');

async function debugTest() {
    console.log('🔍 Debug Test for Button Issues');
    console.log('================================\n');
    
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 100,
        devtools: true
    });
    
    const page = await browser.newPage();
    
    // Listen for console messages
    page.on('console', msg => {
        console.log('Console:', msg.type(), ':', msg.text());
    });
    
    // Listen for errors
    page.on('pageerror', error => {
        console.log('Page Error:', error.message);
    });
    
    await page.goto('https://pack182tech.github.io/mums-site/', { 
        waitUntil: 'networkidle2' 
    });
    
    // Check if products are loaded
    const productsLoaded = await page.evaluate(() => {
        return {
            productsArray: typeof products !== 'undefined' ? products : 'undefined',
            productsLength: typeof products !== 'undefined' ? products.length : 0,
            updateQuantityExists: typeof updateQuantity !== 'undefined',
            selectColorExists: typeof selectColor !== 'undefined',
            selectedColors: typeof selectedColors !== 'undefined' ? selectedColors : 'undefined'
        };
    });
    
    console.log('Initial state:', productsLoaded);
    
    // Click "Place an Order Here"
    await page.click('button.btn-primary');
    await new Promise(r => setTimeout(r, 2000));
    
    // Check products again
    const afterCatalog = await page.evaluate(() => {
        return {
            products: typeof products !== 'undefined' ? products.length : 0,
            firstProduct: typeof products !== 'undefined' && products.length > 0 ? products[0] : null,
            selectedColors: typeof selectedColors !== 'undefined' ? selectedColors : {},
            cart: typeof cart !== 'undefined' ? cart : []
        };
    });
    
    console.log('\nAfter showing catalog:', afterCatalog);
    
    // Try to select a color and click +
    if (afterCatalog.firstProduct) {
        const productId = afterCatalog.firstProduct.id || afterCatalog.firstProduct.ID;
        console.log('\nTrying to interact with product:', productId);
        
        // Click first color button
        const colorClicked = await page.evaluate((pid) => {
            const firstColorBtn = document.querySelector('.product-card:first-child .color-btn');
            if (firstColorBtn) {
                firstColorBtn.click();
                return { 
                    success: true, 
                    color: firstColorBtn.textContent.trim(),
                    selectedColors: window.selectedColors
                };
            }
            return { success: false };
        }, productId);
        
        console.log('Color selection:', colorClicked);
        
        await new Promise(r => setTimeout(r, 500));
        
        // Try clicking + button
        const plusClicked = await page.evaluate(() => {
            const plusBtn = document.querySelector('.product-card:first-child .btn-quantity:last-child');
            if (plusBtn) {
                // Check onclick
                const onclick = plusBtn.getAttribute('onclick');
                console.log('Plus button onclick:', onclick);
                
                // Try to click
                plusBtn.click();
                
                return {
                    clicked: true,
                    onclick: onclick,
                    quantityAfter: document.querySelector('.product-card:first-child .quantity-input').value,
                    cart: window.cart,
                    selectedColors: window.selectedColors
                };
            }
            return { clicked: false };
        });
        
        console.log('\n+ Button result:', plusClicked);
    }
    
    console.log('\n✅ Debug complete! Check browser console.');
    console.log('Press Ctrl+C to close.');
    
    await new Promise(() => {});
}

debugTest().catch(console.error);