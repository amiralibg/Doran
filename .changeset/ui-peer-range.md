---
'@doranjs/react': patch
---

Loosen the `@doranjs/ui` peer range so patch releases don't strand consumers.

The peer was declared `workspace:*`, which pnpm rewrites to an exact version on
publish — so `@doranjs/react` demanded precisely `@doranjs/ui@0.0.4` and every `ui`
patch forced a coordinated bump. It is now `workspace:^`, publishing as a caret range.
