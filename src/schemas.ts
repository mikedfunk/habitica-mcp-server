import { z } from 'zod';

export const TaskTypeSchema = z.enum(['habit', 'daily', 'todo', 'reward']);
export const TaskListTypeSchema = z.enum(['habits', 'dailys', 'todos', 'rewards']);
export const DirectionSchema = z.enum(['up', 'down']);
export const StatTypeSchema = z.enum(['str', 'int', 'con', 'per']);
export const SpellIdSchema = z.enum([
  // Warrior skills
  'defensiveStance',
  'valorousPresence',
  'intimidate',
  // Mage skills
  'fireball',
  'etherealSurge',
  'earthquake',
  // Rogue skills
  'pickPocket',
  'backStab',
  'toolsOfTrade',
  // Healer skills
  'heal',
  'protectiveAura',
  'brightness',
]);

export type SpellId = z.infer<typeof SpellIdSchema>;
export const EquipTypeSchema = z.enum(['mount', 'pet', 'costume', 'equipped']);
export const ShopTypeSchema = z.enum(['market', 'questShop', 'timeTravelersShop', 'seasonalShop']);

export const CreateTaskInputSchema = z.object({
  type: TaskTypeSchema,
  text: z.string().min(1),
  notes: z.string().optional(),
  priority: z.number().optional(),
  checklist: z
    .array(
      z.object({
        text: z.string(),
        completed: z.boolean().optional(),
      }),
    )
    .optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateTaskInputSchema = z.object({
  text: z.string().optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
  priority: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export const UpdateChecklistItemInputSchema = z.object({
  text: z.string().optional(),
  completed: z.boolean().optional(),
});

export const ToolArgsSchemas = {
  get_tasks: z.object({
    type: TaskListTypeSchema.optional(),
  }),
  create_task: CreateTaskInputSchema,
  score_task: z.object({
    taskId: z.string(),
    direction: DirectionSchema.optional(),
  }),
  update_task: z.object({
    taskId: z.string(),
    ...UpdateTaskInputSchema.shape,
  }),
  delete_task: z.object({
    taskId: z.string(),
  }),
  buy_gems: z.object({
    quantity: z.number().min(1).max(24).optional(),
  }),
  get_available_spells: z.object({}),
  cast_spell: z.object({
    spellId: SpellIdSchema,
    targetId: z.string().optional(),
  }),
  create_tag: z.object({
    name: z.string().min(1),
  }),
  add_tag_to_task: z.object({
    taskId: z.string(),
    tagId: z.string(),
  }),
  remove_tag_from_task: z.object({
    taskId: z.string(),
    tagId: z.string(),
  }),
  update_tag: z.object({
    tagId: z.string(),
    name: z.string(),
  }),
  delete_tag: z.object({
    tagId: z.string(),
  }),
  feed_pet: z.object({
    pet: z.string(),
    food: z.string(),
  }),
  hatch_pet: z.object({
    egg: z.string(),
    hatchingPotion: z.string(),
  }),
  equip_item: z.object({
    type: EquipTypeSchema,
    key: z.string(),
  }),
  read_notification: z.object({
    notificationId: z.string(),
  }),
  get_shop: z.object({
    shopType: ShopTypeSchema.optional(),
  }),
  buy_item: z.object({
    itemKey: z.string(),
    quantity: z.number().optional(),
  }),
  get_task_checklist: z.object({
    taskId: z.string(),
  }),
  add_checklist_item: z.object({
    taskId: z.string(),
    text: z.string(),
  }),
  update_checklist_item: z.object({
    taskId: z.string(),
    itemId: z.string(),
    ...UpdateChecklistItemInputSchema.shape,
  }),
  delete_checklist_item: z.object({
    taskId: z.string(),
    itemId: z.string(),
  }),
  score_checklist_item: z.object({
    taskId: z.string(),
    itemId: z.string(),
  }),
  reorder_task: z.object({
    taskId: z.string(),
    position: z.number(),
  }),
  allocate_stat: z.object({
    stat: z.string(),
  }),
  get_groups: z.object({
    type: z.string().optional(),
  }),
  send_private_message: z.object({
    toUserId: z.string(),
    message: z.string().min(1),
  }),
  get_inbox: z.object({
    page: z.number().optional(),
  }),
};
