# Noon Check-in

A mid-day energy and planning checkpoint.

## Process:

1. First, understand the user's context by reading CLAUDE.md or any personal/business files to personalize the greeting and understand their work.

2. Check if `/journal/daily/YYYY-MM-DD.md` exists:
   - If exists: Read current content to see if noon session already completed
   - If noon session exists: Acknowledge and offer to update
   - If not exists: Create new file structure

3. Greet them warmly and ask these questions:

🌅 Noon Check-in for [Today's Date] - [Current Time]

Good afternoon! Let's check your mid-day momentum:

1. **Morning energy level:** (1-10 + brief description)
2. **How did you sleep last night?** (quality/hours)
3. **What are your top 3 priorities for this afternoon?**
4. **Any morning wins already?** (however small)
5. **Current focus/energy challenges?**
6. **What's working well so far today?**

4. Save/append to `/journal/daily/YYYY-MM-DD.md` with structure:
   ```yaml
   ---
   date: YYYY-MM-DD
   type: daily
   sessions: [noon]
   status: ongoing
   privacy: private
   ---

   # Daily Journal - [Full Date]

   ## 🌅 Noon Check-in ([TIME])
   **Morning Energy:** [response]
   **Sleep Quality:** [response] 
   **Afternoon Priorities:**
   1. [priority 1]
   2. [priority 2]
   3. [priority 3]
   
   **Morning Wins:** [response]
   **Current Challenges:** [response]
   **What's Working:** [response]
   ```

5. **Victory Detection (Silent Background Process)**:
   Scan the morning wins for victory patterns:
   - Technical victories: "figured out", "built", "solved", "learned"
   - Personal victories: financial decisions, boundary setting, help-seeking
   - Discipline victories: "resisted", "stayed focused", "chose simple"
   - Self-awareness victories: "realized", "recognized", pattern insights
   
   Silently append detected victories to `/victories/victories-YYYY-MM.md` using the established format.

6. NO full analysis yet - save that for evening when both sessions combine.

7. Simple encouragement: "Great momentum! See you this evening for reflection."

Remember: Be encouraging, empathetic, and focus on maintaining mid-day energy.