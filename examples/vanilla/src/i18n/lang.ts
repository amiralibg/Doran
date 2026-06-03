import { enUS, faIR, type Locale } from '@doranjs/core';
import { type Lang, STRINGS } from './strings';

let current: Lang = 'fa';
const listeners = new Set<() => void>();

/** The current example-app language ('fa' | 'en') — also the WC `locale` attribute. */
export function getLang(): Lang {
  return current;
}

/** The Doran `Locale` object matching a language, for `withLocale(...)` formatting. */
export function localeFor(lang: Lang): Locale {
  return lang === 'fa' ? faIR : enUS;
}

/** Look up a localized string by key. */
export function t(key: string): string {
  return STRINGS[current][key] ?? key;
}

/** Subscribe to language changes; returns an unsubscribe function. */
export function onLangChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Switch language. Direction follows the language (fa → rtl, en → ltr). */
export function setLang(next: Lang): void {
  current = next;
  document.documentElement.setAttribute('lang', next);
  document.documentElement.setAttribute('dir', next === 'fa' ? 'rtl' : 'ltr');
  for (const fn of listeners) fn();
}
