<script setup lang="ts">
import { useApp } from '../i18n/context';
import DemoCard from '../demo/DemoCard.vue';
import Section from '../demo/Section.vue';
import Default from '../demos/rangepicker/Default.vue';
import DefaultSrc from '../demos/rangepicker/Default.vue?raw';
import Presets from '../demos/rangepicker/Presets.vue';
import PresetsSrc from '../demos/rangepicker/Presets.vue?raw';
import MultiMonth from '../demos/rangepicker/MultiMonth.vue';
import MultiMonthSrc from '../demos/rangepicker/MultiMonth.vue?raw';
import Holidays from '../demos/rangepicker/Holidays.vue';
import HolidaysSrc from '../demos/rangepicker/Holidays.vue?raw';

const app = useApp();
</script>

<template>
  <Section id="rangepicker" title="<DoranRangePicker>" :intro="app.t('rpIntro')">
    <DemoCard :title="app.t('rpDefaultTitle')" :description="app.t('rpDefaultDesc')" :code="DefaultSrc">
      <Default :lang="app.lang()" />
    </DemoCard>
    <DemoCard :title="app.t('rpPresetsTitle')" :description="app.t('rpPresetsDesc')" :code="PresetsSrc" wide>
      <Presets :lang="app.lang()" />
    </DemoCard>
    <DemoCard :title="app.t('rpMultiTitle')" :description="app.t('rpMultiDesc')" :code="MultiMonthSrc" wide>
      <MultiMonth :lang="app.lang()" />
    </DemoCard>
    <DemoCard :title="app.t('rpHolidaysTitle')" :description="app.t('rpHolidaysDesc')" :code="HolidaysSrc">
      <Holidays :lang="app.lang()" />
    </DemoCard>
  </Section>
</template>
