#!/usr/bin/env node

/**
 * Daily Brief Script
 * Purpose: Provide personalized daily briefing including job market insights for Robert's AI engineering journey
 * Usage: node scripts/daily-brief.js [--save]
 * Dependencies: fs, path, child_process
 * 
 * Features:
 * - News briefing based on AI/Software Engineering interests (NSW Australia focus)
 * - Job market insights from recent analysis
 * - Skills development recommendations
 * - Progress tracking toward 2026 goals
 * - Actionable next steps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runJobMarketAnalysis } from './job-market-analyzer.js';
import { getSydneyTime } from './sydney-time.js';
import { loadInterests } from './manage-interests.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SKILL_MATRIX_FILE = path.join(__dirname, '..', 'skills', 'skill-matrix.json');
const RESEARCH_DIR = path.join(__dirname, '..', 'research', 'job-market');
const JOURNAL_DIR = path.join(__dirname, '..', 'journal', 'daily');
const LOG_DIR = path.join(__dirname, '..', 'logs');
// Get Sydney time for consistent date handling
const sydneyTimeData = getSydneyTime ? getSydneyTime() : null;
const currentSydneyDate = sydneyTimeData ? sydneyTimeData.date : new Date().toISOString().split('T')[0];

const LOG_FILE = path.join(LOG_DIR, `daily-brief-${currentSydneyDate}.log`);

// Ensure directories exist
[JOURNAL_DIR, LOG_DIR].forEach(dir => {
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

/**
 * Get latest job market analysis data
 */
function getLatestJobMarketData() {
    const trendsFile = path.join(RESEARCH_DIR, 'market-trends.json');
    
    if (!fs.existsSync(trendsFile)) {
        return null;
    }
    
    try {
        const trends = JSON.parse(fs.readFileSync(trendsFile, 'utf8'));
        return trends.monthlyData[0] || null; // Most recent data
    } catch (error) {
        log(`Warning: Could not read job market trends: ${error.message}`);
        return null;
    }
}

/**
 * Get latest skills gap analysis
 */
function getLatestGapAnalysis() {
    try {
        const files = fs.readdirSync(RESEARCH_DIR)
            .filter(file => file.startsWith('gap-analysis-'))
            .sort()
            .reverse();
        
        if (files.length === 0) return null;
        
        const latestFile = path.join(RESEARCH_DIR, files[0]);
        return JSON.parse(fs.readFileSync(latestFile, 'utf8'));
    } catch (error) {
        log(`Warning: Could not read gap analysis: ${error.message}`);
        return null;
    }
}

/**
 * Get current skill matrix data
 */
function getCurrentSkills() {
    try {
        return JSON.parse(fs.readFileSync(SKILL_MATRIX_FILE, 'utf8'));
    } catch (error) {
        log(`Warning: Could not read skill matrix: ${error.message}`);
        return null;
    }
}

/**
 * Generate search queries from interests configuration
 */
function generateSearchQueries(interests) {
    const queries = [];
    
    // Get priority settings
    const priorities = interests.searchPriorities || {
        HIGH: { limit: 3, weight: 1.0 },
        MEDIUM: { limit: 2, weight: 0.7 },
        LOW: { limit: 1, weight: 0.3 }
    };
    
    // Group interests by priority
    const interestsByPriority = { HIGH: [], MEDIUM: [], LOW: [] };
    
    for (const [categoryName, categoryData] of Object.entries(interests.interests)) {
        const priority = categoryData.priority || 'MEDIUM';
        const keywords = categoryData.keywords || [];
        
        keywords.forEach(keyword => {
            interestsByPriority[priority].push({
                query: keyword,
                category: categoryName,
                priority: priority,
                weight: priorities[priority]?.weight || 0.5
            });
        });
    }
    
    // Select queries based on priority limits
    for (const [priority, interestQueries] of Object.entries(interestsByPriority)) {
        const limit = priorities[priority]?.limit || 1;
        const selectedQueries = interestQueries
            .sort(() => Math.random() - 0.5) // Randomize selection
            .slice(0, limit);
        
        queries.push(...selectedQueries);
    }
    
    // Fallback queries if no interests are configured
    if (queries.length === 0) {
        queries.push(
            { query: 'AI engineer jobs Australia Sydney 2025', priority: 'HIGH', category: 'career', weight: 1.0 },
            { query: 'Python developer Australia salary 2025', priority: 'HIGH', category: 'career', weight: 1.0 }
        );
    }
    
    log(`Generated ${queries.length} search queries from interests configuration`);
    return queries;
}

/**
 * Generate news briefing using firecrawl with proper pagination and filtering
 */
async function generateNewsBriefing(dateStr) {
    log('Starting news search with firecrawl...');
    
    // Load interests configuration
    const interests = loadInterests();
    log(`Loaded interests configuration with ${Object.keys(interests.interests).length} categories`);
    
    // Calculate 7-day window for filtering
    const today = new Date(dateStr);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    // Generate search queries from interests configuration
    const searchQueries = generateSearchQueries(interests);
    
    const newsItems = [];
    
    try {
        // Search with strict limits to avoid token overflow
        const prioritizedQueries = searchQueries
            .sort((a, b) => (b.weight || 0.5) - (a.weight || 0.5))
            .slice(0, 3); // Only top 3 searches to control token usage
        
        for (const search of prioritizedQueries) {
            log(`Searching for: ${search.query} (${search.priority} priority, category: ${search.category})`);
            
            // Use MCP firecrawl_search with strict limits
            const searchCmd = `cl mcp call firecrawl search --query "${search.query}" --limit 3 --scrapeOptions.onlyMainContent true --scrapeOptions.formats markdown`;
            
            try {
                const { spawn } = await import('child_process');
                const result = await new Promise((resolve, reject) => {
                    const proc = spawn('sh', ['-c', searchCmd], { 
                        stdio: ['pipe', 'pipe', 'pipe'],
                        timeout: 30000 // 30 second timeout
                    });
                    
                    let stdout = '';
                    let stderr = '';
                    
                    proc.stdout.on('data', (data) => stdout += data);
                    proc.stderr.on('data', (data) => stderr += data);
                    
                    proc.on('close', (code) => {
                        if (code === 0) resolve(stdout);
                        else reject(new Error(`Search failed: ${stderr}`));
                    });
                    
                    proc.on('error', reject);
                });
                
                // Parse and filter results
                if (result && result.length > 0) {
                    // Extract relevant information (simplified parsing)
                    const headlines = extractHeadlines(result, search.query);
                    newsItems.push(...headlines.slice(0, 2)); // Max 2 items per search
                }
                
            } catch (searchError) {
                log(`Search failed for "${search.query}": ${searchError.message}`);
                // Continue with next search
            }
        }
        
    } catch (error) {
        log(`News search error: ${error.message}`);
    }
    
    // Fallback to curated content if search fails or returns no results
    if (newsItems.length === 0) {
        log('Using fallback curated news content');
        newsItems.push(
            {
                title: "Australian AI job market showing strong growth",
                summary: "Tech companies across NSW continue hiring AI specialists with competitive salaries",
                relevance: "Direct impact on your career transition timeline",
                actionable: "Monitor job boards for AI implementation roles",
                source: "Market Analysis",
                priority: "HIGH"
            },
            {
                title: "Python skills remain critical for AI development",
                summary: "Python proficiency continues to be required for majority of AI engineering positions",
                relevance: "Aligns with your current skill development focus",
                actionable: "Continue daily Python practice and add AI libraries",
                source: "Skills Analysis",
                priority: "HIGH"
            }
        );
    }
    
    return {
        date: dateStr,
        headlines: newsItems.slice(0, 4), // Max 4 items total
        marketContext: "NSW tech sector maintains momentum in AI adoption"
    };
}

/**
 * Extract headlines from firecrawl search results
 */
function extractHeadlines(searchResult, query) {
    const headlines = [];
    
    try {
        // Simple extraction logic - in practice would need more sophisticated parsing
        const lines = searchResult.split('\n').filter(line => line.trim());
        
        // Look for title-like lines
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
            const line = lines[i].trim();
            if (line.length > 20 && line.length < 200) {
                headlines.push({
                    title: line.replace(/^#+\s*/, ''), // Remove markdown headers
                    summary: `Recent development in ${query.split(' ').slice(0, 3).join(' ')}`,
                    relevance: "Relevant to your AI engineering transition",
                    actionable: "Consider for career planning",
                    source: "Web Search",
                    priority: "MEDIUM"
                });
                
                if (headlines.length >= 2) break; // Max 2 per search
            }
        }
        
    } catch (error) {
        log(`Error extracting headlines: ${error.message}`);
    }
    
    return headlines;
}

/**
 * Analyze skill development progress
 */
function analyzeSkillProgress(skillMatrix, gapAnalysis) {
    if (!skillMatrix || !gapAnalysis) return null;
    
    const progress = {
        weeklyImprovement: 0,
        targetProgress: 0,
        focusAreas: [],
        quickWins: []
    };
    
    // Calculate recent improvements
    const lastWeek = skillMatrix.experience_log?.[skillMatrix.experience_log.length - 1];
    if (lastWeek) {
        progress.weeklyImprovement = lastWeek.checks.length;
    }
    
    // Calculate overall target progress
    let totalCurrent = 0;
    let totalTarget = 0;
    let skillCount = 0;
    
    for (const category of Object.values(skillMatrix.categories)) {
        for (const skill of Object.values(category.skills)) {
            totalCurrent += skill.current;
            totalTarget += skill.target;
            skillCount++;
        }
    }
    
    progress.targetProgress = Math.round((totalCurrent / totalTarget) * 100);
    
    // Identify focus areas from gap analysis
    progress.focusAreas = gapAnalysis.highDemandGaps
        .slice(0, 3)
        .map(gap => ({
            skill: gap.skill,
            marketDemand: gap.marketDemand,
            currentLevel: gap.currentLevel,
            priority: gap.priority
        }));
    
    // Identify quick wins (skills close to target)
    for (const [categoryName, category] of Object.entries(skillMatrix.categories)) {
        for (const [skillName, skill] of Object.entries(category.skills)) {
            const gapToTarget = skill.target - skill.current;
            if (gapToTarget > 0 && gapToTarget <= 10 && skill.current >= 30) {
                progress.quickWins.push({
                    skill: `${categoryName}.${skillName}`,
                    current: skill.current,
                    target: skill.target,
                    gap: gapToTarget
                });
            }
        }
    }
    
    return progress;
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(jobMarketData, skillProgress, gapAnalysis) {
    const recommendations = [];
    
    if (gapAnalysis?.highDemandGaps?.length > 0) {
        const topGap = gapAnalysis.highDemandGaps[0];
        recommendations.push({
            type: 'SKILL_FOCUS',
            priority: 'HIGH',
            action: `Dedicate 5 hours this week to ${topGap.skill}`,
            reason: `Appears in ${topGap.marketDemand.toFixed(1)}% of relevant jobs`,
            timeframe: 'This week'
        });
    }
    
    if (skillProgress?.quickWins?.length > 0) {
        const quickWin = skillProgress.quickWins[0];
        recommendations.push({
            type: 'QUICK_WIN',
            priority: 'MEDIUM',
            action: `Push ${quickWin.skill} from ${quickWin.current}% to ${quickWin.target}%`,
            reason: 'Close to target - easy achievement to boost momentum',
            timeframe: 'Next 2 weeks'
        });
    }
    
    // Always include daily practice recommendation
    recommendations.push({
        type: 'DAILY_HABIT',
        priority: 'HIGH',
        action: 'Read and understand 1 piece of AI-generated Python code',
        reason: 'Builds pattern recognition and coding intuition',
        timeframe: 'Daily (20 minutes)'
    });
    
    // Add portfolio project recommendation
    recommendations.push({
        type: 'PORTFOLIO',
        priority: 'MEDIUM',
        action: 'Spend 2 hours on RuneQuest-themed AI project',
        reason: 'Demonstrates practical skills and maintains engagement',
        timeframe: 'This weekend'
    });
    
    return recommendations.slice(0, 4); // Top 4 recommendations
}

/**
 * Generate the daily brief
 */
async function generateDailyBrief(saveToFile = false) {
    log('Generating daily brief...');
    
    // Use Sydney time for consistent dates
    const sydneyTime = getSydneyTime ? getSydneyTime() : null;
    const today = sydneyTime ? sydneyTime.date : new Date().toISOString().split('T')[0];
    
    // Gather data
    const newsBrief = await generateNewsBriefing(today);
    const jobMarketData = getLatestJobMarketData();
    const gapAnalysis = getLatestGapAnalysis();
    const skillMatrix = getCurrentSkills();
    const skillProgress = analyzeSkillProgress(skillMatrix, gapAnalysis);
    const recommendations = generateRecommendations(jobMarketData, skillProgress, gapAnalysis);
    
    // Build the brief
    let brief = `# Daily Brief - ${today}\n\n`;
    brief += `*Your AI Engineering Journey Progress Report*\n\n`;
    
    // News section
    brief += `## 🔍 Market Intelligence\n\n`;
    if (newsBrief) {
        for (const headline of newsBrief.headlines) {
            brief += `### ${headline.title}\n`;
            brief += `${headline.summary}\n\n`;
            brief += `**Why this matters to you:** ${headline.relevance}\n`;
            brief += `**Action:** ${headline.actionable}\n\n`;
        }
    }
    
    // Skills progress
    if (skillProgress) {
        brief += `## 📈 Your Progress This Week\n\n`;
        brief += `- **Skills Improved:** ${skillProgress.weeklyImprovement} skills leveled up\n`;
        brief += `- **Overall Target Progress:** ${skillProgress.targetProgress}% toward 2026 goals\n\n`;
        
        if (skillProgress.focusAreas.length > 0) {
            brief += `### High-Demand Skills to Focus On\n\n`;
            for (const area of skillProgress.focusAreas) {
                brief += `- **${area.skill}**: ${area.marketDemand.toFixed(1)}% of jobs require this (your level: ${area.currentLevel}%)\n`;
            }
            brief += `\n`;
        }
        
        if (skillProgress.quickWins.length > 0) {
            brief += `### Quick Wins Available\n\n`;
            for (const win of skillProgress.quickWins) {
                brief += `- **${win.skill}**: Just ${win.gap}% away from target (${win.current}% → ${win.target}%)\n`;
            }
            brief += `\n`;
        }
    }
    
    // Job market insights
    if (jobMarketData) {
        brief += `## 💼 Job Market Snapshot\n\n`;
        brief += `*Last updated: ${jobMarketData.month}*\n\n`;
        
        // Show top 3 in-demand skills
        const topSkills = [];
        for (const category in jobMarketData.skillsAnalysis.totalCounts) {
            for (const skill in jobMarketData.skillsAnalysis.totalCounts[category]) {
                const count = jobMarketData.skillsAnalysis.totalCounts[category][skill];
                if (count > 0) {
                    const totalJobs = jobMarketData.skillsAnalysis.totalJobs;
                    topSkills.push({ 
                        skill, 
                        percentage: (count / totalJobs) * 100,
                        count 
                    });
                }
            }
        }
        
        topSkills.sort((a, b) => b.percentage - a.percentage);
        
        brief += `**Most In-Demand Skills:**\n`;
        topSkills.slice(0, 5).forEach((item, index) => {
            brief += `${index + 1}. ${item.skill} (${item.percentage.toFixed(1)}% of jobs)\n`;
        });
        brief += `\n`;
        
        // Salary insights
        if (jobMarketData.salaryTrends?.salaryByLevel) {
            brief += `**Salary Ranges (AUD):**\n`;
            for (const [level, data] of Object.entries(jobMarketData.salaryTrends.salaryByLevel)) {
                if (data.average) {
                    brief += `- ${level.charAt(0).toUpperCase() + level.slice(1)}: $${data.average.toLocaleString()} average\n`;
                }
            }
            brief += `\n`;
        }
    }
    
    // Recommendations
    brief += `## 🎯 Today's Action Plan\n\n`;
    recommendations.forEach((rec, index) => {
        const emoji = rec.priority === 'HIGH' ? '🔥' : rec.priority === 'MEDIUM' ? '⚡' : '💡';
        brief += `${index + 1}. ${emoji} **${rec.action}**\n`;
        brief += `   *${rec.reason}* (${rec.timeframe})\n\n`;
    });
    
    // Motivation
    brief += `## 🗿 Rune of the Day\n\n`;
    brief += `*"The path from Initiate to Rune Lord requires not just knowledge, but consistent practice and adaptation to the changing world of Glorantha."*\n\n`;
    brief += `**Your journey:** From Technical Support to AI Engineer by mid-2026\n`;
    brief += `**Days remaining:** ${Math.ceil((new Date('2026-07-01') - new Date()) / (1000 * 60 * 60 * 24))} days\n`;
    brief += `**This week's focus:** Turn market intelligence into skill development momentum\n\n`;
    
    brief += `---\n`;
    const generatedTime = sydneyTime ? `${sydneyTime.full} (${sydneyTime.day})` : new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });
    brief += `*Daily brief generated on ${generatedTime}*\n`;
    
    // Save to file if requested
    if (saveToFile) {
        const filename = `daily-brief-${today}.md`;
        const filepath = path.join(JOURNAL_DIR, filename);
        
        const briefWithMetadata = `---
date: ${today}
type: daily-brief
status: final
privacy: private
generated: ${sydneyTime ? sydneyTime.timestamp : new Date().toISOString()}
timezone: Australia/Sydney
---

${brief}`;
        
        fs.writeFileSync(filepath, briefWithMetadata);
        log(`Daily brief saved to ${filepath}`);
    }
    
    return {
        brief,
        stats: {
            newsItems: newsBrief?.headlines?.length || 0,
            recommendations: recommendations.length,
            skillProgress: skillProgress?.targetProgress || 0,
            marketDataAge: jobMarketData ? `${today} vs ${jobMarketData.month}` : 'No data'
        }
    };
}

/**
 * Refresh job market data if it's old
 */
async function refreshJobMarketDataIfNeeded() {
    const trendsFile = path.join(RESEARCH_DIR, 'market-trends.json');
    
    if (!fs.existsSync(trendsFile)) {
        log('No job market data found, running fresh analysis...');
        return await runJobMarketAnalysis(true);
    }
    
    const trends = JSON.parse(fs.readFileSync(trendsFile, 'utf8'));
    const lastUpdate = new Date(trends.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdate) / (1000 * 60 * 60 * 24);
    
    if (daysSinceUpdate > 7) { // Refresh weekly
        log('Job market data is over a week old, refreshing...');
        return await runJobMarketAnalysis(true);
    }
    
    return null;
}

// Export for use in other scripts
export { generateDailyBrief, refreshJobMarketDataIfNeeded };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const shouldSave = process.argv.includes('--save');
    
    // Refresh job market data if needed
    refreshJobMarketDataIfNeeded()
        .then(() => generateDailyBrief(shouldSave))
        .then(result => {
            console.log('\n' + result.brief);
            if (shouldSave) {
                log(`Brief generated with ${result.stats.recommendations} recommendations`);
            }
        })
        .catch(error => {
            console.error('Failed to generate daily brief:', error);
            process.exit(1);
        });
}