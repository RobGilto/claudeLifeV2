# Quarterly Planning

Create or update a quarterly plan with strategic priorities and major initiatives aligned to yearly vision.

## Process:

1. Read CLAUDE.md and yearly planning context to understand transformation goals.

2. Show yearly strategic context:
   ```
   📈 Planning Quarter: YYYY-QX
   📊 Context: Year YYYY
   📋 Yearly Vision Context:
   - Year Vision: [show from yearly plan if exists]
   - Year Priorities: [show strategic priorities from yearly plan]
   ```

3. Execute quarterly planning:
   ```bash
   node scripts/fractal-planner.cjs plan-quarter [quarter]
   ```

4. Create comprehensive quarterly strategic plan in `journal/planning/quarterly-reviews/plan-YYYY-QX.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   quarter: YYYY-QX
   type: quarterly-plan
   status: active
   parent_plans: [year-id]
   ---

   # Quarterly Strategic Plan: QX YYYY

   ## Quarterly Theme/Focus
   [Central strategic focus for the 3-month period]

   ## Strategic Priorities (3-5 major focus areas)
   [High-level strategic initiatives]

   ## Quarterly Objectives (6-10 objectives)
   [Specific measurable outcomes aligned with priorities]

   ## Major Milestones (Up to 6 milestones)
   [Significant achievements and their target timelines]

   ## Yearly Vision Alignment

   ### Vision Connection
   [How quarterly goals advance yearly transformation]

   ### Strategic Priority Mapping
   [Connection between quarterly priorities and yearly strategic focus]

   ## Resource Allocation
   [Time, energy, financial, and human resources required]

   ## Success Metrics & KPIs
   [Measurable indicators of quarterly success]

   ## Strategic Initiatives Breakdown

   ### Initiative 1: [Name]
   - Objective: [What]
   - Timeline: [When]  
   - Resources: [How]
   - Success Criteria: [Results]

   [Repeat for each major initiative]

   ## Monthly Cascade Strategy
   [How to break quarterly priorities into monthly objectives]

   ## Risk Assessment & Mitigation
   [Strategic risks and contingency planning]

   ## Quarterly Review Planning
   [How success will be measured and reviewed]
   ```

5. Strategic planning recommendations:
   - Monthly cascade: `/plan-month` to implement quarterly strategies
   - Previous quarter review: `/review-quarter` if pending  
   - Yearly alignment check: `/performance-trend quarter 4`

Remember: Quarterly plans transform yearly vision into executable monthly and weekly strategies.