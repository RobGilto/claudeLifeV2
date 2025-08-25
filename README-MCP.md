# Robert's Claude Life MCP Server

A Model Context Protocol (MCP) server that integrates with your personal AI engineering journey and productivity system.

## Features

This MCP provides tools for:
- **Daily Check-ins**: Personal reflection prompts with mood and energy tracking
- **Brain Dumps**: Timestamped stream-of-consciousness entries
- **Victory Tracking**: Combat the inner critic with systematic win recognition
- **Weekly Reviews**: Structured weekly analysis with metrics and insights
- **Recent Entries**: Retrieve and analyze your recent entries

## Installation

1. Install dependencies using Docker (as per your development guidelines):
```bash
# Create a docker container for Node.js operations
docker run --rm -v "${PWD}:/workspace" -w /workspace node:18 npm install
```

2. Build the TypeScript:
```bash
docker run --rm -v "${PWD}:/workspace" -w /workspace node:18 npm run build
```

## Claude Code Integration

Add this to your Claude Code settings (typically `~/.claude/config.json`):

```json
{
  "mcpServers": {
    "robert-claude-life-mcp": {
      "command": "node",
      "args": ["C:\\Users\\robert.gilto\\codeLab\\claudeLifeV2\\dist\\index.js"],
      "cwd": "C:\\Users\\robert.gilto\\codeLab\\claudeLifeV2"
    }
  }
}
```

Or use npx for automatic dependency management:

```json
{
  "mcpServers": {
    "robert-claude-life-mcp": {
      "command": "npx",
      "args": ["-y", "tsx", "src/index.ts"],
      "cwd": "C:\\Users\\robert.gilto\\codeLab\\claudeLifeV2"
    }
  }
}
```

## Available Tools

### `daily_checkin`
Create or update a daily check-in entry with personal reflection prompts.

**Parameters:**
- `mood` (required): Current mood (1-10 scale or descriptive)
- `energy` (required): Energy level (1-10 scale or descriptive)  
- `accomplishments`: What you accomplished today
- `challenges`: Challenges faced today
- `gratitude`: What you're grateful for today
- `tomorrow_focus`: Main focus for tomorrow

### `brain_dump`
Create a timestamped brain dump entry for stream-of-consciousness thoughts.

**Parameters:**
- `content` (required): Stream of consciousness content
- `topic`: Optional topic/title for the brain dump
- `source`: Source type ("text" or "audio", defaults to "text")

### `add_victory`
Add a victory to combat the inner critic (Mimic).

**Parameters:**
- `victory` (required): Description of the victory
- `category` (required): Category ("technical", "personal", "discipline", "learning", "self-awareness")
- `impact`: Impact level ("small", "medium", "large", defaults to "small")

### `weekly_review`
Create or update a weekly review with metrics and insights.

**Parameters:**
- `week_number` (required): Week number (1-52)
- `coding_hours`: Hours spent coding this week
- `learning_focus`: Main learning focus this week
- `wins`: Key wins this week
- `challenges`: Main challenges faced
- `next_week_goals`: Goals for next week

### `get_recent_entries`
Get recent entries from daily checkins, brain dumps, or victories.

**Parameters:**
- `entry_type` (required): Type of entries ("daily", "brain_dump", "victories", "weekly")
- `limit`: Number of recent entries to retrieve (defaults to 5)

## File Structure

The MCP respects your existing file organization:

```
/journal/daily/          # Daily check-ins
/journal/brain/          # Brain dumps  
/victories/              # Victory tracking
/weekly/                 # Weekly reviews
```

All files follow your established naming conventions and YAML frontmatter standards.

## Development

Run in development mode:
```bash
docker run --rm -v "${PWD}:/workspace" -w /workspace node:18 npm run dev
```

## Privacy & Security

- All entries are marked with `privacy: private` by default
- Follows your existing privacy guidelines from CLAUDE.md
- No data is transmitted outside your local system