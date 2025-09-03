# Skill Update Command

Quick skill level adjustments and evidence tracking.

## Process:

1. **Quick Update Mode**: 
   - Show current skill levels in an interactive table
   - Allow quick +/- adjustments with evidence requirement
   - Update `weeklyPracticeHours` estimates

2. **Evidence Addition**: 
   - Add specific evidence for recent work
   - GitHub commit analysis with MCP integration
   - **Boot.dev profile scraping with Firecrawl integration**
   - Project completion bonuses
   - External validation (course completion, certifications)

3. **GitHub Integration**:
   - Scan recent commits across all repos using GitHub MCP
   - Analyze language usage and complexity
   - Detect new technologies and frameworks
   - Track project completion patterns

4. **Smart Suggestions**:
   - Detect skill usage from commit messages
   - Suggest practice hour adjustments based on activity
   - Flag skills going unused (decay risk)
   - Recommend evidence documentation

5. **Validation Rules**:
   - Require evidence for increases >5%
   - Max 10% weekly improvement per skill
   - Anti-inflation: harder improvements at higher levels
   - Practice time must align with evidence

## Evidence Sources:

### GitHub Evidence Types:
- **Python commits**: Auto-detect .py files, complexity analysis
- **TypeScript/JS**: Framework usage, API integrations
- **System Design**: Architecture decisions, documentation
- **Testing**: Test file patterns, coverage improvements
- **AI Engineering**: Prompt templates, model integrations

### Boot.dev Profile Evidence:
- **Python fundamentals**: Lesson completion, streak consistency
- **Problem solving**: Challenge completions, success rates
- **Learning velocity**: Lessons per day, difficulty progression
- **Skill consistency**: Streak maintenance, engagement patterns
- **Structured learning**: Course progress, systematic practice

## Output:
Updates `skills/skill-matrix.json` with evidence timestamps and saves incremental history to `skills/skill-history/`.

*"Each line of code tells a story of growing mastery"*