#!/usr/bin/env node

/**
 * Google Calendar MCP Helper
 * Bridges the gap between fractal planner and Google Calendar MCP integration
 */

const fs = require('fs');
const path = require('path');

// Read daily plan data
function loadDayPlan(date) {
  const planPath = path.join(__dirname, '..', 'planning', 'data', `day-${date}.json`);
  if (!fs.existsSync(planPath)) {
    console.log(`❌ No plan found for ${date}`);
    return null;
  }
  return JSON.parse(fs.readFileSync(planPath, 'utf8'));
}

// Generate MCP-compatible calendar events
function createCalendarEvents(date) {
  const plan = loadDayPlan(date);
  if (!plan) return;

  console.log(`🗓️ Creating calendar events for ${date}`);
  console.log(`📋 Found ${plan.timeBlocks?.length || 0} time blocks\n`);

  const colorMap = {
    'deep-work': '1',    // Blue
    'learning': '2',     // Green  
    'admin': '6',        // Orange
    'review': '3'        // Purple
  };

  plan.timeBlocks?.forEach((block, index) => {
    const colorId = colorMap[block.type] || '1';
    
    console.log(`# Event ${index + 1}: ${block.activity}`);
    console.log(`# MCP Command (copy and execute):`);
    console.log('```');
    console.log('mcp_call("google-calendar", "create_event", {');
    console.log(`  "calendarId": "primary",`);
    console.log(`  "summary": "${block.activity}",`);
    console.log(`  "description": "🎯 2026 AI engineering goal\\n⚡ Type: ${block.type}\\n📋 Daily Plan Block",`);
    console.log(`  "start": {`);
    console.log(`    "dateTime": "${date}T${block.startTime}:00",`);
    console.log(`    "timeZone": "Australia/Sydney"`);
    console.log(`  },`);
    console.log(`  "end": {`);
    console.log(`    "dateTime": "${date}T${block.endTime}:00",`);
    console.log(`    "timeZone": "Australia/Sydney"`);
    console.log(`  },`);
    console.log(`  "reminders": {`);
    console.log(`    "useDefault": false,`);
    console.log(`    "overrides": [`);
    console.log(`      {"method": "popup", "minutes": 10},`);
    console.log(`      {"method": "popup", "minutes": 2}`);
    console.log(`    ]`);
    console.log(`  },`);
    console.log(`  "colorId": "${colorId}"`);
    console.log('})');
    console.log('```\n');
  });
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node calendar-mcp-helper.cjs YYYY-MM-DD');
  process.exit(1);
}

const date = args[0];
createCalendarEvents(date);