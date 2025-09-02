# Skill Management System

A comprehensive skill tracking and development system for the AI engineering journey, integrating GitHub activity analysis with strategic skill investment planning.

## Core Commands

### `/skill-status` Command
- Visual progress dashboard for all skill categories
- Priority matrix: critical path, quick wins, maintenance, backlog
- GitHub activity analysis with language usage trends
- Weekly trajectory and improvement velocity tracking
- Context-aware recommendations based on recent work
- Streak tracking and momentum preservation

### `/skill-update` Command
- Interactive skill level updates with evidence prompts
- Practice hour tracking and adjustment
- Evidence-based improvement suggestions
- Automatic decay detection for unused skills
- Updates `skills/skill-matrix.json` with new data

### `/skill-review` Command
- Weekly skill progress review and planning
- Gap analysis against 2026 targets
- Practice effectiveness assessment
- Next week focus recommendations

### `/skill-evidence` Command
- Records specific evidence of skill usage
- Links evidence to GitHub commits, projects, or learning
- Provides confidence boost to skill assessments
- Maintains evidence log for portfolio building

### `/skill-investor` Command
- Strategic skill investment planning
- ROI analysis for skill development paths
- Time allocation optimization
- Risk assessment for skill gaps

### `/skill-crafter` Command
- Project-based skill development planning
- Links skills to specific portfolio projects
- Creates learning paths through practical application
- Tracks skill acquisition through project milestones

### `/skill-salesman` Command
- Resume and portfolio skill presentation
- Evidence-based skill claims generator
- Interview preparation with skill stories
- LinkedIn profile optimization suggestions

### `/github-skill-scan` Command
- Comprehensive GitHub activity analysis
- Automatic skill evidence detection from commits
- Language and framework usage tracking
- Practice time inference from commit patterns
- Project impact and complexity assessment
- Updates skill matrix with detected evidence

## Skill Data Structure
```
skills/
├── skill-matrix.json         # Current skill levels and targets
├── skill-evidence.json       # Evidence log for skills
├── skill-investment.json     # Strategic planning data
├── github-analysis.md        # GitHub activity reports
└── skill-reviews/            # Weekly review records
```

## Integration Features
- **GitHub MCP Integration**: Automatic skill detection from repository activity
- **Victory System**: Links skill improvements to victory tracking
- **Job Market Analysis**: Aligns skill development with market demands
- **Daily Brief**: Includes skill recommendations based on gaps
- **Fractal Planning**: Skill practice integrated into time blocks