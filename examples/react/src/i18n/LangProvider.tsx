import { type Locale } from '@doranjs/core';
import { createContext, type ReactNode, useContext } from 'react';
import { type Lang, localeFor, STRINGS } from './strings';

interface LangContextValue {
  /** Current example-app language. */
  lang: Lang;
  /** Look up a localized string/node by key. */
  t: (key: string) => ReactNode;
  /** The Doran calendar locale matching `lang` (faIR / enUS). */
  locale: Locale;
  /** Switch language (the toolbar also resets direction to the language default). */
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within a <LangProvider>.');
  return ctx;
}

export function LangProvider({
  lang,
  setLang,
  children,
}: {
  lang: Lang;
  setLang: (lang: Lang) => void;
  children: ReactNode;
}) {
  const value: LangContextValue = {
    lang,
    setLang,
    locale: localeFor(lang),
    t: (key) => STRINGS[lang][key] ?? key,
  };
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
