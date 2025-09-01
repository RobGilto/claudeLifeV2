# Evening Check-in with Smart Day Plan Integration

End-of-day reflection and tomorrow planning with optional day plan performance review.

## Process:

1. First, understand the user's context by reading CLAUDE.md or any personal/business files to personalize the greeting and understand their work.

2. **Check Calendar and Planning Context**:
   - Check if `/planning/data/day-YYYY-MM-DD.json` exists
   - Use MCP TaskWarrior to get today's completed/remaining tasks: `mcp__taskwarrior__get_next_tasks`
   - Analyze today's time blocks and objective completion from planning data
   - If day plan exists, ask: "I found a day plan for today! Would you like me to run the full performance review using the evening-checkin script? This will include time block analysis and objective completion tracking. (y/n)"
   - If YES: Run `node scripts/evening-checkin.cjs` and stop here (script handles everything)
   - If NO or no day plan: Continue with manual evening checkin with calendar context below

3. Check if `/journal/daily/YYYY-MM-DD.md` exists:
   - If exists: Read to see if noon session exists, append evening section
   - Update metadata: `sessions: [noon, evening]` or `[evening]`
   - Set `status: complete`
   - If not exists: Create new file (evening-only case)

4. Greet them warmly with context-aware questions:

🌙 **Evening Check-in for [Today's Date] - [Current Time]**

Good evening! Let's reflect on your day:

**📅 Today's Plan Review:**
[Show planned time blocks and their intended completion status]

**📋 TaskWarrior Status:**
[Show completed vs remaining tasks from TaskWarrior]

**Reflection Questions:**
1. **How are you feeling about today overall?** (1-10 + description)
2. **What are 3 things you accomplished today?** (Reference planned objectives and actual work)
3. **How did your time blocks go?** (Which worked well, which didn't)
4. **What's your #1 priority for tomorrow?**
5. **End-of-day energy level:** (1-10)
6. **Any challenges or blockers you faced?** 
7. **What are you grateful for today?**
8. **Any insights about your planning vs execution?**
9. **Any other thoughts or reflections?**

5. Update/save to `/journal/daily/YYYY-MM-DD.md`:
   - Update frontmatter: `sessions: [noon, evening]` and `status: complete`
   - Append evening section:

   ```markdown
   ## 🌙 Evening Check-in ([TIME])
   **Overall Day Feeling:** [response]
   **Today's Accomplishments:**
   1. [accomplishment 1]
   2. [accomplishment 2] 
   3. [accomplishment 3]
   
   **Tomorrow's Priority:** [response]
   **End Energy Level:** [response]
   **Challenges/Blockers:** [response]
   **Gratitude:** [response]
   **Reflections:** [response]
   ```

6. Launch the daily-reflection subagent with:
   Analyze today's check-in:
   [provide ALL responses from both noon AND evening if both exist]
   
   Also reference the last 3 days of entries if available.
   
   Generate:
   - Mood and energy patterns (compare noon vs evening if both exist)
   - Accomplishment momentum score
   - Insights about productivity patterns
   - Gentle suggestions for tomorrow
   - Weekly trend if enough data
   - Celebration of wins (however small)

7. Create a visual summary and append to same file as `## 📊 Daily Analysis`

8. **Victory Detection (Silent Background Process)**:
   After saving the evening journal, scan ALL accomplishments (noon + evening) for victory patterns:
   - Technical victories: "figured out", "built", "solved", "learned"
   - Personal victories: financial decisions, boundary setting, help-seeking
   - Discipline victories: "resisted", "stayed focused", "chose simple"
   - Self-awareness victories: "realized", "recognized", pattern insights
   
   Silently append detected victories to `/victories/victories-YYYY-MM.md` using the established format.
   
   At the end of the check-in, add a single line:
   "✓ Captured [X] victories today" (where X is the number detected from both sessions)
   
   NO prompts, NO questions, NO interruption to the flow.

Remember: Be encouraging, empathetic, and focus on progress over perfection.