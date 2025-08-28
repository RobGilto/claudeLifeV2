# Taskmaster Block

Execute a specific time block with focus tracking and performance metrics.

## Process:

1. Read current execution context and block details.

2. Display block execution context:
   ```
   🚀 Starting Time Block: [Activity Name]
   ⏰ Planned duration: XX minutes
   🎯 Alignment: [Higher-level goal this supports]
   📊 Block [X] of [Y] for today
   ```

3. Execute time block with pre-execution setup:
   ```bash
   node scripts/taskmaster.cjs block [blockId]
   ```

4. The script will prompt for:
   - Energy level before starting (1-10)
   - Focus level before starting (1-10) 
   - Confirmation to begin

5. Once started, provide execution guidance:
   ```
   ✨ Time block started at [time]
   ⏰ Set a timer for XX minutes
   🎯 Focus on: [activity description]
   
   During execution:
   - Record interruptions: node scripts/taskmaster.cjs interrupt [blockId]
   - Complete when done: /taskmaster-complete [blockId]
   ```

6. ADD-optimized execution reminders:
   - External timer is essential
   - Rabbit hole journal ready for tangential thoughts
   - Phone in another room/drawer mode
   - Single-task focus only
   - Hard stop at planned time (no "just 5 more minutes")

7. Provide alignment context during work:
   ```
   💡 Strategic Context:
   This block supports: [weekly priority]
   Which advances: [monthly objective]  
   Contributing to: [quarterly goal]
   ```

8. If block is already in progress or completed, show current status and next actions.

Remember: Each time block execution maintains connection to the broader strategic planning hierarchy while optimizing for ADD-friendly focused work sessions.