#!/usr/bin/env node
/**
 * Web Search Hook for Claude Code
 * Attempts to use Firecrawl first, then falls back to ScrapFly and Browserless APIs
 * Triggered on web search operations
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// API Configuration - NEVER commit hardcoded keys
const APIS = {
  firecrawl: {
    key: process.env.FIRECRAWL_API_KEY,
    baseUrl: 'https://api.firecrawl.dev/v0'
  },
  scrapfly: {
    key: process.env.SCRAPFLY_API_KEY,
    baseUrl: 'https://api.scrapfly.io/scrape'
  },
  browserless: {
    key: process.env.BROWSERLESS_API_KEY,
    baseUrl: 'https://chrome.browserless.io'
  }
};

// Validate required environment variables
function validateConfig() {
  const missing = [];
  if (!APIS.firecrawl.key) missing.push('FIRECRAWL_API_KEY');
  if (!APIS.scrapfly.key) missing.push('SCRAPFLY_API_KEY');
  if (!APIS.browserless.key) missing.push('BROWSERLESS_API_KEY');
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Log function
async function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  const logDir = path.join(__dirname, '../logs');
  await fs.mkdir(logDir, { recursive: true });
  
  const logFile = path.join(logDir, `web-search-hook-${new Date().toISOString().split('T')[0]}.log`);
  await fs.appendFile(logFile, logMessage);
  
  if (level === 'ERROR') {
    console.error(logMessage.trim());
  } else {
    console.log(logMessage.trim());
  }
}

// Firecrawl scraping function
async function scrapeWithFirecrawl(url) {
  try {
    await log(`Attempting Firecrawl scrape: ${url}`);
    
    const response = await axios.post(`${APIS.firecrawl.baseUrl}/scrape`, {
      url: url,
      formats: ['markdown', 'html'],
      includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'a'],
      excludeTags: ['script', 'style', 'nav', 'footer', 'ads'],
      waitFor: 2000,
      timeout: 30000
    }, {
      headers: {
        'Authorization': `Bearer ${APIS.firecrawl.key}`,
        'Content-Type': 'application/json'
      },
      timeout: 35000
    });

    if (response.data?.success && response.data?.data?.markdown) {
      await log(`Firecrawl success: ${url}`);
      return {
        success: true,
        content: response.data.data.markdown,
        title: response.data.data.metadata?.title || '',
        source: 'firecrawl'
      };
    }
    
    throw new Error('Invalid Firecrawl response format');
    
  } catch (error) {
    await log(`Firecrawl failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

// ScrapFly scraping function  
async function scrapeWithScrapfly(url) {
  try {
    await log(`Attempting ScrapFly scrape: ${url}`);
    
    const response = await axios.get(APIS.scrapfly.baseUrl, {
      params: {
        key: APIS.scrapfly.key,
        url: url,
        format: 'markdown',
        render_js: true,
        wait: 2000,
        timeout: 30000,
        asp: true // Anti-scraping protection
      },
      timeout: 35000
    });

    if (response.data?.result?.content) {
      await log(`ScrapFly success: ${url}`);
      return {
        success: true,
        content: response.data.result.content,
        title: response.data.result.title || '',
        source: 'scrapfly'
      };
    }
    
    throw new Error('Invalid ScrapFly response format');
    
  } catch (error) {
    await log(`ScrapFly failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Browserless scraping function
async function scrapeWithBrowserless(url) {
  try {
    await log(`Attempting Browserless scrape: ${url}`);
    
    const response = await axios.post(`${APIS.browserless.baseUrl}/content`, {
      url: url,
      waitFor: 2000,
      gotoOptions: {
        waitUntil: 'networkidle2',
        timeout: 30000
      }
    }, {
      headers: {
        'Authorization': `Bearer ${APIS.browserless.key}`,
        'Content-Type': 'application/json'
      },
      params: {
        token: APIS.browserless.key
      },
      timeout: 35000
    });

    if (response.data) {
      await log(`Browserless success: ${url}`);
      // Convert HTML to basic markdown-like format
      let content = response.data
        .replace(/<script[^>]*>.*?<\/script>/gsi, '')
        .replace(/<style[^>]*>.*?<\/style>/gsi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return {
        success: true,
        content: content,
        title: content.split('\n')[0] || '',
        source: 'browserless'
      };
    }
    
    throw new Error('Invalid Browserless response format');
    
  } catch (error) {
    await log(`Browserless failed: ${error.message}`, 'ERROR');
    throw error;
  }
}

// Main scraping function with fallback chain
async function scrapeUrl(url) {
  const scrapers = [
    { name: 'Firecrawl', func: scrapeWithFirecrawl },
    { name: 'ScrapFly', func: scrapeWithScrapfly },
    { name: 'Browserless', func: scrapeWithBrowserless }
  ];

  for (const scraper of scrapers) {
    try {
      const result = await scraper.func(url);
      await log(`Successfully scraped ${url} using ${scraper.name}`);
      return result;
    } catch (error) {
      await log(`${scraper.name} failed for ${url}: ${error.message}`, 'ERROR');
      // Continue to next scraper
    }
  }

  // All scrapers failed
  await log(`All scrapers failed for ${url}`, 'ERROR');
  return {
    success: false,
    error: 'All scraping methods failed',
    content: '',
    title: '',
    source: 'none'
  };
}

// Hook main function
async function main() {
  try {
    // Get hook context from Claude Code
    const hookData = JSON.parse(process.argv[2] || '{}');
    const url = hookData.url || hookData.query;
    
    if (!url) {
      await log('No URL provided to web search hook', 'ERROR');
      process.exit(1);
    }

    await log(`Web search hook triggered for: ${url}`);
    
    // If it's a search query, we might want to convert it to a search URL
    let searchUrl = url;
    if (!url.startsWith('http')) {
      // Convert search query to Google search URL
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
      await log(`Converting query to search URL: ${searchUrl}`);
    }

    const result = await scrapeUrl(searchUrl);
    
    // Output result for Claude Code to consume
    console.log(JSON.stringify({
      success: result.success,
      content: result.content.substring(0, 10000), // Limit content size
      title: result.title,
      source: result.source,
      url: searchUrl,
      timestamp: new Date().toISOString()
    }));

    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    await log(`Hook execution failed: ${error.message}`, 'ERROR');
    console.log(JSON.stringify({
      success: false,
      error: error.message,
      content: '',
      title: '',
      source: 'error'
    }));
    process.exit(1);
  }
}

// Install required dependencies if not present
async function checkDependencies() {
  try {
    require('axios');
  } catch (error) {
    await log('Installing required dependency: axios');
    const { spawn } = require('child_process');
    const npm = spawn('npm', ['install', 'axios'], { cwd: __dirname });
    
    return new Promise((resolve, reject) => {
      npm.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('Failed to install axios'));
        }
      });
    });
  }
}

// Run the hook
if (require.main === module) {
  checkDependencies().then(main).catch(async (error) => {
    await log(`Fatal error: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}