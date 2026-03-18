import { fetchHabiticaApiResponse } from '../../client.js';
import { t } from '../../i18n.js';
import type { SpellId } from '../../schemas.js';
import type { HabiticaUser, UserStats } from '../../types.js';
import type { ToolResult } from '../types.js';

export async function getUserProfile(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaUser>('GET', '/user');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse.data, null, 2),
      },
    ],
  };
}

export async function getStats(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaUser>('GET', '/user');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse.data.stats, null, 2),
      },
    ],
  };
}

export async function getInventory(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaUser>('GET', '/user');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse.data.items, null, 2),
      },
    ],
  };
}

export async function getAvailableSpells(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaUser>('GET', '/user');
  const user = apiResponse.data;
  const playerClass = user.stats.class;
  const level = user.stats.lvl;
  const hasClassSystem = !user.preferences?.disableClasses;

  // All available spells with their requirements
  const allSpells: Array<{
    id: SpellId;
    name: string;
    class: string;
    level: number;
    description: string;
    manaCost: number;
  }> = [
    // Warrior skills (level 11, 12, 13)
    {
      id: 'defensiveStance',
      name: 'Defensive Stance',
      class: 'warrior',
      level: 11,
      description: 'Gain a buff to Constitution',
      manaCost: 25,
    },
    {
      id: 'valorousPresence',
      name: 'Valorous Presence',
      class: 'warrior',
      level: 12,
      description: "Buff your entire party's Strength",
      manaCost: 20,
    },
    {
      id: 'intimidate',
      name: 'Intimidating Gaze',
      class: 'warrior',
      level: 13,
      description: "Buff your entire party's Constitution",
      manaCost: 15,
    },
    // Mage skills (level 11, 12, 13)
    {
      id: 'fireball',
      name: 'Burst of Flames',
      class: 'mage',
      level: 11,
      description: 'Deal damage to a boss and gain XP',
      manaCost: 10,
    },
    {
      id: 'etherealSurge',
      name: 'Ethereal Surge',
      class: 'mage',
      level: 12,
      description: 'Restore MP to your entire party',
      manaCost: 30,
    },
    {
      id: 'earthquake',
      name: 'Earthquake',
      class: 'mage',
      level: 13,
      description: 'Deal damage to all bosses and buff party Intelligence',
      manaCost: 35,
    },
    // Rogue skills (level 11, 12, 13)
    {
      id: 'pickPocket',
      name: 'Pickpocket',
      class: 'rogue',
      level: 11,
      description: 'Gain gold from a task',
      manaCost: 10,
    },
    {
      id: 'backStab',
      name: 'Backstab',
      class: 'rogue',
      level: 12,
      description: 'Deal high damage to a boss and gain gold/XP',
      manaCost: 15,
    },
    {
      id: 'toolsOfTrade',
      name: 'Tools of the Trade',
      class: 'rogue',
      level: 13,
      description: "Buff your entire party's Perception",
      manaCost: 25,
    },
    // Healer skills (level 11, 12, 13)
    {
      id: 'heal',
      name: 'Healing Light',
      class: 'healer',
      level: 11,
      description: 'Restore health to yourself or a party member',
      manaCost: 15,
    },
    {
      id: 'protectiveAura',
      name: 'Protective Aura',
      class: 'healer',
      level: 12,
      description: "Buff your entire party's Constitution",
      manaCost: 30,
    },
    {
      id: 'brightness',
      name: 'Searing Brightness',
      class: 'healer',
      level: 13,
      description: 'Deal damage to all bosses and reduce redness of your tasks',
      manaCost: 40,
    },
  ];

  // Filter spells available to the user
  let availableSpells = allSpells;
  if (hasClassSystem && playerClass) {
    // Filter by class and level
    availableSpells = allSpells.filter(
      (spell) => spell.class === playerClass && spell.level <= level,
    );
  } else if (!hasClassSystem || level < 10) {
    // Before level 10 or opted out of class system, only warrior skills available
    availableSpells = allSpells.filter(
      (spell) => spell.class === 'warrior' && spell.level <= level,
    );
  }

  const spellsList = availableSpells
    .map(
      (spell) =>
        `• ${spell.name} (${spell.id}) - Level ${spell.level} ${spell.class}\n  ${spell.description}\n  Mana cost: ${spell.manaCost} MP`,
    )
    .join('\n\n');

  const currentClass = hasClassSystem ? playerClass : 'warrior (no class system)';

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Available spells for ${currentClass} (Level ${level}):\n\n${spellsList || 'No spells available yet. Reach level 11 to unlock your first spell.'}`,
          `${currentClass} 可用技能 (等级 ${level}):\n\n${spellsList || '暂无可用技能。达到11级解锁第一个技能。'}`,
        ),
      },
    ],
  };
}

export async function buyGems(quantity = 1): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<{ gems: number; gold: number }>(
    'POST',
    '/user/buy-gems',
    { quantity },
  );
  const result = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully bought ${quantity} gem${quantity > 1 ? 's' : ''}! You now have ${result.gems} gems. Remaining gold: ${result.gold}`,
          `成功购买 ${quantity} 颗宝石！你现在有 ${result.gems} 颗宝石。剩余金币: ${result.gold}`,
        ),
      },
    ],
  };
}

export async function castSpell(spellId: string, targetId?: string): Promise<ToolResult> {
  const endpoint = targetId
    ? `/user/class/cast/${spellId}?targetId=${targetId}`
    : `/user/class/cast/${spellId}`;
  await fetchHabiticaApiResponse<Record<string, never>>('POST', endpoint);

  return {
    content: [
      {
        type: 'text',
        text: t(`Successfully cast spell: ${spellId}`, `成功施放技能: ${spellId}`),
      },
    ],
  };
}

export async function toggleSleep(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<boolean>('POST', '/user/sleep');
  const isSleeping = apiResponse.data;

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

export async function revive(): Promise<ToolResult> {
  await fetchHabiticaApiResponse<Record<string, never>>('POST', '/user/revive');

  return {
    content: [
      {
        type: 'text',
        text: t(
          'Successfully revived! Lost some stats but back alive.',
          '成功复活！失去了一些属性但已恢复生命。',
        ),
      },
    ],
  };
}

export async function allocateStat(stat: string): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<UserStats>(
    'POST',
    `/user/allocate?stat=${stat}`,
  );
  const stats = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully allocated point to ${stat}. New stats:\n${JSON.stringify(stats, null, 2)}`,
          `成功将属性点分配给 ${stat}。新属性:\n${JSON.stringify(stats, null, 2)}`,
        ),
      },
    ],
  };
}

// TODO: This is a test function for CodeRabbit to review
export function testCodeRabbitReview(name: string, unusedParam: number): string {
  if (name === '') {
    return 'Hello World';
  }
  return `Hello, ${name}!`;
}
