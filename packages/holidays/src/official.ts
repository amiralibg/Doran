/**
 * Authoritative, per-year lunar-holiday dates from published Iranian calendars.
 *
 * Iran's religious holidays follow the **observational** lunar calendar, announced
 * each year by moon-sighting — so they cannot be computed exactly in advance, and even
 * popular calendars sometimes disagree by ±1 day for far-out years. When a year is
 * present here, these official Solar Hijri (Jalali) dates are used **in preference to**
 * the arithmetic tabular calendar; otherwise the tabular calc is used and flagged
 * `approximate`.
 *
 * Entries are keyed by the holiday's `titleEn` (matching {@link LUNAR_HOLIDAYS}).
 * Add more years with {@link registerOfficialLunarYear}.
 */
export interface OfficialLunarDate {
  /** Matches a `titleEn` in `LUNAR_HOLIDAYS`. */
  titleEn: string;
  /** Solar Hijri (Jalali) month, 1–12. */
  month: number;
  /** Solar Hijri (Jalali) day. */
  day: number;
}

const builtIn: Record<number, OfficialLunarDate[]> = {
  // 1404 — verified against published Iranian calendars.
  1404: [
    { titleEn: 'Eid al-Fitr', month: 1, day: 11 },
    { titleEn: 'Eid al-Fitr Holiday', month: 1, day: 12 },
    { titleEn: 'Eid al-Adha', month: 3, day: 16 },
    { titleEn: 'Eid al-Ghadir', month: 3, day: 24 },
    { titleEn: 'Tasua', month: 4, day: 13 },
    { titleEn: 'Ashura', month: 4, day: 14 },
    { titleEn: 'Arbaeen', month: 5, day: 23 },
  ],
  // 1405 — from published Iranian calendars (e.g. gamutprint/bahesab).
  1405: [
    { titleEn: 'Eid al-Fitr', month: 1, day: 1 },
    { titleEn: 'Eid al-Fitr Holiday', month: 1, day: 2 },
    { titleEn: 'Martyrdom of Imam Sadiq', month: 1, day: 25 },
    { titleEn: 'Eid al-Adha', month: 3, day: 6 },
    { titleEn: 'Eid al-Ghadir', month: 3, day: 14 },
    { titleEn: 'Tasua', month: 4, day: 3 },
    { titleEn: 'Ashura', month: 4, day: 4 },
    { titleEn: 'Arbaeen', month: 5, day: 13 },
    { titleEn: 'Demise of the Prophet & Martyrdom of Imam Hasan', month: 5, day: 21 },
    { titleEn: 'Martyrdom of Imam Reza', month: 5, day: 22 },
    { titleEn: 'Birth of the Prophet & Imam Sadiq', month: 6, day: 8 },
    { titleEn: 'Martyrdom of Fatimah', month: 8, day: 2 },
    { titleEn: 'Birth of Imam Ali', month: 10, day: 2 },
    { titleEn: "Prophet's Mission (Mab'ath)", month: 10, day: 16 },
    { titleEn: 'Laylat al-Qadr (19th)', month: 12, day: 6 },
    { titleEn: 'Martyrdom of Imam Ali', month: 12, day: 9 },
    { titleEn: 'Laylat al-Qadr (23rd)', month: 12, day: 10 },
  ],
};

const overrides: Record<number, OfficialLunarDate[]> = { ...builtIn };

/**
 * Registers (or replaces) the authoritative lunar-holiday dates for a Jalali year.
 * Useful for keeping future years exact as Iran announces them.
 *
 * @example
 * ```ts
 * registerOfficialLunarYear(1406, [
 *   { titleEn: 'Eid al-Ghadir', month: 2, day: 25 },
 *   // …
 * ]);
 * ```
 */
export function registerOfficialLunarYear(year: number, dates: OfficialLunarDate[]): void {
  overrides[year] = dates;
}

/** Returns the official lunar dates for a year, or `undefined` if none are registered. */
export function getOfficialLunarDates(year: number): OfficialLunarDate[] | undefined {
  return overrides[year];
}

/**
 * The Jalali years with authoritative dates on file, ascending.
 *
 * Iran announces its religious holidays by moon sighting, so no library can compute
 * them exactly in advance. Use this to tell a user when the dates they are looking at
 * are announced rather than arithmetic.
 */
export function getOfficialLunarYears(): number[] {
  return Object.keys(overrides)
    .map(Number)
    .sort((a, b) => a - b);
}

/** Whether a year's lunar dates come from Iran's announcements rather than arithmetic. */
export function hasOfficialLunarDates(year: number): boolean {
  return overrides[year] !== undefined;
}

/** Resets the official-date overrides to the built-in set (mainly for tests). */
export function resetOfficialLunarYears(): void {
  for (const key of Object.keys(overrides)) delete overrides[Number(key)];
  Object.assign(overrides, builtIn);
}
