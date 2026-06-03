import { useLang } from '../i18n/LangProvider';
import { DemoCard } from '../demo/DemoCard';
import { Section } from '../demo/Section';

import Tokens from '../demos/theming/Tokens';
import TokensSrc from '../demos/theming/Tokens?raw';
import ButtonDemo from '../demos/theming/ButtonDemo';
import ButtonDemoSrc from '../demos/theming/ButtonDemo?raw';
import Mode from '../demos/theming/Mode';
import ModeSrc from '../demos/theming/Mode?raw';

export function ThemingSection() {
  const { t, locale } = useLang();
  return (
    <Section id="theming" title={t('navTheming')} intro={t('thIntro')}>
      <DemoCard title={t('thTokensTitle')} description={t('thTokensDesc')} code={TokensSrc}>
        <Tokens locale={locale} />
      </DemoCard>
      <DemoCard title={t('thButtonTitle')} description={t('thButtonDesc')} code={ButtonDemoSrc}>
        <ButtonDemo />
      </DemoCard>
      <DemoCard title={t('thModeTitle')} description={t('thModeDesc')} code={ModeSrc}>
        <Mode />
      </DemoCard>
    </Section>
  );
}
