#!/usr/bin/env node

/**
 * LLM-Friendly Fractal Planning System
 * Purpose: Non-interactive multi-scale planning for day/week/month/quarter/year
 * Usage: node scripts/fractal-planner-llm.cjs [command] [args]
 * Dependencies: fs, path (no readline - LLM compatible)
 * 
 * Commands:
 * - plan-day [date]      - Create daily time blocks with sensible defaults
 * - plan-week [week]     - Create weekly goals and priorities 
 * - plan-month [month]   - Create monthly objectives and milestones
 * - plan-quarter [Q]     - Create quarterly strategic initiatives
 * - plan-year [year]     - Create yearly vision and major goals
 * - status [period]      - Show current planning status and next actions
 */

const fs = require('fs');
const path = require('path');

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
const JOURNAL_DIR = path.join(__dirname, '..', 'journal', 'planning');
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const DATA_DIR = path.join(PLANNING_DIR, 'data');
const DAILY_REVIEWS_DIR = path.join(JOURNAL_DIR, 'daily-reviews');

// Ensure directories exist
[PLANNING_DIR, JOURNAL_DIR, LOGS_DIR, DATA_DIR, DAILY_REVIEWS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Date utilities with multi-indexing (Sydney timezone aware)
class DateIndex {
    constructor(date = new Date()) {
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

    toString() {
        return formatSydneyDateString(this.date);
    }

    getIdentifiers() {
        const dayOfWeek = this.date.getDay();
        const mondayBasedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
        
        const quarterStart = new Date(this.year, (this.quarter - 1) * 3, 1);
        const dayOfQuarter = Math.floor((this.date - quarterStart) / (1000 * 60 * 60 * 24)) + 1;
        
        return {
            day: this.toString(),
            week: `${this.year}-W${String(this.week).padStart(2, '0')}`,
            month: `${this.year}-${String(this.month).padStart(2, '0')}`,
            quarter: `${this.year}-Q${this.quarter}`,
            year: `${this.year}`,
            dayOfYear: this.dayOfYear,
            dayOfMonth: this.day,
            dayOfWeek: mondayBasedDayOfWeek,
            weekOfYear: this.week,
            monthOfYear: this.month,
            dayOfQuarter: dayOfQuarter
        };
    }
}

// Storage manager
class PlanStorage {
    static getFilePath(period, identifier) {
        return path.join(DATA_DIR, `${period}-${identifier}.json`);
    }

    static save(plan) {
        const period = plan.type;
        const identifier = plan.id.replace(`${period}-`, '');
        const filePath = this.getFilePath(period, identifier);
        fs.writeFileSync(filePath, JSON.stringify(plan, null, 2));
        this.log(`Saved ${period} plan: ${identifier}`);
        return filePath;
    }

    static load(period, identifier) {
        const filePath = this.getFilePath(period, identifier);
        if (!fs.existsSync(filePath)) return null;
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    static exists(period, identifier) {
        return fs.existsSync(this.getFilePath(period, identifier));
    }

    static log(message) {
        const timestamp = getSydneyDate().toISOString();
        const logFile = path.join(LOGS_DIR, `fractal-planner-llm-${formatSydneyDateString()}.log`);
        const logEntry = `${timestamp} - ${message}\n`;
        fs.appendFileSync(logFile, logEntry);
        console.log(`✅ ${message}`);
    }
}

// LLM-Friendly Fractal Planner
class LLMFractalPlanner {
    constructor() {
        this.defaultTimeBlocks = {
            daily: [
                {
                    start: '09:00',
                    duration: 90,
                    title: 'Deep Work Block 1',
                    activity: 'AI/ML skill development - Boot.dev or project work',
                    alignment: '2026 AI engineer transformation goal',
                    type: 'deep-work'
                },
                {
                    start: '11:00', 
                    duration: 60,
                    title: 'Communication & Admin',
                    activity: 'Check emails, process notifications, quick admin tasks',
                    alignment: 'Daily maintenance and communication',
                    type: 'admin'
                },
                {
                    start: '14:00',
                    duration: 90, 
                    title: 'Deep Work Block 2',
                    activity: 'Technical project work or advanced learning',
                    alignment: 'Portfolio building and technical mastery',
                    type: 'deep-work'
                },
                {
                    start: '16:00',
                    duration: 60,
                    title: 'Learning & Development', 
                    activity: 'Research, documentation, or skill practice',
                    alignment: 'Continuous learning and skill gap closure',
                    type: 'learning'
                },
                {
                    start: '17:00',
                    duration: 30,
                    title: 'Planning & Reflection',
                    activity: 'Daily review, tomorrow planning, victory capture',
                    alignment: 'Continuous improvement and habit building', 
                    type: 'reflection'
                }
            ]
        };

        this.defaultObjectives = {
            daily: [
                {
                    title: 'Complete meaningful technical progress',
                    priority: 1,
                    parentAlignment: '2026 AI engineer transformation'
                },
                {
                    title: 'Document learnings and capture victories',
                    priority: 2,
                    parentAlignment: 'Knowledge retention and confidence building'
                },
                {
                    title: 'Maintain momentum with ADD-friendly structure',
                    priority: 3,
                    parentAlignment: 'Sustainable daily practice'
                }
            ],
            weekly: [
                {
                    title: 'Complete 2-3 major technical milestones',
                    priority: 1,
                    parentAlignment: 'Monthly skill development targets'
                },
                {
                    title: 'Update skill matrix with evidence and progress',
                    priority: 2, 
                    parentAlignment: 'Career transition tracking'
                },
                {
                    title: 'Review and optimize productivity systems',
                    priority: 3,
                    parentAlignment: 'Continuous process improvement'
                }
            ],
            monthly: [
                {
                    title: 'Advance 1-2 core AI/technical skills significantly',
                    priority: 1,
                    parentAlignment: 'Quarterly technical foundation building'
                },
                {
                    title: 'Complete meaningful portfolio project milestone',
                    priority: 2,
                    parentAlignment: 'Demonstrable skill evidence'
                },
                {
                    title: 'Analyze job market and adjust learning path',
                    priority: 3,
                    parentAlignment: 'Strategic career positioning'
                }
            ],
            quarterly: [
                {
                    title: 'Master 2-3 critical AI/technical skills to target level',
                    priority: 1,
                    parentAlignment: 'Yearly AI engineer transformation'
                },
                {
                    title: 'Launch significant portfolio project demonstrating capabilities',
                    priority: 2,
                    parentAlignment: 'Career transition credibility'
                },
                {
                    title: 'Build professional network and market presence',
                    priority: 3,
                    parentAlignment: '2026 career positioning'
                }
            ],
            yearly: [
                {
                    title: 'Complete career transition to AI Engineer role',
                    priority: 1,
                    parentAlignment: 'Life transformation goal'
                },
                {
                    title: 'Build comprehensive AI implementation portfolio',
                    priority: 2,
                    parentAlignment: 'Professional credibility and skill demonstration'
                },
                {
                    title: 'Achieve financial stability and debt management',
                    priority: 3,
                    parentAlignment: 'Personal financial security'
                }
            ]
        };
    }

    async planDay(dateStr) {
        const dateIndex = new DateIndex(dateStr ? new Date(dateStr) : new Date());
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n🗓️  Planning Day: ${identifiers.day}`);
        console.log(`📊 Multi-Index: Day ${identifiers.dayOfYear}/365 | Week ${identifiers.dayOfWeek}/7 | Month ${identifiers.dayOfMonth}/31`);
        
        // Create plan structure
        const plan = {
            id: `day-${identifiers.day}`,
            date: identifiers.day,
            type: 'day',
            status: 'active',
            parentPlans: {
                week: identifiers.week,
                month: identifiers.month,
                quarter: identifiers.quarter
            },
            multiIndex: {
                dayOfYear: identifiers.dayOfYear,
                dayOfMonth: identifiers.dayOfMonth,
                dayOfWeek: identifiers.dayOfWeek,
                weekOfYear: identifiers.weekOfYear,
                monthOfYear: identifiers.monthOfYear,
                quarter: identifiers.quarter
            },
            timeBlocks: this.defaultTimeBlocks.daily.map((block, index) => ({
                id: `block-${index + 1}`,
                ...block,
                completed: false
            })),
            objectives: this.defaultObjectives.daily.map((obj, index) => ({
                id: `obj-${index + 1}`,
                ...obj,
                completed: false
            })),
            context: {
                theme: 'Technical Excellence & Structured Learning',
                energy: 'Morning focus on deep work, afternoon on application and review',
                constraints: 'ADD-friendly max 90min blocks with clear transitions'
            },
            metrics: {
                plannedHours: 5.5,
                deepWorkHours: 3.0,
                learningHours: 2.0
            },
            created: getSydneyDate().toISOString(),
            modified: getSydneyDate().toISOString()
        };

        // Save plan
        const planPath = PlanStorage.save(plan);
        
        // Create readable report
        const reportPath = this.createDailyReport(plan, identifiers);
        
        console.log(`\n✅ Daily plan created successfully!`);
        console.log(`📄 Plan data: ${planPath}`);
        console.log(`📋 Readable report: ${reportPath}`);
        console.log(`\n🚀 Next steps:`);
        console.log(`   - Start execution: /taskmaster-start`);
        console.log(`   - Calendar sync: Available via Google Calendar MCP`);
        
        return plan;
    }

    async planWeek(weekStr) {
        const dateIndex = weekStr ? this.parseWeekString(weekStr) : new DateIndex();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📅 Planning Week: ${identifiers.week}`);
        
        const plan = {
            id: `week-${identifiers.week}`,
            week: identifiers.week,
            type: 'week',
            status: 'active',
            parentPlans: {
                month: identifiers.month,
                quarter: identifiers.quarter
            },
            objectives: this.defaultObjectives.weekly.map((obj, index) => ({
                id: `week-obj-${index + 1}`,
                ...obj,
                completed: false
            })),
            priorities: [
                'Maintain learning momentum and technical skill development',
                'Document progress and capture evidence for portfolio',
                'Optimize productivity systems and ADD-friendly workflows'
            ],
            context: {
                theme: 'Sustained Technical Growth',
                focus: 'Balance deep learning with practical application'
            },
            created: getSydneyDate().toISOString(),
            modified: getSydneyDate().toISOString()
        };

        const planPath = PlanStorage.save(plan);
        console.log(`\n✅ Weekly plan created: ${planPath}`);
        
        return plan;
    }

    async planMonth(monthStr) {
        const dateIndex = monthStr ? this.parseMonthString(monthStr) : new DateIndex();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📅 Planning Month: ${identifiers.month}`);
        
        const plan = {
            id: `month-${identifiers.month}`,
            month: identifiers.month,
            type: 'month',
            status: 'active',
            parentPlans: {
                quarter: identifiers.quarter
            },
            objectives: this.defaultObjectives.monthly.map((obj, index) => ({
                id: `month-obj-${index + 1}`,
                ...obj,
                completed: false
            })),
            milestones: [
                'Complete significant AI/ML skill advancement',
                'Deliver portfolio project milestone',
                'Update career strategy based on market analysis'
            ],
            context: {
                theme: 'Strategic Skill Building & Portfolio Development',
                focus: 'Measurable progress toward 2026 AI engineer goal'
            },
            created: getSydneyDate().toISOString(),
            modified: getSydneyDate().toISOString()
        };

        const planPath = PlanStorage.save(plan);
        console.log(`\n✅ Monthly plan created: ${planPath}`);
        
        return plan;
    }

    async planQuarter(quarterStr) {
        const dateIndex = quarterStr ? this.parseQuarterString(quarterStr) : new DateIndex();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📅 Planning Quarter: ${identifiers.quarter}`);
        
        const plan = {
            id: `quarter-${identifiers.quarter}`,
            quarter: identifiers.quarter,
            type: 'quarter',
            status: 'active',
            parentPlans: {
                year: identifiers.year
            },
            objectives: this.defaultObjectives.quarterly.map((obj, index) => ({
                id: `quarter-obj-${index + 1}`,
                ...obj,
                completed: false
            })),
            priorities: [
                'Build foundational AI/ML technical competencies',
                'Create demonstrable portfolio projects',
                'Establish professional presence and network'
            ],
            milestones: [
                'Achieve target proficiency in 2-3 critical AI technologies',
                'Launch portfolio project showcasing technical capabilities',
                'Complete professional certification or significant learning milestone',
                'Build connections with 10+ AI/tech professionals'
            ],
            context: {
                theme: 'Strategic Foundation Building',
                focus: 'Measurable skill advancement and professional positioning',
                constraints: '3-month intensive focus on career transition elements'
            },
            created: getSydneyDate().toISOString(),
            modified: getSydneyDate().toISOString()
        };

        const planPath = PlanStorage.save(plan);
        console.log(`\n✅ Quarterly plan created: ${planPath}`);
        
        return plan;
    }

    async planYear(yearStr) {
        const dateIndex = yearStr ? this.parseYearString(yearStr) : new DateIndex();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📅 Planning Year: ${identifiers.year}`);
        
        const plan = {
            id: `year-${identifiers.year}`,
            year: identifiers.year,
            type: 'year',
            status: 'active',
            objectives: this.defaultObjectives.yearly.map((obj, index) => ({
                id: `year-obj-${index + 1}`,
                ...obj,
                completed: false
            })),
            vision: 'Successful transition from Technical Support to AI Engineer by mid-2026',
            strategicPriorities: [
                'Technical Mastery: Master AI/ML implementation and deployment',
                'Portfolio Development: Build comprehensive project showcase',
                'Professional Transition: Secure AI Engineer role with competitive compensation',
                'Financial Security: Manage mortgage and build emergency fund'
            ],
            majorMilestones: [
                'Q1: Complete foundational AI/ML skills and first major project',
                'Q2: Launch professional portfolio and begin networking',
                'Q3: Achieve key certifications and advanced project delivery',
                'Q4: Secure interviews and transition to AI Engineer role'
            ],
            successMetrics: [
                'Land AI Engineer role with 20%+ salary increase',
                'Complete 3-5 portfolio projects demonstrating AI implementation',
                'Achieve Azure AI Engineer and Data Scientist certifications',
                'Build professional network of 50+ AI/tech connections'
            ],
            context: {
                theme: 'Life Transformation: Technical Support → AI Engineer',
                focus: 'Systematic career transition with financial security',
                constraints: 'Balance intensive learning with current job responsibilities'
            },
            created: getSydneyDate().toISOString(),
            modified: getSydneyDate().toISOString()
        };

        const planPath = PlanStorage.save(plan);
        console.log(`\n✅ Yearly plan created: ${planPath}`);
        
        return plan;
    }

    createDailyReport(plan, identifiers) {
        const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayName = dayNames[identifiers.dayOfWeek];
        
        const report = `---
date: ${plan.date}
type: daily-plan
status: ${plan.status}
parent_plans: [${plan.parentPlans.week}, ${plan.parentPlans.month}, ${plan.parentPlans.quarter}]
---

# Daily Plan: ${dayName}, ${new Date(plan.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}

## 📊 Multi-Index Position
- **Day**: ${identifiers.dayOfYear}/365 (${Math.round(identifiers.dayOfYear/365*100)}% through year)
- **Week**: Day ${identifiers.dayOfWeek}/7 (${dayName})
- **Month**: Day ${identifiers.dayOfMonth}/31
- **Quarter**: Day ${identifiers.dayOfQuarter}/92 (Q${plan.multiIndex.quarter})

## ⏰ Time Block Schedule (ADD-Optimized: ${plan.timeBlocks.length} blocks)

${plan.timeBlocks.map((block, index) => `### Block ${index + 1}: ${block.title}
**${block.start} - ${this.calculateEndTime(block.start, block.duration)}** (${block.duration} minutes) | ${this.capitalizeFirst(block.type)}
- **Focus**: ${block.activity}
- **Alignment**: ${block.alignment}
- **Success Metric**: Progress made toward objective`).join('\n\n')}

## 🎯 Daily Objectives (Max 3 for Focus)

${plan.objectives.map((obj, index) => `${index + 1}. **${obj.title}**
   - Priority: ${this.getPriorityLabel(obj.priority)}
   - Links to: ${obj.parentAlignment}`).join('\n\n')}

## 🔗 Parent Alignment Context

### Strategic Themes
- **Quarter Focus**: Building technical foundations for AI career transition
- **Month Theme**: Systematic skill development and portfolio building
- **Week Priority**: Maintaining learning momentum and documentation habits

### Connection to Higher Goals
- Each time block directly supports the 2026 AI engineer transformation
- Balances technical learning with application and reflection
- Maintains ADD-friendly structure with clear transitions

## 📝 Planning Notes

### Energy Management
- Morning blocks: High cognitive load for deep technical work
- Afternoon blocks: Application, practice, and lighter learning
- Final block: Low energy reflection and administrative tasks

### ADD Optimizations
- Maximum 90-minute blocks to prevent overwhelm
- Clear transitions between different types of activities
- Built-in reflection time to capture wins and improvements

### Key Metrics
- **Total Planned Hours**: ${plan.metrics.plannedHours}
- **Deep Work Hours**: ${plan.metrics.deepWorkHours}
- **Learning Hours**: ${plan.metrics.learningHours}

## 🚀 Next Steps

### To Start Execution:
\`\`\`
/taskmaster-start
\`\`\`

### Integration Points:
- Morning check-in before Block 1
- Noon check-in after Block 2
- Evening check-in during Block 5

### Calendar Sync:
Time blocks can be synced to Google Calendar using MCP integration.

---

*Plan created: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} | Sydney, Australia*`;

        const reportPath = path.join(DAILY_REVIEWS_DIR, `plan-${plan.date}.md`);
        fs.writeFileSync(reportPath, report);
        
        return reportPath;
    }

    calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).replace('-', ' ');
    }

    getPriorityLabel(priority) {
        const labels = { 1: 'HIGH', 2: 'MEDIUM', 3: 'LOW' };
        return labels[priority] || 'MEDIUM';
    }

    parseWeekString(weekStr) {
        // Parse formats like "2025-W35" or just use current week
        if (weekStr && weekStr.includes('-W')) {
            const [year, week] = weekStr.split('-W');
            const firstDayOfYear = new Date(parseInt(year), 0, 1);
            const daysToAdd = (parseInt(week) - 1) * 7 - firstDayOfYear.getDay() + 1;
            return new DateIndex(new Date(firstDayOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000));
        }
        return new DateIndex();
    }

    parseMonthString(monthStr) {
        // Parse formats like "2025-08" or just use current month
        if (monthStr && monthStr.includes('-')) {
            const [year, month] = monthStr.split('-');
            return new DateIndex(new Date(parseInt(year), parseInt(month) - 1, 1));
        }
        return new DateIndex();
    }

    parseQuarterString(quarterStr) {
        // Parse formats like "2025-Q3" or just use current quarter
        if (quarterStr && quarterStr.includes('-Q')) {
            const [year, quarter] = quarterStr.split('-Q');
            const quarterMonth = (parseInt(quarter) - 1) * 3;
            return new DateIndex(new Date(parseInt(year), quarterMonth, 1));
        }
        return new DateIndex();
    }

    parseYearString(yearStr) {
        // Parse formats like "2025" or just use current year
        if (yearStr && /^\d{4}$/.test(yearStr)) {
            return new DateIndex(new Date(parseInt(yearStr), 0, 1));
        }
        return new DateIndex();
    }

    async clearDay(dateStr) {
        const dateIndex = new DateIndex(dateStr ? new Date(dateStr) : new Date());
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n🗑️  Clearing Day: ${identifiers.day}`);
        
        // Remove daily plan JSON file
        const planFile = PlanStorage.getFilePath('day', identifiers.day);
        if (fs.existsSync(planFile)) {
            fs.unlinkSync(planFile);
            PlanStorage.log(`Cleared day plan: ${identifiers.day}`);
            console.log(`✅ Removed daily plan data: ${planFile}`);
        } else {
            console.log(`ℹ️  No daily plan found for ${identifiers.day}`);
        }
        
        // Remove daily plan report
        const reportFile = path.join(DAILY_REVIEWS_DIR, `plan-${identifiers.day}.md`);
        if (fs.existsSync(reportFile)) {
            fs.unlinkSync(reportFile);
            console.log(`✅ Removed daily plan report: ${reportFile}`);
        } else {
            console.log(`ℹ️  No daily plan report found for ${identifiers.day}`);
        }
        
        console.log(`\n🎯 Day cleared successfully!`);
        console.log(`\n💡 Next steps:`);
        console.log(`   - Create fresh plan: node scripts/fractal-planner-llm.cjs plan-day ${identifiers.day}`);
        console.log(`   - Check status: node scripts/fractal-planner-llm.cjs status`);
        
        return { cleared: true, date: identifiers.day };
    }

    async showStatus() {
        const dateIndex = new DateIndex();
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📊 Planning Status - ${identifiers.day}`);
        console.log(`\n🎯 Current Plans:`);
        
        const plans = {
            day: PlanStorage.load('day', identifiers.day),
            week: PlanStorage.load('week', identifiers.week),
            month: PlanStorage.load('month', identifiers.month),
            quarter: PlanStorage.load('quarter', identifiers.quarter)
        };

        Object.entries(plans).forEach(([period, plan]) => {
            const status = plan ? '✅ Active' : '❌ Missing';
            console.log(`   ${period.toUpperCase()}: ${status}`);
        });

        console.log(`\n💡 Recommended Next Actions:`);
        if (!plans.day) console.log(`   🎯 Create daily plan: node scripts/fractal-planner-llm.cjs plan-day`);
        if (!plans.week) console.log(`   📅 Create weekly plan: node scripts/fractal-planner-llm.cjs plan-week`);
        if (!plans.month) console.log(`   📆 Create monthly plan: node scripts/fractal-planner-llm.cjs plan-month`);
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    const planner = new LLMFractalPlanner();
    
    try {
        switch (command) {
            case 'plan-day':
                await planner.planDay(args[1]);
                break;
            case 'clear-day':
                await planner.clearDay(args[1]);
                break;
            case 'plan-week':
                await planner.planWeek(args[1]);
                break;
            case 'plan-month':
                await planner.planMonth(args[1]);
                break;
            case 'plan-quarter':
                await planner.planQuarter(args[1]);
                break;
            case 'plan-year':
                await planner.planYear(args[1]);
                break;
            case 'status':
                await planner.showStatus();
                break;
            default:
                console.log(`
LLM-Friendly Fractal Planner

Usage:
  node scripts/fractal-planner-llm.cjs [command] [args]

Planning Commands:
  plan-day [date]         - Create daily time blocks (5 blocks, ADD-optimized)
  clear-day [date]        - Clear/remove daily plan and start fresh
  plan-week [week]        - Create weekly priorities and goals
  plan-month [month]      - Create monthly objectives and milestones
  plan-quarter [quarter]  - Create quarterly strategic initiatives
  plan-year [year]        - Create yearly vision and transformation goals
  status                  - Show current planning status

Examples:
  node scripts/fractal-planner-llm.cjs plan-day 2025-08-28
  node scripts/fractal-planner-llm.cjs clear-day 2025-08-28
  node scripts/fractal-planner-llm.cjs plan-week 2025-W35
  node scripts/fractal-planner-llm.cjs plan-month 2025-08
  node scripts/fractal-planner-llm.cjs plan-quarter 2025-Q3
  node scripts/fractal-planner-llm.cjs plan-year 2025
  node scripts/fractal-planner-llm.cjs status
                `);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { LLMFractalPlanner, DateIndex, PlanStorage };