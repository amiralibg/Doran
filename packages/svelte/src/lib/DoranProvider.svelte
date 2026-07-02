<script lang="ts">
  import { setDoranDefaults } from './provider';

  /** Locale attribute for the subtree (`'fa'` | `'en'`). */
  export let locale: string | undefined = undefined;
  /** IANA time zone for `now()`-derived defaults. */
  export let timeZone: string | undefined = undefined;

  // Request-scoped (Svelte context), so it's SSR-safe: server and client render the
  // same locale, avoiding digit hydration mismatches.
  setDoranDefaults({ locale, timeZone });
</script>

<slot />
