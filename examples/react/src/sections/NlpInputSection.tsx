import { useLang } from '../i18n/LangProvider';
import { DemoCard } from '../demo/DemoCard';
import { Section } from '../demo/Section';

import Default from '../demos/nlpinput/Default';
import DefaultSrc from '../demos/nlpinput/Default?raw';
import Suggestions from '../demos/nlpinput/Suggestions';
import SuggestionsSrc from '../demos/nlpinput/Suggestions?raw';
import Resolve from '../demos/nlpinput/Resolve';
import ResolveSrc from '../demos/nlpinput/Resolve?raw';

export function NlpInputSection() {
  const { t, locale } = useLang();
  return (
    <Section id="nlp-input" title="<DoranNlpInput>" intro={t('nlpIntro')}>
      <DemoCard title={t('nlpDefaultTitle')} description={t('nlpDefaultDesc')} code={DefaultSrc}>
        <Default locale={locale} />
      </DemoCard>
      <DemoCard
        title={t('nlpSuggestTitle')}
        description={t('nlpSuggestDesc')}
        code={SuggestionsSrc}
      >
        <Suggestions locale={locale} />
      </DemoCard>
      <DemoCard title={t('nlpResolveTitle')} description={t('nlpResolveDesc')} code={ResolveSrc}>
        <Resolve locale={locale} />
      </DemoCard>
    </Section>
  );
}
