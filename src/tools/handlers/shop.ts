import { fetchHabiticaApiResponse } from '../../client.js';
import { t } from '../../i18n.js';
import type { Shop, ShopType } from '../../types.js';
import type { ToolResult } from '../types.js';

export async function getShop(shopType: ShopType = 'market'): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<Shop>('GET', `/shops/${shopType}`);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse, null, 2),
      },
    ],
  };
}

export async function buyItem(itemKey: string, quantity = 1): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<{ gp: number }>(
    'POST',
    `/user/buy/${itemKey}`,
    { quantity },
  );
  const result = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully bought ${itemKey} x${quantity}! Remaining gold: ${result.gp}`,
          `成功购买 ${itemKey} x${quantity}! 剩余金币: ${result.gp}`,
        ),
      },
    ],
  };
}

export async function buyReward(key: string): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<{ gp: number }>('POST', `/user/buy/${key}`);
  const result = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully bought reward! Remaining gold: ${result.gp}`,
          `成功购买奖励! 剩余金币: ${result.gp}`,
        ),
      },
    ],
  };
}
