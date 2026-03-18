import { beforeEach, describe, expect, it, mock } from 'bun:test';
import { buyItem, buyReward, getShop } from '../../src/tools/handlers/shop.js';
import { setupMockEnv } from '../utils/mock-fetch.js';

const mockFetch = mock(async (_url: string, _options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('Shop Handlers', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  describe('getShop', () => {
    it('fetches market items by default', async () => {
      const shopData = {
        identifier: 'market',
        text: 'Market',
        categories: [
          {
            identifier: 'eggs',
            text: 'Eggs',
            items: [{ key: 'Wolf', text: 'Wolf Egg', value: 3 }],
          },
        ],
      };
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: shopData }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await getShop();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/shops/market');
      expect(result.content[0].text).toContain('Market');
    });

    it('fetches specified shop type', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: { identifier: 'questShop' } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      await getShop('questShop');

      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/shops/questShop');
    });
  });

  describe('buyItem', () => {
    it('buys an item with default quantity of 1', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: { gp: 95 } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await buyItem('potion');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/buy/potion');
      expect(calledOptions.method).toBe('POST');
      const body = JSON.parse(calledOptions.body as string);
      expect(body.quantity).toBe(1);
      expect(result.content[0].text).toContain('Successfully bought potion x1');
      expect(result.content[0].text).toContain('Remaining gold: 95');
    });

    it('buys an item with specified quantity', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: { gp: 85 } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await buyItem('potion', 3);

      const [, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
      const body = JSON.parse(calledOptions.body as string);
      expect(body.quantity).toBe(3);
      expect(result.content[0].text).toContain('Successfully bought potion x3');
    });
  });

  describe('buyReward', () => {
    it('buys a reward item', async () => {
      mockFetch.mockImplementationOnce(
        async () =>
          new Response(JSON.stringify({ success: true, data: { gp: 50 } }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
      );

      const result = await buyReward('reward-key');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect(calledUrl).toContain('/user/buy/reward-key');
      expect(result.content[0].text).toContain('Successfully bought reward');
      expect(result.content[0].text).toContain('Remaining gold: 50');
    });
  });
});
