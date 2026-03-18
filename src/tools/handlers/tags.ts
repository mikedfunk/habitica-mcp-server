import { fetchHabiticaApiResponse } from '../../client.js';
import { t } from '../../i18n.js';
import type { ToolResult } from '../types.js';
import type { Tag } from '../../types.js';

export async function getTags(): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<Tag[]>('GET', '/tags');

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse, null, 2),
      },
    ],
  };
}

export async function createTag(name: string): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<Tag>('POST', '/tags', { name });
  const tag = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully created tag: ${tag.name} (ID: ${tag.id})`,
          `成功创建标签: ${tag.name} (ID: ${tag.id})`
        ),
      },
    ],
  };
}

export async function addTagToTask(taskId: string, tagId: string): Promise<ToolResult> {
  await fetchHabiticaApiResponse<unknown>('POST', `/tasks/${taskId}/tags/${tagId}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully added tag (ID: ${tagId}) to task (ID: ${taskId})`,
          `成功将标签 (ID: ${tagId}) 添加到任务 (ID: ${taskId})`
        ),
      },
    ],
  };
}

export async function removeTagFromTask(taskId: string, tagId: string): Promise<ToolResult> {
  await fetchHabiticaApiResponse<unknown>('DELETE', `/tasks/${taskId}/tags/${tagId}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully removed tag (ID: ${tagId}) from task (ID: ${taskId})`,
          `成功从任务 (ID: ${taskId}) 移除标签 (ID: ${tagId})`
        ),
      },
    ],
  };
}

export async function updateTag(tagId: string, name: string): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<Tag>('PUT', `/tags/${tagId}`, { name });
  const tag = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully updated tag: ${tag.name} (ID: ${tag.id})`,
          `成功更新标签: ${tag.name} (ID: ${tag.id})`
        ),
      },
    ],
  };
}

export async function deleteTag(tagId: string): Promise<ToolResult> {
  await fetchHabiticaApiResponse<Record<string, never>>('DELETE', `/tags/${tagId}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully deleted tag (ID: ${tagId})`,
          `成功删除标签 (ID: ${tagId})`
        ),
      },
    ],
  };
}
