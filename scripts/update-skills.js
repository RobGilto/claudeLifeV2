#!/usr/bin/env node

/**
 * Update Skills Matrix Script
 * Purpose: Weekly skill assessment using BRP-inspired mechanics
 * Usage: node scripts/update-skills.js [--auto]
 * Dependencies: fs, path, child_process
 * 
 * RuneQuest-inspired skill progression system:
 * - Roll d100 for each practiced skill
 * - If roll > current skill, chance for improvement
 * - Improvement based on practice intensity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

// Configuration
const SKILL_MATRIX_FILE = path.join(__dirname, '..', 'skills', 'skill-matrix.json');
const SKILL_HISTORY_DIR = path.join(__dirname, '..', 'skills', 'skill-history');
const REVIEWS_DIR = path.join(__dirname, '..', 'skills', 'reviews');
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, `skill-update-${new Date().toISOString().split('T')[0]}.log`);

// Ensure directories exist
[SKILL_HISTORY_DIR, REVIEWS_DIR, LOG_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Logging function
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(LOG_FILE, logMessage);
}

// BRP dice roll simulation
function rollD100() {
    return Math.floor(Math.random() * 100) + 1;
}

function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Calculate skill improvement based on BRP mechanics
function calculateImprovement(currentSkill, practiceHours, successfulUses = 0) {
    // Practice intensity determines improvement die
    let improvementDie = 0;
    if (practiceHours >= 20) {
        improvementDie = rollDice(6); // d6 for intense practice
    } else if (practiceHours >= 10) {
        improvementDie = rollDice(4); // d4 for regular practice
    } else if (practiceHours >= 5) {
        improvementDie = rollDice(3); // d3 for moderate practice
    } else if (practiceHours > 0) {
        improvementDie = 1; // +1 for any practice
    }
    
    // Bonus for successful project completions
    const successBonus = Math.min(successfulUses * 0.5, 3);
    
    // Harder to improve at higher levels (RuneQuest mechanic)
    const difficultyModifier = (100 - currentSkill) / 100;
    
    const totalImprovement = Math.round((improvementDie + successBonus) * difficultyModifier);
    
    return {
        roll: rollD100(),
        improvement: totalImprovement,
        success: false // Will be set based on experience check
    };
}

// Analyze git activity for skill evidence
async function analyzeGitActivity() {
    try {
        // Get commits from the last week
        const { stdout } = await execAsync('git log --since="1 week ago" --pretty=format:"%h|%s|%an|%ad" --date=short');
        const commits = stdout.split('\n').filter(line => line.trim());
        
        const activity = {
            totalCommits: commits.length,
            pythonCommits: 0,
            jsCommits: 0,
            configCommits: 0,
            dailyCheckins: 0
        };
        
        // Analyze commit messages and files
        for (const commit of commits) {
            const [hash, message] = commit.split('|');
            
            if (message.toLowerCase().includes('python') || message.includes('.py')) {
                activity.pythonCommits++;
            }
            if (message.toLowerCase().includes('javascript') || message.includes('.js')) {
                activity.jsCommits++;
            }
            if (message.includes('[DAILY]')) {
                activity.dailyCheckins++;
            }
            
            // Get files changed in this commit
            try {
                const { stdout: files } = await execAsync(`git show --name-only --format="" ${hash}`);
                const fileList = files.split('\n').filter(f => f.trim());
                
                for (const file of fileList) {
                    if (file.endsWith('.py')) activity.pythonCommits++;
                    if (file.endsWith('.js') || file.endsWith('.ts')) activity.jsCommits++;
                    if (file.includes('config') || file.endsWith('.json')) activity.configCommits++;
                }
            } catch (err) {
                log(`Warning: Could not analyze files for commit ${hash}`);
            }
        }
        
        return activity;
    } catch (error) {
        log(`Error analyzing git activity: ${error.message}`);
        return null;
    }
}

// Check for victories that demonstrate skills
function analyzeVictories() {
    const victoriesFile = path.join(__dirname, '..', 'victories', `victories-${new Date().toISOString().slice(0, 7)}.md`);
    
    if (!fs.existsSync(victoriesFile)) {
        return { technical: 0, learning: 0 };
    }
    
    const content = fs.readFileSync(victoriesFile, 'utf8');
    const technicalVictories = (content.match(/category: technical/gi) || []).length;
    const learningVictories = (content.match(/category: learning/gi) || []).length;
    
    return { technical: technicalVictories, learning: learningVictories };
}

// Main skill update function
async function updateSkills(autoMode = false) {
    log('=== Starting Weekly Skill Update ===');
    
    // Load current skill matrix
    if (!fs.existsSync(SKILL_MATRIX_FILE)) {
        log('ERROR: skill-matrix.json not found');
        process.exit(1);
    }
    
    const skillMatrix = JSON.parse(fs.readFileSync(SKILL_MATRIX_FILE, 'utf8'));
    
    // Create backup before updating
    const weekNumber = getWeekNumber(new Date());
    const backupFile = path.join(SKILL_HISTORY_DIR, `${new Date().getFullYear()}-W${weekNumber}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(skillMatrix, null, 2));
    log(`Backup created: ${backupFile}`);
    
    // Analyze evidence
    const gitActivity = await analyzeGitActivity();
    const victories = analyzeVictories();
    
    log(`Git Activity: ${gitActivity ? gitActivity.totalCommits + ' commits' : 'unavailable'}`);
    log(`Victories: ${victories.technical} technical, ${victories.learning} learning`);
    
    // Update skills based on evidence and BRP mechanics
    const updates = [];
    const experienceChecks = [];
    
    for (const [categoryName, category] of Object.entries(skillMatrix.categories)) {
        for (const [skillName, skill] of Object.entries(category.skills)) {
            const currentLevel = skill.current;
            let practiceHours = skill.weeklyPracticeHours || 0;
            
            // Adjust practice hours based on evidence
            if (gitActivity) {
                if (skillName === 'python' && gitActivity.pythonCommits > 0) {
                    practiceHours = Math.max(practiceHours, gitActivity.pythonCommits * 2);
                }
                if ((skillName === 'javascript' || skillName === 'typescript') && gitActivity.jsCommits > 0) {
                    practiceHours = Math.max(practiceHours, gitActivity.jsCommits * 2);
                }
                if (skillName === 'git_github') {
                    practiceHours = Math.max(practiceHours, gitActivity.totalCommits);
                }
            }
            
            // Only check skills that were practiced
            if (practiceHours > 0) {
                const successfulUses = skillName.includes('technical') ? victories.technical : 0;
                const check = calculateImprovement(currentLevel, practiceHours, successfulUses);
                
                // BRP Experience Check: roll > current skill = chance to improve
                if (check.roll > currentLevel) {
                    check.success = true;
                    skill.current = Math.min(100, currentLevel + check.improvement);
                    
                    experienceChecks.push({
                        skill: `${categoryName}.${skillName}`,
                        previous: currentLevel,
                        current: skill.current,
                        roll: check.roll,
                        improvement: check.improvement,
                        practiceHours
                    });
                }
                
                // Update last practiced date
                skill.lastPracticed = new Date().toISOString().split('T')[0];
            } else {
                // Skill decay for unused skills (1% per month)
                const lastPracticed = new Date(skill.lastPracticed || '2024-01-01');
                const weeksSinceUse = Math.floor((Date.now() - lastPracticed) / (7 * 24 * 60 * 60 * 1000));
                
                if (weeksSinceUse > 4 && skill.current > 5) {
                    skill.current = Math.max(5, skill.current - 1);
                    log(`Skill decay: ${skillName} decreased to ${skill.current}%`);
                }
            }
        }
    }
    
    // Update metadata
    skillMatrix.metadata.lastUpdated = new Date().toISOString().split('T')[0];
    skillMatrix.metadata.nextReview = getNextMonday().toISOString().split('T')[0];
    
    // Add to experience log
    if (!skillMatrix.experience_log) {
        skillMatrix.experience_log = [];
    }
    
    skillMatrix.experience_log.push({
        date: new Date().toISOString(),
        week: `${new Date().getFullYear()}-W${weekNumber}`,
        checks: experienceChecks,
        evidence: {
            gitCommits: gitActivity?.totalCommits || 0,
            victories: victories.technical + victories.learning
        }
    });
    
    // Keep only last 12 weeks of logs
    if (skillMatrix.experience_log.length > 12) {
        skillMatrix.experience_log = skillMatrix.experience_log.slice(-12);
    }
    
    // Save updated matrix
    fs.writeFileSync(SKILL_MATRIX_FILE, JSON.stringify(skillMatrix, null, 2));
    
    // Generate review report
    const report = generateReport(skillMatrix, experienceChecks, gitActivity, victories);
    const reportFile = path.join(REVIEWS_DIR, `${new Date().getFullYear()}-W${weekNumber}.md`);
    fs.writeFileSync(reportFile, report);
    
    log(`=== Skill Update Complete ===`);
    log(`Improvements: ${experienceChecks.length} skills improved`);
    log(`Report saved: ${reportFile}`);
    
    if (!autoMode) {
        console.log('\n' + report);
    }
    
    return { success: true, improvements: experienceChecks.length };
}

// Generate weekly report
function generateReport(matrix, checks, gitActivity, victories) {
    const week = getWeekNumber(new Date());
    const year = new Date().getFullYear();
    
    let report = `# Weekly Skill Review - ${year} Week ${week}\n\n`;
    report += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
    
    report += `## Evidence Summary\n\n`;
    if (gitActivity) {
        report += `- Git Commits: ${gitActivity.totalCommits}\n`;
        report += `- Daily Checkins: ${gitActivity.dailyCheckins}\n`;
        report += `- Python Activity: ${gitActivity.pythonCommits} commits\n`;
        report += `- JS/TS Activity: ${gitActivity.jsCommits} commits\n`;
    }
    report += `- Technical Victories: ${victories.technical}\n`;
    report += `- Learning Victories: ${victories.learning}\n\n`;
    
    report += `## Experience Checks (BRP System)\n\n`;
    if (checks.length > 0) {
        report += `| Skill | Roll | Previous | Current | Improvement | Practice Hours |\n`;
        report += `|-------|------|----------|---------|-------------|----------------|\n`;
        
        for (const check of checks) {
            report += `| ${check.skill} | ${check.roll} | ${check.previous}% | ${check.current}% | +${check.improvement} | ${check.practiceHours}h |\n`;
        }
        
        report += `\n*RuneQuest Note: Skills improved because roll > current skill level*\n`;
    } else {
        report += `No skills improved this week. Keep practicing!\n`;
    }
    
    report += `\n## Progress Toward 2026 Goals\n\n`;
    
    // Calculate category progress
    for (const [categoryName, category] of Object.entries(matrix.categories)) {
        const skills = Object.values(category.skills);
        const avgCurrent = Math.round(skills.reduce((sum, s) => sum + s.current, 0) / skills.length);
        const avgTarget = Math.round(skills.reduce((sum, s) => sum + s.target, 0) / skills.length);
        const progress = Math.round((avgCurrent / avgTarget) * 100);
        
        report += `### ${categoryName.replace(/_/g, ' ').toUpperCase()}\n`;
        report += `Average: ${avgCurrent}% / ${avgTarget}% (${progress}% of goal)\n\n`;
        
        // Show top 3 skills needing work
        const needsWork = skills
            .map(s => ({ ...s, gap: s.target - s.current }))
            .sort((a, b) => b.gap - a.gap)
            .slice(0, 3);
        
        if (needsWork[0].gap > 0) {
            report += `Focus areas:\n`;
            needsWork.forEach(skill => {
                const name = Object.entries(category.skills).find(([k, v]) => v === skill)?.[0];
                report += `- ${name}: ${skill.current}% → ${skill.target}% (gap: ${skill.gap}%)\n`;
            });
            report += `\n`;
        }
    }
    
    report += `## Next Week Recommendations\n\n`;
    report += `Based on your progress, focus on:\n`;
    report += `1. **Daily Python practice** - Read and write code for 30 minutes\n`;
    report += `2. **LLM experiments** - Try one new AI technique or tool\n`;
    report += `3. **Portfolio project** - Spend 2 hours on RuneQuest-themed AI project\n`;
    report += `4. **Learning efficiency** - Time-box sessions to 2-hour blocks\n`;
    
    report += `\n---\n`;
    report += `*"The path from Initiate to Rune Lord requires dedication and honest assessment"*\n`;
    
    return report;
}

// Helper functions
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getNextMonday() {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) + 7;
    return new Date(date.setDate(diff));
}

// Run the script
const isAuto = process.argv.includes('--auto');
updateSkills(isAuto).catch(error => {
    log(`ERROR: ${error.message}`);
    process.exit(1);
});