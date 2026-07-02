import { defineComponent, inject, type InjectionKey, provide } from 'vue';

/** Subtree defaults supplied by {@link DoranProvider}. */
export interface DoranDefaults {
  /** Locale attribute for the underlying elements (`'fa'` | `'en'`). */
  locale?: string;
  /** IANA time zone for `now()`-derived defaults (available via {@link injectDoranDefaults}). */
  timeZone?: string;
}

export const DoranDefaultsKey: InjectionKey<DoranDefaults> = Symbol('doran.defaults');

/**
 * Provides Doran defaults to its subtree. Request-scoped (via Vue's `provide`), so
 * it's SSR-safe: the same `locale`/`timeZone` render on server and client, avoiding
 * digit hydration mismatches. Components read `explicit attr → provider`.
 */
export const DoranProvider = defineComponent({
  name: 'DoranProvider',
  props: {
    locale: { type: String, default: undefined },
    timeZone: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    provide(DoranDefaultsKey, {
      get locale() {
        return props.locale;
      },
      get timeZone() {
        return props.timeZone;
      },
    });
    return () => slots.default?.();
  },
});

/** Read the current {@link DoranDefaults} (empty object outside a provider). */
export function injectDoranDefaults(): DoranDefaults {
  return inject(DoranDefaultsKey, {});
}
