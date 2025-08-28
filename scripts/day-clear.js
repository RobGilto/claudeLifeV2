#!/usr/bin/env node

/**
 * Day Clear - Slash Command
 * Purpose: Remove daily plan and associated files for fresh start
 * Usage: node scripts/day-clear.js [date]
 * Dependencies: fractal-planner-llm.cjs
 * 
 * This script wraps the clear-day functionality from the fractal planner
 * to provide a dedicated slash command interface.
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get date argument (default to today in Sydney timezone)
function getSydneyDateString(date = new Date()) {
    const sydneyDate = new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    return sydneyDate.toISOString().split('T')[0];
}

const dateArg = process.argv[2] || getSydneyDateString();
const fractalPlannerPath = path.join(__dirname, 'fractal-planner-llm.cjs');

console.log(`🧹 Clearing daily plan for ${dateArg}...`);

// Execute the clear-day command from fractal planner
exec(`node "${fractalPlannerPath}" clear-day ${dateArg}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error clearing daily plan: ${error.message}`);
        process.exit(1);
    }
    
    if (stderr) {
        console.error(`⚠️  Warning: ${stderr}`);
    }
    
    console.log(stdout);
    console.log(`✅ Daily plan cleared successfully for ${dateArg}`);
    console.log(`💡 Use '/plan-day' to create a new plan`);
});