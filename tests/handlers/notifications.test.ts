import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { getNotifications, readNotification } from '../../src/tools/handlers/notifications.js';
import { setupMockEnv } from '../utils/mock-fetch.js';

const mockFetch = mock(async (_url: string, _options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('Notification Handlers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  describe('getNotifications', () => {
    it('fetches user notifications', async () => {
      const notifications = [
        { id: 'notif-1', type: 'NEW_STUFF', seen: false, read: false },
        { id: 'notif-2', type: 'GROUP_TASK_APPROVED', seen: true, read: true },
      ];
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: notifications }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await getNotifications();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/notifications');
      expect(result.content[0].text).toContain('NEW_STUFF');
    });
  });

  describe('readNotification', () => {
    it('marks a notification as read', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await readNotification('notif-1');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/notifications/notif-1/read');
      expect(result.content[0].text).toContain('Successfully marked notification as read');
    });
  });
});
