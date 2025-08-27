#!/usr/bin/env node

/**
 * Add Newsletter URL Script
 * Purpose: Add competitor newsletter URLs to research list
 * Usage: node scripts/add-newsletter.js <url>
 * Dependencies: None (uses native Node.js modules)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const COMPETITORS_FILE = path.join(__dirname, '..', 'newsletter', 'competitors.md');
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, `add-newsletter-${new Date().toISOString().split('T')[0]}.log`);

// Ensure directories exist
if (!fs.existsSync(path.dirname(COMPETITORS_FILE))) {
    fs.mkdirSync(path.dirname(COMPETITORS_FILE), { recursive: true });
}
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Logging function
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(LOG_FILE, logMessage);
}

// Validate URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Main function
function addNewsletter(url) {
    // Validate input
    if (!url) {
        log('ERROR: No URL provided');
        console.log('Usage: node scripts/add-newsletter.js <url>');
        process.exit(1);
    }

    if (!isValidUrl(url)) {
        log(`ERROR: Invalid URL format: ${url}`);
        process.exit(1);
    }

    // Initialize file if it doesn't exist
    if (!fs.existsSync(COMPETITORS_FILE)) {
        const template = `# Newsletter Competitors

## AI/Tech Newsletters to Research

### Primary Competitors

### Topics of Interest
- AI Engineering
- Career Transitions
- Productivity with ADD
- Technical Learning
- Software Development

### Your Newsletter Focus
- Technical career transition insights
- ADD-friendly learning strategies
- AI engineering fundamentals
`;
        fs.writeFileSync(COMPETITORS_FILE, template);
        log('Created new competitors file');
    }

    // Read current file
    let content = fs.readFileSync(COMPETITORS_FILE, 'utf8');
    
    // Check if URL already exists
    if (content.includes(url)) {
        log(`URL already exists: ${url}`);
        console.log('✓ URL already in list');
        return;
    }

    // Find the Primary Competitors section and add URL
    const lines = content.split('\n');
    let inserted = false;
    let competitorSectionIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('### Primary Competitors')) {
            competitorSectionIndex = i;
            // Find the next empty line or next section
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].trim() === '') {
                    // Insert before the empty line
                    lines.splice(j, 0, `- ${url}`);
                    inserted = true;
                    break;
                } else if (lines[j].startsWith('###')) {
                    // Insert before the next section
                    lines.splice(j, 0, `- ${url}`, '');
                    inserted = true;
                    break;
                } else if (lines[j].startsWith('- ') && !lines[j].substring(2).trim()) {
                    // Replace empty bullet point
                    lines[j] = `- ${url}`;
                    inserted = true;
                    break;
                }
            }
            
            // If no good insertion point found, add after the header
            if (!inserted && competitorSectionIndex > -1) {
                lines.splice(competitorSectionIndex + 1, 0, `- ${url}`);
                inserted = true;
            }
            break;
        }
    }

    if (!inserted) {
        log('ERROR: Could not find Primary Competitors section');
        process.exit(1);
    }

    // Write back to file
    content = lines.join('\n');
    fs.writeFileSync(COMPETITORS_FILE, content);
    
    // Count total URLs
    const urlCount = (content.match(/https?:\/\/[^\s\)]+/g) || []).length;
    
    log(`Successfully added: ${url}`);
    console.log(`✓ Added newsletter URL`);
    console.log(`Total newsletters in list: ${urlCount}`);
}

// Run the script
const url = process.argv[2];
addNewsletter(url);