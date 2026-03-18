import { fetchHabiticaApiResponse } from '../../client.js';
import { t } from '../../i18n.js';
import type { HabiticaNotification } from '../../types.js';
import type { ToolResult } from '../types.js';

export async function getNotifications(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaNotification[]>(
    'GET',
    '/notifications',
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse, null, 2),
      },
    ],
  };
}

export async function readNotification(notificationId: string): Promise<ToolResult> {
  await fetchHabiticaApiResponse<Record<string, never>>(
    'POST',
    `/notifications/${notificationId}/read`,
  );

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully marked notification as read (ID: ${notificationId})`,
          `成功标记通知为已读 (ID: ${notificationId})`,
        ),
      },
    ],
  };
}
