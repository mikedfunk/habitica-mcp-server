import { fetchHabiticaApiResponse } from '../../client.js';
import { t } from '../../i18n.js';
import type { ChecklistItem, HabiticaTask, UpdateChecklistItemInput } from '../../types.js';
import type { ToolResult } from '../types.js';

export async function getTaskChecklist(taskId: string): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaTask>('GET', `/tasks/${taskId}`);
  const task = apiResponse.data;
  const checklist: ChecklistItem[] = task.checklist ?? [];

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Task: ${task.text}\nChecklist items (${checklist.length}):`,
          `任务: ${task.text}\n清单项目 (${checklist.length}):`,
        ),
      },
      {
        type: 'text',
        text:
          checklist.length > 0
            ? checklist
                .map((item) => `${item.completed ? '✓' : '○'} ${item.text} (ID: ${item.id})`)
                .join('\n')
            : t('No checklist items found', '未找到清单项目'),
      },
    ],
  };
}

export async function addChecklistItem(taskId: string, text: string): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaTask>(
    'POST',
    `/tasks/${taskId}/checklist`,
    { text },
  );
  const task = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully added checklist item: ${text} to task: ${task.text}`,
          `成功添加清单项目: ${text} 到任务: ${task.text}`,
        ),
      },
    ],
  };
}

export async function updateChecklistItem(
  taskId: string,
  itemId: string,
  updates: UpdateChecklistItemInput,
): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaTask>(
    'PUT',
    `/tasks/${taskId}/checklist/${itemId}`,
    updates,
  );
  const task = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully updated checklist item in task: ${task.text}`,
          `成功更新清单项目: ${task.text}`,
        ),
      },
    ],
  };
}

export async function deleteChecklistItem(taskId: string, itemId: string): Promise<ToolResult> {
  await fetchHabiticaApiResponse<Record<string, never>>(
    'DELETE',
    `/tasks/${taskId}/checklist/${itemId}`,
  );

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully deleted checklist item (ID: ${itemId})`,
          `成功删除清单项目 (ID: ${itemId})`,
        ),
      },
    ],
  };
}

export async function scoreChecklistItem(taskId: string, itemId: string): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaTask>(
    'POST',
    `/tasks/${taskId}/checklist/${itemId}/score`,
  );
  const task = apiResponse.data;
  const item = task.checklist?.find((checklistItem) => checklistItem.id === itemId);

  return {
    content: [
      {
        type: 'text',
        text: item
          ? t(
              `Successfully scored checklist item: ${item.text} (completed: ${item.completed})`,
              `成功评分清单项目: ${item.text} (完成状态: ${item.completed})`,
            )
          : t('Successfully scored checklist item', '成功评分清单项目'),
      },
    ],
  };
}
