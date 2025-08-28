#!/usr/bin/env node

/**
 * Calendar Sync Bridge
 * Purpose: Execute actual Google Calendar MCP calls from fractal planner data
 * Usage: node scripts/calendar-sync-bridge.cjs [date]
 * Dependencies: Google Calendar MCP server must be configured in Claude Code
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PLANNING_DIR = path.join(__dirname, '..', 'planning');
const DATA_DIR = path.join(PLANNING_DIR, 'data');

function loadCalendarSyncData(date) {
    const syncFile = path.join(DATA_DIR, `calendar-sync-${date}.json`);
    if (!fs.existsSync(syncFile)) {
        console.log(`❌ No calendar sync data found for ${date}`);
        console.log(`   Run first: node scripts/fractal-planner-llm.cjs calendar-sync ${date}`);
        return null;
    }
    return JSON.parse(fs.readFileSync(syncFile, 'utf8'));
}

function generateMCPCommands(syncData) {
    console.log(`🗓️ Calendar Sync Bridge - ${syncData.date}`);
    console.log(`📋 Found ${syncData.events.length} calendar events to create\n`);
    
    console.log(`🚀 Execute these MCP commands in Claude Code:\n`);
    
    syncData.events.forEach((event, i) => {
        const params = {
            calendarId: event.eventData.calendarId,
            summary: event.eventData.summary,
            description: event.eventData.description,
            start: event.eventData.start.dateTime,
            end: event.eventData.end.dateTime,
            timeZone: event.eventData.start.timeZone,
            reminders: event.eventData.reminders,
            colorId: event.eventData.colorId
        };
        
        console.log(`# ${i + 1}. ${event.blockTitle}`);
        console.log(`# Copy and execute this command in Claude Code:`);
        console.log('```');
        console.log('/mcp call google-calendar create_event \\');
        console.log(`'${JSON.stringify(params, null, 0).replace(/'/g, "\\'")}'`);
        console.log('```\n');
    });
    
    console.log(`⚡ Quick Command Generator (all events):`);
    console.log(`Copy all these commands to Claude Code and execute them one by one:\n`);
    
    syncData.events.forEach((event, i) => {
        const params = {
            calendarId: event.eventData.calendarId,
            summary: event.eventData.summary,
            description: event.eventData.description,
            start: event.eventData.start.dateTime,
            end: event.eventData.end.dateTime,
            timeZone: event.eventData.start.timeZone,
            reminders: event.eventData.reminders,
            colorId: event.eventData.colorId
        };
        
        console.log(`/mcp call google-calendar create_event '${JSON.stringify(params, null, 0).replace(/'/g, "\\'")}'`);
    });
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('Usage: node scripts/calendar-sync-bridge.cjs YYYY-MM-DD');
    process.exit(1);
}

const date = args[0];
const syncData = loadCalendarSyncData(date);

if (syncData) {
    generateMCPCommands(syncData);
    
    console.log(`\n💾 Sync data loaded from: planning/data/calendar-sync-${date}.json`);
    console.log(`🎯 Next: Execute the MCP commands above in Claude Code`);
    console.log(`📅 Then refresh your Google Calendar to see the events`);
}