<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { getDoranDefaults } from './provider';
  import type { DoranDate } from '@doranjs/core';

  const dispatch = createEventDispatcher<{ selectday: DoranDate }>();
  const defaults = getDoranDefaults();
  $: attrs = defaults.locale != null ? { locale: defaults.locale, ...$$restProps } : $$restProps;

  onMount(() => {
    import('@doranjs/wc');
  });

  function onSelectday(e: Event) {
    dispatch('selectday', (e as CustomEvent<{ date: DoranDate }>).detail.date);
  }
</script>

<doran-agenda on:selectday={onSelectday} {...attrs}></doran-agenda>
