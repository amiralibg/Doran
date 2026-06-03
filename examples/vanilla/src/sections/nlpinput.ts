import { createCard } from '../demo/createCard';
import { createSection } from '../demo/createSection';

import Default from '../demos/nlpinput/Default';
import DefaultSrc from '../demos/nlpinput/Default?raw';
import Suggestions from '../demos/nlpinput/Suggestions';
import SuggestionsSrc from '../demos/nlpinput/Suggestions?raw';
import Resolve from '../demos/nlpinput/Resolve';
import ResolveSrc from '../demos/nlpinput/Resolve?raw';

export function nlpInputSection(): HTMLElement {
  return createSection('nlp-input', '<doran-nlp-input>', 'nlpIntro', [
    createCard({
      titleKey: 'nlpDefaultTitle',
      descKey: 'nlpDefaultDesc',
      code: DefaultSrc,
      build: Default,
    }),
    createCard({
      titleKey: 'nlpSuggestTitle',
      descKey: 'nlpSuggestDesc',
      code: SuggestionsSrc,
      build: Suggestions,
    }),
    createCard({
      titleKey: 'nlpResolveTitle',
      descKey: 'nlpResolveDesc',
      code: ResolveSrc,
      build: Resolve,
    }),
  ]);
}
