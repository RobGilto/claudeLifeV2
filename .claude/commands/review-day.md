# Daily Review

Conduct a daily reflection and performance review of completed time blocks and objectives.

## Process:

1. Read CLAUDE.md and current daily execution context.

2. Show daily execution summary:
   ```
   📅 Reviewing Day: YYYY-MM-DD
   📊 Multi-Index: Day X/365 | Week Y/7 | Month Z/31 | Quarter A/92
   ```

3. Load daily execution data and review completion status:
   ```bash
   node scripts/taskmaster.cjs summary [date]
   ```

4. If no execution data exists, run manual daily review process:

   Ask these reflection questions:
   - **Time Block Review**: How did each planned time block go? (1-10 effectiveness)
   - **Objective Completion**: Which daily objectives were completed?
   - **Energy Patterns**: How was your energy throughout the day? (morning/afternoon/evening)
   - **Focus Quality**: What was your average focus during work blocks? (1-10)
   - **Interruptions**: What disrupted your planned schedule?
   - **Wins & Accomplishments**: What did you achieve today (however small)?
   - **Challenges**: What obstacles did you face?
   - **Tomorrow's Priority**: What's most important for tomorrow?
   - **Alignment**: How well did today support your weekly/monthly goals?

5. Create daily review report in `journal/planning/daily-reviews/review-YYYY-MM-DD.md`:

   ```markdown
   ---
   date: YYYY-MM-DD
   type: daily-review
   completion_rate: XX%
   energy_average: X/10
   focus_average: X/10
   satisfaction: X/10
   ---

   # Daily Review: YYYY-MM-DD

   ## Execution Summary
   - Time blocks completed: X/Y
   - Objectives achieved: X/Y  
   - Overall completion rate: XX%

   ## Time Block Analysis
   [Analysis of each time block performance]

   ## Energy & Focus Patterns
   - Morning energy: X/10
   - Afternoon energy: X/10
   - Average focus: X/10
   - Best performance time: [time period]

   ## Accomplishments & Wins
   [What was achieved today]

   ## Challenges & Learning
   [Obstacles faced and insights gained]

   ## Alignment Assessment  
   - Weekly goal support: [how today advanced weekly priorities]
   - Monthly objective connection: [contribution to monthly goals]

   ## Tomorrow's Planning
   - Top priority: [most important task]
   - Energy optimization: [when to schedule demanding work]
   - Lessons applied: [how to improve tomorrow]

   ## Performance Insights
   [Patterns, improvements, adjustments needed]
   ```

6. Integrate with victory detection - scan accomplishments for victories and append to `/victories/victories-YYYY-MM.md`.

7. Provide next day planning suggestions:
   - Create tomorrow's plan: `/plan-day`
   - Check weekly progress: `/performance-dashboard`

Remember: Daily reviews feed insights into weekly reviews and help optimize future daily planning.