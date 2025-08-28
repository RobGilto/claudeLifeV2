#!/usr/bin/env node

/**
 * Performance Analyzer - Fractal Planning Performance Tracking
 * Purpose: Compare performance across time periods and identify improvement patterns
 * Usage: node scripts/performance-analyzer.js [command] [args]
 * Dependencies: fs, path, ./fractal-planner.js, ./taskmaster.js
 * 
 * Commands:
 * - compare [period] [identifier1] [identifier2] - Compare two periods
 * - trend [period] [count]                       - Show performance trend over time
 * - insights [period] [identifier]               - Generate insights for a period
 * - dashboard                                    - Show comprehensive performance dashboard
 * - export [format]                              - Export performance data
 */

const fs = require('fs');
const path = require('path');
const { PlanStorage, DateIndex } = require('./fractal-planner.js');
const { ExecutionStorage } = require('./taskmaster.js');

// Configuration
const ANALYTICS_DIR = path.join(__dirname, '..', 'planning', 'analytics');
const LOGS_DIR = path.join(__dirname, '..', 'logs');

// Ensure directories exist
[ANALYTICS_DIR, LOGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Performance comparison model
class PerformanceComparison {
    constructor(period1, period2) {
        this.period1 = period1;
        this.period2 = period2;
        this.comparison = {};
        this.insights = [];
        this.recommendations = [];
    }

    compare() {
        // Compare completion rates
        this.comparison.completionRate = {
            period1: this.period1.completionRate,
            period2: this.period2.completionRate,
            change: this.period2.completionRate - this.period1.completionRate,
            improvement: this.period2.completionRate > this.period1.completionRate
        };

        // Compare wellbeing metrics
        this.comparison.wellbeing = this.compareWellbeing();

        // Compare productivity patterns
        this.comparison.productivity = this.compareProductivity();

        // Generate insights
        this.generateInsights();

        return this.comparison;
    }

    compareWellbeing() {
        const metrics = ['energy', 'focus', 'satisfaction'];
        const wellbeingComparison = {};

        for (const metric of metrics) {
            const val1 = this.period1.wellbeingMetrics[metric];
            const val2 = this.period2.wellbeingMetrics[metric];
            
            if (val1 !== undefined && val2 !== undefined) {
                wellbeingComparison[metric] = {
                    period1: val1,
                    period2: val2,
                    change: val2 - val1,
                    improvement: val2 > val1
                };
            }
        }

        return wellbeingComparison;
    }

    compareProductivity() {
        return {
            objectivesCompleted: {
                period1: this.period1.objectiveStats?.completed || 0,
                period2: this.period2.objectiveStats?.completed || 0
            },
            timeBlockAdherence: {
                period1: this.period1.timeBlockStats?.adherenceRate || null,
                period2: this.period2.timeBlockStats?.adherenceRate || null
            }
        };
    }

    generateInsights() {
        const comp = this.comparison;
        
        // Completion rate insights
        if (comp.completionRate.improvement) {
            this.insights.push(`📈 Completion rate improved by ${comp.completionRate.change.toFixed(1)}%`);
        } else if (comp.completionRate.change < -5) {
            this.insights.push(`📉 Completion rate declined by ${Math.abs(comp.completionRate.change).toFixed(1)}%`);
            this.recommendations.push(`Review planning capacity and identify blockers`);
        }

        // Wellbeing insights
        for (const [metric, data] of Object.entries(comp.wellbeing)) {
            if (data.improvement && data.change > 1) {
                this.insights.push(`💪 ${metric} improved by ${data.change.toFixed(1)} points`);
            } else if (!data.improvement && data.change < -1) {
                this.insights.push(`⚠️ ${metric} declined by ${Math.abs(data.change).toFixed(1)} points`);
                this.recommendations.push(`Focus on improving ${metric} through specific strategies`);
            }
        }
    }
}

// Trend analysis model
class TrendAnalysis {
    constructor(period, performances) {
        this.period = period;
        this.performances = performances.sort((a, b) => a.identifier.localeCompare(b.identifier));
        this.trends = {};
        this.patterns = [];
    }

    analyze() {
        this.trends.completionRate = this.analyzeTrend('completionRate');
        this.trends.wellbeing = this.analyzeWellbeingTrends();
        this.detectPatterns();
        
        return {
            trends: this.trends,
            patterns: this.patterns,
            recommendations: this.generateTrendRecommendations()
        };
    }

    analyzeTrend(metric) {
        const values = this.performances.map(p => p[metric]).filter(v => v !== null && v !== undefined);
        
        if (values.length < 2) return null;

        const first = values[0];
        const last = values[values.length - 1];
        const change = last - first;
        const avgChange = change / (values.length - 1);

        // Calculate moving average
        const movingAvg = [];
        const windowSize = Math.min(3, values.length);
        
        for (let i = windowSize - 1; i < values.length; i++) {
            const window = values.slice(i - windowSize + 1, i + 1);
            movingAvg.push(window.reduce((sum, val) => sum + val, 0) / windowSize);
        }

        return {
            values,
            first,
            last,
            change,
            avgChange,
            movingAvg,
            direction: change > 0 ? 'improving' : (change < 0 ? 'declining' : 'stable')
        };
    }

    analyzeWellbeingTrends() {
        const metrics = ['energy', 'focus', 'satisfaction'];
        const wellbeingTrends = {};

        for (const metric of metrics) {
            const values = this.performances
                .map(p => p.wellbeingMetrics?.[metric])
                .filter(v => v !== null && v !== undefined);
                
            if (values.length >= 2) {
                wellbeingTrends[metric] = this.analyzeTrend(values);
            }
        }

        return wellbeingTrends;
    }

    detectPatterns() {
        // Detect cyclical patterns
        const completionRates = this.trends.completionRate?.values || [];
        
        if (completionRates.length >= 4) {
            const cycles = this.detectCycles(completionRates);
            if (cycles.length > 0) {
                this.patterns.push({
                    type: 'cyclical',
                    description: 'Performance shows cyclical patterns',
                    data: cycles
                });
            }
        }

        // Detect consistent improvement/decline
        if (this.trends.completionRate) {
            const { direction, avgChange } = this.trends.completionRate;
            if (Math.abs(avgChange) > 2) {
                this.patterns.push({
                    type: 'consistent_trend',
                    description: `Consistent ${direction} trend detected`,
                    data: { avgChange, direction }
                });
            }
        }
    }

    detectCycles(values) {
        // Simple cycle detection - look for peaks and valleys
        const cycles = [];
        let currentCycle = { peaks: [], valleys: [] };
        
        for (let i = 1; i < values.length - 1; i++) {
            const prev = values[i - 1];
            const curr = values[i];
            const next = values[i + 1];
            
            if (curr > prev && curr > next) {
                currentCycle.peaks.push({ index: i, value: curr });
            } else if (curr < prev && curr < next) {
                currentCycle.valleys.push({ index: i, value: curr });
            }
        }
        
        if (currentCycle.peaks.length > 1 || currentCycle.valleys.length > 1) {
            cycles.push(currentCycle);
        }
        
        return cycles;
    }

    generateTrendRecommendations() {
        const recommendations = [];
        
        // Completion rate recommendations
        if (this.trends.completionRate?.direction === 'declining') {
            recommendations.push(`📉 Address declining completion rate - review goal setting and capacity`);
        } else if (this.trends.completionRate?.direction === 'stable') {
            recommendations.push(`📈 Consider increasing challenge level to continue growth`);
        }

        // Wellbeing recommendations
        for (const [metric, trend] of Object.entries(this.trends.wellbeing || {})) {
            if (trend && trend.direction === 'declining') {
                recommendations.push(`⚠️ Focus on ${metric} improvement strategies`);
            }
        }

        return recommendations;
    }
}

// Main Performance Analyzer
class PerformanceAnalyzer {
    constructor() {
        this.dataCache = new Map();
    }

    async run() {
        const args = process.argv.slice(2);
        const command = args[0] || 'dashboard';
        
        try {
            switch (command) {
                case 'compare':
                    await this.comparePerformance(args[1], args[2], args[3]);
                    break;
                case 'trend':
                    await this.analyzeTrend(args[1], parseInt(args[2]) || 4);
                    break;
                case 'insights':
                    await this.generateInsights(args[1], args[2]);
                    break;
                case 'dashboard':
                    await this.showDashboard();
                    break;
                case 'export':
                    await this.exportData(args[1] || 'json');
                    break;
                default:
                    this.showHelp();
            }
        } catch (error) {
            console.error('Error:', error.message);
            this.log(`Error: ${error.message}`);
        }
    }

    async comparePerformance(period, id1, id2) {
        if (!period || !id1 || !id2) {
            console.log(`Usage: compare [period] [identifier1] [identifier2]`);
            return;
        }

        console.log(`\n📊 Performance Comparison: ${period}`);
        console.log(`🔍 Comparing: ${id1} vs ${id2}`);

        const perf1 = PlanStorage.loadPerformance(period, id1);
        const perf2 = PlanStorage.loadPerformance(period, id2);

        if (!perf1 || !perf2) {
            console.log(`❌ Performance data not found for both periods`);
            return;
        }

        const comparison = new PerformanceComparison(perf1, perf2);
        const results = comparison.compare();

        this.displayComparison(results, comparison);
    }

    displayComparison(results, comparison) {
        console.log(`\n📈 Comparison Results:`);
        
        // Completion rate
        const cr = results.completionRate;
        const crIcon = cr.improvement ? '📈' : '📉';
        console.log(`  ${crIcon} Completion Rate: ${cr.period1.toFixed(1)}% → ${cr.period2.toFixed(1)}% (${cr.change > 0 ? '+' : ''}${cr.change.toFixed(1)}%)`);

        // Wellbeing metrics
        if (Object.keys(results.wellbeing).length > 0) {
            console.log(`\n💚 Wellbeing Changes:`);
            for (const [metric, data] of Object.entries(results.wellbeing)) {
                const icon = data.improvement ? '📈' : '📉';
                console.log(`  ${icon} ${metric}: ${data.period1} → ${data.period2} (${data.change > 0 ? '+' : ''}${data.change})`);
            }
        }

        // Insights and recommendations
        if (comparison.insights.length > 0) {
            console.log(`\n💡 Insights:`);
            comparison.insights.forEach(insight => console.log(`  • ${insight}`));
        }

        if (comparison.recommendations.length > 0) {
            console.log(`\n🎯 Recommendations:`);
            comparison.recommendations.forEach(rec => console.log(`  • ${rec}`));
        }
    }

    async analyzeTrend(period, count) {
        console.log(`\n📈 Trend Analysis: ${period} (last ${count} periods)`);

        const identifiers = this.getRecentIdentifiers(period, count);
        const performances = [];

        for (const id of identifiers) {
            const perf = PlanStorage.loadPerformance(period, id);
            if (perf) performances.push(perf);
        }

        if (performances.length < 2) {
            console.log(`❌ Need at least 2 performance records for trend analysis`);
            return;
        }

        const trendAnalysis = new TrendAnalysis(period, performances);
        const results = trendAnalysis.analyze();

        this.displayTrend(results, period);
    }

    displayTrend(results, period) {
        console.log(`\n📊 Trend Results:`);

        // Completion rate trend
        if (results.trends.completionRate) {
            const cr = results.trends.completionRate;
            console.log(`  📈 Completion Rate Trend: ${cr.direction}`);
            console.log(`    Range: ${cr.first.toFixed(1)}% → ${cr.last.toFixed(1)}%`);
            console.log(`    Average change: ${cr.avgChange.toFixed(1)}% per period`);
        }

        // Wellbeing trends
        if (Object.keys(results.trends.wellbeing).length > 0) {
            console.log(`\n💚 Wellbeing Trends:`);
            for (const [metric, trend] of Object.entries(results.trends.wellbeing)) {
                if (trend) {
                    console.log(`    ${metric}: ${trend.direction} (${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)})`);
                }
            }
        }

        // Patterns
        if (results.patterns.length > 0) {
            console.log(`\n🔍 Detected Patterns:`);
            results.patterns.forEach(pattern => {
                console.log(`    • ${pattern.description}`);
            });
        }

        // Recommendations
        if (results.recommendations.length > 0) {
            console.log(`\n🎯 Trend-Based Recommendations:`);
            results.recommendations.forEach(rec => console.log(`    • ${rec}`));
        }
    }

    async showDashboard() {
        const now = new DateIndex();
        const identifiers = now.getIdentifiers();
        
        console.log(`\n📊 Performance Dashboard - ${now.toString()}`);
        console.log(`═══════════════════════════════════════════`);

        // Current period status
        this.showCurrentStatus(identifiers);

        // Recent trends
        console.log(`\n📈 Recent Trends:`);
        await this.showQuickTrends();

        // Performance highlights
        console.log(`\n⭐ Performance Highlights:`);
        this.showPerformanceHighlights();

        // Next actions
        console.log(`\n🎯 Recommended Actions:`);
        this.suggestActions(identifiers);
    }

    showCurrentStatus(identifiers) {
        const periods = [
            { name: 'Week', id: identifiers.week },
            { name: 'Month', id: identifiers.month },
            { name: 'Quarter', id: identifiers.quarter }
        ];

        console.log(`\n📋 Current Period Status:`);
        
        for (const period of periods) {
            const plan = PlanStorage.load(period.name.toLowerCase(), period.id);
            const performance = PlanStorage.loadPerformance(period.name.toLowerCase(), period.id);
            
            if (plan) {
                const completed = plan.objectives.filter(obj => obj.completed).length;
                const total = plan.objectives.length;
                const rate = total > 0 ? (completed / total * 100).toFixed(1) : '0.0';
                
                console.log(`  📅 ${period.name}: ${completed}/${total} objectives (${rate}%)`);
                
                if (performance && performance.wellbeingMetrics.satisfaction) {
                    console.log(`    💚 Satisfaction: ${performance.wellbeingMetrics.satisfaction}/10`);
                }
            } else {
                console.log(`  📅 ${period.name}: No plan created`);
            }
        }
    }

    async showQuickTrends() {
        // Show weekly trend for last 4 weeks
        const weeklyTrends = this.getRecentTrend('week', 4);
        if (weeklyTrends.length >= 2) {
            const first = weeklyTrends[0];
            const last = weeklyTrends[weeklyTrends.length - 1];
            const change = last - first;
            const direction = change > 0 ? '📈' : (change < 0 ? '📉' : '➡️');
            
            console.log(`  Weekly completion: ${direction} ${change > 0 ? '+' : ''}${change.toFixed(1)}% over ${weeklyTrends.length} weeks`);
        }
    }

    showPerformanceHighlights() {
        // Find best performing recent periods
        const recentPerformances = this.getRecentPerformances('week', 8);
        
        if (recentPerformances.length > 0) {
            const best = recentPerformances.reduce((max, curr) => 
                curr.completionRate > max.completionRate ? curr : max
            );
            
            console.log(`  🏆 Best recent week: ${best.identifier} (${best.completionRate.toFixed(1)}%)`);
            
            const avgSatisfaction = recentPerformances
                .map(p => p.wellbeingMetrics.satisfaction)
                .filter(s => s)
                .reduce((sum, s, _, arr) => sum + s / arr.length, 0);
                
            if (avgSatisfaction > 0) {
                console.log(`  😊 Average satisfaction: ${avgSatisfaction.toFixed(1)}/10`);
            }
        }
    }

    suggestActions(identifiers) {
        const suggestions = [];
        
        // Check for missing plans
        const periods = ['year', 'quarter', 'month', 'week', 'day'];
        for (const period of periods) {
            const plan = PlanStorage.load(period, identifiers[period]);
            if (!plan) {
                suggestions.push(`Create ${period} plan: node scripts/fractal-planner.js plan-${period}`);
                break; // Start with highest level missing
            }
        }

        // Check for pending reviews
        const lastWeek = this.getPreviousWeekId();
        if (PlanStorage.load('week', lastWeek) && !PlanStorage.loadPerformance('week', lastWeek)) {
            suggestions.push(`Review last week: node scripts/fractal-planner.js review-week ${lastWeek}`);
        }

        // Execution suggestions
        const todayExecution = ExecutionStorage.load(identifiers.day);
        if (!todayExecution) {
            suggestions.push(`Start daily execution: node scripts/taskmaster.js start`);
        }

        suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
    }

    getRecentIdentifiers(period, count) {
        // Generate recent period identifiers
        const identifiers = [];
        const now = new Date();
        
        for (let i = 0; i < count; i++) {
            const date = new Date(now);
            
            if (period === 'week') {
                date.setDate(date.getDate() - (i * 7));
            } else if (period === 'month') {
                date.setMonth(date.getMonth() - i);
            } else if (period === 'quarter') {
                date.setMonth(date.getMonth() - (i * 3));
            }
            
            const dateIndex = new DateIndex(date);
            const ids = dateIndex.getIdentifiers();
            identifiers.push(ids[period]);
        }
        
        return identifiers.reverse(); // Chronological order
    }

    getRecentTrend(period, count) {
        const identifiers = this.getRecentIdentifiers(period, count);
        const performances = [];
        
        for (const id of identifiers) {
            const perf = PlanStorage.loadPerformance(period, id);
            if (perf) performances.push(perf.completionRate);
        }
        
        return performances;
    }

    getRecentPerformances(period, count) {
        const identifiers = this.getRecentIdentifiers(period, count);
        const performances = [];
        
        for (const id of identifiers) {
            const perf = PlanStorage.loadPerformance(period, id);
            if (perf) performances.push(perf);
        }
        
        return performances;
    }

    getPreviousWeekId() {
        const now = new Date();
        now.setDate(now.getDate() - 7);
        return new DateIndex(now).getIdentifiers().week;
    }

    async exportData(format) {
        console.log(`\n💾 Exporting performance data (${format})...`);
        
        // Collect all performance data
        const data = {
            exported: new Date().toISOString(),
            performances: {},
            summary: {}
        };

        // Export by period type
        const periods = ['day', 'week', 'month', 'quarter', 'year'];
        
        for (const period of periods) {
            data.performances[period] = this.collectPerformanceData(period);
        }

        // Generate summary statistics
        data.summary = this.generateExportSummary(data.performances);

        const filename = `performance-export-${new Date().toISOString().split('T')[0]}.${format}`;
        const filepath = path.join(ANALYTICS_DIR, filename);
        
        if (format === 'json') {
            fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        } else if (format === 'csv') {
            const csv = this.convertToCSV(data);
            fs.writeFileSync(filepath, csv);
        }

        console.log(`✅ Data exported to: ${filepath}`);
    }

    collectPerformanceData(period) {
        const dataDir = path.join(__dirname, '..', 'planning', 'data');
        const files = fs.readdirSync(dataDir);
        const performanceFiles = files.filter(file => 
            file.startsWith(`performance-${period}-`) && file.endsWith('.json')
        );

        const performances = [];
        for (const file of performanceFiles) {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
                performances.push(data);
            } catch (error) {
                this.log(`Error reading ${file}: ${error.message}`);
            }
        }

        return performances;
    }

    generateExportSummary(performances) {
        const summary = {};
        
        for (const [period, data] of Object.entries(performances)) {
            if (data.length > 0) {
                const completionRates = data.map(p => p.completionRate).filter(r => r !== null);
                
                summary[period] = {
                    count: data.length,
                    avgCompletionRate: completionRates.length > 0 ? 
                        completionRates.reduce((sum, r) => sum + r, 0) / completionRates.length : 0,
                    maxCompletionRate: Math.max(...completionRates),
                    minCompletionRate: Math.min(...completionRates)
                };
            }
        }
        
        return summary;
    }

    convertToCSV(data) {
        // Simple CSV conversion for performance data
        const rows = ['Period,Identifier,CompletionRate,Satisfaction,Energy,Focus,Recorded'];
        
        for (const [period, performances] of Object.entries(data.performances)) {
            for (const perf of performances) {
                const row = [
                    period,
                    perf.identifier,
                    perf.completionRate || '',
                    perf.wellbeingMetrics?.satisfaction || '',
                    perf.wellbeingMetrics?.energy || '',
                    perf.wellbeingMetrics?.focus || '',
                    perf.recorded
                ].join(',');
                rows.push(row);
            }
        }
        
        return rows.join('\n');
    }

    log(message) {
        const timestamp = new Date().toISOString();
        const logFile = path.join(LOGS_DIR, `performance-analyzer-${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, `${timestamp}: ${message}\n`);
    }

    showHelp() {
        console.log(`
📊 Performance Analyzer - Fractal Planning Analytics

Commands:
  compare [period] [id1] [id2]  - Compare two periods (week/month/quarter/year)
  trend [period] [count]        - Show trend over last [count] periods  
  insights [period] [id]        - Generate insights for specific period
  dashboard                     - Show comprehensive performance overview
  export [format]               - Export data (json/csv)

Examples:
  node scripts/performance-analyzer.js compare week 2024-W03 2024-W04
  node scripts/performance-analyzer.js trend week 4
  node scripts/performance-analyzer.js dashboard
  node scripts/performance-analyzer.js export json

Integration:
- Works with fractal-planner.js performance data
- Analyzes taskmaster.js execution data
- Generates insights for continuous improvement
        `);
    }
}

// Run if called directly
if (require.main === module) {
    const analyzer = new PerformanceAnalyzer();
    analyzer.run();
}

module.exports = { PerformanceAnalyzer, PerformanceComparison, TrendAnalysis };