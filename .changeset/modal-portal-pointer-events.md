---
'@doranjs/react': patch
'@doranjs/wc': patch
---

Fix the calendar going inert inside modal dialogs

Inside a modal Radix layer — a Dialog, an AlertDialog, a shadcn Sheet, a vaul Drawer,
anything opening with `disableOutsidePointerEvents` — the date picker's calendar
rendered correctly and on top, but tapping a day or a time stepper selected nothing and
closed the calendar instead.

Those layers set `pointer-events: none` on `<body>` for as long as they are open and
exempt only their own subtree. The pop-over is portaled to `<body>`, so it inherited the
`none` and went inert: the tap hit-tested straight through to `<html>`, and the picker's
own outside-pointerdown dismissal then saw a target it did not own and closed. Both
picking a date and adjusting the time died this way.

`.doran-datepicker__popover` now sets `pointer-events: auto`, the same reasoning as the
`position: fixed` that already protects it from `overflow: hidden` ancestors — it is the
topmost element on screen by construction, so there is no case where inheriting `none` is
wanted. The single rule covers `DoranDatePicker`, `DoranRangeDatePicker`, and the
`<doran-datepicker>` / `<doran-rangedatepicker>` elements, which share the class.
`DoranNlpInput`'s suggestion list is portaled the same way and had the same gap; it is
fixed too.

No API change, and nothing to do on upgrade beyond taking the new stylesheet.
