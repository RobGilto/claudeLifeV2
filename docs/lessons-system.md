# Lessons Learned System

The lessons learned system complements victory tracking by extracting wisdom from mistakes and challenges, creating a complete feedback loop for continuous improvement.

## `/lessons-detect` Command
- Automatically scans recent entries for mistake patterns and learning opportunities
- Categorizes findings: technical, process, personal, strategic
- Identifies patterns from daily checkins, brain dumps, and weekly reviews
- Non-judgmental focus on system improvements over personal blame

## `/lessons-add` Command
- Interactive lesson entry with guided reflection prompts
- Captures situation context, key learning, and prevention strategies
- Anti-Mimic approach: learning-focused rather than shame-based
- Outputs to `lessons/lessons-YYYY-MM.md`

## `/lessons-review` Command
- Weekly compilation of detected learning opportunities
- Groups lessons by category with reflection questions
- Generates actionable insights for process improvements
- Integrates with weekly check-in for comprehensive reflection

## `/lessons-patterns` Command
- Analyzes patterns across all lesson entries
- Identifies recurring themes and system gaps
- Tracks improvement trends over time
- Updates prevention strategies based on accumulated wisdom

## Lessons File Structure
```
lessons/
├── lessons-YYYY-MM.md        # Monthly lesson log
├── lesson-patterns.md        # Pattern analysis and prevention strategies
├── lesson-reviews.md         # Weekly reflection records
└── lesson-review-YYYY-MM-DD.md # Individual weekly reviews
```

## Integration Points
- **Daily Checkin**: Challenge identification feeds into lesson detection
- **Brain Dumps**: Raw mistake reflection becomes structured learning
- **Weekly Review**: Lessons learned section with pattern recognition
- **Victory System**: Balanced approach celebrating wins AND extracting wisdom

## Learning-Focused Features
- **Systems thinking**: Focus on process improvements, not personal failings
- **Forward momentum**: Each lesson becomes a skill/system upgrade
- **Pattern recognition**: Connect individual mistakes to larger improvement opportunities
- **Prevention strategies**: Actionable steps to avoid similar issues
- **ADD-optimized**: Non-overwhelming weekly reviews with clear action items