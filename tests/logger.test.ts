import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { logger } from '../src/logger.js';

describe('Logger', () => {
  const originalEnv = process.env.LOG_LEVEL;
  let consoleOutput: string[] = [];

  const mockConsoleError = mock((...args: unknown[]) => {
    consoleOutput.push(args.join(' '));
  });

  beforeEach(() => {
    consoleOutput = [];
    global.console.error = mockConsoleError as typeof console.error;
    delete process.env.LOG_LEVEL;
  });

  afterEach(() => {
    process.env.LOG_LEVEL = originalEnv;
    mockConsoleError.mockClear();
  });

  describe('log levels', () => {
    it('logs info by default (LOG_LEVEL not set)', () => {
      logger.info('Test info message');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('[INFO]');
      expect(consoleOutput[0]).toContain('Test info message');
    });

    it('logs info when LOG_LEVEL is info', () => {
      process.env.LOG_LEVEL = 'info';
      logger.info('Test info message');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('[INFO]');
    });

    it('logs debug when LOG_LEVEL is debug', () => {
      process.env.LOG_LEVEL = 'debug';
      logger.debug('Test debug message');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('[DEBUG]');
      expect(consoleOutput[0]).toContain('Test debug message');
    });

    it('does not log debug when LOG_LEVEL is info', () => {
      process.env.LOG_LEVEL = 'info';
      logger.debug('Test debug message');
      expect(consoleOutput.length).toBe(0);
    });

    it('logs warn when LOG_LEVEL is warn', () => {
      process.env.LOG_LEVEL = 'warn';
      logger.warn('Test warning');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('[WARN]');
      expect(consoleOutput[0]).toContain('Test warning');
    });

    it('does not log info when LOG_LEVEL is warn', () => {
      process.env.LOG_LEVEL = 'warn';
      logger.info('Test info');
      expect(consoleOutput.length).toBe(0);
    });

    it('logs error when LOG_LEVEL is error', () => {
      process.env.LOG_LEVEL = 'error';
      logger.error('Test error');
      expect(consoleOutput.length).toBe(1);
      expect(consoleOutput[0]).toContain('[ERROR]');
      expect(consoleOutput[0]).toContain('Test error');
    });

    it('does not log warn when LOG_LEVEL is error', () => {
      process.env.LOG_LEVEL = 'error';
      logger.warn('Test warning');
      expect(consoleOutput.length).toBe(0);
    });
  });

  describe('log format', () => {
    it('includes timestamp in ISO format', () => {
      logger.info('Test message');
      expect(consoleOutput[0]).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('includes log level in uppercase', () => {
      logger.info('Test message');
      expect(consoleOutput[0]).toContain('[INFO]');
    });
  });

  describe('metadata', () => {
    it('includes metadata as JSON when provided', () => {
      logger.info('Test message', { key: 'value', number: 123 });
      expect(consoleOutput[0]).toContain('"key":"value"');
      expect(consoleOutput[0]).toContain('"number":123');
    });

    it('does not include metadata when not provided', () => {
      logger.info('Test message');
      expect(consoleOutput[0]).not.toContain('{');
    });

    it('handles empty metadata object', () => {
      logger.info('Test message', {});
      expect(consoleOutput[0]).toContain('{}');
    });
  });
});
