#!/bin/bash
"""
Brain Dump Slash Command Handler

Creates a standardized brain dump file from user input and triggers analysis.

Usage: /brain-dump
- User provides brain dump content directly in Claude prompt
- Script saves to journal/brain/ with standardized format
- Automatically generates analysis in journal/brain/analysis/

Dependencies: None (uses Claude Code for analysis)
"""

set -e  # Exit on any error

# Function to extract topic from text
extract_topic() {
    local text="$1"
    local max_words=3
    
    # Convert to lowercase, extract first meaningful words
    local words=$(echo "$text" | tr '[:upper:]' '[:lower:]' | grep -oE '\b[a-z]+\b' | head -10)
    
    # Skip common words
    local filtered_words=""
    local skip_pattern="^(this|is|a|the|and|or|but|so|i|we|you|that|with|for|on|at|by|from|to|in|of|it|be|have|do|will|would|could|should|can|may|might)$"
    
    local count=0
    for word in $words; do
        if [[ ! $word =~ $skip_pattern ]] && [[ ${#word} -gt 2 ]]; then
            filtered_words="$filtered_words $word"
            ((count++))
            if [[ $count -eq $max_words ]]; then
                break
            fi
        fi
    done
    
    # Join with hyphens or use fallback
    if [[ -n "$filtered_words" ]]; then
        echo "$filtered_words" | tr ' ' '-'
    else
        echo "stream-of-consciousness"
    fi
}

# Function to create brain dump file
create_brain_dump() {
    local brain_dump_content="$1"
    
    # Generate timestamp components
    local date_str=$(date '+%Y-%m-%d')
    local time_str=$(date '+%H:%M')
    local timestamp_for_filename=$(date '+%Y-%m-%d-%H%M')
    local full_timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Extract topic from content
    local topic=$(extract_topic "$brain_dump_content")
    
    # Create journal/brain directory if it doesn't exist
    mkdir -p journal/brain/analysis
    
    # Create filename
    local filename="journal/brain/braindump-${timestamp_for_filename}-${topic}.md"
    
    # Generate markdown content with standardized format
    cat > "$filename" << EOF
---
date: ${date_str}
time: ${time_str}
type: braindump
source: text
topic: ${topic}
tags: []
status: raw
privacy: private
---

# Brain Dump: $(echo "$topic" | tr '-' ' ' | sed 's/\b\w/\U&/g')

${brain_dump_content}

---
*Direct text entry - ${full_timestamp}*
EOF

    echo "$filename"
}

# Function to trigger brain dump analysis
trigger_analysis() {
    local brain_dump_path="$1"
    local filename=$(basename "$brain_dump_path")
    local topic_and_timestamp=${filename#braindump-}
    topic_and_timestamp=${topic_and_timestamp%.md}
    
    local analysis_path="journal/brain/analysis/analysis-${topic_and_timestamp}.md"
    
    echo "🧠 Analyzing brain dump: $filename"
    
    # Use Claude Code to generate analysis
    claude-code << EOF
Please analyze the brain dump file at $brain_dump_path and create a comprehensive analysis following this format:

---
date: $(date '+%Y-%m-%d')
time: $(date '+%H:%M')  
type: analysis
source: brain-dump-analysis
related: $filename
tags: []
status: final
privacy: private
---

# Brain Dump Analysis: [Topic from original]

## Key Insights Extracted
[Extract main themes and insights]

## Patterns and Connections
[Identify patterns, connections to previous brain dumps/learning]

## Actionable Items
[Concrete next steps and actions]

## Strategic Implications
[How this connects to career goals, learning path, etc.]

## Questions for Further Exploration
[Areas that need more thought or research]

## Connections to Existing Projects
[How this relates to RuneQuest, AI engineering goals, etc.]

Save this analysis to: $analysis_path
EOF
    
    if [[ -f "$analysis_path" ]]; then
        echo "📊 Analysis saved to: $analysis_path"
        return 0
    else
        echo "⚠️  Analysis generation may have failed. Please check: $analysis_path"
        return 1
    fi
}

# Main execution
main() {
    echo "🧠 Brain Dump Handler"
    echo "===================="
    
    # Check if we're in the right directory
    if [[ ! -f "CLAUDE.md" ]]; then
        echo "Error: Must be run from project root directory"
        exit 1
    fi
    
    # Read brain dump content from stdin (provided by Claude prompt)
    echo "Reading brain dump content..."
    local brain_dump_content=""
    while IFS= read -r line; do
        brain_dump_content="${brain_dump_content}${line}\n"
    done
    
    # Remove trailing newline
    brain_dump_content=$(echo -e "$brain_dump_content" | sed '$d')
    
    if [[ -z "$brain_dump_content" ]]; then
        echo "Error: No brain dump content provided"
        exit 1
    fi
    
    # Create brain dump file
    local brain_dump_path=$(create_brain_dump "$brain_dump_content")
    echo "✅ Brain dump saved: $brain_dump_path"
    
    # Trigger analysis
    if trigger_analysis "$brain_dump_path"; then
        echo "🎉 Brain dump processing complete!"
        echo ""
        echo "Files created:"
        echo "  📝 Brain dump: $brain_dump_path"
        echo "  📊 Analysis: journal/brain/analysis/analysis-$(basename "$brain_dump_path" .md | sed 's/braindump-//').md"
    else
        echo "⚠️  Brain dump saved but analysis generation needs manual review"
    fi
}

# Execute main function
main "$@"