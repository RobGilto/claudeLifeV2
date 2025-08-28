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

// Calculate end time from start time and duration
function calculateEndTime(startTime, duration) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
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
    const endTime = calculateEndTime(block.start, block.duration);
    
    console.log(`# Event ${index + 1}: ${block.activity}`);
    console.log(`# Time: ${block.start} - ${endTime} (${block.duration}min)`);
    console.log(`# Claude MCP Command:`);
    console.log('```');
    console.log(`/mcp call google-calendar create_event '{`);
    console.log(`  "calendarId": "primary",`);
    console.log(`  "summary": "${block.activity}",`);
    console.log(`  "description": "🎯 ${block.alignment}\\n⚡ Type: ${block.type}\\n📋 Daily Plan Block",`);
    console.log(`  "start": "${date}T${block.start}:00",`);
    console.log(`  "end": "${date}T${endTime}:00",`);
    console.log(`  "timeZone": "Australia/Sydney",`);
    console.log(`  "reminders": {`);
    console.log(`    "useDefault": false,`);
    console.log(`    "overrides": [`);
    console.log(`      {"method": "popup", "minutes": 10},`);
    console.log(`      {"method": "popup", "minutes": 2}`);
    console.log(`    ]`);
    console.log(`  },`);
    console.log(`  "colorId": "${colorId}"`);
    console.log(`}'`);
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