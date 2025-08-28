# OAuth2 Direct API - Quick Reference

## For Full Automation (Optional)

### 1. Get Google Credentials
1. Go to: https://console.cloud.google.com/
2. Enable Google Calendar API
3. Create OAuth 2.0 Client IDs (Desktop application)
4. Download JSON → save as `client_secret.json`

### 2. Run OAuth Setup
```bash
node scripts/oauth-setup-direct.cjs setup
```
- Opens browser for Google sign-in
- Grant calendar permissions
- Tokens saved automatically

### 3. Use Automated Sync
```bash
node scripts/calendar-sync-api.cjs --auto
```
- Creates events directly in Google Calendar
- No manual steps required

## Commands Reference

| Command | Purpose |
|---------|---------|
| `oauth-setup-direct.cjs status` | Check current setup |
| `oauth-setup-direct.cjs setup` | Initial OAuth flow |
| `oauth-setup-direct.cjs refresh` | Refresh expired tokens |
| `oauth-setup-direct.cjs reset` | Delete tokens, start over |
| `google-calendar-api.cjs test` | Test API connection |
| `calendar-sync-api.cjs --auto` | Automated event creation |

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | `lsof -ti:8080 \| xargs kill -9` |
| Invalid client error | Check `client_secret.json` format |
| Access denied | Re-run setup, grant permissions |
| Tokens expired | `oauth-setup-direct.cjs refresh` |

## File Security

- `client_secret.json` - Never commit (added to .gitignore)
- `.google-tokens.json` - Never commit (added to .gitignore)
- Both files contain sensitive credentials

## Current Working Method (No Setup Needed)

```bash
node scripts/calendar-sync-api.cjs
# Copy MCP commands → Paste in Claude Code → Events created
```

OAuth setup is **optional** - only needed for full automation.