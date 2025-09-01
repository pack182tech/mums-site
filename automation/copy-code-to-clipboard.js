#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

async function copyCodeToClipboard() {
    console.log('📋 Copying Updated Code.gs to Clipboard');
    console.log('========================================\n');
    
    try {
        // Read the updated Code.gs file
        const codeGsPath = path.join(__dirname, '..', 'google-apps-script', 'Code.gs');
        const codeContent = await fs.readFile(codeGsPath, 'utf-8');
        
        console.log('✅ Code.gs file loaded');
        console.log(`📏 File size: ${codeContent.length} characters\n`);
        
        // Copy to clipboard based on OS
        const platform = process.platform;
        
        if (platform === 'darwin') {
            // macOS
            exec('pbcopy', (err, stdout, stderr) => {
                if (err) {
                    console.error('❌ Failed to copy to clipboard:', err);
                    return;
                }
            }).stdin.end(codeContent);
            console.log('✅ Code copied to clipboard (macOS)');
        } else if (platform === 'win32') {
            // Windows
            exec('clip', (err, stdout, stderr) => {
                if (err) {
                    console.error('❌ Failed to copy to clipboard:', err);
                    return;
                }
            }).stdin.end(codeContent);
            console.log('✅ Code copied to clipboard (Windows)');
        } else {
            // Linux - try xclip
            exec('xclip -selection clipboard', (err, stdout, stderr) => {
                if (err) {
                    console.error('❌ Failed to copy to clipboard. Please install xclip:', err);
                    console.log('Run: sudo apt-get install xclip');
                    return;
                }
            }).stdin.end(codeContent);
            console.log('✅ Code copied to clipboard (Linux)');
        }
        
        console.log('\n📝 Next steps:');
        console.log('1. Go to: https://script.google.com');
        console.log('2. Open your "Pack 182 Mums Order System" project');
        console.log('3. Click on Code.gs file');
        console.log('4. Select all (Cmd+A or Ctrl+A)');
        console.log('5. Paste (Cmd+V or Ctrl+V)');
        console.log('6. Save (Cmd+S or Ctrl+S)');
        console.log('7. Click Deploy → New deployment');
        console.log('8. Add description: "Fix product ID issue"');
        console.log('9. Click Deploy\n');
        
        console.log('The updated Code.gs is now in your clipboard!');
        
        // Also save to a file for backup
        const outputPath = path.join(__dirname, 'Code-updated.gs');
        await fs.writeFile(outputPath, codeContent);
        console.log(`\n💾 Backup saved to: ${outputPath}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run
copyCodeToClipboard();