---
'@doranjs/react': patch
'@doranjs/wc': patch
---

Isolate the date-picker trigger value from the surrounding RTL context with
`dir="auto"` so digit-only formats like `YYYY-MM-DD HH:mm` no longer render
time-before-date when `textAlign` is set without an explicit direction.
