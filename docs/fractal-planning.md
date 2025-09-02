# Fractal Planning Protocol

A comprehensive multi-scale planning system that creates aligned plans from daily time blocks to yearly vision, with integrated performance tracking and continuous improvement.

## Core Concepts
- **Multi-Indexing**: Every date is simultaneously indexed as day/week/month/quarter/year
- **Fractal Alignment**: Plans cascade from year → quarter → month → week → day
- **Performance Tracking**: Each period has completion rates, wellbeing metrics, and insights
- **Continuous Adjustment**: Reviews feed back into planning for iterative improvement

## Planning Commands

### `/plan-year` Command
- Strategic yearly vision and transformation goals
- 3-4 major strategic priorities
- 8-12 yearly objectives and milestones  
- Success metrics definition
- Creates foundation for all lower-level plans

### `/plan-quarter` Command
- 3-5 strategic priorities aligned with yearly vision
- 6-10 quarterly objectives and major milestones
- Quarterly theme/focus area
- Inherits alignment from yearly plan

### `/plan-month` Command  
- 5-8 monthly objectives and 4 milestones
- Monthly theme connected to quarterly priorities
- Tactical execution of strategic initiatives
- Bridge between strategic quarters and tactical weeks

### `/plan-week` Command
- 3-5 weekly priorities and 8 weekly objectives
- Weekly context/theme
- Operational planning aligned with monthly goals
- Sets up daily time block allocation

### `/plan-day` Command
- 4-5 time blocks optimized for ADD workflow
- Each block aligned with higher-level objectives
- Daily objectives (max 3 for focus)
- Automatic integration with Taskmaster execution
- Built-in calendar sync capability

## Review Commands

### `/review-day [relative_date]` Command
- Comprehensive daily execution review against planned objectives
- Automated victory detection from journal entries and activities
- Energy, focus, and satisfaction pattern analysis
- Multi-index positioning display (day X/365, week Y/52, etc.)
- Parent plan alignment assessment (weekly/monthly/quarterly goals)
- Automatic data gathering from daily journals and victory tracking
- **Intelligent period-boundary detection and cascading review suggestions**
- **Smart review cascade prompting**: When reviewing on period boundaries, suggests completing reviews in logical order:
  - **Sunday**: Suggests `/review-week` completion first
  - **Month-end**: Suggests `/review-month` after weekly review
  - **Quarter-end**: Suggests `/review-quarter` after monthly review
  - **Year-end**: Suggests `/review-year` after quarterly review
- **Strategic transition guidance**: Explains why higher-level reviews matter for upcoming period planning
- **Example cascade**: September 30 (Sunday + Month-end + Quarter-end) would suggest:
  1. Complete weekly review first: `/review-week 2025-W39`
  2. Then monthly review: `/review-month 2025-09` 
  3. Finally quarterly review: `/review-quarter 2025-Q3`
  4. Ready for Q4 planning: `/plan-quarter 2025-Q4`
- Supports relative dates: `today`, `yesterday` 
- Outputs structured review to `journal/planning/daily-reviews/`

### `/review-week [week_id]` Command
- Weekly objective completion assessment with daily breakdown
- Energy, focus, and satisfaction metrics aggregation (1-10 scales)
- Victory pattern analysis across the week period
- Performance comparison with previous weeks
- Strategic alignment evaluation with monthly/quarterly plans
- Automatic template generation for comprehensive weekly reflection
- Supports week formats: `2025-W34`, `current`, `last`
- Outputs to `journal/planning/weekly-reviews/`

### `/review-month [month_id]` Command
- Monthly objective and milestone completion review
- Comprehensive victory analysis and achievement patterns
- Weekly performance aggregation and trend analysis
- Strategic insights for next month planning
- Git commit analysis for technical progress tracking
- Supports formats: `2025-08`, `current`, `last`
- Outputs to `journal/planning/monthly-reviews/`

### `/review-quarter [quarter_id]` and `/review-year [year_id]` Commands
- Major milestone and objective assessment across extended periods
- Strategic performance analysis and goal alignment evaluation
- Long-term trend identification and pattern recognition
- Vision alignment evaluation and strategic pivot recommendations
- Comprehensive achievement synthesis across all sub-periods

## Taskmaster Integration

### `/taskmaster-start` Command
- Loads daily plan and initializes execution session
- Shows alignment context from higher-level plans
- Provides time block overview with completion tracking
- Integrates with fractal planning hierarchy

### `/taskmaster-block` Command
- Executes specific time blocks with focus tracking
- Records energy and focus metrics before/during/after
- Tracks interruptions and challenges
- Maintains alignment with strategic objectives

### `/taskmaster-complete` Command
- Records outcomes and completion metrics
- Updates original plan completion status
- Suggests next time block for seamless flow
- Feeds data into performance tracking system

## Performance Analytics

### `/performance-dashboard` Command
- Current period status across all planning levels
- Recent performance trends and highlights
- Wellbeing metric tracking over time
- Recommended next actions based on gaps

### `/performance-compare` Command
- Side-by-side comparison of any two periods
- Completion rate, wellbeing, and productivity analysis
- Improvement/decline identification with insights
- Actionable recommendations for optimization

### `/performance-trend` Command
- Multi-period trend analysis (weeks, months, quarters)
- Pattern detection (cyclical, consistent trends)
- Moving averages and direction analysis
- Trend-based improvement recommendations

## Data Structure and Storage
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
├── analytics/                # Exported analysis data
│   └── performance-export-YYYY-MM-DD.json
journal/planning/             # Generated review templates
├── daily-reviews/            # Comprehensive daily reviews
│   └── review-YYYY-MM-DD.md
├── weekly-reviews/           # Weekly strategic reviews
│   └── review-YYYY-Www.md
├── monthly-reviews/          # Monthly milestone assessments
│   └── review-YYYY-MM.md
└── quarterly-reviews/        # Quarterly strategic evaluations
    └── review-YYYY-Qq.md
```

## Integration Features
- **Seamless Hierarchy**: Plans automatically inherit from parent levels
- **Real-time Alignment**: Daily execution shows weekly/monthly/quarterly context
- **Performance Feedback**: Reviews inform future planning iterations
- **ADD Optimization**: 4-5 daily blocks, visual progress, clear next actions
- **Data Export**: JSON/CSV export for external analysis tools

## Key Benefits
- **Reduces Planning Overhead**: Hierarchy eliminates redundant planning
- **Maintains Strategic Focus**: Daily actions stay aligned with yearly vision
- **Tracks What Matters**: Completion rates + wellbeing for holistic success
- **Enables Continuous Improvement**: Performance data drives better planning
- **ADD-Friendly**: Time-boxed, visual, with clear structures and next actions
- **Automated Date Handling**: Enhanced DateIndex class eliminates manual date calculations
- **Intelligent Victory Detection**: Automatic analysis of achievements from existing data
- **Contextual Reviews**: Reviews pull relevant data from journals, victories, and Git activity

## Calendar Integration

### `/calendar-sync [date]` Command
- Converts daily time blocks into Google Calendar events
- Automatic time zone handling (Australia/Sydney)
- Color-coded events by block type (deep-work=blue, learning=green)
- Popup reminders at 10 and 2 minutes before each block
- Generates both MCP commands and manual entry options
- Saves sync data for tracking and potential automation
- Provides setup instructions for Google Calendar MCP integration

**Calendar Sync Features:**
- **Smart Scheduling**: Respects Australia/Sydney timezone automatically
- **Block Type Colors**: Visual differentiation in calendar (deep-work, learning, admin, review)
- **Strategic Context**: Event descriptions include alignment with higher-level goals
- **Dual Options**: Both automated MCP sync and manual calendar entry
- **Setup Guidance**: One-time Google Calendar MCP configuration instructions