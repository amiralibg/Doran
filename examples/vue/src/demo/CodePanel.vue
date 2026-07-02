<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { useApp } from '../i18n/context';
import { CODE_THEMES, getHighlighter } from './highlighter';

const props = withDefaults(defineProps<{ code: string; lang?: string }>(), { lang: 'vue' });
const app = useApp();
const html = ref('');
const copied = ref(false);

// Re-highlight whenever the code or the light/dark mode changes. The code is
// always LTR regardless of page direction.
watchEffect(async () => {
  const mode = app.mode();
  try {
    const hl = await getHighlighter();
    html.value = hl.codeToHtml(props.code.trimEnd(), {
      lang: props.lang,
      theme: mode === 'dark' ? CODE_THEMES.dark : CODE_THEMES.light,
    });
  } catch {
    html.value = '';
  }
});

async function copy() {
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}
</script>

<template>
  <div class="code-panel" dir="ltr">
    <div class="code-panel__bar">
      <span class="code-panel__lang">{{ lang }}</span>
      <button type="button" class="code-panel__copy" @click="copy">
        {{ copied ? app.t('copied') : app.t('copy') }}
      </button>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- Shiki output is generated from our own trusted source strings. -->
    <div v-if="html" class="code-panel__shiki" v-html="html" />
    <pre v-else class="code-panel__pre"><code>{{ code.trimEnd() }}</code></pre>
  </div>
</template>
