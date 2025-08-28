#!/usr/bin/env node

const { exec } = require('child_process');

// Test creating a calendar event for today
const testEvent = {
  summary: 'MCP Test Event',
  description: 'Testing Google Calendar MCP integration',
  start: {
    dateTime: new Date().toISOString(),
    timeZone: 'Australia/Sydney'
  },
  end: {
    dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour later
    timeZone: 'Australia/Sydney'
  }
};

console.log('Testing Google Calendar MCP server...');
console.log('Event details:', JSON.stringify(testEvent, null, 2));

// Try to communicate with MCP server via stdio
process.env.GOOGLE_OAUTH_CREDENTIALS = './client_secret_google_calendar.json';

const child = exec('npx @cocal/google-calendar-mcp', (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('stdout:', stdout);
  if (stderr) console.error('stderr:', stderr);
});

// Send MCP protocol message to create event
setTimeout(() => {
  const mcpRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'create_event',
      arguments: testEvent
    }
  };
  
  child.stdin.write(JSON.stringify(mcpRequest) + '\n');
  
  setTimeout(() => {
    child.kill();
    console.log('Test completed.');
  }, 3000);
}, 2000);