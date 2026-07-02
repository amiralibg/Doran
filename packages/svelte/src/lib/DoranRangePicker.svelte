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

  /** `bind:value` — `{ start, end }` of `DoranDate`. */
  export let value: DoranDateRange = { start: null, end: null };

  let el: (HTMLElement & { value: DoranDateRange }) | undefined;
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

<doran-rangepicker bind:this={el} on:change={onChange} {...attrs}></doran-rangepicker>
