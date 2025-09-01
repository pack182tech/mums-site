#!/usr/bin/env node
const { spawn } = require('child_process');
const puppeteer = require('puppeteer');
const path = require('path');
require('dotenv').config();

async function pushWithClasp() {
    console.log('🚀 Pushing Code.gs using clasp');
    console.log('================================\n');
    
    const gasDir = path.join(__dirname, '..', 'google-apps-script');
    
    // First, try to login with clasp
    console.log('🔐 Authenticating with clasp...');
    
    const loginProcess = spawn('clasp', ['login'], {
        cwd: gasDir,
        stdio: 'pipe'
    });
    
    let browser;
    
    loginProcess.stdout.on('data', async (data) => {
        const output = data.toString();
        console.log(output);
        
        // Check if it opens a URL for authentication
        const urlMatch = output.match(/https:\/\/[^\s]+/);
        if (urlMatch && !browser) {
            const authUrl = urlMatch[0];
            console.log('📌 Opening authentication URL...');
            
            // Open browser and handle authentication
            browser = await puppeteer.launch({
                headless: false,
                slowMo: 100
            });
            
            const page = await browser.newPage();
            await page.goto(authUrl, { waitUntil: 'networkidle2' });
            
            // Login if needed
            if (page.url().includes('accounts.google.com')) {
                console.log('Logging in to Google...');
                
                // Enter email
                const emailInput = await page.$('input[type="email"]');
                if (emailInput) {
                    await page.type('input[type="email"]', process.env.GOOGLE_EMAIL);
                    await page.click('#identifierNext');
                    
                    // Wait and enter password
                    await page.waitForSelector('input[type="password"]', { visible: true });
                    await new Promise(r => setTimeout(r, 1000));
                    await page.type('input[type="password"]', process.env.GOOGLE_PASSWORD);
                    await page.click('#passwordNext');
                }
            }
            
            // Wait for authorization
            await page.waitForSelector('button[data-submit="true"], #submit_approve_access', { timeout: 30000 });
            await page.click('button[data-submit="true"], #submit_approve_access');
            
            console.log('✅ Authorization granted');
            
            // Wait a bit for the process to complete
            await new Promise(r => setTimeout(r, 3000));
            await browser.close();
        }
    });
    
    loginProcess.stderr.on('data', (data) => {
        console.error('Error:', data.toString());
    });
    
    await new Promise((resolve) => {
        loginProcess.on('close', (code) => {
            console.log(`\nLogin process exited with code ${code}`);
            resolve();
        });
    });
    
    // Now push the changes
    console.log('\n📤 Pushing changes to Google Apps Script...');
    
    const pushProcess = spawn('clasp', ['push', '-f'], {
        cwd: gasDir,
        stdio: 'inherit'
    });
    
    await new Promise((resolve) => {
        pushProcess.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ Changes pushed successfully!');
            } else {
                console.log(`\n❌ Push failed with code ${code}`);
            }
            resolve();
        });
    });
    
    // Deploy the changes
    console.log('\n🚀 Deploying...');
    
    const deployProcess = spawn('clasp', ['deploy', '--description', 'Fix product ID issue'], {
        cwd: gasDir,
        stdio: 'inherit'
    });
    
    await new Promise((resolve) => {
        deployProcess.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ Deployment successful!');
                console.log('The buttons should now work on the live site.');
            } else {
                console.log(`\n⚠️ Deployment failed with code ${code}`);
                console.log('Changes are pushed but you may need to deploy manually.');
            }
            resolve();
        });
    });
}

// Check for credentials
if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_PASSWORD) {
    console.error('❌ Missing Google credentials!');
    console.log('Please ensure your .env file has GOOGLE_EMAIL and GOOGLE_PASSWORD');
    process.exit(1);
}

// Run
pushWithClasp().catch(console.error);