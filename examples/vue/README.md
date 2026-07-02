# Doran + Vue 3 example

Minimal Vue 3 + Vite app using [`@doranjs/vue`](../../packages/vue).

```bash
pnpm create vite doran-vue --template vue-ts
pnpm add @doranjs/vue @doranjs/core vue
```

`src/main.ts`:

```ts
import { createApp } from 'vue';
import App from './App.vue';
import '@doranjs/wc/styles.css';

createApp(App).mount('#app');
```

`src/App.vue`:

```vue
<script setup lang="ts">
import { shallowRef } from 'vue';
import { DoranDatePicker, DoranRangePicker } from '@doranjs/vue';
import type { DoranDate } from '@doranjs/core';
import type { DoranDateRange } from '@doranjs/vue';

const date = shallowRef<DoranDate | null>(null);
const range = shallowRef<DoranDateRange>({ start: null, end: null });
</script>

<template>
  <main dir="rtl">
    <h1>دوران × Vue</h1>

    <DoranDatePicker v-model="date" />
    <p v-if="date">{{ date.format('dddd D MMMM YYYY') }} — {{ date.toISOString() }}</p>

    <DoranRangePicker v-model="range" @change="(_doran, gregorian) => console.log(gregorian)" />
  </main>
</template>
```

Run it with `pnpm dev`.
