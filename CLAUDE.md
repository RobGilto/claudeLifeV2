# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with files and code in this repository.

## Project Overview

This is Robert's personal AI engineering journey and life transformation repository. It's a productivity and documentation system designed to support his career transition from technical support to AI software engineer by mid-2026, while managing ADD and financial goals.

## Repository Structure and Philosophy

### Core Principles
- **No root-level .md files** except CLAUDE.md
- **Update existing files** rather than creating duplicates
- All automated commands should reference scripts from `/scripts/` folder

### Directory Structure
```
/daily/          # Daily checkins and journals
/weekly/         # Weekly reviews and summaries  
/victories/      # Victory tracking and pattern analysis
/journal/
  /brain/        # Raw brain dumps (text and transcribed)
  /brain/analysis/ # AI-generated brain dump analyses
/research/       # Competitor newsletter research
/scripts/        # Automation and processing scripts
/templates/      # Reusable formats for consistent entries
/archive/        # Older entries (organized by year/quarter)
/logs/           # Script execution logs
/docs/           # Background documentation and guidelines
```

## File Management Standards

### Naming Conventions
- Daily Checkin: `daily-YYYY-MM-DD.md`
- Weekly Review: `weekly-YYYY-WW.md`  
- Victory Log: `victories-YYYY-MM.md`
- Brain Dump: `braindump-YYYY-MM-DD-HHMM-[topic].md`
- Brain Dump Analysis: `analysis-YYYY-MM-DD-HHMM-[topic].md`
- Research: `research-[competitor]-YYYY-MM-DD.md`
- Analysis: `analysis-[type]-YYYY-MM-DD.md`

### Required YAML Frontmatter
All markdown files should include:
```yaml
---
date: YYYY-MM-DD
time: HH:MM                    # Required for brain dumps
type: [daily|weekly|victories|braindump|research|analysis]
source: [text|audio]           # Required for brain dumps
topic: [auto-detected]         # Required for brain dumps
tags: []
status: [raw|draft|review|final|ongoing]
privacy: [public|private|sensitive]
# Brain dump specific fields:
audio_file: filename.wav       # Only if transcribed
duration: 120                  # Seconds, only if transcribed
related: source-file.md        # For analysis files
---
```

### File Management Rules
- Max file size: 500KB (shard larger files in folders)
- Archive files older than 3 months to `/archive/YYYY/Q#/`
- Check for duplicates before creating new files
- Files marked `privacy: sensitive` should use placeholders for actual data

## Development Workflow

### Script Standards
All scripts in `/scripts/` should:
- Include documentation header with purpose, usage, and dependencies
- Be idempotent (safe to run multiple times)
- Log actions to `/logs/scriptname-YYYY-MM-DD.log`
- Handle errors gracefully
- Validate inputs before processing
- Create backups before modifying files

### Commit Message Format
Use conventional commit format:
- `[DAILY] Add checkin for YYYY-MM-DD`
- `[WEEKLY] Update week N review`
- `[RESEARCH] Add competitor analysis for X`
- `[SCRIPT] Add/update script name`
- `[FIX] Correct issue description`
- `[DOCS] Update documentation`

## User Context

### Robert's Background
- 41 years old, aspiring AI engineer with ADD
- Currently in Domo Technical Support (2 years experience)
- Goal: AI software engineer by mid-2026
- Uses RuneQuest TTRPG and Glorantha lore as learning scaffolding
- Financial pressure (no savings, $1M mortgage) as motivation

### ADD-Optimized Workflow
- Time-boxed sessions (4-hour maximum with hard stops)
- "Rabbit hole journal" for capturing tangential thoughts
- Focus on external executive function systems
- Sustainable daily practice over "grinding"

### Key Focus Areas
1. **Coding Fundamentals** - Daily practice reading AI-generated code
2. **Project-Based Learning** - RuneQuest-themed portfolio projects
3. **Financial Automation** - AI-powered personal finance tools
4. **Technical Mastery** - GitHub practices to enterprise architecture

## Privacy and Security

- Never commit files marked `privacy: sensitive` with actual data
- Use placeholders or encryption for sensitive information
- Add `*.private.md` to `.gitignore`
- Sanitize personal information before sharing

## Intelligent Command Systems

### Weekly Check-In Protocol
The `/weekly-checkin` command will:
1. Analyze project context to determine relevant metrics
2. Ask for current values of those specific metrics
3. Compare to previous data and generate visual analysis
4. Save formatted report with insights and recommendations

The system intelligently adapts to track what matters for this specific project.

### Daily Check-In Protocol
The `/daily-checkin` command provides:
- Personal reflection prompts for well-being tracking
- Mood and energy pattern analysis
- Accomplishment tracking and momentum scoring
- Visual trends and insights over time
- Gentle, encouraging feedback for continuous growth

Daily entries are saved in journal/daily/ for long-term pattern recognition.

### Newsletter Research Protocol
The `/newsletter-research` command will:
- Analyze competitor newsletters for trending topics
- Identify content gaps and opportunities
- Generate ready-to-send newsletter drafts
- Match your writing voice based on existing content
- Save research and drafts to organized folders

### Brain Dump Protocol
The `/brain-dump` command provides:
- Streamlined creation of standardized brain dump files
- Automatic topic detection from content
- Consistent formatting for both text and transcribed content
- Files saved to `journal/brain/` with timestamp-based naming
- Automatic analysis generation in `journal/brain/analysis/`

#### Brain Dump Format
```yaml
---
date: YYYY-MM-DD
time: HH:MM
type: braindump
source: text|audio
topic: auto-detected-topic
tags: []
status: raw
privacy: private
audio_file: filename.wav    # Only for transcribed
duration: 120              # Only for transcribed
---

# Brain Dump: Topic Title

[Stream of consciousness content]

---
*Direct text entry - YYYY-MM-DD HH:MM:SS*
```

### Brain Dump Analysis Protocol
The `/brain-dump-analysis` command will:
- Extract insights and patterns from stream-of-consciousness writing
- Show connections between ideas and track thinking evolution
- Generate structured analysis with actionable takeaways
- Save analysis to `journal/brain/analysis/` with matching timestamp
- Link back to original brain dump for reference

### Daily Brief Protocol
The `/daily-brief` command provides:
- Personalized news briefing based on your interests
- Only current news from the last 7 days
- Context about why each story matters to you
- Actionable insights and suggested next steps

### Victory Tracking Protocol
The victory system fights the "Mimic" (inner critic) through systematic win recognition and pattern analysis.

#### `/add-victory` Command
- Quick victory entry with guided prompts
- Categories: technical, personal, discipline, learning, self-awareness
- Anti-Mimic rules: no victory too small, progress over perfection
- Outputs to `victories/victories-YYYY-MM.md`

#### `/victory-suggest` Command  
- AI-powered victory detection from journal entries and git commits
- Scans for dismissed accomplishments and hidden wins
- Catches technical breakthroughs, strategic decisions, and discipline victories
- One-click integration with add-victory

#### `/victory-review` Command
- Weekly celebration of 3-5 random recent victories
- Pattern recognition and replication strategies
- Mood boosting during low periods
- Updates `victory-patterns.md` with insights

#### Integration Points
- **Daily Checkin**: Auto-suggests victories from accomplishments mentioned
- **Weekly Checkin**: Starts with victory review for positive framing
- **Brain Dumps**: Background analysis for victory patterns
- **Git Commits**: Technical victory detection and suggestions

#### Victory File Structure
```
victories/
├── victories-YYYY-MM.md     # Monthly victory log
├── victory-patterns.md      # Pattern analysis and Mimic counter-evidence  
└── victory-reviews.md       # Weekly celebration records
```

#### Anti-Mimic Features
- Evidence-based counter-narratives to inner criticism
- Pattern recognition of success factors and conditions
- Systematic celebration to build confidence momentum
- Focus on replication strategies rather than perfection

## Quality Checks

Before committing, verify:
- [ ] File is in correct directory
- [ ] Naming convention followed
- [ ] Metadata header complete
- [ ] No duplicate files created
- [ ] Sensitive data sanitized
- [ ] Related scripts updated if needed
- daily brief web research should be based in NSW Australia. Salary information should be AUD dollars