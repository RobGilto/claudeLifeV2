# Task Advisor

## Purpose
Provides intelligent, human-in-the-loop task management advice by analyzing your current context, rituals, and goals. Suggests tasks to create manually rather than automating task creation.

## Workflow
1. **Context Analysis**: Reviews current time, rituals, calendar, and existing tasks
2. **Smart Suggestions**: Provides specific task recommendations with reasoning
3. **Manual Creation**: You manually create suggested tasks using provided commands
4. **Progress Tracking**: Monitors task completion patterns for future advice

## Implementation

### Initial Context Gathering
```javascript
// Get current time and context
const currentTime = await getCurrentSydneyTime();
const ritualStatus = await getRitualStatus();
const existingTasks = await getNextTasks();
const calendarEvents = await getTodaysCalendarEvents();
```

### Advisory Analysis
- **Ritual Gaps**: Identify missing ritual tasks for today
- **Time Blocks**: Suggest tasks that fit available time windows
- **Priority Balance**: Recommend task priorities based on current workload
- **Project Focus**: Suggest project-specific tasks based on goals

### Suggestion Format
```
🎯 TASK RECOMMENDATIONS - [Current Time]

📅 Based on your rituals and calendar:
• [Ritual/time block] - Suggested task with reasoning
• Manual command: task add "description" project:X priority:H due:today

⚡ Quick wins available (15-30 min):
• [Specific actionable tasks]

🔥 Priority focus areas:
• [AI engineering skills] - Progress toward 2026 goal
• [Financial automation] - Immediate financial impact

⏰ Time-sensitive items:
• [Items with deadlines or optimal timing]

💡 Energy-appropriate tasks:
• Morning: [High cognitive load tasks]
• Afternoon: [Moderate focus tasks]  
• Evening: [Administrative/review tasks]
```

### Human Commands Provided
For each suggestion, provide exact TaskWarrior commands:
```bash
# High priority AI learning
task add "Boot.dev Python fundamentals - 1 hour" project:Learning.AI priority:H due:today scheduled:today

# Ritual completion
task add "Morning reflection journal" project:Personal.Rituals priority:M due:today

# Project advancement  
task add "Portfolio project - RuneQuest character generator" project:Portfolio.AI priority:H
```

## Key Features

### 1. **Context-Aware Suggestions**
- Considers current energy levels and time of day
- Respects existing calendar commitments
- Aligns with ritual schedule and goals

### 2. **Reasoning Transparency**
- Explains why each task is suggested
- Shows how it fits into larger goals
- Indicates optimal timing and duration

### 3. **Manual Control**
- Provides exact commands to copy/paste
- User decides which suggestions to implement
- No automatic task creation

### 4. **Pattern Learning**
- Tracks which suggestions you act on
- Improves future recommendations
- Adapts to your preferences and patterns

## Integration Points

### Check-in Commands
Replace automatic task creation in check-ins with advisory calls:
- `/afternoon-checkin` → Call task advisor for afternoon focus
- `/evening-checkin` → Call task advisor for evening wrap-up
- `/end-of-day-checkout` → Call task advisor for tomorrow prep

### Ritual Integration
- Analyze ritual completion gaps
- Suggest ritual-supporting tasks
- Respect ritual time blocks for scheduling

### Goal Alignment
- Connect daily tasks to 2026 AI engineering goal
- Prioritize skill-building and portfolio work
- Balance learning with immediate needs

## Usage Examples

### Morning Advisory
```
/task-advisor morning

🌅 MORNING TASK RECOMMENDATIONS - 08:30 Sydney Time

📅 Ritual gaps identified:
• Morning reflection missing
  → task add "Journal: Yesterday's wins + today's intentions" project:Personal.Rituals priority:M due:today

⚡ Peak cognitive hours (next 2-3 hours):
• Boot.dev lesson progress  
  → task add "Python OOP concepts - Chapter 3" project:Learning.AI priority:H scheduled:today
• Portfolio coding session
  → task add "RuneQuest API endpoints - 90 min deep work" project:Portfolio.AI priority:H

🎯 Financial automation opportunity:
• Expense categorization script
  → task add "Build expense auto-categorizer prototype" project:Finance.Automation priority:M
```

### Context-Driven Analysis
- **Energy Level**: High/Medium/Low cognitive demand suggestions
- **Available Time**: Tasks fitting into free calendar windows  
- **Ritual Status**: Missing or upcoming ritual support tasks
- **Goal Progress**: Skills and portfolio advancement opportunities
- **Life Balance**: Personal, financial, and professional task mix

## Advisory Principles

### 1. **Suggest, Don't Automate**
- Provide recommendations with reasoning
- Give exact commands for easy execution
- Respect user autonomy in task creation

### 2. **Context-Driven Intelligence**
- Consider time, energy, and current commitments
- Align with larger goals and ritual system
- Adapt suggestions to patterns and preferences

### 3. **Actionable Specificity**
- Concrete tasks with clear outcomes
- Appropriate duration and complexity estimates
- Project categorization and priority guidance

### 4. **Learning and Adaptation**
- Track suggestion acceptance rates
- Refine recommendations based on completion patterns
- Improve timing and context awareness over time

This approach maintains the intelligence of automated task management while preserving human agency and decision-making in the process.