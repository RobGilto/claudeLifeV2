# Start of Day Check-in

A comprehensive, LLM-intelligent personal motivational brief designed to launch your day with clarity, energy, and strategic alignment. Provides a holistic overview of your personal world and sets up optimal daily execution.

## Usage
```bash
/start-of-day
```

## Process

### 1. **CRITICAL - Time and Context Foundation**
   - ALWAYS use `./scripts/sydney-time.sh checkin` to get current Sydney time
   - ALWAYS use `./scripts/sydney-time.sh date` for today's date
   - NEVER use MCP time tools (they return UTC, not Sydney time)
   - Establish time context for all subsequent recommendations

### 2. **Personal World Intelligence Gathering**
   Read and synthesize key personal context:
   ```
   Essential Context Sources:
   - CLAUDE.md (mission statement, current goals, user context)
   - /planning/data/week-[current-week].json (current week priorities)
   - /planning/data/month-[current-month].json (monthly objectives and theme)
   - /planning/data/quarter-[current-quarter].json (if exists - quarterly strategic focus)
   - /victories/victories-[current-month].md (recent wins for motivation)
   - /journal/daily/daily-[yesterday].md (yesterday's journal entry if exists)
   - Recent /planning/data/day-[recent].json files (execution patterns)
   ```

### 3. **Smart System Status Checks**
   Analyze completeness of personal systems:
   
   **A. Yesterday's Review Status**:
   ```
   Check for yesterday's completion:
   - Read /journal/planning/daily-reviews/review-[yesterday].md
   - If missing: Note "Yesterday's reflection is pending"
   - If exists: Extract key insights and satisfaction level
   ```
   
   **B. Today's Plan Status**:
   ```
   Check today's planning state:
   - Read /planning/data/day-[today].json
   - If missing: Flag for immediate planning
   - If exists: Load time blocks, objectives, and ritual schedule
   ```
   
   **C. Strategic Context Loading**:
   ```
   Load hierarchical planning context:
   - Current week objectives and priorities
   - Current month theme and key milestones
   - Quarter-level strategic focus (if in planning files)
   - Recent victory patterns for motivation building
   ```

### 4. **LLM-Intelligent Personal Brief Generation**
   Using gathered context, generate a warm, personalized morning brief:

   ```
   🌅 **START OF DAY BRIEF** - [Today's Date] - [Current Time]
   
   Good morning! Let's launch your day with clarity and purpose.
   
   ## 🎯 Your Personal World Today
   
   ### Mission Context
   [Reference Robert's mission from CLAUDE.md and connect to today's possibilities]
   
   **Days to Mid-2026 Goal**: [Calculate remaining days] | **Current Phase**: [From quarterly/monthly context]
   
   ### Strategic Landscape  
   **This Week's Focus**: [From week planning data]
   - Priority 1: [Top weekly objective]
   - Priority 2: [Second objective]
   - Progress Momentum: [Analysis of recent completion patterns]
   
   **Monthly Theme**: "[Month theme from planning data]"
   - Key Milestone Due: [Upcoming milestone with date]
   - Completion Status: [Analysis of monthly objectives progress]
   
   ### Recent Victory Momentum 🏆
   [Extract 2-3 recent victories from victories file to build motivation]
   - [Victory description with date]
   - [Victory description showing progress pattern]
   
   **Victory Insight**: [LLM analysis of what these victories reveal about your growth]
   
   ## 📊 System Status Check
   
   ### Yesterday's Closure
   [If yesterday review exists: Summarize key insights and satisfaction level]
   [If yesterday review missing: Gentle reminder about reflection importance]
   
   ### Today's Foundation
   [If daily plan exists: Preview key time blocks and objectives]
   [If daily plan missing: Immediate planning recommendation]
   
   ## 🚀 Today's Strategic Connection
   
   ### How Today Serves Your Transformation
   [LLM analysis connecting today's planned activities to AI engineering goals]
   
   ### Energy and Values Alignment
   **Recommended Primary Value Today**: [From values/context - which core value to emphasize]
   **Energy Optimization**: [Time-of-day recommendations based on historical patterns]
   **Deep Work Protection**: [Newport slow productivity focus for today]
   
   ### Breakthrough Opportunity
   [LLM identification of potential breakthrough moment available today]
   ```

### 5. **Intelligent Next Steps Orchestration**
   Based on system status, provide smart next actions:
   
   **If Today's Plan Missing**:
   ```
   🎯 **IMMEDIATE ACTION NEEDED**
   
   No daily plan detected for today. Let's create your strategic time blocks:
   
   **Recommended**: Run `/plan-day` now to:
   - Create 4-5 ADD-optimized time blocks
   - Align activities with weekly priorities  
   - Establish ritual schedule and available windows
   - Generate calendar events for structured execution
   
   [AUTOMATICALLY trigger /plan-day if user confirms]
   ```
   
   **If Yesterday Review Missing**:
   ```
   💭 **REFLECTION OPPORTUNITY**
   
   Yesterday's review is pending. Consider running `/review-day [yesterday]` to:
   - Extract lessons from yesterday's execution
   - Maintain performance tracking continuity
   - Build on yesterday's wins and learning
   ```

### 6. **Smart Command Recommendations**
   Use intelligent recommender system for personalized next steps:
   ```
   ## 🎯 Your Optimal Next Actions
   
   [Call intelligent recommender with current time context]
   node scripts/intelligent-recommender.cjs "morning start-of-day motivation"
   
   **Recommended Sequence**:
   1. [Top recommendation with strategic reason]
   2. [Second recommendation with tactical benefit]
   3. [Third recommendation for momentum building]
   
   **If Feeling Scattered**: `/brain-dump` → `/executive-function`
   **If Need Deep Work**: `/taskmaster-start` → `/pomodoro start`
   **If Behind on Learning**: `/bootdev-done` → `/skill-status`
   ```

### 7. **Daily Journal Integration**
   Save comprehensive start-of-day summary to daily journal:
   ```yaml
   # Append to or create /journal/daily/daily-[today].md
   ---
   date: [today]
   type: daily
   sessions: [start-of-day]
   status: active
   privacy: private
   ---
   
   # Daily Journal - [Full Date]
   
   ## 🌅 Start of Day Brief ([Current Time])
   
   ### Personal World Status
   **Mission Connection**: [How today serves transformation goals]
   **Strategic Focus**: [Week/month priorities for today]
   **Victory Momentum**: [Recent wins analysis]
   **System Status**: [Plan status, review status, recommendations]
   
   ### Energy and Intentions
   **Morning Energy Level**: [Invite user rating 1-10]
   **Primary Value Today**: [Recommended focus value]
   **Breakthrough Opportunity**: [What could make today special]
   **Deep Work Priority**: [Most important focus work]
   
   ### Smart Recommendations Generated
   [Record top 3 recommendations and reasoning]
   
   **Next Actions Taken**: [Track which recommendations were followed]
   ```

### 8. **Motivational Completion**
   End with energizing, mission-aligned encouragement:
   ```
   ## ✨ Your Day Starts Now
   
   **Remember**: Every day is an opportunity to architect your mind and advance toward your AI engineering transformation. Today's time blocks, learning sessions, and focused work all compound toward your mid-2026 goal.
   
   **Energy Message**: [Personalized based on recent patterns, time of day, and strategic context]
   
   **Simple Truth**: Relentless daily dedication transforms dreams into expertise. You've got this! 🚀
   
   **Immediate Focus**: [Single, clear next action to take right now]
   ```

## Integration Points

### Calendar Integration
- Leverages existing Google Calendar MCP for event checking
- Supports automatic `/plan-day` triggering with calendar sync
- Respects ritual schedule from ritual-manager-v2.js

### Task System Integration  
- Uses TaskWarrior MCP to check task status and priorities
- Connects to `/taskmaster-start` for seamless execution transition
- Aligns recommendations with TaskWarrior project structure

### Victory System Integration
- Reads victory files to build motivational momentum
- Analyzes victory patterns for breakthrough opportunity identification
- Sets psychological foundation for victory capture throughout day

### Smart Recommender Integration
- Calls intelligent-recommender.cjs for context-aware next actions
- Adapts recommendations based on time, missing activities, and strategic periods
- Provides personalized command sequences for optimal workflow

## ADD-Optimization Features

### Executive Function Support
- **Clear Structure**: Consistent format reduces decision fatigue
- **Prioritized Actions**: Maximum 3 recommended next steps
- **Strategic Context**: Connects daily actions to larger transformation goals
- **Motivational Foundation**: Builds energy and clarity before task execution

### Energy Management
- **Time-Aware Recommendations**: Adapts to morning energy patterns
- **Sustainable Pace**: Emphasizes Newport's slow productivity principles  
- **Breakthrough Focus**: Identifies today's maximum impact opportunity
- **Values Alignment**: Ensures daily actions serve core personal values

## Critical Success Factors

1. **Always use Sydney timezone** via `./scripts/sydney-time.sh`
2. **Leverage LLM intelligence** for synthesis over rigid scripting
3. **Connect to mission** - every brief should reference transformation goals
4. **Build motivation** through recent victory analysis and momentum recognition
5. **Trigger planning** when daily plan is missing
6. **Integrate seamlessly** with existing command ecosystem
7. **Save context** to daily journal for continuity tracking
8. **Provide clear next actions** to prevent morning paralysis

This command serves as the intelligent foundation for productive, mission-aligned days by combining systematic status checking with LLM-powered personal context synthesis and motivational messaging.