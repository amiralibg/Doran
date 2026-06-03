import { useLang } from '../i18n/LangProvider';
import { DemoCard } from '../demo/DemoCard';
import { Section } from '../demo/Section';

import Default from '../demos/timepicker/Default';
import DefaultSrc from '../demos/timepicker/Default?raw';
import Step from '../demos/timepicker/Step';
import StepSrc from '../demos/timepicker/Step?raw';

export function TimePickerSection() {
  const { t, locale } = useLang();
  return (
    <Section id="time-picker" title="<DoranTimePicker>" intro={t('tpIntro')}>
      <DemoCard title={t('tpDefaultTitle')} description={t('tpDefaultDesc')} code={DefaultSrc}>
        <Default locale={locale} />
      </DemoCard>
      <DemoCard title={t('tpStepTitle')} description={t('tpStepDesc')} code={StepSrc}>
        <Step locale={locale} />
      </DemoCard>
    </Section>
  );
}
