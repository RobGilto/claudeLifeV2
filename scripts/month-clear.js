#!/usr/bin/env node

/**
 * Month Clear - Slash Command
 * Purpose: Remove monthly plan and associated files for fresh start
 * Usage: node scripts/month-clear.js [month]
 * Dependencies: fractal-planner-llm.cjs
 * 
 * This script wraps the clear-month functionality from the fractal planner
 * to provide a dedicated slash command interface.
 */

import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get month argument (default to current month in Sydney timezone)
function getSydneyMonthString(date = new Date()) {
    const sydneyDate = new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    const year = sydneyDate.getFullYear();
    const month = sydneyDate.getMonth() + 1;
    return `${year}-${String(month).padStart(2, '0')}`;
}

const monthArg = process.argv[2] || getSydneyMonthString();
const fractalPlannerPath = path.join(__dirname, 'fractal-planner-llm.cjs');

console.log(`🧹 Clearing monthly plan for ${monthArg}...`);

// Execute the clear-month command from fractal planner
exec(`node "${fractalPlannerPath}" clear-month ${monthArg}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Error clearing monthly plan: ${error.message}`);
        process.exit(1);
    }
    
    if (stderr) {
        console.error(`⚠️  Warning: ${stderr}`);
    }
    
    console.log(stdout);
    console.log(`✅ Monthly plan cleared successfully for ${monthArg}`);
    console.log(`💡 Use '/plan-month' to create a new plan`);
});