# Evening Check-in

End-of-day reflection and tomorrow planning.

## Process:

1. First, understand the user's context by reading CLAUDE.md or any personal/business files to personalize the greeting and understand their work.

2. Check if `/journal/daily/YYYY-MM-DD.md` exists:
   - If exists: Read to see if noon session exists, append evening section
   - Update metadata: `sessions: [noon, evening]` or `[evening]`
   - Set `status: complete`
   - If not exists: Create new file (evening-only case)

3. Greet them warmly and ask these questions:

🌙 Evening Check-in for [Today's Date] - [Current Time]

Good evening! Let's reflect on your day:

1. **How are you feeling about today overall?** (1-10 + description)
2. **What are 3 things you accomplished today?** (big or small)
3. **What's your #1 priority for tomorrow?**
4. **End-of-day energy level:** (1-10)
5. **Any challenges or blockers you faced?**
6. **What are you grateful for today?**
7. **Any other thoughts or reflections?**

4. Update/save to `/journal/daily/YYYY-MM-DD.md`:
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

5. Launch the daily-reflection subagent with:
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

6. Create a visual summary and append to same file as `## 📊 Daily Analysis`

7. **Victory Detection (Silent Background Process)**:
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