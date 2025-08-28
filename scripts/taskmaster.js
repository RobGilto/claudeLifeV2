#!/usr/bin/env node

/**
 * Taskmaster - Daily Time Block Executor
 * Purpose: Execute planned time blocks with alignment to fractal plans
 * Usage: node scripts/taskmaster.js [command] [args]
 * Dependencies: fs, path, readline, ./fractal-planner.js
 * 
 * Commands:
 * - start [date]         - Start executing today's planned time blocks
 * - block [blockId]      - Execute a specific time block
 * - complete [blockId]   - Mark time block as completed
 * - adjust [blockId]     - Adjust time block timing or content
 * - status               - Show current execution status
 * - summary [date]       - Show daily execution summary
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { PlanStorage, DateIndex, Plan } = require('./fractal-planner.js');

// Configuration
const EXECUTION_DIR = path.join(__dirname, '..', 'planning', 'execution');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
[EXECUTION_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Time block execution model
class TimeBlockExecution {
    constructor(timeBlock, dayPlan) {
        this.blockId = timeBlock.id;
        this.originalBlock = timeBlock;
        this.dayPlan = dayPlan;
        this.started = null;
        this.completed = null;
        this.actualDuration = 0;
        this.notes = '';
        this.interruptions = [];
        this.energy = null; // 1-10 scale
        this.focus = null; // 1-10 scale
        this.alignment = timeBlock.alignment;
        this.outcomes = [];
        this.challenges = [];
        this.adjustments = [];
    }

    start() {
        this.started = new Date().toISOString();
        this.logEvent('started');
    }

    complete(outcomes = '', energy = null, focus = null) {
        this.completed = new Date().toISOString();
        this.actualDuration = this.started ? 
            Math.round((new Date(this.completed) - new Date(this.started)) / 60000) : 
            this.originalBlock.duration;
        
        if (outcomes) this.outcomes.push(outcomes);
        if (energy) this.energy = energy;
        if (focus) this.focus = focus;
        
        this.logEvent('completed');
    }

    addInterruption(type, duration, notes) {
        this.interruptions.push({
            timestamp: new Date().toISOString(),
            type, // 'external', 'internal', 'urgent'
            duration,
            notes
        });
        this.logEvent(`interrupted: ${type}`);
    }

    addNote(note) {
        this.notes += `${new Date().toISOString()}: ${note}\n`;
    }

    logEvent(event) {
        const timestamp = new Date().toISOString();
        const logFile = path.join(LOGS_DIR, `taskmaster-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, `${timestamp}: Block ${this.blockId} - ${event}\n`);
    }

    getEfficiency() {
        if (!this.started || !this.completed) return null;
        const totalInterruptionTime = this.interruptions.reduce((sum, int) => sum + int.duration, 0);
        const focusTime = this.actualDuration - totalInterruptionTime;
        return this.actualDuration > 0 ? (focusTime / this.actualDuration) * 100 : 0;
    }

    toJSON() {
        return {
            blockId: this.blockId,
            originalBlock: this.originalBlock,
            started: this.started,
            completed: this.completed,
            actualDuration: this.actualDuration,
            notes: this.notes,
            interruptions: this.interruptions,
            energy: this.energy,
            focus: this.focus,
            alignment: this.alignment,
            outcomes: this.outcomes,
            challenges: this.challenges,
            adjustments: this.adjustments
        };
    }
}

// Daily execution session
class DailyExecution {
    constructor(date) {
        this.date = date;
        this.started = null;
        this.completed = null;
        this.executions = new Map(); // blockId -> TimeBlockExecution
        this.dailyNotes = '';
        this.energyPattern = []; // Track energy throughout the day
        this.focusPattern = []; // Track focus throughout the day
    }

    addExecution(execution) {
        this.executions.set(execution.blockId, execution);
    }

    getExecution(blockId) {
        return this.executions.get(blockId);
    }

    getAllExecutions() {
        return Array.from(this.executions.values());
    }

    recordEnergyFocus(energy, focus) {
        const timestamp = new Date().toISOString();
        this.energyPattern.push({ timestamp, energy });
        this.focusPattern.push({ timestamp, focus });
    }

    getDailyStats() {
        const executions = this.getAllExecutions();
        const completed = executions.filter(ex => ex.completed);
        const totalPlanned = executions.reduce((sum, ex) => sum + ex.originalBlock.duration, 0);
        const totalActual = completed.reduce((sum, ex) => sum + ex.actualDuration, 0);
        
        return {
            totalBlocks: executions.length,
            completedBlocks: completed.length,
            completionRate: executions.length > 0 ? (completed.length / executions.length) * 100 : 0,
            totalPlannedTime: totalPlanned,
            totalActualTime: totalActual,
            timeEfficiency: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
            avgEnergy: this.getAverageMetric('energy', completed),
            avgFocus: this.getAverageMetric('focus', completed),
            totalInterruptions: executions.reduce((sum, ex) => sum + ex.interruptions.length, 0)
        };
    }

    getAverageMetric(metric, executions) {
        const values = executions.map(ex => ex[metric]).filter(val => val !== null);
        return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : null;
    }

    toJSON() {
        return {
            date: this.date,
            started: this.started,
            completed: this.completed,
            executions: Array.from(this.executions.entries()),
            dailyNotes: this.dailyNotes,
            energyPattern: this.energyPattern,
            focusPattern: this.focusPattern
        };
    }

    static fromJSON(data) {
        const dailyExec = new DailyExecution(data.date);
        Object.assign(dailyExec, data);
        
        // Restore Map from entries
        dailyExec.executions = new Map(data.executions || []);
        
        return dailyExec;
    }
}

// Execution storage
class ExecutionStorage {
    static getFilePath(date) {
        return path.join(EXECUTION_DIR, `execution-${date}.json`);
    }

    static save(dailyExecution) {
        const filePath = this.getFilePath(dailyExecution.date);
        fs.writeFileSync(filePath, JSON.stringify(dailyExecution.toJSON(), null, 2));
        this.log(`Saved daily execution: ${dailyExecution.date}`);
    }

    static load(date) {
        const filePath = this.getFilePath(date);
        if (!fs.existsSync(filePath)) return null;
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return DailyExecution.fromJSON(data);
    }

    static log(message) {
        const timestamp = new Date().toISOString();
        const logFile = path.join(LOGS_DIR, `taskmaster-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, `${timestamp}: ${message}\n`);
    }
}

// Main Taskmaster class
class Taskmaster {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.currentExecution = null;
    }

    async run() {
        const args = process.argv.slice(2);
        const command = args[0] || 'status';
        
        try {
            switch (command) {
                case 'start':
                    await this.startDay(args[1]);
                    break;
                case 'block':
                    await this.executeBlock(args[1]);
                    break;
                case 'complete':
                    await this.completeBlock(args[1]);
                    break;
                case 'adjust':
                    await this.adjustBlock(args[1]);
                    break;
                case 'interrupt':
                    await this.recordInterruption(args[1]);
                    break;
                case 'status':
                    await this.showStatus();
                    break;
                case 'summary':
                    await this.showSummary(args[1]);
                    break;
                default:
                    this.showHelp();
            }
        } catch (error) {
            console.error('Error:', error.message);
            ExecutionStorage.log(`Error: ${error.message}`);
        } finally {
            this.rl.close();
        }
    }

    async startDay(dateStr) {
        const dateIndex = new DateIndex(dateStr ? new Date(dateStr) : new Date());
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n⏰ Starting Taskmaster for: ${identifiers.day}`);
        
        // Load day plan
        const dayPlan = PlanStorage.load('day', identifiers.day);
        if (!dayPlan || !dayPlan.timeBlocks.length) {
            console.log(`❌ No daily plan or time blocks found for ${identifiers.day}`);
            console.log(`Create a plan first: node scripts/fractal-planner.js plan-day`);
            return;
        }

        // Load or create execution session
        let dailyExecution = ExecutionStorage.load(identifiers.day) || new DailyExecution(identifiers.day);
        
        if (!dailyExecution.started) {
            dailyExecution.started = new Date().toISOString();
        }

        // Initialize executions for each time block
        for (const timeBlock of dayPlan.timeBlocks) {
            if (!dailyExecution.getExecution(timeBlock.id)) {
                const execution = new TimeBlockExecution(timeBlock, dayPlan);
                dailyExecution.addExecution(execution);
            }
        }

        this.currentExecution = dailyExecution;
        ExecutionStorage.save(dailyExecution);

        // Show daily overview
        console.log(`\n📋 Daily Time Block Overview:`);
        console.log(`📊 Total blocks: ${dayPlan.timeBlocks.length}`);
        console.log(`⏱️  Total planned time: ${dayPlan.timeBlocks.reduce((sum, block) => sum + block.duration, 0)} minutes`);
        
        // Show parent alignment
        this.showAlignmentContext(dayPlan);

        // Show time blocks
        this.showTimeBlocks(dayPlan.timeBlocks, dailyExecution);

        console.log(`\n🎯 Commands:`);
        console.log(`  node scripts/taskmaster.js block [blockId] - Execute specific block`);
        console.log(`  node scripts/taskmaster.js complete [blockId] - Complete current block`);
        console.log(`  node scripts/taskmaster.js status - Show current status`);
    }

    showAlignmentContext(dayPlan) {
        console.log(`\n🎯 Alignment Context:`);
        
        // Load parent plans for context
        const dateIndex = new DateIndex(dayPlan.identifier);
        const identifiers = dateIndex.getIdentifiers();
        
        const weekPlan = PlanStorage.load('week', identifiers.week);
        const monthPlan = PlanStorage.load('month', identifiers.month);
        
        if (weekPlan && weekPlan.priorities.length > 0) {
            console.log(`📅 Week Priorities: ${weekPlan.priorities.slice(0, 3).join(', ')}`);
        }
        if (monthPlan && monthPlan.priorities.length > 0) {
            console.log(`📆 Month Focus: ${monthPlan.objectives.slice(0, 2).map(obj => obj.text).join(', ')}`);
        }
    }

    showTimeBlocks(timeBlocks, dailyExecution) {
        console.log(`\n⏰ Time Blocks:`);
        
        for (const block of timeBlocks) {
            const execution = dailyExecution.getExecution(block.id);
            const status = execution ? this.getBlockStatus(execution) : '⏸️  Not started';
            const alignment = block.alignment ? ` → ${block.alignment}` : '';
            
            console.log(`  ${status} [${block.id.slice(-4)}] ${block.startTime} (${block.duration}min) - ${block.activity}${alignment}`);
        }
    }

    getBlockStatus(execution) {
        if (execution.completed) return '✅';
        if (execution.started) return '⏳';
        return '⏸️ ';
    }

    async executeBlock(blockId) {
        if (!this.currentExecution) {
            const today = new DateIndex().toString();
            this.currentExecution = ExecutionStorage.load(today);
            
            if (!this.currentExecution) {
                console.log(`❌ No active execution session. Run 'taskmaster start' first.`);
                return;
            }
        }

        const execution = this.currentExecution.getExecution(blockId);
        if (!execution) {
            console.log(`❌ Block ${blockId} not found`);
            return;
        }

        if (execution.started && !execution.completed) {
            console.log(`⏳ Block already in progress: ${execution.originalBlock.activity}`);
            return;
        }

        if (execution.completed) {
            console.log(`✅ Block already completed: ${execution.originalBlock.activity}`);
            return;
        }

        console.log(`\n🚀 Starting Time Block: ${execution.originalBlock.activity}`);
        console.log(`⏰ Planned duration: ${execution.originalBlock.duration} minutes`);
        console.log(`🎯 Alignment: ${execution.alignment || 'General productivity'}`);

        // Pre-execution setup
        const energyBefore = await this.ask(`Energy level before starting (1-10): `);
        const focusBefore = await this.ask(`Focus level before starting (1-10): `);
        
        this.currentExecution.recordEnergyFocus(parseInt(energyBefore), parseInt(focusBefore));

        // Confirm start
        const ready = await this.ask(`Ready to start? (y/n): `);
        if (ready.toLowerCase() !== 'y') {
            console.log(`⏸️  Execution postponed`);
            return;
        }

        execution.start();
        ExecutionStorage.save(this.currentExecution);

        console.log(`\n✨ Time block started at ${new Date().toLocaleTimeString()}`);
        console.log(`⏰ Set a timer for ${execution.originalBlock.duration} minutes`);
        console.log(`🎯 Focus on: ${execution.originalBlock.activity}`);
        console.log(`\nCommands during execution:`);
        console.log(`  node scripts/taskmaster.js interrupt ${blockId} - Record interruption`);
        console.log(`  node scripts/taskmaster.js complete ${blockId} - Complete this block`);
    }

    async completeBlock(blockId) {
        if (!this.currentExecution) {
            const today = new DateIndex().toString();
            this.currentExecution = ExecutionStorage.load(today);
        }

        const execution = this.currentExecution.getExecution(blockId);
        if (!execution) {
            console.log(`❌ Block ${blockId} not found`);
            return;
        }

        if (execution.completed) {
            console.log(`✅ Block already completed`);
            return;
        }

        console.log(`\n🏁 Completing Time Block: ${execution.originalBlock.activity}`);

        // Post-execution metrics
        const outcomes = await this.ask(`What did you accomplish? `);
        const energyAfter = await this.ask(`Energy level after (1-10): `);
        const focusAfter = await this.ask(`Focus quality during block (1-10): `);
        const challenges = await this.ask(`Any challenges faced? `);

        execution.complete(outcomes, parseInt(energyAfter), parseInt(focusAfter));
        
        if (challenges.trim()) {
            execution.challenges.push(challenges);
        }

        this.currentExecution.recordEnergyFocus(parseInt(energyAfter), parseInt(focusAfter));

        // Mark in original plan
        const dateIndex = new DateIndex(this.currentExecution.date);
        const dayPlan = PlanStorage.load('day', dateIndex.getIdentifiers().day);
        if (dayPlan) {
            const originalBlock = dayPlan.timeBlocks.find(b => b.id === blockId);
            if (originalBlock) {
                originalBlock.completed = true;
                originalBlock.notes = outcomes;
                PlanStorage.save(dayPlan);
            }
        }

        ExecutionStorage.save(this.currentExecution);

        console.log(`\n✅ Block completed successfully!`);
        console.log(`⏱️  Actual duration: ${execution.actualDuration} minutes`);
        console.log(`📊 Efficiency: ${execution.getEfficiency()?.toFixed(1) || 'N/A'}%`);
        
        // Show next block
        this.suggestNextBlock();
    }

    async recordInterruption(blockId) {
        if (!this.currentExecution) return;
        
        const execution = this.currentExecution.getExecution(blockId);
        if (!execution || !execution.started || execution.completed) {
            console.log(`❌ Block ${blockId} not currently executing`);
            return;
        }

        console.log(`\n⚠️  Recording Interruption for: ${execution.originalBlock.activity}`);
        
        const type = await this.ask(`Interruption type (external/internal/urgent): `);
        const duration = await this.ask(`Duration in minutes: `);
        const notes = await this.ask(`Notes: `);

        execution.addInterruption(type, parseInt(duration) || 0, notes);
        ExecutionStorage.save(this.currentExecution);

        console.log(`📝 Interruption recorded. Resume when ready.`);
    }

    suggestNextBlock() {
        const executions = this.currentExecution.getAllExecutions();
        const nextBlock = executions.find(ex => !ex.started);
        
        if (nextBlock) {
            console.log(`\n⏭️  Next block: ${nextBlock.originalBlock.startTime} - ${nextBlock.originalBlock.activity}`);
            console.log(`   Command: node scripts/taskmaster.js block ${nextBlock.blockId}`);
        } else {
            console.log(`\n🎉 All time blocks completed! Consider running summary.`);
        }
    }

    async showStatus() {
        const today = new DateIndex().toString();
        const dailyExecution = ExecutionStorage.load(today) || new DailyExecution(today);
        
        console.log(`\n📊 Taskmaster Status - ${today}`);
        
        if (!dailyExecution.started) {
            console.log(`⏸️  No execution session started`);
            console.log(`Start with: node scripts/taskmaster.js start`);
            return;
        }

        const stats = dailyExecution.getDailyStats();
        
        console.log(`\n📈 Daily Progress:`);
        console.log(`  ✅ Completed: ${stats.completedBlocks}/${stats.totalBlocks} blocks (${stats.completionRate.toFixed(1)}%)`);
        console.log(`  ⏱️  Time: ${stats.totalActualTime}/${stats.totalPlannedTime} minutes (${stats.timeEfficiency.toFixed(1)}%)`);
        
        if (stats.avgEnergy) {
            console.log(`  ⚡ Avg Energy: ${stats.avgEnergy.toFixed(1)}/10`);
        }
        if (stats.avgFocus) {
            console.log(`  🎯 Avg Focus: ${stats.avgFocus.toFixed(1)}/10`);
        }
        
        console.log(`  ⚠️  Interruptions: ${stats.totalInterruptions}`);

        // Show current and next blocks
        const executions = dailyExecution.getAllExecutions();
        const inProgress = executions.find(ex => ex.started && !ex.completed);
        const nextBlock = executions.find(ex => !ex.started);

        if (inProgress) {
            console.log(`\n⏳ In Progress: ${inProgress.originalBlock.activity}`);
        }
        if (nextBlock) {
            console.log(`\n⏭️  Next: ${nextBlock.originalBlock.startTime} - ${nextBlock.originalBlock.activity}`);
        }
    }

    async showSummary(dateStr) {
        const date = dateStr || new DateIndex().toString();
        const dailyExecution = ExecutionStorage.load(date);
        
        if (!dailyExecution) {
            console.log(`❌ No execution data found for ${date}`);
            return;
        }

        console.log(`\n📊 Daily Execution Summary - ${date}`);
        
        const stats = dailyExecution.getDailyStats();
        
        console.log(`\n📈 Performance Metrics:`);
        console.log(`  Completion Rate: ${stats.completionRate.toFixed(1)}%`);
        console.log(`  Time Efficiency: ${stats.timeEfficiency.toFixed(1)}%`);
        console.log(`  Total Actual Time: ${stats.totalActualTime} minutes`);
        console.log(`  Interruptions: ${stats.totalInterruptions}`);
        
        if (stats.avgEnergy && stats.avgFocus) {
            console.log(`  Average Energy: ${stats.avgEnergy.toFixed(1)}/10`);
            console.log(`  Average Focus: ${stats.avgFocus.toFixed(1)}/10`);
        }

        // Show individual block results
        console.log(`\n📋 Block Details:`);
        const executions = dailyExecution.getAllExecutions();
        
        for (const execution of executions) {
            const status = execution.completed ? '✅' : (execution.started ? '⏳' : '❌');
            const efficiency = execution.getEfficiency();
            const effStr = efficiency ? ` (${efficiency.toFixed(1)}%)` : '';
            
            console.log(`  ${status} ${execution.originalBlock.activity}${effStr}`);
            if (execution.outcomes.length > 0) {
                console.log(`      💡 ${execution.outcomes[0]}`);
            }
            if (execution.challenges.length > 0) {
                console.log(`      ⚠️  ${execution.challenges[0]}`);
            }
        }

        // Insights and recommendations
        this.generateInsights(dailyExecution);
    }

    generateInsights(dailyExecution) {
        const stats = dailyExecution.getDailyStats();
        const executions = dailyExecution.getAllExecutions();
        
        console.log(`\n💡 Insights & Recommendations:`);
        
        if (stats.completionRate < 70) {
            console.log(`  📉 Low completion rate - consider shorter blocks or fewer objectives`);
        } else if (stats.completionRate > 90) {
            console.log(`  📈 Excellent completion rate - you could challenge yourself with more ambitious goals`);
        }
        
        if (stats.totalInterruptions > 5) {
            console.log(`  ⚠️  High interruption count - consider focus techniques or environment changes`);
        }
        
        // Energy pattern insights
        if (dailyExecution.energyPattern.length > 2) {
            const energyLevels = dailyExecution.energyPattern.map(p => p.energy);
            const avgEnergy = energyLevels.reduce((sum, e) => sum + e, 0) / energyLevels.length;
            
            if (avgEnergy < 5) {
                console.log(`  ⚡ Low average energy - consider rest, nutrition, or schedule adjustments`);
            }
        }
        
        // Best performing blocks
        const bestBlocks = executions
            .filter(ex => ex.completed && ex.focus >= 7)
            .sort((a, b) => (b.focus || 0) - (a.focus || 0));
            
        if (bestBlocks.length > 0) {
            console.log(`  🌟 Best focus block: ${bestBlocks[0].originalBlock.activity} (${bestBlocks[0].focus}/10)`);
        }
    }

    async ask(question) {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
    }

    showHelp() {
        console.log(`
⏰ Taskmaster - Time Block Execution System

Commands:
  start [date]         - Start executing planned time blocks for the day
  block [blockId]      - Execute a specific time block
  complete [blockId]   - Mark current time block as completed
  adjust [blockId]     - Adjust time block timing or content
  interrupt [blockId]  - Record interruption during execution
  status              - Show current execution status
  summary [date]      - Show daily execution summary and insights

Examples:
  node scripts/taskmaster.js start
  node scripts/taskmaster.js block abc123
  node scripts/taskmaster.js complete abc123
  node scripts/taskmaster.js status
  node scripts/taskmaster.js summary 2024-01-15

Integration:
- Requires daily plan created with: node scripts/fractal-planner.js plan-day
- Automatically updates plan completion status
- Tracks performance for review commands
        `);
    }
}

// Run if called directly
if (require.main === module) {
    const taskmaster = new Taskmaster();
    taskmaster.run();
}

module.exports = { Taskmaster, TimeBlockExecution, DailyExecution, ExecutionStorage };