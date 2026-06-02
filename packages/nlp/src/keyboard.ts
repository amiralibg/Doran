/**
 * Maps a US-QWERTY keystroke to the character it produces on the standard Persian
 * keyboard layout (ISIRI 9147). This rescues input typed with the keyboard left in
 * English by mistake — e.g. someone meaning to type «یزد» types `dcn`, or «فردا»
 * comes out as `tvnh`.
 */
const EN_TO_FA: Record<string, string> = {
  // top letter row
  q: 'ض',
  w: 'ص',
  e: 'ث',
  r: 'ق',
  t: 'ف',
  y: 'غ',
  u: 'ع',
  i: 'ه',
  o: 'خ',
  p: 'ح',
  '[': 'ج',
  ']': 'چ',
  // home row
  a: 'ش',
  s: 'س',
  d: 'ی',
  f: 'ب',
  g: 'ل',
  h: 'ا',
  j: 'ت',
  k: 'ن',
  l: 'م',
  ';': 'ک',
  "'": 'گ',
  // bottom row
  z: 'ظ',
  x: 'ط',
  c: 'ز',
  v: 'ر',
  b: 'ذ',
  n: 'د',
  m: 'پ',
  ',': 'و',
  '.': '.',
  '/': '/',
  // shifted symbols that commonly carry Persian letters
  X: 'ژ',
  '"': 'ء',
};

/**
 * Re-maps a string typed on a US keyboard while the OS layout was (meant to be)
 * Persian. Characters with no Persian equivalent (including spaces and digits) are
 * left as-is.
 *
 * @example
 * ```ts
 * remapKeyboard('dcn');  // → 'یزد'
 * remapKeyboard('tvnh'); // → 'فردا'
 * ```
 */
export function remapKeyboard(text: string): string {
  let out = '';
  for (const ch of text) {
    out += EN_TO_FA[ch] ?? EN_TO_FA[ch.toLowerCase()] ?? ch;
  }
  return out;
}

/** Whether the text contains ASCII letters worth attempting a keyboard remap on. */
export function hasLatinLetters(text: string): boolean {
  return /[a-z]/i.test(text);
}
