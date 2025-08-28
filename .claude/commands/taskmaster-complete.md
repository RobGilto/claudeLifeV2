# Taskmaster Complete

Complete a time block with outcomes tracking and performance metrics.

## Process:

1. Read current execution context and verify block is in progress.

2. Display completion context:
   ```
   🏁 Completing Time Block: [Activity Name]
   ⏰ Started at: [start time]
   📊 Planned vs. Actual Duration: [comparison]
   ```

3. Execute block completion with outcome capture:
   ```bash
   node scripts/taskmaster.cjs complete [blockId]
   ```

4. The script will prompt for post-execution metrics:
   - What did you accomplish? (outcomes)
   - Energy level after completion (1-10)
   - Focus quality during the block (1-10)  
   - Any challenges faced?

5. Display completion summary and performance metrics:
   ```
   ✅ Block completed successfully!
   ⏱️  Actual duration: XX minutes
   📊 Efficiency: XX% (time on task vs. interruptions)
   ⚡ Energy: [before] → [after]
   🎯 Focus quality: X/10
   ```

6. Update strategic alignment tracking:
   - Mark objective progress in daily plan
   - Update weekly goal advancement
   - Track monthly objective contribution

7. Show next block suggestion and workflow continuity:
   ```
   ⏭️  Next block: [time] - [activity]
   Command: /taskmaster-block [nextBlockId]
   
   Or take a strategic break:
   - Review progress: node scripts/taskmaster.cjs status
   - Daily summary: node scripts/taskmaster.cjs summary
   ```

8. Victory detection integration:
   - Scan accomplishments for victory patterns
   - Auto-add detected victories to monthly victory log
   - Display victory count if significant achievements detected

9. ADD workflow optimization reminders:
   - Take breaks between blocks (5-15 minutes)
   - Note energy patterns for future planning
   - Celebrate completion (however small)
   - Process any "rabbit hole" thoughts captured

10. If approaching 4-hour session limit, suggest stopping:
    ```
    ⚠️  Approaching 4-hour session limit (ADD optimization)
    Consider ending session after current block completion.
    ```

Remember: Block completion feeds performance data back into the fractal planning system for continuous improvement and strategic alignment assessment.