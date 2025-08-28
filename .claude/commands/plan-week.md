# Weekly Planning

Create or update a weekly plan with priorities and objectives aligned to monthly and quarterly goals.

## Process:

1. Read CLAUDE.md and current planning context to understand the user's strategic direction.

2. Show hierarchical planning context:
   ```
   📅 Planning Week: YYYY-WXX
   📊 Context: Month YYYY-MM, Quarter YYYY-QX
   📋 Parent Alignment:
   - Quarter Focus: [show from quarterly plan if exists]
   - Month Goals: [show from monthly plan if exists]
   ```

3. Run the fractal planner command:
   ```bash
   node scripts/fractal-planner.cjs plan-week [week]
   ```

4. After successful planning, generate a readable weekly plan report in `journal/planning/weekly-reviews/plan-YYYY-WXX.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   week: YYYY-WXX
   type: weekly-plan
   status: active
   parent_plans: [month-id, quarter-id]
   ---

   # Weekly Plan: Week XX of YYYY

   ## Weekly Theme/Context
   [Weekly focus theme]

   ## Strategic Priorities (3-5 key focus areas)
   [List priorities with parent alignment]

   ## Weekly Objectives (Up to 8 objectives)
   [List objectives with strategic alignment]

   ## Parent Alignment
   ### Monthly Goals Connection
   [Show how weekly priorities support monthly objectives]
   
   ### Quarterly Strategic Alignment  
   [Show connection to quarterly initiatives]

   ## Success Metrics
   [How to measure weekly success]

   ## Preparation for Daily Planning
   [Guidance for breaking down weekly priorities into daily time blocks]
   ```

5. Suggest next actions:
   - Daily planning: `/plan-day` for tomorrow
   - Review last week if not done: `/review-week`
   - Check overall planning status: `/performance-dashboard`

Remember: Weekly plans bridge strategic monthly/quarterly goals with tactical daily execution.