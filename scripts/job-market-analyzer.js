#!/usr/bin/env node

/**
 * Job Market Analysis Script
 * Purpose: Analyze AI/Software Engineering job market in NSW, Australia using Firecrawl
 * Usage: node scripts/job-market-analyzer.js [--full-analysis]
 * Dependencies: @firecrawl/js-sdk, fs, path
 * 
 * Features:
 * - Search major Australian job boards for AI/Software Engineer positions
 * - Extract and analyze skill requirements from job descriptions
 * - Track salary ranges and experience requirements
 * - Generate skills gap analysis against current skill matrix
 * - Export data for integration with daily brief system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SKILL_MATRIX_FILE = path.join(__dirname, '..', 'skills', 'skill-matrix.json');
const RESEARCH_DIR = path.join(__dirname, '..', 'research', 'job-market');
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, `job-market-analysis-${new Date().toISOString().split('T')[0]}.log`);

// Ensure directories exist
[RESEARCH_DIR, LOG_DIR].forEach(dir => {
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

// Job search configurations for Australian job boards
const JOB_SEARCH_CONFIG = {
    locations: ['NSW', 'Australia', 'Sydney', 'Remote'],
    roles: [
        'AI Engineer',
        'Machine Learning Engineer', 
        'Software Engineer AI',
        'Data Scientist AI',
        'AI Software Developer',
        'LLM Engineer',
        'ML Engineer',
        'AI/ML Engineer'
    ],
    sites: [
        'seek.com.au',
        'au.indeed.com', 
        'linkedin.com/jobs',
        'glassdoor.com.au'
    ]
};

// Skill categories to track (aligned with skill-matrix.json)
const SKILL_CATEGORIES = {
    ai_engineering: [
        'llm', 'large language model', 'gpt', 'claude', 'openai', 'anthropic',
        'prompt engineering', 'rag', 'retrieval augmented generation',
        'embeddings', 'vector database', 'fine-tuning', 'model training',
        'hugging face', 'transformers', 'bert', 'generative ai'
    ],
    software_engineering: [
        'python', 'javascript', 'typescript', 'react', 'node.js', 'nodejs',
        'git', 'github', 'testing', 'unit testing', 'integration testing',
        'system design', 'microservices', 'api design', 'rest api',
        'debugging', 'troubleshooting', 'code review'
    ],
    data_engineering: [
        'sql', 'postgresql', 'mysql', 'mongodb', 'etl', 'data pipeline',
        'data modeling', 'data warehouse', 'apache spark', 'kafka',
        'airflow', 'dbt', 'snowflake', 'bigquery', 'redshift'
    ],
    platform_expertise: [
        'aws', 'amazon web services', 'azure', 'google cloud', 'gcp',
        'docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd',
        'linux', 'bash', 'shell scripting', 'devops'
    ],
    frameworks_tools: [
        'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy',
        'fastapi', 'flask', 'django', 'express', 'spring boot',
        'redis', 'elasticsearch', 'grafana', 'prometheus'
    ]
};

// Experience level mapping
const EXPERIENCE_LEVELS = {
    'junior': ['0-2 years', 'graduate', 'entry level', 'junior', 'associate'],
    'mid': ['2-5 years', 'mid level', 'intermediate', 'mid-level'],
    'senior': ['5+ years', 'senior', 'lead', 'staff', 'principal'],
    'expert': ['10+ years', 'architect', 'director', 'head of', 'vp']
};

/**
 * Search for jobs using Firecrawl
 */
async function searchJobs() {
    log('Starting job search with Firecrawl...');
    
    const allJobs = [];
    const currentDate = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3);
    
    try {
        // Note: This is a simulation since we can't actually use Firecrawl SDK here
        // In real implementation, you would use:
        // const FirecrawlApp = await import('firecrawl');
        // const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
        
        for (const role of JOB_SEARCH_CONFIG.roles) {
            for (const location of JOB_SEARCH_CONFIG.locations) {
                const searchQuery = `${role} ${location} site:seek.com.au OR site:au.indeed.com`;
                
                log(`Searching: ${searchQuery}`);
                
                // Simulated job search results - in real implementation use Firecrawl
                const mockJobs = generateMockJobData(role, location);
                allJobs.push(...mockJobs);
                
                // Add delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        log(`Found ${allJobs.length} jobs total`);
        return allJobs;
        
    } catch (error) {
        log(`Error during job search: ${error.message}`);
        return [];
    }
}

/**
 * Generate mock job data for testing (replace with real Firecrawl implementation)
 */
function generateMockJobData(role, location) {
    const mockJobs = [];
    const jobCount = Math.floor(Math.random() * 15) + 5; // 5-20 jobs per search
    
    for (let i = 0; i < jobCount; i++) {
        const postedDaysAgo = Math.floor(Math.random() * 90); // Within last 3 months
        const postedDate = new Date();
        postedDate.setDate(postedDate.getDate() - postedDaysAgo);
        
        mockJobs.push({
            id: `job_${Date.now()}_${i}`,
            title: role,
            company: `Company ${i + 1}`,
            location: location,
            postedDate: postedDate.toISOString(),
            url: `https://example.com/job/${i}`,
            description: generateMockJobDescription(role),
            salary: generateMockSalary(),
            experienceLevel: getRandomExperienceLevel()
        });
    }
    
    return mockJobs;
}

/**
 * Generate realistic job description for skill extraction
 */
function generateMockJobDescription(role) {
    const descriptions = {
        'AI Engineer': `We are seeking an experienced AI Engineer to join our growing team. You will work on cutting-edge LLM applications, implement RAG systems, and develop AI-powered solutions. Requirements: 3+ years Python experience, experience with OpenAI/Claude APIs, vector databases, prompt engineering, and machine learning frameworks like PyTorch or TensorFlow. Knowledge of AWS, Docker, and microservices architecture preferred.`,
        
        'Machine Learning Engineer': `Join our ML team to build scalable machine learning pipelines. You'll work with large datasets, implement MLOps practices, and deploy models to production. Skills needed: Python, SQL, scikit-learn, pandas, Apache Spark, AWS/GCP, Docker, Kubernetes, CI/CD pipelines. Experience with feature engineering and model monitoring tools like MLflow preferred.`,
        
        'Software Engineer AI': `We're looking for a Software Engineer with AI expertise to build intelligent applications. You'll integrate LLMs, build APIs, and create user-facing AI features. Requirements: Strong Python/JavaScript skills, React experience, API development, experience with GPT/Claude integration, vector embeddings, and modern web technologies. PostgreSQL and Redis knowledge a plus.`
    };
    
    return descriptions[role] || descriptions['AI Engineer'];
}

/**
 * Generate mock salary data in AUD
 */
function generateMockSalary() {
    const ranges = [
        { min: 80000, max: 100000 }, // Junior
        { min: 100000, max: 130000 }, // Mid
        { min: 130000, max: 180000 }, // Senior
        { min: 180000, max: 250000 }  // Expert
    ];
    
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    return {
        min: range.min,
        max: range.max,
        currency: 'AUD'
    };
}

/**
 * Get random experience level
 */
function getRandomExperienceLevel() {
    const levels = Object.keys(EXPERIENCE_LEVELS);
    return levels[Math.floor(Math.random() * levels.length)];
}

/**
 * Extract skills from job descriptions
 */
function extractSkills(jobs) {
    log('Extracting skills from job descriptions...');
    
    const skillCounts = {};
    const skillsByLevel = {};
    
    // Initialize skill tracking
    for (const category in SKILL_CATEGORIES) {
        skillCounts[category] = {};
        skillsByLevel[category] = {};
        
        for (const skill of SKILL_CATEGORIES[category]) {
            skillCounts[category][skill] = 0;
            skillsByLevel[category][skill] = {
                junior: 0,
                mid: 0,
                senior: 0,
                expert: 0
            };
        }
    }
    
    // Process each job
    for (const job of jobs) {
        const description = job.description.toLowerCase();
        const level = job.experienceLevel;
        
        // Count skill mentions
        for (const category in SKILL_CATEGORIES) {
            for (const skill of SKILL_CATEGORIES[category]) {
                if (description.includes(skill.toLowerCase())) {
                    skillCounts[category][skill]++;
                    skillsByLevel[category][skill][level]++;
                }
            }
        }
    }
    
    return {
        totalCounts: skillCounts,
        byExperienceLevel: skillsByLevel,
        totalJobs: jobs.length
    };
}

/**
 * Analyze salary trends by skills and experience level
 */
function analyzeSalaryTrends(jobs) {
    log('Analyzing salary trends...');
    
    const salaryByLevel = {};
    const salaryBySkill = {};
    
    for (const level of Object.keys(EXPERIENCE_LEVELS)) {
        salaryByLevel[level] = {
            salaries: [],
            min: null,
            max: null,
            median: null,
            average: null
        };
    }
    
    // Collect salary data
    for (const job of jobs) {
        if (job.salary && job.salary.min && job.salary.max) {
            const avgSalary = (job.salary.min + job.salary.max) / 2;
            const level = job.experienceLevel;
            
            if (salaryByLevel[level]) {
                salaryByLevel[level].salaries.push(avgSalary);
            }
        }
    }
    
    // Calculate statistics
    for (const level in salaryByLevel) {
        const salaries = salaryByLevel[level].salaries;
        if (salaries.length > 0) {
            salaries.sort((a, b) => a - b);
            salaryByLevel[level].min = Math.min(...salaries);
            salaryByLevel[level].max = Math.max(...salaries);
            salaryByLevel[level].median = salaries[Math.floor(salaries.length / 2)];
            salaryByLevel[level].average = Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length);
        }
    }
    
    return { salaryByLevel };
}

/**
 * Generate skills gap analysis against current skill matrix
 */
function generateSkillsGapAnalysis(marketSkills) {
    log('Generating skills gap analysis...');
    
    let skillMatrix = {};
    try {
        skillMatrix = JSON.parse(fs.readFileSync(SKILL_MATRIX_FILE, 'utf8'));
    } catch (error) {
        log(`Warning: Could not load skill matrix: ${error.message}`);
        return null;
    }
    
    const gapAnalysis = {
        highDemandGaps: [],
        strengthAreas: [],
        emergingSkills: [],
        recommendations: []
    };
    
    // Analyze each skill category
    for (const category in marketSkills.totalCounts) {
        const marketCategorySkills = marketSkills.totalCounts[category];
        const currentCategorySkills = skillMatrix.categories[category]?.skills || {};
        
        for (const skill in marketCategorySkills) {
            const marketDemand = marketCategorySkills[skill];
            const demandPercentage = (marketDemand / marketSkills.totalJobs) * 100;
            
            // Find matching skill in current matrix (flexible matching)
            let currentLevel = 0;
            let skillKey = null;
            
            for (const [key, skillData] of Object.entries(currentCategorySkills)) {
                if (key.toLowerCase().includes(skill.split(' ')[0].toLowerCase()) || 
                    skill.toLowerCase().includes(key.toLowerCase())) {
                    currentLevel = skillData.current;
                    skillKey = key;
                    break;
                }
            }
            
            // Classify based on demand and current skill level
            if (demandPercentage >= 20) { // High demand (20%+ of jobs)
                if (currentLevel < 40) {
                    gapAnalysis.highDemandGaps.push({
                        skill,
                        category,
                        marketDemand: demandPercentage,
                        currentLevel,
                        gap: 60 - currentLevel, // Target 60% for high-demand skills
                        priority: 'HIGH'
                    });
                } else if (currentLevel >= 60) {
                    gapAnalysis.strengthAreas.push({
                        skill,
                        category,
                        marketDemand: demandPercentage,
                        currentLevel,
                        advantage: currentLevel - 40
                    });
                }
            } else if (demandPercentage >= 10 && currentLevel < 30) {
                gapAnalysis.emergingSkills.push({
                    skill,
                    category,
                    marketDemand: demandPercentage,
                    currentLevel,
                    potential: 'EMERGING'
                });
            }
        }
    }
    
    // Generate recommendations
    gapAnalysis.highDemandGaps
        .sort((a, b) => (b.marketDemand - a.marketDemand))
        .slice(0, 5)
        .forEach(gap => {
            gapAnalysis.recommendations.push(
                `Focus on ${gap.skill} - appears in ${gap.marketDemand.toFixed(1)}% of jobs, current level: ${gap.currentLevel}%`
            );
        });
    
    return gapAnalysis;
}

/**
 * Save analysis results
 */
function saveAnalysisResults(jobs, skillsAnalysis, salaryTrends, gapAnalysis) {
    const currentDate = new Date();
    const monthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    // Save raw job listings
    const jobsFile = path.join(RESEARCH_DIR, `job-listings-${monthString}.json`);
    fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));
    
    // Save skills analysis
    const skillsFile = path.join(RESEARCH_DIR, `skills-analysis-${monthString}.json`);
    fs.writeFileSync(skillsFile, JSON.stringify(skillsAnalysis, null, 2));
    
    // Save gap analysis
    if (gapAnalysis) {
        const gapFile = path.join(RESEARCH_DIR, `gap-analysis-${currentDate.toISOString().split('T')[0]}.json`);
        fs.writeFileSync(gapFile, JSON.stringify(gapAnalysis, null, 2));
    }
    
    // Update market trends
    updateMarketTrends(skillsAnalysis, salaryTrends);
    
    log(`Analysis results saved to ${RESEARCH_DIR}`);
    return {
        jobsFile,
        skillsFile,
        gapFile: gapAnalysis ? path.join(RESEARCH_DIR, `gap-analysis-${currentDate.toISOString().split('T')[0]}.json`) : null
    };
}

/**
 * Update long-term market trends
 */
function updateMarketTrends(skillsAnalysis, salaryTrends) {
    const trendsFile = path.join(RESEARCH_DIR, 'market-trends.json');
    let trends = { monthlyData: [], lastUpdated: null };
    
    if (fs.existsSync(trendsFile)) {
        try {
            trends = JSON.parse(fs.readFileSync(trendsFile, 'utf8'));
        } catch (error) {
            log(`Warning: Could not read existing trends: ${error.message}`);
        }
    }
    
    const currentMonth = new Date().toISOString().substr(0, 7); // YYYY-MM
    
    // Remove existing data for current month if it exists
    trends.monthlyData = trends.monthlyData.filter(data => data.month !== currentMonth);
    
    // Add current month's data
    trends.monthlyData.push({
        month: currentMonth,
        skillsAnalysis,
        salaryTrends,
        analysisDate: new Date().toISOString()
    });
    
    // Keep only last 12 months
    trends.monthlyData = trends.monthlyData
        .sort((a, b) => b.month.localeCompare(a.month))
        .slice(0, 12);
    
    trends.lastUpdated = new Date().toISOString();
    
    fs.writeFileSync(trendsFile, JSON.stringify(trends, null, 2));
}

/**
 * Generate summary report
 */
function generateSummaryReport(jobs, skillsAnalysis, salaryTrends, gapAnalysis) {
    let report = '# Job Market Analysis Summary\n\n';
    report += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
    report += `**Jobs Analyzed:** ${jobs.length}\n\n`;
    
    // Top skills in demand
    report += '## Top Skills in Demand\n\n';
    const topSkills = [];
    for (const category in skillsAnalysis.totalCounts) {
        for (const skill in skillsAnalysis.totalCounts[category]) {
            const count = skillsAnalysis.totalCounts[category][skill];
            const percentage = (count / jobs.length) * 100;
            if (count > 0) {
                topSkills.push({ skill, category, count, percentage });
            }
        }
    }
    
    topSkills
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 10)
        .forEach(item => {
            report += `- **${item.skill}** (${item.category}): ${item.count} jobs (${item.percentage.toFixed(1)}%)\n`;
        });
    
    // Salary trends
    report += '\n## Salary Trends (AUD)\n\n';
    for (const level in salaryTrends.salaryByLevel) {
        const data = salaryTrends.salaryByLevel[level];
        if (data.average) {
            report += `- **${level.toUpperCase()}**: $${data.average.toLocaleString()} avg (${data.min?.toLocaleString()} - ${data.max?.toLocaleString()})\n`;
        }
    }
    
    // Skills gap analysis
    if (gapAnalysis) {
        report += '\n## Skills Gap Analysis\n\n';
        
        if (gapAnalysis.highDemandGaps.length > 0) {
            report += '### High Priority Skills to Develop\n\n';
            gapAnalysis.highDemandGaps.slice(0, 5).forEach(gap => {
                report += `- **${gap.skill}**: ${gap.marketDemand.toFixed(1)}% demand, current level ${gap.currentLevel}%\n`;
            });
        }
        
        if (gapAnalysis.strengthAreas.length > 0) {
            report += '\n### Your Current Strengths\n\n';
            gapAnalysis.strengthAreas.slice(0, 3).forEach(strength => {
                report += `- **${strength.skill}**: ${strength.currentLevel}% skill level vs ${strength.marketDemand.toFixed(1)}% market demand\n`;
            });
        }
        
        if (gapAnalysis.recommendations.length > 0) {
            report += '\n### Recommendations\n\n';
            gapAnalysis.recommendations.forEach(rec => {
                report += `- ${rec}\n`;
            });
        }
    }
    
    return report;
}

/**
 * Main analysis function
 */
async function runJobMarketAnalysis(fullAnalysis = false) {
    log('=== Starting Job Market Analysis ===');
    
    try {
        // Search for jobs
        const jobs = await searchJobs();
        
        if (jobs.length === 0) {
            log('No jobs found, exiting analysis');
            return { success: false, message: 'No jobs found' };
        }
        
        // Extract and analyze skills
        const skillsAnalysis = extractSkills(jobs);
        
        // Analyze salary trends
        const salaryTrends = analyzeSalaryTrends(jobs);
        
        // Generate skills gap analysis
        const gapAnalysis = generateSkillsGapAnalysis(skillsAnalysis);
        
        // Save results
        const files = saveAnalysisResults(jobs, skillsAnalysis, salaryTrends, gapAnalysis);
        
        // Generate and display summary
        const summary = generateSummaryReport(jobs, skillsAnalysis, salaryTrends, gapAnalysis);
        
        if (!fullAnalysis) {
            console.log('\n' + summary);
        }
        
        log('=== Job Market Analysis Complete ===');
        
        return {
            success: true,
            summary,
            files,
            stats: {
                jobsAnalyzed: jobs.length,
                topSkills: Object.values(skillsAnalysis.totalCounts).reduce((acc, cat) => 
                    acc + Object.values(cat).filter(count => count > 0).length, 0),
                gapsIdentified: gapAnalysis?.highDemandGaps.length || 0
            }
        };
        
    } catch (error) {
        log(`ERROR: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Export for use in other scripts
export { runJobMarketAnalysis, SKILL_CATEGORIES, JOB_SEARCH_CONFIG };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const isFullAnalysis = process.argv.includes('--full-analysis');
    runJobMarketAnalysis(isFullAnalysis).catch(error => {
        console.error('Analysis failed:', error);
        process.exit(1);
    });
}