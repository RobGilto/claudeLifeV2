# Daily Planning

Create or update a daily plan with time blocks aligned to higher-level objectives.

## Usage
```bash
/plan-day [date] [--hitl]  # Add --hitl for Human in the Loop approval workflow
```

## Process:

1. First read CLAUDE.md and any existing planning context to understand the user's current planning state.

2. Show multi-perspective date indexing and values-aligned parent context:
   ```
   📅 Planning Day: YYYY-MM-DD
   📊 Multi-Index: Day X/365 | Week Y/7 | Month Z/31 | Quarter A/92  
   🎯 Daily Values Focus: [1-2 core values to emphasize today]
   🎭 Primary Role Today: [main role to advance today]
   ✨ Vision Connection: [how today serves lifestyle vision]
   
   🔄 Ritual Schedule:
   [Show active rituals for the day with times and durations]
   ⏰ Available Time: [X hours Y minutes] | Windows: [N]
   
   📋 Parent Context:
   - Week Priorities: [show from week plan if exists]
   - Month Goals: [show from month plan if exists]
   - Quarter Focus: [show from quarter plan if exists]
   ```

2.5. Conduct Daily Values Alignment:
   - Identify which core values today's time blocks will serve
   - Ensure daily activities advance primary role development
   - Check for Newport's "slow productivity" principles in the plan
   - Verify sustainable pace and deep work protection

3. **MANDATORY: Check existing calendar events first** to prevent conflicts:
   ```
   Use Google Calendar MCP to list events for the target date:
   - Check for existing appointments, meetings, and commitments
   - Identify time slots that are already occupied
   - Note any recurring events or patterns
   ```

3.5. **CRITICAL: Load and validate ritual constraints**:
   ```bash
   # Check active rituals for the target date using V2 system
   node scripts/ritual-cli-v2.cjs status --date=[date]
   ```
   
   **Ritual Integration Requirements:**
   - Load all active rituals for the target date from ritual-manager-v2.js
   - Calculate available time windows between ritual blocks using UUID-based system
   - Ensure time blocks are only created in truly available periods
   - Show ritual schedule in planning context display with UUID tracking
   - Prevent any conflicts with foundational habits and work schedule
   - Support complex frequency patterns (daily, weekly, monthly, quarterly)
   
   **💡 Ritual CLI Tutorial**: For comprehensive usage examples and advanced patterns, see [Ritual CLI V2 Tutorial](../docs/ritual-cli-v2-tutorial.md)

4. **HITL (Human in the Loop) Decision Point**: If `--hitl` flag is used:
   
   4a. Run the fractal planner in DRAFT mode with ritual awareness:
   ```bash
   node scripts/fractal-planner.cjs plan-day [date] --draft --ritual-aware-v2
   ```
   
   4b. Present the draft plan to the user for approval:
   ```
   📋 DRAFT DAILY PLAN FOR APPROVAL
   📅 Date: [date]
   
   ## Proposed Time Blocks:
   [List all proposed time blocks with descriptions and strategic alignment]
   
   ## Daily Objectives:
   [List proposed objectives]
   
   ## Values & Alignment:
   [Show values served and role development]
   
   ❓ **APPROVAL REQUIRED**: 
   - Type "approve" to proceed with calendar creation
   - Type "revise" with feedback to adjust the plan
   - Type "cancel" to abort planning
   
   💡 **Feedback options**:
   - Adjust specific time blocks: "Move deep work to 9 AM"  
   - Change priorities: "Focus more on coding, less on admin"
   - Modify duration: "Make learning blocks longer"
   - Add/remove activities: "Add exercise block at 6 PM"
   ```
   
   4c. **Revision Loop**: If user requests changes:
   - Incorporate feedback into plan parameters
   - Re-run fractal planner with adjustments
   - Present updated draft for re-approval
   - Continue until user approves or cancels
   
   4d. **Only proceed to step 5 after user approval**

5. If NOT using `--hitl` OR after HITL approval, run the fractal planner command with ritual awareness:
   ```bash
   node scripts/fractal-planner.cjs plan-day [date] --ritual-aware-v2
   ```
   
   **CRITICAL**: If the script reports "No calendar conflicts detected" but you found events in step 3, DO NOT TRUST the script's calendar check. The calendar detection may have failed and manual verification is required.

6. **Validate planned time blocks against calendar events** before creating any calendar entries:
   ```
   - Compare planned time blocks with existing calendar events
   - Identify any overlaps or conflicts
   - Adjust time blocks if necessary to avoid scheduling conflicts
   - Document any changes made to accommodate existing commitments
   ```

7. If the command succeeds, create a readable daily plan report in `journal/planning/daily-reviews/plan-YYYY-MM-DD.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   type: daily-plan
   status: active
   parent_plans: [week-id, month-id, quarter-id]
   ---

   # Daily Plan: YYYY-MM-DD

   ## Ritual Schedule
   [List all active rituals with times, durations, and types]
   
   ## Available Time Windows
   [Show calculated available time between rituals]
   
   ## Time Block Schedule (ADD-Optimized: 4-5 blocks + 1 buffer)
   [List all time blocks created within available windows, including 1.5hr buffer block]

   ## Daily Objectives (Max 3 for focus)
   [List objectives with parent alignment]

   ## Newport Multi-Scale Integration

   ### Daily Values Expression
   **Primary Value Today**: [Core value emphasized in today's activities]
   **Values Through Time Blocks**:
   - Block 1: [Which value this serves and how]
   - Block 2: [Which value this serves and how]
   - [etc...]

   ### Role Development Today
   **Primary Role**: [Main role receiving development today]
   **Role Actions**: [Specific ways today advances this role]
   **Role Balance**: [How other roles are maintained/served]

   ### Slow Productivity Implementation
   - **Deep Work Block**: [Protected focus time with no interruptions]
   - **Quality Focus**: [What you'll do exceptionally well vs. just completing]
   - **Sustainable Pace**: [How today supports long-term productivity]
   - **Natural Rhythm**: [How the schedule honors your energy patterns]

   ### Vision Connection
   **Lifestyle Vision Link**: [How today's activities serve your ideal future]
   **Transformation Step**: [Progress toward AI engineer transition]

   ## Parent Plan Alignment
   [Show relevant parent priorities and goals and how time blocks serve them]
   
   ## Notes
   [Any additional planning notes]
   ```

8. **AUTOMATIC CALENDAR INTEGRATION**: After plan validation, automatically create calendar events:

   8a. **RITUAL CALENDAR ADVISORY**: Provide manual calendar entry suggestions for rituals:
   ```
   For each ritual identified in step 3.5 ritual constraints:
   
   📅 RITUAL CALENDAR SUGGESTIONS
   
   🔹 [Ritual name with emoji]
   Time: [start time] - [end time] (Australia/Sydney)
   
   Manual Entry Command:
   → "Add to Google Calendar: '[Ritual name]' [start time]-[end time] today"
   
   Event Details for Manual Entry:
   • Title: [Ritual name with appropriate emoji]
   • Time: [start time] - [end time]
   • Description: [Ritual purpose and activity]
   • Type: [foundational/work/life/maintenance]
   • UUID: [UUID from ritual-cli-v2 output] (for tracking)
   - colorId: [Ritual type color - foundational=9(blue), work=10(green), life=5(yellow), maintenance=8(gray)]
   - reminders: {"useDefault": false, "overrides": [{"method": "popup", "minutes": 10}, {"method": "popup", "minutes": 2}]}
   ```

   8b. **Load Generated Data**: Check if fractal planner saved MCP commands and UUID mappings:
   ```
   Read planning/analytics/calendar-sync-[date].json for generated MCP commands
   Read planning/uuid-mappings/uuid-mappings-[date].json for TaskWarrior UUID cross-links
   ```
   
   8c. **Conflict Resolution**: Compare generated blocks with existing calendar events:
   ```
   - For each generated time block, check against existing events from step 3
   - SKIP blocks that overlap with existing events
   - MODIFY times if minor adjustments resolve conflicts  
   - DOCUMENT any changes made to accommodate commitments
   ```
   
   8d. **Execute Non-Conflicting Events**: Create calendar events using MCP:
   ```
   For each validated time block (no conflicts):
   
   mcp__google-calendar__create-event:
   - calendarId: "primary" 
   - summary: [Block title with emoji]
   - start: [ISO datetime in Australia/Sydney]
   - end: [ISO datetime in Australia/Sydney] 
   - timeZone: "Australia/Sydney"
   - description: [Include ALL of the following]:
     • Executive instructions (what exactly to do)
     • Strategic alignment (how this serves mission)
     • Values served by this time block
     • UUID tracking section (use UUIDs from uuid-mappings file if available):
       🔗 FRACTAL_UUID: [use from mappings OR generate new UUID for fractal plan linkage]
       📊 FRACTAL_LEVEL: day
       ⚡ EVENT_UUID: [use from mappings OR generate new UUID for this specific event]
       🎯 LLM_TRACKING_ID: [use from mappings OR generate new UUID for AI system tracking]
       📋 TASKWARRIOR_UUID: [TaskWarrior task UUID for cross-linking - extract after task creation]
     • "Generated by Fractal Planning System"
   - colorId: [Type-appropriate color - deep-work=11(red), learning=10(green), admin=7(blue), buffer=1(lavender)]
   - reminders: {"useDefault": false, "overrides": [{"method": "popup", "minutes": 10}, {"method": "popup", "minutes": 2}]}
   ```
   
   **UUID Generation**: Use Node.js crypto.randomUUID() for each required UUID field
   **Description Template**:
   ```
   [Executive Instructions section]
   
   🎯 Alignment: [Strategic alignment]
   🚀 Values: [Values served]
   
   🔗 FRACTAL_UUID: [UUID linking to fractal plan - shared with TaskWarrior]
   📊 FRACTAL_LEVEL: day
   ⚡ EVENT_UUID: [UUID for this specific event - shared with TaskWarrior]  
   🎯 LLM_TRACKING_ID: [UUID for AI system tracking - shared with TaskWarrior]
   📋 TASKWARRIOR_UUID: [TaskWarrior native UUID for bidirectional linking]
   
   Generated by Fractal Planning System
   ```
   
   8e. **Execution Summary**: Report calendar integration results:
   ```
   📅 Calendar Integration Summary:
   ✅ Created: [N events] - [list summaries]
   ⚠️ Skipped: [N events] - [conflicts with existing events]
   📝 Total: [N successful] / [N planned] events synchronized
   ```

9. Provide next steps and integration suggestions:
   - Command to start execution: `/taskmaster-start`
   - Integration with daily check-in workflow
   - Reminder about parent plan alignment

## Critical Safeguards

**AUTOMATED CALENDAR INTEGRATION REQUIREMENTS:**
1. **MANDATORY**: First check existing calendar events via MCP (step 3)
2. **MANDATORY**: Load and respect ritual constraints (step 3.5)
3. **MANDATORY**: Book all rituals to calendar first (step 8a)
4. **MANDATORY**: Only generate time blocks within available ritual windows
5. **MANDATORY**: Compare each generated time block against existing events (step 8c)  
6. **MANDATORY**: Skip or modify conflicting time blocks (step 8c)
7. **MANDATORY**: Only create events for validated, non-conflicting time blocks (step 8d)
8. **MANDATORY**: Report integration results with conflict summary (step 8e)

**Conflict Resolution Hierarchy:**
1. **Skip conflicting blocks**: If overlap exists, skip calendar creation for that block
2. **Modify times**: If minor adjustment (±30 minutes) resolves conflict, adjust and document
3. **Split blocks**: If large block can be split around existing event, create split events
4. **Manual override**: If too many conflicts, fall back to manual calendar creation

**Error Handling:**
- **If calendar check fails**: Assume conflicts exist, skip automated creation, provide manual instructions
- **If MCP commands fail**: Report failure, provide alternative creation methods
- **If conflict detection fails**: Default to conservative approach - skip automated creation

**Success Criteria:**
- All created events must have clear executive instructions
- All created events must show strategic alignment and values served
- All created events must use Australia/Sydney timezone
- All created events must include appropriate reminders
- **All created events must include complete UUID tracking section:**
  - 🔗 FRACTAL_UUID: Links event to fractal planning system
  - 📊 FRACTAL_LEVEL: day (indicates planning level)
  - ⚡ EVENT_UUID: Unique identifier for this specific event
  - 🎯 LLM_TRACKING_ID: AI system tracking and lineage
- All conflicts must be properly documented and resolved
- All UUIDs must be properly generated using crypto.randomUUID()

Remember: Daily plans should align with weekly priorities and support monthly goals through strategic time block allocation, while respecting existing calendar commitments.