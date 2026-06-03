import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Fine-grained Shiki: we import only the themes, languages, and a wasm-free
// JavaScript regex engine we actually use, so the bundle stays small instead of
// pulling in every grammar. Created lazily and code-split — it loads the first
// time a "show code" panel opens.
let promise: Promise<HighlighterCore> | null = null;

export const CODE_THEMES = { light: 'github-light', dark: 'github-dark' } as const;

export function getHighlighter(): Promise<HighlighterCore> {
  if (!promise) {
    promise = createHighlighterCore({
      themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
      langs: [import('shiki/langs/tsx.mjs')],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return promise;
}
