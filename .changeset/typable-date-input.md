---
'@doranjs/core': minor
'@doranjs/react': minor
---

Make the date picker's trigger a real text input.

**You can type a date now.** `DoranDatePicker`'s trigger was a `<button>`, so the
calendar was the only way in — an operator filtering orders had to click through
panels, and a birthdate in 1360 meant paging a year panel sixty entries wide.
Typing `1402/5/12`, `1402-5-12`, or `۱۴۰۲/۰۵/۱۲` now just works, using core's
existing `parseJalali`. Pass `readOnly` where a date must come from the grid.

Errors surface on blur, not per keystroke — en route to `1402/05/12` the value
passes through `1`, `14`, `140`, and flagging each would leave the field red the
whole time it is in use. Text that doesn't parse is kept and marked
`aria-invalid` rather than silently discarded.

**Form association.** `forwardRef` (to the input), `name`, `required`, `readOnly`,
`invalid`, `onBlur`, `onFocus`, `aria-describedby`, and `onParseError`. A named
picker submits through a hidden input carrying a Latin-digit machine value, since
the Persian-digit text on screen is not something a backend can read. This is what
`register()` from react-hook-form needs.

**Loose value types.** `value`, `defaultValue`, `min`, and `max` now accept a
`DoranDate`, a native `Date`, epoch milliseconds, or a string — Jalali or Gregorian,
Latin or Persian digits. New `valueFormat` controls what comes back:

```tsx
<DoranDatePicker valueFormat="YYYY-MM-DD" onChange={setQueryParam} />
```

The generic flows through, so `onChange` there is typed as receiving a string. Every
consumer keeping a `"YYYY-MM-DD"` string for a query param can delete their
conversion wrapper.

`@doranjs/core` gains `toDoranDate`, `formatValue`, and the `DateInput` /
`ValueFormat` / `FormattedValue` types behind this. Note that the two calendars'
strings are ambiguous on shape alone — `parseJalali('2025-08-03')` reads a Jalali
year 2025 — so `toDoranDate` splits them on year magnitude, treating a leading year
at or above 1700 as Gregorian.

**Behaviour changes worth knowing.** The trigger is an `<input>`, so tests querying
`getByRole('button')` for it should query `getByRole('textbox')`; the calendar icon
is now its own button. The calendar no longer takes focus when it opens, which would
have pulled the caret out of the field mid-typing. And `.doran-datepicker__input` is
now the bordered wrapper around `.doran-datepicker__control`, the bare text field —
`:focus-visible` on it became `:focus-within`, and `:disabled` became
`[data-disabled]`.
