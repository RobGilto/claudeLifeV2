# Afternoon Check-in

A mid-day energy and planning checkpoint.

## Process:

1. **Get Current Sydney Time**: Use `./scripts/sydney-time.sh checkin` to get Sydney local time and `./scripts/sydney-time.sh date` for today's date (consistent timezone handling)

2. First, understand the user's context by reading CLAUDE.md or any personal/business files to personalize the greeting and understand their work.

3. **Check Calendar and Planning Context**:
   - Read `/planning/data/day-YYYY-MM-DD.json` using today's actual date to get time blocks and objectives
   - Use MCP TaskWarrior to get current tasks: `mcp__taskwarrior__get_next_tasks`
   - Identify afternoon time blocks (after current time)
   - Note any calendar events or commitments

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
1. **Morning energy level:** (1-10 + brief description)
2. **How did you sleep last night?** (quality/hours)
3. **What are your top 3 priorities for this afternoon?** (Reference planned time blocks)
4. **Any morning wins already?** (however small)
5. **Current focus/energy challenges?**
6. **What's working well so far today?**
7. **How do you feel about your afternoon plan?** (realistic/overwhelming/energizing)
8. Anything else to talk about?

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
   **Morning Energy:** [response]
   **Sleep Quality:** [response] 
   **Afternoon Priorities:**
   1. [priority 1]
   2. [priority 2]
   3. [priority 3]
   
   **Morning Wins:** [response]
   **Current Challenges:** [response]
   **What's Working:** [response]
   **Afternoon Plan Assessment:** [response]
   
   **📅 Today's Afternoon Context:**
   - Planned time blocks: [list from planning data]
   - Key objectives: [from planning data]
   - TaskWarrior tasks: [relevant tasks]
   ```

7. **Victory Detection (Silent Background Process)**:
   Scan the morning wins for victory patterns:
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
