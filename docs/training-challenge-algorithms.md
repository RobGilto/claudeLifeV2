# Training Challenge System Algorithms

## Overview

This document provides detailed mathematical and algorithmic specifications for the Training Challenge System's core algorithms, including spaced repetition, attention weight calculations, and wildcard probability scaling.

## Core Algorithms

### 1. Dynamic Wildcard Probability Algorithm

The system dynamically adjusts wildcard challenge frequency based on overall mastery level.

#### Mathematical Definition

```
Let W = {w₁, w₂, ..., wₙ} be the set of attention weights
Let W̄ = (∑ᵢ₌₁ⁿ wᵢ) / n be the average attention weight

P(wildcard) = {
  0.40  if W̄ < 0.10  (Mastery Zone)
  0.25  if 0.10 ≤ W̄ < 0.25  (Comfort Zone)
  0.15  if 0.25 ≤ W̄ < 0.50  (Learning Zone)
  0.05  if W̄ ≥ 0.50  (Foundation Zone)
}
```

#### Implementation
```javascript
function calculateWildcardProbability(weights) {
  const values = Object.values(weights);
  if (values.length === 0) return 0.15; // Default fallback
  
  const avgWeight = values.reduce((sum, w) => sum + w, 0) / values.length;
  
  if (avgWeight < 0.10) return 0.40;      // Mastery Zone
  if (avgWeight < 0.25) return 0.25;      // Comfort Zone  
  if (avgWeight < 0.50) return 0.15;      // Learning Zone
  return 0.05;                            // Foundation Zone
}
```

#### Rationale
- **Mastery Zone** (40% wildcards): When all concepts are well-practiced, introduce advanced challenges
- **Foundation Zone** (5% wildcards): When struggling with basics, minimize overwhelming challenges
- **Smooth transitions**: Prevents abrupt changes in difficulty

### 2. Weighted Random Selection Algorithm

Selects concepts for regular challenges based on attention weights using cumulative distribution.

#### Mathematical Definition

```
Let C = {c₁, c₂, ..., cₙ} be the set of concepts
Let W = {w₁, w₂, ..., wₙ} be their attention weights
Let W_total = ∑ᵢ₌₁ⁿ wᵢ be the sum of all weights

For random value r ∈ [0, W_total):
Select concept cᵢ where ∑ⱼ₌₁ⁱ⁻¹ wⱼ ≤ r < ∑ⱼ₌₁ⁱ wⱼ
```

#### Implementation
```javascript
function selectWeightedConcept(weights) {
  const concepts = Object.keys(weights);
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  
  if (totalWeight === 0) {
    // Fallback to uniform selection
    return concepts[Math.floor(Math.random() * concepts.length)];
  }
  
  const random = Math.random() * totalWeight;
  let cumulative = 0;
  
  for (const concept of concepts) {
    cumulative += weights[concept];
    if (random < cumulative) {
      return concept;
    }
  }
  
  // Fallback to last concept
  return concepts[concepts.length - 1];
}
```

#### Time Complexity
- **Best Case**: O(1) - first concept selected
- **Average Case**: O(n/2) - middle concept selected  
- **Worst Case**: O(n) - last concept selected

### 3. Attention Weight Adjustment Algorithm

Updates concept attention weights based on user difficulty ratings.

#### Mathematical Definition

```
Let wᵢ be the current weight for concept i
Let r be the user difficulty rating (1-10)
Let Δ(r) be the adjustment function:

Δ(r) = {
  +0.30  if r ∈ [9,10]  (Very Hard)
  +0.15  if r ∈ [7,8]   (Challenging)
   0.00  if r ∈ [5,6]   (Just Right)  
  -0.10  if r ∈ [3,4]   (Getting Easy)
  -0.25  if r ∈ [1,2]   (Too Easy)
}

wᵢ' = max(0.05, min(1.0, wᵢ + Δ(r)))
```

#### Implementation
```javascript
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
```

#### Weight Bounds Rationale
- **Minimum (0.05)**: Ensures all concepts remain selectable
- **Maximum (1.0)**: Prevents any single concept from dominating
- **Smooth adjustments**: Gradual changes prevent system instability

### 4. Spaced Repetition Algorithm

Increases concept priority based on time since last practice.

#### Mathematical Definition

```
Let tᵢ be days since concept i was last practiced
Let wᵢ be the base attention weight for concept i
Let priority(i) = wᵢ × f(tᵢ) where:

f(t) = {
  1.0      if t = 0    (practiced today)
  1.2      if t = 1    (practiced yesterday)
  1.5      if t = 2    
  1.8      if t = 3
  2.0      if t ≥ 4    (caps at 2x multiplier)
}
```

#### Implementation
```javascript
function calculateSpacedRepetitionPriority(concept, baseWeight, daysSinceLastPractice) {
  let timeMultiplier;
  
  switch(daysSinceLastPractice) {
    case 0: timeMultiplier = 1.0; break;
    case 1: timeMultiplier = 1.2; break;
    case 2: timeMultiplier = 1.5; break;
    case 3: timeMultiplier = 1.8; break;
    default: timeMultiplier = 2.0; break; // 4+ days
  }
  
  return baseWeight * timeMultiplier;
}

function selectWithSpacedRepetition(weights, lastPracticed) {
  const today = new Date().toISOString().split('T')[0];
  const adjustedWeights = {};
  
  for (const [concept, weight] of Object.entries(weights)) {
    const lastDate = lastPracticed[concept] || '1970-01-01';
    const daysSince = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
    adjustedWeights[concept] = calculateSpacedRepetitionPriority(concept, weight, daysSince);
  }
  
  return selectWeightedConcept(adjustedWeights);
}
```

### 5. Wildcard Integration Algorithm

Determines when wildcard challenges should join regular rotation.

#### Mathematical Definition

```
Let r̄ be the average difficulty rating for a wildcard challenge
Let n be the number of attempts

Integration conditions:
- Easy mastery: r̄ ≤ 3.0 and n ≥ 2
- Challenging but valuable: r̄ ≥ 7.0 and n ≥ 1

New weight calculation:
wₙₑw = {
  0.15  if r̄ ≤ 3.0  (mastered easily)
  0.35  if r̄ ≥ 7.0  (challenging, needs practice)
}
```

#### Implementation
```javascript
function processWildcardFeedback(challenge, rating, weights) {
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
```

### 6. UUID Generation Algorithm

Creates unique identifiers with embedded metadata.

#### Format Specification

```
UUID Format: UUID-YYYY-MM-DD-[W]###

Where:
- YYYY: 4-digit year
- MM: 2-digit month (01-12)
- DD: 2-digit day (01-31)
- W: Optional wildcard prefix
- ###: 3-digit counter (001-999)
```

#### Implementation
```javascript
function generateUUID(isWildcard = false, existingUUIDs = []) {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Count existing UUIDs for today
  const todayPattern = new RegExp(`UUID-${dateStr}-(W)?\\d{3}`);
  const todayCount = existingUUIDs.filter(id => todayPattern.test(id)).length;
  
  // Generate counter
  const counter = String(todayCount + 1).padStart(3, '0');
  const prefix = isWildcard ? 'W' : '';
  
  return `UUID-${dateStr}-${prefix}${counter}`;
}
```

### 7. System State Analysis Algorithm

Analyzes overall system health and learning patterns.

#### Metrics Calculation

```javascript
function analyzeSystemState(weights, challengeLog) {
  const analysis = {
    mastery_level: calculateMasteryLevel(weights),
    learning_velocity: calculateLearningVelocity(challengeLog),
    concept_distribution: calculateConceptDistribution(weights),
    challenge_diversity: calculateChallengeDiversity(challengeLog),
    success_patterns: analyzeSuccessPatterns(challengeLog)
  };
  
  return analysis;
}

function calculateMasteryLevel(weights) {
  const values = Object.values(weights);
  const avgWeight = values.reduce((a, b) => a + b, 0) / values.length;
  
  if (avgWeight < 0.10) return 'expert';
  if (avgWeight < 0.25) return 'advanced';
  if (avgWeight < 0.50) return 'intermediate';
  return 'beginner';
}

function calculateLearningVelocity(challengeLog) {
  const last7Days = Object.values(challengeLog.challenges)
    .filter(c => {
      const challengeDate = new Date(c.generated_at);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return challengeDate >= weekAgo;
    });
  
  return {
    challenges_per_day: last7Days.length / 7,
    avg_difficulty: last7Days.reduce((sum, c) => {
      const avgRating = c.feedback_history.reduce((a, b) => a + b, 0) / c.feedback_history.length;
      return sum + (avgRating || 5);
    }, 0) / last7Days.length,
    wildcard_rate: last7Days.filter(c => c.isWildcard).length / last7Days.length
  };
}
```

## Performance Optimization

### 1. Weight Update Batching

For multiple feedback items, batch weight updates to reduce I/O:

```javascript
function batchUpdateWeights(feedbackItems, weights) {
  const updates = {};
  
  for (const item of feedbackItems) {
    const concept = item.concept;
    const adjustment = calculateAdjustment(item.rating);
    updates[concept] = (updates[concept] || weights[concept] || 0.2) + adjustment;
  }
  
  // Apply bounds and update
  for (const [concept, newWeight] of Object.entries(updates)) {
    weights[concept] = Math.max(0.05, Math.min(1.0, newWeight));
  }
  
  return weights;
}
```

### 2. Cached Probability Calculations

Cache wildcard probabilities to avoid recalculation:

```javascript
class ProbabilityCache {
  constructor() {
    this.cache = new Map();
    this.lastUpdate = 0;
  }
  
  getWildcardProbability(weights) {
    const weightsHash = this.hashWeights(weights);
    const now = Date.now();
    
    // Cache valid for 5 minutes
    if (this.cache.has(weightsHash) && (now - this.lastUpdate) < 300000) {
      return this.cache.get(weightsHash);
    }
    
    const probability = calculateWildcardProbability(weights);
    this.cache.set(weightsHash, probability);
    this.lastUpdate = now;
    
    return probability;
  }
  
  hashWeights(weights) {
    return JSON.stringify(Object.entries(weights).sort());
  }
}
```

### 3. Memory-Efficient Challenge Storage

For large challenge logs, implement circular buffer:

```javascript
class ChallengeBuffer {
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
    this.challenges = {};
  }
  
  addChallenge(challenge) {
    this.challenges[challenge.uuid] = challenge;
    
    // Remove oldest challenges if over limit
    const uuids = Object.keys(this.challenges);
    if (uuids.length > this.maxSize) {
      const sortedUuids = uuids.sort();
      const toRemove = sortedUuids.slice(0, uuids.length - this.maxSize);
      
      for (const uuid of toRemove) {
        delete this.challenges[uuid];
      }
    }
  }
}
```

## Algorithm Validation

### Unit Tests for Core Algorithms

```javascript
// Test wildcard probability calculation
function testWildcardProbability() {
  const testCases = [
    { weights: { 'python': 0.05, 'js': 0.08 }, expected: 0.40 }, // Mastery
    { weights: { 'python': 0.20, 'js': 0.18 }, expected: 0.25 }, // Comfort
    { weights: { 'python': 0.35, 'js': 0.40 }, expected: 0.15 }, // Learning
    { weights: { 'python': 0.60, 'js': 0.55 }, expected: 0.05 }  // Foundation
  ];
  
  for (const test of testCases) {
    const result = calculateWildcardProbability(test.weights);
    console.assert(result === test.expected, `Expected ${test.expected}, got ${result}`);
  }
}

// Test weight adjustment
function testWeightAdjustment() {
  const testCases = [
    { current: 0.2, rating: 9, expected: 0.5 },   // Very hard
    { current: 0.2, rating: 7, expected: 0.35 },  // Challenging
    { current: 0.2, rating: 5, expected: 0.2 },   // Just right
    { current: 0.2, rating: 3, expected: 0.1 },   // Getting easy
    { current: 0.2, rating: 1, expected: 0.05 }   // Too easy (bounded)
  ];
  
  for (const test of testCases) {
    const result = updateAttentionWeight('test', test.current, test.rating);
    console.assert(Math.abs(result - test.expected) < 0.01, 
      `Expected ${test.expected}, got ${result}`);
  }
}
```

## Mathematical Properties

### Convergence Properties

1. **Weight Convergence**: Attention weights converge to optimal values based on user feedback
2. **Probability Stability**: Wildcard probability stabilizes as mastery level stabilizes
3. **Selection Fairness**: All concepts remain selectable (minimum weight 0.05)

### Invariants

1. **Weight Sum Bounds**: ∑wᵢ has no fixed upper bound (allows flexible focus)
2. **Probability Bounds**: 0.05 ≤ P(wildcard) ≤ 0.40
3. **UUID Uniqueness**: Each UUID is unique within the system
4. **Time Monotonicity**: Spaced repetition multiplier increases with time

This algorithmic foundation ensures the Training Challenge System operates efficiently, fairly, and adaptively to user progress and preferences.