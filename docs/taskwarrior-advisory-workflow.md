# TaskWarrior Advisory Workflow

## Overview
This system replaces automated TaskWarrior task creation with intelligent, human-in-the-loop recommendations. Instead of automatically creating tasks, the system provides smart suggestions with exact commands, letting you manually create tasks that align with your goals and context.

## Key Philosophy

### From Automation to Advisory
- **Before**: System automatically created TaskWarrior tasks from rituals and plans
- **After**: System analyzes context and suggests specific tasks with reasoning
- **Benefit**: Maintains human agency while providing intelligent assistance

### Human-in-the-Loop Benefits
- **Choice**: You decide which suggestions to implement
- **Context**: AI understands your situation but you make the decisions
- **Learning**: System adapts to your preferences over time
- **Control**: No surprise tasks cluttering your system

## How It Works

### 1. Context Analysis
The system gathers comprehensive context:
- Current time and energy levels (Sydney timezone)
- Existing TaskWarrior tasks and completion patterns
- Calendar events and available time windows
- Ritual status and completion gaps
- Current goals and project priorities

### 2. Intelligent Suggestions
Based on context, provides:
- **Specific tasks** with clear reasoning
- **Time estimates** and difficulty levels
- **Project categorization** and priority guidance
- **Exact TaskWarrior commands** to copy/paste

### 3. Manual Execution
You choose which suggestions to act on:
```bash
# Suggested commands are ready to use
task add "Boot.dev Python fundamentals - 1 hour" project:Learning.AI priority:H due:today

# Or modify as needed
task add "Quick Python review - 30 min" project:Learning.AI priority:M due:today
```

## Task Advisory Command

### `/task-advisor`
Primary command for getting intelligent task recommendations:

```bash
/task-advisor [context]
```

**Context Options:**
- `morning` - High cognitive load, skill-building focus
- `afternoon` - Medium energy, project advancement
- `evening` - Administrative, reflection, wind-down
- `end-of-day` - Tomorrow preparation, planning

### Example Output
```
🎯 AFTERNOON TASK RECOMMENDATIONS - 14:30 Sydney Time

📅 Based on your rituals and calendar:
• Missing afternoon ritual completion
  → task add "Afternoon reflection - 10 min" project:Personal.Rituals priority:M due:today

⚡ Available 90-minute window (15:00-16:30):
• Portfolio project advancement opportunity  
  → task add "RuneQuest character generator - API design" project:Portfolio.AI priority:H scheduled:today
  
🔥 AI Engineering goal alignment:
• Boot.dev progress behind schedule
  → task add "Python OOP concepts - Chapter 4" project:Learning.AI priority:H due:today

💡 Energy-appropriate for afternoon:
• Medium cognitive load optimal for coding practice
• Good time for problem-solving and implementation
```

## Integration Points

### Check-in Commands
All daily check-ins now include task advisory:

#### `/afternoon-checkin`
- Analyzes morning completion and afternoon opportunities
- Suggests tasks for remaining day based on energy and schedule
- Focuses on skill-building and project advancement

#### `/evening-checkin` 
- Reviews day completion and suggests wind-down tasks
- Recommends administrative and reflection activities
- Prepares for smooth end-of-day transition

#### `/end-of-day-checkout`
- Provides tomorrow preparation task suggestions
- Recommends planning and setup tasks
- Focuses on low-energy administrative items

### Ritual Integration
- **Gap Analysis**: Identifies missing ritual tasks for today
- **Time Respect**: Suggests tasks that fit within ritual-free time windows
- **Supporting Tasks**: Recommends tasks that support ritual completion

### Goal Alignment
- **2026 AI Engineering Goal**: Prioritizes skill-building and portfolio work
- **Financial Automation**: Suggests relevant automation projects
- **ADD Optimization**: Provides appropriately-sized tasks for current energy

## Task Categories and Projects

### Recommended Project Structure
```bash
# Learning and Development
Learning.AI          # AI/ML education and skill building
Learning.General     # General programming and tech skills

# Portfolio and Career
Portfolio.AI         # AI engineering portfolio projects
Portfolio.Web        # Web development projects
Career.Development   # Job search, networking, certifications

# Personal Systems
Personal.Rituals     # Daily habits and foundational practices
Personal.Finance     # Financial automation and management
Personal.Life        # Personal commitments and life management

# Work and Professional
Work.Domo           # Current job responsibilities
Work.Schedule       # Work time blocks and commitments

# Administration
Admin.Planning      # Planning and organization tasks
Admin.Maintenance   # System and life maintenance
Admin.Communication # Email, calendar, correspondence
```

### Priority Guidelines
- **H (High)**: AI skill building, portfolio work, critical deadlines
- **M (Medium)**: Routine tasks, admin work, maintenance
- **L (Low)**: Nice-to-have, future planning, optional activities

## Advisory Principles

### 1. Context-Driven Intelligence
- **Time Awareness**: Suggests appropriate tasks for current time and energy
- **Calendar Integration**: Respects existing commitments and finds optimal windows
- **Energy Matching**: Aligns cognitive load with available mental energy
- **Goal Alignment**: Connects daily tasks to larger objectives

### 2. Transparent Reasoning
Every suggestion includes:
- **Why**: Clear reasoning for the recommendation
- **When**: Optimal timing and duration estimates
- **How**: Exact commands for easy implementation
- **Impact**: Connection to larger goals and outcomes

### 3. Adaptive Learning
The system improves over time by:
- **Tracking**: Which suggestions you implement
- **Pattern Recognition**: Learning your preferences and rhythms
- **Timing Optimization**: Improving when to suggest what types of tasks
- **Goal Progress**: Adjusting recommendations based on advancement

## Migration from Automated System

### Deprecated Components
These have been moved to `/deprecated/`:
- `scripts/taskwarrior-ritual-sync.js` - Automated ritual-to-task creation
- `.claude/commands/taskwarrior-ritual-sync.md` - Sync command documentation

### New Workflow
1. **Use check-ins** to get context-aware task suggestions
2. **Copy/paste** exact TaskWarrior commands for tasks you want
3. **Modify** suggestions to fit your specific needs
4. **Track** completion as normal with TaskWarrior
5. **Provide feedback** by using or ignoring suggestions (system learns)

## Benefits of Advisory Approach

### Maintains Human Agency
- **Decision Control**: You choose which tasks to create
- **Customization**: Modify suggestions to fit your exact needs
- **Workload Management**: Prevent task overload by selective implementation

### Intelligent Assistance
- **Context Awareness**: Suggestions consider your full situation
- **Goal Alignment**: Tasks connect to your larger objectives
- **Timing Optimization**: Recommendations match your energy and schedule

### System Cleanliness
- **No Clutter**: Only tasks you actually want get created
- **Relevant Tasks**: Suggestions are contextually appropriate
- **Quality Over Quantity**: Focus on meaningful, actionable items

### Learning and Adaptation
- **Pattern Recognition**: System learns your preferences
- **Improved Suggestions**: Recommendations get better over time
- **Personalization**: Adapts to your unique workflow and goals

This advisory approach provides the intelligence of automation while preserving the human decision-making that's crucial for effective task management.