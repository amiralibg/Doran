---
'@doranjs/wc': patch
---

Rebuild the web-component stylesheet when the styles it is built from change

`@doranjs/wc` composes `dist/styles.css` by concatenating `packages/ui/src/styles.css`
and `packages/react/src/styles.css` in a `build:done` hook. It declares no dependency
on either package, so Turbo had no idea those files were inputs: editing React's
stylesheet left the `wc` build cached, and the published bundle kept the old CSS.

This was not theoretical. A styling change landed in React and every web-component
example kept rendering the previous rules until the build was forced —
`grep -c "max-width: 400px" packages/wc/dist/styles.css` returned `0` against a
stylesheet that contained it.

A package-level `turbo.json` now names both files as build inputs via `$TURBO_ROOT$`,
so the task hash tracks them. Verified by hashing the task either side of an edit to
React's stylesheet: identical before, different after.
