import { LanguageCode, TranslationDictionary } from '../types.ts';
import { en } from './en.ts';
import { hi } from './hi.ts';

export const locales: Record<LanguageCode, TranslationDictionary> = {
  en,
  hi,
};

export { en, hi };
