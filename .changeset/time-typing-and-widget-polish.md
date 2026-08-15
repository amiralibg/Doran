---
'@doranjs/react': minor
'@doranjs/wc': minor
---

Make the time picker typable, give every unit its own step, and fix day-widget layout.

**Type the time.** Each field is a real input as well as a spinbutton: type `14`, or
step with the arrows. Persian and Arabic numerals are accepted. Partial input is left
alone — halfway to `15` the field reads `1`, and committing that would fight the user
mid-keystroke.

**Per-unit steps.** `hourStep`, `minuteStep`, and `secondStep` each default to `1`, so
`minuteStep={15}` leaves the hour moving one at a time. In web components,
`hour-step` and `minute-step`.

**Layout fixes for day widgets**, all visible with real content:

- Day grids used `repeat(7, 1fr)`, and `1fr` floors at min-content — so one long
  annotation widened its column and pushed the whole grid out of alignment, spilling
  text into neighbouring days. Now `minmax(0, 1fr)`, which lets the column clip.
- `slots.aside` squeezed the month grid instead of widening the calendar, because
  `.doran-calendar` is a fixed-width column. It now sizes to content when an aside is
  present, matching what the range picker already did for its presets.
- Rich rows now share a `min-height`, so a row of annotated days is the same height as
  a row without them.
- The legend and footer slots have real layout rather than sitting flush against the
  grid, and the holiday dot moves clear of the second line.
