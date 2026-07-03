<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { getDoranDefaults } from './provider';
  import type { DoranDate } from '@doranjs/core';
  import type { AgendaEvent } from '@doranjs/wc';

  /** First day of the agenda (a `DoranDate`). */
  export let start: DoranDate | null = null;
  /** Events to place on the timeline. */
  export let events: AgendaEvent[] = [];
  /** Optional custom event renderer returning an HTML string. */
  export let renderEvent: ((event: AgendaEvent) => string) | undefined = undefined;

  // `start`/`events`/`renderEvent` are element *properties* (a DoranDate, array,
  // function), not attributes, so they must be assigned after the element upgrades
  // — the same post-upgrade sync as `value` on the other components. `days`/`locale`
  // stay in `$$restProps` as real attributes.
  let el:
    | (HTMLElement & {
        start: DoranDate | null;
        events: AgendaEvent[];
        renderEvent: ((event: AgendaEvent) => string) | null;
      })
    | undefined;
  let ready = false;
  const dispatch = createEventDispatcher<{ selectday: DoranDate }>();
  const defaults = getDoranDefaults();
  $: attrs = defaults.locale != null ? { locale: defaults.locale, ...$$restProps } : $$restProps;

  function sync() {
    if (!el || !ready) return;
    if (start) el.start = start;
    el.events = events;
    el.renderEvent = renderEvent ?? null;
  }

  onMount(async () => {
    await import('@doranjs/wc');
    ready = true;
    sync();
  });

  // Re-sync whenever the props change (referenced so the reactive block tracks them).
  $: if (el && ready) {
    void [start, events, renderEvent];
    sync();
  }

  function onSelectday(e: Event) {
    dispatch('selectday', (e as CustomEvent<{ date: DoranDate }>).detail.date);
  }
</script>

<doran-agenda bind:this={el} on:selectday={onSelectday} {...attrs}></doran-agenda>
