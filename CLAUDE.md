# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with files and code in this repository.


## Project Overview

Please refer to docs/mission.md for Robert's Mission Statement, everything we do here is to bring Robert closer to his mission.

This is Robert's personal AI engineering journey and life transformation repository. It's a productivity and documentation system designed to support his career transition from technical support to AI software engineer by mid-2026, while managing ADD and financial goals.

## Repository Structure and Philosophy

### Core Principles
- **No root-level .md files** except CLAUDE.md
- **Update existing files** rather than creating duplicates
- All automated commands should reference scripts from `/scripts/` folder
- Scripts are primarily JavaScript (.js/.cjs) with some shell scripts (.sh) and Python utilities (.py)
- **CRITICAL - Time Zone Handling**: ALWAYS use `./scripts/sydney-time.sh checkin` and `./scripts/sydney-time.sh date` for current time/date. NEVER use MCP time tools - they return UTC not Sydney time which confuses the user
- **Slash Command Reference**: Whenever any slash command (e.g., `/morning-checkin`, `/plan-day`, `/skill-status`) is mentioned or requested, ALWAYS read the corresponding command file from `./.claude/commands/[command-name].md` to get the complete implementation details, process steps, and requirements before executing

### Directory Structure
please refer to docs/directory-structure.md


## File Management Standards

### Naming Conventions
- Daily Checkin: `daily-YYYY-MM-DD.md`
- Weekly Review: `weekly-YYYY-WW.md`  
- Victory Log: `victories-YYYY-MM.md`
- Brain Dump: `braindump-YYYY-MM-DD-HHMM-[topic].md`
- Brain Dump Analysis: `analysis-YYYY-MM-DD-HHMM-[topic].md`
- Research: `research-[competitor]-YYYY-MM-DD.md`
- Analysis: `analysis-[type]-YYYY-MM-DD.md`

### Required YAML Frontmatter
All markdown files should include:
```yaml
---
date: YYYY-MM-DD
time: HH:MM                    # Required for brain dumps
type: [daily|weekly|victories|braindump|research|analysis]
source: [text|audio]           # Required for brain dumps
topic: [auto-detected]         # Required for brain dumps
tags: []
status: [raw|draft|review|final|ongoing]
privacy: [public|private|sensitive]
# Brain dump specific fields:
audio_file: filename.wav       # Only if transcribed
duration: 120                  # Seconds, only if transcribed
related: source-file.md        # For analysis files
---
```

### File Management Rules
- Max file size: 500KB (shard larger files in folders)
- Archive files older than 3 months to `/archive/YYYY/Q#/`
- Check for duplicates before creating new files
- Files marked `privacy: sensitive` should use placeholders for actual data

## Development Workflow

### Script Standards
All scripts in `/scripts/` should:
- Include documentation header with purpose, usage, and dependencies
- Be idempotent (safe to run multiple times)
- Log actions to `/logs/scriptname-YYYY-MM-DD.log`
- Handle errors gracefully
- Validate inputs before processing
- Create backups before modifying files

### Commit Message Format
Use conventional commit format:
- `[DAILY] Add checkin for YYYY-MM-DD`
- `[WEEKLY] Update week N review`
- `[RESEARCH] Add competitor analysis for X`
- `[SCRIPT] Add/update script name`
- `[FIX] Correct issue description`
- `[DOCS] Update documentation`

## User Context

### Robert's Background
- 41 years old, aspiring AI engineer with ADD
- Currently in Domo Technical Support (2 years experience)
- Goal: AI software engineer by mid-2026
- Uses RuneQuest TTRPG and Glorantha lore as learning scaffolding
- Financial pressure (no savings, $1M mortgage) as motivation

### ADD-Optimized Workflow
- Time-boxed sessions (4-hour maximum with hard stops)
- Voice recorder for capturing tangential thoughts and adding it to the brain dump transcription system
- Focus on external executive function systems called claudeLifeV2
- Sustainable daily practice over "grinding"

### Key Focus Areas
1. **Coding Fundamentals** - Daily practice reading AI-generated code
2. **Project-Based Learning** - RuneQuest-themed portfolio projects
3. **Financial Automation** - AI-powered personal finance tools
4. **Technical Mastery** - GitHub practices to enterprise architecture

## Privacy and Security

- Never commit files marked `privacy: sensitive` with actual data
- Use placeholders or encryption for sensitive information
- Add `*.private.md` to `.gitignore`
- Sanitize personal information before sharing

## Command Systems

For detailed documentation on all command systems, see:
- **[Command Systems](docs/command-systems.md)** - Smart recommender, check-ins, brain dumps
- **[Fractal Planning](docs/fractal-planning.md)** - Multi-scale planning from daily to yearly
- **[Victory System](docs/victory-system.md)** - Victory tracking and anti-Mimic features
- **[Lessons System](docs/lessons-system.md)** - Learning from challenges and mistakes
- **[Skill Management](docs/skill-management.md)** - Comprehensive skill tracking and development
- **[Job Market Analysis](docs/job-market-system.md)** - Data-driven career insights
- **[Task Integration](docs/task-integration.md)** - TaskWarrior and Pomodoro protocols
- **[Automation Protocols](docs/automation-protocols.md)** - Available scripts and commands

### Quick Reference - Core Commands

#### Essential Daily Commands
- `/morning-checkin` - Energy assessment and daily intentions
- `/plan-day` - Create 4-5 time blocks for ADD-optimized workflow
- `/taskmaster-start` - Execute daily time blocks with focus tracking
- `/evening-checkin` - End-of-day reflection with smart day plan integration
- `/add-victory` - Quick victory entry to fight the Mimic

#### Key Planning Commands  
- `/recommend` - Smart command recommendations based on time and context
- `/skill-status` - Visual progress toward 2026 AI engineering goals
- `/daily-brief` - Personalized NSW news and career insights
- `/brain-dump` - Capture stream-of-consciousness thoughts
- `/calendar-sync` - Convert time blocks to Google Calendar events

## MCP Integration and Setup

See [Calendar Integration Guide](docs/calendar-integration-guide.md) for complete Google Calendar MCP setup instructions, troubleshooting, and usage patterns.

### Quick Setup Summary
1. Install: `npx @cocal/google-calendar-mcp`
2. Configure OAuth credentials in repository root
3. Authenticate via browser flow
4. Add to Claude Code MCP configuration
5. Verify with `/mcp` command

**Note**: All calendar operations use Australia/Sydney timezone by default.

## Quality Checks

Before committing, verify:
- [ ] File is in correct directory
- [ ] Naming convention followed
- [ ] Metadata header complete
- [ ] No duplicate files created
- [ ] Sensitive data sanitized
- [ ] Related scripts updated if needed
- daily brief web research should be based in NSW Australia. Salary information should be AUD dollars

## Financial Planning Memories

### Financial Refinancing and Loan Restructuring
- Comprehensive financial review conducted in October 2023
- Primary focus: Refinancing ANZ loans before interest-only period ends on 6 October
- Current home valuation estimated at $2-2.1 million with 80% LVR
- Total current loan balance: $1,092,235.71
- Exploring options to optimize loan structure and prepare for future investment purchase
- when creating script i prefer it in .js
- I have joing boot.dev for a year now
- I will always favour AI Implementation & Integration: High-demand roles requiring practical skills in implementing existing AI technologies to solve business problems over AI research
- Many organizations will waive degree requirements for candidates with proven implementation skills
- Portfolio projects demonstrating real-world implementation often outweigh academic credentials
- Strategic certifications can help you bypass degree requirements, especially for implementation roles
- Microsoft Certified: Azure AI Engineer Associate will cost $ 165 USD but worth it for recognition in the market
- Microsoft Azure Data Scientist Associate another important certification to aquire $165 USD
- AI Data Processing path to consider for certification: "Microsoft Azure Data Engineer Associate" and "Databricks Generative AI Engineer"
- Strategic Certification Combinations

Full-Stack AI Engineer

Combines: Path 1 (Integration) + Path 3 (Deployment) 

Certifications:
Azure AI Engineer Associate
Certified Kubernetes Application Developer (CKAD)

Value proposition: This combination validates your ability to both integrate AI services and deploy them on scalable infrastructure, positioning you as a full-stack AI implementation specialist.

Target roles:
AI Application Engineer
Full-Stack AI Developer
AI Solutions Engineer
- when something goes wrong, and the user points it out, please fix the systems slash commands/scripts and try not just give the solution, because the user is more concerned about the system behaviour for the future
- remember when updating the system please first consider updating the slash commands to improve it verses creating or modify a script, due to the high insights the llm will gather from the context. later down the track if the user detect a pattern that needs to be in a script maybe we can bake into scripts
- before doing anything please check the time first, as this will inform you.

- if its not on the google calendar then it will never be done. need to ensure that when the user ask for something temporally, please offer to add it to their google calendar with an appropriate time block
- any event add to google calendar needs to be associated with a task in taskWarrior and should have a UUID
- any web search needs to be done by firecrawl mcp
- i really like how you added Next Step recommendation showing the potentail slash commands to use and why