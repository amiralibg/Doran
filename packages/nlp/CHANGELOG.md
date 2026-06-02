# @doranjs/nlp

## 0.0.2

### Patch Changes

- [`4362f94`](https://github.com/amiralibg/Doran/commit/4362f945148e1618b4b432c1e52d04be94146587) Thanks [@amiralibg](https://github.com/amiralibg)! - Expand and harden the Persian date parser:
  - Understands more expressions: explicit and numeric dates (`۱۵ خرداد`, `۱۴۰۵/۰۳/۲۰`),
    `این هفته/ماه`, `آخر هفته`, time fractions and "to" forms (`ساعت ۷ و نیم`, `یک ربع به ۸`),
    and correct `۱۲ شب`/`۱۲ ظهر` handling.
  - New `suggest()` autocomplete API with properly half-spaced (ZWNJ) labels.
  - Forgiving input: folds spelling variants, remaps text typed with the keyboard left in
    English (`tvnh` → «فردا»), and accepts Finglish (`jomeh saat 7 shab`). New exports:
    `remapKeyboard`, `transliterateFinglish`, `registerFinglish`.

- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d)]:
  - @doranjs/core@0.0.2

## 0.0.1

### Patch Changes

- [`4362f94`](https://github.com/amiralibg/Doran/commit/4362f945148e1618b4b432c1e52d04be94146587) Thanks [@amiralibg](https://github.com/amiralibg)! - Initial release of `@doranjs/nlp`: a modular, extensible Persian natural-language date
  parser. Understands relative days, weekdays, unit arithmetic, month anchors, special
  days, and time-of-day expressions, returning a `DoranDate` with a confidence score.
- Updated dependencies [[`6d9e33b`](https://github.com/amiralibg/Doran/commit/6d9e33b5e6aee657a585062320d7c6bb3248fc3d)]:
  - @doranjs/core@0.0.1
