#!/usr/bin/env node

/**
 * TaskWarrior Ritual Integration
 * Purpose: Sync rituals and ritual-aware plans with TaskWarrior for task-level execution
 * Usage: node scripts/taskwarrior-ritual-sync.js [command] [args]
 * Dependencies: ritual-manager.js, child_process for TaskWarrior CLI
 * 
 * Features:
 * - Create TaskWarrior tasks from ritual completions
 * - Sync daily ritual instances to tasks
 * - Integration with ritual-aware planning
 * - Weekly ritual task review and cleanup
 * - Project-based organization for rituals
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const { RitualManager, TimeUtils } = require('./ritual-manager.js');

// Configuration
const SYNC_DATA_DIR = path.join(__dirname, '..', 'taskwarrior-sync');
const SYNC_LOG_FILE = path.join(SYNC_DATA_DIR, 'sync-log.json');

class TaskWarriorRitualSync {
    constructor() {
        this.ritualManager = new RitualManager();
        this.syncData = this.loadSyncData();
        
        // Ensure sync directory exists
        if (!fs.existsSync(SYNC_DATA_DIR)) {
            fs.mkdirSync(SYNC_DATA_DIR, { recursive: true });
        }
    }
    
    async run(args) {
        const command = args[0] || 'sync-daily';
        
        try {
            switch (command) {
                case 'sync-daily':
                    await this.syncDailyRituals(args[1]);
                    break;
                case 'sync-weekly':
                    await this.syncWeeklyRituals(args[1]);
                    break;
                case 'create-ritual-tasks':
                    await this.createRitualTasks(args[1]);
                    break;
                case 'update-completions':
                    await this.updateTaskCompletions(args[1]);
                    break;
                case 'setup-projects':
                    await this.setupTaskWarriorProjects();
                    break;
                case 'cleanup':
                    await this.cleanupCompletedTasks(args[1]);
                    break;
                case 'status':
                    await this.showSyncStatus();
                    break;
                default:
                    this.showHelp();
            }
        } catch (error) {
            console.error('Error:', error.message);
            this.logError(error);
        }
    }
    
    async syncDailyRituals(dateStr = null) {
        const targetDate = dateStr || TimeUtils.getDateString();
        
        console.log(`\n📋 Syncing Daily Rituals to TaskWarrior - ${targetDate}`);
        console.log('='.repeat(50));
        
        const ritualStatus = this.ritualManager.getStatus(targetDate);
        
        if (ritualStatus.ritualsToday === 0) {
            console.log('ℹ️  No rituals scheduled for today');
            return;
        }
        
        console.log(`📊 Found ${ritualStatus.ritualsToday} rituals for ${targetDate}`);
        
        const createdTasks = [];
        const skippedTasks = [];
        
        for (const ritual of ritualStatus.rituals) {
            // Check if task already exists for this ritual today
            const existingTaskId = await this.findExistingRitualTask(ritual.id, targetDate);
            
            if (existingTaskId) {
                skippedTasks.push({
                    ritualName: ritual.name,
                    taskId: existingTaskId,
                    reason: 'Task already exists'
                });
                continue;
            }
            
            // Create TaskWarrior task for each time block
            for (const timeBlock of ritual.timeBlocks) {
                const dayOfWeek = TimeUtils.getDayOfWeek(targetDate);
                if (timeBlock.day === 'daily' || timeBlock.day === dayOfWeek) {
                    const taskId = await this.createRitualTask(ritual, timeBlock, targetDate);
                    
                    if (taskId) {
                        createdTasks.push({
                            ritualName: ritual.name,
                            ritualType: ritual.type,
                            taskId,
                            timeBlock: `${timeBlock.startTime} (${timeBlock.duration}min)`,
                            project: this.getRitualProject(ritual.type)
                        });
                        
                        // Record sync in our data
                        this.recordTaskSync(ritual.id, taskId, targetDate, timeBlock);
                    }
                }
            }
        }
        
        console.log(`\n✅ Task Creation Summary:`);
        console.log(`   📝 Created: ${createdTasks.length} tasks`);
        console.log(`   ⏭️  Skipped: ${skippedTasks.length} tasks`);
        
        if (createdTasks.length > 0) {
            console.log('\n📋 Created Tasks:');
            createdTasks.forEach(task => {
                console.log(`   🔹 ${task.ritualName} (${task.timeBlock})`);
                console.log(`      Task ID: ${task.taskId} | Project: ${task.project}`);
            });
        }
        
        if (skippedTasks.length > 0) {
            console.log('\n⏭️  Skipped Tasks:');
            skippedTasks.forEach(task => {
                console.log(`   ➖ ${task.ritualName} - ${task.reason} (ID: ${task.taskId})`);
            });
        }
        
        // Update sync log
        this.saveSyncData();
        
        console.log('\n💡 Next Steps:');
        console.log('   • Run `task next` to see your ritual tasks');
        console.log('   • Complete tasks with `task <id> done`');
        console.log('   • Update completions: node scripts/taskwarrior-ritual-sync.js update-completions');
    }
    
    async createRitualTask(ritual, timeBlock, date) {
        try {
            const endTime = TimeUtils.addMinutes(timeBlock.startTime, timeBlock.duration);
            const project = this.getRitualProject(ritual.type);
            
            const taskDescription = `${ritual.name} (${timeBlock.startTime}-${endTime})`;
            const priority = this.mapRitualPriority(ritual.priority);
            
            // Build TaskWarrior command
            const tags = [
                'ritual',
                ritual.type,
                date.replace(/-/g, ''),
                timeBlock.flexible ? 'flexible' : 'fixed'
            ];
            
            const taskCommand = [
                'task', 'add',
                `"${taskDescription}"`,
                `project:${project}`,
                `priority:${priority}`,
                `due:${date}`,
                `scheduled:${date}`,
                ...tags.map(tag => `+${tag}`)
            ].join(' ');
            
            console.log(`🔧 Creating task: ${taskDescription}`);
            
            // Execute TaskWarrior command
            const result = execSync(taskCommand, { encoding: 'utf8' });
            
            // Extract task ID from result
            const taskIdMatch = result.match(/Created task (\d+)/);
            const taskId = taskIdMatch ? taskIdMatch[1] : null;
            
            if (taskId) {
                // Add ritual metadata as annotations
                const annotateCommands = [
                    `task ${taskId} annotate "Ritual ID: ${ritual.id}"`,
                    `task ${taskId} annotate "Time: ${timeBlock.startTime}-${endTime}"`,
                    `task ${taskId} annotate "Duration: ${timeBlock.duration} minutes"`,
                ];
                
                if (ritual.description) {
                    annotateCommands.push(`task ${taskId} annotate "Description: ${ritual.description}"`);
                }
                
                for (const cmd of annotateCommands) {
                    execSync(cmd, { encoding: 'utf8' });
                }
                
                console.log(`✅ Created TaskWarrior task ${taskId} for ${ritual.name}`);
                return taskId;
            } else {
                console.log(`❌ Failed to extract task ID for ${ritual.name}`);
                return null;
            }
            
        } catch (error) {
            console.log(`❌ Error creating task for ${ritual.name}: ${error.message}`);
            return null;
        }
    }
    
    getRitualProject(ritualType) {
        const projectMap = {
            'work': 'Work.Schedule',
            'foundational': 'Personal.Rituals',
            'life': 'Personal.Life',
            'maintenance': 'Personal.Maintenance'
        };
        
        return projectMap[ritualType] || 'Personal.Rituals';
    }
    
    mapRitualPriority(ritualPriority) {
        const priorityMap = {
            'high': 'H',
            'medium': 'M', 
            'low': 'L'
        };
        
        return priorityMap[ritualPriority] || 'M';
    }
    
    async findExistingRitualTask(ritualId, date) {
        try {
            const dateTag = date.replace(/-/g, '');
            const searchCommand = `task +ritual +${dateTag} export`;
            
            const result = execSync(searchCommand, { encoding: 'utf8' });
            const tasks = JSON.parse(result || '[]');
            
            // Look for task with matching ritual ID in annotations
            for (const task of tasks) {
                if (task.annotations) {
                    const hasRitualId = task.annotations.some(ann => 
                        ann.description.includes(`Ritual ID: ${ritualId}`)
                    );
                    if (hasRitualId) {
                        return task.id;
                    }
                }
            }
            
            return null;
        } catch (error) {
            // No matching tasks found or other error
            return null;
        }
    }
    
    async updateTaskCompletions(dateStr = null) {
        const targetDate = dateStr || TimeUtils.getDateString();
        
        console.log(`\n🔄 Updating Ritual Completions from TaskWarrior - ${targetDate}`);
        console.log('='.repeat(55));
        
        try {
            const dateTag = targetDate.replace(/-/g, '');
            const completedTasksCommand = `task +ritual +${dateTag} status:completed export`;
            
            const result = execSync(completedTasksCommand, { encoding: 'utf8' });
            const completedTasks = JSON.parse(result || '[]');
            
            console.log(`📊 Found ${completedTasks.length} completed ritual tasks`);
            
            if (completedTasks.length === 0) {
                console.log('ℹ️  No completed ritual tasks to process');
                return;
            }
            
            const completionUpdates = [];
            
            for (const task of completedTasks) {
                // Extract ritual ID from annotations
                const ritualIdAnnotation = task.annotations?.find(ann => 
                    ann.description.includes('Ritual ID:')
                );
                
                if (ritualIdAnnotation) {
                    const ritualIdMatch = ritualIdAnnotation.description.match(/Ritual ID: (.+)/);
                    const ritualId = ritualIdMatch ? ritualIdMatch[1] : null;
                    
                    if (ritualId) {
                        // Mark ritual as complete in our system
                        const endTime = task.end || new Date().toISOString();
                        const completionTime = new Date(endTime).toTimeString().slice(0, 5);
                        
                        const success = this.ritualManager.markRitualComplete(
                            ritualId, 
                            targetDate, 
                            completionTime
                        );
                        
                        if (success) {
                            completionUpdates.push({
                                taskId: task.id,
                                ritualId,
                                taskDescription: task.description,
                                completionTime
                            });
                        }
                    }
                }
            }
            
            console.log(`\n✅ Completion Updates:`);
            if (completionUpdates.length > 0) {
                completionUpdates.forEach(update => {
                    console.log(`   🔹 Task ${update.taskId}: ${update.taskDescription}`);
                    console.log(`      Ritual ${update.ritualId} marked complete at ${update.completionTime}`);
                });
            } else {
                console.log('   ℹ️  No ritual completions to update');
            }
            
        } catch (error) {
            console.log(`❌ Error updating completions: ${error.message}`);
        }
    }
    
    async syncWeeklyRituals(weekStr = null) {
        const targetWeek = weekStr || this.getCurrentWeek();
        const { year, week } = this.parseWeekString(targetWeek);
        const weekDates = this.getWeekDates(year, week);
        
        console.log(`\n📅 Syncing Weekly Rituals to TaskWarrior - ${targetWeek}`);
        console.log('='.repeat(50));
        
        let totalCreated = 0;
        let totalSkipped = 0;
        
        for (const date of weekDates) {
            console.log(`\n📋 Processing ${date} (${TimeUtils.getDayOfWeek(date)})...`);
            
            const ritualStatus = this.ritualManager.getStatus(date);
            
            if (ritualStatus.ritualsToday === 0) {
                console.log('   ℹ️  No rituals for this day');
                continue;
            }
            
            for (const ritual of ritualStatus.rituals) {
                const existingTaskId = await this.findExistingRitualTask(ritual.id, date);
                
                if (existingTaskId) {
                    console.log(`   ⏭️  ${ritual.name} - task already exists (${existingTaskId})`);
                    totalSkipped++;
                    continue;
                }
                
                for (const timeBlock of ritual.timeBlocks) {
                    const dayOfWeek = TimeUtils.getDayOfWeek(date);
                    if (timeBlock.day === 'daily' || timeBlock.day === dayOfWeek) {
                        const taskId = await this.createRitualTask(ritual, timeBlock, date);
                        
                        if (taskId) {
                            console.log(`   ✅ Created task ${taskId} for ${ritual.name}`);
                            totalCreated++;
                            this.recordTaskSync(ritual.id, taskId, date, timeBlock);
                        }
                    }
                }
            }
        }
        
        console.log(`\n📊 Weekly Sync Summary:`);
        console.log(`   ✅ Created: ${totalCreated} tasks`);
        console.log(`   ⏭️  Skipped: ${totalSkipped} existing tasks`);
        console.log(`   📅 Processed: ${weekDates.length} days`);
        
        this.saveSyncData();
        
        console.log('\n💡 Next Steps:');
        console.log('   • Review tasks: `task +ritual list`');
        console.log('   • Filter by date: `task +ritual +20250830 list`');
        console.log('   • Update completions: node scripts/taskwarrior-ritual-sync.js update-completions');
    }
    
    async setupTaskWarriorProjects() {
        console.log('\n🏗️  Setting up TaskWarrior Projects for Rituals');
        console.log('='.repeat(45));
        
        const projects = [
            { name: 'Work.Schedule', description: 'Work schedules and blocked work time' },
            { name: 'Personal.Rituals', description: 'Foundational daily practices and habits' },
            { name: 'Personal.Life', description: 'Personal commitments and life activities' },
            { name: 'Personal.Maintenance', description: 'Regular maintenance and admin tasks' }
        ];
        
        console.log('📋 Creating TaskWarrior projects for ritual organization:');
        
        for (const project of projects) {
            try {
                // Create a sample task in each project to establish it
                const setupCommand = `task add "Setup ${project.name} project" project:${project.name} +setup priority:L`;
                execSync(setupCommand, { encoding: 'utf8' });
                console.log(`   ✅ Created project: ${project.name}`);
                
                // Immediately complete the setup task
                const setupTaskCommand = `task +setup project:${project.name} done`;
                execSync(setupTaskCommand, { encoding: 'utf8' });
                
            } catch (error) {
                console.log(`   ❌ Error setting up ${project.name}: ${error.message}`);
            }
        }
        
        console.log('\n📊 Project Structure:');
        projects.forEach(project => {
            console.log(`   🗂️  ${project.name}: ${project.description}`);
        });
        
        console.log('\n💡 Usage Examples:');
        console.log('   • List all ritual tasks: `task +ritual list`');
        console.log('   • List work rituals: `task project:Work.Schedule list`');
        console.log('   • List foundational rituals: `task project:Personal.Rituals list`');
        console.log('   • Show ritual tasks for today: `task +ritual +$(date +%Y%m%d) list`');
    }
    
    async showSyncStatus() {
        console.log('\n📊 TaskWarrior Ritual Sync Status');
        console.log('='.repeat(35));
        
        try {
            // Count ritual tasks by status
            const allRitualTasks = execSync('task +ritual export', { encoding: 'utf8' });
            const tasks = JSON.parse(allRitualTasks || '[]');
            
            const statusCounts = {
                pending: 0,
                completed: 0,
                deleted: 0
            };
            
            const projectCounts = {};
            const todayTasks = [];
            const today = TimeUtils.getDateString().replace(/-/g, '');
            
            tasks.forEach(task => {
                statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
                
                if (task.project) {
                    projectCounts[task.project] = (projectCounts[task.project] || 0) + 1;
                }
                
                if (task.tags && task.tags.includes(today)) {
                    todayTasks.push(task);
                }
            });
            
            console.log('📈 Task Summary:');
            console.log(`   📋 Total ritual tasks: ${tasks.length}`);
            console.log(`   ⏳ Pending: ${statusCounts.pending || 0}`);
            console.log(`   ✅ Completed: ${statusCounts.completed || 0}`);
            console.log(`   🗑️  Deleted: ${statusCounts.deleted || 0}`);
            
            console.log('\n🗂️  By Project:');
            Object.entries(projectCounts).forEach(([project, count]) => {
                console.log(`   📁 ${project}: ${count} tasks`);
            });
            
            console.log(`\n📅 Today's Ritual Tasks (${todayTasks.length}):`);
            if (todayTasks.length > 0) {
                todayTasks.forEach(task => {
                    const statusIcon = task.status === 'completed' ? '✅' : '⏳';
                    console.log(`   ${statusIcon} ${task.description} (ID: ${task.id})`);
                });
            } else {
                console.log('   ℹ️  No ritual tasks for today');
            }
            
            // Sync data summary
            if (this.syncData.syncs) {
                console.log(`\n🔄 Sync History: ${Object.keys(this.syncData.syncs).length} dates synced`);
                const lastSyncDate = Math.max(...Object.keys(this.syncData.syncs).map(d => new Date(d).getTime()));
                if (lastSyncDate > 0) {
                    console.log(`   📅 Last sync: ${new Date(lastSyncDate).toISOString().split('T')[0]}`);
                }
            }
            
        } catch (error) {
            console.log('❌ Error getting sync status:', error.message);
        }
    }
    
    async cleanupCompletedTasks(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));
        const cutoffStr = cutoffDate.toISOString().split('T')[0];
        
        console.log(`\n🧹 Cleaning up completed ritual tasks older than ${daysOld} days (before ${cutoffStr})`);
        console.log('='.repeat(70));
        
        try {
            // Find old completed ritual tasks
            const oldTasksCommand = `task +ritual status:completed end.before:${cutoffStr} export`;
            const result = execSync(oldTasksCommand, { encoding: 'utf8' });
            const oldTasks = JSON.parse(result || '[]');
            
            console.log(`📊 Found ${oldTasks.length} old completed ritual tasks`);
            
            if (oldTasks.length === 0) {
                console.log('✅ No cleanup needed');
                return;
            }
            
            console.log('🗑️  Tasks to be deleted:');
            oldTasks.forEach(task => {
                const endDate = new Date(task.end).toISOString().split('T')[0];
                console.log(`   • ${task.id}: ${task.description} (completed: ${endDate})`);
            });
            
            // Delete old tasks
            const taskIds = oldTasks.map(task => task.id).join(',');
            const deleteCommand = `task ${taskIds} delete`;
            
            console.log(`\n🔧 Executing: ${deleteCommand}`);
            
            // Note: In a real implementation, you might want to prompt for confirmation
            // execSync(deleteCommand, { encoding: 'utf8', input: 'yes\n' });
            
            console.log(`✅ Would delete ${oldTasks.length} old completed ritual tasks`);
            console.log('💡 Uncomment the execSync line in code to actually perform deletion');
            
        } catch (error) {
            console.log(`❌ Error during cleanup: ${error.message}`);
        }
    }
    
    recordTaskSync(ritualId, taskId, date, timeBlock) {
        if (!this.syncData.syncs) {
            this.syncData.syncs = {};
        }
        
        if (!this.syncData.syncs[date]) {
            this.syncData.syncs[date] = [];
        }
        
        this.syncData.syncs[date].push({
            ritualId,
            taskId,
            timeBlock: {
                startTime: timeBlock.startTime,
                duration: timeBlock.duration
            },
            syncedAt: new Date().toISOString()
        });
    }
    
    loadSyncData() {
        if (fs.existsSync(SYNC_LOG_FILE)) {
            return JSON.parse(fs.readFileSync(SYNC_LOG_FILE, 'utf8'));
        }
        return { syncs: {}, errors: [] };
    }
    
    saveSyncData() {
        fs.writeFileSync(SYNC_LOG_FILE, JSON.stringify(this.syncData, null, 2));
    }
    
    logError(error) {
        if (!this.syncData.errors) {
            this.syncData.errors = [];
        }
        
        this.syncData.errors.push({
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        });
        
        this.saveSyncData();
    }
    
    // Utility methods
    getCurrentWeek() {
        const now = new Date();
        const year = now.getFullYear();
        const week = this.getWeekNumber(now);
        return `${year}-W${String(week).padStart(2, '0')}`;
    }
    
    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }
    
    parseWeekString(weekStr) {
        const [year, weekPart] = weekStr.split('-W');
        return { year: parseInt(year), week: parseInt(weekPart) };
    }
    
    getWeekDates(year, week) {
        const firstDay = new Date(year, 0, 1);
        const daysOffset = (week - 1) * 7;
        const weekStart = new Date(firstDay.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        
        const dayOfWeek = weekStart.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(weekStart.getDate() + mondayOffset);
        
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            dates.push(TimeUtils.getDateString(date));
        }
        
        return dates;
    }
    
    showHelp() {
        console.log(`
TaskWarrior Ritual Integration
==============================

Commands:
  sync-daily [date]       - Sync today's rituals to TaskWarrior tasks
  sync-weekly [week]      - Sync entire week of rituals to tasks  
  create-ritual-tasks     - Create tasks for specific ritual
  update-completions      - Update ritual completions from TaskWarrior
  setup-projects          - Create TaskWarrior projects for ritual organization
  cleanup [days]          - Clean up old completed ritual tasks
  status                  - Show sync status and task summary

Examples:
  node scripts/taskwarrior-ritual-sync.js sync-daily
  node scripts/taskwarrior-ritual-sync.js sync-weekly 2025-W35
  node scripts/taskwarrior-ritual-sync.js update-completions
  node scripts/taskwarrior-ritual-sync.js setup-projects
  node scripts/taskwarrior-ritual-sync.js status

TaskWarrior Integration Features:
  ✅ Creates tasks for each ritual instance with proper scheduling
  ✅ Organizes tasks by project (Work.Schedule, Personal.Rituals, etc.)
  ✅ Adds metadata as annotations (ritual ID, time, duration)
  ✅ Syncs completions back to ritual tracking system
  ✅ Prevents duplicate task creation
  ✅ Supports both daily and weekly batch processing

Task Organization:
  🗂️  Work.Schedule        - Work schedules and blocked work time
  🗂️  Personal.Rituals     - Foundational daily practices  
  🗂️  Personal.Life        - Personal commitments and life activities
  🗂️  Personal.Maintenance - Regular maintenance and admin tasks

Workflow:
  1. Setup projects: node scripts/taskwarrior-ritual-sync.js setup-projects
  2. Define rituals: node scripts/ritual-manager.js add
  3. Sync to tasks: node scripts/taskwarrior-ritual-sync.js sync-daily
  4. Work on tasks: task next
  5. Complete tasks: task <id> done
  6. Update rituals: node scripts/taskwarrior-ritual-sync.js update-completions

This creates a complete loop: rituals → tasks → completions → ritual tracking
        `);
    }
}

// Main execution
if (require.main === module) {
    const sync = new TaskWarriorRitualSync();
    sync.run(process.argv.slice(2));
}

module.exports = { TaskWarriorRitualSync };