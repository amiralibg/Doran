<script lang="ts">
  import { lang, t } from '../i18n/store';
  import DemoCard from '../demo/DemoCard.svelte';
  import Section from '../demo/Section.svelte';
  import Default from '../demos/datepicker/Default.svelte';
  import DefaultSrc from '../demos/datepicker/Default.svelte?raw';
  import WithTime from '../demos/datepicker/WithTime.svelte';
  import WithTimeSrc from '../demos/datepicker/WithTime.svelte?raw';
  import Format from '../demos/datepicker/Format.svelte';
  import FormatSrc from '../demos/datepicker/Format.svelte?raw';
  import Customization from '../demos/datepicker/Customization.svelte';
  import CustomizationSrc from '../demos/datepicker/Customization.svelte?raw';
</script>

<Section id="datepicker" title="<DoranDatePicker>" intro={$t('dpIntro')}>
  <DemoCard title={$t('dpDefaultTitle')} description={$t('dpDefaultDesc')} code={DefaultSrc}>
    <Default lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('dpTimeTitle')} description={$t('dpTimeDesc')} code={WithTimeSrc}>
    <WithTime lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('dpFormatTitle')} description={$t('dpFormatDesc')} code={FormatSrc}>
    <Format lang={$lang} />
  </DemoCard>
  <DemoCard
    title={$t('dpCustomizationTitle')}
    description={$t('dpCustomizationDesc')}
    code={CustomizationSrc}
  >
    <Customization lang={$lang} />
  </DemoCard>
</Section>
