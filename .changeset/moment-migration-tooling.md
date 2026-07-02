---
'@doranjs/codemod': minor
'eslint-plugin-doran': minor
---

**Migration tooling: moment / moment-jalaali → Doran.**

- **`@doranjs/codemod`** — a jscodeshift codemod (`npx @doranjs/codemod "src/**"`) that rewrites the import, `moment()` / `moment(x)`, jalali vs Gregorian `.format(...)`, `.utc().format()` → `.toISOString()`, and drops `moment.loadPersian()`. 1:1 methods (`fromNow` / `diff` / `isBefore`) keep working on the rewritten value. Anything it can't safely convert (calendar parses, `moment.duration`, dynamic format patterns) is reported, never silently changed.
- **`eslint-plugin-doran`** — flat-config plugin with the `no-moment` rule that flags `moment` / `moment-jalaali` imports and `moment(...)` / `momentj(...)` calls so they don't creep back.
- The "Migrating from moment / moment-jalaali" guide now documents both.
