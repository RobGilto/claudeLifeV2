# Newsletter Research

A newsletter research system that analyzes competitor newsletters and writes drafts.

## Process:

1. First, scan the user's files to find newsletter URLs or ask them to provide competitor newsletter links

2. Fetch recent posts from those newsletters using WebFetch

3. Launch content-researcher subagent to analyze trends:
   - Identify trending topics across newsletters
   - Find content gaps and opportunities
   - Spot time-sensitive angles
   - Pass insights to newsletter-writer

4. Launch newsletter-writer subagent with the research insights to:
   - Create 3 compelling subject line options
   - Write a complete 500-800 word draft
   - Match the user's writing voice based on their existing content
   - Include practical takeaways
   - Add a natural, soft CTA if relevant

5. Save research report to `/newsletter/research-YYYY-MM-DD.md`
6. Save newsletter draft to `/newsletter/drafts/draft-YYYY-MM-DD.md`

Focus on value-first content that sounds authentic, not AI-generated.