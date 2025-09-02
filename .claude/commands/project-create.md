# Create TaskWarrior Project Hierarchy

Create a comprehensive project with hierarchical task breakdown using TaskWarrior's native features.

## Process:

1. **Project Planning Phase**:
   ```
   📋 Gather project requirements:
   • Project name and description
   • Strategic alignment (how it serves 2026 AI engineer transformation)
   • Priority level (H/M/L)
   • Estimated completion timeline
   • Major milestones and dependencies
   ```

2. **Task Breakdown Structure**:
   ```
   🎯 Create hierarchical task structure:
   • Parent project task with strategic alignment
   • 3-8 major subtasks (executable chunks)
   • Dependencies between subtasks where logical
   • Milestone tasks for major achievements
   • All tasks linked via UUIDs for full traceability
   ```

3. **Execute Project Creation**:
   ```bash
   node scripts/taskwarrior-project-manager.js create-project '{
     "name": "Project Name",
     "description": "Strategic description",
     "project": "portfolio",
     "priority": "H",
     "subtasks": [
       {
         "description": "First major task",
         "estimatedHours": 4
       },
       {
         "description": "Second major task", 
         "estimatedHours": 6
       }
     ],
     "milestones": [
       {
         "name": "MVP Complete",
         "description": "Minimum viable product ready",
         "dueDate": "2025-10-15"
       }
     ]
   }'
   ```

4. **Verify Project Structure**:
   ```bash
   node scripts/taskwarrior-project-manager.js project-view [project-uuid]
   ```

5. **Integration with Planning System**:
   ```
   📅 Connect project to daily planning:
   • Link daily time blocks to specific subtask UUIDs
   • Schedule subtasks across multiple days/weeks
   • Track progress through fractal planning reviews
   • Update project metadata with completion status
   ```

## Example Project Creation:

**RuneQuest Character Tracker Project:**
```json
{
  "name": "RuneQuest Character Tracker",
  "description": "Full-stack web application for RPG character management",
  "project": "portfolio.showcase",
  "priority": "H",
  "subtasks": [
    {
      "description": "Set up GitHub repository with proper CI/CD",
      "estimatedHours": 2
    },
    {
      "description": "Design character data model and database schema",
      "estimatedHours": 4
    },
    {
      "description": "Implement character creation API endpoints",
      "estimatedHours": 8
    },
    {
      "description": "Build responsive frontend character forms",
      "estimatedHours": 12
    },
    {
      "description": "Add skill calculation and character progression",
      "estimatedHours": 6
    },
    {
      "description": "Deploy to production with monitoring",
      "estimatedHours": 3
    }
  ],
  "milestones": [
    {
      "name": "MVP Launch",
      "description": "Basic character creation and management live",
      "dueDate": "2025-10-01"
    },
    {
      "name": "Full Feature Release", 
      "description": "Complete character management with all RPG features",
      "dueDate": "2025-11-15"
    }
  ]
}
```

## Output and Tracking:

After project creation, the system provides:

```
✅ Project Created Successfully:
📁 Project UUID: abc123-def456-ghi789
🎯 Parent Task UUID: task-parent-uuid
📝 Subtasks Created: 6
🏆 Milestones: 2
🔗 Fractal Planning Integration: Ready

📋 Project Structure:
├── 🎯 RuneQuest Character Tracker (Parent)
├── 📝 Set up GitHub repository with proper CI/CD
├── 📝 Design character data model and database schema  
├── 📝 Implement character creation API endpoints
├── 📝 Build responsive frontend character forms
├── 📝 Add skill calculation and character progression
├── 📝 Deploy to production with monitoring
├── 🏆 MILESTONE: MVP Launch (2025-10-01)
└── 🏆 MILESTONE: Full Feature Release (2025-11-15)

🔄 Next Steps:
• Use /project-view [uuid] to see current status
• Use /plan-day to schedule work on specific subtasks
• Use /project-progress [uuid] to track completion
```

## Integration with Daily Planning:

When running `/plan-day`, the system can now:
- **Smart Time Block Allocation**: Link time blocks to specific project subtasks
- **Progress Tracking**: Calendar events reference TaskWarrior UUIDs for full traceability
- **Context Awareness**: Time blocks show which project milestone they advance
- **Dependency Management**: Respect task dependencies when scheduling work

## Project Management Commands Available:

- `/project-create` - Create new hierarchical project
- `/project-view [uuid]` - Show project structure and progress
- `/project-breakdown [task-uuid]` - Break existing task into subtasks
- `/project-progress [uuid]` - Detailed progress analysis
- `/project-link-calendar [task-uuid]` - Link task to calendar event

This transforms your planning from generic "work on project" to specific "complete character API endpoints (UUID: xyz123) to advance RuneQuest Tracker MVP milestone."