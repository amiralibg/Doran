<script lang="ts">
  import { lang, t } from '../i18n/store';
  import DemoCard from '../demo/DemoCard.svelte';
  import Section from '../demo/Section.svelte';
  import Default from '../demos/agenda/Default.svelte';
  import DefaultSrc from '../demos/agenda/Default.svelte?raw';
  import Days from '../demos/agenda/Days.svelte';
  import DaysSrc from '../demos/agenda/Days.svelte?raw';
  import CustomRender from '../demos/agenda/CustomRender.svelte';
  import CustomRenderSrc from '../demos/agenda/CustomRender.svelte?raw';
</script>

<Section id="agenda" title="<DoranAgenda>" intro={$t('agIntro')}>
  <DemoCard title={$t('agDefaultTitle')} description={$t('agDefaultDesc')} code={DefaultSrc} wide>
    <Default lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('agDaysTitle')} description={$t('agDaysDesc')} code={DaysSrc}>
    <Days lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('agRenderTitle')} description={$t('agRenderDesc')} code={CustomRenderSrc}>
    <CustomRender lang={$lang} />
  </DemoCard>
</Section>
