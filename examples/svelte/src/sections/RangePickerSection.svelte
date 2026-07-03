<script lang="ts">
  import { lang, t } from '../i18n/store';
  import DemoCard from '../demo/DemoCard.svelte';
  import Section from '../demo/Section.svelte';
  import Default from '../demos/rangepicker/Default.svelte';
  import DefaultSrc from '../demos/rangepicker/Default.svelte?raw';
  import Presets from '../demos/rangepicker/Presets.svelte';
  import PresetsSrc from '../demos/rangepicker/Presets.svelte?raw';
  import MultiMonth from '../demos/rangepicker/MultiMonth.svelte';
  import MultiMonthSrc from '../demos/rangepicker/MultiMonth.svelte?raw';
  import Holidays from '../demos/rangepicker/Holidays.svelte';
  import HolidaysSrc from '../demos/rangepicker/Holidays.svelte?raw';
</script>

<Section id="rangepicker" title="<DoranRangePicker>" intro={$t('rpIntro')}>
  <DemoCard title={$t('rpDefaultTitle')} description={$t('rpDefaultDesc')} code={DefaultSrc}>
    <Default lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('rpPresetsTitle')} description={$t('rpPresetsDesc')} code={PresetsSrc} wide>
    <Presets lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('rpMultiTitle')} description={$t('rpMultiDesc')} code={MultiMonthSrc} wide>
    <MultiMonth lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('rpHolidaysTitle')} description={$t('rpHolidaysDesc')} code={HolidaysSrc}>
    <Holidays lang={$lang} />
  </DemoCard>
</Section>
