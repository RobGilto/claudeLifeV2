#!/bin/bash

# Skills Gap Analysis Command
# Purpose: Quick skills gap analysis against current job market
# Usage: ./scripts/skills-gap.sh
# Shows: Priority skills to develop based on market demand vs current levels

# Set script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                            SKILLS GAP ANALYSIS                       ║${NC}"
echo -e "${CYAN}║                      Market Demand vs Your Skills                   ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo

# Check if analysis data exists
GAP_FILE=$(ls -t "$PROJECT_ROOT/research/job-market/gap-analysis-"*.json 2>/dev/null | head -1)
SKILLS_FILE="$PROJECT_ROOT/skills/skill-matrix.json"
TRENDS_FILE="$PROJECT_ROOT/research/job-market/market-trends.json"

if [[ ! -f "$GAP_FILE" ]]; then
    echo -e "${YELLOW}⚠️  No recent gap analysis found.${NC}"
    echo "Run ${BLUE}/job-analysis${NC} first to generate market data."
    echo
    exit 1
fi

if [[ ! -f "$SKILLS_FILE" ]]; then
    echo -e "${YELLOW}⚠️  No skill matrix found.${NC}"
    echo "Run ${BLUE}node scripts/update-skills.js${NC} first to create your skill profile."
    echo
    exit 1
fi

# Check if jq is available for JSON processing
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required for JSON processing but not installed.${NC}"
    echo "Install with: sudo apt-get install jq (Ubuntu) or brew install jq (Mac)"
    exit 1
fi

echo -e "${BLUE}📊 Analyzing your skills against current market demand...${NC}"
echo

# Get analysis date
ANALYSIS_DATE=$(jq -r 'keys[0]' "$GAP_FILE" 2>/dev/null | head -1)
echo -e "${PURPLE}Analysis based on data from: $(basename "$GAP_FILE" .json | cut -d'-' -f3-5)${NC}"
echo

# High Demand Gaps
echo -e "${RED}🔥 HIGH PRIORITY SKILLS TO DEVELOP${NC}"
echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

HIGH_GAPS=$(jq -r '.highDemandGaps[]? | select(.marketDemand > 15) | [.skill, .marketDemand, .currentLevel, .gap] | @tsv' "$GAP_FILE" 2>/dev/null)

if [[ -n "$HIGH_GAPS" ]]; then
    echo "$HIGH_GAPS" | while IFS=$'\t' read -r skill demand current gap; do
        # Format numbers
        demand_fmt=$(printf "%.1f" "$demand")
        
        # Create visual progress bar
        progress_bars=""
        current_bars=$((current / 10))
        target_bars=$((6)) # Assume 60% target for high-demand skills
        
        for ((i=0; i<10; i++)); do
            if [ $i -lt $current_bars ]; then
                progress_bars+="█"
            elif [ $i -lt $target_bars ]; then
                progress_bars+="░"
            else
                progress_bars+=" "
            fi
        done
        
        echo -e "  ${YELLOW}■${NC} ${BLUE}$skill${NC}"
        echo -e "    Market Demand: ${demand_fmt}% of jobs  |  Your Level: ${current}%"
        echo -e "    Progress: [${GREEN}$progress_bars${NC}] Gap: ${RED}$gap points${NC}"
        echo
    done
else
    echo -e "${GREEN}✅ Great! You don't have any critical skill gaps.${NC}"
    echo
fi

# Strength Areas
echo -e "${GREEN}💪 YOUR CURRENT STRENGTHS${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

STRENGTHS=$(jq -r '.strengthAreas[]? | [.skill, .marketDemand, .currentLevel] | @tsv' "$GAP_FILE" 2>/dev/null)

if [[ -n "$STRENGTHS" ]]; then
    echo "$STRENGTHS" | while IFS=$'\t' read -r skill demand current; do
        demand_fmt=$(printf "%.1f" "$demand")
        echo -e "  ${GREEN}■${NC} ${BLUE}$skill${NC}: ${current}% skill vs ${demand_fmt}% market demand"
    done
    echo
else
    echo "  Working on building your first strength areas..."
    echo
fi

# Emerging Skills
echo -e "${YELLOW}🌱 EMERGING OPPORTUNITIES${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

EMERGING=$(jq -r '.emergingSkills[]? | [.skill, .marketDemand, .currentLevel] | @tsv' "$GAP_FILE" 2>/dev/null)

if [[ -n "$EMERGING" ]]; then
    echo "$EMERGING" | head -5 | while IFS=$'\t' read -r skill demand current; do
        demand_fmt=$(printf "%.1f" "$demand")
        echo -e "  ${YELLOW}■${NC} ${BLUE}$skill${NC}: ${demand_fmt}% demand, early opportunity"
    done
    echo
else
    echo "  No emerging opportunities identified in current analysis."
    echo
fi

# Quick wins from skill matrix
echo -e "${PURPLE}⚡ QUICK WINS AVAILABLE${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Find skills close to target
QUICK_WINS=$(jq -r '
.categories[] as $cat | 
$cat.skills | to_entries[] | 
select(.value.target - .value.current <= 10 and .value.target - .value.current > 0 and .value.current >= 30) |
[.key, .value.current, .value.target, (.value.target - .value.current)] | 
@tsv' "$SKILLS_FILE" 2>/dev/null)

if [[ -n "$QUICK_WINS" ]]; then
    echo "$QUICK_WINS" | head -3 | while IFS=$'\t' read -r skill current target gap; do
        echo -e "  ${PURPLE}■${NC} ${BLUE}$skill${NC}: ${current}% → ${target}% (just ${gap} points away!)"
    done
    echo
else
    echo "  Focus on high-priority gaps first, quick wins will emerge."
    echo
fi

# Recommendations
echo -e "${BLUE}🎯 THIS WEEK'S FOCUS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Get top recommendation
TOP_REC=$(jq -r '.recommendations[0]?' "$GAP_FILE" 2>/dev/null)
if [[ "$TOP_REC" != "null" && -n "$TOP_REC" ]]; then
    echo -e "${YELLOW}1.${NC} $TOP_REC"
else
    echo -e "${YELLOW}1.${NC} Continue daily Python practice and AI-generated code reading"
fi

echo -e "${YELLOW}2.${NC} Dedicate 5 hours this week to your highest gap skill"
echo -e "${YELLOW}3.${NC} Work on one RuneQuest-themed project using prioritized skills"
echo

# Progress toward 2026 goals
if [[ -f "$SKILLS_FILE" ]]; then
    echo -e "${CYAN}🗿 YOUR JOURNEY TO AI ENGINEER (2026)${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Calculate overall progress
    PROGRESS=$(jq -r '
    [.categories[] | .skills[] | .current] as $currents |
    [.categories[] | .skills[] | .target] as $targets |
    (($currents | add) / ($targets | add) * 100) | floor' "$SKILLS_FILE" 2>/dev/null)
    
    DAYS_LEFT=$(( ($(date -d "2026-07-01" +%s) - $(date +%s)) / 86400 ))
    
    echo -e "  ${BLUE}Overall Progress:${NC} ${PROGRESS}% of target skills"
    echo -e "  ${BLUE}Time Remaining:${NC} $DAYS_LEFT days until mid-2026"
    echo -e "  ${BLUE}Weekly Target:${NC} ~0.5% progress increase needed"
    echo
fi

echo -e "${GREEN}💡 TIP:${NC} Run ${BLUE}/daily-brief${NC} to see these insights integrated with market news"
echo -e "${GREEN}💡 TIP:${NC} Run ${BLUE}/job-analysis${NC} to refresh market data (weekly recommended)"
echo

echo -e "${CYAN}✨ Remember: From Initiate to Rune Lord requires consistent practice!${NC}"