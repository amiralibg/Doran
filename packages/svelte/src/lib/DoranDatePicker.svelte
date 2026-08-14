<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { getDoranDefaults } from './provider';
  import type { DayDataMap, DoranDate } from '@doranjs/core';

  /** `bind:value` — the selected date, a `DoranDate` (or `null`). */
  export let value: DoranDate | null = null;
  /** Per-day annotations keyed by Jalali `YYYY-M-D`, forwarded to the pop-over calendar. */
  export let dayData: DayDataMap | null = null;
  /** Blocks individual days beyond `min`/`max`. */
  export let disabledDates: ((day: DoranDate) => boolean) | null = null;

  type PickerElement = HTMLElement & {
    value: DoranDate | null;
    dayData: DayDataMap | null;
    disabledDates: ((day: DoranDate) => boolean) | null;
  };

  let el: PickerElement | undefined;
  let ready = false;
  const dispatch = createEventDispatcher<{
    change: { value: DoranDate | null; gregorian: Date | null };
  }>();
  const defaults = getDoranDefaults();
  $: attrs = defaults.locale != null ? { locale: defaults.locale, ...$$restProps } : $$restProps;

  onMount(async () => {
    // @doranjs/wc auto-registers the custom elements (SSR-guarded).
    await import('@doranjs/wc');
    ready = true;
    if (el) el.value = value;
  });

  // Push the props into the element once it's upgraded. Objects and functions have
  // to be properties — they can't travel as attributes.
  $: if (el && ready) el.value = value;
  $: if (el && ready) el.dayData = dayData;
  $: if (el && ready) el.disabledDates = disabledDates;

  function onChange(e: Event) {
    value = (e as CustomEvent<{ date: DoranDate | null }>).detail?.date ?? null;
    dispatch('change', { value, gregorian: value ? value.toGregorian() : null });
  }
</script>

<!-- Children (e.g. a custom `slot="icon"` node) pass through to the element. -->
<doran-datepicker bind:this={el} on:change={onChange} {...attrs}><slot /></doran-datepicker>
