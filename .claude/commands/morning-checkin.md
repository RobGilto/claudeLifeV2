# Morning Check-in

An early-day energy assessment and intention-setting checkpoint.

## Process:

1. First, understand the user's context by reading CLAUDE.md or any personal/business files to personalize the greeting and understand their work.

2. Check if `/journal/daily/YYYY-MM-DD.md` exists:
   - If exists: Read current content to see if morning session already completed
   - If morning session exists: Acknowledge and offer to update
   - If not exists: Create new file structure

3. Greet them warmly and ask these questions:

🌄 Morning Check-in for [Today's Date] - [Current Time]

Good morning! Let's set up your day for success:

1. **What time did you wake up?**
2. **Morning energy level:** (1-10 + brief description)
3. **How was your sleep?** (quality/hours)
4. **How does your body feel?** (physical state)
5. **What are your intentions for today?**
6. **Top 3 priorities for today:**
7. **What challenges might arise today?**
8. **What's one thing you commit to completing?**
9. Anything else to note?

4. Save/append to `/journal/daily/YYYY-MM-DD.md` with structure:
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
   
   **Morning Intentions:**
   [response]
   
   **Focus for Today:**
   1. [priority 1]
   2. [priority 2]
   3. [priority 3]
   
   **Potential Challenges:** [response]
   **Commitment:** [response]
   ```

5. **Victory Detection (Silent Background Process)**:
   Scan intentions and commitments for victory patterns:
   - Technical victories: "will figure out", "will build", "will solve", "will learn"
   - Personal victories: boundary setting intentions, self-care plans
   - Discipline victories: "will resist", "will stay focused", "will complete"
   - Self-awareness victories: recognizing patterns, acknowledging needs
   
   Silently append detected victories to `/victories/victories-YYYY-MM.md` using the established format.

6. NO full analysis yet - save that for evening when all sessions combine.

7. Simple encouragement focusing on energy and intention:
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