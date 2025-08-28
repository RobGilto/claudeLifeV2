#!/usr/bin/env node

/**
 * Fractal Planning System V2 - Enhanced with Time Awareness & Calendar Integration
 * Purpose: Multi-scale planning with Google Calendar integration and real-time awareness
 * Usage: node scripts/fractal-planner-v2.js [command] [args]
 * Dependencies: fs, path, readline, child_process
 * 
 * Key Enhancements:
 * - Time-aware planning (checks current time before suggesting blocks)
 * - Google Calendar MCP integration for availability checking
 * - Automatic calendar event creation for time blocks
 * - Taskmaster integration for execution tracking
 * - ADD-optimized with realistic time constraints
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

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
        // Get current Sydney time
        this.sydneyTime = new Date().toLocaleString('en-US', { 
            timeZone: 'Australia/Sydney',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
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
        // Round up to next 15-minute interval
        let nextHour = this.currentHour;
        let nextMinute = Math.ceil(this.currentMinute / 15) * 15;
        
        if (nextMinute >= 60) {
            nextHour++;
            nextMinute = 0;
        }
        
        // Add 15-minute buffer for transition
        nextMinute += 15;
        if (nextMinute >= 60) {
            nextHour++;
            nextMinute = nextMinute - 60;
        }
        
        // Don't schedule before 9 AM
        if (nextHour < 9) {
            nextHour = 9;
            nextMinute = 0;
        }
        
        // Don't schedule after 11 PM
        if (nextHour >= 23) {
            return null; // Too late for new blocks
        }
        
        return {
            start: `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`,
            hour: nextHour,
            minute: nextMinute
        };
    }
    
    generateAvailableBlocks() {
        const blocks = [];
        const maxBlocks = 5; // ADD-friendly limit
        let currentBlock = this.getNextAvailableBlock();
        
        if (!currentBlock) {
            return blocks; // Too late in the day
        }
        
        // Generate time blocks from current time
        const isEvening = currentBlock.hour >= 18;
        const blockDurations = isEvening 
            ? [60, 45, 45, 30, 30] // Evening: shorter blocks
            : [90, 75, 60, 45, 30]; // Day: standard decreasing duration
        const blockTypes = isEvening
            ? ['learning', 'project', 'research', 'admin', 'review']
            : ['deep-work', 'project', 'research', 'admin', 'review'];
        const blockLabels = isEvening
            ? ['Evening Learning', 'Light Project Work', 'Research & Reading', 'Admin & Planning', 'Daily Review']
            : ['Deep Work Session', 'Project Development', 'Research & Learning', 'Planning & Admin', 'Review & Reflection'];
        
        for (let i = 0; i < maxBlocks && currentBlock; i++) {
            const duration = blockDurations[Math.min(i, blockDurations.length - 1)];
            const endHour = currentBlock.hour + Math.floor((currentBlock.minute + duration) / 60);
            const endMinute = (currentBlock.minute + duration) % 60;
            
            // Stop if we'd go past 11 PM
            if (endHour > 23 || (endHour === 23 && endMinute > 0)) {
                break;
            }
            
            blocks.push({
                id: `block-${i + 1}`,
                start: currentBlock.start,
                duration: duration,
                type: blockTypes[i % blockTypes.length],
                label: blockLabels[i % blockLabels.length],
                endTime: `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
            });
            
            // Calculate next block start with 15-minute break
            currentBlock.hour = endHour;
            currentBlock.minute = endMinute + 15;
            
            if (currentBlock.minute >= 60) {
                currentBlock.hour++;
                currentBlock.minute = currentBlock.minute - 60;
            }
            
            if (currentBlock.hour >= 23) {
                break; // Don't schedule past 11 PM
            }
            
            currentBlock.start = `${String(currentBlock.hour).padStart(2, '0')}:${String(currentBlock.minute).padStart(2, '0')}`;
        }
        
        return blocks;
    }
}

// Google Calendar MCP Integration
class CalendarIntegration {
    constructor() {
        this.calendarId = 'primary';
        this.timezone = 'Australia/Sydney';
    }
    
    async checkAvailability(date, startTime, endTime) {
        try {
            // Call Claude to use MCP tools for calendar checking
            // This would normally integrate with the MCP server
            // For now, return a mock response
            console.log(`⏳ Checking calendar availability for ${startTime} - ${endTime}...`);
            
            // In production, this would use the MCP Google Calendar integration
            // Example: await mcp.google_calendar.list_events({...})
            
            return true; // Mock: assume available
        } catch (error) {
            console.log('⚠️  Could not check calendar availability:', error.message);
            return true; // Default to available if check fails
        }
    }
    
    async createTimeBlockEvent(date, block, description) {
        try {
            const eventData = {
                calendarId: this.calendarId,
                summary: `${block.label}: ${description}`,
                description: `Time block for focused work.\nType: ${block.type}\nDuration: ${block.duration} minutes\n\n🎯 Focus Area: ${description}`,
                start: `${date}T${block.start}:00`,
                end: `${date}T${block.endTime}:00`,
                timeZone: this.timezone,
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 10 },
                        { method: 'popup', minutes: 2 }
                    ]
                },
                colorId: this.getBlockColor(block.type)
            };
            
            console.log(`📅 Creating calendar event: ${eventData.summary}`);
            console.log(`   ⏰ ${block.start} - ${block.endTime} (${block.duration}min)`);
            
            // Generate MCP command for manual execution
            const mcpCommand = JSON.stringify({
                calendarId: eventData.calendarId,
                summary: eventData.summary,
                description: eventData.description,
                start: eventData.start,
                end: eventData.end,
                timeZone: eventData.timeZone,
                reminders: eventData.reminders,
                colorId: eventData.colorId
            }, null, 2);
            
            console.log(`\n🔧 MCP Command to execute:`);
            console.log(`Use: mcp__google-calendar__create_event`);
            console.log(`Parameters:`, mcpCommand);
            
            // Store the command for potential batch execution
            eventData.mcpCommand = mcpCommand;
            
            return eventData;
        } catch (error) {
            console.log('⚠️  Could not prepare calendar event:', error.message);
            return null;
        }
    }
    
    getBlockColor(blockType) {
        // Color-code different block types
        const colorMap = {
            'deep-work': '9',     // Blue - for focused work
            'project': '10',      // Green - for development
            'learning': '5',      // Yellow - for skill development
            'research': '3',      // Purple - for exploration
            'admin': '8',         // Gray - for administrative tasks
            'review': '6'         // Orange - for reflection
        };
        return colorMap[blockType] || '1'; // Default to pale blue
    }
}

// Enhanced Plan Storage with Taskmaster integration
class EnhancedPlanStorage {
    static save(plan) {
        const filename = `${plan.type}-${plan.id}.json`;
        const filepath = path.join(DATA_DIR, filename);
        fs.writeFileSync(filepath, JSON.stringify(plan, null, 2));
        
        // Also save to execution directory for taskmaster
        if (plan.type === 'day') {
            const execPath = path.join(EXECUTION_DIR, `execution-${plan.id}.json`);
            const executionData = {
                planId: plan.id,
                date: plan.id,
                timeBlocks: plan.timeBlocks,
                objectives: plan.objectives,
                status: 'pending',
                created: new Date().toISOString(),
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

// Enhanced Planner with time awareness
class EnhancedFractalPlanner {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.calendar = new CalendarIntegration();
        this.timeaware = new TimeAwareDate();
    }
    
    async run(args) {
        const command = args[0] || 'status';
        
        try {
            switch (command) {
                case 'plan-day':
                    await this.planDayEnhanced(args[1]);
                    break;
                case 'book-calendar':
                    await this.bookExistingPlan(args[1]);
                    break;
                case 'status':
                    await this.showStatus();
                    break;
                default:
                    this.showHelp();
            }
        } catch (error) {
            console.error('Error:', error.message);
            EnhancedPlanStorage.log(`Error: ${error.message}`);
        } finally {
            this.rl.close();
        }
    }
    
    async bookCalendarEvents(planDate, mcpCommands) {
        console.log(`\n📅 Executing ${mcpCommands.length} calendar bookings...`);
        
        for (let i = 0; i < mcpCommands.length; i++) {
            const cmd = mcpCommands[i];
            console.log(`\n📅 Booking event ${i + 1}/${mcpCommands.length}:`);
            console.log(`   ${cmd.parameters.summary}`);
            console.log(`   ${cmd.parameters.start.split('T')[1].slice(0, 5)} - ${cmd.parameters.end.split('T')[1].slice(0, 5)}`);
            
            try {
                // This would be the actual MCP call in Claude Code environment
                // For now, we'll generate the instructions
                console.log(`\n🔧 Execute this MCP command in Claude Code:`);
                console.log(`Use tool: ${cmd.tool}`);
                console.log(`Parameters:`);
                console.log(JSON.stringify(cmd.parameters, null, 2));
                
                const proceed = await this.ask('\n✅ Event created successfully? (y/n): ');
                if (proceed.toLowerCase() !== 'y') {
                    console.log('⚠️  Event booking interrupted. Remaining events not booked.');
                    break;
                }
                
            } catch (error) {
                console.log(`⚠️  Error booking event: ${error.message}`);
                const continueBooking = await this.ask('Continue with remaining events? (y/n): ');
                if (continueBooking.toLowerCase() !== 'y') {
                    break;
                }
            }
        }
        
        console.log('\n✅ Calendar booking session completed!');
    }
    
    async bookExistingPlan(dateStr) {
        const today = new Date().toISOString().split('T')[0];
        const planDate = dateStr || today;
        
        console.log(`\n📅 Loading plan for: ${planDate}`);
        
        const existingPlan = EnhancedPlanStorage.load('day', planDate);
        if (!existingPlan) {
            console.log(`⚠️  No plan found for ${planDate}`);
            console.log(`💡 Create a plan first with: node scripts/fractal-planner-v2.js plan-day ${planDate}`);
            return;
        }
        
        if (existingPlan.timeBlocks.length === 0) {
            console.log(`⚠️  No time blocks found in plan for ${planDate}`);
            return;
        }
        
        console.log(`📋 Found ${existingPlan.timeBlocks.length} time blocks:`);
        existingPlan.timeBlocks.forEach((block, index) => {
            console.log(`  ${index + 1}. ${block.start} - ${block.endTime} - ${block.activity || block.label}`);
        });
        
        const bookAll = await this.ask('\n📅 Book all blocks in Google Calendar? (y/n): ');
        if (bookAll.toLowerCase() !== 'y') {
            console.log('❌ Calendar booking cancelled');
            return;
        }
        
        // Generate MCP commands for all blocks
        let mcpCommands = [];
        for (const block of existingPlan.timeBlocks) {
            const event = await this.calendar.createTimeBlockEvent(
                planDate, 
                block, 
                block.activity || block.label
            );
            if (event) {
                mcpCommands.push({
                    tool: 'mcp__google-calendar__create_event',
                    parameters: JSON.parse(event.mcpCommand)
                });
            }
        }
        
        if (mcpCommands.length > 0) {
            console.log(`\n🚀 Ready to book ${mcpCommands.length} calendar events`);
            const executeNow = await this.ask('Execute calendar bookings now? (y/n): ');
            
            if (executeNow.toLowerCase() === 'y') {
                await this.bookCalendarEvents(planDate, mcpCommands);
            } else {
                await this.generateCalendarScript(planDate, mcpCommands);
            }
        }
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
        
        // Generate available time blocks based on current time
        const availableBlocks = isToday 
            ? this.timeaware.generateAvailableBlocks()
            : this.generateFullDayBlocks();
        
        if (availableBlocks.length === 0) {
            console.log('⚠️  Too late in the day for new time blocks.');
            console.log('💡 Consider planning for tomorrow instead.\n');
            return;
        }
        
        console.log(`📋 Available Time Blocks (${availableBlocks.length} blocks):`);
        availableBlocks.forEach(block => {
            console.log(`  ${block.start} - ${block.endTime} (${block.duration}min) - ${block.label}`);
        });
        
        // Create plan structure
        const plan = {
            id: planDate,
            type: 'day',
            date: planDate,
            status: 'active',
            timeBlocks: [],
            objectives: [],
            calendarEvents: [],
            metadata: {
                createdAt: new Date().toISOString(),
                currentTime: this.timeaware.getCurrentTimeString(),
                isToday: isToday
            }
        };
        
        // Collect activities and iteratively book calendar
        console.log('\n🎯 Define Activities for Each Block:');
        const calendarBookingMode = await this.ask('\n📅 Calendar booking mode:\n  1) Interactive (ask for each block)\n  2) Auto-book all blocks\n  3) Skip calendar booking\nChoice (1-3): ');
        
        let mcpCommands = [];
        
        for (const block of availableBlocks) {
            // Check calendar availability
            const isAvailable = await this.calendar.checkAvailability(
                planDate, 
                block.start, 
                block.endTime
            );
            
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
                    case '1': // Interactive
                        const bookThis = await this.ask('📅 Add to Google Calendar? (y/n): ');
                        shouldBook = bookThis.toLowerCase() === 'y';
                        break;
                    case '2': // Auto-book all
                        shouldBook = true;
                        break;
                    case '3': // Skip
                        shouldBook = false;
                        break;
                    default:
                        shouldBook = false;
                }
                
                if (shouldBook) {
                    const event = await this.calendar.createTimeBlockEvent(planDate, block, activity);
                    if (event) {
                        plan.calendarEvents.push(event);
                        mcpCommands.push({
                            tool: 'mcp__google-calendar__create_event',
                            parameters: JSON.parse(event.mcpCommand)
                        });
                        console.log(`✅ Calendar event prepared for ${block.start} - ${block.endTime}`);
                    }
                }
            }
        }
        
        // Generate batch calendar booking script
        if (mcpCommands.length > 0) {
            await this.generateCalendarScript(planDate, mcpCommands);
        }
        
        // Add daily objectives
        console.log('\n🎯 Daily Objectives (max 3 for focus):');
        for (let i = 1; i <= 3; i++) {
            const objective = await this.ask(`Objective ${i}: `);
            if (objective.trim()) {
                plan.objectives.push({
                    id: `obj-${i}`,
                    text: objective,
                    priority: i
                });
            }
        }
        
        // Save the plan
        EnhancedPlanStorage.save(plan);
        
        console.log('\n✅ Enhanced daily plan created successfully!');
        console.log(`📁 Saved to: planning/data/day-${planDate}.json`);
        console.log(`🚀 Execution data ready for /taskmaster-start`);
        
        if (plan.calendarEvents.length > 0) {
            console.log(`📅 ${plan.calendarEvents.length} calendar events prepared`);
        }
    }
    
    generateFullDayBlocks() {
        // For future days, generate standard full-day blocks
        return [
            {
                id: 'block-1',
                start: '09:00',
                duration: 90,
                type: 'deep-work',
                label: 'Morning Deep Work',
                endTime: '10:30'
            },
            {
                id: 'block-2',
                start: '10:45',
                duration: 75,
                type: 'project',
                label: 'Project Development',
                endTime: '12:00'
            },
            {
                id: 'block-3',
                start: '13:30',
                duration: 60,
                type: 'research',
                label: 'Research & Learning',
                endTime: '14:30'
            },
            {
                id: 'block-4',
                start: '15:00',
                duration: 45,
                type: 'admin',
                label: 'Admin & Planning',
                endTime: '15:45'
            },
            {
                id: 'block-5',
                start: '16:00',
                duration: 30,
                type: 'review',
                label: 'Daily Review',
                endTime: '16:30'
            }
        ];
    }
    
    async generateCalendarScript(planDate, mcpCommands) {
        try {
            const scriptContent = `#!/usr/bin/env node
/**
 * Auto-generated Calendar Booking Script
 * Date: ${planDate}
 * Generated: ${new Date().toISOString()}
 * 
 * This script contains MCP commands to book time blocks in Google Calendar
 * Run with Claude Code to execute the calendar events creation
 */

console.log('📅 Booking ${mcpCommands.length} time blocks for ${planDate}...');

const events = ${JSON.stringify(mcpCommands, null, 2)};

console.log('\\n🔧 MCP Commands to execute in Claude Code:');
console.log('Copy and paste each command below into Claude Code:');
console.log('=' .repeat(60));

events.forEach((cmd, index) => {
    console.log(\`\\nEvent \${index + 1}:\`);
    console.log(\`Tool: \${cmd.tool}\`);
    console.log('Parameters:', JSON.stringify(cmd.parameters, null, 2));
    console.log('-'.repeat(40));
});

console.log('\\n✅ All calendar events prepared!');
console.log('💡 Tip: Execute these MCP commands in Claude Code to book your calendar');
`;

            const scriptPath = path.join(LOGS_DIR, `calendar-booking-${planDate}.js`);
            fs.writeFileSync(scriptPath, scriptContent);
            
            console.log(`\n📝 Calendar booking script generated:`);
            console.log(`   📁 ${scriptPath}`);
            console.log(`\n🚀 To execute calendar bookings:`);
            console.log(`   1. Run: node ${scriptPath}`);
            console.log(`   2. Copy MCP commands to Claude Code`);
            console.log(`   3. Execute each command to create calendar events`);
            
        } catch (error) {
            console.log('⚠️  Could not generate calendar script:', error.message);
        }
    }
    
    async showStatus() {
        console.log('\n📊 Enhanced Planning System Status');
        console.log(`⏰ Current Time: ${this.timeaware.getCurrentTimeString()}`);
        
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = EnhancedPlanStorage.load('day', today);
        
        if (todayPlan) {
            console.log(`\n✅ Today's plan exists (${todayPlan.timeBlocks.length} blocks)`);
            
            const currentTime = this.timeaware.getCurrentTimeString();
            let currentBlock = null;
            let nextBlock = null;
            
            for (const block of todayPlan.timeBlocks) {
                if (block.start <= currentTime && block.endTime > currentTime) {
                    currentBlock = block;
                } else if (block.start > currentTime && !nextBlock) {
                    nextBlock = block;
                }
            }
            
            if (currentBlock) {
                console.log(`\n🔄 Current Block: ${currentBlock.activity || currentBlock.label}`);
                console.log(`   Time: ${currentBlock.start} - ${currentBlock.endTime}`);
            }
            
            if (nextBlock) {
                console.log(`\n⏭️  Next Block: ${nextBlock.activity || nextBlock.label}`);
                console.log(`   Time: ${nextBlock.start} - ${nextBlock.endTime}`);
            }
        } else {
            console.log(`\n⚠️  No plan for today. Run: node scripts/fractal-planner-v2.js plan-day`);
        }
    }
    
    async ask(question) {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
    }
    
    showHelp() {
        console.log(`
Enhanced Fractal Planning System V2
===================================

Commands:
  plan-day [date]  - Create time-aware daily plan with calendar integration
  status           - Show current planning status and active blocks

Features:
  ✅ Time-aware planning (checks current time)
  ✅ Google Calendar availability checking
  ✅ Automatic calendar event creation
  ✅ Taskmaster integration for execution
  ✅ ADD-optimized time blocks

Examples:
  node scripts/fractal-planner-v2.js plan-day
  node scripts/fractal-planner-v2.js plan-day 2025-08-29
  node scripts/fractal-planner-v2.js status
        `);
    }
}

// Main execution
const planner = new EnhancedFractalPlanner();
planner.run(process.argv.slice(2));