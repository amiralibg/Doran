# Architecture

Doran follows **domain-driven package boundaries** with a strict, one-directional
dependency graph. Each package owns a single concern and exposes a stable, strongly
typed surface.

## Dependency graph

```
@doranjs/holidays ─┐        ┌── @doranjs/nlp
                   ▼        ▼
                 @doranjs/core
                   ▲        ▲
@doranjs/react ────┘        └──── @doranjs/wc
   │  (also → @doranjs/nlp)         (also → @doranjs/nlp + @doranjs/holidays)
   └──▶ @doranjs/ui  (peer, theming)
```

- **`@doranjs/core`** has **zero runtime dependencies** and no knowledge of UI.
- **`@doranjs/nlp`** and **`@doranjs/holidays`** depend only on the core.
- **`@doranjs/react`** depends on the core and **`@doranjs/nlp`** (for the natural-language
  input), and uses **`@doranjs/ui`** as a peer for theming and primitives.
- **`@doranjs/wc`** ships framework-agnostic Web Components built on the core,
  **`@doranjs/nlp`**, and **`@doranjs/holidays`** — usable in plain HTML or any framework.
- **`@doranjs/ui`** is a standalone design system (the React peer of `@doranjs/react`).

## Core design decisions

### Immutability

`DoranDate` is immutable. Every operation returns a new instance, which makes dates safe
to share, memoize, and use as React state.

### Instant + time zone model

A `DoranDate` stores an absolute instant (epoch milliseconds) and an IANA time zone.
Civil (wall-clock) Jalali fields are _derived_ by projecting the instant into the zone.
This keeps every conversion and time-zone change exact, and is implemented purely on top
of the standard `Intl` API — no time-zone database is bundled.

### Julian Day Number pivot

All calendar conversions pivot through the **Julian Day Number (JDN)**. Both Gregorian↔
JDN and Jalali↔JDN are exact integer operations, so day arithmetic is trivial and
round-trips never drift. The Jalali algorithm is the well-established Borkowski / jalaali
implementation, validated by an exhaustive day-by-day round-trip test.

### Calendar vs. duration arithmetic

- **Calendar units** (`addDays`, `addMonths`, `addYears`) operate on civil fields and
  clamp overflowing days (e.g. Esfand 30 → 29 in a common year).
- **Duration units** (`addHours`, `addMinutes`, …) operate on the absolute instant.

This mirrors how humans reason about "next month" vs. "in 24 hours".

## Extensibility

- **Locales** — register additional locales with `registerLocale`.
- **NLP** — the parser is a pipeline of day/time extractors; register your own with
  `Parser.useDay` / `Parser.useTime`, and add Finglish aliases with `registerFinglish`.
- **Holidays** — register custom solar or lunar holidays.
- **React** — every component is built on headless primitives (`buildMonthGrid`,
  `useCalendar`, `useDateRange`, `useNlpSuggest`) you can use to build a bespoke UI.
- **Web Components** — the same UI as custom elements (`<doran-calendar>`, …) for any
  framework or plain HTML; see [`@doranjs/wc`](/api/wc).

## Quality bar

Calendar correctness is the project's top priority. Any change to conversion, leap-year,
or arithmetic logic must ship with tests covering reference dates, leap-year edge cases,
and round-trip conversions.
