#!/usr/bin/env node

/**
 * Quarter Clear - Slash Command
 * Purpose: Remove quarterly plan and associated files for fresh start
 * Usage: node scripts/quarter-clear.js [quarter]
 * Dependencies: fractal-planner-llm.cjs
 * 
 * This script wraps the clear-quarter functionality from the fractal planner
 * to provide a dedicated slash command interface.
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get quarter argument (default to current quarter in Sydney timezone)
function getSydneyQuarterString(date = new Date()) {
    const sydneyDate = new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    const year = sydneyDate.getFullYear();
    const month = sydneyDate.getMonth() + 1;
    const quarter = Math.ceil(month / 3);
    return `${year}-Q${quarter}`;
}

const quarterArg = process.argv[2] || getSydneyQuarterString();
const fractalPlannerPath = path.join(__dirname, 'fractal-planner-llm.cjs');

console.log(`🧹 Clearing quarterly plan for ${quarterArg}...`);

// Execute the clear-quarter command from fractal planner
exec(`node "${fractalPlannerPath}" clear-quarter ${quarterArg}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error clearing quarterly plan: ${error.message}`);
        process.exit(1);
    }
    
    if (stderr) {
        console.error(`⚠️  Warning: ${stderr}`);
    }
    
    console.log(stdout);
    console.log(`✅ Quarterly plan cleared successfully for ${quarterArg}`);
    console.log(`💡 Use '/plan-quarter' to create a new plan`);
});