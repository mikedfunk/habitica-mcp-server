import { describe, expect, it } from 'bun:test';
import {
  HabiticaApiError,
  isHabiticaApiError,
  isValidationError,
  ValidationError,
} from '../src/errors.js';

describe('Error Type Guards', () => {
  describe('isHabiticaApiError', () => {
    it('returns true for HabiticaApiError instances', () => {
      const error = new HabiticaApiError('Test error', 404, '/test', { message: 'test' });
      expect(isHabiticaApiError(error)).toBe(true);
    });

    it('returns false for regular Error instances', () => {
      const error = new Error('Test error');
      expect(isHabiticaApiError(error)).toBe(false);
    });

    it('returns false for ValidationError instances', () => {
      const error = new ValidationError('Test error', 'field');
      expect(isHabiticaApiError(error)).toBe(false);
    });

    it('returns false for plain objects', () => {
      const error = { message: 'Test error' };
      expect(isHabiticaApiError(error)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isHabiticaApiError(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isHabiticaApiError(undefined)).toBe(false);
    });

    it('returns false for strings', () => {
      expect(isHabiticaApiError('error')).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('returns true for ValidationError instances', () => {
      const error = new ValidationError('Test error', 'field');
      expect(isValidationError(error)).toBe(true);
    });

    it('returns true for ValidationError without field', () => {
      const error = new ValidationError('Test error');
      expect(isValidationError(error)).toBe(true);
    });

    it('returns false for regular Error instances', () => {
      const error = new Error('Test error');
      expect(isValidationError(error)).toBe(false);
    });

    it('returns false for HabiticaApiError instances', () => {
      const error = new HabiticaApiError('Test error', 404, '/test', {});
      expect(isValidationError(error)).toBe(false);
    });

    it('returns false for plain objects', () => {
      const error = { message: 'Test error', field: 'test' };
      expect(isValidationError(error)).toBe(false);
    });

    it('returns false for null', () => {
      expect(isValidationError(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidationError(undefined)).toBe(false);
    });
  });
});
