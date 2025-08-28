#!/usr/bin/env node

/**
 * Collaborative Fractal Planning System
 * Purpose: AI-assisted planning with repository context analysis and user collaboration
 * Usage: node scripts/collaborative-planner.js [plan-type] [optional-period]
 * Dependencies: fs, path, child_process
 * 
 * Features:
 * - Repository context analysis (commits, skills, victories, current work)
 * - AI-generated plan proposals based on real context
 * - Interactive collaboration to refine plans
 * - Integration with existing fractal planning system
 * 
 * Commands:
 * - collaborate-day [date]      - Collaborative daily planning with context analysis
 * - collaborate-week [week]     - Collaborative weekly planning
 * - collaborate-month [month]   - Collaborative monthly planning
 * - collaborate-quarter [Q]     - Collaborative quarterly planning
 * - collaborate-year [year]     - Collaborative yearly planning
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REPO_ROOT = path.join(__dirname, '..');
const PLANNING_DIR = path.join(REPO_ROOT, 'planning');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const VICTORIES_DIR = path.join(REPO_ROOT, 'victories');
const JOURNAL_DIR = path.join(REPO_ROOT, 'journal');
const RESEARCH_DIR = path.join(REPO_ROOT, 'research');
const LOGS_DIR = path.join(REPO_ROOT, 'logs');

// Ensure directories exist
[PLANNING_DIR, SKILLS_DIR, VICTORIES_DIR, JOURNAL_DIR, RESEARCH_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * Repository Context Analyzer
 * Gathers intelligence from repository to inform planning decisions
 */
class RepositoryContextAnalyzer {
    constructor() {
        this.context = {
            recentCommits: [],
            currentSkills: null,
            recentVictories: [],
            activeProjects: [],
            learningFocus: [],
            energyPatterns: {},
            challenges: [],
            momentum: {
                technical: 0,
                learning: 0,
                productivity: 0
            }
        };
    }

    async analyzeFullContext() {
        console.log('🔍 Analyzing repository context for intelligent planning...\n');
        
        await this.analyzeRecentCommits();
        await this.analyzeSkillMatrix();
        await this.analyzeRecentVictories();
        await this.analyzeActiveProjects();
        await this.analyzeLearningFocus();
        await this.analyzeRecentJournals();
        await this.calculateMomentum();
        
        return this.context;
    }

    async analyzeRecentCommits() {
        try {
            console.log('📊 Analyzing recent Git commits...');
            const gitLog = execSync('git log --oneline --since="7 days ago" -20', { 
                cwd: REPO_ROOT,
                encoding: 'utf8' 
            });
            
            const commits = gitLog.trim().split('\n').filter(Boolean);
            this.context.recentCommits = commits.map(commit => {
                const [hash, ...messageParts] = commit.split(' ');
                const message = messageParts.join(' ');
                return { hash: hash.substring(0, 7), message };
            });
            
            // Analyze commit patterns
            const patterns = {
                technical: commits.filter(c => 
                    c.includes('[SCRIPT]') || c.includes('Add') || c.includes('Update') || c.includes('Fix')
                ).length,
                learning: commits.filter(c => 
                    c.includes('[DAILY]') || c.includes('[RESEARCH]') || c.includes('analysis')
                ).length,
                documentation: commits.filter(c => 
                    c.includes('[DOCS]') || c.includes('README') || c.includes('md')
                ).length
            };
            
            console.log(`   - ${commits.length} commits in last 7 days`);
            console.log(`   - Technical: ${patterns.technical}, Learning: ${patterns.learning}, Docs: ${patterns.documentation}`);
            
        } catch (error) {
            console.log('   - Git analysis failed, using repository scan fallback');
            this.context.recentCommits = [];
        }
    }

    async analyzeSkillMatrix() {
        try {
            console.log('🎯 Analyzing skill matrix and gaps...');
            const skillMatrixPath = path.join(SKILLS_DIR, 'skill-matrix.json');
            
            if (fs.existsSync(skillMatrixPath)) {
                const skillData = JSON.parse(fs.readFileSync(skillMatrixPath, 'utf8'));
                this.context.currentSkills = skillData;
                
                // Calculate skill gaps and priorities
                const gaps = this.calculateSkillGaps(skillData);
                console.log(`   - ${Object.keys(skillData.categories || {}).length} skill categories tracked`);
                console.log(`   - ${gaps.critical.length} critical gaps, ${gaps.quickWins.length} quick wins identified`);
                
                this.context.skillGaps = gaps;
            } else {
                console.log('   - No skill matrix found, planning will focus on general AI/ML development');
                this.context.currentSkills = null;
            }
        } catch (error) {
            console.log('   - Skill matrix analysis failed, using defaults');
            this.context.currentSkills = null;
        }
    }

    calculateSkillGaps(skillData) {
        const gaps = { critical: [], quickWins: [], maintenance: [] };
        
        if (!skillData.categories) return gaps;
        
        Object.entries(skillData.categories).forEach(([category, skills]) => {
            Object.entries(skills).forEach(([skill, data]) => {
                const current = data.current || 0;
                const target = data.target || 5;
                const gap = target - current;
                
                if (gap > 2) {
                    gaps.critical.push({ skill, category, current, target, gap });
                } else if (gap > 0 && gap <= 1) {
                    gaps.quickWins.push({ skill, category, current, target, gap });
                } else if (current >= target) {
                    gaps.maintenance.push({ skill, category, current, target });
                }
            });
        });
        
        // Sort by gap size and importance
        gaps.critical.sort((a, b) => b.gap - a.gap);
        gaps.quickWins.sort((a, b) => a.gap - b.gap);
        
        return gaps;
    }

    async analyzeRecentVictories() {
        try {
            console.log('🏆 Analyzing recent victories and momentum...');
            
            // Get most recent victory file
            const victoryFiles = fs.readdirSync(VICTORIES_DIR)
                .filter(f => f.startsWith('victories-') && f.endsWith('.md'))
                .sort()
                .reverse();
                
            if (victoryFiles.length > 0) {
                const recentVictories = fs.readFileSync(
                    path.join(VICTORIES_DIR, victoryFiles[0]), 
                    'utf8'
                );
                
                // Extract recent victories (simple pattern matching)
                const victoryMatches = recentVictories.match(/^- \*\*(.*?)\*\*/gm) || [];
                this.context.recentVictories = victoryMatches.slice(0, 10).map(v => 
                    v.replace(/^- \*\*(.*?)\*\*/, '$1').trim()
                );
                
                console.log(`   - ${this.context.recentVictories.length} recent victories identified`);
                console.log(`   - Latest: "${this.context.recentVictories[0] || 'None found'}"`);
            } else {
                console.log('   - No victory files found, will focus on momentum building');
            }
        } catch (error) {
            console.log('   - Victory analysis failed, using motivation defaults');
            this.context.recentVictories = [];
        }
    }

    async analyzeActiveProjects() {
        try {
            console.log('🚀 Scanning for active projects and work...');
            
            // Look for project indicators in recent files
            const projectIndicators = [];
            
            // Check for active coding projects (look for recent script modifications)
            const scriptsDir = path.join(REPO_ROOT, 'scripts');
            if (fs.existsSync(scriptsDir)) {
                const scripts = fs.readdirSync(scriptsDir)
                    .filter(f => f.endsWith('.js') || f.endsWith('.cjs'))
                    .map(f => {
                        const stat = fs.statSync(path.join(scriptsDir, f));
                        return { file: f, modified: stat.mtime };
                    })
                    .sort((a, b) => b.modified - a.modified)
                    .slice(0, 5);
                    
                projectIndicators.push(...scripts.map(s => ({
                    type: 'script',
                    name: s.file,
                    lastModified: s.modified
                })));
            }
            
            // Check for active research
            if (fs.existsSync(RESEARCH_DIR)) {
                const researchFiles = fs.readdirSync(RESEARCH_DIR)
                    .filter(f => f.endsWith('.md') || f.endsWith('.json'))
                    .map(f => {
                        const stat = fs.statSync(path.join(RESEARCH_DIR, f));
                        return { file: f, modified: stat.mtime };
                    })
                    .sort((a, b) => b.modified - a.modified)
                    .slice(0, 3);
                    
                projectIndicators.push(...researchFiles.map(r => ({
                    type: 'research',
                    name: r.file,
                    lastModified: r.modified
                })));
            }
            
            this.context.activeProjects = projectIndicators;
            console.log(`   - ${projectIndicators.length} active projects/files detected`);
            
        } catch (error) {
            console.log('   - Project analysis failed, using general focus');
            this.context.activeProjects = [];
        }
    }

    async analyzeLearningFocus() {
        try {
            console.log('📚 Analyzing current learning focus...');
            
            // Look for learning patterns in recent journal entries
            const learningKeywords = [
                'boot.dev', 'ai', 'machine learning', 'python', 'javascript', 
                'azure', 'certification', 'portfolio', 'project'
            ];
            
            const recentFocus = new Map();
            
            // Scan recent daily entries if they exist
            const dailyDir = path.join(JOURNAL_DIR, 'daily');
            if (fs.existsSync(dailyDir)) {
                const dailyFiles = fs.readdirSync(dailyDir)
                    .filter(f => f.startsWith('daily-') && f.endsWith('.md'))
                    .sort()
                    .reverse()
                    .slice(0, 7); // Last week
                    
                for (const file of dailyFiles) {
                    const content = fs.readFileSync(path.join(dailyDir, file), 'utf8').toLowerCase();
                    learningKeywords.forEach(keyword => {
                        if (content.includes(keyword)) {
                            recentFocus.set(keyword, (recentFocus.get(keyword) || 0) + 1);
                        }
                    });
                }
            }
            
            // Convert to sorted array
            this.context.learningFocus = Array.from(recentFocus.entries())
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([keyword, count]) => ({ keyword, mentions: count }));
                
            console.log(`   - ${this.context.learningFocus.length} learning focus areas identified`);
            if (this.context.learningFocus.length > 0) {
                console.log(`   - Top focus: "${this.context.learningFocus[0].keyword}" (${this.context.learningFocus[0].mentions} mentions)`);
            }
            
        } catch (error) {
            console.log('   - Learning focus analysis failed, using AI/ML defaults');
            this.context.learningFocus = [
                { keyword: 'ai', mentions: 5 },
                { keyword: 'python', mentions: 3 },
                { keyword: 'portfolio', mentions: 2 }
            ];
        }
    }

    async analyzeRecentJournals() {
        try {
            console.log('📝 Analyzing recent journal patterns...');
            
            // Look for energy patterns, challenges, and insights in recent entries
            const patterns = {
                highEnergyDays: 0,
                challenges: [],
                insights: [],
                consistency: 0
            };
            
            const brainDir = path.join(JOURNAL_DIR, 'brain');
            if (fs.existsSync(brainDir)) {
                const brainDumps = fs.readdirSync(brainDir)
                    .filter(f => f.startsWith('braindump-') && f.endsWith('.md'))
                    .sort()
                    .reverse()
                    .slice(0, 10);
                    
                patterns.consistency = brainDumps.length;
                
                // Simple pattern detection in recent brain dumps
                for (const file of brainDumps.slice(0, 3)) {
                    const content = fs.readFileSync(path.join(brainDir, file), 'utf8').toLowerCase();
                    
                    // Look for challenge indicators
                    if (content.includes('challenge') || content.includes('difficult') || content.includes('stuck')) {
                        patterns.challenges.push(`Recent challenge noted in ${file.substring(0, 15)}...`);
                    }
                    
                    // Look for insight indicators
                    if (content.includes('learned') || content.includes('realize') || content.includes('insight')) {
                        patterns.insights.push(`Learning insight in ${file.substring(0, 15)}...`);
                    }
                }
            }
            
            this.context.journalPatterns = patterns;
            console.log(`   - ${patterns.consistency} recent brain dumps found`);
            console.log(`   - ${patterns.challenges.length} challenges, ${patterns.insights.length} insights detected`);
            
        } catch (error) {
            console.log('   - Journal analysis failed, using general patterns');
            this.context.journalPatterns = { consistency: 0, challenges: [], insights: [] };
        }
    }

    calculateMomentum() {
        console.log('⚡ Calculating current momentum indicators...');
        
        // Technical momentum (commits, scripts, projects)
        const technicalScore = Math.min(100, 
            (this.context.recentCommits.length * 5) +
            (this.context.activeProjects.length * 10) +
            ((this.context.skillGaps?.quickWins.length || 0) * 3)
        );
        
        // Learning momentum (victories, journal consistency, focus)
        const learningScore = Math.min(100,
            (this.context.recentVictories.length * 8) +
            (this.context.learningFocus.length * 5) +
            ((this.context.journalPatterns?.consistency || 0) * 3)
        );
        
        // Productivity momentum (recent activity, consistency)
        const productivityScore = Math.min(100,
            (this.context.recentCommits.length * 4) +
            ((this.context.journalPatterns?.consistency || 0) * 6) +
            (this.context.recentVictories.length * 5)
        );
        
        this.context.momentum = {
            technical: Math.round(technicalScore),
            learning: Math.round(learningScore),
            productivity: Math.round(productivityScore),
            overall: Math.round((technicalScore + learningScore + productivityScore) / 3)
        };
        
        console.log(`   - Technical: ${this.context.momentum.technical}%`);
        console.log(`   - Learning: ${this.context.momentum.learning}%`);
        console.log(`   - Productivity: ${this.context.momentum.productivity}%`);
        console.log(`   - Overall Momentum: ${this.context.momentum.overall}%\n`);
    }

    generateContextSummary() {
        const summary = {
            strengths: [],
            opportunities: [],
            priorities: [],
            recommendations: []
        };
        
        // Identify strengths
        if (this.context.momentum.overall > 70) {
            summary.strengths.push("Strong overall momentum across all areas");
        }
        if (this.context.recentVictories.length > 5) {
            summary.strengths.push("Consistent victory capture and confidence building");
        }
        if (this.context.recentCommits.length > 10) {
            summary.strengths.push("High technical activity and code contribution");
        }
        if ((this.context.journalPatterns?.consistency || 0) > 7) {
            summary.strengths.push("Excellent reflection and documentation habits");
        }
        
        // Identify opportunities
        if ((this.context.skillGaps?.critical.length || 0) > 3) {
            summary.opportunities.push("Multiple critical skill gaps ready for focused development");
        }
        if (this.context.activeProjects.length > 0) {
            summary.opportunities.push("Active projects providing practical application context");
        }
        if (this.context.learningFocus.length > 0) {
            summary.opportunities.push(`Clear learning momentum in ${this.context.learningFocus[0]?.keyword || 'key areas'}`);
        }
        
        // Set priorities based on context
        if (this.context.momentum.technical < 50) {
            summary.priorities.push("Rebuild technical momentum with focused coding sessions");
        }
        if (this.context.momentum.learning < 50) {
            summary.priorities.push("Strengthen learning consistency and skill development");
        }
        if ((this.context.skillGaps?.critical.length || 0) > 0) {
            const topSkill = this.context.skillGaps.critical[0];
            summary.priorities.push(`Address critical skill gap: ${topSkill?.skill || 'AI/ML fundamentals'}`);
        }
        
        // Generate recommendations
        if (this.context.momentum.overall > 70) {
            summary.recommendations.push("Maintain current momentum with consistent daily blocks");
            summary.recommendations.push("Consider taking on more challenging technical projects");
        } else {
            summary.recommendations.push("Focus on rebuilding momentum with smaller, achievable wins");
            summary.recommendations.push("Prioritize consistency over intensity in daily practice");
        }
        
        if ((this.context.journalPatterns?.challenges.length || 0) > 2) {
            summary.recommendations.push("Address recurring challenges with system improvements");
        }
        
        return summary;
    }
}

/**
 * Collaborative Plan Generator
 * Creates contextually-aware plan proposals for user collaboration
 */
class CollaborativePlanGenerator {
    constructor(context) {
        this.context = context;
        this.summary = context.generateContextSummary ? context.generateContextSummary() : {};
    }

    generateDayPlan(dateStr) {
        const contextualBlocks = this.createContextualTimeBlocks();
        const contextualObjectives = this.createContextualObjectives('daily');
        
        return {
            type: 'daily',
            date: dateStr,
            context: this.context,
            summary: this.summary,
            proposal: {
                timeBlocks: contextualBlocks,
                objectives: contextualObjectives,
                theme: this.generateDayTheme(),
                energyOptimization: this.generateEnergyRecommendations(),
                contextualNotes: this.generateContextualNotes('daily')
            },
            rationale: this.generatePlanRationale('daily')
        };
    }

    createContextualTimeBlocks() {
        const blocks = [];
        const momentum = this.context.momentum || {};
        const skills = this.context.skillGaps || {};
        const projects = this.context.activeProjects || [];
        
        // Morning Deep Work - Adapt based on momentum and skills
        if (momentum.technical > 60) {
            blocks.push({
                start: '09:00',
                duration: 90,
                title: 'Advanced Technical Deep Work',
                activity: skills.critical?.[0] ? 
                    `Focus on ${skills.critical[0].skill} - tackle challenging concepts` :
                    'AI/ML advanced concepts - push current boundaries',
                alignment: 'Building on current technical momentum',
                type: 'deep-work',
                contextual: true,
                rationale: `High technical momentum (${momentum.technical}%) suggests readiness for challenging work`
            });
        } else {
            blocks.push({
                start: '09:00',
                duration: 90,
                title: 'Foundation Building Deep Work',
                activity: skills.quickWins?.[0] ? 
                    `Quick win: ${skills.quickWins[0].skill} fundamentals` :
                    'AI/ML fundamentals - build confidence with achievable progress',
                alignment: 'Rebuilding technical momentum through achievable wins',
                type: 'deep-work',
                contextual: true,
                rationale: `Lower technical momentum (${momentum.technical}%) suggests focusing on confidence-building wins`
            });
        }
        
        // Mid-morning Learning - Adapt based on learning focus
        const topFocus = this.context.learningFocus?.[0];
        blocks.push({
            start: '11:00',
            duration: 60,
            title: 'Focused Learning Block',
            activity: topFocus ? 
                `Continue ${topFocus.keyword} learning - build on recent momentum (${topFocus.mentions} recent mentions)` :
                'Boot.dev coursework or AI implementation tutorials',
            alignment: 'Leveraging identified learning patterns',
            type: 'learning',
            contextual: true,
            rationale: topFocus ? 
                `Recent focus on "${topFocus.keyword}" shows clear interest and momentum` :
                'Default learning path for skill development'
        });
        
        // Afternoon Application - Adapt based on active projects
        if (projects.length > 0) {
            const recentProject = projects[0];
            blocks.push({
                start: '14:00',
                duration: 90,
                title: 'Project Application Block',
                activity: `Continue work on ${recentProject.name} - apply morning learning practically`,
                alignment: 'Building on active project momentum',
                type: 'application',
                contextual: true,
                rationale: `Recent activity on ${recentProject.name} suggests continued development opportunity`
            });
        } else {
            blocks.push({
                start: '14:00',
                duration: 90,
                title: 'Portfolio Development Block',
                activity: 'Start new portfolio project applying recent learning',
                alignment: 'Creating practical application opportunities',
                type: 'application',
                contextual: true,
                rationale: 'No active projects detected - time to start something new for portfolio'
            });
        }
        
        // Late Afternoon - Adapt based on victories and momentum
        const recentVictories = this.context.recentVictories?.length || 0;
        if (recentVictories < 3) {
            blocks.push({
                start: '16:00',
                duration: 60,
                title: 'Victory Building Block',
                activity: 'Focus on completing small, measurable wins to build momentum',
                alignment: 'Building confidence through documented achievements',
                type: 'victory-focused',
                contextual: true,
                rationale: `Only ${recentVictories} recent victories - need to build confidence momentum`
            });
        } else {
            blocks.push({
                start: '16:00',
                duration: 60,
                title: 'Advanced Skill Practice',
                activity: 'Practice advanced concepts or prepare for certifications',
                alignment: 'Leveraging strong confidence base for growth',
                type: 'advanced-practice',
                contextual: true,
                rationale: `Strong victory momentum (${recentVictories} recent wins) supports challenging practice`
            });
        }
        
        // Evening Reflection - Always consistent but contextual
        blocks.push({
            start: '17:00',
            duration: 30,
            title: 'Strategic Reflection Block',
            activity: 'Review progress, capture victories, plan tomorrow with context awareness',
            alignment: 'Maintaining systematic improvement and momentum tracking',
            type: 'reflection',
            contextual: true,
            rationale: 'Consistent reflection essential for ADD-optimized continuous improvement'
        });
        
        return blocks;
    }

    createContextualObjectives(type) {
        const objectives = [];
        const momentum = this.context.momentum || {};
        const skills = this.context.skillGaps || {};
        
        switch (type) {
            case 'daily':
                // Primary objective based on momentum
                if (momentum.overall > 70) {
                    objectives.push({
                        title: 'Make significant progress on advanced technical challenge',
                        priority: 1,
                        parentAlignment: 'Capitalizing on high momentum period',
                        contextual: true,
                        rationale: `Strong momentum (${momentum.overall}%) supports ambitious daily goals`
                    });
                } else {
                    objectives.push({
                        title: 'Complete 2-3 confidence-building technical wins',
                        priority: 1,
                        parentAlignment: 'Rebuilding momentum through achievable progress',
                        contextual: true,
                        rationale: `Lower momentum (${momentum.overall}%) requires focus on rebuilding confidence`
                    });
                }
                
                // Skill-based objective
                if (skills.critical?.[0]) {
                    objectives.push({
                        title: `Make measurable progress in ${skills.critical[0].skill}`,
                        priority: 2,
                        parentAlignment: 'Addressing critical skill gap for 2026 goals',
                        contextual: true,
                        rationale: `Critical gap in ${skills.critical[0].skill} (${skills.critical[0].gap} points behind target)`
                    });
                } else if (skills.quickWins?.[0]) {
                    objectives.push({
                        title: `Complete quick win in ${skills.quickWins[0].skill}`,
                        priority: 2,
                        parentAlignment: 'Building momentum through achievable skill advancement',
                        contextual: true,
                        rationale: `Quick win opportunity in ${skills.quickWins[0].skill} (only ${skills.quickWins[0].gap} points to target)`
                    });
                }
                
                // Documentation and reflection
                objectives.push({
                    title: 'Document learnings and capture victories for momentum maintenance',
                    priority: 3,
                    parentAlignment: 'Systematic confidence building and knowledge retention',
                    contextual: true,
                    rationale: 'Essential for ADD-optimized learning and long-term retention'
                });
                
                break;
        }
        
        return objectives;
    }

    generateDayTheme() {
        const momentum = this.context.momentum || {};
        
        if (momentum.overall > 80) {
            return "High-Momentum Technical Breakthrough";
        } else if (momentum.overall > 60) {
            return "Steady Progress and Skill Building";
        } else if (momentum.overall > 40) {
            return "Momentum Rebuilding and Foundation Strengthening";
        } else {
            return "Confidence Restoration and Small Wins";
        }
    }

    generateEnergyRecommendations() {
        const momentum = this.context.momentum || {};
        const victories = this.context.recentVictories?.length || 0;
        
        return {
            morning: momentum.technical > 60 ? 
                "High energy - tackle most challenging technical work" :
                "Focus on achievable wins to build energy throughout day",
            midday: victories > 5 ?
                "Strong confidence - good time for new challenges" :
                "Build on morning wins - maintain steady progress",
            afternoon: "Apply morning learning practically - hands-on implementation",
            evening: "Reflection and planning - lower energy tasks"
        };
    }

    generateContextualNotes(type) {
        const notes = [];
        const momentum = this.context.momentum || {};
        const commits = this.context.recentCommits?.length || 0;
        const victories = this.context.recentVictories?.length || 0;
        
        // Momentum-based notes
        if (momentum.overall > 70) {
            notes.push("🚀 High momentum detected - this is a great time for ambitious goals and challenging work");
        } else if (momentum.overall < 40) {
            notes.push("🔧 Lower momentum period - focus on rebuilding confidence through smaller, achievable wins");
        }
        
        // Activity-based notes
        if (commits > 15) {
            notes.push("💻 High coding activity recently - maintain technical momentum with continued hands-on work");
        } else if (commits < 5) {
            notes.push("⚡ Lower recent coding activity - prioritize hands-on technical work to rebuild momentum");
        }
        
        // Victory-based notes
        if (victories > 8) {
            notes.push("🏆 Excellent victory capture - leverage this confidence for more challenging goals");
        } else if (victories < 3) {
            notes.push("📈 Focus on capturing and celebrating wins - essential for maintaining ADD-friendly motivation");
        }
        
        // Skill-based notes
        const criticalGaps = this.context.skillGaps?.critical?.length || 0;
        if (criticalGaps > 0) {
            notes.push(`🎯 ${criticalGaps} critical skill gaps identified - prioritize focused skill development`);
        }
        
        return notes;
    }

    generatePlanRationale(type) {
        const rationale = {
            contextAnalysis: [],
            planningDecisions: [],
            expectedOutcomes: []
        };
        
        // Context analysis
        rationale.contextAnalysis.push(
            `Overall momentum: ${this.context.momentum?.overall || 0}% (Technical: ${this.context.momentum?.technical || 0}%, Learning: ${this.context.momentum?.learning || 0}%)`
        );
        rationale.contextAnalysis.push(
            `Recent activity: ${this.context.recentCommits?.length || 0} commits, ${this.context.recentVictories?.length || 0} victories, ${this.context.activeProjects?.length || 0} active projects`
        );
        
        if (this.context.skillGaps?.critical?.length > 0) {
            rationale.contextAnalysis.push(
                `Critical skill gaps: ${this.context.skillGaps.critical.slice(0, 3).map(g => g.skill).join(', ')}`
            );
        }
        
        // Planning decisions
        const momentum = this.context.momentum || {};
        if (momentum.overall > 60) {
            rationale.planningDecisions.push("High momentum enables ambitious technical challenges in morning blocks");
            rationale.planningDecisions.push("Strong confidence base supports advanced skill practice");
        } else {
            rationale.planningDecisions.push("Lower momentum requires focus on achievable wins and confidence building");
            rationale.planningDecisions.push("Gradual difficulty progression to rebuild momentum safely");
        }
        
        // Expected outcomes
        rationale.expectedOutcomes.push("Measurable progress toward 2026 AI engineer transformation");
        rationale.expectedOutcomes.push("Maintained or improved momentum across technical and learning areas");
        rationale.expectedOutcomes.push("Documented wins and learning for long-term confidence and knowledge retention");
        
        return rationale;
    }
}

/**
 * Collaborative Planning Interface
 * Handles the conversation and refinement with the user
 */
class CollaborativePlanningInterface {
    constructor() {
        this.analyzer = new RepositoryContextAnalyzer();
        this.generator = null;
    }

    async startCollaboration(planType, period = null) {
        console.log(`🤝 Starting collaborative ${planType} planning...\n`);
        
        // Step 1: Analyze repository context
        const context = await this.analyzer.analyzeFullContext();
        
        // Step 2: Generate contextual plan proposal
        this.generator = new CollaborativePlanGenerator(this.analyzer);
        
        let planProposal;
        switch (planType) {
            case 'day':
                const dateStr = period || new Date().toISOString().split('T')[0];
                planProposal = this.generator.generateDayPlan(dateStr);
                break;
            default:
                throw new Error(`Plan type ${planType} not yet implemented`);
        }
        
        // Step 3: Present proposal to user
        this.presentProposal(planProposal);
        
        return planProposal;
    }

    presentProposal(proposal) {
        console.log('📋 CONTEXTUAL PLAN PROPOSAL');
        console.log('═'.repeat(50));
        
        // Context Summary
        console.log('\n🔍 REPOSITORY CONTEXT ANALYSIS');
        console.log('-'.repeat(30));
        console.log(`Overall Momentum: ${this.analyzer.context.momentum?.overall || 0}%`);
        console.log(`- Technical: ${this.analyzer.context.momentum?.technical || 0}%`);
        console.log(`- Learning: ${this.analyzer.context.momentum?.learning || 0}%`);
        console.log(`- Productivity: ${this.analyzer.context.momentum?.productivity || 0}%`);
        
        console.log(`\nRecent Activity:`);
        console.log(`- ${this.analyzer.context.recentCommits?.length || 0} commits (7 days)`);
        console.log(`- ${this.analyzer.context.recentVictories?.length || 0} recent victories`);
        console.log(`- ${this.analyzer.context.activeProjects?.length || 0} active projects`);
        
        if (this.analyzer.context.skillGaps?.critical?.length > 0) {
            console.log(`\nCritical Skill Gaps:`);
            this.analyzer.context.skillGaps.critical.slice(0, 3).forEach(gap => {
                console.log(`- ${gap.skill}: ${gap.current}/${gap.target} (gap: ${gap.gap})`);
            });
        }
        
        if (this.analyzer.context.learningFocus?.length > 0) {
            console.log(`\nCurrent Learning Focus:`);
            this.analyzer.context.learningFocus.slice(0, 3).forEach(focus => {
                console.log(`- ${focus.keyword} (${focus.mentions} mentions)`);
            });
        }
        
        // Plan Proposal
        console.log('\n📅 INTELLIGENT PLAN PROPOSAL');
        console.log('-'.repeat(30));
        console.log(`Theme: ${proposal.proposal.theme}`);
        
        console.log('\n⏰ Contextual Time Blocks:');
        proposal.proposal.timeBlocks.forEach((block, index) => {
            console.log(`\n${index + 1}. ${block.title} (${block.start} - ${this.calculateEndTime(block.start, block.duration)})`);
            console.log(`   Activity: ${block.activity}`);
            console.log(`   Type: ${block.type}`);
            if (block.contextual) {
                console.log(`   🧠 AI Rationale: ${block.rationale}`);
            }
        });
        
        console.log('\n🎯 Contextual Objectives:');
        proposal.proposal.objectives.forEach((obj, index) => {
            console.log(`\n${index + 1}. ${obj.title} (Priority: ${this.getPriorityLabel(obj.priority)})`);
            console.log(`   Alignment: ${obj.parentAlignment}`);
            if (obj.contextual) {
                console.log(`   🧠 AI Rationale: ${obj.rationale}`);
            }
        });
        
        console.log('\n⚡ Energy Optimization Recommendations:');
        Object.entries(proposal.proposal.energyOptimization).forEach(([time, rec]) => {
            console.log(`- ${time.charAt(0).toUpperCase() + time.slice(1)}: ${rec}`);
        });
        
        if (proposal.proposal.contextualNotes.length > 0) {
            console.log('\n💡 Contextual Notes:');
            proposal.proposal.contextualNotes.forEach(note => {
                console.log(`${note}`);
            });
        }
        
        console.log('\n🎯 PLAN RATIONALE');
        console.log('-'.repeat(20));
        console.log('\nContext Analysis:');
        proposal.rationale.contextAnalysis.forEach(analysis => {
            console.log(`• ${analysis}`);
        });
        
        console.log('\nPlanning Decisions:');
        proposal.rationale.planningDecisions.forEach(decision => {
            console.log(`• ${decision}`);
        });
        
        console.log('\nExpected Outcomes:');
        proposal.rationale.expectedOutcomes.forEach(outcome => {
            console.log(`• ${outcome}`);
        });
        
        console.log('\n' + '═'.repeat(50));
        console.log('🤝 COLLABORATION READY');
        console.log('This contextually-aware plan is ready for your review and refinement.');
        console.log('Use this as a foundation for discussion and adjustment.');
        console.log('When finalized, it can be saved using the standard fractal planner.');
    }

    calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
    }

    getPriorityLabel(priority) {
        const labels = { 1: 'HIGH', 2: 'MEDIUM', 3: 'LOW' };
        return labels[priority] || 'MEDIUM';
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const period = args[1];
    
    const planningInterface = new CollaborativePlanningInterface();
    
    try {
        switch (command) {
            case 'collaborate-day':
                await planningInterface.startCollaboration('day', period);
                break;
            case 'collaborate-week':
                console.log('Weekly collaborative planning - Coming soon!');
                break;
            case 'collaborate-month':
                console.log('Monthly collaborative planning - Coming soon!');
                break;
            case 'collaborate-quarter':
                console.log('Quarterly collaborative planning - Coming soon!');
                break;
            case 'collaborate-year':
                console.log('Yearly collaborative planning - Coming soon!');
                break;
            default:
                console.log(`
🤝 Collaborative Fractal Planning System

This system analyzes your repository context and creates intelligent,
contextually-aware planning proposals for your review and refinement.

Usage:
  node scripts/collaborative-planner.js [command] [period]

Available Commands:
  collaborate-day [date]      - Intelligent daily planning with context analysis
  collaborate-week [week]     - Weekly collaborative planning (coming soon)
  collaborate-month [month]   - Monthly collaborative planning (coming soon)
  collaborate-quarter [Q]     - Quarterly collaborative planning (coming soon)
  collaborate-year [year]     - Yearly collaborative planning (coming soon)

Examples:
  node scripts/collaborative-planner.js collaborate-day 2025-08-28
  node scripts/collaborative-planner.js collaborate-day           # Uses today

Features:
  🔍 Repository context analysis (commits, skills, victories, projects)
  🧠 AI-generated plan proposals based on your actual situation
  🎯 Contextually-aware time blocks and objectives
  ⚡ Energy optimization recommendations
  📊 Momentum and progress tracking
  🤝 Ready for collaborative refinement

The generated proposal provides a foundation for discussion and adjustment
before finalizing with the standard fractal planner system.
                `);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { 
    RepositoryContextAnalyzer, 
    CollaborativePlanGenerator, 
    CollaborativePlanningInterface 
};