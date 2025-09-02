# View TaskWarrior Project Hierarchy

Display comprehensive project structure, progress, and task relationships with visual hierarchy representation.

## Process:

1. **Identify Project**:
   ```
   Specify project by:
   • Project UUID (from project creation)
   • Project name (e.g., "runequest-tracker")
   • TaskWarrior project identifier (e.g., "portfolio.showcase")
   ```

2. **Execute Project View**:
   ```bash
   node scripts/taskwarrior-project-manager.js project-view [project-identifier]
   ```

3. **Analyze Project Structure**:
   ```
   📊 Review hierarchical display:
   • Parent-child task relationships
   • Completion status for each task
   • Dependencies and blockers
   • Milestone progress
   • Overall project health
   ```

## Example Usage:

```bash
# View by UUID
node scripts/taskwarrior-project-manager.js project-view abc123-def456-ghi789

# View by project name
node scripts/taskwarrior-project-manager.js project-view portfolio.runequest

# View specific TaskWarrior project
node scripts/taskwarrior-project-manager.js project-view portfolio
```

## Sample Output:

```
🎯 PROJECT: RuneQuest Character Tracker
📋 Total Tasks: 8 | ✅ Completed: 3/8 (37.5%) | 🔄 Active: 2 | ⏳ Pending: 3

📁 Project Structure:
├── ✅ Set up GitHub repository with proper CI/CD
├── ✅ Design character data model and database schema
├── 🔄 Implement character creation API endpoints (IN PROGRESS)
│   ├── ✅ Create User model and authentication
│   ├── 🔄 Build character CRUD operations (ACTIVE) 
│   └── ⏳ Add validation and error handling
├── ⏳ Build responsive frontend character forms
│   ├── ⏳ Create character creation wizard
│   └── ⏳ Add character editing interface
├── ⏳ Add skill calculation and character progression
├── ⏳ Deploy to production with monitoring
├── 🎯 MILESTONE: MVP Launch (2025-10-01) - 60% complete
└── 🎯 MILESTONE: Full Feature Release (2025-11-15) - 20% complete

🔗 Calendar Integration:
• Next scheduled work: Tomorrow 9:00-10:30 AM (API development)
• Tasks linked to 3 upcoming calendar events
• 2 tasks ready for scheduling

⚡ Quick Actions:
• /project-breakdown [parent-uuid] - Break down large tasks further
• /plan-day - Schedule next tasks in daily time blocks
• /project-progress [uuid] - Detailed progress analysis
• /calendar-sync - Link pending tasks to calendar
```

## Advanced Project Analysis:

The project view provides multiple perspectives:

### 1. **Dependency Chain Analysis**:
```
🔗 Task Dependencies:
├── Database Schema → API Endpoints → Frontend Forms
├── Authentication → All API Operations  
└── Core Features → Production Deployment
```

### 2. **Critical Path Identification**:
```
⚡ Critical Path (affects milestone dates):
1. Character CRUD operations (blocking frontend)
2. Frontend character forms (blocking MVP)
3. Production deployment setup (blocking launch)

🚨 Potential Blockers:
• API endpoints 2 days behind schedule
• Frontend design decisions pending
```

### 3. **Resource Allocation**:
```
📊 Effort Distribution:
├── Backend Development: 14 hours (40%)
├── Frontend Development: 15 hours (43%)  
├── DevOps/Deployment: 4 hours (11%)
└── Project Management: 2 hours (6%)

⏱️ Time Tracking:
• Estimated Total: 35 hours
• Completed: 14 hours (40%)
• Remaining: 21 hours
• Average Daily Progress: 2.5 hours
```

## Integration Features:

### **Fractal Planning Connection**:
- Shows how project tasks align with weekly/monthly objectives
- Displays which daily time blocks advance project milestones
- Connects to performance tracking and completion analytics

### **Calendar Synchronization**:
- Lists upcoming calendar events linked to project tasks
- Identifies tasks ready for time block scheduling
- Shows time block efficiency and task completion correlation

### **Victory Tracking**:
- Highlights recent project achievements for morale
- Tracks milestone completion for progress celebration
- Feeds project victories into daily victory detection system

## Command Variations:

```bash
# Quick status only
node scripts/taskwarrior-project-manager.js project-view [uuid] --brief

# Include calendar integration
node scripts/taskwarrior-project-manager.js project-view [uuid] --calendar

# Show detailed dependency analysis  
node scripts/taskwarrior-project-manager.js project-view [uuid] --dependencies

# Export project data for analysis
node scripts/taskwarrior-project-manager.js project-view [uuid] --export
```

This command transforms project management from abstract task lists to visual, hierarchical project trees with clear progress tracking and strategic alignment.