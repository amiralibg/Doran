<script setup lang="ts">
import { ref, useId } from 'vue';
import { useApp } from '../i18n/context';
import CodePanel from './CodePanel.vue';

// A single demo: the live component on top, plus a one-click "show code" panel
// revealing the exact source (imported via `?raw`) that produced it.
defineProps<{ title: string; description?: string; code: string; wide?: boolean }>();
const app = useApp();
const showCode = ref(false);
const panelId = useId();
</script>

<template>
  <div :class="wide ? 'demo demo--wide' : 'demo'">
    <div class="demo__head">
      <div>
        <h3 class="demo__title">{{ title }}</h3>
        <p v-if="description" class="demo__desc">{{ description }}</p>
      </div>
      <button
        type="button"
        class="demo__toggle"
        :aria-expanded="showCode"
        :aria-controls="panelId"
        @click="showCode = !showCode"
      >
        {{ showCode ? app.t('hideCode') : `‹ › ${app.t('showCode')}` }}
      </button>
    </div>

    <div class="demo__preview">
      <slot />
    </div>

    <div v-if="showCode" :id="panelId">
      <CodePanel :code="code" />
    </div>
  </div>
</template>
