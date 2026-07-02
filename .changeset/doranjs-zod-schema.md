---
'@doranjs/zod': minor
---

**New package `@doranjs/zod`** — a framework-agnostic [zod](https://zod.dev) schema for `DoranDate`.

- `zDoranDate(options?)` — accepts an ISO-8601 string, an epoch `number` (ms), a native `Date`, or an existing `DoranDate`, and coerces to a `DoranDate`. `min` / `max` bounds (inclusive) accept any of the same input types.
- `toDoranDate(value)` — the underlying coercion (`unknown → DoranDate | null`), exported for reuse.
- Drops into any zod-based form stack (react-hook-form, VeeValidate, Felte / sveltekit-superforms, Angular reactive forms) via that stack's standard zod resolver; submit `value.toISOString()` for Gregorian-out.
