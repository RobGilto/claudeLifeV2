#!/usr/bin/env node

/**
 * Intelligent Command Recommender
 * 
 * Uses cached command data to provide intelligent, context-aware recommendations
 * based on time, day, strategic periods, conversation context, and user patterns.
 * 
 * Usage: 
 *   node scripts/intelligent-recommender.js [context]
 *   node scripts/intelligent-recommender.js --update
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class IntelligentRecommender {
    constructor() {
        this.cacheFile = './planning/data/command-cache.json';
        this.cache = null;
        this.currentTime = null;
        this.currentDate = null;
    }

    /**
     * Load command cache, rebuilding if necessary
     */
    async loadCache(forceUpdate = false) {
        // Check if cache exists and is current
        if (forceUpdate || !fs.existsSync(this.cacheFile) || this.needsCacheUpdate()) {
            console.log('🔄 Updating command cache...');
            try {
                execSync('node scripts/command-cache-builder.cjs build', { stdio: 'inherit' });
            } catch (error) {
                console.error('❌ Failed to build cache:', error.message);
                throw error;
            }
        }

        this.cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        console.log(`✅ Loaded ${this.cache.totalCommands} commands from cache`);
    }

    /**
     * Check if cache needs updating
     */
    needsCacheUpdate() {
        if (!fs.existsSync(this.cacheFile)) {
            console.log('📝 Cache file does not exist - rebuilding');
            return true;
        }
        
        try {
            const cache = JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
            const cacheTime = new Date(cache.buildTime);
            const commandsDir = './.claude/commands';
            
            if (!fs.existsSync(commandsDir)) {
                console.log('📁 Commands directory not found - rebuilding');
                return true;
            }
            
            // Get current command files
            const currentFiles = fs.readdirSync(commandsDir)
                .filter(f => f.endsWith('.md'))
                .map(f => path.basename(f, '.md'));
            
            // Get cached command names
            const cachedCommands = Object.keys(cache.commands || {});
            
            // Check for new commands
            const newCommands = currentFiles.filter(cmd => !cachedCommands.includes(cmd));
            if (newCommands.length > 0) {
                console.log(`🆕 New commands detected: ${newCommands.join(', ')} - rebuilding`);
                return true;
            }
            
            // Check for removed commands
            const removedCommands = cachedCommands.filter(cmd => !currentFiles.includes(cmd));
            if (removedCommands.length > 0) {
                console.log(`🗑️ Removed commands detected: ${removedCommands.join(', ')} - rebuilding`);
                return true;
            }
            
            // Check for modified files
            for (const file of currentFiles) {
                const filePath = path.join(commandsDir, file + '.md');
                if (fs.statSync(filePath).mtime > cacheTime) {
                    console.log(`📝 Modified command detected: ${file} - rebuilding`);
                    return true;
                }
            }
            
            // Check if total count changed (safety check)
            if (currentFiles.length !== cachedCommands.length) {
                console.log(`🔢 Command count mismatch (current: ${currentFiles.length}, cached: ${cachedCommands.length}) - rebuilding`);
                return true;
            }
            
            return false;
        } catch (error) {
            console.log(`❌ Error reading cache: ${error.message} - rebuilding`);
            return true;
        }
    }

    /**
     * Get current time context
     */
    async getTimeContext() {
        try {
            // Use Sydney time scripts
            const timeOutput = execSync('./scripts/sydney-time.sh checkin', { encoding: 'utf8' }).trim();
            const dateOutput = execSync('./scripts/sydney-time.sh date', { encoding: 'utf8' }).trim();
            
            // Parse time: "September 03, 2025 - 07:45"
            const timeMatch = timeOutput.match(/(\w+ \d+, \d+) - (\d+):(\d+)/);
            if (!timeMatch) {
                throw new Error('Failed to parse time output');
            }
            
            const [, dateStr, hours, minutes] = timeMatch;
            const hour = parseInt(hours);
            const minute = parseInt(minutes);
            
            // Get day of week
            const dayOfWeek = execSync(`date -d "${dateOutput}" +%A`, { encoding: 'utf8' }).trim().toLowerCase();
            
            return {
                dateString: dateStr,
                date: dateOutput,
                time: `${hours}:${minutes}`,
                hour,
                minute,
                dayOfWeek,
                timeOfDay: this.categorizeTimeOfDay(hour),
                strategicPeriod: this.detectStrategicPeriod(dateOutput, dayOfWeek)
            };
        } catch (error) {
            console.error('❌ Error getting time context:', error.message);
            // Fallback to system time
            const now = new Date();
            return {
                dateString: now.toDateString(),
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().slice(0, 5),
                hour: now.getHours(),
                minute: now.getMinutes(),
                dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()],
                timeOfDay: this.categorizeTimeOfDay(now.getHours()),
                strategicPeriod: null
            };
        }
    }

    /**
     * Categorize time of day
     */
    categorizeTimeOfDay(hour) {
        if (hour >= 5 && hour < 9) return 'early-morning';
        if (hour >= 9 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 20) return 'evening';
        return 'night';
    }

    /**
     * Detect strategic planning periods
     */
    detectStrategicPeriod(dateStr, dayOfWeek) {
        const date = new Date(dateStr);
        const month = date.getMonth() + 1; // 0-indexed
        const day = date.getDate();
        const year = date.getFullYear();
        
        const periods = [];
        
        // Year-end planning (December 15-31)
        if (month === 12 && day >= 15) {
            periods.push('year-end');
        }
        
        // Quarter-end (last week of quarters)
        const isQuarterEnd = (
            (month === 3 && day >= 25) ||  // Q1
            (month === 6 && day >= 25) ||  // Q2
            (month === 9 && day >= 25) ||  // Q3
            (month === 12 && day >= 25)    // Q4
        );
        if (isQuarterEnd) {
            periods.push('quarter-end');
        }
        
        // Month-end (last 3 days)
        const daysInMonth = new Date(year, month, 0).getDate();
        if (day >= daysInMonth - 2) {
            periods.push('month-end');
        }
        
        // Week-end (Sunday)
        if (dayOfWeek === 'sunday') {
            periods.push('week-end');
        }
        
        return periods.length > 0 ? periods : null;
    }

    /**
     * Analyze current user context from files
     */
    async analyzeUserContext() {
        const context = {
            missingActivities: [],
            recentActivity: [],
            patterns: []
        };
        
        try {
            const timeCtx = await this.getTimeContext();
            const todayFile = `journal/daily/daily-${timeCtx.date}.md`;
            
            // Check for missing daily checkin
            if (!fs.existsSync(todayFile)) {
                // Only recommend afternoon-checkin if it's after 12:00 PM
                if (timeCtx.timeOfDay === 'afternoon' || timeCtx.timeOfDay === 'evening' || timeCtx.timeOfDay === 'night') {
                    context.missingActivities.push({
                        type: 'no-daily-checkin',
                        urgency: 'high',
                        recommendation: 'afternoon-checkin'
                    });
                } else {
                    // Before 12 PM, suggest they wait or plan first
                    context.missingActivities.push({
                        type: 'no-daily-plan',
                        urgency: 'medium',
                        recommendation: 'plan-day'
                    });
                }
            } else {
                // Analyze existing checkin
                const content = fs.readFileSync(todayFile, 'utf8');
                
                // Only recommend afternoon checkin if it's afternoon or later
                if (!content.includes('## Afternoon Check-in') && 
                    (timeCtx.timeOfDay === 'afternoon' || timeCtx.timeOfDay === 'evening' || timeCtx.timeOfDay === 'night')) {
                    context.missingActivities.push({
                        type: 'no-afternoon-checkin',
                        urgency: 'high',
                        recommendation: 'afternoon-checkin'
                    });
                }
                
                // Only recommend evening checkin during evening time
                if (!content.includes('## Evening Check-in') && timeCtx.timeOfDay === 'evening') {
                    context.missingActivities.push({
                        type: 'no-evening-checkin',
                        urgency: 'medium',
                        recommendation: 'evening-checkin'
                    });
                }
                
                // Only recommend end-of-day checkout during night time
                if (!content.includes('## End-of-Day Checkout') && timeCtx.timeOfDay === 'night') {
                    context.missingActivities.push({
                        type: 'no-end-of-day-checkout',
                        urgency: 'medium',
                        recommendation: 'end-of-day-checkout'
                    });
                }
            }
            
            // Check for missing daily plan
            const planFile = `planning/data/day-${timeCtx.date}.json`;
            if (!fs.existsSync(planFile)) {
                context.missingActivities.push({
                    type: 'no-daily-plan',
                    urgency: 'high',
                    recommendation: 'plan-day'
                });
            }
            
            // Check for boot.dev activity
            const bootdevFile = 'tracking/bootdev-progress.json';
            if (fs.existsSync(bootdevFile)) {
                const bootdev = JSON.parse(fs.readFileSync(bootdevFile, 'utf8'));
                const lastActivity = new Date(bootdev.lastPracticeDate);
                const daysSinceActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));
                
                if (daysSinceActivity > 1) {
                    context.missingActivities.push({
                        type: 'bootdev-gap',
                        urgency: 'medium',
                        recommendation: 'bootdev-done',
                        details: `${daysSinceActivity} days since last practice`
                    });
                }
            }
            
        } catch (error) {
            console.error('❌ Error analyzing user context:', error.message);
        }
        
        return context;
    }

    /**
     * Score command relevance based on current context
     */
    scoreCommand(command, timeCtx, userCtx, contextInput = '') {
        let score = command.priority || 50;
        
        // Time of day matching
        if (command.timingConditions.timeOfDay.includes(timeCtx.timeOfDay)) {
            score += 25;
        }
        
        // Day of week matching
        if (command.timingConditions.dayOfWeek.includes(timeCtx.dayOfWeek)) {
            score += 20;
        }
        
        // Strategic period matching
        if (timeCtx.strategicPeriod && command.timingConditions.strategicPeriods.some(p => timeCtx.strategicPeriod.includes(p))) {
            score += 30;
        }
        
        // Missing activity matching
        for (const missing of userCtx.missingActivities) {
            if (missing.recommendation === command.name) {
                score += missing.urgency === 'high' ? 40 : missing.urgency === 'medium' ? 25 : 15;
            }
        }
        
        // Context keyword matching
        if (contextInput) {
            const inputLower = contextInput.toLowerCase();
            for (const keyword of command.contextTriggers.keywords) {
                if (inputLower.includes(keyword)) {
                    score += 15;
                }
            }
        }
        
        // Category-specific boosts
        const categoryBoosts = {
            'checkin': (timeCtx.timeOfDay === 'afternoon' || timeCtx.timeOfDay === 'evening' || timeCtx.timeOfDay === 'night') ? 20 : 0,
            'planning': timeCtx.timeOfDay === 'morning' ? 15 : 0,
            'execution': timeCtx.timeOfDay === 'morning' || timeCtx.timeOfDay === 'afternoon' ? 10 : 0,
            'review': timeCtx.timeOfDay === 'evening' ? 15 : 0,
            'reflection': timeCtx.timeOfDay === 'night' ? 10 : 0
        };
        
        score += categoryBoosts[command.category] || 0;
        
        return Math.min(score, 100);
    }

    /**
     * Generate star rating from score
     */
    getStarRating(score) {
        if (score >= 90) return '⭐⭐⭐⭐⭐';
        if (score >= 80) return '⭐⭐⭐⭐';
        if (score >= 70) return '⭐⭐⭐';
        if (score >= 60) return '⭐⭐';
        return '⭐';
    }

    /**
     * Generate explanation for why command is recommended
     */
    explainRecommendation(command, score, timeCtx, userCtx) {
        const reasons = [];
        
        // Time-based reasons
        if (command.timingConditions.timeOfDay.includes(timeCtx.timeOfDay)) {
            reasons.push(`Perfect ${timeCtx.timeOfDay} timing`);
        }
        
        if (command.timingConditions.dayOfWeek.includes(timeCtx.dayOfWeek)) {
            reasons.push(`Ideal ${timeCtx.dayOfWeek} activity`);
        }
        
        // Strategic period reasons
        if (timeCtx.strategicPeriod && command.timingConditions.strategicPeriods.some(p => timeCtx.strategicPeriod.includes(p))) {
            reasons.push(`Strategic ${timeCtx.strategicPeriod.join('/')} period`);
        }
        
        // Missing activity reasons
        const missingMatch = userCtx.missingActivities.find(m => m.recommendation === command.name);
        if (missingMatch) {
            reasons.push(`Addresses missing ${missingMatch.type.replace(/-/g, ' ')}`);
        }
        
        // Fallback to command description
        if (reasons.length === 0) {
            reasons.push(command.description.slice(0, 60) + '...');
        }
        
        return reasons.join('; ');
    }

    /**
     * Generate comprehensive recommendations
     */
    async generateRecommendations(contextInput = '', limit = 5) {
        if (!this.cache) {
            throw new Error('Cache not loaded. Call loadCache() first.');
        }
        
        const timeCtx = await this.getTimeContext();
        const userCtx = await this.analyzeUserContext();
        
        // Score all commands
        const scoredCommands = Object.values(this.cache.commands)
            .map(command => ({
                ...command,
                score: this.scoreCommand(command, timeCtx, userCtx, contextInput),
                stars: '',
                explanation: ''
            }))
            .sort((a, b) => b.score - a.score);
        
        // Add stars and explanations to top commands
        const topCommands = scoredCommands.slice(0, limit).map(cmd => ({
            ...cmd,
            stars: this.getStarRating(cmd.score),
            explanation: this.explainRecommendation(cmd, cmd.score, timeCtx, userCtx)
        }));
        
        return {
            timeContext: timeCtx,
            userContext: userCtx,
            recommendations: topCommands,
            metadata: {
                totalCommands: scoredCommands.length,
                averageScore: scoredCommands.reduce((sum, cmd) => sum + cmd.score, 0) / scoredCommands.length,
                contextInput: contextInput || 'none'
            }
        };
    }

    /**
     * Format recommendations as markdown
     */
    formatRecommendations(data) {
        const { timeContext, userContext, recommendations, metadata } = data;
        
        let output = `# 🎯 SMART COMMAND RECOMMENDATIONS\n`;
        output += `**Time:** ${timeContext.dateString} - ${timeContext.time} (Sydney)\n`;
        output += `**Context:** ${timeContext.timeOfDay}, ${timeContext.dayOfWeek}`;
        
        if (timeContext.strategicPeriod) {
            output += `, ${timeContext.strategicPeriod.join(' + ')} period`;
        }
        output += '\n\n';
        
        // Strategic period section
        if (timeContext.strategicPeriod) {
            output += `## 🎯 STRATEGIC PERIOD DETECTED\n`;
            output += `**${timeContext.strategicPeriod.map(p => p.toUpperCase()).join(' + ')}**\n\n`;
        }
        
        // Top recommendations
        output += `## 📌 TOP RECOMMENDATIONS:\n\n`;
        
        for (let i = 0; i < recommendations.length; i++) {
            const cmd = recommendations[i];
            output += `### ${i + 1}. \`/${cmd.name}\` ${cmd.stars}\n`;
            output += `**Why:** ${cmd.explanation}\n`;
            output += `**Category:** ${cmd.category} • **Score:** ${cmd.score}/100\n\n`;
        }
        
        // Missing activities section
        if (userContext.missingActivities.length > 0) {
            output += `## 🔔 MISSING ACTIVITIES:\n`;
            for (const missing of userContext.missingActivities) {
                output += `- **${missing.type.replace(/-/g, ' ').toUpperCase()}** → \`/${missing.recommendation}\``;
                if (missing.details) {
                    output += ` (${missing.details})`;
                }
                output += '\n';
            }
            output += '\n';
        }
        
        // Context-based suggestions
        output += `## 💡 CONTEXT-BASED SUGGESTIONS:\n`;
        output += `- **If feeling scattered** → \`/brain-dump\` - Capture racing thoughts\n`;
        output += `- **If need structure** → \`/executive-function\` - ADD-optimized support\n`;
        output += `- **If behind on goals** → \`/skill-status\` - Progress check\n`;
        output += `- **If low energy** → \`/victory-review\` - Motivation boost\n\n`;
        
        // Next strategic periods
        output += `## 📅 UPCOMING STRATEGIC PERIODS:\n`;
        const nextSunday = this.getNextSunday(timeContext.date);
        output += `- **${nextSunday}**: Week-end → \`/review-week\`, \`/plan-week\`\n`;
        
        const nextMonthEnd = this.getNextMonthEnd(timeContext.date);
        output += `- **${nextMonthEnd}**: Month-end → \`/review-month\`, \`/plan-month\`\n\n`;
        
        // Mission alignment
        output += `## ✨ MISSION ALIGNMENT CHECK:\n`;
        output += `Your top recommendations serve your mission **"To achieve the rank of Senior AI Software Engineer through relentless daily dedication"**:\n\n`;
        
        for (let i = 0; i < Math.min(3, recommendations.length); i++) {
            const cmd = recommendations[i];
            output += `- **/${cmd.name}** = ${this.getMissionAlignment(cmd.name)}\n`;
        }
        
        output += `\n**Days to mid-2026 goal:** ~${this.getDaysToGoal()} days remaining\n`;
        output += `**Recommended sequence:** ${recommendations.slice(0, 3).map(cmd => `\`/${cmd.name}\``).join(' → ')}\n`;
        
        return output;
    }

    /**
     * Get next Sunday date
     */
    getNextSunday(currentDate) {
        const date = new Date(currentDate);
        const daysUntilSunday = 7 - date.getDay();
        date.setDate(date.getDate() + (daysUntilSunday === 7 ? 7 : daysUntilSunday));
        return date.toISOString().split('T')[0];
    }

    /**
     * Get next month-end date
     */
    getNextMonthEnd(currentDate) {
        const date = new Date(currentDate);
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return nextMonth.toISOString().split('T')[0];
    }

    /**
     * Get mission alignment for command
     */
    getMissionAlignment(commandName) {
        const alignments = {
            'afternoon-checkin': 'Architecting your mind for daily excellence',
            'evening-checkin': 'Building momentum through evening assessment',
            'end-of-day-checkout': 'Reflecting on daily dedication and progress',
            'daily-brief': 'Staying informed on AI/tech job market trends',
            'plan-day': 'Structuring habits for maximum productivity',
            'skill-status': 'Tracking progress toward 2026 transformation',
            'bootdev-done': 'Building practical coding competency',
            'pomodoro': 'Deep work practice for complex problem solving',
            'github-skill-scan': 'Evidence-based skill development tracking'
        };
        
        return alignments[commandName] || 'Supporting your strategic AI engineering journey';
    }

    /**
     * Calculate days remaining to mid-2026 goal
     */
    getDaysToGoal() {
        const goal = new Date('2026-07-01'); // Mid-2026
        const now = new Date();
        return Math.ceil((goal - now) / (1000 * 60 * 60 * 24));
    }
}

// CLI interface
if (require.main === module) {
    const recommender = new IntelligentRecommender();
    
    async function main() {
        const args = process.argv.slice(2);
        const forceUpdate = args.includes('--update');
        const contextInput = args.filter(arg => !arg.startsWith('--')).join(' ');
        
        try {
            await recommender.loadCache(forceUpdate);
            const recommendations = await recommender.generateRecommendations(contextInput);
            const formatted = recommender.formatRecommendations(recommendations);
            
            console.log(formatted);
            
        } catch (error) {
            console.error('❌ Error generating recommendations:', error.message);
            process.exit(1);
        }
    }
    
    main();
}

module.exports = IntelligentRecommender;