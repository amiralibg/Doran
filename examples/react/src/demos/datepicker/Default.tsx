import { DoranDate, faIR, type Locale } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/react';
import { useState } from 'react';

// A date input that opens a calendar popover on click.
export default function Default({ locale = faIR }: { locale?: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(DoranDate.now());
  return <DoranDatePicker value={value} onChange={setValue} locale={locale} />;
}
