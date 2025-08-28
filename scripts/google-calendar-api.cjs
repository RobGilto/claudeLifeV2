#!/usr/bin/env node

/**
 * Google Calendar API Integration Module
 * Purpose: Direct API integration for Google Calendar operations
 * Usage: Require this module in other scripts for calendar operations
 * Dependencies: dotenv, node-fetch
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Google Calendar API configuration
const API_KEY = process.env.GOOGLE_API_KEY;
const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const OAUTH_TOKEN_FILE = path.join(process.env.HOME, '.config', 'google-calendar-mcp', 'tokens.json');

class GoogleCalendarAPI {
    constructor() {
        this.apiKey = API_KEY;
        this.accessToken = null;
        this.refreshToken = null;
        this.loadTokens();
    }

    loadTokens() {
        try {
            if (fs.existsSync(OAUTH_TOKEN_FILE)) {
                const tokens = JSON.parse(fs.readFileSync(OAUTH_TOKEN_FILE, 'utf8'));
                this.accessToken = tokens.access_token;
                this.refreshToken = tokens.refresh_token;
            }
        } catch (error) {
            console.warn('⚠️ Could not load OAuth tokens:', error.message);
        }
    }

    saveTokens() {
        if (this.accessToken || this.refreshToken) {
            const dir = path.dirname(OAUTH_TOKEN_FILE);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(OAUTH_TOKEN_FILE, JSON.stringify({
                access_token: this.accessToken,
                refresh_token: this.refreshToken,
                token_type: 'Bearer'
            }, null, 2));
        }
    }

    async makeRequest(endpoint, method = 'GET', body = null) {
        let url = endpoint.startsWith('http') ? endpoint : `${CALENDAR_API_BASE}${endpoint}`;
        
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // Use OAuth token if available, otherwise fall back to API key
        if (this.accessToken) {
            options.headers['Authorization'] = `Bearer ${this.accessToken}`;
        } else if (this.apiKey) {
            // Add API key to URL for GET requests
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}key=${this.apiKey}`;
        }

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const request = https.request({
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: options.method,
                headers: options.headers
            }, (response) => {
                let data = '';
                
                response.on('data', chunk => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (response.statusCode >= 200 && response.statusCode < 300) {
                            resolve(result);
                        } else {
                            reject(new Error(`API Error ${response.statusCode}: ${result.error?.message || data}`));
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse response: ${data}`));
                    }
                });
            });

            request.on('error', reject);
            
            if (options.body) {
                request.write(options.body);
            }
            request.end();
        });
    }

    async listCalendars() {
        try {
            const response = await this.makeRequest('/users/me/calendarList');
            return response.items || [];
        } catch (error) {
            console.error('Error listing calendars:', error.message);
            return [];
        }
    }

    async createEvent(calendarId = 'primary', eventData) {
        try {
            const event = {
                summary: eventData.summary,
                description: eventData.description,
                start: {
                    dateTime: eventData.start,
                    timeZone: eventData.timeZone || 'Australia/Sydney'
                },
                end: {
                    dateTime: eventData.end,
                    timeZone: eventData.timeZone || 'Australia/Sydney'
                },
                reminders: eventData.reminders || {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 10 },
                        { method: 'popup', minutes: 2 }
                    ]
                }
            };

            if (eventData.colorId) {
                event.colorId = eventData.colorId;
            }

            const response = await this.makeRequest(
                `/calendars/${encodeURIComponent(calendarId)}/events`,
                'POST',
                event
            );
            
            return response;
        } catch (error) {
            console.error('Error creating event:', error.message);
            throw error;
        }
    }

    async updateEvent(calendarId = 'primary', eventId, eventData) {
        try {
            const response = await this.makeRequest(
                `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
                'PUT',
                eventData
            );
            return response;
        } catch (error) {
            console.error('Error updating event:', error.message);
            throw error;
        }
    }

    async deleteEvent(calendarId = 'primary', eventId) {
        try {
            await this.makeRequest(
                `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
                'DELETE'
            );
            return { success: true };
        } catch (error) {
            console.error('Error deleting event:', error.message);
            throw error;
        }
    }

    async listEvents(calendarId = 'primary', options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.timeMin) params.append('timeMin', options.timeMin);
            if (options.timeMax) params.append('timeMax', options.timeMax);
            if (options.maxResults) params.append('maxResults', options.maxResults);
            if (options.orderBy) params.append('orderBy', options.orderBy);
            if (options.singleEvents !== undefined) params.append('singleEvents', options.singleEvents);
            
            const queryString = params.toString();
            const endpoint = `/calendars/${encodeURIComponent(calendarId)}/events${queryString ? '?' + queryString : ''}`;
            
            const response = await this.makeRequest(endpoint);
            return response.items || [];
        } catch (error) {
            console.error('Error listing events:', error.message);
            return [];
        }
    }

    async getFreeBusy(timeMin, timeMax, calendarIds = ['primary']) {
        try {
            const requestBody = {
                timeMin,
                timeMax,
                items: calendarIds.map(id => ({ id }))
            };
            
            const response = await this.makeRequest('/freeBusy', 'POST', requestBody);
            return response;
        } catch (error) {
            console.error('Error getting free/busy:', error.message);
            throw error;
        }
    }

    // Helper to set up OAuth if needed
    async setupOAuth() {
        console.log('🔐 OAuth2 Setup Required for Google Calendar');
        console.log('   Google Calendar API requires OAuth2 authentication, API keys alone won\'t work.');
        console.log('');
        console.log('   Setup Steps:');
        console.log('   1. Go to https://console.cloud.google.com/');
        console.log('   2. Enable Google Calendar API');
        console.log('   3. Create OAuth 2.0 credentials (not API key)');
        console.log('   4. Download credentials as client_secret.json');
        console.log('   5. Use Google Calendar MCP or OAuth flow');
        console.log('');
        console.log('   Alternative: Use the existing MCP integration:');
        console.log('   - Ensure MCP is configured in Claude Desktop');
        console.log('   - Use /mcp commands for calendar operations');
        console.log('');
        console.log('   For now, this script will provide manual event details');
    }
}

// Export for use in other scripts
module.exports = GoogleCalendarAPI;

// CLI interface if run directly
if (require.main === module) {
    const api = new GoogleCalendarAPI();
    
    const command = process.argv[2];
    const args = process.argv.slice(3);
    
    async function main() {
        try {
            switch (command) {
                case 'test':
                    console.log('🔍 Testing Google Calendar API connection...');
                    const calendars = await api.listCalendars();
                    console.log(`✅ Found ${calendars.length} calendars`);
                    calendars.forEach(cal => {
                        console.log(`   - ${cal.summary || cal.id}`);
                    });
                    break;
                    
                case 'list-events':
                    const today = new Date().toISOString();
                    const tomorrow = new Date(Date.now() + 86400000).toISOString();
                    const events = await api.listEvents('primary', {
                        timeMin: today,
                        timeMax: tomorrow,
                        singleEvents: true,
                        orderBy: 'startTime'
                    });
                    console.log(`📅 Today's events (${events.length}):`);
                    events.forEach(event => {
                        const start = event.start.dateTime || event.start.date;
                        console.log(`   - ${start}: ${event.summary}`);
                    });
                    break;
                    
                case 'create-test':
                    const testEvent = await api.createEvent('primary', {
                        summary: 'Test Event from API',
                        description: 'Created using Google Calendar API',
                        start: new Date().toISOString(),
                        end: new Date(Date.now() + 3600000).toISOString(),
                        timeZone: 'Australia/Sydney'
                    });
                    console.log('✅ Test event created:', testEvent.htmlLink);
                    break;
                    
                default:
                    console.log('Usage: node google-calendar-api.cjs [command]');
                    console.log('Commands:');
                    console.log('  test           - Test API connection');
                    console.log('  list-events    - List today\'s events');
                    console.log('  create-test    - Create a test event');
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }
    
    main();
}