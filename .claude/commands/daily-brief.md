# Daily Brief

A personalized daily news briefing system that learns what you care about.

## Process:

1. Run `node scripts/sydney-time.js` to get current Sydney date and time for accurate filtering

2. Launch interest-analyzer subagent to:
   - Analyze the user's files to identify interests
   - Look for topics, projects, and areas of focus
   - Create a profile of what matters to them

3. Launch news-curator subagent to:
   - Use Sydney time from step 1 to determine exact 7-day cutoff date
   - Use firecrawl mcp with date filters for THE LAST 7 DAYS ONLY
   - Search for news related to identified interests
   - Verify all publication dates against Sydney time data before including
   - Filter for relevance and actionability
   - Add context about why each item matters to the user
   - Suggest actions they could take

4. Create personalized brief with:
   - Current date from Sydney time script prominently displayed
   - Only stories from the past week (with verified dates)
   - Explanation of relevance to user's interests
   - Actionable insights or next steps
   - Sources and publication dates

5. Save brief to `/daily-briefs/brief-YYYY-MM-DD.md` using Sydney date format from the sydney-time.js script

CRITICAL: All news must be from the last 7 days only. Use Sydney time script to verify dates before including any story.

IMPLEMENTATION NOTE: The daily-brief.js script in /scripts/ already imports and uses getSydneyTime() from sydney-time.js for proper date handling.