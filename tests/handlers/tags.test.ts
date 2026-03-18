import { describe, it, expect, mock, beforeEach } from 'bun:test';
import {
  getTags,
  createTag,
  addTagToTask,
  removeTagFromTask,
  updateTag,
  deleteTag,
} from '../../src/tools/handlers/tags.js';
import { setupMockEnv } from '../utils/mock-fetch.js';

const mockFetch = mock(async (url: string, options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('Tags Handlers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  describe('getTags', () => {
    it('fetches all tags', async () => {
      const tags = [
        { id: 'tag-1', name: 'Work' },
        { id: 'tag-2', name: 'Personal' },
        { id: 'tag-3', name: 'Urgent' },
      ];
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: tags }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getTags();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toContain('Work');
      expect(result.content[0].text).toContain('Personal');
    });
  });

  describe('createTag', () => {
    it('creates a new tag', async () => {
      const newTag = { id: 'tag-new', name: 'Health' };
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: newTag }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await createTag('Health');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toBe('https://habitica.com/api/v3/tags');
      expect(calledOptions.method).toBe('POST');
      const body = JSON.parse(calledOptions.body as string);
      expect(body.name).toBe('Health');
      expect(result.content[0].text).toContain('Successfully created tag');
      expect(result.content[0].text).toContain('Health');
    });
  });

  describe('addTagToTask', () => {
    it('adds a tag to a task', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await addTagToTask('task-123', 'tag-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-123/tags/tag-1');
      expect(calledOptions.method).toBe('POST');
      expect(result.content[0].text).toContain('Successfully added tag');
    });
  });

  describe('removeTagFromTask', () => {
    it('removes a tag from a task', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await removeTagFromTask('task-123', 'tag-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tasks/task-123/tags/tag-1');
      expect(calledOptions.method).toBe('DELETE');
      expect(result.content[0].text).toContain('Successfully removed tag');
    });
  });

  describe('updateTag', () => {
    it('updates a tag name', async () => {
      const updatedTag = { id: 'tag-1', name: 'Work Tasks' };
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: updatedTag }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await updateTag('tag-1', 'Work Tasks');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tags/tag-1');
      expect(calledOptions.method).toBe('PUT');
      const body = JSON.parse(calledOptions.body as string);
      expect(body.name).toBe('Work Tasks');
      expect(result.content[0].text).toContain('Successfully updated tag');
    });
  });

  describe('deleteTag', () => {
    it('deletes a tag', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await deleteTag('tag-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/tags/tag-1');
      expect(calledOptions.method).toBe('DELETE');
      expect(result.content[0].text).toContain('Successfully deleted tag');
    });
  });
});
