#!/usr/bin/env node

/**
 * Calendar Booking Demo - MCP Integration Example
 * Purpose: Demonstrate Google Calendar integration with day planning
 * Usage: node scripts/calendar-booking-demo.cjs
 * Dependencies: Google Calendar MCP server
 * 
 * This demo shows how the enhanced day planning system integrates
 * with Google Calendar through MCP commands for seamless booking.
 */

const fs = require('fs');
const path = require('path');

// Sample time blocks for demonstration
const sampleTimeBlocks = [
    {
        id: 'block-1',
        start: '09:00',
        endTime: '10:30',
        duration: 90,
        type: 'deep-work',
        label: 'Morning Deep Work',
        activity: 'AI Learning & Boot.dev Practice'
    },
    {
        id: 'block-2',
        start: '10:45',
        endTime: '12:00',
        duration: 75,
        type: 'project',
        label: 'Project Development',
        activity: 'RuneQuest Character Generator - React Components'
    },
    {
        id: 'block-3',
        start: '14:00',
        endTime: '15:00',
        duration: 60,
        type: 'research',
        label: 'Research & Learning',
        activity: 'Claude Code documentation and MCP integration patterns'
    }
];

// Color mapping for different block types
const getBlockColor = (blockType) => {
    const colorMap = {
        'deep-work': '9',     // Blue - for focused work
        'project': '10',      // Green - for development
        'learning': '5',      // Yellow - for skill development
        'research': '3',      // Purple - for exploration
        'admin': '8',         // Gray - for administrative tasks
        'review': '6'         // Orange - for reflection
    };
    return colorMap[blockType] || '1'; // Default to pale blue
};

// Generate MCP commands for calendar booking
const generateCalendarCommands = (date, timeBlocks) => {
    const mcpCommands = [];
    
    timeBlocks.forEach((block, index) => {
        const eventData = {
            calendarId: 'primary',
            summary: `${block.label}: ${block.activity}`,
            description: `Time block for focused work.\nType: ${block.type}\nDuration: ${block.duration} minutes\n\n🎯 Focus Area: ${block.activity}`,
            start: `${date}T${block.start}:00`,
            end: `${date}T${block.endTime}:00`,
            timeZone: 'Australia/Sydney',
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 10 },
                    { method: 'popup', minutes: 2 }
                ]
            },
            colorId: getBlockColor(block.type)
        };
        
        mcpCommands.push({
            eventNumber: index + 1,
            tool: 'mcp__google-calendar__create_event',
            parameters: eventData
        });
    });
    
    return mcpCommands;
};

// Main demo function
const runDemo = () => {
    const today = new Date().toISOString().split('T')[0];
    const sydneyTime = new Date().toLocaleString('en-US', { 
        timeZone: 'Australia/Sydney',
        hour12: false
    });
    
    console.log('📅 Calendar Booking Demo - Enhanced Day Planning');
    console.log('='.repeat(50));
    console.log(`📆 Date: ${today}`);
    console.log(`🕐 Sydney Time: ${sydneyTime}`);
    console.log(`📋 Sample Time Blocks: ${sampleTimeBlocks.length}`);
    
    console.log('\n🎯 Planned Time Blocks:');
    sampleTimeBlocks.forEach((block, index) => {
        console.log(`  ${index + 1}. ${block.start} - ${block.endTime} (${block.duration}min)`);
        console.log(`     ${block.label}: ${block.activity}`);
        console.log(`     Type: ${block.type} | Color: ${getBlockColor(block.type)}`);
        console.log('');
    });
    
    // Generate MCP commands
    const mcpCommands = generateCalendarCommands(today, sampleTimeBlocks);
    
    console.log('🔧 Google Calendar MCP Commands:');
    console.log('='.repeat(50));
    console.log('Copy and execute these commands in Claude Code:');
    console.log('');
    
    mcpCommands.forEach((cmd) => {
        console.log(`📅 Event ${cmd.eventNumber}:`);
        console.log(`Tool: ${cmd.tool}`);
        console.log('Parameters:');
        console.log(JSON.stringify(cmd.parameters, null, 2));
        console.log('-'.repeat(40));
    });
    
    // Save commands to file for easy access
    const commandsFile = path.join(__dirname, '..', 'logs', `calendar-commands-${today}.json`);
    const logsDir = path.join(__dirname, '..', 'logs');
    
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    fs.writeFileSync(commandsFile, JSON.stringify(mcpCommands, null, 2));
    
    console.log(`\n💾 Commands saved to: ${commandsFile}`);
    console.log('\n✅ Demo completed! Execute the MCP commands above in Claude Code to book your calendar.');
    console.log('\n🚀 Next Steps:');
    console.log('  1. Copy each MCP command from above');
    console.log('  2. Paste into Claude Code chat');
    console.log('  3. Execute to create calendar events');
    console.log('  4. Check your Google Calendar for the new time blocks');
};

// Run the demo
runDemo();