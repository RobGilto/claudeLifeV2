# Monthly Review

Comprehensive monthly achievement review with strategic insights and quarterly alignment assessment.

## Process:

1. Read CLAUDE.md and monthly planning context to understand objectives and strategic focus.

2. Display monthly review context:
   ```
   📅 Reviewing Month: [Month Name] YYYY
   📊 Context: Quarter YYYY-QX
   📋 Monthly Plan Reference: [show objectives and milestones]
   ```

3. Execute interactive monthly review:
   ```bash
   node scripts/fractal-planner.cjs review-month [month]
   ```

4. Create comprehensive monthly review report in `journal/planning/monthly-reviews/review-YYYY-MM.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   month: YYYY-MM
   type: monthly-review
   completion_rate: XX.X%
   milestone_rate: XX.X%
   satisfaction: X/10
   strategic_alignment: X/10
   ---

   # Monthly Review: [Month Name] YYYY

   ## Executive Summary
   - Objectives completed: X/Y (XX.X%)
   - Milestones achieved: X/Y (XX.X%)
   - Overall month satisfaction: X/10
   - Strategic alignment score: X/10

   ## Objective Achievement Analysis
   ### ✅ Fully Completed Objectives
   [List with impact assessment]

   ### 🔄 Partially Completed Objectives
   [Progress made and remaining work]

   ### ❌ Unaddressed Objectives
   [Reasons and impact assessment]

   ## Milestone Review
   ### 🏆 Achieved Milestones
   [Major accomplishments with dates and impact]

   ### ⏳ Delayed Milestones
   [Status and new target dates]

   ### 🔄 Modified Milestones
   [Changes made and justification]

   ## Weekly Performance Aggregation
   [Summary of weekly performance trends throughout the month]

   ## Strategic Impact Assessment
   ### Quarterly Goal Advancement
   [How monthly achievements advanced quarterly priorities]

   ### Yearly Vision Progress
   [Connection to annual transformation goals]

   ## Performance Insights
   ### What Worked Well
   - High-performing strategies and approaches
   - Successful habit implementations
   - Effective resource utilization

   ### Areas for Improvement  
   - Challenges that hindered progress
   - Process inefficiencies discovered
   - Skill or resource gaps identified

   ## Key Accomplishments
   [Significant achievements beyond planned objectives]

   ## Learning & Growth
   ### Skills Developed
   [New capabilities gained this month]

   ### Insights Discovered
   [Important realizations and pattern recognition]

   ### Mindset Evolution
   [Changes in thinking or approach]

   ## Challenge Analysis
   ### Major Obstacles
   [Significant challenges faced and how they were addressed]

   ### External Factors
   [Outside influences that impacted performance]

   ### Internal Barriers
   [Personal limitations or blocks encountered]

   ## Resource Utilization Review
   - Time allocation effectiveness
   - Energy management insights
   - Tool/system performance
   - Support network utilization

   ## Next Month Strategic Adjustments
   ### Priority Refinements
   [Changes to focus areas based on learning]

   ### Process Improvements
   [Workflow and system optimizations]

   ### Resource Reallocation
   [Adjustments to time, energy, or tool usage]

   ## Quarterly Alignment Check
   [Assessment of how monthly progress supports quarterly success]

   ## Victory Pattern Analysis
   [Summary of victories achieved and patterns observed]
   ```

5. Analyze weekly performance data from the month to identify trends and patterns.

6. Update victory tracking with monthly achievement patterns in `/victories/victories-YYYY-MM.md`.

7. Strategic recommendations:
   - Plan next month: `/plan-month`
   - Quarterly progress check: `/performance-trend quarter`
   - Compare to previous months: `/performance-compare month [this-month] [previous-month]`

Remember: Monthly reviews provide strategic feedback for quarterly planning and reveal important patterns for yearly goal achievement.