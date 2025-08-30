#!/usr/bin/env node

/**
 * Ritual Management System
 * Purpose: Manage recurring commitments, foundational habits, and work schedules
 * Usage: node scripts/ritual-manager.js [command] [args]
 * Dependencies: fs, path, readline
 * 
 * Features:
 * - Ritual definition and storage
 * - Time availability calculation
 * - Completion tracking and streaks
 * - Conflict detection
 * - Integration with planning system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const RITUALS_DIR = path.join(__dirname, '..', 'rituals');
const RITUAL_DEFINITIONS_FILE = path.join(RITUALS_DIR, 'ritual-definitions.json');
const RITUAL_COMPLETIONS_FILE = path.join(RITUALS_DIR, 'ritual-completions.json');
const BLOCKED_TIMES_FILE = path.join(RITUALS_DIR, 'blocked-times.json');
const AVAILABILITY_CACHE_DIR = path.join(RITUALS_DIR, 'availability-cache');

// Ensure directories exist
[RITUALS_DIR, AVAILABILITY_CACHE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Time utilities
class TimeUtils {
    static parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes; // minutes since midnight
    }
    
    static formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
    
    static addMinutes(timeStr, minutes) {
        const totalMinutes = this.parseTime(timeStr) + minutes;
        return this.formatTime(totalMinutes);
    }
    
    static isTimeInRange(time, start, end) {
        const timeMinutes = this.parseTime(time);
        const startMinutes = this.parseTime(start);
        const endMinutes = this.parseTime(end);
        return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    }
    
    static getDateString(date = new Date()) {
        return date.toISOString().split('T')[0];
    }
    
    static getDayOfWeek(dateStr) {
        const date = new Date(dateStr + 'T12:00:00');
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }
}

// Ritual Management System
class RitualManager {
    constructor() {
        this.rituals = this.loadRituals();
        this.completions = this.loadCompletions();
        this.blockedTimes = this.loadBlockedTimes();
    }
    
    loadRituals() {
        if (fs.existsSync(RITUAL_DEFINITIONS_FILE)) {
            return JSON.parse(fs.readFileSync(RITUAL_DEFINITIONS_FILE, 'utf8'));
        }
        return { rituals: [] };
    }
    
    loadCompletions() {
        if (fs.existsSync(RITUAL_COMPLETIONS_FILE)) {
            return JSON.parse(fs.readFileSync(RITUAL_COMPLETIONS_FILE, 'utf8'));
        }
        return { completions: {} };
    }
    
    loadBlockedTimes() {
        if (fs.existsSync(BLOCKED_TIMES_FILE)) {
            return JSON.parse(fs.readFileSync(BLOCKED_TIMES_FILE, 'utf8'));
        }
        return { blocks: [] };
    }
    
    saveRituals() {
        fs.writeFileSync(RITUAL_DEFINITIONS_FILE, JSON.stringify(this.rituals, null, 2));
    }
    
    saveCompletions() {
        fs.writeFileSync(RITUAL_COMPLETIONS_FILE, JSON.stringify(this.completions, null, 2));
    }
    
    saveBlockedTimes() {
        fs.writeFileSync(BLOCKED_TIMES_FILE, JSON.stringify(this.blockedTimes, null, 2));
    }
    
    generateId() {
        return Date.now().toString();
    }
    
    addRitual(name, type, frequency, timeBlocks, description = '', options = {}) {
        const ritual = {
            id: this.generateId(),
            name,
            type, // work|foundational|life|maintenance
            frequency, // daily|weekly|monthly|custom
            timeBlocks,
            description,
            created: new Date().toISOString(),
            active: true,
            streak: 0,
            completionTracking: options.completionTracking !== false,
            flexible: options.flexible || false,
            priority: options.priority || 'medium'
        };
        
        this.rituals.rituals.push(ritual);
        this.saveRituals();
        
        console.log(`✅ Added ritual: ${name} (ID: ${ritual.id})`);
        return ritual;
    }
    
    getRitualsForDate(dateStr) {
        const dayOfWeek = TimeUtils.getDayOfWeek(dateStr);
        const activeRituals = this.rituals.rituals.filter(r => r.active);
        
        const applicableRituals = activeRituals.filter(ritual => {
            return ritual.timeBlocks.some(block => 
                block.day === 'daily' || 
                block.day === dayOfWeek ||
                this.matchesCustomFrequency(ritual, dateStr)
            );
        });
        
        return applicableRituals;
    }
    
    matchesCustomFrequency(ritual, dateStr) {
        // Handle custom frequency patterns
        if (ritual.frequency !== 'custom') return false;
        
        // Custom frequency logic would go here
        // For now, return false
        return false;
    }
    
    calculateAvailableTime(dateStr) {
        const ritualsForDate = this.getRitualsForDate(dateStr);
        const blockedPeriods = [];
        
        // Add ritual time blocks
        ritualsForDate.forEach(ritual => {
            ritual.timeBlocks.forEach(block => {
                const dayOfWeek = TimeUtils.getDayOfWeek(dateStr);
                if (block.day === 'daily' || block.day === dayOfWeek) {
                    blockedPeriods.push({
                        startTime: block.startTime,
                        endTime: TimeUtils.addMinutes(block.startTime, block.duration),
                        type: 'ritual',
                        ritualId: ritual.id,
                        ritualName: ritual.name,
                        priority: ritual.priority,
                        flexible: block.flexible || false
                    });
                }
            });
        });
        
        // Add manual blocks for this date
        const dateBlocks = this.blockedTimes.blocks.filter(block => 
            block.date === dateStr && block.active
        );
        dateBlocks.forEach(block => {
            blockedPeriods.push({
                startTime: block.startTime,
                endTime: block.endTime,
                type: 'blocked',
                reason: block.reason,
                priority: 'high',
                flexible: false
            });
        });
        
        // Sort blocked periods by start time
        blockedPeriods.sort((a, b) => 
            TimeUtils.parseTime(a.startTime) - TimeUtils.parseTime(b.startTime)
        );
        
        // Calculate available windows
        const availableWindows = this.calculateAvailableWindows(blockedPeriods);
        
        return {
            date: dateStr,
            dayOfWeek: TimeUtils.getDayOfWeek(dateStr),
            availableWindows,
            blockedPeriods,
            totalAvailableMinutes: availableWindows.reduce((sum, window) => sum + window.duration, 0)
        };
    }
    
    calculateAvailableWindows(blockedPeriods) {
        const windows = [];
        const dayStart = 7 * 60; // 7:00 AM
        const dayEnd = 23 * 60;  // 11:00 PM
        
        let currentTime = dayStart;
        
        for (const block of blockedPeriods) {
            const blockStart = TimeUtils.parseTime(block.startTime);
            const blockEnd = TimeUtils.parseTime(block.endTime);
            
            // Add window before this block
            if (currentTime < blockStart) {
                const duration = blockStart - currentTime;
                if (duration >= 30) { // Minimum 30-minute windows
                    windows.push({
                        startTime: TimeUtils.formatTime(currentTime),
                        endTime: TimeUtils.formatTime(blockStart),
                        duration,
                        context: this.getTimeContext(currentTime)
                    });
                }
            }
            
            // Move current time to after this block
            currentTime = Math.max(currentTime, blockEnd);
        }
        
        // Add final window if there's time left
        if (currentTime < dayEnd) {
            const duration = dayEnd - currentTime;
            if (duration >= 30) {
                windows.push({
                    startTime: TimeUtils.formatTime(currentTime),
                    endTime: TimeUtils.formatTime(dayEnd),
                    duration,
                    context: this.getTimeContext(currentTime)
                });
            }
        }
        
        return windows;
    }
    
    getTimeContext(timeInMinutes) {
        const hour = Math.floor(timeInMinutes / 60);
        if (hour < 12) return 'morning';
        if (hour < 17) return 'afternoon';
        return 'evening';
    }
    
    addTemporaryBlock(date, startTime, endTime, reason) {
        const block = {
            id: this.generateId(),
            date,
            startTime,
            endTime,
            reason,
            created: new Date().toISOString(),
            active: true
        };
        
        this.blockedTimes.blocks.push(block);
        this.saveBlockedTimes();
        
        // Clear availability cache for this date
        this.clearAvailabilityCache(date);
        
        console.log(`🚫 Added time block: ${date} ${startTime}-${endTime} (${reason})`);
        return block;
    }
    
    clearAvailabilityCache(dateStr = null) {
        if (dateStr) {
            const cacheFile = path.join(AVAILABILITY_CACHE_DIR, `availability-${dateStr}.json`);
            if (fs.existsSync(cacheFile)) {
                fs.unlinkSync(cacheFile);
            }
        } else {
            // Clear all cache files
            const files = fs.readdirSync(AVAILABILITY_CACHE_DIR);
            files.forEach(file => {
                fs.unlinkSync(path.join(AVAILABILITY_CACHE_DIR, file));
            });
        }
    }
    
    markRitualComplete(ritualId, dateStr = null, timeStr = null) {
        dateStr = dateStr || TimeUtils.getDateString();
        timeStr = timeStr || new Date().toTimeString().slice(0, 5);
        
        const ritual = this.rituals.rituals.find(r => r.id === ritualId);
        if (!ritual) {
            console.log(`❌ Ritual not found: ${ritualId}`);
            return false;
        }
        
        if (!this.completions.completions[ritualId]) {
            this.completions.completions[ritualId] = {
                ritualName: ritual.name,
                history: [],
                currentStreak: 0,
                longestStreak: 0,
                totalCompletions: 0
            };
        }
        
        const completion = this.completions.completions[ritualId];
        
        // Check if already completed today
        const existingCompletion = completion.history.find(h => h.date === dateStr);
        if (existingCompletion) {
            console.log(`⚠️  Ritual already completed today: ${ritual.name}`);
            return false;
        }
        
        // Add completion
        completion.history.push({
            date: dateStr,
            time: timeStr,
            completed: true
        });
        
        // Update streak
        completion.totalCompletions++;
        this.updateStreak(completion);
        
        this.saveCompletions();
        
        console.log(`✅ Marked complete: ${ritual.name} (Streak: ${completion.currentStreak})`);
        return true;
    }
    
    updateStreak(completion) {
        const sortedHistory = completion.history
            .filter(h => h.completed)
            .sort((a, b) => b.date.localeCompare(a.date));
        
        let streak = 0;
        const today = TimeUtils.getDateString();
        let checkDate = new Date(today);
        
        for (const entry of sortedHistory) {
            const entryDate = entry.date;
            const expectedDate = TimeUtils.getDateString(checkDate);
            
            if (entryDate === expectedDate) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        completion.currentStreak = streak;
        completion.longestStreak = Math.max(completion.longestStreak, streak);
    }
    
    getStatus(dateStr = null) {
        dateStr = dateStr || TimeUtils.getDateString();
        
        const availability = this.calculateAvailableTime(dateStr);
        const rituals = this.getRitualsForDate(dateStr);
        const activeRituals = this.rituals.rituals.filter(r => r.active);
        
        return {
            date: dateStr,
            dayOfWeek: availability.dayOfWeek,
            totalRituals: activeRituals.length,
            ritualsToday: rituals.length,
            availableWindows: availability.availableWindows.length,
            totalAvailableMinutes: availability.totalAvailableMinutes,
            rituals: rituals.map(r => ({
                id: r.id,
                name: r.name,
                type: r.type,
                timeBlocks: r.timeBlocks.filter(block => 
                    block.day === 'daily' || block.day === availability.dayOfWeek
                ),
                completion: this.completions.completions[r.id] || null
            })),
            availability
        };
    }
}

// CLI Interface
class RitualCLI {
    constructor() {
        this.manager = new RitualManager();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    
    async run(args) {
        const command = args[0] || 'status';
        
        try {
            switch (command) {
                case 'add':
                    await this.addRitual();
                    break;
                case 'status':
                    await this.showStatus(args[1]);
                    break;
                case 'complete':
                    await this.markComplete(args[1], args[2]);
                    break;
                case 'block':
                    await this.addBlock();
                    break;
                case 'availability':
                    await this.showAvailability(args[1]);
                    break;
                case 'list':
                    await this.listRituals();
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
    
    async addRitual() {
        console.log('\n🔄 Adding New Ritual');
        console.log('===================');
        
        const name = await this.ask('Ritual name: ');
        console.log('\nRitual types:');
        console.log('  work        - Work schedule, meetings, blocked work time');
        console.log('  foundational - Daily practices (boot.dev, AI school, exercise)');
        console.log('  life        - Personal commitments (family time, appointments)');
        console.log('  maintenance - Regular tasks (shopping, cleaning, admin)');
        const type = await this.ask('Type (work/foundational/life/maintenance): ');
        
        console.log('\nFrequency options:');
        console.log('  daily   - Every day');
        console.log('  weekly  - Specific days of the week');
        console.log('  custom  - Custom pattern');
        const frequency = await this.ask('Frequency (daily/weekly/custom): ');
        
        const description = await this.ask('Description: ');
        
        // Collect time blocks
        const timeBlocks = [];
        console.log('\n⏰ Define Time Blocks:');
        
        if (frequency === 'daily') {
            const startTime = await this.ask('Start time (HH:MM): ');
            const duration = parseInt(await this.ask('Duration (minutes): '));
            const flexible = (await this.ask('Flexible timing? (y/n): ')).toLowerCase() === 'y';
            
            timeBlocks.push({
                day: 'daily',
                startTime,
                duration,
                flexible
            });
        } else if (frequency === 'weekly') {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            console.log('\nSelect days (comma-separated): monday,tuesday,wednesday,thursday,friday,saturday,sunday');
            const selectedDays = (await this.ask('Days: ')).split(',').map(d => d.trim().toLowerCase());
            
            for (const day of selectedDays) {
                if (days.includes(day)) {
                    const startTime = await this.ask(`${day} start time (HH:MM): `);
                    const duration = parseInt(await this.ask(`${day} duration (minutes): `));
                    const flexible = (await this.ask(`${day} flexible? (y/n): `)).toLowerCase() === 'y';
                    
                    timeBlocks.push({
                        day,
                        startTime,
                        duration,
                        flexible
                    });
                }
            }
        }
        
        const priority = await this.ask('Priority (high/medium/low): ') || 'medium';
        const completionTracking = (await this.ask('Track completions? (y/n): ')).toLowerCase() !== 'n';
        
        const options = {
            priority,
            completionTracking,
            flexible: timeBlocks.some(b => b.flexible)
        };
        
        const ritual = this.manager.addRitual(name, type, frequency, timeBlocks, description, options);
        
        console.log('\n✅ Ritual created successfully!');
        console.log(`   ID: ${ritual.id}`);
        console.log(`   Name: ${ritual.name}`);
        console.log(`   Type: ${ritual.type}`);
        console.log(`   Time blocks: ${timeBlocks.length}`);
        
        // Clear availability cache since rituals changed
        this.manager.clearAvailabilityCache();
    }
    
    async showStatus(dateStr = null) {
        const status = this.manager.getStatus(dateStr);
        
        console.log(`\n📊 Ritual Status - ${status.date} (${status.dayOfWeek})`);
        console.log('='.repeat(50));
        
        console.log(`\n🔄 Active Rituals Today: ${status.ritualsToday}/${status.totalRituals}`);
        
        if (status.rituals.length === 0) {
            console.log('   No rituals scheduled for today');
        } else {
            status.rituals.forEach(ritual => {
                const completion = ritual.completion;
                const isCompleted = completion && completion.history.some(h => h.date === status.date);
                const streak = completion ? completion.currentStreak : 0;
                const statusIcon = isCompleted ? '✅' : '⏳';
                
                console.log(`\n   ${statusIcon} ${ritual.name} (${ritual.type})`);
                ritual.timeBlocks.forEach(block => {
                    const endTime = TimeUtils.addMinutes(block.startTime, block.duration);
                    const flexIcon = block.flexible ? '🔄' : '📍';
                    console.log(`      ${flexIcon} ${block.startTime} - ${endTime} (${block.duration}min)`);
                });
                
                if (completion) {
                    console.log(`      📈 Streak: ${streak} | Total: ${completion.totalCompletions}`);
                }
            });
        }
        
        console.log(`\n⏰ Available Time: ${Math.floor(status.totalAvailableMinutes / 60)}h ${status.totalAvailableMinutes % 60}m`);
        console.log(`   Windows: ${status.availableWindows}`);
        
        if (status.availability.availableWindows.length > 0) {
            console.log('\n   Available periods:');
            status.availability.availableWindows.forEach(window => {
                const hours = Math.floor(window.duration / 60);
                const mins = window.duration % 60;
                console.log(`   🟢 ${window.startTime} - ${window.endTime} (${hours}h ${mins}m) - ${window.context}`);
            });
        }
        
        if (status.availability.blockedPeriods.length > 0) {
            console.log('\n   Blocked periods:');
            status.availability.blockedPeriods.forEach(block => {
                const reason = block.ritualName || block.reason || 'Unknown';
                const icon = block.type === 'ritual' ? '🔄' : '🚫';
                console.log(`   ${icon} ${block.startTime} - ${block.endTime} - ${reason}`);
            });
        }
    }
    
    async markComplete(ritualId, dateStr = null) {
        if (!ritualId) {
            console.log('Usage: node ritual-manager.js complete <ritual-id> [date]');
            return;
        }
        
        this.manager.markRitualComplete(ritualId, dateStr);
    }
    
    async addBlock() {
        console.log('\n🚫 Add Temporary Time Block');
        console.log('============================');
        
        const date = await this.ask('Date (YYYY-MM-DD) or press enter for today: ') || TimeUtils.getDateString();
        const startTime = await this.ask('Start time (HH:MM): ');
        const endTime = await this.ask('End time (HH:MM): ');
        const reason = await this.ask('Reason: ');
        
        this.manager.addTemporaryBlock(date, startTime, endTime, reason);
    }
    
    async showAvailability(dateStr = null) {
        const availability = this.manager.calculateAvailableTime(dateStr || TimeUtils.getDateString());
        
        console.log(`\n⏰ Time Availability - ${availability.date}`);
        console.log('='.repeat(40));
        
        const totalHours = Math.floor(availability.totalAvailableMinutes / 60);
        const totalMins = availability.totalAvailableMinutes % 60;
        
        console.log(`📊 Total Available: ${totalHours}h ${totalMins}m`);
        console.log(`🪟 Available Windows: ${availability.availableWindows.length}`);
        
        if (availability.availableWindows.length > 0) {
            console.log('\nAvailable periods:');
            availability.availableWindows.forEach((window, i) => {
                const hours = Math.floor(window.duration / 60);
                const mins = window.duration % 60;
                console.log(`  ${i + 1}. ${window.startTime} - ${window.endTime} (${hours}h ${mins}m) - ${window.context}`);
            });
        }
        
        console.log(`\n🚫 Blocked Periods: ${availability.blockedPeriods.length}`);
        availability.blockedPeriods.forEach(block => {
            const reason = block.ritualName || block.reason;
            const icon = block.type === 'ritual' ? '🔄' : '🚫';
            console.log(`  ${icon} ${block.startTime} - ${block.endTime} - ${reason}`);
        });
    }
    
    async listRituals() {
        console.log('\n📋 All Rituals');
        console.log('==============');
        
        if (this.manager.rituals.rituals.length === 0) {
            console.log('No rituals defined yet.');
            console.log('Use: node ritual-manager.js add');
            return;
        }
        
        this.manager.rituals.rituals.forEach(ritual => {
            const statusIcon = ritual.active ? '✅' : '❌';
            const completion = this.manager.completions.completions[ritual.id];
            const streak = completion ? completion.currentStreak : 0;
            
            console.log(`\n${statusIcon} ${ritual.name} (ID: ${ritual.id})`);
            console.log(`   Type: ${ritual.type} | Frequency: ${ritual.frequency}`);
            console.log(`   Priority: ${ritual.priority} | Flexible: ${ritual.flexible}`);
            
            if (ritual.description) {
                console.log(`   Description: ${ritual.description}`);
            }
            
            if (completion) {
                console.log(`   📈 Current streak: ${streak} | Total completions: ${completion.totalCompletions}`);
            }
            
            console.log('   Time blocks:');
            ritual.timeBlocks.forEach(block => {
                const endTime = TimeUtils.addMinutes(block.startTime, block.duration);
                const flexIcon = block.flexible ? '🔄' : '📍';
                console.log(`      ${flexIcon} ${block.day}: ${block.startTime} - ${endTime} (${block.duration}min)`);
            });
        });
    }
    
    async ask(question) {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
    }
    
    showHelp() {
        console.log(`
Ritual Management System
========================

Commands:
  add              - Add a new ritual/recurring commitment
  status [date]    - Show ritual status and availability for date
  complete <id>    - Mark ritual as completed
  block            - Add temporary time block
  availability     - Show available time windows
  list             - List all rituals

Examples:
  node ritual-manager.js add
  node ritual-manager.js status
  node ritual-manager.js status 2025-08-31
  node ritual-manager.js complete 1234567890
  node ritual-manager.js availability
  node ritual-manager.js block

Ritual Types:
  work         - Work schedules, meetings, blocked work time
  foundational - Daily practices (boot.dev, AI school, exercise)
  life         - Personal commitments (family time, appointments)  
  maintenance  - Regular tasks (shopping, cleaning, admin)

Features:
  ✅ Recurring ritual management
  ✅ Time availability calculation
  ✅ Completion tracking and streaks
  ✅ Conflict detection
  ✅ Flexible vs fixed timing
  ✅ Integration ready for planning system
        `);
    }
}

// Main execution
if (require.main === module) {
    const cli = new RitualCLI();
    cli.run(process.argv.slice(2));
}

module.exports = { RitualManager, TimeUtils };