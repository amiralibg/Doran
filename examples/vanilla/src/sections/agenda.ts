import { createCard } from '../demo/createCard';
import { createSection } from '../demo/createSection';

import Default from '../demos/agenda/Default';
import DefaultSrc from '../demos/agenda/Default?raw';
import Days from '../demos/agenda/Days';
import DaysSrc from '../demos/agenda/Days?raw';
import CustomRender from '../demos/agenda/CustomRender';
import CustomRenderSrc from '../demos/agenda/CustomRender?raw';

export function agendaSection(): HTMLElement {
  return createSection('agenda', '<doran-agenda>', 'agIntro', [
    createCard({
      titleKey: 'agDefaultTitle',
      descKey: 'agDefaultDesc',
      code: DefaultSrc,
      build: Default,
      wide: true,
    }),
    createCard({ titleKey: 'agDaysTitle', descKey: 'agDaysDesc', code: DaysSrc, build: Days }),
    createCard({
      titleKey: 'agRenderTitle',
      descKey: 'agRenderDesc',
      code: CustomRenderSrc,
      build: CustomRender,
    }),
  ]);
}
