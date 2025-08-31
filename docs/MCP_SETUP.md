# Setting Up MCP for Google Sheets Integration

## Option 1: Google Drive MCP Server (Recommended)

This allows Claude Code to read and write to your Google Sheets directly.

### Step 1: Install the Google Drive MCP Server

```bash
npm install -g @modelcontextprotocol/server-gdrive
```

### Step 2: Set up Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API and Google Sheets API
4. Create credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: Desktop app
   - Download the credentials JSON file
   - Save it as `~/.config/gcp/credentials.json`

### Step 3: Add to Claude Code

Run this command in your terminal:

```bash
claude mcp add gdrive \
  --env GOOGLE_APPLICATION_CREDENTIALS=$HOME/.config/gcp/credentials.json \
  -- npx -y @modelcontextprotocol/server-gdrive
```

### Step 4: Authenticate

1. In Claude Code, type `/mcp` to see available servers
2. Click on the Google Drive server to authenticate
3. Follow the OAuth flow to grant permissions

## Option 2: Custom Google Sheets MCP Server

If you want more specific control, you can create a custom MCP server.

### Create a Simple MCP Server

Create `mcp-sheets-server.js`:

```javascript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { google } from 'googleapis';

const SPREADSHEET_ID = '1ifHz-wXFuHbJnIIRPyDuhg8L17cUzKgMXRgJqrL6ZCk';

class GoogleSheetsServer {
  constructor() {
    this.server = new Server({
      name: 'google-sheets-mums',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.setupTools();
  }

  setupTools() {
    // Tool to update products
    this.server.setRequestHandler('tools/call', async (request) => {
      if (request.params.name === 'update_products') {
        const auth = await this.authenticate();
        const sheets = google.sheets({ version: 'v4', auth });
        
        const values = request.params.arguments.products;
        
        const response = await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Products!A2:F50',
          valueInputOption: 'USER_ENTERED',
          requestBody: { values },
        });
        
        return {
          content: [{
            type: 'text',
            text: `Updated ${response.data.updatedRows} rows in Products sheet`,
          }],
        };
      }
      
      if (request.params.name === 'read_products') {
        const auth = await this.authenticate();
        const sheets = google.sheets({ version: 'v4', auth });
        
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Products!A:F',
        });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(response.data.values, null, 2),
          }],
        };
      }
    });
  }

  async authenticate() {
    // Add your authentication logic here
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return auth.getClient();
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new GoogleSheetsServer();
server.run().catch(console.error);
```

### Add to Claude Code

```bash
claude mcp add sheets-mums \
  --env GOOGLE_APPLICATION_CREDENTIALS=$HOME/.config/gcp/credentials.json \
  -- node /path/to/mcp-sheets-server.js
```

## Option 3: Use n8n or Zapier with MCP

You can also use workflow automation tools:

1. **n8n MCP Server**: Connects to n8n workflows
   ```bash
   claude mcp add n8n --env N8N_API_KEY=YOUR_KEY -- npx -y n8n-mcp-server
   ```

2. **Zapier** (via HTTP endpoints): Create Zapier webhooks and call them through MCP

## Current Workaround

Until MCP is set up, you can update Google Sheets by:

1. Opening the Google Sheet manually
2. Copying data from `docs/PRODUCTS_DATA.md`
3. Pasting into the appropriate tabs

## Benefits of MCP Integration

Once configured, you can tell Claude Code to:
- "Update the Google Sheet with the new product list"
- "Read current orders from the sheet"
- "Add a new product to the catalog"
- "Update product prices in the sheet"

And it will do it automatically without manual copying!

## Need Help?

- Check MCP logs: `claude mcp logs gdrive`
- List MCP servers: `claude mcp list`
- Remove a server: `claude mcp remove gdrive`