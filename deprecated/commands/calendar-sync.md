# Calendar Sync

Sync daily time blocks from fractal planning to Google Calendar using MCP integration.

## Process:

1. First, check if a daily plan exists for the specified date (defaults to today)
2. Load the time blocks from the fractal planning data
3. For each time block, create a Google Calendar event using the MCP integration

## Usage:
```
/calendar-sync [date]
```

## Implementation:
When this command is run:

1. Load the daily plan from `planning/data/day-YYYY-MM-DD.json`
2. For each time block in the plan, directly call the MCP Google Calendar create_event tool
3. Use these parameters for each event:
   - calendarId: "primary"
   - summary: "{activity} - Fractal Plan"
   - description: Full activity description with alignment, type, and duration
   - start: ISO datetime (e.g., "2025-08-28T09:00:00")
   - end: ISO datetime 
   - timeZone: "Australia/Sydney"
   - reminders: popup at 10 and 2 minutes
   - colorId: Based on type (deep-work=1, learning=2, admin=6, review=3)

## Example slash command output:
The command should directly execute MCP calls, not generate scripts. Each event should be created immediately using the Google Calendar MCP integration that's already configured.