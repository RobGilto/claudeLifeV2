# Smart Command Recommender

Intelligently suggests the most appropriate slash commands based on time of day, strategic periods, and conversation context. Uses cached command data for comprehensive analysis and scoring.

## Usage
```bash
/recommend [context]         # Get smart recommendations with optional context
/recommend --update [context] # Force update command cache before recommending
```

## Features
- **Intelligent Caching**: Automatically builds and maintains command metadata cache
- **Context-Aware Scoring**: Scores commands based on timing, user patterns, and missing activities
- **Strategic Period Detection**: Automatically detects year-end, quarter-end, month-end periods
- **Missing Activity Detection**: Identifies gaps in daily routines and suggests corrections
- **Mission Alignment**: All recommendations align with AI engineering transformation goals

## Process

### 1. Command Cache System
```bash
# Build command cache (automatic)
node scripts/command-cache-builder.js build

# Check cache status
node scripts/command-cache-builder.js check

# View cache statistics
node scripts/command-cache-builder.js stats
```

**Cache contains:**
- Command metadata (name, description, category, priority)
- Timing conditions (time of day, day of week, strategic periods)
- Context triggers (keywords, situations, missing activities)
- Integration points and prerequisites
- Output files and data flows

### 2. Intelligent Scoring Algorithm
```bash
# Generate recommendations with scoring
node scripts/intelligent-recommender.js [context]

# Force cache update and recommend
node scripts/intelligent-recommender.js --update [context]
```

**Scoring factors:**
- **Base Priority** (50-100): Command importance level
- **Time Matching** (+25): Perfect time-of-day alignment
- **Day Matching** (+20): Ideal day-of-week alignment
- **Strategic Periods** (+30): Quarter/month/year-end bonuses
- **Missing Activities** (+40/25/15): High/medium/low urgency gaps
- **Context Keywords** (+15): Input keyword matching
- **Category Boosts** (+20/15/10): Time-appropriate categories

### 3. Time and Context Analysis
```bash
# Get current Sydney time and date context
./scripts/sydney-time.sh checkin  # Current time
./scripts/sydney-time.sh date     # Current date
```

Analyze:
- **Current time of day** (early morning, morning, afternoon, evening, night)
- **Day of week** (Sunday for weekly planning, Monday for fresh starts, etc.)
- **Strategic periods** (month-end, quarter-end, year-end detection)
- **Calendar context** from conversation history
- **Recent activity patterns** from journal entries and planning data
- **Missing activities** (no checkins, no plans, gaps in routines)
- **User context** (Boot.dev streaks, task patterns, skill development)

### 4. Strategic Period Detection

#### Year-End Planning (December 15-31)
When in the last 2 weeks of the year, prioritize strategic foundation commands:
```
🎯 YEAR-END STRATEGIC PLANNING PERIOD
📅 December 15-31, 2025

⭐ Priority Recommendations:
1. /review-year - Annual transformation assessment
2. /plan-year - Strategic yearly vision for 2026
3. /lifestyle-vision - Refresh life vision and direction
4. /define-values - Review and update core values
5. /define-roles - Reassess life roles for new year
6. /skill-investor - Strategic skill development planning
```

#### Quarter-End Planning (Last week of Q1/Q2/Q3/Q4)
```
🎯 QUARTER-END REVIEW PERIOD
📅 Last week of Quarter

⭐ Priority Recommendations:
1. /review-quarter - Quarterly milestone assessment
2. /plan-quarter - Next quarter strategic priorities
3. /performance-dashboard - Quarter performance analysis
4. /skill-review - Quarterly skill development review
```

#### Month-End Planning (Last 3 days of month)
```
🎯 MONTH-END REVIEW PERIOD
📅 Last 3 days of month

⭐ Priority Recommendations:
1. /review-month - Monthly objective completion
2. /plan-month - Next month tactical planning
3. /victory-review - Monthly achievement celebration
4. /lessons-detect - Monthly learning extraction
```

### 5. Time-Based Recommendations

**Note:** Robert's actual schedule patterns based on journal analysis:
- **Morning Checkin:** Usually occurs around noon (12:00 PM)
- **Afternoon Checkin:** Usually occurs around 6:00 PM  
- **Evening Checkin:** Usually occurs late evening before bed (11:00 PM+)

#### Early Morning (5:00-12:00 PM Sydney Time)
**Perfect for**: Deep work, skill development, focused execution before checkin time
```
🌅 EARLY MORNING FOCUS
⭐ Top Recommendations:
1. /daily-brief - Get personalized news and career insights
2. /plan-day - Create structured time blocks for success
3. /pomodoro start - Begin focused work session
4. /bootdev-done - Complete morning learning session
5. /taskmaster-start - Execute daily time blocks
```

#### Midday Checkin Time (11:00 AM - 1:00 PM)
**Perfect for**: Reflection, energy assessment, intention setting
```
🌤️ MIDDAY CHECKIN WINDOW
⭐ Top Recommendations:
1. /morning-checkin - Energy assessment and daily intentions (Robert's usual noon timing)
2. /ritual-status - Check daily ritual commitments
3. /skill-status - Review progress toward 2026 goals
4. /executive-function - ADD-optimized productivity support
5. /taskwarrior-ritual-sync - Sync rituals with TaskWarrior
```

#### Afternoon Work (1:00-6:00 PM)
**Perfect for**: Continued execution, break management, course correction
```
☀️ AFTERNOON MOMENTUM
⭐ Top Recommendations:
1. /pomodoro start - Continue focused work sessions
2. /brain-dump - Capture scattered thoughts and ideas
3. /project-progress - Review current project status
4. /github-skill-scan - Analyze recent coding activity
5. /pomodoro break - Take strategic breaks for ADD optimization
```

#### Evening Checkin Time (5:00-7:00 PM)
**Perfect for**: Mid-day reflection, accomplishment review, energy check
```
🌅 EVENING CHECKIN WINDOW
⭐ Top Recommendations:
1. /afternoon-checkin - Mid-day energy and priority check (Robert's usual 6 PM timing)
2. /add-victory - Capture day's wins and progress
3. /bootdev-done - Complete evening coding practice
4. /executive-function - ADD-optimized support if energy flagging
5. /calendar-sync - Schedule remaining evening blocks
```

#### Late Evening/Night (7:00 PM - Bedtime)
**Perfect for**: Final execution, deep reflection, day completion
```
🌙 EVENING EXECUTION & NIGHT REFLECTION
⭐ Top Recommendations:
1. /evening-checkin - Day reflection and tomorrow planning (Robert's usual 11+ PM timing)
2. /taskmaster-complete - Close out today's execution
3. /review-day - Comprehensive daily performance review
4. /victory-suggest - AI-powered victory detection
5. /lessons-detect - Extract wisdom from challenges
6. /brain-dump-analysis - Process stream-of-consciousness notes
7. /transcribe-brain-dump - Convert voice notes to insights
```

### 6. Day-of-Week Patterns

#### Sunday - Strategic Planning Day
```
📅 SUNDAY STRATEGIC FOCUS
⭐ Weekly Planning Recommendations:
1. /plan-week - Create upcoming week strategic priorities
2. /weekly-checkin - Review last week's performance
3. /review-week - Deep analysis of weekly patterns
4. /ritual-status - Plan weekly ritual commitments
5. /performance-dashboard - Weekly trend analysis
```

#### Monday - Fresh Start Execution
```
📅 MONDAY MOMENTUM
⭐ Fresh Start Recommendations:
1. /plan-day - Structure Monday for maximum impact
2. /ritual-status - Ensure weekly rituals are active
3. /taskwarrior-ritual-sync - Sync week's commitments
4. /skill-status - Weekly skill development check
5. /pomodoro start - Begin week with focused work
```

#### Friday - Completion and Review
```
📅 FRIDAY COMPLETION
⭐ Week Closing Recommendations:
1. /victory-review - Celebrate week's achievements
2. /skill-review - Assess weekly skill development
3. /performance-dashboard - Week completion analysis
4. /add-victory - Capture Friday wins
5. /lessons-detect - Extract week's learning opportunities
```

#### Saturday - Analysis and Investment
```
📅 SATURDAY ANALYSIS
⭐ Strategic Investment Recommendations:
1. /performance-trend - Multi-week trend analysis
2. /skill-investor - Strategic skill development planning
3. /project-progress - Deep project review and planning
4. /github-skill-scan - Comprehensive code analysis
5. /newsletter-research - Competitive analysis and content
```

### 7. Context-Based Recommendations

#### Mission and Goal Context
When discussing goals, mission, or long-term vision:
```
🎯 STRATEGIC ALIGNMENT
⭐ Foundation Recommendations:
1. /lifestyle-vision - Define compelling life direction
2. /define-values - Establish core personal values
3. /define-roles - Clarify key life roles and responsibilities
4. /plan-year - Strategic yearly transformation goals
5. /skill-investor - Long-term skill development strategy
```

#### Task and Productivity Context
When discussing tasks, focus, or productivity:
```
⚡ EXECUTION FOCUS
⭐ Productivity Recommendations:
1. /pomodoro start - Begin focused work session
2. /taskmaster-start - Execute structured time blocks
3. /executive-function - ADD-optimized productivity support
4. /calendar-sync - Schedule focus blocks in calendar
5. /ritual-block - Create time-blocked ritual execution
```

#### Reflection and Analysis Context
When reflecting, reviewing, or analyzing:
```
🔍 REFLECTION & ANALYSIS
⭐ Insight Recommendations:
1. /brain-dump - Capture stream-of-consciousness thoughts
2. /add-victory - Document wins and progress
3. /lessons-detect - Extract learning from challenges
4. /performance-dashboard - Comprehensive performance view
5. /victory-suggest - AI-powered achievement detection
```

#### Learning and Skill Context
When discussing learning, skills, or development:
```
📚 LEARNING & DEVELOPMENT
⭐ Skill Building Recommendations:
1. /skill-status - Current progress toward 2026 goals
2. /github-skill-scan - Analyze coding activity for evidence
3. /bootdev-done - Complete structured learning session
4. /skill-update - Update skill matrix with new evidence
5. /skill-crafter - Link skills to portfolio projects
```

#### Planning and Organization Context
When discussing planning or feeling scattered:
```
📋 PLANNING & ORGANIZATION
⭐ Structure Recommendations:
1. /plan-day - Create structured daily time blocks
2. /plan-week - Strategic weekly priorities
3. /executive-function - ADD-optimized organization
4. /ritual-status - Review foundational commitments
5. /calendar-sync - Convert plans to calendar events
```

### 8. Smart Detection Logic

#### Recent Activity Analysis
The system analyzes:
- **Journal entries**: Last checkin completed, topics discussed
- **Planning data**: Existing plans, completion rates, gaps
- **Victory tracking**: Recent wins, celebration patterns
- **Calendar sync**: Scheduled vs actual execution
- **Git activity**: Recent commits, skill evidence
- **Task completion**: TaskWarrior progress, abandonments

#### Missing Activity Detection
```
🔔 MISSING ACTIVITY ALERTS
- No morning checkin today → /morning-checkin
- No daily plan found → /plan-day
- Long break from Boot.dev → /bootdev-done
- No recent victories logged → /victory-suggest
- Scattered thoughts detected → /brain-dump
- High task abandonment → /executive-function
- No skill updates in 2 weeks → /skill-update
```

#### Conversation Keyword Triggers
- **"stuck", "overwhelmed", "scattered"** → `/executive-function`, `/brain-dump`
- **"goals", "mission", "vision"** → `/lifestyle-vision`, `/define-values`
- **"focus", "productivity", "work"** → `/pomodoro start`, `/taskmaster-start`
- **"progress", "skills", "learning"** → `/skill-status`, `/github-skill-scan`
- **"planning", "organize", "structure"** → `/plan-day`, `/plan-week`
- **"tired", "energy", "motivation"** → `/ritual-status`, `/victory-review`
- **"reflect", "review", "analyze"** → `/brain-dump`, `/performance-dashboard`

### 9. Enhanced Output Format

```
🎯 SMART COMMAND RECOMMENDATIONS
**Time:** [Sydney Date and Time]
**Context:** [Time period], [Day of week], [Strategic period if applicable]

## 🎯 STRATEGIC PERIOD DETECTED (if applicable)
**[STRATEGIC PERIOD NAME]**

## 📌 TOP RECOMMENDATIONS:

### 1. `/command-name` ⭐⭐⭐⭐⭐
**Why:** [Specific reason based on scoring algorithm]
**Category:** [category] • **Score:** [score]/100

### 2. `/command-name` ⭐⭐⭐⭐
**Why:** [Specific reason based on analysis]
**Category:** [category] • **Score:** [score]/100

## 🔔 MISSING ACTIVITIES:
- **[MISSING ACTIVITY TYPE]** → `/command-name` ([details if applicable])

## 💡 CONTEXT-BASED SUGGESTIONS:
- **If feeling scattered** → `/brain-dump` - Capture racing thoughts
- **If need structure** → `/executive-function` - ADD-optimized support
- **If behind on goals** → `/skill-status` - Progress check
- **If low energy** → `/victory-review` - Motivation boost

## 📅 UPCOMING STRATEGIC PERIODS:
- **[Next Sunday]**: Week-end → `/review-week`, `/plan-week`
- **[Next Month-end]**: Month-end → `/review-month`, `/plan-month`

## ✨ MISSION ALIGNMENT CHECK:
Your top recommendations serve your mission **"To achieve the rank of Senior AI Software Engineer through relentless daily dedication"**:

- **`/command-name`** = [Mission alignment explanation]
- **`/command-name`** = [Mission alignment explanation]

**Days to mid-2026 goal:** ~[days] days remaining
**Recommended sequence:** `/command-1` → `/command-2` → `/command-3`
```

### 10. Integration with Mission and Values

#### Mission Alignment
Every recommendation includes how it serves Robert's mission:
- **"To achieve the rank of Senior AI Software Engineer"**
- **"Through relentless daily dedication"**
- **"Architecting my mind and habits for maximum efficiency"**

#### Values Integration
When foundation commands are available, recommendations reference:
- **Values-based decision making** from `/define-values`
- **Role balance and development** from `/define-roles`
- **Lifestyle vision alignment** from `/lifestyle-vision`

#### Strategic Coherence
Recommendations maintain coherence across planning levels:
- **Daily actions** serving **weekly priorities**
- **Weekly priorities** serving **monthly objectives**
- **Monthly objectives** serving **quarterly milestones**
- **Quarterly milestones** serving **yearly transformation goals**

## Implementation

### Cached Command Processing
```bash
# Called by /recommend slash command
node scripts/intelligent-recommender.js "$context"

# Called by /recommend --update
node scripts/intelligent-recommender.js --update "$context"
```

### Cache Management
- **Automatic Updates**: Cache rebuilds when command files are modified
- **Performance**: Fast recommendations using pre-processed metadata
- **Extensibility**: Easy to add new commands and conditions
- **Maintenance**: Built-in cache validation and statistics

### Data Files
```
planning/data/
├── command-cache.json        # Main command metadata cache
├── day-[date].json          # Daily planning data (checked for gaps)
└── execution-[date].json    # Daily execution tracking

journal/daily/
└── daily-[date].md          # Daily journal entries (checked for checkins)

tracking/
└── bootdev-progress.json    # Boot.dev streak tracking
```

This enhanced recommender system provides intelligent, context-aware guidance using comprehensive caching and scoring algorithms while maintaining strategic alignment with your AI engineering transformation journey and ADD-optimized workflow patterns.