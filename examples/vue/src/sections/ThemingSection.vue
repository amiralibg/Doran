<script setup lang="ts">
import { useApp } from '../i18n/context';
import DemoCard from '../demo/DemoCard.vue';
import Section from '../demo/Section.vue';
import Tokens from '../demos/theming/Tokens.vue';
import TokensSrc from '../demos/theming/Tokens.vue?raw';

const app = useApp();
</script>

<template>
  <Section id="theming" :title="app.t('navTheming')" :intro="app.t('thIntro')">
    <DemoCard :title="app.t('thTokensTitle')" :description="app.t('thTokensDesc')" :code="TokensSrc">
      <Tokens :lang="app.lang()" />
    </DemoCard>
  </Section>
</template>
