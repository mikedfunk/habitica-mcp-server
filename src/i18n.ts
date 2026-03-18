const DEFAULT_LANGUAGE = 'en';
let currentLanguage = DEFAULT_LANGUAGE;

export function setLanguage(language: string): void {
  currentLanguage = (language ?? '').toLowerCase();
}

export function getLanguage(): string {
  return currentLanguage;
}

export function t(english: string, chinese: string): string {
  return currentLanguage.startsWith('zh') ? chinese : english;
}
