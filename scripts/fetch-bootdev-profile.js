#!/usr/bin/env node

/**
 * Boot.dev Profile Fetcher
 * 
 * This script is designed to be called by Claude Code to fetch profile data
 * using the firecrawl MCP integration.
 * 
 * Usage (called by Claude Code):
 *   Claude will call this internally as part of the boot.dev tracker verification
 */

const PROFILE_URL = 'https://www.boot.dev/u/profusenegotiation88';

async function fetchAndParseProfile() {
  try {
    // This will be called by Claude Code using the MCP firecrawl integration
    // The actual profile data will be passed as an argument or environment variable
    const profileData = process.env.BOOTDEV_PROFILE_DATA || process.argv[2];
    
    if (!profileData) {
      console.error('No profile data provided');
      process.exit(1);
    }
    
    // Parse the streak information
    const streakMatch = profileData.match(/Bronze: Streak.*?Study consistently for (\d+) days.*?(\w{3} \d+, \d{4})/s);
    if (streakMatch) {
      const streakDays = parseInt(streakMatch[1]);
      const dateStr = streakMatch[2];
      const achievementDate = new Date(dateStr);
      const achievementDateStr = achievementDate.toISOString().split('T')[0];
      
      console.log(JSON.stringify({
        found: true,
        streakDays,
        achievementDate: achievementDateStr,
        tier: 'bronze'
      }));
      return;
    }
    
    // Check for gold streak
    const goldStreakMatch = profileData.match(/Gold: Streak.*?Study consistently for (\d+) days.*?(\w{3} \d+, \d{4})/s);
    if (goldStreakMatch) {
      const streakDays = parseInt(goldStreakMatch[1]);
      const dateStr = goldStreakMatch[2];
      const achievementDate = new Date(dateStr);
      const achievementDateStr = achievementDate.toISOString().split('T')[0];
      
      console.log(JSON.stringify({
        found: true,
        streakDays,
        achievementDate: achievementDateStr,
        tier: 'gold'
      }));
      return;
    }
    
    // No streak found
    console.log(JSON.stringify({ found: false }));
    
  } catch (error) {
    console.error('Error parsing profile:', error.message);
    process.exit(1);
  }
}

fetchAndParseProfile();