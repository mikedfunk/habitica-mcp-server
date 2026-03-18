import { describe, it, expect, mock, beforeEach } from 'bun:test';
import {
  getUserProfile,
  getStats,
  getInventory,
  castSpell,
  toggleSleep,
  revive,
  allocateStat,
} from '../../src/tools/handlers/user.js';
import { setupMockEnv, createUserMock } from '../utils/mock-fetch.js';

const mockFetch = mock(async (url: string, options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('User Handlers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  describe('getUserProfile', () => {
    it('fetches and returns user profile data', async () => {
      const userMock = createUserMock();
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: userMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getUserProfile();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toBe('https://habitica.com/api/v3/user');
      expect(result.content[0].text).toContain('Test User');
    });
  });

  describe('getStats', () => {
    it('fetches and returns user stats', async () => {
      const userMock = createUserMock();
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: userMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getStats();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toBe('https://habitica.com/api/v3/user');
      expect(result.content[0].text).toContain('hp');
      expect(result.content[0].text).toContain('50');
    });
  });

  describe('getInventory', () => {
    it('fetches and returns user inventory', async () => {
      const userMock = createUserMock({
        items: {
          pets: { 'Wolf-Base': 5 },
          mounts: { 'Wolf-Base': true },
          gear: {
            equipped: {},
            costume: {},
            owned: {},
          },
          food: { 'Meat': 3 },
          hatchingPotions: { 'Base': 2 },
          eggs: { 'Wolf': 1 },
          quests: {},
          special: {},
        },
      });
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: userMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await getInventory();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toContain('Wolf-Base');
      expect(result.content[0].text).toContain('Meat');
    });
  });

  describe('castSpell', () => {
    it('casts a spell without target', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await castSpell('fireball');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/class/cast/fireball');
      expect(result.content[0].text).toContain('Successfully cast spell: fireball');
    });

    it('casts a spell with target', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await castSpell('blessing', 'target-user-id');

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/class/cast/blessing?targetId=target-user-id');
    });
  });

  describe('toggleSleep', () => {
    it('returns sleeping message when user goes to sleep', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toggleSleep();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toContain('resting in the inn');
    });

    it('returns wake message when user wakes up', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: false }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toggleSleep();

      expect(result.content[0].text).toContain('woken up');
    });
  });

  describe('revive', () => {
    it('revives the user', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await revive();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/revive');
      expect(result.content[0].text).toContain('Successfully revived');
    });
  });

  describe('allocateStat', () => {
    it('allocates a stat point to strength', async () => {
      const updatedStats = {
        hp: 50,
        mp: 100,
        exp: 100,
        gp: 100,
        lvl: 5,
        toNextLevel: 200,
        maxHealth: 50,
        maxMP: 100,
        str: 6,
        int: 5,
        con: 5,
        per: 5,
        class: 'warrior',
        points: 0,
      };
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: updatedStats }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await allocateStat('str');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/allocate?stat=str');
      expect(result.content[0].text).toContain('str');
      expect(result.content[0].text).toContain('6');
    });

    it('allocates stat points to different attributes', async () => {
      const stats = { str: 5, int: 6, con: 5, per: 5 };
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: { ...createUserMock().stats, ...stats, int: 6 } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      await allocateStat('int');

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/allocate?stat=int');
    });
  });
});
