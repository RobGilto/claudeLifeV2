#!/usr/bin/env node

/**
 * Quick wrapper for intelligent recommender
 * 
 * Usage:
 *   ./scripts/recommend.cjs [context]
 *   ./scripts/recommend.cjs --update [context]
 */

const { execSync } = require('child_process');

const args = process.argv.slice(2);
const command = `node scripts/intelligent-recommender.cjs ${args.join(' ')}`;

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    process.exit(error.status || 1);
}