---
'@doranjs/react': patch
---

Make the calendar's navigation arrows follow the writing direction

The docs have always said the default navigation chevrons flip to match the direction.
They did not. `DoranCalendar` resolved a direction, put it on its root and handed it to
the month grid, but never passed it to `CalendarHeader` — whose own `direction` default
is `'rtl'`. So the arrows pointed right-to-left under an LTR locale, and under an
explicit `dir="ltr"`, in a calendar whose layout had correctly flipped around them.

`DoranRangePicker` had always passed `direction` to that same component, which is why
only the single calendar looked wrong and why passing a hand-picked `arrows` pair was
the usual workaround. That workaround is no longer needed, and still wins where it is
used — an explicit `arrows` prop is untouched by this.

`DoranDatePicker` also never forwarded its `dir` to the calendar it opens. The pop-over
carried the right direction, then the calendar inside re-derived its own from the locale
and contradicted the field it had opened from; `<DoranDatePicker dir="ltr" />` rendered
an RTL calendar. It now passes the resolved direction down, matching what
`DoranRangeDatePicker` already did.

If you were passing `arrows` purely to correct the chevrons under an LTR locale, you can
drop it. `@doranjs/wc` was already correct and is unchanged.
