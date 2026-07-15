---
'@doranjs/core': patch
---

Make `toLatinDigits` actually convert digits instead of returning its input unchanged.

`toLatinDigits` was an identity function, serving as the `formatNumber` hook for the
Latin-digit locale where identity is correct. But its public name promises a
Persian/Arabic → Latin conversion, so consumers normalizing user input reached for it
and got a silent no-op — Persian-keyboard input failed `/[0-9]/` validation with no
error to trace.

It now delegates to `normalizeDigits`, handling both the Persian ۰-۹ and Arabic-Indic
٠-٩ families. This is not a breaking change: `normalizeDigits` is identity for ASCII
input, and every `formatNumber` call site passes ASCII, so Latin-locale formatting is
byte-for-byte unchanged.
