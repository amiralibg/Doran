import { faIR, type Locale } from '@doranjs/core';
import { DoranNlpInput } from '@doranjs/react';

// Type natural Persian like «پنجشنبهٔ بعد ساعت ۵»; a live preview of the parsed
// date appears beneath the input (`showHint`, on by default).
export default function Default({ locale = faIR }: { locale?: Locale }) {
  return (
    <DoranNlpInput
      defaultValue="پنجشنبهٔ بعد ساعت ۵"
      placeholder="مثلاً: فردا ساعت ۹ صبح"
      locale={locale}
    />
  );
}
