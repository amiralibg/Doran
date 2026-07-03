import { derived, writable } from 'svelte/store';
import { dirFor, type Lang, STRINGS } from './strings';

/** Current example-app language and light/dark mode (app-wide singletons). */
export const lang = writable<Lang>('fa');
export const mode = writable<'light' | 'dark'>('light');

/** `$t('key')` looks up a localized string, reactive to the language. */
export const t = derived(lang, ($lang) => (key: string) => STRINGS[$lang][key] ?? key);

// Direction follows the language; theme drives the calendar's own tokens. Keep
// `<html>` in sync so RTL/LTR and light/dark apply globally.
if (typeof document !== 'undefined') {
  lang.subscribe(($lang) => {
    document.documentElement.setAttribute('dir', dirFor($lang));
    document.documentElement.setAttribute('lang', $lang);
  });
  mode.subscribe(($mode) => document.documentElement.setAttribute('data-doran-theme', $mode));
}

export function toggleMode(): void {
  mode.update(($m) => ($m === 'light' ? 'dark' : 'light'));
}

export function toggleLang(): void {
  lang.update(($l) => ($l === 'fa' ? 'en' : 'fa'));
}
