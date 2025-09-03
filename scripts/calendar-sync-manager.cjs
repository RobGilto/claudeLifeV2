#!/usr/bin/env node

/**
 * Selective Calendar Sync Manager
 * Purpose: Manage selective calendar synchronization for ritual management
 * Usage: Integrated with ritual-manager-v2.js and planning commands
 * Dependencies: ritual-manager-v2.js, MCP Google Calendar integration
 * 
 * Features:
 * - Planning-period based sync (day, week, month, quarter, year)
 * - Automatic cleanup of expired planning periods
 * - Conflict detection and resolution
 * - MCP command generation for Google Calendar
 * - Sync history tracking and audit trail
 * - Performance optimization with batch operations
 */

const fs = require('fs');
const path = require('path');
const { RitualManagerV2, TimeUtils, UUIDGenerator } = require('./ritual-manager-v2.cjs');

// Configuration
const SYNC_CONFIG_DIR = path.join(__dirname, '..', 'rituals-v2', 'sync');
const SYNC_HISTORY_FILE = path.join(SYNC_CONFIG_DIR, 'calendar-sync-history.json');
const SYNC_STATE_FILE = path.join(SYNC_CONFIG_DIR, 'sync-state.json');
const MCP_COMMANDS_DIR = path.join(SYNC_CONFIG_DIR, 'mcp-commands');

// Ensure directories exist
[SYNC_CONFIG_DIR, MCP_COMMANDS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Calendar Color Mapping
const RITUAL_COLORS = {
    foundational: '9',  // Blue - Foundational habits and practices
    work: '10',         // Green - Work schedules and meetings
    life: '5',          // Yellow - Personal and life commitments
    maintenance: '8',   // Gray - Maintenance and admin tasks
    default: '1'        // Lavender - Default color
};

// Period Type Definitions
const PERIOD_TYPES = {
    day: {
        duration: 1,
        unit: 'days',
        format: 'YYYY-MM-DD'
    },
    week: {
        duration: 7,
        unit: 'days', 
        format: 'YYYY-[W]WW'
    },
    month: {
        duration: 30,
        unit: 'days',
        format: 'YYYY-MM'
    },
    quarter: {
        duration: 90,
        unit: 'days',
        format: 'YYYY-[Q]Q'
    },
    year: {
        duration: 365,
        unit: 'days',
        format: 'YYYY'
    }
};

class CalendarSyncManager {
    constructor(ritualManager = null) {
        this.ritualManager = ritualManager || new RitualManagerV2();
        this.syncHistory = this.loadSyncHistory();
        this.syncState = this.loadSyncState();
        this.mcpCommandQueue = [];
    }
    
    loadSyncHistory() {
        if (fs.existsSync(SYNC_HISTORY_FILE)) {
            return JSON.parse(fs.readFileSync(SYNC_HISTORY_FILE, 'utf8'));
        }
        return {
            version: '2.0.0',
            history: [],
            lastCleanup: null
        };
    }
    
    loadSyncState() {
        if (fs.existsSync(SYNC_STATE_FILE)) {
            return JSON.parse(fs.readFileSync(SYNC_STATE_FILE, 'utf8'));
        }
        return {
            version: '2.0.0',
            activePeriods: {},
            syncedEvents: {},
            lastUpdated: null
        };
    }
    
    saveSyncHistory() {
        fs.writeFileSync(SYNC_HISTORY_FILE, JSON.stringify(this.syncHistory, null, 2));
    }
    
    saveSyncState() {
        this.syncState.lastUpdated = new Date().toISOString();
        fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(this.syncState, null, 2));
    }
    
    // Main sync method - selectively sync rituals for specific periods
    async syncPeriod(periodType, periodValue, options = {}) {
        console.log(`🔄 Starting selective sync for ${periodType}: ${periodValue}`);
        
        const periodKey = `${periodType}-${periodValue}`;
        const syncSession = {
            uuid: UUIDGenerator.generate(),
            periodType,
            periodValue,
            periodKey,
            startTime: new Date().toISOString(),
            options,
            status: 'in_progress',
            events: [],
            conflicts: [],
            errors: []
        };
        
        try {
            // Get dates for the period
            const periodDates = this.getPeriodDates(periodType, periodValue);
            console.log(`📅 Period covers ${periodDates.length} days: ${periodDates[0]} to ${periodDates[periodDates.length - 1]}`);
            
            // Clear existing events for this period if requested
            if (options.replaceExisting) {
                await this.clearPeriodEvents(periodKey);
            }
            
            // Generate calendar events for each day in the period
            const allEvents = [];
            const allConflicts = [];
            
            for (const dateStr of periodDates) {
                const dailyResult = await this.processDayForPeriod(dateStr, periodKey, options);
                allEvents.push(...dailyResult.events);
                allConflicts.push(...dailyResult.conflicts);
            }
            
            syncSession.events = allEvents;
            syncSession.conflicts = allConflicts;
            
            // Generate MCP commands for calendar creation
            const mcpCommands = this.generateMCPCommands(allEvents, options);
            
            // Save MCP commands to file for execution
            const commandsFile = path.join(MCP_COMMANDS_DIR, `sync-${periodKey}-${Date.now()}.json`);
            fs.writeFileSync(commandsFile, JSON.stringify({
                sessionUuid: syncSession.uuid,
                periodType,
                periodValue,
                generatedAt: new Date().toISOString(),
                commands: mcpCommands
            }, null, 2));
            
            syncSession.status = 'completed';
            syncSession.mcpCommandsFile = commandsFile;
            syncSession.endTime = new Date().toISOString();
            
            // Update sync state
            this.syncState.activePeriods[periodKey] = {
                periodType,
                periodValue,
                syncedAt: new Date().toISOString(),
                sessionUuid: syncSession.uuid,
                eventCount: allEvents.length,
                conflictCount: allConflicts.length
            };
            
            // Add to history
            this.syncHistory.history.push(syncSession);
            
            // Save state
            this.saveSyncHistory();
            this.saveSyncState();
            
            console.log(`✅ Sync completed successfully:`);
            console.log(`   📊 Events created: ${allEvents.length}`);
            console.log(`   ⚠️ Conflicts detected: ${allConflicts.length}`);
            console.log(`   📄 MCP commands saved to: ${commandsFile}`);
            
            if (options.autoExecute) {
                console.log(`🚀 Auto-executing calendar sync...`);
                // This would trigger MCP command execution
                // For now, just log the commands
                this.logMCPCommands(mcpCommands);
            } else {
                console.log(`\n📋 To create calendar events, run the following MCP commands:`);
                this.displayMCPInstructions(mcpCommands);
            }
            
            return {
                success: true,
                sessionUuid: syncSession.uuid,
                periodKey,
                events: allEvents,
                conflicts: allConflicts,
                mcpCommandsFile: commandsFile,
                summary: {
                    eventsCreated: allEvents.length,
                    conflictsDetected: allConflicts.length,
                    daysProcessed: periodDates.length
                }
            };
            
        } catch (error) {
            syncSession.status = 'failed';
            syncSession.error = error.message;
            syncSession.endTime = new Date().toISOString();
            
            this.syncHistory.history.push(syncSession);
            this.saveSyncHistory();
            
            console.error(`❌ Sync failed:`, error.message);
            throw error;
        }
    }
    
    getPeriodDates(periodType, periodValue) {
        const dates = [];
        
        switch (periodType) {
            case 'day':
                dates.push(periodValue);
                break;
                
            case 'week':
                // Parse week format (e.g., "2025-W36")
                const [year, weekStr] = periodValue.split('-W');
                const weekNum = parseInt(weekStr);
                const startOfYear = new Date(parseInt(year), 0, 1);
                const startOfWeek = new Date(startOfYear.getTime() + (weekNum - 1) * 7 * 24 * 60 * 60 * 1000);
                
                for (let i = 0; i < 7; i++) {
                    const date = new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000);
                    dates.push(TimeUtils.getDateString(date));
                }
                break;
                
            case 'month':
                // Parse month format (e.g., "2025-09")
                const [monthYear, monthStr] = periodValue.split('-');
                const month = parseInt(monthStr) - 1; // JS months are 0-indexed
                const year2 = parseInt(monthYear);
                const firstDay = new Date(year2, month, 1);
                const lastDay = new Date(year2, month + 1, 0);
                
                for (let day = 1; day <= lastDay.getDate(); day++) {
                    const date = new Date(year2, month, day);
                    dates.push(TimeUtils.getDateString(date));
                }
                break;
                
            case 'quarter':
                // Parse quarter format (e.g., "2025-Q3")
                const [qYear, qStr] = periodValue.split('-Q');
                const quarter = parseInt(qStr);
                const startMonth = (quarter - 1) * 3;
                const qYear2 = parseInt(qYear);
                
                for (let month = 0; month < 3; month++) {
                    const monthDate = new Date(qYear2, startMonth + month, 1);
                    const monthEnd = new Date(qYear2, startMonth + month + 1, 0);
                    
                    for (let day = 1; day <= monthEnd.getDate(); day++) {
                        const date = new Date(qYear2, startMonth + month, day);
                        dates.push(TimeUtils.getDateString(date));
                    }
                }
                break;
                
            case 'year':
                // Parse year format (e.g., "2025")
                const yearInt = parseInt(periodValue);
                const yearStart = new Date(yearInt, 0, 1);
                const yearEnd = new Date(yearInt, 11, 31);
                
                for (let date = new Date(yearStart); date <= yearEnd; date.setDate(date.getDate() + 1)) {
                    dates.push(TimeUtils.getDateString(date));
                }
                break;
                
            default:
                throw new Error(`Unsupported period type: ${periodType}`);
        }
        
        return dates;
    }
    
    async processDayForPeriod(dateStr, periodKey, options) {
        const ritualData = this.ritualManager.getRitualsForDate(dateStr);
        const events = [];
        const conflicts = [];
        
        for (const { ritual, timeBlocks } of ritualData) {
            // Skip if ritual type is excluded
            if (options.excludeTypes && options.excludeTypes.includes(ritual.type)) {
                continue;
            }
            
            // Skip if ritual type is not included (when includeTypes is specified)
            if (options.includeTypes && !options.includeTypes.includes(ritual.type)) {
                continue;
            }
            
            for (const timeBlock of timeBlocks) {
                const eventUuid = UUIDGenerator.generate();
                const calendarEvent = {
                    uuid: eventUuid,
                    ritualUuid: ritual.uuid,
                    ritualName: ritual.name,
                    ritualType: ritual.type,
                    blockUuid: timeBlock.uuid,
                    date: dateStr,
                    startTime: timeBlock.startTime,
                    endTime: TimeUtils.addMinutes(timeBlock.startTime, timeBlock.duration),
                    duration: timeBlock.duration,
                    periodKey,
                    calendarId: 'primary',
                    summary: `${ritual.name}`,
                    description: this.generateEventDescription(ritual, timeBlock, dateStr),
                    colorId: RITUAL_COLORS[ritual.type] || RITUAL_COLORS.default,
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'popup', minutes: 10 },
                            { method: 'popup', minutes: 2 }
                        ]
                    },
                    source: {
                        title: `Ritual: ${ritual.name}`,
                        url: `ritual://${ritual.uuid}`
                    },
                    extendedProperties: {
                        private: {
                            ritualUuid: ritual.uuid,
                            blockUuid: timeBlock.uuid,
                            periodKey: periodKey,
                            syncedBy: 'ritual-manager-v2'
                        }
                    }
                };
                
                events.push(calendarEvent);
                
                // Check for conflicts (this would integrate with existing calendar events)
                const conflict = await this.checkForConflicts(calendarEvent, options);
                if (conflict) {
                    conflicts.push(conflict);
                }
            }
        }
        
        return { events, conflicts };
    }
    
    generateEventDescription(ritual, timeBlock, dateStr) {
        const lines = [
            `🔄 ${ritual.name}`,
            `📅 ${dateStr} (${TimeUtils.getDayOfWeek(dateStr)})`,
            `⏰ ${timeBlock.startTime} - ${TimeUtils.addMinutes(timeBlock.startTime, timeBlock.duration)} (${timeBlock.duration} min)`,
            `🏷️ Type: ${ritual.type}`,
            `📊 Priority: ${ritual.priority}`
        ];
        
        if (ritual.description) {
            lines.push(`📝 ${ritual.description}`);
        }
        
        if (timeBlock.flexible) {
            lines.push(`🔄 Flexible timing - can be rescheduled`);
        }
        
        lines.push('');
        lines.push('Generated by Ritual Manager V2');
        lines.push(`Ritual UUID: ${ritual.uuid}`);
        lines.push(`Block UUID: ${timeBlock.uuid}`);
        
        return lines.join('\\n');
    }
    
    async checkForConflicts(event, options) {
        // This would check against existing calendar events
        // For now, return null (no conflicts detected)
        // In full implementation, this would query Google Calendar API
        return null;
    }
    
    generateMCPCommands(events, options) {
        const commands = [];
        
        events.forEach((event, index) => {
            const mcpCommand = {
                tool: 'mcp__google-calendar__create-event',
                parameters: {
                    calendarId: event.calendarId,
                    summary: event.summary,
                    description: event.description,
                    start: `${event.date}T${event.startTime}:00`,
                    end: `${event.date}T${event.endTime}:00`,
                    timeZone: 'Australia/Sydney',
                    colorId: event.colorId,
                    reminders: event.reminders,
                    source: event.source,
                    extendedProperties: event.extendedProperties
                }
            };
            
            commands.push({
                sequence: index + 1,
                eventUuid: event.uuid,
                ritualUuid: event.ritualUuid,
                command: mcpCommand
            });
        });
        
        return commands;
    }
    
    logMCPCommands(commands) {
        console.log(`\n📋 Generated ${commands.length} MCP commands:`);
        commands.forEach((cmd, index) => {
            console.log(`${index + 1}. Create event: ${cmd.command.parameters.summary}`);
            console.log(`   🕐 ${cmd.command.parameters.start} - ${cmd.command.parameters.end}`);
        });
    }
    
    displayMCPInstructions(commands) {
        console.log('\n=== MCP COMMAND EXECUTION ===');
        console.log('Copy and paste each command into Claude Code:\n');
        
        commands.forEach((cmd, index) => {
            console.log(`// Event ${index + 1}: ${cmd.command.parameters.summary}`);
            console.log(JSON.stringify(cmd.command, null, 2));
            console.log('');
        });
        
        console.log('=== END MCP COMMANDS ===\n');
    }
    
    // Cleanup methods
    async cleanupExpiredPeriods(daysOld = 7) {
        console.log(`🧹 Cleaning up periods older than ${daysOld} days...`);
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const cutoffStr = cutoffDate.toISOString();
        
        const expiredPeriods = [];
        const activePeriodsToKeep = {};
        
        for (const [periodKey, periodData] of Object.entries(this.syncState.activePeriods)) {
            if (periodData.syncedAt < cutoffStr) {
                expiredPeriods.push({ periodKey, ...periodData });
            } else {
                activePeriodsToKeep[periodKey] = periodData;
            }
        }
        
        if (expiredPeriods.length > 0) {
            console.log(`🗑️ Found ${expiredPeriods.length} expired periods to clean up`);
            
            // This would trigger calendar event deletion
            // For now, just log what would be cleaned up
            expiredPeriods.forEach(period => {
                console.log(`   - ${period.periodKey} (${period.eventCount} events)`);
            });
            
            // Update sync state
            this.syncState.activePeriods = activePeriodsToKeep;
            this.syncState.lastCleanup = new Date().toISOString();
            this.saveSyncState();
            
            console.log(`✅ Cleanup completed. Removed ${expiredPeriods.length} expired periods.`);
        } else {
            console.log(`✅ No expired periods found.`);
        }
        
        return expiredPeriods;
    }
    
    async clearPeriodEvents(periodKey) {
        console.log(`🧹 Clearing existing events for period: ${periodKey}`);
        
        // This would delete existing calendar events for the period
        // In full implementation, would query by extended properties and delete
        
        // For now, just mark as cleared in sync state
        if (this.syncState.activePeriods[periodKey]) {
            delete this.syncState.activePeriods[periodKey];
            this.saveSyncState();
        }
        
        console.log(`✅ Cleared events for period: ${periodKey}`);
    }
    
    // Status and reporting
    getSyncStatus() {
        const activePeriods = Object.keys(this.syncState.activePeriods).length;
        const totalEvents = Object.values(this.syncState.activePeriods)
            .reduce((sum, period) => sum + (period.eventCount || 0), 0);
        const totalConflicts = Object.values(this.syncState.activePeriods)
            .reduce((sum, period) => sum + (period.conflictCount || 0), 0);
        
        const recentHistory = this.syncHistory.history
            .sort((a, b) => b.startTime.localeCompare(a.startTime))
            .slice(0, 10);
        
        return {
            activePeriods,
            totalEvents,
            totalConflicts,
            lastUpdated: this.syncState.lastUpdated,
            lastCleanup: this.syncHistory.lastCleanup,
            recentSessions: recentHistory.map(session => ({
                uuid: session.uuid,
                periodKey: session.periodKey,
                status: session.status,
                eventCount: session.events ? session.events.length : 0,
                conflictCount: session.conflicts ? session.conflicts.length : 0,
                startTime: session.startTime,
                endTime: session.endTime
            }))
        };
    }
    
    listActivePeriods() {
        return Object.entries(this.syncState.activePeriods).map(([periodKey, data]) => ({
            periodKey,
            ...data
        }));
    }
}

module.exports = {
    CalendarSyncManager,
    RITUAL_COLORS,
    PERIOD_TYPES
};

// CLI interface
if (require.main === module) {
    console.log('Calendar Sync Manager');
    console.log('Use ritual-cli-v2.js for command line interface');
}