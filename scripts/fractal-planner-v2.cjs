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

// Enhanced Date utilities with Sydney timezone
class TimeAwareDate {
    constructor(date = new Date()) {
        this.sydneyTime = new Date().toLocaleString('en-US', { 
            timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        });
        this.date = new Date(this.sydneyTime);
        this.currentHour = this.date.getHours();
        this.currentMinute = this.date.getMinutes();
        this.dayOfWeek = this.date.getDay();
        this.isWeekend = this.dayOfWeek === 0 || this.dayOfWeek === 6;
    }
    
    getCurrentTimeString() {
        return `${String(this.currentHour).padStart(2, '0')}:${String(this.currentMinute).padStart(2, '0')}`;
    }
    
    getNextAvailableBlock(duration = 60) {
        let nextHour = this.currentHour;
        let nextMinute = Math.ceil(this.currentMinute / 15) * 15;
        if (nextMinute >= 60) { nextHour++; nextMinute = 0; }
        nextMinute += 15;
        if (nextMinute >= 60) { nextHour++; nextMinute = nextMinute - 60; }
        if (nextHour < 9) { nextHour = 9; nextMinute = 0; }
        if (nextHour >= 23) { return null; }
        return { start: `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`, hour: nextHour, minute: nextMinute };
    }
    
    generateAvailableBlocks() {
        const blocks = [];
        const maxBlocks = 5;
        let currentBlock = this.getNextAvailableBlock();
        if (!currentBlock) { return blocks; }
        const isEvening = currentBlock.hour >= 18;
        const blockDurations = isEvening ? [60, 45, 45, 30, 30] : [90, 75, 60, 45, 30];
        const blockTypes = isEvening ? ['learning', 'project', 'research', 'admin', 'review'] : ['deep-work', 'project', 'research', 'admin', 'review'];
        const blockLabels = isEvening ? ['Evening Learning', 'Light Project Work', 'Research & Reading', 'Admin & Planning', 'Daily Review'] : ['Deep Work Session', 'Project Development', 'Research & Learning', 'Planning & Admin', 'Review & Reflection'];
        
        for (let i = 0; i < maxBlocks && currentBlock; i++) {
            const duration = blockDurations[Math.min(i, blockDurations.length - 1)];
            const endHour = currentBlock.hour + Math.floor((currentBlock.minute + duration) / 60);
            const endMinute = (currentBlock.minute + duration) % 60;
            if (endHour > 23 || (endHour === 23 && endMinute > 0)) { break; }
            
            blocks.push({
                id: `block-${i + 1}`, start: currentBlock.start, duration: duration,
                type: blockTypes[i % blockTypes.length], label: blockLabels[i % blockLabels.length],
                endTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
            });
            
            currentBlock.hour = endHour;
            currentBlock.minute = endMinute + 15;
            if (currentBlock.minute >= 60) { currentBlock.hour++; currentBlock.minute = currentBlock.minute - 60; }
            if (currentBlock.hour >= 23) { break; }
            currentBlock.start = `${String(currentBlock.hour).padStart(2, '0')}:${String(currentBlock.minute).padStart(2, '0')}`;
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
        try {
            console.log(`⏳ Checking calendar availability for ${startTime} - ${endTime}...`);
            const response = await this.calendar.freebusy.query({
                requestBody: {
                    timeMin: `${date}T${startTime}:00Z`,
                    timeMax: `${date}T${endTime}:00Z`,
                    timeZone: this.timezone,
                    items: [{ id: this.calendarId }],
                },
            });
            const busySlots = response.data.calendars[this.calendarId].busy;
            return busySlots.length === 0;
        } catch (error) {
            console.log('⚠️  Could not check calendar availability:', error.message);
            return true; // Default to available if check fails
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
    
    async planDayEnhanced(dateStr) {
        const today = new Date().toISOString().split('T')[0];
        const planDate = dateStr || today;
        const isToday = planDate === today;
        
        console.log(`\n🗓️  Enhanced Daily Planning for: ${planDate}`);
        if (isToday) {
            console.log(`⏰ Current Sydney Time: ${this.timeaware.getCurrentTimeString()}`);
            console.log(`📊 ${this.timeaware.isWeekend ? 'Weekend' : 'Weekday'} Schedule\n`);
        }
        
        const availableBlocks = isToday ? this.timeaware.generateAvailableBlocks() : this.generateFullDayBlocks();
        if (availableBlocks.length === 0) {
            console.log('⚠️  Too late in the day for new time blocks.');
            return;
        }
        
        console.log(`📋 Available Time Blocks (${availableBlocks.length} blocks):`);
        availableBlocks.forEach(block => console.log(`  ${block.start} - ${block.endTime} (${block.duration}min) - ${block.label}`));

        const plan = {
            id: planDate, type: 'day', date: planDate, status: 'active',
            timeBlocks: [], objectives: [], calendarEvents: [],
            metadata: { createdAt: new Date().toISOString(), currentTime: this.timeaware.getCurrentTimeString(), isToday: isToday }
        };
        
        console.log('\n🎯 Define Activities for Each Block:');
        const calendarBookingMode = await this.ask('\n📅 Calendar booking mode:\n  1) Interactive (ask for each block)\n  2) Auto-book all blocks\n  3) Skip calendar booking\nChoice (1-3): ');
        
        for (const block of availableBlocks) {
            const isAvailable = await this.calendar.checkAvailability(planDate, block.start, block.endTime);
            if (!isAvailable) {
                console.log(`⚠️  ${block.start} - ${block.endTime} has conflicts. Skipping...`);
                continue;
            }
            
            const activity = await this.ask(`${block.label} (${block.start} - ${block.endTime}): `);
            if (activity.trim()) {
                block.activity = activity;
                plan.timeBlocks.push(block);
                
                let shouldBook = false;
                switch (calendarBookingMode) {
                    case '1': shouldBook = (await this.ask('📅 Add to Google Calendar? (y/n): ')).toLowerCase() === 'y'; break;
                    case '2': shouldBook = true; break;
                    default: shouldBook = false;
                }
                
                if (shouldBook) {
                    const event = await this.calendar.createTimeBlockEvent(planDate, block, activity);
                    if (event) { plan.calendarEvents.push(event); }
                }
            }
        }
        
        console.log('\n🎯 Daily Objectives (max 3 for focus):');
        for (let i = 1; i <= 3; i++) {
            const objective = await this.ask(`Objective ${i}: `);
            if (objective.trim()) { plan.objectives.push({ id: `obj-${i}`, text: objective, priority: i }); }
        }
        
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
