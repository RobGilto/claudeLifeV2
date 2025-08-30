# Ritual Block Command

Add temporary time blocks for one-off events, meetings, or unavailable periods.

## Usage
```bash
/ritual-block
```

## What it does

Creates temporary time blocks that:
- Block specific time periods from planning
- Override regular ritual schedules if needed
- Handle exceptions like meetings, appointments, sick days
- Integrate with availability calculations
- Clear automatically or manually after the date

## Interactive Flow

```
🚫 Add Temporary Time Block
============================

Date (YYYY-MM-DD) or press enter for today: 2025-08-31
Start time (HH:MM): 14:00
End time (HH:MM): 15:30
Reason: Doctor appointment

🚫 Added time block: 2025-08-31 14:00-15:30 (Doctor appointment)
```

## Common Use Cases

**Meetings & Appointments**:
- Doctor/dentist appointments
- Work meetings outside normal schedule
- Client calls or interviews
- Service appointments (plumber, etc.)

**Personal Events**:
- Family gatherings
- Social commitments  
- Travel time
- Special occasions

**Health & Recovery**:
- Sick days (block entire day)
- Recovery time after medical procedures
- Mental health breaks
- Medication schedules

**Work Exceptions**:
- Extended work hours
- Emergency work calls
- Overtime periods
- Work travel

## Features

- **Date Flexibility**: Can block any future date
- **Automatic Integration**: Immediately affects availability calculations
- **Conflict Detection**: Shows how blocks affect existing plans
- **Cache Management**: Automatically clears relevant availability cache
- **Planning Integration**: Blocked time excluded from plan generation

## Effect on Planning

When you add a time block:

1. **Availability Calculation**: Time becomes unavailable for planning
2. **Conflict Detection**: Existing plans checked for conflicts
3. **Window Adjustment**: Available time windows recalculated
4. **Cache Clearing**: Stored availability data refreshed

## Example Scenarios

**Same-Day Emergency**:
```bash
/ritual-block
Date: [enter for today]
Start: 10:00
End: 12:00  
Reason: Emergency dental appointment
```

**Future Meeting**:
```bash
/ritual-block  
Date: 2025-09-15
Start: 14:00
End: 16:00
Reason: Important client meeting
```

**Sick Day**:
```bash
/ritual-block
Date: [enter for today] 
Start: 07:00
End: 22:00
Reason: Sick day - rest and recovery
```

## Integration with Other Systems

- **Planning**: Ritual-aware planner respects blocked times
- **Calendar**: Can be synced to Google Calendar  
- **TaskWarrior**: Tasks not scheduled during blocked periods
- **Availability**: Shows in detailed availability analysis

## Management

**View Blocked Times**:
```bash
/ritual-status [date]  # Shows blocked periods in timeline
```

**Check Conflicts**:
```bash
/check-conflicts [date]  # Identifies plan conflicts with blocks
```

## Data Storage

Blocks are stored in:
- `rituals/blocked-times.json`
- Includes creation timestamp
- Active/inactive status for management
- Integration with availability cache system

## Related Commands

- `/ritual-status` - View current schedule including blocks
- `/plan-day-aware` - Create plans that respect blocks
- `/check-conflicts` - Identify conflicts with existing plans
- `/availability` - See detailed time analysis including blocks

## Tips

- **Block Early**: Add known appointments as soon as scheduled
- **Be Specific**: Clear reasons help with later review
- **Buffer Time**: Include travel/preparation time in blocks
- **Recovery Time**: Block buffer time after demanding events