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

3. Run the fractal planner command:
   ```bash
   node scripts/fractal-planner.cjs plan-day [date]
   ```

4. If the command succeeds, create a readable daily plan report in `journal/planning/daily-reviews/plan-YYYY-MM-DD.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   type: daily-plan
   status: active
   parent_plans: [week-id, month-id, quarter-id]
   ---

   # Daily Plan: YYYY-MM-DD

   ## Time Block Schedule (ADD-Optimized: 4-5 blocks)
   [List all time blocks with alignment]

   ## Daily Objectives (Max 3 for focus)
   [List objectives with parent alignment]

   ## Parent Alignment Context
   [Show relevant parent priorities and goals]
   
   ## Notes
   [Any additional planning notes]
   ```

5. Provide next steps and integration suggestions:
   - Command to start execution: `/taskmaster-start`
   - Integration with daily check-in workflow
   - Reminder about parent plan alignment

Remember: Daily plans should align with weekly priorities and support monthly goals through strategic time block allocation.