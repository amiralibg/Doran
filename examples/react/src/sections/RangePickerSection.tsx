import { useLang } from '../i18n/LangProvider';
import { DemoCard } from '../demo/DemoCard';
import { Section } from '../demo/Section';

import Default from '../demos/rangepicker/Default';
import DefaultSrc from '../demos/rangepicker/Default?raw';
import WithTrigger from '../demos/rangepicker/WithTrigger';
import WithTriggerSrc from '../demos/rangepicker/WithTrigger?raw';
import Presets from '../demos/rangepicker/Presets';
import PresetsSrc from '../demos/rangepicker/Presets?raw';
import MultiMonth from '../demos/rangepicker/MultiMonth';
import MultiMonthSrc from '../demos/rangepicker/MultiMonth?raw';
import Holidays from '../demos/rangepicker/Holidays';
import HolidaysSrc from '../demos/rangepicker/Holidays?raw';

export function RangePickerSection() {
  const { t, locale } = useLang();
  return (
    <Section id="rangepicker" title="<DoranRangePicker>" intro={t('rpIntro')}>
      <DemoCard title={t('rpTriggerTitle')} description={t('rpTriggerDesc')} code={WithTriggerSrc}>
        <WithTrigger locale={locale} />
      </DemoCard>
      <DemoCard title={t('rpDefaultTitle')} description={t('rpDefaultDesc')} code={DefaultSrc}>
        <Default locale={locale} />
      </DemoCard>
      <DemoCard title={t('rpPresetsTitle')} description={t('rpPresetsDesc')} code={PresetsSrc} wide>
        <Presets locale={locale} />
      </DemoCard>
      <DemoCard title={t('rpMultiTitle')} description={t('rpMultiDesc')} code={MultiMonthSrc} wide>
        <MultiMonth locale={locale} />
      </DemoCard>
      <DemoCard title={t('rpHolidaysTitle')} description={t('rpHolidaysDesc')} code={HolidaysSrc}>
        <Holidays locale={locale} />
      </DemoCard>
    </Section>
  );
}
