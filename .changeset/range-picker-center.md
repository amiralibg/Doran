---
'@doranjs/react': patch
'@doranjs/wc': patch
---

Center the range picker's calendar within its body (`justify-content: center` on
`.doran-rangepicker__body`), so a single-month picker no longer sits against the
inline-start edge when the picker is wider than the calendar. The `@doranjs/wc`
stylesheet, which bundles the React styles, ships the same fix.
