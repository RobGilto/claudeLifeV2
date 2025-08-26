#!/usr/bin/env node

/**
 * Morning Check-in Script
 * Purpose: Early-day energy assessment, intention setting, and planning
 * Usage: node scripts/morning-checkin.js or /morning-checkin command
 * Dependencies: fs, path, readline
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const JOURNAL_DIR = path.join(__dirname, '..', 'journal', 'daily');
const VICTORIES_DIR = path.join(__dirname, '..', 'victories');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
[JOURNAL_DIR, VICTORIES_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Date utilities
const getToday = () => {
    const now = new Date();
    return {
        date: now.toISOString().split('T')[0],
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
        'debugged', 'fixed', 'created', 'automated', 'optimized'
    ],
    personal: [
        'resisted', 'chose', 'decided', 'prioritized', 'said no',
        'asked for help', 'reached out', 'connected', 'exercised'
    ],
    discipline: [
        'stayed focused', 'completed', 'finished', 'pushed through',
        'maintained', 'kept going', 'didn\'t give up', 'persisted'
    ],
    selfAwareness: [
        'realized', 'recognized', 'noticed', 'understood', 'saw pattern',
        'identified', 'acknowledged', 'accepted'
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
    const logFile = path.join(LOGS_DIR, `morning-checkin-${date}.log`);
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}\n`;
    fs.appendFileSync(logFile, logEntry);
};

// Check if morning session exists
const checkExistingSession = () => {
    const { date } = getToday();
    const journalFile = path.join(JOURNAL_DIR, `daily-${date}.md`);
    
    if (fs.existsSync(journalFile)) {
        const content = fs.readFileSync(journalFile, 'utf-8');
        return content.includes('## 🌄 Morning Check-in');
    }
    return false;
};

// Detect victories from responses
const detectVictories = (responses) => {
    const victories = [];
    const allText = Object.values(responses).join(' ').toLowerCase();
    
    for (const [category, patterns] of Object.entries(VICTORY_PATTERNS)) {
        for (const pattern of patterns) {
            if (allText.includes(pattern)) {
                victories.push({
                    category,
                    pattern,
                    text: responses.intentions || responses.commitment
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
    
    victories.forEach(victory => {
        const entry = `
### Victory: ${victory.text.slice(0, 50)}...
**Date**: ${date}
**Category**: ${victory.category}
**Description**: [Morning check-in] ${victory.text}
**Why This Matters**: Identified during morning intention setting
**Replication Notes**: Pattern detected: "${victory.pattern}"
**Mood Impact**: +1 (morning momentum)
`;
        
        if (fs.existsSync(victoryFile)) {
            fs.appendFileSync(victoryFile, entry);
        } else {
            const header = `# Victories - ${month}\n\n## Victory Log\n`;
            fs.writeFileSync(victoryFile, header + entry);
        }
    });
    
    logActivity(`Detected and saved ${victories.length} victories`);
};

// Save journal entry
const saveJournalEntry = (responses) => {
    const { date, time, fullDate } = getToday();
    const journalFile = path.join(JOURNAL_DIR, `daily-${date}.md`);
    
    const morningSection = `
## 🌄 Morning Check-in (${time})

**Wake Time:** ${responses.wakeTime}
**Energy Level:** ${responses.energy}
**Sleep Quality:** ${responses.sleep}
**Physical State:** ${responses.physical}

**Morning Intentions:**
${responses.intentions}

**Focus for Today:**
1. ${responses.focus1}
2. ${responses.focus2}
3. ${responses.focus3}

**Potential Challenges:** ${responses.challenges}
**Commitment:** ${responses.commitment}
`;

    if (fs.existsSync(journalFile)) {
        // Append to existing file
        let content = fs.readFileSync(journalFile, 'utf-8');
        
        // Update sessions in frontmatter
        if (content.includes('sessions:')) {
            content = content.replace(/sessions: \[([^\]]*)\]/, (match, sessions) => {
                const sessionList = sessions ? sessions.split(',').map(s => s.trim()) : [];
                if (!sessionList.includes('morning')) {
                    sessionList.unshift('morning');
                }
                return `sessions: [${sessionList.join(', ')}]`;
            });
        }
        
        // Add morning section after frontmatter
        const frontmatterEnd = content.indexOf('---', 4);
        if (frontmatterEnd !== -1) {
            const beforeContent = content.slice(0, frontmatterEnd + 3);
            const afterContent = content.slice(frontmatterEnd + 3);
            
            // Insert morning section right after Daily Journal heading
            const titleMatch = afterContent.match(/# Daily Journal[^\n]*/);
            if (titleMatch) {
                const insertPoint = afterContent.indexOf(titleMatch[0]) + titleMatch[0].length;
                content = beforeContent + 
                         afterContent.slice(0, insertPoint) + 
                         '\n' + morningSection + 
                         afterContent.slice(insertPoint);
            } else {
                content = content + morningSection;
            }
        }
        
        fs.writeFileSync(journalFile, content);
    } else {
        // Create new file
        const content = `---
date: ${date}
type: daily
sessions: [morning]
status: ongoing
privacy: private
---

# Daily Journal - ${fullDate}
${morningSection}`;
        
        fs.writeFileSync(journalFile, content);
    }
    
    logActivity(`Journal entry saved to ${journalFile}`);
};

// Main check-in flow
const runMorningCheckIn = async () => {
    const { fullDate, time } = getToday();
    
    console.log('\n' + '='.repeat(60));
    console.log(`🌄 Morning Check-in for ${fullDate}`);
    console.log(`Current time: ${time}`);
    console.log('='.repeat(60) + '\n');
    
    // Check for existing session
    if (checkExistingSession()) {
        const update = await question('Morning check-in already exists. Update it? (y/n): ');
        if (update.toLowerCase() !== 'y') {
            console.log('Check-in cancelled.');
            rl.close();
            return;
        }
    }
    
    console.log('Good morning! Let\'s set up your day for success.\n');
    
    // Collect responses
    const responses = {
        wakeTime: await question('1. What time did you wake up? '),
        energy: await question('2. Morning energy level (1-10 + description): '),
        sleep: await question('3. How was your sleep? (quality/hours): '),
        physical: await question('4. How does your body feel? '),
        intentions: await question('5. What are your intentions for today? '),
        focus1: await question('6. Top priority #1 for today: '),
        focus2: await question('   Top priority #2: '),
        focus3: await question('   Top priority #3: '),
        challenges: await question('7. What challenges might arise today? '),
        commitment: await question('8. What\'s one thing you commit to completing? ')
    };
    
    // Save journal entry
    saveJournalEntry(responses);
    
    // Detect and save victories (silent)
    const victories = detectVictories(responses);
    if (victories.length > 0) {
        saveVictories(victories, responses);
    }
    
    // Closing encouragement
    console.log('\n' + '='.repeat(60));
    console.log('✨ Morning check-in complete!');
    console.log('Your intentions are set. Remember:');
    console.log('- Energy follows action');
    console.log('- Progress over perfection');
    console.log('- Small wins compound');
    console.log('\nHave a productive morning! See you at noon for momentum check.');
    console.log('='.repeat(60) + '\n');
    
    logActivity('Morning check-in completed successfully');
    rl.close();
};

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Error during morning check-in:', error);
    logActivity(`Error: ${error.message}`);
    rl.close();
    process.exit(1);
});

// Run the check-in
runMorningCheckIn().catch(error => {
    console.error('Failed to run morning check-in:', error);
    logActivity(`Fatal error: ${error.message}`);
    rl.close();
    process.exit(1);
});