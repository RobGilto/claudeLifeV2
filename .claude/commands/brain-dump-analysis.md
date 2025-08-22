# Brain Dump Analysis

A brain dump analysis system that extracts insights from stream-of-consciousness writing.

## Process:

1. Scan the braindumps folder for all brain dump files
   - If folder doesn't exist, create it and guide user to add brain dumps

2. Read all brain dump files to understand the full context of thoughts

3. Launch insight-extractor subagent first to:
   - Identify recurring themes and patterns
   - Track thinking evolution over time
   - Find hidden connections between ideas
   - Extract key questions that keep coming up
   - Highlight breakthrough moments
   - Use the user's own words when possible

4. Then launch brain-dump-analyst subagent to:
   - Create a visual mind map of thoughts
   - List top 10 realizations (in exact user words)
   - Show thinking evolution timeline
   - Generate action items mentioned
   - For creators: add content ideas based on insights
   - Make everything visual with ASCII art and emojis

5. Save comprehensive analysis to `/braindumps/analysis/insights-YYYY-MM-DD.md`

The system should:
- Find patterns the user can't see themselves
- Show how ideas connect and evolve
- Extract wisdom from chaotic thoughts
- Make insights actionable
- Celebrate thinking and growth