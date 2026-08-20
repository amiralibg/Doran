---
'@doranjs/react': patch
'@doranjs/wc': patch
---

Finish the mobile pass across the rest of the components

The sheet work covered the date and range pickers. Auditing every component at 375px
turned up four more things, one of them a regression from that same work.

- **Day widgets were being squashed.** Days had been given `max-height: var(--_day-size)`
  so a touch target could not overrun its cell — but a day carrying a fare or a seat
  count is taller than it is wide on purpose, and `--_day-size` is a width budget. Rich
  days were clamped to 44px and their annotation cut off. They are exempt now, and
  render at their intended 48px again.
- **The calendar's `aside` slot is a sidebar**, which on a 375px screen left the grid
  23px columns — it had stopped overflowing once days became fluid, but only by
  shrinking to unusable. It becomes a row above the grid under the breakpoint, the same
  way the range picker's presets already do.
- **The time picker's steppers were 28x20**, a target you miss more often than you hit.
  They grow to 36x32 on a touch screen, and their default height goes from 20px to 24px
  everywhere else — 24px being the floor WCAG 2.5.8 sets for a pointer target.
- **The field's padding was dead to a tap.** The control inside a 40px trigger was
  23px tall, so only the middle of the field focused the input, or opened the picker
  under `editable={false}`. The control fills the field now. The button trigger becomes
  a flex box to keep its text centred, and aligns with the physical `justify-content`
  keywords, since `text-align` does not reach an anonymous flex item and `flex-end`
  would have meant the opposite edge under `dir="rtl"`.
