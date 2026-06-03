import { faIR, type Locale } from '@doranjs/core';
import { DoranNlpInput } from '@doranjs/react';

// `showSuggestions` surfaces completion suggestions under the input as you type.
export default function Suggestions({ locale = faIR }: { locale?: Locale }) {
  return (
    <DoranNlpInput
      showSuggestions
      defaultValue="هفتهٔ"
      placeholder="شروع به تایپ کنید…"
      locale={locale}
    />
  );
}
