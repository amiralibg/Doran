import { DoranDate } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/react';
import { useState } from 'react';
import type { Locale } from '@doranjs/core';

export default function Customization({ locale }: { locale: Locale }) {
  const [value, setValue] = useState<DoranDate | null>(DoranDate.now());

  return (
    <DoranDatePicker
      value={value}
      onChange={setValue}
      locale={locale}
      footerActions={['today', 'clear']}
      iconPosition="right"
      textAlign="left"
      inputWidth="18rem"
      dropdownWidth="trigger"
    />
  );
}
