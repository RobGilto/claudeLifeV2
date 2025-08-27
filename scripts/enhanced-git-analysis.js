#!/usr/bin/env node

/**
 * Enhanced Git Analysis with Diff-Based Skill Detection
 * Purpose: Deep analysis of code changes for micro-skill identification
 * Usage: node scripts/enhanced-git-analysis.js [--repo <repo-path>] [--days <num>]
 * Dependencies: fs, path, child_process
 * 
 * Investor → Crafter → Salesman progression tracking:
 * - Detects high-ROI micro-skills from git diffs
 * - Measures code complexity and pattern consistency
 * - Generates portfolio-ready evidence
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
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, `git-analysis-${new Date().toISOString().split('T')[0]}.log`);

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(LOG_FILE, logMessage);
}

// High-ROI Micro-Skills Detection Patterns
const MICRO_SKILLS = {
    // API Design Patterns (High ROI for employment)
    api_design: {
        patterns: [
            /app\.(get|post|put|delete|patch)/,
            /router\.(get|post|put|delete)/,
            /res\.status\(\d+\)\.json/,
            /try\s*\{[\s\S]*?\}\s*catch/,
            /const\s+\{[^}]+\}\s*=\s*req\.(body|params|query)/
        ],
        skill_mapping: ['javascript', 'system_design', 'debugging'],
        portfolio_value: 'high',
        description: 'RESTful API design with proper error handling'
    },
    
    // Testing Mindset (Critical professional skill)
    testing_patterns: {
        patterns: [
            /describe\s*\(\s*['"`].*['"`]\s*,/,
            /it\s*\(\s*['"`].*['"`]\s*,/,
            /test\s*\(\s*['"`].*['"`]\s*,/,
            /expect\s*\(.*\)\.(to|toBe|toEqual)/,
            /\.spec\.|\.test\./
        ],
        skill_mapping: ['testing', 'debugging', 'system_design'],
        portfolio_value: 'high',
        description: 'Unit testing and test-driven development'
    },
    
    // Async/Promise Mastery (Modern JS competency)
    async_patterns: {
        patterns: [
            /async\s+function/,
            /await\s+/,
            /Promise\.(all|race|resolve|reject)/,
            /\.then\s*\(/,
            /\.catch\s*\(/
        ],
        skill_mapping: ['javascript', 'typescript', 'debugging'],
        portfolio_value: 'medium',
        description: 'Modern asynchronous JavaScript patterns'
    },
    
    // Error Handling Excellence (Professional standard)
    error_handling: {
        patterns: [
            /try\s*\{[\s\S]*?\}\s*catch\s*\(/,
            /throw new Error/,
            /\.catch\s*\(/,
            /console\.(error|warn)/,
            /process\.exit\(/
        ],
        skill_mapping: ['debugging', 'system_design', 'javascript', 'python'],
        portfolio_value: 'high',
        description: 'Robust error handling and debugging practices'
    },
    
    // Data Validation (Security-minded development)
    validation_patterns: {
        patterns: [
            /joi\.|yup\.|z\./,
            /validator\./,
            /if\s*\(.*typeof.*\)/,
            /if\s*\(!.*\|\|.*\)/,
            /Array\.isArray/
        ],
        skill_mapping: ['javascript', 'system_design', 'debugging'],
        portfolio_value: 'medium',
        description: 'Input validation and data integrity'
    },
    
    // Documentation Excellence (Communication skill)
    documentation: {
        patterns: [
            /\/\*\*[\s\S]*?\*\//,
            /@param\s+\{[^}]+\}/,
            /@returns?\s+\{[^}]+\}/,
            /README\.md/,
            /CHANGELOG/
        ],
        skill_mapping: ['technical_writing', 'system_design'],
        portfolio_value: 'high',
        description: 'Technical documentation and communication'
    },
    
    // Database Operations (Data engineering)
    database_patterns: {
        patterns: [
            /SELECT\s+.*\s+FROM/i,
            /INSERT\s+INTO/i,
            /UPDATE\s+.*\s+SET/i,
            /DELETE\s+FROM/i,
            /JOIN\s+.*\s+ON/i,
            /mongoose\./,
            /\.find\(/,
            /\.create\(/
        ],
        skill_mapping: ['sql', 'data_modeling', 'etl_pipelines'],
        portfolio_value: 'medium',
        description: 'Database design and query optimization'
    }
};

// Enhanced Git Diff Analysis
async function analyzeGitDiffs(repoPath = '.', days = 7) {
    try {
        log(`Starting enhanced git analysis for ${repoPath} (last ${days} days)`);
        
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        const sinceStr = sinceDate.toISOString().split('T')[0];
        
        // Get list of commits in time range
        const { stdout: commitList } = await execAsync(
            `cd "${repoPath}" && git log --since="${sinceStr}" --pretty=format:"%H|%s|%an|%ad" --date=short`
        );
        
        if (!commitList.trim()) {
            log('No commits found in the specified time range');
            return { commits: [], microSkills: {}, complexity: {} };
        }
        
        const commits = commitList.split('\n').filter(line => line.trim());
        log(`Found ${commits.length} commits to analyze`);
        
        const analysisResults = {
            commits: [],
            microSkills: {},
            complexity: {
                totalLinesAdded: 0,
                totalLinesRemoved: 0,
                fileTypeCounts: {},
                languageComplexity: {}
            },
            portfolioEvidence: []
        };
        
        // Initialize micro-skill tracking
        for (const [skillName, config] of Object.entries(MICRO_SKILLS)) {
            analysisResults.microSkills[skillName] = {
                occurrences: 0,
                commits: [],
                evidence: [],
                portfolioValue: config.portfolio_value,
                description: config.description,
                skillMapping: config.skill_mapping
            };
        }
        
        // Analyze each commit
        for (let i = 0; i < Math.min(commits.length, 20); i++) { // Limit to 20 most recent
            const [hash, message, author, date] = commits[i].split('|');
            
            try {
                // Get diff statistics
                const { stdout: diffStats } = await execAsync(
                    `cd "${repoPath}" && git diff --numstat ${hash}~1 ${hash} 2>/dev/null || echo ""`
                );
                
                // Get actual diff content
                const { stdout: diffContent } = await execAsync(
                    `cd "${repoPath}" && git diff ${hash}~1 ${hash} 2>/dev/null || echo ""`
                );
                
                const commitAnalysis = analyzeDiffContent(diffContent, diffStats, hash, message);
                commitAnalysis.hash = hash;
                commitAnalysis.message = message;
                commitAnalysis.date = date;
                
                analysisResults.commits.push(commitAnalysis);
                
                // Update complexity metrics
                analysisResults.complexity.totalLinesAdded += commitAnalysis.linesAdded;
                analysisResults.complexity.totalLinesRemoved += commitAnalysis.linesRemoved;
                
                // Update micro-skill tracking
                for (const [skillName, evidence] of Object.entries(commitAnalysis.microSkills)) {
                    if (evidence.occurrences > 0) {
                        analysisResults.microSkills[skillName].occurrences += evidence.occurrences;
                        analysisResults.microSkills[skillName].commits.push(hash);
                        analysisResults.microSkills[skillName].evidence.push(...evidence.evidence);
                    }
                }
                
                // Collect portfolio evidence
                if (commitAnalysis.portfolioEvidence.length > 0) {
                    analysisResults.portfolioEvidence.push({
                        commit: hash,
                        message,
                        date,
                        evidence: commitAnalysis.portfolioEvidence
                    });
                }
                
            } catch (error) {
                log(`Warning: Could not analyze commit ${hash}: ${error.message}`);
            }
        }
        
        log(`Analysis complete: ${analysisResults.commits.length} commits analyzed`);
        return analysisResults;
        
    } catch (error) {
        log(`Error in git analysis: ${error.message}`);
        throw error;
    }
}

// Analyze diff content for micro-skills
function analyzeDiffContent(diffContent, diffStats, hash, message) {
    const analysis = {
        linesAdded: 0,
        linesRemoved: 0,
        fileTypes: {},
        microSkills: {},
        portfolioEvidence: []
    };
    
    // Initialize micro-skill tracking for this commit
    for (const [skillName, config] of Object.entries(MICRO_SKILLS)) {
        analysis.microSkills[skillName] = {
            occurrences: 0,
            evidence: []
        };
    }
    
    // Parse diff stats (added, removed, filename)
    if (diffStats) {
        const statLines = diffStats.split('\n').filter(line => line.trim());
        for (const statLine of statLines) {
            const [added, removed, filename] = statLine.split('\t');
            if (added !== '-' && removed !== '-') {
                analysis.linesAdded += parseInt(added) || 0;
                analysis.linesRemoved += parseInt(removed) || 0;
                
                const ext = path.extname(filename);
                analysis.fileTypes[ext] = (analysis.fileTypes[ext] || 0) + 1;
            }
        }
    }
    
    // Analyze diff content for micro-skill patterns
    const addedLines = diffContent.split('\n')
        .filter(line => line.startsWith('+'))
        .map(line => line.substring(1));
    
    for (const [skillName, config] of Object.entries(MICRO_SKILLS)) {
        for (const pattern of config.patterns) {
            for (const line of addedLines) {
                if (pattern.test(line)) {
                    analysis.microSkills[skillName].occurrences++;
                    analysis.microSkills[skillName].evidence.push({
                        line: line.trim(),
                        pattern: pattern.source
                    });
                    
                    // High-value evidence for portfolio
                    if (config.portfolio_value === 'high') {
                        analysis.portfolioEvidence.push({
                            skill: skillName,
                            evidence: line.trim(),
                            description: config.description
                        });
                    }
                }
            }
        }
    }
    
    return analysis;
}

// Generate skill recommendations based on analysis
function generateSkillRecommendations(analysisResults, currentMatrix) {
    const recommendations = {
        investor: [],  // High-ROI micro-skills to focus on
        crafter: [],   // Existing strengths to deepen
        salesman: []   // Portfolio-ready evidence
    };
    
    // INVESTOR: High-ROI skills with low current levels
    for (const [skillName, data] of Object.entries(analysisResults.microSkills)) {
        if (data.occurrences > 0 && data.portfolioValue === 'high') {
            const mappedSkills = data.skillMapping.map(skill => {
                const category = findSkillCategory(currentMatrix, skill);
                return category ? { 
                    skill, 
                    category, 
                    current: currentMatrix.categories[category].skills[skill]?.current || 0,
                    target: currentMatrix.categories[category].skills[skill]?.target || 0
                } : null;
            }).filter(Boolean);
            
            const lowLevelSkills = mappedSkills.filter(s => s.current < 40);
            if (lowLevelSkills.length > 0) {
                recommendations.investor.push({
                    microSkill: skillName,
                    description: data.description,
                    occurrences: data.occurrences,
                    mappedSkills: lowLevelSkills,
                    roi: 'high',
                    nextSteps: generateInvestorSteps(skillName, data)
                });
            }
        }
    }
    
    // CRAFTER: Skills with moderate activity and medium current levels
    for (const [skillName, data] of Object.entries(analysisResults.microSkills)) {
        if (data.occurrences > 2) { // Regular practice
            const mappedSkills = data.skillMapping.map(skill => {
                const category = findSkillCategory(currentMatrix, skill);
                return category ? { 
                    skill, 
                    category, 
                    current: currentMatrix.categories[category].skills[skill]?.current || 0,
                    target: currentMatrix.categories[category].skills[skill]?.target || 0
                } : null;
            }).filter(Boolean);
            
            const midLevelSkills = mappedSkills.filter(s => s.current >= 30 && s.current < 60);
            if (midLevelSkills.length > 0) {
                recommendations.crafter.push({
                    microSkill: skillName,
                    description: data.description,
                    occurrences: data.occurrences,
                    mappedSkills: midLevelSkills,
                    craftingOpportunity: generateCrafterSteps(skillName, data)
                });
            }
        }
    }
    
    // SALESMAN: Portfolio-ready evidence
    recommendations.salesman = analysisResults.portfolioEvidence.map(evidence => ({
        commit: evidence.commit,
        message: evidence.message,
        date: evidence.date,
        evidence: evidence.evidence,
        portfolioNarrative: generateSalesmanNarrative(evidence)
    }));
    
    return recommendations;
}

function findSkillCategory(matrix, skillName) {
    for (const [categoryName, category] of Object.entries(matrix.categories)) {
        if (category.skills && category.skills[skillName]) {
            return categoryName;
        }
    }
    return null;
}

function generateInvestorSteps(skillName, data) {
    const steps = {
        api_design: [
            "Practice building one REST endpoint per day",
            "Focus on consistent error handling patterns",
            "Document API design decisions"
        ],
        testing_patterns: [
            "Write one unit test for each new function",
            "Practice test-driven development on small features",
            "Learn one testing framework deeply"
        ],
        error_handling: [
            "Add try-catch to all async operations",
            "Create consistent error response formats",
            "Practice debugging systematic approaches"
        ]
    };
    
    return steps[skillName] || [
        `Continue practicing ${data.description}`,
        "Document patterns and decisions",
        "Build portfolio examples"
    ];
}

function generateCrafterSteps(skillName, data) {
    return {
        deepeningOpportunity: `You're showing consistent ${data.description} - ready for advanced patterns`,
        nextLevel: "Consider architecture patterns and performance optimization",
        mentorship: "Share knowledge through code reviews or documentation"
    };
}

function generateSalesmanNarrative(evidence) {
    return `Implemented ${evidence.evidence.length} ${evidence.evidence[0]?.skill || 'technical'} solutions, demonstrating systematic problem-solving and professional development practices.`;
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const repoPath = args.includes('--repo') ? args[args.indexOf('--repo') + 1] : '.';
    const days = args.includes('--days') ? parseInt(args[args.indexOf('--days') + 1]) : 7;
    
    try {
        // Load current skill matrix
        const skillMatrix = JSON.parse(fs.readFileSync(SKILL_MATRIX_FILE, 'utf8'));
        
        // Analyze git activity
        const analysis = await analyzeGitDiffs(repoPath, days);
        
        // Generate recommendations
        const recommendations = generateSkillRecommendations(analysis, skillMatrix);
        
        // Save results
        const outputFile = path.join(__dirname, '..', 'skills', `git-analysis-${new Date().toISOString().split('T')[0]}.json`);
        fs.writeFileSync(outputFile, JSON.stringify({
            analysis,
            recommendations,
            metadata: {
                repoPath,
                days,
                analyzedAt: new Date().toISOString(),
                totalCommits: analysis.commits.length
            }
        }, null, 2));
        
        log(`Analysis complete. Results saved to ${outputFile}`);
        
        // Output summary
        console.log('\n🎯 INVESTOR OPPORTUNITIES (High ROI):');
        recommendations.investor.forEach((rec, i) => {
            console.log(`${i + 1}. ${rec.microSkill}: ${rec.description}`);
            console.log(`   Detected ${rec.occurrences} times - ${rec.roi} ROI`);
        });
        
        console.log('\n🔨 CRAFTER OPPORTUNITIES (Deepen Expertise):');
        recommendations.crafter.forEach((rec, i) => {
            console.log(`${i + 1}. ${rec.microSkill}: ${rec.occurrences} occurrences`);
            console.log(`   ${rec.craftingOpportunity.deepeningOpportunity}`);
        });
        
        console.log('\n💼 SALESMAN EVIDENCE (Portfolio Ready):');
        recommendations.salesman.slice(0, 3).forEach((evidence, i) => {
            console.log(`${i + 1}. ${evidence.message.substring(0, 50)}...`);
            console.log(`   ${evidence.portfolioNarrative}`);
        });
        
    } catch (error) {
        log(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}

export { analyzeGitDiffs, generateSkillRecommendations, MICRO_SKILLS };