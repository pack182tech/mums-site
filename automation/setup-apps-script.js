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

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupAppsScript() {
    log('\n╔═══════════════════════════════════════════════════════╗', 'bright');
    log('║         GOOGLE APPS SCRIPT SETUP WIZARD              ║', 'bright');
    log('╚═══════════════════════════════════════════════════════╝', 'bright');
    log('', 'reset');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 300,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--window-size=1920,1080'
        ]
    });
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();
        
        // Try to navigate to the existing script first
        log('🔍 Checking if the existing Apps Script project is accessible...', 'cyan');
        const existingUrl = 'https://script.google.com/home/projects/1Mj9KWGnD84VXlKnJMxN0a3ayJ2cJQ3BjyZQ7F8t8dBIekQXBPwqGKdSA/edit';
        
        await page.goto(existingUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        // Check if we got a 404 or need to login
        const currentUrl = page.url();
        
        if (currentUrl.includes('accounts.google.com')) {
            log('🔐 Please log in to Google in the browser window', 'yellow');
            log('Waiting for login...', 'yellow');
            
            await page.waitForFunction(
                () => !window.location.href.includes('accounts.google.com'),
                { timeout: 300000 }
            );
            
            await page.waitForTimeout(2000);
        }
        
        // Check if we can access the script
        const pageTitle = await page.title();
        
        if (pageTitle.includes('404') || pageTitle.includes('Error')) {
            log('❌ The existing Apps Script project is not accessible', 'red');
            log('', 'reset');
            log('Creating a new Apps Script project...', 'cyan');
            
            // Navigate to create new script
            await page.goto('https://script.google.com/home', { waitUntil: 'networkidle' });
            await page.waitForTimeout(2000);
            
            // Look for "New project" button
            log('📝 Click "New project" button to create a new Apps Script', 'yellow');
            log('', 'reset');
            
            // Wait for user to create new project
            log('Please:', 'cyan');
            log('1. Click "New project" button', 'cyan');
            log('2. The editor will open with a new script', 'cyan');
            log('3. Copy the script ID from the URL', 'cyan');
            log('   (It\'s the long string between /projects/ and /edit)', 'cyan');
            log('', 'reset');
            
            log('Waiting for new project creation...', 'yellow');
            
            // Wait for navigation to a project URL
            await page.waitForFunction(
                () => window.location.href.includes('/projects/') && 
                     window.location.href.includes('/edit'),
                { timeout: 300000 }
            );
            
            const newUrl = page.url();
            const scriptIdMatch = newUrl.match(/\/projects\/([a-zA-Z0-9-_]+)\//);
            
            if (scriptIdMatch) {
                const newScriptId = scriptIdMatch[1];
                log('', 'reset');
                log(`✅ New Apps Script created!`, 'green');
                log(`Script ID: ${newScriptId}`, 'green');
                
                // Update .clasp.json
                const claspPath = path.join(__dirname, '..', 'google-apps-script', '.clasp.json');
                const claspContent = {
                    scriptId: newScriptId,
                    rootDir: "."
                };
                
                await fs.writeFile(claspPath, JSON.stringify(claspContent, null, 2));
                log(`✅ Updated .clasp.json with new script ID`, 'green');
                
                // Now paste the Code.gs content
                log('', 'reset');
                log('📋 Now updating the script with Code.gs content...', 'cyan');
                
                // Read Code.gs
                let codeContent = '';
                try {
                    codeContent = await fs.readFile(path.join(__dirname, 'Code-updated.gs'), 'utf-8');
                } catch (e) {
                    try {
                        codeContent = await fs.readFile(path.join(__dirname, '..', 'google-apps-script', 'Code.gs'), 'utf-8');
                    } catch (err) {
                        log('❌ Could not find Code.gs file', 'red');
                        return;
                    }
                }
                
                // Select all and replace
                await page.keyboard.press('Control+A');
                await page.waitForTimeout(500);
                await page.keyboard.type(codeContent);
                
                // Save
                await page.keyboard.press('Control+S');
                await page.waitForTimeout(2000);
                
                log('✅ Code updated and saved!', 'green');
                
                // Update all script files with new URL
                log('', 'reset');
                log('📝 Updating automation scripts with new script URL...', 'cyan');
                
                const newScriptUrl = `https://script.google.com/home/projects/${newScriptId}/edit`;
                const filesToUpdate = [
                    'deploy-gas-stealth.js',
                    'deploy-all.js',
                    'deploy-gas.js',
                    'open-gas-editor.js',
                    'update-gas-direct.js'
                ];
                
                for (const file of filesToUpdate) {
                    const filePath = path.join(__dirname, file);
                    try {
                        let content = await fs.readFile(filePath, 'utf-8');
                        content = content.replace(
                            /https:\/\/script\.google\.com\/[^\s'"]+1Mj9KWGnD84VXlKnJMxN0a3ayJ2cJQ3BjyZQ7F8t8dBIekQXBPwqGKdSA[^\s'"]*/g,
                            newScriptUrl
                        );
                        await fs.writeFile(filePath, content);
                        log(`✅ Updated ${file}`, 'green');
                    } catch (e) {
                        log(`⚠️ Could not update ${file}: ${e.message}`, 'yellow');
                    }
                }
                
                log('', 'reset');
                log('✨ Setup complete!', 'green');
                log('', 'reset');
                log('Next steps:', 'cyan');
                log('1. Deploy the script using the Deploy button', 'cyan');
                log('2. Select "New deployment"', 'cyan');
                log('3. Choose "Web app" as deployment type', 'cyan');
                log('4. Set "Execute as" to your account', 'cyan');
                log('5. Set "Who has access" to "Anyone"', 'cyan');
                log('6. Click "Deploy"', 'cyan');
                log('', 'reset');
                log(`Your new script URL: ${newScriptUrl}`, 'green');
            }
            
        } else {
            log('✅ The Apps Script project is accessible!', 'green');
            log(`URL: ${existingUrl}`, 'cyan');
            log('', 'reset');
            log('You can now use the deployment scripts.', 'green');
        }
        
        log('', 'reset');
        log('Browser will remain open. Press Ctrl+C when done.', 'cyan');
        await new Promise(() => {});
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        await browser.close();
        process.exit(1);
    }
}

// Run
setupAppsScript().catch(console.error);