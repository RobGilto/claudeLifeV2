#!/usr/bin/env node

/**
 * Command Cache Builder
 * 
 * Scans all slash commands and builds a comprehensive cache with:
 * - Command metadata (name, description, categories)
 * - Timing conditions (time of day, day of week, strategic periods)
 * - Context triggers (keywords, situations, missing activities)
 * - Priority scoring and recommendation logic
 * 
 * Usage: node scripts/command-cache-builder.js
 * Output: planning/data/command-cache.json
 */

const fs = require('fs');
const path = require('path');

class CommandCacheBuilder {
    constructor() {
        this.commandsDir = './.claude/commands';
        this.cacheFile = './planning/data/command-cache.json';
        this.commands = new Map();
        
        // Ensure cache directory exists
        const cacheDir = path.dirname(this.cacheFile);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
    }

    /**
     * Parse command file to extract metadata and conditions
     */
    parseCommandFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileName = path.basename(filePath, '.md');
        
        const command = {
            name: fileName,
            filePath: filePath,
            description: '',
            category: this.categorizeCommand(fileName),
            timingConditions: this.extractTimingConditions(content),
            contextTriggers: this.extractContextTriggers(content),
            prerequisites: this.extractPrerequisites(content),
            outputs: this.extractOutputs(content),
            integrations: this.extractIntegrations(content),
            priority: this.calculateBasePriority(fileName, content),
            lastModified: fs.statSync(filePath).mtime
        };

        // Extract description from first # heading or first paragraph
        const descMatch = content.match(/^#\s+(.+)$/m);
        if (descMatch) {
            command.description = descMatch[1];
        } else {
            const firstPara = content.split('\n').find(line => line.trim() && !line.startsWith('#'));
            command.description = firstPara?.slice(0, 100) + '...' || 'No description';
        }

        return command;
    }

    /**
     * Categorize commands by their primary function
     */
    categorizeCommand(name) {
        const categories = {
            'planning': ['plan-day', 'plan-week', 'plan-month', 'plan-quarter', 'plan-year', 'plan-day-aware'],
            'review': ['review-day', 'review-week', 'review-month', 'review-quarter', 'review-year'],
            'checkin': ['morning-checkin', 'afternoon-checkin', 'evening-checkin', 'daily-checkin', 'weekly-checkin'],
            'skills': ['skill-status', 'skill-update', 'skill-review', 'skill-crafter', 'skill-investor', 'skill-salesman', 'skill-evidence', 'github-skill-scan'],
            'execution': ['taskmaster-start', 'taskmaster-block', 'taskmaster-complete', 'pomodoro'],
            'reflection': ['brain-dump-analysis', 'victory-suggest', 'victory-review', 'add-victory'],
            'rituals': ['ritual-add', 'ritual-block', 'ritual-status', 'taskwarrior-ritual-sync'],
            'performance': ['performance-dashboard', 'performance-compare', 'performance-trend'],
            'foundation': ['define-values', 'define-roles', 'lifestyle-vision'],
            'content': ['add-newsletter', 'newsletter-research', 'transcribe-brain-dump'],
            'projects': ['project-create', 'project-view', 'project-progress', 'project-breakdown', 'project-dependencies'],
            'utilities': ['daily-brief', 'executive-function', 'calendar-sync', 'bootdev-done', 'recommend']
        };

        for (const [category, commands] of Object.entries(categories)) {
            if (commands.includes(name)) {
                return category;
            }
        }
        return 'other';
    }

    /**
     * Extract timing conditions from command content
     */
    extractTimingConditions(content) {
        const conditions = {
            timeOfDay: [],
            dayOfWeek: [],
            strategicPeriods: [],
            frequency: null
        };

        // Time of day patterns
        const timePatterns = {
            'early-morning': /early morning|morning energy|5:00.*9:00|dawn|wake/i,
            'morning': /morning|9:00.*12:00|AM|start.*day/i,
            'afternoon': /afternoon|12:00.*17:00|mid.*day|lunch/i,
            'evening': /evening|17:00.*20:00|end.*day|wrap.*up/i,
            'night': /night|20:00.*23:00|reflection|before.*bed/i
        };

        for (const [time, pattern] of Object.entries(timePatterns)) {
            if (pattern.test(content)) {
                conditions.timeOfDay.push(time);
            }
        }

        // Day of week patterns
        const dayPatterns = {
            'sunday': /sunday|week.*planning|strategic.*planning/i,
            'monday': /monday|fresh.*start|week.*begin/i,
            'wednesday': /wednesday|mid.*week|course.*correction/i,
            'friday': /friday|completion|week.*closing/i,
            'saturday': /saturday|analysis|investment/i
        };

        for (const [day, pattern] of Object.entries(dayPatterns)) {
            if (pattern.test(content)) {
                conditions.dayOfWeek.push(day);
            }
        }

        // Strategic period patterns
        const periodPatterns = {
            'year-end': /year.*end|december.*15.*31|annual.*planning/i,
            'quarter-end': /quarter.*end|quarterly.*review|Q[1-4].*end/i,
            'month-end': /month.*end|last.*3.*days|monthly.*review/i,
            'week-end': /week.*end|weekly.*review|sunday/i
        };

        for (const [period, pattern] of Object.entries(periodPatterns)) {
            if (pattern.test(content)) {
                conditions.strategicPeriods.push(period);
            }
        }

        // Frequency patterns
        if (/daily/i.test(content)) conditions.frequency = 'daily';
        else if (/weekly/i.test(content)) conditions.frequency = 'weekly';
        else if (/monthly/i.test(content)) conditions.frequency = 'monthly';
        else if (/quarterly/i.test(content)) conditions.frequency = 'quarterly';
        else if (/yearly/i.test(content)) conditions.frequency = 'yearly';

        return conditions;
    }

    /**
     * Extract context triggers from command content
     */
    extractContextTriggers(content) {
        const triggers = {
            keywords: [],
            situations: [],
            missingActivities: [],
            emotions: [],
            workStates: []
        };

        // Keyword patterns
        const keywordPatterns = {
            'scattered': /scattered|overwhelmed|unfocused/i,
            'stuck': /stuck|blocked|confused/i,
            'planning': /planning|organize|structure/i,
            'reflection': /reflect|review|analyze/i,
            'skills': /skills|learning|development/i,
            'productivity': /productivity|focus|work/i,
            'goals': /goals|mission|vision/i,
            'energy': /energy|tired|motivation/i
        };

        for (const [keyword, pattern] of Object.entries(keywordPatterns)) {
            if (pattern.test(content)) {
                triggers.keywords.push(keyword);
            }
        }

        // Situation patterns
        const situationPatterns = {
            'no-daily-plan': /no.*daily.*plan|no.*plan.*found/i,
            'no-checkin': /no.*checkin|missing.*checkin/i,
            'behind-schedule': /behind|delayed|running.*late/i,
            'high-stress': /stress|pressure|deadline/i,
            'low-motivation': /low.*motivation|unmotivated|stuck/i,
            'need-structure': /need.*structure|disorganized|chaos/i
        };

        for (const [situation, pattern] of Object.entries(situationPatterns)) {
            if (pattern.test(content)) {
                triggers.situations.push(situation);
            }
        }

        return triggers;
    }

    /**
     * Extract prerequisites from command content
     */
    extractPrerequisites(content) {
        const prereqs = [];
        
        // Look for prerequisite patterns
        const prereqPatterns = [
            /requires?.*:?\s*([^\n]+)/gi,
            /must.*have.*:?\s*([^\n]+)/gi,
            /needs?.*:?\s*([^\n]+)/gi,
            /depends.*on.*:?\s*([^\n]+)/gi
        ];

        for (const pattern of prereqPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                prereqs.push(match[1].trim());
            }
        }

        return prereqs;
    }

    /**
     * Extract output information from command content
     */
    extractOutputs(content) {
        const outputs = [];
        
        // Look for output patterns
        const outputPatterns = [
            /outputs?.*to.*:?\s*([^\n]+)/gi,
            /saves?.*to.*:?\s*([^\n]+)/gi,
            /creates?.*:?\s*([^\n]+)/gi,
            /generates?.*:?\s*([^\n]+)/gi
        ];

        for (const pattern of outputPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                outputs.push(match[1].trim());
            }
        }

        return outputs;
    }

    /**
     * Extract integration information from command content
     */
    extractIntegrations(content) {
        const integrations = [];
        
        // Look for integration patterns
        const integrationPatterns = [
            /integrates?.*with.*:?\s*([^\n]+)/gi,
            /works?.*with.*:?\s*([^\n]+)/gi,
            /connects?.*to.*:?\s*([^\n]+)/gi,
            /syncs?.*with.*:?\s*([^\n]+)/gi
        ];

        for (const pattern of integrationPatterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                integrations.push(match[1].trim());
            }
        }

        return integrations;
    }

    /**
     * Calculate base priority for command
     */
    calculateBasePriority(name, content) {
        let priority = 50; // Base priority

        // High priority commands
        const highPriorityCommands = [
            'morning-checkin', 'evening-checkin', 'daily-checkin',
            'plan-day', 'daily-brief', 'skill-status'
        ];
        
        if (highPriorityCommands.includes(name)) {
            priority += 30;
        }

        // Foundation commands get high priority during strategic periods
        const foundationCommands = ['define-values', 'define-roles', 'lifestyle-vision'];
        if (foundationCommands.includes(name)) {
            priority += 25;
        }

        // Planning commands get priority during planning periods
        if (name.startsWith('plan-')) {
            priority += 20;
        }

        // Review commands get priority during review periods
        if (name.startsWith('review-')) {
            priority += 15;
        }

        // Execution commands get moderate priority
        const executionCommands = ['taskmaster-start', 'pomodoro'];
        if (executionCommands.includes(name)) {
            priority += 10;
        }

        return Math.min(priority, 100); // Cap at 100
    }

    /**
     * Scan all command files and build cache
     */
    async buildCache() {
        console.log('🔄 Building command cache...');
        
        if (!fs.existsSync(this.commandsDir)) {
            throw new Error(`Commands directory not found: ${this.commandsDir}`);
        }

        const files = fs.readdirSync(this.commandsDir)
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(this.commandsDir, file));

        console.log(`📁 Found ${files.length} command files`);

        for (const file of files) {
            try {
                const command = this.parseCommandFile(file);
                this.commands.set(command.name, command);
                console.log(`✅ Processed: ${command.name} (${command.category})`);
            } catch (error) {
                console.error(`❌ Error processing ${file}:`, error.message);
            }
        }

        const cache = {
            buildTime: new Date().toISOString(),
            totalCommands: this.commands.size,
            categories: this.getCategoryStats(),
            commands: Object.fromEntries(this.commands)
        };

        fs.writeFileSync(this.cacheFile, JSON.stringify(cache, null, 2));
        console.log(`💾 Cache saved to: ${this.cacheFile}`);
        console.log(`📊 Total commands cached: ${cache.totalCommands}`);
        
        return cache;
    }

    /**
     * Get statistics by category
     */
    getCategoryStats() {
        const stats = {};
        for (const command of this.commands.values()) {
            stats[command.category] = (stats[command.category] || 0) + 1;
        }
        return stats;
    }

    /**
     * Load existing cache if available
     */
    loadCache() {
        if (!fs.existsSync(this.cacheFile)) {
            return null;
        }

        try {
            return JSON.parse(fs.readFileSync(this.cacheFile, 'utf8'));
        } catch (error) {
            console.error('Error loading cache:', error.message);
            return null;
        }
    }

    /**
     * Check if cache needs rebuilding
     */
    needsRebuild() {
        const cache = this.loadCache();
        if (!cache) return true;

        // Check if any command files are newer than cache
        const cacheTime = new Date(cache.buildTime);
        
        if (!fs.existsSync(this.commandsDir)) {
            return true;
        }

        const files = fs.readdirSync(this.commandsDir)
            .filter(file => file.endsWith('.md'))
            .map(file => path.join(this.commandsDir, file));

        for (const file of files) {
            if (fs.statSync(file).mtime > cacheTime) {
                console.log(`📝 Command file updated: ${path.basename(file)}`);
                return true;
            }
        }

        return false;
    }
}

// CLI interface
if (require.main === module) {
    const builder = new CommandCacheBuilder();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'build':
        case undefined:
            builder.buildCache()
                .then(cache => {
                    console.log('\n🎯 Cache build complete!');
                    console.log(`Categories: ${Object.keys(cache.categories).join(', ')}`);
                })
                .catch(error => {
                    console.error('❌ Cache build failed:', error.message);
                    process.exit(1);
                });
            break;
            
        case 'check':
            if (builder.needsRebuild()) {
                console.log('🔄 Cache needs rebuilding');
                process.exit(1);
            } else {
                console.log('✅ Cache is up to date');
                process.exit(0);
            }
            break;
            
        case 'stats':
            const cache = builder.loadCache();
            if (!cache) {
                console.log('❌ No cache found. Run: node scripts/command-cache-builder.js build');
                process.exit(1);
            }
            
            console.log('\n📊 COMMAND CACHE STATISTICS');
            console.log(`Build time: ${cache.buildTime}`);
            console.log(`Total commands: ${cache.totalCommands}`);
            console.log('\nCategories:');
            for (const [category, count] of Object.entries(cache.categories)) {
                console.log(`  ${category}: ${count}`);
            }
            break;
            
        default:
            console.log(`
Usage: node scripts/command-cache-builder.js [command]

Commands:
  build     Build/rebuild command cache (default)
  check     Check if cache needs rebuilding
  stats     Show cache statistics

The cache is saved to: planning/data/command-cache.json
            `);
    }
}

module.exports = CommandCacheBuilder;