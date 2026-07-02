# Framework bindings

Doran ships four framework bindings, all riding the same shared engine — the
[`@doranjs/wc`](/en/api/wc) custom elements. The calendar/grid logic is written once and never
reimplemented per framework; each binding just layers that framework's idiomatic convention on top.
The change convention is uniform: the value is a `DoranDate`, and the `change` event **also**
reports the Gregorian `Date` for your backend.

## Side by side

|                    | ‏ [React](/en/api/react) | ‏ [Vue](/en/api/vue) | ‏ [Svelte](/en/api/svelte) | ‏ [Angular](/en/api/angular)     |
| ------------------ | ------------------------ | -------------------- | -------------------------- | -------------------------------- |
| Install            | `@doranjs/react`         | `@doranjs/vue`       | `@doranjs/svelte`          | `@doranjs/angular`               |
| Value binding      | `value`/`onChange`       | `v-model`            | `bind:value`               | `[formControl]` (CVA)            |
| Value type         | `DoranDate`              | `DoranDate`          | `DoranDate`                | `DoranDate`                      |
| Gregorian from     | `onChange` 2nd arg       | `change` payload     | `change` detail            | `(change)` payload               |
| Headless grid      | `useCalendar`            | `useCalendarGrid`    | `createCalendarGrid`       | `createCalendarGrid` (signals)   |
| Provider           | `DoranProvider`          | `DoranProvider`      | `DoranProvider`            | `dr-provider` / `DORAN_DEFAULTS` |
| Provider mechanism | context                  | provide/inject       | context                    | DI                               |

All four bindings expose the same component set: `DoranDatePicker`, `DoranCalendar`,
`DoranRangePicker`, `DoranNlpInput`, and `DoranAgenda`. Any attribute the underlying element
supports (`locale`, `format`, `with-time`, `min`, `max`, …) passes straight through — see
[`@doranjs/wc`](/en/api/wc) for the full list.

## Validation & forms

For framework-agnostic validation, [`@doranjs/zod`](/en/api/zod) provides a `zDoranDate()` schema
that coerces an ISO string, `Date`, epoch, or `DoranDate` into a `DoranDate` and drops into any
form stack via its zod resolver (react-hook-form, VeeValidate, superforms, …).

## SSR

`@doranjs/wc` is SSR-guarded, so server rendering emits the inert tag and hydration upgrades it. To
keep digits/tz deterministic across the two passes, wrap your app in `DoranProvider`. Details in the
[SSR guide](/en/guide/ssr).
