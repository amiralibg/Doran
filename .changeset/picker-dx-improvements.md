---
'@doranjs/react': minor
---

`DoranDatePicker` DX improvements:

- **Locale inheritance:** the `locale` prop now falls back to `getDefaultLocale()` instead of always defaulting to `faIR`. A single `setDefaultLocale(enUS)` at the app root is sufficient — no need to pass `locale` on every picker instance.
- **`onChange` second argument:** `onChange(date, gregorian)` now receives the selected instant as a native `Date` as its second argument, so you can send Gregorian ISO strings to your backend without an extra `.toGregorian()` call. Existing handlers that accept one argument are unaffected.
- **`style` and `id` props** are forwarded to the root element, so you can set `width` inline without a wrapper `<span>`.
- **`size` prop** (`"sm"` | `"md"` | `"lg"`) maps to 32 / 40 / 48 px heights via `--doran-input-height`, matching antd/MUI conventions.
