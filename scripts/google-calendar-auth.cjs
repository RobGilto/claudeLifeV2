#!/usr/bin/env node

/**
 * Google Calendar Authentication Setup
 * Purpose: Handle OAuth2 authentication for Google Calendar API access
 * Usage: node scripts/google-calendar-auth.cjs
 * Dependencies: googleapis, fs, path
 * 
 * This script will:
 * 1. Load credentials from client_secret_google_calendar.json
 * 2. Generate authorization URL
 * 3. Exchange authorization code for access token
 * 4. Save token for future use
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class GoogleCalendarAuth {
    constructor() {
        this.credentialsPath = path.join(__dirname, '..', 'client_secret_google_calendar.json');
        this.tokenPath = path.join(__dirname, '..', 'google_calendar_token.json');
        this.SCOPES = ['https://www.googleapis.com/auth/calendar'];
    }

    async authenticate() {
        console.log('🔐 Google Calendar Authentication Setup');
        
        // Check if credentials exist
        if (!fs.existsSync(this.credentialsPath)) {
            console.log('❌ Credentials file not found: client_secret_google_calendar.json');
            console.log('Please download your Google Calendar API credentials and place them in the root directory.');
            return;
        }

        // Check if token already exists
        if (fs.existsSync(this.tokenPath)) {
            console.log('✅ Token already exists. Testing authentication...');
            const isValid = await this.testExistingToken();
            if (isValid) {
                console.log('🎉 Authentication is working! Calendar API is ready.');
                return;
            } else {
                console.log('⚠️ Existing token is invalid. Creating new one...');
            }
        }

        await this.createNewToken();
    }

    async testExistingToken() {
        try {
            const { google } = require('googleapis');
            const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
            const { OAuth2 } = google.auth;
            
            const oAuth2Client = new OAuth2(
                credentials.installed.client_id,
                credentials.installed.client_secret,
                credentials.installed.redirect_uris[0]
            );

            const token = JSON.parse(fs.readFileSync(this.tokenPath, 'utf8'));
            oAuth2Client.setCredentials(token);

            // Test API call
            const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
            await calendar.calendarList.list();

            return true;
        } catch (error) {
            console.log(`Token validation failed: ${error.message}`);
            return false;
        }
    }

    async createNewToken() {
        try {
            const { google } = require('googleapis');
            const credentials = JSON.parse(fs.readFileSync(this.credentialsPath, 'utf8'));
            const { OAuth2 } = google.auth;
            
            const oAuth2Client = new OAuth2(
                credentials.installed.client_id,
                credentials.installed.client_secret,
                credentials.installed.redirect_uris[0]
            );

            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES,
            });

            console.log('\n🌐 Open this URL in your browser:');
            console.log(authUrl);
            console.log('\nAfter authorization, you\'ll get a code. Enter it below:');

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            const code = await new Promise(resolve => {
                rl.question('📝 Authorization code: ', resolve);
            });

            rl.close();

            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);

            // Save token
            fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2));
            console.log('✅ Token saved successfully!');

            // Test the new token
            const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
            const calendarList = await calendar.calendarList.list();
            console.log(`🎉 Authentication successful! Found ${calendarList.data.items.length} calendars.`);

        } catch (error) {
            console.log(`❌ Authentication failed: ${error.message}`);
        }
    }

    async installDependencies() {
        console.log('📦 Checking Google APIs dependency...');
        
        try {
            require('googleapis');
            console.log('✅ googleapis package is installed');
        } catch (error) {
            console.log('⚠️ googleapis package not found. Installing...');
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);
            
            try {
                await execAsync('npm install googleapis');
                console.log('✅ googleapis installed successfully');
            } catch (installError) {
                console.log('❌ Failed to install googleapis:');
                console.log('Please run: npm install googleapis');
                return false;
            }
        }
        
        return true;
    }

    showStatus() {
        console.log('\n📊 Google Calendar API Status:');
        console.log(`Credentials: ${fs.existsSync(this.credentialsPath) ? '✅' : '❌'}`);
        console.log(`Token: ${fs.existsSync(this.tokenPath) ? '✅' : '❌'}`);
        
        if (fs.existsSync(this.tokenPath)) {
            try {
                const token = JSON.parse(fs.readFileSync(this.tokenPath, 'utf8'));
                const expiryDate = new Date(token.expiry_date);
                const now = new Date();
                console.log(`Token expires: ${expiryDate.toLocaleString()}`);
                console.log(`Token status: ${expiryDate > now ? '✅ Valid' : '⚠️ Expired'}`);
            } catch (error) {
                console.log('Token status: ❌ Invalid format');
            }
        }
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'auth';
    
    const auth = new GoogleCalendarAuth();
    
    switch (command) {
        case 'auth':
            const depsOk = await auth.installDependencies();
            if (depsOk) {
                await auth.authenticate();
            }
            break;
        case 'status':
            auth.showStatus();
            break;
        default:
            console.log(`
🔐 Google Calendar Authentication

Commands:
  auth    - Set up Google Calendar API authentication (default)
  status  - Show current authentication status

Examples:
  node scripts/google-calendar-auth.cjs auth
  node scripts/google-calendar-auth.cjs status

Prerequisites:
1. Download Google Calendar API credentials as 'client_secret_google_calendar.json'
2. Place the file in the repository root directory
            `);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
}

module.exports = { GoogleCalendarAuth };