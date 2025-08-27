# Skill Evidence Command

Add concrete evidence for skill improvements with GitHub MCP integration.

## Process:

1. **Evidence Collection**:
   - Manual evidence entry with structured prompts
   - GitHub MCP auto-detection from recent commits
   - Project completion documentation
   - External validation (courses, certifications, reviews)

2. **GitHub MCP Analysis**:
   - Scan commits across all repos (RobGilto/*)
   - Language complexity analysis (lines, patterns, frameworks)
   - New technology detection
   - Cross-repository skill transfer evidence

3. **Evidence Types & Skill Mapping**:

   **AI Engineering**:
   - Prompt template commits → prompt_engineering
   - Model integration code → llm_fundamentals  
   - Vector/embedding usage → embeddings_vectors
   - RAG implementations → rag_implementation

   **Software Engineering**:
   - .py file commits with analysis → python
   - .js/.ts commits with complexity → javascript/typescript
   - Test file additions → testing
   - Architecture documentation → system_design
   - Debug session outcomes → debugging

   **Data Engineering**:
   - SQL query optimizations → sql
   - API integration commits → api_integration
   - Data pipeline code → etl_pipelines
   - Schema modifications → data_modeling

4. **Evidence Validation**:
   - Commit message analysis for skill relevance
   - Code complexity scoring (beginner/intermediate/advanced)
   - Successful deployment evidence
   - Peer review/collaboration evidence

5. **Practice Time Estimation**:
   - GitHub commit timestamp analysis
   - Session duration inference from commit patterns
   - Cross-reference with daily check-in logs
   - Automatic practice hour suggestions

6. **Anti-Inflation Measures**:
   - Evidence must be recent (within last 7 days)
   - Code complexity must justify skill level claims
   - Peer validation for significant jumps
   - Pattern detection to prevent gaming

## Usage Scenarios:
- `/skill-evidence` - Auto-scan recent GitHub activity
- `/skill-evidence python` - Focus on specific skill
- `/skill-evidence --manual` - Add non-GitHub evidence

## Output:
- Updates skill evidence arrays in `skill-matrix.json`
- Suggests practice hour adjustments
- Provides improvement recommendations
- Logs to `skills/evidence-log.md` for audit trail

*"Let your code speak to your growth"*