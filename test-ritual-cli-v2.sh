#!/bin/bash

# Ritual CLI V2 Test Suite
# Run comprehensive tests for ritual-cli-v2 system

echo "🧪 Ritual CLI V2 Test Suite"
echo "=========================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
TOTAL=0

# Test function
run_test() {
    local test_name="$1"
    local command="$2"
    local expected_result="$3"
    
    echo -e "\n${BLUE}Running: $test_name${NC}"
    echo "Command: $command"
    
    TOTAL=$((TOTAL + 1))
    
    # Run command and capture exit code
    eval $command
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}✅ PASSED: $test_name${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# Test function for expected failures
run_test_expect_fail() {
    local test_name="$1"
    local command="$2"
    
    echo -e "\n${BLUE}Running: $test_name (Expecting Failure)${NC}"
    echo "Command: $command"
    
    TOTAL=$((TOTAL + 1))
    
    # Run command and capture exit code
    eval $command >/dev/null 2>&1
    local exit_code=$?
    
    if [ $exit_code -ne 0 ]; then
        echo -e "${GREEN}✅ PASSED: $test_name (Failed as expected)${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAILED: $test_name (Should have failed)${NC}"
        FAILED=$((FAILED + 1))
    fi
}

echo -e "\n${YELLOW}=== Test Category 1: Basic Ritual Creation ===${NC}"

run_test "TC-001: Daily Ritual Creation" \
    "node scripts/ritual-cli-v2.cjs 'ritual add \"Morning Coffee\" --daily --time=06:00 --duration=15 --type=life'" \
    "Should create daily ritual"

run_test "TC-002: Weekly Ritual Creation" \
    "node scripts/ritual-cli-v2.cjs 'ritual add \"Team Standup\" --weekly=monday,wednesday,friday --time=09:30 --duration=30 --type=work'" \
    "Should create weekly ritual"

echo -e "\n${YELLOW}=== Test Category 2: System Status ===${NC}"

run_test "TC-009: List All Rituals" \
    "node scripts/ritual-cli-v2.cjs 'ritual list'" \
    "Should show all rituals"

run_test "TC-010: Status for Today" \
    "node scripts/ritual-cli-v2.cjs 'status'" \
    "Should show today's ritual status"

echo -e "\n${YELLOW}=== Test Category 3: Error Handling ===${NC}"

run_test_expect_fail "TC-017: Invalid Command Syntax" \
    "node scripts/ritual-cli-v2.cjs 'invalid command syntax here'" \
    "Should fail with unrecognized command"

run_test_expect_fail "TC-018: Invalid Time Format" \
    "node scripts/ritual-cli-v2.cjs 'ritual add \"Bad Time\" --daily --time=25:00 --duration=30 --type=life'" \
    "Should fail with invalid time"

echo -e "\n${YELLOW}=== Test Category 4: Conflict Detection ===${NC}"

# Create base ritual for conflict testing
BASE_RITUAL_CMD="node scripts/ritual-cli-v2.cjs 'ritual add \"Base Conflict Test\" --daily --time=10:00 --duration=60 --type=foundational'"
run_test "TC-004a: Create Base Ritual" "$BASE_RITUAL_CMD" "Should create base ritual"

# Try to create conflicting ritual
run_test_expect_fail "TC-004b: Time Conflict Detection" \
    "node scripts/ritual-cli-v2.cjs 'ritual add \"Conflicting Ritual\" --daily --time=10:30 --duration=60 --type=work'" \
    "Should detect and prevent conflict"

echo -e "\n${YELLOW}=== Test Category 5: Calendar Sync ===${NC}"

run_test "TC-015: Sync Daily Rituals" \
    "node scripts/ritual-cli-v2.cjs 'ritual sync --period=day'" \
    "Should generate MCP sync commands"

echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo "=========================="
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️ $FAILED test(s) failed${NC}"
    exit 1
fi