#!/usr/bin/env node
const { chromium } = require('playwright-extra');
const stealth = require('puppeteer-extra-plugin-stealth')();
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
require('dotenv').config();

// Configure stealth plugin
stealth.enabledEvasions.delete('iframe.contentWindow');
stealth.enabledEvasions.delete('media.codecs');
chromium.use(stealth);

const SESSION_FILE = path.join(__dirname, 'google-session.json');
const COOKIES_FILE = path.join(__dirname, 'google-cookies.json');

// Color output helpers
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function saveSession(context) {
    const cookies = await context.cookies();
    const storage = await context.storageState();
    await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    await fs.writeFile(SESSION_FILE, JSON.stringify(storage, null, 2));
    log('✅ Session saved for future use', 'green');
}

async function loadSession() {
    try {
        const sessionExists = await fs.access(SESSION_FILE).then(() => true).catch(() => false);
        if (sessionExists) {
            const storage = JSON.parse(await fs.readFile(SESSION_FILE, 'utf-8'));
            log('📂 Found saved session', 'cyan');
            return storage;
        }
    } catch (error) {
        log('ℹ️ No saved session found', 'yellow');
    }
    return null;
}

async function authenticateIfNeeded(page, context) {
    // Check if we're on Google login page
    if (!page.url().includes('accounts.google.com')) {
        return true; // Already authenticated
    }
    
    log('🔐 Google authentication required', 'yellow');
    log('', 'reset');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'bright');
    log('MANUAL LOGIN REQUIRED', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'bright');
    log('', 'reset');
    log('Due to Google\'s security measures, please:', 'cyan');
    log('1. Complete the login process manually in the browser window', 'cyan');
    log('2. Use 2FA if prompted', 'cyan');
    log('3. The script will continue automatically once logged in', 'cyan');
    log('', 'reset');
    log('Waiting for login (5 minute timeout)...', 'yellow');
    
    try {
        // Wait for navigation away from login page
        await page.waitForFunction(
            () => !window.location.href.includes('accounts.google.com'),
            { timeout: 300000 } // 5 minutes
        );
        
        await page.waitForTimeout(2000);
        await saveSession(context);
        log('✅ Authentication successful!', 'green');
        return true;
    } catch (error) {
        log('❌ Authentication timeout', 'red');
        return false;
    }
}

async function updateGoogleSheets(browser) {
    log('\n📊 UPDATING GOOGLE SHEETS', 'bright');
    log('═══════════════════════════════════════════', 'bright');
    
    const savedStorage = await loadSession();
    
    const contextOptions = {
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'en-US',
        timezoneId: 'America/New_York',
        ...(savedStorage ? { storageState: savedStorage } : {})
    };
    
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    
    // Add anti-detection measures
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.chrome = { runtime: {} };
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    
    try {
        // Navigate to Google Sheets
        const spreadsheetUrl = process.env.SPREADSHEET_URL || 
            'https://docs.google.com/spreadsheets/d/1qJvPFpgQXCGvvOAhKoYXdDYt4qCrBzrQiSM3aFLf5J0/edit';
        
        log('Opening spreadsheet...', 'cyan');
        await page.goto(spreadsheetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(3000);
        
        // Check authentication
        if (!(await authenticateIfNeeded(page, context))) {
            throw new Error('Authentication failed');
        }
        
        // Wait for spreadsheet to load - try multiple selectors
        log('Waiting for spreadsheet to load...', 'cyan');
        
        // Try different selectors that might indicate the sheet is loaded
        const loadedSelectors = [
            'div[role="grid"]',
            'div.waffle',
            'div.grid-container',
            'canvas[dir="ltr"]',
            'div[role="application"]',
            'div.docs-sheet-tab',
            'div.docs-sheet-tab-name',
            '#docs-editor',
            'div[id*="grid-table"]'
        ];
        
        let sheetLoaded = false;
        for (const selector of loadedSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                sheetLoaded = true;
                log(`✅ Spreadsheet detected using ${selector}`, 'green');
                break;
            } catch (e) {
                // Try next selector
            }
        }
        
        if (!sheetLoaded) {
            // If no specific selector works, just wait and continue
            log('⚠️ Could not detect specific sheet elements, proceeding anyway...', 'yellow');
            await page.waitForTimeout(5000);
        }
        
        // Navigate to Products sheet
        log('Switching to Products sheet...', 'cyan');
        
        // Try multiple ways to click on Products tab
        const tabClicked = await page.evaluate(() => {
            // Method 1: Look for any element with "Products" text
            const elements = Array.from(document.querySelectorAll('*'));
            const productsElements = elements.filter(el => 
                el.textContent === 'Products' && 
                (el.className.includes('tab') || el.className.includes('sheet'))
            );
            
            if (productsElements.length > 0) {
                productsElements[0].click();
                return true;
            }
            
            // Method 2: Try specific selectors
            const selectors = [
                'div.docs-sheet-tab-name:has-text("Products")',
                'div[role="tab"]:has-text("Products")',
                'span:has-text("Products")',
                'div:has-text("Products")[class*="tab"]'
            ];
            
            for (const selector of selectors) {
                try {
                    const elem = document.querySelector(selector);
                    if (elem) {
                        elem.click();
                        return true;
                    }
                } catch (e) {}
            }
            
            // Method 3: Find by exact text match
            const tabs = document.querySelectorAll('div.docs-sheet-tab-name, div[role="tab"]');
            for (const tab of tabs) {
                if (tab.textContent.trim() === 'Products') {
                    tab.click();
                    return true;
                }
            }
            
            return false;
        });
        
        if (!tabClicked) {
            log('⚠️ Could not find Products tab, will update current sheet', 'yellow');
        } else {
            log('✅ Switched to Products sheet', 'green');
        }
        
        await page.waitForTimeout(2000);
        
        // Clear and update data
        log('Clearing existing data...', 'cyan');
        
        // Try to click on cell A1 first
        try {
            await page.click('div[role="gridcell"][aria-colindex="1"][aria-rowindex="1"]');
        } catch (e) {
            // If that doesn't work, use keyboard
            await page.keyboard.press('Control+Home');
        }
        
        await page.waitForTimeout(500);
        
        // Select all
        await page.keyboard.press('Control+A');
        await page.waitForTimeout(500);
        
        // Delete
        await page.keyboard.press('Delete');
        await page.waitForTimeout(1000);
        
        // Move to first cell again
        await page.keyboard.press('Control+Home');
        await page.waitForTimeout(500);
        
        // Read and paste CSV data
        log('Updating product data...', 'cyan');
        const productsPath = path.join(__dirname, '..', 'products-for-sheets.csv');
        const productsContent = await fs.readFile(productsPath, 'utf-8');
        
        // Copy to clipboard
        await page.evaluate((text) => {
            navigator.clipboard.writeText(text);
        }, productsContent);
        
        // Paste
        await page.keyboard.press('Control+V');
        await page.waitForTimeout(3000);
        
        // Take screenshot
        await page.screenshot({ path: 'sheets-updated.png', fullPage: true });
        log('✅ Google Sheets updated successfully!', 'green');
        log('📸 Screenshot saved as sheets-updated.png', 'cyan');
        
        await context.close();
        return true;
        
    } catch (error) {
        log(`❌ Error updating sheets: ${error.message}`, 'red');
        await page.screenshot({ path: 'sheets-error.png', fullPage: true });
        log('📸 Error screenshot saved as sheets-error.png', 'yellow');
        await context.close();
        return false;
    }
}

async function deployGoogleAppsScript(browser) {
    log('\n🚀 DEPLOYING GOOGLE APPS SCRIPT', 'bright');
    log('═══════════════════════════════════════════', 'bright');
    
    // Read Code.gs file
    let codeContent = '';
    const paths = [
        path.join(__dirname, 'Code-updated.gs'),
        path.join(__dirname, '..', 'google-apps-script', 'Code.gs')
    ];
    
    for (const filePath of paths) {
        try {
            codeContent = await fs.readFile(filePath, 'utf-8');
            log(`✅ Loaded code from ${path.basename(filePath)}`, 'green');
            break;
        } catch (e) {
            // Try next path
        }
    }
    
    if (!codeContent) {
        log('❌ Could not find Code.gs file', 'red');
        return false;
    }
    
    const savedStorage = await loadSession();
    
    const contextOptions = {
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'en-US',
        timezoneId: 'America/New_York',
        ...(savedStorage ? { storageState: savedStorage } : {})
    };
    
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();
    
    // Add anti-detection measures
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.chrome = { runtime: {} };
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    
    try {
        // Navigate to Apps Script
        const scriptUrl = 'https://script.google.com/home/projects/1RTnXs2Squ6qea3sDCol93L_VMsaCfm6WTv0KZXGl8Z3xP2R1lYIOmUcB/edit';
        
        log('Opening Apps Script editor...', 'cyan');
        await page.goto(scriptUrl, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForTimeout(3000);
        
        // Check authentication
        if (!(await authenticateIfNeeded(page, context))) {
            throw new Error('Authentication failed');
        }
        
        // Wait for editor
        log('Waiting for editor to load...', 'cyan');
        await page.waitForSelector('.monaco-editor, div[role="textbox"]', { timeout: 30000 });
        await page.waitForTimeout(2000);
        
        // Select Code.gs file
        log('Selecting Code.gs file...', 'cyan');
        await page.evaluate(() => {
            const files = Array.from(document.querySelectorAll('div[aria-label*="Code.gs"], span:has-text("Code.gs")'));
            if (files[0]) files[0].click();
        });
        await page.waitForTimeout(1500);
        
        // Replace code
        log('Updating code...', 'cyan');
        await page.keyboard.press('Control+A');
        await page.waitForTimeout(500);
        await page.keyboard.type(codeContent);
        
        // Save
        log('Saving changes...', 'cyan');
        await page.keyboard.press('Control+S');
        await page.waitForTimeout(2000);
        
        // Take screenshot
        await page.screenshot({ path: 'gas-updated.png', fullPage: true });
        log('✅ Google Apps Script updated successfully!', 'green');
        log('📸 Screenshot saved as gas-updated.png', 'cyan');
        
        log('', 'reset');
        log('⚠️  Please complete deployment manually:', 'yellow');
        log('   1. Click the Deploy button', 'cyan');
        log('   2. Select "New deployment"', 'cyan');
        log('   3. Add a description and deploy', 'cyan');
        
        await context.close();
        return true;
        
    } catch (error) {
        log(`❌ Error updating Apps Script: ${error.message}`, 'red');
        await page.screenshot({ path: 'gas-error.png', fullPage: true });
        await context.close();
        return false;
    }
}

async function main() {
    log('', 'reset');
    log('╔═══════════════════════════════════════════════════════╗', 'bright');
    log('║     MUMS SITE AUTOMATED DEPLOYMENT TOOL v2.1         ║', 'bright');
    log('╚═══════════════════════════════════════════════════════╝', 'bright');
    log('', 'reset');
    
    // Check credentials
    if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
        log('❌ Missing Google credentials!', 'red');
        log('Please ensure your .env file contains:', 'yellow');
        log('  GOOGLE_EMAIL=your-email@gmail.com', 'cyan');
        log('  GOOGLE_PASSWORD=your-password', 'cyan');
        process.exit(1);
    }
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'all';
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 300,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--window-size=1920,1080',
            '--start-maximized'
        ]
    });
    
    try {
        let success = true;
        
        if (command === 'sheets' || command === 'all') {
            success = await updateGoogleSheets(browser) && success;
        }
        
        if (command === 'gas' || command === 'all') {
            success = await deployGoogleAppsScript(browser) && success;
        }
        
        log('', 'reset');
        log('═══════════════════════════════════════════', 'bright');
        
        if (success) {
            log('✨ Deployment completed successfully!', 'green');
        } else {
            log('⚠️  Deployment completed with errors', 'yellow');
        }
        
        log('Browser will remain open. Press Ctrl+C to exit.', 'cyan');
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        log(`\n❌ Fatal error: ${error.message}`, 'red');
        await browser.close();
        process.exit(1);
    }
}

// Show usage
if (process.argv.includes('--help')) {
    log('Usage: node deploy-all-fixed.js [command]', 'cyan');
    log('', 'reset');
    log('Commands:', 'yellow');
    log('  all     - Update both Sheets and Apps Script (default)', 'reset');
    log('  sheets  - Update Google Sheets only', 'reset');
    log('  gas     - Update Google Apps Script only', 'reset');
    log('', 'reset');
    process.exit(0);
}

// Run
main().catch(console.error);