#!/usr/bin/env node

/**
 * Week Clear - Slash Command
 * Purpose: Remove weekly plan and associated files for fresh start
 * Usage: node scripts/week-clear.js [week]
 * Dependencies: fractal-planner-llm.cjs
 * 
 * This script wraps the clear-week functionality from the fractal planner
 * to provide a dedicated slash command interface.
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get week argument (default to current week in Sydney timezone)
function getSydneyWeekString(date = new Date()) {
    const sydneyDate = new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    const year = sydneyDate.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (sydneyDate - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNumber).padStart(2, '0')}`;
}

const weekArg = process.argv[2] || getSydneyWeekString();
const fractalPlannerPath = path.join(__dirname, 'fractal-planner-llm.cjs');

console.log(`🧹 Clearing weekly plan for ${weekArg}...`);

// Execute the clear-week command from fractal planner
exec(`node "${fractalPlannerPath}" clear-week ${weekArg}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error clearing weekly plan: ${error.message}`);
        process.exit(1);
    }
    
    if (stderr) {
        console.error(`⚠️  Warning: ${stderr}`);
    }
    
    console.log(stdout);
    console.log(`✅ Weekly plan cleared successfully for ${weekArg}`);
    console.log(`💡 Use '/plan-week' to create a new plan`);
});