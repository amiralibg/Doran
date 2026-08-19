import { type DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/react';
import { useState } from 'react';
import type { Locale } from '@doranjs/core';

export default function PickOnly({ locale }: { locale: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(null);

  return (
    <DoranDatePicker
      value={value}
      onChange={setValue}
      locale={locale}
      // The trigger becomes a button: the whole field opens the calendar and
      // no on-screen keyboard ever appears over it.
      editable={false}
      mode="auto"
      inputWidth="14rem"
    />
  );
}
