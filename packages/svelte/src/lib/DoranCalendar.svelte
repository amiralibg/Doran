<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { getDoranDefaults } from './provider';
  import type { DoranDate } from '@doranjs/core';

  /** `bind:value` — the selected date, a `DoranDate` (or `null`). */
  export let value: DoranDate | null = null;

  let el: (HTMLElement & { value: DoranDate | null }) | undefined;
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

  function onChange(e: Event) {
    value = (e as CustomEvent<{ date: DoranDate }>).detail?.date ?? null;
    dispatch('change', { value, gregorian: value ? value.toGregorian() : null });
  }
</script>

<doran-calendar bind:this={el} on:change={onChange} {...attrs}></doran-calendar>
