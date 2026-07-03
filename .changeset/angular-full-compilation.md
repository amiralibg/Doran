---
'@doranjs/angular': patch
---

Build in full Ivy compilation mode instead of partial. Partial (`ngDeclare`)
output needs the Angular linker at build time; bundlers that don't run it (e.g.
Vite via `@analogjs/vite-plugin-angular`, which skips `node_modules`) left the
components unlinked, so consuming apps died at runtime with "JIT compiler
unavailable". The peer dependency is pinned to a single Angular major, where
full-compiled output is stable.
