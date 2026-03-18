import { ValidationError } from '../errors.js';
import { logger } from '../logger.js';
import { type SpellId, ToolArgsSchemas } from '../schemas.js';
import {
  addChecklistItem,
  deleteChecklistItem,
  getTaskChecklist,
  scoreChecklistItem,
  updateChecklistItem,
} from './handlers/checklist.js';
import { getNotifications, readNotification } from './handlers/notifications.js';
import { equipItem, feedPet, getMounts, getPets, hatchPet } from './handlers/pets.js';
import { buyItem, buyReward, getShop } from './handlers/shop.js';
import { getGroups, getInbox, getParty, sendPrivateMessage } from './handlers/social.js';
import {
  addTagToTask,
  createTag,
  deleteTag,
  getTags,
  removeTagFromTask,
  updateTag,
} from './handlers/tags.js';
import {
  clearCompletedTodos,
  createTask,
  deleteTask,
  getTasks,
  reorderTask,
  scoreTask,
  updateTask,
} from './handlers/tasks.js';
import {
  allocateStat,
  buyGems,
  castSpell,
  getAvailableSpells,
  getInventory,
  getStats,
  getUserProfile,
  revive,
  toggleSleep,
} from './handlers/user.js';
import type { ToolResult } from './types.js';

export type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

/**
 * @throws {ValidationError} When arguments fail validation
 */
function validateArgs<T>(toolName: string, args: Record<string, unknown>): T {
  const schema = ToolArgsSchemas[toolName as keyof typeof ToolArgsSchemas];
  if (!schema) {
    return args as T;
  }

  const result = schema.safeParse(args);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    logger.warn(`Validation failed for ${toolName}: ${issues}`);
    throw new ValidationError(`Invalid arguments: ${issues}`);
  }

  return result.data as T;
}

export const toolRegistry: Record<string, ToolHandler> = {
  get_user_profile: async () => getUserProfile(),

  get_tasks: async (args) => {
    const validated = validateArgs<{ type?: 'habits' | 'dailys' | 'todos' | 'rewards' }>(
      'get_tasks',
      args,
    );
    return getTasks(validated.type);
  },

  create_task: async (args) => {
    const validated = validateArgs<{
      type: 'habit' | 'daily' | 'todo' | 'reward';
      text: string;
      notes?: string;
      priority?: number;
      checklist?: Array<{ text: string; completed?: boolean }>;
      tags?: string[];
    }>('create_task', args);
    return createTask(validated);
  },

  score_task: async (args) => {
    const validated = validateArgs<{ taskId: string; direction?: 'up' | 'down' }>(
      'score_task',
      args,
    );
    return scoreTask(validated.taskId, validated.direction);
  },

  update_task: async (args) => {
    const validated = validateArgs<{
      taskId: string;
      text?: string;
      notes?: string;
      completed?: boolean;
      priority?: number;
      tags?: string[];
    }>('update_task', args);
    const { taskId, ...updates } = validated;
    return updateTask(taskId, updates);
  },

  delete_task: async (args) => {
    const validated = validateArgs<{ taskId: string }>('delete_task', args);
    return deleteTask(validated.taskId);
  },

  get_stats: async () => getStats(),

  buy_reward: async (args) => {
    const validated = validateArgs<{ key: string }>('buy_reward', args);
    return buyReward(validated.key);
  },

  get_inventory: async () => getInventory(),

  cast_spell: async (args) => {
    const validated = validateArgs<{ spellId: SpellId; targetId?: string }>('cast_spell', args);
    return castSpell(validated.spellId, validated.targetId);
  },

  get_available_spells: async () => getAvailableSpells(),

  buy_gems: async (args) => {
    const validated = validateArgs<{ quantity?: number }>('buy_gems', args);
    return buyGems(validated.quantity);
  },

  get_tags: async () => getTags(),

  create_tag: async (args) => {
    const validated = validateArgs<{ name: string }>('create_tag', args);
    return createTag(validated.name);
  },

  add_tag_to_task: async (args) => {
    const validated = validateArgs<{ taskId: string; tagId: string }>('add_tag_to_task', args);
    return addTagToTask(validated.taskId, validated.tagId);
  },

  remove_tag_from_task: async (args) => {
    const validated = validateArgs<{ taskId: string; tagId: string }>('remove_tag_from_task', args);
    return removeTagFromTask(validated.taskId, validated.tagId);
  },

  update_tag: async (args) => {
    const validated = validateArgs<{ tagId: string; name: string }>('update_tag', args);
    return updateTag(validated.tagId, validated.name);
  },

  delete_tag: async (args) => {
    const validated = validateArgs<{ tagId: string }>('delete_tag', args);
    return deleteTag(validated.tagId);
  },

  get_pets: async () => getPets(),

  feed_pet: async (args) => {
    const validated = validateArgs<{ pet: string; food: string }>('feed_pet', args);
    return feedPet(validated.pet, validated.food);
  },

  hatch_pet: async (args) => {
    const validated = validateArgs<{ egg: string; hatchingPotion: string }>('hatch_pet', args);
    return hatchPet(validated.egg, validated.hatchingPotion);
  },

  get_mounts: async () => getMounts(),

  equip_item: async (args) => {
    const validated = validateArgs<{ type: 'mount' | 'pet' | 'costume' | 'equipped'; key: string }>(
      'equip_item',
      args,
    );
    return equipItem(validated.type, validated.key);
  },

  get_notifications: async () => getNotifications(),

  read_notification: async (args) => {
    const validated = validateArgs<{ notificationId: string }>('read_notification', args);
    return readNotification(validated.notificationId);
  },

  get_shop: async (args) => {
    const validated = validateArgs<{
      shopType?: 'market' | 'questShop' | 'timeTravelersShop' | 'seasonalShop';
    }>('get_shop', args);
    return getShop(validated.shopType);
  },

  buy_item: async (args) => {
    const validated = validateArgs<{ itemKey: string; quantity?: number }>('buy_item', args);
    return buyItem(validated.itemKey, validated.quantity);
  },

  get_task_checklist: async (args) => {
    const validated = validateArgs<{ taskId: string }>('get_task_checklist', args);
    return getTaskChecklist(validated.taskId);
  },

  add_checklist_item: async (args) => {
    const validated = validateArgs<{ taskId: string; text: string }>('add_checklist_item', args);
    return addChecklistItem(validated.taskId, validated.text);
  },

  update_checklist_item: async (args) => {
    const validated = validateArgs<{
      taskId: string;
      itemId: string;
      text?: string;
      completed?: boolean;
    }>('update_checklist_item', args);
    const { taskId, itemId, ...updates } = validated;
    return updateChecklistItem(taskId, itemId, updates);
  },

  delete_checklist_item: async (args) => {
    const validated = validateArgs<{ taskId: string; itemId: string }>(
      'delete_checklist_item',
      args,
    );
    return deleteChecklistItem(validated.taskId, validated.itemId);
  },

  score_checklist_item: async (args) => {
    const validated = validateArgs<{ taskId: string; itemId: string }>(
      'score_checklist_item',
      args,
    );
    return scoreChecklistItem(validated.taskId, validated.itemId);
  },

  reorder_task: async (args) => {
    const validated = validateArgs<{ taskId: string; position: number }>('reorder_task', args);
    return reorderTask(validated.taskId, validated.position);
  },

  clear_completed_todos: async () => clearCompletedTodos(),

  toggle_sleep: async () => toggleSleep(),

  revive: async () => revive(),

  allocate_stat: async (args) => {
    const validated = validateArgs<{ stat: string }>('allocate_stat', args);
    return allocateStat(validated.stat);
  },

  get_groups: async (args) => {
    const validated = validateArgs<{ type?: string }>('get_groups', args);
    return getGroups(validated.type);
  },

  get_party: async () => getParty(),

  send_private_message: async (args) => {
    const validated = validateArgs<{ toUserId: string; message: string }>(
      'send_private_message',
      args,
    );
    return sendPrivateMessage(validated.toUserId, validated.message);
  },

  get_inbox: async (args) => {
    const validated = validateArgs<{ page?: number }>('get_inbox', args);
    return getInbox(validated.page);
  },
};
