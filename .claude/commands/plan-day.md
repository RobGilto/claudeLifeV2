# Daily Planning

Create or update a daily plan with time blocks aligned to higher-level objectives.

## Process:

1. First read CLAUDE.md and any existing planning context to understand the user's current planning state.

2. Show multi-perspective date indexing and values-aligned parent context:
   ```
   📅 Planning Day: YYYY-MM-DD
   📊 Multi-Index: Day X/365 | Week Y/7 | Month Z/31 | Quarter A/92  
   🎯 Daily Values Focus: [1-2 core values to emphasize today]
   🎭 Primary Role Today: [main role to advance today]
   ✨ Vision Connection: [how today serves lifestyle vision]
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

4. Run the fractal planner command:
   ```bash
   node scripts/fractal-planner.cjs plan-day [date]
   ```
   
   **CRITICAL**: If the script reports "No calendar conflicts detected" but you found events in step 3, DO NOT TRUST the script's calendar check. The calendar detection may have failed and manual verification is required.

5. **Validate planned time blocks against calendar events** before creating any calendar entries:
   ```
   - Compare planned time blocks with existing calendar events
   - Identify any overlaps or conflicts
   - Adjust time blocks if necessary to avoid scheduling conflicts
   - Document any changes made to accommodate existing commitments
   ```

6. If the command succeeds, create a readable daily plan report in `journal/planning/daily-reviews/plan-YYYY-MM-DD.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   type: daily-plan
   status: active
   parent_plans: [week-id, month-id, quarter-id]
   ---

   # Daily Plan: YYYY-MM-DD

   ## Time Block Schedule (ADD-Optimized: 4-5 blocks + 1 buffer)
   [List all time blocks with alignment, including 1.5hr buffer block]

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

7. **AUTOMATIC CALENDAR INTEGRATION**: After plan validation, automatically create calendar events:

   7a. **Load Generated MCP Commands**: Check if fractal planner saved MCP commands:
   ```
   Read planning/analytics/calendar-sync-[date].json for generated MCP commands
   ```
   
   7b. **Conflict Resolution**: Compare generated blocks with existing calendar events:
   ```
   - For each generated time block, check against existing events from step 3
   - SKIP blocks that overlap with existing events
   - MODIFY times if minor adjustments resolve conflicts  
   - DOCUMENT any changes made to accommodate commitments
   ```
   
   7c. **Execute Non-Conflicting Events**: Create calendar events using MCP:
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
     • UUID tracking section:
       🔗 FRACTAL_UUID: [generate new UUID for fractal plan linkage]
       📊 FRACTAL_LEVEL: day
       ⚡ EVENT_UUID: [generate new UUID for this specific event]
       🎯 LLM_TRACKING_ID: [generate new UUID for AI system tracking]
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
   
   🔗 FRACTAL_UUID: [UUID linking to fractal plan]
   📊 FRACTAL_LEVEL: day
   ⚡ EVENT_UUID: [UUID for this specific event]  
   🎯 LLM_TRACKING_ID: [UUID for AI system tracking]
   
   Generated by Fractal Planning System
   ```
   
   7d. **Execution Summary**: Report calendar integration results:
   ```
   📅 Calendar Integration Summary:
   ✅ Created: [N events] - [list summaries]
   ⚠️ Skipped: [N events] - [conflicts with existing events]
   📝 Total: [N successful] / [N planned] events synchronized
   ```

8. Provide next steps and integration suggestions:
   - Command to start execution: `/taskmaster-start`
   - Integration with daily check-in workflow
   - Reminder about parent plan alignment

## Critical Safeguards

**AUTOMATED CALENDAR INTEGRATION REQUIREMENTS:**
1. **MANDATORY**: First check existing calendar events via MCP (step 3)
2. **MANDATORY**: Compare each generated time block against existing events (step 7b)  
3. **MANDATORY**: Skip or modify conflicting time blocks (step 7b)
4. **MANDATORY**: Only create events for validated, non-conflicting time blocks (step 7c)
5. **MANDATORY**: Report integration results with conflict summary (step 7d)

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