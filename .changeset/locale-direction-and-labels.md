---
'@doranjs/core': minor
'@doranjs/react': minor
'@doranjs/wc': minor
---

Make locales actually localize.

`setDefaultLocale(enUS)` previously still produced a right-to-left widget whose
pop-over announced «تقویم». Direction and every user-visible string were hardcoded,
which is what `iconPosition` and `textAlign` were really working around.

**`Locale` gains `direction`.** Components read it instead of hardcoding `dir`, so a
Latin locale yields a genuinely left-to-right widget. Arrow-key navigation follows —
`ArrowLeft` advances in RTL and goes back in LTR — and the default navigation chevrons
flip to match. An explicit `dir` prop overrides, and a locale omitting `direction`
still resolves to `'rtl'`, so nothing written before this field changes behaviour.

**`CalendarLabels` grows from two fields to twenty-two**, covering everything the
components render or announce: the input placeholder, the pop-over and open-calendar
names, previous/next month, the month and year selectors, the time picker's fields and
steppers, the range summary separator and presets, the natural-language placeholder
and its unresolved state, and the separator joining a day's date to its annotation.

Every field is optional and `resolveCalendarLabels` now _merges_ with the Persian
defaults rather than replacing them, so a locale defining only `today` and `clear` —
as every locale written before these fields existed does — still gets a complete set.

**Range presets are localized.** `defaultRangePresets()` hardcoded Persian digits, so
even a consumer supplying custom presets got `'۷ روز اخیر'` under an English locale. It
now takes a locale and builds labels through `formatNumber`, with `lastDays` as a
`{count}` template. Calling it with no argument uses the ambient default, so existing
calls are unchanged.

**Web components honour `setDefaultLocale` too.** `resolveLocaleAttr` fell back to a
hardcoded `faIR` when the `locale` attribute was absent, so the global default never
reached them. It now falls back to the default locale and consults the locale registry
first, which also makes `registerLocale()` usable from plain HTML.

New in `@doranjs/core`: `resolveDirection(locale)` and the `ResolvedCalendarLabels`
type. New on the React components: a `dir` prop.
