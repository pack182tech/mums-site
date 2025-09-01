#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function deployGoogleAppsScript() {
    console.log('🚀 Deploying Code.gs to Google Apps Script');
    console.log('==========================================\n');
    
    let browser;
    let page;
    
    try {
        // Read the updated Code.gs file
        const codeGsPath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
        const codeContent = await fs.readFile(codeGsPath, 'utf-8');
        console.log('✅ Code.gs file loaded\n');
        
        // Launch browser
        console.log('🌐 Launching browser...');
        browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        
        // Navigate to Google Apps Script
        const scriptUrl = 'https://script.google.com/home/projects/1RTnXs2Squ6qea3sDCol93L_VMsaCfm6WTv0KZXGl8Z3xP2R1lYIOmUcB/edit';
        console.log('📝 Opening Google Apps Script editor...');
        await page.goto(scriptUrl, { waitUntil: 'networkidle2' });
        
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
            
            // Wait for navigation
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            console.log('✅ Logged in successfully\n');
        }
        
        // Wait for the Apps Script editor to load
        console.log('⏳ Waiting for editor to load...');
        await page.waitForSelector('.monaco-editor', { timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));
        
        // Click on Code.gs file in the file list (if not already selected)
        const codeGsFile = await page.$('div[aria-label="Code.gs"]');
        if (codeGsFile) {
            await codeGsFile.click();
            await new Promise(r => setTimeout(r, 1000));
        }
        
        // Select all text in editor (Ctrl+A)
        console.log('📝 Replacing Code.gs content...');
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await new Promise(r => setTimeout(r, 500));
        
        // Delete existing content
        await page.keyboard.press('Delete');
        await new Promise(r => setTimeout(r, 500));
        
        // Paste new content
        await page.evaluate((code) => {
            // Use clipboard API to paste the code
            const editor = document.querySelector('.monaco-editor');
            if (editor) {
                // Focus the editor
                const textarea = editor.querySelector('textarea');
                if (textarea) {
                    textarea.focus();
                    textarea.value = code;
                    // Trigger input event
                    const event = new Event('input', { bubbles: true });
                    textarea.dispatchEvent(event);
                }
            }
        }, codeContent);
        
        // Alternative: Type the content (slower but more reliable)
        await page.keyboard.type(codeContent);
        
        console.log('✅ Code updated\n');
        
        // Save the file (Ctrl+S)
        console.log('💾 Saving...');
        await page.keyboard.down('Control');
        await page.keyboard.press('s');
        await page.keyboard.up('Control');
        await new Promise(r => setTimeout(r, 2000));
        
        // Deploy the script
        console.log('🚀 Deploying...');
        
        // Click Deploy button
        const deployButton = await page.$('button[aria-label="Deploy"]');
        if (deployButton) {
            await deployButton.click();
            await new Promise(r => setTimeout(r, 1000));
            
            // Click "New deployment"
            const newDeployment = await page.$x("//div[contains(text(), 'New deployment')]");
            if (newDeployment.length > 0) {
                await newDeployment[0].click();
                await new Promise(r => setTimeout(r, 2000));
                
                // Fill deployment description
                const descInput = await page.$('input[aria-label="Description"]');
                if (descInput) {
                    await descInput.type('Fix product ID issue for buttons');
                }
                
                // Click Deploy button in dialog
                const deployBtn = await page.$x("//button[contains(text(), 'Deploy')]");
                if (deployBtn.length > 0) {
                    await deployBtn[0].click();
                    console.log('⏳ Waiting for deployment...');
                    await new Promise(r => setTimeout(r, 5000));
                    
                    console.log('✅ Deployment initiated!');
                }
            }
        }
        
        // Take screenshot
        await page.screenshot({ path: 'gas-deployment.png' });
        console.log('\n📸 Screenshot saved as gas-deployment.png');
        
        console.log('\n✨ Deployment complete!');
        console.log('The buttons should now work on the live site.');
        console.log('\nPress Ctrl+C to close the browser.');
        
        // Keep browser open for verification
        await new Promise(() => {});
        
    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        
        if (page) {
            await page.screenshot({ path: 'gas-error.png' });
            console.log('📸 Error screenshot saved as gas-error.png');
        }
        
        if (browser) {
            await browser.close();
        }
        process.exit(1);
    }
}

// Check for credentials
if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
    console.error('❌ Missing Google credentials!');
    console.log('Please ensure your .env file has GOOGLE_EMAIL and GOOGLE_PASSWORD');
    process.exit(1);
}

// Run deployment
deployGoogleAppsScript();