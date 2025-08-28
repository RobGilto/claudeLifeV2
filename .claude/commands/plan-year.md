# Yearly Planning

Create or update a yearly vision and strategic plan with transformation goals and mission statement.

## Process:

1. Read CLAUDE.md to understand the user's background, goals, and transformation objectives (e.g., AI engineer transition by 2026).

2. Display transformation context:
   ```
   🌟 Planning Year: YYYY
   🎯 Vision & Transformation Planning
   📋 Current Context:
   - Career transition goals: [from CLAUDE.md]
   - Financial objectives: [from CLAUDE.md]
   - Personal development focus: [from CLAUDE.md]
   ```

3. Execute yearly planning with mission statement capture:
   ```bash
   node scripts/fractal-planner.cjs plan-year [year]
   ```

4. Create comprehensive yearly strategic plan in `journal/planning/mission-statements/plan-YYYY.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   year: YYYY
   type: yearly-plan
   status: active
   mission_version: X.X
   ---

   # Yearly Strategic Plan: YYYY

   ## Mission Statement
   [Core purpose and direction - what you want to become/achieve this year]

   ## Yearly Vision
   [Detailed transformation vision from planning session]

   ## Strategic Priorities (3-4 major focus areas)
   [High-level strategic directions for the year]

   ## Yearly Objectives (8-12 major objectives)
   [Specific measurable outcomes aligned with vision]

   ## Major Milestones (Up to 8 milestones)
   [Significant achievements throughout the year]

   ## Success Metrics
   [How yearly success will be measured]

   ## Transformation Tracking

   ### Career Development
   - Current state: [baseline]
   - Target state: [goal]
   - Key initiatives: [how to achieve]

   ### Financial Goals  
   - Current state: [baseline]
   - Target state: [goal]
   - Key initiatives: [how to achieve]

   ### Personal Growth
   - Current state: [baseline] 
   - Target state: [goal]
   - Key initiatives: [how to achieve]

   ## Quarterly Breakdown Strategy
   [How to cascade yearly vision into quarterly strategic initiatives]

   ## Mission Statement Evolution
   [How the mission may evolve throughout the year]

   ## Resource Requirements
   [Major investments in time, learning, tools, relationships needed]

   ## Risk Assessment
   [Major risks to yearly success and mitigation strategies]

   ## Yearly Review Framework
   [How progress will be measured and reviewed quarterly/annually]
   ```

5. Archive previous mission statement if exists and create evolution tracking in `journal/planning/mission-statements/mission-evolution-YYYY.md`.

6. Strategic cascade recommendations:
   - Quarterly implementation: `/plan-quarter` to begin execution
   - Performance baseline: `/performance-dashboard`
   - Previous year review: `/review-year` if pending

Remember: Yearly planning establishes the foundational mission and vision that cascades through all other planning levels.