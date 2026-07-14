import { en } from './en';
import { ar } from './ar';
import type { LanguageCode, Translation } from './types';

export type { LanguageCode, Translation } from './types';

export const translations: Record<LanguageCode, Translation> = { en, ar };

export const languageOrder: LanguageCode[] = ['en', 'ar'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'alma-alrouh-lang';

export function isLanguageCode(value: unknown): value is LanguageCode {
  return value === 'en' || value === 'ar';
}
