export class HabiticaApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly endpoint: string,
    public readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = 'HabiticaApiError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function isHabiticaApiError(error: unknown): error is HabiticaApiError {
  return error instanceof HabiticaApiError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}
