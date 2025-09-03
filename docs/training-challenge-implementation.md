# Training Challenge System Implementation Guide

## Quick Start

This guide provides step-by-step instructions for implementing the Training Challenge System. Follow these steps to build a working system from scratch.

## Prerequisites

### System Requirements
- Node.js 18+ (for scripts)
- Existing claudeLifeV2 system structure
- Access to boot.dev profile scraping (Firecrawl MCP)
- Basic familiarity with JSON data structures

### Directory Structure Required
```
Areas/claudeLifeV2/
├── .claude/commands/
├── scripts/
├── planning/training-challenges/
└── docs/
```

## Implementation Steps

### Step 1: Create Data Storage Structure

First, create the data directory and initial files:

```bash
mkdir -p planning/training-challenges
cd planning/training-challenges
```

Create initial data files:

**challenges-log.json**:
```json
{
  "metadata": {
    "version": "1.0.0",
    "created": "2025-09-03",
    "total_challenges": 0,
    "total_wildcards": 0
  },
  "challenges": {}
}
```

**attention-weights.json**:
```json
{
  "python-basics": 0.20,
  "python-functions": 0.15,
  "python-data-structures": 0.25,
  "python-oop": 0.30,
  "algorithms": 0.35,
  "debugging": 0.20,
  "testing": 0.40,
  "system-design": 0.45
}
```

**wildcard-concepts.json**:
```json
{
  "llm-fundamentals": [
    "Implement attention score calculations with softmax normalization",
    "Build positional encoding for sequence data",
    "Create token embedding lookup tables"
  ],
  "prompt-engineering": [
    "Design prompt validation system with injection detection",
    "Implement few-shot example selection based on similarity",
    "Build prompt compression algorithm for context limits"
  ],
  "rag-implementation": [
    "Create document chunking algorithm with overlap handling",
    "Implement semantic search using vector embeddings",
    "Build reranking system for retrieved documents"
  ],
  "neural-networks": [
    "Implement backpropagation from scratch",
    "Build activation function library with derivatives",
    "Create gradient descent optimizer variations"
  ],
  "vector-operations": [
    "Implement cosine similarity calculations efficiently",
    "Build dimension reduction using PCA",
    "Create k-means clustering from scratch"
  ]
}
```

**system-config.json**:
```json
{
  "wildcard_thresholds": {
    "mastery_zone": 0.10,
    "comfort_zone": 0.25,
    "learning_zone": 0.50
  },
  "wildcard_probabilities": {
    "mastery": 0.40,
    "comfort": 0.25,
    "learning": 0.15,
    "foundation": 0.05
  },
  "weight_adjustments": {
    "very_hard": 0.30,
    "challenging": 0.15,
    "just_right": 0.00,
    "getting_easy": -0.10,
    "too_easy": -0.25
  },
  "uuid_format": "UUID-YYYY-MM-DD-###",
  "wildcard_prefix": "W"
}
```

### Step 2: Create the Command Definition

Create `.claude/commands/training-challenge.md`:

```markdown
# Training Challenge Command

Generate adaptive programming challenges for boot.dev Training Grounds with spaced repetition and feedback loops.

## Usage

Generate a challenge based on current attention weights and wildcard probability:
```bash
/training-challenge
```

Provide feedback after attempting a challenge:
```bash
/training-challenge feedback <uuid> <difficulty: 1-10>
```

Force a wildcard AI engineering challenge:
```bash
/training-challenge wildcard
```

View current attention weights and system status:
```bash
/training-challenge status
```

View configuration and adjust settings:
```bash
/training-challenge config [setting] [value]
```

## Process

1. **Challenge Generation**: System analyzes your current attention weights
2. **Wildcard Calculation**: Probability adjusted based on mastery level
3. **Concept Selection**: Weighted random selection or wildcard
4. **Prompt Creation**: Simple concept prompt with UUID
5. **User Action**: Copy prompt to boot.dev Training Grounds
6. **Feedback Loop**: Rate difficulty to update system

## Integration

- Updates skill matrix based on practiced concepts
- Feeds into victory system for breakthrough detection
- Integrates with daily checkin for progress tracking
- Connects to boot.dev profile via Firecrawl MCP

*"Adaptive challenge generation for elite AI engineer preparation"*
```

### Step 3: Implement Core Script

Create `scripts/training-challenge.js`:

```javascript
#!/usr/bin/env node

/**
 * Training Challenge System
 * 
 * Generates adaptive programming challenges for boot.dev with spaced repetition
 * and dynamic wildcard probability based on mastery level.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const CHALLENGES_DIR = path.join(__dirname, '..', 'planning', 'training-challenges');
const LOG_FILE = path.join(CHALLENGES_DIR, 'challenges-log.json');
const WEIGHTS_FILE = path.join(CHALLENGES_DIR, 'attention-weights.json');
const WILDCARDS_FILE = path.join(CHALLENGES_DIR, 'wildcard-concepts.json');
const CONFIG_FILE = path.join(CHALLENGES_DIR, 'system-config.json');

// Utility functions
function loadJSON(filepath) {
  if (!fs.existsSync(filepath)) return {};
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function saveJSON(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function generateUUID(isWildcard = false) {
  const today = getToday();
  const log = loadJSON(LOG_FILE);
  const todayCount = Object.keys(log.challenges || {})
    .filter(id => id.includes(today))
    .length;
  
  const prefix = isWildcard ? 'W' : '';
  const counter = String(todayCount + 1).padStart(3, '0');
  return `UUID-${today}-${prefix}${counter}`;
}

// Core functions
function calculateWildcardProbability() {
  const weights = loadJSON(WEIGHTS_FILE);
  const config = loadJSON(CONFIG_FILE);
  
  const values = Object.values(weights);
  if (values.length === 0) return 0.15; // Default fallback
  
  const avgWeight = values.reduce((a, b) => a + b, 0) / values.length;
  
  if (avgWeight < config.wildcard_thresholds.mastery_zone) {
    return config.wildcard_probabilities.mastery;
  } else if (avgWeight < config.wildcard_thresholds.comfort_zone) {
    return config.wildcard_probabilities.comfort;
  } else if (avgWeight < config.wildcard_thresholds.learning_zone) {
    return config.wildcard_probabilities.learning;
  } else {
    return config.wildcard_probabilities.foundation;
  }
}

function selectWeightedConcept() {
  const weights = loadJSON(WEIGHTS_FILE);
  const concepts = Object.keys(weights);
  
  if (concepts.length === 0) {
    throw new Error('No concepts available in attention weights');
  }
  
  // Weighted random selection
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const random = Math.random() * totalWeight;
  
  let cumulative = 0;
  for (const concept of concepts) {
    cumulative += weights[concept];
    if (random <= cumulative) {
      return concept;
    }
  }
  
  // Fallback to last concept
  return concepts[concepts.length - 1];
}

function selectWildcardConcept() {
  const wildcards = loadJSON(WILDCARDS_FILE);
  const categories = Object.keys(wildcards);
  
  if (categories.length === 0) {
    throw new Error('No wildcard concepts available');
  }
  
  // Random category selection
  const category = categories[Math.floor(Math.random() * categories.length)];
  const concepts = wildcards[category];
  
  // Random concept selection
  const concept = concepts[Math.floor(Math.random() * concepts.length)];
  
  return { category, concept };
}

function generateRegularChallenge() {
  const concept = selectWeightedConcept();
  const uuid = generateUUID(false);
  
  // Create a concept prompt based on the selected area
  const prompts = {
    'python-basics': 'Practice Python fundamentals including variables, loops, and conditionals with edge case handling',
    'python-functions': 'Work with function design, parameter validation, and return value optimization',
    'python-data-structures': 'Implement operations on lists, dictionaries, and sets with performance considerations',
    'python-oop': 'Design classes with inheritance, encapsulation, and polymorphism principles',
    'algorithms': 'Implement sorting, searching, or graph algorithms with complexity analysis',
    'debugging': 'Debug existing code by identifying logical errors and edge cases',
    'testing': 'Write comprehensive tests including unit tests and edge case coverage',
    'system-design': 'Design scalable system components with proper error handling and interfaces'
  };
  
  const prompt = prompts[concept] || `Practice ${concept.replace('-', ' ')} concepts`;
  
  return {
    uuid,
    type: 'regular',
    concept,
    prompt,
    isWildcard: false
  };
}

function generateWildcardChallenge() {
  const { category, concept } = selectWildcardConcept();
  const uuid = generateUUID(true);
  
  return {
    uuid,
    type: 'wildcard',
    concept: category,
    prompt: concept,
    isWildcard: true
  };
}

function displayChallenge(challenge) {
  const wildcardProb = calculateWildcardProbability();
  const weights = loadJSON(WEIGHTS_FILE);
  const avgWeight = Object.values(weights).reduce((a, b) => a + b, 0) / Object.values(weights).length;
  
  console.log('🎯 TRAINING CHALLENGE GENERATED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  if (challenge.isWildcard) {
    console.log('⚡ WILDCARD AI ENGINEERING CHALLENGE ⚡');
    console.log('');
  }
  
  console.log(`Challenge ${challenge.uuid}`);
  console.log('');
  console.log(challenge.prompt);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📋 Copy the above challenge (including UUID)');
  console.log('🔗 Paste into: https://www.boot.dev/training');
  console.log('⚡ Boot.dev will generate the full challenge');
  console.log('✅ After completing, rate difficulty:');
  console.log(`   /training-challenge feedback ${challenge.uuid} <1-10>`);
  console.log('');
  
  // Show system state
  if (avgWeight < 0.10) {
    console.log('📊 System State: 🏆 MASTERY ZONE');
    console.log(`   Wildcard Chance: ${Math.round(wildcardProb * 100)}% (elevated)`);
  } else if (avgWeight >= 0.50) {
    console.log('📊 System State: 📚 FOUNDATION MODE');
    console.log(`   Wildcard Chance: ${Math.round(wildcardProb * 100)}% (minimized)`);
  } else {
    console.log('📊 System State: ⚖️ BALANCED MODE');
    console.log(`   Wildcard Chance: ${Math.round(wildcardProb * 100)}%`);
  }
  
  console.log(`   Average Attention: ${Math.round(avgWeight * 100)}%`);
}

function generateChallenge(forceWildcard = false) {
  const wildcardProb = calculateWildcardProbability();
  const isWildcard = forceWildcard || Math.random() < wildcardProb;
  
  const challenge = isWildcard ? generateWildcardChallenge() : generateRegularChallenge();
  
  // Log the generated challenge
  const log = loadJSON(LOG_FILE);
  log.challenges = log.challenges || {};
  log.challenges[challenge.uuid] = {
    ...challenge,
    generated_at: new Date().toISOString(),
    attempts: 0,
    feedback_history: []
  };
  log.metadata.total_challenges = Object.keys(log.challenges).length;
  if (challenge.isWildcard) {
    log.metadata.total_wildcards = (log.metadata.total_wildcards || 0) + 1;
  }
  saveJSON(LOG_FILE, log);
  
  displayChallenge(challenge);
  return challenge;
}

function processFeedback(uuid, rating) {
  if (!uuid || rating === undefined) {
    console.error('Usage: /training-challenge feedback <uuid> <rating 1-10>');
    return;
  }
  
  rating = parseInt(rating);
  if (rating < 1 || rating > 10) {
    console.error('Rating must be between 1 and 10');
    return;
  }
  
  const log = loadJSON(LOG_FILE);
  if (!log.challenges || !log.challenges[uuid]) {
    console.error(`Challenge ${uuid} not found`);
    return;
  }
  
  const challenge = log.challenges[uuid];
  challenge.attempts = (challenge.attempts || 0) + 1;
  challenge.feedback_history = challenge.feedback_history || [];
  challenge.feedback_history.push(rating);
  challenge.last_practiced = getToday();
  
  // Update attention weights
  const weights = loadJSON(WEIGHTS_FILE);
  const config = loadJSON(CONFIG_FILE);
  
  let adjustment = 0;
  if (rating >= 9) adjustment = config.weight_adjustments.very_hard;
  else if (rating >= 7) adjustment = config.weight_adjustments.challenging;
  else if (rating >= 5) adjustment = config.weight_adjustments.just_right;
  else if (rating >= 3) adjustment = config.weight_adjustments.getting_easy;
  else adjustment = config.weight_adjustments.too_easy;
  
  if (challenge.isWildcard) {
    // Handle wildcard feedback
    if (rating <= 3) {
      console.log('🎉 Wildcard mastered! Too easy - you\'ve leveled up!');
    } else if (rating >= 7) {
      // Add to regular rotation with high attention
      weights[challenge.concept] = (weights[challenge.concept] || 0) + 0.25;
      console.log(`💪 Challenging wildcard! Added "${challenge.concept}" to focused practice.`);
    }
  } else {
    // Regular challenge feedback
    const currentWeight = weights[challenge.concept] || 0.20;
    weights[challenge.concept] = Math.max(0.05, Math.min(1.0, currentWeight + adjustment));
  }
  
  saveJSON(WEIGHTS_FILE, weights);
  saveJSON(LOG_FILE, log);
  
  console.log(`✅ Feedback recorded for ${uuid}`);
  console.log(`Difficulty: ${rating}/10`);
  console.log('');
  
  // Show updated state
  const newWildcardProb = calculateWildcardProbability();
  console.log('📊 Updated System State:');
  console.log(`   Wildcard Chance: ${Math.round(newWildcardProb * 100)}%`);
  console.log(`   "${challenge.concept}" weight: ${Math.round((weights[challenge.concept] || 0) * 100)}%`);
  console.log('');
  console.log('Generate next challenge with: /training-challenge');
}

function showStatus() {
  const weights = loadJSON(WEIGHTS_FILE);
  const log = loadJSON(LOG_FILE);
  const wildcardProb = calculateWildcardProbability();
  
  console.log('📊 TRAINING CHALLENGE STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  
  // System mode
  const avgWeight = Object.values(weights).reduce((a, b) => a + b, 0) / Object.values(weights).length;
  if (avgWeight < 0.10) {
    console.log('System Mode: 🏆 MASTERY ZONE');
  } else if (avgWeight < 0.25) {
    console.log('System Mode: 🎯 COMFORT ZONE');
  } else if (avgWeight < 0.50) {
    console.log('System Mode: ⚖️ LEARNING ZONE');
  } else {
    console.log('System Mode: 📚 FOUNDATION MODE');
  }
  
  console.log(`Average Attention: ${Math.round(avgWeight * 100)}%`);
  console.log(`Wildcard Probability: ${Math.round(wildcardProb * 100)}%`);
  console.log('');
  
  // Top attention areas
  const sortedWeights = Object.entries(weights)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  console.log('Top Focus Areas:');
  sortedWeights.forEach(([concept, weight]) => {
    const percent = Math.round(weight * 100);
    const priority = weight > 0.30 ? 'HIGH' : weight > 0.15 ? 'MED' : 'LOW';
    console.log(`• ${concept}: ${percent}% (${priority})`);
  });
  
  console.log('');
  
  // Statistics
  const totalChallenges = log.metadata?.total_challenges || 0;
  const totalWildcards = log.metadata?.total_wildcards || 0;
  console.log(`Total Challenges: ${totalChallenges}`);
  console.log(`Wildcard Encounters: ${totalWildcards} (${totalChallenges ? Math.round(totalWildcards/totalChallenges*100) : 0}%)`);
  console.log('');
  console.log('Generate challenge: /training-challenge');
  console.log('Force wildcard: /training-challenge wildcard');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'feedback':
        processFeedback(args[1], args[2]);
        break;
      case 'wildcard':
        generateChallenge(true);
        break;
      case 'status':
        showStatus();
        break;
      case 'config':
        console.log('Configuration management coming soon...');
        break;
      default:
        generateChallenge();
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateChallenge,
  processFeedback,
  showStatus,
  calculateWildcardProbability
};
```

### Step 4: Test the Implementation

Create a test script `scripts/test-training-challenge.js`:

```javascript
#!/usr/bin/env node

const { generateChallenge, processFeedback, showStatus } = require('./training-challenge.js');

console.log('Testing Training Challenge System...');
console.log('');

// Test 1: Generate challenge
console.log('=== Test 1: Generate Challenge ===');
generateChallenge();
console.log('');

// Test 2: Show status
console.log('=== Test 2: System Status ===');
showStatus();
console.log('');

console.log('Manual testing:');
console.log('1. Run: node scripts/training-challenge.js');
console.log('2. Copy challenge to boot.dev');
console.log('3. Test feedback: node scripts/training-challenge.js feedback UUID-xxx 7');
console.log('4. Check status: node scripts/training-challenge.js status');
```

### Step 5: Integration with Existing Systems

#### Hook into Skill Matrix Updates

Add to `scripts/training-challenge.js`:

```javascript
function updateSkillMatrix(concept, practiceHours = 0.5) {
  const skillMatrixPath = path.join(__dirname, '..', 'skills', 'skill-matrix.json');
  
  if (fs.existsSync(skillMatrixPath)) {
    const skillMatrix = loadJSON(skillMatrixPath);
    
    // Map concepts to skill categories
    const conceptToSkill = {
      'python-basics': 'software_engineering.python',
      'python-functions': 'software_engineering.python',
      'python-data-structures': 'software_engineering.python',
      'python-oop': 'software_engineering.python',
      'algorithms': 'software_engineering.debugging',
      'debugging': 'software_engineering.debugging',
      'testing': 'software_engineering.testing'
    };
    
    const skillPath = conceptToSkill[concept];
    if (skillPath) {
      const [category, skill] = skillPath.split('.');
      if (skillMatrix.categories[category]?.skills[skill]) {
        skillMatrix.categories[category].skills[skill].lastPracticed = getToday();
        skillMatrix.categories[category].skills[skill].weeklyPracticeHours += practiceHours;
        
        // Add evidence
        if (!skillMatrix.categories[category].skills[skill].evidence.includes('Training challenge practice')) {
          skillMatrix.categories[category].skills[skill].evidence.push('Training challenge practice');
        }
        
        saveJSON(skillMatrixPath, skillMatrix);
      }
    }
  }
}
```

#### Victory System Integration

Add victory triggers in the feedback function:

```javascript
function checkForVictories(challenge, rating) {
  const victories = [];
  
  // First wildcard completion
  if (challenge.isWildcard && challenge.attempts === 1) {
    victories.push({
      type: 'first_wildcard',
      description: 'Completed first AI engineering wildcard challenge',
      difficulty: rating
    });
  }
  
  // Difficult concept mastered (rating dropped to easy)
  if (rating <= 3 && challenge.feedback_history.some(r => r >= 7)) {
    victories.push({
      type: 'concept_mastered',
      description: `Mastered ${challenge.concept} - from challenging to easy`,
      concept: challenge.concept
    });
  }
  
  // Log victories if any
  if (victories.length > 0) {
    console.log('🏆 VICTORIES DETECTED:');
    victories.forEach(v => {
      console.log(`   • ${v.description}`);
    });
    console.log('');
  }
}
```

### Step 6: Deployment Checklist

- [ ] Create data directory structure
- [ ] Initialize JSON data files with sample data
- [ ] Create command definition in `.claude/commands/`
- [ ] Implement main script in `scripts/`
- [ ] Test challenge generation
- [ ] Test feedback processing
- [ ] Test wildcard probability calculation
- [ ] Verify file permissions are correct
- [ ] Test integration with existing systems
- [ ] Create backup of original data files

### Step 7: Usage Examples

Once implemented, users can:

```bash
# Generate challenge
/training-challenge

# Provide feedback
/training-challenge feedback UUID-2025-09-03-001 7

# Force AI engineering challenge
/training-challenge wildcard

# Check system status
/training-challenge status
```

## Troubleshooting

### Common Issues

1. **Missing data files**: Ensure all JSON files exist with valid structure
2. **Permission errors**: Check file permissions in planning directory
3. **Invalid UUID**: Verify UUID format matches expectations
4. **Wildcard probability stuck**: Check attention weights are updating correctly

### Debug Mode

Add debug logging by setting environment variable:
```bash
DEBUG=1 /training-challenge
```

### Data Reset

To reset the system:
```bash
# Backup current data
cp -r planning/training-challenges planning/training-challenges.backup

# Reset to initial state
# Recreate data files as shown in Step 1
```

This implementation provides a complete, testable training challenge system that adapts to user progress and integrates with the existing claudeLifeV2 ecosystem.