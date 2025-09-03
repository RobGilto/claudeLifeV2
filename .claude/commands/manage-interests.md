# Manage Interests

Intelligent interest management system for daily brief personalization.

## Process:

1. **Check Arguments**:
   - `add [category] [keyword]` - Add interest keyword to category
   - `remove [category] [keyword]` - Remove specific keyword
   - `list` - Show current interests configuration
   - `analyze` - Auto-detect interests from recent brain dumps and codebase
   - `update-priority [category] [HIGH|MEDIUM|LOW]` - Change category priority
   - `dedupe` - Remove duplicate/similar keywords using LLM intelligence

2. **Load Current Configuration**:
   - Read from `/config/interests.json`
   - Parse categories, priorities, and metadata

3. **Execute Requested Action**:
   
   **For `add [category] [keyword]`**:
   - Validate category exists or create new one
   - Check for duplicates using similarity matching (threshold: 0.8)
   - Add keyword if unique, otherwise suggest existing similar term
   - Update lastUpdated timestamp
   
   **For `remove [category] [keyword]`**:
   - Find and remove exact or similar matches
   - Confirm removal with user
   
   **For `analyze`**:
   - Scan recent brain dumps (last 30 days) for topics
   - Analyze codebase files for technical interests
   - Use LLM intelligence to extract relevant keywords
   - Suggest additions based on frequency and context
   - Present recommendations for user approval
   
   **For `dedupe`**:
   - Compare all keywords within each category
   - Use LLM to identify semantic duplicates
   - Suggest consolidations (e.g., "Python programming" + "Python development" → "Python programming")
   - Batch update after user confirmation

4. **LLM Intelligence Features**:
   - Semantic similarity detection for deduplication
   - Context-aware keyword extraction from brain dumps
   - Priority suggestions based on frequency and urgency
   - Related keyword recommendations

5. **Validation and Feedback**:
   - Ensure interests.json remains valid JSON
   - Respect maxKeywordsPerCategory limits
   - Update version number on structural changes
   - Log all changes for audit trail

6. **Integration Points**:
   - Used by `/daily-brief` for news curation
   - Auto-learning from user feedback on brief relevance
   - Syncs with brain dump analysis for emerging interests

## Usage Examples:
```bash
/manage-interests add career "remote AI jobs Australia"
/manage-interests analyze
/manage-interests dedupe
/manage-interests update-priority learning HIGH
/manage-interests list
```

## Arguments:
- `action` (required): add|remove|list|analyze|update-priority|dedupe
- `category` (conditional): Interest category name
- `keyword` (conditional): Keyword or phrase to manage
- `priority` (conditional): HIGH|MEDIUM|LOW for priority updates

## Notes:
- Changes are immediately saved to interests.json
- All operations include LLM-powered intelligence for relevance and deduplication
- System learns from daily brief feedback to improve interest detection
- Maintains backward compatibility with existing daily-brief.js integration