# Ritual Status Command

Show current ritual status, completions, and upcoming schedule.

## Usage
```bash
/ritual-status [date]
```

## Parameters
- `date` (optional): Date to check status for (YYYY-MM-DD format). Defaults to today.

## What it does

1. **Current Status**: Shows active rituals for the specified date
2. **Completion Tracking**: Displays completion status and current streaks
3. **Schedule Overview**: Shows today's ritual schedule with times
4. **Available Time**: Calculates and shows available time windows
5. **Next Actions**: Identifies incomplete rituals and suggests next steps

## Output Format

```
📊 Ritual Status - 2025-08-30 (friday)
===========================================

🔄 Active Rituals Today: 3/5
   ✅ Boot.dev Daily Practice (foundational)
      📍 18:00 - 19:00 (60min)
      📈 Streak: 3 | Total: 15

   ⏳ Morning Exercise (foundational)  
      📍 07:00 - 07:30 (30min)
      📈 Streak: 0 | Total: 8

   ⏳ Work Schedule (work)
      📍 09:00 - 17:00 (480min)
      📈 Not tracked

⏰ Available Time: 4h 30m
   Windows: 3

   Available periods:
   🟢 07:30 - 09:00 (1h 30m) - morning
   🟢 17:00 - 18:00 (1h) - afternoon  
   🟢 19:00 - 22:00 (3h) - evening

   Blocked periods:
   🔄 07:00 - 07:30 - Morning Exercise
   🚫 09:00 - 17:00 - Work Schedule
   🔄 18:00 - 19:00 - Boot.dev Daily Practice
```

## Integration

- Calls `ritual-manager.js` for ritual data and availability calculation
- Shows completion data from ritual tracking system
- Calculates available time windows for planning
- Identifies conflicts and scheduling issues

## Related Commands

- `/ritual-add` - Add new ritual
- `/ritual-block` - Add temporary time blocks
- `/plan-day-aware` - Create ritual-aware daily plan
- `/executive-function` - Weekly ritual analysis

## Examples

```bash
/ritual-status                    # Today's status
/ritual-status 2025-08-31        # Specific date
```