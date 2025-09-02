# Break Down TaskWarrior Task into Subtasks

Convert large, overwhelming tasks into manageable subtasks with proper dependency management and UUID linking.

## Process:

1. **Identify Target Task**:
   ```
   🎯 Find the task to break down:
   • Use TaskWarrior UUID (from task creation)
   • Use task description search
   • Use project hierarchy view to locate parent task
   ```

2. **Analyze Task Complexity**:
   ```
   📋 Assess breakdown requirements:
   • Is this task too large for a single time block (>2 hours)?
   • Can it be broken into logical, sequential steps?
   • Are there dependencies between potential subtasks?
   • What skills/resources are needed for each part?
   ```

3. **Design Subtask Structure**:
   ```
   🔧 Plan the breakdown:
   • 3-6 subtasks (avoid over-fragmentation)
   • Each subtask = 1-3 hours of focused work
   • Clear dependencies and logical sequence
   • Specific, actionable descriptions
   ```

4. **Execute Task Breakdown**:
   ```bash
   node scripts/taskwarrior-project-manager.js break-down [task-uuid] '[
     {
       "description": "First subtask description",
       "estimatedHours": 2
     },
     {
       "description": "Second subtask description", 
       "estimatedHours": 1.5
     }
   ]'
   ```

## Example Breakdown:

**Large Task**: "Implement character creation API endpoints"

```bash
node scripts/taskwarrior-project-manager.js break-down abc123-def456 '[
  {
    "description": "Design API endpoint structure and routing",
    "estimatedHours": 1
  },
  {
    "description": "Create character model with validation rules", 
    "estimatedHours": 2
  },
  {
    "description": "Implement CRUD operations (Create, Read, Update, Delete)",
    "estimatedHours": 3
  },
  {
    "description": "Add error handling and status codes",
    "estimatedHours": 1
  },
  {
    "description": "Write API tests and documentation",
    "estimatedHours": 2
  }
]'
```

## Output Example:

```
🔧 TASK BREAKDOWN COMPLETE

📋 Original Task: "Implement character creation API endpoints"
├── Status: Changed to PARENT task
├── UUID: abc123-def456-ghi789
└── Estimated Hours: 9 total

📝 Created Subtasks:
├── ⏳ Design API endpoint structure and routing
│   ├── UUID: def456-ghi789-jkl012
│   ├── Depends on: [parent task]
│   └── Est: 1 hour
├── ⏳ Create character model with validation rules
│   ├── UUID: ghi789-jkl012-mno345
│   ├── Depends on: [API structure task]
│   └── Est: 2 hours
├── ⏳ Implement CRUD operations (Create, Read, Update, Delete)
│   ├── UUID: jkl012-mno345-pqr678
│   ├── Depends on: [character model task]
│   └── Est: 3 hours
├── ⏳ Add error handling and status codes
│   ├── UUID: mno345-pqr678-stu901
│   ├── Depends on: [CRUD operations task]
│   └── Est: 1 hour
└── ⏳ Write API tests and documentation
    ├── UUID: pqr678-stu901-vwx234
    ├── Depends on: [error handling task]
    └── Est: 2 hours

🎯 Dependency Chain:
1. Design API structure
2. Create character model ← depends on #1
3. Implement CRUD operations ← depends on #2  
4. Add error handling ← depends on #3
5. Write tests & docs ← depends on #4

⚡ Ready for Scheduling:
✅ "Design API endpoint structure" - ready now (no dependencies)
📅 Recommended for next time block: 1-hour focused session
```

## Integration with Daily Planning:

After breakdown, tasks become schedulable in daily time blocks:

```
🗓️  Tomorrow's Time Blocks:
├── 9:00-10:00: Design API endpoint structure (UUID: def456-ghi789-jkl012)
├── 11:00-1:00: Create character model with validation (UUID: ghi789-jkl012-mno345)
└── 2:00-5:00: Implement CRUD operations (UUID: jkl012-mno345-pqr678)

📋 Calendar Event Description:
"Design API endpoint structure and routing
🎯 Alignment: Portfolio building and technical mastery  
🔗 FRACTAL_UUID: [fractal-planning-uuid]
⚡ TASK_UUID: def456-ghi789-jkl012
📊 Progress: Task 1/5 in character API development"
```

## Smart Breakdown Strategies:

### **For Development Tasks**:
```json
[
  {"description": "Research and design phase", "estimatedHours": 1},
  {"description": "Core implementation", "estimatedHours": 3},
  {"description": "Testing and debugging", "estimatedHours": 1.5},
  {"description": "Documentation and cleanup", "estimatedHours": 0.5}
]
```

### **For Learning Tasks**:
```json
[
  {"description": "Read documentation and examples", "estimatedHours": 1},
  {"description": "Follow tutorial or course section", "estimatedHours": 2},
  {"description": "Build practice project", "estimatedHours": 3},
  {"description": "Document learnings and next steps", "estimatedHours": 0.5}
]
```

### **For Complex Problem-Solving**:
```json
[
  {"description": "Analyze problem and gather requirements", "estimatedHours": 1},
  {"description": "Research solutions and alternatives", "estimatedHours": 1.5},
  {"description": "Implement initial solution", "estimatedHours": 2},
  {"description": "Test, refine, and optimize", "estimatedHours": 1.5}
]
```

## Advanced Features:

### **Dependency Management**:
- Automatic dependency chaining for sequential tasks
- Parallel task identification for concurrent work
- Blocker detection and critical path analysis

### **Calendar Integration**:
- Subtasks automatically become available for daily time block scheduling
- Dependencies respected when scheduling (can't schedule task 3 before task 2 completes)
- Progress tracking links back to parent task and project milestones

### **ADD-Optimized Chunking**:
- Each subtask sized for single focused session (1-3 hours)
- Clear entry/exit criteria for each subtask
- Minimal context switching between related subtasks

This transforms overwhelming large tasks into a series of achievable, focused work sessions that build momentum and maintain clarity throughout complex projects.