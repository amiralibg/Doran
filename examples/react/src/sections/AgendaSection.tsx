import { useLang } from '../i18n/LangProvider';
import { DemoCard } from '../demo/DemoCard';
import { Section } from '../demo/Section';

import Default from '../demos/agenda/Default';
import DefaultSrc from '../demos/agenda/Default?raw';
import Days from '../demos/agenda/Days';
import DaysSrc from '../demos/agenda/Days?raw';
import CustomRender from '../demos/agenda/CustomRender';
import CustomRenderSrc from '../demos/agenda/CustomRender?raw';

export function AgendaSection() {
  const { t, locale } = useLang();
  return (
    <Section id="agenda" title="<DoranAgenda>" intro={t('agIntro')}>
      <DemoCard title={t('agDefaultTitle')} description={t('agDefaultDesc')} code={DefaultSrc} wide>
        <Default locale={locale} />
      </DemoCard>
      <DemoCard title={t('agDaysTitle')} description={t('agDaysDesc')} code={DaysSrc}>
        <Days locale={locale} />
      </DemoCard>
      <DemoCard title={t('agRenderTitle')} description={t('agRenderDesc')} code={CustomRenderSrc}>
        <CustomRender locale={locale} />
      </DemoCard>
    </Section>
  );
}
