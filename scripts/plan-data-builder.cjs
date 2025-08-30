#!/usr/bin/env node

/**
 * Plan Data Builder
 * Purpose: Build planning data incrementally from daily/weekly check-ins
 * Usage: node scripts/plan-data-builder.js [command] [period] [data]
 * 
 * This script allows building up planning data over time rather than requiring
 * complete plans upfront. Perfect for users who prefer organic planning through
 * daily and weekly reflection.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'planning', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

class PlanDataBuilder {
    
    /**
     * Add objectives to an existing plan or create new plan
     */
    addObjectives(period, identifier, objectives) {
        const filePath = path.join(DATA_DIR, `${period}-${identifier}.json`);
        let plan = {};
        
        // Load existing plan if it exists
        if (fs.existsSync(filePath)) {
            plan = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
            // Create new basic plan structure
            plan = {
                period: period,
                identifier: identifier,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                status: 'active',
                parentPlans: [],
                childPlans: [],
                objectives: [],
                priorities: [],
                timeBlocks: [],
                milestones: [],
                metrics: {},
                context: '',
                challenges: [],
                resources: []
            };
        }
        
        // Add new objectives (avoid duplicates)
        objectives.forEach(obj => {
            const exists = plan.objectives.some(existing => 
                existing.text.toLowerCase().includes(obj.toLowerCase()) || 
                obj.toLowerCase().includes(existing.text.toLowerCase())
            );
            
            if (!exists) {
                plan.objectives.push({
                    id: Date.now().toString() + Math.random(),
                    text: obj,
                    created: new Date().toISOString(),
                    completed: false,
                    priority: 'medium'
                });
            }
        });
        
        plan.modified = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(plan, null, 2));
        console.log(`✅ Added ${objectives.length} objectives to ${period} ${identifier}`);
    }
    
    /**
     * Update objective completion status
     */
    updateObjectiveStatus(period, identifier, objectiveText, completed) {
        const filePath = path.join(DATA_DIR, `${period}-${identifier}.json`);
        
        if (!fs.existsSync(filePath)) {
            console.error(`❌ No plan found for ${period} ${identifier}`);
            return;
        }
        
        const plan = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const objective = plan.objectives.find(obj => 
            obj.text.toLowerCase().includes(objectiveText.toLowerCase())
        );
        
        if (objective) {
            objective.completed = completed;
            plan.modified = new Date().toISOString();
            fs.writeFileSync(filePath, JSON.stringify(plan, null, 2));
            console.log(`✅ Updated objective "${objectiveText}" to ${completed ? 'completed' : 'pending'}`);
        } else {
            console.error(`❌ Objective not found: ${objectiveText}`);
        }
    }
    
    /**
     * Add milestones to plan
     */
    addMilestones(period, identifier, milestones) {
        const filePath = path.join(DATA_DIR, `${period}-${identifier}.json`);
        let plan = {};
        
        if (fs.existsSync(filePath)) {
            plan = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
            console.error(`❌ No plan found for ${period} ${identifier}. Create objectives first.`);
            return;
        }
        
        milestones.forEach(milestone => {
            const exists = plan.milestones.some(existing => 
                existing.text.toLowerCase().includes(milestone.toLowerCase())
            );
            
            if (!exists) {
                plan.milestones.push({
                    id: Date.now().toString() + Math.random(),
                    text: milestone,
                    targetDate: null,
                    completed: false
                });
            }
        });
        
        plan.modified = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(plan, null, 2));
        console.log(`✅ Added ${milestones.length} milestones to ${period} ${identifier}`);
    }
    
    /**
     * Set plan context/theme
     */
    setContext(period, identifier, context) {
        const filePath = path.join(DATA_DIR, `${period}-${identifier}.json`);
        
        if (!fs.existsSync(filePath)) {
            console.error(`❌ No plan found for ${period} ${identifier}`);
            return;
        }
        
        const plan = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        plan.context = context;
        plan.modified = new Date().toISOString();
        fs.writeFileSync(filePath, JSON.stringify(plan, null, 2));
        console.log(`✅ Set context for ${period} ${identifier}: "${context}"`);
    }
    
    /**
     * Show plan summary
     */
    showSummary(period, identifier) {
        const filePath = path.join(DATA_DIR, `${period}-${identifier}.json`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ No plan found for ${period} ${identifier}`);
            return;
        }
        
        const plan = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`\n📋 ${period.toUpperCase()} ${identifier} Summary:`);
        console.log(`Theme: ${plan.context || 'Not set'}`);
        console.log(`Objectives: ${plan.objectives.length} (${plan.objectives.filter(o => o.completed).length} completed)`);
        console.log(`Milestones: ${plan.milestones.length} (${plan.milestones.filter(m => m.completed).length} completed)`);
        
        if (plan.objectives.length > 0) {
            console.log('\n🎯 Objectives:');
            plan.objectives.forEach((obj, i) => {
                console.log(`  ${i + 1}. ${obj.completed ? '✅' : '⏳'} ${obj.text}`);
            });
        }
        
        if (plan.milestones.length > 0) {
            console.log('\n🏆 Milestones:');
            plan.milestones.forEach((milestone, i) => {
                console.log(`  ${i + 1}. ${milestone.completed ? '✅' : '⏳'} ${milestone.text}`);
            });
        }
    }
    
    run() {
        const args = process.argv.slice(2);
        const command = args[0];
        const period = args[1];
        const identifier = args[2];
        
        if (!command || !period || !identifier) {
            this.showHelp();
            return;
        }
        
        try {
            switch (command) {
                case 'add-objectives':
                    const objectives = args.slice(3);
                    if (objectives.length === 0) {
                        console.error('❌ No objectives provided');
                        return;
                    }
                    this.addObjectives(period, identifier, objectives);
                    break;
                    
                case 'add-milestones':
                    const milestones = args.slice(3);
                    if (milestones.length === 0) {
                        console.error('❌ No milestones provided');
                        return;
                    }
                    this.addMilestones(period, identifier, milestones);
                    break;
                    
                case 'set-context':
                    const context = args.slice(3).join(' ');
                    if (!context) {
                        console.error('❌ No context provided');
                        return;
                    }
                    this.setContext(period, identifier, context);
                    break;
                    
                case 'complete':
                    const objectiveText = args.slice(3).join(' ');
                    if (!objectiveText) {
                        console.error('❌ No objective text provided');
                        return;
                    }
                    this.updateObjectiveStatus(period, identifier, objectiveText, true);
                    break;
                    
                case 'summary':
                    this.showSummary(period, identifier);
                    break;
                    
                default:
                    this.showHelp();
            }
        } catch (error) {
            console.error('Error:', error.message);
        }
    }
    
    showHelp() {
        console.log(`
📊 Plan Data Builder

Build planning data incrementally from daily/weekly insights.

Commands:
  add-objectives [period] [id] [obj1] [obj2] ...  - Add objectives to plan
  add-milestones [period] [id] [m1] [m2] ...      - Add milestones to plan  
  set-context [period] [id] [context text]       - Set plan theme/context
  complete [period] [id] [objective text]        - Mark objective as completed
  summary [period] [id]                          - Show plan summary

Examples:
  # Build September month plan from daily insights
  node scripts/plan-data-builder.js add-objectives month 2025-09 "Complete AI project" "Study Python daily"
  node scripts/plan-data-builder.js add-milestones month 2025-09 "Project launch" "30-day streak"
  node scripts/plan-data-builder.js set-context month 2025-09 "Foundation to Flight"
  
  # Mark objectives complete
  node scripts/plan-data-builder.js complete month 2025-09 "AI project"
  
  # Check progress
  node scripts/plan-data-builder.js summary month 2025-09

Periods: day, week, month, quarter, year
IDs: 2025-08-30, 2025-W35, 2025-09, 2025-Q3, 2025
        `);
    }
}

// Run if called directly
if (require.main === module) {
    const builder = new PlanDataBuilder();
    builder.run();
}

module.exports = PlanDataBuilder;