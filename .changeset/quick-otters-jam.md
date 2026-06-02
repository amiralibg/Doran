---
'@doranjs/nlp': patch
---

Expand and harden the Persian date parser:

- Understands more expressions: explicit and numeric dates (`۱۵ خرداد`, `۱۴۰۵/۰۳/۲۰`),
  `این هفته/ماه`, `آخر هفته`, time fractions and "to" forms (`ساعت ۷ و نیم`, `یک ربع به ۸`),
  and correct `۱۲ شب`/`۱۲ ظهر` handling.
- New `suggest()` autocomplete API with properly half-spaced (ZWNJ) labels.
- Forgiving input: folds spelling variants, remaps text typed with the keyboard left in
  English (`tvnh` → «فردا»), and accepts Finglish (`jomeh saat 7 shab`). New exports:
  `remapKeyboard`, `transliterateFinglish`, `registerFinglish`.
