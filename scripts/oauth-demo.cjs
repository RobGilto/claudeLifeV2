#!/usr/bin/env node

/**
 * OAuth2 Setup Demo and Comparison
 * Purpose: Show the difference between MCP and direct OAuth approaches
 * Usage: node scripts/oauth-demo.cjs
 */

console.log('🔐 Google Calendar OAuth2 Integration Demo\n');

console.log('📊 Current Status:\n');

// Check MCP tokens
const fs = require('fs');
const path = require('path');

const mcpTokenFile = path.join(process.env.HOME, '.config', 'google-calendar-mcp', 'tokens.json');
const directTokenFile = path.join(__dirname, '..', '.google-tokens.json');
const credentialsFile = path.join(__dirname, '..', 'client_secret.json');

console.log('1️⃣ MCP Integration (Current Working Method)');
if (fs.existsSync(mcpTokenFile)) {
    console.log('   ✅ MCP tokens found - can use MCP commands');
    console.log('   📋 Usage: Copy MCP commands from calendar-sync-api.cjs');
    console.log('   🎯 Status: WORKING - This is your current method');
} else {
    console.log('   ❌ No MCP tokens found');
}

console.log('\n2️⃣ Direct API Integration (Optional Enhancement)');
if (fs.existsSync(directTokenFile)) {
    console.log('   ✅ Direct OAuth tokens found - can use --auto mode');
    console.log('   📋 Usage: calendar-sync-api.cjs --auto');
    console.log('   🎯 Status: READY for full automation');
} else {
    console.log('   ⚠️ No direct OAuth tokens found');
    if (fs.existsSync(credentialsFile)) {
        console.log('   📋 Credentials available - run setup to enable');
        console.log('   🔧 Next: node scripts/oauth-setup-direct.cjs setup');
    } else {
        console.log('   📋 Need OAuth credentials from Google Cloud Console');
        console.log('   🔧 See: scripts/OAUTH_SETUP_GUIDE.md');
    }
}

console.log('\n📋 Integration Options Summary:\n');

console.log('🥇 Option 1: Use Your Current Working Method');
console.log('   Command: node scripts/calendar-sync-api.cjs');
console.log('   Result: Generates MCP commands');
console.log('   Action: Copy/paste MCP commands in Claude Code');
console.log('   Pro: Already working, no setup needed');
console.log('   Con: Manual step required');
console.log('');

console.log('🥈 Option 2: Set Up Direct API (Optional)');
console.log('   Setup: Follow OAUTH_SETUP_GUIDE.md');
console.log('   Command: node scripts/calendar-sync-api.cjs --auto');
console.log('   Result: Events created automatically');
console.log('   Pro: Fully automated, no manual steps');
console.log('   Con: Requires initial OAuth setup');
console.log('');

console.log('🥉 Option 3: Manual Entry (Always Available)');
console.log('   Command: Any calendar-sync script');
console.log('   Result: Manual entry details provided');
console.log('   Action: Add events manually to calendar');
console.log('   Pro: Always works, no dependencies');
console.log('   Con: Most manual work');
console.log('');

console.log('💡 Recommendation:');
console.log('   • Keep using Option 1 (MCP commands) - it works great!');
console.log('   • Set up Option 2 only if you want full automation');
console.log('   • Option 3 is always there as backup');
console.log('');

console.log('🎯 To proceed with current working method:');
console.log('   node scripts/calendar-sync-api.cjs');
console.log('   → Copy the MCP commands to Claude Code');
console.log('   → Events will be created in Google Calendar');

if (!fs.existsSync(directTokenFile) && !fs.existsSync(credentialsFile)) {
    console.log('');
    console.log('🔧 To enable full automation (optional):');
    console.log('   1. Read: scripts/OAUTH_SETUP_GUIDE.md');
    console.log('   2. Get credentials from Google Cloud Console');
    console.log('   3. Run: node scripts/oauth-setup-direct.cjs setup');
    console.log('   4. Use: node scripts/calendar-sync-api.cjs --auto');
}