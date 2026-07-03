<script lang="ts">
  import { lang, t } from '../i18n/store';
  import DemoCard from '../demo/DemoCard.svelte';
  import Section from '../demo/Section.svelte';
  import Default from '../demos/nlpinput/Default.svelte';
  import DefaultSrc from '../demos/nlpinput/Default.svelte?raw';
  import Resolve from '../demos/nlpinput/Resolve.svelte';
  import ResolveSrc from '../demos/nlpinput/Resolve.svelte?raw';
</script>

<Section id="nlp-input" title="<DoranNlpInput>" intro={$t('nlpIntro')}>
  <DemoCard title={$t('nlpDefaultTitle')} description={$t('nlpDefaultDesc')} code={DefaultSrc}>
    <Default lang={$lang} />
  </DemoCard>
  <DemoCard title={$t('nlpResolveTitle')} description={$t('nlpResolveDesc')} code={ResolveSrc}>
    <Resolve lang={$lang} />
  </DemoCard>
</Section>
