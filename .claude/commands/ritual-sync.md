# Ritual Calendar Sync

Selectively sync ritual time blocks to Google Calendar for specific planning periods.

## Usage
```bash
/ritual-sync [period] [period-value] [options]
```

## Examples
```bash
/ritual-sync day                          # Sync today's rituals
/ritual-sync day 2025-09-15               # Sync specific date
/ritual-sync week                         # Sync current week
/ritual-sync week 2025-W37                # Sync specific week
/ritual-sync month 2025-09                # Sync specific month
/ritual-sync quarter 2025-Q4              # Sync specific quarter
/ritual-sync --types=foundational,work    # Only sync certain types
/ritual-sync --exclude=maintenance        # Exclude certain types
```

## Process:

1. **Parse sync parameters**:
   ```
   📅 Ritual Calendar Sync
   Period: [day|week|month|quarter|year]
   Target: [specific period value or current]
   Types: [foundational|work|life|maintenance] (filter)
   Options: [include/exclude filters, conflict resolution]
   ```

2. **Load ritual definitions and calculate instances**:
   ```bash
   # Use V2 ritual system to get ritual data for period
   node scripts/ritual-cli-v2.js status --date=[date-range-start]
   
   # For each day in period, get active rituals:
   - UUID-based ritual identification
   - Complex frequency pattern evaluation
   - Time block calculation with availability windows
   - Priority and conflict information
   ```

3. **Check existing calendar events**:
   ```
   Use Google Calendar MCP to check for existing events in the period:
   - Query date range for all existing events
   - Identify potential conflicts with ritual time blocks
   - Check for previously synced ritual events using extended properties
   ```

4. **Generate calendar sync plan**:
   ```
   📋 Sync Plan for [period] [period-value]:
   
   ## Ritual Events to Create:
   [List all ritual time blocks that will become calendar events]
   - [Ritual Name] ([Type]): [Date] [StartTime]-[EndTime] (UUID: [uuid])
   
   ## Conflicts Detected:
   [List any conflicts with existing calendar events]
   - [Event Name]: [Date] [Time] conflicts with [Ritual Name]
   
   ## Resolution Strategy:
   [Show how conflicts will be handled - skip, adjust, or manual resolution needed]
   
   ## MCP Commands Preview:
   [Show count and summary of MCP commands that will be generated]
   ```

5. **Execute selective sync**:
   ```bash
   # Run calendar sync manager with specified parameters
   node scripts/ritual-cli-v2.js sync --period=[period] --date=[period-value] [options]
   ```

6. **Process sync results**:
   ```
   📊 Sync Results:
   ✅ Successfully Created: [N events]
   ⚠️  Conflicts Skipped: [N events] 
   🔧 Manual Resolution Needed: [N events]
   
   ## Created Events:
   [List each successfully created calendar event with UUID tracking]
   
   ## Skipped Events:
   [List events that couldn't be created due to conflicts]
   
   ## MCP Command Summary:
   [Show the MCP commands file location for manual execution if needed]
   ```

7. **Update sync tracking**:
   ```
   - Record sync session in sync history
   - Update active periods tracking
   - Mark calendar events with ritual system metadata
   - Enable future cleanup and maintenance operations
   ```

8. **Display calendar integration instructions**:
   ```
   📅 Calendar Integration Complete
   
   ## Next Steps:
   - View your synced rituals in Google Calendar
   - Use /plan-day to create planning blocks in remaining available time
   - Use /ritual-cleanup to remove expired ritual events
   
   ## MCP Commands Generated:
   [Path to MCP commands file if manual execution needed]
   
   ## Sync Session:
   UUID: [session-uuid]
   Period: [period] [period-value]  
   Events: [created-count]/[total-count]
   ```

## Integration Features

**UUID-Based Tracking:**
- Each calendar event includes ritual UUID in extended properties
- Bi-directional linking between ritual system and calendar
- Enables precise cleanup and maintenance operations

**Selective Period Sync:**
- Only syncs rituals for actively planned periods
- Prevents calendar bloat from long-term ritual definitions
- Automatic cleanup when planning periods expire

**Conflict Detection:**
- Compares with existing calendar events
- Provides resolution strategies (skip, adjust, manual)
- Maintains ritual integrity while respecting existing commitments

**Planning System Integration:**
- Available time windows calculated after ritual sync
- Planning commands use post-ritual availability for time blocks
- Ensures rituals are protected from planning conflicts

## Sync Options

**Period Types:**
- `day` - Single day sync (default: today)
- `week` - 7-day week sync (default: current week)  
- `month` - Full month sync (default: current month)
- `quarter` - 3-month quarter sync (default: current quarter)
- `year` - Full year sync (use carefully - many events)

**Filtering Options:**
- `--types=type1,type2` - Only sync specified ritual types
- `--exclude=type1,type2` - Exclude specified ritual types
- `--priority=high,medium` - Only sync certain priorities

**Conflict Resolution:**
- `--skip-conflicts` - Skip ritual events that conflict (default)
- `--adjust-times` - Try to adjust ritual times to avoid conflicts
- `--manual-resolution` - Generate commands but don't auto-execute

## Error Handling

**Common Issues:**
- **Calendar API unavailable**: Save MCP commands for later execution
- **Ritual system unavailable**: Show error and suggest manual ritual review
- **Conflicts detected**: Provide clear resolution options
- **Permission errors**: Guide user through MCP setup requirements

**Rollback Support:**
- Track all created events for potential cleanup
- Provide undo commands for accidental syncs
- Maintain sync history for audit and troubleshooting

Remember: Ritual sync is designed to work with planning commands - sync rituals first, then use /plan-day to fill available time windows with planning blocks.