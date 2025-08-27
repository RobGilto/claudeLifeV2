#!/usr/bin/env node

/**
 * Sydney Time Display Script
 * Purpose: Returns the current date and time in Sydney, Australia timezone
 * Usage: node sydney-time.js
 * Dependencies: None (uses built-in Node.js APIs)
 */

function getSydneyTime() {
  const now = new Date();
  
  // Format options for Sydney timezone
  const options = {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'long'
  };
  
  // Get formatted date/time string
  const formatter = new Intl.DateTimeFormat('en-AU', options);
  const parts = formatter.formatToParts(now);
  
  // Extract parts for custom formatting
  const partsMap = {};
  parts.forEach(part => {
    partsMap[part.type] = part.value;
  });
  
  // Create readable output
  const dateStr = `${partsMap.year}-${partsMap.month}-${partsMap.day}`;
  const timeStr = `${partsMap.hour}:${partsMap.minute}:${partsMap.second}`;
  const dayStr = partsMap.weekday;
  
  // Get timezone offset
  const sydneyTime = now.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });
  
  // Only log if called directly
  if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('Sydney, Australia Time');
    console.log('======================');
    console.log(`Date: ${dateStr} (${dayStr})`);
    console.log(`Time: ${timeStr}`);
    console.log(`Full: ${sydneyTime}`);
    console.log(`Timezone: Australia/Sydney (AEDT/AEST)`);
  }
  
  return {
    date: dateStr,
    time: timeStr,
    day: dayStr,
    full: sydneyTime,
    timestamp: now.toISOString()
  };
}

// Export for use in other scripts
export { getSydneyTime };

// Run the function if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    getSydneyTime();
}