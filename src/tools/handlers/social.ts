import { fetchHabiticaApiResponse } from '../../client.js';
import { t } from '../../i18n.js';
import type { Group, PrivateMessage } from '../../types.js';
import type { ToolResult } from '../types.js';

export async function getGroups(type?: string): Promise<ToolResult> {
  const endpoint = type ? `/groups?type=${type}` : '/groups?type=party,guilds';
  const apiResponse = await fetchHabiticaApiResponse<Group[]>('GET', endpoint);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse, null, 2),
      },
    ],
  };
}

export async function getParty(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<Group>('GET', '/groups/party');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse, null, 2),
      },
    ],
  };
}

export async function sendPrivateMessage(toUserId: string, message: string): Promise<ToolResult> {
  await fetchHabiticaApiResponse<Record<string, never>>('POST', '/members/send-private-message', {
    message,
    toUserId,
  });

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully sent private message to user ${toUserId}`,
          `成功向用户 ${toUserId} 发送私信`,
        ),
      },
    ],
  };
}

export async function getInbox(page = 0): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<{ messages: PrivateMessage[] }>(
    'GET',
    `/inbox/messages?page=${page}`,
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
