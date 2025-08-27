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
 * - review-week [week]   - Review previous week's performance
 * - review-month [month] - Review previous month's achievements
 * - review-quarter [Q]   - Review previous quarter's progress
 * - review-year [year]   - Review previous year's transformation
 * - status [period]      - Show current planning status and next actions
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

// Date utilities with multi-indexing
class DateIndex {
    constructor(date = new Date()) {
        this.date = new Date(date);
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
        return this.date.toISOString().split('T')[0];
    }

    getIdentifiers() {
        return {
            day: this.toString(),
            week: `${this.year}-W${this.week.toString().padStart(2, '0')}`,
            month: `${this.year}-${this.month.toString().padStart(2, '0')}`,
            quarter: `${this.year}-Q${this.quarter}`,
            year: `${this.year}`,
            dayOfYear: this.dayOfYear,
            weekOfYear: this.week,
            monthOfYear: this.month,
            quarterOfYear: this.quarter
        };
    }
}

// Planning data model
class Plan {
    constructor(period, identifier, data = {}) {
        this.period = period; // 'day', 'week', 'month', 'quarter', 'year'
        this.identifier = identifier; // '2024-01-15', '2024-W03', '2024-01', '2024-Q1', '2024'
        this.created = new Date().toISOString();
        this.modified = new Date().toISOString();
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
            created: new Date().toISOString(),
            completed: false,
            priority: 'medium'
        });
        this.touch();
    }

    addTimeBlock(startTime, duration, activity, alignment = null) {
        this.timeBlocks.push({
            id: Date.now().toString(),
            startTime,
            duration, // in minutes
            activity,
            alignment, // which higher-level objective this supports
            completed: false,
            notes: ''
        });
        this.touch();
    }

    touch() {
        this.modified = new Date().toISOString();
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
        this.recorded = new Date().toISOString();
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
        const timestamp = new Date().toISOString();
        const logFile = path.join(LOGS_DIR, `fractal-planner-${new Date().toISOString().split('T')[0]}.log`);
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
        
        console.log(`\n🗓️  Planning Day: ${identifiers.day}`);
        console.log(`📊 Multi-Index: Week ${identifiers.week}, Month ${identifiers.month}, Quarter ${identifiers.quarter}`);

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
        
        const defaultBlocks = [
            { start: '09:00', duration: 90, label: 'Deep Work Block 1' },
            { start: '11:00', duration: 60, label: 'Communication & Admin' },
            { start: '14:00', duration: 90, label: 'Deep Work Block 2' },
            { start: '16:00', duration: 60, label: 'Learning & Development' },
            { start: '17:00', duration: 30, label: 'Planning & Reflection' }
        ];

        for (const block of defaultBlocks) {
            const activity = await this.ask(`${block.label} (${block.start}, ${block.duration}min): `);
            if (activity.trim()) {
                const alignment = await this.ask(`Aligns with which higher-level goal? `);
                plan.addTimeBlock(block.start, block.duration, activity, alignment || null);
            }
        }

        // Set daily objectives
        console.log(`\n🎯 Daily Objectives (max 3 for focus):`);
        for (let i = 1; i <= 3; i++) {
            const objective = await this.ask(`Objective ${i}: `);
            if (objective.trim()) {
                plan.addObjective(objective);
            }
        }

        // Set parent relationships
        plan.parentPlans = [
            weekPlan ? identifiers.week : null,
            monthPlan ? identifiers.month : null,
            quarterPlan ? identifiers.quarter : null
        ].filter(Boolean);

        plan.status = 'active';
        PlanStorage.save(plan);
        
        console.log(`\n✅ Day plan saved for ${identifiers.day}`);
        console.log(`📈 Linked to: ${plan.parentPlans.join(', ')}`);
    }

    showParentContext(weekPlan, monthPlan, quarterPlan) {
        console.log(`\n📋 Parent Plan Context:`);
        
        if (quarterPlan) {
            console.log(`🎯 Quarter Focus: ${quarterPlan.priorities.slice(0, 2).join(', ')}`);
        }
        if (monthPlan) {
            console.log(`📅 Month Goals: ${monthPlan.objectives.slice(0, 3).map(o => o.text).join(', ')}`);
        }
        if (weekPlan) {
            console.log(`📊 Week Priorities: ${weekPlan.priorities.slice(0, 3).join(', ')}`);
        }
    }

    async ask(question) {
        return new Promise(resolve => {
            this.rl.question(question, resolve);
        });
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