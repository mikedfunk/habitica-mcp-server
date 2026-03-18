import { HabiticaApiError } from './errors.js';
import { logger } from './logger.js';
import type { HabiticaApiResponse } from './types.js';

const HABITICA_API_BASE = 'https://habitica.com/api/v3';

function getUserId(): string {
  return process.env.HABITICA_USER_ID ?? '';
}

function getApiToken(): string {
  return process.env.HABITICA_API_TOKEN ?? '';
}

function buildRequestHeaders(): {
  'x-api-user': string;
  'x-api-key': string;
  'x-client': string;
  'Content-Type': string;
} {
  const userId = getUserId();
  return {
    'x-api-user': userId,
    'x-api-key': getApiToken(),
    'x-client': `${userId}-habitica-mcp-server`,
    'Content-Type': 'application/json',
  };
}

/**
 * @throws {HabiticaApiError} When the API returns an error response
 */
export async function fetchHabiticaApiResponse<T>(
  method: string,
  path: string,
  body?: object | null,
): Promise<HabiticaApiResponse<T>> {
  const url = `${HABITICA_API_BASE}${path}`;
  const fetchOptions: RequestInit = {
    method,
    headers: buildRequestHeaders(),
  };
  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  logger.debug(`API Request: ${method} ${path}`, { body: body ?? null });

  const response = await fetch(url, fetchOptions);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    const errorMessage =
      errorData.message ?? errorData.error ?? `HTTP ${response.status}: ${response.statusText}`;

    logger.error(`API Error: ${method} ${path}`, {
      status: response.status,
      message: errorMessage,
      response: errorData,
    });

    throw new HabiticaApiError(errorMessage, response.status, path, errorData);
  }

  const result = (await response.json()) as HabiticaApiResponse<T>;
  logger.debug(`API Response: ${method} ${path}`, { success: result.success });

  return result;
}
