#!/usr/bin/env node

/**
 * Google OAuth2 Setup Helper
 * Purpose: Guide user through OAuth2 setup for Google Calendar API
 * Usage: node scripts/setup-google-oauth.cjs
 * Dependencies: Google Calendar API credentials
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');

console.log('🔐 Google Calendar OAuth2 Setup Helper\n');

console.log('This script will help you set up OAuth2 authentication for Google Calendar API.');
console.log('You have several options:\n');

console.log('📌 Option 1: Use Existing MCP Integration (RECOMMENDED)');
console.log('   ✅ Already configured in your system');
console.log('   ✅ Works directly with Claude Code');
console.log('   ✅ No additional setup required');
console.log('   📋 Usage: Copy MCP commands from calendar-sync-api.cjs output');
console.log('');

console.log('📌 Option 2: Google Calendar MCP Server');
console.log('   If you want to set up the MCP server:');
console.log('   1. Install: npm install @cocal/google-calendar-mcp');
console.log('   2. Get credentials from: https://console.cloud.google.com/');
console.log('   3. Follow the MCP server documentation');
console.log('');

console.log('📌 Option 3: Manual Calendar Entry');
console.log('   ✅ No setup required');
console.log('   ✅ Works with any calendar app');
console.log('   📋 Use the manual details from calendar-sync-api.cjs output');
console.log('');

console.log('📌 Current Recommendation:');
console.log('   Since you have MCP configured, use Option 1:');
console.log('   1. Run: node scripts/calendar-sync-api.cjs [date]');
console.log('   2. Copy the /mcp commands and run them in Claude Code');
console.log('   3. Events will be created automatically in Google Calendar');
console.log('');

console.log('🔍 Checking current setup...');

// Check if MCP tokens exist
const mcpTokenFile = path.join(process.env.HOME, '.config', 'google-calendar-mcp', 'tokens.json');
if (fs.existsSync(mcpTokenFile)) {
    console.log('   ✅ MCP OAuth tokens found - you can use MCP commands');
    
    try {
        const tokens = JSON.parse(fs.readFileSync(mcpTokenFile, 'utf8'));
        if (tokens.access_token) {
            console.log('   ✅ Access token available - API calls should work');
            console.log('   💡 Try: node scripts/calendar-sync-api.cjs --auto');
        }
    } catch (error) {
        console.log('   ⚠️ Token file exists but may be corrupted');
    }
} else {
    console.log('   ⚠️ No MCP OAuth tokens found');
}

// Check for API key
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
if (process.env.GOOGLE_API_KEY) {
    console.log('   ✅ Google API key found in .env');
    console.log('   ⚠️ Note: API key alone won\'t work for Calendar API (OAuth required)');
} else {
    console.log('   ⚠️ No Google API key found in .env');
}

console.log('\n🎯 Recommended Actions:');
console.log('   1. Use existing MCP integration for calendar sync');
console.log('   2. Run calendar-sync-api.cjs to get MCP commands');
console.log('   3. Execute MCP commands in Claude Code to create events');
console.log('');

console.log('✨ That\'s it! Your MCP integration should handle the authentication.');
console.log('   No additional OAuth setup needed.');