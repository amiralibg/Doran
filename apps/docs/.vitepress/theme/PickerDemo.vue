<script setup>
import { onMounted, ref } from 'vue';

const selected = ref('');

onMounted(async () => {
  // @doranjs/wc auto-registers the custom elements on import (SSR-guarded).
  await import('@doranjs/wc');
  await import('@doranjs/wc/styles.css');
});

function onChange(e) {
  const date = e.detail?.date;
  selected.value = date ? `${date.format('YYYY/MM/DD')}  ·  ${date.toISOString()}` : '';
}
</script>

<template>
  <ClientOnly>
    <div class="doran-picker-demo" dir="rtl">
      <doran-datepicker @change="onChange" />
      <p v-if="selected" class="dp-picked" dir="ltr">{{ selected }}</p>
    </div>
  </ClientOnly>
</template>

<style scoped>
.doran-picker-demo {
  margin: 16px 0;
}
.dp-picked {
  margin-top: 12px;
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>
