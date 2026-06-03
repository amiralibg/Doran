import { faIR, type Locale } from '@doranjs/core';
import { DoranNlpInput } from '@doranjs/react';
import { type ParseResult } from '@doranjs/nlp';
import { useState } from 'react';

// `onResolve` hands you the parsed result (a DoranDate plus confidence) so you
// can use it in your app.
export default function Resolve({ locale = faIR }: { locale?: Locale }) {
  const [result, setResult] = useState<ParseResult | null>(null);
  return (
    <>
      <DoranNlpInput defaultValue="فردا ساعت ۱۰" onResolve={setResult} locale={locale} />
      <p className="result">
        {result ? result.date.withLocale(locale).format('dddd D MMMM YYYY — HH:mm') : '—'}
      </p>
    </>
  );
}
