<script lang="ts" context="module">
  import type { DoranDate } from '@doranjs/core';

  export interface DoranDateRange {
    start: DoranDate | null;
    end: DoranDate | null;
  }
  export interface GregorianDateRange {
    start: Date | null;
    end: Date | null;
  }
</script>

<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { getDoranDefaults } from './provider';

  import type { DayDataMap } from '@doranjs/core';

  /** `bind:value` — `{ start, end }` of `DoranDate`. */
  export let value: DoranDateRange = { start: null, end: null };
  /** Per-day annotations keyed by Jalali `YYYY-M-D` — a nightly rate, availability. */
  export let dayData: DayDataMap | null = null;
  /** Blocks individual days — dates already booked, for instance. */
  export let disabledDates: ((day: DoranDate) => boolean) | null = null;

  type RangeElement = HTMLElement & {
    value: DoranDateRange;
    dayData: DayDataMap | null;
    disabledDates: ((day: DoranDate) => boolean) | null;
  };

  let el: RangeElement | undefined;
  let ready = false;
  const dispatch = createEventDispatcher<{
    change: { value: DoranDateRange; gregorian: GregorianDateRange };
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
    value = (e as CustomEvent<DoranDateRange>).detail ?? { start: null, end: null };
    dispatch('change', {
      value,
      gregorian: {
        start: value.start ? value.start.toGregorian() : null,
        end: value.end ? value.end.toGregorian() : null,
      },
    });
  }
</script>

<!--
  Svelte claims `slot="…"` on a component's children for its own slots, so the
  element's light-DOM slots are re-created here and filled from the Svelte ones.
-->
<doran-rangepicker bind:this={el} on:change={onChange} {...attrs}>
  {#if $$slots.legend}
    <div slot="legend"><slot name="legend" /></div>
  {/if}
  {#if $$slots.aside}
    <div slot="aside"><slot name="aside" /></div>
  {/if}
  {#if $$slots.footer}
    <div slot="footer"><slot name="footer" /></div>
  {/if}
</doran-rangepicker>
