import { fetchHabiticaApiResponse } from '../../client.js';
import { t } from '../../i18n.js';
import type { ToolResult } from '../types.js';
import type { HabiticaUser, UserStats } from '../../types.js';

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

export async function castSpell(spellId: string, targetId?: string): Promise<ToolResult> {
  const endpoint = targetId
    ? `/user/class/cast/${spellId}?targetId=${targetId}`
    : `/user/class/cast/${spellId}`;
  await fetchHabiticaApiResponse<unknown>('POST', endpoint);

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
  await fetchHabiticaApiResponse<unknown>('POST', '/user/revive');

  return {
    content: [
      {
        type: 'text',
        text: t('Successfully revived! Lost some stats but back alive.', '成功复活！失去了一些属性但已恢复生命。'),
      },
    ],
  };
}

export async function allocateStat(stat: string): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<UserStats>(
    'POST',
    `/user/allocate?stat=${stat}`
  );
  const stats = apiResponse.data;

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
