#!/usr/bin/env node

/**
 * Ritual-Aware Daily Planner
 * Purpose: Enhanced daily planning that respects ritual constraints and available time
 * Usage: node scripts/ritual-aware-planner.js [command] [args]
 * Dependencies: ritual-manager.js, fractal-planner-taskwarrior.js
 * 
 * Features:
 * - Ritual-aware time block generation
 * - Conflict detection and resolution
 * - Integration with TaskWarrior and Calendar
 * - Realistic planning based on actual availability
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { RitualManager, TimeUtils } = require('./ritual-manager.js');

// Configuration
const PLANNING_DIR = path.join(__dirname, '..', 'planning');
const DATA_DIR = path.join(PLANNING_DIR, 'data');
const EXECUTION_DIR = path.join(PLANNING_DIR, 'execution');

class RitualAwarePlanner {
    constructor() {
        this.ritualManager = new RitualManager();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    
    async run(args) {
        const command = args[0] || 'plan-day';
        
        try {
            switch (command) {
                case 'plan-day':
                    await this.planDayAware(args[1]);
                    break;
                case 'check-conflicts':
                    await this.checkConflicts(args[1]);
                    break;
                case 'suggest-blocks':
                    await this.suggestTimeBlocks(args[1]);
                    break;
                case 'availability':
                    await this.showDetailedAvailability(args[1]);
                    break;
                default:
                    this.showHelp();
            }
        } catch (error) {
            console.error('Error:', error.message);
        } finally {
            this.rl.close();
        }
    }
    
    async planDayAware(dateStr = null) {
        const today = TimeUtils.getDateString();
        const planDate = dateStr || today;
        const isToday = planDate === today;
        
        console.log(`\n🗓️  Ritual-Aware Daily Planning`);
        console.log(`📅 Date: ${planDate}`);
        
        // Get ritual status and availability
        const ritualStatus = this.ritualManager.getStatus(planDate);
        const availability = ritualStatus.availability;
        
        console.log(`📊 Day: ${ritualStatus.dayOfWeek} | Rituals: ${ritualStatus.ritualsToday} | Available: ${Math.floor(ritualStatus.totalAvailableMinutes / 60)}h ${ritualStatus.totalAvailableMinutes % 60}m`);
        
        if (ritualStatus.totalAvailableMinutes < 60) {
            console.log('⚠️  Very limited available time. Consider a light planning day.');
        }
        
        // Show ritual schedule
        if (ritualStatus.rituals.length > 0) {
            console.log('\n🔄 Ritual Schedule:');
            ritualStatus.rituals.forEach(ritual => {
                ritual.timeBlocks.forEach(block => {
                    const endTime = TimeUtils.addMinutes(block.startTime, block.duration);
                    console.log(`   📍 ${block.startTime} - ${endTime}: ${ritual.name} (${ritual.type})`);
                });
            });
        }
        
        // Show available windows
        if (availability.availableWindows.length === 0) {
            console.log('\n❌ No available time windows for planning.');
            console.log('   Consider adjusting rituals or planning for a different day.');
            return;
        }
        
        console.log('\n⏰ Available Time Windows:');
        availability.availableWindows.forEach((window, i) => {
            const hours = Math.floor(window.duration / 60);
            const mins = window.duration % 60;
            console.log(`   ${i + 1}. ${window.startTime} - ${window.endTime} (${hours}h ${mins}m) - ${window.context}`);
        });
        
        // Generate suggested time blocks
        const suggestedBlocks = this.generateRitualAwareBlocks(availability.availableWindows, isToday);
        
        if (suggestedBlocks.length === 0) {
            console.log('\n⚠️  Cannot generate time blocks with current availability.');
            return;
        }
        
        console.log(`\n🎯 Suggested Time Blocks (${suggestedBlocks.length} blocks):`);
        suggestedBlocks.forEach(block => {
            console.log(`   ${block.start} - ${block.end} (${block.duration}min) - ${block.type}: ${block.label}`);
        });
        
        // Ask user to proceed with planning
        const proceed = await this.ask('\\nProceed with ritual-aware planning? (y/n): ');
        if (proceed.toLowerCase() !== 'y') {
            console.log('Planning cancelled.');
            return;
        }
        
        // Create plan structure
        const plan = {
            id: planDate,
            type: 'day',
            date: planDate,
            status: 'active',
            ritualAware: true,
            ritualStatus: ritualStatus,
            timeBlocks: [],
            objectives: [],
            metadata: {
                createdAt: new Date().toISOString(),
                availableMinutes: ritualStatus.totalAvailableMinutes,
                availableWindows: availability.availableWindows.length,
                ritualsToday: ritualStatus.ritualsToday,
                version: 'ritual-aware-v1'
            }
        };
        
        // Collect activities for each suggested block
        console.log('\\n🎯 Define Activities for Each Time Block:');
        console.log('    (Only using time that doesn\\'t conflict with rituals)\\n');
        
        for (const block of suggestedBlocks) {
            console.log(`\\n--- ${block.label} (${block.start} - ${block.end}) ---`);
            console.log(`Context: ${block.context} | Duration: ${block.duration} minutes`);
            
            const activity = await this.ask('Activity description: ');
            
            if (activity.trim()) {
                const enhancedBlock = {
                    ...block,
                    activity: activity.trim(),
                    completed: false,
                    notes: ''
                };
                
                // Add alignment information
                const alignment = await this.ask('Alignment with larger goals: ');
                if (alignment.trim()) {
                    enhancedBlock.alignment = alignment.trim();
                }
                
                plan.timeBlocks.push(enhancedBlock);
                console.log(`✅ Added: ${activity}`);
            } else {
                console.log('⏭️  Skipped empty block');
            }
        }
        
        // Add daily objectives (max 3)
        console.log('\\n🎯 Daily Objectives (max 3 for focus):');
        for (let i = 1; i <= 3; i++) {
            const objective = await this.ask(`Objective ${i}: `);
            if (objective.trim()) {
                plan.objectives.push({
                    id: `obj-${i}`,
                    text: objective.trim(),
                    priority: i,
                    completed: false
                });
            }
        }
        
        // Save the plan
        this.savePlan(plan);
        
        console.log('\\n✅ Ritual-aware daily plan created successfully!');
        console.log(`📁 Saved to: planning/data/day-${planDate}.json`);
        console.log(`🔄 Integrated with ${ritualStatus.ritualsToday} rituals`);
        console.log(`⏰ Using ${plan.timeBlocks.length} available time blocks`);
        
        // Show summary
        const totalPlannedMinutes = plan.timeBlocks.reduce((sum, block) => sum + block.duration, 0);
        console.log(`📊 Planned time: ${Math.floor(totalPlannedMinutes / 60)}h ${totalPlannedMinutes % 60}m of ${Math.floor(ritualStatus.totalAvailableMinutes / 60)}h ${ritualStatus.totalAvailableMinutes % 60}m available`);
        
        // Integration suggestions
        console.log('\\n💡 Integration Options:');
        console.log('   • Add to Google Calendar: node scripts/calendar-sync.cjs');
        console.log('   • Create TaskWarrior tasks: node scripts/fractal-planner-taskwarrior.js');
        console.log('   • Start execution: node scripts/taskmaster.js (when created)');
    }
    
    generateRitualAwareBlocks(availableWindows, isToday = false) {
        const blocks = [];
        let blockId = 1;
        
        // Prioritize larger windows for deep work
        const sortedWindows = [...availableWindows].sort((a, b) => b.duration - a.duration);
        
        for (const window of sortedWindows) {
            if (window.duration < 30) continue; // Skip very small windows
            
            if (window.duration >= 90) {
                // Large window: split into multiple blocks
                const blocksInWindow = this.splitLargeWindow(window, blockId);
                blocks.push(...blocksInWindow);
                blockId += blocksInWindow.length;
            } else if (window.duration >= 45) {
                // Medium window: single focused block
                blocks.push({
                    id: `block-${blockId}`,
                    start: window.startTime,
                    end: window.endTime,
                    duration: window.duration,
                    type: this.getBlockType(window.context, window.duration),
                    label: this.getBlockLabel(window.context, window.duration),
                    context: window.context,
                    windowSource: 'medium'
                });
                blockId++;
            } else {
                // Small window: admin/quick tasks
                blocks.push({
                    id: `block-${blockId}`,
                    start: window.startTime,
                    end: window.endTime,
                    duration: window.duration,
                    type: 'admin',
                    label: 'Quick Tasks & Admin',
                    context: window.context,
                    windowSource: 'small'
                });
                blockId++;
            }
            
            // Limit total blocks for ADD-friendly planning
            if (blocks.length >= 5) break;
        }
        
        return blocks.slice(0, 5); // Maximum 5 blocks
    }
    
    splitLargeWindow(window, startBlockId) {
        const blocks = [];
        const totalMinutes = window.duration;
        const startTime = TimeUtils.parseTime(window.startTime);
        
        // Strategy: Split into 60-90 minute blocks with breaks
        let currentTime = startTime;
        let blockId = startBlockId;
        let remainingTime = totalMinutes;
        
        while (remainingTime >= 45) {
            // Determine block duration (60-90 minutes, prefer 90)
            let blockDuration;
            if (remainingTime >= 120) {
                blockDuration = 90; // Long focused work
            } else if (remainingTime >= 75) {
                blockDuration = 75; // Good focused work
            } else {
                blockDuration = Math.min(remainingTime, 60);
            }
            
            const blockEndTime = currentTime + blockDuration;
            
            blocks.push({
                id: `block-${blockId}`,
                start: TimeUtils.formatTime(currentTime),
                end: TimeUtils.formatTime(blockEndTime),
                duration: blockDuration,
                type: this.getBlockType(window.context, blockDuration),
                label: this.getBlockLabel(window.context, blockDuration),
                context: window.context,
                windowSource: 'split-large'
            });
            
            blockId++;
            currentTime = blockEndTime + 15; // 15-minute break
            remainingTime = remainingTime - blockDuration - 15;
        }
        
        return blocks;
    }
    
    getBlockType(context, duration) {
        if (duration >= 75) {
            return context === 'morning' ? 'deep-work' : 'project';
        } else if (duration >= 45) {
            return context === 'evening' ? 'learning' : 'research';
        } else {
            return 'admin';
        }
    }
    
    getBlockLabel(context, duration) {
        if (duration >= 90) {
            return context === 'morning' ? 'Deep Work Session' : 'Major Project Work';
        } else if (duration >= 60) {
            return context === 'morning' ? 'Focused Work' : 
                   context === 'afternoon' ? 'Project Development' : 'Learning Session';
        } else if (duration >= 45) {
            return context === 'evening' ? 'Skill Practice' : 'Research & Planning';
        } else {
            return 'Quick Tasks & Admin';
        }
    }
    
    async checkConflicts(dateStr = null) {
        const planDate = dateStr || TimeUtils.getDateString();
        
        console.log(`\\n🔍 Checking Conflicts for ${planDate}`);
        console.log('='.repeat(40));
        
        // Load existing plan if it exists
        const planFile = path.join(DATA_DIR, `day-${planDate}.json`);
        if (!fs.existsSync(planFile)) {
            console.log('❌ No plan exists for this date.');
            return;
        }
        
        const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
        const ritualStatus = this.ritualManager.getStatus(planDate);
        
        console.log(`📊 Plan blocks: ${plan.timeBlocks.length}`);
        console.log(`📊 Rituals: ${ritualStatus.ritualsToday}`);
        
        const conflicts = [];
        
        // Check each planned block against rituals
        for (const block of plan.timeBlocks) {
            const blockStart = TimeUtils.parseTime(block.start);
            const blockEnd = TimeUtils.parseTime(block.end || TimeUtils.addMinutes(block.start, block.duration));
            
            for (const ritual of ritualStatus.rituals) {
                for (const ritualBlock of ritual.timeBlocks) {
                    const ritualStart = TimeUtils.parseTime(ritualBlock.startTime);
                    const ritualEnd = TimeUtils.parseTime(TimeUtils.addMinutes(ritualBlock.startTime, ritualBlock.duration));
                    
                    // Check for overlap
                    if (blockStart < ritualEnd && blockEnd > ritualStart) {
                        conflicts.push({
                            type: 'ritual-conflict',
                            planBlock: block,
                            ritual: ritual,
                            ritualBlock: ritualBlock,
                            severity: ritualBlock.flexible ? 'warning' : 'error'
                        });
                    }
                }
            }
        }
        
        if (conflicts.length === 0) {
            console.log('✅ No conflicts detected! Plan is compatible with rituals.');
        } else {
            console.log(`⚠️  Found ${conflicts.length} conflicts:`);
            
            conflicts.forEach((conflict, i) => {
                const icon = conflict.severity === 'error' ? '❌' : '⚠️ ';
                console.log(`\\n${i + 1}. ${icon} ${conflict.severity.toUpperCase()}`);
                console.log(`   Plan: ${conflict.planBlock.start} - ${conflict.planBlock.end || 'unknown'}: ${conflict.planBlock.activity || conflict.planBlock.label}`);
                console.log(`   Ritual: ${conflict.ritualBlock.startTime} - ${TimeUtils.addMinutes(conflict.ritualBlock.startTime, conflict.ritualBlock.duration)}: ${conflict.ritual.name}`);
                
                if (conflict.severity === 'warning') {
                    console.log('   📝 This ritual is flexible and could potentially be moved');
                } else {
                    console.log('   🚫 This ritual is fixed and cannot be moved');
                }
            });
            
            console.log('\\n💡 Recommendation: Update your plan to avoid conflicts');
            console.log('   Use: node scripts/ritual-aware-planner.js plan-day ' + planDate);
        }
    }
    
    async suggestTimeBlocks(dateStr = null) {
        const planDate = dateStr || TimeUtils.getDateString();
        const ritualStatus = this.ritualManager.getStatus(planDate);
        
        console.log(`\\n💡 Time Block Suggestions for ${planDate}`);
        console.log('='.repeat(45));
        
        if (ritualStatus.availability.availableWindows.length === 0) {
            console.log('❌ No available time windows.');
            return;
        }
        
        const suggestions = this.generateRitualAwareBlocks(ritualStatus.availability.availableWindows, planDate === TimeUtils.getDateString());
        
        console.log(`📊 Available time: ${Math.floor(ritualStatus.totalAvailableMinutes / 60)}h ${ritualStatus.totalAvailableMinutes % 60}m`);
        console.log(`🎯 Suggested blocks: ${suggestions.length}\\n`);
        
        suggestions.forEach((block, i) => {
            const duration = `${Math.floor(block.duration / 60)}h ${block.duration % 60}m`.replace('0h ', '');
            console.log(`${i + 1}. ${block.start} - ${block.end} (${duration})`);
            console.log(`   Type: ${block.type} | Context: ${block.context}`);
            console.log(`   Suggested focus: ${block.label}`);
            console.log('');
        });
        
        console.log('💡 Use these suggestions when running:');
        console.log(`   node scripts/ritual-aware-planner.js plan-day ${planDate}`);
    }
    
    async showDetailedAvailability(dateStr = null) {
        const planDate = dateStr || TimeUtils.getDateString();
        const ritualStatus = this.ritualManager.getStatus(planDate);
        const availability = ritualStatus.availability;
        
        console.log(`\\n⏰ Detailed Availability Analysis - ${planDate}`);
        console.log('='.repeat(50));
        
        console.log(`📅 Day: ${ritualStatus.dayOfWeek}`);
        console.log(`🔄 Active rituals: ${ritualStatus.ritualsToday}/${ritualStatus.totalRituals}`);
        console.log(`⏰ Total available: ${Math.floor(ritualStatus.totalAvailableMinutes / 60)}h ${ritualStatus.totalAvailableMinutes % 60}m`);
        console.log(`🪟 Available windows: ${availability.availableWindows.length}`);
        
        // Detailed timeline
        console.log('\\n📅 Full Day Timeline:');
        console.log('='.repeat(25));
        
        const timelineEvents = [];
        
        // Add rituals
        ritualStatus.rituals.forEach(ritual => {
            ritual.timeBlocks.forEach(block => {
                timelineEvents.push({
                    startTime: block.startTime,
                    endTime: TimeUtils.addMinutes(block.startTime, block.duration),
                    type: 'ritual',
                    name: ritual.name,
                    rituaType: ritual.type,
                    flexible: block.flexible
                });
            });
        });
        
        // Add blocked times
        availability.blockedPeriods.forEach(block => {
            if (block.type === 'blocked') {
                timelineEvents.push({
                    startTime: block.startTime,
                    endTime: block.endTime,
                    type: 'blocked',
                    name: block.reason,
                    flexible: false
                });
            }
        });
        
        // Add available windows
        availability.availableWindows.forEach(window => {
            timelineEvents.push({
                startTime: window.startTime,
                endTime: window.endTime,
                type: 'available',
                name: `Available (${window.context})`,
                duration: window.duration,
                flexible: true
            });
        });
        
        // Sort by start time
        timelineEvents.sort((a, b) => TimeUtils.parseTime(a.startTime) - TimeUtils.parseTime(b.startTime));
        
        // Display timeline
        timelineEvents.forEach(event => {
            const icon = event.type === 'ritual' ? '🔄' :
                        event.type === 'blocked' ? '🚫' : '🟢';
            const flexIcon = event.flexible ? '🔄' : '📍';
            
            console.log(`${icon} ${event.startTime} - ${event.endTime}: ${event.name} ${flexIcon}`);
            
            if (event.type === 'ritual') {
                console.log(`    Type: ${event.rituaType}`);
            } else if (event.type === 'available') {
                const hours = Math.floor(event.duration / 60);
                const mins = event.duration % 60;
                const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                console.log(`    Duration: ${duration}`);
            }
        });
        
        // Planning recommendations
        console.log('\\n💡 Planning Recommendations:');
        console.log('='.repeat(30));
        
        if (ritualStatus.totalAvailableMinutes >= 240) {
            console.log('✅ Excellent availability - can plan multiple focused work blocks');
        } else if (ritualStatus.totalAvailableMinutes >= 120) {
            console.log('👍 Good availability - plan 2-3 focused blocks');
        } else if (ritualStatus.totalAvailableMinutes >= 60) {
            console.log('⚠️  Limited availability - focus on 1-2 priority tasks');
        } else {
            console.log('🚨 Very limited availability - consider light admin tasks only');
        }
        
        const largeWindows = availability.availableWindows.filter(w => w.duration >= 90);
        const mediumWindows = availability.availableWindows.filter(w => w.duration >= 45 && w.duration < 90);
        const smallWindows = availability.availableWindows.filter(w => w.duration < 45);
        
        console.log(`🎯 Window analysis: ${largeWindows.length} large (90+ min), ${mediumWindows.length} medium (45-89 min), ${smallWindows.length} small (<45 min)`);
        
        if (largeWindows.length > 0) {
            console.log('💪 Recommend: Use large windows for deep work or major project tasks');
        }
        if (mediumWindows.length > 0) {
            console.log('📚 Recommend: Use medium windows for learning or focused research');
        }
        if (smallWindows.length > 0) {
            console.log('⚡ Recommend: Use small windows for admin tasks, email, or quick reviews');
        }
    }
    
    savePlan(plan) {
        // Ensure directory exists
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        
        const filename = `day-${plan.id}.json`;
        const filepath = path.join(DATA_DIR, filename);
        fs.writeFileSync(filepath, JSON.stringify(plan, null, 2));
        
        // Also save to execution directory for taskmaster integration
        if (!fs.existsSync(EXECUTION_DIR)) {
            fs.mkdirSync(EXECUTION_DIR, { recursive: true });
        }
        
        const execFilename = `execution-${plan.id}.json`;
        const execFilepath = path.join(EXECUTION_DIR, execFilename);
        const executionData = {
            planId: plan.id,
            date: plan.date,
            timeBlocks: plan.timeBlocks,
            objectives: plan.objectives,
            ritualAware: plan.ritualAware,
            status: 'pending',
            created: new Date().toISOString()
        };
        fs.writeFileSync(execFilepath, JSON.stringify(executionData, null, 2));
    }
    
    async ask(question) {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
    }
    
    showHelp() {
        console.log(`
Ritual-Aware Daily Planner
===========================

Commands:
  plan-day [date]       - Create ritual-aware daily plan
  check-conflicts [date] - Check existing plan for ritual conflicts  
  suggest-blocks [date]  - Suggest optimal time blocks based on availability
  availability [date]    - Show detailed availability analysis

Features:
  ✅ Ritual-aware time block generation
  ✅ Conflict detection and prevention
  ✅ Realistic planning based on actual availability  
  ✅ ADD-optimized block sizing and count
  ✅ Integration with TaskWarrior and Calendar systems

Examples:
  node scripts/ritual-aware-planner.js plan-day
  node scripts/ritual-aware-planner.js plan-day 2025-08-31
  node scripts/ritual-aware-planner.js check-conflicts
  node scripts/ritual-aware-planner.js availability today
  node scripts/ritual-aware-planner.js suggest-blocks tomorrow

Prerequisites:
  • Run ritual setup first: node scripts/ritual-manager.js add
  • Define your work schedule and foundational rituals
  • Configure any temporary blocks or exceptions

Integration:
  • Connects to ritual-manager.js for availability calculation
  • Outputs compatible with fractal-planner-taskwarrior.js
  • Ready for calendar sync and TaskWarrior task creation
        `);
    }
}

// Main execution
if (require.main === module) {
    const planner = new RitualAwarePlanner();
    planner.run(process.argv.slice(2));
}

module.exports = { RitualAwarePlanner };