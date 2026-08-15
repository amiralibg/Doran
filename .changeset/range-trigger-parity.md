---
'@doranjs/wc': minor
'@doranjs/vue': minor
'@doranjs/svelte': minor
'@doranjs/angular': minor
---

Bring the range trigger to every framework.

React gained `DoranRangeDatePicker` — a range picker with an input trigger — but web
components only had the inline `<doran-rangepicker>`, so Vue, Svelte, Angular, and
plain-HTML users had no way to get one.

`<doran-rangedatepicker>` closes that: one trigger holding two fields, either typable
or fillable from the grid, with the same ordering guarantee (an end before the start
swaps them), the same `mode="sheet"` presentation, and the same `dayData`,
`disabledDates`, and slot support. It is exposed as `DoranRangeDatePicker` from
`@doranjs/vue` and `@doranjs/svelte`, and as `<dr-range-date-picker>` from
`@doranjs/angular`.

Also fixed: `DoranDatePicker` in `@doranjs/svelte` forwarded only its default slot, so
`legend`, `aside`, and `footer` never reached the element the way they did on the
calendar and range picker.
