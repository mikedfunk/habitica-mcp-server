import type { HabiticaApiResponse } from './types.js';

const HABITICA_API_BASE = 'https://habitica.com/api/v3';

function getUserId(): string {
  return process.env['HABITICA_USER_ID'] ?? '';
}

function getApiToken(): string {
  return process.env['HABITICA_API_TOKEN'] ?? '';
}

function buildRequestHeaders(): Record<string, string> {
  const userId = getUserId();
  return {
    'x-api-user': userId,
    'x-api-key': getApiToken(),
    'x-client': `${userId}-habitica-mcp-server`,
    'Content-Type': 'application/json',
  };
}

export async function fetchHabiticaApiResponse<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<HabiticaApiResponse<T>> {
  const fetchOptions: RequestInit = {
    method,
    headers: buildRequestHeaders(),
  };
  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }
  const response = await fetch(`${HABITICA_API_BASE}${path}`, fetchOptions);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    throw new Error(
      errorData.message ?? errorData.error ?? `HTTP ${response.status}: ${response.statusText}`,
    );
  }

  return response.json() as Promise<HabiticaApiResponse<T>>;
}
