# Weekly Check-in

Perform a comprehensive weekly check-in by:

1. First, analyze the entire project context:
   - Read CLAUDE.md to understand the user and their projects
   - Scan any business/, docs/, or similar folders for context
   - Look for existing metrics history to understand what's been tracked
   - Identify what type of work/business this is

2. Based on your analysis, determine the most relevant metrics to track. For example:
   - Creators: followers, subscribers, views, revenue
   - SaaS: MRR, users, churn, growth rate
   - Developers: commits, PRs, stars, downloads
   - Students: courses completed, grades, projects

3. Ask for current metrics using the specific metrics YOU discovered from context

4. After receiving data:
   - Read previous week from `/metrics/metrics-history.md` if it exists
   - Update metrics history with new data
   - Launch metrics-analyst subagent for analysis
   - Save report to `/metrics/weekly-report-YYYY-MM-DD.md`

5. **Context-Aware Victory Display**:
   After completing metrics analysis, check last week's mood/energy patterns from daily checkins:
   
   - **If average mood/energy < 5**: Show 1 random victory from `/victories/victories-YYYY-MM.md` 
     Format: "💪 Victory reminder: [victory description]"
   
   - **If normal week (5-7)**: Victories stay completely silent
   
   - **If exceptional week (>7)**: Celebrate with victory count
     Format: "🎉 You had [X] victories this week!"
   
   Only surface victories when they serve a purpose - encouragement or celebration.

IMPORTANT: Do NOT use generic templates. Discover what's relevant for THIS specific user.