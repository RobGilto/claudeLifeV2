---
date: 2025-08-28
type: testing-guide
topic: day-planner-calendar-integration
tags: [testing, planning, calendar, validation]
status: final
privacy: public
---

# Day Planner with Calendar Integration - Test Guide

## Overview

This guide provides comprehensive test cases to validate the enhanced day planning system with Google Calendar integration. Use this to verify that the LLM-friendly planner works correctly in various scenarios.

## Quick Start Test

### Basic Functionality Test
```bash
# Test 1: Create today's plan
node scripts/fractal-planner-llm.cjs plan-day

# Test 2: Generate calendar sync commands  
node scripts/fractal-planner-llm.cjs calendar-sync

# Test 3: Check system status
node scripts/fractal-planner-llm.cjs status
```

**Expected Results**:
- Creates time-aware blocks based on current Sydney time
- Generates MCP commands for Google Calendar
- Shows planning status with recommendations

## Comprehensive Test Cases

### 1. Time-Aware Planning Tests

#### Test Case 1.1: Morning Planning (Before 9 AM)
```bash
# Simulate morning planning by creating future date plan
node scripts/fractal-planner-llm.cjs plan-day 2025-08-29
```

**Expected Results**:
- Should create 4-5 time blocks starting at 09:00
- Block durations: 90min, 60min, 90min, 60min, 30min (decreasing pattern)
- Block types: deep-work, learning, deep-work, admin, reflection

#### Test Case 1.2: Mid-Day Planning (Current Time)
```bash
# Plan for current time (should detect current Sydney time)
node scripts/fractal-planner-llm.cjs plan-day
```

**Expected Results**:
- Auto-detects current time and starts from next available hour
- Creates realistic blocks that don't go past 11 PM
- Fewer blocks if starting late in the day

#### Test Case 1.3: Evening Planning (After 6 PM)
```bash
# Test late-day planning scenario
node scripts/fractal-planner-llm.cjs clear-day
node scripts/fractal-planner-llm.cjs plan-day
```

**Expected Results**:
- Should create shorter evening blocks (60, 45, 45, 30, 30 minutes)
- Block types shift to: learning, project, research, admin, review
- Stops scheduling before 11 PM

### 2. Calendar Integration Tests

#### Test Case 2.1: Calendar Sync Generation
```bash
# Create plan and sync to calendar
node scripts/fractal-planner-llm.cjs plan-day 2025-08-30
node scripts/fractal-planner-llm.cjs calendar-sync 2025-08-30
```

**Expected Results**:
- Generates MCP commands for each time block
- Includes proper timezone (Australia/Sydney)
- Sets up popup reminders (10 min, 2 min before)
- Color-codes by block type (deep-work=blue/9, learning=green/10, etc.)

#### Test Case 2.2: Calendar Event Structure Validation
Check the generated MCP commands include:
- `calendarId: "primary"`
- Proper start/end times in ISO format
- Australia/Sydney timezone
- Descriptive summary with activity type
- Detailed description with alignment and type
- Correct color coding
- Reminder settings

#### Test Case 2.3: Multiple Day Calendar Sync
```bash
# Test calendar sync for multiple days
node scripts/fractal-planner-llm.cjs plan-day 2025-08-31
node scripts/fractal-planner-llm.cjs calendar-sync 2025-08-31
```

**Expected Results**:
- Each day should generate separate calendar events
- No conflicts between different days
- Consistent format across multiple syncs

### 3. Data Persistence Tests

#### Test Case 3.1: Plan Storage and Retrieval
```bash
# Create plan and verify storage
node scripts/fractal-planner-llm.cjs plan-day 2025-09-01
ls planning/data/day-2025-09-01.json
cat planning/data/day-2025-09-01.json | head -20
```

**Expected Results**:
- JSON file created in planning/data/
- Contains structured plan data with timeBlocks, objectives, metadata
- Readable report created in journal/planning/daily-reviews/

#### Test Case 3.2: Plan Clear and Recreate
```bash
# Test clearing and recreating plans
node scripts/fractal-planner-llm.cjs clear-day 2025-09-01
node scripts/fractal-planner-llm.cjs plan-day 2025-09-01
```

**Expected Results**:
- Original plan files removed cleanly
- New plan created with fresh data
- No orphaned files or data corruption

### 4. Edge Case Tests

#### Test Case 4.1: Invalid Date Handling
```bash
# Test with invalid dates
node scripts/fractal-planner-llm.cjs plan-day 2025-13-40
node scripts/fractal-planner-llm.cjs plan-day invalid-date
```

**Expected Results**:
- Should handle gracefully without crashing
- Fall back to current date or show appropriate error

#### Test Case 4.2: Very Late Day Planning
```bash
# Test planning when it's very late (simulated)
node scripts/fractal-planner-llm.cjs plan-day 2025-08-29
# Check if plan would start after 11 PM (should handle gracefully)
```

**Expected Results**:
- Should either create minimal blocks or suggest next day
- No scheduling past reasonable hours

#### Test Case 4.3: Weekend vs Weekday Planning
```bash
# Test weekend planning
node scripts/fractal-planner-llm.cjs plan-day 2025-08-31  # Sunday
node scripts/fractal-planner-llm.cjs plan-day 2025-09-01  # Monday
```

**Expected Results**:
- Both should work but could have different default activities
- Consistent structure regardless of day type

### 5. Integration Tests

#### Test Case 5.1: Status and Recommendations
```bash
# Test status reporting
node scripts/fractal-planner-llm.cjs plan-day 2025-09-02
node scripts/fractal-planner-llm.cjs status
```

**Expected Results**:
- Shows current plans (day, week, month, quarter)
- Provides next action recommendations
- Identifies missing plans

#### Test Case 5.2: File System Structure
```bash
# Verify correct file structure creation
node scripts/fractal-planner-llm.cjs plan-day 2025-09-03
tree planning/
tree journal/planning/
```

**Expected Results**:
- Creates proper directory structure
- Places files in correct locations
- Maintains organized file naming

### 6. Calendar MCP Integration Tests

#### Test Case 6.1: MCP Command Format Validation

When you run calendar-sync, verify the generated MCP commands have this exact structure:

```json
Use tool: mcp__google-calendar__create_event
Parameters: {
  "calendarId": "primary",
  "summary": "[Block Title] - Fractal Plan",
  "description": "[Activity]\n\n🎯 Alignment: [alignment]\n📋 Type: [type]\n⏱️ Duration: [X] minutes\n\n🚀 Generated by Fractal Planning System",
  "start": "2025-XX-XXTXX:XX:00",
  "end": "2025-XX-XXTXX:XX:00", 
  "timeZone": "Australia/Sydney",
  "reminders": {
    "useDefault": false,
    "overrides": [
      {"method": "popup", "minutes": 10},
      {"method": "popup", "minutes": 2}
    ]
  },
  "colorId": "[1-11]"
}
```

#### Test Case 6.2: Actual Calendar Booking
If Google Calendar MCP is set up, test actual booking:

1. Run: `node scripts/fractal-planner-llm.cjs calendar-sync`
2. Copy the generated MCP command
3. Execute in Claude Code
4. Verify event appears in Google Calendar

## Test Reporting System

### Automated Test Runner

Create this test script to run all tests:

```bash
#!/bin/bash
# File: scripts/run-planner-tests.sh

echo "🧪 Running Day Planner Integration Tests"
echo "========================================"

# Test 1: Basic functionality
echo "Test 1: Basic Planning..."
node scripts/fractal-planner-llm.cjs plan-day 2025-09-05 > logs/test-1-output.log 2>&1
if [ $? -eq 0 ]; then echo "✅ Test 1 PASSED"; else echo "❌ Test 1 FAILED"; fi

# Test 2: Calendar sync
echo "Test 2: Calendar Sync..."
node scripts/fractal-planner-llm.cjs calendar-sync 2025-09-05 > logs/test-2-output.log 2>&1
if [ $? -eq 0 ]; then echo "✅ Test 2 PASSED"; else echo "❌ Test 2 FAILED"; fi

# Test 3: Status check
echo "Test 3: Status Check..."
node scripts/fractal-planner-llm.cjs status > logs/test-3-output.log 2>&1
if [ $? -eq 0 ]; then echo "✅ Test 3 PASSED"; else echo "❌ Test 3 FAILED"; fi

# Test 4: Clear and recreate
echo "Test 4: Clear and Recreate..."
node scripts/fractal-planner-llm.cjs clear-day 2025-09-05 > logs/test-4a-output.log 2>&1
node scripts/fractal-planner-llm.cjs plan-day 2025-09-05 > logs/test-4b-output.log 2>&1
if [ $? -eq 0 ]; then echo "✅ Test 4 PASSED"; else echo "❌ Test 4 FAILED"; fi

echo "========================================"
echo "🔍 Check logs/ directory for detailed output"
echo "📋 Run manual validation using test cases above"
```

### Manual Test Checklist

Use this checklist for manual validation:

#### ✅ Core Functionality
- [ ] Creates daily plans with 3-5 time blocks
- [ ] Time blocks have realistic durations (30-90 minutes)
- [ ] Auto-detects current Sydney time correctly
- [ ] Generates appropriate activities for each block type
- [ ] Creates both JSON data and readable reports

#### ✅ Calendar Integration  
- [ ] Generates properly formatted MCP commands
- [ ] Uses correct timezone (Australia/Sydney)
- [ ] Sets appropriate reminders (10min, 2min)
- [ ] Color-codes different block types
- [ ] Provides both MCP and manual calendar options

#### ✅ Data Management
- [ ] Saves plans to correct directory structure
- [ ] Creates readable reports in journal/planning/
- [ ] Clear command removes files cleanly
- [ ] Status command shows accurate information

#### ✅ Error Handling
- [ ] Handles invalid dates gracefully  
- [ ] Manages late-day planning scenarios
- [ ] Provides helpful error messages
- [ ] Suggests corrective actions

#### ✅ Time Awareness
- [ ] Adjusts block count based on available time
- [ ] Uses different block patterns for evening vs day
- [ ] Doesn't schedule past 11 PM
- [ ] Accounts for transition time between blocks

## Issue Reporting Template

When reporting issues, use this format:

```markdown
## Issue Report: [Brief Description]

### Test Environment
- Date/Time: [when you ran the test]
- Command Used: `[exact command]`
- Expected Result: [what should happen]
- Actual Result: [what actually happened]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Error Output
```
[Paste any error messages or unexpected output]
```

### Files Generated
- [ ] JSON plan file created: [path]
- [ ] Readable report created: [path]  
- [ ] Calendar sync data saved: [path]

### Additional Context
[Any other relevant information]
```

## Quick Validation Commands

Run these commands to quickly validate the system is working:

```bash
# Quick smoke test
node scripts/fractal-planner-llm.cjs plan-day tomorrow && \
node scripts/fractal-planner-llm.cjs calendar-sync tomorrow && \
node scripts/fractal-planner-llm.cjs status && \
echo "✅ Basic functionality working"

# File structure validation  
ls -la planning/data/ && \
ls -la journal/planning/daily-reviews/ && \
echo "✅ File structure correct"

# JSON validation
node -e "console.log(JSON.parse(require('fs').readFileSync('planning/data/day-$(date -I).json', 'utf8')).timeBlocks.length + ' time blocks created')"
```

## Success Criteria

The system passes testing if:

1. **✅ All basic commands execute without errors**
2. **✅ Generated MCP commands have correct format for Google Calendar**  
3. **✅ Time blocks are realistic and properly timed for Sydney timezone**
4. **✅ File structure is created and maintained correctly**
5. **✅ Calendar sync provides both automated and manual options**
6. **✅ System handles edge cases gracefully**

---

*Testing Guide Generated: 2025-08-28 | Run tests regularly to ensure system reliability*