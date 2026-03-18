import { fetchHabiticaApiResponse } from '../../client.js';
import { t } from '../../i18n.js';
import type {
  CreateTaskInput,
  HabiticaTask,
  ScoreTaskResult,
  TaskListType,
  UpdateTaskInput,
} from '../../types.js';
import type { ToolResult } from '../types.js';

export async function getTasks(type?: TaskListType): Promise<ToolResult> {
  const endpoint = type ? `/tasks/user?type=${type}` : '/tasks/user';
  const apiResponse = await fetchHabiticaApiResponse<HabiticaTask[]>('GET', endpoint);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(apiResponse, null, 2),
      },
    ],
  };
}

export async function createTask(taskData: CreateTaskInput): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaTask>('POST', '/tasks/user', taskData);
  const task = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully created task: ${task.text} (ID: ${task.id})`,
          `成功创建任务: ${task.text} (ID: ${task.id})`,
        ),
      },
    ],
  };
}

export async function scoreTask(
  taskId: string,
  direction: 'up' | 'down' = 'up',
): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<ScoreTaskResult>(
    'POST',
    `/tasks/${taskId}/score/${direction}`,
  );
  const result = apiResponse.data;

  let message = t('Task scored! ', '任务完成! ');
  if (result.exp) message += t(`Gained ${result.exp} XP `, `获得 ${result.exp} 经验值 `);
  if (result.gp) message += t(`Gained ${result.gp} gold `, `获得 ${result.gp} 金币 `);
  if (result.lvl) message += t(`Level up to ${result.lvl}! `, `升级到 ${result.lvl} 级! `);

  return {
    content: [
      {
        type: 'text',
        text: message,
      },
    ],
  };
}

export async function updateTask(taskId: string, updates: UpdateTaskInput): Promise<ToolResult> {
  const apiResponse = await fetchHabiticaApiResponse<HabiticaTask>(
    'PUT',
    `/tasks/${taskId}`,
    updates,
  );
  const task = apiResponse.data;

  return {
    content: [
      {
        type: 'text',
        text: t(`Successfully updated task: ${task.text}`, `成功更新任务: ${task.text}`),
      },
    ],
  };
}

export async function deleteTask(taskId: string): Promise<ToolResult> {
  await fetchHabiticaApiResponse<Record<string, never>>('DELETE', `/tasks/${taskId}`);

  return {
    content: [
      {
        type: 'text',
        text: t(`Successfully deleted task (ID: ${taskId})`, `成功删除任务 (ID: ${taskId})`),
      },
    ],
  };
}

export async function reorderTask(taskId: string, position: number): Promise<ToolResult> {
  await fetchHabiticaApiResponse<unknown>('POST', `/tasks/${taskId}/move/to/${position}`);

  return {
    content: [
      {
        type: 'text',
        text: t(
          `Successfully moved task (ID: ${taskId}) to position ${position}`,
          `成功将任务 (ID: ${taskId}) 移动到位置 ${position}`,
        ),
      },
    ],
  };
}

export async function clearCompletedTodos(): Promise<ToolResult> {
  await fetchHabiticaApiResponse<unknown>('POST', '/tasks/clearCompletedTodos');

  return {
    content: [
      {
        type: 'text',
        text: t('Successfully cleared all completed todos', '成功清除所有已完成的待办事项'),
      },
    ],
  };
}
