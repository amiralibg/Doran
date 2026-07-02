<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { getDoranDefaults } from './provider';

  /** `bind:value` — the raw text the user typed. */
  export let value = '';

  let el: (HTMLElement & { value: string }) | undefined;
  let ready = false;
  const dispatch = createEventDispatcher<{ resolve: unknown; change: unknown }>();
  const defaults = getDoranDefaults();
  $: attrs = defaults.locale != null ? { locale: defaults.locale, ...$$restProps } : $$restProps;

  onMount(async () => {
    await import('@doranjs/wc');
    ready = true;
    if (el) el.value = value;
  });

  $: if (el && ready) el.value = value;

  function onInput(e: Event) {
    value = (e as CustomEvent<{ value: string }>).detail?.value ?? '';
  }
  function onResolve(e: Event) {
    dispatch('resolve', (e as CustomEvent<{ result: unknown }>).detail?.result);
  }
  function onChange(e: Event) {
    dispatch('change', (e as CustomEvent<{ result: unknown }>).detail?.result);
  }
</script>

<doran-nlp-input
  bind:this={el}
  on:input={onInput}
  on:resolve={onResolve}
  on:change={onChange}
  {...attrs}
></doran-nlp-input>
