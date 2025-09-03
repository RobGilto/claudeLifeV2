# Training Challenge System API Reference

## Command Interface

### Primary Commands

#### `/training-challenge`
**Description**: Generate a challenge based on current attention weights and wildcard probability.

**Usage**:
```bash
/training-challenge
```

**Process**:
1. Calculate wildcard probability based on current mastery
2. Select concept using weighted random or wildcard selection
3. Generate UUID and prompt
4. Display challenge for user to copy to boot.dev

**Output**:
```
🎯 TRAINING CHALLENGE GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Challenge UUID-2025-09-03-001

Practice working with nested dictionaries and list comprehensions in Python. 
Focus on data transformation and filtering operations with error handling for missing keys.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### `/training-challenge feedback <uuid> <rating>`
**Description**: Process user feedback after completing a challenge.

**Parameters**:
- `uuid` (string): Challenge UUID (e.g., `UUID-2025-09-03-001`)
- `rating` (integer): Difficulty rating from 1-10

**Usage**:
```bash
/training-challenge feedback UUID-2025-09-03-001 7
```

**Rating Scale**:
- 1-2: Too easy (decrease attention weight)
- 3-4: Getting easier (small decrease)
- 5-6: Just right (no change)
- 7-8: Challenging (increase weight)
- 9-10: Very hard (significant increase)

**Output**:
```
✅ Feedback recorded for UUID-2025-09-03-001
Difficulty: 7/10

📊 Updated System State:
   Wildcard Chance: 25%
   "python-data-structures" weight: 28%

Generate next challenge with: /training-challenge
```

#### `/training-challenge wildcard`
**Description**: Force generation of an AI engineering wildcard challenge.

**Usage**:
```bash
/training-challenge wildcard
```

**Output**:
```
⚡ WILDCARD AI ENGINEERING CHALLENGE ⚡

Challenge UUID-2025-09-03-W001

Implement cosine similarity calculations efficiently. Handle high-dimensional 
sparse vectors and optimize for performance with large datasets.

🎲 This is a wildcard challenge designed to push your AI engineering skills!
```

#### `/training-challenge status`
**Description**: Display current system state, attention weights, and statistics.

**Usage**:
```bash
/training-challenge status
```

**Output**:
```
📊 TRAINING CHALLENGE STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

System Mode: ⚖️ LEARNING ZONE
Average Attention: 32%
Wildcard Probability: 15%

Top Focus Areas:
• python-oop: 45% (HIGH)
• testing: 38% (HIGH)
• algorithms: 32% (MED)
• python-data-structures: 28% (MED)
• debugging: 22% (MED)

Total Challenges: 23
Wildcard Encounters: 3 (13%)

Generate challenge: /training-challenge
Force wildcard: /training-challenge wildcard
```

#### `/training-challenge config [setting] [value]`
**Description**: View or modify system configuration.

**Usage**:
```bash
# View all configuration
/training-challenge config

# Modify specific setting
/training-challenge config mastery-wildcard 0.35
```

**Available Settings**:
- `mastery-wildcard`: Wildcard probability for mastery zone (default: 0.40)
- `comfort-wildcard`: Wildcard probability for comfort zone (default: 0.25)
- `learning-wildcard`: Wildcard probability for learning zone (default: 0.15)
- `foundation-wildcard`: Wildcard probability for foundation zone (default: 0.05)

## Data Structures

### Challenge Object
```typescript
interface Challenge {
  uuid: string;              // Unique identifier (UUID-YYYY-MM-DD-###)
  type: 'regular' | 'wildcard';
  concept: string;           // Concept category
  prompt: string;            // Challenge prompt text
  isWildcard: boolean;       // Whether this is a wildcard challenge
  generated_at: string;      // ISO timestamp
  attempts: number;          // Number of times attempted
  feedback_history: number[]; // Array of difficulty ratings
  last_practiced?: string;   // Last practice date (YYYY-MM-DD)
}
```

### Attention Weights Object
```typescript
interface AttentionWeights {
  [concept: string]: number; // Weight between 0.0 and 1.0
}

// Example:
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

### Challenge Log Structure
```typescript
interface ChallengeLog {
  metadata: {
    version: string;
    created: string;          // Date created
    total_challenges: number;
    total_wildcards: number;
  };
  challenges: {
    [uuid: string]: Challenge;
  };
}
```

### Wildcard Concepts Structure
```typescript
interface WildcardConcepts {
  [category: string]: string[]; // Array of concept prompts
}

// Example:
{
  "llm-fundamentals": [
    "Implement attention score calculations with softmax normalization",
    "Build positional encoding for sequence data"
  ],
  "rag-implementation": [
    "Create document chunking algorithm with overlap handling",
    "Implement semantic search using vector embeddings"
  ]
}
```

### System Configuration
```typescript
interface SystemConfig {
  wildcard_thresholds: {
    mastery_zone: number;    // Default: 0.10
    comfort_zone: number;    // Default: 0.25
    learning_zone: number;   // Default: 0.50
  };
  wildcard_probabilities: {
    mastery: number;         // Default: 0.40
    comfort: number;         // Default: 0.25
    learning: number;        // Default: 0.15
    foundation: number;      // Default: 0.05
  };
  weight_adjustments: {
    very_hard: number;       // Default: 0.30
    challenging: number;     // Default: 0.15
    just_right: number;      // Default: 0.00
    getting_easy: number;    // Default: -0.10
    too_easy: number;        // Default: -0.25
  };
  uuid_format: string;       // Default: "UUID-YYYY-MM-DD-###"
  wildcard_prefix: string;   // Default: "W"
}
```

## File System API

### Data Files Location
```
planning/training-challenges/
├── challenges-log.json      # Complete challenge history
├── attention-weights.json   # Current concept weights
├── wildcard-concepts.json   # AI engineering concept pool
└── system-config.json      # Configuration parameters
```

### File Permissions
All data files should have:
- Read/write permissions for user
- JSON format with proper validation
- Automatic backup on modification

## Script API

### Core Functions

#### `generateChallenge(forceWildcard = false)`
**Returns**: Challenge object
**Description**: Generate a new challenge based on current weights.

```javascript
const challenge = generateChallenge();
// or
const wildcardChallenge = generateChallenge(true);
```

#### `processFeedback(uuid, rating)`
**Parameters**:
- `uuid` (string): Challenge identifier
- `rating` (number): Difficulty rating 1-10

**Returns**: void
**Description**: Process user feedback and update weights.

```javascript
processFeedback('UUID-2025-09-03-001', 7);
```

#### `calculateWildcardProbability()`
**Returns**: number (0.0 to 1.0)
**Description**: Calculate current wildcard probability based on mastery.

```javascript
const probability = calculateWildcardProbability();
console.log(`Wildcard chance: ${probability * 100}%`);
```

#### `showStatus()`
**Returns**: void
**Description**: Display current system status and statistics.

```javascript
showStatus();
```

### Utility Functions

#### `loadJSON(filepath)`
**Parameters**: `filepath` (string)
**Returns**: Object
**Description**: Safely load and parse JSON file.

#### `saveJSON(filepath, data)`
**Parameters**: 
- `filepath` (string)
- `data` (Object)
**Returns**: void
**Description**: Save object as formatted JSON file.

#### `generateUUID(isWildcard = false)`
**Parameters**: `isWildcard` (boolean)
**Returns**: string
**Description**: Generate unique challenge identifier.

## Integration APIs

### Skill Matrix Integration
```javascript
function updateSkillMatrix(concept, practiceHours = 0.5) {
  // Updates skills/skill-matrix.json with:
  // - Last practiced date
  // - Practice hours
  // - Evidence of training challenge practice
}
```

### Victory System Integration
```javascript
function checkForVictories(challenge, rating) {
  // Detects and logs victory conditions:
  // - First wildcard completion
  // - Concept mastery (hard to easy)
  // - Consistency streaks
}
```

### Boot.dev Profile Integration
```javascript
async function fetchBootdevProfile() {
  // Uses Firecrawl MCP to scrape:
  // - Current level/XP
  // - Course completion status  
  // - Recent activity
}
```

## Error Handling

### Common Error Cases

#### Invalid UUID
```javascript
// Error: Challenge UUID-2025-09-03-999 not found
// Resolution: Verify UUID exists in challenges-log.json
```

#### Invalid Rating
```javascript
// Error: Rating must be between 1 and 10
// Resolution: Provide valid integer rating
```

#### Missing Data Files
```javascript
// Error: No concepts available in attention weights
// Resolution: Initialize attention-weights.json with default values
```

#### File Permission Errors
```javascript
// Error: EACCES permission denied
// Resolution: Check file permissions on planning/training-challenges/
```

### Error Response Format
```javascript
{
  error: true,
  message: "Descriptive error message",
  code: "ERROR_CODE",
  suggestion: "How to resolve this error"
}
```

## Performance Specifications

### Response Times
- Challenge generation: < 100ms
- Feedback processing: < 50ms
- Status display: < 200ms

### File Size Limits
- challenges-log.json: < 5MB (archive after 1000 challenges)
- attention-weights.json: < 1KB
- wildcard-concepts.json: < 50KB

### Memory Usage
- Peak memory usage: < 50MB
- Persistent memory: < 10MB

## Security Considerations

### Input Validation
- UUID format validation: `UUID-YYYY-MM-DD-[W]###`
- Rating range validation: 1 ≤ rating ≤ 10
- Concept name sanitization

### File System Security
- No directory traversal in file paths
- JSON validation before parsing
- Safe file writing with atomic operations

### Data Privacy
- No external API calls except boot.dev profile scraping
- Local data storage only
- No sensitive information in challenge prompts

This API reference provides complete documentation for developers implementing or extending the Training Challenge System.