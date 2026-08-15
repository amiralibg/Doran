# @doranjs/core

## 0.3.0

### Minor Changes

- [#55](https://github.com/amiralibg/Doran/pull/55) [`e9e9e0e`](https://github.com/amiralibg/Doran/commit/e9e9e0e73e2700e5e7daed58878dd3212cea9f35) Thanks [@amiralibg](https://github.com/amiralibg)! - Date picker inputs now mask typed digits into the configured `format` as they are entered and parse typed text against that format.
  - `@doranjs/core` adds `applyFormatMask()` and `isMaskableFormat()` for flowing typed digits into a format pattern (`14020512` → `1402/05/12`). Fields advance the way a native date input does — a digit that cannot fit moves on, so `95` in `MM` is month `09` and day `5` — and a separator the user types closes its field early, keeping `1402-1-2` as month 1 / day 2 rather than month 12. Typed separators are normalized to the format's own, digits render in the locale's numerals, and backspace deletes through separators.
  - `DoranDatePicker` / `<doran-datepicker>` and `DoranRangeDatePicker` / `<doran-rangedatepicker>` apply the mask while typing and parse against the developer-supplied `format` (falling back to the common defaults), so a custom pattern like `MM-DD-YYYY` accepts `05-12-1402`-style input. Formats built from text tokens (`MMMM`, `dddd`) are left unmasked and settle on blur as before.

## 0.2.0

### Minor Changes

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Add day widgets and calendar slots.

  Days can now carry your own content — a fare, a seat count, an availability badge —
  and the regions around the grid can be filled with your own components. Closes #52.

  **Per-day content.** React gets two render functions; every framework gets a
  serializable map that also works from plain HTML.

  ```tsx
  <DoranDatePicker
    dayContent={(day) => <Fare value={fares[dayKey(day)]} />}
    dayProps={(day, meta) => ({ 'data-cheapest': isCheapest(day) || undefined })}
  />
  ```

  ```js
  picker.dayData = { '1404-5-12': { text: '۱٬۲۰۰٬۰۰۰', tone: 'low' } };
  ```

  `dayData` keys are Jalali `YYYY-M-D`, and zero-padded or Persian-digit forms resolve
  to the same day.

  **`disabledDates`.** Days could previously only be blocked by `min`/`max`. Blackout
  dates, booked nights, and sold-out departures are now expressible, with a
  `disabledReason` that becomes both a tooltip and part of the day's accessible name.

  **Slots.** `legend`, `aside`, and `footer` accept your own content — via a `slots`
  prop in React, and light-DOM `<div slot="…">` children everywhere else, which Vue,
  Svelte, and Angular templates fill natively. `useDoranCalendar()` gives that content
  the calendar's state and navigation, so a slot widget can drive the calendar rather
  than just decorate it.

  **Holidays in React.** `@doranjs/react/holidays` exports `useHolidays()` and
  `createHolidayHelpers()`, closing the gap where `@doranjs/wc` had Iranian holidays
  built in and React did not. It ships as a subpath, so the dataset only enters bundles
  that import it, and it indexes each year once instead of re-resolving per day.

  **Accessibility.** Unavailable days now use `aria-disabled` rather than the `disabled`
  attribute, so they stay focusable and can announce why they cannot be picked; arrow
  navigation skips `min`/`max` gaps but lands on individually blocked days. A polite
  live region announces the focused day, including when navigation crosses a month
  boundary and the grid re-renders.

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Survive two installed copies of `@doranjs/core`.

  Published packages pinned `@doranjs/core` to an exact version, because pnpm rewrites
  `workspace:*` that way. When a consumer upgraded one Doran package without the others,
  their pins diverged and npm installed two copies — at which point
  `value instanceof DoranDate` returned `false` for a date built by the other copy, and
  `@doranjs/zod` silently rejected perfectly valid dates as unparseable.

  `DoranDate` now carries a `Symbol.for('doran.date')` brand. Registered symbols live in
  a global registry shared by every copy of a module, so the new `isDoranDate()` guard
  recognizes instances across copies where `instanceof` cannot. It replaces the
  cross-boundary `instanceof` checks in `@doranjs/zod` and in core's own `toDoranDate`.

  Internal `@doranjs/*` ranges also move from `workspace:*` to `workspace:^`, so they
  publish as caret ranges rather than exact pins. This is strictly a widening — existing
  lockfiles are untouched and new installs can only dedupe better.

  One limit worth knowing: below 1.0, `^0.2.0` does not admit `0.3.0`, so carets prevent
  duplicates only within a minor line. Fully solving cross-minor divergence needs a 1.0,
  where a caret spans every minor. The brand makes the remaining cases degrade gracefully
  rather than silently.

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Make locales actually localize.

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

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Add a range trigger, fix the time picker's keyboard, and add a mobile sheet mode.

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

- [#53](https://github.com/amiralibg/Doran/pull/53) [`631c7e5`](https://github.com/amiralibg/Doran/commit/631c7e5928f2eeb5c721f902a6efd4e1ffbcee6e) Thanks [@amiralibg](https://github.com/amiralibg)! - Make the date picker's trigger a real text input.

  **You can type a date now.** `DoranDatePicker`'s trigger was a `<button>`, so the
  calendar was the only way in — an operator filtering orders had to click through
  panels, and a birthdate in 1360 meant paging a year panel sixty entries wide.
  Typing `1402/5/12`, `1402-5-12`, or `۱۴۰۲/۰۵/۱۲` now just works, using core's
  existing `parseJalali`. Pass `readOnly` where a date must come from the grid.

  Errors surface on blur, not per keystroke — en route to `1402/05/12` the value
  passes through `1`, `14`, `140`, and flagging each would leave the field red the
  whole time it is in use. Text that doesn't parse is kept and marked
  `aria-invalid` rather than silently discarded.

  **Form association.** `forwardRef` (to the input), `name`, `required`, `readOnly`,
  `invalid`, `onBlur`, `onFocus`, `aria-describedby`, and `onParseError`. A named
  picker submits through a hidden input carrying a Latin-digit machine value, since
  the Persian-digit text on screen is not something a backend can read. This is what
  `register()` from react-hook-form needs.

  **Loose value types.** `value`, `defaultValue`, `min`, and `max` now accept a
  `DoranDate`, a native `Date`, epoch milliseconds, or a string — Jalali or Gregorian,
  Latin or Persian digits. New `valueFormat` controls what comes back:

  ```tsx
  <DoranDatePicker valueFormat="YYYY-MM-DD" onChange={setQueryParam} />
  ```

  The generic flows through, so `onChange` there is typed as receiving a string. Every
  consumer keeping a `"YYYY-MM-DD"` string for a query param can delete their
  conversion wrapper.

  `@doranjs/core` gains `toDoranDate`, `formatValue`, and the `DateInput` /
  `ValueFormat` / `FormattedValue` types behind this. Note that the two calendars'
  strings are ambiguous on shape alone — `parseJalali('2025-08-03')` reads a Jalali
  year 2025 — so `toDoranDate` splits them on year magnitude, treating a leading year
  at or above 1700 as Gregorian.

  **Behaviour changes worth knowing.** The trigger is an `<input>`, so tests querying
  `getByRole('button')` for it should query `getByRole('textbox')`; the calendar icon
  is now its own button. The calendar no longer takes focus when it opens, which would
  have pulled the caret out of the field mid-typing. And `.doran-datepicker__input` is
  now the bordered wrapper around `.doran-datepicker__control`, the bare text field —
  `:focus-visible` on it became `:focus-within`, and `:disabled` became
  `[data-disabled]`.

## 0.1.3

### Patch Changes

- [#50](https://github.com/amiralibg/Doran/pull/50) [`6335e77`](https://github.com/amiralibg/Doran/commit/6335e7728f1f5603e3a78b3d94d1821992e223e7) Thanks [@amiralibg](https://github.com/amiralibg)! - Replace raw NUL bytes (U+0000) in the parse compile-cache key with `\u0000` escape sequences. The literal control characters shipped verbatim in the published dist and broke consumers whose bundler executes modules via `eval(TrustedScript)` — Firefox truncates the script at the first NUL, throwing `SyntaxError: ` literal not terminated before end of script`` (seen with Next.js dev mode on Firefox 133+). The cache key value is unchanged; the source and dist are now clean ASCII.

## 0.1.2

### Patch Changes

- [#48](https://github.com/amiralibg/Doran/pull/48) [`4889c5d`](https://github.com/amiralibg/Doran/commit/4889c5da37f5d565bc3572e74e748b2f67c1317d) Thanks [@amiralibg](https://github.com/amiralibg)! - Make `toLatinDigits` actually convert digits instead of returning its input unchanged.

  `toLatinDigits` was an identity function, serving as the `formatNumber` hook for the
  Latin-digit locale where identity is correct. But its public name promises a
  Persian/Arabic → Latin conversion, so consumers normalizing user input reached for it
  and got a silent no-op — Persian-keyboard input failed `/[0-9]/` validation with no
  error to trace.

  It now delegates to `normalizeDigits`, handling both the Persian ۰-۹ and Arabic-Indic
  ٠-٩ families. This is not a breaking change: `normalizeDigits` is identity for ASCII
  input, and every `formatNumber` call site passes ASCII, so Latin-locale formatting is
  byte-for-byte unchanged.

## 0.1.1

### Patch Changes

- [#44](https://github.com/amiralibg/Doran/pull/44) [`b73c99a`](https://github.com/amiralibg/Doran/commit/b73c99a95e5dd306f6611da38aad13d6e5819302) Thanks [@amiralibg](https://github.com/amiralibg)! - Localize calendar footer actions such as Today and Clear from the active locale instead of always showing Persian labels.

## 0.1.0

### Minor Changes

- [#17](https://github.com/amiralibg/Doran/pull/17) [`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6) Thanks [@amiralibg](https://github.com/amiralibg)! - **`@doranjs/core`**
  - `durationToHuman(seconds, locale?)` — standalone duration humanizer replacing `moment.duration(s, 'seconds').humanize()`. Uses the global default locale when none is given.

  **`@doranjs/react`**
  - `DoranRangePicker` / `useDateRange`: `onChange` now receives a second argument `gregorian: GregorianDateRange` (`{ start: Date | null; end: Date | null }`) so you can post Gregorian ISO strings to your backend without extra conversion.
  - `DoranRangePicker`: `locale` prop now falls back to `getDefaultLocale()` (consistent with `DoranDatePicker`).
  - New exported type: `GregorianDateRange`.

- [#17](https://github.com/amiralibg/Doran/pull/17) [`0df4b50`](https://github.com/amiralibg/Doran/commit/0df4b509e1a132352ec8d525566c8477a6b1d9c6) Thanks [@amiralibg](https://github.com/amiralibg)! - **Breaking fix:** `toISOString()` and `toJSON()` now return a standard Gregorian UTC ISO-8601 string (e.g. `"2026-05-31T10:09:05.000Z"`), matching `Date`, `dayjs`, and `moment` — making `JSON.stringify({ d: DoranDate.now() })` safe to send to any backend without extra conversion.

  **Migration:** if you relied on the previous Jalali ISO output, replace `.toISOString()` with `.toJalaliISO()`.

  New methods added:
  - `toJalaliISO()` — the former `toISOString()` behaviour (Jalali calendar, local offset)
  - `toGregorianISO()` — explicit alias for the new `toISOString()`
  - `toGregorianParts()` — Gregorian wall-clock fields in the instance's time zone
  - `formatGregorian(pattern)` — format with Gregorian fields using the same token vocabulary
  - `unix()` — epoch seconds (moment/dayjs parity)
  - `toMillis()` — epoch milliseconds as a method (dayjs parity)

## 0.0.4

### Patch Changes

- [#12](https://github.com/amiralibg/Doran/pull/12) [`61081b7`](https://github.com/amiralibg/Doran/commit/61081b70894f1b15830e87cd28ab8958803ca080) Thanks [@amiralibg](https://github.com/amiralibg)! - Migrate the build toolchain from `tsup` (no longer maintained) to
  [`tsdown`](https://tsdown.dev) (rolldown-based). The published output is
  equivalent: same `.js`/`.cjs` + `.d.ts`/`.d.cts` entry points and sourcemaps, the
  React and Web Component stylesheets ship unchanged, and `@doranjs/wc` still emits its
  self-registering `dist/doran.global.js` IIFE bundle for CDN use. No API or runtime
  behavior changes.

## 0.0.3

### Patch Changes

- [#6](https://github.com/amiralibg/Doran/pull/6) [`5ae247a`](https://github.com/amiralibg/Doran/commit/5ae247a58476585a2a9aa8062780ad8aac3d3805) Thanks [@amiralibg](https://github.com/amiralibg)! - Working-day arithmetic, natural-language ranges/durations/recurrence, and range-picker
  presets + multi-month views.
  - `@doranjs/core` — a pure, weekend-aware working-day engine: `isWeekend`, `isWorkingDay`,
    `addWorkingDays`, `nextWorkingDay`, `previousWorkingDay`, and `workingDaysBetween`.
    Each accepts `WorkingDayOptions` with a custom `weekends` set and an optional injected
    `holidays` predicate, so core stays dependency-free.
  - `@doranjs/holidays` — holiday-aware wrappers of the above (`isWorkingDay`,
    `addWorkingDays`, `nextWorkingDay`, `previousWorkingDay`, `workingDaysBetween`) that
    default the `holidays` predicate to the package's official-holiday `isHoliday`.
  - `@doranjs/nlp` — `parseRange` («از ۵ تا ۱۰ فروردین»), `parseDuration` («یک ساعت و
    نیم»), and `parseRecurrence` («هر دوشنبه», «هر دو هفته») plus an `occurrences` helper
    that expands a recurrence into concrete dates.
  - `@doranjs/react` & `@doranjs/wc` — `DoranRangePicker` / `<doran-rangepicker>` gain
    quick-pick `presets` (defaults: last 7/30 days, this month, this year) and a
    side-by-side multi-month view (`numberOfMonths` / `months`). The React `useDateRange`
    hook exposes a new `setRange`, and `defaultRangePresets` is exported from both packages.

## 0.0.2

### Patch Changes

- [`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d) Thanks [@amiralibg](https://github.com/amiralibg)! - Round out the `DoranDate` API toward moment-jalaali parity:
  - Setters: `set`, `with`, and `withYear`/`withMonth`/`withDay`/`withHour`/`withMinute`/
    `withSecond`/`withMillisecond` (immutable; the day is clamped to the target month).
  - Relative time: `fromNow`, `from`, `to`, `toNow`, backed by a locale `relativeTime`
    bundle (Persian + English).
  - New statics and helpers: `DoranDate.min`/`max`/`isValid`, `daysInYear`, and
    `isToday`/`isTomorrow`/`isYesterday`.
  - `quarter` is now a full unit (`add`/`startOf`/`endOf`/`diff`) with a `Q` format token,
    and `isBetween` accepts an inclusivity argument (`'[]' | '()' | '[)' | '(]'`).

## 0.0.1

### Patch Changes

- [`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of `@doranjs/core`: the immutable `DoranDate` engine with accurate
  Gregorian ↔ Jalali conversion, leap-year support, calendar-aware arithmetic, parsing,
  token-based formatting, time-zone support via `Intl`, and a pluggable locale system.
