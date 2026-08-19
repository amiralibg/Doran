<script setup lang="ts">
import { DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/vue';
import { shallowRef } from 'vue';

const { lang = 'fa' } = defineProps<{ lang?: 'fa' | 'en' }>();
const value = shallowRef<DoranDate | null>(null);
</script>

<template>
  <!-- The trigger becomes a button: the whole field opens the calendar and no
       on-screen keyboard ever appears over it. -->
  <DoranDatePicker
    v-model="value"
    :locale="lang"
    editable="false"
    mode="auto"
    input-width="14rem"
  />
</template>
