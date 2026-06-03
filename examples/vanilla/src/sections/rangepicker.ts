import { createCard } from '../demo/createCard';
import { createSection } from '../demo/createSection';

import Default from '../demos/rangepicker/Default';
import DefaultSrc from '../demos/rangepicker/Default?raw';
import Presets from '../demos/rangepicker/Presets';
import PresetsSrc from '../demos/rangepicker/Presets?raw';
import MultiMonth from '../demos/rangepicker/MultiMonth';
import MultiMonthSrc from '../demos/rangepicker/MultiMonth?raw';
import Holidays from '../demos/rangepicker/Holidays';
import HolidaysSrc from '../demos/rangepicker/Holidays?raw';

export function rangePickerSection(): HTMLElement {
  return createSection('rangepicker', '<doran-rangepicker>', 'rpIntro', [
    createCard({
      titleKey: 'rpDefaultTitle',
      descKey: 'rpDefaultDesc',
      code: DefaultSrc,
      build: Default,
    }),
    createCard({
      titleKey: 'rpPresetsTitle',
      descKey: 'rpPresetsDesc',
      code: PresetsSrc,
      build: Presets,
      wide: true,
    }),
    createCard({
      titleKey: 'rpMultiTitle',
      descKey: 'rpMultiDesc',
      code: MultiMonthSrc,
      build: MultiMonth,
      wide: true,
    }),
    createCard({
      titleKey: 'rpHolidaysTitle',
      descKey: 'rpHolidaysDesc',
      code: HolidaysSrc,
      build: Holidays,
    }),
  ]);
}
