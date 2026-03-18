import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { toolRegistry } from '../../src/tools/registry.js';
import { setupMockEnv, createTaskMock, createUserMock } from '../utils/mock-fetch.js';

const mockFetch = mock(async (url: string, options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('Tool Registry', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    setupMockEnv();
  });

  it('contains all expected tool handlers', () => {
    const expectedTools = [
      'get_user_profile',
      'get_tasks',
      'create_task',
      'score_task',
      'update_task',
      'delete_task',
      'get_stats',
      'buy_reward',
      'get_inventory',
      'cast_spell',
      'get_tags',
      'create_tag',
      'add_tag_to_task',
      'remove_tag_from_task',
      'update_tag',
      'delete_tag',
      'get_pets',
      'feed_pet',
      'hatch_pet',
      'get_mounts',
      'equip_item',
      'get_notifications',
      'read_notification',
      'get_shop',
      'buy_item',
      'get_task_checklist',
      'add_checklist_item',
      'update_checklist_item',
      'delete_checklist_item',
      'score_checklist_item',
      'reorder_task',
      'clear_completed_todos',
      'toggle_sleep',
      'revive',
      'allocate_stat',
      'get_groups',
      'get_party',
      'send_private_message',
      'get_inbox',
    ];

    for (const toolName of expectedTools) {
      expect(toolRegistry[toolName]).toBeDefined();
      expect(typeof toolRegistry[toolName]).toBe('function');
    }
  });

  describe('task handlers', () => {
    it('get_tasks handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['get_tasks']({ type: 'todos' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result.content[0].type).toBe('text');
    });

    it('create_task handler works', async () => {
      const taskMock = createTaskMock('new-id', 'New Task', 'todo');
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: taskMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['create_task']({ type: 'todo', text: 'New Task' });

      expect(result.content[0].text).toContain('Successfully created task');
    });

    it('score_task handler works with direction', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({
          success: true,
          data: { exp: 10, gp: 5, hp: 50, lvl: 1, mp: 100, _tmp: {} }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['score_task']({ taskId: 'task-1', direction: 'up' });

      expect(result.content[0].text).toContain('Task scored');
    });
  });

  describe('user handlers', () => {
    it('get_user_profile handler works', async () => {
      const userMock = createUserMock();
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: userMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['get_user_profile']({});

      expect(result.content[0].text).toContain('Test User');
    });

    it('get_stats handler works', async () => {
      const userMock = createUserMock();
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: userMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['get_stats']({});

      expect(result.content[0].text).toContain('hp');
    });
  });

  describe('pet handlers', () => {
    it('get_pets handler works', async () => {
      const userMock = createUserMock({
        items: {
          ...createUserMock().items,
          pets: { 'Wolf-Base': 5 },
        },
      });
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: userMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['get_pets']({});

      expect(result.content[0].text).toContain('Wolf-Base');
    });

    it('feed_pet handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['feed_pet']({ pet: 'Wolf-Base', food: 'Meat' });

      expect(result.content[0].text).toContain('Successfully fed pet');
    });
  });

  describe('tag handlers', () => {
    it('get_tags handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: [{ id: 'tag-1', name: 'Work' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['get_tags']({});

      expect(result.content[0].text).toContain('Work');
    });

    it('create_tag handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: { id: 'tag-new', name: 'Health' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['create_tag']({ name: 'Health' });

      expect(result.content[0].text).toContain('Successfully created tag');
    });
  });

  describe('shop handlers', () => {
    it('get_shop handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: { identifier: 'market' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['get_shop']({ shopType: 'market' });

      expect(result.content[0].text).toContain('market');
    });

    it('buy_item handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: { gp: 90 } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['buy_item']({ itemKey: 'potion', quantity: 2 });

      expect(result.content[0].text).toContain('Successfully bought');
    });
  });

  describe('checklist handlers', () => {
    it('get_task_checklist handler works', async () => {
      const taskMock = createTaskMock('task-1', 'Task', 'todo', {
        checklist: [{ id: 'item-1', text: 'Item', completed: false }],
      });
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: taskMock }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['get_task_checklist']({ taskId: 'task-1' });

      expect(result.content[0].text).toContain('Task:');
    });
  });

  describe('social handlers', () => {
    it('get_groups handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['get_groups']({ type: 'party' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('get_party handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: { id: 'party-1', name: 'My Party' } }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['get_party']({});

      expect(result.content[0].text).toContain('My Party');
    });
  });

  describe('utility handlers', () => {
    it('toggle_sleep handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['toggle_sleep']({});

      expect(result.content[0].text).toContain('resting');
    });

    it('revive handler works', async () => {
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: {} }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['revive']({});

      expect(result.content[0].text).toContain('Successfully revived');
    });

    it('allocate_stat handler works', async () => {
      const stats = { ...createUserMock().stats, str: 6 };
      mockFetch.mockImplementationOnce(async () =>
        new Response(JSON.stringify({ success: true, data: stats }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );

      const result = await toolRegistry['allocate_stat']({ stat: 'str' });

      expect(result.content[0].text).toContain('str');
    });
  });
});
