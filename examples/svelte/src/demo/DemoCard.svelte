<script lang="ts">
  import { t } from '../i18n/store';
  import CodePanel from './CodePanel.svelte';

  // A single demo: the live component on top, plus a one-click "show code" panel
  // revealing the exact source (imported via `?raw`) that produced it.
  export let title: string;
  export let description: string | undefined = undefined;
  export let code: string;
  export let wide = false;

  let showCode = false;
  const panelId = `demo-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class={wide ? 'demo demo--wide' : 'demo'}>
  <div class="demo__head">
    <div>
      <h3 class="demo__title">{title}</h3>
      {#if description}<p class="demo__desc">{description}</p>{/if}
    </div>
    <button
      type="button"
      class="demo__toggle"
      aria-expanded={showCode}
      aria-controls={panelId}
      on:click={() => (showCode = !showCode)}
    >
      {showCode ? $t('hideCode') : `‹ › ${$t('showCode')}`}
    </button>
  </div>

  <div class="demo__preview">
    <slot />
  </div>

  {#if showCode}
    <div id={panelId}>
      <CodePanel {code} />
    </div>
  {/if}
</div>
