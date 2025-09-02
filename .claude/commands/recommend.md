# Smart Command Recommender

Intelligently suggests the most appropriate slash commands based on time of day, strategic periods, and conversation context. Purely informative - provides smart suggestions without taking any actions.

## Usage
```bash
/recommend [context]
```

## Process

### 1. Time and Context Analysis
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

### 2. Strategic Period Detection

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

### 3. Time-Based Recommendations

#### Early Morning (5:00-9:00 AM Sydney Time)
**Perfect for**: Intention setting, planning, and fresh starts
```
🌅 EARLY MORNING FOCUS
⭐ Top Recommendations:
1. /morning-checkin - Set daily intentions and energy assessment
2. /daily-brief - Get personalized news and career insights
3. /plan-day - Create structured time blocks for success
4. /ritual-status - Check daily ritual commitments
5. /taskwarrior-ritual-sync - Sync rituals with TaskWarrior
```

#### Morning (9:00-12:00 PM)
**Perfect for**: Deep work, skill development, focused execution
```
🌤️ MORNING PRODUCTIVITY
⭐ Top Recommendations:
1. /pomodoro start - Begin focused work session
2. /taskmaster-start - Execute daily time blocks
3. /skill-status - Review progress toward 2026 goals
4. /github-skill-scan - Analyze recent coding activity
5. /bootdev-done - Complete morning learning session
```

#### Afternoon (12:00-17:00 PM)
**Perfect for**: Mid-day reflection, break management, course correction
```
☀️ AFTERNOON MOMENTUM
⭐ Top Recommendations:
1. /afternoon-checkin - Mid-day energy and priority check
2. /pomodoro break - Take strategic breaks for ADD optimization
3. /brain-dump - Capture scattered thoughts and ideas
4. /project-progress - Review current project status
5. /executive-function - ADD-optimized productivity support
```

#### Evening (17:00-20:00 PM)
**Perfect for**: Completion, reflection, victory celebration
```
🌅 EVENING WRAP-UP
⭐ Top Recommendations:
1. /evening-checkin - Day reflection and tomorrow planning
2. /bootdev-done - Complete evening coding practice
3. /add-victory - Capture today's wins and progress
4. /calendar-sync - Schedule tomorrow's time blocks
5. /taskmaster-complete - Close out today's execution
```

#### Night (20:00-23:00 PM)
**Perfect for**: Deep reflection, learning extraction, weekly review
```
🌙 NIGHT REFLECTION
⭐ Top Recommendations:
1. /review-day - Comprehensive daily performance review
2. /victory-suggest - AI-powered victory detection
3. /lessons-detect - Extract wisdom from challenges
4. /brain-dump-analysis - Process stream-of-consciousness notes
5. /transcribe-brain-dump - Convert voice notes to insights
```

### 4. Day-of-Week Patterns

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

### 5. Context-Based Recommendations

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

### 6. Smart Detection Logic

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

### 7. Output Format

```
🎯 SMART COMMAND RECOMMENDATIONS
Time: [Current Sydney Time and Date]
Context: [Time period], [Day of week], [Strategic period if applicable]

📌 TOP RECOMMENDATIONS:

1. /command-name ⭐⭐⭐⭐⭐
   Why: [Specific reason based on time/context]
   
2. /command-name ⭐⭐⭐⭐
   Why: [Specific reason based on analysis]
   
3. /command-name ⭐⭐⭐
   Why: [Supporting rationale]

[Strategic Period Section if applicable]
🎯 Strategic Focus: [Period type]
- [Specific strategic recommendations]

💡 CONTEXT-BASED SUGGESTIONS:
- If [condition] → /command-name
- If [condition] → /command-name
- If [condition] → /command-name

🔔 ACTIVITY REMINDERS:
- [Missing activity] → /command-name
- [Gap detected] → /command-name

📅 UPCOMING STRATEGIC PERIODS:
- [Date range]: [Period type] → [Recommended commands]

🧠 AI ENGINEERING JOURNEY:
- Days to 2026 goal: [calculation]
- Current skill trajectory: [status]
- Next milestone: [upcoming goal]

✨ MISSION ALIGNMENT CHECK:
- [How top recommendations serve your AI engineering mission]
- [Values alignment verification]
- [Role development opportunities]
```

### 8. Integration with Mission and Values

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

This comprehensive recommender system provides intelligent, context-aware guidance while maintaining strategic alignment with your AI engineering transformation journey and ADD-optimized workflow patterns.