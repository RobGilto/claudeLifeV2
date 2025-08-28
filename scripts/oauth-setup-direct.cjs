#!/usr/bin/env node

/**
 * Google OAuth2 Direct Setup for Calendar API
 * Purpose: Set up OAuth2 credentials for direct API access
 * Usage: node scripts/oauth-setup-direct.cjs
 * Dependencies: Google Cloud Console credentials
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');
const crypto = require('crypto');
require('dotenv').config();

console.log('🔐 Google Calendar OAuth2 Direct Setup\n');

const CREDENTIALS_FILE = path.join(__dirname, '..', 'client_secret_google_calendar.json');
const TOKENS_FILE = path.join(__dirname, '..', '.google-tokens.json');

// OAuth2 configuration
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const REDIRECT_URI = 'http://localhost:8080/oauth/callback';

class OAuth2Setup {
    constructor() {
        this.credentials = null;
        this.tokens = null;
    }

    loadCredentials() {
        // Try loading from .env first
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        if (clientId && clientSecret) {
            this.credentials = {
                installed: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    auth_uri: "https://accounts.google.com/o/oauth2/auth",
                    token_uri: "https://oauth2.googleapis.com/token",
                    redirect_uris: ["http://localhost:8080/oauth/callback"]
                }
            };
            console.log('✅ Loaded OAuth2 credentials from .env');
            return true;
        }

        // Fallback to file-based credentials
        if (!fs.existsSync(CREDENTIALS_FILE)) {
            console.log('❌ No credentials found in .env or client_secret_google_calendar.json!');
            console.log('');
            console.log('📋 Add to .env file:');
            console.log('   GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com');
            console.log('   GOOGLE_CLIENT_SECRET=your-client-secret');
            console.log('');
            console.log('💡 Or download from Google Cloud Console:');
            console.log('1. Go to: https://console.cloud.google.com/');
            console.log('2. Project: level-epoch-469021-e3');
            console.log('3. APIs & Services → Credentials');
            console.log('4. Download OAuth 2.0 Client JSON');
            console.log('5. Save as: client_secret_google_calendar.json');
            return false;
        }

        try {
            this.credentials = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf8'));
            console.log('✅ Loaded OAuth2 credentials from file');
            return true;
        } catch (error) {
            console.log('❌ Error reading credentials:', error.message);
            return false;
        }
    }

    generateAuthUrl() {
        const { client_id, redirect_uris } = this.credentials.installed || this.credentials.web;
        const redirectUri = redirect_uris ? redirect_uris[0] : REDIRECT_URI;
        
        const state = crypto.randomBytes(32).toString('hex');
        const codeVerifier = crypto.randomBytes(32).toString('base64url');
        const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

        // Store for later verification
        this.state = state;
        this.codeVerifier = codeVerifier;

        const params = new URLSearchParams({
            client_id: client_id,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: SCOPES.join(' '),
            access_type: 'offline',
            prompt: 'consent',
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    }

    async exchangeCodeForTokens(code, state) {
        if (state !== this.state) {
            throw new Error('Invalid state parameter');
        }

        const { client_id, client_secret, redirect_uris } = this.credentials.installed || this.credentials.web;
        const redirectUri = redirect_uris ? redirect_uris[0] : REDIRECT_URI;

        const postData = new URLSearchParams({
            client_id: client_id,
            client_secret: client_secret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code_verifier: this.codeVerifier
        }).toString();

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'oauth2.googleapis.com',
                path: '/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const tokens = JSON.parse(data);
                        if (tokens.error) {
                            reject(new Error(`OAuth error: ${tokens.error_description || tokens.error}`));
                        } else {
                            resolve(tokens);
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse token response: ${data}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }

    saveTokens(tokens) {
        // Add timestamp and credential info
        const tokenData = {
            ...tokens,
            created_at: new Date().toISOString(),
            credentials_file: CREDENTIALS_FILE
        };

        fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokenData, null, 2));
        console.log('✅ Tokens saved to:', TOKENS_FILE);

        // Update .gitignore
        const gitignoreFile = path.join(__dirname, '..', '.gitignore');
        let gitignoreContent = '';
        
        if (fs.existsSync(gitignoreFile)) {
            gitignoreContent = fs.readFileSync(gitignoreFile, 'utf8');
        }

        const entriesToAdd = [
            'client_secret_google_calendar.json',
            '.google-tokens.json'
        ];

        let updated = false;
        for (const entry of entriesToAdd) {
            if (!gitignoreContent.includes(entry)) {
                gitignoreContent += `\n# Google OAuth credentials\n${entry}\n`;
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(gitignoreFile, gitignoreContent);
            console.log('✅ Updated .gitignore with credential files');
        }
    }

    startLocalServer() {
        return new Promise((resolve, reject) => {
            const http = require('http');
            
            const server = http.createServer((req, res) => {
                const url = new URL(req.url, `http://localhost:8080`);
                
                if (url.pathname === '/oauth/callback') {
                    const code = url.searchParams.get('code');
                    const state = url.searchParams.get('state');
                    const error = url.searchParams.get('error');

                    if (error) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(`<h1>OAuth Error</h1><p>${error}</p>`);
                        server.close();
                        reject(new Error(`OAuth error: ${error}`));
                        return;
                    }

                    if (!code) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end('<h1>Error</h1><p>No authorization code received</p>');
                        server.close();
                        reject(new Error('No authorization code received'));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <h1>Authorization Successful!</h1>
                        <p>You can close this window and return to the terminal.</p>
                        <script>setTimeout(() => window.close(), 2000);</script>
                    `);

                    server.close();
                    resolve({ code, state });
                } else {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end('<h1>Not Found</h1>');
                }
            });

            server.listen(8080, () => {
                console.log('🌐 Local OAuth server started on http://localhost:8080');
            });

            server.on('error', reject);
        });
    }

    async setupOAuth() {
        console.log('🚀 Starting OAuth2 setup process...\n');

        // Start local server for callback
        console.log('📡 Starting local callback server...');
        const serverPromise = this.startLocalServer();

        // Generate and display auth URL
        const authUrl = this.generateAuthUrl();
        console.log('🔗 Authorization URL:');
        console.log(authUrl);
        console.log('');
        console.log('📋 Next steps:');
        console.log('1. Click the link above (or copy to browser)');
        console.log('2. Sign in with your Google account');
        console.log('3. Grant calendar permissions');
        console.log('4. Browser will redirect to localhost (callback handled automatically)');
        console.log('');
        console.log('⏳ Waiting for authorization...');

        try {
            // Wait for callback
            const { code, state } = await serverPromise;
            console.log('✅ Authorization code received');

            // Exchange code for tokens
            console.log('🔄 Exchanging code for access tokens...');
            const tokens = await this.exchangeCodeForTokens(code, state);
            console.log('✅ Tokens received successfully');

            // Save tokens
            this.saveTokens(tokens);

            return tokens;
        } catch (error) {
            console.log('❌ OAuth setup failed:', error.message);
            throw error;
        }
    }

    loadExistingTokens() {
        if (fs.existsSync(TOKENS_FILE)) {
            try {
                this.tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
                console.log('✅ Existing tokens loaded');
                return true;
            } catch (error) {
                console.log('⚠️ Error loading existing tokens:', error.message);
                return false;
            }
        }
        return false;
    }

    async refreshTokens() {
        if (!this.tokens || !this.tokens.refresh_token) {
            throw new Error('No refresh token available');
        }

        const { client_id, client_secret } = this.credentials.installed || this.credentials.web;

        const postData = new URLSearchParams({
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: this.tokens.refresh_token,
            grant_type: 'refresh_token'
        }).toString();

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'oauth2.googleapis.com',
                path: '/token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const newTokens = JSON.parse(data);
                        if (newTokens.error) {
                            reject(new Error(`Token refresh error: ${newTokens.error_description || newTokens.error}`));
                        } else {
                            // Preserve refresh token if not included in response
                            if (!newTokens.refresh_token) {
                                newTokens.refresh_token = this.tokens.refresh_token;
                            }
                            resolve(newTokens);
                        }
                    } catch (e) {
                        reject(new Error(`Failed to parse refresh response: ${data}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });
    }
}

// CLI interface
async function main() {
    const command = process.argv[2] || 'setup';

    const oauth = new OAuth2Setup();

    try {
        switch (command) {
            case 'setup':
                if (!oauth.loadCredentials()) {
                    return;
                }

                if (oauth.loadExistingTokens()) {
                    console.log('⚠️ Tokens already exist. Use "refresh" to update or "reset" to start over.');
                    return;
                }

                await oauth.setupOAuth();
                console.log('🎉 OAuth2 setup complete!');
                console.log('');
                console.log('🔧 You can now use the direct API:');
                console.log('   node scripts/calendar-sync-api.cjs --auto');
                break;

            case 'refresh':
                if (!oauth.loadCredentials()) return;
                if (!oauth.loadExistingTokens()) {
                    console.log('❌ No existing tokens found. Run setup first.');
                    return;
                }

                console.log('🔄 Refreshing access token...');
                const newTokens = await oauth.refreshTokens();
                oauth.saveTokens(newTokens);
                console.log('✅ Tokens refreshed successfully');
                break;

            case 'reset':
                if (fs.existsSync(TOKENS_FILE)) {
                    fs.unlinkSync(TOKENS_FILE);
                    console.log('✅ Tokens deleted. Run setup to start fresh.');
                } else {
                    console.log('ℹ️ No tokens to reset');
                }
                break;

            case 'status':
                console.log('📊 OAuth2 Status:');
                console.log(`   Credentials file: ${fs.existsSync(CREDENTIALS_FILE) ? '✅' : '❌'} ${CREDENTIALS_FILE}`);
                console.log(`   Tokens file: ${fs.existsSync(TOKENS_FILE) ? '✅' : '❌'} ${TOKENS_FILE}`);
                
                if (oauth.loadExistingTokens()) {
                    const expiresAt = new Date(oauth.tokens.created_at);
                    expiresAt.setSeconds(expiresAt.getSeconds() + (oauth.tokens.expires_in || 3600));
                    console.log(`   Token expires: ${expiresAt.toLocaleString()}`);
                    console.log(`   Refresh token: ${oauth.tokens.refresh_token ? '✅' : '❌'}`);
                }
                break;

            default:
                console.log('Usage: node oauth-setup-direct.cjs [command]');
                console.log('Commands:');
                console.log('  setup    - Initial OAuth2 setup (default)');
                console.log('  refresh  - Refresh existing tokens');
                console.log('  reset    - Delete tokens and start over');
                console.log('  status   - Check current setup status');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();