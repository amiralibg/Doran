'use client';

import {
  getDefaultLocale,
  resolveDirection,
  resolveLocale,
  type Locale,
  type LocaleLike,
} from '@doranjs/core';
import { createContext, type ReactNode, useContext, useMemo } from 'react';

/** Subtree defaults supplied by {@link DoranProvider}. */
export interface DoranDefaults {
  /** Formatting locale (Persian vs Latin digits, month names). */
  locale?: Locale;
  /** IANA time zone for `now()`-derived defaults (e.g. "today"). */
  timeZone?: string;
}

const DoranContext = createContext<DoranDefaults>({});

export interface DoranProviderProps {
  /** Locale for the subtree — a registered id (`'fa'`, `'en'`) or a `Locale`. */
  locale?: LocaleLike;
  /** IANA time zone (e.g. `'Asia/Tehran'`) for deterministic "today" under SSR. */
  timeZone?: string;
  children: ReactNode;
}

/**
 * Sets Doran defaults for its subtree. Unlike the mutable global
 * `setDefaultLocale()`, this is request-scoped, so it's safe for SSR: the same
 * `locale`/`timeZone` render on the server and the client, avoiding digit/tz
 * hydration mismatches. Components resolve their locale as
 * `prop → provider → global default`.
 */
export function DoranProvider({ locale, timeZone, children }: DoranProviderProps): ReactNode {
  const value = useMemo<DoranDefaults>(
    () => ({
      ...(locale ? { locale: resolveLocale(locale) } : {}),
      ...(timeZone ? { timeZone } : {}),
    }),
    [locale, timeZone],
  );
  return <DoranContext.Provider value={value}>{children}</DoranContext.Provider>;
}

/** Read the current {@link DoranDefaults} (empty object outside a provider). */
export function useDoranContext(): DoranDefaults {
  return useContext(DoranContext);
}

/** Resolve a component's locale: explicit prop → provider → global default. */
export function useResolvedLocale(locale?: Locale): Locale {
  const ctx = useContext(DoranContext);
  return locale ?? ctx.locale ?? getDefaultLocale();
}

/**
 * The writing direction a component should render in: an explicit `dir` prop wins,
 * otherwise the resolved locale decides.
 *
 * Components used to hardcode `dir="rtl"`, so switching to a Latin locale left an
 * RTL widget behind — the symptom `iconPosition` and `textAlign` were added to
 * paper over.
 */
export function useDirection(locale: Locale, dir?: 'rtl' | 'ltr'): 'rtl' | 'ltr' {
  return dir ?? resolveDirection(locale);
}
