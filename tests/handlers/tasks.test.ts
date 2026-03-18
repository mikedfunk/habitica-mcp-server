import { beforeEach, describe, expect, it, mock } from 'bun:test';
import {
  clearCompletedTodos,
  createTask,
  deleteTask,
  getTasks,
  reorderTask,
  scoreTask,
  updateTask,
} from '../../src/tools/handlers/tasks.js';
import { createTaskMock, setupMockEnv } from '../utils/mock-fetch.js';

const mockFetch = mock(async (_url: string, _options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('Task Handlers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  describe('getTasks', () => {
    it('fetches all tasks when no type is specified', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(
            JSON.stringify({ success: true, data: [createTaskMock('1', 'Test Task', 'todo')] }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
      );

      const result = await getTasks();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toBe('https://habitica.com/api/v3/tasks/user');
      expect(result.content[0].text).toContain('Test Task');
    });

    it('fetches tasks by type when specified', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: [] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      await getTasks('habits');

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('type=habits');
    });
  });

  describe('createTask', () => {
    it('creates a task and returns success message', async () => {
      const taskMock = createTaskMock('new-task-id', 'New Task', 'todo');
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: taskMock }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await createTask({ type: 'todo', text: 'New Task' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toContain('Successfully created task');
      expect(result.content[0].text).toContain('New Task');
    });

    it('sends correct request body', async () => {
      const taskMock = createTaskMock('task-1', 'Test', 'daily');
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: taskMock }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      await createTask({ type: 'daily', text: 'Test', notes: 'Note text', priority: 1.5 });

      const [, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(calledOptions.body as string);
      expect(body.type).toBe('daily');
      expect(body.text).toBe('Test');
      expect(body.notes).toBe('Note text');
      expect(body.priority).toBe(1.5);
    });
  });

  describe('scoreTask', () => {
    it('scores a task in the up direction by default', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(
            JSON.stringify({
              success: true,
              data: { exp: 10, gp: 5, hp: 50, lvl: 1, mp: 100, _tmp: {} },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
      );

      const result = await scoreTask('task-123');

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-123/score/up');
      expect(result.content[0].text).toContain('Task scored');
      expect(result.content[0].text).toContain('Gained 10 XP');
      expect(result.content[0].text).toContain('Gained 5 gold');
    });

    it('scores a task in the down direction when specified', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(
            JSON.stringify({
              success: true,
              data: { exp: 0, gp: 0, hp: 50, lvl: 1, mp: 100, _tmp: {} },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
      );

      await scoreTask('task-123', 'down');

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-123/score/down');
    });

    it('shows level up message when level increases', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(
            JSON.stringify({
              success: true,
              data: { exp: 150, gp: 10, hp: 50, lvl: 6, mp: 100, _tmp: {} },
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
      );

      const result = await scoreTask('task-123');

      expect(result.content[0].text).toContain('Level up to 6');
    });
  });

  describe('updateTask', () => {
    it('updates a task and returns success message', async () => {
      const updatedTask = createTaskMock('task-1', 'Updated Task', 'todo', {
        notes: 'Updated notes',
      });
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: updatedTask }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await updateTask('task-1', { text: 'Updated Task', notes: 'Updated notes' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-1');
      expect(calledOptions.method).toBe('PUT');
      expect(result.content[0].text).toContain('Successfully updated task');
    });
  });

  describe('deleteTask', () => {
    it('deletes a task and returns success message', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await deleteTask('task-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-1');
      expect(calledOptions.method).toBe('DELETE');
      expect(result.content[0].text).toContain('Successfully deleted task');
    });
  });

  describe('reorderTask', () => {
    it('moves a task to the specified position', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await reorderTask('task-1', 3);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-1/move/to/3');
      expect(result.content[0].text).toContain('position 3');
    });
  });

  describe('clearCompletedTodos', () => {
    it('clears all completed todos', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await clearCompletedTodos();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/clearCompletedTodos');
      expect(result.content[0].text).toContain('cleared all completed todos');
    });
  });
});
