export type TaskType = 'habit' | 'daily' | 'todo' | 'reward';
export type TaskListType = 'habits' | 'dailys' | 'todos' | 'rewards';
export type Direction = 'up' | 'down';
export type StatType = 'str' | 'int' | 'con' | 'per';
export type EquipType = 'mount' | 'pet' | 'costume' | 'equipped';
export type ShopType = 'market' | 'questShop' | 'timeTravelersShop' | 'seasonalShop';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface HabiticaTask {
  id: string;
  text: string;
  type: TaskType;
  priority: number;
  notes?: string;
  completed?: boolean;
  checklist?: ChecklistItem[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserStats {
  hp: number;
  mp: number;
  exp: number;
  gp: number;
  lvl: number;
  toNextLevel: number;
  maxHealth: number;
  maxMP: number;
  str: number;
  int: number;
  con: number;
  per: number;
  class?: string;
  points?: number;
}

export interface UserItems {
  pets: Record<string, number>;
  mounts: Record<string, boolean | null>;
  gear: {
    equipped: Record<string, string>;
    costume: Record<string, string>;
    owned: Record<string, boolean>;
  };
  food: Record<string, number>;
  hatchingPotions: Record<string, number>;
  eggs: Record<string, number>;
  quests: Record<string, number>;
  special: Record<string, number>;
  currentPet?: string;
  currentMount?: string;
}

export interface HabiticaUser {
  id: string;
  stats: UserStats;
  items: UserItems;
  profile: {
    name: string;
    blurb?: string;
    imageUrl?: string;
  };
  auth: {
    local: {
      username?: string;
      email?: string;
    };
  };
  notifications?: HabiticaNotification[];
}

export interface HabiticaNotification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  seen: boolean;
  read: boolean;
}

export interface ShopItem {
  key: string;
  text: string;
  notes?: string;
  value: number;
  currency?: string;
  category?: string;
}

export interface Shop {
  identifier: string;
  text: string;
  notes?: string;
  categories: Array<{
    identifier: string;
    text: string;
    items: ShopItem[];
  }>;
}

export interface ScoreTaskResult {
  exp: number;
  gp: number;
  hp: number;
  lvl: number;
  mp: number;
  _tmp: Record<string, unknown>;
}

export interface HabiticaApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface CreateTaskInput {
  type: TaskType;
  text: string;
  notes?: string;
  priority?: number;
  checklist?: Array<{ text: string; completed?: boolean }>;
  tags?: string[];
}

export interface UpdateTaskInput {
  text?: string;
  notes?: string;
  completed?: boolean;
  priority?: number;
  tags?: string[];
}

export interface UpdateChecklistItemInput {
  text?: string;
  completed?: boolean;
}

export interface Group {
  id: string;
  name: string;
  type: string;
  description?: string;
  memberCount?: number;
  privacy?: string;
  leader?: string;
  quest?: {
    key?: string;
    active?: boolean;
    members?: Record<string, boolean | null>;
  };
}

export interface GroupMember {
  id: string;
  profile: {
    name: string;
    imageUrl?: string;
  };
  stats?: UserStats;
}

export interface ChatMessage {
  id: string;
  text: string;
  user?: string;
  username?: string;
  timestamp: number | string;
  uuid?: string;
}

export interface PrivateMessage {
  id: string;
  text: string;
  user?: string;
  timestamp: number | string;
  uuid?: string;
  sent?: boolean;
}
