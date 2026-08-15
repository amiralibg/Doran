import { DoranDate, dayKey, type DayDataMap } from '@doranjs/core';
import type { DoranCalendarElement } from '@doranjs/wc';

// Day widgets from plain HTML: `dayData` is a JS property because a map cannot
// travel as an attribute, and `legend` is a light-DOM slot child.
export default function Widgets(locale: string): HTMLElement {
  const cal = document.createElement('doran-calendar') as DoranCalendarElement;
  cal.setAttribute('locale', locale);

  const legend = document.createElement('span');
  legend.setAttribute('slot', 'legend');
  legend.textContent = 'عدد زیر هر روز، ظرفیت باقی‌مانده است';
  cal.appendChild(legend);

  const today = DoranDate.now().startOf('day');
  const dayData: DayDataMap = {};
  for (let offset = 0; offset < 45; offset += 1) {
    const day = today.addDays(offset);
    const seats = (offset * 5) % 12;
    dayData[dayKey(day)] = { text: String(seats), tone: seats <= 3 ? 'high' : 'low' };
  }
  cal.dayData = dayData;

  return cal;
}
