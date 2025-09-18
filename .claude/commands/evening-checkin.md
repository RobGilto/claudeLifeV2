# Evening Check-in

An evening wrap-up checkpoint to review how the evening went (typically 6-8pm).

## Process:

1. **CRITICAL - Get Current Sydney Time FIRST**: 
   - ALWAYS use `./scripts/sydney-time.sh checkin` to get Sydney local time
   - ALWAYS use `./scripts/sydney-time.sh date` for today's date 
   - NEVER use MCP time tools - they return UTC not Sydney time
   - This prevents showing wrong time zones to the user

2. First, understand the user's context by reading CLAUDE.md or any personal/business files to personalize the greeting and understand their work.

3. **Check Calendar and Planning Context**:
   - Read `/planning/data/day-YYYY-MM-DD.json` using today's actual date to get time blocks and objectives
   - Use MCP TaskWarrior to get current tasks: `mcp__taskwarrior__get_next_tasks`
   - Review evening time blocks that should be completed by now
   - Check what was planned vs what actually happened

4. **Task Advisory (Human-in-the-Loop)**:
   - Provide intelligent suggestions for remaining evening tasks
   - Recommend tasks for wind-down and tomorrow preparation
   - Show exact TaskWarrior commands for suggested tasks
   - Focus on administrative and reflection tasks suitable for evening energy

5. Check if `/journal/daily/daily-YYYY-MM-DD.md` exists (using today's actual date):
   - If exists: Read current content to see what sessions are already completed
   - If evening session exists: Acknowledge and offer to update
   - If not exists: Create new file structure

6. Greet them warmly with context-aware questions:

🌆 **Evening Check-in for [Today's Date] - [Current Time]**

Good evening! Let's review how your evening went:

**📅 Today's Evening Time Blocks (Review):**
[List completed evening time blocks and their outcomes]

**📋 TaskWarrior Status:**
[Show relevant pending tasks]

**Check-in Questions:**
1. **Current energy level:** (1-10 + how it compares to earlier)
2. **How did your evening go overall?** (1-10 satisfaction rating)
3. **Which time blocks/objectives did you complete?** (reference evening plan)
4. **What worked well this evening?** (momentum, focus, energy management)
5. **Any challenges or obstacles you faced?**
6. **What would you do differently this evening?**
7. **Any breakthroughs or wins worth celebrating?** (however small)
8. **How are you feeling about tomorrow's priorities?**

7. **Evening Task Recommendations**: After gathering context, provide evening-specific task suggestions:
   ```
   🌆 EVENING TASK RECOMMENDATIONS
   
   📝 Administrative & Reflection:
   • [Specific task] - [Reasoning]
     → task add "description" project:X priority:L due:today
   
   📅 Tomorrow Preparation:
   • [Task planning/setup tasks]
   • [Calendar review tasks]
   ```

8. Save/append to `/journal/daily/daily-YYYY-MM-DD.md` (using today's actual date) with structure:
   ```yaml
   ---
   date: YYYY-MM-DD
   type: daily
   sessions: [evening]
   status: ongoing
   privacy: private
   ---

   # Daily Journal - [Full Date]

   ## 🌆 Evening Check-in ([TIME])
   **Current Energy:** [response]
   **Evening Satisfaction:** [response] (1-10 rating)
   **Completed Time Blocks/Objectives:** [response]
   **What Worked Well:** [response]
   **Challenges Faced:** [response]
   **Would Do Differently:** [response]
   **Wins/Breakthroughs:** [response]
   **Tomorrow Outlook:** [response]
   
   **📅 Evening Plan Review:**
   - Planned time blocks: [list from planning data with completion status]
   - Key objectives status: [from planning data with outcomes]
   - TaskWarrior tasks: [relevant tasks and progress]
   ```

9. **Victory Detection (Silent Background Process)**:
   Scan completed objectives and breakthroughs for victory patterns:
   - Technical victories: "figured out", "built", "solved", "learned"
   - Personal victories: financial decisions, boundary setting, help-seeking
   - Discipline victories: "resisted", "stayed focused", "chose simple"
   - Self-awareness victories: "realized", "recognized", pattern insights
   
   Silently append detected victories to `/victories/victories-YYYY-MM.md` using the established format.

8. NO full analysis yet - save that for end-of-day when all sessions combine.

9. **Context-Aware Encouragement**: 
   - Reference specific completed evening accomplishments
   - Acknowledge challenges faced and how they were handled
   - Simple encouragement: "Great work this evening! Your evening progress shows [specific observation]. Looking forward to your end-of-day reflection."

## Script Integration:
Run the JavaScript script at `/scripts/evening-checkin.js` which:
- Prompts for all responses interactively
- Saves to journal with proper formatting
- Detects and logs victories automatically
- Maintains session tracking metadata
- Logs all activities to `/logs/evening-checkin-YYYY-MM-DD.log`

Remember: Be encouraging, empathetic, and focused on celebrating evening accomplishments while setting up for a good end-of-day wrap-up.