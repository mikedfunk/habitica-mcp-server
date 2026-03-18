import { mock } from 'bun:test';

export interface MockResponse {
  success?: boolean;
  data?: unknown;
  message?: string;
  error?: string;
}

export function createMockFetch(defaultResponse: MockResponse = { success: true, data: {} }) {
  const mockFetch = mock(async (url: string, options?: RequestInit) => {
    return new Response(JSON.stringify(defaultResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });

  return mockFetch;
}

export function setupMockEnv() {
  process.env['HABITICA_USER_ID'] = 'test-user-id';
  process.env['HABITICA_API_TOKEN'] = 'test-api-token';
  process.env['MCP_LANG'] = 'en';
}

export function createTaskMock(id: string, text: string, type: string, overrides = {}) {
  return {
    id,
    text,
    type,
    priority: 1,
    notes: '',
    completed: false,
    checklist: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createUserMock(overrides = {}) {
  return {
    id: 'test-user-id',
    stats: {
      hp: 50,
      mp: 100,
      exp: 100,
      gp: 100,
      lvl: 5,
      toNextLevel: 200,
      maxHealth: 50,
      maxMP: 100,
      str: 5,
      int: 5,
      con: 5,
      per: 5,
      class: 'warrior',
      points: 1,
    },
    items: {
      pets: {},
      mounts: {},
      gear: {
        equipped: {},
        costume: {},
        owned: {},
      },
      food: {},
      hatchingPotions: {},
      eggs: {},
      quests: {},
      special: {},
    },
    profile: {
      name: 'Test User',
    },
    auth: {
      local: {
        username: 'testuser',
      },
    },
    ...overrides,
  };
}
