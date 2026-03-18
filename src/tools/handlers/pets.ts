import { fetchHabiticaApiResponse } from '../../client.js';
import { t } from '../../i18n.js';
import type { EquipType, HabiticaUser } from '../../types.js';
import type { ToolResult } from '../types.js';

export async function getPets(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaUser>('GET', '/user');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse.data.items.pets, null, 2),
      },
    ],
  };
}

export async function feedPet(pet: string, food: string): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<{ message?: string }>(
    'POST',
    `/user/feed/${pet}/${food}`,
  );
  const result = apiResponse.data;

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

export async function hatchPet(egg: string, hatchingPotion: string): Promise<ToolResult> {
  await fetchHabiticaApiResponse<unknown>('POST', `/user/hatch/${egg}/${hatchingPotion}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully hatched pet! Got ${egg}-${hatchingPotion}`,
          `成功孵化宠物! 获得了 ${egg}-${hatchingPotion}`,
        ),
      },
    ],
  };
}

export async function getMounts(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaUser>('GET', '/user');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse.data.items.mounts, null, 2),
      },
    ],
  };
}

export async function equipItem(type: EquipType, key: string): Promise<ToolResult> {
  await fetchHabiticaApiResponse<unknown>('POST', `/user/equip/${type}/${key}`);

  return {
    content: [
      {
        type: 'text',
        text: t(`Successfully equipped ${type}: ${key}`, `成功装备 ${type}: ${key}`),
      },
    ],
  };
}
