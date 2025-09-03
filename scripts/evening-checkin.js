#!/usr/bin/env node

/**
 * Evening Check-in Script
 * 
 * Interactive evening wrap-up checkpoint to review how the evening went (typically 6-8pm).
 * 
 * Usage: node scripts/evening-checkin.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

class EveningCheckin {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        this.currentDate = null;
        this.currentTime = null;
        this.journalFile = null;
        this.logFile = null;
        this.responses = {};
    }

    /**
     * Get current Sydney time and date
     */
    getSydneyTime() {
        try {
            const timeOutput = execSync('./scripts/sydney-time.sh checkin', { encoding: 'utf8' }).trim();
            const dateOutput = execSync('./scripts/sydney-time.sh date', { encoding: 'utf8' }).trim();
            
            // Parse: "September 04, 2025 - 18:30"
            const timeMatch = timeOutput.match(/(.+) - (.+)/);
            if (timeMatch) {
                this.currentTime = timeMatch[2];
            }
            
            this.currentDate = dateOutput;
            this.journalFile = `journal/daily/daily-${this.currentDate}.md`;
            this.logFile = `logs/evening-checkin-${this.currentDate}.log`;
            
            this.log(`Evening checkin started at ${timeOutput}`);
            
        } catch (error) {
            console.error('Error getting Sydney time:', error.message);
            process.exit(1);
        }
    }

    /**
     * Log activity
     */
    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp}: ${message}\n`;
        
        // Ensure logs directory exists
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        fs.appendFileSync(this.logFile, logMessage);
    }

    /**
     * Prompt for user input
     */
    question(prompt) {
        return new Promise((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    /**
     * Run the evening check-in process
     */
    async run() {
        try {
            console.log('🌆 Evening Check-in\n');
            
            this.getSydneyTime();
            
            // Get planning context
            const planFile = `planning/data/day-${this.currentDate}.json`;
            let planningContext = '';
            if (fs.existsSync(planFile)) {
                const planData = JSON.parse(fs.readFileSync(planFile, 'utf8'));
                planningContext = this.formatPlanningContext(planData);
            }
            
            console.log(`🌆 Evening Check-in for ${this.currentDate} - ${this.currentTime}\n`);
            console.log('Good evening! Let\'s review how your evening went:\n');
            
            if (planningContext) {
                console.log(planningContext);
            }
            
            // Ask evening questions
            this.responses.energy = await this.question('1. Current energy level (1-10 + how it compares to earlier): ');
            this.responses.satisfaction = await this.question('2. How did your evening go overall? (1-10 satisfaction rating): ');
            this.responses.completed = await this.question('3. Which time blocks/objectives did you complete? (reference evening plan): ');
            this.responses.workedWell = await this.question('4. What worked well this evening? (momentum, focus, energy management): ');
            this.responses.challenges = await this.question('5. Any challenges or obstacles you faced?: ');
            this.responses.differently = await this.question('6. What would you do differently this evening?: ');
            this.responses.wins = await this.question('7. Any breakthroughs or wins worth celebrating? (however small): ');
            this.responses.tomorrow = await this.question('8. How are you feeling about tomorrow\'s priorities?: ');
            
            // Save to journal
            await this.saveToJournal();
            
            // Victory detection
            await this.detectVictories();
            
            console.log('\n✨ Evening check-in complete!');
            console.log('Great work this evening! Looking forward to your end-of-day reflection.');
            
        } catch (error) {
            console.error('Error during evening checkin:', error.message);
            this.log(`Error: ${error.message}`);
        } finally {
            this.rl.close();
        }
    }

    /**
     * Format planning context
     */
    formatPlanningContext(planData) {
        let context = '📅 Today\'s Evening Time Blocks (Review):\n';
        
        if (planData.timeBlocks) {
            const eveningBlocks = planData.timeBlocks.filter(block => {
                const startHour = parseInt(block.start.split(':')[0]);
                return startHour >= 18; // 6 PM onwards
            });
            
            if (eveningBlocks.length > 0) {
                eveningBlocks.forEach(block => {
                    context += `- ${block.start}-${block.end}: ${block.activity}\n`;
                });
            } else {
                context += '- No specific evening time blocks found\n';
            }
        }
        
        return context + '\n';
    }

    /**
     * Save responses to journal
     */
    async saveToJournal() {
        try {
            // Ensure directory exists
            const journalDir = path.dirname(this.journalFile);
            if (!fs.existsSync(journalDir)) {
                fs.mkdirSync(journalDir, { recursive: true });
            }

            let content = '';
            let sessions = ['evening'];
            
            // Check if file already exists
            if (fs.existsSync(this.journalFile)) {
                content = fs.readFileSync(this.journalFile, 'utf8');
                
                // Update existing file - extract sessions from frontmatter
                const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
                if (frontmatterMatch) {
                    const frontmatter = frontmatterMatch[1];
                    const sessionsMatch = frontmatter.match(/sessions: \[(.*?)\]/);
                    if (sessionsMatch) {
                        const existingSessions = sessionsMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
                        sessions = [...existingSessions, 'evening'].filter((s, i, arr) => arr.indexOf(s) === i);
                    }
                    
                    // Update sessions in frontmatter
                    content = content.replace(/sessions: \[.*?\]/, `sessions: [${sessions.map(s => `'${s}'`).join(', ')}]`);
                    content = content.replace(/status: ongoing/, 'status: ongoing');
                }
                
                // Append evening section
                content += `\n## 🌆 Evening Check-in (${this.currentTime})\n`;
            } else {
                // Create new file
                content = `---
date: ${this.currentDate}
type: daily
sessions: ['evening']
status: ongoing
privacy: private
---

# Daily Journal - ${this.currentDate}

## 🌆 Evening Check-in (${this.currentTime})
`;
            }
            
            // Add evening responses
            content += `**Current Energy:** ${this.responses.energy}
**Evening Satisfaction:** ${this.responses.satisfaction} (1-10 rating)
**Completed Time Blocks/Objectives:** ${this.responses.completed}
**What Worked Well:** ${this.responses.workedWell}
**Challenges Faced:** ${this.responses.challenges}
**Would Do Differently:** ${this.responses.differently}
**Wins/Breakthroughs:** ${this.responses.wins}
**Tomorrow Outlook:** ${this.responses.tomorrow}

**📅 Evening Plan Review:**
- Review completed based on responses above
- TaskWarrior tasks: [tracked separately]
`;
            
            fs.writeFileSync(this.journalFile, content);
            this.log(`Journal updated: ${this.journalFile}`);
            
        } catch (error) {
            console.error('Error saving to journal:', error.message);
            this.log(`Error saving journal: ${error.message}`);
        }
    }

    /**
     * Detect and log victories
     */
    async detectVictories() {
        try {
            const victoryPatterns = [
                // Technical victories
                /figured out|built|solved|learned|implemented|debugged/i,
                // Personal victories
                /boundary|self-care|help|support|decision/i,
                // Discipline victories
                /resisted|focused|completed|finished|achieved/i,
                // Self-awareness victories
                /realized|recognized|understood|insight|pattern/i
            ];

            const victories = [];
            const allText = Object.values(this.responses).join(' ');
            
            victoryPatterns.forEach((pattern, index) => {
                if (pattern.test(allText)) {
                    const types = ['Technical', 'Personal', 'Discipline', 'Self-awareness'];
                    victories.push({
                        type: types[index],
                        text: allText.match(pattern)[0],
                        context: 'Evening check-in'
                    });
                }
            });

            if (victories.length > 0) {
                const victoryFile = `victories/victories-${this.currentDate.slice(0, 7)}.md`;
                const victoryDir = path.dirname(victoryFile);
                
                if (!fs.existsSync(victoryDir)) {
                    fs.mkdirSync(victoryDir, { recursive: true });
                }
                
                let victoryContent = '';
                if (fs.existsSync(victoryFile)) {
                    victoryContent = fs.readFileSync(victoryFile, 'utf8');
                }
                
                victories.forEach(victory => {
                    victoryContent += `\n## ${this.currentDate} - Evening\n`;
                    victoryContent += `**Type:** ${victory.type}\n`;
                    victoryContent += `**Victory:** ${victory.text}\n`;
                    victoryContent += `**Context:** ${victory.context}\n`;
                });
                
                fs.writeFileSync(victoryFile, victoryContent);
                this.log(`Detected ${victories.length} victories`);
            }
            
        } catch (error) {
            console.error('Error in victory detection:', error.message);
            this.log(`Victory detection error: ${error.message}`);
        }
    }
}

// Run if called directly
if (require.main === module) {
    const checkin = new EveningCheckin();
    checkin.run().catch(error => {
        console.error('Fatal error:', error.message);
        process.exit(1);
    });
}

module.exports = EveningCheckin;