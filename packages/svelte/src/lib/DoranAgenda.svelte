<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { DoranDate } from '@doranjs/core';

  const dispatch = createEventDispatcher<{ selectday: DoranDate }>();

  onMount(() => {
    import('@doranjs/wc');
  });

  function onSelectday(e: Event) {
    dispatch('selectday', (e as CustomEvent<{ date: DoranDate }>).detail.date);
  }
</script>

<doran-agenda on:selectday={onSelectday} {...$$restProps}></doran-agenda>
