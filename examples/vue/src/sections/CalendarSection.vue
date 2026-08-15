<script setup lang="ts">
import { useApp } from '../i18n/context';
import DemoCard from '../demo/DemoCard.vue';
import Section from '../demo/Section.vue';
import Default from '../demos/calendar/Default.vue';
import DefaultSrc from '../demos/calendar/Default.vue?raw';
import SeparateHeader from '../demos/calendar/SeparateHeader.vue';
import SeparateHeaderSrc from '../demos/calendar/SeparateHeader.vue?raw';
import WithTime from '../demos/calendar/WithTime.vue';
import WithTimeSrc from '../demos/calendar/WithTime.vue?raw';
import Holidays from '../demos/calendar/Holidays.vue';
import HolidaysSrc from '../demos/calendar/Holidays.vue?raw';
import Weekends from '../demos/calendar/Weekends.vue';
import WeekendsSrc from '../demos/calendar/Weekends.vue?raw';
import LocaleDemo from '../demos/calendar/LocaleDemo.vue';
import LocaleDemoSrc from '../demos/calendar/LocaleDemo.vue?raw';
import Widgets from '../demos/calendar/Widgets.vue';
import WidgetsSrc from '../demos/calendar/Widgets.vue?raw';
import Headless from '../demos/calendar/Headless.vue';
import HeadlessSrc from '../demos/calendar/Headless.vue?raw';

const app = useApp();
</script>

<template>
  <Section id="calendar" title="<DoranCalendar>" :intro="app.t('calIntro')">
    <DemoCard
      :title="app.t('calDefaultTitle')"
      :description="app.t('calDefaultDesc')"
      :code="DefaultSrc"
    >
      <Default :lang="app.lang()" />
    </DemoCard>
    <DemoCard
      :title="app.t('wgEventsTitle')"
      :description="app.t('wgEventsDesc')"
      :code="WidgetsSrc"
    >
      <Widgets :lang="app.lang()" />
    </DemoCard>
    <DemoCard
      :title="app.t('calSeparateTitle')"
      :description="app.t('calSeparateDesc')"
      :code="SeparateHeaderSrc"
    >
      <SeparateHeader :lang="app.lang()" />
    </DemoCard>
    <DemoCard
      :title="app.t('calTimeTitle')"
      :description="app.t('calTimeDesc')"
      :code="WithTimeSrc"
    >
      <WithTime :lang="app.lang()" />
    </DemoCard>
    <DemoCard
      :title="app.t('calHolidaysTitle')"
      :description="app.t('calHolidaysDesc')"
      :code="HolidaysSrc"
    >
      <Holidays :lang="app.lang()" />
    </DemoCard>
    <DemoCard
      :title="app.t('calWeekendsTitle')"
      :description="app.t('calWeekendsDesc')"
      :code="WeekendsSrc"
    >
      <Weekends :lang="app.lang()" />
    </DemoCard>
    <DemoCard
      :title="app.t('calLocaleTitle')"
      :description="app.t('calLocaleDesc')"
      :code="LocaleDemoSrc"
    >
      <LocaleDemo />
    </DemoCard>
    <DemoCard
      :title="app.t('calHeadlessTitle')"
      :description="app.t('calHeadlessDesc')"
      :code="HeadlessSrc"
    >
      <Headless :lang="app.lang()" />
    </DemoCard>
  </Section>
</template>
