import { describe, it, expect, mock, beforeEach } from 'bun:test';
import {
  getGroups,
  getParty,
  sendPrivateMessage,
  getInbox,
} from '../../src/tools/handlers/social.js';
import { setupMockEnv } from '../utils/mock-fetch.js';

const mockFetch = mock(async (url: string, options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('Social Handlers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  describe('getGroups', () => {
    it('fetches party and guilds by default', async () => {
      const groups = [
        { id: 'group-1', name: 'My Party', type: 'party' },
        { id: 'group-2', name: 'Coding Guild', type: 'guild' },
      ];
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: groups }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getGroups();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/groups?type=party,guilds');
      expect(result.content[0].text).toContain('My Party');
      expect(result.content[0].text).toContain('Coding Guild');
    });

    it('fetches groups with specified type filter', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await getGroups('guilds');

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/groups?type=guilds');
    });
  });

  describe('getParty', () => {
    it('fetches current party info', async () => {
      const party = {
        id: 'party-1',
        name: 'Adventurers',
        type: 'party',
        memberCount: 4,
        quest: { key: 'dilatory_derby', active: true },
      };
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: party }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getParty();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/groups/party');
      expect(result.content[0].text).toContain('Adventurers');
    });
  });

  describe('sendPrivateMessage', () => {
    it('sends a private message to a user', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await sendPrivateMessage('user-123', 'Hello there!');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/members/send-private-message');
      expect(calledOptions.method).toBe('POST');
      const body = JSON.parse(calledOptions.body as string);
      expect(body.toUserId).toBe('user-123');
      expect(body.message).toBe('Hello there!');
      expect(result.content[0].text).toContain('Successfully sent private message');
    });
  });

  describe('getInbox', () => {
    it('fetches inbox messages with default page 0', async () => {
      const messages = [
        { id: 'msg-1', text: 'Hello!', user: 'Friend' },
        { id: 'msg-2', text: 'Want to quest?', user: 'Party Leader' },
      ];
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: messages }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getInbox();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/inbox/messages?page=0');
      expect(result.content[0].text).toContain('Hello');
    });

    it('fetches inbox messages with specified page', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await getInbox(2);

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/inbox/messages?page=2');
    });
  });
});
