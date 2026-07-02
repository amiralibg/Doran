<script setup lang="ts">
import { useApp } from '../i18n/context';
import DemoCard from '../demo/DemoCard.vue';
import Section from '../demo/Section.vue';
import Default from '../demos/nlpinput/Default.vue';
import DefaultSrc from '../demos/nlpinput/Default.vue?raw';
import Resolve from '../demos/nlpinput/Resolve.vue';
import ResolveSrc from '../demos/nlpinput/Resolve.vue?raw';

const app = useApp();
</script>

<template>
  <Section id="nlp-input" title="<DoranNlpInput>" :intro="app.t('nlpIntro')">
    <DemoCard :title="app.t('nlpDefaultTitle')" :description="app.t('nlpDefaultDesc')" :code="DefaultSrc">
      <Default :lang="app.lang()" />
    </DemoCard>
    <DemoCard :title="app.t('nlpResolveTitle')" :description="app.t('nlpResolveDesc')" :code="ResolveSrc">
      <Resolve :lang="app.lang()" />
    </DemoCard>
  </Section>
</template>
