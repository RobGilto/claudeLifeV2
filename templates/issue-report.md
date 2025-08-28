---
date: 2025-XX-XX
type: issue-report
component: day-planner-calendar-integration
severity: [low|medium|high|critical]
status: [open|investigating|resolved|closed]
---

# Issue Report: [Brief Description]

## Environment Information
- **Date/Time**: [when you encountered the issue]
- **Operating System**: [Linux/macOS/Windows]  
- **Node.js Version**: `node --version`
- **Repository Path**: [your repo location]
- **Command Used**: `[exact command that failed]`

## Expected vs Actual Behavior

### Expected Result
[Describe what should have happened]

### Actual Result  
[Describe what actually happened]

## Steps to Reproduce
1. [First step]
2. [Second step] 
3. [Third step]
4. [etc.]

## Error Output
```
[Paste the complete error message or unexpected output here]
```

## Files and Data

### Files That Should Be Created
- [ ] JSON plan file: `planning/data/day-YYYY-MM-DD.json`
- [ ] Readable report: `journal/planning/daily-reviews/plan-YYYY-MM-DD.md`
- [ ] Calendar sync data: `planning/data/calendar-sync-YYYY-MM-DD.json`

### Actual Files Created
[List what files were actually created, or note if none were created]

### Sample Command Output
```bash
# Command run:
node scripts/fractal-planner-llm.cjs [your-command-here]

# Output:
[paste output here]
```

## Test Validation Results

### Quick Tests Run
```bash
# Basic functionality test
node scripts/fractal-planner-llm.cjs plan-day 2025-09-15
# Result: [working/failed]

# Calendar sync test  
node scripts/fractal-planner-llm.cjs calendar-sync 2025-09-15
# Result: [working/failed]

# Status test
node scripts/fractal-planner-llm.cjs status
# Result: [working/failed]
```

### Automated Test Results (if run)
```bash
node scripts/run-planner-tests.cjs
# Overall result: [passed/failed] 
# Failed tests: [list any that failed]
```

## System Context

### Directory Structure Check
```bash
ls -la planning/
ls -la journal/planning/
ls -la scripts/fractal-planner-llm.cjs
```

### File Permissions
```bash
ls -la scripts/fractal-planner-llm.cjs
# Should show: -rwxr-xr-x (executable)
```

## Potential Causes
[Your analysis of what might be causing the issue]

## Workaround (if found)
[Any temporary solution you discovered]

## Additional Context
[Any other information that might be relevant]

## MCP Integration Specific (if calendar-related)

### MCP Status
- [ ] Google Calendar MCP server is configured  
- [ ] MCP tools are available in Claude Code
- [ ] Calendar sync generates proper MCP commands

### Generated MCP Command Sample
```json
[If the issue is calendar-related, paste the MCP command that was generated]
```

---

**Priority Level**: [High/Medium/Low]  
**Impact**: [How much this affects your workflow]  
**Urgency**: [How quickly this needs to be fixed]