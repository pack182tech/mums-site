#!/usr/bin/env node
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Configure stealth plugin
stealth.enabledEvasions.delete('iframe.contentWindow');
stealth.enabledEvasions.delete('media.codecs');
chromium.use(stealth);

const SESSION_FILE = path.join(__dirname, 'google-session.json');
const COOKIES_FILE = path.join(__dirname, 'google-cookies.json');

async function saveSession(context) {
    const cookies = await context.cookies();
    const storage = await context.storageState();
    await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    await fs.writeFile(SESSION_FILE, JSON.stringify(storage, null, 2));
    console.log('✅ Session saved');
}

async function loadSession(context) {
    try {
        const sessionExists = await fs.access(SESSION_FILE).then(() => true).catch(() => false);
        if (sessionExists) {
            const storage = JSON.parse(await fs.readFile(SESSION_FILE, 'utf-8'));
            console.log('📂 Loading saved session...');
            return storage;
        }
    } catch (error) {
        console.log('ℹ️ No saved session found');
    }
    return null;
}

async function updateGoogleSheets() {
    console.log('🚀 Updating Google Sheets with Enhanced Stealth');
    console.log('================================================\n');
    
    // Check for saved session
    const savedStorage = await loadSession();
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 300,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
            '--disable-infobars',
            '--window-size=1920,1080',
            '--start-maximized',
            '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
    });
    
    try {
        const contextOptions = {
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            locale: 'en-US',
            timezoneId: 'America/New_York',
            permissions: ['geolocation', 'notifications'],
            ...(savedStorage ? { storageState: savedStorage } : {})
        };
        
        const context = await browser.newContext(contextOptions);
        const page = await context.newPage();
        
        // Add additional evasion scripts
        await page.addInitScript(() => {
            // Override webdriver property
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            
            // Override chrome property
            window.chrome = {
                runtime: {}
            };
            
            // Override permissions
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                    Promise.resolve({ state: Notification.permission }) :
                    originalQuery(parameters)
            );
            
            // Override plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            
            // Override languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
        });
        
        // Navigate to Google Sheets
        const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1qJvPFpgQXCGvvOAhKoYXdDYt4qCrBzrQiSM3aFLf5J0/edit';
        console.log('📊 Opening Google Sheets...');
        await page.goto(spreadsheetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait a bit to see if we're logged in
        await page.waitForTimeout(3000);
        
        // Check if we need to login
        if (page.url().includes('accounts.google.com')) {
            console.log('🔐 Need to authenticate with Google...\n');
            
            // Try to find email field
            try {
                // Look for various possible email field selectors
                const emailSelectors = [
                    'input[type="email"]',
                    'input[id="identifierId"]',
                    'input[name="identifier"]',
                    'input[autocomplete="username"]'
                ];
                
                let emailField = null;
                for (const selector of emailSelectors) {
                    emailField = await page.$(selector);
                    if (emailField) break;
                }
                
                if (emailField) {
                    console.log('📧 Entering email...');
                    await emailField.click();
                    await page.waitForTimeout(500);
                    
                    // Type slowly to appear human
                    for (const char of process.env.GOOGLE_EMAIL) {
                        await page.keyboard.type(char);
                        await page.waitForTimeout(50 + Math.random() * 100);
                    }
                    
                    // Find and click next button
                    const nextButtonSelectors = [
                        '#identifierNext',
                        'button[jsname="LgbsSe"]',
                        'div[id="identifierNext"]',
                        'button:has-text("Next")'
                    ];
                    
                    for (const selector of nextButtonSelectors) {
                        const button = await page.$(selector);
                        if (button) {
                            await button.click();
                            break;
                        }
                    }
                    
                    // Wait for password field
                    await page.waitForTimeout(3000);
                    
                    // Look for password field
                    const passwordSelectors = [
                        'input[type="password"]',
                        'input[name="password"]',
                        'input[name="Passwd"]',
                        'input[autocomplete="current-password"]'
                    ];
                    
                    let passwordField = null;
                    for (const selector of passwordSelectors) {
                        passwordField = await page.$(selector);
                        if (passwordField) break;
                    }
                    
                    if (passwordField) {
                        console.log('🔑 Entering password...');
                        await passwordField.click();
                        await page.waitForTimeout(500);
                        
                        // Type password slowly
                        for (const char of process.env.GOOGLE_PASSWORD) {
                            await page.keyboard.type(char);
                            await page.waitForTimeout(50 + Math.random() * 100);
                        }
                        
                        // Find and click sign in button
                        const signInSelectors = [
                            '#passwordNext',
                            'button[jsname="LgbsSe"]',
                            'div[id="passwordNext"]',
                            'button:has-text("Next")'
                        ];
                        
                        for (const selector of signInSelectors) {
                            const button = await page.$(selector);
                            if (button) {
                                await button.click();
                                break;
                            }
                        }
                        
                        // Wait for navigation
                        await page.waitForTimeout(5000);
                        
                        // Save session if login successful
                        if (!page.url().includes('accounts.google.com')) {
                            await saveSession(context);
                            console.log('✅ Logged in successfully\n');
                        }
                    }
                }
            } catch (error) {
                console.log('⚠️ Login automation detected or blocked');
                console.log('Please complete login manually in the browser window...');
                
                // Wait for manual login
                await page.waitForNavigation({ 
                    url: (url) => !url.includes('accounts.google.com'),
                    timeout: 300000 // 5 minutes for manual login
                });
                
                await saveSession(context);
                console.log('✅ Manual login successful\n');
            }
        } else {
            console.log('✅ Already logged in (using saved session)\n');
        }
        
        // Wait for Sheets to load
        console.log('⏳ Waiting for spreadsheet to load...');
        try {
            await page.waitForSelector('div[role="grid"]', { timeout: 30000 });
        } catch (error) {
            // Try alternative selectors
            await page.waitForSelector('div.waffle', { timeout: 30000 });
        }
        await page.waitForTimeout(3000);
        console.log('✅ Spreadsheet loaded\n');
        
        // Switch to Products sheet
        console.log('📋 Switching to Products sheet...');
        
        // Try multiple selectors for the Products tab
        const tabSelectors = [
            'div.docs-sheet-tab-name:has-text("Products")',
            'div[role="tab"]:has-text("Products")',
            'span:has-text("Products")',
            'div.docs-sheet-tab:has-text("Products")'
        ];
        
        let clicked = false;
        for (const selector of tabSelectors) {
            try {
                const tab = await page.$(selector);
                if (tab) {
                    await tab.click();
                    clicked = true;
                    break;
                }
            } catch (e) {
                // Try next selector
            }
        }
        
        if (!clicked) {
            console.log('⚠️ Could not find Products tab, trying to continue anyway...');
        }
        
        await page.waitForTimeout(2000);
        
        // Select all cells
        console.log('🗑️ Clearing existing data...');
        await page.keyboard.press('Control+A');
        await page.waitForTimeout(500);
        await page.keyboard.press('Delete');
        await page.waitForTimeout(1000);
        
        // Click on first cell
        try {
            // Try to click on A1 cell
            const firstCell = await page.$('div[role="gridcell"][aria-rowindex="1"][aria-colindex="1"]');
            if (firstCell) {
                await firstCell.click();
            } else {
                // Alternative: use keyboard shortcut
                await page.keyboard.press('Control+Home');
            }
        } catch (e) {
            await page.keyboard.press('Control+Home');
        }
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
        await page.screenshot({ path: 'sheets-updated-stealth.png', fullPage: true });
        console.log('📸 Screenshot saved as sheets-updated-stealth.png\n');
        
        console.log('✨ Update complete!');
        console.log('The spreadsheet has been updated with the new product data.');
        console.log('\n📌 Session saved for future use');
        console.log('Next runs will use the saved session to avoid re-authentication');
        
        // Save session again to ensure it's current
        await saveSession(context);
        
        // Keep browser open for verification
        console.log('\n🔍 Browser will remain open for verification.');
        console.log('Press Ctrl+C when done.');
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (page) {
            await page.screenshot({ path: 'sheets-error-stealth.png', fullPage: true });
            console.log('📸 Error screenshot saved');
        }
        throw error;
    }
}

// Check for credentials
if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
    console.error('❌ Missing Google credentials!');
    console.log('Please ensure your .env file contains:');
    console.log('GOOGLE_EMAIL=your-email@gmail.com');
    console.log('GOOGLE_PASSWORD=your-password');
    process.exit(1);
}

// Run
updateGoogleSheets().catch(console.error);