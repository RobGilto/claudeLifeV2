#!/usr/bin/env node

/**
 * LLM-Friendly Fractal Planning System
 * Purpose: Non-interactive multi-scale planning and reviewing for day/week/month/quarter/year
 * Usage: node scripts/fractal-planner-llm.cjs [command] [args]
 * Dependencies: fs, path (no readline - LLM compatible)
 * 
 * Planning Commands:
 * - plan-day [date]      - Create daily time blocks with sensible defaults
 * - plan-week [week]     - Create weekly goals and priorities 
 * - plan-month [month]   - Create monthly objectives and milestones
 * - plan-quarter [Q]     - Create quarterly strategic initiatives
 * - plan-year [year]     - Create yearly vision and major goals
 * 
 * Review Commands:
 * - review-day [date|yesterday|today]     - Conduct daily performance review
 * - review-week [week|current|last]       - Weekly achievement and insights review
 * - review-month [month|current|last]     - Monthly strategic assessment
 * - review-quarter [quarter|current|last] - Quarterly transformation review
 * 
 * Utility Commands:
 * - status [period]      - Show current planning status and next actions
 * - clear-day [date]     - Clear/remove daily plan and start fresh
 * - calendar-sync [date] - Sync daily time blocks to Google Calendar
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
const VICTORIES_DIR = path.join(__dirname, '..', 'victories');
const LOGS_DIR = path.join(__dirname, '..', 'logs');
const DATA_DIR = path.join(PLANNING_DIR, 'data');
const DAILY_REVIEWS_DIR = path.join(JOURNAL_DIR, 'daily-reviews');
const WEEKLY_REVIEWS_DIR = path.join(JOURNAL_DIR, 'weekly-reviews');
const MONTHLY_REVIEWS_DIR = path.join(JOURNAL_DIR, 'monthly-reviews');
const QUARTERLY_REVIEWS_DIR = path.join(JOURNAL_DIR, 'quarterly-reviews');

// Ensure directories exist
[PLANNING_DIR, JOURNAL_DIR, VICTORIES_DIR, LOGS_DIR, DATA_DIR, 
 DAILY_REVIEWS_DIR, WEEKLY_REVIEWS_DIR, MONTHLY_REVIEWS_DIR, QUARTERLY_REVIEWS_DIR].forEach(dir => {
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

    getMultiIndexDisplay() {
        const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        const identifiers = this.getIdentifiers();
        const dayName = dayNames[identifiers.dayOfWeek];
        const monthName = monthNames[this.month];
        const yearPercent = Math.round((identifiers.dayOfYear / 365) * 100);
        const quarterPercent = Math.round((identifiers.dayOfQuarter / 92) * 100);
        
        return {
            fullDate: `${dayName}, ${this.day} ${monthName} ${this.year}`,
            multiIndex: `Day ${identifiers.dayOfYear}/365 (${yearPercent}%) | Week ${identifiers.dayOfWeek}/7 | Month ${identifiers.dayOfMonth}/31 | Quarter ${identifiers.dayOfQuarter}/92 (${quarterPercent}%)`,
            context: `${identifiers.quarter} 2025 | Week ${identifiers.weekOfYear}`
        };
    }

    // Static method to parse relative dates
    static parseRelativeDate(dateStr) {
        if (!dateStr) return new DateIndex();
        
        const now = getSydneyDate();
        
        switch (dateStr.toLowerCase()) {
            case 'today':
                return new DateIndex(now);
            case 'yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                return new DateIndex(yesterday);
            case 'tomorrow':
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return new DateIndex(tomorrow);
            case 'current':
            case 'this':
                return new DateIndex(now);
            case 'last':
            case 'previous':
                // Context-dependent - will be handled by specific period parsers
                return new DateIndex(now);
            default:
                // Try to parse as specific date
                if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return new DateIndex(new Date(dateStr));
                }
                // Default to current
                return new DateIndex(now);
        }
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

    generateTimeAwareBlocks(startTime = null) {
        // Get current Sydney time if no startTime provided
        if (!startTime) {
            const now = new Date();
            const sydneyTime = new Date(now.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
            const currentHour = sydneyTime.getHours();
            
            // Round up to next hour for planning
            startTime = `${String(Math.max(9, currentHour + 1)).padStart(2, '0')}:00`;
            console.log(`🕐 Auto-detected start time: ${startTime} (current: ${String(currentHour).padStart(2, '0')}:${String(sydneyTime.getMinutes()).padStart(2, '0')})`);
        }
        
        // Parse start time
        const [startHour, startMin] = startTime.split(':').map(Number);
        let currentHour = startHour;
        let currentMin = startMin;
        
        const blocks = [];
        const blockTemplates = [
            { duration: 90, title: 'Deep Work Block 1', type: 'deep-work', activity: 'AI/ML skill development - Boot.dev or project work', alignment: '2026 AI engineer transformation goal' },
            { duration: 60, title: 'Learning & Development', type: 'learning', activity: 'Research, documentation, or skill practice', alignment: 'Continuous learning and skill gap closure' },
            { duration: 90, title: 'Deep Work Block 2', type: 'deep-work', activity: 'Technical project work or advanced learning', alignment: 'Portfolio building and technical mastery' },
            { duration: 30, title: 'Planning & Reflection', type: 'reflection', activity: 'Daily review, tomorrow planning, victory capture', alignment: 'Continuous improvement and habit building' }
        ];
        
        // Generate blocks starting from startTime
        for (let i = 0; i < blockTemplates.length && currentHour < 18; i++) {
            const template = blockTemplates[i];
            
            blocks.push({
                start: `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`,
                duration: template.duration,
                title: template.title,
                activity: template.activity,
                alignment: template.alignment,
                type: template.type
            });
            
            // Add duration to current time + 30min break
            currentMin += template.duration + 30;
            while (currentMin >= 60) {
                currentHour++;
                currentMin -= 60;
            }
        }
        
        return blocks;
    }

    async planDay(dateStr, startTime = null) {
        const dateIndex = new DateIndex(dateStr ? new Date(dateStr) : new Date());
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n🗓️  Planning Day: ${identifiers.day}`);
        console.log(`📊 Multi-Index: Day ${identifiers.dayOfYear}/365 | Week ${identifiers.dayOfWeek}/7 | Month ${identifiers.dayOfMonth}/31`);
        
        // Generate time-aware blocks
        const timeBlocks = this.generateTimeAwareBlocks(startTime);
        
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
            timeBlocks: timeBlocks.map((block, index) => ({
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

    // Review Methods
    async reviewDay(dateStr) {
        const dateIndex = DateIndex.parseRelativeDate(dateStr);
        const identifiers = dateIndex.getIdentifiers();
        const display = dateIndex.getMultiIndexDisplay();
        
        console.log(`\n📅 Reviewing Day: ${identifiers.day}`);
        console.log(`📊 ${display.multiIndex}`);
        console.log(`🗓️ ${display.fullDate}`);
        
        // Check for existing plan
        const plan = PlanStorage.load('day', identifiers.day);
        if (plan) {
            console.log(`\n📋 Original Plan Reference:`);
            console.log(`   - Time blocks planned: ${plan.timeBlocks?.length || 0}`);
            console.log(`   - Daily objectives: ${plan.objectives?.length || 0}`);
            console.log(`   - Theme: ${plan.context?.theme || 'Technical Excellence'}`);
        } else {
            console.log(`\nℹ️  No formal plan found for ${identifiers.day} - conducting organic day review`);
        }
        
        // Look for existing daily journal entry
        const journalFile = path.join(__dirname, '..', 'journal', 'daily', `daily-${identifiers.day}.md`);
        let journalContent = '';
        if (fs.existsSync(journalFile)) {
            journalContent = fs.readFileSync(journalFile, 'utf8');
            console.log(`\n📖 Daily journal entry found - incorporating insights`);
        }
        
        // Check for victories
        const victoriesFile = path.join(VICTORIES_DIR, `victories-${identifiers.year}-${String(identifiers.monthOfYear).padStart(2, '0')}.md`);
        let dayVictories = [];
        if (fs.existsSync(victoriesFile)) {
            const victoriesContent = fs.readFileSync(victoriesFile, 'utf8');
            // Extract victories for this specific date
            const datePattern = new RegExp(`\\*\\*Date\\*\\*: ${identifiers.day}[\\s\\S]*?(?=\\*\\*Date\\*\\*|$)`, 'g');
            const matches = victoriesContent.match(datePattern);
            if (matches) {
                dayVictories = matches.map(match => {
                    const titleMatch = match.match(/### Victory: (.+)/);
                    const categoryMatch = match.match(/\*\*Category\*\*: (\w+)/);
                    const moodMatch = match.match(/\*\*Mood Impact\*\*: \+(\d+)/);
                    return {
                        title: titleMatch ? titleMatch[1] : 'Unknown Victory',
                        category: categoryMatch ? categoryMatch[1] : 'general',
                        moodImpact: moodMatch ? parseInt(moodMatch[1]) : 0
                    };
                });
            }
        }
        
        console.log(`\n🏆 Victories detected: ${dayVictories.length} wins`);
        if (dayVictories.length > 0) {
            dayVictories.forEach((victory, index) => {
                console.log(`   ${index + 1}. ${victory.title} (${victory.category}, +${victory.moodImpact} mood)`);
            });
        }
        
        // Create review template
        const reviewContent = this.generateDayReviewTemplate(identifiers, display, plan, journalContent, dayVictories);
        const reviewPath = path.join(DAILY_REVIEWS_DIR, `review-${identifiers.day}.md`);
        fs.writeFileSync(reviewPath, reviewContent);
        
        console.log(`\n✅ Daily review template created: ${reviewPath}`);
        console.log(`\n💡 Next steps:`);
        console.log(`   - Complete review details in: ${reviewPath}`);
        console.log(`   - Plan tomorrow: node scripts/fractal-planner-llm.cjs plan-day tomorrow`);
        console.log(`   - Check weekly progress: node scripts/fractal-planner-llm.cjs status`);
        
        return { reviewPath, victories: dayVictories.length, hasJournal: !!journalContent };
    }

    generateDayReviewTemplate(identifiers, display, plan, journalContent, victories) {
        const completionRate = plan ? 85 : 100; // Default estimates
        const satisfactionRate = victories.length > 3 ? 8 : victories.length > 0 ? 6 : 5;
        const energyAvg = journalContent.includes('8/10') ? 8 : journalContent.includes('energy') ? 7 : 6;
        const focusAvg = journalContent.includes('focus') ? 8 : 7;
        
        return `---
date: ${identifiers.day}
type: daily-review
completion_rate: ${completionRate}%
energy_average: ${energyAvg}/10
focus_average: ${focusAvg}/10
satisfaction: ${satisfactionRate}/10
victories_detected: ${victories.length}
---

# Daily Review: ${display.fullDate}

## Multi-Index Position
${display.multiIndex}
**Context**: ${display.context}

## Execution Summary
${plan ? `- Time blocks planned: ${plan.timeBlocks?.length || 0}
- Objectives planned: ${plan.objectives?.length || 0}` : '- No formal plan - organic day execution'}
- **Victories detected**: ${victories.length} wins
- **Overall completion rate**: ${completionRate}%

${plan ? `## Original Plan Assessment
### Time Blocks Analysis
${plan.timeBlocks?.map((block, i) => `**Block ${i + 1}: ${block.title}** (${block.start} - ${this.calculateEndTime(block.start, block.duration)})
- Activity: ${block.activity}
- Completion: [ ] Complete / [ ] Partial / [ ] Not Started
- Effectiveness: _/10
- Notes: [Add completion notes]`).join('\n\n')}

### Objectives Review
${plan.objectives?.map((obj, i) => `${i + 1}. **${obj.title}** (Priority: ${this.getPriorityLabel(obj.priority)})
   - Status: [ ] Completed / [ ] Partial / [ ] Not Started
   - Notes: [Add progress notes]`).join('\n\n')}` : '## Organic Day Assessment\n[No formal plan - review based on actual accomplishments and activities]'}

## Energy & Focus Patterns
- **Morning energy**: _/10
- **Afternoon energy**: _/10  
- **Evening energy**: _/10
- **Average focus quality**: ${focusAvg}/10
- **Best performance period**: [time/activity]
- **Challenging periods**: [when/what]

## Accomplishments & Wins
${victories.length > 0 ? `### Detected Victories (${victories.length}):
${victories.map((v, i) => `${i + 1}. **${v.title}** (${v.category}) - Mood impact: +${v.moodImpact}`).join('\n')}

### Additional Accomplishments:` : '### Major Accomplishments:'}
[Add any accomplishments not captured in victory tracking]

## Challenges & Learning
### Obstacles Faced:
[What hindered progress or created difficulties]

### Key Insights:
[What was learned or discovered today]

### Adjustments Needed:
[How to improve tomorrow based on today's experience]

## Parent Plan Alignment Assessment

### Weekly Goal Support
${plan?.parentPlans ? `- Week: ${plan.parentPlans.week}
- Monthly connection: ${plan.parentPlans.month}
- How today advanced weekly priorities: [assessment]` : '[How did today support current weekly priorities]'}

### Strategic Progress
- **Monthly objectives**: [How today contributed to monthly goals]
- **Quarterly advancement**: [Connection to quarterly strategic priorities]

## Performance Patterns & Insights
### Most Productive Periods:
[When was focus and energy highest]

### Energy Management:
[What supported or drained energy today]

### Workflow Effectiveness:
[What processes/approaches worked well or need improvement]

## Tomorrow's Planning Preparation
### Top Priority for Tomorrow:
[Most important thing to accomplish]

### Energy Optimization:
[How to structure tomorrow based on today's energy patterns]

### Lessons to Apply:
[Specific improvements to implement tomorrow]

### Carry Forward Items:
[Unfinished important work from today]

## Victory Integration
${victories.length > 0 ? `✅ ${victories.length} victories already captured in victory tracking system
- Total mood impact: +${victories.reduce((sum, v) => sum + v.moodImpact, 0)}
- Categories: ${[...new Set(victories.map(v => v.category))].join(', ')}` : '⚠️ No victories detected - consider reviewing accomplishments for missed wins'}

---

*Review template generated: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} | Complete the sections above for full daily review*`;
    }

    async reviewWeek(weekStr) {
        const dateIndex = this.parseWeekStringForReview(weekStr);
        const identifiers = dateIndex.getIdentifiers();
        
        console.log(`\n📊 Reviewing Week: ${identifiers.week}`);
        console.log(`📅 Week ${identifiers.weekOfYear}, ${identifiers.year}`);
        
        // Check for weekly plan
        const plan = PlanStorage.load('week', identifiers.week);
        if (plan) {
            console.log(`\n📋 Weekly Plan Reference:`);
            console.log(`   - Theme: ${plan.context?.theme || 'Sustained Technical Growth'}`);
            console.log(`   - Objectives: ${plan.objectives?.length || 0}`);
            console.log(`   - Priorities: ${plan.priorities?.length || 0}`);
        } else {
            console.log(`\nℹ️  No formal weekly plan found for ${identifiers.week}`);
        }
        
        // Gather daily data from the week
        const weekDays = this.getWeekDays(dateIndex.date);
        const weekData = await this.gatherWeekData(weekDays);
        
        console.log(`\n📈 Week Summary:`);
        console.log(`   - Days with journals: ${weekData.journalDays}`);
        console.log(`   - Total victories: ${weekData.totalVictories}`);
        console.log(`   - Plans completed: ${weekData.plansCompleted}`);
        
        // Create review template
        const reviewContent = this.generateWeekReviewTemplate(identifiers, plan, weekData);
        const reviewPath = path.join(WEEKLY_REVIEWS_DIR, `review-${identifiers.week}.md`);
        fs.writeFileSync(reviewPath, reviewContent);
        
        console.log(`\n✅ Weekly review template created: ${reviewPath}`);
        console.log(`\n💡 Next steps:`);
        console.log(`   - Complete review details in: ${reviewPath}`);
        console.log(`   - Plan next week: node scripts/fractal-planner-llm.cjs plan-week`);
        
        return { reviewPath, weekData };
    }

    parseWeekStringForReview(weekStr) {
        if (!weekStr || weekStr === 'current' || weekStr === 'this') {
            return new DateIndex();
        }
        
        if (weekStr === 'last' || weekStr === 'previous') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            return new DateIndex(lastWeek);
        }
        
        // Handle specific week format like "2025-W34"
        if (weekStr.includes('-W')) {
            const [year, week] = weekStr.split('-W');
            const firstDayOfYear = new Date(parseInt(year), 0, 1);
            const daysToAdd = (parseInt(week) - 1) * 7 - firstDayOfYear.getDay() + 1;
            return new DateIndex(new Date(firstDayOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000));
        }
        
        return new DateIndex();
    }

    getWeekDays(startDate) {
        const days = [];
        const monday = new Date(startDate);
        monday.setDate(startDate.getDate() - startDate.getDay() + 1); // Get Monday
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            days.push(formatSydneyDateString(day));
        }
        
        return days;
    }

    async gatherWeekData(weekDays) {
        let journalDays = 0;
        let totalVictories = 0;
        let plansCompleted = 0;
        const dailyData = [];
        
        for (const day of weekDays) {
            const journalFile = path.join(__dirname, '..', 'journal', 'daily', `daily-${day}.md`);
            const planFile = PlanStorage.getFilePath('day', day);
            
            const dayData = {
                date: day,
                hasJournal: fs.existsSync(journalFile),
                hasPlan: fs.existsSync(planFile),
                victories: 0,
                energy: null
            };
            
            if (dayData.hasJournal) {
                journalDays++;
                const content = fs.readFileSync(journalFile, 'utf8');
                // Extract energy levels if present
                const energyMatch = content.match(/(\d+)\/10/);
                if (energyMatch) dayData.energy = parseInt(energyMatch[1]);
            }
            
            if (dayData.hasPlan) plansCompleted++;
            
            dailyData.push(dayData);
        }
        
        // Count victories for the week (approximate based on recent victory file)
        const now = new DateIndex();
        const victoriesFile = path.join(VICTORIES_DIR, `victories-${now.year}-${String(now.month).padStart(2, '0')}.md`);
        if (fs.existsSync(victoriesFile)) {
            const content = fs.readFileSync(victoriesFile, 'utf8');
            weekDays.forEach(day => {
                const dayMatches = (content.match(new RegExp(`\\*\\*Date\\*\\*: ${day}`, 'g')) || []).length;
                totalVictories += dayMatches;
            });
        }
        
        return {
            journalDays,
            totalVictories,
            plansCompleted,
            dailyData,
            averageEnergy: dailyData.filter(d => d.energy).reduce((sum, d) => sum + d.energy, 0) / 
                          dailyData.filter(d => d.energy).length || null
        };
    }

    generateWeekReviewTemplate(identifiers, plan, weekData) {
        const completionRate = plan ? (weekData.plansCompleted / 7) * 100 : (weekData.journalDays / 7) * 100;
        const satisfaction = weekData.totalVictories > 5 ? 8 : weekData.totalVictories > 2 ? 6 : 4;
        
        return `---
date: ${formatSydneyDateString(new Date())}
week: ${identifiers.week}
type: weekly-review
completion_rate: ${Math.round(completionRate)}%
satisfaction: ${satisfaction}/10
energy_average: ${Math.round(weekData.averageEnergy) || 'N/A'}/10
focus_average: N/A/10
victories_detected: ${weekData.totalVictories}
---

# Weekly Review: Week ${identifiers.weekOfYear}, ${identifiers.year}

## Performance Summary
- **Days with activity**: ${weekData.journalDays}/7
- **Total victories detected**: ${weekData.totalVictories}
- **Plans completed**: ${weekData.plansCompleted}/7
- **Overall satisfaction**: ${satisfaction}/10
- **Average energy**: ${Math.round(weekData.averageEnergy) || 'Not tracked'}/10

${plan ? `## Weekly Plan Assessment

### Original Objectives Review
${plan.objectives?.map((obj, i) => `${i + 1}. **${obj.title}** (Priority: ${this.getPriorityLabel(obj.priority)})
   - Status: [ ] Completed / [ ] Partial / [ ] Not Started
   - Impact: [How this objective was addressed]
   - Notes: [Progress and insights]`).join('\n\n')}

### Priority Achievement Analysis
${plan.priorities?.map((priority, i) => `${i + 1}. ${priority}
   - Achievement level: [ ] High / [ ] Medium / [ ] Low
   - Key actions taken: [What was done]`).join('\n\n')}` : '## Organic Week Assessment\n[No formal weekly plan - assess based on accomplishments and patterns]'}

## Daily Performance Breakdown
${weekData.dailyData.map((day, i) => {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return `### ${dayNames[i]} (${day.date})
- Activity tracked: ${day.hasJournal ? '✅' : '❌'}
- Plan executed: ${day.hasPlan ? '✅' : '❌'}
- Energy level: ${day.energy || 'Not tracked'}/10
- Key accomplishments: [Add major wins/progress]`;
}).join('\n\n')}

## Well-being & Performance Metrics
- **Highest energy days**: [Which days felt most energetic]
- **Most productive days**: [When was output highest]
- **Challenging periods**: [Difficult days/times and reasons]
- **Best performance patterns**: [When/how optimal work happened]

## Victory & Achievement Analysis
**Total victories detected**: ${weekData.totalVictories}

### Major Wins This Week:
[List significant accomplishments and breakthroughs]

### Pattern Recognition:
[What victory/success patterns emerged this week]

## Challenges & Learning
### Primary Obstacles:
[Main challenges that hindered progress]

### Key Insights Gained:
[Important discoveries or realizations]

### Process Improvements Identified:
[How to optimize workflows/approaches]

## Strategic Alignment Assessment

### Parent Plan Contribution
${plan?.parentPlans ? `- **Monthly goals** (${plan.parentPlans.month}): [How this week advanced monthly objectives]
- **Quarterly priorities** (${plan.parentPlans.quarter}): [Progress toward quarterly strategic goals]` : '[How did this week support higher-level monthly and quarterly goals]'}

### Weekly Theme Effectiveness
${plan?.context?.theme ? `**Theme**: "${plan.context.theme}"
- How well did activities align with this theme: [Assessment]
- Should this theme continue: [ ] Yes / [ ] Modify / [ ] Change` : '[What theme/focus emerged organically this week]'}

## Adjustments for Next Week

### Priority Refinements:
[What should be emphasized more/less based on this week's learning]

### Process Optimizations:
[Workflow or system improvements to implement]

### Energy Management:
[How to better optimize energy based on this week's patterns]

### Focus Areas:
[Key areas requiring attention next week]

## Next Week Preparation
### Carry Forward Priorities:
[Important unfinished work from this week]

### New Strategic Focus:
[Emerging priorities for next week]

### Energy Optimization Plan:
[How to structure next week for optimal performance]

---

*Weekly review template generated: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} | Complete sections above for full assessment*`;
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
            case 'review-day':
                await planner.reviewDay(args[1]);
                break;
            case 'review-week':
                await planner.reviewWeek(args[1]);
                break;
            case 'review-month':
                console.log('📊 Monthly review command - Implementation coming soon!');
                console.log('For now, use the monthly review template in journal/planning/monthly-reviews/');
                break;
            case 'review-quarter':
                console.log('📈 Quarterly review command - Implementation coming soon!');
                console.log('For now, use the quarterly review template in journal/planning/quarterly-reviews/');
                break;
            case 'status':
                await planner.showStatus();
                break;
            default:
                console.log(`
🗓️ LLM-Friendly Fractal Planning & Review System

Usage:
  node scripts/fractal-planner-llm.cjs [command] [args]

📅 Planning Commands:
  plan-day [date]         - Create daily time blocks (4-5 blocks, ADD-optimized)
  plan-week [week]        - Create weekly priorities and goals
  plan-month [month]      - Create monthly objectives and milestones  
  plan-quarter [quarter]  - Create quarterly strategic initiatives
  plan-year [year]        - Create yearly vision and transformation goals

📊 Review Commands:
  review-day [date|yesterday|today]     - Conduct daily performance review
  review-week [week|current|last]       - Weekly achievement and insights review
  review-month [month|current|last]     - Monthly strategic assessment (coming soon)
  review-quarter [quarter|current|last] - Quarterly transformation review (coming soon)

🛠️ Utility Commands:
  clear-day [date]        - Clear/remove daily plan and start fresh
  status                  - Show current planning status and next actions

📝 Planning Examples:
  node scripts/fractal-planner-llm.cjs plan-day 2025-08-28
  node scripts/fractal-planner-llm.cjs plan-week 2025-W35
  node scripts/fractal-planner-llm.cjs plan-month 2025-08

📈 Review Examples:
  node scripts/fractal-planner-llm.cjs review-day yesterday
  node scripts/fractal-planner-llm.cjs review-day 2025-08-27
  node scripts/fractal-planner-llm.cjs review-week current
  node scripts/fractal-planner-llm.cjs review-week 2025-W34

🎯 Features:
  - Automatic date calculations (no more manual bash date math!)
  - Multi-index display (Day X/365, Week Y/52, etc.)
  - Victory detection and integration
  - Parent plan alignment tracking
  - ADD-optimized time blocks and templates
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