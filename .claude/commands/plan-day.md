# Daily Planning

Create or update a daily plan with time blocks aligned to higher-level objectives.

## Process:

1. First read CLAUDE.md and any existing planning context to understand the user's current planning state.

2. Show multi-perspective date indexing and parent plan context:
   ```
   📅 Planning Day: YYYY-MM-DD
   📊 Multi-Index: Day X/365 | Week Y/7 | Month Z/31 | Quarter A/92  
   📋 Parent Context:
   - Week Priorities: [show from week plan if exists]
   - Month Goals: [show from month plan if exists]
   - Quarter Focus: [show from quarter plan if exists]
   ```

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

   ## Parent Alignment Context
   [Show relevant parent priorities and goals]
   
   ## Notes
   [Any additional planning notes]
   ```

7. **ONLY AFTER VALIDATION**: Create calendar events if no conflicts exist:
   ```
   - Use Google Calendar MCP to create events for validated time blocks
   - Include proper descriptions and reminders
   - Set Australia/Sydney timezone
   - Add strategic alignment context in descriptions
   ```

8. Provide next steps and integration suggestions:
   - Command to start execution: `/taskmaster-start`
   - Integration with daily check-in workflow
   - Reminder about parent plan alignment

## Critical Safeguards

**NEVER create calendar events without:**
1. First checking existing calendar events manually via MCP
2. Validating no conflicts exist between planned blocks and existing events  
3. Adjusting time blocks to accommodate pre-existing commitments

**If calendar check fails or returns empty results:**
- Assume conflicts exist
- Manually verify calendar availability
- Do not proceed with automated calendar creation

Remember: Daily plans should align with weekly priorities and support monthly goals through strategic time block allocation, while respecting existing calendar commitments.