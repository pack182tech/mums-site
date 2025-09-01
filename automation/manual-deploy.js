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

// Color output helpers
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

async function main() {
    log('', 'reset');
    log('╔═══════════════════════════════════════════════════════╗', 'bright');
    log('║      MANUAL DEPLOYMENT ASSISTANT v1.0                ║', 'bright');
    log('╚═══════════════════════════════════════════════════════╝', 'bright');
    log('', 'reset');
    
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    
    if (command === 'help' || command === '--help') {
        log('This tool opens the correct URLs for manual deployment', 'cyan');
        log('', 'reset');
        log('Usage: node manual-deploy.js [command]', 'yellow');
        log('', 'reset');
        log('Commands:', 'yellow');
        log('  sheets  - Open Google Sheets for manual update', 'reset');
        log('  gas     - Open Apps Script for manual update', 'reset');
        log('  both    - Open both in separate tabs', 'reset');
        log('', 'reset');
        process.exit(0);
    }
    
    const browser = await chromium.launch({
        headless: false,
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
        
        if (command === 'sheets' || command === 'both') {
            log('📊 Opening Google Sheets...', 'cyan');
            const sheetsPage = await context.newPage();
            const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1qJvPFpgQXCGvvOAhKoYXdDYt4qCrBzrQiSM3aFLf5J0/edit';
            await sheetsPage.goto(spreadsheetUrl, { waitUntil: 'domcontentloaded' });
            
            log('', 'reset');
            log('📋 MANUAL STEPS FOR GOOGLE SHEETS:', 'bright');
            log('1. Log in if prompted', 'cyan');
            log('2. Click on the "Products" tab at the bottom', 'cyan');
            log('3. Press Ctrl+A to select all', 'cyan');
            log('4. Press Delete to clear', 'cyan');
            log('5. Press Ctrl+Home to go to cell A1', 'cyan');
            log('6. Copy the content from products-for-sheets.csv', 'cyan');
            log('7. Press Ctrl+V to paste', 'cyan');
            log('', 'reset');
            
            // Read and copy CSV content to clipboard
            const productsPath = path.join(__dirname, '..', 'products-for-sheets.csv');
            const productsContent = await fs.readFile(productsPath, 'utf-8');
            
            await sheetsPage.evaluate((text) => {
                navigator.clipboard.writeText(text);
            }, productsContent);
            
            log('✅ Product data copied to clipboard!', 'green');
            log('   Just press Ctrl+V in the spreadsheet', 'yellow');
        }
        
        if (command === 'gas' || command === 'both') {
            log('', 'reset');
            log('🚀 Opening Google Apps Script...', 'cyan');
            const gasPage = await context.newPage();
            const scriptUrl = 'https://script.google.com/home/projects/1RTnXs2Squ6qea3sDCol93L_VMsaCfm6WTv0KZXGl8Z3xP2R1lYIOmUcB/edit';
            await gasPage.goto(scriptUrl, { waitUntil: 'domcontentloaded' });
            
            log('', 'reset');
            log('📝 MANUAL STEPS FOR APPS SCRIPT:', 'bright');
            log('1. Log in if prompted', 'cyan');
            log('2. Wait for the editor to load', 'cyan');
            log('3. Click on Code.gs in the file list (if not selected)', 'cyan');
            log('4. Press Ctrl+A to select all code', 'cyan');
            log('5. Press Ctrl+V to paste new code', 'cyan');
            log('6. Press Ctrl+S to save', 'cyan');
            log('7. Click Deploy > New deployment', 'cyan');
            log('8. Add description and click Deploy', 'cyan');
            log('', 'reset');
            
            // Read Code.gs content
            let codeContent = '';
            try {
                codeContent = await fs.readFile(path.join(__dirname, 'Code-updated.gs'), 'utf-8');
            } catch (e) {
                try {
                    codeContent = await fs.readFile(path.join(__dirname, '..', 'google-apps-script', 'Code.gs'), 'utf-8');
                } catch (err) {
                    log('⚠️ Could not find Code.gs file', 'yellow');
                }
            }
            
            if (codeContent) {
                await gasPage.evaluate((text) => {
                    navigator.clipboard.writeText(text);
                }, codeContent);
                
                log('✅ Code.gs content copied to clipboard!', 'green');
                log('   Just press Ctrl+V in the editor', 'yellow');
            }
        }
        
        log('', 'reset');
        log('═══════════════════════════════════════════', 'bright');
        log('✨ Ready for manual deployment!', 'green');
        log('Follow the steps above in the browser windows', 'cyan');
        log('Press Ctrl+C when done', 'cyan');
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        await browser.close();
        process.exit(1);
    }
}

// Run
main().catch(console.error);