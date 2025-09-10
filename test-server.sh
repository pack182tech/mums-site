#!/bin/bash

# Test Server Launcher for Mums Site Donation Features
# This script starts a local test server and opens the test page

echo "🧪 Starting Mums Site Test Server..."
echo "=================================="
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3 server"
    echo ""
    echo "📝 Test Instructions:"
    echo "1. Server will start on http://localhost:8000"
    echo "2. Test page: http://localhost:8000/test.html"
    echo "3. Production page: http://localhost:8000/index.html"
    echo ""
    echo "⚠️  TEST MODE INDICATORS:"
    echo "- Orange banner at top of page"
    echo "- Orange border around page"
    echo "- 'TEST MODE' in version footer"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "=================================="
    echo ""
    
    # Open test page in default browser (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2 && open "http://localhost:8000/test.html" &
    fi
    
    # Start Python server
    python3 -m http.server 8000
    
# Check if Node.js is available
elif command -v node &> /dev/null; then
    echo "✅ Using Node.js server"
    echo ""
    
    # Install http-server if needed
    if ! command -v http-server &> /dev/null; then
        echo "Installing http-server..."
        npm install -g http-server
    fi
    
    echo "📝 Test Instructions:"
    echo "1. Server will start on http://localhost:8080"
    echo "2. Test page: http://localhost:8080/test.html"
    echo "3. Production page: http://localhost:8080/index.html"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "=================================="
    echo ""
    
    # Open test page in default browser (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2 && open "http://localhost:8080/test.html" &
    fi
    
    # Start Node server
    http-server -p 8080
    
else
    echo "❌ Error: Neither Python 3 nor Node.js found!"
    echo ""
    echo "Please install one of the following:"
    echo "- Python 3: https://www.python.org/downloads/"
    echo "- Node.js: https://nodejs.org/"
    exit 1
fi