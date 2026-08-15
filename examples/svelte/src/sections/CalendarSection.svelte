<script lang="ts">
  import { lang, t } from '../i18n/store';
  import DemoCard from '../demo/DemoCard.svelte';
  import Section from '../demo/Section.svelte';
  import Widgets from '../demos/calendar/Widgets.svelte';
  import WidgetsSrc from '../demos/calendar/Widgets.svelte?raw';
  import Default from '../demos/calendar/Default.svelte';
  import DefaultSrc from '../demos/calendar/Default.svelte?raw';
  import SeparateHeader from '../demos/calendar/SeparateHeader.svelte';
  import SeparateHeaderSrc from '../demos/calendar/SeparateHeader.svelte?raw';
  import WithTime from '../demos/calendar/WithTime.svelte';
  import WithTimeSrc from '../demos/calendar/WithTime.svelte?raw';
  import Holidays from '../demos/calendar/Holidays.svelte';
  import HolidaysSrc from '../demos/calendar/Holidays.svelte?raw';
  import Weekends from '../demos/calendar/Weekends.svelte';
  import WeekendsSrc from '../demos/calendar/Weekends.svelte?raw';
  import LocaleDemo from '../demos/calendar/LocaleDemo.svelte';
  import LocaleDemoSrc from '../demos/calendar/LocaleDemo.svelte?raw';
  import Headless from '../demos/calendar/Headless.svelte';
  import HeadlessSrc from '../demos/calendar/Headless.svelte?raw';
</script>

<Section id="calendar" title="<DoranCalendar>" intro={$t('calIntro')}>
  <DemoCard title={$t('wgEventsTitle')} description={$t('wgEventsDesc')} code={WidgetsSrc}>
    <Widgets lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('calDefaultTitle')} description={$t('calDefaultDesc')} code={DefaultSrc}>
    <Default lang={$lang} />
  </DemoCard>
  <DemoCard
    title={$t('calSeparateTitle')}
    description={$t('calSeparateDesc')}
    code={SeparateHeaderSrc}
  >
    <SeparateHeader lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('calTimeTitle')} description={$t('calTimeDesc')} code={WithTimeSrc}>
    <WithTime lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('calHolidaysTitle')} description={$t('calHolidaysDesc')} code={HolidaysSrc}>
    <Holidays lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('calWeekendsTitle')} description={$t('calWeekendsDesc')} code={WeekendsSrc}>
    <Weekends lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('calLocaleTitle')} description={$t('calLocaleDesc')} code={LocaleDemoSrc}>
    <LocaleDemo />
  </DemoCard>
  <DemoCard title={$t('calHeadlessTitle')} description={$t('calHeadlessDesc')} code={HeadlessSrc}>
    <Headless lang={$lang} />
  </DemoCard>
</Section>
