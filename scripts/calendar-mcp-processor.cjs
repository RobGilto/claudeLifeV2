#!/usr/bin/env node

/**
 * Calendar MCP Processor
 * Purpose: Process calendar sync files and create Google Calendar events via MCP
 * Usage: node scripts/calendar-mcp-processor.cjs [sync-file]
 * Dependencies: fs, path
 * 
 * This script is designed to be called by Claude Code with MCP access
 * to actually create the Google Calendar events prepared by fractal-planner
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PLANNING_DIR = path.join(__dirname, '..', 'planning');
const CALENDAR_SYNC_DIR = path.join(PLANNING_DIR, 'calendar-sync');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Sydney timezone utilities
function getSydneyDate(date = new Date()) {
    return new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
}

function formatSydneyDateString(date = new Date()) {
    const sydneyDate = new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    return sydneyDate.toISOString().split('T')[0];
}

class CalendarMCPProcessor {
    constructor() {
        this.processed = 0;
        this.failed = 0;
        this.errors = [];
    }

    async processSyncFiles(specificFile = null) {
        console.log('📅 Calendar MCP Processor Starting...');
        
        if (!fs.existsSync(CALENDAR_SYNC_DIR)) {
            console.log('❌ No calendar sync directory found');
            return;
        }

        const files = specificFile ? 
            [specificFile] : 
            fs.readdirSync(CALENDAR_SYNC_DIR)
                .filter(f => f.endsWith('.json') && f.includes('auto-sync'))
                .filter(f => {
                    const filePath = path.join(CALENDAR_SYNC_DIR, f);
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    return data.status === 'ready-for-mcp';
                });

        if (files.length === 0) {
            console.log('ℹ️ No sync files ready for processing');
            return;
        }

        console.log(`🔄 Processing ${files.length} sync file(s)...`);

        for (const file of files) {
            await this.processSyncFile(path.join(CALENDAR_SYNC_DIR, file));
        }

        this.showSummary();
    }

    async processSyncFile(filePath) {
        try {
            const syncData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const fileName = path.basename(filePath);
            
            console.log(`\n📂 Processing: ${fileName}`);
            console.log(`📅 Date: ${syncData.date}`);
            console.log(`📊 Events: ${syncData.events.length}`);

            // Output the MCP calendar creation commands that Claude Code should execute
            console.log('\n🔧 MCP Commands to Execute:');
            console.log('// Copy and paste these commands into Claude Code for execution\n');

            for (let i = 0; i < syncData.events.length; i++) {
                const event = syncData.events[i];
                
                console.log(`// Event ${i + 1}: ${event.summary}`);
                console.log(`mcp__google-calendar__create_event({`);
                console.log(`  "calendarId": "${event.calendarId}",`);
                console.log(`  "summary": "${event.summary}",`);
                console.log(`  "start": "${event.start}",`);
                console.log(`  "end": "${event.end}",`);
                console.log(`  "timeZone": "${event.timeZone}",`);
                console.log(`  "description": "${event.description}",`);
                console.log(`  "colorId": "${event.colorId}",`);
                console.log(`  "reminders": ${JSON.stringify(event.reminders)}`);
                console.log(`})\n`);
            }

            // Update sync file status
            syncData.status = 'processed';
            syncData.processedAt = getSydneyDate().toISOString();
            fs.writeFileSync(filePath, JSON.stringify(syncData, null, 2));

            this.processed++;
            console.log(`✅ Sync file processed: ${fileName}`);

        } catch (error) {
            this.failed++;
            this.errors.push({ file: path.basename(filePath), error: error.message });
            console.log(`❌ Failed to process ${path.basename(filePath)}: ${error.message}`);
        }
    }

    showSummary() {
        console.log('\n📊 Processing Summary:');
        console.log(`  ✅ Processed: ${this.processed}`);
        console.log(`  ❌ Failed: ${this.failed}`);
        
        if (this.errors.length > 0) {
            console.log('\n⚠️ Errors:');
            this.errors.forEach(err => {
                console.log(`  • ${err.file}: ${err.error}`);
            });
        }

        if (this.processed > 0) {
            console.log('\n💡 Next Steps:');
            console.log('  1. Copy the MCP commands above');
            console.log('  2. Run them in Claude Code with Google Calendar MCP access');
            console.log('  3. Verify events were created in Google Calendar');
        }
    }

    async listPendingFiles() {
        console.log('📋 Pending Calendar Sync Files:');
        
        if (!fs.existsSync(CALENDAR_SYNC_DIR)) {
            console.log('❌ No calendar sync directory found');
            return;
        }

        const files = fs.readdirSync(CALENDAR_SYNC_DIR)
            .filter(f => f.endsWith('.json'))
            .map(f => {
                const filePath = path.join(CALENDAR_SYNC_DIR, f);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return { file: f, data };
            });

        if (files.length === 0) {
            console.log('ℹ️ No sync files found');
            return;
        }

        files.forEach(({ file, data }) => {
            const statusIcon = data.status === 'ready-for-mcp' ? '🔄' : 
                              data.status === 'processed' ? '✅' : '❓';
            console.log(`  ${statusIcon} ${file} - ${data.date} (${data.events.length} events) [${data.status}]`);
        });

        const pending = files.filter(f => f.data.status === 'ready-for-mcp').length;
        console.log(`\n📊 Total: ${files.length} files, ${pending} pending`);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'process';
    
    const processor = new CalendarMCPProcessor();
    
    switch (command) {
        case 'process':
            await processor.processSyncFiles(args[1]);
            break;
        case 'list':
            await processor.listPendingFiles();
            break;
        default:
            console.log(`
📅 Calendar MCP Processor

Commands:
  process [file]  - Process sync files and generate MCP commands
  list           - List pending sync files

Examples:
  node scripts/calendar-mcp-processor.cjs process
  node scripts/calendar-mcp-processor.cjs list
  node scripts/calendar-mcp-processor.cjs process auto-sync-2025-08-28-123456.json
            `);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
}

module.exports = { CalendarMCPProcessor };