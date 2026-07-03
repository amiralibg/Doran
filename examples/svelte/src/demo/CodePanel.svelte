<script lang="ts">
  import { mode, t } from '../i18n/store';
  import { CODE_THEMES, getHighlighter } from './highlighter';

  export let code: string;
  export let lang = 'svelte';

  let html = '';
  let copied = false;

  // Re-highlight whenever the code or the light/dark mode changes. The code is
  // always LTR regardless of page direction.
  $: void highlight(code, lang, $mode);
  async function highlight(src: string, grammar: string, m: 'light' | 'dark') {
    try {
      const hl = await getHighlighter();
      html = hl.codeToHtml(src.trimEnd(), {
        lang: grammar,
        theme: m === 'dark' ? CODE_THEMES.dark : CODE_THEMES.light,
      });
    } catch {
      html = '';
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => (copied = false), 1500);
  }
</script>

<div class="code-panel" dir="ltr">
  <div class="code-panel__bar">
    <span class="code-panel__lang">{lang}</span>
    <button type="button" class="code-panel__copy" on:click={copy}>
      {copied ? $t('copied') : $t('copy')}
    </button>
  </div>
  {#if html}
    <!-- Shiki output is generated from our own trusted source strings. -->
    <div class="code-panel__shiki">{@html html}</div>
  {:else}
    <pre class="code-panel__pre"><code>{code.trimEnd()}</code></pre>
  {/if}
</div>
