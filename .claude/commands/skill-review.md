# Skill Review

Weekly skill assessment using RuneQuest-inspired BRP mechanics to track your journey to AI Engineer.

## Process:

1. **Evidence Collection**:
   - Analyze git commits for skill usage
   - Check victory logs for achievements
   - Review daily/weekly checkins for practice patterns
   - Use Firecrawl MCP to research current skill demand if available

2. **BRP Experience Checks**:
   - For each practiced skill, roll d100
   - If roll > current skill level, chance for improvement
   - Improvement based on practice intensity:
     - Daily practice (20+ hours/week): +1d6
     - Regular practice (10+ hours/week): +1d4
     - Moderate practice (5+ hours/week): +1d3
     - Any practice: +1

3. **Skill Matrix Update**:
   - Apply improvements (harder at higher levels)
   - Apply skill decay for unused skills (-1% per month)
   - Update evidence and last practiced dates
   - Save snapshot to skill-history/

4. **Progress Analysis**:
   - Compare current vs 2026 targets
   - Identify top 3 skills needing focus
   - Calculate category averages
   - Track momentum and trends

5. **Report Generation**:
   - Save to `/skills/reviews/YYYY-WW.md`
   - Show experience check results
   - Provide next week recommendations
   - Include RuneQuest flavor text

## Anti-Inflation Measures:
- Evidence required for all improvements
- Max 10% improvement per week
- Skills decay without practice
- External validation bonuses

## Commands:
- Run manually: `/skill-review`
- Auto mode (cron): `node scripts/update-skills.js --auto`

## Integration:
- Daily checkins track skill practice
- Victories provide bonus XP
- Git commits prove skill usage
- Weekly reviews include skill progress

*"Like progressing from Lay Member to Rune Lord, each skill check brings you closer to mastery"*