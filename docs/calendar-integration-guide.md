---
date: 2025-08-28
type: documentation
topic: calendar-integration
tags: [planning, calendar, mcp, automation]
status: final
privacy: public
---

# Enhanced Day Planning with Google Calendar Integration

## Overview

The enhanced day planning system now includes sophisticated Google Calendar integration through MCP (Model Context Protocol) commands. This system allows you to:

- Create time-aware daily plans based on current Sydney time
- Iteratively book calendar events with multiple booking modes
- Generate color-coded time blocks for different activity types
- Automatically create MCP commands for calendar event creation
- Maintain ADD-optimized workflow with realistic time constraints

## System Architecture

### Core Components

1. **Enhanced Fractal Planner V2** (`scripts/fractal-planner-v2.cjs`)
   - Time-aware planning engine
   - Calendar integration framework
   - MCP command generation

2. **Day Plan Calendar Script** (`scripts/day-plan-calendar.cjs`)
   - Convenience wrapper for slash command integration
   - Enhanced user experience layer

3. **Calendar Booking Demo** (`scripts/calendar-booking-demo.cjs`)
   - Example implementation
   - Testing and validation tool

## Calendar Booking Modes

### 1. Interactive Mode
- Prompts for each time block individually
- Allows selective calendar booking
- Best for flexible scheduling

### 2. Auto-book Mode
- Automatically books all planned time blocks
- Fastest option for consistent scheduling
- Ideal for routine daily planning

### 3. Skip Mode
- Plans without calendar integration
- Useful for planning-only sessions
- Good for preview and adjustment

## Time Block Color System

The system uses Google Calendar color codes to visually differentiate activity types:

- **Deep Work** (Blue - Color 9): Focused, uninterrupted work sessions
- **Project** (Green - Color 10): Development and implementation tasks
- **Learning** (Yellow - Color 5): Skill development and study
- **Research** (Purple - Color 3): Exploration and information gathering
- **Admin** (Gray - Color 8): Administrative and organizational tasks
- **Review** (Orange - Color 6): Reflection and assessment activities

## Enhanced Features

### Time Awareness
- Checks current Sydney time before generating blocks
- Adjusts block durations for different times of day
- Prevents scheduling past 11 PM
- Provides realistic 15-minute buffers between blocks

### ADD Optimization
- Maximum 5 time blocks per session
- Decreasing block durations (90→75→60→45→30 minutes)
- Evening mode with shorter blocks for reduced evening energy
- Built-in transition time and realistic expectations

### MCP Integration
- Generates properly formatted MCP commands
- Includes timezone handling (Australia/Sydney)
- Sets up popup reminders (10 min and 2 min before)
- Provides batch command generation for easy execution

## Usage Examples

### Basic Day Planning
```bash
# Plan today with calendar integration
node scripts/fractal-planner-v2.cjs plan-day

# Plan specific date
node scripts/fractal-planner-v2.cjs plan-day 2025-08-29

# Check current status
node scripts/fractal-planner-v2.cjs status
```

### Calendar Booking
```bash
# Book existing plan to calendar
node scripts/fractal-planner-v2.cjs book-calendar

# Book specific date plan
node scripts/fractal-planner-v2.cjs book-calendar 2025-08-29
```

### Demo and Testing
```bash
# Run calendar integration demo
node scripts/calendar-booking-demo.cjs
```

## Integration Workflow

### 1. Planning Phase
- Run day planning command
- Define activities for each time block
- Choose calendar booking mode

### 2. Calendar Booking Phase
- System generates MCP commands for each event
- Provides both interactive and batch booking options
- Creates color-coded events with appropriate reminders

### 3. Execution Phase
- Copy generated MCP commands
- Execute in Claude Code environment
- Verify calendar events creation
- Start focused work sessions

## MCP Command Structure

Each generated calendar event includes:

```json
{
  "calendarId": "primary",
  "summary": "Activity Type: Specific Activity",
  "description": "Formatted description with focus area",
  "start": "2025-08-28T09:00:00",
  "end": "2025-08-28T10:30:00", 
  "timeZone": "Australia/Sydney",
  "reminders": {
    "useDefault": false,
    "overrides": [
      {"method": "popup", "minutes": 10},
      {"method": "popup", "minutes": 2}
    ]
  },
  "colorId": "9"
}
```

## Benefits

### Productivity Enhancement
- Seamless integration between planning and scheduling
- Visual time block organization in Google Calendar
- Automatic reminder system for focus sessions
- Consistent daily structure supporting ADD workflow

### Technical Integration
- Native MCP protocol support for Claude Code
- Timezone-aware scheduling for Australia/Sydney
- Color-coded visual organization system
- Batch processing capabilities for efficiency

### User Experience
- Multiple booking modes for different preferences
- Interactive confirmation system
- Automated script generation for repeated use
- Comprehensive error handling and user feedback

## Future Enhancements

- Automatic calendar availability checking
- Integration with existing calendar events
- Recurring time block patterns
- Performance analytics and optimization suggestions
- Mobile notification integration

## Troubleshooting

### Common Issues
- **MCP not available**: Ensure Google Calendar MCP server is configured
- **Timezone problems**: Verify Australia/Sydney timezone in system
- **Permission errors**: Check Google Calendar API access rights
- **Script execution**: Ensure Node.js and dependencies are installed

### Support Resources
- MCP documentation: https://docs.anthropic.com/en/docs/claude-code/mcp
- Google Calendar API: https://developers.google.com/calendar
- Repository issues: Create issue for specific problems

---

*Generated: 2025-08-28 15:18 Sydney Time*  
*System: Enhanced Fractal Planning V2 with Calendar Integration*