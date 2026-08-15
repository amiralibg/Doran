---
'@doranjs/core': minor
'@doranjs/react': minor
'@doranjs/wc': minor
'@doranjs/angular': minor
---

Add a range trigger, fix the time picker's keyboard, and add a mobile sheet mode.

**`DoranRangeDatePicker`** gives the range picker the trigger it never had: one
bordered field holding two inputs, either typable or fillable from the grid, with the
pop-over, positioning, and non-modal keyboard behaviour the single picker already had.
Both ends are kept in order — a backwards range is a slip, not an instruction, so
picking or typing an end before the start swaps them. Nothing checked that before.
`startName`/`endName` emit hidden fields for native submission.

**The time picker had no keyboard handler at all.** The only way to change the time was
to Tab onto a chevron and press Enter, which made 00:00 → 23:45 a long afternoon. Each
field is now a `spinbutton`: a tab stop answering to arrows, PageUp/PageDown, and
Home/End. The chevrons drop out of the tab order, since three fields' worth would put
six extra stops between the grid and the footer. `withSeconds` and `hourCycle={12}`
come along with it, the latter finally using `Locale.meridiem`, which had sat unused.

**`mode="sheet"`, or `"auto"` under 640px**, stops the calendar trying to anchor itself
to a trigger near the bottom of a phone viewport, where flip-and-clamp positioning
leaves it squeezed against an edge under the on-screen keyboard. The stylesheet
previously contained exactly one media query, and it was `prefers-reduced-motion`.

Also fixed: **`DoranRangePicker` never accepted `min`/`max`.** The props were being
passed by callers and silently dropped, because a JSX spread skips excess-property
checking.

New labels on `CalendarLabels`: `second`, `meridiem`, `rangeStart`, `rangeEnd`. New
React exports: `usePopover` and `usePresentation`, the shared pop-over shell the two
pickers now both use rather than keeping separate copies that had drifted.
