# Manual Calendar Workflow

## Overview
This system replaces automated Google Calendar integration with intelligent advisory suggestions. Instead of automatically creating calendar events, the system provides specific recommendations with copy/paste instructions, maintaining human control over calendar management.

## Key Philosophy

### From Automation to Advisory
- **Before**: System automatically created Google Calendar events
- **After**: System provides intelligent suggestions with exact instructions
- **Benefit**: Full calendar control while retaining smart assistance

### Human-in-the-Loop Benefits
- **Calendar Autonomy**: You decide which events to create
- **Timing Control**: Adjust suggested times to fit your preferences
- **Event Customization**: Modify titles, descriptions, and settings as needed
- **No Calendar Clutter**: Only events you actually want get created

## Deprecated Components

### Moved to `/deprecated/`
- **`/calendar-sync`** command - Automated sync of daily plans to calendar
- **`scripts/calendar-block.js`** - 3-hour focus block creation script
- **Calendar automation in `/plan-day`** - MCP Google Calendar integration removed

### What Changed
- Removed `mcp__google-calendar__create-event` calls
- Replaced with advisory suggestions and manual entry instructions
- Maintained calendar conflict checking for planning intelligence

## New Advisory Workflow

### 1. Planning with Calendar Awareness
Commands still check calendar for conflicts and availability:
- `/plan-day` analyzes existing calendar events
- Prevents time block conflicts with existing commitments
- Shows available time windows for optimal scheduling

### 2. Calendar Entry Suggestions
Instead of auto-creation, receive specific recommendations:

#### Ritual Calendar Suggestions
```
📅 RITUAL CALENDAR SUGGESTIONS

🔹 Morning Reflection 🧘
Time: 08:00 - 08:15 (Australia/Sydney)

Manual Entry Command:
→ "Add to Google Calendar: 'Morning Reflection 🧘' 08:00-08:15 today"

Event Details for Manual Entry:
• Title: Morning Reflection 🧘
• Time: 08:00 - 08:15
• Description: Foundational practice for day alignment
• Type: foundational
• UUID: ritual-uuid-123 (for tracking)
```

#### Time Block Calendar Suggestions
```
📅 TIME BLOCK CALENDAR SUGGESTIONS

🎯 AI Learning Deep Work 🤖
Time: 09:00 - 11:30 (Australia/Sydney)
Duration: 2 hours 30 minutes

Manual Entry Command:
→ "Add to Google Calendar: 'AI Learning Deep Work 🤖' 09:00-11:30 today"

Event Details for Manual Entry:
• Title: AI Learning Deep Work 🤖
• Time: 09:00 - 11:30
• Description: Boot.dev Python fundamentals + portfolio project
• Values: Mastery, Growth, Future-focus
• UUID: fractal-uuid-456 (for tracking)
```

### 3. Manual Entry Methods

#### Quick Add (Recommended)
Copy the suggested command and paste into Google Calendar:
```
"AI Learning Deep Work 🤖 09:00-11:30 today"
```

#### Full Event Creation
Use the detailed information to create events manually:
1. Open Google Calendar
2. Click "+" to create event
3. Fill in suggested title, time, and description
4. Add recommended color and reminders
5. Save event

#### Google Calendar Mobile
Use voice commands or quick entry:
- "Add calendar event AI Learning today 9am to 11:30am"

## Integration with Planning Commands

### `/plan-day` Command
Now provides calendar advisory instead of automation:
- Shows ritual calendar suggestions with exact details
- Provides time block calendar recommendations
- Includes conflict checking and availability analysis
- Gives copy/paste instructions for easy manual entry

### Check-in Commands
Enhanced with calendar awareness:
- Review planned vs actual calendar entries
- Suggest calendar updates based on completed activities
- Recommend calendar adjustments for better planning

## Calendar Management Principles

### 1. Intelligent Suggestions
- **Context-Aware**: Considers existing events, energy levels, and goals
- **Conflict Prevention**: Analyzes calendar before suggesting times
- **Optimal Timing**: Recommends best time slots for different activities
- **Goal Alignment**: Connects calendar entries to larger objectives

### 2. Manual Control
- **Selective Implementation**: Choose which suggestions to follow
- **Custom Timing**: Adjust suggested times to personal preferences  
- **Event Customization**: Modify titles, descriptions, and settings
- **Workload Management**: Control calendar density and complexity

### 3. Consistent Tracking
- **UUID Integration**: Maintains tracking links between plans and calendar
- **Cross-System Sync**: Connects fractal planning with calendar entries
- **Progress Monitoring**: Tracks plan execution via calendar completion

## Recommended Calendar Practices

### Event Naming Conventions
Use suggested emoji patterns for visual clarity:
- 🧘 Rituals and foundational practices
- 🎯 Focused work and deep work sessions
- 📚 Learning and skill development
- 💼 Work and professional activities
- 🏃‍♂️ Physical activities and movement
- 📝 Administrative and planning tasks

### Color Coding System
Align with planning types:
- **Red (11)**: Deep work and focused sessions
- **Green (10)**: Learning and skill development
- **Blue (7)**: Administrative and planning
- **Yellow (5)**: Personal and life activities
- **Purple (9)**: Foundational rituals
- **Gray (8)**: Maintenance and routine tasks

### Event Descriptions
Include key tracking information:
- Purpose and specific activities
- Strategic alignment with goals
- UUID for cross-system tracking
- Values served by the time block

### Reminders and Notifications
Use consistent reminder patterns:
- **10 minutes before**: Preparation and transition time
- **2 minutes before**: Final preparation and mindset shift

## Benefits of Manual Approach

### Enhanced Control
- **Timing Flexibility**: Adjust times to personal rhythms
- **Event Customization**: Tailor events to specific needs
- **Calendar Cleanliness**: Only desired events get created
- **Priority Management**: Manual entry forces conscious prioritization

### Maintained Intelligence
- **Conflict Analysis**: Still prevents scheduling conflicts
- **Availability Optimization**: Suggests best available time slots
- **Goal Integration**: Connects daily activities to larger objectives
- **Context Awareness**: Considers energy, commitments, and priorities

### Improved Workflow
- **Conscious Planning**: Manual entry increases intention and commitment
- **Flexible Execution**: Easy to modify or skip suggested events
- **Learning Integration**: System learns from manual choices
- **Reduced Overwhelm**: Prevents automatic calendar overload

## Future Enhancements

### Potential Additions
- **Calendar Review Commands**: Analyze manual entry patterns
- **Suggestion Refinement**: Improve recommendations based on manual choices
- **Template Management**: Create event templates for common activities
- **Integration Analytics**: Track plan-to-calendar execution rates

### Learning Opportunities
- **Pattern Recognition**: Identify which suggestions get implemented
- **Timing Optimization**: Learn preferred times for different activities
- **Workload Calibration**: Adjust suggestion volume based on adoption
- **Personalization**: Customize suggestions to individual preferences

This manual approach maintains the intelligence of automated calendar management while preserving human agency and control over schedule creation.