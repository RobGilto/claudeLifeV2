#!/usr/bin/env node

/**
 * Evening Check-in Script with Day Review Integration
 * Purpose: End-of-day reflection, tomorrow planning, and optional day plan performance review
 * Usage: node scripts/evening-checkin.js or /evening-checkin command
 * Dependencies: fs, path, readline
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const JOURNAL_DIR = path.join(__dirname, '..', 'journal', 'daily');
const VICTORIES_DIR = path.join(__dirname, '..', 'victories');
const PLANNING_DIR = path.join(__dirname, '..', 'planning', 'data');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
[JOURNAL_DIR, VICTORIES_DIR, PLANNING_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Sydney timezone utilities
const getSydneyDate = (date = new Date()) => {
    return new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
};

const formatSydneyDateString = (date = new Date()) => {
    const sydneyDate = getSydneyDate(date);
    return sydneyDate.toISOString().split('T')[0];
};

// Date utilities  
const getToday = () => {
    const now = getSydneyDate();
    return {
        date: formatSydneyDateString(),
        time: now.toTimeString().split(' ')[0].slice(0, 5),
        fullDate: now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        }),
        month: now.toISOString().slice(0, 7)
    };
};

// Victory detection patterns
const VICTORY_PATTERNS = {
    technical: [
        'figured out', 'built', 'solved', 'learned', 'implemented', 
        'debugged', 'fixed', 'created', 'automated', 'optimized',
        'integrated', 'configured', 'documented', 'deployed'
    ],
    personal: [
        'resisted', 'chose', 'decided', 'prioritized', 'said no',
        'asked for help', 'reached out', 'connected', 'exercised',
        'visited', 'saw', 'called', 'spent time', 'maintained'
    ],
    discipline: [
        'stayed focused', 'completed', 'finished', 'pushed through',
        'maintained', 'kept going', 'didn\'t give up', 'persisted',
        'streak', 'consistent', 'continued'
    ],
    learning: [
        'practiced', 'studied', 'read', 'watched', 'course', 
        'tutorial', 'boot.dev', 'python', 'ai engineer'
    ],
    selfAwareness: [
        'realized', 'recognized', 'noticed', 'understood', 'saw pattern',
        'identified', 'acknowledged', 'accepted', 'grateful', 'thankful'
    ]
};

// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Log activity
const logActivity = (message) => {
    const { date } = getToday();
    const logFile = path.join(LOGS_DIR, `evening-checkin-${date}.log`);
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
};

// Check if evening session exists
const checkExistingSession = () => {
    const { date } = getToday();
    const journalFile = path.join(JOURNAL_DIR, `daily-${date}.md`);
    
    if (fs.existsSync(journalFile)) {
        const content = fs.readFileSync(journalFile, 'utf-8');
        return content.includes('## 🌙 Evening Check-in');
    }
    return false;
};

// Check if day plan exists
const checkDayPlan = () => {
    const { date } = getToday();
    const planFile = path.join(PLANNING_DIR, `day-${date}.json`);
    
    if (fs.existsSync(planFile)) {
        try {
            const planData = JSON.parse(fs.readFileSync(planFile, 'utf-8'));
            return planData;
        } catch (error) {
            logActivity(`Error reading day plan: ${error.message}`);
            return null;
        }
    }
    return null;
};

// Run day review integration
const runDayReview = async (dayPlan) => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Day Plan Performance Review');
    console.log('='.repeat(60));
    
    const reviewData = {
        timeBlocks: [],
        objectives: [],
        wellbeingMetrics: {},
        reflectionQuestions: {}
    };
    
    // Review time blocks if they exist
    if (dayPlan.timeBlocks && dayPlan.timeBlocks.length > 0) {
        console.log('\n⏰ Time Block Review:');
        for (const timeBlock of dayPlan.timeBlocks) {
            const completed = await question(`"${timeBlock.activity}" (${timeBlock.duration}min) - Completed effectively? (y/n): `);
            const blockData = {
                ...timeBlock,
                completed: completed.toLowerCase() === 'y'
            };
            
            if (completed.toLowerCase() === 'y') {
                const effectiveness = await question(`Effectiveness (1-10): `);
                blockData.effectiveness = parseInt(effectiveness) || 5;
            } else {
                blockData.effectiveness = 0;
            }
            
            reviewData.timeBlocks.push(blockData);
        }
    }
    
    // Review objectives if they exist
    if (dayPlan.objectives && dayPlan.objectives.length > 0) {
        console.log('\n🎯 Daily Objective Review:');
        for (const objective of dayPlan.objectives) {
            const completed = await question(`"${objective.text}" - Completed? (y/n): `);
            reviewData.objectives.push({
                ...objective,
                completed: completed.toLowerCase() === 'y'
            });
        }
    }
    
    // Performance metrics
    const completedBlocks = reviewData.timeBlocks.filter(tb => tb.completed).length;
    const completedObjectives = reviewData.objectives.filter(obj => obj.completed).length;
    const avgEffectiveness = reviewData.timeBlocks.length > 0 ? 
        reviewData.timeBlocks.reduce((sum, tb) => sum + (tb.effectiveness || 0), 0) / reviewData.timeBlocks.length : 0;
    
    console.log('\n📈 Day Plan Performance:');
    console.log(`Time Blocks: ${completedBlocks}/${reviewData.timeBlocks.length} completed`);
    console.log(`Objectives: ${completedObjectives}/${reviewData.objectives.length} completed`);
    if (avgEffectiveness > 0) {
        console.log(`Average Effectiveness: ${avgEffectiveness.toFixed(1)}/10`);
    }
    
    // Additional metrics
    const planFocus = await question('\n🎯 How well did you stick to the plan? (1-10): ');
    const planAdaptability = await question('🔄 How well did you adapt when things changed? (1-10): ');
    
    reviewData.wellbeingMetrics = {
        planAdherence: parseInt(planFocus) || 5,
        adaptability: parseInt(planAdaptability) || 5
    };
    
    return reviewData;
};

// Detect victories from responses
const detectVictories = (responses, dayReview = null) => {
    const victories = [];
    const allText = Object.values(responses).join(' ').toLowerCase();
    
    // Add day review data to victory detection if available
    if (dayReview) {
        const completedObjectives = dayReview.objectives.filter(obj => obj.completed);
        const effectiveBlocks = dayReview.timeBlocks.filter(tb => tb.effectiveness >= 7);
        
        if (completedObjectives.length > 0) {
            completedObjectives.forEach(obj => {
                victories.push({
                    category: 'discipline',
                    pattern: 'completed objective',
                    text: obj.text,
                    source: 'day-review'
                });
            });
        }
        
        if (effectiveBlocks.length > 0) {
            victories.push({
                category: 'discipline', 
                pattern: 'effective time management',
                text: `${effectiveBlocks.length} highly effective time blocks`,
                source: 'day-review'
            });
        }
    }
    
    // Text-based victory detection from responses
    for (const [category, patterns] of Object.entries(VICTORY_PATTERNS)) {
        for (const pattern of patterns) {
            if (allText.includes(pattern)) {
                victories.push({
                    category,
                    pattern,
                    text: responses.accomplishments || responses.gratitude || responses.reflections,
                    source: 'evening-checkin'
                });
                break;
            }
        }
    }
    
    return victories;
};

// Save victories silently
const saveVictories = (victories, responses) => {
    if (victories.length === 0) return;
    
    const { date, month } = getToday();
    const victoryFile = path.join(VICTORIES_DIR, `victories-${month}.md`);
    
    // Read existing content to get current structure
    let existingContent = '';
    if (fs.existsSync(victoryFile)) {
        existingContent = fs.readFileSync(victoryFile, 'utf-8');
    }
    
    const dateHeader = `## ${new Date(date + 'T00:00:00').toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    })}`;
    
    let entries = '';
    victories.forEach(victory => {
        const sourceNote = victory.source === 'day-review' ? '[Day Review]' : '[Evening Check-in]';
        entries += `
### Victory: ${victory.text.slice(0, 50)}...
**Date**: ${date}
**Category**: ${victory.category}
**Description**: ${sourceNote} ${victory.text}
**Why This Matters**: Detected during evening reflection and performance review
**Replication Notes**: Pattern detected: "${victory.pattern}"
**Mood Impact**: +2 (evening momentum)
`;
    });
    
    // Append to existing file or create new one
    if (existingContent.includes(dateHeader)) {
        // Add to existing date section
        fs.appendFileSync(victoryFile, entries);
    } else {
        // Add new date section
        const dateSection = `\n${dateHeader}\n${entries}`;
        if (fs.existsSync(victoryFile)) {
            fs.appendFileSync(victoryFile, dateSection);
        } else {
            const header = `---
date: ${month}
type: victories
tags: [wins, achievements, patterns, anti-mimic]
status: ongoing
privacy: private
---

# Victory Log - ${new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
${dateSection}`;
            fs.writeFileSync(victoryFile, header);
        }
    }
    
    logActivity(`Detected and saved ${victories.length} victories`);
};

// Save journal entry
const saveJournalEntry = (responses, dayReview = null) => {
    const { date, time, fullDate } = getToday();
    const journalFile = path.join(JOURNAL_DIR, `daily-${date}.md`);
    
    const eveningSection = `
## 🌙 Evening Check-in (${time})
**Overall Day Feeling:** ${responses.overallFeeling}

**Today's Accomplishments:**
1. ${responses.accomplishment1}
2. ${responses.accomplishment2} 
3. ${responses.accomplishment3}

**Tomorrow's Priority:** ${responses.tomorrowPriority}
**End Energy Level:** ${responses.endEnergy}
**Challenges/Blockers:** ${responses.challenges}
**Gratitude:** ${responses.gratitude}
**Reflections:** ${responses.reflections}${dayReview ? `

## 📊 Day Plan Review
**Time Blocks Completed:** ${dayReview.timeBlocks.filter(tb => tb.completed).length}/${dayReview.timeBlocks.length}
**Objectives Completed:** ${dayReview.objectives.filter(obj => obj.completed).length}/${dayReview.objectives.length}
**Plan Adherence:** ${dayReview.wellbeingMetrics.planAdherence}/10
**Adaptability:** ${dayReview.wellbeingMetrics.adaptability}/10

### Time Block Performance:
${dayReview.timeBlocks.map(tb => 
    `- ${tb.activity} (${tb.duration}min): ${tb.completed ? '✅' : '❌'} ${tb.effectiveness ? `- ${tb.effectiveness}/10` : ''}`
).join('\n')}

### Objective Completion:
${dayReview.objectives.map(obj => 
    `- ${obj.text}: ${obj.completed ? '✅ Complete' : '❌ Incomplete'}`
).join('\n')}` : ''}
`;

    if (fs.existsSync(journalFile)) {
        // Update existing file
        let content = fs.readFileSync(journalFile, 'utf-8');
        
        // Update sessions in frontmatter
        if (content.includes('sessions:')) {
            content = content.replace(/sessions: \[([^\]]*)\]/, (match, sessions) => {
                const sessionList = sessions ? sessions.split(',').map(s => s.trim()) : [];
                if (!sessionList.includes('evening')) {
                    sessionList.push('evening');
                }
                return `sessions: [${sessionList.join(', ')}]`;
            });
        } else {
            // Add sessions to frontmatter
            content = content.replace(/privacy: private\n/, 'privacy: private\nsessions: [evening]\n');
        }
        
        // Update status to complete
        content = content.replace(/status: \w+/, 'status: complete');
        
        // Append evening section
        content += eveningSection;
        
        fs.writeFileSync(journalFile, content);
    } else {
        // Create new file (evening-only case)
        const content = `---
date: ${date}
type: daily
sessions: [evening]
status: complete
privacy: private
---

# Daily Check-in - ${fullDate}
${eveningSection}`;
        
        fs.writeFileSync(journalFile, content);
    }
    
    logActivity(`Evening journal entry saved to ${journalFile}`);
};

// Main check-in flow
const runEveningCheckIn = async () => {
    const { fullDate, time } = getToday();
    
    console.log('\n' + '='.repeat(60));
    console.log(`🌙 Evening Check-in for ${fullDate}`);
    console.log(`Current time: ${time}`);
    console.log('='.repeat(60) + '\n');
    
    // Check for existing session
    if (checkExistingSession()) {
        const update = await question('Evening check-in already exists. Update it? (y/n): ');
        if (update.toLowerCase() !== 'y') {
            console.log('Check-in cancelled.');
            rl.close();
            return;
        }
    }
    
    console.log('Good evening! Let\'s reflect on your day and plan for tomorrow.\n');
    
    // Check for day plan
    const dayPlan = checkDayPlan();
    let dayReview = null;
    
    if (dayPlan) {
        console.log('📅 I found a day plan for today!');
        const includeDayReview = await question('Would you like to include a day plan performance review? (y/n): ');
        if (includeDayReview.toLowerCase() === 'y') {
            dayReview = await runDayReview(dayPlan);
        }
        console.log('\n' + '='.repeat(60));
        console.log('Now for your evening reflection...');
        console.log('='.repeat(60) + '\n');
    }
    
    // Collect evening responses
    const responses = {
        overallFeeling: await question('1. How are you feeling about today overall? (1-10 + description): '),
        accomplishment1: await question('2. What are 3 things you accomplished today?\n   Accomplishment #1: '),
        accomplishment2: await question('   Accomplishment #2: '),
        accomplishment3: await question('   Accomplishment #3: '),
        tomorrowPriority: await question('3. What\'s your #1 priority for tomorrow? '),
        endEnergy: await question('4. End-of-day energy level (1-10): '),
        challenges: await question('5. Any challenges or blockers you faced? '),
        gratitude: await question('6. What are you grateful for today? '),
        reflections: await question('7. Any other thoughts or reflections? ')
    };
    
    // Save journal entry
    saveJournalEntry(responses, dayReview);
    
    // Detect and save victories (silent)
    const victories = detectVictories(responses, dayReview);
    if (victories.length > 0) {
        saveVictories(victories, responses);
    }
    
    // Closing encouragement
    console.log('\n' + '='.repeat(60));
    console.log('✨ Evening check-in complete!');
    if (dayReview) {
        const completedBlocks = dayReview.timeBlocks.filter(tb => tb.completed).length;
        const completedObjectives = dayReview.objectives.filter(obj => obj.completed).length;
        console.log(`📊 Day Plan Summary: ${completedBlocks}/${dayReview.timeBlocks.length} blocks, ${completedObjectives}/${dayReview.objectives.length} objectives`);
    }
    console.log('Your reflection is captured. Remember:');
    console.log('- Progress over perfection');
    console.log('- Tomorrow is a fresh start');
    console.log('- Small victories compound');
    if (victories.length > 0) {
        console.log(`✓ Captured ${victories.length} victories today`);
    }
    console.log('\nRest well! Tomorrow brings new possibilities.');
    console.log('='.repeat(60) + '\n');
    
    logActivity('Evening check-in completed successfully');
    rl.close();
};

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Error during evening check-in:', error);
    logActivity(`Error: ${error.message}`);
    rl.close();
    process.exit(1);
});

// Run the check-in
runEveningCheckIn().catch(error => {
    console.error('Failed to run evening check-in:', error);
    logActivity(`Fatal error: ${error.message}`);
    rl.close();
    process.exit(1);
});