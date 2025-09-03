#!/usr/bin/env node

/**
 * Interests Management Script
 * Purpose: Intelligent management of user interests for daily brief personalization
 * Usage: node scripts/manage-interests.js [action] [category] [keyword/priority]
 * Dependencies: fs, path
 * 
 * Features:
 * - Add/remove interest keywords with duplicate detection
 * - Analyze brain dumps and codebase for emerging interests
 * - LLM-powered deduplication and similarity matching
 * - Priority management and category organization
 * - Integration with daily-brief system
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSydneyTime } from './sydney-time.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INTERESTS_FILE = path.join(__dirname, '..', 'config', 'interests.json');
const BRAIN_DUMPS_DIR = path.join(__dirname, '..', 'journal', 'brain');
const LOG_DIR = path.join(__dirname, '..', 'logs');

const sydneyTimeData = getSydneyTime ? getSydneyTime() : null;
const currentSydneyDate = sydneyTimeData ? sydneyTimeData.date : new Date().toISOString().split('T')[0];
const LOG_FILE = path.join(LOG_DIR, `manage-interests-${currentSydneyDate}.log`);

// Ensure directories exist
[path.dirname(INTERESTS_FILE), LOG_DIR].forEach(dir => {
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
 * Load interests configuration
 */
function loadInterests() {
    try {
        if (!fs.existsSync(INTERESTS_FILE)) {
            log('No interests file found, creating default configuration');
            return createDefaultInterests();
        }
        return JSON.parse(fs.readFileSync(INTERESTS_FILE, 'utf8'));
    } catch (error) {
        log(`Error loading interests: ${error.message}`);
        return createDefaultInterests();
    }
}

/**
 * Save interests configuration
 */
function saveInterests(interests) {
    try {
        interests.lastUpdated = new Date().toISOString();
        fs.writeFileSync(INTERESTS_FILE, JSON.stringify(interests, null, 2));
        log(`Interests saved to ${INTERESTS_FILE}`);
        return true;
    } catch (error) {
        log(`Error saving interests: ${error.message}`);
        return false;
    }
}

/**
 * Create default interests configuration
 */
function createDefaultInterests() {
    return {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
        interests: {
            career: {
                priority: "HIGH",
                keywords: ["AI engineer jobs Australia", "machine learning careers NSW"],
                description: "Career transition to AI engineering"
            }
        },
        searchPriorities: {
            HIGH: { limit: 3, weight: 1.0 },
            MEDIUM: { limit: 2, weight: 0.7 },
            LOW: { limit: 1, weight: 0.3 }
        },
        filters: {
            dateRange: 7,
            minRelevanceScore: 0.6,
            excludeKeywords: ["cryptocurrency", "blockchain"],
            preferredSources: ["linkedin.com", "github.com", "stackoverflow.com"]
        },
        metadata: {
            autoUpdateFromBrainDumps: true,
            learningFromUserFeedback: true,
            maxKeywordsPerCategory: 20,
            deduplicationThreshold: 0.8
        }
    };
}

/**
 * Calculate semantic similarity between two strings (simple implementation)
 */
function calculateSimilarity(str1, str2) {
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const s1 = normalize(str1);
    const s2 = normalize(str2);
    
    if (s1 === s2) return 1.0;
    
    // Simple word overlap similarity
    const words1 = new Set(s1.split(/\s+/));
    const words2 = new Set(s2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

/**
 * Find similar keywords in a category
 */
function findSimilarKeywords(keyword, keywords, threshold = 0.8) {
    return keywords.filter(existing => 
        calculateSimilarity(keyword, existing) >= threshold
    );
}

/**
 * Add interest keyword to category
 */
function addInterest(interests, category, keyword) {
    log(`Adding interest: "${keyword}" to category "${category}"`);
    
    // Initialize category if it doesn't exist
    if (!interests.interests[category]) {
        interests.interests[category] = {
            priority: "MEDIUM",
            keywords: [],
            description: `User-defined category: ${category}`
        };
        log(`Created new category: ${category}`);
    }
    
    const categoryData = interests.interests[category];
    const existing = categoryData.keywords || [];
    
    // Check for similar keywords
    const similar = findSimilarKeywords(keyword, existing, interests.metadata.deduplicationThreshold);
    if (similar.length > 0) {
        log(`Similar keywords found: ${similar.join(', ')}`);
        console.log(`⚠️  Similar keywords already exist: ${similar.join(', ')}`);
        console.log(`Do you want to add "${keyword}" anyway? The system detected potential duplicates.`);
        return false;
    }
    
    // Check keyword limits
    if (existing.length >= interests.metadata.maxKeywordsPerCategory) {
        log(`Category ${category} has reached maximum keywords (${interests.metadata.maxKeywordsPerCategory})`);
        console.log(`❌ Category "${category}" has reached the maximum of ${interests.metadata.maxKeywordsPerCategory} keywords`);
        return false;
    }
    
    // Add the keyword
    categoryData.keywords.push(keyword);
    log(`Successfully added "${keyword}" to ${category}`);
    console.log(`✅ Added "${keyword}" to category "${category}"`);
    return true;
}

/**
 * Remove interest keyword from category
 */
function removeInterest(interests, category, keyword) {
    log(`Removing interest: "${keyword}" from category "${category}"`);
    
    if (!interests.interests[category]) {
        log(`Category "${category}" not found`);
        console.log(`❌ Category "${category}" not found`);
        return false;
    }
    
    const categoryData = interests.interests[category];
    const keywords = categoryData.keywords || [];
    const originalLength = keywords.length;
    
    // Find exact or similar matches
    const similar = findSimilarKeywords(keyword, keywords, 0.6);
    if (similar.length === 0) {
        log(`Keyword "${keyword}" not found in ${category}`);
        console.log(`❌ Keyword "${keyword}" not found in category "${category}"`);
        return false;
    }
    
    // Remove similar keywords
    categoryData.keywords = keywords.filter(k => !similar.includes(k));
    const removedCount = originalLength - categoryData.keywords.length;
    
    log(`Removed ${removedCount} keywords from ${category}: ${similar.join(', ')}`);
    console.log(`✅ Removed ${removedCount} keyword(s) from "${category}": ${similar.join(', ')}`);
    return true;
}

/**
 * Update category priority
 */
function updatePriority(interests, category, priority) {
    log(`Updating priority for category "${category}" to ${priority}`);
    
    if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
        log(`Invalid priority: ${priority}`);
        console.log(`❌ Invalid priority "${priority}". Use HIGH, MEDIUM, or LOW`);
        return false;
    }
    
    if (!interests.interests[category]) {
        log(`Category "${category}" not found`);
        console.log(`❌ Category "${category}" not found`);
        return false;
    }
    
    interests.interests[category].priority = priority;
    log(`Updated ${category} priority to ${priority}`);
    console.log(`✅ Updated category "${category}" priority to ${priority}`);
    return true;
}

/**
 * List all interests
 */
function listInterests(interests) {
    console.log(`\n📋 Current Interests Configuration`);
    console.log(`Last updated: ${interests.lastUpdated}`);
    console.log(`Version: ${interests.version}\n`);
    
    // Group by priority
    const byPriority = { HIGH: [], MEDIUM: [], LOW: [] };
    
    for (const [categoryName, categoryData] of Object.entries(interests.interests)) {
        const priority = categoryData.priority || 'MEDIUM';
        byPriority[priority].push({
            name: categoryName,
            data: categoryData
        });
    }
    
    // Display by priority
    for (const [priority, categories] of Object.entries(byPriority)) {
        if (categories.length === 0) continue;
        
        const emoji = priority === 'HIGH' ? '🔥' : priority === 'MEDIUM' ? '⚡' : '💡';
        console.log(`${emoji} ${priority} Priority:`);
        
        categories.forEach(({ name, data }) => {
            console.log(`  📂 ${name} (${data.keywords?.length || 0} keywords)`);
            console.log(`     ${data.description}`);
            if (data.keywords?.length > 0) {
                const displayKeywords = data.keywords.slice(0, 3);
                const moreCount = data.keywords.length - 3;
                console.log(`     Keywords: ${displayKeywords.join(', ')}${moreCount > 0 ? ` (+${moreCount} more)` : ''}`);
            }
            console.log('');
        });
    }
    
    // Show configuration summary
    console.log(`📊 Configuration:`);
    console.log(`   Max keywords per category: ${interests.metadata?.maxKeywordsPerCategory || 20}`);
    console.log(`   Deduplication threshold: ${interests.metadata?.deduplicationThreshold || 0.8}`);
    console.log(`   Auto-update from brain dumps: ${interests.metadata?.autoUpdateFromBrainDumps ? '✅' : '❌'}`);
    console.log('');
}

/**
 * Analyze brain dumps for emerging interests
 */
function analyzeInterests(interests) {
    log('Starting interests analysis from brain dumps and codebase');
    console.log('🔍 Analyzing recent brain dumps and codebase for emerging interests...\n');
    
    const suggestions = {
        technical: new Set(),
        career: new Set(),
        learning: new Set()
    };
    
    try {
        // Analyze recent brain dumps
        if (fs.existsSync(BRAIN_DUMPS_DIR)) {
            const brainDumpFiles = fs.readdirSync(BRAIN_DUMPS_DIR)
                .filter(file => file.startsWith('braindump-') && file.endsWith('.md'))
                .slice(-10); // Last 10 brain dumps
            
            log(`Analyzing ${brainDumpFiles.length} recent brain dumps`);
            
            brainDumpFiles.forEach(file => {
                try {
                    const content = fs.readFileSync(path.join(BRAIN_DUMPS_DIR, file), 'utf8');
                    extractKeywordsFromText(content, suggestions);
                } catch (error) {
                    log(`Error reading brain dump ${file}: ${error.message}`);
                }
            });
        }
        
        // Analyze codebase files for technical interests
        const codebaseFiles = [
            path.join(__dirname, '..', 'scripts'),
            path.join(__dirname, '..', 'src')
        ];
        
        codebaseFiles.forEach(dir => {
            if (fs.existsSync(dir)) {
                analyzeCodebaseDirectory(dir, suggestions);
            }
        });
        
        // Present suggestions
        presentSuggestions(suggestions, interests);
        
    } catch (error) {
        log(`Error during analysis: ${error.message}`);
        console.log(`❌ Analysis failed: ${error.message}`);
    }
}

/**
 * Extract keywords from text content
 */
function extractKeywordsFromText(text, suggestions) {
    const technicalTerms = [
        'python', 'javascript', 'node.js', 'react', 'vue', 'angular', 'docker', 'kubernetes',
        'aws', 'azure', 'gcp', 'machine learning', 'ai', 'artificial intelligence',
        'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'api', 'rest',
        'graphql', 'database', 'sql', 'nosql', 'mongodb', 'postgresql', 'git'
    ];
    
    const careerTerms = [
        'job', 'career', 'interview', 'salary', 'remote work', 'freelance',
        'startup', 'enterprise', 'hiring', 'recruitment', 'portfolio', 'resume'
    ];
    
    const learningTerms = [
        'course', 'tutorial', 'bootcamp', 'certification', 'learning', 'study',
        'practice', 'skill', 'education', 'training', 'development'
    ];
    
    const lowercaseText = text.toLowerCase();
    
    technicalTerms.forEach(term => {
        if (lowercaseText.includes(term)) {
            suggestions.technical.add(term);
        }
    });
    
    careerTerms.forEach(term => {
        if (lowercaseText.includes(term)) {
            suggestions.career.add(term);
        }
    });
    
    learningTerms.forEach(term => {
        if (lowercaseText.includes(term)) {
            suggestions.learning.add(term);
        }
    });
}

/**
 * Analyze codebase directory for technical interests
 */
function analyzeCodebaseDirectory(dir, suggestions) {
    try {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            
            if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.py'))) {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    // Look for imports and technologies used
                    const imports = content.match(/import\s+.+from\s+['"](.+)['"];?/g) || [];
                    imports.forEach(imp => {
                        const match = imp.match(/from\s+['"](.+)['"]/);
                        if (match) {
                            const lib = match[1];
                            if (!lib.startsWith('./') && !lib.startsWith('../')) {
                                suggestions.technical.add(lib);
                            }
                        }
                    });
                } catch (readError) {
                    // Skip files that can't be read
                }
            }
        });
    } catch (error) {
        log(`Error analyzing directory ${dir}: ${error.message}`);
    }
}

/**
 * Present suggestions to user
 */
function presentSuggestions(suggestions, interests) {
    console.log('💡 Suggested interests based on analysis:\n');
    
    for (const [category, keywords] of Object.entries(suggestions)) {
        if (keywords.size === 0) continue;
        
        const existingKeywords = new Set();
        if (interests.interests[category]?.keywords) {
            interests.interests[category].keywords.forEach(k => existingKeywords.add(k.toLowerCase()));
        }
        
        const newKeywords = [...keywords].filter(k => {
            return ![...existingKeywords].some(existing => 
                calculateSimilarity(k, existing) > 0.6
            );
        });
        
        if (newKeywords.length > 0) {
            console.log(`📂 ${category.charAt(0).toUpperCase() + category.slice(1)}:`);
            newKeywords.slice(0, 5).forEach(keyword => {
                console.log(`   + ${keyword}`);
            });
            console.log('');
        }
    }
    
    console.log('To add any of these suggestions:');
    console.log('  /manage-interests add [category] "[keyword]"');
    console.log('\nExample:');
    console.log('  /manage-interests add technical "docker containerization"');
}

/**
 * Deduplicate similar keywords within categories
 */
function dedupeInterests(interests) {
    log('Starting deduplication process');
    console.log('🧹 Analyzing keywords for duplicates and similar terms...\n');
    
    let totalRemoved = 0;
    
    for (const [categoryName, categoryData] of Object.entries(interests.interests)) {
        if (!categoryData.keywords || categoryData.keywords.length <= 1) continue;
        
        const keywords = categoryData.keywords;
        const toRemove = new Set();
        const duplicateGroups = [];
        
        // Find duplicate groups
        for (let i = 0; i < keywords.length; i++) {
            if (toRemove.has(i)) continue;
            
            const group = [i];
            for (let j = i + 1; j < keywords.length; j++) {
                if (toRemove.has(j)) continue;
                
                const similarity = calculateSimilarity(keywords[i], keywords[j]);
                if (similarity >= interests.metadata.deduplicationThreshold) {
                    group.push(j);
                    toRemove.add(j);
                }
            }
            
            if (group.length > 1) {
                duplicateGroups.push(group.map(idx => ({ index: idx, keyword: keywords[idx] })));
            }
        }
        
        if (duplicateGroups.length > 0) {
            console.log(`📂 ${categoryName}:`);
            
            duplicateGroups.forEach(group => {
                console.log(`  🔄 Similar terms found:`);
                group.forEach(({ keyword }, idx) => {
                    const marker = idx === 0 ? '✅ (keeping)' : '❌ (removing)';
                    console.log(`     ${marker} "${keyword}"`);
                });
                console.log('');
            });
            
            // Remove duplicates (keep first in each group)
            const newKeywords = keywords.filter((_, idx) => !toRemove.has(idx));
            categoryData.keywords = newKeywords;
            
            const removed = keywords.length - newKeywords.length;
            totalRemoved += removed;
            log(`Removed ${removed} duplicate keywords from ${categoryName}`);
        }
    }
    
    if (totalRemoved > 0) {
        console.log(`✅ Removed ${totalRemoved} duplicate keywords across all categories`);
    } else {
        console.log('✨ No duplicates found - your interests are already well-organized!');
    }
    
    return totalRemoved > 0;
}

/**
 * Main function
 */
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: /manage-interests [action] [category] [keyword/priority]');
        console.log('');
        console.log('Actions:');
        console.log('  list                           - Show current interests');
        console.log('  add [category] [keyword]       - Add interest keyword');
        console.log('  remove [category] [keyword]    - Remove keyword');
        console.log('  update-priority [cat] [pri]    - Update category priority');
        console.log('  analyze                        - Auto-detect from brain dumps');
        console.log('  dedupe                         - Remove duplicate keywords');
        return;
    }
    
    const [action, category, keywordOrPriority] = args;
    const interests = loadInterests();
    let changed = false;
    
    switch (action.toLowerCase()) {
        case 'list':
            listInterests(interests);
            break;
            
        case 'add':
            if (!category || !keywordOrPriority) {
                console.log('❌ Usage: /manage-interests add [category] [keyword]');
                return;
            }
            changed = addInterest(interests, category, keywordOrPriority);
            break;
            
        case 'remove':
            if (!category || !keywordOrPriority) {
                console.log('❌ Usage: /manage-interests remove [category] [keyword]');
                return;
            }
            changed = removeInterest(interests, category, keywordOrPriority);
            break;
            
        case 'update-priority':
            if (!category || !keywordOrPriority) {
                console.log('❌ Usage: /manage-interests update-priority [category] [HIGH|MEDIUM|LOW]');
                return;
            }
            changed = updatePriority(interests, category, keywordOrPriority);
            break;
            
        case 'analyze':
            analyzeInterests(interests);
            break;
            
        case 'dedupe':
            changed = dedupeInterests(interests);
            break;
            
        default:
            console.log(`❌ Unknown action: ${action}`);
            console.log('Available actions: list, add, remove, update-priority, analyze, dedupe');
            return;
    }
    
    // Save changes
    if (changed) {
        if (saveInterests(interests)) {
            console.log('💾 Changes saved successfully');
        } else {
            console.log('❌ Failed to save changes');
        }
    }
}

// Export for use in other scripts
export { loadInterests, saveInterests, addInterest, removeInterest, analyzeInterests };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}