import type {
  CreateTaskInput,
  EquipType,
  ShopType,
  TaskListType,
  UpdateChecklistItemInput,
  UpdateTaskInput,
} from '../types.js';
import {
  addChecklistItem,
  deleteChecklistItem,
  getTaskChecklist,
  scoreChecklistItem,
  updateChecklistItem,
} from './handlers/checklist.js';
import { equipItem, feedPet, getMounts, getPets, hatchPet } from './handlers/pets.js';
import {
  buyItem,
  buyReward,
  getNotifications,
  getShop,
  readNotification,
} from './handlers/shop.js';
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
  castSpell,
  getInventory,
  getStats,
  getUserProfile,
  revive,
  toggleSleep,
} from './handlers/user.js';
import type { ToolResult } from './types.js';

export type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

export const toolRegistry: Record<string, ToolHandler> = {
  get_user_profile: async () => getUserProfile(),

  get_tasks: async (args) => getTasks(args.type as TaskListType | undefined),

  create_task: async (args) => createTask(args as unknown as CreateTaskInput),

  score_task: async (args) =>
    scoreTask(args.taskId as string, args.direction as 'up' | 'down' | undefined),

  update_task: async (args) =>
    updateTask(args.taskId as string, args as unknown as UpdateTaskInput),

  delete_task: async (args) => deleteTask(args.taskId as string),

  get_stats: async () => getStats(),

  buy_reward: async (args) => buyReward(args.key as string),

  get_inventory: async () => getInventory(),

  cast_spell: async (args) =>
    castSpell(args.spellId as string, args.targetId as string | undefined),

  get_tags: async () => getTags(),

  create_tag: async (args) => createTag(args.name as string),

  add_tag_to_task: async (args) => addTagToTask(args.taskId as string, args.tagId as string),

  remove_tag_from_task: async (args) =>
    removeTagFromTask(args.taskId as string, args.tagId as string),

  update_tag: async (args) => updateTag(args.tagId as string, args.name as string),

  delete_tag: async (args) => deleteTag(args.tagId as string),

  get_pets: async () => getPets(),

  feed_pet: async (args) => feedPet(args.pet as string, args.food as string),

  hatch_pet: async (args) => hatchPet(args.egg as string, args.hatchingPotion as string),

  get_mounts: async () => getMounts(),

  equip_item: async (args) => equipItem(args.type as EquipType, args.key as string),

  get_notifications: async () => getNotifications(),

  read_notification: async (args) => readNotification(args.notificationId as string),

  get_shop: async (args) => getShop(args.shopType as ShopType | undefined),

  buy_item: async (args) => buyItem(args.itemKey as string, args.quantity as number | undefined),

  get_task_checklist: async (args) => getTaskChecklist(args.taskId as string),

  add_checklist_item: async (args) => addChecklistItem(args.taskId as string, args.text as string),

  update_checklist_item: async (args) =>
    updateChecklistItem(
      args.taskId as string,
      args.itemId as string,
      args as unknown as UpdateChecklistItemInput,
    ),

  delete_checklist_item: async (args) =>
    deleteChecklistItem(args.taskId as string, args.itemId as string),

  score_checklist_item: async (args) =>
    scoreChecklistItem(args.taskId as string, args.itemId as string),

  reorder_task: async (args) => reorderTask(args.taskId as string, args.position as number),

  clear_completed_todos: async () => clearCompletedTodos(),

  toggle_sleep: async () => toggleSleep(),

  revive: async () => revive(),

  allocate_stat: async (args) => allocateStat(args.stat as string),

  get_groups: async (args) => getGroups(args.type as string | undefined),

  get_party: async () => getParty(),

  send_private_message: async (args) =>
    sendPrivateMessage(args.toUserId as string, args.message as string),

  get_inbox: async (args) => getInbox(args.page as number | undefined),
};
