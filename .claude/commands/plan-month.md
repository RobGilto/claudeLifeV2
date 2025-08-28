# Monthly Planning

Create or update a monthly plan with objectives and milestones aligned to quarterly and yearly strategic goals.

## Process:

1. Read CLAUDE.md and existing planning hierarchy to understand strategic context.

2. Display strategic alignment context:
   ```
   📆 Planning Month: YYYY-MM
   📊 Context: Quarter YYYY-QX, Year YYYY
   📋 Strategic Alignment:
   - Year Vision: [show from yearly plan if exists]
   - Quarter Priorities: [show from quarterly plan if exists]
   ```

3. Execute monthly planning:
   ```bash
   node scripts/fractal-planner.cjs plan-month [month]
   ```

4. Generate comprehensive monthly plan report in `journal/planning/monthly-reviews/plan-YYYY-MM.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   month: YYYY-MM
   type: monthly-plan
   status: active
   parent_plans: [quarter-id, year-id]
   ---

   # Monthly Plan: [Month Name] YYYY

   ## Monthly Theme
   [Central theme/focus for the month]

   ## Strategic Objectives (5-8 key outcomes)
   [List with quarterly/yearly alignment]

   ## Major Milestones (Up to 4 milestones)
   [Key achievements and their target dates]

   ## Strategic Alignment

   ### Quarterly Connection
   [How monthly objectives support quarterly priorities]

   ### Yearly Vision Alignment
   [Connection to annual transformation goals]

   ## Success Metrics
   [Measurable outcomes for monthly success]

   ## Resource Requirements
   [Time, energy, tools, or support needed]

   ## Weekly Breakdown Guidance
   [How to cascade monthly goals into weekly priorities]

   ## Risk Mitigation
   [Potential challenges and mitigation strategies]
   ```

5. Provide planning cascade recommendations:
   - Weekly planning: `/plan-week` to break down monthly objectives
   - Review previous month: `/review-month` if not completed
   - Strategic alignment check: `/performance-dashboard`

Remember: Monthly plans execute quarterly strategies through weekly tactical implementation.