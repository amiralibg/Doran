---
'@doranjs/react': patch
'@doranjs/wc': patch
---

Fix date-picker accessibility and fill in missing theme variables.

**The pop-over no longer traps the keyboard.** It declares `aria-modal="false"`,
promising assistive technology that the rest of the page stays reachable, but a focus
trap meant Tab could never leave. Tabbing past either end now closes it and moves on;
Shift+Tab returns to the trigger, and Escape still closes and restores focus.

**The trigger has an accessible name.** It previously announced as just its digits —
"۱۴۰۵/۰۳/۱۵, button" — with nothing saying it was a date field. It now announces the
field and its value together, defaulting to the placeholder as the description, and
accepting `aria-label` or `aria-labelledby` to override.

**New theme variables**, so these no longer need element-level CSS to change:
`--doran-input-font-size`, `--doran-input-shadow`, `--doran-input-focus-shadow`,
`--doran-input-focus-border-color`, `--doran-placeholder-color`, `--doran-icon-color`,
`--doran-icon-size`, `--doran-day-disabled-opacity`, and a full set of
`--doran-time-*` variables for the time picker, which was previously styled almost
entirely with literals. Every one falls back to the current value, so nothing changes
visually unless you set them.
