#!/usr/bin/env node

/**
 * Boot.dev Daily Tracker
 * 
 * Tracks boot.dev practice sessions, maintains streak data, and updates KPIs.
 * 
 * Usage:
 *   node scripts/boot-dev-tracker.js complete     # Mark today as complete
 *   node scripts/boot-dev-tracker.js status       # Show current streak and stats
 *   node scripts/boot-dev-tracker.js week         # Show weekly progress
 * 
 * Dependencies: None (uses native Node.js)
 */

const fs = require('fs');
const path = require('path');

const PLANNING_DIR = path.join(__dirname, '..', 'planning', 'data');
const STREAK_FILE = path.join(PLANNING_DIR, 'boot-dev-streak.json');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function getToday() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getWeekId() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
}

function loadStreakData() {
  if (fs.existsSync(STREAK_FILE)) {
    return JSON.parse(fs.readFileSync(STREAK_FILE, 'utf8'));
  }
  
  // Initialize with current known data
  return {
    currentStreak: 3,
    longestStreak: 3,
    totalDays: 3,
    lastCompleted: "2025-08-29",
    completedDates: ["2025-08-27", "2025-08-28", "2025-08-29"],
    streakHistory: [
      {
        start: "2025-08-27",
        end: "2025-08-29",
        days: 3
      }
    ]
  };
}

function saveStreakData(data) {
  fs.writeFileSync(STREAK_FILE, JSON.stringify(data, null, 2));
}

function updateWeeklyPlan(completed = false) {
  const weekFile = path.join(PLANNING_DIR, `week-${getWeekId()}.json`);
  
  if (fs.existsSync(weekFile)) {
    const weekData = JSON.parse(fs.readFileSync(weekFile, 'utf8'));
    const today = getToday();
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    // Update daily tracking
    if (weekData.dailyTracking && weekData.dailyTracking[dayOfWeek]) {
      weekData.dailyTracking[dayOfWeek].bootDev = completed;
      if (completed) {
        weekData.dailyTracking[dayOfWeek].notes = `Completed - Streak day ${loadStreakData().currentStreak}`;
      }
    }
    
    // Update KPIs
    if (weekData.kpis && weekData.kpis.bootDevStreak) {
      const streakData = loadStreakData();
      weekData.kpis.bootDevStreak.current = streakData.currentStreak;
      weekData.kpis.bootDevStreak.lastUpdated = today;
    }
    
    // Update objectives
    if (weekData.objectives) {
      const bootDevObj = weekData.objectives.find(o => o.id === 'boot-dev-daily');
      if (bootDevObj) {
        const completedDays = Object.values(weekData.dailyTracking || {})
          .filter(day => day.bootDev).length;
        bootDevObj.completed = completedDays;
      }
    }
    
    weekData.updated = new Date().toISOString();
    fs.writeFileSync(weekFile, JSON.stringify(weekData, null, 2));
  }
}

function markComplete() {
  const today = getToday();
  const data = loadStreakData();
  
  // Check if already completed today
  if (data.completedDates.includes(today)) {
    console.log(`${colors.yellow}⚠️  Already marked complete for today!${colors.reset}`);
    return;
  }
  
  // Check if streak continues or restarts
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (data.lastCompleted === yesterdayStr) {
    // Continue streak
    data.currentStreak++;
  } else {
    // Streak broken, start new one
    if (data.currentStreak > 0) {
      // Save the old streak to history
      const lastStreakStart = data.completedDates[data.completedDates.length - data.currentStreak];
      data.streakHistory.push({
        start: lastStreakStart || data.lastCompleted,
        end: data.lastCompleted,
        days: data.currentStreak
      });
    }
    data.currentStreak = 1;
  }
  
  // Update data
  data.completedDates.push(today);
  data.lastCompleted = today;
  data.totalDays++;
  
  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }
  
  saveStreakData(data);
  updateWeeklyPlan(true);
  
  console.log(`${colors.green}✅ Boot.dev practice completed for ${today}!${colors.reset}`);
  console.log(`${colors.cyan}🔥 Current streak: ${data.currentStreak} days${colors.reset}`);
  
  if (data.currentStreak === data.longestStreak && data.currentStreak > 1) {
    console.log(`${colors.magenta}🎉 New record! This is your longest streak!${colors.reset}`);
  }
  
  // Motivational messages at milestones
  if (data.currentStreak === 7) {
    console.log(`${colors.bright}${colors.green}🏆 ONE WEEK STREAK! You're building serious momentum!${colors.reset}`);
  } else if (data.currentStreak === 14) {
    console.log(`${colors.bright}${colors.green}💪 TWO WEEK STREAK! Consistency is becoming a habit!${colors.reset}`);
  } else if (data.currentStreak === 30) {
    console.log(`${colors.bright}${colors.green}🚀 30 DAY STREAK! You're unstoppable!${colors.reset}`);
  }
}

function showStatus() {
  const data = loadStreakData();
  const today = getToday();
  const completedToday = data.completedDates.includes(today);
  
  console.log(`\n${colors.bright}📊 Boot.dev Streak Status${colors.reset}`);
  console.log('═'.repeat(40));
  console.log(`${colors.cyan}Current Streak:${colors.reset} ${colors.bright}${data.currentStreak} days${colors.reset}`);
  console.log(`${colors.cyan}Longest Streak:${colors.reset} ${data.longestStreak} days`);
  console.log(`${colors.cyan}Total Days:${colors.reset} ${data.totalDays} days`);
  console.log(`${colors.cyan}Last Completed:${colors.reset} ${data.lastCompleted}`);
  
  if (completedToday) {
    console.log(`\n${colors.green}✅ Today's practice: COMPLETE${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⏳ Today's practice: PENDING${colors.reset}`);
    console.log(`${colors.yellow}   Run 'node scripts/boot-dev-tracker.js complete' when done${colors.reset}`);
  }
  
  // Show streak risk
  if (!completedToday && data.currentStreak > 0) {
    console.log(`\n${colors.red}⚠️  Complete today's practice to maintain your ${data.currentStreak}-day streak!${colors.reset}`);
  }
}

function showWeeklyProgress() {
  const weekFile = path.join(PLANNING_DIR, `week-${getWeekId()}.json`);
  
  console.log(`\n${colors.bright}📅 Weekly Boot.dev Progress${colors.reset}`);
  console.log('═'.repeat(40));
  
  if (fs.existsSync(weekFile)) {
    const weekData = JSON.parse(fs.readFileSync(weekFile, 'utf8'));
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      const dayData = weekData.dailyTracking[day];
      const status = dayData.bootDev ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
      const dateStr = dayData.date;
      const isToday = dateStr === getToday();
      const todayMarker = isToday ? ` ${colors.yellow}← TODAY${colors.reset}` : '';
      
      console.log(`${dayLabel.padEnd(10)} ${dateStr}  ${status}${todayMarker}`);
    });
    
    const completed = Object.values(weekData.dailyTracking).filter(d => d.bootDev).length;
    const percentage = Math.round((completed / 7) * 100);
    
    console.log(`\n${colors.cyan}Week Progress:${colors.reset} ${completed}/7 days (${percentage}%)`);
    
    // Progress bar
    const barLength = 20;
    const filled = Math.round((completed / 7) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    console.log(`[${bar}]`);
  } else {
    console.log(`${colors.yellow}No weekly plan found for ${getWeekId()}${colors.reset}`);
  }
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'complete':
    markComplete();
    break;
  case 'status':
    showStatus();
    break;
  case 'week':
    showWeeklyProgress();
    break;
  default:
    console.log(`${colors.bright}Boot.dev Tracker${colors.reset}`);
    console.log('\nUsage:');
    console.log('  node scripts/boot-dev-tracker.js complete   # Mark today as complete');
    console.log('  node scripts/boot-dev-tracker.js status     # Show current streak');
    console.log('  node scripts/boot-dev-tracker.js week       # Show weekly progress');
}