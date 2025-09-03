# Training Challenge Command

Adaptive spaced repetition system for boot.dev Training Grounds with intelligent feedback loops and dynamic wildcard challenges for AI engineering preparation.

## Usage
```bash
/training-challenge [command] [options]
```

## Commands

### Generate Challenge (Default)
```bash
/training-challenge
```
Generates a challenge based on current attention weights and dynamic wildcard probability.

**Process:**
1. Calculate wildcard probability based on average attention weights
2. Select concept using weighted random or wildcard selection  
3. Generate UUID and concept prompt
4. Display challenge for user to copy to boot.dev
5. Log challenge with metadata for feedback tracking

**Dynamic Wildcard Probability:**
- **Mastery Zone** (avg weight <10%): 40% wildcards for elite preparation
- **Comfort Zone** (avg weight 10-25%): 25% wildcards for growth
- **Learning Zone** (avg weight 25-50%): 15% wildcards for balance
- **Foundation Zone** (avg weight ≥50%): 5% wildcards to focus on basics

**Example Output:**
```
🎯 TRAINING CHALLENGE GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Challenge UUID-2025-09-03-001

Practice working with nested dictionaries and list comprehensions in Python. 
Focus on data transformation and filtering operations with error handling for missing keys.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Copy this challenge to boot.dev Training Grounds
Provide feedback when complete: /training-challenge feedback UUID-2025-09-03-001 [1-10]
```

### Force Wildcard Challenge
```bash
/training-challenge wildcard
```
Forces generation of an AI engineering wildcard challenge regardless of probability.

**Example Output:**
```
⚡ WILDCARD AI ENGINEERING CHALLENGE ⚡

Challenge UUID-2025-09-03-W001

Implement cosine similarity calculations efficiently for high-dimensional data.
Handle sparse vectors and optimize for performance with large datasets.

🎲 This is a wildcard challenge designed to push your AI engineering skills!
```

### Process Feedback
```bash
/training-challenge feedback <uuid> <rating>
```
Process user feedback after completing a challenge on boot.dev.

**Parameters:**
- `uuid`: Challenge UUID (e.g., `UUID-2025-09-03-001`)
- `rating`: Difficulty rating from 1-10

**Rating Scale:**
- **1-2**: Too easy (decrease attention weight by 25%)
- **3-4**: Getting easier (decrease weight by 10%)
- **5-6**: Just right (no change)
- **7-8**: Challenging (increase weight by 15%)
- **9-10**: Very hard (increase weight by 30%)

**Wildcard Integration Logic:**
- **Easy mastery**: Average rating ≤3.0 after 2+ attempts → Add to regular rotation with 15% weight
- **Challenging value**: Average rating ≥7.0 after 1+ attempt → Add with 35% weight for focused practice

**Example Output:**
```
📝 PROCESSING FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━
✅ Feedback recorded for UUID-2025-09-03-001
Difficulty: 7/10

📊 Updated System State:
   Wildcard Chance: 25%
   "python-data-structures" weight: 28%

Generate next challenge with: /training-challenge
```

### System Status
```bash
/training-challenge status
```
Display comprehensive system state, attention weights, and statistics.

**Example Output:**
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

### Configuration Management
```bash
/training-challenge config [setting] [value]
```
View or modify system configuration parameters.

**Available Settings:**
- `mastery-wildcard`: Wildcard probability for mastery zone (default: 0.40)
- `comfort-wildcard`: Wildcard probability for comfort zone (default: 0.25)  
- `learning-wildcard`: Wildcard probability for learning zone (default: 0.15)
- `foundation-wildcard`: Wildcard probability for foundation zone (default: 0.05)

**Examples:**
```bash
# View all configuration
/training-challenge config

# Adjust mastery zone wildcard probability
/training-challenge config mastery-wildcard 0.35
```

## System Architecture

### Data Persistence
All data stored in `planning/training-challenges/`:
- `attention-weights.json` - Current concept weights (0.05-1.0 range)
- `wildcard-concepts.json` - AI engineering concept pool
- `challenges-log.json` - Complete challenge history with feedback
- `system-config.json` - Configuration parameters

### Core Algorithms

#### Weighted Random Selection
Concepts selected based on attention weights multiplied by spaced repetition factors:
- Day 0 (today): 1.0x multiplier
- Day 1: 1.2x multiplier  
- Day 2: 1.5x multiplier
- Day 3: 1.8x multiplier
- Day 4+: 2.0x multiplier (caps)

#### Attention Weight Adjustment
```javascript
// Weight bounds: [0.05, 1.0]
const adjustment = {
  'very_hard': +0.30,     // Ratings 9-10
  'challenging': +0.15,   // Ratings 7-8  
  'just_right': 0.00,     // Ratings 5-6
  'getting_easy': -0.10,  // Ratings 3-4
  'too_easy': -0.25       // Ratings 1-2
};
```

#### Dynamic Wildcard Probability
```javascript
function calculateWildcardProbability(avgWeight) {
  if (avgWeight < 0.10) return 0.40;  // Mastery Zone
  if (avgWeight < 0.25) return 0.25;  // Comfort Zone  
  if (avgWeight < 0.50) return 0.15;  // Learning Zone
  return 0.05;                        // Foundation Zone
}
```

### Concept Pools

#### Regular Concepts (14 categories)
Based on current skill matrix and learning focus:
- Python fundamentals (basics, functions, data structures, OOP)
- Computer science (algorithms, debugging, testing, system design)
- Web development (JavaScript, web dev, databases, APIs)
- Engineering practices (version control, problem solving)

#### Wildcard Concepts (8 categories, 40+ prompts)
AI engineering preparation for elite-level skills:
- **LLM Fundamentals**: Attention mechanisms, transformers, embeddings
- **Prompt Engineering**: Validation, optimization, injection detection
- **RAG Implementation**: Chunking, vector search, reranking
- **Neural Networks**: Backpropagation, activation functions, regularization
- **Vector Operations**: Similarity, dimensionality reduction, search
- **ML Pipelines**: Preprocessing, evaluation, deployment
- **AI Deployment**: Scaling, monitoring, containerization
- **Data Engineering**: Streaming, ETL, real-time processing

## Integration Features

### Spaced Repetition Enhancement
- **Time-based multipliers**: Increase selection probability for unused concepts
- **Success decay**: Lower weights for mastered concepts
- **Challenge rotation**: Prevents stagnation through varied difficulty

### ADD-Optimized Workflow
- **User-driven feedback**: No calendar pressure or scheduling anxiety  
- **Clear boundaries**: Definitive challenge completion with feedback
- **Motivation preservation**: Wildcard "new blood" prevents plateau
- **External structure**: UUID tracking provides clear progress markers

### Boot.dev Integration
- **Concept prompts**: General prompts that boot.dev expands into detailed challenges
- **Training Grounds compatibility**: Designed for copy-paste workflow
- **Progress tracking**: UUID system enables cross-platform feedback loops
- **Skill alignment**: Regular concepts match current learning path

### System Integration Points
- **Skill Matrix**: Challenge completion updates skill evidence and practice time
- **Victory System**: Detects mastery achievements and consistency streaks  
- **Daily Checkins**: Includes challenge activity in day reflection
- **Profile Scraping**: Uses Firecrawl MCP to track boot.dev progress

## Advanced Features

### Wildcard Integration Logic
When wildcard challenges prove valuable, they automatically join regular rotation:
- **Easy mastery** (avg ≤3.0, 2+ attempts): Added with 15% weight
- **Challenging but valuable** (avg ≥7.0, 1+ attempt): Added with 35% weight

### UUID System
Format: `UUID-YYYY-MM-DD-[W]###`
- Embeds generation date for chronological tracking
- `W` prefix identifies wildcard challenges
- Sequential numbering prevents duplicates
- Enables precise feedback correlation

### Performance Optimization
- **Cached calculations**: Wildcard probability cached for efficiency
- **Batched updates**: Multiple feedback items processed together  
- **Circular buffer**: Challenge log pruned to maintain performance
- **Memory efficient**: JSON files kept under reasonable size limits

## Command Implementation

### Script Execution
```bash
# Direct script execution
node scripts/training-challenge.js                    # Generate challenge
node scripts/training-challenge.js wildcard          # Force wildcard  
node scripts/training-challenge.js feedback UUID 7   # Process feedback
node scripts/training-challenge.js status            # Show status
node scripts/training-challenge.js config            # View configuration
```

### Slash Command Integration
The `/training-challenge` command provides a clean interface that:
1. Validates inputs and provides helpful error messages
2. Formats output for optimal CLI display
3. Integrates with existing claudeLifeV2 systems
4. Maintains consistent user experience
5. Supports all core functionality through simple parameters

### Error Handling
- **UUID validation**: Ensures proper format and existence
- **Rating bounds**: Enforces 1-10 scale with clear feedback
- **File integrity**: Graceful handling of corrupted or missing data
- **Configuration validation**: Prevents invalid system parameters

This system transforms boot.dev practice into an adaptive, engaging experience that scales from foundation building to elite AI engineer preparation while maintaining ADD-friendly, user-driven feedback loops.