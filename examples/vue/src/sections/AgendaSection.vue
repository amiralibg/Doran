<script setup lang="ts">
import { useApp } from '../i18n/context';
import DemoCard from '../demo/DemoCard.vue';
import Section from '../demo/Section.vue';
import Default from '../demos/agenda/Default.vue';
import DefaultSrc from '../demos/agenda/Default.vue?raw';
import Days from '../demos/agenda/Days.vue';
import DaysSrc from '../demos/agenda/Days.vue?raw';
import CustomRender from '../demos/agenda/CustomRender.vue';
import CustomRenderSrc from '../demos/agenda/CustomRender.vue?raw';

const app = useApp();
</script>

<template>
  <Section id="agenda" title="<DoranAgenda>" :intro="app.t('agIntro')">
    <DemoCard :title="app.t('agDefaultTitle')" :description="app.t('agDefaultDesc')" :code="DefaultSrc" wide>
      <Default :lang="app.lang()" />
    </DemoCard>
    <DemoCard :title="app.t('agDaysTitle')" :description="app.t('agDaysDesc')" :code="DaysSrc">
      <Days :lang="app.lang()" />
    </DemoCard>
    <DemoCard :title="app.t('agRenderTitle')" :description="app.t('agRenderDesc')" :code="CustomRenderSrc">
      <CustomRender :lang="app.lang()" />
    </DemoCard>
  </Section>
</template>
