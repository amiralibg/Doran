---
'@doranjs/react': minor
'@doranjs/wc': minor
---

Make the pickers work on a phone by default

The mobile path had been an opt-in that nobody would find and that didn't look right
when they did. Three things were actually broken:

- **The bottom sheet had no `background`.** It computed to `rgba(0, 0, 0, 0)`, so the
  sheet was a transparent box with a stray shadow around a calendar that appeared to
  float mid-screen. It also lost to the anchored pop-over's `max-width: calc(100vw -
1rem)` on source order, so it never reached either edge.
- **The backdrop was never written.** A comment described a pseudo-element that did
  not exist. The page behind the sheet was never dimmed.
- **The stylesheet had no width media queries at all.** Nothing adapted to a narrow
  screen, so the range picker put two month grids and a preset sidebar into 374px and
  the digits collapsed into each other.

`mode` now defaults to `auto` rather than `popover`, for `DoranDatePicker`,
`DoranRangeDatePicker`, `<doran-datepicker>`, and `<doran-rangedatepicker>` alike —
under 640px they present as a bottom sheet. A panel anchored to a field near the
bottom of a phone can only flip and clamp, so it ends up squeezed against an edge; the
range picker, the widest panel here, simply ran off the screen with no way to scroll
it. Pass `mode="popover"` for the previous behaviour at every width.

`DoranRangeDatePicker` had no sheet support in React at all and now takes `mode`, so
it matches the single picker and the web components.

The sheet is full-bleed, dims the page behind it, carries a grabber, respects the home
indicator, and scrolls internally. Under the breakpoint days grow to a 44px touch
target, the range picker's months stack instead of sitting side by side, and its
presets become a horizontal strip of pills rather than a column stealing a third of
the width. New theme hooks: `--doran-sheet-bg`, `--doran-sheet-backdrop`,
`--doran-sheet-grabber-color`, `--doran-sheet-grabber-width`,
`--doran-sheet-content-width`, and `--doran-day-size-touch`.

Days size themselves to the cell and cap at the touch target rather than being fixed
at it. A hard 2.75rem day is 308px of grid before any padding, which does not fit a
375px phone once an inline calendar has a legend beside it — the grid stops shrinking
and the page scrolls sideways. Filling the cell up to that cap gives a full 44px
wherever there is room and degrades smoothly where there is not. Below 400px the
sheet and calendar also hand their padding back to the grid.

375px is the floor this library designs for. At that width both pickers get a full
44px day with room around it and no horizontal overflow; narrower still degrades
rather than breaking.

Desktop is unchanged: above 640px both pickers still anchor to the trigger at their
existing sizes.
