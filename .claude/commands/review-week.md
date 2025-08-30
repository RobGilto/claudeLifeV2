# Weekly Review

Automatically generates comprehensive weekly performance review from daily check-ins and planning data.

## Process:

1. Determine which week to review (current, last, or specific week ID).

2. Execute automated weekly review that gathers data from:
   - Daily journal entries in `/journal/daily/`
   - Weekly planning objectives in `/planning/data/`
   - Victory patterns from accomplishments
   - Energy and mood metrics from check-ins

3. Run the automated review script:
   ```bash
   node scripts/automated-weekly-review.cjs [week]
   ```
   Where [week] can be:
   - `current` - Review current week
   - `last` - Review previous week  
   - `2025-W35` - Review specific week

4. The script automatically generates comprehensive weekly review report in `journal/planning/weekly-reviews/review-YYYY-WXX.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   week: YYYY-WXX
   type: weekly-review
   completion_rate: XX.X%
   satisfaction: X/10
   energy_average: X/10
   focus_average: X/10
   ---

   # Weekly Review: Week XX, YYYY

   ## Performance Summary
   - Objectives completed: X/Y (XX.X%)
   - Priorities addressed: X/Y
   - Overall satisfaction: X/10

   ## Objective Review
   ### ✅ Completed Objectives
   [List completed objectives with brief notes]

   ### ⏳ Partially Completed  
   [Objectives with partial progress and remaining work]

   ### ❌ Not Started
   [Objectives not addressed and reasons]

   ## Well-being Metrics
   - Average energy level: X/10
   - Average focus quality: X/10
   - Week satisfaction: X/10
   - Best performance days: [days]
   - Challenging days: [days and reasons]

   ## Weekly Insights
   [Key insights from the week - patterns, learnings, discoveries]

   ## Accomplishments & Wins
   [Significant achievements and progress made]

   ## Challenges & Obstacles
   [What hindered progress and how challenges were handled]

   ## Parent Plan Alignment
   ### Monthly Goal Contribution
   [How this week advanced monthly objectives]

   ### Quarterly Strategic Progress
   [Connection to quarterly priorities and initiatives]

   ## Performance Patterns
   - Most productive time/day: [when]
   - Energy optimization: [what worked]
   - Focus challenges: [what hindered concentration]
   - Workflow insights: [process improvements discovered]

   ## Adjustments for Next Week
   [Specific changes to implement based on this week's learnings]

   ## Next Week Preparation
   - Carry forward priorities: [unfinished important work]
   - New focus areas: [emerging priorities]
   - Process improvements: [workflow adjustments]
   - Energy management: [how to optimize energy next week]

   ## Victory Detection
   [Automatically detected victories from accomplishments]
   ```

5. Update weekly performance data and check for victory patterns to add to `/victories/victories-YYYY-MM.md`.

6. Provide strategic recommendations:
   - Plan next week: `/plan-week`
   - Check monthly progress: `/performance-dashboard`
   - Compare to previous weeks: `/performance-compare week [this-week] [previous-week]`

Remember: Weekly reviews are crucial for continuous improvement and maintaining alignment with longer-term strategic goals.