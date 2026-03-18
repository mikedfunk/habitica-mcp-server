#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import { setLanguage, t } from './i18n.js';
import type {
  HabiticaTask,
  HabiticaUser,
  UserStats,
  ChecklistItem,
  ScoreTaskResult,
  Tag,
  CreateTaskInput,
  UpdateTaskInput,
  UpdateChecklistItemInput,
  TaskListType,
  EquipType,
  ShopType,
  HabiticaApiResponse,
} from './types.js';

const HABITICA_API_BASE = 'https://habitica.com/api/v3';

const HABITICA_USER_ID = process.env['HABITICA_USER_ID'];
const HABITICA_API_TOKEN = process.env['HABITICA_API_TOKEN'];

setLanguage(process.env['MCP_LANG'] ?? process.env['LANG'] ?? 'en');

if (!HABITICA_USER_ID || !HABITICA_API_TOKEN) {
  console.error(
    t(
      'Error: Please set HABITICA_USER_ID and HABITICA_API_TOKEN environment variables',
      '错误: 请设置 HABITICA_USER_ID 和 HABITICA_API_TOKEN 环境变量'
    )
  );
  process.exit(1);
}

const habiticaClient: AxiosInstance = axios.create({
  baseURL: HABITICA_API_BASE,
  headers: {
    'x-api-user': HABITICA_USER_ID,
    'x-api-key': HABITICA_API_TOKEN,
    'x-client': `${HABITICA_USER_ID}-habitica-mcp-server`,
    'Content-Type': 'application/json',
  },
});

const server = new Server(
  {
    name: 'habitica-mcp-server',
    version: '0.0.5',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools = [
  {
    name: 'get_user_profile',
    description: t('Get user profile', '获取用户档案信息'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_tasks',
    description: t('Get tasks list', '获取任务列表'),
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['habits', 'dailys', 'todos', 'rewards'],
          description: t('Task type', '任务类型'),
        },
      },
    },
  },
  {
    name: 'create_task',
    description: t('Create new task', '创建新任务'),
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['habit', 'daily', 'todo', 'reward'],
          description: t('Task type', '任务类型'),
        },
        text: {
          type: 'string',
          description: t('Task title', '任务标题'),
        },
        notes: {
          type: 'string',
          description: t('Task notes', '任务备注'),
        },
        difficulty: {
          type: 'number',
          enum: [0.1, 1, 1.5, 2],
          description: t(
            'Difficulty (0.1=easy, 1=medium, 1.5=hard, 2=very hard)',
            '难度 (0.1=简单, 1=中等, 1.5=困难, 2=极难)'
          ),
        },
        priority: {
          type: 'number',
          enum: [0.1, 1, 1.5, 2],
          description: t(
            'Priority (0.1=low, 1=med, 1.5=high, 2=urgent)',
            '优先级 (0.1=低, 1=中, 1.5=高, 2=极高)'
          ),
        },
        checklist: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: t('Checklist item text', '清单项目文本'),
              },
              completed: {
                type: 'boolean',
                description: t('Completed status', '完成状态'),
                default: false,
              },
            },
            required: ['text'],
          },
          description: t('Checklist items', '清单项目'),
        },
      },
      required: ['type', 'text'],
    },
  },
  {
    name: 'score_task',
    description: t('Score task / habit', '完成任务或记录习惯'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
        direction: {
          type: 'string',
          enum: ['up', 'down'],
          description: t(
            'Direction (up=positive, down=negative, habits only)',
            '方向 (up=正向, down=负向，仅适用于习惯)'
          ),
        },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'update_task',
    description: t('Update task', '更新任务'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
        text: {
          type: 'string',
          description: t('Task title', '任务标题'),
        },
        notes: {
          type: 'string',
          description: t('Task notes', '任务备注'),
        },
        completed: {
          type: 'boolean',
          description: t('Completed flag', '是否完成'),
        },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'delete_task',
    description: t('Delete task', '删除任务'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'get_stats',
    description: t('Get user stats', '获取用户统计信息'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'buy_reward',
    description: t('Buy reward', '购买奖励'),
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: t('Reward key or ID', '奖励的key或ID'),
        },
      },
      required: ['key'],
    },
  },
  {
    name: 'get_inventory',
    description: t('Get inventory', '获取物品清单'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'cast_spell',
    description: t('Cast spell', '施放技能'),
    inputSchema: {
      type: 'object',
      properties: {
        spellId: {
          type: 'string',
          description: t('Spell ID', '技能ID'),
        },
        targetId: {
          type: 'string',
          description: t('Target ID (optional)', '目标ID (可选)'),
        },
      },
      required: ['spellId'],
    },
  },
  {
    name: 'get_tags',
    description: t('Get tags list', '获取标签列表'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'create_tag',
    description: t('Create tag', '创建新标签'),
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: t('Tag name', '标签名称'),
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_pets',
    description: t('Get pets list', '获取宠物列表'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'feed_pet',
    description: t('Feed a pet', '喂养宠物'),
    inputSchema: {
      type: 'object',
      properties: {
        pet: {
          type: 'string',
          description: t('Pet key', '宠物key'),
        },
        food: {
          type: 'string',
          description: t('Food key', '食物key'),
        },
      },
      required: ['pet', 'food'],
    },
  },
  {
    name: 'hatch_pet',
    description: t('Hatch a pet from egg', '孵化宠物'),
    inputSchema: {
      type: 'object',
      properties: {
        egg: {
          type: 'string',
          description: t('Egg key', '蛋的key'),
        },
        hatchingPotion: {
          type: 'string',
          description: t('Hatching potion key', '孵化药水的key'),
        },
      },
      required: ['egg', 'hatchingPotion'],
    },
  },
  {
    name: 'get_mounts',
    description: t('Get mounts list', '获取坐骑列表'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'equip_item',
    description: t('Equip an item', '装备物品'),
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['mount', 'pet', 'costume', 'equipped'],
          description: t('Equipment type', '装备类型'),
        },
        key: {
          type: 'string',
          description: t('Item key', '物品key'),
        },
      },
      required: ['type', 'key'],
    },
  },
  {
    name: 'get_notifications',
    description: t('Get notifications list', '获取通知列表'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'read_notification',
    description: t('Mark notification as read', '标记通知为已读'),
    inputSchema: {
      type: 'object',
      properties: {
        notificationId: {
          type: 'string',
          description: t('Notification ID', '通知ID'),
        },
      },
      required: ['notificationId'],
    },
  },
  {
    name: 'get_shop',
    description: t('Get shop items', '获取商店物品'),
    inputSchema: {
      type: 'object',
      properties: {
        shopType: {
          type: 'string',
          enum: ['market', 'questShop', 'timeTravelersShop', 'seasonalShop'],
          description: t('Shop type', '商店类型'),
        },
      },
    },
  },
  {
    name: 'buy_item',
    description: t('Buy item from shop', '购买商店物品'),
    inputSchema: {
      type: 'object',
      properties: {
        itemKey: {
          type: 'string',
          description: t('Item key', '物品key'),
        },
        quantity: {
          type: 'number',
          description: t('Purchase quantity', '购买数量'),
          default: 1,
        },
      },
      required: ['itemKey'],
    },
  },
  {
    name: 'add_checklist_item',
    description: t('Add checklist item to task', '向任务添加清单项目'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
        text: {
          type: 'string',
          description: t('Checklist item text', '清单项目文本'),
        },
      },
      required: ['taskId', 'text'],
    },
  },
  {
    name: 'update_checklist_item',
    description: t('Update checklist item', '更新清单项目'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
        itemId: {
          type: 'string',
          description: t('Checklist item ID', '清单项目ID'),
        },
        text: {
          type: 'string',
          description: t('Checklist item text', '清单项目文本'),
        },
        completed: {
          type: 'boolean',
          description: t('Completed status', '完成状态'),
        },
      },
      required: ['taskId', 'itemId'],
    },
  },
  {
    name: 'delete_checklist_item',
    description: t('Delete checklist item', '删除清单项目'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
        itemId: {
          type: 'string',
          description: t('Checklist item ID', '清单项目ID'),
        },
      },
      required: ['taskId', 'itemId'],
    },
  },
  {
    name: 'get_task_checklist',
    description: t('Get task checklist items', '获取任务清单项目'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'score_checklist_item',
    description: t(
      'Score checklist item (mark complete/incomplete)',
      '为清单项目评分（标记完成/未完成）'
    ),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
        itemId: {
          type: 'string',
          description: t('Checklist item ID', '清单项目ID'),
        },
      },
      required: ['taskId', 'itemId'],
    },
  },
  {
    name: 'reorder_task',
    description: t('Move task to a specific position', '将任务移动到指定位置'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
        position: {
          type: 'number',
          description: t('Target position (0-based index)', '目标位置（从0开始的索引）'),
        },
      },
      required: ['taskId', 'position'],
    },
  },
  {
    name: 'clear_completed_todos',
    description: t('Clear all completed todos', '清除所有已完成的待办事项'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'update_tag',
    description: t('Update tag name', '更新标签名称'),
    inputSchema: {
      type: 'object',
      properties: {
        tagId: {
          type: 'string',
          description: t('Tag ID', '标签ID'),
        },
        name: {
          type: 'string',
          description: t('New tag name', '新标签名称'),
        },
      },
      required: ['tagId', 'name'],
    },
  },
  {
    name: 'delete_tag',
    description: t('Delete a tag', '删除标签'),
    inputSchema: {
      type: 'object',
      properties: {
        tagId: {
          type: 'string',
          description: t('Tag ID', '标签ID'),
        },
      },
      required: ['tagId'],
    },
  },
  {
    name: 'toggle_sleep',
    description: t('Toggle user sleep status (rest in inn)', '切换用户睡眠状态（在旅馆休息）'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'revive',
    description: t('Revive user after death', '用户死亡后复活'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'allocate_stat',
    description: t('Allocate a stat point', '分配属性点'),
    inputSchema: {
      type: 'object',
      properties: {
        stat: {
          type: 'string',
          enum: ['str', 'int', 'con', 'per'],
          description: t('Stat to allocate (str/int/con/per)', '要分配的属性 (str/int/con/per)'),
        },
      },
      required: ['stat'],
    },
  },
  {
    name: 'get_groups',
    description: t('Get groups list', '获取团队列表'),
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          description: t('Group type filter (e.g. party, guilds)', '团队类型过滤器'),
        },
      },
    },
  },
  {
    name: 'get_party',
    description: t('Get current party info', '获取当前队伍信息'),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'send_private_message',
    description: t('Send a private message to a member', '向成员发送私信'),
    inputSchema: {
      type: 'object',
      properties: {
        toUserId: {
          type: 'string',
          description: t('Recipient user ID', '接收者用户ID'),
        },
        message: {
          type: 'string',
          description: t('Message text', '消息内容'),
        },
      },
      required: ['toUserId', 'message'],
    },
  },
  {
    name: 'get_inbox',
    description: t('Get inbox messages', '获取收件箱消息'),
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: t('Page number (0-based)', '页码（从0开始）'),
        },
      },
    },
  },
];

interface ToolContent {
  type: 'text';
  text: string;
}

interface ToolResult {
  content: ToolContent[];
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = (args ?? {}) as Record<string, unknown>;

  try {
    switch (name) {
      case 'get_user_profile':
        return await getUserProfile();

      case 'get_tasks':
        return await getTasks(toolArgs['type'] as TaskListType | undefined);

      case 'create_task':
        return await createTask(toolArgs as unknown as CreateTaskInput);

      case 'score_task':
        return await scoreTask(
          toolArgs['taskId'] as string,
          toolArgs['direction'] as 'up' | 'down' | undefined
        );

      case 'update_task':
        return await updateTask(
          toolArgs['taskId'] as string,
          toolArgs as unknown as UpdateTaskInput
        );

      case 'delete_task':
        return await deleteTask(toolArgs['taskId'] as string);

      case 'get_stats':
        return await getStats();

      case 'buy_reward':
        return await buyReward(toolArgs['key'] as string);

      case 'get_inventory':
        return await getInventory();

      case 'cast_spell':
        return await castSpell(
          toolArgs['spellId'] as string,
          toolArgs['targetId'] as string | undefined
        );

      case 'get_tags':
        return await getTags();

      case 'create_tag':
        return await createTag(toolArgs['name'] as string);

      case 'update_tag':
        return await updateTag(toolArgs['tagId'] as string, toolArgs['name'] as string);

      case 'delete_tag':
        return await deleteTag(toolArgs['tagId'] as string);

      case 'get_pets':
        return await getPets();

      case 'feed_pet':
        return await feedPet(toolArgs['pet'] as string, toolArgs['food'] as string);

      case 'hatch_pet':
        return await hatchPet(toolArgs['egg'] as string, toolArgs['hatchingPotion'] as string);

      case 'get_mounts':
        return await getMounts();

      case 'equip_item':
        return await equipItem(toolArgs['type'] as EquipType, toolArgs['key'] as string);

      case 'get_notifications':
        return await getNotifications();

      case 'read_notification':
        return await readNotification(toolArgs['notificationId'] as string);

      case 'get_shop':
        return await getShop(toolArgs['shopType'] as ShopType | undefined);

      case 'buy_item':
        return await buyItem(toolArgs['itemKey'] as string, toolArgs['quantity'] as number | undefined);

      case 'get_task_checklist':
        return await getTaskChecklist(toolArgs['taskId'] as string);

      case 'add_checklist_item':
        return await addChecklistItem(toolArgs['taskId'] as string, toolArgs['text'] as string);

      case 'update_checklist_item':
        return await updateChecklistItem(
          toolArgs['taskId'] as string,
          toolArgs['itemId'] as string,
          toolArgs as unknown as UpdateChecklistItemInput
        );

      case 'delete_checklist_item':
        return await deleteChecklistItem(
          toolArgs['taskId'] as string,
          toolArgs['itemId'] as string
        );

      case 'score_checklist_item':
        return await scoreChecklistItem(toolArgs['taskId'] as string, toolArgs['itemId'] as string);

      case 'reorder_task':
        return await reorderTask(toolArgs['taskId'] as string, toolArgs['position'] as number);

      case 'clear_completed_todos':
        return await clearCompletedTodos();

      case 'toggle_sleep':
        return await toggleSleep();

      case 'revive':
        return await revive();

      case 'allocate_stat':
        return await allocateStat(toolArgs['stat'] as string);

      case 'get_groups':
        return await getGroups(toolArgs['type'] as string | undefined);

      case 'get_party':
        return await getParty();

      case 'send_private_message':
        return await sendPrivateMessage(
          toolArgs['toUserId'] as string,
          toolArgs['message'] as string
        );

      case 'get_inbox':
        return await getInbox(toolArgs['page'] as number | undefined);

      default:
        throw new McpError(ErrorCode.MethodNotFound, t(`Unknown tool: ${name}`, `未知工具: ${name}`));
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }

    const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
    const errorMessage =
      axiosError.response?.data?.message ?? axiosError.message ?? t('Unknown error', '未知错误');
    throw new McpError(
      ErrorCode.InternalError,
      t(`Habitica API error: ${errorMessage}`, `Habitica API 错误: ${errorMessage}`)
    );
  }
});

async function getUserProfile(): Promise<ToolResult> {
  const response = await habiticaClient.get<HabiticaApiResponse<HabiticaUser>>('/user');
  const user = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(user, null, 2),
      },
    ],
  };
}

async function getTasks(type?: TaskListType): Promise<ToolResult> {
  const endpoint = type ? `/tasks/user?type=${type}` : '/tasks/user';
  const response = await habiticaClient.get<HabiticaApiResponse<HabiticaTask[]>>(endpoint);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function createTask(taskData: CreateTaskInput): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<HabiticaTask>>(
    '/tasks/user',
    taskData
  );
  const task = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully created task: ${task.text} (ID: ${task.id})`,
          `成功创建任务: ${task.text} (ID: ${task.id})`
        ),
      },
    ],
  };
}

async function scoreTask(taskId: string, direction: 'up' | 'down' = 'up'): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<ScoreTaskResult>>(
    `/tasks/${taskId}/score/${direction}`
  );
  const result = response.data.data;

  let message = t('Task scored! ', '任务完成! ');
  if (result.exp) message += t(`Gained ${result.exp} XP `, `获得 ${result.exp} 经验值 `);
  if (result.gp) message += t(`Gained ${result.gp} gold `, `获得 ${result.gp} 金币 `);
  if (result.lvl) message += t(`Level up to ${result.lvl}! `, `升级到 ${result.lvl} 级! `);

  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
  };
}

async function updateTask(taskId: string, updates: UpdateTaskInput): Promise<ToolResult> {
  const response = await habiticaClient.put<HabiticaApiResponse<HabiticaTask>>(
    `/tasks/${taskId}`,
    updates
  );
  const task = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: t(`Successfully updated task: ${task.text}`, `成功更新任务: ${task.text}`),
      },
    ],
  };
}

async function deleteTask(taskId: string): Promise<ToolResult> {
  await habiticaClient.delete(`/tasks/${taskId}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully deleted task (ID: ${taskId})`,
          `成功删除任务 (ID: ${taskId})`
        ),
      },
    ],
  };
}

async function getStats(): Promise<ToolResult> {
  const response = await habiticaClient.get<HabiticaApiResponse<HabiticaUser>>('/user');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data.data.stats, null, 2),
      },
    ],
  };
}

async function buyReward(key: string): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<{ gp: number }>>(
    `/user/buy/${key}`
  );
  const result = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully bought reward! Remaining gold: ${result.gp}`,
          `成功购买奖励! 剩余金币: ${result.gp}`
        ),
      },
    ],
  };
}

async function getInventory(): Promise<ToolResult> {
  const response = await habiticaClient.get<HabiticaApiResponse<HabiticaUser>>('/user');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data.data.items, null, 2),
      },
    ],
  };
}

async function castSpell(spellId: string, targetId?: string): Promise<ToolResult> {
  const endpoint = targetId
    ? `/user/class/cast/${spellId}?targetId=${targetId}`
    : `/user/class/cast/${spellId}`;
  await habiticaClient.post(endpoint);

  return {
    content: [
      {
        type: 'text',
        text: t(`Successfully cast spell: ${spellId}`, `成功施放技能: ${spellId}`),
      },
    ],
  };
}

async function getTags(): Promise<ToolResult> {
  const response = await habiticaClient.get<HabiticaApiResponse<Tag[]>>('/tags');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function createTag(name: string): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<Tag>>('/tags', { name });
  const tag = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully created tag: ${tag.name} (ID: ${tag.id})`,
          `成功创建标签: ${tag.name} (ID: ${tag.id})`
        ),
      },
    ],
  };
}

async function updateTag(tagId: string, name: string): Promise<ToolResult> {
  const response = await habiticaClient.put<HabiticaApiResponse<Tag>>(`/tags/${tagId}`, { name });
  const tag = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully updated tag: ${tag.name} (ID: ${tag.id})`,
          `成功更新标签: ${tag.name} (ID: ${tag.id})`
        ),
      },
    ],
  };
}

async function deleteTag(tagId: string): Promise<ToolResult> {
  await habiticaClient.delete(`/tags/${tagId}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully deleted tag (ID: ${tagId})`,
          `成功删除标签 (ID: ${tagId})`
        ),
      },
    ],
  };
}

async function getPets(): Promise<ToolResult> {
  const response = await habiticaClient.get<HabiticaApiResponse<HabiticaUser>>('/user');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data.data.items.pets, null, 2),
      },
    ],
  };
}

async function feedPet(pet: string, food: string): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<{ message?: string }>>(
    `/user/feed/${pet}/${food}`
  );
  const result = response.data.data;

  let message = t(`Successfully fed pet ${pet}! `, `成功喂养宠物 ${pet}! `);
  if (result.message) {
    message += result.message;
  }

  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
  };
}

async function hatchPet(egg: string, hatchingPotion: string): Promise<ToolResult> {
  await habiticaClient.post(`/user/hatch/${egg}/${hatchingPotion}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully hatched pet! Got ${egg}-${hatchingPotion}`,
          `成功孵化宠物! 获得了 ${egg}-${hatchingPotion}`
        ),
      },
    ],
  };
}

async function getMounts(): Promise<ToolResult> {
  const response = await habiticaClient.get<HabiticaApiResponse<HabiticaUser>>('/user');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data.data.items.mounts, null, 2),
      },
    ],
  };
}

async function equipItem(type: EquipType, key: string): Promise<ToolResult> {
  await habiticaClient.post(`/user/equip/${type}/${key}`);

  return {
    content: [
      {
        type: 'text',
        text: t(`Successfully equipped ${type}: ${key}`, `成功装备 ${type}: ${key}`),
      },
    ],
  };
}

async function getNotifications(): Promise<ToolResult> {
  const response = await habiticaClient.get('/notifications');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function readNotification(notificationId: string): Promise<ToolResult> {
  await habiticaClient.post(`/notifications/${notificationId}/read`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully marked notification as read (ID: ${notificationId})`,
          `成功标记通知为已读 (ID: ${notificationId})`
        ),
      },
    ],
  };
}

async function getShop(shopType: ShopType = 'market'): Promise<ToolResult> {
  const response = await habiticaClient.get(`/shops/${shopType}`);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function buyItem(itemKey: string, quantity = 1): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<{ gp: number }>>(
    `/user/buy/${itemKey}`,
    { quantity }
  );
  const result = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully bought ${itemKey} x${quantity}! Remaining gold: ${result.gp}`,
          `成功购买 ${itemKey} x${quantity}! 剩余金币: ${result.gp}`
        ),
      },
    ],
  };
}

async function getTaskChecklist(taskId: string): Promise<ToolResult> {
  const response = await habiticaClient.get<HabiticaApiResponse<HabiticaTask>>(
    `/tasks/${taskId}`
  );
  const task = response.data.data;
  const checklist: ChecklistItem[] = task.checklist ?? [];

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Task: ${task.text}\nChecklist items (${checklist.length}):`,
          `任务: ${task.text}\n清单项目 (${checklist.length}):`
        ),
      },
      {
        type: 'text',
        text:
          checklist.length > 0
            ? checklist
                .map((item) => `${item.completed ? '✓' : '○'} ${item.text} (ID: ${item.id})`)
                .join('\n')
            : t('No checklist items found', '未找到清单项目'),
      },
    ],
  };
}

async function addChecklistItem(taskId: string, text: string): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<HabiticaTask>>(
    `/tasks/${taskId}/checklist`,
    { text }
  );
  const task = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully added checklist item: ${text} to task: ${task.text}`,
          `成功添加清单项目: ${text} 到任务: ${task.text}`
        ),
      },
    ],
  };
}

async function updateChecklistItem(
  taskId: string,
  itemId: string,
  updates: UpdateChecklistItemInput
): Promise<ToolResult> {
  const response = await habiticaClient.put<HabiticaApiResponse<HabiticaTask>>(
    `/tasks/${taskId}/checklist/${itemId}`,
    updates
  );
  const task = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully updated checklist item in task: ${task.text}`,
          `成功更新清单项目: ${task.text}`
        ),
      },
    ],
  };
}

async function deleteChecklistItem(taskId: string, itemId: string): Promise<ToolResult> {
  await habiticaClient.delete(`/tasks/${taskId}/checklist/${itemId}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully deleted checklist item (ID: ${itemId})`,
          `成功删除清单项目 (ID: ${itemId})`
        ),
      },
    ],
  };
}

async function scoreChecklistItem(taskId: string, itemId: string): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<HabiticaTask>>(
    `/tasks/${taskId}/checklist/${itemId}/score`
  );
  const task = response.data.data;
  const item = task.checklist?.find((checklistItem) => checklistItem.id === itemId);

  return {
    content: [
      {
        type: 'text',
        text: item
          ? t(
              `Successfully scored checklist item: ${item.text} (completed: ${item.completed})`,
              `成功评分清单项目: ${item.text} (完成状态: ${item.completed})`
            )
          : t('Successfully scored checklist item', '成功评分清单项目'),
      },
    ],
  };
}

async function reorderTask(taskId: string, position: number): Promise<ToolResult> {
  await habiticaClient.post(`/tasks/${taskId}/move/to/${position}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully moved task (ID: ${taskId}) to position ${position}`,
          `成功将任务 (ID: ${taskId}) 移动到位置 ${position}`
        ),
      },
    ],
  };
}

async function clearCompletedTodos(): Promise<ToolResult> {
  await habiticaClient.post('/tasks/clearCompletedTodos');

  return {
    content: [
      {
        type: 'text',
        text: t('Successfully cleared all completed todos', '成功清除所有已完成的待办事项'),
      },
    ],
  };
}

async function toggleSleep(): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<boolean>>('/user/sleep');
  const isSleeping = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: isSleeping
          ? t('User is now resting in the inn', '用户现在正在旅馆休息')
          : t('User has woken up from the inn', '用户已从旅馆醒来'),
      },
    ],
  };
}

async function revive(): Promise<ToolResult> {
  await habiticaClient.post('/user/revive');

  return {
    content: [
      {
        type: 'text',
        text: t('Successfully revived! Lost some stats but back alive.', '成功复活！失去了一些属性但已恢复生命。'),
      },
    ],
  };
}

async function allocateStat(stat: string): Promise<ToolResult> {
  const response = await habiticaClient.post<HabiticaApiResponse<UserStats>>(
    `/user/allocate?stat=${stat}`
  );
  const stats = response.data.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully allocated point to ${stat}. New stats:\n${JSON.stringify(stats, null, 2)}`,
          `成功将属性点分配给 ${stat}。新属性:\n${JSON.stringify(stats, null, 2)}`
        ),
      },
    ],
  };
}

async function getGroups(type?: string): Promise<ToolResult> {
  const endpoint = type ? `/groups?type=${type}` : '/groups?type=party,guilds';
  const response = await habiticaClient.get(endpoint);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function getParty(): Promise<ToolResult> {
  const response = await habiticaClient.get('/groups/party');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function sendPrivateMessage(toUserId: string, message: string): Promise<ToolResult> {
  await habiticaClient.post('/members/send-private-message', {
    message,
    toUserId,
  });

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully sent private message to user ${toUserId}`,
          `成功向用户 ${toUserId} 发送私信`
        ),
      },
    ],
  };
}

async function getInbox(page = 0): Promise<ToolResult> {
  const response = await habiticaClient.get(`/inbox/messages?page=${page}`);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response.data, null, 2),
      },
    ],
  };
}

async function runServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(t('Habitica MCP Server started', 'Habitica MCP 服务器已启动'));
}

runServer().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(t(`Server startup failed: ${errorMessage}`, `服务器启动失败: ${errorMessage}`));
  process.exit(1);
});
