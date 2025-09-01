#!/usr/bin/env node
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function updateGoogleAppsScript() {
    console.log('🚀 Updating Google Apps Script Directly');
    console.log('========================================\n');
    
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
            slowMo: 250,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
        });
        
        page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 900 });
        
        // Navigate to Google Apps Script using direct edit URL
        const scriptUrl = 'https://script.google.com/d/1RTnXs2Squ6qea3sDCol93L_VMsaCfm6WTv0KZXGl8Z3xP2R1lYIOmUcB/edit';
        console.log('📝 Opening Google Apps Script editor...');
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
            
            // Wait for navigation to complete
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
            console.log('✅ Logged in successfully\n');
        }
        
        // Wait for editor to load - try multiple selectors
        console.log('⏳ Waiting for editor to load...');
        
        // Wait for any sign of the editor
        await page.waitForFunction(
            () => {
                return document.querySelector('.monaco-editor') || 
                       document.querySelector('.ace_editor') ||
                       document.querySelector('[role="textbox"]') ||
                       document.querySelector('textarea');
            },
            { timeout: 30000 }
        );
        
        await new Promise(r => setTimeout(r, 3000));
        console.log('✅ Editor loaded\n');
        
        // Try to select all and replace content
        console.log('📝 Updating Code.gs content...');
        
        // Click in the editor area
        const editorSelector = '.monaco-editor, .ace_editor, [role="textbox"], textarea';
        await page.click(editorSelector);
        await new Promise(r => setTimeout(r, 500));
        
        // Select all (Cmd+A on Mac, Ctrl+A on others)
        await page.keyboard.down('Meta');
        await page.keyboard.press('a');
        await page.keyboard.up('Meta');
        await new Promise(r => setTimeout(r, 500));
        
        // Delete existing content
        await page.keyboard.press('Backspace');
        await new Promise(r => setTimeout(r, 500));
        
        // Type new content (slower but more reliable)
        console.log('Typing new content (this may take a minute)...');
        
        // Split content into smaller chunks to avoid overwhelming the editor
        const lines = codeContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
            await page.keyboard.type(lines[i]);
            await page.keyboard.press('Enter');
            
            // Progress indicator every 10 lines
            if (i % 10 === 0) {
                process.stdout.write(`\r  Progress: ${Math.round((i / lines.length) * 100)}%`);
            }
        }
        console.log('\r  Progress: 100%');
        console.log('✅ Content updated\n');
        
        // Save (Cmd+S on Mac)
        console.log('💾 Saving...');
        await page.keyboard.down('Meta');
        await page.keyboard.press('s');
        await page.keyboard.up('Meta');
        await new Promise(r => setTimeout(r, 3000));
        console.log('✅ Saved\n');
        
        // Try to deploy
        console.log('🚀 Attempting to deploy...');
        
        // Look for Deploy button
        const deployBtn = await page.$('button[aria-label*="Deploy"], div[aria-label*="Deploy"]');
        if (deployBtn) {
            await deployBtn.click();
            await new Promise(r => setTimeout(r, 2000));
            
            // Look for "New deployment" option
            const newDeployOption = await page.$x("//div[contains(text(), 'New deployment')]");
            if (newDeployOption.length > 0) {
                await newDeployOption[0].click();
                console.log('  Opening deployment dialog...');
                await new Promise(r => setTimeout(r, 3000));
                
                // Try to find and click the final Deploy button
                const finalDeployBtn = await page.$x("//button[contains(text(), 'Deploy')]");
                if (finalDeployBtn.length > 0) {
                    await finalDeployBtn[finalDeployBtn.length - 1].click();
                    console.log('  ✅ Deployment initiated!');
                    await new Promise(r => setTimeout(r, 5000));
                }
            }
        } else {
            console.log('  ⚠️  Deploy button not found - please deploy manually');
        }
        
        // Take screenshot
        await page.screenshot({ path: 'gas-updated.png' });
        console.log('\n📸 Screenshot saved as gas-updated.png');
        
        console.log('\n✨ Update complete!');
        console.log('If deployment didn\'t complete automatically:');
        console.log('1. Click Deploy → New deployment');
        console.log('2. Click Deploy in the dialog');
        console.log('\nThe browser will remain open. Press Ctrl+C when done.');
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        console.error('\n❌ Update failed:', error.message);
        
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

// Run
updateGoogleAppsScript();