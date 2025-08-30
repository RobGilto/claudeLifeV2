#!/bin/bash

# Wrapper script for automated weekly review
# This replaces the interactive review with automated data gathering

echo "🔄 Running automated weekly review..."
echo ""

# Run the automated review script
node "$(dirname "$0")/automated-weekly-review.cjs" "$@"

# Check if review was generated successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "💡 Tip: Use 'current' for this week or 'last' for previous week"
    echo "   Example: ./scripts/review-week.sh last"
fi