#!/usr/bin/env node
/**
 * Enhanced Web Search Script
 * Uses Firecrawl first, then falls back to ScrapFly and Browserless
 * Can be called directly or through Claude Code
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

// Enhanced Firecrawl scraping
async function scrapeWithFirecrawl(url) {
  try {
    console.log(`🔥 Attempting Firecrawl scrape: ${url}`);
    
    const response = await axios.post(`${APIS.firecrawl.baseUrl}/scrape`, {
      url: url,
      formats: ['markdown', 'html'],
      includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'h4', 'p', 'a', 'article', 'main'],
      excludeTags: ['script', 'style', 'nav', 'footer', 'ads', 'sidebar'],
      waitFor: 3000,
      timeout: 30000,
      extractorOptions: {
        extractionSchema: {
          title: "string",
          content: "string",
          summary: "string"
        }
      }
    }, {
      headers: {
        'Authorization': `Bearer ${APIS.firecrawl.key}`,
        'Content-Type': 'application/json'
      },
      timeout: 35000
    });

    if (response.data?.success && response.data?.data?.markdown) {
      console.log(`✅ Firecrawl success: ${url}`);\n      return {\n        success: true,\n        content: response.data.data.markdown,\n        title: response.data.data.metadata?.title || 'Untitled',\n        url: url,\n        source: 'firecrawl',\n        timestamp: new Date().toISOString()\n      };\n    }\n    \n    throw new Error('Invalid Firecrawl response format');\n    \n  } catch (error) {\n    console.log(`❌ Firecrawl failed: ${error.message}`);\n    throw error;\n  }\n}\n\n// ScrapFly with better error handling\nasync function scrapeWithScrapfly(url) {\n  try {\n    console.log(`🕷️  Attempting ScrapFly scrape: ${url}`);\n    \n    const response = await axios.get(APIS.scrapfly.baseUrl, {\n      params: {\n        key: APIS.scrapfly.key,\n        url: url,\n        format: 'markdown',\n        render_js: true,\n        wait: 3000,\n        timeout: 30000,\n        asp: true,\n        country: 'US'\n      },\n      timeout: 35000\n    });\n\n    if (response.data?.result?.content) {\n      console.log(`✅ ScrapFly success: ${url}`);\n      return {\n        success: true,\n        content: response.data.result.content,\n        title: response.data.result.title || 'Untitled',\n        url: url,\n        source: 'scrapfly',\n        timestamp: new Date().toISOString()\n      };\n    }\n    \n    throw new Error('Invalid ScrapFly response format');\n    \n  } catch (error) {\n    console.log(`❌ ScrapFly failed: ${error.message}`);\n    throw error;\n  }\n}\n\n// Browserless with content cleaning\nasync function scrapeWithBrowserless(url) {\n  try {\n    console.log(`🌐 Attempting Browserless scrape: ${url}`);\n    \n    const response = await axios.post(`${APIS.browserless.baseUrl}/content`, {\n      url: url,\n      waitFor: 3000,\n      gotoOptions: {\n        waitUntil: 'networkidle2',\n        timeout: 30000\n      },\n      removeSelector: 'script,style,nav,footer,.ads,.sidebar'\n    }, {\n      headers: {\n        'Authorization': `Bearer ${APIS.browserless.key}`,\n        'Content-Type': 'application/json'\n      },\n      params: {\n        token: APIS.browserless.key\n      },\n      timeout: 35000\n    });\n\n    if (response.data) {\n      console.log(`✅ Browserless success: ${url}`);\n      \n      // Enhanced content cleaning\n      let content = response.data\n        .replace(/<script[^>]*>.*?<\\/script>/gsi, '')\n        .replace(/<style[^>]*>.*?<\\/style>/gsi, '')\n        .replace(/<nav[^>]*>.*?<\\/nav>/gsi, '')\n        .replace(/<footer[^>]*>.*?<\\/footer>/gsi, '')\n        .replace(/<[^>]+>/g, ' ')\n        .replace(/\\s+/g, ' ')\n        .trim();\n      \n      return {\n        success: true,\n        content: content,\n        title: content.split('\\n')[0]?.substring(0, 100) || 'Untitled',\n        url: url,\n        source: 'browserless',\n        timestamp: new Date().toISOString()\n      };\n    }\n    \n    throw new Error('Invalid Browserless response format');\n    \n  } catch (error) {\n    console.log(`❌ Browserless failed: ${error.message}`);\n    throw error;\n  }\n}\n\n// Main scraping function with intelligent fallback\nasync function enhancedScrape(url) {\n  console.log(`🔍 Starting enhanced scrape for: ${url}`);\n  \n  const scrapers = [\n    { name: 'Firecrawl', func: scrapeWithFirecrawl, priority: 1 },\n    { name: 'ScrapFly', func: scrapeWithScrapfly, priority: 2 },\n    { name: 'Browserless', func: scrapeWithBrowserless, priority: 3 }\n  ];\n\n  let lastError = null;\n  \n  for (const scraper of scrapers) {\n    try {\n      const startTime = Date.now();\n      const result = await scraper.func(url);\n      const duration = Date.now() - startTime;\n      \n      console.log(`🎉 Successfully scraped ${url} using ${scraper.name} in ${duration}ms`);\n      result.duration = duration;\n      \n      return result;\n      \n    } catch (error) {\n      lastError = error;\n      console.log(`⚠️  ${scraper.name} failed for ${url}: ${error.message}`);\n      \n      // Short delay before trying next scraper\n      await new Promise(resolve => setTimeout(resolve, 1000));\n    }\n  }\n\n  // All scrapers failed\n  console.log(`💥 All scrapers failed for ${url}`);\n  return {\n    success: false,\n    error: lastError?.message || 'All scraping methods failed',\n    content: '',\n    title: '',\n    url: url,\n    source: 'none',\n    timestamp: new Date().toISOString()\n  };\n}\n\n// Command-line interface\nasync function main() {\n  const args = process.argv.slice(2);\n  \n  if (args.length === 0) {\n    console.log('Usage: node enhanced-web-search.js <url>');\n    console.log('Example: node enhanced-web-search.js https://example.com');\n    process.exit(1);\n  }\n  \n  const url = args[0];\n  \n  try {\n    const result = await enhancedScrape(url);\n    \n    if (result.success) {\n      console.log('\\n📄 SCRAPING RESULT:');\n      console.log('==================');\n      console.log(`Title: ${result.title}`);\n      console.log(`Source: ${result.source}`);\n      console.log(`Duration: ${result.duration}ms`);\n      console.log(`Content Length: ${result.content.length} characters`);\n      console.log('\\nContent Preview:');\n      console.log(result.content.substring(0, 500) + (result.content.length > 500 ? '...' : ''));\n      \n      // Save to file for easier access\n      const filename = `scrape-result-${Date.now()}.md`;\n      await fs.writeFile(filename, `# ${result.title}\\n\\n**URL:** ${result.url}\\n**Source:** ${result.source}\\n**Timestamp:** ${result.timestamp}\\n\\n---\\n\\n${result.content}`);\n      console.log(`\\n💾 Results saved to: ${filename}`);\n      \n    } else {\n      console.log('\\n❌ SCRAPING FAILED:');\n      console.log('===================');\n      console.log(`Error: ${result.error}`);\n      process.exit(1);\n    }\n    \n  } catch (error) {\n    console.error('💥 Fatal error:', error.message);\n    process.exit(1);\n  }\n}\n\n// Export for use as module\nmodule.exports = {\n  enhancedScrape,\n  scrapeWithFirecrawl,\n  scrapeWithScrapfly,\n  scrapeWithBrowserless\n};\n\n// Run if called directly\nif (require.main === module) {\n  main();\n}