# Task and Productivity Integration

## TaskWarrior Integration Protocol
Task management integration with TaskWarrior for comprehensive task tracking and execution.

### `/tasks` or `/task-list` Command
- Lists all pending tasks with priority and project information
- Shows due dates, tags, and task status
- Filters available by project and tags
- Quick overview of current task load

### `/task-add` Command
- Interactive task creation with guided prompts
- Project assignment and tag management
- Priority setting and due date scheduling
- Automatic integration with planning system

### `/task-done` Command
- Mark tasks as completed with task identifier
- Updates task status in TaskWarrior database
- Automatic victory detection for completed tasks
- Progress tracking and completion analytics

### `/task-abandon` Command
- Interactive task abandonment with insight capture
- Prompts for abandonment reason and learning opportunities
- Records abandonment insights for daily review integration
- Helps identify patterns in task abandonment for process improvement
- Saves insights to `planning/execution/task-abandonment-YYYY-MM-DD.json`
- Non-judgmental approach focused on system optimization

## Pomodoro Protocol
Focus and productivity management using the Pomodoro Technique integrated with TaskWarrior.

### `/pomodoro start [task_id]` Command
- Starts a 25-minute pomodoro session with optional TaskWarrior task association
- Automatically starts/stops task timers in TaskWarrior
- Provides live countdown with visual progress
- Increments daily pomodoro counter with completion tracking
- Suggests appropriate break types based on session count

### `/pomodoro start-no-task` Command
- Starts pomodoro session without task association
- Perfect for general focus work, reading, or planning sessions

### `/pomodoro break [type]` Command
- Manages break periods based on pomodoro count
- Auto-selects short (5min) or long (15min) breaks
- Enforces healthy work-break cycles for ADD optimization

### `/pomodoro status` Command
- Shows daily pomodoro progress and statistics
- Current streak tracking and focus time analytics
- TaskWarrior task summary and break recommendations
- Integration with performance tracking systems

### `/pomodoro reset` Command
- Resets daily pomodoro counter
- Useful for testing or counter synchronization

## Integration Features
- **ADD Optimization**: Clear time boundaries with visual progress tracking
- **TaskWarrior Sync**: Automatic task starting/stopping with time logging
- **Victory Detection**: Automatic victory logging for completed focus sessions
- **Daily Checkin**: Pomodoro data feeds into morning/evening reflections
- **Calendar Sync**: Optional Google Calendar event creation for focus blocks