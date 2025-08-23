#!/bin/bash
"""
Brain Dump Analysis Generator

Analyzes existing brain dump files and generates structured analysis.

Usage: 
  ./brain-dump-analysis.sh [brain_dump_file]
  
If no file specified, analyzes the most recent brain dump.

Dependencies: None (uses Claude Code for analysis generation)
"""

set -e  # Exit on any error

# Function to find most recent brain dump if none specified
find_recent_brain_dump() {
    local most_recent=$(find journal/brain -name "braindump-*.md" -not -path "*/analysis/*" -type f -printf '%T@ %p\n' 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2-)
    
    if [[ -z "$most_recent" ]]; then
        echo "Error: No brain dump files found in journal/brain/"
        exit 1
    fi
    
    echo "$most_recent"
}

# Function to generate analysis filename from brain dump filename
get_analysis_filename() {
    local brain_dump_path="$1"
    local filename=$(basename "$brain_dump_path")
    local topic_and_timestamp=${filename#braindump-}
    topic_and_timestamp=${topic_and_timestamp%.md}
    
    echo "journal/brain/analysis/analysis-${topic_and_timestamp}.md"
}

# Function to create analysis using Claude Code
generate_analysis() {
    local brain_dump_path="$1"
    local analysis_path="$2"
    local brain_dump_filename=$(basename "$brain_dump_path")
    
    # Ensure analysis directory exists
    mkdir -p "$(dirname "$analysis_path")"
    
    # Read the brain dump content to understand the topic
    local topic_line=$(grep "^# Brain Dump:" "$brain_dump_path" | head -1 | sed 's/^# Brain Dump: //')
    if [[ -z "$topic_line" ]]; then
        topic_line="Untitled"
    fi
    
    echo "🧠 Generating analysis for: $topic_line"
    echo "📝 Source: $brain_dump_filename"
    echo "📊 Output: $analysis_path"
    
    # Create analysis template
    cat > "$analysis_path" << EOF
---
date: $(date '+%Y-%m-%d')
time: $(date '+%H:%M')
type: analysis
source: brain-dump-analysis
related: $brain_dump_filename
tags: []
status: final
privacy: private
---

# Brain Dump Analysis: $topic_line

## Key Insights Extracted

*[This section will be populated by Claude Code analysis]*

## Patterns and Connections

*[Identify patterns, connections to previous brain dumps/learning]*

## Actionable Items

*[Concrete next steps and actions]*

## Strategic Implications

*[How this connects to career goals, learning path, etc.]*

## Questions for Further Exploration

*[Areas that need more thought or research]*

## Connections to Existing Projects

*[How this relates to RuneQuest, AI engineering goals, etc.]*

---

*Analysis template created $(date '+%Y-%m-%d %H:%M:%S')*
*Ready for Claude Code analysis completion*
EOF

    echo "✅ Analysis template created: $analysis_path"
    echo "🤖 Now use Claude Code to complete the analysis by reading $brain_dump_path and updating $analysis_path"
    
    return 0
}

# Main execution
main() {
    echo "📊 Brain Dump Analysis Generator"
    echo "================================"
    
    # Check if we're in the right directory
    if [[ ! -f "CLAUDE.md" ]]; then
        echo "Error: Must be run from project root directory"
        exit 1
    fi
    
    # Determine which brain dump to analyze
    local brain_dump_path="$1"
    if [[ -z "$brain_dump_path" ]]; then
        echo "No file specified, finding most recent brain dump..."
        brain_dump_path=$(find_recent_brain_dump)
        echo "Found: $brain_dump_path"
    fi
    
    # Verify brain dump file exists
    if [[ ! -f "$brain_dump_path" ]]; then
        echo "Error: Brain dump file not found: $brain_dump_path"
        exit 1
    fi
    
    # Generate analysis filename
    local analysis_path=$(get_analysis_filename "$brain_dump_path")
    
    # Check if analysis already exists
    if [[ -f "$analysis_path" ]]; then
        echo "⚠️  Analysis already exists: $analysis_path"
        read -p "Overwrite existing analysis? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Analysis generation cancelled."
            exit 0
        fi
    fi
    
    # Generate the analysis
    if generate_analysis "$brain_dump_path" "$analysis_path"; then
        echo ""
        echo "🎉 Analysis generation complete!"
        echo ""
        echo "Next steps:"
        echo "1. Use Claude Code to read: $brain_dump_path"
        echo "2. Complete the analysis in: $analysis_path"
        echo "3. Replace template sections with actual insights"
    else
        echo "❌ Analysis generation failed"
        exit 1
    fi
}

# Execute main function with all arguments
main "$@"