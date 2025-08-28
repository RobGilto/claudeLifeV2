#!/usr/bin/env node

/**
 * Fractal Planning System V2.1 - Direct Google Calendar API Integration
 * Purpose: Multi-scale planning with direct Google Calendar API calls.
 * Usage: node scripts/fractal-planner-v2.cjs [command] [args]
 * Dependencies: fs, path, readline, googleapis, dotenv
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis'); // --- NEW ---
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // --- NEW ---

// Configuration
const PLANNING_DIR = path.join(__dirname, '..', 'planning');
const DATA_DIR = path.join(PLANNING_DIR, 'data');
const EXECUTION_DIR = path.join(PLANNING_DIR, 'execution');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
[PLANNING_DIR, DATA_DIR, EXECUTION_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// --- REFACTORED: More robust and configurable Date/Time utilities ---
const BLOCK_CONFIG = {
    WORKDAY: {
        durations: [90, 75, 60, 45, 30],
        types: ['deep-work', 'project', 'research', 'admin', 'review'],
        labels: ['Deep Work Session', 'Project Development', 'Research & Learning', 'Planning & Admin', 'Review & Reflection'],
    },
    EVENING: {
        durations: [60, 45, 45, 30, 30],
        types: ['learning', 'project', 'research', 'admin', 'review'],
        labels: ['Evening Learning', 'Light Project Work', 'Research & Reading', 'Admin & Planning', 'Daily Review'],
    },
    START_HOUR: 9,
    END_HOUR: 23,
    BLOCK_INTERVAL_MINUTES: 15, // Gap between blocks
    ROUND_UP_MINUTES: 15,      // Round up current time to the nearest 15 mins
    MAX_BLOCKS: 5,
};

class TimeAwareDate {
    constructor(date = new Date()) {
        const timeZone = 'Australia/Sydney';
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });

        const parts = formatter.formatToParts(date).reduce((acc, part) => {
            if (part.type !== 'literal') {
                acc[part.type] = part.value;
            }
            return acc;
        }, {});
        
        const isoString = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
        this.date = new Date(isoString);

        this.currentHour = this.date.getHours();
        this.currentMinute = this.date.getMinutes();
        this.dayOfWeek = this.date.getDay(); // Sunday is 0, Saturday is 6
        this.isWeekend = this.dayOfWeek === 0 || this.dayOfWeek === 6;
    }

    getCurrentTimeString() {
        return this.date.toTimeString().slice(0, 5); // HH:MM
    }

    _formatTime(hour, minute) {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    getNextAvailableBlock() {
        let nextHour = this.currentHour;
        let nextMinute = this.currentMinute;

        const remainder = nextMinute % BLOCK_CONFIG.ROUND_UP_MINUTES;
        if (remainder > 0) {
            nextMinute += BLOCK_CONFIG.ROUND_UP_MINUTES - remainder;
        }

        nextMinute += BLOCK_CONFIG.BLOCK_INTERVAL_MINUTES;

        if (nextMinute >= 60) {
            nextHour += Math.floor(nextMinute / 60);
            nextMinute %= 60;
        }

        if (nextHour < BLOCK_CONFIG.START_HOUR) {
            nextHour = BLOCK_CONFIG.START_HOUR;
            nextMinute = 0;
        }

        if (nextHour >= BLOCK_CONFIG.END_HOUR) {
            return null;
        }
        
        return { 
            start: this._formatTime(nextHour, nextMinute), 
            hour: nextHour, 
            minute: nextMinute 
        };
    }

    generateAvailableBlocks() {
        const blocks = [];
        let currentBlockStartTime = this.getNextAvailableBlock();
        if (!currentBlockStartTime) {
            return blocks;
        }

        const isEvening = currentBlockStartTime.hour >= 18;
        const config = isEvening ? BLOCK_CONFIG.EVENING : BLOCK_CONFIG.WORKDAY;

        for (let i = 0; i < BLOCK_CONFIG.MAX_BLOCKS; i++) {
            const duration = config.durations[i] || config.durations[config.durations.length - 1];
            
            let endMinute = currentBlockStartTime.minute + duration;
            let endHour = currentBlockStartTime.hour + Math.floor(endMinute / 60);
            endMinute %= 60;

            if (endHour >= BLOCK_CONFIG.END_HOUR) {
                break;
            }

            blocks.push({
                id: `block-${i + 1}`,
                start: currentBlockStartTime.start,
                endTime: this._formatTime(endHour, endMinute),
                duration: duration,
                type: config.types[i],
                label: config.labels[i],
            });

            let nextStartMinute = endMinute + BLOCK_CONFIG.BLOCK_INTERVAL_MINUTES;
            let nextStartHour = endHour + Math.floor(nextStartMinute / 60);
            nextStartMinute %= 60;
            
            if (nextStartHour >= BLOCK_CONFIG.END_HOUR) {
                break;
            }

            currentBlockStartTime = { 
                start: this._formatTime(nextStartHour, nextStartMinute), 
                hour: nextStartHour, 
                minute: nextStartMinute 
            };
        }
        return blocks;
    }
}

// --- MODIFIED: Google Calendar Integration with Direct API calls ---
class CalendarIntegration {
    constructor() {
        this.calendarId = process.env.GOOGLE_CALENDAR_ID;
        this.timezone = 'Australia/Sydney';
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: ['https://www.googleapis.com/auth/calendar'],
        });
        this.calendar = google.calendar({ version: 'v3', auth });
    }

    async checkAvailability(date, startTime, endTime) {
        const timeMin = `${date}T${startTime}:00`;
        const timeMax = `${date}T${endTime}:00`;

        try {
            console.log(`⏳ Checking calendar availability from ${timeMin} to ${timeMax} in ${this.timezone}...`);
            const response = await this.calendar.freebusy.query({
                requestBody: {
                    timeMin: timeMin,
                    timeMax: timeMax,
                    timeZone: this.timezone,
                    items: [{ id: this.calendarId }],
                },
            });

            if (!response.data.calendars || !response.data.calendars[this.calendarId]) {
                 console.log('⚠️  Calendar ID not found in free/busy response. Assuming available.');
                 return true;
            }

            const busySlots = response.data.calendars[this.calendarId].busy;
            const isAvailable = busySlots.length === 0;
            
            if (!isAvailable) {
                console.log(`   Busy slots found:`, busySlots.map(s => `from ${new Date(s.start).toLocaleTimeString()} to ${new Date(s.end).toLocaleTimeString()}`));
            }
            
            return isAvailable;
        } catch (error) {
            console.log('⚠️  Could not check calendar availability due to an API error:', error.message);
            throw new Error(`Failed to check calendar availability: ${error.message}`);
        }
    }
    
    async createTimeBlockEvent(date, block, description) {
        const eventData = {
            summary: `${block.label}: ${description}`,
            description: `Time block for focused work.\nType: ${block.type}\nDuration: ${block.duration} minutes\n\n🎯 Focus Area: ${description}`,
            start: { dateTime: `${date}T${block.start}:00`, timeZone: this.timezone },
            end: { dateTime: `${date}T${block.endTime}:00`, timeZone: this.timezone },
            reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 10 }, { method: 'popup', minutes: 2 }] },
            colorId: this.getBlockColor(block.type)
        };
        try {
            console.log(`📅 Creating calendar event: ${eventData.summary}`);
            console.log(`   ⏰ ${block.start} - ${block.endTime} (${block.duration}min)`);
            const response = await this.calendar.events.insert({
                calendarId: this.calendarId,
                resource: eventData,
            });
            console.log(`✅ Event created: ${response.data.htmlLink}`);
            return response.data; // Return the created event
        } catch (error) {
            console.log('⚠️  Could not create calendar event:', error.message);
            return null;
        }
    }
    
    getBlockColor(blockType) {
        const colorMap = {
            'deep-work': '9', 'project': '10', 'learning': '5',
            'research': '3', 'admin': '8', 'review': '6'
        };
        return colorMap[blockType] || '1';
    }
}


// --- The rest of the script from EnhancedPlanStorage onwards remains largely the same, ---
// --- except for how calendar events are handled in the planner class. ---


class EnhancedPlanStorage {
    static save(plan) {
        const filename = `${plan.type}-${plan.id}.json`;
        const filepath = path.join(DATA_DIR, filename);
        fs.writeFileSync(filepath, JSON.stringify(plan, null, 2));
        if (plan.type === 'day') {
            const execPath = path.join(EXECUTION_DIR, `execution-${plan.id}.json`);
            const executionData = {
                planId: plan.id, date: plan.id, timeBlocks: plan.timeBlocks,
                objectives: plan.objectives, status: 'pending', created: new Date().toISOString(),
                calendarEvents: plan.calendarEvents || []
            };
            fs.writeFileSync(execPath, JSON.stringify(executionData, null, 2));
        }
        this.log(`Saved ${plan.type} plan: ${plan.id}`);
    }
    static load(type, id) {
        const filename = `${type}-${id}.json`;
        const filepath = path.join(DATA_DIR, filename);
        if (fs.existsSync(filepath)) {
            const data = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    }
    static log(message) {
        const timestamp = new Date().toISOString();
        const logFile = path.join(LOGS_DIR, `fractal-planner-${new Date().toISOString().split('T')[0]}.log`);
        const logEntry = `${timestamp} - ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }
}

class EnhancedFractalPlanner {
    constructor() {
        this.rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        this.calendar = new CalendarIntegration(); // Now uses the direct API version
        this.timeaware = new TimeAwareDate();
    }
    
    async run(args) {
        const command = args[0] || 'status';
        try {
            switch (command) {
                case 'plan-day': await this.planDayEnhanced(args[1]); break;
                case 'book-calendar': await this.bookExistingPlan(args[1]); break; // --- MODIFIED to call API directly
                case 'status': await this.showStatus(); break;
                default: this.showHelp();
            }
        } catch (error) {
            console.error('Error:', error.message);
            EnhancedPlanStorage.log(`Error: ${error.message}`);
        } finally {
            this.rl.close();
        }
    }

    // --- MODIFIED: This function now calls the API directly ---
    async bookExistingPlan(dateStr) {
        const planDate = dateStr || new Date().toISOString().split('T')[0];
        console.log(`\n📅 Loading plan for: ${planDate}`);
        const existingPlan = EnhancedPlanStorage.load('day', planDate);

        if (!existingPlan || existingPlan.timeBlocks.length === 0) {
            console.log(`⚠️  No plan or time blocks found for ${planDate}.`);
            return;
        }
        
        console.log(`📋 Found ${existingPlan.timeBlocks.length} time blocks.`);
        const bookAll = await this.ask('\n📅 Book all blocks in Google Calendar? (y/n): ');
        if (bookAll.toLowerCase() !== 'y') {
            console.log('❌ Calendar booking cancelled.');
            return;
        }

        console.log(`\n🚀 Booking ${existingPlan.timeBlocks.length} calendar events...`);
        for (const block of existingPlan.timeBlocks) {
            await this.calendar.createTimeBlockEvent(planDate, block, block.activity || block.label);
        }
        console.log('\n✅ Calendar booking session completed!');
    }

    // --- REFACTORED: `planDayEnhanced` broken into smaller, manageable methods ---

    _displayPlanHeader(planDate, isToday) {
        console.log(`\n🗓️  Enhanced Daily Planning for: ${planDate}`);
        if (isToday) {
            console.log(`⏰ Current Sydney Time: ${this.timeaware.getCurrentTimeString()}`);
            console.log(`📊 ${this.timeaware.isWeekend ? 'Weekend' : 'Weekday'} Schedule\n`);
        }
    }

    async _getCalendarBookingMode() {
        const question = '\n📅 Calendar booking mode:\n  1) Interactive (ask for each block)\n  2) Auto-book all blocks\n  3) Skip calendar booking\nChoice (1-3): ';
        return await this.ask(question);
    }

    async _collectDailyObjectives() {
        const objectives = [];
        console.log('\n🎯 Daily Objectives (max 3 for focus):');
        for (let i = 1; i <= 3; i++) {
            const objective = await this.ask(`Objective ${i}: `);
            if (objective.trim()) {
                objectives.push({ id: `obj-${i}`, text: objective, priority: i });
            }
        }
        return objectives;
    }

    async _processTimeBlocks(availableBlocks, planDate, bookingMode) {
        const filledBlocks = [];
        const calendarEvents = [];

        console.log('\n🎯 Define Activities for Each Block:');

        for (const block of availableBlocks) {
            try {
                const isAvailable = await this.calendar.checkAvailability(planDate, block.start, block.endTime);
                if (!isAvailable) {
                    console.log(`⚠️  ${block.start} - ${block.endTime} has conflicts. Skipping...`);
                    continue;
                }

                const activity = await this.ask(`${block.label} (${block.start} - ${block.endTime}): `);
                if (!activity.trim()) {
                    continue;
                }
                
                block.activity = activity;
                filledBlocks.push(block);

                let shouldBook = false;
                if (bookingMode === '1') {
                    const confirmation = await this.ask('   └─ 📅 Add to Google Calendar? (y/n): ');
                    shouldBook = confirmation.toLowerCase() === 'y';
                } else if (bookingMode === '2') {
                    shouldBook = true;
                }

                if (shouldBook) {
                    console.log(`   └─ 🚀 Booking event...`);
                    const event = await this.calendar.createTimeBlockEvent(planDate, block, activity);
                    if (event) {
                        calendarEvents.push(event);
                    }
                }
            } catch (error) {
                console.log(`❌ An error occurred while processing block ${block.start}: ${error.message}. Moving to next block.`);
                continue;
            }
        }
        return { filledBlocks, calendarEvents };
    }

    async planDayEnhanced(dateStr) {
        const today = new Date().toISOString().split('T')[0];
        const planDate = dateStr || today;
        const isToday = planDate === today;

        this._displayPlanHeader(planDate, isToday);

        const availableBlocks = isToday 
            ? this.timeaware.generateAvailableBlocks() 
            : this.generateFullDayBlocks();

        if (availableBlocks.length === 0) {
            console.log('⚠️  No available time blocks to plan for today.');
            return;
        }

        console.log(`📋 Available Time Blocks (${availableBlocks.length} blocks):`);
        availableBlocks.forEach(b => console.log(`  ${b.start} - ${b.endTime} (${b.duration}min) - ${b.label}`));

        const bookingMode = await this._getCalendarBookingMode();
        const { filledBlocks, calendarEvents } = await this._processTimeBlocks(availableBlocks, planDate, bookingMode);
        
        if (filledBlocks.length === 0) {
            console.log('\nℹ️ No activities were defined. Plan not saved.');
            return;
        }

        const objectives = await this._collectDailyObjectives();

        const plan = {
            id: planDate,
            type: 'day',
            date: planDate,
            status: 'active',
            timeBlocks: filledBlocks,
            objectives: objectives,
            calendarEvents: calendarEvents,
            metadata: {
                createdAt: new Date().toISOString(),
                currentTime: this.timeaware.getCurrentTimeString(),
                isToday: isToday
            }
        };

        EnhancedPlanStorage.save(plan);
        console.log('\n✅ Enhanced daily plan created successfully!');
        console.log(`📁 Saved to: planning/data/day-${planDate}.json`);
    }
    
    generateFullDayBlocks() {
        return [
            { id: 'block-1', start: '09:00', duration: 90, type: 'deep-work', label: 'Morning Deep Work', endTime: '10:30' },
            { id: 'block-2', start: '10:45', duration: 75, type: 'project', label: 'Project Development', endTime: '12:00' },
            { id: 'block-3', start: '13:30', duration: 60, type: 'research', label: 'Research & Learning', endTime: '14:30' },
            { id: 'block-4', start: '15:00', duration: 45, type: 'admin', label: 'Admin & Planning', endTime: '15:45' },
            { id: 'block-5', start: '16:00', duration: 30, type: 'review', label: 'Daily Review', endTime: '16:30' }
        ];
    }
    
    async showStatus() {
        console.log('\n📊 Enhanced Planning System Status');
        console.log(`⏰ Current Time: ${this.timeaware.getCurrentTimeString()}`);
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = EnhancedPlanStorage.load('day', today);
        if (todayPlan) {
            console.log(`\n✅ Today's plan exists (${todayPlan.timeBlocks.length} blocks)`);
            const currentTime = this.timeaware.getCurrentTimeString();
            let currentBlock = null, nextBlock = null;
            for (const block of todayPlan.timeBlocks) {
                if (block.start <= currentTime && block.endTime > currentTime) currentBlock = block;
                else if (block.start > currentTime && !nextBlock) nextBlock = block;
            }
            if (currentBlock) console.log(`\n🔄 Current Block: ${currentBlock.activity || currentBlock.label}\n   Time: ${currentBlock.start} - ${currentBlock.endTime}`);
            if (nextBlock) console.log(`\n⏭️  Next Block: ${nextBlock.activity || nextBlock.label}\n   Time: ${nextBlock.start} - ${nextBlock.endTime}`);
        } else {
            console.log(`\n⚠️  No plan for today. Run: node scripts/fractal-planner-v2.cjs plan-day`);
        }
    }
    
    async ask(question) {
        return new Promise(resolve => this.rl.question(question, resolve));
    }
    
    showHelp() {
        console.log(`
Enhanced Fractal Planning System V2.1 (Direct API)
===================================================

Commands:
  plan-day [date]    - Create time-aware daily plan with direct calendar integration
  book-calendar [date] - Book an existing plan directly to Google Calendar
  status             - Show current planning status and active blocks

Features:
  ✅ Direct Google Calendar API integration (no MCP)
  ✅ Authentication via Service Account & .env file
  ✅ Real-time calendar availability checking
`);
    }
}

const planner = new EnhancedFractalPlanner();
planner.run(process.argv.slice(2));
