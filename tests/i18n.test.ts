import { describe, it, expect, beforeEach } from 'bun:test';
import { setLanguage, getLanguage, t } from '../src/i18n.ts';

describe('i18n helper', () => {
  beforeEach(() => {
    setLanguage('en');
  });

  it('returns English text when language is set to English', () => {
    setLanguage('en');
    expect(t('Hello', '你好')).toBe('Hello');
  });

  it('returns Chinese text when language starts with zh', () => {
    setLanguage('zh_CN');
    expect(t('Hello', '你好')).toBe('你好');
  });

  it('returns English text for any non-Chinese language', () => {
    setLanguage('fr');
    expect(t('Hello', '你好')).toBe('Hello');
  });

  it('returns the current language after setting it', () => {
    setLanguage('zh_TW');
    expect(getLanguage()).toBe('zh_tw');
  });

  it('defaults to English when given an empty string', () => {
    setLanguage('');
    expect(t('Hello', '你好')).toBe('Hello');
  });
});
