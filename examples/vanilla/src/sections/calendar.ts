import { createCard } from '../demo/createCard';
import { createSection } from '../demo/createSection';

import Widgets from '../demos/calendar/Widgets';
import WidgetsSrc from '../demos/calendar/Widgets?raw';
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
import Footer from '../demos/calendar/Footer';
import FooterSrc from '../demos/calendar/Footer?raw';
import LocaleDemo from '../demos/calendar/LocaleDemo';
import LocaleDemoSrc from '../demos/calendar/LocaleDemo?raw';

export function calendarSection(): HTMLElement {
  return createSection('calendar', '<doran-calendar>', 'calIntro', [
    createCard({
      titleKey: 'wgEventsTitle',
      descKey: 'wgEventsDesc',
      code: WidgetsSrc,
      build: Widgets,
    }),
    createCard({
      titleKey: 'calDefaultTitle',
      descKey: 'calDefaultDesc',
      code: DefaultSrc,
      build: Default,
    }),
    createCard({
      titleKey: 'calSeparateTitle',
      descKey: 'calSeparateDesc',
      code: SeparateHeaderSrc,
      build: SeparateHeader,
    }),
    createCard({
      titleKey: 'calTimeTitle',
      descKey: 'calTimeDesc',
      code: WithTimeSrc,
      build: WithTime,
    }),
    createCard({
      titleKey: 'calHolidaysTitle',
      descKey: 'calHolidaysDesc',
      code: HolidaysSrc,
      build: Holidays,
    }),
    createCard({
      titleKey: 'calWeekendsTitle',
      descKey: 'calWeekendsDesc',
      code: WeekendsSrc,
      build: Weekends,
    }),
    createCard({
      titleKey: 'calFooterTitle',
      descKey: 'calFooterDesc',
      code: FooterSrc,
      build: Footer,
    }),
    createCard({
      titleKey: 'calLocaleTitle',
      descKey: 'calLocaleDesc',
      code: LocaleDemoSrc,
      build: LocaleDemo,
    }),
  ]);
}
