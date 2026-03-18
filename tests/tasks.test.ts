import { beforeEach, describe, expect, it, mock } from 'bun:test';

// Mock the fetch function
const mockFetch = mock(async (url: string, options?: RequestInit) => {
  return new Response(JSON.stringify({ success: true, data: [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

global.fetch = mockFetch as typeof fetch;

describe('fetchHabiticaApiResponse', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    process.env['HABITICA_USER_ID'] = 'test-user-id';
    process.env['HABITICA_API_TOKEN'] = 'test-api-token';
  });

  it('sends a GET request to the correct Habitica API endpoint', async () => {
    const { fetchHabiticaApiResponse } = await import('../src/client.ts');
    await fetchHabiticaApiResponse('GET', '/tasks/user');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://habitica.com/api/v3/tasks/user');
  });

  it('includes the x-client header in all requests', async () => {
    const { fetchHabiticaApiResponse } = await import('../src/client.ts');
    await fetchHabiticaApiResponse('GET', '/user');

    const [, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    const headers = calledOptions.headers as Record<string, string>;
    expect(headers['x-client']).toBe('test-user-id-habitica-mcp-server');
  });

  it('sends the request body as JSON for POST requests', async () => {
    const { fetchHabiticaApiResponse } = await import('../src/client.ts');
    const requestBody = { text: 'New task', type: 'todo' };
    await fetchHabiticaApiResponse('POST', '/tasks/user', requestBody);

    const [, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(calledOptions.method).toBe('POST');
    expect(calledOptions.body).toBe(JSON.stringify(requestBody));
  });

  it('throws an error when the Habitica API responds with a failure status', async () => {
    mockFetch.mockImplementationOnce(
      async () =>
        new Response(JSON.stringify({ message: 'Not authorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
    );

    const { fetchHabiticaApiResponse } = await import('../src/client.ts');
    await expect(fetchHabiticaApiResponse('GET', '/user')).rejects.toThrow('Not authorized');
  });
});
