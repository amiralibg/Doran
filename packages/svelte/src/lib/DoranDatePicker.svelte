<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { DoranDate } from '@doranjs/core';

  /** `bind:value` — the selected date, a `DoranDate` (or `null`). */
  export let value: DoranDate | null = null;

  let el: (HTMLElement & { value: DoranDate | null }) | undefined;
  let ready = false;
  const dispatch = createEventDispatcher<{
    change: { value: DoranDate | null; gregorian: Date | null };
  }>();

  onMount(async () => {
    // @doranjs/wc auto-registers the custom elements (SSR-guarded).
    await import('@doranjs/wc');
    ready = true;
    if (el) el.value = value;
  });

  // Push the prop into the element once it's upgraded.
  $: if (el && ready) el.value = value;

  function onChange(e: Event) {
    value = (e as CustomEvent<{ date: DoranDate | null }>).detail?.date ?? null;
    dispatch('change', { value, gregorian: value ? value.toGregorian() : null });
  }
</script>

<doran-datepicker bind:this={el} on:change={onChange} {...$$restProps}></doran-datepicker>
