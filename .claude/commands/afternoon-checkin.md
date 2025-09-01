# Afternoon Check-in

An afternoon wrap-up checkpoint to review how the afternoon went (typically 5-6pm).

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
   - Review afternoon time blocks that should be completed by now
   - Check what was planned vs what actually happened

4. Check if `/journal/daily/daily-YYYY-MM-DD.md` exists (using today's actual date):
   - If exists: Read current content to see what sessions are already completed
   - If afternoon session exists: Acknowledge and offer to update
   - If not exists: Create new file structure

5. Greet them warmly with context-aware questions:

🌅 **Afternoon Check-in for [Today's Date] - [Current Time]**

Good afternoon! Let's review how your afternoon went:

**📅 Today's Afternoon Time Blocks (Review):**
[List completed afternoon time blocks and their outcomes]

**📋 TaskWarrior Status:**
[Show relevant pending tasks]

**Check-in Questions:**
1. **Current energy level:** (1-10 + how it compares to earlier)
2. **How did your afternoon go overall?** (1-10 satisfaction rating)
3. **Which time blocks/objectives did you complete?** (reference afternoon plan)
4. **What worked well this afternoon?** (momentum, focus, energy management)
5. **Any challenges or obstacles you faced?**
6. **What would you do differently this afternoon?**
7. **Any breakthroughs or wins worth celebrating?** (however small)
8. **How are you feeling about tomorrow's priorities?**

6. Save/append to `/journal/daily/daily-YYYY-MM-DD.md` (using today's actual date) with structure:
   ```yaml
   ---
   date: YYYY-MM-DD
   type: daily
   sessions: [afternoon]
   status: ongoing
   privacy: private
   ---

   # Daily Journal - [Full Date]

   ## 🌅 Afternoon Check-in ([TIME])
   **Current Energy:** [response]
   **Afternoon Satisfaction:** [response] (1-10 rating)
   **Completed Time Blocks/Objectives:** [response]
   **What Worked Well:** [response]
   **Challenges Faced:** [response]
   **Would Do Differently:** [response]
   **Wins/Breakthroughs:** [response]
   **Tomorrow Outlook:** [response]
   
   **📅 Afternoon Plan Review:**
   - Planned time blocks: [list from planning data with completion status]
   - Key objectives status: [from planning data with outcomes]
   - TaskWarrior tasks: [relevant tasks and progress]
   ```

7. **Victory Detection (Silent Background Process)**:
   Scan accomplishments and breakthroughs for victory patterns:
   - Technical victories: "figured out", "built", "solved", "learned"
   - Personal victories: financial decisions, boundary setting, help-seeking
   - Discipline victories: "resisted", "stayed focused", "chose simple"
   - Self-awareness victories: "realized", "recognized", pattern insights
   
   Silently append detected victories to `/victories/victories-YYYY-MM.md` using the established format.

8. NO full analysis yet - save that for evening when both sessions combine.

9. **Context-Aware Encouragement**: 
   - Reference specific afternoon time blocks
   - Acknowledge any potential energy/challenge alignment
   - Simple encouragement: "Great momentum! Your afternoon plan looks [realistic/energizing]. See you this evening for reflection."

Remember: Be encouraging, empathetic, calendar-aware, and focus on maintaining mid-day energy with realistic afternoon expectations.
