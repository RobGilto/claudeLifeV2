# Weekly Planning

Create or update a weekly plan with priorities and objectives aligned to monthly and quarterly goals.

## Usage
```bash
/plan-week [week] [--hitl]  # Add --hitl for Human in the Loop approval workflow
```

## Process:

1. Read CLAUDE.md and current planning context to understand the user's strategic direction.

2. Show hierarchical planning context with values foundation:
   ```
   📅 Planning Week: YYYY-WXX
   📊 Context: Month YYYY-MM, Quarter YYYY-QX
   🎯 Core Values Focus: [top 3 values from foundation]
   🎭 Primary Roles This Week: [2-3 key roles to advance]
   ✨ Vision Connection: [how this week serves lifestyle vision]
   📋 Parent Alignment:
   - Quarter Focus: [show from quarterly plan if exists]
   - Month Goals: [show from monthly plan if exists]
   ```

3. Conduct Weekly Values Check:
   - Identify which core values this week's priorities serve
   - Check for values balance vs. over-focus on single values
   - Ensure "slow productivity" principles (sustainable pace, quality focus)
   - Verify role development balance

4. **HITL (Human in the Loop) Decision Point**: If `--hitl` flag is used:
   
   4a. Run the fractal planner in DRAFT mode:
   ```bash
   node scripts/fractal-planner.cjs plan-week [week] --draft
   ```
   
   4b. Present the draft plan to the user for approval:
   ```
   📋 DRAFT WEEKLY PLAN FOR APPROVAL
   📅 Week: [week]
   
   ## Proposed Strategic Priorities:
   [List all proposed priorities with monthly/quarterly alignment]
   
   ## Weekly Objectives:
   [List proposed objectives with justification]
   
   ## Values & Role Focus:
   [Show values emphasis and role development plan]
   
   ## Slow Productivity Implementation:
   [Show sustainable pace and quality focus areas]
   
   ❓ **APPROVAL REQUIRED**: 
   - Type "approve" to finalize the weekly plan
   - Type "revise" with feedback to adjust the plan
   - Type "cancel" to abort planning
   
   💡 **Feedback options**:
   - Adjust priorities: "Focus more on skill development, less on admin"
   - Change objectives: "Add portfolio project objective"
   - Modify role balance: "More time for learning role, less for current job"
   - Adjust pace: "This seems too ambitious, reduce scope"
   ```
   
   4c. **Revision Loop**: If user requests changes:
   - Incorporate feedback into strategic parameters
   - Re-run fractal planner with adjustments
   - Present updated draft for re-approval
   - Continue until user approves or cancels
   
   4d. **Only proceed to step 5 after user approval**

5. If NOT using `--hitl` OR after HITL approval, run the fractal planner command:
   ```bash
   node scripts/fractal-planner.cjs plan-week [week]
   ```

5. After successful planning, generate a readable weekly plan report in `journal/planning/weekly-reviews/plan-YYYY-WXX.md`:

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

   ## Newport Multi-Scale Alignment

   ### Values Integration
   **Primary Values This Week**: [2-3 core values emphasized]
   **Values Balance Check**: 
   - Growth: [How this week develops capabilities]
   - Excellence: [Quality focus areas]
   - Balance: [Sustainability measures]
   - [Other core values]: [How they're honored]

   ### Role Development Focus
   **Primary Role**: [Main role receiving development this week]
   **Role Balance**: [How to serve multiple roles without conflict]
   **Transition Support**: [Steps advancing AI engineer journey]

   ### Slow Productivity Principles
   - **Deep Work Blocks**: [Protected focus time this week]
   - **Quality Over Quantity**: [What you'll do fewer of, but better]
   - **Sustainable Pace**: [How you'll avoid overcommitment]

   ## Parent Plan Alignment
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