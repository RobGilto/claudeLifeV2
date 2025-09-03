#!/usr/bin/env node

/**
 * Unified Ritual Command Interface V2
 * Purpose: Complete CLI interface for advanced ritual management system
 * Usage: node scripts/ritual-cli-v2.js [command] [args...]
 * Dependencies: ritual-manager-v2.js, calendar-sync-manager.js, ritual-cli-parser.js
 * 
 * Features:
 * - Rich natural language command parsing
 * - Complete ritual lifecycle management
 * - Selective calendar sync integration
 * - Interactive and batch modes
 * - LLM-friendly error reporting
 * - Comprehensive help system
 */

const readline = require('readline');
const { RitualManagerV2, TimeUtils, UUIDGenerator } = require('./ritual-manager-v2.js');
const { CalendarSyncManager } = require('./calendar-sync-manager.js');
const { RitualCLIParser } = require('./ritual-cli-parser.js');

class RitualCLIV2 {
    constructor() {
        this.manager = new RitualManagerV2();
        this.syncManager = new CalendarSyncManager(this.manager);
        this.parser = new RitualCLIParser();
        this.rl = null;
        this.interactiveMode = false;
    }
    
    async run(args = []) {
        try {
            if (args.length === 0) {
                // Interactive mode
                this.interactiveMode = true;
                await this.runInteractiveMode();
            } else {
                // Single command mode
                const commandString = args.join(' ');
                await this.executeCommand(commandString);
            }
        } catch (error) {
            console.error(`❌ Error:`, error.message);
            if (process.env.DEBUG) {
                console.error(error.stack);
            }
            process.exit(1);
        }
    }
    
    async runInteractiveMode() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '🔄 ritual> '
        });
        
        console.log('🔄 Advanced Ritual Management System V2');
        console.log('==========================================');
        console.log('Type "help" for commands, "exit" to quit');
        console.log('');
        
        this.rl.prompt();
        
        this.rl.on('line', async (line) => {
            const command = line.trim();
            
            if (command === 'exit' || command === 'quit') {
                console.log('👋 Goodbye!');
                this.rl.close();
                return;
            }
            
            if (command === 'clear') {
                console.clear();
                this.rl.prompt();
                return;
            }
            
            if (command === '') {
                this.rl.prompt();
                return;
            }
            
            try {
                await this.executeCommand(command);
            } catch (error) {
                console.error(`❌ Error:`, error.message);
            }
            
            console.log(''); // Add spacing
            this.rl.prompt();
        });
        
        this.rl.on('close', () => {
            console.log('👋 Goodbye!');
            process.exit(0);
        });
    }
    
    async executeCommand(commandString) {
        console.log(`🔍 Processing: ${commandString}`);
        
        // Handle special commands first
        if (commandString === 'help' || commandString === '--help') {
            this.showHelp();
            return;
        }
        
        // Parse the command
        const parsedCommand = this.parser.parseCommand(commandString);
        console.log(`✅ Parsed as: ${parsedCommand.type} command`);
        
        // Execute based on command type
        switch (parsedCommand.type) {
            case 'add':
                await this.executeAddCommand(parsedCommand.parsedArgs);
                break;
            case 'list':
                await this.executeListCommand(parsedCommand.parsedArgs);
                break;
            case 'status':
                await this.executeStatusCommand(parsedCommand.parsedArgs);
                break;
            case 'edit':
                await this.executeEditCommand(parsedCommand.parsedArgs);
                break;
            case 'remove':
                await this.executeRemoveCommand(parsedCommand.parsedArgs);
                break;
            case 'sync':
                await this.executeSyncCommand(parsedCommand.parsedArgs);
                break;
            case 'complete':
                await this.executeCompleteCommand(parsedCommand.parsedArgs);
                break;
            case 'cleanup':
                await this.executeCleanupCommand(parsedCommand.parsedArgs);
                break;
            default:
                throw new Error(`Unknown command type: ${parsedCommand.type}`);
        }
    }
    
    async executeAddCommand(args) {
        console.log(`\n🔄 Creating ritual: ${args.name}`);
        console.log('==========================================');
        
        // Build ritual configuration from parsed arguments
        const config = {
            name: args.name,
            type: args.type || 'foundational',
            description: args.description || '',
            priority: args.priority || 'medium',
            frequency: args.frequency || { type: 'daily' },
            tags: args.tags || [],
            metadata: {}
        };
        
        // Build time blocks
        const timeBlocks = [];
        if (args.time && args.duration) {
            timeBlocks.push({
                startTime: args.time,
                duration: args.duration,
                flexible: args.flexible || false,
                context: TimeUtils.prototype.getTimeContext ? 
                    TimeUtils.prototype.getTimeContext(TimeUtils.parseTime(args.time)) : 'general'
            });
        } else if (this.interactiveMode) {
            // Interactive time block creation
            const timeBlock = await this.createTimeBlockInteractive();
            if (timeBlock) {
                timeBlocks.push(timeBlock);
            }
        } else {
            // Default time block
            timeBlocks.push({
                startTime: '09:00',
                duration: 60,
                flexible: true,
                context: 'morning'
            });
            console.log('⚠️  Using default time block: 09:00-10:00 (60 min, flexible)');
        }
        
        config.timeBlocks = timeBlocks;
        
        // Add date constraints if provided
        if (args.startDate) {
            config.frequency.startDate = args.startDate;
        }
        if (args.endDate) {
            config.frequency.endDate = args.endDate;
        }
        
        // Create the ritual
        const ritual = this.manager.addRitual(config);
        
        console.log(`\n✅ Ritual created successfully!`);
        console.log(`📋 Details:`);
        console.log(`   UUID: ${ritual.uuid}`);
        console.log(`   Name: ${ritual.name}`);
        console.log(`   Type: ${ritual.type}`);
        console.log(`   Frequency: ${JSON.stringify(ritual.frequencyPattern.config)}`);
        console.log(`   Time blocks: ${ritual.timeBlocks.length}`);
        
        ritual.timeBlocks.forEach((block, index) => {
            const endTime = TimeUtils.addMinutes(block.startTime, block.duration);
            console.log(`     ${index + 1}. ${block.startTime} - ${endTime} (${block.duration}min)`);
        });
        
        // Ask about immediate calendar sync
        if (this.interactiveMode) {
            const shouldSync = await this.ask('🗓️  Sync to calendar immediately? (y/n): ');
            if (shouldSync.toLowerCase().startsWith('y')) {
                const period = await this.ask('📅 Sync period (day/week/month): ') || 'day';
                const date = await this.ask('📅 Date (YYYY-MM-DD) or press enter for today: ') || TimeUtils.getDateString();
                
                await this.executeSyncCommand({ period, date });
            }
        }
    }
    
    async createTimeBlockInteractive() {
        console.log('\n⏰ Create Time Block:');
        
        const startTime = await this.ask('Start time (HH:MM): ');
        if (!startTime.match(/^\d{2}:\d{2}$/)) {
            console.log('❌ Invalid time format. Skipping time block creation.');
            return null;
        }
        
        const durationStr = await this.ask('Duration (minutes): ');
        const duration = parseInt(durationStr);
        if (isNaN(duration) || duration < 5) {
            console.log('❌ Invalid duration. Skipping time block creation.');
            return null;
        }
        
        const flexibleStr = await this.ask('Flexible timing? (y/n): ');
        const flexible = flexibleStr.toLowerCase().startsWith('y');
        
        return {
            startTime,
            duration,
            flexible,
            context: 'interactive'
        };
    }
    
    async executeListCommand(args) {
        console.log('\n📋 Ritual List');
        console.log('==============');
        
        const filters = {};
        if (args.type) filters.type = args.type;
        if (args.priority) filters.priority = args.priority;
        if (args.active !== undefined) filters.active = args.active;
        if (args.tags) filters.tags = args.tags;
        
        const rituals = this.manager.listRituals(filters);
        
        if (rituals.length === 0) {
            console.log('No rituals found matching the criteria.');
            if (Object.keys(filters).length > 0) {
                console.log('Filters applied:', JSON.stringify(filters));
            }
            console.log('\nUse "ritual add" to create your first ritual.');
            return;
        }
        
        console.log(`Found ${rituals.length} ritual(s):\n`);
        
        rituals.forEach((ritual, index) => {
            const statusIcon = ritual.active ? '✅' : '❌';
            console.log(`${index + 1}. ${statusIcon} ${ritual.name}`);
            console.log(`   UUID: ${ritual.uuid}`);
            console.log(`   Type: ${ritual.type} | Priority: ${ritual.priority}`);
            console.log(`   Time blocks: ${ritual.timeBlocks} | Created: ${ritual.created.split('T')[0]}`);
            
            if (ritual.tags && ritual.tags.length > 0) {
                console.log(`   Tags: ${ritual.tags.join(', ')}`);
            }
            console.log('');
        });
        
        // Show summary
        const activeCount = rituals.filter(r => r.active).length;
        const typeBreakdown = rituals.reduce((acc, r) => {
            acc[r.type] = (acc[r.type] || 0) + 1;
            return acc;
        }, {});
        
        console.log(`📊 Summary:`);
        console.log(`   Active: ${activeCount}/${rituals.length}`);
        console.log(`   Types: ${Object.entries(typeBreakdown).map(([type, count]) => `${type}(${count})`).join(', ')}`);
    }
    
    async executeStatusCommand(args) {
        const dateStr = args.date || TimeUtils.getDateString();
        console.log(`\n📊 Ritual Status - ${dateStr}`);
        console.log('='.repeat(40));
        
        const status = this.manager.getStatus(dateStr);
        
        console.log(`📅 ${status.dayOfWeek.charAt(0).toUpperCase() + status.dayOfWeek.slice(1)}`);
        if (status.isWeekend) {
            console.log('🏖️  Weekend');
        }
        
        console.log(`\n🔄 Active Rituals: ${status.activeRitualsToday}/${status.totalRituals}`);
        
        if (status.rituals.length === 0) {
            console.log('   No rituals scheduled for this date');
        } else {
            console.log('\n   Scheduled rituals:');
            status.rituals.forEach((ritual, index) => {
                const flexIcon = ritual.flexible ? '🔄' : '📍';
                const typeIcon = this.getRitualTypeIcon(ritual.type);
                console.log(`   ${index + 1}. ${typeIcon} ${ritual.name} (${ritual.type})`);
                console.log(`      ${flexIcon} ${ritual.startTime} - ${ritual.endTime} (${ritual.duration}min)`);
                console.log(`      Priority: ${ritual.priority} | UUID: ${ritual.uuid.slice(0, 8)}`);
            });
        }
        
        console.log(`\n⏰ Time Availability:`);
        console.log(`   Available: ${status.totalAvailableTime.display}`);
        console.log(`   Blocked: ${status.totalBlockedTime.display}`);
        console.log(`   Windows: ${status.availableWindows}`);
        
        if (status.availability.availableWindows.length > 0) {
            console.log('\n   Available windows:');
            status.availability.availableWindows.forEach((window, index) => {
                const hours = Math.floor(window.duration / 60);
                const mins = window.duration % 60;
                console.log(`   ${index + 1}. 🟢 ${window.startTime} - ${window.endTime} (${hours}h ${mins}m) - ${window.context}`);
            });
        }
    }
    
    getRitualTypeIcon(type) {
        const icons = {
            foundational: '🏗️',
            work: '💼',
            life: '🏡',
            maintenance: '🔧'
        };
        return icons[type] || '📋';
    }
    
    async executeEditCommand(args) {
        console.log(`\n✏️ Editing ritual: ${args.uuid.slice(0, 8)}`);
        console.log('=====================================');
        
        const ritual = this.manager.rituals.get(args.uuid);
        if (!ritual) {
            throw new Error(`Ritual not found: ${args.uuid}`);
        }
        
        console.log(`Current ritual: ${ritual.name}`);
        
        // Build updates object from parsed arguments
        const updates = {};
        
        if (args.name && args.name !== ritual.name) {
            updates.name = args.name;
            console.log(`📝 Name: "${ritual.name}" → "${args.name}"`);
        }
        
        if (args.type && args.type !== ritual.type) {
            updates.type = args.type;
            console.log(`🏷️ Type: "${ritual.type}" → "${args.type}"`);
        }
        
        if (args.priority && args.priority !== ritual.priority) {
            updates.priority = args.priority;
            console.log(`📊 Priority: "${ritual.priority}" → "${args.priority}"`);
        }
        
        if (args.description !== undefined) {
            updates.description = args.description;
            console.log(`📝 Description updated`);
        }
        
        if (args.frequency) {
            updates.frequencyPattern = FrequencyEngine.createPattern(args.frequency);
            console.log(`🔄 Frequency updated: ${JSON.stringify(args.frequency)}`);
        }
        
        // Handle time block updates
        if (args.time || args.duration || args.flexible !== undefined) {
            console.log(`⏰ Updating time blocks...`);
            
            // For simplicity, update the first time block
            if (ritual.timeBlocks.length > 0) {
                const timeBlock = { ...ritual.timeBlocks[0] };
                
                if (args.time) {
                    timeBlock.startTime = args.time;
                    console.log(`   Start time: ${timeBlock.startTime} → ${args.time}`);
                }
                
                if (args.duration) {
                    timeBlock.duration = args.duration;
                    console.log(`   Duration: ${timeBlock.duration} → ${args.duration} minutes`);
                }
                
                if (args.flexible !== undefined) {
                    timeBlock.flexible = args.flexible;
                    console.log(`   Flexible: ${timeBlock.flexible} → ${args.flexible}`);
                }
                
                updates.timeBlocks = [timeBlock, ...ritual.timeBlocks.slice(1)];
            }
        }
        
        if (Object.keys(updates).length === 0) {
            console.log('⚠️  No changes detected. Ritual unchanged.');
            return;
        }
        
        // Apply updates
        const updatedRitual = this.manager.updateRitual(args.uuid, updates);
        
        console.log(`\n✅ Ritual updated successfully!`);
        console.log(`   Name: ${updatedRitual.name}`);
        console.log(`   Type: ${updatedRitual.type}`);
        console.log(`   Priority: ${updatedRitual.priority}`);
        console.log(`   Updated: ${updatedRitual.updated}`);
    }
    
    async executeRemoveCommand(args) {
        console.log(`\n🗑️ Removing ritual: ${args.uuid.slice(0, 8)}`);
        console.log('======================================');
        
        const ritual = this.manager.rituals.get(args.uuid);
        if (!ritual) {
            throw new Error(`Ritual not found: ${args.uuid}`);
        }
        
        console.log(`Ritual: ${ritual.name} (${ritual.type})`);
        
        // Confirm deletion in interactive mode
        if (this.interactiveMode) {
            const confirm = await this.ask('⚠️  Are you sure you want to remove this ritual? (y/n): ');
            if (!confirm.toLowerCase().startsWith('y')) {
                console.log('❌ Removal cancelled.');
                return;
            }
        }
        
        const deleteFromCalendar = args.deleteFromCalendar || false;
        const removedRitual = this.manager.removeRitual(args.uuid, deleteFromCalendar);
        
        console.log(`✅ Ritual removed: ${removedRitual.name}`);
        
        if (deleteFromCalendar) {
            console.log(`📅 Calendar cleanup will be processed for this ritual.`);
        }
    }
    
    async executeSyncCommand(args) {
        console.log(`\n📅 Calendar Sync: ${args.period}`);
        console.log('='.repeat(30));
        
        const period = args.period || 'day';
        let periodValue;
        
        // Determine period value
        if (args.date) {
            periodValue = args.date;
        } else {
            const today = TimeUtils.getDateString();
            
            switch (period) {
                case 'day':
                    periodValue = today;
                    break;
                case 'week':
                    const weekNum = TimeUtils.getWeekNumber(today);
                    const year = new Date().getFullYear();
                    periodValue = `${year}-W${weekNum.toString().padStart(2, '0')}`;
                    break;
                case 'month':
                    periodValue = today.substring(0, 7); // YYYY-MM
                    break;
                case 'quarter':
                    const quarter = TimeUtils.getQuarter(today);
                    const yearQ = new Date().getFullYear();
                    periodValue = `${yearQ}-Q${quarter}`;
                    break;
                case 'year':
                    periodValue = new Date().getFullYear().toString();
                    break;
                default:
                    throw new Error(`Invalid period type: ${period}`);
            }
        }
        
        console.log(`🎯 Target: ${period} ${periodValue}`);
        
        // Build sync options
        const options = {
            includeTypes: args.includeTypes,
            excludeTypes: args.excludeTypes,
            resolveConflicts: args.resolveConflicts || 'ritual-wins',
            replaceExisting: args.replaceExisting || false,
            autoExecute: false // Never auto-execute, always show MCP commands
        };
        
        console.log(`⚙️ Options:`, JSON.stringify(options, null, 2));
        
        // Execute sync
        const result = await this.syncManager.syncPeriod(period, periodValue, options);
        
        console.log(`\n✅ Sync completed successfully!`);
        console.log(`📊 Summary:`);
        console.log(`   Events created: ${result.summary.eventsCreated}`);
        console.log(`   Conflicts detected: ${result.summary.conflictsDetected}`);
        console.log(`   Days processed: ${result.summary.daysProcessed}`);
        console.log(`   MCP commands file: ${result.mcpCommandsFile}`);
        
        if (result.conflicts && result.conflicts.length > 0) {
            console.log(`\n⚠️ Conflicts detected:`);
            result.conflicts.forEach((conflict, index) => {
                console.log(`   ${index + 1}. ${conflict.description}`);
            });
        }
        
        console.log(`\n📋 To execute calendar sync, use the MCP commands from: ${result.mcpCommandsFile}`);
    }
    
    async executeCompleteCommand(args) {
        console.log(`\n✅ Completing ritual: ${args.uuid.slice(0, 8)}`);
        console.log('=======================================');
        
        const dateStr = args.date || TimeUtils.getDateString();
        const timeStr = args.time || new Date().toTimeString().slice(0, 5);
        
        const success = this.manager.markRitualComplete(args.uuid, dateStr, timeStr);
        
        if (success) {
            console.log(`✅ Ritual marked as completed for ${dateStr} at ${timeStr}`);
            
            // Show streak information if available
            const completion = this.manager.completions.get(args.uuid);
            if (completion) {
                console.log(`📈 Current streak: ${completion.currentStreak}`);
                console.log(`🏆 Total completions: ${completion.totalCompletions}`);
            }
        } else {
            console.log(`❌ Failed to mark ritual as completed`);
        }
    }
    
    async executeCleanupCommand(args) {
        console.log(`\n🧹 Cleanup Operations`);
        console.log('====================');
        
        if (args.expired || !args.olderThan) {
            // Clean up expired periods
            const daysOld = parseInt(args.olderThan) || 7;
            const expiredPeriods = await this.syncManager.cleanupExpiredPeriods(daysOld);
            
            console.log(`✅ Cleanup completed. Processed ${expiredPeriods.length} expired periods.`);
        }
        
        // Clear availability cache
        this.manager.clearAvailabilityCache();
        console.log(`🗑️ Availability cache cleared.`);
    }
    
    showHelp() {
        console.log(`
🔄 Advanced Ritual Management System V2
========================================

USAGE:
  ritual-cli-v2.js [command]
  ritual-cli-v2.js                    # Interactive mode

COMMANDS:

📝 ADD RITUALS:
  ritual add "Name" --daily --time=09:00 --duration=60 --type=foundational
  ritual add "Exercise" --weekly=mon,wed,fri --time=18:00 --duration=30
  ritual add "Monthly Review" --monthly --days=1 --time=19:00 --duration=120
  ritual add "Quarterly Planning" --quarterly --months=1 --days=1 --time=09:00

📋 LIST & STATUS:
  ritual list                         # List all rituals
  ritual list --active --type=work    # Filter active work rituals
  ritual status                       # Show today's status
  ritual status --date=2025-09-15     # Show specific date status

✏️ EDIT & REMOVE:
  ritual edit <uuid> --time=19:00     # Update time
  ritual edit <uuid> --frequency="--weekly=tue,thu" # Update frequency
  ritual remove <uuid>                # Deactivate ritual
  ritual remove <uuid> --delete-from-calendar # Remove from calendar too

📅 CALENDAR SYNC:
  ritual sync --period=day            # Sync today to calendar
  ritual sync --period=week           # Sync current week
  ritual sync --period=month --types=foundational,work
  ritual sync --period=quarter --exclude=maintenance

✅ COMPLETION:
  ritual complete <uuid>              # Mark completed now
  ritual complete <uuid> --date=2025-09-15 --time=08:30

🧹 CLEANUP:
  ritual cleanup                      # Clean expired periods (7 days)
  ritual cleanup --older-than=14     # Clean periods older than 14 days

FREQUENCY PATTERNS:
  --daily                            # Every day
  --every-other-day                  # Every 2 days
  --interval=3                       # Every 3 days
  --weekly=mon,wed,fri               # Specific weekdays
  --weekly=weekdays                  # Monday-Friday
  --weekly=weekend                   # Saturday-Sunday
  --monthly --days=1,15,last         # Specific dates
  --monthly --week-day=first-monday  # First Monday of month
  --quarterly --months=1,3 --days=1  # First day of Q1 and Q3

RITUAL TYPES:
  foundational - Daily practices (exercise, learning, habits)
  work         - Work schedules, meetings, blocked work time  
  life         - Personal commitments (family, appointments)
  maintenance  - Regular tasks (shopping, cleaning, admin)

EXAMPLES:
  # Create daily morning routine
  ritual add "Morning Routine" --daily --time=07:00 --duration=60 --type=foundational

  # Create work schedule Monday-Friday
  ritual add "Work Block" --weekly=weekdays --time=09:00 --duration=480 --type=work

  # Monthly bill payment reminder
  ritual add "Pay Bills" --monthly --days=1 --time=10:00 --duration=30 --type=maintenance

  # Sync this week to calendar
  ritual sync --period=week --types=foundational,work

For interactive mode, just run: ritual-cli-v2.js
        `);
    }
    
    async ask(question) {
        if (!this.interactiveMode || !this.rl) {
            return '';
        }
        
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }
}

// Main execution
if (require.main === module) {
    const cli = new RitualCLIV2();
    cli.run(process.argv.slice(2)).catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { RitualCLIV2 };