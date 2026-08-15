---
'@doranjs/core': minor
'@doranjs/zod': patch
'@doranjs/react': patch
'@doranjs/wc': patch
'@doranjs/nlp': patch
'@doranjs/holidays': patch
'@doranjs/vue': patch
'@doranjs/svelte': patch
'@doranjs/angular': patch
---

Survive two installed copies of `@doranjs/core`.

Published packages pinned `@doranjs/core` to an exact version, because pnpm rewrites
`workspace:*` that way. When a consumer upgraded one Doran package without the others,
their pins diverged and npm installed two copies — at which point
`value instanceof DoranDate` returned `false` for a date built by the other copy, and
`@doranjs/zod` silently rejected perfectly valid dates as unparseable.

`DoranDate` now carries a `Symbol.for('doran.date')` brand. Registered symbols live in
a global registry shared by every copy of a module, so the new `isDoranDate()` guard
recognizes instances across copies where `instanceof` cannot. It replaces the
cross-boundary `instanceof` checks in `@doranjs/zod` and in core's own `toDoranDate`.

Internal `@doranjs/*` ranges also move from `workspace:*` to `workspace:^`, so they
publish as caret ranges rather than exact pins. This is strictly a widening — existing
lockfiles are untouched and new installs can only dedupe better.

One limit worth knowing: below 1.0, `^0.2.0` does not admit `0.3.0`, so carets prevent
duplicates only within a minor line. Fully solving cross-minor divergence needs a 1.0,
where a caret spans every minor. The brand makes the remaining cases degrade gracefully
rather than silently.
