# Daily Review

Conduct a daily reflection and performance review of completed time blocks and objectives.

## Process:

1. Read CLAUDE.md and current daily execution context.

2. **Check if today is Sunday** (day of week = 0):
   - If Sunday: Note that this is the last day of the week
   - Prepare to suggest weekly review after daily review completion

3. Show daily execution summary:
   ```
   📅 Reviewing Day: YYYY-MM-DD (Sunday - Week End)
   📊 Multi-Index: Day X/365 | Week Y/7 | Month Z/31 | Quarter A/92
   ```

4. Load daily execution data and review completion status:
   ```bash
   node scripts/taskmaster.cjs summary [date]
   ```

5. If no execution data exists, run manual daily review process:

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

6. Create daily review report in `journal/planning/daily-reviews/review-YYYY-MM-DD.md`:

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

7. Integrate with victory detection - scan accomplishments for victories and append to `/victories/victories-YYYY-MM.md`.

8. **Sunday Week-End Intelligence**:
   If today is Sunday, provide this enhanced completion message:
   
   ```
   🎉 Daily Review Complete - Week End Reached!
   
   📊 Since today is Sunday (the last day of the week), you now have a full collection of daily data points ready for strategic analysis.
   
   🏆 **Recommended Next Action**: 
   Run `/review-week` to conduct your weekly performance review and strategic planning session.
   
   **Why This Matters**: 
   - Weekly reviews synthesize 7 days of execution data into actionable insights
   - Pattern recognition across the week reveals optimization opportunities  
   - Strategic adjustments for next week based on completed week's learning
   - Momentum maintenance through systematic reflection and planning
   
   **Your Weekly Review Will Include**:
   - Objective completion analysis across all daily reviews
   - Energy and focus pattern recognition
   - Victory synthesis and pattern analysis  
   - Strategic insights for next week's planning
   - Performance trends and improvement areas
   
   Would you like to run your weekly review now? (y/n)
   If YES: Execute `/review-week current`
   ```

9. **Regular Day Completion** (Monday-Saturday):
   Provide standard next day planning suggestions:
   - Create tomorrow's plan: `/plan-day`
   - Check weekly progress: `/performance-dashboard`

Remember: Daily reviews feed insights into weekly reviews. Sunday daily reviews trigger intelligent weekly review suggestions to maximize the value of accumulated weekly data.