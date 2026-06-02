import { DoranDate, type DoranDateOptions, enUS, faIR, type Locale } from '@doranjs/core';

/** Resolves a locale attribute (`fa`, `fa-IR`, `en`, `en-US`) to a {@link Locale}. */
export function resolveLocaleAttr(name: string | null): Locale {
  if (!name) return faIR;
  return /^en/i.test(name) ? enUS : faIR;
}

/** Parses a `YYYY/MM/DD` (or `-` separated) Jalali attribute. Returns `null` if invalid. */
export function parseJalaliAttr(
  value: string | null,
  options?: DoranDateOptions,
): DoranDate | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{3,4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  try {
    return DoranDate.fromJalali({ year, month, day }, options);
  } catch {
    return null;
  }
}

/** Whether a boolean-style attribute is present and truthy. */
export function boolAttr(el: Element, name: string): boolean {
  if (!el.hasAttribute(name)) return false;
  const v = el.getAttribute(name);
  return v !== 'false' && v !== '0';
}

/** Escapes text for safe interpolation into innerHTML. */
export function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Combines a day and a `{hour, minute}` time into a single instant. */
export function withTime(day: DoranDate, time: { hour: number; minute: number }): DoranDate {
  return day.startOf('day').addHours(time.hour).addMinutes(time.minute);
}
