# Ritual Add Command

Add a new recurring commitment or ritual to the system.

## Usage
```bash
/ritual-add
```

## What it does

Interactive ritual creation that guides you through:

1. **Basic Information**: Name, type, frequency, description
2. **Time Scheduling**: Define when the ritual occurs
3. **Flexibility Options**: Set whether timing can be adjusted
4. **Tracking Settings**: Configure completion tracking and streaks
5. **Priority Level**: Set importance for conflict resolution

## Ritual Types

- **work**: Work schedules, meetings, blocked work time
- **foundational**: Daily practices (boot.dev, AI school, exercise)  
- **life**: Personal commitments (family time, appointments)
- **maintenance**: Regular tasks (shopping, cleaning, admin)

## Frequency Options

- **daily**: Same time every day
- **weekly**: Specific days of the week
- **custom**: Custom patterns (future feature)

## Interactive Flow

```
🔄 Adding New Ritual
===================

Ritual name: Boot.dev Daily Practice
Type (work/foundational/life/maintenance): foundational
Frequency (daily/weekly/custom): daily
Description: 1 hour of Python learning and coding practice

⏰ Define Time Blocks:
Start time (HH:MM): 18:00
Duration (minutes): 60
Flexible timing? (y/n): n

Priority (high/medium/low): high
Track completions? (y/n): y

✅ Ritual created successfully!
   ID: 1693402341234
   Name: Boot.dev Daily Practice
   Type: foundational
   Time blocks: 1
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