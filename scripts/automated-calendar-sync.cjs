#!/usr/bin/env node

/**
 * Automated Calendar Sync
 * Purpose: Automatically execute Google Calendar MCP calls for daily plan
 * Usage: Called from Claude Code after running calendar-sync command
 * Dependencies: Google Calendar MCP server must be active
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'planning', 'data');

function generateClaudeCodeCommands(date) {
    const syncFile = path.join(DATA_DIR, `calendar-sync-${date}.json`);
    
    if (!fs.existsSync(syncFile)) {
        console.log(`❌ No calendar sync data found for ${date}`);
        console.log(`   Run first: /plan-day then /calendar-sync ${date}`);
        return;
    }
    
    const syncData = JSON.parse(fs.readFileSync(syncFile, 'utf8'));
    
    console.log(`🤖 Automated Calendar Sync for ${date}`);
    console.log(`📅 ${syncData.events.length} events ready for creation\n`);
    
    console.log(`🚀 Copy and execute these commands in Claude Code:\n`);
    
    // Generate the exact MCP commands for Claude Code
    syncData.events.forEach((event, i) => {
        console.log(`# ${i + 1}. ${event.blockTitle}`);
        console.log(`/mcp call google-calendar create_event '{`);
        console.log(`  "calendarId": "primary",`);
        console.log(`  "summary": "${event.eventData.summary}",`);
        console.log(`  "description": "${event.eventData.description.replace(/\n/g, '\\n')}",`);
        console.log(`  "start": "${event.eventData.start.dateTime}",`);
        console.log(`  "end": "${event.eventData.end.dateTime}",`);
        console.log(`  "timeZone": "${event.eventData.start.timeZone}",`);
        console.log(`  "reminders": ${JSON.stringify(event.eventData.reminders)},`);
        console.log(`  "colorId": "${event.eventData.colorId}"`);
        console.log(`}'\n`);
    });
    
    console.log(`✅ Execute all ${syncData.events.length} commands above in Claude Code`);
    console.log(`📱 Then refresh your Google Calendar to see the events`);
    console.log(`🎯 Next: /taskmaster-start to begin daily execution`);
}

// Main execution
const args = process.argv.slice(2);
const date = args[0] || new Date().toISOString().split('T')[0];

generateClaudeCodeCommands(date);