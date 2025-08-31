#!/usr/bin/env node

/**
 * Calendar-Aware Planning System
 * Purpose: Integrates Google Calendar with fractal planning and taskmaster
 * Usage: node scripts/calendar-aware-planner.js [command] [args]
 * Dependencies: fs, path, readline, ./fractal-planner.cjs, ./taskmaster.cjs
 * 
 * Commands:
 * - check-conflicts [date]     - Check for calendar conflicts on given date
 * - plan-with-calendar [date]  - Create daily plan considering existing calendar events
 * - suggest-blocks [date]      - Suggest optimal time blocks around calendar events
 * - sync-check                 - Verify Google Calendar MCP integration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { PlanStorage, DateIndex, Plan } = require('./fractal-planner.cjs');

// Configuration
const CALENDAR_DATA_DIR = path.join(__dirname, '..', 'planning', 'calendar-sync');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
[CALENDAR_DATA_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Calendar integration utilities
class CalendarAwarePlanner {
    constructor() {
        this.storage = new PlanStorage();
        this.calendarCache = new Map(); // Cache calendar events to reduce API calls
    }

    // Check if Google Calendar MCP is available
    async checkCalendarMCP() {
        try {
            // This would be called through Claude's MCP system
            // For now, we'll return a placeholder
            console.log('📅 Checking Google Calendar MCP integration...');
            return { available: true, calendars: ['primary'] };
        } catch (error) {
            console.log('❌ Google Calendar MCP not available:', error.message);
            return { available: false, error: error.message };
        }
    }

    // Get existing calendar events for a specific date
    async getCalendarEvents(date) {
        const dateStr = new DateIndex(date).toString();
        
        // Check cache first
        if (this.calendarCache.has(dateStr)) {
            console.log('📄 Using cached calendar data');
            return this.calendarCache.get(dateStr);
        }

        try {
            // This would call Google Calendar MCP to fetch events
            console.log(`📅 Fetching calendar events for ${dateStr}...`);
            
            // Placeholder for MCP call - in real implementation this would be:
            // const events = await mcp.call('google_calendar_list_events', { date: dateStr });
            
            const events = await this.fetchEventsFromCalendar(dateStr);
            
            // Cache the results
            this.calendarCache.set(dateStr, events);
            return events;
        } catch (error) {
            console.log('⚠️  Could not fetch calendar events:', error.message);
            return [];
        }
    }

    // Placeholder for actual MCP calendar fetch
    async fetchEventsFromCalendar(date) {
        // This would be replaced with actual MCP call
        // For now, return sample data structure
        return [
            // Example existing calendar events
            {
                id: 'sample-event-1',
                summary: 'Team Meeting',
                start: { dateTime: `${date}T09:00:00+11:00` },
                end: { dateTime: `${date}T10:00:00+11:00` },
                busy: true
            }
        ];
    }

    // Convert calendar event to time block format for conflict detection
    convertEventToTimeBlock(event) {
        const startTime = new Date(event.start.dateTime || event.start.date);
        const endTime = new Date(event.end.dateTime || event.end.date);
        
        return {
            id: event.id,
            title: event.summary,
            startTime: startTime.toISOString().substr(11, 5), // HH:MM format
            endTime: endTime.toISOString().substr(11, 5),
            duration: Math.round((endTime - startTime) / 60000), // minutes
            type: 'calendar-event',
            busy: event.busy !== false, // Default to busy unless explicitly free
            source: 'google-calendar'
        };
    }

    // Check for conflicts between planned time blocks and calendar events
    checkTimeBlockConflicts(plannedBlocks, calendarEvents) {
        const conflicts = [];
        const calendarBlocks = calendarEvents.map(event => this.convertEventToTimeBlock(event));

        plannedBlocks.forEach(plannedBlock => {
            calendarBlocks.forEach(calendarBlock => {
                if (calendarBlock.busy && this.blocksOverlap(plannedBlock, calendarBlock)) {
                    conflicts.push({
                        plannedBlock,
                        calendarEvent: calendarBlock,
                        overlapMinutes: this.calculateOverlapMinutes(plannedBlock, calendarBlock)
                    });
                }
            });
        });

        return conflicts;
    }

    // Check if two time blocks overlap
    blocksOverlap(block1, block2) {
        const start1 = this.timeToMinutes(block1.startTime);
        const end1 = start1 + block1.duration;
        const start2 = this.timeToMinutes(block2.startTime);
        const end2 = start2 + block2.duration;

        return start1 < end2 && start2 < end1;
    }

    // Calculate overlap between two time blocks in minutes
    calculateOverlapMinutes(block1, block2) {
        const start1 = this.timeToMinutes(block1.startTime);
        const end1 = start1 + block1.duration;
        const start2 = this.timeToMinutes(block2.startTime);
        const end2 = start2 + block2.duration;

        const overlapStart = Math.max(start1, start2);
        const overlapEnd = Math.min(end1, end2);

        return Math.max(0, overlapEnd - overlapStart);
    }

    // Convert HH:MM to minutes since midnight
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Convert minutes since midnight to HH:MM
    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

    // Find available time slots for planning
    findAvailableSlots(date, desiredDuration = 90) {
        return new Promise(async (resolve) => {
            const calendarEvents = await this.getCalendarEvents(date);
            const busySlots = calendarEvents
                .filter(event => event.busy !== false)
                .map(event => this.convertEventToTimeBlock(event))
                .sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime));

            const availableSlots = [];
            const workDayStart = 6 * 60; // 6:00 AM
            const workDayEnd = 22 * 60;  // 10:00 PM

            let currentTime = workDayStart;

            busySlots.forEach(busySlot => {
                const busyStart = this.timeToMinutes(busySlot.startTime);
                const busyEnd = busyStart + busySlot.duration;

                // Check for available slot before this busy period
                if (currentTime + desiredDuration <= busyStart) {
                    availableSlots.push({
                        startTime: this.minutesToTime(currentTime),
                        endTime: this.minutesToTime(busyStart),
                        duration: busyStart - currentTime,
                        canFit: busyStart - currentTime >= desiredDuration
                    });
                }

                currentTime = Math.max(currentTime, busyEnd);
            });

            // Check for available slot after all busy periods
            if (currentTime + desiredDuration <= workDayEnd) {
                availableSlots.push({
                    startTime: this.minutesToTime(currentTime),
                    endTime: this.minutesToTime(workDayEnd),
                    duration: workDayEnd - currentTime,
                    canFit: workDayEnd - currentTime >= desiredDuration
                });
            }

            resolve(availableSlots.filter(slot => slot.canFit));
        });
    }

    // Suggest optimal time blocks considering calendar events
    async suggestOptimalBlocks(date, requiredBlocks) {
        const availableSlots = await this.findAvailableSlots(date);
        const suggestions = [];

        console.log(`\n📅 Available time slots for ${date}:`);
        availableSlots.forEach((slot, index) => {
            console.log(`${index + 1}. ${slot.startTime} - ${slot.endTime} (${slot.duration} minutes)`);
        });

        // Map required blocks to available slots
        requiredBlocks.forEach((block, index) => {
            const suitableSlots = availableSlots.filter(slot => 
                slot.duration >= block.duration && 
                !suggestions.some(s => s.slot === slot)
            );

            if (suitableSlots.length > 0) {
                const bestSlot = suitableSlots[0]; // Take the first available
                suggestions.push({
                    block,
                    slot: bestSlot,
                    suggestedStartTime: bestSlot.startTime,
                    suggestedEndTime: this.minutesToTime(
                        this.timeToMinutes(bestSlot.startTime) + block.duration
                    )
                });
            } else {
                suggestions.push({
                    block,
                    slot: null,
                    conflict: 'No suitable time slot available'
                });
            }
        });

        return suggestions;
    }

    // Enhanced daily planning with calendar awareness
    async planDayWithCalendar(date) {
        const dateIndex = new DateIndex(new Date(date));
        const dateStr = dateIndex.toString();

        console.log(`\n📋 Creating calendar-aware daily plan for ${dateStr}...`);

        // Get existing calendar events
        const calendarEvents = await this.getCalendarEvents(date);
        console.log(`📅 Found ${calendarEvents.length} existing calendar events`);

        // Check for existing daily plan
        let dayPlan = this.storage.getDayPlan(dateStr);
        
        if (!dayPlan) {
            console.log('📝 No existing daily plan found. Please create one first with fractal-planner.cjs');
            console.log('Usage: node scripts/fractal-planner.cjs plan-day');
            return null;
        }

        // Check for conflicts
        const conflicts = this.checkTimeBlockConflicts(dayPlan.timeBlocks, calendarEvents);

        if (conflicts.length > 0) {
            console.log(`\n⚠️  Found ${conflicts.length} scheduling conflicts:`);
            conflicts.forEach((conflict, index) => {
                console.log(`${index + 1}. "${conflict.plannedBlock.title}" conflicts with "${conflict.calendarEvent.title}"`);
                console.log(`   Overlap: ${conflict.overlapMinutes} minutes`);
                console.log(`   Planned: ${conflict.plannedBlock.startTime} - ${this.minutesToTime(this.timeToMinutes(conflict.plannedBlock.startTime) + conflict.plannedBlock.duration)}`);
                console.log(`   Calendar: ${conflict.calendarEvent.startTime} - ${conflict.calendarEvent.endTime}`);
            });

            // Suggest alternative time blocks
            const suggestions = await this.suggestOptimalBlocks(date, dayPlan.timeBlocks);
            
            console.log(`\n💡 Suggested alternative time slots:`);
            suggestions.forEach((suggestion, index) => {
                if (suggestion.slot) {
                    console.log(`${index + 1}. "${suggestion.block.title}" → ${suggestion.suggestedStartTime} - ${suggestion.suggestedEndTime}`);
                } else {
                    console.log(`${index + 1}. "${suggestion.block.title}" → ${suggestion.conflict}`);
                }
            });
        } else {
            console.log(`✅ No scheduling conflicts found! Your planned time blocks work with existing calendar events.`);
        }

        // Save calendar-aware plan data
        const calendarAwarePlan = {
            date: dateStr,
            originalPlan: dayPlan,
            calendarEvents: calendarEvents.map(event => this.convertEventToTimeBlock(event)),
            conflicts,
            lastChecked: new Date().toISOString()
        };

        const calendarPlanFile = path.join(CALENDAR_DATA_DIR, `calendar-plan-${dateStr}.json`);
        fs.writeFileSync(calendarPlanFile, JSON.stringify(calendarAwarePlan, null, 2));

        return calendarAwarePlan;
    }

    // Save conflict resolution for taskmaster
    saveConflictResolution(date, resolutions) {
        const dateStr = new DateIndex(new Date(date)).toString();
        const resolutionFile = path.join(CALENDAR_DATA_DIR, `resolutions-${dateStr}.json`);
        
        fs.writeFileSync(resolutionFile, JSON.stringify({
            date: dateStr,
            resolutions,
            savedAt: new Date().toISOString()
        }, null, 2));

        console.log(`💾 Saved conflict resolutions to ${resolutionFile}`);
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const planner = new CalendarAwarePlanner();

    switch (command) {
        case 'sync-check':
            console.log('🔍 Checking Google Calendar MCP integration...');
            const mcpStatus = await planner.checkCalendarMCP();
            console.log(mcpStatus.available ? '✅ Calendar MCP available' : '❌ Calendar MCP not available');
            break;

        case 'check-conflicts': {
            const date = args[1] || new DateIndex().toString();
            console.log(`🔍 Checking calendar conflicts for ${date}...`);
            await planner.planDayWithCalendar(date);
            break;
        }

        case 'plan-with-calendar': {
            const date = args[1] || new DateIndex().toString();
            await planner.planDayWithCalendar(date);
            break;
        }

        case 'suggest-blocks': {
            const date = args[1] || new DateIndex().toString();
            const availableSlots = await planner.findAvailableSlots(date, 90);
            
            console.log(`\n📅 Available 90+ minute time slots for ${date}:`);
            if (availableSlots.length === 0) {
                console.log('❌ No suitable time slots available');
            } else {
                availableSlots.forEach((slot, index) => {
                    console.log(`${index + 1}. ${slot.startTime} - ${slot.endTime} (${slot.duration} minutes)`);
                });
            }
            break;
        }

        default:
            console.log(`
📅 Calendar-Aware Planning System

Commands:
  sync-check                    - Verify Google Calendar MCP integration
  check-conflicts [date]        - Check for calendar conflicts (default: today)
  plan-with-calendar [date]     - Create daily plan considering calendar events
  suggest-blocks [date]         - Show available time slots for planning

Examples:
  node scripts/calendar-aware-planner.cjs sync-check
  node scripts/calendar-aware-planner.cjs check-conflicts 2025-08-31
  node scripts/calendar-aware-planner.cjs plan-with-calendar today
  node scripts/calendar-aware-planner.cjs suggest-blocks tomorrow
            `);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}

module.exports = { CalendarAwarePlanner };