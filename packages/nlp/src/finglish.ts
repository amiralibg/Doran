/**
 * Finglish (Latin-script Persian) aliases for the date vocabulary. Lets users type
 * «farda», «jomeh saat 7 shab», «hafte baad» and still get a parse. Matching is
 * per-token and tolerant of common spelling variants.
 *
 * This is a curated map of the words the parser understands — not a general
 * transliterator. Extend it via {@link registerFinglish}.
 */
const FINGLISH: Record<string, string> = {
  // relative days
  emruz: 'امروز',
  emrooz: 'امروز',
  emrouz: 'امروز',
  emshab: 'امشب',
  farda: 'فردا',
  fardaa: 'فردا',
  pasfarda: 'پس‌فردا',
  pasfardaa: 'پس‌فردا',
  diruz: 'دیروز',
  dirooz: 'دیروز',
  dirouz: 'دیروز',
  dishab: 'دیشب',
  pariruz: 'پریروز',
  parirooz: 'پریروز',
  parishab: 'پریشب',
  // units
  ruz: 'روز',
  rooz: 'روز',
  hafte: 'هفته',
  hafteh: 'هفته',
  mah: 'ماه',
  maah: 'ماه',
  sal: 'سال',
  saal: 'سال',
  emsal: 'امسال',
  // directions
  baad: 'بعد',
  bad: 'بعد',
  badi: 'بعدی',
  ayande: 'آینده',
  ayandeh: 'آینده',
  ghabl: 'قبل',
  gozashte: 'گذشته',
  gozashteh: 'گذشته',
  digar: 'دیگر',
  dige: 'دیگر',
  digeh: 'دیگر',
  ghabli: 'قبلی',
  in: 'این',
  hamin: 'همین',
  pas: 'پس',
  // anchors
  aval: 'اول',
  avval: 'اول',
  avayel: 'اوایل',
  akhar: 'آخر',
  avakher: 'اواخر',
  vasat: 'وسط',
  avasat: 'اواسط',
  // number words used to build compound weekdays / counts
  yek: 'یک',
  do: 'دو',
  se: 'سه',
  chahar: 'چهار',
  panj: 'پنج',
  // weekdays
  shanbe: 'شنبه',
  shanbeh: 'شنبه',
  yekshanbe: 'یکشنبه',
  yekshanbeh: 'یکشنبه',
  doshanbe: 'دوشنبه',
  doshanbeh: 'دوشنبه',
  seshanbe: 'سه‌شنبه',
  seshanbeh: 'سه‌شنبه',
  chaharshanbe: 'چهارشنبه',
  chaharshanbeh: 'چهارشنبه',
  panjshanbe: 'پنجشنبه',
  panjshanbeh: 'پنجشنبه',
  jome: 'جمعه',
  jomeh: 'جمعه',
  jumeh: 'جمعه',
  jom3e: 'جمعه',
  // months
  farvardin: 'فروردین',
  ordibehesht: 'اردیبهشت',
  khordad: 'خرداد',
  tir: 'تیر',
  mordad: 'مرداد',
  amordad: 'امرداد',
  shahrivar: 'شهریور',
  mehr: 'مهر',
  aban: 'آبان',
  azar: 'آذر',
  dey: 'دی',
  bahman: 'بهمن',
  esfand: 'اسفند',
  // special days
  noruz: 'نوروز',
  nowruz: 'نوروز',
  norooz: 'نوروز',
  yalda: 'یلدا',
  // time
  saat: 'ساعت',
  saaat: 'ساعت',
  sobh: 'صبح',
  zohr: 'ظهر',
  zuhr: 'ظهر',
  nimruz: 'نیمروز',
  asr: 'عصر',
  ghorub: 'غروب',
  shab: 'شب',
  shamgah: 'شامگاه',
  bamdad: 'بامداد',
  bamdaad: 'بامداد',
  sahar: 'سحر',
  nim: 'نیم',
  rob: 'ربع',
  rob3: 'ربع',
  daghighe: 'دقیقه',
  daqiqe: 'دقیقه',
  be: 'به',
  va: 'و',
  // recurrence
  har: 'هر',
  ruzane: 'روزانه',
  roozane: 'روزانه',
  haftegi: 'هفتگی',
  mahane: 'ماهانه',
  mahiane: 'ماهیانه',
  salane: 'سالانه',
  saliane: 'سالیانه',
};

/** Registers (or overrides) a Finglish alias → Persian word. */
export function registerFinglish(latin: string, persian: string): void {
  FINGLISH[latin.toLowerCase()] = persian;
}

/**
 * Replaces recognized Finglish tokens with their Persian equivalents, leaving
 * everything else (numbers, punctuation, unknown words) untouched.
 *
 * @example
 * ```ts
 * transliterateFinglish('jomeh saat 7 shab'); // → 'جمعه ساعت 7 شب'
 * transliterateFinglish('hafteye baad');      // → 'هفته‌ye بعد' (best effort)
 * ```
 */
export function transliterateFinglish(text: string): string {
  return text
    .toLowerCase()
    .split(/(\s+)/)
    .map((token) => FINGLISH[token] ?? token)
    .join('');
}

/** Whether any token of the text is a known Finglish word. */
export function hasFinglish(text: string): boolean {
  return text
    .toLowerCase()
    .split(/\s+/)
    .some((token) => token in FINGLISH);
}
