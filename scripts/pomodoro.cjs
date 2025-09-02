#!/usr/bin/env node

/**
 * Pomodoro Timer Integration with TaskWarrior
 * 
 * This script provides a JavaScript interface to the existing bash pomodoro script
 * while adding integration with the claudeLifeV2 system for logging, calendar sync,
 * and performance tracking.
 * 
 * Usage: node pomodoro.js [command] [options]
 * Dependencies: taskwarrior, existing pomodoro bash script
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    POMODORO_SCRIPT: '/home/robert/Areas/Scripts/taskwarrior-pomodoro.sh',
    COUNTER_FILE: `${process.env.HOME}/.pomodoro_count`,
    LOG_DIR: '/home/robert/Areas/claudeLifeV2/logs',
    PLANNING_DIR: '/home/robert/Areas/claudeLifeV2/planning/execution',
    POMODORO_DURATION: 25, // minutes
    BREAK_DURATION: 5,     // minutes
    LONG_BREAK_DURATION: 15, // minutes
    LONG_BREAK_INTERVAL: 4   // pomodoros until long break
};

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

class PomodoroManager {
    constructor() {
        this.ensureDirectories();
        this.pomodoroCount = this.loadCounter();
    }

    ensureDirectories() {
        [CONFIG.LOG_DIR, CONFIG.PLANNING_DIR].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    loadCounter() {
        try {
            if (fs.existsSync(CONFIG.COUNTER_FILE)) {
                return parseInt(fs.readFileSync(CONFIG.COUNTER_FILE, 'utf8').trim()) || 0;
            }
        } catch (error) {
            this.logError('Failed to load counter:', error.message);
        }
        return 0;
    }

    saveCounter() {
        try {
            fs.writeFileSync(CONFIG.COUNTER_FILE, this.pomodoroCount.toString());
        } catch (error) {
            this.logError('Failed to save counter:', error.message);
        }
    }

    logError(message, details = '') {
        const timestamp = new Date().toISOString();
        const logFile = path.join(CONFIG.LOG_DIR, `pomodoro-${this.getDateString()}.log`);
        const logEntry = `[${timestamp}] ERROR: ${message} ${details}\n`;
        
        try {
            fs.appendFileSync(logFile, logEntry);
        } catch (e) {
            console.error(`${colors.red}Failed to write log:${colors.reset}`, e.message);
        }
        console.error(`${colors.red}${message}${colors.reset}`, details);
    }

    logInfo(message, details = '') {
        const timestamp = new Date().toISOString();
        const logFile = path.join(CONFIG.LOG_DIR, `pomodoro-${this.getDateString()}.log`);
        const logEntry = `[${timestamp}] INFO: ${message} ${details}\n`;
        
        try {
            fs.appendFileSync(logFile, logEntry);
        } catch (e) {
            console.error(`${colors.red}Failed to write log:${colors.reset}`, e.message);
        }
    }

    getDateString() {
        return new Date().toISOString().split('T')[0];
    }

    getCurrentTime() {
        return new Date().toTimeString().split(' ')[0].slice(0, 5); // HH:MM format
    }

    async runTimer(duration, message) {
        console.log(`${colors.yellow}${colors.bold}${message}${colors.reset}`);
        console.log(`Duration: ${duration} minutes\n`);
        
        const seconds = duration * 60;
        let remaining = seconds;
        
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                const minutes = Math.floor(remaining / 60);
                const secs = remaining % 60;
                process.stdout.write(`\r⏰ Time remaining: ${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `);
                
                remaining--;
                
                if (remaining < 0) {
                    clearInterval(interval);
                    console.log('\n');
                    this.playNotification();
                    resolve();
                }
            }, 1000);
        });
    }

    playNotification() {
        // Try to play notification sound
        try {
            execSync('notify-send "Pomodoro" "Timer complete!" -i time-admin 2>/dev/null || echo "\a"', { stdio: 'ignore' });
        } catch (error) {
            // Fallback to terminal bell
            console.log('\a'); // Terminal bell
        }
    }

    async getActiveTask() {
        try {
            const result = execSync('task +ACTIVE ids 2>/dev/null', { encoding: 'utf8' }).trim();
            return result || null;
        } catch (error) {
            return null;
        }
    }

    async getTaskDescription(taskId) {
        try {
            const result = execSync(`task _get ${taskId}.description 2>/dev/null`, { encoding: 'utf8' }).trim();
            return result || null;
        } catch (error) {
            return null;
        }
    }

    async listTasks() {
        try {
            console.log(`${colors.green}Active tasks:${colors.reset}`);
            execSync('task list', { stdio: 'inherit' });
            return true;
        } catch (error) {
            this.logError('Failed to list tasks:', error.message);
            return false;
        }
    }

    async startTask(taskId) {
        try {
            if (taskId) {
                execSync(`task ${taskId} start 2>/dev/null`, { stdio: 'ignore' });
                return true;
            }
        } catch (error) {
            this.logError(`Failed to start task ${taskId}:`, error.message);
        }
        return false;
    }

    async stopTask(taskId) {
        try {
            if (taskId) {
                execSync(`task ${taskId} stop 2>/dev/null`, { stdio: 'ignore' });
                execSync(`task ${taskId} annotate "Completed pomodoro" 2>/dev/null`, { stdio: 'ignore' });
                return true;
            }
        } catch (error) {
            this.logError(`Failed to stop task ${taskId}:`, error.message);
        }
        return false;
    }

    async startPomodoro(taskId = null) {
        let taskDesc = '';
        
        if (taskId) {
            taskDesc = await this.getTaskDescription(taskId);
            if (!taskDesc) {
                console.log(`${colors.red}Task ${taskId} not found!${colors.reset}`);
                return false;
            }
            
            console.log(`${colors.green}Starting Pomodoro for task:${colors.reset} ${taskDesc}`);
            await this.startTask(taskId);
        } else {
            console.log(`${colors.green}Starting Pomodoro (no task selected)${colors.reset}`);
        }

        // Log pomodoro start
        this.logInfo('Pomodoro started', taskId ? `Task: ${taskId} - ${taskDesc}` : 'No task');
        
        // Run the timer
        await this.runTimer(CONFIG.POMODORO_DURATION, '🍅 Pomodoro in progress...');
        
        // Complete the pomodoro
        if (taskId) {
            await this.stopTask(taskId);
        }
        
        // Increment counter
        this.pomodoroCount++;
        this.saveCounter();
        
        // Log completion
        this.logInfo('Pomodoro completed', `Count: ${this.pomodoroCount}, Task: ${taskId || 'none'}`);
        
        // Show completion message
        console.log(`${colors.green}🔔 Pomodoro Complete! Time for a break! (Pomodoros today: ${this.pomodoroCount})${colors.reset}`);
        
        // Suggest break type
        if (this.pomodoroCount % CONFIG.LONG_BREAK_INTERVAL === 0) {
            console.log(`${colors.yellow}🌴 You've completed ${CONFIG.LONG_BREAK_INTERVAL} pomodoros. Time for a long break!${colors.reset}`);
        } else {
            console.log(`${colors.yellow}☕ Take a short break!${colors.reset}`);
        }
        
        return true;
    }

    async startBreak(type = 'auto') {
        let duration, message, emoji;
        
        if (type === 'auto') {
            if (this.pomodoroCount % CONFIG.LONG_BREAK_INTERVAL === 0 && this.pomodoroCount > 0) {
                type = 'long';
            } else {
                type = 'short';
            }
        }
        
        if (type === 'long') {
            duration = CONFIG.LONG_BREAK_DURATION;
            message = '🌴 Long break...';
            emoji = '🌴';
        } else {
            duration = CONFIG.BREAK_DURATION;
            message = '☕ Short break...';
            emoji = '☕';
        }
        
        this.logInfo('Break started', `Type: ${type}, Duration: ${duration}m`);
        
        await this.runTimer(duration, message);
        
        console.log(`${colors.green}${emoji} Break Complete! Ready for another pomodoro?${colors.reset}`);
        this.logInfo('Break completed', `Type: ${type}`);
        
        return true;
    }

    async showStatus() {
        console.log(`${colors.cyan}${colors.bold}📊 POMODORO STATUS - ${this.getDateString()}${colors.reset}`);
        console.log('═'.repeat(50));
        console.log();
        
        const totalMinutes = this.pomodoroCount * CONFIG.POMODORO_DURATION;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        console.log(`${colors.green}🍅 Today's Progress:${colors.reset} ${this.pomodoroCount} pomodoros completed`);
        console.log(`${colors.blue}⏰ Total focus time:${colors.reset} ${hours}h ${minutes}m`);
        
        // Show next break recommendation
        const pomodorosUntilLongBreak = CONFIG.LONG_BREAK_INTERVAL - (this.pomodoroCount % CONFIG.LONG_BREAK_INTERVAL);
        if (pomodorosUntilLongBreak === CONFIG.LONG_BREAK_INTERVAL) {
            console.log(`${colors.yellow}💡 Suggestion:${colors.reset} Long break recommended`);
        } else {
            console.log(`${colors.yellow}💡 Next milestone:${colors.reset} ${pomodorosUntilLongBreak} pomodoros until long break`);
        }
        
        console.log();
        
        // Show TaskWarrior summary
        try {
            console.log(`${colors.green}📋 Task Summary:${colors.reset}`);
            execSync('task summary 2>/dev/null', { stdio: 'inherit' });
        } catch (error) {
            console.log(`${colors.red}Unable to retrieve task summary${colors.reset}`);
        }
        
        return true;
    }

    async selectTask() {
        console.log(`${colors.green}Active tasks:${colors.reset}`);
        await this.listTasks();
        console.log();
        
        // Use readline for interactive input
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise((resolve) => {
            readline.question('Enter task ID (or press Enter to skip): ', (taskId) => {
                readline.close();
                resolve(taskId.trim() || null);
            });
        });
    }

    async resetCounter() {
        this.pomodoroCount = 0;
        this.saveCounter();
        console.log(`${colors.green}Daily counter reset to 0${colors.reset}`);
        this.logInfo('Counter reset');
        return true;
    }

    async showHelp() {
        console.log(`${colors.cyan}${colors.bold}Pomodoro Timer - TaskWarrior Integration${colors.reset}`);
        console.log('═'.repeat(50));
        console.log();
        console.log(`${colors.green}Available commands:${colors.reset}`);
        console.log(`  ${colors.yellow}start [task_id]${colors.reset}     - Start pomodoro with specific task`);
        console.log(`  ${colors.yellow}start-no-task${colors.reset}       - Start pomodoro without task`);
        console.log(`  ${colors.yellow}start-interactive${colors.reset}   - Interactive task selection`);
        console.log(`  ${colors.yellow}break [short|long|auto]${colors.reset} - Take a break`);
        console.log(`  ${colors.yellow}status${colors.reset}             - Show statistics and progress`);
        console.log(`  ${colors.yellow}reset${colors.reset}              - Reset daily counter`);
        console.log(`  ${colors.yellow}help${colors.reset}               - Show this help message`);
        console.log();
        console.log(`${colors.green}Examples:${colors.reset}`);
        console.log(`  node pomodoro.js start 42      # Start with task ID 42`);
        console.log(`  node pomodoro.js start-no-task # Start without task`);
        console.log(`  node pomodoro.js break auto    # Take appropriate break`);
        console.log(`  node pomodoro.js status        # Show current stats`);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    const pomodoro = new PomodoroManager();

    try {
        switch (command) {
            case 'start':
                const taskId = args[1] || await pomodoro.getActiveTask();
                if (taskId) {
                    await pomodoro.startPomodoro(taskId);
                } else {
                    console.log(`${colors.yellow}No active task found. Starting interactive selection...${colors.reset}`);
                    const selectedTask = await pomodoro.selectTask();
                    await pomodoro.startPomodoro(selectedTask);
                }
                break;
                
            case 'start-no-task':
                await pomodoro.startPomodoro();
                break;
                
            case 'start-interactive':
                const interactiveTask = await pomodoro.selectTask();
                await pomodoro.startPomodoro(interactiveTask);
                break;
                
            case 'break':
                const breakType = args[1] || 'auto';
                await pomodoro.startBreak(breakType);
                break;
                
            case 'status':
                await pomodoro.showStatus();
                break;
                
            case 'reset':
                await pomodoro.resetCounter();
                break;
                
            case 'help':
            default:
                await pomodoro.showHelp();
                break;
        }
    } catch (error) {
        pomodoro.logError('Command execution failed:', error.message);
        console.error(`${colors.red}Error:${colors.reset} ${error.message}`);
        process.exit(1);
    }
}

// Check if TaskWarrior is installed
try {
    execSync('task version', { stdio: 'ignore' });
} catch (error) {
    console.error(`${colors.red}TaskWarrior is not installed!${colors.reset}`);
    console.error('Install it with: sudo apt install taskwarrior');
    process.exit(1);
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = PomodoroManager;