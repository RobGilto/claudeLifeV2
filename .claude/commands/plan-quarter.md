# Quarterly Planning

Create or update a quarterly plan with strategic priorities and major initiatives aligned to yearly vision.

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

4. Execute quarterly planning:
   ```bash
   node scripts/fractal-planner.cjs plan-quarter [quarter]
   ```

5. Create comprehensive quarterly strategic plan in `journal/planning/quarterly-reviews/plan-YYYY-QX.md`:

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

5. Strategic planning recommendations:
   - Monthly cascade: `/plan-month` to implement quarterly strategies
   - Previous quarter review: `/review-quarter` if pending  
   - Yearly alignment check: `/performance-trend quarter 4`

Remember: Quarterly plans transform yearly vision into executable monthly and weekly strategies.