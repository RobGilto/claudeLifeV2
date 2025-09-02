# Pomodoro Command

Focus and productivity management using the Pomodoro Technique integrated with TaskWarrior.

## Usage
```bash
/pomodoro [command] [options]
```

## Commands

### Start Pomodoro
```bash
/pomodoro start [task_id]
```
Starts a 25-minute pomodoro session. If task_id is provided, associates the pomodoro with that specific TaskWarrior task. If no task_id is provided, will prompt to select from active tasks or start without a task.

**Process:**
1. Checks for active TaskWarrior tasks if no task_id specified
2. Starts the task timer in TaskWarrior (if task-based)
3. Runs 25-minute countdown timer with visual progress
4. Plays notification sound when complete
5. Stops task timer and adds annotation to TaskWarrior task
6. Increments daily pomodoro counter
7. Suggests appropriate break type based on completion count

**Example Output:**
```
🍅 Starting Pomodoro for task: Implement user authentication
Duration: 25 minutes

⏰ Time remaining: 24:58 
[Timer continues with live countdown]

🔔 Pomodoro Complete! Time for a break! (Pomodoros today: 3)
💡 Take a short break!
```

### Start Without Task
```bash
/pomodoro start-no-task
```
Starts a 25-minute pomodoro session without associating it with a specific TaskWarrior task. Perfect for general focus work, reading, or planning.

### Interactive Start
```bash
/pomodoro start-interactive
```
Provides interactive menu to:
- Start with active task
- Select task from list
- Start without task
- View current statistics

### Break Management
```bash
/pomodoro break [type]
```
Manages break periods based on pomodoro count:
- **Short Break**: 5 minutes (after 1-3 pomodoros)
- **Long Break**: 15 minutes (after every 4th pomodoro)
- **Auto**: Automatically selects appropriate break type

**Break Types:**
- `short` - 5-minute break
- `long` - 15-minute break  
- `auto` - System selects based on current pomodoro count

### Status and Statistics
```bash
/pomodoro status
```
Shows comprehensive pomodoro statistics and current session information:
- Today's completed pomodoros
- Current streak information
- TaskWarrior task summary
- Break recommendations
- Focus session analytics

**Example Output:**
```
📊 POMODORO STATUS - 2025-08-30
═══════════════════════════════════

🍅 Today's Progress: 5 pomodoros completed
🔥 Current streak: 3 days
⏰ Total focus time: 2h 5m
🎯 Next milestone: Long break recommended

📋 Recent Pomodoros:
  ✅ 14:30 - Implement user auth (25m)
  ✅ 13:00 - Code review tasks (25m)
  ✅ 11:30 - Database optimization (25m)

💡 Suggestions:
  🌴 Time for a long break (15 minutes)
  📝 3 tasks ready for next pomodoro
```

### Reset Counter
```bash
/pomodoro reset
```
Resets the daily pomodoro counter to zero. Useful for testing or if counter gets out of sync.

### Configuration
```bash
/pomodoro config [setting] [value]
```
View or modify pomodoro settings:
- `duration` - Pomodoro length (default: 25 minutes)
- `short-break` - Short break length (default: 5 minutes)  
- `long-break` - Long break length (default: 15 minutes)
- `long-break-interval` - Pomodoros until long break (default: 4)

## TaskWarrior Integration

### Automatic Task Management
When starting a pomodoro with a task:
1. **Task Starting**: `task <id> start` automatically called
2. **Time Tracking**: Task time is tracked during pomodoro
3. **Task Stopping**: `task <id> stop` called when pomodoro completes
4. **Annotations**: "Completed pomodoro" annotation added to task
5. **Progress Updates**: Task progress reflected in TaskWarrior

### Task Selection
The system intelligently selects tasks:
- **Active Tasks First**: Currently started tasks get priority
- **Pending Tasks**: Shows list of pending tasks for selection
- **Project Filtering**: Can filter by project for focused work sessions
- **Priority Awareness**: High-priority tasks highlighted

### Integration Features
- **Task Context**: Pomodoro timer shows task description and context
- **Progress Tracking**: Links pomodoro completion to task advancement
- **Time Logging**: Accurate time tracking for task analytics
- **Project Momentum**: Groups pomodoros by project for sprint tracking

## ADD Optimization Features

### Focus Management
- **Clear Time Boundaries**: Definitive 25-minute work blocks
- **Visual Progress**: Live countdown prevents time anxiety
- **Interrupt Handling**: Graceful handling of unexpected interruptions
- **Break Enforcement**: Automatic break suggestions prevent burnout

### Executive Function Support
- **External Structure**: Timer provides external time management
- **Task Chunking**: Large tasks broken into pomodoro-sized chunks
- **Progress Visibility**: Clear progress indicators and completion tracking
- **Habit Stacking**: Links focus work to existing TaskWarrior habits

### Sensory Features
- **Audio Notifications**: Sound alerts for start/end of sessions
- **Visual Feedback**: Progress bars and status indicators
- **Gentle Transitions**: Grace periods between work and break
- **Customizable Alerts**: Multiple notification methods

## System Integration

### Daily Checkin Integration
Pomodoro completion automatically feeds into:
- **Morning Checkin**: Shows yesterday's pomodoro count for momentum tracking
- **Evening Checkin**: Includes pomodoro data in day reflection
- **Weekly Reviews**: Aggregates pomodoro data for productivity analysis

### Victory Tracking
Automatic victory detection for:
- **Focus Achievements**: Completing difficult focus sessions
- **Consistency Wins**: Multi-day pomodoro streaks
- **Task Completion**: Major tasks completed through pomodoro sessions
- **Break Discipline**: Taking appropriate breaks without skipping

### Performance Analytics
Data feeds into:
- **Weekly Reviews**: Focus time and productivity correlation
- **Skill Tracking**: Practice time linked to skill development
- **Energy Patterns**: Peak focus times and optimal scheduling
- **Project Velocity**: Pomodoro-to-completion ratios by project type

## Implementation Details

### Script Execution
The command interfaces with `/home/robert/Areas/Scripts/taskwarrior-pomodoro.sh` through:
1. **Direct Execution**: Runs bash script with appropriate parameters
2. **Parameter Passing**: Converts command arguments to script options
3. **Output Processing**: Captures and formats script output for user
4. **Error Handling**: Graceful error handling and user feedback

### File System Integration
- **Counter Persistence**: `~/.pomodoro_count` maintains daily counter
- **Configuration**: Settings stored in TaskWarrior configuration
- **Log Integration**: Pomodoro data logged to `logs/pomodoro-YYYY-MM-DD.log`
- **Sync Data**: Integration data stored in `planning/execution/`

### Calendar Integration
Optional integration with Google Calendar:
- **Block Scheduling**: Create calendar events for pomodoro sessions
- **Break Reminders**: Calendar reminders for break periods
- **Focus Time Protection**: Block meeting scheduling during focus sessions
- **Weekly Planning**: Schedule pomodoro blocks in advance

## Examples

### Daily Focus Session
```bash
# Start day with task review
/pomodoro status

# Begin focused work
/pomodoro start 42  # Start with task ID 42

# Take recommended break
/pomodoro break auto

# Continue with next task
/pomodoro start-interactive  # Select from menu
```

### Project Sprint
```bash
# Focus on specific project tasks
/pomodoro start  # Will show project tasks for selection
# Complete 25-minute session
/pomodoro break short
# Continue with related task
/pomodoro start  # Continue project momentum
```

### Deep Work Block
```bash
# Plan 2-hour deep work session (4 pomodoros)
/pomodoro start-no-task  # Research/planning phase
/pomodoro break short
/pomodoro start 43      # Implementation task
/pomodoro break short  
/pomodoro start 43      # Continue implementation
/pomodoro break long    # Long break after 4 pomodoros
```

This creates a comprehensive focus and productivity system that integrates seamlessly with your existing TaskWarrior workflow while providing ADD-optimized time management features.