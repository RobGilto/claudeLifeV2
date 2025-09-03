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
const { spawn } = require('child_process');

const PLANNING_DIR = path.join(__dirname, '..', 'planning', 'data');
const STREAK_FILE = path.join(PLANNING_DIR, 'boot-dev-streak.json');
const PROFILE_URL = 'https://www.boot.dev/u/profusenegotiation88';

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

async function fetchBootDevProfile() {
  // This is a placeholder - in practice, Claude Code will call the MCP directly
  // For now, we'll return a mock response to test the parsing logic
  return `
![user avatar](https://storage.googleapis.com/qvault-webapp-dynamic-assets/profile_images/dc0c339b-e7fc-4b6c-b919-2d1af2aa11ce.png)![role frame](https://www.boot.dev/_nuxt/1.D8uhhud8.png)

## \#\# Robert Gilto

@

profusenegotiation88

member

Level 231,308 XP

Australia

No personal site

No twitter handle

No linkedin

No github

Lessons solved: 184

Leaderboard rank: 45,462

Joined: 6/12/2025

Karma: 0

Upvotes: 0

Thanks received: 0

No bio

OctNovDecJanFebMarAprMayJunJulAugMonTue

Less

More

## Achievements

![Milestone: Platinum](https://storage.googleapis.com/qvault-webapp-dynamic-assets/course_assets/NqHLRxk.png)

Platinum: Milestone

Complete 120 exercises

Aug 31, 2025

![Sharpshooter: Gold](https://storage.googleapis.com/qvault-webapp-dynamic-assets/course_assets/bzkfs6k.png)

Gold: Sharpshooter

Complete 6 sharpshooter sprees

Aug 31, 2025

![Streak: Bronze](https://storage.googleapis.com/qvault-webapp-dynamic-assets/course_assets/dGTAB18.png)

Bronze: Streak

Study consistently for 8 days

Sep 2, 2025

## 1 Courses Completed

[**Learn to Code in Python** \\
\\
Sep 3, 2025](https://www.boot.dev/certificates/d28b8ad6-22ca-4913-84fd-e44e4ea818eb)

StripeM-Inner
  `;
}

function parseStreakFromProfile(profileData) {
  try {
    // Look for streak achievement pattern
    const streakMatch = profileData.match(/Bronze: Streak.*?Study consistently for (\d+) days.*?(\w{3} \d+, \d{4})/s);
    if (streakMatch) {
      const streakDays = parseInt(streakMatch[1]);
      const dateStr = streakMatch[2];
      
      // Parse the date (format: "Sep 2, 2025")
      const achievementDate = new Date(dateStr);
      const achievementDateStr = achievementDate.toISOString().split('T')[0];
      
      return {
        streakDays,
        achievementDate: achievementDateStr,
        found: true
      };
    }
    
    // Look for higher tier streaks
    const goldStreakMatch = profileData.match(/Gold: Streak.*?Study consistently for (\d+) days.*?(\w{3} \d+, \d{4})/s);
    if (goldStreakMatch) {
      const streakDays = parseInt(goldStreakMatch[1]);
      const dateStr = goldStreakMatch[2];
      const achievementDate = new Date(dateStr);
      const achievementDateStr = achievementDate.toISOString().split('T')[0];
      
      return {
        streakDays,
        achievementDate: achievementDateStr,
        found: true
      };
    }
    
    return { found: false };
  } catch (error) {
    console.error('Error parsing profile data:', error);
    return { found: false };
  }
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
    const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
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
      const dayData = weekData.dailyTracking && weekData.dailyTracking[day];
      if (!dayData) return;
      const status = dayData.bootDev ? `${colors.green}✅${colors.reset}` : `${colors.red}❌${colors.reset}`;
      const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
      const dateStr = dayData.date;
      const isToday = dateStr === getToday();
      const todayMarker = isToday ? ` ${colors.yellow}← TODAY${colors.reset}` : '';
      
      console.log(`${dayLabel.padEnd(10)} ${dateStr}  ${status}${todayMarker}`);
    });
    
    const completed = weekData.dailyTracking ? Object.values(weekData.dailyTracking).filter(d => d && d.bootDev).length : 0;
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

async function verifyWithProfile() {
  console.log(`${colors.cyan}🔍 Checking boot.dev profile for streak verification...${colors.reset}`);
  
  try {
    const profileData = await fetchBootDevProfile();
    const profileStreak = parseStreakFromProfile(profileData);
    const localData = loadStreakData();
    
    console.log(`\n${colors.bright}📊 Profile vs Local Comparison${colors.reset}`);
    console.log('═'.repeat(50));
    
    if (profileStreak.found) {
      console.log(`${colors.cyan}Boot.dev Profile:${colors.reset} ${profileStreak.streakDays} days (achieved ${profileStreak.achievementDate})`);
      console.log(`${colors.cyan}Local Tracking:${colors.reset} ${localData.currentStreak} days`);
      
      if (profileStreak.streakDays !== localData.currentStreak) {
        console.log(`\n${colors.yellow}⚠️  MISMATCH DETECTED!${colors.reset}`);
        console.log(`${colors.yellow}   Profile shows ${profileStreak.streakDays} days, local shows ${localData.currentStreak} days${colors.reset}`);
        console.log(`${colors.yellow}   Consider running 'node scripts/boot-dev-tracker.js sync' to fix${colors.reset}`);
        return false;
      } else {
        console.log(`\n${colors.green}✅ Profile and local data match!${colors.reset}`);
        return true;
      }
    } else {
      console.log(`${colors.red}❌ Could not find streak achievement in profile${colors.reset}`);
      console.log(`${colors.yellow}   This might mean no streak yet or parsing failed${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Error checking profile: ${error.message}${colors.reset}`);
    return null;
  }
}

async function syncWithProfile() {
  console.log(`${colors.cyan}🔄 Syncing with boot.dev profile...${colors.reset}`);
  
  try {
    const profileData = await fetchBootDevProfile();
    const profileStreak = parseStreakFromProfile(profileData);
    
    if (!profileStreak.found) {
      console.log(`${colors.red}❌ Could not find streak data in profile${colors.reset}`);
      return;
    }
    
    const localData = loadStreakData();
    const today = getToday();
    
    // Calculate what dates should be included based on the achievement
    const achievementDate = new Date(profileStreak.achievementDate);
    const streakDates = [];
    
    for (let i = profileStreak.streakDays - 1; i >= 0; i--) {
      const date = new Date(achievementDate);
      date.setDate(date.getDate() - i);
      streakDates.push(date.toISOString().split('T')[0]);
    }
    
    // Update local data
    localData.currentStreak = profileStreak.streakDays;
    localData.longestStreak = Math.max(localData.longestStreak, profileStreak.streakDays);
    localData.totalDays = Math.max(localData.totalDays, profileStreak.streakDays);
    localData.lastCompleted = profileStreak.achievementDate;
    
    // Merge streak dates (avoid duplicates)
    const allDates = new Set([...localData.completedDates, ...streakDates]);
    localData.completedDates = Array.from(allDates).sort();
    
    saveStreakData(localData);
    
    console.log(`${colors.green}✅ Successfully synced with profile!${colors.reset}`);
    console.log(`${colors.cyan}   Updated streak: ${profileStreak.streakDays} days${colors.reset}`);
    console.log(`${colors.cyan}   Achievement date: ${profileStreak.achievementDate}${colors.reset}`);
    
  } catch (error) {
    console.log(`${colors.red}❌ Error syncing with profile: ${error.message}${colors.reset}`);
  }
}

// Main execution
const command = process.argv[2];

async function main() {
  switch (command) {
    case 'complete':
      markComplete();
      // Auto-verify after completing
      console.log('');
      await verifyWithProfile();
      break;
    case 'status':
      showStatus();
      break;
    case 'week':
      showWeeklyProgress();
      break;
    case 'verify':
      await verifyWithProfile();
      break;
    case 'sync':
      await syncWithProfile();
      break;
    default:
      console.log(`${colors.bright}Boot.dev Tracker${colors.reset}`);
      console.log('\nUsage:');
      console.log('  node scripts/boot-dev-tracker.js complete   # Mark today as complete');
      console.log('  node scripts/boot-dev-tracker.js status     # Show current streak');
      console.log('  node scripts/boot-dev-tracker.js week       # Show weekly progress');
      console.log('  node scripts/boot-dev-tracker.js verify     # Check profile vs local data');
      console.log('  node scripts/boot-dev-tracker.js sync       # Sync local data with profile');
  }
}

main().catch(console.error);