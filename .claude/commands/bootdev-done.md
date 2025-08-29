# Boot.dev Done Command

Marks today's boot.dev practice session as complete and updates streak tracking.

## Usage
Use this command when you've finished your daily 1-hour boot.dev practice session.

## What It Does
1. **Marks Practice Complete** - Records today's session in the tracking system
2. **Updates Streak** - Extends current streak or starts new one if broken
3. **Updates KPIs** - Synchronizes weekly goals and metrics
4. **Shows Progress** - Displays current streak status and weekly progress
5. **Provides Motivation** - Celebrates milestones and encourages consistency

## Streak Logic
- **Continues Streak**: If you completed yesterday's session
- **Starts New Streak**: If there was a gap since last completion
- **Records History**: Saves completed streaks to history for analysis
- **Milestone Celebrations**: Special messages at 7, 14, and 30-day streaks

## Output Files
- Updates `planning/data/week-YYYY-Www.json` with daily progress
- Creates/updates `planning/data/boot-dev-streak.json` with streak data
- Logs activity to `logs/bootdev-done-YYYY-MM-DD.log`

## Quick Status Commands
After marking complete, you can also use:
- `./scripts/bootdev status` - Show current streak
- `./scripts/bootdev week` - View weekly progress
- `node scripts/boot-dev-tracker.cjs status` - Full status

## Integration
This command integrates with:
- **Weekly Goals**: Updates boot.dev daily practice objective
- **KPI Tracking**: Maintains streak metrics
- **Victory System**: Can trigger automatic victory detection
- **Fractal Planning**: Aligns with daily time block planning