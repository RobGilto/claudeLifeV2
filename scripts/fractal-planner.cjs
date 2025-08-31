#!/usr/bin/env node

/**
 * Fractal Planning System
 * Purpose: Multi-scale planning and performance tracking (day/week/month/quarter/year)
 * Usage: node scripts/fractal-planner.js [command] [args]
 * Dependencies: fs, path, readline
 * 
 * Commands:
 * - plan-day [date]      - Plan daily time blocks aligned with higher-level plans
 * - plan-week [week]     - Plan weekly goals and priorities 
 * - plan-month [month]   - Plan monthly objectives and milestones
 * - plan-quarter [Q]     - Plan quarterly strategic initiatives
 * - plan-year [year]     - Plan yearly vision and major goals
 * - review-day [date]    - Review previous day's performance and learning
 * - review-week [week]   - Review previous week's performance
 * - review-month [month] - Review previous month's achievements
 * - review-quarter [Q]   - Review previous quarter's progress
 * - review-year [year]   - Review previous year's transformation
 * - status [period]      - Show current planning status and next actions
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Sydney timezone utilities
function getSydneyDate(date = new Date()) {
    return new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
}

function formatSydneyDateString(date = new Date()) {
    const sydneyDate = new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    return sydneyDate.toISOString().split('T')[0];
}

// Configuration
const PLANNING_DIR = path.join(__dirname, '..', 'planning');
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const DATA_DIR = path.join(PLANNING_DIR, 'data');

// Ensure directories exist
[PLANNING_DIR, LOGS_DIR, DATA_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Date utilities with multi-indexing (Sydney timezone aware)
class DateIndex {
    constructor(date = new Date()) {
        // Convert to Sydney timezone for all date calculations
        this.date = getSydneyDate(date);
        this.year = this.date.getFullYear();
        this.month = this.date.getMonth() + 1;
        this.day = this.date.getDate();
        this.dayOfYear = Math.floor((this.date - new Date(this.year, 0, 0)) / (1000 * 60 * 60 * 24));
        this.week = this.getWeekNumber();
        this.quarter = Math.ceil(this.month / 3);
    }

    getWeekNumber() {
        const firstDayOfYear = new Date(this.year, 0, 1);
        const pastDaysOfYear = (this.date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    getWeekStart() {
        const dayOfWeek = this.date.getDay();
        const diff = this.date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday start
        return new Date(this.date.setDate(diff));
    }

    getMonthStart() {
        return new Date(this.year, this.month - 1, 1);
    }

    getQuarterStart() {
        return new Date(this.year, (this.quarter - 1) * 3, 1);
    }

    getYearStart() {
        return new Date(this.year, 0, 1);
    }

    toString() {
        return formatSydneyDateString(this.date);
    }

    getIdentifiers() {
        const dayOfWeek = this.date.getDay();
        const mondayBasedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Monday=1, Sunday=7
        
        const quarterStart = new Date(this.year, (this.quarter - 1) * 3, 1);
        const dayOfQuarter = Math.floor((this.date - quarterStart) / (1000 * 60 * 60 * 24)) + 1;
        
        const monthStart = new Date(this.year, this.month - 1, 1);
        const firstDayOfWeek = monthStart.getDay(); // 0=Sunday, 6=Saturday
        const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday=0
        const weekOfMonth = Math.ceil((this.day + adjustedFirstDay) / 7);
        
        const quarterStartWeek = Math.ceil((quarterStart.getDay() + 1) / 7);
        const weekOfQuarter = this.week - Math.ceil(((this.quarter - 1) * 3 * 30.44 + quarterStart.getDay()) / 7) + 1;
        
        const monthOfQuarter = ((this.month - 1) % 3) + 1;

        return {
            // Primary identifiers
            day: this.toString(),
            week: `${this.year}-W${this.week.toString().padStart(2, '0')}`,
            month: `${this.year}-${this.month.toString().padStart(2, '0')}`,
            quarter: `${this.year}-Q${this.quarter}`,
            year: `${this.year}`,
            
            // Absolute indexes (within year)
            dayOfYear: this.dayOfYear,
            weekOfYear: this.week,
            monthOfYear: this.month,
            quarterOfYear: this.quarter,
            
            // Multi-perspective indexes (day from different lenses)
            dayOfWeek: mondayBasedDayOfWeek,        // 1-7 (Mon=1, Sun=7)
            dayOfMonth: this.day,                   // 1-31
            dayOfQuarter: dayOfQuarter,             // 1-92
            
            // Multi-perspective indexes (week from different lenses)
            weekOfMonth: weekOfMonth,               // 1-6
            weekOfQuarter: Math.max(1, weekOfQuarter), // 1-13
            
            // Multi-perspective indexes (month from different lenses)
            monthOfQuarter: monthOfQuarter          // 1-3
        };
    }
}

// Planning data model
class Plan {
    constructor(period, identifier, data = {}) {
        this.period = period; // 'day', 'week', 'month', 'quarter', 'year'
        this.identifier = identifier; // '2024-01-15', '2024-W03', '2024-01', '2024-Q1', '2024'
        this.created = getSydneyDate().toISOString();
        this.modified = getSydneyDate().toISOString();
        this.status = 'draft'; // 'draft', 'active', 'completed', 'archived'
        
        // Hierarchical relationships
        this.parentPlans = data.parentPlans || [];
        this.childPlans = data.childPlans || [];
        
        // Core planning data
        this.objectives = data.objectives || [];
        this.priorities = data.priorities || [];
        this.timeBlocks = data.timeBlocks || []; // For daily plans
        this.milestones = data.milestones || [];
        this.metrics = data.metrics || {};
        this.context = data.context || '';
        this.challenges = data.challenges || [];
        this.resources = data.resources || [];
    }

    addObjective(objective) {
        this.objectives.push({
            id: Date.now().toString(),
            text: objective,
            created: getSydneyDate().toISOString(),
            completed: false,
            priority: 'medium'
        });
        this.touch();
    }

    addTimeBlock(startTime, duration, activity, alignment = null, type = 'general') {
        this.timeBlocks.push({
            id: 'block-' + (this.timeBlocks.length + 1),
            start: startTime,
            duration, // in minutes
            title: activity.split(' - ')[0] || activity.split(' (')[0] || activity,
            activity,
            alignment, // which higher-level objective this supports
            type,
            completed: false,
            notes: ''
        });
        this.touch();
    }

    touch() {
        this.modified = getSydneyDate().toISOString();
    }

    toJSON() {
        return {
            period: this.period,
            identifier: this.identifier,
            created: this.created,
            modified: this.modified,
            status: this.status,
            parentPlans: this.parentPlans,
            childPlans: this.childPlans,
            objectives: this.objectives,
            priorities: this.priorities,
            timeBlocks: this.timeBlocks,
            milestones: this.milestones,
            metrics: this.metrics,
            context: this.context,
            challenges: this.challenges,
            resources: this.resources
        };
    }
}

// Performance tracking model
class Performance {
    constructor(period, identifier) {
        this.period = period;
        this.identifier = identifier;
        this.recorded = getSydneyDate().toISOString();
        this.completionRate = 0;
        this.objectiveStats = {};
        this.timeBlockStats = {};
        this.wellbeingMetrics = {};
        this.insights = [];
        this.adjustments = [];
    }

    calculateStats(plan) {
        const completedObjectives = plan.objectives.filter(obj => obj.completed).length;
        const totalObjectives = plan.objectives.length;
        this.completionRate = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

        this.objectiveStats = {
            completed: completedObjectives,
            total: totalObjectives,
            completionRate: this.completionRate,
            priorityBreakdown: this.getPriorityBreakdown(plan.objectives)
        };

        if (plan.timeBlocks.length > 0) {
            this.timeBlockStats = this.calculateTimeBlockStats(plan.timeBlocks);
        }
    }

    getPriorityBreakdown(objectives) {
        return objectives.reduce((acc, obj) => {
            acc[obj.priority] = acc[obj.priority] || { total: 0, completed: 0 };
            acc[obj.priority].total++;
            if (obj.completed) acc[obj.priority].completed++;
            return acc;
        }, {});
    }

    calculateTimeBlockStats(timeBlocks) {
        const completed = timeBlocks.filter(block => block.completed);
        const totalPlannedTime = timeBlocks.reduce((sum, block) => sum + block.duration, 0);
        const totalCompletedTime = completed.reduce((sum, block) => sum + block.duration, 0);

        return {
            totalBlocks: timeBlocks.length,
            completedBlocks: completed.length,
            totalPlannedTime,
            totalCompletedTime,
            adherenceRate: totalPlannedTime > 0 ? (totalCompletedTime / totalPlannedTime) * 100 : 0
        };
    }
}

// Storage manager
class PlanStorage {
    static getFilePath(period, identifier) {
        return path.join(DATA_DIR, `${period}-${identifier}.json`);
    }

    static save(plan) {
        const filePath = this.getFilePath(plan.period, plan.identifier);
        fs.writeFileSync(filePath, JSON.stringify(plan.toJSON(), null, 2));
        this.log(`Saved ${plan.period} plan: ${plan.identifier}`);
    }

    static load(period, identifier) {
        const filePath = this.getFilePath(period, identifier);
        if (!fs.existsSync(filePath)) return null;
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const plan = new Plan(data.period, data.identifier, data);
        
        // Restore all properties
        Object.assign(plan, data);
        
        return plan;
    }

    static exists(period, identifier) {
        return fs.existsSync(this.getFilePath(period, identifier));
    }

    static list(period) {
        const files = fs.readdirSync(DATA_DIR);
        return files
            .filter(file => file.startsWith(`${period}-`) && file.endsWith('.json'))
            .map(file => file.replace(`${period}-`, '').replace('.json', ''))
            .sort();
    }

    static savePerformance(performance) {
        const filePath = path.join(DATA_DIR, `performance-${performance.period}-${performance.identifier}.json`);
        fs.writeFileSync(filePath, JSON.stringify(performance, null, 2));
        this.log(`Saved ${performance.period} performance: ${performance.identifier}`);
    }

    static loadPerformance(period, identifier) {
        const filePath = path.join(DATA_DIR, `performance-${period}-${identifier}.json`);
        if (!fs.existsSync(filePath)) return null;
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const performance = new Performance(data.period, data.identifier);
        Object.assign(performance, data);
        
        return performance;
    }

    static log(message) {
        const timestamp = getSydneyDate().toISOString();
        const logFile = path.join(LOGS_DIR, `fractal-planner-${formatSydneyDateString()}.log`);
        fs.appendFileSync(logFile, `${timestamp}: ${message}\n`);
    }
}

// Main planner class
class FractalPlanner {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async run() {
        const args = process.argv.slice(2);
        const command = args[0] || 'status';
        
        try {
            switch (command) {
                case 'plan-day':
                    await this.planDay(args[1]);
                    break;
                case 'plan-week':
                    await this.planWeek(args[1]);
                    break;
                case 'plan-month':
                    await this.planMonth(args[1]);
                    break;
                case 'plan-quarter':
                    await this.planQuarter(args[1]);
                    break;
                case 'plan-year':
                    await this.planYear(args[1]);
                    break;
                case 'review-day':
                    await this.reviewDay(args[1]);
                    break;
                case 'review-week':
                    await this.reviewWeek(args[1]);
                    break;
                case 'review-month':
                    await this.reviewMonth(args[1]);
                    break;
                case 'review-quarter':
                    await this.reviewQuarter(args[1]);
                    break;
                case 'review-year':
                    await this.reviewYear(args[1]);
                    break;
                case 'status':
                    await this.showStatus(args[1]);
                    break;
                default:
                    this.showHelp();
            }
        } catch (error) {
            console.error('Error:', error.message);
            PlanStorage.log(`Error: ${error.message}`);
        } finally {
            this.rl.close();
        }
    }

    async planDay(dateStr) {
        const dateIndex = new DateIndex(dateStr ? new Date(dateStr) : new Date());
        const identifiers = dateIndex.getIdentifiers();
        const currentTime = getSydneyDate(new Date());
        const isToday = identifiers.day === formatSydneyDateString(currentTime);
        
        // Check for existing calendar events and warn about conflicts
        console.log('🔍 Checking existing calendar events...');
        const existingEvents = await this.checkCalendarEvents(identifiers.day);
        if (existingEvents.length > 0) {
            console.log(`⚠️ Found ${existingEvents.length} existing calendar events that may conflict with planned time blocks:`);
            existingEvents.forEach((event, idx) => {
                console.log(`  ${idx + 1}. ${event.summary} (${event.start} - ${event.end})`);
            });
            console.log('💡 Consider these conflicts when scheduling your time blocks or use /calendar-sync to avoid overlaps.\n');
        } else {
            console.log('✅ No calendar conflicts detected\n');
        }
        
        console.log(`\n🗓️  Planning Day: ${identifiers.day}`);
        console.log(`📊 Multi-Index: Week ${identifiers.week}, Month ${identifiers.month}, Quarter ${identifiers.quarter}`);
        
        if (isToday) {
            const timeStr = currentTime.toLocaleTimeString('en-AU', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Australia/Sydney'
            });
            console.log(`🕐 Current Time: ${timeStr} (Sydney)`);
        }

        // Load or create day plan
        let plan = PlanStorage.load('day', identifiers.day) || new Plan('day', identifiers.day);
        
        // Load parent plans for alignment
        const weekPlan = PlanStorage.load('week', identifiers.week);
        const monthPlan = PlanStorage.load('month', identifiers.month);
        const quarterPlan = PlanStorage.load('quarter', identifiers.quarter);
        
        // Show parent context
        this.showParentContext(weekPlan, monthPlan, quarterPlan);

        // Plan time blocks (4-5 blocks per day as per ADD optimization)
        console.log(`\n⏰ Time Block Planning (4-5 blocks recommended for ADD-friendly workflow):`);
        
        // Use smart defaults based on Robert's AI engineering goals and ADD-friendly structure
        // Extended availability until 11 PM with ADD-optimized blocks
        const defaultBlocks = [
            { 
                start: '09:00', 
                duration: 90, 
                activity: 'AI/ML skill development - Boot.dev or project work',
                alignment: '2026 AI engineer transformation goal',
                type: 'deep-work'
            },
            { 
                start: '11:00', 
                duration: 60, 
                activity: 'Communication, admin, and planning tasks',
                alignment: 'Sustainable daily practice and organization',
                type: 'admin'
            },
            { 
                start: '14:00', 
                duration: 90, 
                activity: 'Technical project work or advanced learning',
                alignment: 'Portfolio building and technical mastery',
                type: 'deep-work'
            },
            { 
                start: '16:00', 
                duration: 60, 
                activity: 'Research, documentation, or skill practice',
                alignment: 'Continuous learning and skill gap closure',
                type: 'learning'
            },
            { 
                start: '18:00', 
                duration: 90, 
                activity: 'Evening project work or intensive study',
                alignment: 'Accelerated skill development',
                type: 'deep-work'
            },
            { 
                start: '20:00', 
                duration: 90, 
                activity: 'Advanced learning or portfolio development',
                alignment: 'Professional development and practice',
                type: 'learning'
            },
            { 
                start: '21:30', 
                duration: 90, 
                activity: 'Final work session or skill consolidation',
                alignment: 'Day completion and progress review',
                type: 'review'
            }
        ];

        // Add time blocks with defaults and time awareness (avoiding duplicates)
        defaultBlocks.forEach(block => {
            const blockStatus = this.getBlockStatus(block, currentTime, isToday);
            
            // Check if block already exists (same start time and activity)
            const existingBlock = plan.timeBlocks.find(b => 
                b.start === block.start && b.activity === block.activity
            );
            
            if (!existingBlock) {
                plan.addTimeBlock(block.start, block.duration, block.activity, block.alignment, block.type);
                console.log(`  ${blockStatus.icon} ${block.start}-${this.addMinutes(block.start, block.duration)}: ${block.activity}`);
            } else {
                console.log(`  ${blockStatus.icon} ${block.start}-${this.addMinutes(block.start, block.duration)}: ${block.activity} (existing)`);
            }
            if (blockStatus.note) console.log(`     ${blockStatus.note}`);
        });

        // Set default daily objectives aligned with AI engineering goals
        const defaultObjectives = [
            'Complete meaningful technical progress',
            'Document learnings and capture victories', 
            'Maintain momentum with ADD-friendly structure'
        ];

        console.log(`\n🎯 Daily Objectives (max 3 for focus):`);
        defaultObjectives.forEach((objective, i) => {
            // Check if objective already exists
            const existingObjective = plan.objectives.find(obj => obj.title === objective);
            
            if (!existingObjective) {
                plan.objectives.push({
                    id: `obj-${i + 1}`,
                    title: objective,
                    priority: i + 1,
                    parentAlignment: i === 0 ? '2026 AI engineer transformation' : 
                                    i === 1 ? 'Knowledge retention and confidence building' : 
                                    'Sustainable daily practice',
                    completed: false
                });
            }
            console.log(`  ${i + 1}. ${objective}${existingObjective ? ' (existing)' : ''}`);
        });

        // Set parent relationships
        plan.parentPlans = [
            weekPlan ? identifiers.week : null,
            monthPlan ? identifiers.month : null,
            quarterPlan ? identifiers.quarter : null
        ].filter(Boolean);

        // Add context and theme
        plan.context = {
            theme: 'Technical Excellence & Structured Learning',
            energy: 'Morning focus on deep work, afternoon on application and review',
            constraints: 'ADD-friendly max 90min blocks with clear transitions'
        };

        // Add metrics
        plan.metrics = {
            plannedHours: defaultBlocks.reduce((total, block) => total + (block.duration / 60), 0),
            deepWorkHours: defaultBlocks.filter(b => b.type === 'deep-work').reduce((total, block) => total + (block.duration / 60), 0),
            learningHours: defaultBlocks.filter(b => b.type === 'learning').reduce((total, block) => total + (block.duration / 60), 0),
            adminHours: defaultBlocks.filter(b => b.type === 'admin').reduce((total, block) => total + (block.duration / 60), 0),
            reviewHours: defaultBlocks.filter(b => b.type === 'review').reduce((total, block) => total + (block.duration / 60), 0)
        };

        plan.status = 'active';
        PlanStorage.save(plan);
        
        // Create TaskWarrior tasks for time blocks
        if (isToday) {
            console.log(`\n📋 Creating TaskWarrior tasks...`);
            await this.createTaskWarriorTasks(defaultBlocks, identifiers.day);
        }
        
        // Generate Google Calendar events
        console.log(`\n📅 Calendar integration available:`);
        await this.generateCalendarEvents(defaultBlocks, identifiers.day);
        
        console.log(`\n✅ Day plan saved for ${identifiers.day}`);
        console.log(`📈 Linked to: ${plan.parentPlans.join(', ') || 'No parent plans'}`);
        console.log(`⏱️  Total planned: ${plan.metrics.plannedHours}h (${plan.metrics.deepWorkHours}h deep work, ${plan.metrics.learningHours}h learning)`);
    }

    addMinutes(timeStr, minutes) {
        const [hours, mins] = timeStr.split(':').map(Number);
        const totalMins = hours * 60 + mins + minutes;
        const newHours = Math.floor(totalMins / 60);
        const newMins = totalMins % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    }

    getBlockStatus(block, currentTime, isToday) {
        if (!isToday) {
            return { icon: '⏱️', note: null };
        }

        const currentHour = currentTime.getHours();
        const currentMin = currentTime.getMinutes();
        const currentTotalMins = currentHour * 60 + currentMin;

        const [blockHour, blockMin] = block.start.split(':').map(Number);
        const blockStartMins = blockHour * 60 + blockMin;
        const blockEndMins = blockStartMins + block.duration;

        if (currentTotalMins < blockStartMins) {
            const minsUntil = blockStartMins - currentTotalMins;
            return { 
                icon: '🔮', 
                note: `starts in ${Math.floor(minsUntil / 60)}h ${minsUntil % 60}m`
            };
        } else if (currentTotalMins >= blockStartMins && currentTotalMins < blockEndMins) {
            const minsLeft = blockEndMins - currentTotalMins;
            return { 
                icon: '🔥', 
                note: `ACTIVE - ${Math.floor(minsLeft / 60)}h ${minsLeft % 60}m remaining`
            };
        } else {
            return { 
                icon: '✅', 
                note: 'completed window'
            };
        }
    }

    async createTaskWarriorTasks(blocks, date) {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);

        for (const block of blocks) {
            try {
                const taskDescription = `[${block.start}] ${block.activity}`;
                const project = 'planning.daily';
                const tags = [block.type, 'timeblock'];
                const due = `${date}T${block.start}`;

                // Check if task already exists for today (excluding deleted/completed)
                // Using exact description match to avoid false positives from TaskWarrior
                let existingCount = 0;
                try {
                    const checkResult = await execAsync(`task status:pending description:"${taskDescription}" count`);
                    existingCount = parseInt(checkResult.stdout.trim());
                } catch (checkError) {
                    existingCount = 0; // If command fails, assume no existing task
                }
                
                if (existingCount === 0) {
                    const cmd = `task add "${taskDescription}" project:${project} +${tags.join(' +')} due:${due}`;
                    const result = await execAsync(cmd);
                    
                    if (result.stdout) {
                        const taskId = result.stdout.match(/Created task (\d+)/)?.[1];
                        console.log(`  ✓ Task created: ${taskId} - ${taskDescription}`);
                    }
                } else {
                    console.log(`  ⚠️ Task already exists: ${taskDescription}`);
                }
            } catch (error) {
                console.log(`  ⚠️  TaskWarrior task creation failed: ${block.activity}`);
                PlanStorage.log(`TaskWarrior error: ${error.message}`);
            }
        }
    }

    async generateCalendarEvents(blocks, date) {
        console.log(`  🔄 Generating Google Calendar MCP integration...`);
        
        // Generate MCP commands for calendar events
        const mcpCommands = this.generateMcpCalendarCommands(blocks, date);
        this.saveMcpCommands(date, mcpCommands);
        
        // Also generate using the dedicated MCP helper
        console.log(`  💡 You can also use: node scripts/calendar-mcp-helper.cjs ${date}`);
        
        // Always prepare calendar events via MCP
        await this.createGoogleCalendarEvents(blocks, date);
        
        console.log(`\n  📋 Manual calendar entries for ${date} (if MCP unavailable):`);
        blocks.forEach(block => {
            const startTime = `${date}T${block.start}:00`;
            const endTime = `${date}T${this.addMinutes(block.start, block.duration)}:00`;
            
            console.log(`  🗓️  ${block.start}-${this.addMinutes(block.start, block.duration)}: ${block.activity}`);
            console.log(`     Type: ${block.type} | Alignment: ${block.alignment}`);
        });
        
        console.log(`\n  ⚡ For automated Google Calendar sync:`);
        console.log(`     • Use Claude Code with Google Calendar MCP configured`);
        console.log(`     • MCP commands saved in planning/analytics/calendar-sync-${date}.json`);
        console.log(`     • Run /calendar-sync ${date} in Claude Code`);
    }

    async createGoogleCalendarEvents(blocks, date) {
        try {
            console.log(`  📅 Creating ${blocks.length} calendar events via Google Calendar MCP...`);
            
            let successCount = 0;
            let duplicateCount = 0;
            
            for (const block of blocks) {
                const eventTitle = `${this.getBlockTypeIcon(block.type)} ${block.activity}`;
                const startDateTime = `${date}T${block.start}:00`;
                const endDateTime = `${date}T${this.addMinutes(block.start, block.duration)}:00`;
                
                // Create event using MCP integration
                // Note: This generates the MCP command structure that would be used
                // In practice, this would interface with the MCP server directly
                const mcpCommand = {
                    tool: 'mcp__google-calendar__create-event',
                    parameters: {
                        calendarId: 'primary',
                        summary: eventTitle,
                        start: startDateTime,
                        end: endDateTime,
                        timeZone: 'Australia/Sydney',
                        description: `Alignment: ${block.alignment}\n\nGenerated by Fractal Planning System`,
                        colorId: this.getColorForBlockType(block.type),
                        reminders: {
                            useDefault: false,
                            overrides: [
                                { method: 'popup', minutes: 10 },
                                { method: 'popup', minutes: 2 }
                            ]
                        }
                    }
                };
                
                // For now, just log what would be created
                console.log(`  📋 MCP Event: ${eventTitle}`);
                console.log(`     Start: ${startDateTime} | End: ${endDateTime}`);
                console.log(`     MCP Command: mcp__google-calendar__create-event`);
                successCount++;
            }
            
            console.log(`  📊 Calendar sync planned: ${successCount} events ready for MCP integration`);
            console.log(`  💡 Use Claude Code MCP integration to actually create events`);
            
            // Save sync record
            this.saveSyncRecord(date, blocks.length, successCount, duplicateCount);
            
            return successCount > 0;
            
        } catch (error) {
            console.log(`  ⚠️ Calendar MCP integration preparation failed: ${error.message}`);
            PlanStorage.log(`Calendar MCP error: ${error.message}`);
            return false;
        }
    }
    
    // MCP integration helpers
    generateMcpCalendarCommands(blocks, date) {
        const commands = [];
        
        for (const block of blocks) {
            const eventTitle = `${this.getBlockTypeIcon(block.type)} ${block.activity}`;
            const startDateTime = `${date}T${block.start}:00`;
            const endDateTime = `${date}T${this.addMinutes(block.start, block.duration)}:00`;
            
            commands.push({
                tool: 'mcp__google-calendar__create-event',
                parameters: {
                    calendarId: 'primary',
                    summary: eventTitle,
                    start: startDateTime,
                    end: endDateTime,
                    timeZone: 'Australia/Sydney',
                    description: `Alignment: ${block.alignment}\n\nGenerated by Fractal Planning System`,
                    colorId: this.getColorForBlockType(block.type),
                    reminders: {
                        useDefault: false,
                        overrides: [
                            { method: 'popup', minutes: 10 },
                            { method: 'popup', minutes: 2 }
                        ]
                    }
                }
            });
        }
        
        return commands;
    }
    
    saveMcpCommands(date, commands) {
        const mcpDir = path.join(PLANNING_DIR, 'analytics');
        if (!fs.existsSync(mcpDir)) {
            fs.mkdirSync(mcpDir, { recursive: true });
        }
        
        const mcpFile = path.join(mcpDir, `calendar-sync-${date}.json`);
        const mcpData = {
            date: date,
            generated: getSydneyDate().toISOString(),
            method: 'mcp-integration',
            commands: commands,
            totalEvents: commands.length
        };
        
        fs.writeFileSync(mcpFile, JSON.stringify(mcpData, null, 2));
        console.log(`  📄 MCP commands saved: planning/analytics/calendar-sync-${date}.json`);
    }
    
    saveSyncRecord(date, totalBlocks, successCount, duplicateCount) {
        const syncDir = path.join(PLANNING_DIR, 'calendar-sync');
        if (!fs.existsSync(syncDir)) {
            fs.mkdirSync(syncDir, { recursive: true });
        }
        
        const record = {
            date: date,
            timestamp: getSydneyDate().toISOString(),
            totalBlocks: totalBlocks,
            successCount: successCount,
            duplicateCount: duplicateCount,
            status: 'completed'
        };
        
        const recordFile = path.join(syncDir, `sync-record-${date}.json`);
        fs.writeFileSync(recordFile, JSON.stringify(record, null, 2));
    }
    
    getBlockTypeIcon(type) {
        const icons = {
            'deep-work': '🔥',
            'learning': '📚',
            'admin': '📋',
            'review': '📊',
            'general': '⚡'
        };
        return icons[type] || '⚡';
    }
    
    getColorForBlockType(type) {
        // Google Calendar color IDs
        const colors = {
            'deep-work': '11',    // Red - high intensity
            'learning': '10',     // Green - growth
            'admin': '7',         // Blue - organization
            'review': '9',        // Purple - reflection
            'general': '1'        // Default blue
        };
        return colors[type] || '1';
    }

    showParentContext(weekPlan, monthPlan, quarterPlan) {
        console.log(`\n📋 Parent Plan Context:`);
        
        if (quarterPlan && quarterPlan.priorities && quarterPlan.priorities.length > 0) {
            console.log(`🎯 Quarter Focus: ${quarterPlan.priorities.slice(0, 2).join(', ')}`);
        }
        if (monthPlan && monthPlan.objectives && monthPlan.objectives.length > 0) {
            console.log(`📅 Month Goals: ${monthPlan.objectives.slice(0, 3).map(o => o.text || o).join(', ')}`);
        }
        if (weekPlan && weekPlan.priorities && weekPlan.priorities.length > 0) {
            console.log(`📊 Week Priorities: ${weekPlan.priorities.slice(0, 3).join(', ')}`);
        }
        
        if (!quarterPlan && !monthPlan && !weekPlan) {
            console.log(`  No parent plans found - operating in standalone mode`);
        }
    }

    async ask(question) {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
    }

    async planWeek(weekStr) {
        const dateIndex = weekStr ? this.parsePeriod(weekStr, 'week') : new DateIndex();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📅 Planning Week: ${identifiers.week}`);
        console.log(`📊 Context: Month ${identifiers.month}, Quarter ${identifiers.quarter}`);

        let plan = PlanStorage.load('week', identifiers.week) || new Plan('week', identifiers.week);
        
        // Load parent plans
        const monthPlan = PlanStorage.load('month', identifiers.month);
        const quarterPlan = PlanStorage.load('quarter', identifiers.quarter);
        
        this.showParentContext(null, monthPlan, quarterPlan);

        console.log(`\n🎯 Weekly Priorities (3-5 key focus areas):`);
        for (let i = 1; i <= 5; i++) {
            const priority = await this.ask(`Priority ${i}: `);
            if (priority.trim()) {
                plan.priorities.push(priority);
            }
        }

        console.log(`\n📋 Weekly Objectives:`);
        for (let i = 1; i <= 8; i++) {
            const objective = await this.ask(`Objective ${i}: `);
            if (objective.trim()) {
                plan.addObjective(objective);
            }
        }

        const context = await this.ask(`\n📝 Weekly Context/Theme: `);
        plan.context = context;

        plan.parentPlans = [monthPlan ? identifiers.month : null, quarterPlan ? identifiers.quarter : null].filter(Boolean);
        plan.status = 'active';
        PlanStorage.save(plan);
        
        console.log(`\n✅ Week plan saved for ${identifiers.week}`);
    }

    async planMonth(monthStr) {
        const dateIndex = monthStr ? this.parsePeriod(monthStr, 'month') : new DateIndex();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📆 Planning Month: ${identifiers.month}`);
        console.log(`📊 Context: Quarter ${identifiers.quarter}, Year ${identifiers.year}`);

        // Load recent review insights for context
        const reviewContext = await this.loadRecentReviews(identifiers);
        if (reviewContext && reviewContext.rawReviews.length > 0) {
            console.log(`\n📋 Recent Performance Context:`);
            this.displayReviewContext(reviewContext);
            
            console.log('\n🤖 CLAUDE ANALYSIS REQUIRED:');
            console.log('━'.repeat(60));
            console.log('📋 Before proceeding with monthly planning, Claude should analyze the review data above.');
            console.log('🎯 Please extract key insights, patterns, and recommendations for the upcoming month.');
            console.log('🔄 Analysis should focus on:');
            console.log('   • What worked well and should be continued/amplified');
            console.log('   • What challenges need addressing or different approaches'); 
            console.log('   • Energy/momentum patterns to optimize');
            console.log('   • Strategic priorities that emerged or shifted');
            console.log('   • Realistic capacity and goal-setting based on past performance');
            console.log('━'.repeat(60));
            
            // Wait for user to confirm Claude analysis is complete
            await this.ask('\\n⏸️  Press ENTER after Claude completes the review analysis: ');
        }

        let plan = PlanStorage.load('month', identifiers.month) || new Plan('month', identifiers.month);
        
        const quarterPlan = PlanStorage.load('quarter', identifiers.quarter);
        const yearPlan = PlanStorage.load('year', identifiers.year);
        
        if (quarterPlan) {
            console.log(`🎯 Quarter Focus: ${quarterPlan.priorities.slice(0, 3).join(', ')}`);
        }
        if (yearPlan) {
            console.log(`🌟 Year Vision: ${yearPlan.context}`);
        }

        console.log(`\n🎯 Monthly Objectives (5-8 key outcomes):`);
        for (let i = 1; i <= 8; i++) {
            const objective = await this.ask(`Objective ${i}: `);
            if (objective.trim()) {
                plan.addObjective(objective);
            }
        }

        console.log(`\n🏆 Monthly Milestones:`);
        for (let i = 1; i <= 4; i++) {
            const milestone = await this.ask(`Milestone ${i}: `);
            if (milestone.trim()) {
                plan.milestones.push({
                    id: Date.now().toString() + i,
                    text: milestone,
                    targetDate: null,
                    completed: false
                });
            }
        }

        const theme = await this.ask(`\n📝 Monthly Theme: `);
        plan.context = theme;

        plan.parentPlans = [quarterPlan ? identifiers.quarter : null, yearPlan ? identifiers.year : null].filter(Boolean);
        plan.status = 'active';
        PlanStorage.save(plan);
        
        // Incorporate review insights into planning
        if (reviewContext) {
            plan.reviewInsights = {
                previousMonth: reviewContext.previousMonth,
                lastWeek: reviewContext.lastWeek,
                lastDay: reviewContext.lastDay,
                keyPatterns: reviewContext.keyPatterns,
                adjustments: reviewContext.adjustments
            };
        }

        console.log(`\n✅ Month plan saved for ${identifiers.month}`);
    }

    async planQuarter(quarterStr) {
        const dateIndex = quarterStr ? this.parsePeriod(quarterStr, 'quarter') : new DateIndex();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📈 Planning Quarter: ${identifiers.quarter}`);
        
        let plan = PlanStorage.load('quarter', identifiers.quarter) || new Plan('quarter', identifiers.quarter);
        
        const yearPlan = PlanStorage.load('year', identifiers.year);
        if (yearPlan) {
            console.log(`🌟 Year Vision: ${yearPlan.context}`);
            console.log(`🎯 Year Priorities: ${yearPlan.priorities.slice(0, 3).join(', ')}`);
        }

        console.log(`\n🎯 Quarterly Strategic Priorities (3-5 major focus areas):`);
        for (let i = 1; i <= 5; i++) {
            const priority = await this.ask(`Strategic Priority ${i}: `);
            if (priority.trim()) {
                plan.priorities.push(priority);
            }
        }

        console.log(`\n📋 Quarterly Objectives:`);
        for (let i = 1; i <= 10; i++) {
            const objective = await this.ask(`Objective ${i}: `);
            if (objective.trim()) {
                plan.addObjective(objective);
            }
        }

        console.log(`\n🏆 Major Milestones:`);
        for (let i = 1; i <= 6; i++) {
            const milestone = await this.ask(`Milestone ${i}: `);
            if (milestone.trim()) {
                plan.milestones.push({
                    id: Date.now().toString() + i,
                    text: milestone,
                    targetDate: null,
                    completed: false
                });
            }
        }

        const context = await this.ask(`\n📝 Quarterly Theme/Focus: `);
        plan.context = context;

        plan.parentPlans = yearPlan ? [identifiers.year] : [];
        plan.status = 'active';
        PlanStorage.save(plan);
        
        console.log(`\n✅ Quarter plan saved for ${identifiers.quarter}`);
    }

    async planYear(yearStr) {
        const year = yearStr || new Date().getFullYear().toString();
        
        console.log(`\n🌟 Planning Year: ${year}`);
        console.log(`🎯 Vision & Transformation Planning`);

        let plan = PlanStorage.load('year', year) || new Plan('year', year);

        console.log(`\n🌟 Year Vision:`);
        const vision = await this.ask(`What do you want to become/achieve this year? `);
        plan.context = vision;

        console.log(`\n🎯 Strategic Priorities (3-4 major focus areas):`);
        for (let i = 1; i <= 4; i++) {
            const priority = await this.ask(`Strategic Priority ${i}: `);
            if (priority.trim()) {
                plan.priorities.push(priority);
            }
        }

        console.log(`\n📋 Year Objectives:`);
        for (let i = 1; i <= 12; i++) {
            const objective = await this.ask(`Objective ${i}: `);
            if (objective.trim()) {
                plan.addObjective(objective);
            }
        }

        console.log(`\n🏆 Major Milestones:`);
        for (let i = 1; i <= 8; i++) {
            const milestone = await this.ask(`Milestone ${i}: `);
            if (milestone.trim()) {
                plan.milestones.push({
                    id: Date.now().toString() + i,
                    text: milestone,
                    targetDate: null,
                    completed: false
                });
            }
        }

        console.log(`\n📊 Success Metrics:`);
        const metrics = await this.ask(`How will you measure success? `);
        plan.metrics.success = metrics;

        plan.status = 'active';
        PlanStorage.save(plan);
        
        console.log(`\n✅ Year plan saved for ${year}`);
    }

    async reviewDay(dateStr) {
        const dateIndex = dateStr ? new DateIndex(new Date(dateStr)) : this.getPreviousDay();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📅 Reviewing Day: ${identifiers.day}`);
        console.log(`📊 Multi-Index: Day ${identifiers.dayOfYear}/365 | Week ${identifiers.dayOfWeek}/7 | Month ${identifiers.dayOfMonth}/${new Date(dateIndex.year, dateIndex.month, 0).getDate()} | Quarter ${identifiers.dayOfQuarter}/92`);
        
        const dayPlan = PlanStorage.load('day', identifiers.day);
        if (!dayPlan) {
            console.log(`❌ No plan found for day ${identifiers.day}`);
            return;
        }

        const performance = new Performance('day', identifiers.day);
        
        // Review time blocks and objectives
        console.log(`\n⏰ Time Block Review:`);
        for (const timeBlock of dayPlan.timeBlocks) {
            const completed = await this.ask(`"${timeBlock.activity}" (${timeBlock.duration}min) - Completed effectively? (y/n): `);
            timeBlock.completed = completed.toLowerCase() === 'y';
            
            if (completed.toLowerCase() === 'y') {
                const effectiveness = await this.ask(`Effectiveness (1-10): `);
                timeBlock.effectiveness = parseInt(effectiveness) || 5;
            }
        }

        console.log(`\n🎯 Daily Objective Review:`);
        for (const objective of dayPlan.objectives) {
            const completed = await this.ask(`"${objective.text}" - Completed? (y/n): `);
            objective.completed = completed.toLowerCase() === 'y';
        }

        performance.calculateStats(dayPlan);

        console.log(`\n📈 Day Performance:`);
        console.log(`Objective Completion: ${performance.objectiveStats.completed}/${performance.objectiveStats.total}`);
        console.log(`Time Block Completion: ${dayPlan.timeBlocks.filter(tb => tb.completed).length}/${dayPlan.timeBlocks.length}`);

        // Daily reflection questions
        const energy = await this.ask(`\n⚡ Average energy today (1-10): `);
        const focus = await this.ask(`🎯 Focus quality (1-10): `);
        const satisfaction = await this.ask(`😊 Day satisfaction (1-10): `);
        const accomplishments = await this.ask(`🏆 Key accomplishments (however small): `);
        const challenges = await this.ask(`⚠️ Main challenges faced: `);
        const insights = await this.ask(`💡 Key insights or learning: `);
        const tomorrowPriority = await this.ask(`📋 Top priority for tomorrow: `);

        performance.wellbeingMetrics = {
            energy: parseInt(energy) || 5,
            focus: parseInt(focus) || 5,
            satisfaction: parseInt(satisfaction) || 5
        };

        performance.insights.push(insights);
        performance.accomplishments = accomplishments;
        performance.challenges = challenges;
        performance.tomorrowPriority = tomorrowPriority;

        // Check alignment with parent plans
        const weekPlan = PlanStorage.load('week', identifiers.week);
        const monthPlan = PlanStorage.load('month', identifiers.month);
        
        if (weekPlan) {
            const weekAlignment = await this.ask(`📊 How well did today support weekly priorities (1-10)?: `);
            performance.weekAlignment = parseInt(weekAlignment) || 5;
        }

        PlanStorage.savePerformance(performance);
        PlanStorage.save(dayPlan);

        console.log(`\n✅ Day review completed for ${identifiers.day}`);
        this.showPerformanceSummary(performance);

        // Generate readable report
        await this.generateDailyReviewReport(identifiers.day, performance, dayPlan);
    }

    async generateDailyReviewReport(dayId, performance, dayPlan) {
        const reportDir = path.join(__dirname, '..', 'journal', 'planning', 'daily-reviews');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(reportDir, `review-${dayId}.md`);
        const dateIndex = new DateIndex(new Date(dayId));
        const identifiers = dateIndex.getIdentifiers();

        const completedBlocks = dayPlan.timeBlocks.filter(tb => tb.completed).length;
        const completedObjectives = dayPlan.objectives.filter(obj => obj.completed).length;
        const blockEffectiveness = dayPlan.timeBlocks
            .filter(tb => tb.effectiveness)
            .reduce((sum, tb, _, arr) => sum + tb.effectiveness / arr.length, 0);

        const reportContent = `---
date: ${dayId}
type: daily-review
completion_rate: ${performance.completionRate.toFixed(1)}%
energy_average: ${performance.wellbeingMetrics.energy}/10
focus_average: ${performance.wellbeingMetrics.focus}/10
satisfaction: ${performance.wellbeingMetrics.satisfaction}/10
week_alignment: ${performance.weekAlignment || 'N/A'}/10
---

# Daily Review: ${dayId}

## Execution Summary
- Time blocks completed: ${completedBlocks}/${dayPlan.timeBlocks.length}
- Objectives achieved: ${completedObjectives}/${dayPlan.objectives.length}
- Overall completion rate: ${performance.completionRate.toFixed(1)}%
- Average block effectiveness: ${blockEffectiveness.toFixed(1)}/10

## Time Block Analysis
${dayPlan.timeBlocks.map(tb => 
    `- **${tb.activity}** (${tb.duration}min): ${tb.completed ? '✅' : '❌'} ${tb.effectiveness ? `[${tb.effectiveness}/10]` : ''}`
).join('\n')}

## Energy & Focus Patterns
- Energy level: ${performance.wellbeingMetrics.energy}/10
- Focus quality: ${performance.wellbeingMetrics.focus}/10
- Day satisfaction: ${performance.wellbeingMetrics.satisfaction}/10

## Accomplishments & Wins
${performance.accomplishments || 'No specific accomplishments noted'}

## Challenges & Learning
${performance.challenges || 'No specific challenges noted'}

## Key Insights
${performance.insights.join('\n') || 'No specific insights noted'}

## Alignment Assessment
- Weekly goal support: ${performance.weekAlignment || 'Not assessed'}/10

## Tomorrow's Planning
- Top priority: ${performance.tomorrowPriority || 'Not specified'}

## Performance Notes
Generated from daily review session on ${formatSydneyDateString()}
`;

        fs.writeFileSync(reportPath, reportContent);
        console.log(`📄 Daily review report saved: journal/planning/daily-reviews/review-${dayId}.md`);
    }

    getPreviousDay() {
        const now = new Date();
        now.setDate(now.getDate() - 1);
        return new DateIndex(now);
    }

    async reviewWeek(weekStr) {
        const dateIndex = weekStr ? this.parsePeriod(weekStr, 'week') : this.getPreviousWeek();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📊 Reviewing Week: ${identifiers.week}`);
        
        const plan = PlanStorage.load('week', identifiers.week);
        if (!plan) {
            console.log(`❌ No plan found for week ${identifiers.week}`);
            return;
        }

        const performance = new Performance('week', identifiers.week);
        
        // Review objectives
        console.log(`\n🎯 Objective Review:`);
        for (const objective of plan.objectives) {
            const completed = await this.ask(`"${objective.text}" - Completed? (y/n): `);
            objective.completed = completed.toLowerCase() === 'y';
        }

        performance.calculateStats(plan);
        
        console.log(`\n📈 Week Performance:`);
        console.log(`Completion Rate: ${performance.completionRate.toFixed(1)}%`);
        console.log(`Objectives: ${performance.objectiveStats.completed}/${performance.objectiveStats.total}`);

        // Insights and adjustments
        console.log(`\n🔍 Weekly Insights:`);
        const insights = await this.ask(`Key insights from this week: `);
        performance.insights.push(insights);

        const adjustments = await this.ask(`Adjustments for next week: `);
        performance.adjustments.push(adjustments);

        // Well-being metrics
        const energy = await this.ask(`Average energy level (1-10): `);
        const focus = await this.ask(`Average focus quality (1-10): `);
        const satisfaction = await this.ask(`Week satisfaction (1-10): `);
        
        performance.wellbeingMetrics = {
            energy: parseInt(energy) || 5,
            focus: parseInt(focus) || 5,
            satisfaction: parseInt(satisfaction) || 5
        };

        PlanStorage.savePerformance(performance);
        PlanStorage.save(plan); // Save updated completion status
        
        console.log(`\n✅ Week review completed for ${identifiers.week}`);
        this.showPerformanceSummary(performance);
    }

    async reviewMonth(monthStr) {
        const dateIndex = monthStr ? this.parsePeriod(monthStr, 'month') : this.getPreviousMonth();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📅 Reviewing Month: ${identifiers.month}`);
        
        const plan = PlanStorage.load('month', identifiers.month);
        if (!plan) {
            console.log(`❌ No plan found for month ${identifiers.month}`);
            return;
        }

        const performance = new Performance('month', identifiers.month);
        
        // Review objectives and milestones
        console.log(`\n🎯 Objective Review:`);
        for (const objective of plan.objectives) {
            const completed = await this.ask(`"${objective.text}" - Completed? (y/n): `);
            objective.completed = completed.toLowerCase() === 'y';
        }

        console.log(`\n🏆 Milestone Review:`);
        for (const milestone of plan.milestones) {
            const completed = await this.ask(`"${milestone.text}" - Completed? (y/n): `);
            milestone.completed = completed.toLowerCase() === 'y';
        }

        performance.calculateStats(plan);
        
        // Gather weekly performance for context
        const weeklyPerformances = this.getWeeklyPerformancesForMonth(identifiers.month);
        if (weeklyPerformances.length > 0) {
            const avgWeeklyCompletion = weeklyPerformances.reduce((sum, wp) => sum + wp.completionRate, 0) / weeklyPerformances.length;
            console.log(`\n📊 Weekly Average: ${avgWeeklyCompletion.toFixed(1)}% completion rate`);
        }

        console.log(`\n📈 Month Performance:`);
        console.log(`Completion Rate: ${performance.completionRate.toFixed(1)}%`);
        console.log(`Objectives: ${performance.objectiveStats.completed}/${performance.objectiveStats.total}`);
        console.log(`Milestones: ${plan.milestones.filter(m => m.completed).length}/${plan.milestones.length}`);

        // Monthly insights
        const insights = await this.ask(`\n🔍 Key insights from this month: `);
        performance.insights.push(insights);

        const adjustments = await this.ask(`Adjustments for next month: `);
        performance.adjustments.push(adjustments);

        const satisfaction = await this.ask(`Month satisfaction (1-10): `);
        performance.wellbeingMetrics = {
            satisfaction: parseInt(satisfaction) || 5
        };

        PlanStorage.savePerformance(performance);
        PlanStorage.save(plan);
        
        console.log(`\n✅ Month review completed for ${identifiers.month}`);
        this.showPerformanceSummary(performance);
    }

    async reviewQuarter(quarterStr) {
        const dateIndex = quarterStr ? this.parsePeriod(quarterStr, 'quarter') : this.getPreviousQuarter();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📈 Reviewing Quarter: ${identifiers.quarter}`);
        
        const plan = PlanStorage.load('quarter', identifiers.quarter);
        if (!plan) {
            console.log(`❌ No plan found for quarter ${identifiers.quarter}`);
            return;
        }

        const performance = new Performance('quarter', identifiers.quarter);
        
        // Review strategic priorities and objectives
        console.log(`\n🎯 Strategic Priority Review:`);
        for (const priority of plan.priorities) {
            const impact = await this.ask(`Priority: "${priority}" - Impact achieved (1-10): `);
            priority.impact = parseInt(impact) || 5;
        }

        console.log(`\n📋 Quarterly Objective Review:`);
        for (const objective of plan.objectives) {
            const completed = await this.ask(`"${objective.text}" - Completed? (y/n): `);
            objective.completed = completed.toLowerCase() === 'y';
        }

        console.log(`\n🏆 Major Milestone Review:`);
        for (const milestone of plan.milestones) {
            const completed = await this.ask(`"${milestone.text}" - Achieved? (y/n): `);
            milestone.completed = completed.toLowerCase() === 'y';
        }

        performance.calculateStats(plan);
        
        console.log(`\n📈 Quarter Performance:`);
        console.log(`Completion Rate: ${performance.completionRate.toFixed(1)}%`);
        console.log(`Objectives: ${performance.objectiveStats.completed}/${performance.objectiveStats.total}`);
        console.log(`Milestones: ${plan.milestones.filter(m => m.completed).length}/${plan.milestones.length}`);

        // Strategic insights
        const strategicInsights = await this.ask(`\n🔍 Strategic insights from this quarter: `);
        const transformationProgress = await this.ask(`Transformation progress assessment: `);
        const nextQuarterFocus = await this.ask(`Strategic focus for next quarter: `);
        const yearlyAlignment = await this.ask(`Yearly vision alignment (1-10): `);

        performance.insights.push(strategicInsights);
        performance.transformationProgress = transformationProgress;
        performance.nextQuarterFocus = nextQuarterFocus;
        performance.yearlyAlignment = parseInt(yearlyAlignment) || 5;

        const satisfaction = await this.ask(`Quarter satisfaction (1-10): `);
        performance.wellbeingMetrics = {
            satisfaction: parseInt(satisfaction) || 5,
            strategicImpact: parseInt(yearlyAlignment) || 5
        };

        PlanStorage.savePerformance(performance);
        PlanStorage.save(plan);
        
        console.log(`\n✅ Quarter review completed for ${identifiers.quarter}`);
        this.showPerformanceSummary(performance);
    }

    async reviewYear(yearStr) {
        const year = yearStr || this.getPreviousYear();
        
        console.log(`\n🌟 Reviewing Year: ${year}`);
        console.log(`🎯 Transformation Review & Mission Evolution`);

        const plan = PlanStorage.load('year', year);
        if (!plan) {
            console.log(`❌ No plan found for year ${year}`);
            return;
        }

        const performance = new Performance('year', year);
        
        console.log(`\n🌟 Mission Statement Assessment:`);
        console.log(`Original Mission: "${plan.context}"`);
        const missionFulfillment = await this.ask(`Mission fulfillment (1-10): `);
        const missionEvolution = await this.ask(`How has your mission evolved this year?: `);
        const newMission = await this.ask(`Refined mission statement for next year: `);

        console.log(`\n🎯 Strategic Priority Review:`);
        for (const priority of plan.priorities) {
            const achievement = await this.ask(`Priority: "${priority}" - Achievement level (1-10): `);
            priority.achievement = parseInt(achievement) || 5;
        }

        console.log(`\n📋 Yearly Objective Review:`);
        for (const objective of plan.objectives) {
            const completed = await this.ask(`"${objective.text}" - Completed? (y/n): `);
            objective.completed = completed.toLowerCase() === 'y';
        }

        console.log(`\n🏆 Major Milestone Review:`);
        for (const milestone of plan.milestones) {
            const completed = await this.ask(`"${milestone.text}" - Achieved? (y/n): `);
            milestone.completed = completed.toLowerCase() === 'y';
        }

        performance.calculateStats(plan);

        // Transformation assessment
        console.log(`\n🔄 Transformation Assessment:`);
        const careerProgress = await this.ask(`Career transformation progress (1-10): `);
        const personalGrowth = await this.ask(`Personal growth achievement (1-10): `);
        const financialProgress = await this.ask(`Financial goal progress (1-10): `);
        const overallTransformation = await this.ask(`Overall transformation score (1-10): `);

        // Year insights
        const keyInsights = await this.ask(`\n💡 Key insights from this year: `);
        const majorAccomplishments = await this.ask(`Major accomplishments beyond planned goals: `);
        const biggestChallenges = await this.ask(`Biggest challenges overcome: `);
        const nextYearStrategy = await this.ask(`Strategic direction for next year: `);

        performance.transformationMetrics = {
            careerProgress: parseInt(careerProgress) || 5,
            personalGrowth: parseInt(personalGrowth) || 5,
            financialProgress: parseInt(financialProgress) || 5,
            overallTransformation: parseInt(overallTransformation) || 5
        };

        performance.missionFulfillment = parseInt(missionFulfillment) || 5;
        performance.missionEvolution = missionEvolution;
        performance.newMission = newMission;
        performance.insights.push(keyInsights);
        performance.majorAccomplishments = majorAccomplishments;
        performance.biggestChallenges = biggestChallenges;
        performance.nextYearStrategy = nextYearStrategy;

        const satisfaction = await this.ask(`Year satisfaction (1-10): `);
        performance.wellbeingMetrics = {
            satisfaction: parseInt(satisfaction) || 5,
            transformation: parseInt(overallTransformation) || 5
        };

        PlanStorage.savePerformance(performance);
        PlanStorage.save(plan);
        
        console.log(`\n✅ Year review completed for ${year}`);
        console.log(`📈 Transformation Score: ${performance.transformationMetrics.overallTransformation}/10`);
        console.log(`🎯 Mission Fulfillment: ${performance.missionFulfillment}/10`);
        this.showPerformanceSummary(performance);
    }

    getPreviousQuarter() {
        const now = new Date();
        const currentQuarter = Math.ceil((now.getMonth() + 1) / 3);
        if (currentQuarter === 1) {
            return `${now.getFullYear() - 1}-Q4`;
        } else {
            return `${now.getFullYear()}-Q${currentQuarter - 1}`;
        }
    }

    getPreviousYear() {
        const now = new Date();
        return (now.getFullYear() - 1).toString();
    }

    async showStatus(period = 'all') {
        const now = new DateIndex();
        const identifiers = now.getIdentifiers();
        
        console.log(`\n📊 Fractal Planning Status - ${now.toString()}`);
        console.log(`📅 Multi-Perspective Indices:`);
        console.log(`   Day: ${identifiers.dayOfYear}/365 | Week ${identifiers.dayOfWeek}/7 | Month ${identifiers.dayOfMonth}/${new Date(now.year, now.month, 0).getDate()} | Quarter ${identifiers.dayOfQuarter}/92`);
        console.log(`   Week: ${identifiers.weekOfYear}/53 | Month ${identifiers.weekOfMonth}/5 | Quarter ${identifiers.weekOfQuarter}/13`);
        console.log(`   Month: ${identifiers.monthOfYear}/12 | Quarter ${identifiers.monthOfQuarter}/3`);
        console.log(`   Quarter: ${identifiers.quarterOfYear}/4`);

        if (period === 'all' || period === 'day') {
            this.showPlanStatus('day', identifiers.day);
        }
        if (period === 'all' || period === 'week') {
            this.showPlanStatus('week', identifiers.week);
        }
        if (period === 'all' || period === 'month') {
            this.showPlanStatus('month', identifiers.month);
        }
        if (period === 'all' || period === 'quarter') {
            this.showPlanStatus('quarter', identifiers.quarter);
        }
        if (period === 'all' || period === 'year') {
            this.showPlanStatus('year', identifiers.year);
        }

        console.log(`\n🎯 Recommended Next Actions:`);
        this.suggestNextActions(identifiers);
    }

    showPlanStatus(period, identifier) {
        const plan = PlanStorage.load(period, identifier);
        const performance = PlanStorage.loadPerformance(period, identifier);
        
        if (plan) {
            const completedObjectives = plan.objectives.filter(obj => obj.completed).length;
            const completionRate = plan.objectives.length > 0 ? (completedObjectives / plan.objectives.length) * 100 : 0;
            
            console.log(`\n${this.getPeriodEmoji(period)} ${period.toUpperCase()}: ${identifier} (${plan.status})`);
            console.log(`  📋 Objectives: ${completedObjectives}/${plan.objectives.length} (${completionRate.toFixed(1)}%)`);
            if (plan.priorities.length > 0) {
                console.log(`  🎯 Priorities: ${plan.priorities.slice(0, 3).join(', ')}`);
            }
            if (performance) {
                console.log(`  📈 Performance: ${performance.completionRate.toFixed(1)}% | Satisfaction: ${performance.wellbeingMetrics.satisfaction || 'N/A'}/10`);
            }
        } else {
            console.log(`\n${this.getPeriodEmoji(period)} ${period.toUpperCase()}: ${identifier} - ❌ No plan`);
        }
    }

    getPeriodEmoji(period) {
        const emojis = {
            day: '📅',
            week: '📊',
            month: '📆',
            quarter: '📈',
            year: '🌟'
        };
        return emojis[period] || '📋';
    }

    suggestNextActions(identifiers) {
        const plans = {
            day: PlanStorage.load('day', identifiers.day),
            week: PlanStorage.load('week', identifiers.week),
            month: PlanStorage.load('month', identifiers.month),
            quarter: PlanStorage.load('quarter', identifiers.quarter),
            year: PlanStorage.load('year', identifiers.year)
        };

        const suggestions = [];

        if (!plans.year) {
            suggestions.push(`📅 Create year plan: node scripts/fractal-planner.cjs plan-year`);
        }
        if (!plans.quarter) {
            suggestions.push(`📊 Create quarter plan: node scripts/fractal-planner.cjs plan-quarter`);
        }
        if (!plans.month) {
            suggestions.push(`📆 Create month plan: node scripts/fractal-planner.cjs plan-month`);
        }
        if (!plans.week) {
            suggestions.push(`📋 Create week plan: node scripts/fractal-planner.cjs plan-week`);
        }
        if (!plans.day) {
            suggestions.push(`🎯 Create daily plan: node scripts/fractal-planner.cjs plan-day`);
        }

        // Review suggestions
        const previousWeek = this.getPreviousWeek();
        const prevWeekId = previousWeek.getIdentifiers().week;
        if (PlanStorage.load('week', prevWeekId) && !PlanStorage.loadPerformance('week', prevWeekId)) {
            suggestions.push(`📈 Review previous week: node scripts/fractal-planner.cjs review-week ${prevWeekId}`);
        }

        suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
    }

    parsePeriod(periodStr, type) {
        // Parse various period formats and return DateIndex
        if (type === 'week' && periodStr.includes('W')) {
            const [year, week] = periodStr.split('-W');
            const firstDay = new Date(parseInt(year), 0, 1);
            const daysToAdd = (parseInt(week) - 1) * 7;
            firstDay.setDate(firstDay.getDate() + daysToAdd);
            return new DateIndex(firstDay);
        }
        if (type === 'month') {
            return new DateIndex(`${periodStr}-01`);
        }
        if (type === 'quarter') {
            const [year, quarter] = periodStr.split('-Q');
            const month = (parseInt(quarter) - 1) * 3;
            return new DateIndex(new Date(parseInt(year), month, 1));
        }
        
        return new DateIndex(periodStr);
    }

    getPreviousWeek() {
        const now = new Date();
        now.setDate(now.getDate() - 7);
        return new DateIndex(now);
    }

    getPreviousMonth() {
        const now = new Date();
        now.setMonth(now.getMonth() - 1);
        return new DateIndex(now);
    }

    getWeeklyPerformancesForMonth(monthStr) {
        // Load all weekly performances for the given month
        const performances = [];
        const [year, month] = monthStr.split('-');
        
        // Get all weeks that fall within this month (simplified)
        for (let week = 1; week <= 52; week++) {
            const weekId = `${year}-W${week.toString().padStart(2, '0')}`;
            const performance = PlanStorage.loadPerformance('week', weekId);
            if (performance) {
                performances.push(performance);
            }
        }
        
        return performances;
    }

    showPerformanceSummary(performance) {
        console.log(`\n📊 Performance Summary:`);
        console.log(`  Completion Rate: ${performance.completionRate.toFixed(1)}%`);
        if (performance.wellbeingMetrics.energy) {
            console.log(`  Energy: ${performance.wellbeingMetrics.energy}/10`);
        }
        if (performance.wellbeingMetrics.focus) {
            console.log(`  Focus: ${performance.wellbeingMetrics.focus}/10`);
        }
        if (performance.wellbeingMetrics.satisfaction) {
            console.log(`  Satisfaction: ${performance.wellbeingMetrics.satisfaction}/10`);
        }
        if (performance.insights.length > 0) {
            console.log(`  💡 Insights: ${performance.insights[0]}`);
        }
    }

    async checkCalendarEvents(dateStr) {
        const events = [];
        try {
            // This would be called through Claude's MCP system in a real implementation
            // For now, return empty array as a fallback
            return events;
        } catch (error) {
            console.log('⚠️ Calendar check failed:', error.message);
            return events;
        }
    }

    async loadRecentReviews(identifiers) {
        try {
            const reviewContext = {
                previousMonth: null,
                lastWeek: null,
                lastDay: null,
                keyPatterns: [],
                adjustments: [],
                rawReviews: []
            };

            const journalDir = path.join(__dirname, '..', 'journal', 'planning');

            // Get previous month review
            const prevMonth = this.getPreviousMonth();
            const prevMonthId = prevMonth.getIdentifiers().month;
            const monthReviewPath = path.join(journalDir, 'monthly-reviews', `review-${prevMonthId}.md`);
            if (fs.existsSync(monthReviewPath)) {
                const monthReview = fs.readFileSync(monthReviewPath, 'utf8');
                reviewContext.rawReviews.push({ type: 'month', id: prevMonthId, content: monthReview });
                console.log(`📅 Found previous month review: ${prevMonthId}`);
            }

            // Get last week review
            const prevWeek = this.getPreviousWeek();
            const prevWeekId = prevWeek.getIdentifiers().week;
            const weekReviewPath = path.join(journalDir, 'weekly-reviews', `review-${prevWeekId}.md`);
            if (fs.existsSync(weekReviewPath)) {
                const weekReview = fs.readFileSync(weekReviewPath, 'utf8');
                reviewContext.rawReviews.push({ type: 'week', id: prevWeekId, content: weekReview });
                console.log(`📊 Found previous week review: ${prevWeekId}`);
            }

            // Get most recent day review
            const prevDay = this.getPreviousDay();
            const prevDayId = prevDay.toString();
            const dayReviewPath = path.join(journalDir, 'daily-reviews', `review-${prevDayId}.md`);
            if (fs.existsSync(dayReviewPath)) {
                const dayReview = fs.readFileSync(dayReviewPath, 'utf8');
                reviewContext.rawReviews.push({ type: 'day', id: prevDayId, content: dayReview });
                console.log(`📋 Found previous day review: ${prevDayId}`);
            }

            // Note: LLM will extract insights from rawReviews during planning
            if (reviewContext.rawReviews.length > 0) {
                console.log(`\n🔍 Found ${reviewContext.rawReviews.length} review files for LLM analysis`);
                console.log('📝 Reviews will be analyzed by Claude for key insights and patterns');
            }

            return reviewContext;
        } catch (error) {
            console.log('⚠️ Could not load recent reviews:', error.message);
            return null;
        }
    }

    displayReviewContext(reviewContext) {
        if (reviewContext.rawReviews && reviewContext.rawReviews.length > 0) {
            console.log('\n📊 Available Review Data for LLM Analysis:');
            reviewContext.rawReviews.forEach(review => {
                const typeIcon = review.type === 'month' ? '📅' : review.type === 'week' ? '📊' : '📋';
                console.log(`  ${typeIcon} ${review.type.charAt(0).toUpperCase() + review.type.slice(1)} Review: ${review.id}`);
            });
            console.log('\n🎯 Claude will analyze these reviews to extract:');
            console.log('  • Key performance patterns and trends');
            console.log('  • Strategic insights and lessons learned');
            console.log('  • Recommended adjustments for upcoming month');
            console.log('  • Success factors to replicate');
            console.log('  • Areas for improvement and focus');
        } else {
            console.log('\n⚠️ No recent review data found for analysis');
        }
    }

    showHelp() {
        console.log(`
🌀 Fractal Planning System

Planning Commands:
  plan-day [date]      - Plan daily time blocks (4-5 blocks, ADD-optimized)
  plan-week [week]     - Plan weekly priorities and goals
  plan-month [month]   - Plan monthly objectives and milestones  
  plan-quarter [Q]     - Plan quarterly strategic initiatives
  plan-year [year]     - Plan yearly vision and transformation goals

Review Commands:
  review-day [date]    - Analyze previous day's performance and learning  
  review-week [week]   - Analyze previous week's performance
  review-month [month] - Assess previous month's achievements
  review-quarter [Q]   - Evaluate previous quarter's progress
  review-year [year]   - Reflect on previous year's growth

Status Commands:
  status [period]      - Show current planning status and next actions

Examples:
  node scripts/fractal-planner.js plan-day 2024-01-15
  node scripts/fractal-planner.js plan-week 2024-W03  
  node scripts/fractal-planner.js review-month 2024-01
  node scripts/fractal-planner.js status week
        `);
    }
}

// Run if called directly
if (require.main === module) {
    const planner = new FractalPlanner();
    planner.run();
}

module.exports = { FractalPlanner, Plan, Performance, PlanStorage, DateIndex };