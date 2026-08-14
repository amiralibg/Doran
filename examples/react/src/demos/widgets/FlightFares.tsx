import { DoranDate, type Locale } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/react';
import { useMemo, useState } from 'react';

/**
 * Fares under each day, the cheapest one highlighted, and sold-out departures
 * blocked with a reason — the airline-booking pattern from issue #52.
 *
 * `dayContent` renders the price, `dayProps` carries the styling hook and the
 * screen-reader label, and `disabledDates` blocks the sold-out days.
 */

/** Deterministic fares so the demo renders identically every time. */
function buildFares(today: DoranDate): Map<string, number | null> {
  const fares = new Map<string, number | null>();
  for (let offset = 0; offset < 90; offset += 1) {
    const day = today.addDays(offset);
    const key = `${day.year}-${day.month}-${day.day}`;
    // Every eleventh day is sold out; Thursdays and Fridays carry a weekend premium.
    if (offset % 11 === 7) {
      fares.set(key, null);
      continue;
    }
    const weekendPremium = day.dayOfWeek >= 5 ? 900_000 : 0;
    fares.set(key, 1_200_000 + ((offset * 137_000) % 1_500_000) + weekendPremium);
  }
  return fares;
}

function formatToman(value: number, locale: Locale): string {
  return locale.formatNumber(value.toLocaleString('en-US').replace(/,/g, '٬'));
}

export default function FlightFares({ locale }: { locale: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(null);
  const today = useMemo(() => DoranDate.now().startOf('day'), []);
  const fares = useMemo(() => buildFares(today), [today]);

  const cheapest = useMemo(() => {
    let best: { key: string; fare: number } | null = null;
    for (const [key, fare] of fares) {
      if (fare !== null && (!best || fare < best.fare)) best = { key, fare };
    }
    return best?.key ?? null;
  }, [fares]);

  const keyOf = (day: DoranDate) => `${day.year}-${day.month}-${day.day}`;

  return (
    <DoranDatePicker
      value={value}
      onChange={setValue}
      locale={locale}
      min={today}
      placeholder="تاریخ پرواز"
      inputWidth="14rem"
      disabledDates={(day) => fares.get(keyOf(day)) === null}
      dayContent={(day) => {
        const fare = fares.get(keyOf(day));
        if (fare == null) return null;
        return formatToman(Math.round(fare / 1000), locale);
      }}
      dayProps={(day) => {
        const key = keyOf(day);
        const fare = fares.get(key);
        if (fare === null) {
          return { disabledReason: 'ظرفیت تکمیل است' };
        }
        if (fare === undefined) return undefined;
        // The visible text is abbreviated to thousands, so spell the real number out
        // for screen readers rather than letting them read "۱٬۲۰۰".
        return {
          label: `${formatToman(fare, locale)} تومان`,
          ...(key === cheapest ? { 'data-cheapest': 'true', title: 'ارزان‌ترین نرخ ماه' } : {}),
        };
      }}
    />
  );
}
