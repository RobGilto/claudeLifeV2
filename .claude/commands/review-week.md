# Weekly Review

Automatically generates comprehensive weekly performance review from daily check-ins and planning data.

## Process:

1. Determine which week to review (current, last, or specific week ID).

2. Execute automated weekly review that gathers data from:
   - **Subjective Data**: Daily journal entries in `/journal/daily/` (evening check-ins, accomplishments, gratitude, challenges)
   - **Objective Data**: Daily performance reviews in `/journal/planning/daily-reviews/` (time blocks, objectives, effectiveness scores)
   - **Planning Data**: Weekly planning objectives in `/planning/data/`
   - **Victory patterns** from accomplishments across both subjective and objective sources
   - **Energy and mood metrics** from daily check-ins and day reviews

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
   - Average energy level: X/10 (from daily check-ins + day reviews)
   - Average focus quality: X/10 (from day review effectiveness scores)
   - Week satisfaction: X/10 (aggregated daily satisfaction)
   - Best performance days: [days] (based on both mood and objective performance)
   - Challenging days: [days and reasons] (from both subjective challenges and objective low completion rates)

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
   - Most productive time/day: [when] (from objective time block effectiveness + subjective energy reports)
   - Energy optimization: [what worked] (correlated from both check-in energy and day review performance)
   - Focus challenges: [what hindered concentration] (from both subjective challenges and objective low effectiveness scores)
   - Workflow insights: [process improvements discovered] (from both reflection insights and execution analysis)

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

5. The review automatically includes:
   - **Subjective Performance metrics** from daily check-ins (mood, accomplishments, gratitude, challenges)
   - **Objective Performance metrics** from daily reviews (time block completion, effectiveness scores, objective completion rates)
   - **Integrated Victory detection** from both accomplishments (subjective) and completed objectives (objective)
   - **Comprehensive Energy trends** from both daily check-in energy ratings and day review focus scores
   - **Holistic Challenge analysis** combining subjective challenges with objective performance gaps
   - **Parent plan alignment** (monthly/quarterly) with both planned and actual execution data

6. Display review summary and location of full report.

7. Provide strategic recommendations:
   - Plan next week: `/plan-week`
   - Check monthly progress: `/performance-dashboard`
   - Compare to previous weeks: `/performance-compare week [this-week] [previous-week]`

## Key Features:
- **No user interaction required** - Fully automated data gathering
- **Intelligent victory detection** - Finds wins from accomplishments
- **Energy pattern analysis** - Tracks trends from daily check-ins
- **Comprehensive insights** - Aggregates all weekly data automatically

## Example Usage:
```bash
# Review current week
./scripts/review-week.sh current

# Review last week
./scripts/review-week.sh last

# Review specific week
./scripts/review-week.sh 2025-W35
```

Remember: This automated review eliminates the need for manual data entry by leveraging your existing daily check-ins.