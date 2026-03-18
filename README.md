# Habitica MCP Server

_中文文档请阅读 **[README.zh-CN.md](README.zh-CN.md)**_

A Model Context Protocol (MCP) server that lets AI assistants interact with the Habitica API — create tasks, track habits, raise pets, and enjoy gamified productivity.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) 1.0+
- A valid Habitica account

### MCP client configuration

The easiest way to use this server is via `bunx` — no install required.

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "habitica": {
      "command": "bunx",
      "args": ["github:mikedfunk/habitica-mcp-server"],
      "env": {
        "HABITICA_USER_ID": "your-user-id",
        "HABITICA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Claude Code** (`.claude/settings.json` or global `~/.claude/settings.json`):
```json
{
  "mcpServers": {
    "habitica": {
      "command": "bunx",
      "args": ["github:mikedfunk/habitica-mcp-server"],
      "env": {
        "HABITICA_USER_ID": "your-user-id",
        "HABITICA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

Set `MCP_LANG=zh-CN` if you prefer Chinese responses.

### Get Habitica API credentials

1. Log into [Habitica](https://habitica.com)
2. Click your avatar → **Settings** → **API**
3. Copy your **User ID** and **API Token**

## Available Tools

### User
| Tool | Description |
|------|-------------|
| `get_user_profile` | Get full user profile |
| `get_stats` | Get user stats (HP, MP, XP, gold, level) |
| `get_inventory` | Get all owned items |
| `toggle_sleep` | Rest in the inn (pause dailies) |
| `revive` | Revive after death |
| `allocate_stat` | Spend a stat point (str/int/con/per) |

### Tasks
| Tool | Description |
|------|-------------|
| `get_tasks` | List tasks (optionally filter by type) |
| `create_task` | Create a habit, daily, todo, or reward |
| `update_task` | Update task text, notes, or completion |
| `delete_task` | Delete a task |
| `score_task` | Complete a task or record a habit |
| `reorder_task` | Move a task to a specific position |
| `clear_completed_todos` | Remove all completed todos |

### Checklists
| Tool | Description |
|------|-------------|
| `get_task_checklist` | List checklist items for a task |
| `add_checklist_item` | Add an item to a task's checklist |
| `update_checklist_item` | Update checklist item text or completion |
| `delete_checklist_item` | Delete a checklist item |
| `score_checklist_item` | Toggle a checklist item complete/incomplete |

### Tags
| Tool | Description |
|------|-------------|
| `get_tags` | List all tags |
| `create_tag` | Create a new tag |
| `update_tag` | Rename a tag |
| `delete_tag` | Delete a tag |

### Pets & Mounts
| Tool | Description |
|------|-------------|
| `get_pets` | List owned pets |
| `feed_pet` | Feed a pet |
| `hatch_pet` | Hatch an egg with a hatching potion |
| `get_mounts` | List owned mounts |
| `equip_item` | Equip a pet, mount, or gear item |

### Shop & Rewards
| Tool | Description |
|------|-------------|
| `get_shop` | Browse a shop (market, questShop, etc.) |
| `buy_item` | Buy an item from the shop |
| `buy_reward` | Buy a custom reward |

### Skills
| Tool | Description |
|------|-------------|
| `cast_spell` | Cast a class skill |

### Notifications
| Tool | Description |
|------|-------------|
| `get_notifications` | List notifications |
| `read_notification` | Mark a notification as read |

### Social
| Tool | Description |
|------|-------------|
| `get_groups` | List groups (party, guilds) |
| `get_party` | Get current party info |
| `send_private_message` | Send a private message to a member |
| `get_inbox` | Get inbox messages |

## Task Types

| Value | Description |
|-------|-------------|
| `habit` | Repeatable habit (positive or negative direction) |
| `daily` | Resets each day |
| `todo` | One-time to-do item |
| `reward` | Purchasable with gold |

## Difficulty / Priority

| Value | Label |
|-------|-------|
| `0.1` | Easy / Low |
| `1` | Medium |
| `1.5` | Hard / High |
| `2` | Very hard / Urgent |

## Development

```bash
git clone https://github.com/mikedfunk/habitica-mcp-server.git
cd habitica-mcp-server
bun install

# Run
bun src/index.ts

# Type check
bun run typecheck

# Tests
bun test

# Build
bun run build
```

## Troubleshooting

**Server won't start** — Check that `HABITICA_USER_ID` and `HABITICA_API_TOKEN` are set correctly.

**API errors** — Verify your credentials at Habitica → Settings → API. Check you haven't hit rate limits.

**Task/pet not found** — Confirm the ID is correct. IDs are UUIDs visible in `get_tasks` / `get_pets` output.

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  <b>Let AI become your Habitica assistant.</b>
</div>
