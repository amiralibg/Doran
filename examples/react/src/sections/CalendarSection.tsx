import { useLang } from '../i18n/LangProvider';
import { DemoCard } from '../demo/DemoCard';
import { Section } from '../demo/Section';

import Default from '../demos/calendar/Default';
import DefaultSrc from '../demos/calendar/Default?raw';
import SeparateHeader from '../demos/calendar/SeparateHeader';
import SeparateHeaderSrc from '../demos/calendar/SeparateHeader?raw';
import WithTime from '../demos/calendar/WithTime';
import WithTimeSrc from '../demos/calendar/WithTime?raw';
import Holidays from '../demos/calendar/Holidays';
import HolidaysSrc from '../demos/calendar/Holidays?raw';
import Weekends from '../demos/calendar/Weekends';
import WeekendsSrc from '../demos/calendar/Weekends?raw';
import OutsideDays from '../demos/calendar/OutsideDays';
import OutsideDaysSrc from '../demos/calendar/OutsideDays?raw';
import LocaleDemo from '../demos/calendar/LocaleDemo';
import LocaleDemoSrc from '../demos/calendar/LocaleDemo?raw';
import Headless from '../demos/calendar/Headless';
import HeadlessSrc from '../demos/calendar/Headless?raw';

export function CalendarSection() {
  const { t, locale } = useLang();

  return (
    <Section id="calendar" title="<DoranCalendar>" intro={t('calIntro')}>
      <DemoCard title={t('calDefaultTitle')} description={t('calDefaultDesc')} code={DefaultSrc}>
        <Default locale={locale} />
      </DemoCard>

      <DemoCard
        title={t('calSeparateTitle')}
        description={t('calSeparateDesc')}
        code={SeparateHeaderSrc}
      >
        <SeparateHeader locale={locale} />
      </DemoCard>

      <DemoCard title={t('calTimeTitle')} description={t('calTimeDesc')} code={WithTimeSrc}>
        <WithTime locale={locale} />
      </DemoCard>

      <DemoCard title={t('calHolidaysTitle')} description={t('calHolidaysDesc')} code={HolidaysSrc}>
        <Holidays locale={locale} />
      </DemoCard>

      <DemoCard title={t('calWeekendsTitle')} description={t('calWeekendsDesc')} code={WeekendsSrc}>
        <Weekends locale={locale} />
      </DemoCard>

      <DemoCard
        title={t('calOutsideTitle')}
        description={t('calOutsideDesc')}
        code={OutsideDaysSrc}
      >
        <OutsideDays locale={locale} />
      </DemoCard>

      <DemoCard title={t('calLocaleTitle')} description={t('calLocaleDesc')} code={LocaleDemoSrc}>
        <LocaleDemo />
      </DemoCard>

      <DemoCard title={t('calHeadlessTitle')} description={t('calHeadlessDesc')} code={HeadlessSrc}>
        <Headless locale={locale} />
      </DemoCard>
    </Section>
  );
}
