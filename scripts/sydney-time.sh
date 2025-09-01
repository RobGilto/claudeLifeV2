#!/bin/bash

# Sydney Time Helper
# Provides consistent Sydney timezone handling for all checkin commands
# Eliminates timezone bugs by centralizing time logic
#
# Usage:
#   ./scripts/sydney-time.sh [format]
#   
# Formats:
#   - full: "2025-09-01T17:30:54+10:00"
#   - time: "17:30" 
#   - date: "2025-09-01"
#   - datetime: "September 1, 2025 - 17:30"
#   - checkin: "September 1, 2025 - 17:30" (default)

format=${1:-checkin}

# Get current time in Sydney timezone
case "$format" in
    "full")
        # Full ISO format with timezone
        TZ='Australia/Sydney' date '+%Y-%m-%dT%H:%M:%S%z'
        ;;
    "time")
        # Time only (HH:MM)
        TZ='Australia/Sydney' date '+%H:%M'
        ;;
    "date")
        # Date only (YYYY-MM-DD)
        TZ='Australia/Sydney' date '+%Y-%m-%d'
        ;;
    "datetime"|"checkin"|*)
        # Human readable format for checkins
        TZ='Australia/Sydney' date '+%B %d, %Y - %H:%M'
        ;;
esac