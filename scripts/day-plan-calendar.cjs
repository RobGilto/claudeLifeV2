#!/usr/bin/env node

/**
 * Day Plan with Calendar Integration - Slash Command Integration
 * Purpose: Enhanced day planning with Google Calendar MCP integration
 * Usage: node scripts/day-plan-calendar.js [date]
 * Dependencies: fractal-planner-v2.js, Google Calendar MCP
 * 
 * Features:
 * - Time-aware planning based on current Sydney time
 * - Interactive calendar booking modes
 * - Google Calendar MCP command generation
 * - Color-coded time blocks for different activities
 * - ADD-optimized workflow with realistic time constraints
 * 
 * Integration with /day-plan slash command:
 * This script provides the enhanced calendar booking functionality
 * for the Claude.md system's day planning protocol.
 */

const { execSync } = require('child_process');
const path = require('path');

// Get the date parameter
const dateParam = process.argv[2] || new Date().toISOString().split('T')[0];

console.log('🗓️  Enhanced Day Planning with Calendar Integration');
console.log(`📅 Date: ${dateParam}`);
console.log(`⏰ Sydney Time: ${new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney' })}`);

try {
    // Execute the enhanced fractal planner
    const plannerPath = path.join(__dirname, 'fractal-planner-v2.cjs');
    const result = execSync(`node "${plannerPath}" plan-day ${dateParam}`, { 
        stdio: 'inherit', 
        cwd: path.join(__dirname, '..') 
    });
    
    console.log('\n✅ Day planning completed successfully!');
    console.log('\n📋 Next Steps:');
    console.log('  1. Review your time blocks and activities');
    console.log('  2. If calendar events were prepared, execute the MCP commands in Claude Code');
    console.log('  3. Start your focused work sessions with /taskmaster-start');
    
} catch (error) {
    console.error('❌ Error during day planning:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  • Ensure the fractal-planner-v2.js script exists');
    console.log('  • Check that Google Calendar MCP is configured');
    console.log('  • Verify date format (YYYY-MM-DD)');
}