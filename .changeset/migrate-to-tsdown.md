---
'@doranjs/core': patch
'@doranjs/nlp': patch
'@doranjs/holidays': patch
'@doranjs/react': patch
'@doranjs/ui': patch
'@doranjs/wc': patch
---

Migrate the build toolchain from `tsup` (no longer maintained) to
[`tsdown`](https://tsdown.dev) (rolldown-based). The published output is
equivalent: same `.js`/`.cjs` + `.d.ts`/`.d.cts` entry points and sourcemaps, the
React and Web Component stylesheets ship unchanged, and `@doranjs/wc` still emits its
self-registering `dist/doran.global.js` IIFE bundle for CDN use. No API or runtime
behavior changes.
