# Habitica MCP Server

![CI](https://github.com/mikedfunk/habitica-mcp-server/actions/workflows/ci.yml/badge.svg)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=mikedfunk_habitica-mcp-server&metric=coverage)](https://sonarcloud.io/dashboard?id=mikedfunk_habitica-mcp-server)

*英文版本请阅读 **[README.md](README.md)**。*

这是一个 Model Context Protocol (MCP) 服务器，让 AI 助手能够与 Habitica API 交互——创建任务、追踪习惯、养成宠物，享受游戏化的生产力提升。

## 快速开始

### 前置要求

- [Bun](https://bun.sh) 1.0+
- 有效的 Habitica 账户

### MCP 客户端配置

最简单的使用方式是通过 `bunx` —— 无需安装。

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "habitica": {
      "command": "bunx",
      "args": ["github:mikedfunk/habitica-mcp-server#v0.2.4"],
      "env": {
        "HABITICA_USER_ID": "your-user-id",
        "HABITICA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

**Claude Code** (`.claude/settings.json` 或全局 `~/.claude/settings.json`):
```json
{
  "mcpServers": {
    "habitica": {
      "command": "bunx",
      "args": ["github:mikedfunk/habitica-mcp-server#v0.2.4"],
      "env": {
        "HABITICA_USER_ID": "your-user-id",
        "HABITICA_API_TOKEN": "your-api-token"
      }
    }
  }
}
```

如需中文回复，请设置 `MCP_LANG=zh-CN`。

### 获取 Habitica API 凭据

1. 登录 [Habitica](https://habitica.com)
2. 点击头像 → **设置** → **API**
3. 复制 **User ID** 和 **API Token**

## 可用工具

### 用户
| 工具 | 描述 |
|------|-------------|
| `get_user_profile` | 获取完整用户档案 |
| `get_stats` | 获取用户属性 (HP, MP, XP, 金币, 等级) |
| `get_inventory` | 获取所有拥有的物品 |
| `toggle_sleep` | 在客栈休息 (暂停每日任务) |
| `revive` | 死亡后复活 |
| `allocate_stat` | 分配属性点 (力量/智力/体质/感知) |

### 任务
| 工具 | 描述 |
|------|-------------|
| `get_tasks` | 列出任务 (可选按类型筛选) |
| `create_task` | 创建习惯、每日任务、待办事项或奖励 |
| `update_task` | 更新任务文本、备注或完成状态 |
| `delete_task` | 删除任务 |
| `score_task` | 完成任务或记录习惯 |
| `reorder_task` | 将任务移动到指定位置 |
| `clear_completed_todos` | 清除所有已完成的待办事项 |

### 清单
| 工具 | 描述 |
|------|-------------|
| `get_task_checklist` | 列出任务的清单项目 |
| `add_checklist_item` | 向任务添加清单项目 |
| `update_checklist_item` | 更新清单项目文本或完成状态 |
| `delete_checklist_item` | 删除清单项目 |
| `score_checklist_item` | 切换清单项目完成/未完成 |

### 标签
| 工具 | 描述 |
|------|-------------|
| `get_tags` | 列出所有标签 |
| `create_tag` | 创建新标签 |
| `update_tag` | 重命名标签 |
| `delete_tag` | 删除标签 |

### 宠物和坐骑
| 工具 | 描述 |
|------|-------------|
| `get_pets` | 列出拥有的宠物 |
| `feed_pet` | 喂养宠物 |
| `hatch_pet` | 用孵化药水孵化宠物 |
| `get_mounts` | 列出拥有的坐骑 |
| `equip_item` | 装备宠物、坐骑或装备 |

### 商店和奖励
| 工具 | 描述 |
|------|-------------|
| `get_shop` | 浏览商店 (市场、任务商店等) |
| `buy_item` | 购买商店物品 |
| `buy_reward` | 购买自定义奖励 |

### 技能
| 工具 | 描述 |
|------|-------------|
| `cast_spell` | 施放职业技能 |

### 通知
| 工具 | 描述 |
|------|-------------|
| `get_notifications` | 列出通知 |
| `read_notification` | 将通知标记为已读 |

### 社交
| 工具 | 描述 |
|------|-------------|
| `get_groups` | 列出群组 (队伍、公会) |
| `get_party` | 获取当前队伍信息 |
| `send_private_message` | 向成员发送私信 |
| `get_inbox` | 获取收件箱消息 |

## 任务类型

| 值 | 描述 |
|-------|-------------|
| `habit` | 可重复的习惯 (正向或负向记录) |
| `daily` | 每日重置的日常任务 |
| `todo` | 一次性待办事项 |
| `reward` | 可用金币购买的奖励 |

## 难度 / 优先级

| 值 | 标签 |
|-------|-------|
| `0.1` | 简单 / 低 |
| `1` | 中等 |
| `1.5` | 困难 / 高 |
| `2` | 非常困难 / 紧急 |

## 开发

```bash
git clone https://github.com/mikedfunk/habitica-mcp-server.git
cd habitica-mcp-server
bun install

# 运行
bun src/index.ts

# 类型检查
bun run typecheck

# 测试
bun test
```

## 故障排除

**服务器无法启动** — 请检查 `HABITICA_USER_ID` 和 `HABITICA_API_TOKEN` 是否已正确设置。

**API 错误** — 在 Habitica → 设置 → API 中验证您的凭据。检查是否已达到速率限制。

**找不到任务或宠物** — 确认 ID 正确。ID 是可在 `get_tasks` / `get_pets` 输出中查看的 UUID。

## 许可证

MIT — 查看 [LICENSE](LICENSE)。

---

<div align="center">
  <b>让 AI 成为您的 Habitica 助手。</b>
</div>
