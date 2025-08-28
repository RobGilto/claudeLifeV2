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

### Daily Check-In Protocols (Split Sessions)
The daily check-in system splits into two focused sessions for better ADD-friendly workflow:

#### `/noon-checkin` Command
Mid-day energy and planning checkpoint:
- Morning energy assessment and sleep quality check
- Afternoon priority setting (top 3 focus areas)
- Early wins celebration and momentum tracking
- Focus/energy challenge identification
- Quick encouragement without full analysis

#### `/evening-checkin` Command  
End-of-day reflection and tomorrow planning:
- Overall day feeling and accomplishment review
- Challenge and blocker identification
- Gratitude and reflection prompts
- Tomorrow's priority setting
- Combined analysis of both sessions (if noon data exists)

#### File Management
- Both commands append to same `daily-YYYY-MM-DD.md` file
- Metadata tracks which sessions completed: `sessions: [noon, evening]`
- Analysis only runs after evening checkin with combined data
- Victory detection runs after both sessions for comprehensive tracking

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
- Personalized news briefing based on your interests (NSW Australia focus)
- Job market insights integrated from recent analysis
- Skills development recommendations based on market demand
- Progress tracking toward 2026 AI engineering goals
- Actionable next steps prioritized by impact
- Integration with skill matrix and gap analysis data

### Job Market Analysis Protocol
The job market analysis system provides data-driven career insights for the AI engineering transition.

#### `/job-analysis` Command
- Comprehensive job market analysis using Firecrawl integration
- Searches major Australian job boards (Seek, Indeed, LinkedIn) for AI/Software Engineer roles
- Extracts and categorizes skill requirements from job descriptions
- Analyzes salary trends by experience level in AUD
- Generates skills gap analysis against current skill matrix
- Creates market trend data for long-term tracking
- Outputs detailed analysis files to `research/job-market/`

#### `/skills-gap` Command
- Quick skills gap analysis against current job market data
- Visual progress bars showing skill levels vs market targets
- Identifies high-priority skills to develop based on demand frequency
- Highlights current strengths and emerging opportunities
- Shows quick wins available (skills close to targets)
- Provides weekly focus recommendations
- Tracks progress toward 2026 career goals

#### Job Market Data Structure
```
research/job-market/
├── job-listings-YYYY-MM.json        # Raw job postings data
├── skills-analysis-YYYY-MM.json     # Processed skill requirements
├── gap-analysis-YYYY-MM-DD.json     # Skills gap vs your matrix
└── market-trends.json               # 3-month trend tracking
```

#### Integration Features
- **Daily Brief**: Auto-includes market insights when data is available
- **Skills Matrix**: Gap analysis compares against your current skill levels
- **Weekly Updates**: Data refreshes automatically when over 1 week old
- **Australian Focus**: NSW/Sydney job market with AUD salary data
- **ADD-Optimized**: Visual progress indicators and prioritized recommendations

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

### Lessons Learned Protocol
The lessons learned system complements victory tracking by extracting wisdom from mistakes and challenges, creating a complete feedback loop for continuous improvement.

#### `/lessons-detect` Command
- Automatically scans recent entries for mistake patterns and learning opportunities
- Categorizes findings: technical, process, personal, strategic
- Identifies patterns from daily checkins, brain dumps, and weekly reviews
- Non-judgmental focus on system improvements over personal blame

#### `/lessons-add` Command
- Interactive lesson entry with guided reflection prompts
- Captures situation context, key learning, and prevention strategies
- Anti-Mimic approach: learning-focused rather than shame-based
- Outputs to `lessons/lessons-YYYY-MM.md`

#### `/lessons-review` Command
- Weekly compilation of detected learning opportunities
- Groups lessons by category with reflection questions
- Generates actionable insights for process improvements
- Integrates with weekly check-in for comprehensive reflection

#### `/lessons-patterns` Command
- Analyzes patterns across all lesson entries
- Identifies recurring themes and system gaps
- Tracks improvement trends over time
- Updates prevention strategies based on accumulated wisdom

#### Lessons File Structure
```
lessons/
├── lessons-YYYY-MM.md        # Monthly lesson log
├── lesson-patterns.md        # Pattern analysis and prevention strategies
├── lesson-reviews.md         # Weekly reflection records
└── lesson-review-YYYY-MM-DD.md # Individual weekly reviews
```

#### Integration Points
- **Daily Checkin**: Challenge identification feeds into lesson detection
- **Brain Dumps**: Raw mistake reflection becomes structured learning
- **Weekly Review**: Lessons learned section with pattern recognition
- **Victory System**: Balanced approach celebrating wins AND extracting wisdom

#### Learning-Focused Features
- **Systems thinking**: Focus on process improvements, not personal failings
- **Forward momentum**: Each lesson becomes a skill/system upgrade
- **Pattern recognition**: Connect individual mistakes to larger improvement opportunities
- **Prevention strategies**: Actionable steps to avoid similar issues
- **ADD-optimized**: Non-overwhelming weekly reviews with clear action items

### Fractal Planning Protocol
A comprehensive multi-scale planning system that creates aligned plans from daily time blocks to yearly vision, with integrated performance tracking and continuous improvement.

#### Core Concepts
- **Multi-Indexing**: Every date is simultaneously indexed as day/week/month/quarter/year
- **Fractal Alignment**: Plans cascade from year → quarter → month → week → day
- **Performance Tracking**: Each period has completion rates, wellbeing metrics, and insights
- **Continuous Adjustment**: Reviews feed back into planning for iterative improvement

#### Planning Commands

##### `/plan-year` Command
- Strategic yearly vision and transformation goals
- 3-4 major strategic priorities
- 8-12 yearly objectives and milestones  
- Success metrics definition
- Creates foundation for all lower-level plans

##### `/plan-quarter` Command
- 3-5 strategic priorities aligned with yearly vision
- 6-10 quarterly objectives and major milestones
- Quarterly theme/focus area
- Inherits alignment from yearly plan

##### `/plan-month` Command  
- 5-8 monthly objectives and 4 milestones
- Monthly theme connected to quarterly priorities
- Tactical execution of strategic initiatives
- Bridge between strategic quarters and tactical weeks

##### `/plan-week` Command
- 3-5 weekly priorities and 8 weekly objectives
- Weekly context/theme
- Operational planning aligned with monthly goals
- Sets up daily time block allocation

##### `/plan-day` Command
- 4-5 time blocks optimized for ADD workflow
- Each block aligned with higher-level objectives
- Daily objectives (max 3 for focus)
- Automatic integration with Taskmaster execution

#### Review Commands

##### `/review-week` Command
- Objective completion assessment
- Energy, focus, and satisfaction metrics (1-10)
- Weekly insights and adjustment identification
- Performance comparison with previous weeks

##### `/review-month` Command
- Objective and milestone completion review
- Monthly satisfaction assessment  
- Weekly performance aggregation and analysis
- Strategic insights for next month planning

##### `/review-quarter` and `/review-year` Commands
- Major milestone and objective assessment
- Strategic performance analysis
- Long-term trend identification  
- Vision alignment evaluation

#### Taskmaster Integration

##### `/taskmaster-start` Command
- Loads daily plan and initializes execution session
- Shows alignment context from higher-level plans
- Provides time block overview with completion tracking
- Integrates with fractal planning hierarchy

##### `/taskmaster-block` Command
- Executes specific time blocks with focus tracking
- Records energy and focus metrics before/during/after
- Tracks interruptions and challenges
- Maintains alignment with strategic objectives

##### `/taskmaster-complete` Command
- Records outcomes and completion metrics
- Updates original plan completion status
- Suggests next time block for seamless flow
- Feeds data into performance tracking system

#### Performance Analytics

##### `/performance-dashboard` Command
- Current period status across all planning levels
- Recent performance trends and highlights
- Wellbeing metric tracking over time
- Recommended next actions based on gaps

##### `/performance-compare` Command
- Side-by-side comparison of any two periods
- Completion rate, wellbeing, and productivity analysis
- Improvement/decline identification with insights
- Actionable recommendations for optimization

##### `/performance-trend` Command
- Multi-period trend analysis (weeks, months, quarters)
- Pattern detection (cyclical, consistent trends)
- Moving averages and direction analysis
- Trend-based improvement recommendations

#### Data Structure and Storage
```
planning/
├── data/                     # Plan and performance JSON files
│   ├── day-YYYY-MM-DD.json
│   ├── week-YYYY-Www.json
│   ├── month-YYYY-MM.json
│   ├── quarter-YYYY-Qq.json
│   ├── year-YYYY.json
│   └── performance-[period]-[id].json
├── execution/                # Daily execution tracking
│   └── execution-YYYY-MM-DD.json
└── analytics/               # Exported analysis data
    └── performance-export-YYYY-MM-DD.json
```

#### Integration Features
- **Seamless Hierarchy**: Plans automatically inherit from parent levels
- **Real-time Alignment**: Daily execution shows weekly/monthly/quarterly context
- **Performance Feedback**: Reviews inform future planning iterations
- **ADD Optimization**: 4-5 daily blocks, visual progress, clear next actions
- **Data Export**: JSON/CSV export for external analysis tools

#### Key Benefits
- **Reduces Planning Overhead**: Hierarchy eliminates redundant planning
- **Maintains Strategic Focus**: Daily actions stay aligned with yearly vision
- **Tracks What Matters**: Completion rates + wellbeing for holistic success
- **Enables Continuous Improvement**: Performance data drives better planning
- **ADD-Friendly**: Time-boxed, visual, with clear structures and next actions

## MCP Integration and Setup

### Google Calendar MCP Integration
This repository integrates with Google Calendar through the MCP (Model Context Protocol) server for seamless calendar management and event creation.

#### Initial Setup Process
1. **Install Google Calendar MCP Server**
   ```bash
   npx @cocal/google-calendar-mcp --help  # Verify installation
   ```

2. **Configure OAuth Credentials**
   - Obtain Google Calendar API credentials (`client_secret_google_calendar.json`)
   - Place credentials file in repository root
   - Add to `.gitignore` to prevent accidental commits:
     ```gitignore
     # Google API credentials
     client_secret_google_calendar.json
     ```

3. **Authenticate with Google Calendar**
   ```bash
   GOOGLE_OAUTH_CREDENTIALS=./client_secret_google_calendar.json npx @cocal/google-calendar-mcp auth
   ```
   - Follow browser authentication flow
   - Tokens saved to `~/.config/google-calendar-mcp/tokens.json`

4. **Configure Claude Code MCP Integration**
   - Add to `~/.config/claude/claude_desktop_config.json` (or project-specific config):
   ```json
   {
     "mcpServers": {
       "google-calendar": {
         "command": "npx",
         "args": ["@cocal/google-calendar-mcp"],
         "env": {
           "GOOGLE_OAUTH_CREDENTIALS": "/absolute/path/to/client_secret_google_calendar.json"
         }
       }
     }
   }
   ```

5. **Verify Integration**
   - Restart Claude Code
   - Run `/mcp` to confirm `google-calendar` server is loaded
   - Test event creation to verify functionality

#### Available Calendar Functions
- **Event Management**: Create, update, delete calendar events
- **Calendar Operations**: List calendars, search events, check free/busy status
- **Time Zone Support**: Full Australia/Sydney timezone handling
- **Reminder Configuration**: Email and popup reminders
- **Recurring Events**: Support for recurring event patterns

#### Integration with Planning Workflows
- **Fractal Planning**: Automatically schedule time blocks from daily plans
- **Task Management**: Convert planning sessions to calendar events
- **Time Tracking**: Create events for focused work sessions
- **Review Scheduling**: Automatically schedule weekly/monthly reviews

#### Timezone Configuration
All calendar operations use Australia/Sydney timezone by default to match user location (NSW, Australia).

#### Common Usage Patterns
```javascript
// Create planning session event
{
  "calendarId": "primary",
  "summary": "Deep Work - AI Learning",
  "start": "2025-08-28T09:00:00",
  "end": "2025-08-28T10:30:00", 
  "timeZone": "Australia/Sydney",
  "reminders": {"useDefault": false, "overrides": [{"method": "popup", "minutes": 10}]}
}
```

#### Troubleshooting
- **Authentication Issues**: Re-run auth flow if tokens expire
- **MCP Not Loading**: Verify absolute paths in configuration
- **Timezone Problems**: Ensure Australia/Sydney timezone is specified
- **Permission Errors**: Check Google Calendar API scope permissions

## Quality Checks

Before committing, verify:
- [ ] File is in correct directory
- [ ] Naming convention followed
- [ ] Metadata header complete
- [ ] No duplicate files created
- [ ] Sensitive data sanitized
- [ ] Related scripts updated if needed
- daily brief web research should be based in NSW Australia. Salary information should be AUD dollars

## Financial Planning Memories

### Financial Refinancing and Loan Restructuring
- Comprehensive financial review conducted in October 2023
- Primary focus: Refinancing ANZ loans before interest-only period ends on 6 October
- Current home valuation estimated at $2-2.1 million with 80% LVR
- Total current loan balance: $1,092,235.71
- Exploring options to optimize loan structure and prepare for future investment purchase
- when creating script i prefer it in .js
- I have joing boot.dev for a year now
- I will always favour AI Implementation & Integration: High-demand roles requiring practical skills in implementing existing AI technologies to solve business problems over AI research
- Many organizations will waive degree requirements for candidates with proven implementation skills
- Portfolio projects demonstrating real-world implementation often outweigh academic credentials
- Strategic certifications can help you bypass degree requirements, especially for implementation roles
- Microsoft Certified: Azure AI Engineer Associate will cost $ 165 USD but worth it for recognition in the market
- Microsoft Azure Data Scientist Associate another important certification to aquire $165 USD
- AI Data Processing path to consider for certification: "Microsoft Azure Data Engineer Associate" and "Databricks Generative AI Engineer"
- Strategic Certification Combinations

Full-Stack AI Engineer

Combines: Path 1 (Integration) + Path 3 (Deployment) 

Certifications:
Azure AI Engineer Associate
Certified Kubernetes Application Developer (CKAD)

Value proposition: This combination validates your ability to both integrate AI services and deploy them on scalable infrastructure, positioning you as a full-stack AI implementation specialist.

Target roles:
AI Application Engineer
Full-Stack AI Developer
AI Solutions Engineer