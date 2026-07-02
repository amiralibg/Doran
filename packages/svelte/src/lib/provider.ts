import { getContext, setContext } from 'svelte';

/** Subtree defaults supplied by `DoranProvider`. */
export interface DoranDefaults {
  /** Locale attribute for the underlying elements (`'fa'` | `'en'`). */
  locale?: string;
  /** IANA time zone for `now()`-derived defaults (read via `getDoranDefaults`). */
  timeZone?: string;
}

const KEY = Symbol('doran.defaults');

/** Set Doran defaults for the current component subtree (call during init). */
export function setDoranDefaults(defaults: DoranDefaults): void {
  setContext(KEY, defaults);
}

/** Read the current `DoranDefaults` (empty object outside a provider). */
export function getDoranDefaults(): DoranDefaults {
  return getContext<DoranDefaults>(KEY) ?? {};
}
