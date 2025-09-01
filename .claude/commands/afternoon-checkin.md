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
   - If exists: Read current content to see if noon session already completed
   - If afternoon session exists: Acknowledge and offer to update
   - If not exists: Create new file structure

5. Greet them warmly with context-aware questions:

🌅 **Afternoon Check-in for [Today's Date] - [Current Time]**

Good afternoon! Let's check your mid-day momentum:

**📅 Today's Afternoon Plan:**
[List upcoming time blocks and objectives from planning data]

**📋 TaskWarrior Status:**
[Show relevant pending tasks]

**Check-in Questions:**
1. **Current energy level:** (1-10 + how it compares to morning)
2. **What have you accomplished so far today?** (reference morning plan)
3. **What are your top 3 priorities for the remaining day?** (Reference planned time blocks)
4. **Any momentum or breakthroughs?** (however small)
5. **Current focus/energy challenges?**
6. **What's working well in your approach today?**
7. **How realistic does your remaining plan feel?** (too much/just right/could do more)
8. **Need to adjust anything for the rest of the day?**

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
   **Accomplished So Far:** [response]
   **Remaining Day Priorities:**
   1. [priority 1]
   2. [priority 2]
   3. [priority 3]
   
   **Momentum/Breakthroughs:** [response]
   **Current Challenges:** [response]
   **What's Working:** [response]
   **Plan Assessment:** [response]
   **Adjustments Needed:** [response]
   
   **📅 Today's Afternoon Context:**
   - Planned time blocks: [list from planning data]
   - Key objectives: [from planning data]
   - TaskWarrior tasks: [relevant tasks]
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
