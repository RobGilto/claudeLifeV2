# Analyze TaskWarrior Project Dependencies

Comprehensive analysis of project task dependencies, critical path identification, blocker detection, and milestone risk assessment.

## Process:

1. **Identify Project for Analysis**:
   ```
   🎯 Specify project:
   • Project UUID (from creation)
   • TaskWarrior project name (e.g., "portfolio.showcase")
   • Project identifier string
   ```

2. **Execute Dependency Analysis**:
   ```bash
   node scripts/taskwarrior-project-manager.js dependency-analysis [project-identifier]
   ```

3. **Review Analysis Results**:
   ```
   📊 Analyze multiple dimensions:
   • Critical path through project (longest dependent chain)
   • Current blockers and blocked tasks
   • Milestone progress and risk assessment
   • Overall project risk factors
   ```

## Example Usage:

```bash
# Analyze by project name
node scripts/taskwarrior-project-manager.js dependency-analysis portfolio.showcase

# Analyze by project UUID
node scripts/taskwarrior-project-manager.js dependency-analysis abc123-def456-ghi789

# Analyze specific project hierarchy
node scripts/taskwarrior-project-manager.js dependency-analysis daily.objectives
```

## Sample Analysis Output:

```
🔗 DEPENDENCY ANALYSIS: portfolio.showcase.runequest
📋 Total Tasks: 12

⚡ Critical Path:
├── Set up GitHub repository with proper structure
├── Design character data model and database schema
├── Implement character creation API endpoints
├── Build responsive frontend character forms
└── Deploy to production with monitoring
📊 Estimated Hours: 18

🚫 Current Blockers:
⏳ Build responsive frontend forms (blocked by 1 task)
   └── Waiting for: Implement character creation API endpoints
🚨 Implement character creation API endpoints (blocking 2 tasks)
   └── Affecting: Frontend forms, Character editing interface

🎯 Milestone Progress:
78% - MVP Launch (2025-10-01) (LOW risk)
34% - Full Feature Release (2025-11-15) (MEDIUM risk)

⚠️ Risk Assessment: MEDIUM
   • 1 high-impact blocker affecting multiple tasks
   • Full release milestone behind schedule
```

## Advanced Dependency Insights:

### **Critical Path Analysis**:
```
⚡ CRITICAL PATH BREAKDOWN:
├── 🔥 CRITICAL: API endpoints → Frontend → Deployment
├── ⚡ Path Length: 5 tasks (18 estimated hours)
├── 🎯 Path Controls: MVP milestone completion
└── 📅 Timeline Impact: Any delay affects entire project

⚠️ Critical Path Risks:
• API development 20% behind estimate
• Frontend dependency on API completion
• Single-threaded deployment knowledge
```

### **Blocker Impact Analysis**:
```
🚨 HIGH-IMPACT BLOCKERS:
├── Task: "Implement API endpoints" 
├── Status: In Progress (60% complete)
├── Blocking: 3 downstream tasks
├── Impact Scope: Frontend development cannot start
└── Resolution Priority: URGENT

📋 Recommended Actions:
1. Focus next 2 time blocks on API completion
2. Prepare frontend scaffolding in parallel
3. Consider breaking API task into smaller chunks
```

### **Milestone Risk Assessment**:
```
🎯 MILESTONE RISK ANALYSIS:

MVP Launch (Oct 1, 2025):
├── 📊 Progress: 78% complete
├── 📅 Days Remaining: 28 days
├── ⚡ Critical Path Status: On track
├── 🚨 Risk Level: LOW
└── 🎯 Confidence: 85%

Full Release (Nov 15, 2025):
├── 📊 Progress: 34% complete
├── 📅 Days Remaining: 73 days
├── ⚡ Critical Path Status: Behind by 3 days
├── 🚨 Risk Level: MEDIUM
└── 🎯 Confidence: 65%

🚀 Risk Mitigation Strategies:
• Prioritize high-impact tasks in critical path
• Consider scope reduction for full release
• Add buffer time for integration testing
```

## Integration with Planning System:

### **Daily Time Block Optimization**:
- **Blocker Priority**: Tasks blocking others get scheduled first
- **Critical Path Focus**: Time blocks prioritize critical path tasks
- **Dependency Respect**: Won't schedule dependent tasks until prerequisites complete

### **Weekly Planning Enhancement**:
- **Milestone Tracking**: Weekly reviews include dependency progress
- **Risk Mitigation**: Weekly plans address identified dependency risks
- **Resource Allocation**: Time allocation based on critical path analysis

### **Progress Tracking**:
- **Completion Velocity**: Track how quickly dependencies resolve
- **Blocker Detection**: Automated alerts when new blockers emerge  
- **Critical Path Monitoring**: Track if critical path completion stays on schedule

## Strategic Decision Support:

### **Resource Allocation**:
```
📊 Recommended Time Allocation:
├── Critical Path Tasks: 60% of available time
├── Blocker Resolution: 25% of available time
├── Milestone Preparation: 10% of available time
└── Buffer/Risk Management: 5% of available time
```

### **Scope Management**:
```
🎯 Scope Recommendations:
• MVP Focus: Keep scope tight, critical path only
• Full Release: Consider deferring non-critical features
• Risk Management: Build buffer time into estimates
• Quality Gates: Don't compromise milestone quality for speed
```

### **Timeline Optimization**:
```
⏱️ Timeline Strategies:
├── Parallel Work: Identify tasks that can run concurrently
├── Early Starts: Begin non-dependent tasks immediately
├── Buffer Management: Add 20% buffer to critical path
└── Scope Flexibility: Identify features that can be deferred
```

This dependency analysis transforms project management from task completion tracking to strategic project intelligence, enabling data-driven decisions about time allocation, risk mitigation, and scope management for optimal project success.