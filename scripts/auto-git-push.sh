#!/bin/bash

# auto-git-push.sh
# Purpose: Automatically commit and push git changes when files are added/removed or 30+ lines changed
# Usage: Called by Claude hooks after file operations
# Dependencies: git
# Author: Claude Code automation

set -euo pipefail

LOG_FILE="$CLAUDE_PROJECT_DIR/logs/auto-git-push-$(date +%Y-%m-%d).log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Function to count lines changed
count_changes() {
    local added_lines=0
    local deleted_lines=0
    
    # Get diff stats
    if git diff --cached --numstat > /dev/null 2>&1; then
        while IFS=$'\t' read -r added deleted file; do
            if [[ "$added" != "-" && "$deleted" != "-" ]]; then
                added_lines=$((added_lines + added))
                deleted_lines=$((deleted_lines + deleted))
            fi
        done < <(git diff --cached --numstat)
    fi
    
    echo $((added_lines + deleted_lines))
}

# Function to generate detailed change summary
generate_change_summary() {
    local summary=""
    local file_count=0
    local modified_functions=""
    
    # Get list of changed files with stats
    while IFS=$'\t' read -r added deleted file; do
        if [[ "$added" != "-" || "$deleted" != "-" ]]; then
            file_count=$((file_count + 1))
            local change_type=""
            
            if git diff --cached --name-status | grep -q "^A.*$file"; then
                change_type="(new file)"
            elif git diff --cached --name-status | grep -q "^D.*$file"; then
                change_type="(deleted)"
            elif [[ "$added" != "-" && "$deleted" != "-" ]]; then
                change_type="(+$added/-$deleted)"
            fi
            
            summary+="\n• $(basename "$file") $change_type"
        fi
    done < <(git diff --cached --numstat)
    
    # Extract function/method changes (for common programming languages)
    if command -v grep > /dev/null 2>&1; then
        local func_changes
        func_changes=$(git diff --cached | grep -E "^[+-].*\b(function|def |class |const |let |var |export |import)" | head -5 | sed 's/^[+-]//' | sed 's/^[[:space:]]*//' || true)
        
        if [[ -n "$func_changes" ]]; then
            modified_functions="\n\nKey changes:"
            while IFS= read -r line; do
                if [[ -n "$line" ]]; then
                    modified_functions+="\n• ${line:0:80}..."
                fi
            done <<< "$func_changes"
        fi
    fi
    
    echo -e "Files changed: $file_count$summary$modified_functions"
}

# Function to check for file additions/removals
check_file_operations() {
    local has_operations=false
    
    # Check for new files
    if git diff --cached --name-status | grep -q "^A"; then
        log "Detected new files added"
        has_operations=true
    fi
    
    # Check for deleted files
    if git diff --cached --name-status | grep -q "^D"; then
        log "Detected files deleted"
        has_operations=true
    fi
    
    echo "$has_operations"
}

main() {
    log "Starting auto-git-push check"
    
    # Navigate to project directory
    cd "$CLAUDE_PROJECT_DIR" || {
        log "ERROR: Could not navigate to project directory"
        exit 1
    }
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "ERROR: Not in a git repository"
        exit 1
    fi
    
    # Add all changes to staging
    git add -A
    
    # Check if there are any changes to commit
    if git diff --cached --quiet; then
        log "No changes to commit"
        exit 0
    fi
    
    # Count total line changes
    local total_changes
    total_changes=$(count_changes)
    log "Total lines changed: $total_changes"
    
    # Check for file operations
    local has_file_ops
    has_file_ops=$(check_file_operations)
    
    # Determine if we should commit and push
    local should_push=false
    local commit_reason=""
    
    if [[ "$has_file_ops" == "true" ]]; then
        should_push=true
        commit_reason="File operations detected"
    elif [[ "$total_changes" -ge 30 ]]; then
        should_push=true
        commit_reason="Significant changes: $total_changes lines"
    fi
    
    if [[ "$should_push" == "true" ]]; then
        log "Auto-commit triggered: $commit_reason"
        
        # Generate commit message
        local commit_msg="[AUTO] $commit_reason

🤖 Generated with Claude Code automation
        
Co-Authored-By: Claude <noreply@anthropic.com>"
        
        # Commit changes
        if git commit -m "$commit_msg"; then
            log "Successfully committed changes"
            
            # Push to remote
            if git push; then
                log "Successfully pushed to remote"
            else
                log "WARNING: Failed to push to remote"
                exit 1
            fi
        else
            log "ERROR: Failed to commit changes"
            exit 1
        fi
    else
        log "No auto-push trigger met (changes: $total_changes, file ops: $has_file_ops)"
    fi
    
    log "Auto-git-push check completed"
}

# Execute main function
main "$@"