# Daily Brief

A personalized daily news briefing system that learns what you care about.

## Process:

1. Launch interest-analyzer subagent to:
   - Analyze the user's files to identify interests
   - Look for topics, projects, and areas of focus
   - Create a profile of what matters to them

2. Launch news-curator subagent to:
   - Use web search with date filters for THE LAST 7 DAYS ONLY
   - Search for news related to identified interests
   - Verify all publication dates before including
   - Filter for relevance and actionability
   - Add context about why each item matters to the user
   - Suggest actions they could take

3. Create personalized brief with:
   - Today's date prominently displayed
   - Only stories from the past week (with dates)
   - Explanation of relevance to user's interests
   - Actionable insights or next steps
   - Sources and publication dates

4. Save brief to `/daily-briefs/brief-YYYY-MM-DD.md`

CRITICAL: All news must be from the last 7 days only. Verify dates before including any story.