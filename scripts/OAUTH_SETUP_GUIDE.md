# Google Calendar OAuth2 Direct API Setup Guide

This guide shows you how to set up OAuth2 authentication for direct Google Calendar API access, enabling fully automated calendar event creation.

## Quick Start

```bash
# Check current status
node scripts/oauth-setup-direct.cjs status

# Set up OAuth2 (if needed)
node scripts/oauth-setup-direct.cjs setup

# Test the connection
node scripts/google-calendar-api.cjs test

# Use automated calendar sync
node scripts/calendar-sync-api.cjs --auto
```

## Step-by-Step Setup

### 1. Get Google API Credentials

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: Create new or select existing project
3. **Enable Calendar API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"
4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Desktop application"
   - Name it (e.g., "Calendar Sync Tool")
   - Download the JSON file

### 2. Install Credentials

```bash
# Save the downloaded JSON as:
# /home/robert/claudeRepos/claudeLifeV2/client_secret.json

# Credentials are automatically loaded from .env file:
# GOOGLE_CLIENT_ID=your-client-id.googleusercontent.com
# GOOGLE_CLIENT_SECRET=your-client-secret

# The client_secret.json format should be:
{
  "installed": {
    "client_id": "process.env.GOOGLE_CLIENT_ID",
    "client_secret": "process.env.GOOGLE_CLIENT_SECRET",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "redirect_uris": ["http://localhost"]
  }
}
```

### 3. Run OAuth Setup

```bash
# Start the OAuth2 setup process
node scripts/oauth-setup-direct.cjs setup
```

**What happens:**
1. Script starts a local web server on port 8080
2. Opens OAuth authorization URL in your default browser
3. You sign in with Google account
4. Grant calendar permissions
5. Browser redirects to localhost (handled automatically)
6. Tokens are saved to `.google-tokens.json`
7. Files are added to `.gitignore` for security

### 4. Test the Setup

```bash
# Test the API connection
node scripts/google-calendar-api.cjs test

# Expected output:
# 🔍 Testing Google Calendar API connection...
# 🔑 Token source: direct
# 🎫 Access token: ✅ Available
# ✅ Found X calendars
```

### 5. Use Automated Calendar Sync

```bash
# Create events automatically
node scripts/calendar-sync-api.cjs --auto

# Or for specific date
node scripts/calendar-sync-api.cjs 2025-08-29 --auto
```

## Token Management

### Check Status
```bash
node scripts/oauth-setup-direct.cjs status
```

### Refresh Expired Tokens
```bash
node scripts/oauth-setup-direct.cjs refresh
```

### Reset and Start Over
```bash
node scripts/oauth-setup-direct.cjs reset
node scripts/oauth-setup-direct.cjs setup
```

## File Structure

```
claudeLifeV2/
├── client_secret.json          # OAuth credentials (DO NOT COMMIT)
├── .google-tokens.json         # Access/refresh tokens (DO NOT COMMIT)
├── .gitignore                  # Updated automatically to ignore above files
└── scripts/
    ├── oauth-setup-direct.cjs  # OAuth setup wizard
    ├── google-calendar-api.cjs # API integration module
    └── calendar-sync-api.cjs   # Enhanced calendar sync
```

## Security Notes

- **Never commit credentials**: Files are automatically added to `.gitignore`
- **Tokens expire**: Access tokens expire in ~1 hour, refresh tokens handle renewal
- **Scopes**: Only requests calendar access, no other Google services
- **Local only**: OAuth callback runs on localhost, no external servers

## Troubleshooting

### "Port 8080 already in use"
```bash
# Find and kill the process using port 8080
lsof -ti:8080 | xargs kill -9
```

### "Invalid client" error
- Check `client_secret.json` format
- Ensure OAuth 2.0 Client ID type is "Desktop application"
- Verify Google Calendar API is enabled

### "Access denied" error
- Make sure you granted calendar permissions during OAuth flow
- Check that you're using the correct Google account

### Tokens expired
```bash
node scripts/oauth-setup-direct.cjs refresh
```

### Reset everything
```bash
node scripts/oauth-setup-direct.cjs reset
rm client_secret.json
# Download new credentials and start over
```

## Integration with Existing Workflow

### Priority Order (Automatic)
1. **Direct OAuth tokens** (if available) → Full API automation
2. **MCP tokens** (if available) → MCP commands
3. **Manual entry** → Always available as fallback

### Current vs Enhanced
```bash
# Your current working method (still works)
node scripts/calendar-sync-api.cjs
# → Generates MCP commands for Claude Code

# New automated method (after OAuth setup)
node scripts/calendar-sync-api.cjs --auto
# → Creates events directly via API
```

## OAuth Flow Details

1. **Authorization**: Browser opens Google OAuth consent screen
2. **Consent**: You grant calendar access permissions
3. **Code Exchange**: Authorization code exchanged for tokens
4. **Token Storage**: Access + refresh tokens saved locally
5. **API Access**: Direct API calls using access token
6. **Auto Refresh**: Expired access tokens refreshed automatically

## Benefits of Direct OAuth

- ✅ **Fully Automated**: No manual MCP command execution
- ✅ **Reliable**: Direct API calls, no intermediate steps
- ✅ **Secure**: Industry-standard OAuth2 flow
- ✅ **Renewable**: Refresh tokens for long-term access
- ✅ **Fast**: Instant event creation
- ✅ **Flexible**: Full Calendar API access for future features

## Next Steps After Setup

1. **Test basic sync**: `node scripts/calendar-sync-api.cjs --auto`
2. **Integrate with daily workflow**: Update fractal planner scripts
3. **Add to cron**: Automate daily calendar sync
4. **Extend features**: Add event updates, deletions, recurring events