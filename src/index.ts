#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the project root directory (go up from dist or src)
const PROJECT_ROOT = join(__dirname, "..", "..");

class RobertClaudeLifeMCP {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "robert-claude-life-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "daily_checkin",
          description: "Create or update a daily check-in entry with personal reflection prompts",
          inputSchema: {
            type: "object",
            properties: {
              mood: {
                type: "string",
                description: "Current mood (1-10 scale or descriptive)",
              },
              energy: {
                type: "string", 
                description: "Energy level (1-10 scale or descriptive)",
              },
              accomplishments: {
                type: "string",
                description: "What you accomplished today",
              },
              challenges: {
                type: "string",
                description: "Challenges faced today",
              },
              gratitude: {
                type: "string",
                description: "What you're grateful for today",
              },
              tomorrow_focus: {
                type: "string",
                description: "Main focus for tomorrow",
              }
            },
            required: ["mood", "energy"]
          },
        },
        {
          name: "brain_dump",
          description: "Create a timestamped brain dump entry for stream-of-consciousness thoughts",
          inputSchema: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description: "Stream of consciousness content",
              },
              topic: {
                type: "string",
                description: "Optional topic/title for the brain dump",
              },
              source: {
                type: "string",
                enum: ["text", "audio"],
                description: "Source of the brain dump",
                default: "text"
              }
            },
            required: ["content"]
          },
        },
        {
          name: "add_victory",
          description: "Add a victory to combat the inner critic (Mimic)",
          inputSchema: {
            type: "object",
            properties: {
              victory: {
                type: "string",
                description: "Description of the victory",
              },
              category: {
                type: "string",
                enum: ["technical", "personal", "discipline", "learning", "self-awareness"],
                description: "Category of victory",
              },
              impact: {
                type: "string",
                enum: ["small", "medium", "large"],
                description: "Impact level of the victory",
                default: "small"
              }
            },
            required: ["victory", "category"]
          },
        },
        {
          name: "weekly_review",
          description: "Create or update a weekly review with metrics and insights",
          inputSchema: {
            type: "object",
            properties: {
              week_number: {
                type: "number",
                description: "Week number (1-52)",
              },
              coding_hours: {
                type: "number",
                description: "Hours spent coding this week",
              },
              learning_focus: {
                type: "string",
                description: "Main learning focus this week",
              },
              wins: {
                type: "string",
                description: "Key wins this week",
              },
              challenges: {
                type: "string",
                description: "Main challenges faced",
              },
              next_week_goals: {
                type: "string",
                description: "Goals for next week",
              }
            },
            required: ["week_number"]
          },
        },
        {
          name: "get_recent_entries",
          description: "Get recent entries from daily checkins, brain dumps, or victories",
          inputSchema: {
            type: "object",
            properties: {
              entry_type: {
                type: "string",
                enum: ["daily", "brain_dump", "victories", "weekly"],
                description: "Type of entries to retrieve",
              },
              limit: {
                type: "number",
                description: "Number of recent entries to retrieve",
                default: 5
              }
            },
            required: ["entry_type"]
          },
        }
      ] as Tool[],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "daily_checkin":
            return await this.handleDailyCheckin(args);
          case "brain_dump":
            return await this.handleBrainDump(args);
          case "add_victory":
            return await this.handleAddVictory(args);
          case "weekly_review":
            return await this.handleWeeklyReview(args);
          case "get_recent_entries":
            return await this.handleGetRecentEntries(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private async handleDailyCheckin(args: any) {
    const today = new Date().toISOString().split('T')[0];
    const filePath = join(PROJECT_ROOT, "journal", "daily", `${today}.md`);
    
    // Ensure directory exists
    await fs.mkdir(dirname(filePath), { recursive: true });
    
    const frontmatter = `---
date: ${today}
type: daily
status: ongoing
privacy: private
mood: ${args.mood}
energy: ${args.energy}
---

# Daily Check-in - ${today}

## Mood & Energy
- **Mood**: ${args.mood}
- **Energy**: ${args.energy}

## Today's Accomplishments
${args.accomplishments || ""}

## Challenges Faced
${args.challenges || ""}

## Gratitude
${args.gratitude || ""}

## Tomorrow's Focus
${args.tomorrow_focus || ""}

---
*Created via MCP - ${new Date().toISOString()}*
`;

    await fs.writeFile(filePath, frontmatter, 'utf8');
    
    return {
      content: [
        {
          type: "text",
          text: `Daily check-in created: ${filePath}`,
        },
      ],
    };
  }

  private async handleBrainDump(args: any) {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const topic = args.topic || "general-thoughts";
    const fileName = `braindump-${date}-${time}-${topic.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filePath = join(PROJECT_ROOT, "journal", "brain", fileName);
    
    // Ensure directory exists
    await fs.mkdir(dirname(filePath), { recursive: true });
    
    const frontmatter = `---
date: ${date}
time: ${now.toTimeString().split(' ')[0]}
type: braindump
source: ${args.source || "text"}
topic: ${topic}
tags: []
status: raw
privacy: private
---

# Brain Dump: ${topic}

${args.content}

---
*Direct text entry - ${now.toISOString()}*
`;

    await fs.writeFile(filePath, frontmatter, 'utf8');
    
    return {
      content: [
        {
          type: "text",
          text: `Brain dump created: ${filePath}`,
        },
      ],
    };
  }

  private async handleAddVictory(args: any) {
    const now = new Date();
    const monthKey = now.toISOString().slice(0, 7); // YYYY-MM
    const filePath = join(PROJECT_ROOT, "victories", `victories-${monthKey}.md`);
    
    // Ensure directory exists
    await fs.mkdir(dirname(filePath), { recursive: true });
    
    const timestamp = now.toISOString();
    const victoryEntry = `
## ${args.category.charAt(0).toUpperCase() + args.category.slice(1)} Victory - ${now.toISOString().split('T')[0]}
**Impact**: ${args.impact || "small"}
**Description**: ${args.victory}
**Timestamp**: ${timestamp}

---
`;

    try {
      // Try to append to existing file
      await fs.access(filePath);
      const existing = await fs.readFile(filePath, 'utf8');
      await fs.writeFile(filePath, existing + victoryEntry, 'utf8');
    } catch {
      // File doesn't exist, create new with header
      const header = `---
date: ${monthKey}
type: victories
status: ongoing
privacy: private
---

# Victories - ${monthKey}
${victoryEntry}`;
      await fs.writeFile(filePath, header, 'utf8');
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Victory added to ${filePath}`,
        },
      ],
    };
  }

  private async handleWeeklyReview(args: any) {
    const year = new Date().getFullYear();
    const fileName = `weekly-${year}-${String(args.week_number).padStart(2, '0')}.md`;
    const filePath = join(PROJECT_ROOT, "weekly", fileName);
    
    // Ensure directory exists
    await fs.mkdir(dirname(filePath), { recursive: true });
    
    const weekStart = this.getDateOfISOWeek(year, args.week_number);
    const content = `---
date: ${weekStart.toISOString().split('T')[0]}
type: weekly
week: ${args.week_number}
status: review
privacy: private
---

# Weekly Review - Week ${args.week_number}, ${year}

## Metrics
- **Coding Hours**: ${args.coding_hours || "Not tracked"}
- **Learning Focus**: ${args.learning_focus || ""}

## This Week's Wins
${args.wins || ""}

## Challenges & Learnings
${args.challenges || ""}

## Next Week's Goals
${args.next_week_goals || ""}

---
*Created via MCP - ${new Date().toISOString()}*
`;

    await fs.writeFile(filePath, content, 'utf8');
    
    return {
      content: [
        {
          type: "text",
          text: `Weekly review created: ${filePath}`,
        },
      ],
    };
  }

  private async handleGetRecentEntries(args: any) {
    const limit = args.limit || 5;
    let searchDir: string;
    let pattern: string;

    switch (args.entry_type) {
      case "daily":
        searchDir = join(PROJECT_ROOT, "journal", "daily");
        pattern = "*.md";
        break;
      case "brain_dump":
        searchDir = join(PROJECT_ROOT, "journal", "brain");
        pattern = "braindump-*.md";
        break;
      case "victories":
        searchDir = join(PROJECT_ROOT, "victories");
        pattern = "victories-*.md";
        break;
      case "weekly":
        searchDir = join(PROJECT_ROOT, "weekly");
        pattern = "weekly-*.md";
        break;
      default:
        throw new Error(`Unknown entry type: ${args.entry_type}`);
    }

    try {
      const files = await fs.readdir(searchDir);
      const matchingFiles = files
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse()
        .slice(0, limit);

      const entries = await Promise.all(
        matchingFiles.map(async (file) => {
          const content = await fs.readFile(join(searchDir, file), 'utf8');
          return { file, content: content.slice(0, 500) + '...' };
        })
      );

      return {
        content: [
          {
            type: "text",
            text: `Recent ${args.entry_type} entries:\n\n${entries.map(e => `**${e.file}**\n${e.content}\n---`).join('\n')}`,
          },
        ],
      };
    } catch {
      return {
        content: [
          {
            type: "text",
            text: `No ${args.entry_type} entries found`,
          },
        ],
      };
    }
  }

  private getDateOfISOWeek(year: number, week: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Robert's Claude Life MCP server running on stdio");
  }
}

const server = new RobertClaudeLifeMCP();
server.run().catch(console.error);