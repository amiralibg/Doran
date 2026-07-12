import { createCard } from '../demo/createCard';
import { createSection } from '../demo/createSection';

import Default from '../demos/datepicker/Default';
import DefaultSrc from '../demos/datepicker/Default?raw';
import WithTime from '../demos/datepicker/WithTime';
import WithTimeSrc from '../demos/datepicker/WithTime?raw';
import Format from '../demos/datepicker/Format';
import FormatSrc from '../demos/datepicker/Format?raw';
import Holidays from '../demos/datepicker/Holidays';
import HolidaysSrc from '../demos/datepicker/Holidays?raw';
import Customization from '../demos/datepicker/Customization';
import CustomizationSrc from '../demos/datepicker/Customization?raw';

export function datePickerSection(): HTMLElement {
  return createSection('datepicker', '<doran-datepicker>', 'dpIntro', [
    createCard({
      titleKey: 'dpDefaultTitle',
      descKey: 'dpDefaultDesc',
      code: DefaultSrc,
      build: Default,
    }),
    createCard({
      titleKey: 'dpTimeTitle',
      descKey: 'dpTimeDesc',
      code: WithTimeSrc,
      build: WithTime,
    }),
    createCard({
      titleKey: 'dpFormatTitle',
      descKey: 'dpFormatDesc',
      code: FormatSrc,
      build: Format,
    }),
    createCard({
      titleKey: 'dpHolidaysTitle',
      descKey: 'dpHolidaysDesc',
      code: HolidaysSrc,
      build: Holidays,
    }),
    createCard({
      titleKey: 'dpCustomizationTitle',
      descKey: 'dpCustomizationDesc',
      code: CustomizationSrc,
      build: Customization,
    }),
  ]);
}
