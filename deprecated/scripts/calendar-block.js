#!/usr/bin/env node

/**
 * Calendar Time Blocking Script
 * Purpose: Create a focused work block in Google Calendar
 * Usage: node scripts/calendar-block.js
 * Dependencies: None (generates manual entry instructions)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current time in Australia/Sydney timezone
const now = new Date();
const sydneyTime = new Date(now.toLocaleString("en-US", {timeZone: "Australia/Sydney"}));

// Calculate start and end times (next 3 hours)
const startTime = new Date(sydneyTime);
const endTime = new Date(sydneyTime);
endTime.setHours(endTime.getHours() + 3);

// Format times for display
const formatTime = (date) => {
  return date.toLocaleTimeString('en-AU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Australia/Sydney'
  });
};

const formatDate = (date) => {
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Australia/Sydney'
  });
};

// Event details
const event = {
  title: "Focus Block - Deep Work Session",
  date: formatDate(startTime),
  startTime: formatTime(startTime),
  endTime: formatTime(endTime),
  description: "3-hour focused work block for concentrated productivity",
  color: "Peacock (blue)",
  reminders: "10 minutes, 2 minutes before"
};

// Generate calendar sync data
const syncData = {
  timestamp: new Date().toISOString(),
  event: {
    summary: event.title,
    start: startTime.toISOString(),
    end: endTime.toISOString(),
    timeZone: "Australia/Sydney",
    description: event.description,
    reminders: {
      useDefault: false,
      overrides: [
        {method: "popup", minutes: 10},
        {method: "popup", minutes: 2}
      ]
    }
  }
};

// Save sync data
const syncDir = path.join(__dirname, '..', 'planning', 'calendar-sync');
if (!fs.existsSync(syncDir)) {
  fs.mkdirSync(syncDir, { recursive: true });
}

const syncFile = path.join(syncDir, `block-${formatDate(startTime).replace(/\//g, '-')}-${Date.now()}.json`);
fs.writeFileSync(syncFile, JSON.stringify(syncData, null, 2));

// Display instructions
console.log(`
╔════════════════════════════════════════════════════════════╗
║                 3-HOUR FOCUS BLOCK CREATED                  ║
╚════════════════════════════════════════════════════════════╝

📅 Event Details:
─────────────────────────────────────────────────────────────
Title:       ${event.title}
Date:        ${event.date}
Time:        ${event.startTime} - ${event.endTime} (Sydney time)
Duration:    3 hours
Description: ${event.description}

🎯 Manual Entry Instructions:
─────────────────────────────────────────────────────────────
1. Open Google Calendar: https://calendar.google.com
2. Click the "+ Create" button
3. Enter these details:
   • Title: ${event.title}
   • Date: Today
   • Time: ${event.startTime} to ${event.endTime}
   • Description: ${event.description}
   • Color: ${event.color}
   • Notifications: ${event.reminders}
4. Click "Save"

💡 Quick Add Alternative:
─────────────────────────────────────────────────────────────
Copy and paste this into Google Calendar's "Quick Add":
"${event.title} today ${event.startTime}-${event.endTime}"

✅ Event data saved to: ${path.basename(syncFile)}

🚀 Ready to focus! Your 3-hour deep work block starts at ${event.startTime}.
`);

// Log to file
const logDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, `calendar-block-${formatDate(startTime).replace(/\//g, '-')}.log`);
const logEntry = `[${new Date().toISOString()}] Created 3-hour focus block: ${event.startTime} - ${event.endTime}\n`;
fs.appendFileSync(logFile, logEntry);

console.log('═══════════════════════════════════════════════════════════');