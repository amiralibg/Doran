<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { getDoranDefaults } from './provider';
  import type { DayDataMap, DoranDate } from '@doranjs/core';

  /** `bind:value` — the selected date, a `DoranDate` (or `null`). */
  export let value: DoranDate | null = null;
  /** Per-day annotations keyed by Jalali `YYYY-M-D` — a fare, a count, a sold-out flag. */
  export let dayData: DayDataMap | null = null;
  /** Blocks individual days beyond `min`/`max`. */
  export let disabledDates: ((day: DoranDate) => boolean) | null = null;

  type CalendarElement = HTMLElement & {
    value: DoranDate | null;
    dayData: DayDataMap | null;
    disabledDates: ((day: DoranDate) => boolean) | null;
  };

  let el: CalendarElement | undefined;
  let ready = false;
  const dispatch = createEventDispatcher<{
    change: { value: DoranDate | null; gregorian: Date | null };
  }>();
  const defaults = getDoranDefaults();
  $: attrs = defaults.locale != null ? { locale: defaults.locale, ...$$restProps } : $$restProps;

  onMount(async () => {
    await import('@doranjs/wc');
    ready = true;
    if (el) el.value = value;
  });

  $: if (el && ready) el.value = value;
  // Objects and functions can't travel as attributes, so assign them as properties
  // once the custom element has upgraded.
  $: if (el && ready) el.dayData = dayData;
  $: if (el && ready) el.disabledDates = disabledDates;

  function onChange(e: Event) {
    value = (e as CustomEvent<{ date: DoranDate }>).detail?.date ?? null;
    dispatch('change', { value, gregorian: value ? value.toGregorian() : null });
  }
</script>

<!--
  Svelte claims `slot="…"` on a component's children for its own slots, so the
  element's light-DOM slots are re-created here and filled from the Svelte ones.
  Authors still write `<DoranCalendar><span slot="legend">…</span></DoranCalendar>`.
-->
<doran-calendar bind:this={el} on:change={onChange} {...attrs}>
  {#if $$slots.legend}
    <div slot="legend"><slot name="legend" /></div>
  {/if}
  {#if $$slots.aside}
    <div slot="aside"><slot name="aside" /></div>
  {/if}
  {#if $$slots.footer}
    <div slot="footer"><slot name="footer" /></div>
  {/if}
</doran-calendar>
