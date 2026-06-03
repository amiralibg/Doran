import { createCard } from '../demo/createCard';
import { createSection } from '../demo/createSection';

import Tokens from '../demos/theming/Tokens';
import TokensSrc from '../demos/theming/Tokens?raw';
import DarkScope from '../demos/theming/DarkScope';
import DarkScopeSrc from '../demos/theming/DarkScope?raw';

export function themingSection(): HTMLElement {
  return createSection('theming', 'Theming', 'thIntro', [
    createCard({
      titleKey: 'thTokensTitle',
      descKey: 'thTokensDesc',
      code: TokensSrc,
      build: Tokens,
    }),
    createCard({
      titleKey: 'thModeTitle',
      descKey: 'thModeDesc',
      code: DarkScopeSrc,
      build: DarkScope,
    }),
  ]);
}
