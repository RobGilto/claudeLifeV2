# Plan Day Aware Command

Create ritual-aware daily plans that respect your recurring commitments and available time.

## Usage
```bash
/plan-day-aware [date]
```

## Parameters
- `date` (optional): Date to plan for (YYYY-MM-DD format). Defaults to today.

## What it does

Creates intelligent daily plans by:

1. **Ritual Analysis**: Loading all rituals and commitments for the target date
2. **Availability Calculation**: Finding actual available time windows
3. **Conflict Prevention**: Ensuring no double-booking with rituals
4. **Smart Block Generation**: Creating realistic time blocks based on available windows
5. **Activity Planning**: Interactive definition of activities for each block
6. **Integration Setup**: Preparing data for TaskWarrior and Calendar sync

## Planning Process

### 1. Ritual Overview
```
🗓️ Ritual-Aware Daily Planning
📅 Date: 2025-08-30
📊 Day: friday | Rituals: 3 | Available: 4h 30m

🔄 Ritual Schedule:
   📍 07:00 - 07:30: Morning Exercise (foundational)
   📍 09:00 - 17:00: Work Schedule (work)  
   📍 18:00 - 19:00: Boot.dev Practice (foundational)
```

### 2. Available Windows
```
⏰ Available Time Windows:
   1. 07:30 - 09:00 (1h 30m) - morning
   2. 17:00 - 18:00 (1h) - afternoon
   3. 19:00 - 22:00 (3h) - evening
```

### 3. Smart Block Suggestions
```
🎯 Suggested Time Blocks (3 blocks):
   07:30 - 09:00 (90min) - deep-work: Morning Deep Work Session
   17:00 - 18:00 (60min) - research: Transition & Planning
   19:00 - 20:30 (90min) - project: Evening Project Work
```

### 4. Activity Definition
```
--- Morning Deep Work Session (07:30 - 09:00) ---
Context: morning | Duration: 90 minutes
Activity description: AI learning and coding practice
Alignment with larger goals: 2026 AI engineer transformation
✅ Added: AI learning and coding practice
```

## Smart Features

**Window Analysis**: 
- Large windows (90+ min) → Deep work blocks
- Medium windows (45-89 min) → Focused research/learning
- Small windows (<45 min) → Admin and quick tasks

**Context Awareness**:
- Morning: Deep work and challenging tasks
- Afternoon: Research and planning  
- Evening: Learning and skill practice

**ADD Optimization**:
- Maximum 5 time blocks per day
- 15-minute buffers between blocks
- Clear context and purpose for each block

## Conflict Prevention

The system prevents conflicts by:
- Loading all active rituals for the date
- Calculating exact blocked time periods
- Only suggesting time in available windows
- Warning about very limited availability
- Checking flexibility of conflicting rituals

## Output Integration

Creates multiple output files:

**Planning Data** (`planning/data/day-YYYY-MM-DD.json`):
```json
{
  "ritualAware": true,
  "ritualStatus": { ... },
  "timeBlocks": [ ... ],
  "objectives": [ ... ],
  "metadata": {
    "availableMinutes": 270,
    "availableWindows": 3,
    "ritualsToday": 3
  }
}
```

**Execution Data** (`planning/execution/execution-YYYY-MM-DD.json`):
- Ready for taskmaster integration
- Compatible with TaskWarrior task creation
- Prepared for calendar sync

## Availability Scenarios

**High Availability (4+ hours)**:
```
✅ Excellent availability - can plan multiple focused work blocks
💪 Recommend: Use large windows for deep work or major project tasks
```

**Medium Availability (2-4 hours)**:
```  
👍 Good availability - plan 2-3 focused blocks
📚 Recommend: Use medium windows for learning or focused research
```

**Low Availability (<2 hours)**:
```
⚠️ Limited availability - focus on 1-2 priority tasks
⚡ Recommend: Use small windows for admin tasks, email, or quick reviews
```

**Very Low Availability (<1 hour)**:
```
🚨 Very limited availability - consider light admin tasks only
❌ No available time windows for planning.
```

## Daily Objectives

Supports up to 3 daily objectives:
```
🎯 Daily Objectives (max 3 for focus):
Objective 1: Complete AI portfolio project setup
Objective 2: Finish boot.dev Python modules 
Objective 3: Update LinkedIn profile with new skills
```

## Integration Options

After plan creation:
```
💡 Integration Options:
   • Add to Google Calendar: node scripts/calendar-sync.cjs
   • Create TaskWarrior tasks: node scripts/fractal-planner-taskwarrior.js
   • Start execution: node scripts/taskmaster.js (when created)
```

## Plan Summary

```
✅ Ritual-aware daily plan created successfully!
📁 Saved to: planning/data/day-2025-08-30.json
🔄 Integrated with 3 rituals
⏰ Using 3 available time blocks
📊 Planned time: 3h 30m of 4h 30m available
```

## Conflict Resolution

If conflicts exist with existing plans:
```bash
/check-conflicts [date]  # Identify specific conflicts
```

The system will show:
- Exact conflict times
- Whether rituals are flexible
- Severity (warning vs error)
- Recommendations for resolution

## Related Commands

- `/ritual-status` - Check current ritual schedule
- `/check-conflicts` - Verify plan compatibility
- `/availability` - Detailed availability analysis
- `/suggest-blocks` - Get time block suggestions only

## Best Practices

1. **Setup Rituals First**: Define your regular schedule before planning
2. **Plan Ahead**: Works better for future dates with full availability
3. **Respect Energy**: Morning for deep work, evening for learning
4. **Stay Realistic**: System suggests blocks based on actual available time
5. **Regular Review**: Check conflicts after any ritual changes