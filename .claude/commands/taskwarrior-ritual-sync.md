# TaskWarrior Ritual Sync Command

Sync rituals and ritual-aware plans with TaskWarrior for task-level execution and tracking.

## Usage
```bash
/taskwarrior-ritual-sync [command] [args]
```

## Commands

### Daily Sync
```bash
/taskwarrior-ritual-sync sync-daily [date]
```
Creates TaskWarrior tasks for all rituals scheduled on the specified date (defaults to today).

**What it does:**
- Loads all active rituals for the target date
- Creates TaskWarrior tasks for each ritual instance
- Adds metadata (ritual ID, time, duration) as annotations
- Organizes tasks by project (Work.Schedule, Personal.Rituals, etc.)
- Prevents duplicate task creation
- Records sync history for tracking

**Example Output:**
```
📋 Syncing Daily Rituals to TaskWarrior - 2025-08-30
==================================================
📊 Found 3 rituals for 2025-08-30

✅ Task Creation Summary:
   📝 Created: 3 tasks
   ⏭️  Skipped: 0 tasks

📋 Created Tasks:
   🔹 Boot.dev Practice (18:00-19:00)
      Task ID: 42 | Project: Personal.Rituals
   🔹 Morning Exercise (07:00-07:30)
      Task ID: 43 | Project: Personal.Rituals
   🔹 Work Schedule (09:00-17:00)
      Task ID: 44 | Project: Work.Schedule
```

### Weekly Sync
```bash
/taskwarrior-ritual-sync sync-weekly [week]
```
Batch creates tasks for an entire week of rituals (format: 2025-W35).

### Completion Updates
```bash
/taskwarrior-ritual-sync update-completions [date]
```
Syncs completed TaskWarrior tasks back to ritual completion tracking.

**Process:**
1. Finds completed ritual tasks for the date
2. Extracts ritual ID from task annotations
3. Marks corresponding rituals as complete
4. Updates streak and completion history
5. Provides completion summary

### Project Setup
```bash
/taskwarrior-ritual-sync setup-projects
```
Creates TaskWarrior projects for organizing ritual tasks.

**Projects Created:**
- `Work.Schedule` - Work schedules and blocked work time
- `Personal.Rituals` - Foundational daily practices  
- `Personal.Life` - Personal commitments and life activities
- `Personal.Maintenance` - Regular maintenance and admin tasks

### Status Overview
```bash
/taskwarrior-ritual-sync status
```
Shows comprehensive sync status and task summary.

**Information Displayed:**
- Total ritual tasks by status (pending/completed/deleted)
- Tasks organized by project
- Today's ritual tasks with completion status
- Sync history summary
- Last sync date

### Cleanup
```bash
/taskwarrior-ritual-sync cleanup [days]
```
Removes old completed ritual tasks (default: 30 days old).

## TaskWarrior Integration Features

### Task Organization
- **Projects**: Tasks organized by ritual type
- **Tags**: Multiple tags for filtering (+ritual, +foundational, +date)
- **Priority**: Maps ritual priority to TaskWarrior priority (H/M/L)
- **Scheduling**: Tasks get proper due dates and scheduled dates
- **Metadata**: Rich annotations with ritual details

### Task Example
```
ID: 42
Description: Boot.dev Practice (18:00-19:00)
Project: Personal.Rituals
Priority: H
Due: 2025-08-30
Scheduled: 2025-08-30
Tags: +ritual +foundational +20250830 +fixed
Annotations:
  - Ritual ID: 1693402341234
  - Time: 18:00-19:00
  - Duration: 60 minutes
  - Description: 1 hour of Python learning and coding practice
```

### Workflow Integration

**Complete Ritual-TaskWarrior Loop:**
1. **Define Rituals**: `node scripts/ritual-manager.js add`
2. **Sync to Tasks**: `node scripts/taskwarrior-ritual-sync.js sync-daily`
3. **Work on Tasks**: `task next`
4. **Complete Tasks**: `task <id> done`
5. **Update Rituals**: `node scripts/taskwarrior-ritual-sync.js update-completions`

### TaskWarrior Commands for Rituals

**View Ritual Tasks:**
```bash
task +ritual list                    # All ritual tasks
task project:Personal.Rituals list   # Foundational rituals only
task +ritual +$(date +%Y%m%d) list   # Today's rituals
task +ritual status:pending list     # Pending ritual tasks
```

**Filter by Ritual Type:**
```bash
task +foundational list              # Daily practices
task +work list                      # Work schedules
task +life list                      # Personal commitments
```

**Advanced Queries:**
```bash
task +ritual due:today list          # Due today
task +ritual scheduled:today list    # Scheduled for today
task project:Personal.Rituals +flexible list  # Flexible timing rituals
```

## Benefits

### Executive Function Support
- **External Structure**: Rituals become concrete, actionable tasks
- **Progress Tracking**: Visual progress through TaskWarrior interface
- **Pattern Recognition**: Data for analysis and optimization
- **Accountability**: Clear completion tracking and history

### ADD Optimization
- **Familiar Interface**: Uses existing TaskWarrior workflow
- **Context Switching**: Easy to switch between ritual and project tasks
- **Priority Management**: Ritual importance reflected in task priority
- **Completion Satisfaction**: Dopamine hits from completing tasks

### System Integration
- **Bidirectional Sync**: Tasks → completions → ritual tracking
- **Planning Integration**: Works with ritual-aware planning
- **Data Consistency**: Single source of truth with sync validation
- **Flexible Execution**: Choose task interface or ritual interface

## Error Handling

The system includes robust error handling:
- **Duplicate Prevention**: Checks for existing tasks before creation
- **Sync Recovery**: Logs errors and sync history for troubleshooting
- **Data Validation**: Verifies ritual IDs and task metadata
- **Graceful Degradation**: Continues processing if individual tasks fail

## Examples

### Daily Morning Routine
```bash
# Setup rituals once
/ritual-add  # Define morning exercise, boot.dev, etc.

# Daily sync (can be automated)
/taskwarrior-ritual-sync sync-daily

# Work with TaskWarrior
task next
task 42 start    # Start Boot.dev practice
task 42 done     # Complete when finished

# Evening sync back
/taskwarrior-ritual-sync update-completions
```

### Weekly Planning
```bash
# Sunday planning session
/taskwarrior-ritual-sync sync-weekly 2025-W36

# Review week
task +ritual list
task project:Personal.Rituals list

# End of week analysis
/executive-function analyze-week
```

This creates a complete executive function system where your rituals become actionable tasks in TaskWarrior while maintaining ritual completion tracking and analysis.