#!/usr/bin/env node

/**
 * Lessons Learned System
 * 
 * Purpose: Extract learning opportunities from mistakes and challenges
 * Usage: node scripts/lessons-learned.js [command]
 * Commands:
 *   - detect: Scan recent entries for mistake patterns
 *   - add: Add a manual lesson learned entry
 *   - review: Generate weekly lessons review
 *   - patterns: Analyze lesson patterns and prevention strategies
 * 
 * Dependencies: fs, path, readline
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const LESSONS_DIR = 'lessons';
const JOURNAL_DIRS = ['journal/daily', 'journal/brain', 'daily', 'weekly'];
const LOG_FILE = 'logs/lessons-learned.log';

// Ensure directories exist
function ensureDirectories() {
    const dirs = [LESSONS_DIR, 'logs'];
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// Logging function
function log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp}: ${message}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    console.log(`[${timestamp.split('T')[1].split('.')[0]}] ${message}`);
}

// Mistake detection keywords and patterns
const MISTAKE_PATTERNS = {
    technical: [
        'error', 'bug', 'broke', 'failed', 'crash', 'wrong approach',
        'should have used', 'realized too late', 'debugging', 'syntax error',
        'merge conflict', 'deployment failed', 'test failed'
    ],
    process: [
        'ran out of time', 'poor planning', 'distracted', 'procrastinated',
        'should have prioritized', 'scope creep', 'overwhelmed',
        'missed deadline', 'underestimated', 'forgot to'
    ],
    personal: [
        'energy crash', 'hyperfocus', 'rabbit hole', 'burnout',
        'anxiety', 'impostor syndrome', 'perfectionism paralysis',
        'emotional regulation', 'focus issues', 'ADD struggle'
    ],
    strategic: [
        'wrong direction', 'misaligned goals', 'skill gap', 'market mismatch',
        'opportunity cost', 'resource allocation', 'priority confusion',
        'career pivot', 'learning plateau'
    ]
};

// Scan files for mistake patterns
function detectMistakes(daysBack = 7) {
    const mistakes = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    JOURNAL_DIRS.forEach(dir => {
        if (!fs.existsSync(dir)) return;
        
        const files = fs.readdirSync(dir)
            .filter(file => file.endsWith('.md'))
            .filter(file => {
                const match = file.match(/(\d{4}-\d{2}-\d{2})/);
                if (!match) return false;
                const fileDate = new Date(match[1]);
                return fileDate >= cutoffDate;
            });
            
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
            
            Object.entries(MISTAKE_PATTERNS).forEach(([category, patterns]) => {
                patterns.forEach(pattern => {
                    if (content.includes(pattern)) {
                        const lines = content.split('\n');
                        const matchingLines = lines.filter(line => 
                            line.includes(pattern) && line.length > pattern.length + 10
                        );
                        
                        matchingLines.forEach(line => {
                            mistakes.push({
                                file: filePath,
                                category,
                                pattern,
                                context: line.trim(),
                                date: file.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || 'unknown'
                            });
                        });
                    }
                });
            });
        });
    });
    
    return mistakes;
}

// Generate lesson from mistake context
function generateLesson(mistake) {
    const templates = {
        technical: "When encountering '{pattern}', consider: What could prevent this technical issue in the future?",
        process: "The '{pattern}' situation suggests: What process improvement could avoid this workflow issue?", 
        personal: "Experiencing '{pattern}' indicates: What self-awareness or support system could help here?",
        strategic: "The '{pattern}' challenge reveals: What strategic adjustment could align better with goals?"
    };
    
    return {
        ...mistake,
        lesson_prompt: templates[mistake.category]?.replace('{pattern}', mistake.pattern) || 
                      "What can be learned from this situation?",
        timestamp: new Date().toISOString()
    };
}

// Interactive lesson addition
async function addLesson() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));
    
    try {
        console.log('\n=== Add Lesson Learned ===\n');
        
        const category = await question('Category (technical/process/personal/strategic): ');
        const situation = await question('What happened? (brief context): ');
        const lesson = await question('What did you learn?: ');
        const prevention = await question('How could this be prevented/improved?: ');
        
        const lessonEntry = {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toISOString().split('T')[1].split('.')[0],
            category: category.toLowerCase(),
            situation,
            lesson,
            prevention,
            source: 'manual',
            timestamp: new Date().toISOString()
        };
        
        // Save to monthly lessons file
        const monthFile = `lessons-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}.md`;
        const filePath = path.join(LESSONS_DIR, monthFile);
        
        const entry = `
## ${lessonEntry.date} - ${lessonEntry.category.charAt(0).toUpperCase() + lessonEntry.category.slice(1)}

**Situation:** ${lessonEntry.situation}

**Lesson:** ${lessonEntry.lesson}

**Prevention Strategy:** ${lessonEntry.prevention}

*Source: Manual entry - ${lessonEntry.date} ${lessonEntry.time}*

---
`;
        
        if (fs.existsSync(filePath)) {
            fs.appendFileSync(filePath, entry);
        } else {
            const header = `---
date: ${lessonEntry.date}
type: lessons
status: ongoing
privacy: private
---

# Lessons Learned - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}

${entry}`;
            fs.writeFileSync(filePath, header);
        }
        
        log(`Added lesson learned: ${lessonEntry.category} - ${lessonEntry.situation}`);
        console.log(`\n✅ Lesson saved to ${filePath}`);
        
    } finally {
        rl.close();
    }
}

// Generate weekly lessons review
function generateReview() {
    const mistakes = detectMistakes(7);
    const date = new Date().toISOString().split('T')[0];
    const weekNumber = Math.ceil((new Date().getDate()) / 7);
    
    if (mistakes.length === 0) {
        console.log('No mistake patterns detected in recent entries.');
        return;
    }
    
    // Group by category
    const categorized = mistakes.reduce((acc, mistake) => {
        if (!acc[mistake.category]) acc[mistake.category] = [];
        acc[mistake.category].push(mistake);
        return acc;
    }, {});
    
    let reviewContent = `---
date: ${date}
type: lessons-review
status: draft
privacy: private
week: ${weekNumber}
---

# Weekly Lessons Review - Week ${weekNumber}

*Generated from ${mistakes.length} detected learning opportunities*

`;

    Object.entries(categorized).forEach(([category, items]) => {
        reviewContent += `\n## ${category.charAt(0).toUpperCase() + category.slice(1)} Lessons (${items.length})\n\n`;
        
        items.slice(0, 3).forEach((item, index) => {
            reviewContent += `### ${index + 1}. Pattern: "${item.pattern}"\n`;
            reviewContent += `**Context:** ${item.context}\n\n`;
            reviewContent += `**Reflection Questions:**\n`;
            reviewContent += `- ${generateLesson(item).lesson_prompt}\n`;
            reviewContent += `- What specific action could prevent this next time?\n`;
            reviewContent += `- How does this connect to larger patterns?\n\n`;
        });
    });
    
    reviewContent += `\n## Summary Insights\n\n`;
    reviewContent += `- **Most common category:** ${Object.entries(categorized).sort((a,b) => b[1].length - a[1].length)[0][0]}\n`;
    reviewContent += `- **Key themes:** [To be filled during review]\n`;
    reviewContent += `- **Action items:** [To be filled during review]\n\n`;
    reviewContent += `*Auto-generated: ${new Date().toISOString()}*\n`;
    
    const reviewFile = path.join(LESSONS_DIR, `lesson-review-${date}.md`);
    fs.writeFileSync(reviewFile, reviewContent);
    
    log(`Generated lessons review: ${mistakes.length} learning opportunities detected`);
    console.log(`\n📝 Review saved to ${reviewFile}`);
    console.log(`\nTop categories:`);
    Object.entries(categorized)
        .sort((a,b) => b[1].length - a[1].length)
        .slice(0, 3)
        .forEach(([cat, items]) => console.log(`  - ${cat}: ${items.length} opportunities`));
}

// Analyze patterns across lessons
function analyzePatterns() {
    const lessonFiles = fs.readdirSync(LESSONS_DIR)
        .filter(file => file.startsWith('lessons-') && file.endsWith('.md'))
        .map(file => path.join(LESSONS_DIR, file));
    
    if (lessonFiles.length === 0) {
        console.log('No lesson files found for pattern analysis.');
        return;
    }
    
    const patterns = {
        technical: [],
        process: [],
        personal: [],
        strategic: []
    };
    
    lessonFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        // Simple pattern extraction - could be enhanced with better parsing
        Object.keys(patterns).forEach(category => {
            const regex = new RegExp(`## .*${category}.*\\n([\\s\\S]*?)(?=##|$)`, 'gi');
            const matches = content.match(regex);
            if (matches) {
                patterns[category].push(...matches);
            }
        });
    });
    
    const patternsFile = path.join(LESSONS_DIR, 'lesson-patterns.md');
    let patternsContent = `---
date: ${new Date().toISOString().split('T')[0]}
type: lesson-patterns
status: ongoing
privacy: private
---

# Lesson Patterns Analysis

*Updated: ${new Date().toISOString().split('T')[0]}*

`;

    Object.entries(patterns).forEach(([category, items]) => {
        patternsContent += `\n## ${category.charAt(0).toUpperCase() + category.slice(1)} Patterns\n\n`;
        patternsContent += `**Frequency:** ${items.length} occurrences\n\n`;
        patternsContent += `**Common Prevention Strategies:**\n`;
        patternsContent += `- [Pattern analysis needed]\n\n`;
    });
    
    patternsContent += `\n## Meta-Learning Insights\n\n`;
    patternsContent += `- **Most frequent category:** ${Object.entries(patterns).sort((a,b) => b[1].length - a[1].length)[0][0]}\n`;
    patternsContent += `- **Improvement trends:** [Analysis needed]\n`;
    patternsContent += `- **System gaps:** [Analysis needed]\n\n`;
    
    fs.writeFileSync(patternsFile, patternsContent);
    log('Updated lesson patterns analysis');
    console.log(`\n📊 Patterns analysis saved to ${patternsFile}`);
}

// Main command handler
function main() {
    ensureDirectories();
    
    const command = process.argv[2] || 'help';
    
    switch(command) {
        case 'detect':
            console.log('🔍 Scanning recent entries for learning opportunities...');
            const mistakes = detectMistakes(7);
            console.log(`Found ${mistakes.length} potential lessons`);
            mistakes.slice(0, 5).forEach(m => {
                console.log(`  - ${m.category}: "${m.pattern}" in ${m.file}`);
            });
            break;
            
        case 'add':
            addLesson();
            break;
            
        case 'review':
            console.log('📝 Generating weekly lessons review...');
            generateReview();
            break;
            
        case 'patterns':
            console.log('📊 Analyzing lesson patterns...');
            analyzePatterns();
            break;
            
        case 'help':
        default:
            console.log(`
Lessons Learned System

Commands:
  detect   - Scan recent entries for mistake patterns  
  add      - Add a manual lesson learned entry
  review   - Generate weekly lessons review
  patterns - Analyze patterns across all lessons

Examples:
  node scripts/lessons-learned.js detect
  node scripts/lessons-learned.js add
  node scripts/lessons-learned.js review
            `);
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { detectMistakes, generateLesson, analyzePatterns };