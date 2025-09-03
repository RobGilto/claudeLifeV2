# Ritual Add Command V2

Add a new recurring commitment or ritual using the advanced V2 system with complex frequency patterns and UUID-based tracking.

## Usage
```bash
/ritual-add [natural language command]
```

## Examples
```bash
/ritual-add "Morning Exercise" daily at 07:00 for 30 minutes foundational
/ritual-add "Team Meeting" weekly on monday at 10:00 for 60 minutes work
/ritual-add "Monthly Review" monthly on 1st at 19:00 for 120 minutes foundational  
/ritual-add "Quarterly Planning" quarterly first monday at 09:00 for 4 hours foundational
/ritual-add Boot.dev Practice --daily --time=18:00 --duration=60 --type=foundational
```

## What it does

Advanced ritual creation with natural language parsing and complex scheduling:

1. **Natural Language Parsing**: Parse complex frequency patterns from natural language
2. **UUID-Based System**: Generate unique identifiers for cross-system tracking
3. **Complex Frequency Patterns**: Support daily, interval, weekly, monthly, quarterly patterns
4. **Calendar Integration**: Prepare for selective calendar synchronization
5. **Cross-System Linking**: Enable integration with TaskWarrior and planning systems

## Ritual Types

- **work**: Work schedules, meetings, blocked work time
- **foundational**: Daily practices (boot.dev, AI school, exercise)  
- **life**: Personal commitments (family time, appointments)
- **maintenance**: Regular tasks (shopping, cleaning, admin)

## Frequency Patterns V2

**Daily Patterns:**
- `daily` - Every day
- `every other day` - Every 2 days  
- `every 3 days` - Every N days (interval pattern)

**Weekly Patterns:**
- `weekly on monday,wednesday,friday` - Specific weekdays
- `weekdays` - Monday through Friday
- `weekend` - Saturday and Sunday

**Monthly Patterns:**
- `monthly on 1st` - First day of month
- `monthly on 15th` - Specific date
- `monthly on last` - Last day of month
- `monthly first monday` - First Monday of month
- `monthly second tuesday` - Second Tuesday of month

**Quarterly Patterns:**
- `quarterly first month` - First month of each quarter
- `quarterly on 1st,15th` - Specific days in quarter months
- `quarterly first monday` - First Monday of each quarter

## Process

1. **Parse natural language or use interactive mode**:
   ```bash
   # Use V2 CLI system with advanced parsing
   node scripts/ritual-cli-v2.js add "[natural language command]"
   ```

2. **Display parsed configuration**:
   ```
   🔄 Creating New Ritual V2
   ========================
   
   📝 Name: [extracted name]
   🔁 Frequency: [parsed frequency pattern with details]
   ⏰ Time: [start time] - [end time] ([duration] minutes)
   🏷️ Type: [foundational|work|life|maintenance]
   📊 Priority: [high|medium|low]
   🎯 UUID: [generated UUID]
   
   ## Frequency Details:
   [Show exactly when this ritual will occur - next few instances]
   ```

3. **Create ritual with V2 system**:
   ```
   ✅ Ritual Created Successfully!
   
   📋 Ritual Details:
   UUID: [full-uuid]
   Name: [ritual name]
   Type: [type] | Priority: [priority]
   Frequency: [frequency description]
   Time Blocks: [count]
   
   ## Integration Status:
   🔄 Ritual system: ✅ Created
   📅 Calendar sync: ⏳ Ready (use /ritual-sync)
   📋 TaskWarrior: ⏳ Ready (use /task-add when executing)
   ```

## Features

- **Conflict Detection**: Warns about conflicts with existing rituals
- **Flexible Scheduling**: Allows rituals that can be moved if needed
- **Completion Tracking**: Optional streak and completion tracking
- **Priority Levels**: For conflict resolution and planning
- **Time Block Definition**: Supports multiple time blocks per ritual

## Weekly Scheduling

For weekly rituals, define specific days:

```
Select days (comma-separated): monday,tuesday,wednesday,thursday,friday
monday start time (HH:MM): 09:00
monday duration (minutes): 480
monday flexible? (y/n): n
...continues for each selected day
```

## Integration

- Updates ritual definitions in `rituals/ritual-definitions.json`
- Clears availability cache to reflect changes
- Integrates with planning system immediately
- Available for ritual-aware planning commands

## After Creation

The new ritual will:
- Block time in daily availability calculations
- Appear in ritual status displays
- Be considered in conflict detection
- Enable completion tracking if configured

## Related Commands

- `/ritual-status` - View current rituals and schedule
- `/ritual-block` - Add temporary time blocks
- `/plan-day-aware` - Create plans that respect rituals

## Examples

Common ritual types to add:

**Work Schedule**:
- Name: "Work Schedule" 
- Type: work
- Frequency: weekly (monday-friday)
- Time: 09:00-17:00, not flexible

**Daily Learning**:
- Name: "Boot.dev Practice"
- Type: foundational  
- Frequency: daily
- Time: 18:00-19:00, not flexible

**Exercise**:
- Name: "Morning Exercise"
- Type: foundational
- Frequency: daily
- Time: 07:00-07:30, flexible

**Family Time**:
- Name: "Family Dinner"
- Type: life
- Frequency: weekly (sunday)
- Time: 18:00-19:30, flexible