#!/usr/bin/env node

/**
 * Automated Weekly Review System
 * Purpose: Automatically generates weekly review from daily check-ins, victories, and planning data
 * Usage: node scripts/automated-weekly-review.cjs [week-id]
 * Dependencies: fs, path
 * 
 * This script automatically:
 * - Gathers data from daily journal entries
 * - Analyzes weekly planning objectives
 * - Detects victories from accomplishments
 * - Calculates energy/mood patterns
 * - Generates comprehensive review report
 * - No user interaction required
 */

const fs = require('fs');
const path = require('path');

// Configuration
const JOURNAL_DIR = path.join(__dirname, '..', 'journal', 'daily');
const DAILY_REVIEWS_DIR = path.join(__dirname, '..', 'journal', 'planning', 'daily-reviews');
const PLANNING_DIR = path.join(__dirname, '..', 'planning', 'data');
const REVIEW_DIR = path.join(__dirname, '..', 'journal', 'planning', 'weekly-reviews');
const VICTORIES_DIR = path.join(__dirname, '..', 'victories');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
[REVIEW_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Sydney timezone utilities
function getSydneyDate(date = new Date()) {
    return new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
}

function formatSydneyDateString(date = new Date()) {
    const sydneyDate = new Date(date.toLocaleString('en-US', { timeZone: 'Australia/Sydney' }));
    return sydneyDate.toISOString().split('T')[0];
}

// Get week number and dates
function getWeekInfo(date = new Date()) {
    const sydneyDate = getSydneyDate(date);
    const year = sydneyDate.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysOfYear = (sydneyDate - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    
    // Get Monday (start) and Sunday (end) of the week
    const dayOfWeek = sydneyDate.getDay();
    const diff = sydneyDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(sydneyDate.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    
    return {
        weekId: `${year}-W${weekNumber.toString().padStart(2, '0')}`,
        weekNumber,
        year,
        startDate: formatSydneyDateString(monday),
        endDate: formatSydneyDateString(sunday),
        dates: Array.from({length: 7}, (_, i) => {
            const date = new Date(monday);
            date.setDate(date.getDate() + i);
            return formatSydneyDateString(date);
        })
    };
}

// Parse week ID (e.g., "2025-W35" or "current" or "last")
function parseWeekId(weekStr) {
    if (!weekStr || weekStr === 'current') {
        return getWeekInfo();
    }
    
    if (weekStr === 'last') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        return getWeekInfo(lastWeek);
    }
    
    // Parse format like "2025-W35"
    const match = weekStr.match(/^(\d{4})-W(\d{2})$/);
    if (match) {
        const year = parseInt(match[1]);
        const weekNum = parseInt(match[2]);
        
        // Calculate date from week number
        const jan1 = new Date(year, 0, 1);
        const daysToAdd = (weekNum - 1) * 7;
        const targetDate = new Date(jan1);
        targetDate.setDate(jan1.getDate() + daysToAdd);
        
        return getWeekInfo(targetDate);
    }
    
    throw new Error(`Invalid week format: ${weekStr}. Use YYYY-WXX, 'current', or 'last'`);
}

// Load and parse daily journal entry
function loadDailyJournal(date) {
    const filePath = path.join(JOURNAL_DIR, `daily-${date}.md`);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const data = {
        date,
        exists: true,
        sessions: [],
        overallFeeling: null,
        energy: { morning: null, noon: null, evening: null },
        accomplishments: [],
        challenges: [],
        gratitude: [],
        priorities: [],
        reflections: []
    };
    
    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const sessionsMatch = frontmatter.match(/sessions:\s*\[(.*?)\]/);
        if (sessionsMatch) {
            data.sessions = sessionsMatch[1].split(',').map(s => s.trim());
        }
    }
    
    // Parse content sections
    let currentSection = '';
    for (const line of lines) {
        // Section headers
        if (line.includes('Morning Check-in')) currentSection = 'morning';
        else if (line.includes('Noon Check-in')) currentSection = 'noon';
        else if (line.includes('Evening Check-in')) currentSection = 'evening';
        
        // Extract data based on patterns
        if (line.includes('Overall Day Feeling:')) {
            const match = line.match(/(\d+)\/10/);
            if (match) data.overallFeeling = parseInt(match[1]);
        }
        
        if (line.includes('Energy') && line.includes(':')) {
            const match = line.match(/(\d+)\/10/);
            if (match) {
                if (currentSection === 'morning') data.energy.morning = parseInt(match[1]);
                else if (currentSection === 'noon') data.energy.noon = parseInt(match[1]);
                else if (currentSection === 'evening') data.energy.evening = parseInt(match[1]);
            }
        }
        
        // Accomplishments (numbered list after "Accomplishments:")
        if (line.match(/^\d+\.\s+(.+)/) && currentSection) {
            const accomplishment = line.replace(/^\d+\.\s+/, '').trim();
            if (accomplishment && !data.accomplishments.includes(accomplishment)) {
                data.accomplishments.push(accomplishment);
            }
        }
        
        if (line.includes('Challenges/Blockers:')) {
            const challenge = line.replace(/.*Challenges\/Blockers:\s*/, '').trim();
            if (challenge) data.challenges.push(challenge);
        }
        
        if (line.includes('Gratitude:')) {
            const gratitude = line.replace(/.*Gratitude:\s*/, '').trim();
            if (gratitude) data.gratitude.push(gratitude);
        }
        
        if (line.includes('Priority:')) {
            const priority = line.replace(/.*Priority:\s*/, '').trim();
            if (priority) data.priorities.push(priority);
        }
        
        if (line.includes('Reflections:')) {
            const reflection = line.replace(/.*Reflections:\s*/, '').trim();
            if (reflection) data.reflections.push(reflection);
        }
    }
    
    return data;
}

// Load and parse daily review entry  
function loadDailyReview(date) {
    const filePath = path.join(DAILY_REVIEWS_DIR, `review-${date}.md`);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    const data = {
        date,
        exists: true,
        completionRate: null,
        energyAverage: null,
        focusAverage: null,
        satisfaction: null,
        timeBlocksCompleted: 0,
        timeBlocksTotal: 0,
        objectivesCompleted: 0,
        objectivesTotal: 0,
        accomplishments: [],
        challenges: [],
        insights: [],
        recommendations: []
    };
    
    // Parse frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        
        const completionMatch = frontmatter.match(/completion_rate:\s*([0-9.]+)/);
        if (completionMatch) data.completionRate = parseFloat(completionMatch[1]);
        
        const energyMatch = frontmatter.match(/energy_average:\s*([0-9.]+)/);
        if (energyMatch) data.energyAverage = parseFloat(energyMatch[1]);
        
        const focusMatch = frontmatter.match(/focus_average:\s*([0-9.]+)/);
        if (focusMatch) data.focusAverage = parseFloat(focusMatch[1]);
        
        const satisfactionMatch = frontmatter.match(/satisfaction:\s*([0-9.]+)/);
        if (satisfactionMatch) data.satisfaction = parseFloat(satisfactionMatch[1]);
    }
    
    // Parse content sections
    for (const line of lines) {
        // Time blocks and objectives completion
        if (line.includes('Time blocks completed:')) {
            const match = line.match(/(\d+)\/(\d+)/);
            if (match) {
                data.timeBlocksCompleted = parseInt(match[1]);
                data.timeBlocksTotal = parseInt(match[2]);
            }
        }
        
        if (line.includes('Objectives achieved:')) {
            const match = line.match(/(\d+)\/(\d+)/);
            if (match) {
                data.objectivesCompleted = parseInt(match[1]);
                data.objectivesTotal = parseInt(match[2]);
            }
        }
        
        // Extract accomplishments from Major Technical Victories, Hidden Productivity Insights, etc.
        if (line.match(/^\d+\.\s+\*\*(.+?)\*\*:/) || line.match(/^- \*\*(.+?)\*\*:/)) {
            const accomplishment = line.replace(/^\d+\.\s+\*\*/, '').replace(/^- \*\*/, '').replace(/\*\*:.*/, '').trim();
            if (accomplishment && !data.accomplishments.includes(accomplishment)) {
                data.accomplishments.push(accomplishment);
            }
        }
        
        // Extract challenges
        if (line.match(/^\d+\.\s+\*\*(.+?)Challenge/i) || line.includes('Primary Challenge:') || line.includes('Struggle:')) {
            const challenge = line.replace(/^\d+\.\s+\*\*/, '').replace(/Primary Challenge:\s*/, '').replace(/Struggle:\s*/, '').replace(/\*\*.*/, '').trim();
            if (challenge && !data.challenges.includes(challenge)) {
                data.challenges.push(challenge);
            }
        }
        
        // Extract insights
        if (line.includes('Critical Discovery:') || line.includes('Insight:') || line.includes('Key Insight:')) {
            const insight = line.replace(/.*Critical Discovery:\s*/, '').replace(/.*Insight:\s*/, '').replace(/.*Key Insight:\s*/, '').trim();
            if (insight && !data.insights.includes(insight)) {
                data.insights.push(insight);
            }
        }
        
        // Extract recommendations  
        if (line.includes('Recommendation:') || line.includes('Strategy:') || line.includes('Next Actions:')) {
            const recommendation = line.replace(/.*Recommendation:\s*/, '').replace(/.*Strategy:\s*/, '').replace(/.*Next Actions:\s*/, '').trim();
            if (recommendation && !data.recommendations.includes(recommendation)) {
                data.recommendations.push(recommendation);
            }
        }
    }
    
    return data;
}

// Load weekly plan data
function loadWeeklyPlan(weekId) {
    const filePath = path.join(PLANNING_DIR, `week-${weekId}.json`);
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (error) {
        console.error(`Error loading weekly plan: ${error.message}`);
        return null;
    }
}

// Analyze objectives completion from daily data
function analyzeObjectiveCompletion(weekPlan, dailyDataArray) {
    if (!weekPlan || !weekPlan.objectives) return [];
    
    // Look for evidence of objective completion in daily accomplishments
    const allAccomplishments = dailyDataArray
        .filter(d => d && d.accomplishments && Array.isArray(d.accomplishments))
        .flatMap(d => d.accomplishments.map(a => ({ text: a.toLowerCase(), date: d.date })));
    
    const objectives = weekPlan.objectives.map(obj => {
        // Start with what was tracked in the plan
        let actualCompleted = obj.completed || 0;
        
        // Try to detect actual completion from accomplishments
        const description = obj.description.toLowerCase();
        const evidenceFound = [];
        
        // Check for boot.dev practice
        if (description.includes('boot.dev')) {
            const bootDevDays = allAccomplishments.filter(a => 
                a.text.includes('boot.dev') || 
                a.text.includes('python') && a.text.includes('hour')
            );
            if (bootDevDays.length > actualCompleted) {
                actualCompleted = bootDevDays.length;
                evidenceFound.push(...bootDevDays.map(d => d.date));
            }
        }
        
        // Check for tmux/neovim setup (but recognize this as setup, not a primary goal)
        if (description.includes('tmux') || description.includes('vim')) {
            const tmuxSetup = allAccomplishments.filter(a => 
                a.text.includes('tmux') || 
                a.text.includes('nvim') || 
                a.text.includes('neovim') ||
                a.text.includes('sessionx')
            );
            // Count setup as complete if any meaningful setup was done
            if (tmuxSetup.length > 0) {
                actualCompleted = Math.min(tmuxSetup.length, target);
                evidenceFound.push(...tmuxSetup.map(d => d.date));
            }
        }
        
        // Check for AI projects
        if (description.includes('ai') && description.includes('project')) {
            const aiProjects = allAccomplishments.filter(a => 
                (a.text.includes('ai') || a.text.includes('cli')) && 
                (a.text.includes('built') || a.text.includes('created') || a.text.includes('implemented'))
            );
            if (aiProjects.length > actualCompleted) {
                actualCompleted = aiProjects.length;
                evidenceFound.push(...aiProjects.map(d => d.date));
            }
        }
        
        const target = obj.target || 1;
        const percentage = target > 0 ? (actualCompleted / target) * 100 : 0;
        
        return {
            ...obj,
            actualCompleted,
            completionRate: percentage,
            status: percentage >= 100 ? '✅' : percentage > 0 ? '⏳' : '❌',
            evidenceDates: [...new Set(evidenceFound)]
        };
    });
    
    return objectives;
}

// Calculate well-being metrics from daily data
function calculateIntegratedMetrics(dailyDataArray, dailyReviewsArray) {
    const metrics = {
        energyAverage: 0,
        focusAverage: 0,
        satisfactionAverage: 0,
        energyTrend: [],
        energySources: "subjective+objective",
        bestDays: [],
        challengingDays: [],
        objectivePerformance: {
            avgCompletionRate: 0,
            avgTimeBlockEffectiveness: 0,
            totalObjectivesCompleted: 0,
            totalObjectivesPlanned: 0
        }
    };
    
    const energyValues = [];
    const focusValues = [];
    const feelingValues = [];
    const satisfactionValues = [];
    
    // Process subjective data (daily journals)
    dailyDataArray.forEach((day, index) => {
        if (!day) return;
        
        // Collect energy values from check-ins
        const dayEnergy = [day.energy.morning, day.energy.noon, day.energy.evening]
            .filter(e => e !== null);
        if (dayEnergy.length > 0) {
            const avgEnergy = dayEnergy.reduce((a, b) => a + b, 0) / dayEnergy.length;
            energyValues.push(avgEnergy);
            
            // Also check objective energy if available
            const review = dailyReviewsArray[index];
            if (review && review.energyAverage !== null) {
                // Average subjective and objective energy
                const integratedEnergy = (avgEnergy + review.energyAverage) / 2;
                energyValues[energyValues.length - 1] = integratedEnergy;
                metrics.energyTrend.push({ date: day.date, energy: integratedEnergy, sources: "both" });
            } else {
                metrics.energyTrend.push({ date: day.date, energy: avgEnergy, sources: "subjective" });
            }
            
            if (energyValues[energyValues.length - 1] >= 7) {
                metrics.bestDays.push(day.date);
            } else if (energyValues[energyValues.length - 1] <= 4) {
                metrics.challengingDays.push({ date: day.date, reason: 'Low energy' });
            }
        }
        
        // Collect overall feeling for satisfaction
        if (day.overallFeeling) {
            feelingValues.push(day.overallFeeling);
        }
    });
    
    // Process objective data (daily reviews)
    let totalCompletionRate = 0, totalObjectives = 0, completionCount = 0;
    
    dailyReviewsArray.forEach(review => {
        if (!review) return;
        
        // Collect focus/effectiveness data
        if (review.focusAverage !== null) {
            focusValues.push(review.focusAverage);
        }
        
        // Collect satisfaction from objective reviews
        if (review.satisfaction !== null) {
            satisfactionValues.push(review.satisfaction);
        }
        
        // Aggregate objective performance metrics
        if (review.completionRate !== null) {
            totalCompletionRate += review.completionRate;
            completionCount++;
        }
        
        totalObjectives += review.objectivesTotal;
        metrics.objectivePerformance.totalObjectivesCompleted += review.objectivesCompleted;
    });
    
    // Calculate integrated averages
    if (energyValues.length > 0) {
        metrics.energyAverage = energyValues.reduce((a, b) => a + b, 0) / energyValues.length;
    }
    
    // Focus from objective reviews (more accurate than energy approximation)
    if (focusValues.length > 0) {
        metrics.focusAverage = focusValues.reduce((a, b) => a + b, 0) / focusValues.length;
    } else {
        // Fallback to energy approximation
        metrics.focusAverage = metrics.energyAverage;
    }
    
    // Satisfaction from both subjective feelings and objective satisfaction
    const allSatisfactionValues = [...feelingValues, ...satisfactionValues];
    if (allSatisfactionValues.length > 0) {
        metrics.satisfactionAverage = allSatisfactionValues.reduce((a, b) => a + b, 0) / allSatisfactionValues.length;
    }
    
    // Calculate objective performance metrics
    if (completionCount > 0) {
        metrics.objectivePerformance.avgCompletionRate = totalCompletionRate / completionCount;
    }
    metrics.objectivePerformance.totalObjectivesPlanned = totalObjectives;
    
    return metrics;
}

// Detect victories from both subjective accomplishments and objective achievements
function detectIntegratedVictories(dailyDataArray, dailyReviewsArray) {
    const victories = [];
    const victoryPatterns = [
        { pattern: /built|created|implemented|developed/i, category: 'technical' },
        { pattern: /completed|finished|achieved|delivered/i, category: 'discipline' },
        { pattern: /learned|understood|figured out|discovered/i, category: 'learning' },
        { pattern: /improved|optimized|fixed|resolved/i, category: 'problem-solving' },
        { pattern: /organized|planned|structured|documented/i, category: 'organization' },
        { pattern: /streak|consistent|maintained|continued/i, category: 'persistence' },
        { pattern: /recognized|realized|awareness/i, category: 'self-awareness' }
    ];
    
    // Process subjective accomplishments from daily journals
    dailyDataArray.forEach(day => {
        if (!day || !day.accomplishments) return;
        
        day.accomplishments.forEach(accomplishment => {
            victoryPatterns.forEach(({ pattern, category }) => {
                if (pattern.test(accomplishment)) {
                    victories.push({
                        date: day.date,
                        description: accomplishment,
                        category,
                        source: 'subjective',
                        detected: true
                    });
                }
            });
        });
    });
    
    // Process objective achievements from daily reviews
    dailyReviewsArray.forEach(review => {
        if (!review) return;
        
        // Add high completion rate as victory
        if (review.completionRate !== null && review.completionRate >= 80) {
            victories.push({
                date: review.date,
                description: `High completion rate: ${review.completionRate}% of objectives`,
                category: 'discipline',
                source: 'objective',
                detected: true
            });
        }
        
        // Add high focus/effectiveness as victory
        if (review.focusAverage !== null && review.focusAverage >= 7) {
            victories.push({
                date: review.date,
                description: `Strong focus and effectiveness: ${review.focusAverage}/10`,
                category: 'performance',
                source: 'objective',
                detected: true
            });
        }
        
        // Process accomplishments from review content
        if (review.accomplishments) {
            review.accomplishments.forEach(accomplishment => {
                victoryPatterns.forEach(({ pattern, category }) => {
                    if (pattern.test(accomplishment)) {
                        victories.push({
                            date: review.date,
                            description: accomplishment,
                            category,
                            source: 'objective',
                            detected: true
                        });
                    }
                });
            });
        }
    });
    
    return victories;
}

// Generate integrated weekly review report from both subjective and objective data
function generateIntegratedWeeklyReview(weekInfo, weekPlan, dailyDataArray, dailyReviewsArray, metrics, victories, objectives) {
    const today = formatSydneyDateString();
    const completedObjectives = objectives?.filter(o => o.actualCompleted >= o.target) || [];
    const partialObjectives = objectives?.filter(o => o.actualCompleted > 0 && o.actualCompleted < o.target) || [];
    const notStartedObjectives = objectives?.filter(o => o.actualCompleted === 0) || [];
    const totalObjectives = objectives?.length || 0;
    const completionRate = totalObjectives > 0 
        ? (completedObjectives.length / totalObjectives) * 100 
        : 0;
    
    // Gather all accomplishments
    const allAccomplishments = dailyDataArray
        .filter(d => d && d.accomplishments)
        .flatMap(d => d.accomplishments);
    
    // Gather all challenges
    const allChallenges = dailyDataArray
        .filter(d => d && d.challenges)
        .flatMap(d => d.challenges);
    
    // Gather insights from reflections
    const insights = dailyDataArray
        .filter(d => d && d.reflections)
        .flatMap(d => d.reflections)
        .filter(r => r.length > 0);
    
    const report = `---
date: ${today}
week: ${weekInfo.weekId}
type: weekly-review
completion_rate: ${completionRate.toFixed(1)}
satisfaction: ${metrics.satisfactionAverage.toFixed(1)}/10
energy_average: ${metrics.energyAverage.toFixed(1)}/10
focus_average: ${metrics.focusAverage.toFixed(1)}/10
---

# Weekly Review: Week ${weekInfo.weekNumber}, ${weekInfo.year}

## 📊 Performance Summary
- **Week Range:** ${weekInfo.startDate} to ${weekInfo.endDate}
- **Objectives completed:** ${completedObjectives.length}/${totalObjectives} (${completionRate.toFixed(1)}%)
- **Overall satisfaction:** ${metrics.satisfactionAverage.toFixed(1)}/10
- **Days with journal entries:** ${dailyDataArray.filter(d => d).length}/7

## 🎯 Planned vs Actual Analysis

### Weekly Theme & Priorities
${weekPlan ? `
**Theme:** ${weekPlan.theme || 'No theme set'}
**Context:** ${weekPlan.context || 'No context provided'}

**Priorities Set:**
${weekPlan.priorities?.map((p, i) => `${i + 1}. ${p}`).join('\n') || 'No priorities defined'}
` : '⚠️ No weekly plan was created - working without clear objectives'}

### ✅ Completed Objectives
${completedObjectives.length > 0 ? completedObjectives.map(obj => 
    `- **${obj.description}**: ${obj.actualCompleted}/${obj.target} ${obj.metric || 'completed'} ✓
  Evidence found on: ${obj.evidenceDates.join(', ')}`
).join('\n') : '- No objectives fully completed this week'}

### ⏳ Partially Completed
${partialObjectives.length > 0 ? partialObjectives.map(obj =>
    `- **${obj.description}**: ${obj.actualCompleted}/${obj.target} ${obj.metric || 'completed'} (${obj.completionRate.toFixed(0)}%)
  ${obj.priority === 'critical' ? '⚠️ CRITICAL PRIORITY - needs immediate attention' : ''}
  Evidence found on: ${obj.evidenceDates.join(', ') || 'No direct evidence found'}`
).join('\n') : '- No partially completed objectives'}

### ❌ Not Started
${notStartedObjectives.length > 0 ? notStartedObjectives.map(obj =>
    `- **${obj.description}**: Not started ${obj.priority === 'critical' ? '🚨 CRITICAL' : obj.priority === 'high' ? '⚠️ HIGH PRIORITY' : ''}`
).join('\n') : '- All objectives had some progress'}

### 📊 Objective Completion Analysis
- **Overall completion:** ${completionRate.toFixed(0)}% of objectives fully completed
- **Critical priorities:** ${objectives?.filter(o => o.priority === 'critical').map(o => 
    `${o.description} (${o.actualCompleted}/${o.target})`).join(', ') || 'None set'}
- **Success pattern:** ${completedObjectives.length > 0 ? 'Strong execution on: ' + completedObjectives.map(o => o.description).join(', ') : 
    partialObjectives.length > 0 ? 'Progress made but needs focus to complete objectives' : 
    'Objectives need clearer definition or different approach'}

## 💪 Well-being Metrics
- **Average energy level:** ${metrics.energyAverage.toFixed(1)}/10
- **Average focus quality:** ${metrics.focusAverage.toFixed(1)}/10
- **Week satisfaction:** ${metrics.satisfactionAverage.toFixed(1)}/10
- **Best performance days:** ${metrics.bestDays.length > 0 ? metrics.bestDays.join(', ') : 'No standout high-energy days'}
- **Challenging days:** ${metrics.challengingDays.length > 0 ? 
    metrics.challengingDays.map(d => `${d.date} (${d.reason})`).join(', ') : 
    'No particularly challenging days'}

## 📈 Energy Trend
${metrics.energyTrend.map(d => 
    `- ${d.date}: ${d.energy.toFixed(1)}/10`
).join('\n') || 'No energy data available'}

## 🔍 Weekly Insights
${insights.length > 0 ? insights.map((insight, i) => 
    `${i + 1}. ${insight}`
).join('\n') : 'No specific insights captured this week'}

## 🏆 Accomplishments & Wins
${allAccomplishments.length > 0 ? allAccomplishments.slice(0, 10).map((acc, i) => 
    `${i + 1}. ${acc}`
).join('\n') : 'No accomplishments recorded'}

${allAccomplishments.length > 10 ? `\n*Plus ${allAccomplishments.length - 10} more accomplishments...*` : ''}

## 🚧 Challenges & Obstacles
${allChallenges.length > 0 ? allChallenges.map((challenge, i) => 
    `${i + 1}. ${challenge}`
).join('\n') : 'No major challenges recorded'}

## 🎯 Parent Plan Alignment
### Monthly Goal Contribution
${weekPlan?.parentAlignment?.monthId ? 
    `This week contributed to monthly objectives for ${weekPlan.parentAlignment.monthId}` :
    'No monthly plan alignment configured'}

### Quarterly Strategic Progress
${weekPlan?.parentAlignment?.quarterId ?
    `Aligned with quarterly priorities for ${weekPlan.parentAlignment.quarterId}` :
    'No quarterly alignment configured'}

## 🔄 Performance Patterns
- **Most productive days:** ${metrics.bestDays.join(', ') || 'No clear pattern'}
- **Energy optimization:** ${metrics.energyAverage >= 6 ? 'Good energy management' : 'Room for energy improvement'}
- **Consistency:** ${dailyDataArray.filter(d => d).length >= 5 ? 'Strong daily check-in habit' : 'Improve daily check-in consistency'}

## 🎉 Victory Detection
${victories.length > 0 ? `Detected ${victories.length} victories from accomplishments:
${victories.slice(0, 5).map(v => 
    `- **${v.date}** [${v.category}]: ${v.description}`
).join('\n')}` : 'No automatic victories detected'}

## 🎯 Strategic Feedback for Goal Alignment

### What's Working Well
${victories.length >= 5 ? `- Strong momentum with ${victories.length} victories detected\n` : ''}${metrics.energyAverage >= 6 ? '- Good energy management maintaining ' + metrics.energyAverage.toFixed(1) + '/10 average\n' : ''}${dailyDataArray.filter(d => d).length >= 5 ? '- Excellent daily check-in consistency\n' : ''}${completedObjectives.length > 0 ? '- Successfully completed: ' + completedObjectives.map(o => o.description).join(', ') + '\n' : ''}

### Areas Needing Attention
${partialObjectives.filter(o => o.priority === 'critical').length > 0 ? 
`🚨 **Critical objectives incomplete:**
${partialObjectives.filter(o => o.priority === 'critical').map(o => 
  `  - ${o.description}: Only ${o.actualCompleted}/${o.target} completed`
).join('\n')}
` : ''}${notStartedObjectives.filter(o => o.priority === 'high' || o.priority === 'critical').length > 0 ?
`⚠️ **High priority objectives not started:**
${notStartedObjectives.filter(o => o.priority === 'high' || o.priority === 'critical').map(o =>
  `  - ${o.description} (${o.priority})`
).join('\n')}
` : ''}${metrics.energyAverage < 6 ? '- Low energy average (' + metrics.energyAverage.toFixed(1) + '/10) impacting productivity\n' : ''}${allChallenges.filter(c => c.includes('tunnel vision') || c.includes('distract')).length > 0 ? '- Focus challenges detected: tunnel vision and distractions\n' : ''}

### 🔮 Specific Recommendations for Next Week

#### Priority Adjustments
${partialObjectives.filter(o => o.priority === 'critical').length > 0 ? 
`1. **Complete critical objectives first:**
${partialObjectives.filter(o => o.priority === 'critical').map(o => 
  `   - ${o.description}: Needs ${o.target - o.actualCompleted} more ${o.metric} to complete`
).join('\n')}` : 
completionRate < 50 ? 
'1. **Reduce objective count:** Focus on 2-3 high-impact objectives instead of ' + totalObjectives :
'1. **Maintain current objective load:** ' + totalObjectives + ' objectives seems appropriate'}

#### Time Allocation
${objectives?.filter(o => o.actualCompleted < o.target && o.priority === 'critical').length > 0 ?
`2. **Reallocate time to critical priorities:**
   - Morning energy peaks: Focus on ${objectives.filter(o => o.priority === 'critical')[0]?.description}
   - Use time-boxing: 90-minute focused sessions` :
'2. **Continue current time allocation** with minor adjustments based on energy patterns'}

#### Energy Optimization
${metrics.energyAverage < 6 ?
`3. **Energy recovery plan:**
   - Best performance days were: ${metrics.bestDays.join(', ') || 'varied'}
   - Schedule demanding work for high-energy times
   - Add restorative activities between intense sessions` :
`3. **Leverage high energy:** Your ${metrics.energyAverage.toFixed(1)}/10 average is good
   - Peak days: ${metrics.bestDays.join(', ') || 'consistent'}
   - Maintain current rhythm`}

#### Obstacle Mitigation
${allChallenges.length > 0 ?
`4. **Address recurring challenges:**
${allChallenges.slice(0, 3).map((c, i) => `   - ${c}`).join('\n')}
   **Solutions:** ${allChallenges.some(c => c.includes('children') || c.includes('distract')) ? 
   'Set clear boundaries, use noise-canceling headphones, work in focused blocks' :
   'Time-box tasks, take regular breaks, use Pomodoro technique'}` :
'4. **No major obstacles detected** - maintain current strategies'}

## 📝 Next Week Planning Guidance

### Objectives to Carry Forward
${partialObjectives.length > 0 ? 
`**Continue these partially completed objectives:**
${partialObjectives
  .filter(o => !o.description.toLowerCase().includes('tmux') && !o.description.toLowerCase().includes('vim'))
  .slice(0, 3).map(o => 
    `- ${o.description}: ${o.target - o.actualCompleted} ${o.metric} remaining (${100 - o.completionRate.toFixed(0)}% to go)`
).join('\n')}

**Setup tasks (lower priority):**
${partialObjectives
  .filter(o => o.description.toLowerCase().includes('tmux') || o.description.toLowerCase().includes('vim'))
  .map(o => `- ${o.description}: Consider this complete if environment is functional`)
  .join('\n') || 'None'}` :
'No objectives to carry forward - start fresh with new goals'}

### Suggested Weekly Theme
${completionRate < 30 ? `"Foundation Building - Establishing Consistent Practices"` :
completionRate < 70 ? `"Momentum Acceleration - Completing What's Started"` :
`"Excellence Expansion - Building on Strong Foundation"`}

### Core AI Development Focus
Based on your accomplishments and 2026 AI engineering goal:
${allAccomplishments.some(a => a.includes('cli') || a.includes('project')) ? 
`- **Continue AI project development** - You've shown strong progress with CLI/project work
- **Maintain boot.dev streak** - Foundation skill building
- **Apply learning immediately** - Use new concepts in actual projects` :
`- **Start an AI project** - Apply your learning to real code
- **Focus on implementation** - Less setup, more building
- **Document your progress** - Build portfolio evidence`}

### Recommended Priority Distribution
- **Critical (1-2):** ${partialObjectives
  .filter(o => o.priority === 'critical' && !o.description.toLowerCase().includes('tmux') && !o.description.toLowerCase().includes('vim'))
  .map(o => o.description).join(', ') || 'AI project development and boot.dev practice'}
- **High (2-3):** Supporting objectives that enable AI development
- **Low/Complete:** Environment setup (tmux/vim) - mark as done if functional
${totalObjectives > 5 ? '\n⚠️ **Reduce total objectives** from ' + totalObjectives + ' to 4-5 maximum for better focus' : ''}

---
*Review generated: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}*`;

    return report;
}

// Main execution
async function main() {
    const weekStr = process.argv[2];
    
    try {
        console.log('🔄 Starting automated weekly review...\n');
        
        // Parse week information
        const weekInfo = parseWeekId(weekStr);
        console.log(`📅 Reviewing Week: ${weekInfo.weekId}`);
        console.log(`📆 Date Range: ${weekInfo.startDate} to ${weekInfo.endDate}\n`);
        
        // Load weekly plan
        console.log('📋 Loading weekly plan...');
        const weekPlan = loadWeeklyPlan(weekInfo.weekId);
        if (weekPlan) {
            console.log(`✓ Found plan: "${weekPlan.theme || 'No theme'}"`);
        } else {
            console.log('⚠️  No weekly plan found');
        }
        
        // Load daily journals (subjective data)
        console.log('\n📖 Loading daily journals...');
        const dailyDataArray = weekInfo.dates.map(date => {
            const data = loadDailyJournal(date);
            if (data) {
                console.log(`✓ Found journal for ${date}`);
            }
            return data;
        });
        
        const journalCount = dailyDataArray.filter(d => d).length;
        console.log(`📊 Loaded ${journalCount}/7 daily journals`);
        
        // Load daily reviews (objective data)
        console.log('\n📋 Loading daily reviews...');
        const dailyReviewsArray = weekInfo.dates.map(date => {
            const data = loadDailyReview(date);
            if (data) {
                console.log(`✓ Found review for ${date}`);
            }
            return data;
        });
        
        const reviewCount = dailyReviewsArray.filter(d => d).length;
        console.log(`📊 Loaded ${reviewCount}/7 daily reviews`);
        
        // Analyze objective completion
        console.log('\n🎯 Analyzing objective completion...');
        const objectives = analyzeObjectiveCompletion(weekPlan, dailyDataArray);
        if (objectives.length > 0) {
            objectives.forEach(obj => {
                console.log(`  ${obj.status} ${obj.description}: ${obj.actualCompleted}/${obj.target}`);
            });
        }
        
        // Calculate integrated metrics from both subjective and objective data
        console.log('\n📈 Calculating integrated well-being metrics...');
        const metrics = calculateIntegratedMetrics(dailyDataArray, dailyReviewsArray);
        console.log(`✓ Energy average: ${metrics.energyAverage.toFixed(1)}/10 (from ${metrics.energySources})`);
        console.log(`✓ Focus average: ${metrics.focusAverage.toFixed(1)}/10 (from objective reviews)`);
        console.log(`✓ Satisfaction average: ${metrics.satisfactionAverage.toFixed(1)}/10`);
        
        // Detect victories from both subjective and objective data
        console.log('\n🏆 Detecting victories from both subjective and objective data...');
        const victories = detectIntegratedVictories(dailyDataArray, dailyReviewsArray);
        console.log(`✓ Found ${victories.length} potential victories`);
        
        // Generate integrated review report
        console.log('\n📝 Generating integrated review report...');
        const report = generateIntegratedWeeklyReview(weekInfo, weekPlan, dailyDataArray, dailyReviewsArray, metrics, victories, objectives);
        
        // Save report
        const reviewPath = path.join(REVIEW_DIR, `review-${weekInfo.weekId}.md`);
        fs.writeFileSync(reviewPath, report);
        console.log(`✓ Review saved to: ${reviewPath}`);
        
        // Log completion
        const logPath = path.join(LOGS_DIR, `weekly-review-${formatSydneyDateString()}.log`);
        const logEntry = `${new Date().toISOString()} - Generated weekly review for ${weekInfo.weekId}\n`;
        fs.appendFileSync(logPath, logEntry);
        
        console.log('\n✅ Weekly review completed successfully!');
        console.log(`\n📄 Review Summary:`);
        console.log(`- Week: ${weekInfo.weekId}`);
        console.log(`- Journal entries: ${journalCount}/7`);
        console.log(`- Daily reviews: ${reviewCount}/7`);
        console.log(`- Average energy: ${metrics.energyAverage.toFixed(1)}/10 (${metrics.energySources})`);
        console.log(`- Average focus: ${metrics.focusAverage.toFixed(1)}/10`);
        console.log(`- Victories detected: ${victories.length} (from both sources)`);
        console.log(`\nView full review at: ${reviewPath}`);
        
    } catch (error) {
        console.error('❌ Error generating weekly review:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { getWeekInfo, parseWeekId, loadDailyJournal, generateIntegratedWeeklyReview };