# Architecture

Doran follows **domain-driven package boundaries** with a strict, one-directional
dependency graph. Each package owns a single concern and exposes a stable, strongly
typed surface.

## Dependency graph

```
@doranjs/ui      @doranjs/react ─┐
                             ├──▶ @doranjs/core ◀── @doranjs/nlp
@doranjs/holidays ─────────────┘
```

- **`@doranjs/core`** has **zero runtime dependencies** and no knowledge of UI.
- **`@doranjs/nlp`**, **`@doranjs/holidays`**, and **`@doranjs/react`** depend only on the core.
- **`@doranjs/react`** uses **`@doranjs/ui`** for theming and primitives.

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
  `Parser.useDay` / `Parser.useTime`.
- **Holidays** — register custom solar or lunar holidays.
- **React** — every component is built on headless primitives (`buildMonthGrid`,
  `useCalendar`, `useDateRange`) you can use to build a bespoke UI.

## Quality bar

Calendar correctness is the project's top priority. Any change to conversion, leap-year,
or arithmetic logic must ship with tests covering reference dates, leap-year edge cases,
and round-trip conversions.
