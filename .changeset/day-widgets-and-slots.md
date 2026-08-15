---
'@doranjs/core': minor
'@doranjs/react': minor
'@doranjs/wc': minor
'@doranjs/vue': minor
'@doranjs/svelte': minor
'@doranjs/angular': minor
---

Add day widgets and calendar slots.

Days can now carry your own content — a fare, a seat count, an availability badge —
and the regions around the grid can be filled with your own components. Closes #52.

**Per-day content.** React gets two render functions; every framework gets a
serializable map that also works from plain HTML.

```tsx
<DoranDatePicker
  dayContent={(day) => <Fare value={fares[dayKey(day)]} />}
  dayProps={(day, meta) => ({ 'data-cheapest': isCheapest(day) || undefined })}
/>
```

```js
picker.dayData = { '1404-5-12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' } };
```

`dayData` keys are Jalali `YYYY-M-D`, and zero-padded or Persian-digit forms resolve
to the same day.

**`disabledDates`.** Days could previously only be blocked by `min`/`max`. Blackout
dates, booked nights, and sold-out departures are now expressible, with a
`disabledReason` that becomes both a tooltip and part of the day's accessible name.

**Slots.** `legend`, `aside`, and `footer` accept your own content — via a `slots`
prop in React, and light-DOM `<div slot="…">` children everywhere else, which Vue,
Svelte, and Angular templates fill natively. `useDoranCalendar()` gives that content
the calendar's state and navigation, so a slot widget can drive the calendar rather
than just decorate it.

**Holidays in React.** `@doranjs/react/holidays` exports `useHolidays()` and
`createHolidayHelpers()`, closing the gap where `@doranjs/wc` had Iranian holidays
built in and React did not. It ships as a subpath, so the dataset only enters bundles
that import it, and it indexes each year once instead of re-resolving per day.

**Accessibility.** Unavailable days now use `aria-disabled` rather than the `disabled`
attribute, so they stay focusable and can announce why they cannot be picked; arrow
navigation skips `min`/`max` gaps but lands on individually blocked days. A polite
live region announces the focused day, including when navigation crosses a month
boundary and the grid re-renders.
