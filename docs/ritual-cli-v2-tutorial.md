# Ritual CLI V2 Tutorial

## Overview
The Ritual CLI V2 system provides advanced ritual management with UUID-based architecture, complex frequency patterns, and selective calendar synchronization. This tutorial covers all commands and usage patterns.

## Quick Start

### Basic Commands
```bash
# Check system status
node scripts/ritual-cli-v2.cjs status

# Add a simple daily ritual
node scripts/ritual-cli-v2.cjs add --name "Morning Exercise" --type foundational --frequency daily --start-time "07:00" --duration 30

# List all active rituals
node scripts/ritual-cli-v2.cjs list --active

# Sync rituals to calendar for today
node scripts/ritual-cli-v2.cjs sync --period day
```

## Command Reference

### Status Commands

#### Check Overall Status
```bash
node scripts/ritual-cli-v2.cjs status
# Shows: total rituals, active/inactive count, recent activity

node scripts/ritual-cli-v2.cjs status --date 2025-09-03
# Shows rituals scheduled for specific date
```

### Ritual Management

#### Adding Rituals

**Simple Daily Ritual:**
```bash
node scripts/ritual-cli-v2.cjs add \
  --name "Boot.dev Practice" \
  --type foundational \
  --frequency daily \
  --start-time "18:00" \
  --duration 60
```

**Weekly Ritual with Specific Days:**
```bash
node scripts/ritual-cli-v2.cjs add \
  --name "Team Meeting" \
  --type work \
  --frequency "weekly on monday,wednesday" \
  --start-time "10:00" \
  --duration 60
```

**Monthly Ritual:**
```bash
node scripts/ritual-cli-v2.cjs add \
  --name "Monthly Review" \
  --type foundational \
  --frequency "monthly on 1st" \
  --start-time "09:00" \
  --duration 120
```

**Quarterly Ritual:**
```bash
node scripts/ritual-cli-v2.cjs add \
  --name "Quarterly Planning" \
  --type foundational \
  --frequency "quarterly in january on 1st" \
  --start-time "09:00" \
  --duration 240
```

**Interval-based Ritual:**
```bash
node scripts/ritual-cli-v2.cjs add \
  --name "Deep Work Session" \
  --type work \
  --frequency "every 3 days" \
  --start-time "14:00" \
  --duration 180
```

#### Listing Rituals

```bash
# All rituals
node scripts/ritual-cli-v2.cjs list

# Only active rituals
node scripts/ritual-cli-v2.cjs list --active

# Filter by type
node scripts/ritual-cli-v2.cjs list --type foundational

# JSON output for scripting
node scripts/ritual-cli-v2.cjs list --format json
```

#### Editing Rituals

```bash
# Edit by name
node scripts/ritual-cli-v2.cjs edit --name "Boot.dev Practice" --duration 90

# Edit by UUID (more precise)
node scripts/ritual-cli-v2.cjs edit --uuid "29696612-cf9e-43a5-b592-36d2d7d2e4f3" --start-time "19:00"

# Deactivate ritual
node scripts/ritual-cli-v2.cjs edit --name "Old Habit" --active false
```

#### Removing Rituals

```bash
# Remove by UUID (recommended method)
node scripts/ritual-cli-v2.cjs 'ritual remove ac254322-da57-4983-aeda-8b30f237513c'

# Remove with automatic calendar cleanup guidance
node scripts/ritual-cli-v2.cjs 'ritual remove ac254322-da57-4983-aeda-8b30f237513c --delete-from-calendar'

# Remove by name (less precise, may match multiple rituals)
node scripts/ritual-cli-v2.cjs 'ritual remove --name "Outdated Meeting"'
```

**⚠️ Important Notes on Ritual Removal:**
- **System Only**: Regular removal only deactivates the ritual definition
- **Calendar Cleanup**: `--delete-from-calendar` flag provides UUID guidance for manual cleanup
- **Two-Step Process**: Currently requires manual deletion of calendar events via MCP
- **Search Pattern**: Use the provided RITUAL_UUID to find and delete related calendar events
- **Future Enhancement**: Full automatic calendar cleanup will be added in future versions

### Calendar Integration

#### Sync Commands

```bash
# Sync today's rituals
node scripts/ritual-cli-v2.cjs sync --period day

# Sync this week
node scripts/ritual-cli-v2.cjs sync --period week

# Sync specific month
node scripts/ritual-cli-v2.cjs sync --period month --date 2025-10-01

# Sync quarter with preview
node scripts/ritual-cli-v2.cjs sync --period quarter --preview
```

## Frequency Pattern Guide

### Daily Patterns
- `daily` - Every day
- `every day` - Every day
- `every 2 days` - Every other day
- `every 3 days` - Every third day

### Weekly Patterns
- `weekly` - Same day each week (based on creation date)
- `weekly on monday` - Every Monday
- `weekly on monday,wednesday,friday` - Multiple days
- `every 2 weeks` - Bi-weekly
- `every week on tuesday` - Same as weekly on tuesday

### Monthly Patterns
- `monthly` - Same date each month
- `monthly on 1st` - First of each month
- `monthly on 15th` - 15th of each month
- `monthly on last` - Last day of each month
- `every 2 months` - Bi-monthly

### Quarterly Patterns
- `quarterly` - Same date in January, April, July, October
- `quarterly in january on 1st` - First of each quarter
- `quarterly in march on 15th` - 15th of quarter-end months

## Ritual Types

### foundational
Core habits and personal development activities
- Examples: exercise, meditation, learning, reading
- Priority: Usually high, protected from conflicts

### work  
Employment-related activities and meetings
- Examples: team meetings, 1:1s, project work
- Priority: High during work hours

### maintenance
System maintenance and routine tasks
- Examples: cleaning, organizing, admin work
- Priority: Medium, flexible scheduling

### life
Personal life activities and social commitments
- Examples: family time, social events, appointments
- Priority: High for relationships, medium for routine

## Time Conflict Handling

The system automatically detects time conflicts when adding rituals:

```bash
# This will show conflicts if any exist
node scripts/ritual-cli-v2.cjs add \
  --name "Conflicting Meeting" \
  --type work \
  --frequency daily \
  --start-time "18:00" \
  --duration 60
```

**Conflict Output Example:**
```
❌ Time Conflict Error: Cannot create ritual "Conflicting Meeting"

📋 Detected 1 conflict(s):

🔴 CONFLICT 1:
   New: Conflicting Meeting (18:00-19:00)
   Existing: Boot.dev Practice (18:00-19:00)
   Overlap: 18:00-19:00 (60 minutes)
   Date: 2025-09-03

💡 Suggestions:
   - Try time: 19:00-20:00 (after Boot.dev Practice)
   - Try time: 17:00-18:00 (before Boot.dev Practice)
```

## Best Practices

### Naming Conventions
- Use descriptive names: "Boot.dev Practice" not "Study"
- Include context when helpful: "Team Standup" not "Meeting"
- Be consistent with similar rituals

### Time Management
- Use foundational type for non-negotiable habits
- Leave buffer time between rituals
- Consider energy levels when scheduling

### Frequency Selection
- Start with daily for new habits
- Use weekly for team activities
- Monthly for reviews and planning
- Quarterly for major assessments

### Calendar Sync Strategy
- Sync daily for active day planning
- Sync weekly for work planning
- Use preview mode for large syncs
- Only sync periods you're actively planning

## Troubleshooting

### Common Issues

**"Ritual already exists" Error:**
```bash
# Check for duplicates
node scripts/ritual-cli-v2.cjs list | grep "Boot.dev"

# Remove duplicate if needed
node scripts/ritual-cli-v2.cjs remove --uuid [duplicate-uuid]
```

**Time Conflicts:**
- Review existing rituals at that time
- Consider adjusting duration or time
- Use different days for weekly conflicts

**Calendar Sync Issues:**
- Ensure Google Calendar MCP is configured
- Check calendar permissions
- Verify timezone settings (Sydney/Australia)

### Debug Commands

```bash
# Verbose output
node scripts/ritual-cli-v2.cjs status --verbose

# Check specific date conflicts
node scripts/ritual-cli-v2.cjs status --date 2025-09-03 --conflicts

# Export for analysis
node scripts/ritual-cli-v2.cjs list --format json > rituals-backup.json
```

## Integration with Planning Commands

The ritual system integrates with these planning commands:

- `/plan-day` - Uses rituals to determine available time blocks
- `/morning-checkin` - Can reference ritual commitments
- `/evening-checkin` - Can track ritual completion
- `/weekly-review` - Can analyze ritual adherence

## Advanced Usage

### Batch Operations
```bash
# Deactivate all maintenance rituals
node scripts/ritual-cli-v2.cjs list --type maintenance --format json | \
  jq '.[] | .uuid' | \
  xargs -I {} node scripts/ritual-cli-v2.cjs edit --uuid {} --active false
```

### Backup and Restore
```bash
# Backup rituals
cp rituals-v2/ritual-definitions.json backup/rituals-$(date +%Y%m%d).json

# Restore from backup
cp backup/rituals-20250903.json rituals-v2/ritual-definitions.json
```

### Custom Scripts Integration
The ritual system can be imported as a module:

```javascript
const { RitualManager } = require('./scripts/ritual-manager-v2.cjs');
const manager = new RitualManager();

// Get today's rituals
const todayRituals = manager.getRitualsForDate(new Date());
```

## Next Steps

After mastering the basic commands:
1. Set up regular weekly ritual reviews
2. Integrate with Google Calendar workflow
3. Create ritual templates for common patterns
4. Use conflict detection for time optimization
5. Track ritual adherence in victory logs