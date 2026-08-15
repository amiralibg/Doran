---
'@doranjs/core': minor
'@doranjs/react': minor
'@doranjs/wc': minor
---

Date picker inputs now mask typed digits into the configured `format` as they are entered and parse typed text against that format.

- `@doranjs/core` adds `applyFormatMask()` and `isMaskableFormat()` for flowing typed digits into a format pattern (`14020512` → `1402/05/12`). Fields advance the way a native date input does — a digit that cannot fit moves on, so `95` in `MM` is month `09` and day `5` — and a separator the user types closes its field early, keeping `1402-1-2` as month 1 / day 2 rather than month 12. Typed separators are normalized to the format's own, digits render in the locale's numerals, and backspace deletes through separators.
- `DoranDatePicker` / `<doran-datepicker>` and `DoranRangeDatePicker` / `<doran-rangedatepicker>` apply the mask while typing and parse against the developer-supplied `format` (falling back to the common defaults), so a custom pattern like `MM-DD-YYYY` accepts `05-12-1402`-style input. Formats built from text tokens (`MMMM`, `dddd`) are left unmasked and settle on blur as before.
