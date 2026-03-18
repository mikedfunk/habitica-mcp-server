import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { equipItem, feedPet, getMounts, getPets, hatchPet } from '../../src/tools/handlers/pets.js';
import { createUserMock, setupMockEnv } from '../utils/mock-fetch.js';

const mockFetch = mock(async (url: string, options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('Pets Handlers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  describe('getPets', () => {
    it('fetches and returns user pets', async () => {
      const userMock = createUserMock({
        items: {
          ...createUserMock().items,
          pets: {
            'Wolf-Base': 5,
            'Tiger-Veteran': 10,
            'Dragon-Red': 0,
          },
        },
      });
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: userMock }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await getPets();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toContain('Wolf-Base');
      expect(result.content[0].text).toContain('5');
    });
  });

  describe('feedPet', () => {
    it('feeds a pet with specified food', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(
            JSON.stringify({ success: true, data: { message: 'Pet likes the food!' } }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            },
          ),
      );

      const result = await feedPet('Wolf-Base', 'Meat');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/feed/Wolf-Base/Meat');
      expect(result.content[0].text).toContain('Successfully fed pet Wolf-Base');
      expect(result.content[0].text).toContain('Pet likes the food');
    });

    it('handles feeding without message', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await feedPet('Tiger-Veteran', 'Fish');

      expect(result.content[0].text).toContain('Successfully fed pet Tiger-Veteran');
    });
  });

  describe('hatchPet', () => {
    it('hatches a pet from egg and potion', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await hatchPet('Wolf', 'Base');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/hatch/Wolf/Base');
      expect(result.content[0].text).toContain('Successfully hatched pet');
      expect(result.content[0].text).toContain('Wolf-Base');
    });
  });

  describe('getMounts', () => {
    it('fetches and returns user mounts', async () => {
      const userMock = createUserMock({
        items: {
          ...createUserMock().items,
          mounts: {
            'Wolf-Base': true,
            'Tiger-Veteran': true,
            'Dragon-Red': null,
          },
        },
      });
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: userMock }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await getMounts();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.content[0].text).toContain('Wolf-Base');
      expect(result.content[0].text).toContain('true');
    });
  });

  describe('equipItem', () => {
    it('equips a pet', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await equipItem('pet', 'Wolf-Base');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/equip/pet/Wolf-Base');
      expect(result.content[0].text).toContain('Successfully equipped pet');
    });

    it('equips a mount', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      await equipItem('mount', 'Tiger-Veteran');

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/equip/mount/Tiger-Veteran');
    });

    it('equips costume gear', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: {} }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      await equipItem('costume', 'armor_special_0');

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/equip/costume/armor_special_0');
    });
  });
});
