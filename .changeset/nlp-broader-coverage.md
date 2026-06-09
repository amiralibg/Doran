---
'@doranjs/nlp': minor
'@doranjs/react': patch
'@doranjs/wc': patch
---

Broaden natural-language date parsing to cover more ways users phrase dates:

- Compound number-word days and counts (`بیست و یکم خرداد`), plus number words up to the
  hundreds (`صد و بیست و سه`).
- More relative days: `امشب`, `دیشب`, `پریشب`.
- Anchored named months (`اول فروردین`, `اوایل خرداد`, `اواخر اسفند`) and the
  `اوایل/اواسط/اواخر` anchors.
- Weekday + week shift (`جمعه هفته بعد`, `شنبه هفته گذشته`) resolved to the correct week.
- Relative-year qualifiers fold into an explicit date that omits its own year, so
  `۳ سال دیگه ۱۱ دی` resolves to 11 Dey of the +3 year (not the current year).
- Tolerance for the colloquial ezafe «ی» in unit phrases (`هفته‌ی بعد`).
- Extra parts of day: `نیمروز`, `سحر`, `شامگاه`.
- `parseRange` now accepts the `(ما)بین X و Y` form; `parseRecurrence` understands
  `یک روز در میان` (every other day) and `هر <part-of-day>` (e.g. `هر شب`).
- More Finglish aliases (`emshab`, `dishab`, spaced compound weekdays like `panj shanbe`,
  recurrence adverbs).

The `DoranNlpInput` / `<doran-nlp-input>` resolved-date preview now shows the year when it
differs from the current year, so dates that resolve to another year are no longer ambiguous.
