# Monthly Planning

Create or update a monthly plan with objectives and milestones aligned to quarterly and yearly strategic goals.

## Usage
```bash
/plan-month [month] [--hitl]  # Add --hitl for Human in the Loop approval workflow
```

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

3. **HITL (Human in the Loop) Decision Point**: If `--hitl` flag is used:
   
   3a. Run the fractal planner in DRAFT mode:
   ```bash
   node scripts/fractal-planner.cjs plan-month [month] --draft
   ```
   
   3b. Present the draft plan to the user for approval:
   ```
   📋 DRAFT MONTHLY PLAN FOR APPROVAL
   📅 Month: [month]
   
   ## Proposed Monthly Theme:
   [Central focus theme for the month]
   
   ## Strategic Objectives:
   [List 5-8 key objectives with quarterly/yearly alignment]
   
   ## Major Milestones:
   [Up to 4 key milestones with target dates]
   
   ## Resource Requirements:
   [Time, energy, and support needed]
   
   ## Strategic Alignment:
   [Connection to quarterly priorities and yearly vision]
   
   ❓ **APPROVAL REQUIRED**: 
   - Type "approve" to finalize the monthly plan
   - Type "revise" with feedback to adjust the plan
   - Type "cancel" to abort planning
   
   💡 **Feedback options**:
   - Adjust scope: "This is too ambitious, reduce objectives"
   - Change focus: "Prioritize portfolio development over administrative tasks"
   - Modify timeline: "Move milestone 2 to next month"
   - Add objectives: "Include certification preparation objective"
   - Resource concerns: "I don't have enough time for objective 3"
   ```
   
   3c. **Revision Loop**: If user requests changes:
   - Incorporate feedback into monthly strategic parameters
   - Re-run fractal planner with adjustments
   - Present updated draft for re-approval
   - Continue until user approves or cancels
   
   3d. **Only proceed to step 4 after user approval**

4. If NOT using `--hitl` OR after HITL approval, execute monthly planning:
   ```bash
   node scripts/fractal-planner.cjs plan-month [month]
   ```

5. Generate comprehensive monthly plan report in `journal/planning/monthly-reviews/plan-YYYY-MM.md`:

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

6. Provide planning cascade recommendations:
   - Weekly planning: `/plan-week` to break down monthly objectives
   - Review previous month: `/review-month` if not completed
   - Strategic alignment check: `/performance-dashboard`

Remember: Monthly plans execute quarterly strategies through weekly tactical implementation.