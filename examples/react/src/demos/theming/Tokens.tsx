import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranCalendar } from '@doranjs/react';
import { type CSSProperties, useState } from 'react';

// Every part is styled by CSS variables. Override a handful of --doran-* tokens
// on a wrapper — no component overrides — and the same calendar restyles itself.
const rose: CSSProperties = {
  '--doran-day-selected-bg': '#e11d48',
  '--doran-day-today-color': '#e11d48',
  '--doran-day-today-ring': '#fb7185',
  '--doran-day-hover-bg': '#fde7ec',
  '--doran-day-radius': '10px',
} as CSSProperties;

export default function Tokens({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState(DoranDate.now());
  return (
    <div style={rose}>
      <DoranCalendar value={value} onChange={setValue} locale={locale} />
    </div>
  );
}
