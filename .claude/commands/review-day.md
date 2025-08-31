# Daily Review

Conduct a daily reflection and performance review of completed time blocks and objectives.

## Process:

1. Read CLAUDE.md and current daily execution context.

2. **Detect Period Boundaries** (Multi-Scale Intelligence):
   - **Check if today is Sunday** (day of week = 0): Week-end reached
   - **Check if today is month-end**: Last day of current month
   - **Check if today is quarter-end**: March 31, June 30, Sept 30, or Dec 31  
   - **Check if today is year-end**: December 31
   - **Prepare cascade suggestions** based on all detected boundaries

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

8. **Period-Boundary Intelligence** (Multi-Scale Detection):
   Check for all applicable period boundaries and suggest reviews in logical cascade order:
   
   **A. Sunday (Week-End) Detection**:
   If today is Sunday, provide this message:
   
   ```
   🎉 Daily Review Complete - Week End Reached!
   
   📊 Since today is Sunday (the last day of the week), you now have a full collection of daily data points ready for strategic analysis.
   
   🏆 **Step 1 - Weekly Review**: 
   Run `/review-week current` to conduct your weekly performance review and strategic planning session.
   
   **Why Weekly Reviews Matter**: 
   - Weekly reviews synthesize 7 days of execution data into actionable insights
   - Pattern recognition across the week reveals optimization opportunities  
   - Strategic adjustments for next week based on completed week's learning
   - Momentum maintenance through systematic reflection and planning
   ```
   
   **B. Month-End Detection**:
   If today is the last day of the month, add this message:
   
   ```
   🗓️ **Month-End Reached!**
   
   📈 You've completed a full month of data collection. After your weekly review, complete your monthly strategic assessment.
   
   🎯 **Step 2 - Monthly Review**: 
   After weekly review, run `/review-month current` to capture:
   - Monthly objective and milestone completion analysis
   - Victory pattern analysis across the entire month
   - Strategic insights for quarterly goal alignment
   - Performance trends and breakthrough identification
   - Financial and career progress assessment toward 2026 goals
   
   **Strategic Value**: Monthly reviews provide the big-picture context that enables effective quarterly planning.
   ```
   
   **C. Quarter-End Detection**:
   If today is the last day of the quarter (March 31, June 30, Sept 30, Dec 31), add this message:
   
   ```
   🎯 **Quarter-End Reached!**
   
   🚀 You've completed a full quarter of strategic execution. This is your most important review opportunity.
   
   🏆 **Step 3 - Quarterly Review**: 
   After weekly and monthly reviews, run `/review-quarter current` to assess:
   - Quarterly strategic priority achievement and impact
   - Major milestone completion and strategic progress
   - Long-term trend identification and pattern recognition
   - Vision alignment evaluation and strategic pivot opportunities
   - Comprehensive achievement synthesis across 3 months of work
   
   **Critical Importance**: Quarterly reviews enable you to:
   - Plan the next quarter with deep strategic insight
   - Adjust your 2026 AI engineering transition timeline
   - Optimize resource allocation based on proven performance patterns
   - Identify breakthrough opportunities for accelerated progress
   
   **Next Quarter Planning**: After quarterly review, use `/plan-quarter [next-quarter]` for strategic Q4 planning
   ```
   
   **D. Year-End Detection**:
   If today is December 31, add this message:
   
   ```
   🌟 **Year-End Reached!**
   
   🎉 You've completed a full year of strategic transformation work!
   
   🏆 **Step 4 - Annual Review**: 
   After all other reviews, run `/review-year current` for comprehensive assessment:
   - Annual transformation goal achievement evaluation
   - Strategic vision alignment and mission fulfillment assessment
   - Year-over-year growth analysis and breakthrough identification
   - Career transition progress toward 2026 AI engineering goals
   - Personal development and financial progress evaluation
   
   **Year Transition**: Annual reviews set the foundation for next year's strategic vision and planning
   ```

9. **Complete Cascade Example** (September 30, 2025 - Sunday + Month-End + Quarter-End):
   If today is Sunday + Month-End + Quarter-End, provide the complete sequence:
   
   ```
   🌟 **Triple Boundary Confluence Detected!**
   
   🎯 Today is Sunday (week-end) + Month-end + Quarter-end - the perfect strategic review opportunity!
   
   **Complete Review Cascade Sequence**:
   
   **Step 1**: `/review-week current` (2025-W39)
   - Complete weekly execution analysis first
   - 7 days of tactical performance data
   
   **Step 2**: `/review-month current` (2025-09)  
   - Build on weekly insights for monthly strategic assessment
   - September's "Professional Demonstration and Market Positioning" theme evaluation
   
   **Step 3**: `/review-quarter current` (2025-Q3)
   - Synthesize 3 months of strategic progress
   - Critical Q3 → Q4 transition analysis for career timeline
   
   **Step 4**: `/plan-quarter 2025-Q4`
   - Use all review insights to plan October-December strategic execution
   - Position for final quarter of AI engineering preparation before 2026
   
   **Why This Sequence Matters**:
   Your AI engineering transition by mid-2026 depends on systematic reflection and strategic planning. This triple confluence gives you unprecedented insight into:
   - What execution patterns drive breakthrough results
   - Which strategic approaches accelerate your technical competency development  
   - How to optimize Q4 for maximum career transition momentum
   
   **Time Investment**: ~2-3 hours total, but provides foundation for Q4 success
   ```

10. **Regular Day Completion** (Monday-Saturday):
    Provide standard next day planning suggestions:
    - Create tomorrow's plan: `/plan-day`
    - Check weekly progress: `/performance-dashboard`

Remember: Daily reviews create the foundation data. Period boundary detection triggers intelligent cascading review suggestions (daily → weekly → monthly → quarterly → yearly) to maximize strategic insight and planning effectiveness across all time scales.