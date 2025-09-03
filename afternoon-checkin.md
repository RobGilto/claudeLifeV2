# Morning Check-in

An early-day energy assessment and intention-setting checkpoint.

## Process:

1. **Get Current Sydney Time**: Use `./scripts/sydney-time.sh checkin` to get Sydney local time and `./scripts/sydney-time.sh date` for today's date (consistent timezone handling).

2. First, understand the user's context by reading CLAUDE.md or any personal/business files to personalize the greeting and understand their work.

3. **Check Calendar and Planning Context**:
   - Check if `/planning/data/day-YYYY-MM-DD.json` exists for today's plan
   - Use Google Calendar MCP to list today's events: `mcp__google-calendar__list-events`
   - Use MCP TaskWarrior to get pending tasks: `mcp__taskwarrior__get_next_tasks`
   - Analyze morning time blocks (starting before 12:00 PM) and objectives from planning data
   - Present this context before asking morning questions

4. Check if `/journal/daily/YYYY-MM-DD.md` exists (using today's actual Sydney date):
   - If exists: Read current content to see if morning session already completed
   - If morning session exists: Acknowledge and offer to update
   - If not exists: Create new file structure

5. Greet them warmly with context-aware questions:

🌄 Morning Check-in for [Today's Date] - [Current Time]

Good morning! Let's set up your day for success:

**📅 Today's Morning Context:**
[Show existing calendar events]
[Show morning time blocks only - starting before 12:00 PM]  
[Show key TaskWarrior tasks]

**Morning Questions:**
1. **What time did you wake up?**
2. **Morning energy level:** (1-10 + brief description)
3. **How was your sleep?** (quality/hours)
4. **How does your body feel?** (physical state)
5. **What are your intentions for today?** (considering the above commitments)
6. **Top 3 priorities for today:** (aligned with calendar/planning)
7. **What challenges might arise today?**
8. **What's one thing you commit to completing?** (from tasks or time blocks)
9. **Anything else to note?**

6. Save/append to `/journal/daily/YYYY-MM-DD.md` (using today's actual Sydney date) with structure:
   ```yaml
   ---
   date: YYYY-MM-DD
   type: daily
   sessions: [morning]
   status: ongoing
   privacy: private
   ---

   # Daily Journal - [Full Date]

   ## 🌄 Morning Check-in ([TIME])
   **Wake Time:** [response]
   **Energy Level:** [response]
   **Sleep Quality:** [response]
   **Physical State:** [response]
   
   **📅 Today's Morning Context:**
   - Calendar Events: [list key events]
   - Morning Time Blocks: [blocks starting before 12:00 PM]
   - Key Tasks: [from TaskWarrior]
   
   **Morning Intentions:**
   [response - now informed by context]
   
   **Focus for Today:**
   1. [priority 1 - aligned with schedule]
   2. [priority 2 - aligned with schedule]
   3. [priority 3 - aligned with schedule]
   
   **Potential Challenges:** [response]
   **Commitment:** [response]
   ```

7. **Victory Detection (Silent Background Process)**:
   Scan intentions and commitments for victory patterns:
   - Technical victories: "will figure out", "will build", "will solve", "will learn"
   - Personal victories: boundary setting intentions, self-care plans
   - Discipline victories: "will resist", "will stay focused", "will complete"
   - Self-awareness victories: recognizing patterns, acknowledging needs
   
   Silently append detected victories to `/victories/victories-YYYY-MM.md` using the established format.

8. NO full analysis yet - save that for evening when all sessions combine.

9. Simple encouragement focusing on energy and intention:
   - "Your intentions are set!"
   - "Energy follows action"
   - "Small wins compound"

## Differences from Noon Check-in:
- **Morning**: Forward-looking (intentions, priorities, commitments)
- **Noon**: Mid-day assessment (morning wins, afternoon focus, energy check)
- **Evening**: Reflection and integration (full day review, analysis, tomorrow planning)

## Script Integration:
Run the JavaScript script at `/scripts/morning-checkin.js` which:
- Prompts for all responses interactively
- Saves to journal with proper formatting
- Detects and logs victories automatically
- Maintains session tracking metadata
- Logs all activities to `/logs/morning-checkin-YYYY-MM-DD.log`

Remember: Be encouraging, focus on possibility, and help them start the day with clarity and energy.