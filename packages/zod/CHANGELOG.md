# @doranjs/zod

## 0.1.5

### Patch Changes

- Updated dependencies [[`e9e9e0e`](https://github.com/amiralibg/Doran/commit/e9e9e0e73e2700e5e7daed58878dd3212cea9f35)]:
  - @doranjs/core@0.3.0

## 0.1.4

### Patch Changes

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Survive two installed copies of `@doranjs/core`.

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

- Updated dependencies [[`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e), [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e)]:
  - @doranjs/core@0.2.0

## 0.1.3

### Patch Changes

- Updated dependencies [[`6335e77`](https://github.com/amiralibg/Doran/commit/6335e7728f1f5603e3a78b3d94d1821992e223e7)]:
  - @doranjs/core@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [[`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d)]:
  - @doranjs/core@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [[`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302)]:
  - @doranjs/core@0.1.1

## 0.1.0

### Minor Changes

- [#34](https://github.com/amiralibg/Doran/pull/34) [`a75e009`](https://github.com/amiralibg/Doran/commit/a75e00922c82c2a6ffbbac60faaa743c8822cc25) Thanks [@amiralibg](https://github.com/amiralibg)! - **New package `@doranjs/zod`** — a framework-agnostic [zod](https://zod.dev) schema for `DoranDate`.
  - `zDoranDate(options?)` — accepts an ISO-8601 string, an epoch `number` (ms), a native `Date`, or an existing `DoranDate`, and coerces to a `DoranDate`. `min` / `max` bounds (inclusive) accept any of the same input types.
  - `toDoranDate(value)` — the underlying coercion (`unknown → DoranDate | null`), exported for reuse.
  - Drops into any zod-based form stack (react-hook-form, VeeValidate, Felte / sveltekit-superforms, Angular reactive forms) via that stack's standard zod resolver; submit `value.toISOString()` for Gregorian-out.
