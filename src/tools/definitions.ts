import { t } from '../i18n.js';

export const tools = [
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
            '难度 (0.1=简单, 1=中等, 1.5=困难, 2=极难)',
          ),
        },
        priority: {
          type: 'number',
          enum: [0.1, 1, 1.5, 2],
          description: t(
            'Priority (0.1=low, 1=med, 1.5=high, 2=urgent)',
            '优先级 (0.1=低, 1=中, 1.5=高, 2=极高)',
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
            '方向 (up=正向, down=负向，仅适用于习惯)',
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
    description: t(
      'Cast a class spell. Valid spells: defensiveStance, valorousPresence, intimidate (Warrior); fireball, etherealSurge, earthquake (Mage); pickPocket, backStab, toolsOfTrade (Rogue); heal, protectiveAura, brightness (Healer)',
      '施放职业技能。有效技能：defensiveStance, valorousPresence, intimidate (战士); fireball, etherealSurge, earthquake (法师); pickPocket, backStab, toolsOfTrade (盗贼); heal, protectiveAura, brightness (治疗师)',
    ),
    inputSchema: {
      type: 'object',
      properties: {
        spellId: {
          type: 'string',
          description: t(
            'Spell ID. Warrior: defensiveStance (buff CON), valorousPresence (buff party STR), intimidate (buff party CON). Mage: fireball (damage + XP), etherealSurge (restore party MP), earthquake (damage + buff INT). Rogue: pickPocket (gold from task), backStab (high damage), toolsOfTrade (buff party PER). Healer: heal (restore HP), protectiveAura (buff party CON), brightness (damage + reduce redness)',
            '技能ID。战士: defensiveStance (增加体质), valorousPresence (增加队伍力量), intimidate (增加队伍体质). 法师: fireball (伤害+经验), etherealSurge (恢复队伍魔法), earthquake (伤害+增加智力). 盗贼: pickPocket (任务金币), backStab (高伤害), toolsOfTrade (增加队伍感知). 治疗师: heal (恢复生命), protectiveAura (增加队伍体质), brightness (伤害+减少任务红度)',
          ),
        },
        targetId: {
          type: 'string',
          description: t(
            'Target ID for spells that need a target (task for fireball/pickPocket/backStab, user for heal)',
            '需要目标的技能的目标ID (fireball/pickPocket/backStab用任务ID, heal用用户ID)',
          ),
        },
      },
      required: ['spellId'],
    },
  },
  {
    name: 'get_available_spells',
    description: t(
      'Get list of spells available to the current user based on their class and level. Shows spell names, IDs, mana costs, and descriptions.',
      '根据当前用户的职业和等级获取可用技能列表。显示技能名称、ID、魔法值消耗和描述。',
    ),
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'buy_gems',
    description: t(
      'Buy gems with gold. Each gem costs 20 gold. Maximum 24 gems per purchase.',
      '用金币购买宝石。每颗宝石20金币。每次最多购买24颗。',
    ),
    inputSchema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: t('Number of gems to buy (1-24, default 1)', '购买宝石数量 (1-24, 默认1)'),
        },
      },
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
      '为清单项目评分（标记完成/未完成）',
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
    name: 'add_tag_to_task',
    description: t('Add a tag to a task', '向任务添加标签'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
        tagId: {
          type: 'string',
          description: t('Tag ID', '标签ID'),
        },
      },
      required: ['taskId', 'tagId'],
    },
  },
  {
    name: 'remove_tag_from_task',
    description: t('Remove a tag from a task', '从任务移除标签'),
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: t('Task ID', '任务ID'),
        },
        tagId: {
          type: 'string',
          description: t('Tag ID', '标签ID'),
        },
      },
      required: ['taskId', 'tagId'],
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
