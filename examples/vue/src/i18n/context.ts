import { type Locale } from '@doranjs/core';
import { inject, type InjectionKey, provide, ref } from 'vue';
import { dirFor, type Lang, localeFor, STRINGS } from './strings';

export interface AppContext {
  lang: () => Lang;
  mode: () => 'light' | 'dark';
  /** The Doran calendar locale matching the current language. */
  locale: () => Locale;
  /** Look up a localized string by key. */
  t: (key: string) => string;
  setLang: (lang: Lang) => void;
  toggleMode: () => void;
}

const APP_KEY: InjectionKey<AppContext> = Symbol('doran-app');

/** Provides app state (language + light/dark) and syncs `<html>` dir/theme. Call once, in App. */
export function provideApp(): AppContext {
  const lang = ref<Lang>('fa');
  const mode = ref<'light' | 'dark'>('light');

  const sync = () => {
    const root = document.documentElement;
    root.setAttribute('dir', dirFor(lang.value));
    root.setAttribute('lang', lang.value === 'fa' ? 'fa' : 'en');
    root.setAttribute('data-doran-theme', mode.value);
  };
  sync();

  const ctx: AppContext = {
    lang: () => lang.value,
    mode: () => mode.value,
    locale: () => localeFor(lang.value),
    t: (key) => STRINGS[lang.value][key] ?? key,
    setLang: (l) => {
      lang.value = l;
      sync();
    },
    toggleMode: () => {
      mode.value = mode.value === 'light' ? 'dark' : 'light';
      sync();
    },
  };
  provide(APP_KEY, ctx);
  return ctx;
}

export function useApp(): AppContext {
  const ctx = inject(APP_KEY);
  if (!ctx) throw new Error('useApp must be used within <App>.');
  return ctx;
}
