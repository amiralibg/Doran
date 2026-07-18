# @doranjs/zod

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
