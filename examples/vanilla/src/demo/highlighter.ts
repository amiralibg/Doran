import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Fine-grained Shiki: only the themes, the TypeScript grammar, and a wasm-free
// JavaScript regex engine we actually use, so the bundle stays small. Created
// lazily and code-split — it loads the first time a "show code" panel opens.
let promise: Promise<HighlighterCore> | null = null;

export const CODE_THEMES = { light: 'github-light', dark: 'github-dark' } as const;

export function getHighlighter(): Promise<HighlighterCore> {
  if (!promise) {
    promise = createHighlighterCore({
      themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
      langs: [import('shiki/langs/typescript.mjs')],
      engine: createJavaScriptRegexEngine(),
    });
  }
  return promise;
}
