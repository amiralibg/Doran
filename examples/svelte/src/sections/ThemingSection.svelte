<script lang="ts">
  import { lang, t } from '../i18n/store';
  import DemoCard from '../demo/DemoCard.svelte';
  import Section from '../demo/Section.svelte';
  import Tokens from '../demos/theming/Tokens.svelte';
  import TokensSrc from '../demos/theming/Tokens.svelte?raw';
</script>

<Section id="theming" title={$t('navTheming')} intro={$t('thIntro')}>
  <DemoCard title={$t('thTokensTitle')} description={$t('thTokensDesc')} code={TokensSrc}>
    <Tokens lang={$lang} />
  </DemoCard>
</Section>
