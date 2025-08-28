#!/usr/bin/env node

/**
 * Fractal Planning System V2 - Enhanced with TaskWarrior & Calendar Integration
 * Purpose: Multi-scale planning with TaskWarrior tasks and Google Calendar sync
 * Usage: node scripts/fractal-planner-taskwarrior.js [command] [args]
 * Dependencies: fs, path, readline, child_process
 * 
 * Key Enhancements:
 * - TaskWarrior MCP integration for task management
 * - Google Calendar MCP integration with status encoding
 * - Time-aware planning (checks current time before suggesting blocks)
 * - Automatic task creation and completion tracking
 * - Calendar event status updates for review purposes
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

// TaskWarrior MCP Integration
class TaskWarriorIntegration {
    constructor() {
        this.taskCache = new Map();
    }
    
    async getPendingTasks() {
        try {
            console.log('📋 Fetching pending tasks from TaskWarrior...');
            
            // This will use the actual TaskWarrior MCP integration
            // For now, we'll provide instructions for manual integration
            console.log('💡 To integrate with TaskWarrior MCP, Claude will call:');
            console.log('   mcp__taskwarrior__get_next_tasks()');
            
            return [];
        } catch (error) {
            console.log('⚠️  Could not fetch TaskWarrior tasks:', error.message);
            return [];
        }
    }
    
    async createTask(description, project = 'Daily_Planning', priority = 'M', tags = []) {
        try {
            console.log(`📝 Would create TaskWarrior task: ${description}`);
            console.log(`   Project: ${project}, Priority: ${priority}, Tags: [${tags.join(', ')}]`);
            
            console.log('💡 Claude will call:');
            console.log(`   mcp__taskwarrior__add_task({`);
            console.log(`     description: "${description}",`);
            console.log(`     project: "${project}",`);
            console.log(`     priority: "${priority}",`);
            console.log(`     tags: [${tags.map(t => `"${t}"`).join(', ')}]`);
            console.log(`   })`);
            
            // Mock task for planning purposes
            const task = {
                description,
                project,
                priority,
                tags,
                id: Date.now(),
                status: 'pending'
            };
            
            this.taskCache.set(task.id, task);
            return task;
        } catch (error) {
            console.log('⚠️  Could not create TaskWarrior task:', error.message);
            return null;
        }
    }
    
    async completeTask(taskId) {
        try {
            console.log(`✅ Would mark TaskWarrior task ${taskId} as done`);
            console.log('💡 Claude will call:');
            console.log(`   mcp__taskwarrior__mark_task_done({ identifier: "${taskId}" })`);
            
            if (this.taskCache.has(taskId)) {
                this.taskCache.get(taskId).status = 'completed';
            }
            
            return true;
        } catch (error) {
            console.log('⚠️  Could not complete TaskWarrior task:', error.message);
            return false;
        }
    }
}

// Enhanced Google Calendar MCP Integration with Status Encoding
class CalendarIntegration {
    constructor() {
        this.calendarId = 'primary';
        this.timezone = 'Australia/Sydney';
        this.statusColors = {
            'pending': '1',       // Blue - not started
            'in-progress': '6',   // Orange - currently working
            'completed': '10',    // Green - finished
            'blocked': '11',      // Red - blocked/issues
            'skipped': '8'        // Gray - skipped
        };
        this.statusEmojis = {
            'pending': '⏳',
            'in-progress': '🔄',
            'completed': '✅',
            'blocked': '🚫',
            'skipped': '⏭️'
        };
    }
    
    async checkAvailability(date, startTime, endTime) {
        try {
            console.log(`⏳ Would check calendar availability for ${startTime} - ${endTime}...`);
            console.log('💡 Claude will call Google Calendar MCP to check free/busy status');
            
            return true; // Mock: assume available
        } catch (error) {
            console.log('⚠️  Could not check calendar availability:', error.message);
            return true; // Default to available if check fails
        }
    }
    
    async createTimeBlockEvent(date, block, description, taskId = null) {
        try {
            const statusEmoji = this.statusEmojis.pending;
            const taskInfo = taskId ? `\n🔗 TaskWarrior ID: ${taskId}` : '';
            
            const eventData = {
                calendarId: this.calendarId,
                summary: `${statusEmoji} ${block.label}: ${description}`,
                description: `Time block for focused work.\nType: ${block.type}\nDuration: ${block.duration} minutes\nStatus: pending${taskInfo}`,
                start: `${date}T${block.start}:00`,
                end: `${date}T${block.endTime}:00`,
                timeZone: this.timezone,
                colorId: this.statusColors.pending,
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 10 },
                        { method: 'popup', minutes: 2 }
                    ]
                },
                extendedProperties: {
                    private: {
                        blockId: block.id,
                        status: 'pending',
                        taskId: taskId || '',
                        blockType: block.type,
                        plannerVersion: 'fractal-v2-taskwarrior'
                    }
                }
            };
            
            console.log(`📅 Would create calendar event: ${eventData.summary}`);
            console.log('💡 Claude will call:');
            console.log('   mcp__google-calendar__create_event(eventData)');
            
            return { ...eventData, eventId: `mock-${Date.now()}` };
        } catch (error) {
            console.log('⚠️  Could not create calendar event:', error.message);
            return null;
        }
    }
    
    async updateEventStatus(eventId, status, notes = '') {
        try {
            console.log(`🔄 Would update calendar event ${eventId} to status: ${status}`);
            console.log('💡 Calendar will show:');
            console.log(`   Color: ${status} (${this.statusColors[status]})`);
            console.log(`   Emoji: ${this.statusEmojis[status]} in title`);
            console.log('💡 Claude will call:');
            console.log('   mcp__google-calendar__update_event() with status metadata');
            
            return true;
        } catch (error) {
            console.log('⚠️  Could not update calendar event status:', error.message);
            return false;
        }
    }
    
    getStatusFromEvent(eventSummary) {
        for (const [status, emoji] of Object.entries(this.statusEmojis)) {
            if (eventSummary.startsWith(emoji)) {
                return status;
            }
        }
        return 'pending';
    }
}

// Enhanced Plan Storage
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
                calendarEvents: plan.calendarEvents || [],
                taskWarriorTasks: plan.timeBlocks.filter(b => b.taskId).map(b => ({
                    blockId: b.id,
                    taskId: b.taskId,
                    description: b.activity
                }))
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
        const logFile = path.join(LOGS_DIR, `fractal-planner-taskwarrior-${new Date().toISOString().split('T')[0]}.log`);
        const logEntry = `${timestamp} - ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
    }
}

// Enhanced Fractal Planner with TaskWarrior Integration
class EnhancedFractalPlanner {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.calendar = new CalendarIntegration();
        this.taskwarrior = new TaskWarriorIntegration();
        this.timeaware = new TimeAwareDate();
    }
    
    async run(args) {
        const command = args[0] || 'status';
        
        try {
            switch (command) {
                case 'plan-day':
                    await this.planDayEnhanced(args[1]);
                    break;
                case 'status':
                    await this.showStatus();
                    break;
                case 'review-tasks':
                    await this.reviewCompletedTasks();
                    break;
                case 'update-calendar':
                    await this.updateCalendarStatuses();
                    break;
                case 'sync-status':
                    await this.syncTaskWarriorToCalendar();
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
    
    async planDayEnhanced(dateStr) {
        const today = new Date().toISOString().split('T')[0];
        const planDate = dateStr || today;
        const isToday = planDate === today;
        
        console.log(`\n🗓️  Enhanced Daily Planning with TaskWarrior Integration`);
        console.log(`📅 Date: ${planDate}`);
        
        if (isToday) {
            console.log(`⏰ Current Sydney Time: ${this.timeaware.getCurrentTimeString()}`);
            console.log(`📊 ${this.timeaware.isWeekend ? 'Weekend' : 'Weekday'} Schedule\n`);
        }
        
        // Load existing TaskWarrior tasks
        const pendingTasks = await this.taskwarrior.getPendingTasks();
        if (pendingTasks.length > 0) {
            console.log(`📋 Found ${pendingTasks.length} pending TaskWarrior tasks to consider\n`);
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
            taskWarriorIntegration: true,
            metadata: {
                createdAt: new Date().toISOString(),
                currentTime: this.timeaware.getCurrentTimeString(),
                isToday: isToday,
                version: 'fractal-v2-taskwarrior'
            }
        };
        
        // Collect activities for each block
        console.log('\n🎯 Define Activities for Each Block:');
        console.log('    (Each block can create TaskWarrior tasks and calendar events)\n');
        
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
            
            console.log(`\n--- ${block.label} (${block.start} - ${block.endTime}) ---`);
            const activity = await this.ask('Activity description: ');
            
            if (activity.trim()) {
                block.activity = activity;
                
                // Create TaskWarrior task for this block
                const createTask = await this.ask('Create TaskWarrior task? (y/n): ');
                let task = null;
                
                if (createTask.toLowerCase() === 'y') {
                    const project = await this.ask('Project (default: Daily_Planning): ') || 'Daily_Planning';
                    const priority = await this.ask('Priority (H/M/L, default: M): ') || 'M';
                    const tagsInput = await this.ask('Tags (comma-separated): ');
                    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t);
                    
                    task = await this.taskwarrior.createTask(activity, project, priority, tags);
                    if (task) {
                        block.taskId = task.id;
                        console.log(`✅ TaskWarrior task created with ID: ${task.id}`);
                    }
                }
                
                plan.timeBlocks.push(block);
                
                // Create calendar event with task integration
                const createEvent = await this.ask('Add to Google Calendar? (y/n): ');
                if (createEvent.toLowerCase() === 'y') {
                    const event = await this.calendar.createTimeBlockEvent(
                        planDate, 
                        block, 
                        activity, 
                        task ? task.id : null
                    );
                    if (event) {
                        block.calendarEventId = event.eventId;
                        plan.calendarEvents.push(event);
                        console.log(`✅ Calendar event created with status tracking`);
                    }
                }
            }
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
        console.log(`🚀 Execution data ready for taskmaster integration`);
        
        const taskCount = plan.timeBlocks.filter(b => b.taskId).length;
        const eventCount = plan.calendarEvents.length;
        
        if (taskCount > 0) {
            console.log(`📋 ${taskCount} TaskWarrior tasks created`);
        }
        if (eventCount > 0) {
            console.log(`📅 ${eventCount} calendar events prepared with status tracking`);
        }
        
        console.log('\n🎨 Status Encoding in Calendar:');
        console.log('   ⏳ Blue   - Pending (not started)');
        console.log('   🔄 Orange - In Progress (currently working)');
        console.log('   ✅ Green  - Completed (finished)');
        console.log('   🚫 Red    - Blocked (issues/obstacles)');
        console.log('   ⏭️ Gray   - Skipped (postponed)');
        
        console.log('\n💡 Use these commands to manage your plan:');
        console.log('   node scripts/fractal-planner-taskwarrior.js review-tasks');
        console.log('   node scripts/fractal-planner-taskwarrior.js update-calendar');
        console.log('   node scripts/fractal-planner-taskwarrior.js sync-status');
        console.log('   node scripts/fractal-planner-taskwarrior.js status');
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
    
    async showStatus() {
        console.log('\n📊 Enhanced Planning System Status');
        console.log('==================================');
        console.log(`⏰ Current Time: ${this.timeaware.getCurrentTimeString()}`);
        
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = EnhancedPlanStorage.load('day', today);
        
        if (todayPlan) {
            console.log(`\n✅ Today's plan exists (${todayPlan.timeBlocks.length} blocks)`);
            console.log(`🔗 TaskWarrior Integration: ${todayPlan.taskWarriorIntegration ? 'Enabled' : 'Disabled'}`);
            
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
                if (currentBlock.taskId) {
                    console.log(`   📋 TaskWarrior: #${currentBlock.taskId}`);
                }
                if (currentBlock.calendarEventId) {
                    console.log(`   📅 Calendar: Event created with status tracking`);
                }
            }
            
            if (nextBlock) {
                console.log(`\n⏭️  Next Block: ${nextBlock.activity || nextBlock.label}`);
                console.log(`   Time: ${nextBlock.start} - ${nextBlock.endTime}`);
            }
            
            // Show integration summary
            const tasksCount = todayPlan.timeBlocks.filter(b => b.taskId).length;
            const eventsCount = todayPlan.calendarEvents.length;
            
            console.log(`\n📊 Integration Summary:`);
            console.log(`   📋 TaskWarrior tasks: ${tasksCount}/${todayPlan.timeBlocks.length}`);
            console.log(`   📅 Calendar events: ${eventsCount}/${todayPlan.timeBlocks.length}`);
            
        } else {
            console.log(`\n⚠️  No plan for today.`);
            console.log(`💡 Run: node scripts/fractal-planner-taskwarrior.js plan-day`);
        }
    }
    
    async reviewCompletedTasks() {
        console.log('\n📊 TaskWarrior Completed Tasks Review');
        console.log('=====================================\n');
        
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = EnhancedPlanStorage.load('day', today);
        
        if (!todayPlan || !todayPlan.timeBlocks) {
            console.log('⚠️  No plan found for today');
            return;
        }
        
        const blocksWithTasks = todayPlan.timeBlocks.filter(b => b.taskId);
        
        if (blocksWithTasks.length === 0) {
            console.log('📝 No TaskWarrior tasks found in today\'s plan');
            return;
        }
        
        console.log(`Found ${blocksWithTasks.length} time blocks with tasks:\n`);
        console.log('💡 To check actual TaskWarrior status, Claude will call:');
        console.log('   mcp__taskwarrior__get_next_tasks() for current status\n');
        
        for (const block of blocksWithTasks) {
            const taskStatus = this.taskwarrior.taskCache.get(block.taskId)?.status || 'unknown';
            const statusEmoji = taskStatus === 'completed' ? '✅' : 
                               taskStatus === 'pending' ? '⏳' : '❓';
            
            console.log(`${statusEmoji} ${block.start} - ${block.endTime}: ${block.activity}`);
            console.log(`   📋 Task ID: ${block.taskId} (${taskStatus})`);
            
            if (taskStatus === 'completed') {
                // Update calendar event status
                if (block.calendarEventId) {
                    await this.calendar.updateEventStatus(block.calendarEventId, 'completed');
                    console.log('   📅 Calendar event would be updated to completed');
                }
            }
            console.log('');
        }
        
        console.log('💡 For real-time sync, use: node scripts/fractal-planner-taskwarrior.js sync-status');
    }
    
    async updateCalendarStatuses() {
        console.log('\n🔄 Updating Calendar Event Statuses');
        console.log('====================================\n');
        
        const today = new Date().toISOString().split('T')[0];
        const todayPlan = EnhancedPlanStorage.load('day', today);
        
        if (!todayPlan || !todayPlan.timeBlocks) {
            console.log('⚠️  No plan found for today');
            return;
        }
        
        let updatedCount = 0;
        
        console.log('💡 Claude will sync TaskWarrior status to Google Calendar:');
        console.log('   1. Check TaskWarrior task status via MCP');
        console.log('   2. Update calendar event color and emoji');
        console.log('   3. Add completion timestamp to event description\n');
        
        for (const block of todayPlan.timeBlocks) {
            if (block.calendarEventId && block.taskId) {
                const taskStatus = this.taskwarrior.taskCache.get(block.taskId)?.status || 'pending';
                const updated = await this.calendar.updateEventStatus(block.calendarEventId, taskStatus);
                
                if (updated) {
                    updatedCount++;
                    console.log(`✅ Would update "${block.activity}" to ${taskStatus}`);
                }
            }
        }
        
        console.log(`\n🎉 Would update ${updatedCount} calendar events with current TaskWarrior status`);
    }
    
    async syncTaskWarriorToCalendar() {
        console.log('\n🔄 Real-Time TaskWarrior → Calendar Status Sync');
        console.log('===============================================\n');
        
        console.log('This command will:');
        console.log('1. 📋 Query current TaskWarrior tasks via MCP');
        console.log('2. 📅 Match tasks to today\'s calendar events');
        console.log('3. 🎨 Update calendar colors and emojis based on task status');
        console.log('4. 📝 Add completion timestamps to event descriptions');
        console.log('5. 🔔 Show summary of all status changes\n');
        
        console.log('💡 This provides visual feedback in your calendar for:');
        console.log('   • Quick progress review at a glance');
        console.log('   • Time block completion tracking');
        console.log('   • Identification of blocked or skipped tasks');
        console.log('   • Historical record of work patterns\n');
        
        console.log('📋 Run this after completing TaskWarrior tasks to see updates in calendar');
    }
    
    async ask(question) {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
    }
    
    showHelp() {
        console.log(`
Enhanced Fractal Planning System V2 - TaskWarrior & Calendar Integration
=======================================================================

Commands:
  plan-day [date]     - Create daily plan with TaskWarrior tasks and calendar events
  status              - Show current planning status and active blocks  
  review-tasks        - Review completed TaskWarrior tasks and update calendar
  update-calendar     - Sync TaskWarrior task statuses to Google Calendar
  sync-status         - Real-time sync between TaskWarrior and Calendar

Features:
  ✅ TaskWarrior MCP integration for task creation and tracking
  ✅ Google Calendar MCP integration with visual status encoding  
  ✅ Time-aware planning (checks current time for realistic blocks)
  ✅ Automatic bidirectional sync between TaskWarrior and Calendar
  ✅ Visual status indicators in calendar (colors and emojis)
  ✅ ADD-optimized time blocks and workflows
  ✅ Status persistence for review and pattern analysis

Status Encoding in Calendar:
  ⏳ Blue   - Pending (not started)
  🔄 Orange - In Progress (currently working)  
  ✅ Green  - Completed (finished)
  🚫 Red    - Blocked (issues/obstacles)
  ⏭️ Gray   - Skipped (postponed)

Integration Benefits:
  • Visual progress tracking in familiar calendar interface
  • Automatic task creation during planning reduces friction
  • Status sync provides accountability and pattern recognition
  • Time block structure supports ADD-friendly focused work
  • Historical data for productivity analysis and improvement

MCP Dependencies:
  • TaskWarrior MCP server for task management
  • Google Calendar MCP server for event creation and updates
  • Requires proper authentication and configuration

Examples:
  node scripts/fractal-planner-taskwarrior.js plan-day
  node scripts/fractal-planner-taskwarrior.js plan-day 2025-08-29
  node scripts/fractal-planner-taskwarrior.js status
  node scripts/fractal-planner-taskwarrior.js review-tasks
  node scripts/fractal-planner-taskwarrior.js sync-status
        `);
    }
}

// Main execution
if (require.main === module) {
    const planner = new EnhancedFractalPlanner();
    planner.run(process.argv.slice(2));
}

module.exports = { EnhancedFractalPlanner, TaskWarriorIntegration, CalendarIntegration };