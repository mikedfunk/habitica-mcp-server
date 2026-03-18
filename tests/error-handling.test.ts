import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { getTasks, createTask, deleteTask } from '../src/tools/handlers/tasks.js';
import { setupMockEnv } from './utils/mock-fetch.js';

const mockFetch = mock(async (url: string, options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('Error Handling', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  describe('API Error Responses', () => {
    it('throws error with message when API returns error', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: false, error: 'Task not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(deleteTask('nonexistent-task')).rejects.toThrow('Task not found');
    });

    it('throws generic error when no message provided', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({}), {
          status: 500,
          statusText: 'Internal Server Error',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getTasks()).rejects.toThrow();
    });

    it('handles malformed JSON responses', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response('not valid json', {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getTasks()).rejects.toThrow();
    });

    it('handles network errors', async () => {
      mockFetch.mockImplementationOnce(async () => {
        throw new Error('Network error: Connection refused');
      });

      await expect(getTasks()).rejects.toThrow('Network error');
    });
  });

  describe('Authentication Errors', () => {
    it('handles 401 unauthorized error', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ message: 'Not authorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getTasks()).rejects.toThrow('Not authorized');
    });

    it('handles invalid credentials', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ error: 'Invalid API credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(createTask({ type: 'todo', text: 'Test' })).rejects.toThrow('Invalid API credentials');
    });
  });

  describe('Rate Limiting', () => {
    it('handles 429 rate limit exceeded', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ message: 'Rate limit exceeded. Try again later.' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(getTasks()).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Validation Errors', () => {
    it('handles 400 bad request with validation errors', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ message: 'Invalid task type' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await expect(createTask({ type: 'invalid' as any, text: 'Test' })).rejects.toThrow('Invalid task type');
    });
  });
});
