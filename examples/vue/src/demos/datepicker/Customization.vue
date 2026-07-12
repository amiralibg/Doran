<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/vue';
import { shallowRef } from 'vue';

const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(DoranDate.now());
</script>

<template>
  <DoranDatePicker
    v-model="value"
    :locale="lang"
    footer-actions="today,clear"
    icon-position="right"
    text-align="left"
    input-width="18rem"
    dropdown-width="trigger"
  />
</template>
