# End-of-Day Checkout with Smart Day Plan Integration

End-of-day reflection and tomorrow planning with optional day plan performance review.

## Process:

1. **Get Current Sydney Time**: Use `./scripts/sydney-time.sh checkin` to get Sydney local time and `./scripts/sydney-time.sh date` for today's date (consistent timezone handling).

2. First, understand the user's context by reading CLAUDE.md or any personal/business files to personalize the greeting and understand their work.

3. **Check Calendar and Planning Context**:
   - Check if `/planning/data/day-YYYY-MM-DD.json` exists (using today's actual Sydney date)
   - Use MCP TaskWarrior to get today's completed/remaining tasks: `mcp__taskwarrior__get_next_tasks`
   - Analyze today's time blocks and objective completion from planning data
   - If day plan exists, ask: "I found a day plan for today! Would you like me to run the full performance review using the evening-checkin script? This will include time block analysis and objective completion tracking. (y/n)"
   - If YES: Run `node scripts/end-of-day-checkout.cjs` and stop here (script handles everything)
   - If NO or no day plan: Continue with manual end-of-day checkout with calendar context below

4. **Task Advisory (Human-in-the-Loop)**:
   - Provide tomorrow preparation task suggestions
   - Recommend planning and setup tasks for tomorrow
   - Show exact TaskWarrior commands for suggested tasks
   - Focus on low-energy administrative tasks suitable for end-of-day

5. Check if `/journal/daily/YYYY-MM-DD.md` exists (using today's actual Sydney date):
   - If exists: Read to see if afternoon session exists, append evening section
   - Update metadata: `sessions: [afternoon, evening, end-of-day]` or `[end-of-day]`
   - Set `status: complete`
   - If not exists: Create new file (evening-only case)

6. Greet them warmly with context-aware questions:

🌙 **End-of-Day Checkout for [Today's Date] - [Current Time]**

Good evening! Let's reflect on your entire day:

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

7. **End-of-Day Task Recommendations**: After gathering context, provide tomorrow-focused task suggestions:
   ```
   🌙 END-OF-DAY TASK RECOMMENDATIONS
   
   📅 Tomorrow Preparation:
   • [Planning tasks] - [Reasoning]
     → task add "description" project:Planning priority:L due:tomorrow
   
   📝 Administrative Wrap-up:
   • [Low-energy admin tasks]
   • [Calendar/email review tasks]
   ```

8. Update/save to `/journal/daily/YYYY-MM-DD.md` (using today's actual Sydney date):
   - Update frontmatter: `sessions: [afternoon, evening]` and `status: complete`
   - Append evening section:

   ```markdown
   ## 🌙 End-of-Day Checkout ([TIME])
   **Overall Day Feeling:** [response]
   **Today's Accomplishments:**
   1. [accomplishment 1]
   2. [accomplishment 2] 
   3. [accomplishment 3]
   
   **Tomorrow's Priority:** [response]
   **End Energy Level:** [response]
   **Challenges/Blockers:** [response]
   **Gratitude:** [response]
   **Planning Insights:** [response]
   **Reflections:** [response]
   
   **📅 Today's Execution Review:**
   - Planned time blocks: [list with completion status]
   - Key objectives: [completion status from planning data]
   - TaskWarrior tasks: [completed/remaining status]
   ```

9. Launch the daily-reflection subagent with:
   Analyze today's check-in:
   [provide ALL responses from both afternoon AND evening if both exist]
   [Include planning vs execution analysis from calendar data]
   [Include TaskWarrior completion patterns]
   
   Also reference the last 3 days of entries if available.
   
   Generate:
   - Mood and energy patterns (compare afternoon vs evening if both exist)
   - Planning vs execution effectiveness analysis
   - Time block success patterns
   - Accomplishment momentum score
   - TaskWarrior completion insights
   - Insights about productivity patterns
   - Gentle suggestions for tomorrow's planning
   - Weekly trend if enough data
   - Celebration of wins (however small)

10. Create a visual summary and append to same file as `## 📊 Daily Analysis`

11. **Victory Detection (Silent Background Process)**:
   After saving the end-of-day journal, scan ALL accomplishments (afternoon + evening + end-of-day) for victory patterns:
   - Technical victories: "figured out", "built", "solved", "learned"
   - Personal victories: financial decisions, boundary setting, help-seeking
   - Discipline victories: "resisted", "stayed focused", "chose simple"
   - Self-awareness victories: "realized", "recognized", pattern insights
   
   Silently append detected victories to `/victories/victories-YYYY-MM.md` using the established format.
   
   At the end of the check-in, add a single line:
   "✓ Captured [X] victories today" (where X is the number detected from both sessions)
   
   NO prompts, NO questions, NO interruption to the flow.

Remember: Be encouraging, empathetic, and focus on progress over perfection.