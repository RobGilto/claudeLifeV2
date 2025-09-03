# Quarterly Planning

Create or update a quarterly plan with strategic priorities and major initiatives aligned to yearly vision.

## Usage
```bash
/plan-quarter [quarter] [--hitl]  # Add --hitl for Human in the Loop approval workflow
```

## Process:

1. Read CLAUDE.md and yearly planning context to understand transformation goals.

2. Load and display foundational context:
   ```
   📈 Planning Quarter: YYYY-QX
   📊 Context: Year YYYY
   🎯 Core Values: [from planning/foundation/values.json]
   🎭 Key Roles: [from planning/foundation/roles.json] 
   ✨ Lifestyle Vision: [from planning/foundation/lifestyle-vision.json]
   📋 Yearly Vision Context:
   - Year Vision: [show from yearly plan if exists]
   - Year Priorities: [show strategic priorities from yearly plan]
   ```

3. Conduct Values Alignment Check:
   - Review each proposed priority against core values
   - Score alignment (1-5) for each value-priority combination
   - Identify potential values conflicts or gaps
   - Suggest adjustments to improve alignment

4. **HITL (Human in the Loop) Decision Point**: If `--hitl` flag is used:
   
   4a. Run the fractal planner in DRAFT mode:
   ```bash
   node scripts/fractal-planner.cjs plan-quarter [quarter] --draft
   ```
   
   4b. Present the draft plan to the user for approval:
   ```
   📋 DRAFT QUARTERLY PLAN FOR APPROVAL
   📅 Quarter: [quarter]
   
   ## Proposed Quarterly Theme:
   [Central strategic focus for the 3-month period]
   
   ## Strategic Priorities:
   [3-5 major focus areas with yearly alignment]
   
   ## Quarterly Objectives:
   [6-10 specific measurable outcomes]
   
   ## Major Milestones:
   [Up to 6 significant achievements with timelines]
   
   ## Values Alignment Analysis:
   [Values scoring and alignment check results]
   
   ## Role Development Focus:
   [Primary role focus and integration strategy]
   
   ## Resource Requirements:
   [Time, energy, financial, and human resources needed]
   
   ❓ **APPROVAL REQUIRED**: 
   - Type "approve" to finalize the quarterly strategic plan
   - Type "revise" with feedback to adjust the plan
   - Type "cancel" to abort planning
   
   💡 **Feedback options**:
   - Adjust strategic scope: "This quarter seems overambitious, reduce priorities"
   - Change focus areas: "Prioritize portfolio development over administrative improvements"
   - Modify timeline: "Move milestone 3 to next quarter"
   - Address values conflicts: "Priority 2 conflicts with work-life balance, adjust"
   - Resource concerns: "I don't have bandwidth for objective 4 with my current job"
   - Role balance: "Too focused on learning role, need more current job stability"
   ```
   
   4c. **Revision Loop**: If user requests changes:
   - Incorporate feedback into quarterly strategic parameters
   - Re-run values alignment check with adjustments
   - Re-run fractal planner with updated priorities
   - Present updated draft for re-approval
   - Continue until user approves or cancels
   
   4d. **Only proceed to step 5 after user approval**

5. If NOT using `--hitl` OR after HITL approval, execute quarterly planning:
   ```bash
   node scripts/fractal-planner.cjs plan-quarter [quarter]
   ```

6. Create comprehensive quarterly strategic plan in `journal/planning/quarterly-reviews/plan-YYYY-QX.md`:

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

   ## Newport Multi-Scale Alignment

   ### Core Values Alignment
   | Priority | Growth | Excellence | Balance | Impact | Other | Score |
   |----------|--------|------------|---------|--------|-------|-------|
   | Priority 1 | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | X/5 |
   | Priority 2 | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | X/5 |
   
   **Values Analysis**:
   - **Strongest Alignment**: [Which values are best served by this quarter's plan]
   - **Values Gaps**: [Which values need more attention]
   - **Conflicts**: [Any values tensions to manage]

   ### Role Development
   **Primary Role Focus**: [Which life role gets primary development this quarter]
   **Role Integration Strategy**: [How to balance competing role demands]
   **Role Transition Support**: [How this quarter advances AI engineer transition]

   ### Lifestyle Vision Progress
   **Vision Milestone**: [Which lifestyle vision milestone this quarter serves]
   **Transformation Progress**: [How this quarter moves you toward ideal lifestyle]
   **Sustainability Check**: [How this aligns with Newport's "slow productivity" principles]

   ### Yearly Vision Alignment
   **Vision Connection**: [How quarterly goals advance yearly transformation]
   **Strategic Priority Mapping**: [Connection between quarterly priorities and yearly strategic focus]

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

7. Strategic planning recommendations:
   - Monthly cascade: `/plan-month` to implement quarterly strategies
   - Previous quarter review: `/review-quarter` if pending  
   - Yearly alignment check: `/performance-trend quarter 4`

Remember: Quarterly plans transform yearly vision into executable monthly and weekly strategies.