import type { HabiticaApiResponse } from './types.js';

const HABITICA_API_BASE = 'https://habitica.com/api/v3';

const userId = process.env['HABITICA_USER_ID'] ?? '';
const apiToken = process.env['HABITICA_API_TOKEN'] ?? '';

function buildRequestHeaders(): Record<string, string> {
  return {
    'x-api-user': userId,
    'x-api-key': apiToken,
    'x-client': `${userId}-habitica-mcp-server`,
    'Content-Type': 'application/json',
  };
}

export async function fetchHabiticaApiResponse<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<HabiticaApiResponse<T>> {
  const response = await fetch(`${HABITICA_API_BASE}${path}`, {
    method,
    headers: buildRequestHeaders(),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as { message?: string; error?: string };
    throw new Error(errorData.message ?? errorData.error ?? `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<HabiticaApiResponse<T>>;
}
