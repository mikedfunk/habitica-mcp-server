import { describe, it, expect, mock, beforeEach } from 'bun:test';
import {
  getTaskChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  scoreChecklistItem,
} from '../../src/tools/handlers/checklist.js';
import { setupMockEnv, createTaskMock } from '../utils/mock-fetch.js';

const mockFetch = mock(async (url: string, options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('Checklist Handlers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  describe('getTaskChecklist', () => {
    it('returns task checklist items', async () => {
      const taskWithChecklist = createTaskMock('task-1', 'Task with checklist', 'todo', {
        checklist: [
          { id: 'item-1', text: 'First item', completed: true },
          { id: 'item-2', text: 'Second item', completed: false },
        ],
      });
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: taskWithChecklist }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getTaskChecklist('task-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toContain('Task: Task with checklist');
      expect(result.content[1].text).toContain('✓ First item');
      expect(result.content[1].text).toContain('○ Second item');
    });

    it('shows message when no checklist items exist', async () => {
      const taskWithoutChecklist = createTaskMock('task-2', 'Empty task', 'todo', {
        checklist: [],
      });
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: taskWithoutChecklist }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getTaskChecklist('task-2');

      expect(result.content[1].text).toContain('No checklist items found');
    });
  });

  describe('addChecklistItem', () => {
    it('adds a checklist item to task', async () => {
      const updatedTask = createTaskMock('task-1', 'My Task', 'todo', {
        checklist: [{ id: 'new-item', text: 'New checklist item', completed: false }],
      });
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: updatedTask }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await addChecklistItem('task-1', 'New checklist item');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-1/checklist');
      expect(calledOptions.method).toBe('POST');
      const body = JSON.parse(calledOptions.body as string);
      expect(body.text).toBe('New checklist item');
      expect(result.content[0].text).toContain('Successfully added checklist item');
    });
  });

  describe('updateChecklistItem', () => {
    it('updates checklist item text', async () => {
      const updatedTask = createTaskMock('task-1', 'My Task', 'todo');
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: updatedTask }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await updateChecklistItem('task-1', 'item-1', { text: 'Updated text' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-1/checklist/item-1');
      expect(calledOptions.method).toBe('PUT');
      const body = JSON.parse(calledOptions.body as string);
      expect(body.text).toBe('Updated text');
      expect(result.content[0].text).toContain('Successfully updated checklist item');
    });

    it('updates checklist item completion status', async () => {
      const updatedTask = createTaskMock('task-1', 'My Task', 'todo');
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: updatedTask }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await updateChecklistItem('task-1', 'item-1', { completed: true });

      const [, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(calledOptions.body as string);
      expect(body.completed).toBe(true);
    });
  });

  describe('deleteChecklistItem', () => {
    it('deletes a checklist item', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await deleteChecklistItem('task-1', 'item-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-1/checklist/item-1');
      expect(calledOptions.method).toBe('DELETE');
      expect(result.content[0].text).toContain('Successfully deleted checklist item');
    });
  });

  describe('scoreChecklistItem', () => {
    it('scores/toggles a checklist item', async () => {
      const updatedTask = createTaskMock('task-1', 'My Task', 'todo', {
        checklist: [
          { id: 'item-1', text: 'Checklist item', completed: true },
        ],
      });
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: updatedTask }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await scoreChecklistItem('task-1', 'item-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-1/checklist/item-1/score');
      expect(result.content[0].text).toContain('Successfully scored checklist item');
      expect(result.content[0].text).toContain('Checklist item');
      expect(result.content[0].text).toContain('completed: true');
    });

    it('handles missing item gracefully', async () => {
      const taskWithoutItem = createTaskMock('task-1', 'My Task', 'todo', {
        checklist: [],
      });
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: taskWithoutItem }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await scoreChecklistItem('task-1', 'item-1');

      expect(result.content[0].text).toBe('Successfully scored checklist item');
    });
  });
});
