<script setup lang="ts">
// Groups all demos for one component under a titled, anchorable section.
defineProps<{ id: string; title: string; intro?: string }>();
</script>

<template>
  <section :id="id" class="section">
    <header class="section__head">
      <h2 class="section__title">{{ title }}</h2>
      <p v-if="intro" class="section__intro">{{ intro }}</p>
    </header>
    <div class="section__grid">
      <slot />
    </div>
  </section>
</template>
