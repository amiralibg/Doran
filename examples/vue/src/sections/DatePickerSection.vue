<script setup lang="ts">
import { useApp } from '../i18n/context';
import DemoCard from '../demo/DemoCard.vue';
import Section from '../demo/Section.vue';
import Default from '../demos/datepicker/Default.vue';
import DefaultSrc from '../demos/datepicker/Default.vue?raw';
import WithTime from '../demos/datepicker/WithTime.vue';
import WithTimeSrc from '../demos/datepicker/WithTime.vue?raw';
import Format from '../demos/datepicker/Format.vue';
import FormatSrc from '../demos/datepicker/Format.vue?raw';

const app = useApp();
</script>

<template>
  <Section id="datepicker" title="<DoranDatePicker>" :intro="app.t('dpIntro')">
    <DemoCard :title="app.t('dpDefaultTitle')" :description="app.t('dpDefaultDesc')" :code="DefaultSrc">
      <Default :lang="app.lang()" />
    </DemoCard>
    <DemoCard :title="app.t('dpTimeTitle')" :description="app.t('dpTimeDesc')" :code="WithTimeSrc">
      <WithTime :lang="app.lang()" />
    </DemoCard>
    <DemoCard :title="app.t('dpFormatTitle')" :description="app.t('dpFormatDesc')" :code="FormatSrc">
      <Format :lang="app.lang()" />
    </DemoCard>
  </Section>
</template>
