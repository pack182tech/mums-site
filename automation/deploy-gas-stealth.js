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

async function loadSession() {
    try {
        const sessionExists = await fs.access(SESSION_FILE).then(() => true).catch(() => false);
        if (sessionExists) {
            const storage = JSON.parse(await fs.readFile(SESSION_FILE, 'utf-8'));
            console.log('📂 Using saved Google session');
            return storage;
        }
    } catch (error) {
        console.log('ℹ️ No saved session found');
    }
    return null;
}

async function saveSession(context) {
    const storage = await context.storageState();
    await fs.writeFile(SESSION_FILE, JSON.stringify(storage, null, 2));
    console.log('✅ Session saved');
}

async function deployGoogleAppsScript() {
    console.log('🚀 Deploying Code.gs to Google Apps Script with Stealth');
    console.log('========================================================\n');
    
    // Read the Code.gs file if it exists
    let codeContent = '';
    const codeGsPath = path.join(__dirname, 'Code-updated.gs');
    const alternativePath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
    
    try {
        // Try the updated file first
        codeContent = await fs.readFile(codeGsPath, 'utf-8');
        console.log('✅ Code-updated.gs file loaded\n');
    } catch (error) {
        try {
            // Fall back to the original location
            codeContent = await fs.readFile(alternativePath, 'utf-8');
            console.log('✅ Code.gs file loaded from google-apps-script folder\n');
        } catch (err) {
            console.error('❌ Could not find Code.gs file');
            console.log('Please ensure Code-updated.gs or google-apps-script/Code.gs exists');
            process.exit(1);
        }
    }
    
    // Load saved session
    const savedStorage = await loadSession();
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 500,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
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
            ...(savedStorage ? { storageState: savedStorage } : {})
        };
        
        const context = await browser.newContext(contextOptions);
        const page = await context.newPage();
        
        // Add evasion scripts
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            
            window.chrome = {
                runtime: {},
                loadTimes: function() {},
                csi: function() {}
            };
            
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en']
            });
        });
        
        // Navigate to Google Apps Script
        const scriptUrl = 'https://script.google.com/home/projects/1RTnXs2Squ6qea3sDCol93L_VMsaCfm6WTv0KZXGl8Z3xP2R1lYIOmUcB/edit';
        console.log('📝 Opening Google Apps Script editor...');
        await page.goto(scriptUrl, { waitUntil: 'networkidle', timeout: 60000 });
        
        // Wait to see if we need to login
        await page.waitForTimeout(3000);
        
        // Check if we need to login
        if (page.url().includes('accounts.google.com')) {
            console.log('🔐 Google login required');
            console.log('⚠️ Please complete the login manually in the browser window');
            console.log('Waiting for manual login (5 minutes timeout)...\n');
            
            // Wait for manual login
            try {
                await page.waitForNavigation({
                    url: (url) => url.includes('script.google.com'),
                    timeout: 300000 // 5 minutes
                });
                
                // Save the session after successful login
                await saveSession(context);
                console.log('✅ Login successful, session saved\n');
            } catch (error) {
                console.error('❌ Login timeout or failed');
                throw error;
            }
        } else {
            console.log('✅ Already authenticated\n');
        }
        
        // Wait for the Apps Script editor to load
        console.log('⏳ Waiting for Apps Script editor to load...');
        
        // Try multiple selectors for the editor
        const editorSelectors = [
            '.monaco-editor',
            'div[class*="monaco"]',
            'div[role="textbox"]',
            '.editor-container',
            '#editor'
        ];
        
        let editorFound = false;
        for (const selector of editorSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 10000 });
                editorFound = true;
                console.log('✅ Editor loaded\n');
                break;
            } catch (e) {
                // Try next selector
            }
        }
        
        if (!editorFound) {
            console.log('⚠️ Could not detect editor, continuing anyway...\n');
        }
        
        await page.waitForTimeout(2000);
        
        // Try to click on Code.gs file in the file list
        console.log('📄 Selecting Code.gs file...');
        const fileSelectors = [
            'div[aria-label="Code.gs"]',
            'span:has-text("Code.gs")',
            'div:has-text("Code.gs")',
            '.file-item:has-text("Code.gs")'
        ];
        
        for (const selector of fileSelectors) {
            try {
                const file = await page.$(selector);
                if (file) {
                    await file.click();
                    await page.waitForTimeout(1500);
                    break;
                }
            } catch (e) {
                // Try next selector
            }
        }
        
        // Select all text in editor
        console.log('📝 Replacing Code.gs content...');
        
        // Focus the editor first
        await page.click('body');
        await page.waitForTimeout(500);
        
        // Try to click inside the editor area
        const editorArea = await page.$('.monaco-editor');
        if (editorArea) {
            const box = await editorArea.boundingBox();
            if (box) {
                await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            }
        }
        
        // Select all with keyboard shortcut
        await page.keyboard.press('Control+A');
        await page.waitForTimeout(500);
        
        // Delete existing content
        await page.keyboard.press('Delete');
        await page.waitForTimeout(500);
        
        // Type the new content slowly to avoid detection
        console.log('⌨️ Typing new code (this will take a moment)...');
        
        // Split code into smaller chunks and type with pauses
        const lines = codeContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
            await page.keyboard.type(lines[i]);
            if (i < lines.length - 1) {
                await page.keyboard.press('Enter');
            }
            
            // Add random delays between lines
            if (i % 10 === 0) {
                await page.waitForTimeout(100 + Math.random() * 200);
            }
        }
        
        console.log('✅ Code content replaced\n');
        
        // Save the file
        console.log('💾 Saving changes...');
        await page.keyboard.press('Control+S');
        await page.waitForTimeout(2000);
        
        // Look for save confirmation or any error messages
        const saveIndicators = await page.$$('text=/saved|Saved|SAVED/i');
        if (saveIndicators.length > 0) {
            console.log('✅ File saved successfully\n');
        }
        
        // Deploy the script
        console.log('🚀 Starting deployment process...');
        console.log('⚠️ Note: You may need to complete the deployment manually\n');
        
        // Try to find and click Deploy button
        const deploySelectors = [
            'button[aria-label="Deploy"]',
            'button:has-text("Deploy")',
            'div[aria-label="Deploy"]',
            'div:has-text("Deploy")'
        ];
        
        let deployClicked = false;
        for (const selector of deploySelectors) {
            try {
                const button = await page.$(selector);
                if (button) {
                    await button.click();
                    deployClicked = true;
                    await page.waitForTimeout(2000);
                    break;
                }
            } catch (e) {
                // Try next selector
            }
        }
        
        if (deployClicked) {
            console.log('📋 Deploy menu opened');
            
            // Try to click "New deployment"
            const newDeploySelectors = [
                'div:has-text("New deployment")',
                'span:has-text("New deployment")',
                'button:has-text("New deployment")'
            ];
            
            for (const selector of newDeploySelectors) {
                try {
                    const option = await page.$(selector);
                    if (option) {
                        await option.click();
                        await page.waitForTimeout(2000);
                        console.log('✅ New deployment dialog opened');
                        
                        // Add description
                        const descInput = await page.$('input[aria-label="Description"]');
                        if (!descInput) {
                            const altDescInput = await page.$('input[placeholder*="description" i]');
                            if (altDescInput) {
                                await altDescInput.type('Automated deployment - ' + new Date().toISOString());
                            }
                        } else {
                            await descInput.type('Automated deployment - ' + new Date().toISOString());
                        }
                        
                        console.log('⚠️ Please complete the deployment manually in the dialog');
                        break;
                    }
                } catch (e) {
                    // Try next selector
                }
            }
        } else {
            console.log('⚠️ Could not find Deploy button');
            console.log('Please deploy manually using the Deploy menu');
        }
        
        // Take screenshot
        await page.screenshot({ path: 'gas-deployment-stealth.png', fullPage: true });
        console.log('\n📸 Screenshot saved as gas-deployment-stealth.png');
        
        console.log('\n✨ Code update complete!');
        console.log('Please verify the deployment in the browser window.');
        console.log('\nThe browser will remain open. Press Ctrl+C when done.');
        
        // Keep browser open for manual verification/completion
        await new Promise(() => {});
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        
        if (page) {
            await page.screenshot({ path: 'gas-error-stealth.png', fullPage: true });
            console.log('📸 Error screenshot saved as gas-error-stealth.png');
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
    console.log('\nNote: Due to Google security, you may need to:');
    console.log('1. Use an App Password instead of your regular password');
    console.log('2. Complete manual login on first run');
    process.exit(1);
}

// Run deployment
deployGoogleAppsScript().catch(console.error);