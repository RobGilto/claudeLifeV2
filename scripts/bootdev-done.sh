#!/bin/bash

# Boot.dev Done Slash Command
# 
# Marks boot.dev practice as complete and shows updated status
#
# Usage: /bootdev-done
# 
# Dependencies: boot-dev-tracker.cjs
# Logs actions to /logs/bootdev-done-YYYY-MM-DD.log

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/../logs"
LOG_FILE="$LOG_DIR/bootdev-done-$(date +%Y-%m-%d).log"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Log function
log_action() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

echo "# Boot.dev Practice Complete! 🎯"
echo ""

log_action "Starting bootdev-done slash command"

# Run the tracker to mark as complete
echo "Marking today's boot.dev practice as complete..."
echo ""

if node "$SCRIPT_DIR/boot-dev-tracker.cjs" complete 2>&1 | tee -a "$LOG_FILE"; then
    log_action "Successfully marked boot.dev practice as complete"
    
    echo ""
    echo "---"
    echo ""
    
    # Show updated status
    echo "## Updated Status:"
    echo ""
    node "$SCRIPT_DIR/boot-dev-tracker.cjs" status | tee -a "$LOG_FILE"
    
    echo ""
    echo "---"
    echo ""
    
    # Show weekly progress
    echo "## Weekly Progress:"
    echo ""
    node "$SCRIPT_DIR/boot-dev-tracker.cjs" week | tee -a "$LOG_FILE"
    
    log_action "Boot.dev tracking completed successfully"
    
    echo ""
    echo "🚀 **Keep the momentum going!** Tomorrow's practice will extend your streak even further."
    
else
    log_action "ERROR: Failed to mark boot.dev practice as complete"
    echo ""
    echo "❌ Failed to update boot.dev tracking. Check the log file: $LOG_FILE"
    exit 1
fi