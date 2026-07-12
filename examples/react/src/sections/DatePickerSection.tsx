import { useLang } from '../i18n/LangProvider';
import { DemoCard } from '../demo/DemoCard';
import { Section } from '../demo/Section';

import Default from '../demos/datepicker/Default';
import DefaultSrc from '../demos/datepicker/Default?raw';
import WithTime from '../demos/datepicker/WithTime';
import WithTimeSrc from '../demos/datepicker/WithTime?raw';
import Format from '../demos/datepicker/Format';
import FormatSrc from '../demos/datepicker/Format?raw';
import MinMax from '../demos/datepicker/MinMax';
import MinMaxSrc from '../demos/datepicker/MinMax?raw';
import Customization from '../demos/datepicker/Customization';
import CustomizationSrc from '../demos/datepicker/Customization?raw';

export function DatePickerSection() {
  const { t, locale } = useLang();
  return (
    <Section id="datepicker" title="<DoranDatePicker>" intro={t('dpIntro')}>
      <DemoCard title={t('dpDefaultTitle')} description={t('dpDefaultDesc')} code={DefaultSrc}>
        <Default locale={locale} />
      </DemoCard>
      <DemoCard title={t('dpTimeTitle')} description={t('dpTimeDesc')} code={WithTimeSrc}>
        <WithTime locale={locale} />
      </DemoCard>
      <DemoCard title={t('dpFormatTitle')} description={t('dpFormatDesc')} code={FormatSrc}>
        <Format locale={locale} />
      </DemoCard>
      <DemoCard title={t('dpRangeTitle')} description={t('dpRangeDesc')} code={MinMaxSrc}>
        <MinMax locale={locale} />
      </DemoCard>
      <DemoCard
        title={t('dpCustomizationTitle')}
        description={t('dpCustomizationDesc')}
        code={CustomizationSrc}
      >
        <Customization locale={locale} />
      </DemoCard>
    </Section>
  );
}
