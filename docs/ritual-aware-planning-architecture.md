# Ritual-Aware Planning System Architecture

## Overview

The Ritual-Aware Planning System integrates recurring commitments, foundational habits, and work schedules into the fractal planning workflow. This prevents double-booking and ensures realistic time allocation by checking ritual constraints before generating plans.

## Problem Statement

The current planning system generates time blocks without awareness of:
- Work schedule constraints
- Foundational daily rituals (boot.dev, AI school)
- Recurring life commitments
- Blocked/unavailable time periods

This leads to unrealistic plans and scheduling conflicts.

## Architecture Components

```
RITUAL-AWARE PLANNING SYSTEM
├── Ritual Manager
│   ├── Work Schedule (blocked times)  
│   ├── Foundational Rituals (boot.dev, AI school)
│   ├── Life Commitments (personal time)
│   └── Recurring Tasks (maintenance)
├── Time Availability Calculator  
│   ├── Checks ritual blocks before planning
│   ├── Calculates available windows
│   └── Prevents double-booking
├── Enhanced Planning Commands
│   ├── /ritual-status (current rituals)
│   ├── /ritual-add (new recurring commitments) 
│   ├── /ritual-block (temporary blocks)
│   └── /plan-day-aware (ritual-aware planning)
└── TaskWarrior Integration
    ├── Ritual-based task scheduling
    ├── Executive function recommendations
    └── Weekly plan/review hooks
```

## Data Structure

### Ritual Definition
```json
{
  "id": "unique-id",
  "name": "ritual-name",
  "type": "work|foundational|life|maintenance",
  "frequency": "daily|weekly|monthly|custom",
  "timeBlocks": [
    {
      "day": "monday|tuesday|...|daily",
      "startTime": "HH:MM",
      "duration": 60,
      "flexible": false,
      "priority": "high|medium|low"
    }
  ],
  "description": "Purpose and context",
  "created": "ISO-timestamp",
  "active": true,
  "streak": 0,
  "completionTracking": true
}
```

### Available Time Window
```json
{
  "date": "YYYY-MM-DD",
  "availableBlocks": [
    {
      "startTime": "HH:MM",
      "endTime": "HH:MM", 
      "duration": 90,
      "context": "morning|afternoon|evening"
    }
  ],
  "blockedBy": [
    {
      "ritualId": "ritual-id",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "reason": "Work schedule"
    }
  ]
}
```

## File Structure

```
rituals/
├── ritual-definitions.json      # All ritual configurations
├── ritual-completions.json      # Completion tracking data
├── blocked-times.json           # Temporary blocks and exceptions
└── availability-cache/          # Cached availability calculations
    └── availability-YYYY-MM-DD.json

scripts/
├── ritual-manager.js            # Core ritual management
├── ritual-aware-planner.js      # Enhanced daily planning
└── executive-function.js        # Weekly planning with ritual awareness

.claude/commands/
├── ritual-status.md             # Show current rituals and next commitments
├── ritual-add.md                # Add new recurring commitment
├── ritual-block.md              # Block time temporarily
└── plan-day-aware.md            # Ritual-aware daily planning
```

## Integration Points

### 1. Daily Planning Workflow
1. Load ritual definitions for target date
2. Calculate blocked time periods
3. Generate available time windows
4. Create plans only in available slots
5. Respect ritual priorities and flexibility

### 2. TaskWarrior Integration
- Tasks scheduled within available windows
- Ritual completion creates TaskWarrior tasks
- Executive function analysis considers ritual completion rates
- Weekly reviews include ritual adherence metrics

### 3. Calendar Sync
- Rituals automatically added to calendar as recurring events
- Planning blocks respect existing calendar commitments
- Status updates reflect both task and ritual completion

## Command Interface

### `/ritual-status`
Shows current active rituals, next scheduled times, completion streaks, and upcoming conflicts.

### `/ritual-add`
Interactive ritual creation with scheduling, frequency, and flexibility options.

### `/ritual-block`
Temporarily block time periods (sick days, meetings, travel).

### `/plan-day-aware`
Enhanced daily planning that checks ritual availability before generating time blocks.

### `/executive-function`
Weekly analysis of ritual adherence, planning effectiveness, and scheduling recommendations.

## Benefits

1. **Realistic Planning**: Plans only include actually available time
2. **Ritual Consistency**: Foundational habits protected from scheduling conflicts
3. **Executive Function**: System awareness of commitments enables better decision-making
4. **Conflict Prevention**: Early detection of scheduling impossibilities
5. **Habit Reinforcement**: Ritual tracking supports long-term consistency
6. **ADD Optimization**: Reduces cognitive load by automating scheduling logic

## Implementation Phases

### Phase 1: Core Ritual Management
- Ritual definition and storage system
- Basic availability calculation
- Ritual status command

### Phase 2: Planning Integration  
- Enhanced daily planner with ritual awareness
- Time window calculation
- Conflict detection and resolution

### Phase 3: Executive Function
- Weekly planning with ritual context
- TaskWarrior integration for ritual tasks
- Performance analysis and recommendations

### Phase 4: Advanced Features
- Flexible ritual rescheduling
- Ritual dependency chains
- Predictive availability modeling

## Usage Examples

### Typical Work Day
```
Rituals:
- 09:00-17:00: Work (blocked)
- 18:00-19:00: Boot.dev daily practice
- 19:30-20:00: AI Engineering School

Available for planning:
- 07:00-08:30 (morning prep)
- 17:00-18:00 (transition time)
- 20:00-22:00 (evening project work)
```

### Weekend Planning
```
Rituals: 
- 09:00-10:00: Boot.dev practice
- 14:00-15:00: Family time (flexible)

Available for planning:
- 07:00-09:00 (morning focus time)
- 10:00-14:00 (major project blocks)
- 15:00-22:00 (flexible project/learning time)
```

This architecture ensures the planning system respects your real constraints while maintaining the flexibility needed for effective daily execution.