# Victory Tracking System

The victory system fights the "Mimic" (inner critic) through systematic win recognition and pattern analysis.

## `/add-victory` Command
- Quick victory entry with guided prompts
- Categories: technical, personal, discipline, learning, self-awareness
- Anti-Mimic rules: no victory too small, progress over perfection
- Outputs to `victories/victories-YYYY-MM.md`

## `/victory-suggest` Command  
- AI-powered victory detection from journal entries and git commits
- Scans for dismissed accomplishments and hidden wins
- Catches technical breakthroughs, strategic decisions, and discipline victories
- One-click integration with add-victory

## `/victory-review` Command
- Weekly celebration of 3-5 random recent victories
- Pattern recognition and replication strategies
- Mood boosting during low periods
- Updates `victory-patterns.md` with insights

## Integration Points
- **Daily Checkin**: Auto-suggests victories from accomplishments mentioned
- **Weekly Checkin**: Starts with victory review for positive framing
- **Brain Dumps**: Background analysis for victory patterns
- **Git Commits**: Technical victory detection and suggestions

## Victory File Structure
```
victories/
├── victories-YYYY-MM.md     # Monthly victory log
├── victory-patterns.md      # Pattern analysis and Mimic counter-evidence  
└── victory-reviews.md       # Weekly celebration records
```

## Anti-Mimic Features
- Evidence-based counter-narratives to inner criticism
- Pattern recognition of success factors and conditions
- Systematic celebration to build confidence momentum
- Focus on replication strategies rather than perfection