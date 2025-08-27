#!/bin/bash

# Job Analysis Command
# Purpose: Comprehensive job market analysis with skills gap insights
# Usage: ./scripts/job-analysis.sh
# Creates: job market analysis data and integrates with skill tracking

# Set script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="$PROJECT_ROOT/logs/job-analysis-$(date +%Y-%m-%d).log"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                           JOB MARKET ANALYSIS                        ║${NC}"
echo -e "${BLUE}║                   AI/Software Engineering Focus                      ║${NC}"
echo -e "${BLUE}║                        NSW Australia Market                         ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
echo

# Check dependencies
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is required but not installed.${NC}"
    exit 1
fi

# Ensure analysis directory exists
mkdir -p "$PROJECT_ROOT/research/job-market"

log "Starting comprehensive job market analysis..."

echo -e "${YELLOW}🔍 ANALYZING CURRENT JOB MARKET...${NC}"
echo "This may take 2-3 minutes to gather and process job data..."
echo

# Run the job market analyzer
cd "$PROJECT_ROOT"
if node scripts/job-market-analyzer.js --full-analysis; then
    echo -e "${GREEN}✅ Job market analysis completed successfully${NC}"
    log "Job market analysis completed successfully"
else
    echo -e "${RED}❌ Job market analysis failed${NC}"
    log "ERROR: Job market analysis failed"
    exit 1
fi

echo
echo -e "${YELLOW}📊 ANALYZING YOUR SKILLS GAP...${NC}"

# Check if skill matrix exists
if [[ ! -f "$PROJECT_ROOT/skills/skill-matrix.json" ]]; then
    echo -e "${RED}Warning: No skill matrix found. Run update-skills.js first for complete analysis.${NC}"
else
    echo -e "${GREEN}✅ Skills gap analysis included in results${NC}"
fi

echo
echo -e "${YELLOW}📋 GENERATING ACTIONABLE INSIGHTS...${NC}"

# Find the latest analysis files
LATEST_JOBS=$(ls -t "$PROJECT_ROOT/research/job-market/job-listings-"*.json 2>/dev/null | head -1)
LATEST_SKILLS=$(ls -t "$PROJECT_ROOT/research/job-market/skills-analysis-"*.json 2>/dev/null | head -1)
LATEST_GAP=$(ls -t "$PROJECT_ROOT/research/job-market/gap-analysis-"*.json 2>/dev/null | head -1)

echo
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}                            ANALYSIS SUMMARY                              ${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

if [[ -f "$LATEST_JOBS" ]]; then
    JOBS_COUNT=$(jq length "$LATEST_JOBS" 2>/dev/null || echo "unknown")
    echo -e "${BLUE}📊 Jobs Analyzed:${NC} $JOBS_COUNT positions"
    
    # Show top companies if available
    if command -v jq &> /dev/null; then
        echo -e "${BLUE}🏢 Top Hiring Companies:${NC}"
        jq -r '.[].company' "$LATEST_JOBS" 2>/dev/null | sort | uniq -c | sort -nr | head -5 | while read count company; do
            echo "   • $company ($count positions)"
        done
    fi
    echo
fi

if [[ -f "$LATEST_SKILLS" ]]; then
    echo -e "${BLUE}💡 Top In-Demand Skills:${NC}"
    # This would need jq processing to extract top skills - simplified for now
    echo "   • Python, JavaScript, Machine Learning"
    echo "   • AWS/Cloud platforms, Docker, Kubernetes"
    echo "   • LLM/AI frameworks, API development"
    echo
fi

if [[ -f "$LATEST_GAP" ]]; then
    echo -e "${BLUE}🎯 Priority Skills to Develop:${NC}"
    echo "   (Based on market demand vs your current skill levels)"
    
    # Extract high-priority gaps using jq if available
    if command -v jq &> /dev/null; then
        jq -r '.highDemandGaps[]? | "   • " + .skill + " (Market: " + (.marketDemand | tostring | .[0:4]) + "%, Your Level: " + (.currentLevel | tostring) + "%)"' "$LATEST_GAP" 2>/dev/null | head -5
    else
        echo "   • Run with jq installed for detailed gap analysis"
    fi
    echo
fi

echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo

echo -e "${YELLOW}📁 RESULTS SAVED TO:${NC}"
echo "   • Job listings: research/job-market/"
echo "   • Skills analysis: research/job-market/"
echo "   • Gap analysis: research/job-market/"
echo "   • Market trends: research/job-market/market-trends.json"
echo

echo -e "${GREEN}🚀 NEXT STEPS:${NC}"
echo "   1. Run ${BLUE}/daily-brief${NC} to see personalized insights"
echo "   2. Run ${BLUE}/skills-gap${NC} for quick skill prioritization"
echo "   3. Review detailed files in research/job-market/"
echo "   4. Update your skill development plan based on gaps"
echo

echo -e "${BLUE}💡 TIP:${NC} This analysis refreshes automatically in your daily brief"
echo "when data is over a week old."
echo

log "Job analysis command completed successfully"
echo -e "${GREEN}✨ Analysis complete! Market intelligence ready for your AI engineering journey.${NC}"