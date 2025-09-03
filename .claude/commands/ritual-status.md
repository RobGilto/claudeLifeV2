# Ritual Status Command V2

Show current ritual status using the advanced V2 system with UUID tracking and complex frequency patterns.

## Usage
```bash
/ritual-status [date]
```

## Parameters
- `date` (optional): Date to check status for (YYYY-MM-DD format). Defaults to today.

## Process

1. **Load V2 ritual data**:
   ```bash
   # Use V2 CLI system for comprehensive status
   node scripts/ritual-cli-v2.js status --date=[date]
   ```

2. **Display comprehensive ritual overview with UUID tracking and advanced patterns**

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

## V2 Integration Features

- **UUID-Based Tracking**: Each ritual has unique identifier for cross-system linking
- **Complex Frequency Patterns**: Supports daily, weekly, monthly, quarterly patterns
- **Calendar Sync Ready**: Shows ritual calendar sync status
- **Advanced Availability**: Enhanced time window calculation with context
- **Cross-System Linking**: Integration with TaskWarrior and planning systems

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