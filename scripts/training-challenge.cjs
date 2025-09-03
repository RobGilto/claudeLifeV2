#!/usr/bin/env node

/**
 * Training Challenge System
 * 
 * Adaptive spaced repetition system for boot.dev Training Grounds
 * Generates concept prompts with intelligent feedback loops and dynamic wildcard challenges
 * 
 * Usage:
 *   node scripts/training-challenge.js
 *   node scripts/training-challenge.js feedback UUID-2025-09-03-001 7
 *   node scripts/training-challenge.js wildcard
 *   node scripts/training-challenge.js status
 *   node scripts/training-challenge.js config [setting] [value]
 * 
 * Dependencies: fs, path
 */

const fs = require('fs');
const path = require('path');

// File paths
const DATA_DIR = path.join(__dirname, '..', 'planning', 'training-challenges');
const WEIGHTS_FILE = path.join(DATA_DIR, 'attention-weights.json');
const WILDCARDS_FILE = path.join(DATA_DIR, 'wildcard-concepts.json');
const CONFIG_FILE = path.join(DATA_DIR, 'system-config.json');
const CHALLENGES_FILE = path.join(DATA_DIR, 'challenges-log.json');

// Utility functions
function loadJSON(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch (error) {
    console.error(`Error loading ${filepath}:`, error.message);
    return null;
  }
}

function saveJSON(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error saving ${filepath}:`, error.message);
    return false;
  }
}

function generateUUID(isWildcard = false, existingUUIDs = []) {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Count existing UUIDs for today
  const todayPattern = new RegExp(`UUID-${dateStr}-(W)?\\\\d{3}`);
  const todayCount = existingUUIDs.filter(id => todayPattern.test(id)).length;
  
  // Generate counter
  const counter = String(todayCount + 1).padStart(3, '0');
  const prefix = isWildcard ? 'W' : '';
  
  return `UUID-${dateStr}-${prefix}${counter}`;
}

function calculateWildcardProbability(weights) {
  const values = Object.values(weights);
  if (values.length === 0) return 0.15; // Default fallback
  
  const avgWeight = values.reduce((sum, w) => sum + w, 0) / values.length;
  
  if (avgWeight < 0.10) return 0.40;      // Mastery Zone
  if (avgWeight < 0.25) return 0.25;      // Comfort Zone  
  if (avgWeight < 0.50) return 0.15;      // Learning Zone
  return 0.05;                            // Foundation Zone
}

function selectWeightedConcept(weights, lastPracticed = {}) {
  const concepts = Object.keys(weights);
  
  // Apply spaced repetition multipliers
  const adjustedWeights = {};
  const today = new Date().toISOString().split('T')[0];
  
  for (const [concept, weight] of Object.entries(weights)) {
    const lastDate = lastPracticed[concept] || '1970-01-01';
    const daysSince = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
    
    let timeMultiplier;
    switch(daysSince) {
      case 0: timeMultiplier = 1.0; break;
      case 1: timeMultiplier = 1.2; break;
      case 2: timeMultiplier = 1.5; break;
      case 3: timeMultiplier = 1.8; break;
      default: timeMultiplier = 2.0; break; // 4+ days
    }
    
    adjustedWeights[concept] = weight * timeMultiplier;
  }
  
  const totalWeight = Object.values(adjustedWeights).reduce((sum, w) => sum + w, 0);
  
  if (totalWeight === 0) {
    // Fallback to uniform selection
    return concepts[Math.floor(Math.random() * concepts.length)];
  }
  
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  
  for (const concept of concepts) {
    cumulative += adjustedWeights[concept];
    if (random < cumulative) {
      return concept;
    }
  }
  
  // Fallback to last concept
  return concepts[concepts.length - 1];
}

function selectWildcardConcept(wildcards) {
  const categories = Object.keys(wildcards);
  if (categories.length === 0) return null;
  
  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  const concepts = wildcards[selectedCategory];
  
  if (concepts.length === 0) return null;
  
  const selectedConcept = concepts[Math.floor(Math.random() * concepts.length)];
  
  return {
    category: selectedCategory,
    prompt: selectedConcept
  };
}

function updateAttentionWeight(concept, currentWeight, rating) {
  let adjustment = 0;
  
  if (rating >= 9) adjustment = 0.30;        // Very hard
  else if (rating >= 7) adjustment = 0.15;   // Challenging
  else if (rating >= 5) adjustment = 0.00;   // Just right
  else if (rating >= 3) adjustment = -0.10;  // Getting easy
  else adjustment = -0.25;                   // Too easy
  
  // Apply bounds: [0.05, 1.0]
  return Math.max(0.05, Math.min(1.0, currentWeight + adjustment));
}

function processWildcardFeedback(challenge, rating, weights) {
  if (!challenge.feedback_history) challenge.feedback_history = [];
  
  const avgRating = challenge.feedback_history.reduce((a, b) => a + b, 0) / challenge.feedback_history.length;
  const attempts = challenge.attempts;
  
  if (avgRating <= 3.0 && attempts >= 2) {
    // Easy mastery - add with moderate weight
    weights[challenge.concept] = 0.15;
    return {
      action: 'mastered',
      message: '🎉 Wildcard mastered! Added to regular practice.',
      newWeight: 0.15
    };
  }
  
  if (avgRating >= 7.0 && attempts >= 1) {
    // Challenging - add with high weight for focused practice
    weights[challenge.concept] = 0.35;
    return {
      action: 'challenging',
      message: '💪 Challenging wildcard! Added to focused practice.',
      newWeight: 0.35
    };
  }
  
  return {
    action: 'continue',
    message: 'Wildcard practice continues...'
  };
}

function generateChallenge(forceWildcard = false) {
  console.log('🎯 TRAINING CHALLENGE GENERATOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const weights = loadJSON(WEIGHTS_FILE);
  const wildcards = loadJSON(WILDCARDS_FILE);
  const challengeLog = loadJSON(CHALLENGES_FILE);
  
  if (!weights || !wildcards || !challengeLog) {
    console.error('❌ Failed to load system data files');
    return;
  }
  
  // Determine if this should be a wildcard
  const wildcardProb = forceWildcard ? 1.0 : calculateWildcardProbability(weights);
  const isWildcard = Math.random() < wildcardProb;
  
  let concept, prompt;
  const existingUUIDs = Object.keys(challengeLog.challenges);
  const uuid = generateUUID(isWildcard, existingUUIDs);
  
  if (isWildcard) {
    console.log('⚡ WILDCARD AI ENGINEERING CHALLENGE ⚡\\n');
    const wildcardResult = selectWildcardConcept(wildcards);
    
    if (!wildcardResult) {
      console.error('❌ No wildcard concepts available');
      return;
    }
    
    concept = wildcardResult.category;
    prompt = wildcardResult.prompt;
    console.log(`Challenge ${uuid}\\n`);
    console.log(prompt);
    console.log('\\n🎲 This is a wildcard challenge designed to push your AI engineering skills!');
    
  } else {
    // Get last practiced dates for spaced repetition
    const lastPracticed = {};
    for (const [challengeUuid, challenge] of Object.entries(challengeLog.challenges)) {
      if (challenge.last_practiced && !challenge.isWildcard) {
        lastPracticed[challenge.concept] = challenge.last_practiced;
      }
    }
    
    concept = selectWeightedConcept(weights, lastPracticed);
    
    // Generate concept prompt based on the selected concept
    prompt = generateConceptPrompt(concept);
    
    console.log(`Challenge ${uuid}\\n`);
    console.log(prompt);
  }
  
  console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Copy this challenge to boot.dev Training Grounds');
  console.log(`Provide feedback when complete: /training-challenge feedback ${uuid} [1-10]`);
  
  // Log the challenge
  const challenge = {
    uuid,
    type: isWildcard ? 'wildcard' : 'regular',
    concept,
    prompt,
    isWildcard,
    generated_at: new Date().toISOString(),
    attempts: 0,
    feedback_history: []
  };
  
  challengeLog.challenges[uuid] = challenge;
  challengeLog.metadata.total_challenges++;
  if (isWildcard) challengeLog.metadata.total_wildcards++;
  
  saveJSON(CHALLENGES_FILE, challengeLog);
}

function generateConceptPrompt(concept) {
  const prompts = {
    'python-basics': 'Practice Python variable assignment, data types, and basic operators with input/output operations.',
    'python-functions': 'Work with function definitions, parameters, return values, and scope management in Python.',
    'python-data-structures': 'Practice working with lists, dictionaries, sets, and tuples. Focus on data manipulation and nested structures.',
    'python-oop': 'Implement classes, objects, inheritance, and encapsulation. Focus on method design and attribute management.',
    'algorithms': 'Practice algorithmic thinking with sorting, searching, or graph traversal problems. Consider time complexity.',
    'debugging': 'Debug existing code with logical errors, syntax issues, or runtime exceptions. Practice systematic problem-solving.',
    'testing': 'Write unit tests, integration tests, or debugging test cases. Focus on edge cases and error handling.',
    'system-design': 'Design scalable systems, APIs, or data architectures. Consider performance, reliability, and maintainability.',
    'javascript-fundamentals': 'Practice JavaScript variables, functions, objects, and arrays. Focus on ES6+ features.',
    'web-development': 'Work with HTML, CSS, DOM manipulation, or frontend frameworks. Focus on responsive design.',
    'database-design': 'Design database schemas, write SQL queries, or work with database optimization and indexing.',
    'api-development': 'Create REST APIs, handle HTTP requests/responses, or work with API authentication and validation.',
    'version-control': 'Practice Git workflows, branching strategies, merge conflicts, or collaborative development patterns.',
    'problem-solving': 'Solve complex coding challenges that require breaking down problems into smaller, manageable components.'
  };
  
  return prompts[concept] || `Practice advanced concepts in ${concept} with focus on practical implementation.`;
}

function processFeedback(uuid, rating) {
  console.log('📝 PROCESSING FEEDBACK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━');
  
  const challengeLog = loadJSON(CHALLENGES_FILE);
  const weights = loadJSON(WEIGHTS_FILE);
  
  if (!challengeLog || !weights) {
    console.error('❌ Failed to load system data files');
    return;
  }
  
  const challenge = challengeLog.challenges[uuid];
  if (!challenge) {
    console.error(`❌ Challenge ${uuid} not found`);
    return;
  }
  
  // Validate rating
  if (rating < 1 || rating > 10) {
    console.error('❌ Rating must be between 1 and 10');
    return;
  }
  
  // Update challenge with feedback
  challenge.attempts++;
  challenge.feedback_history.push(rating);
  challenge.last_practiced = new Date().toISOString().split('T')[0];
  
  console.log(`✅ Feedback recorded for ${uuid}`);
  console.log(`Difficulty: ${rating}/10\\n`);
  
  if (challenge.isWildcard) {
    // Process wildcard feedback
    const result = processWildcardFeedback(challenge, rating, weights);
    console.log(result.message);
    if (result.newWeight) {
      console.log(`   "${challenge.concept}" weight: ${Math.round(result.newWeight * 100)}%`);
    }
  } else {
    // Update regular concept weight
    const oldWeight = weights[challenge.concept] || 0.20;
    const newWeight = updateAttentionWeight(challenge.concept, oldWeight, rating);
    weights[challenge.concept] = newWeight;
    
    console.log(`📊 Updated System State:`);
    console.log(`   Wildcard Chance: ${Math.round(calculateWildcardProbability(weights) * 100)}%`);
    console.log(`   "${challenge.concept}" weight: ${Math.round(newWeight * 100)}%`);
  }
  
  console.log('\\nGenerate next challenge with: /training-challenge');
  
  // Save updated data
  saveJSON(CHALLENGES_FILE, challengeLog);
  saveJSON(WEIGHTS_FILE, weights);
}

function showStatus() {
  console.log('📊 TRAINING CHALLENGE STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const weights = loadJSON(WEIGHTS_FILE);
  const challengeLog = loadJSON(CHALLENGES_FILE);
  
  if (!weights || !challengeLog) {
    console.error('❌ Failed to load system data files');
    return;
  }
  
  const avgWeight = Object.values(weights).reduce((a, b) => a + b, 0) / Object.values(weights).length;
  const wildcardProb = calculateWildcardProbability(weights);
  
  // Determine system mode
  let mode;
  if (avgWeight < 0.10) mode = '🎯 MASTERY ZONE';
  else if (avgWeight < 0.25) mode = '⚖️ COMFORT ZONE';
  else if (avgWeight < 0.50) mode = '📚 LEARNING ZONE';
  else mode = '🏗️ FOUNDATION ZONE';
  
  console.log(`\\nSystem Mode: ${mode}`);
  console.log(`Average Attention: ${Math.round(avgWeight * 100)}%`);
  console.log(`Wildcard Probability: ${Math.round(wildcardProb * 100)}%\\n`);
  
  // Show top focus areas
  const sortedWeights = Object.entries(weights)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  console.log('Top Focus Areas:');
  for (const [concept, weight] of sortedWeights) {
    const level = weight >= 0.4 ? 'HIGH' : weight >= 0.25 ? 'MED' : 'LOW';
    console.log(`• ${concept}: ${Math.round(weight * 100)}% (${level})`);
  }
  
  console.log(`\\nTotal Challenges: ${challengeLog.metadata.total_challenges}`);
  console.log(`Wildcard Encounters: ${challengeLog.metadata.total_wildcards} (${Math.round(challengeLog.metadata.total_wildcards / Math.max(1, challengeLog.metadata.total_challenges) * 100)}%)\\n`);
  
  console.log('Generate challenge: /training-challenge');
  console.log('Force wildcard: /training-challenge wildcard');
}

function showConfig(setting = null, value = null) {
  const config = loadJSON(CONFIG_FILE);
  if (!config) {
    console.error('❌ Failed to load configuration');
    return;
  }
  
  if (!setting) {
    console.log('⚙️ SYSTEM CONFIGURATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\\nWildcard Probabilities:');
    console.log(`• Mastery Zone: ${Math.round(config.wildcard_probabilities.mastery * 100)}%`);
    console.log(`• Comfort Zone: ${Math.round(config.wildcard_probabilities.comfort * 100)}%`);
    console.log(`• Learning Zone: ${Math.round(config.wildcard_probabilities.learning * 100)}%`);
    console.log(`• Foundation Zone: ${Math.round(config.wildcard_probabilities.foundation * 100)}%`);
    
    console.log('\\nWeight Adjustments:');
    console.log(`• Very Hard (9-10): +${Math.round(config.weight_adjustments.very_hard * 100)}%`);
    console.log(`• Challenging (7-8): +${Math.round(config.weight_adjustments.challenging * 100)}%`);
    console.log(`• Just Right (5-6): ${config.weight_adjustments.just_right * 100}%`);
    console.log(`• Getting Easy (3-4): ${Math.round(config.weight_adjustments.getting_easy * 100)}%`);
    console.log(`• Too Easy (1-2): ${Math.round(config.weight_adjustments.too_easy * 100)}%`);
    
  } else if (value !== null) {
    // Update configuration
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      console.error('❌ Configuration value must be a number');
      return;
    }
    
    // Map setting names to config paths
    const settingMap = {
      'mastery-wildcard': ['wildcard_probabilities', 'mastery'],
      'comfort-wildcard': ['wildcard_probabilities', 'comfort'],
      'learning-wildcard': ['wildcard_probabilities', 'learning'],
      'foundation-wildcard': ['wildcard_probabilities', 'foundation']
    };
    
    if (settingMap[setting]) {
      const [category, key] = settingMap[setting];
      config[category][key] = numValue;
      
      if (saveJSON(CONFIG_FILE, config)) {
        console.log(`✅ Updated ${setting} to ${Math.round(numValue * 100)}%`);
      } else {
        console.error('❌ Failed to save configuration');
      }
    } else {
      console.error(`❌ Unknown setting: ${setting}`);
    }
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';
  
  switch (command) {
    case 'generate':
    case '':
      generateChallenge();
      break;
      
    case 'wildcard':
      generateChallenge(true);
      break;
      
    case 'feedback':
      if (args.length < 3) {
        console.error('Usage: node training-challenge.js feedback UUID rating');
        return;
      }
      processFeedback(args[1], parseInt(args[2]));
      break;
      
    case 'status':
      showStatus();
      break;
      
    case 'config':
      showConfig(args[1], args[2]);
      break;
      
    default:
      console.log('Available commands:');
      console.log('  generate (default) - Generate a new challenge');
      console.log('  wildcard          - Force a wildcard challenge');
      console.log('  feedback UUID rating - Process challenge feedback');
      console.log('  status            - Show system status');
      console.log('  config [setting] [value] - View/modify configuration');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateChallenge,
  processFeedback,
  showStatus,
  showConfig,
  calculateWildcardProbability,
  selectWeightedConcept,
  updateAttentionWeight
};