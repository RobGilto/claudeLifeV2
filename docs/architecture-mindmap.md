# Claude Life V2 - Architectural Mindmap

## 🏗️ System Overview
**Purpose**: AI-powered life transformation and productivity system for Robert's career transition from technical support to AI software engineer by mid-2026.

**Core Philosophy**: ADD-optimized, external executive function, fractal planning with victory tracking to combat the "Mimic" (inner critic).

---

## 📁 Repository Architecture

### Core Directory Structure
```
claudeLifeV2/
├── daily-briefs/          # AI-generated daily briefings (NSW Australia focused)
├── docs/                  # Documentation and templates
├── journal/               # All reflection and tracking content
│   ├── brain/            # Brain dumps + AI analysis
│   ├── daily/            # Daily check-ins (morning/noon/evening)
│   └── planning/         # Fractal planning reviews
├── logs/                  # Script execution logs and test results
├── metrics/              # Historical metrics tracking
├── planning/             # Live planning data and execution
│   ├── data/            # JSON planning files (day/week/month/quarter/year)
│   ├── execution/       # Task execution tracking
│   └── analytics/       # Calendar sync and performance data
├── research/             # Job market analysis and insights
├── scripts/              # 40+ automation scripts (main system engine)
├── skills/               # Skill matrix and development tracking
├── victories/            # Victory logging and pattern analysis
└── worktrees/            # Git worktree management
```

### Data Flow Architecture
```
Input (Human/Calendar/TaskWarrior) 
    ↓
Context Gathering (Scripts) 
    ↓
AI Processing (Claude + MCP) 
    ↓
Plan Generation/Execution 
    ↓
Performance Tracking 
    ↓
Review & Insights 
    ↓
Next Cycle Planning
```

---

## 🔧 Slash Commands & Script Mapping

### 📅 Planning & Time Management

#### `/plan-*` Commands - **Fractal Planning System**
- **`/plan-year`** → `scripts/fractal-planner.cjs`
  - Strategic yearly vision, 3-4 priorities, 8-12 objectives
- **`/plan-quarter`** → `scripts/fractal-planner.cjs`
  - 3-5 strategic priorities, 6-10 objectives, quarterly themes
- **`/plan-month`** → `scripts/fractal-planner.cjs`
  - 5-8 objectives, 4 milestones, tactical execution bridge
- **`/plan-week`** → `scripts/fractal-planner.cjs`
  - 3-5 priorities, 8 objectives, operational planning
- **`/plan-day`** → `scripts/fractal-planner.cjs`
  - 4-5 time blocks, 3 max objectives, ADD-optimized

#### `/review-*` Commands - **Performance Analysis**
- **`/review-day`** → `scripts/fractal-planner.cjs`
  - Victory detection, energy tracking, multi-index positioning
- **`/review-week`** → `scripts/fractal-planner.cjs`
  - Objective completion, satisfaction metrics, strategic alignment
- **`/review-month`** → `scripts/fractal-planner.cjs`
  - Milestone assessment, victory patterns, git analysis
- **`/review-quarter`** & **`/review-year`** → `scripts/fractal-planner.cjs`
  - Strategic assessment, long-term trends, pivot recommendations

#### `/taskmaster-*` Commands - **Execution Engine**
- **`/taskmaster-start`** → `scripts/taskmaster.cjs`
  - Load daily plan, show alignment context
- **`/taskmaster-block`** → `scripts/taskmaster.cjs`
  - Execute time blocks, track focus/energy
- **`/taskmaster-complete`** → `scripts/taskmaster.cjs`
  - Record outcomes, update completion status

### 📊 Performance & Analytics

#### `/performance-*` Commands - **Analytics Dashboard**
- **`/performance-dashboard`** → `scripts/performance-analyzer.cjs`
  - Multi-level status, trends, wellbeing metrics
- **`/performance-compare`** → `scripts/performance-analyzer.cjs`
  - Period comparisons, improvement analysis
- **`/performance-trend`** → `scripts/performance-analyzer.cjs`
  - Multi-period trends, pattern detection

### 📋 Daily Workflows

#### Daily Check-in System - **Multi-Session Support**
- **`/morning-checkin`** → `scripts/morning-checkin.js`
  - Energy assessment, intentions, top 3 priorities
- **`/daily-checkin`** → `scripts/morning-checkin.js`
  - Same as morning-checkin
- **`/noon-checkin`** → `scripts/morning-checkin.js`
  - Mid-day checkpoint, afternoon priorities
- **`/evening-checkin`** → `scripts/morning-checkin.js`
  - Reflection, gratitude, tomorrow planning

#### `/weekly-checkin` → `scripts/automated-weekly-review.cjs`
- **Purpose**: Intelligent metric analysis, visual reports, insights

#### `/daily-brief` → `scripts/daily-brief.js`
- **Purpose**: Personalized NSW Australia news, job market insights, skill recommendations

### 🧠 Brain Management

#### `/brain-dump` → `scripts/brain-dump.sh`
- **Purpose**: Stream-of-consciousness capture, topic detection

#### `/brain-dump-analysis` → `scripts/brain-dump-analysis.sh`
- **Purpose**: Extract insights, connections, actionable takeaways

#### `/transcribe-brain-dump` → `scripts/transcribe_brain_dump.py`
- **Purpose**: Audio-to-text brain dump conversion

### 🏆 Victory & Learning Systems

#### Victory Tracking - **Anti-Mimic System**
- **`/add-victory`** → `scripts/lessons-learned.js` (victory functions)
  - Quick victory entry, categorization, anti-Mimic rules
- **`/victory-suggest`** → AI analysis of journals/commits
  - Detect dismissed accomplishments, hidden wins
- **`/victory-review`** → `scripts/lessons-learned.js`
  - Weekly celebration, pattern recognition

#### Lessons Learned - **Wisdom Extraction**
- **`/lessons-detect`** → `scripts/lessons-learned.js`
  - Scan for mistake patterns, learning opportunities
- **`/lessons-add`** → `scripts/lessons-learned.js`
  - Interactive lesson entry, prevention strategies
- **`/lessons-review`** → `scripts/lessons-learned.js`
  - Weekly compilation, actionable insights

### 💼 Career Development

#### Job Market Analysis
- **`/job-analysis`** → `scripts/job-analysis.sh`
  - Comprehensive market analysis using Firecrawl
- **`/skills-gap`** → `scripts/skills-gap.sh`
  - Visual progress bars, priority identification

#### Skill Management
- **`/skill-status`** → `scripts/update-skills.js`
  - Priority matrix, GitHub analysis, streak tracking
- **`/skill-update`** → `scripts/update-skills.js`
  - Interactive updates, evidence tracking
- **`/skill-review`** → `scripts/update-skills.js`
  - Weekly progress, gap analysis, focus recommendations
- **`/github-skill-scan`** → `scripts/github-mcp-skill-analyzer.js`
  - Automatic skill detection from commits

### 📅 Calendar Integration

#### Calendar Management
- **`/calendar-sync`** → `scripts/calendar-sync.cjs`
  - Convert time blocks to Google Calendar events
- **`/calendar-block`** → `scripts/calendar-block.js`
  - Create focused work blocks

### 🔄 Boot.dev Integration

#### Learning Progress
- **`/boot-dev-complete`** → `scripts/boot-dev-tracker.cjs`
  - Mark completion, maintain streaks
- **`/boot-dev-status`** → `scripts/boot-dev-tracker.cjs`
  - Show streaks and progress

### 📰 Content Creation

#### Newsletter System
- **`/newsletter-research`** → Enhanced web search + analysis
  - Competitor analysis, content gap identification
- **`/add-newsletter`** → `scripts/add-newsletter.js`
  - Interactive creation, template selection

### 🔧 System Utilities

#### Ritual Management
- **`/ritual`** → `scripts/ritual` wrapper → `scripts/ritual-manager.js`
  - Recurring commitment management
- **`/tw-ritual`** → `scripts/tw-ritual` → `scripts/taskwarrior-ritual-sync.js`
  - TaskWarrior ritual synchronization

#### Data Management
- **Various clear commands** → `scripts/*-clear.js`
  - `day-clear.js`, `week-clear.js`, `month-clear.js`, `quarter-clear.js`

---

## 🏛️ System Architecture Layers

### Layer 1: Data Foundation
- **Planning Data**: JSON files in `planning/data/`
- **Journal Entries**: Markdown in `journal/`
- **Skill Matrix**: JSON tracking in `skills/`
- **Victory Log**: Monthly markdown in `victories/`

### Layer 2: Processing Engine
- **Core Scripts**: 40+ JavaScript/Shell/Python scripts
- **Fractal Planner**: Central planning orchestrator
- **Performance Analyzer**: Metrics and trend analysis
- **TaskWarrior Integration**: External task management sync

### Layer 3: AI Interface
- **Claude Code**: Primary AI interaction layer
- **MCP Integration**: Google Calendar, TaskWarrior, Time services
- **Context Gathering**: Automated data collection for AI processing

### Layer 4: External Integration
- **Google Calendar**: Time block scheduling
- **TaskWarrior**: Task management system
- **GitHub**: Skill evidence detection
- **Boot.dev**: Learning progress tracking

---

## 🔄 Integration Patterns

### Human-in-the-Loop Planning
1. **Context Gathering**: Scripts collect previous reviews, calendar, tasks
2. **AI Analysis**: Claude processes context and identifies patterns
3. **Human Input**: Targeted questions gather user priorities/constraints
4. **Plan Generation**: AI synthesizes all inputs into optimized plan
5. **Execution**: Taskmaster system guides implementation

### Fractal Alignment
- **Yearly** → **Quarterly** → **Monthly** → **Weekly** → **Daily**
- Each level inherits from parent level
- Reviews feed back up the hierarchy
- Performance data cascades across all levels

### Victory-Learning Loop
- **Victory Detection** → **Pattern Analysis** → **Replication Strategies**
- **Mistake Identification** → **Lesson Extraction** → **Prevention Systems**
- Anti-Mimic evidence building through systematic win tracking

---

## 🎯 Optimization Targets

### Redundancy Elimination
- Multiple calendar sync scripts need consolidation
- Duplicate planning functionality across scripts
- Backup files (.backup) need cleanup

### Script Consolidation
- Similar functionality scattered across multiple files
- Complex command mappings need simplification
- Some scripts may be obsolete or unused

### Performance Optimization
- Heavy JSON processing in planning system
- Multiple file reads for context gathering
- Log file accumulation without cleanup

### User Experience
- Too many similar commands (cognitive overhead)
- Complex file structure for simple operations
- Unclear command-to-script relationships

---

## 📋 Refactoring Recommendations

### High Priority
1. **Consolidate Calendar Scripts**: Merge 6+ calendar scripts into unified system
2. **Simplify Planning Commands**: Reduce fractal-planner complexity
3. **Script Cleanup**: Remove backup files and unused scripts
4. **Command Mapping**: Create clear 1:1 command-to-script relationships

### Medium Priority
5. **Data Structure Optimization**: Reduce JSON complexity in planning system
6. **Log Management**: Implement automatic log rotation and cleanup
7. **Template Consolidation**: Merge similar templates

### Low Priority
8. **Documentation Updates**: Align docs with actual implementation
9. **Error Handling**: Improve script error handling and recovery
10. **Performance Monitoring**: Add script execution timing

---

*This mindmap serves as the foundation for systematic refactoring and optimization of the Claude Life V2 system.*