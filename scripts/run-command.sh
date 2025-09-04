#!/bin/bash

# run-command.sh - Execute a bash command and echo the result
# Usage: ./run-command.sh "your command with spaces"
# Example: ./run-command.sh "ls -la /home"

if [ $# -eq 0 ]; then
    echo "Error: No command provided"
    echo "Usage: $0 \"command with arguments\""
    exit 1
fi

# Execute the command and capture output
echo "Executing: $1"
echo "----------------------------------------"
eval "$1"
echo "----------------------------------------"
echo "Command completed"