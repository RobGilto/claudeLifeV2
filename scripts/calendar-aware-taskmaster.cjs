#!/usr/bin/env node

/**
 * Calendar-Aware Taskmaster - Enhanced Time Block Executor
 * Purpose: Execute planned time blocks with real-time calendar conflict detection
 * Usage: node scripts/calendar-aware-taskmaster.js [command] [args]
 * Dependencies: fs, path, readline, ./fractal-planner.cjs, ./calendar-aware-planner.cjs
 * 
 * Commands:
 * - start [date]              - Start executing today's time blocks (with calendar check)
 * - block [blockId]           - Execute specific block (with conflict warning)
 * - conflict-check [blockId]  - Check specific block for calendar conflicts
 * - reschedule [blockId]      - Reschedule block around calendar conflicts
 * - status                    - Show execution status with calendar awareness
 * - emergency-reschedule      - Quick reschedule of conflicting current block
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { PlanStorage, DateIndex } = require('./fractal-planner.cjs');
const { CalendarAwarePlanner } = require('./calendar-aware-planner.cjs');

// Enhanced time block execution with calendar awareness
class CalendarAwareTimeBlockExecution {
    constructor(timeBlock, dayPlan, calendarPlanner) {
        this.blockId = timeBlock.id;
        this.originalBlock = timeBlock;
        this.dayPlan = dayPlan;
        this.calendarPlanner = calendarPlanner;
        this.started = null;
        this.completed = null;
        this.actualDuration = 0;
        this.notes = '';
        this.interruptions = [];
        this.calendarConflicts = [];
        this.energy = null;
        this.focus = null;
        this.alignment = timeBlock.alignment;
        this.outcomes = [];
        this.challenges = [];
        this.adjustments = [];
        this.rescheduled = false;
        this.originalStartTime = timeBlock.startTime;
    }

    // Check for calendar conflicts before starting
    async checkCalendarConflicts() {
        const today = new DateIndex().toString();
        const calendarEvents = await this.calendarPlanner.getCalendarEvents(today);
        
        this.calendarConflicts = this.calendarPlanner.checkTimeBlockConflicts(
            [this.originalBlock], 
            calendarEvents
        );

        return this.calendarConflicts;
    }

    // Start with calendar conflict warning
    async startWithCalendarCheck() {
        const conflicts = await this.checkCalendarConflicts();
        
        if (conflicts.length > 0) {
            console.log(`\n⚠️  WARNING: Calendar conflict detected for "${this.originalBlock.title}"`);
            conflicts.forEach(conflict => {
                console.log(`   Conflicts with: "${conflict.calendarEvent.title}"`);
                console.log(`   Overlap: ${conflict.overlapMinutes} minutes`);
                console.log(`   Your block: ${this.originalBlock.startTime} - ${this.getEndTime()}`);
                console.log(`   Calendar event: ${conflict.calendarEvent.startTime} - ${conflict.calendarEvent.endTime}`);
            });

            return await this.promptForConflictResolution();
        } else {
            console.log(`✅ No calendar conflicts detected. Starting "${this.originalBlock.title}"`);
            return this.start();
        }
    }

    // Prompt user for conflict resolution
    async promptForConflictResolution() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            console.log(`\n🤔 How would you like to handle this conflict?`);
            console.log(`1. Start anyway (work around the calendar event)`);
            console.log(`2. Reschedule this block to a later time`);
            console.log(`3. Shorten this block to avoid conflict`);
            console.log(`4. Skip this block entirely`);

            rl.question('Choose option (1-4): ', async (answer) => {
                rl.close();

                switch (answer.trim()) {
                    case '1':
                        console.log(`⚡ Starting block anyway. You'll need to work around the calendar event.`);
                        this.addNote('Started despite calendar conflict - working around external event');
                        resolve(this.start());
                        break;
                    
                    case '2':
                        console.log(`🔄 Finding next available time slot...`);
                        const rescheduled = await this.findAndReschedule();
                        resolve(rescheduled);
                        break;
                    
                    case '3':
                        const shortened = await this.shortenToAvoidConflict();
                        resolve(shortened);
                        break;
                    
                    case '4':
                        console.log(`⏭️  Skipping block "${this.originalBlock.title}"`);
                        this.addNote('Block skipped due to calendar conflict');
                        resolve({ skipped: true, reason: 'calendar_conflict' });
                        break;
                    
                    default:
                        console.log(`❌ Invalid option. Defaulting to start anyway.`);
                        resolve(this.start());
                }
            });
        });
    }

    // Find next available slot and reschedule
    async findAndReschedule() {
        const today = new DateIndex().toString();
        const availableSlots = await this.calendarPlanner.findAvailableSlots(today, this.originalBlock.duration);
        
        if (availableSlots.length === 0) {
            console.log(`❌ No available slots found for ${this.originalBlock.duration} minutes`);
            console.log(`⚡ Starting original block anyway - you'll need to handle the conflict manually`);
            return this.start();
        }

        console.log(`\n📅 Available time slots:`);
        availableSlots.slice(0, 5).forEach((slot, index) => {
            console.log(`${index + 1}. ${slot.startTime} - ${slot.endTime} (${slot.duration} minutes)`);
        });

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question('Choose slot (1-5) or 0 to start original time: ', (answer) => {
                rl.close();
                
                const slotIndex = parseInt(answer.trim()) - 1;
                
                if (slotIndex >= 0 && slotIndex < availableSlots.length) {
                    const selectedSlot = availableSlots[slotIndex];
                    this.rescheduleToSlot(selectedSlot);
                    console.log(`✅ Rescheduled to ${selectedSlot.startTime}`);
                    console.log(`⏰ Set a reminder to start "${this.originalBlock.title}" at ${selectedSlot.startTime}`);
                    resolve({ rescheduled: true, newTime: selectedSlot.startTime });
                } else {
                    console.log(`⚡ Starting original block anyway`);
                    resolve(this.start());
                }
            });
        });
    }

    // Shorten block to avoid conflict
    async shortenToAvoidConflict() {
        const conflict = this.calendarConflicts[0]; // Take first conflict
        const conflictStartMinutes = this.calendarPlanner.timeToMinutes(conflict.calendarEvent.startTime);
        const blockStartMinutes = this.calendarPlanner.timeToMinutes(this.originalBlock.startTime);
        
        if (conflictStartMinutes > blockStartMinutes) {
            const availableMinutes = conflictStartMinutes - blockStartMinutes;
            if (availableMinutes >= 15) { // Minimum viable block
                this.originalBlock.duration = availableMinutes;
                console.log(`✂️  Shortened block to ${availableMinutes} minutes (ends at ${this.calendarPlanner.minutesToTime(conflictStartMinutes)})`);
                this.addNote(`Block shortened from ${this.originalBlock.duration} to ${availableMinutes} minutes due to calendar conflict`);
                return this.start();
            }
        }

        console.log(`❌ Cannot shorten block meaningfully. Minimum viable time not available.`);
        return await this.findAndReschedule();
    }

    // Reschedule to specific slot
    rescheduleToSlot(slot) {
        this.rescheduled = true;
        this.adjustments.push({
            type: 'reschedule',
            originalTime: this.originalStartTime,
            newTime: slot.startTime,
            reason: 'calendar_conflict',
            timestamp: new Date().toISOString()
        });
        
        this.originalBlock.startTime = slot.startTime;
        this.addNote(`Rescheduled from ${this.originalStartTime} to ${slot.startTime} due to calendar conflict`);
    }

    // Standard start method
    start() {
        this.started = new Date().toISOString();
        this.logEvent('started');
        console.log(`🚀 Started: "${this.originalBlock.title}" (${this.originalBlock.duration} minutes)`);
        console.log(`🎯 Alignment: ${this.originalBlock.alignment || 'Not specified'}`);
        
        if (this.rescheduled) {
            console.log(`🔄 Note: This block was rescheduled from ${this.originalStartTime}`);
        }

        return { 
            started: true, 
            blockId: this.blockId, 
            startTime: this.started,
            rescheduled: this.rescheduled 
        };
    }

    // Get calculated end time
    getEndTime() {
        const startMinutes = this.calendarPlanner.timeToMinutes(this.originalBlock.startTime);
        const endMinutes = startMinutes + this.originalBlock.duration;
        return this.calendarPlanner.minutesToTime(endMinutes);
    }

    // Enhanced completion with calendar conflict notes
    complete(outcomes = '', energy = null, focus = null) {
        this.completed = new Date().toISOString();
        this.actualDuration = this.started ? 
            Math.round((new Date(this.completed) - new Date(this.started)) / 60000) : 
            this.originalBlock.duration;
        
        if (outcomes) this.outcomes.push(outcomes);
        if (energy) this.energy = energy;
        if (focus) this.focus = focus;
        
        // Note if there were calendar conflicts
        if (this.calendarConflicts.length > 0) {
            this.addNote(`Completed despite ${this.calendarConflicts.length} calendar conflict(s)`);
        }
        
        this.logEvent('completed');
        
        return {
            completed: true,
            blockId: this.blockId,
            actualDuration: this.actualDuration,
            efficiency: this.getEfficiency(),
            calendarConflicts: this.calendarConflicts.length
        };
    }

    // Add note with timestamp
    addNote(note) {
        this.notes += `${new Date().toISOString()}: ${note}\n`;
    }

    // Log events to file
    logEvent(event) {
        const timestamp = new Date().toISOString();
        const logFile = path.join(__dirname, '..', 'logs', `calendar-taskmaster-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, `${timestamp}: Block ${this.blockId} - ${event}\n`);
    }

    // Get efficiency calculation
    getEfficiency() {
        if (!this.started || !this.completed) return null;
        const totalInterruptionTime = this.interruptions.reduce((sum, int) => sum + int.duration, 0);
        const focusTime = this.actualDuration - totalInterruptionTime;
        return this.actualDuration > 0 ? (focusTime / this.actualDuration) * 100 : 0;
    }

    // Convert to JSON for storage
    toJSON() {
        return {
            blockId: this.blockId,
            originalBlock: this.originalBlock,
            started: this.started,
            completed: this.completed,
            actualDuration: this.actualDuration,
            notes: this.notes,
            interruptions: this.interruptions,
            calendarConflicts: this.calendarConflicts,
            energy: this.energy,
            focus: this.focus,
            outcomes: this.outcomes,
            challenges: this.challenges,
            adjustments: this.adjustments,
            rescheduled: this.rescheduled,
            originalStartTime: this.originalStartTime
        };
    }
}

// Enhanced Taskmaster with calendar awareness
class CalendarAwareTaskmaster {
    constructor() {
        this.storage = new PlanStorage();
        this.calendarPlanner = new CalendarAwarePlanner();
        this.activeExecution = null;
        this.executionHistory = [];
    }

    // Start daily execution with calendar check
    async startDayWithCalendarCheck(date) {
        const dateStr = date || new DateIndex().toString();
        console.log(`\n🌅 Starting calendar-aware task execution for ${dateStr}`);

        // Get daily plan
        const dayPlan = this.storage.getDayPlan(dateStr);
        if (!dayPlan) {
            console.log(`❌ No daily plan found for ${dateStr}. Create one first with fractal-planner.cjs`);
            return null;
        }

        // Check all time blocks for conflicts upfront
        console.log(`🔍 Checking all ${dayPlan.timeBlocks.length} time blocks for calendar conflicts...`);
        
        let totalConflicts = 0;
        for (let block of dayPlan.timeBlocks) {
            const execution = new CalendarAwareTimeBlockExecution(block, dayPlan, this.calendarPlanner);
            const conflicts = await execution.checkCalendarConflicts();
            totalConflicts += conflicts.length;
            
            if (conflicts.length > 0) {
                console.log(`⚠️  "${block.title}" has ${conflicts.length} conflict(s)`);
            }
        }

        if (totalConflicts === 0) {
            console.log(`✅ No calendar conflicts found! All time blocks are clear.`);
        } else {
            console.log(`⚠️  Found ${totalConflicts} total calendar conflicts that will need resolution.`);
        }

        console.log(`\n📋 Today's time blocks:`);
        dayPlan.timeBlocks.forEach((block, index) => {
            const endTime = this.getBlockEndTime(block);
            console.log(`${index + 1}. ${block.startTime} - ${endTime}: ${block.title} (${block.duration}min)`);
        });

        return { dayPlan, totalConflicts };
    }

    // Execute specific block with calendar awareness
    async executeBlockWithCalendar(blockId, date) {
        const dateStr = date || new DateIndex().toString();
        const dayPlan = this.storage.getDayPlan(dateStr);
        
        if (!dayPlan) {
            console.log(`❌ No daily plan found for ${dateStr}`);
            return null;
        }

        const timeBlock = dayPlan.timeBlocks.find(block => 
            block.id === blockId || block.title.toLowerCase().includes(blockId.toLowerCase())
        );

        if (!timeBlock) {
            console.log(`❌ Time block "${blockId}" not found`);
            return null;
        }

        const execution = new CalendarAwareTimeBlockExecution(timeBlock, dayPlan, this.calendarPlanner);
        this.activeExecution = execution;

        console.log(`\n⏰ Executing: "${timeBlock.title}"`);
        console.log(`🕐 Planned time: ${timeBlock.startTime} - ${this.getBlockEndTime(timeBlock)}`);
        
        const result = await execution.startWithCalendarCheck();
        
        if (result.started) {
            console.log(`\n✅ Block started successfully!`);
            console.log(`⏱️  Duration: ${timeBlock.duration} minutes`);
            console.log(`🎯 Alignment: ${timeBlock.alignment || 'Not specified'}`);
            console.log(`\n💡 To complete this block, run:`);
            console.log(`   node scripts/calendar-aware-taskmaster.cjs complete ${blockId}`);
        } else if (result.rescheduled) {
            console.log(`\n🔄 Block rescheduled to ${result.newTime}`);
            console.log(`⏰ Set a reminder to run this command at the new time:`);
            console.log(`   node scripts/calendar-aware-taskmaster.cjs block ${blockId}`);
        } else if (result.skipped) {
            console.log(`\n⏭️  Block skipped: ${result.reason}`);
        }

        return result;
    }

    // Complete active block
    completeActiveBlock(outcomes, energy, focus) {
        if (!this.activeExecution) {
            console.log(`❌ No active block to complete`);
            return null;
        }

        const result = this.activeExecution.complete(outcomes, energy, focus);
        this.executionHistory.push(this.activeExecution);
        
        console.log(`✅ Completed: "${this.activeExecution.originalBlock.title}"`);
        console.log(`⏱️  Actual duration: ${result.actualDuration} minutes`);
        
        if (result.efficiency !== null) {
            console.log(`📊 Efficiency: ${Math.round(result.efficiency)}%`);
        }

        if (result.calendarConflicts > 0) {
            console.log(`📅 Note: Worked through ${result.calendarConflicts} calendar conflict(s)`);
        }

        this.activeExecution = null;
        return result;
    }

    // Quick conflict check for current time
    async checkCurrentTimeConflicts() {
        const now = new Date();
        const currentTime = now.toTimeString().substr(0, 5); // HH:MM
        const dateStr = new DateIndex(now).toString();

        const calendarEvents = await this.calendarPlanner.getCalendarEvents(dateStr);
        const activeEvents = calendarEvents.filter(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);
            return now >= eventStart && now <= eventEnd;
        });

        if (activeEvents.length > 0) {
            console.log(`\n📅 You are currently in ${activeEvents.length} calendar event(s):`);
            activeEvents.forEach(event => {
                console.log(`   • ${event.summary}`);
            });
            return activeEvents;
        } else {
            console.log(`✅ No active calendar events right now`);
            return [];
        }
    }

    // Get block end time
    getBlockEndTime(block) {
        const startMinutes = this.timeToMinutes(block.startTime);
        const endMinutes = startMinutes + block.duration;
        return this.minutesToTime(endMinutes);
    }

    // Utility functions
    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    minutesToTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const taskmaster = new CalendarAwareTaskmaster();

    switch (command) {
        case 'start': {
            const date = args[1];
            await taskmaster.startDayWithCalendarCheck(date);
            break;
        }

        case 'block': {
            const blockId = args[1];
            const date = args[2];
            
            if (!blockId) {
                console.log('❌ Please specify a block ID or title');
                break;
            }
            
            await taskmaster.executeBlockWithCalendar(blockId, date);
            break;
        }

        case 'complete': {
            const outcomes = args[1] || '';
            const energy = args[2] ? parseInt(args[2]) : null;
            const focus = args[3] ? parseInt(args[3]) : null;
            
            taskmaster.completeActiveBlock(outcomes, energy, focus);
            break;
        }

        case 'conflict-check': {
            await taskmaster.checkCurrentTimeConflicts();
            break;
        }

        case 'status': {
            console.log('\n📊 Calendar-Aware Taskmaster Status');
            
            if (taskmaster.activeExecution) {
                const block = taskmaster.activeExecution.originalBlock;
                console.log(`🔄 Active: "${block.title}" (started ${taskmaster.activeExecution.started})`);
            } else {
                console.log(`💤 No active block`);
            }

            await taskmaster.checkCurrentTimeConflicts();
            break;
        }

        default:
            console.log(`
📅 Calendar-Aware Taskmaster

Commands:
  start [date]              - Start executing time blocks with calendar check
  block <blockId> [date]    - Execute specific block with conflict detection
  complete [outcomes]       - Complete active block
  conflict-check            - Check for current calendar conflicts
  status                    - Show execution status with calendar info

Examples:
  node scripts/calendar-aware-taskmaster.cjs start
  node scripts/calendar-aware-taskmaster.cjs block "Deep Work"
  node scripts/calendar-aware-taskmaster.cjs complete "Completed React component"
  node scripts/calendar-aware-taskmaster.cjs status
            `);
    }
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}

module.exports = { CalendarAwareTaskmaster, CalendarAwareTimeBlockExecution };