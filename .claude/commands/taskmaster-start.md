# Taskmaster Start

Begin daily execution session with planned time blocks and alignment context.

## Process:

1. Read CLAUDE.md to understand ADD-optimized workflow preferences (4-hour maximum sessions, time-boxed blocks).

2. Check for existing daily plan and show execution readiness:
   ```
   ⏰ Starting Taskmaster for: YYYY-MM-DD
   📊 Multi-Index: Day X/365 | Week Y/7 | Month Z/31 | Quarter A/92
   📋 Daily Plan Status: [Found/Not Found]
   ```

3. If no daily plan exists, suggest creating one first:
   ```
   ❌ No daily plan found for today.
   📝 Create a plan first: /plan-day
   
   Or create a quick plan now with basic time blocks?
   ```

4. Execute taskmaster initialization:
   ```bash
   node scripts/taskmaster.cjs start [date]
   ```

5. Display execution overview with alignment context:
   ```
   📋 Daily Time Block Overview:
   📊 Total blocks: X (ADD-optimized: 4-5 blocks recommended)
   ⏱️  Total planned time: XXX minutes
   
   🎯 Alignment Context:
   📅 Week Priorities: [show from week plan if exists]
   📆 Month Focus: [show from month plan if exists]
   
   ⏰ Time Blocks:
   [Show each time block with alignment indicators]
   ```

6. Provide execution commands and guidance:
   ```
   🚀 Ready to Execute!
   
   Commands:
   - Start next block: /taskmaster-block [blockId]
   - Check status: node scripts/taskmaster.cjs status
   - Record interruption: node scripts/taskmaster.cjs interrupt [blockId]
   ```

7. If execution session already exists, show current status and next actions.

8. ADD-specific reminders:
   - Set external timers for each block
   - Prepare distraction management tools
   - Have "rabbit hole journal" ready for tangential thoughts
   - Remember 4-hour maximum session limit with hard stops

Remember: Taskmaster execution integrates with the fractal planning hierarchy to maintain strategic alignment during daily work.