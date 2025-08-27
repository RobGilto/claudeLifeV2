# GitHub Skill Scan Command

Comprehensive GitHub MCP analysis to automatically detect skill evidence across all repositories.

## Process:

1. **Repository Discovery**:
   - Scan all user repositories (RobGilto/*)
   - Focus on recently active repos (commits within 30 days)
   - Identify primary languages and frameworks
   - Detect project types and complexity

2. **Commit Analysis**:
   - Analyze commits from last 7-30 days (configurable)
   - Extract skill evidence from commit messages
   - Code diff analysis for complexity assessment
   - Time pattern analysis for practice estimation

3. **Language & Framework Detection**:
   - **Python**: Flask, FastAPI, data science libraries
   - **TypeScript/JavaScript**: React, Node.js, Express, APIs
   - **AI/ML**: OpenAI, Claude, vector databases, embeddings
   - **Data**: SQL queries, ETL patterns, API integrations
   - **DevOps**: Docker, deployment scripts, CI/CD

4. **Skill Evidence Mapping**:
   ```
   GitHub Pattern → Skill Update
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   .py imports pandas → data_engineering.data_modeling
   OpenAI API calls → ai_engineering.llm_fundamentals
   Express.js routes → software_engineering.javascript
   Complex SQL queries → data_engineering.sql
   Test file additions → software_engineering.testing
   Docker configurations → platform_expertise.docker
   ```

5. **Practice Time Inference**:
   - Commit frequency and timing analysis
   - Code change magnitude assessment
   - Session length estimation from commit patterns
   - Cross-reference with daily check-in logs

6. **Project Impact Assessment**:
   - Repository star/fork counts
   - Issue resolution patterns
   - Feature completion evidence
   - Code review participation

7. **Progress Momentum Tracking**:
   - Week-over-week skill activity changes
   - Language usage trend analysis
   - Technology adoption patterns
   - Skill transfer between projects

## Output Report:
```
🔍 GITHUB SKILL SCAN RESULTS
Week ending: 2025-08-27

📊 REPOSITORY ACTIVITY
• claudeLifeV2: 12 commits (JavaScript: 8, Docs: 4)
• AI-Portfolio-Manager: 5 commits (JavaScript: 5)
• supportAgency: 2 commits (TypeScript: 2)

💡 DETECTED SKILL EVIDENCE
✅ JavaScript: 15 commits detected
   → Practice time: ~12 hours estimated  
   → Evidence: Express routes, async patterns
   → Suggestion: Update weeklyPracticeHours to 12

✅ Technical Writing: 4 documentation commits
   → Practice time: ~3 hours estimated
   → Evidence: README updates, command documentation
   → Current skill: 55% → Consider +2% boost

⚠️  Python: No recent activity detected
   → Last commit: 2025-08-15 (12 days ago)
   → Suggestion: Schedule Python practice session
   → Risk: Skill decay if unused >4 weeks

🎯 SKILL MATRIX UPDATES
• javascript: +2% (evidence-based improvement)
• technical_writing: +1% (documentation activity)
• git_github: +1% (consistent commit patterns)

🔄 PRACTICE HOUR ADJUSTMENTS
• JavaScript: 8 → 12 hours/week (based on activity)
• Python: 5 → 3 hours/week (reduced due to inactivity)
• Git/GitHub: 10 → 15 hours/week (high daily usage)
```

## Integration:
- Updates `skill-matrix.json` with evidence
- Logs detailed analysis to `skills/github-analysis.md`
- Triggers skill decay warnings for inactive skills
- Provides weekly practice recommendations

*"Your GitHub activity is your skill growth journal"*