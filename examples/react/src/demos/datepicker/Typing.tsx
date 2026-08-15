import { type Locale } from '@doranjs/core';
import { DoranDatePicker } from '@doranjs/react';
import { useState } from 'react';

/**
 * The trigger is a real text field: type `1402512` and the separators land on their
 * own — `1402/05/12` — while the calendar follows along. Typing a separator yourself
 * closes the field early, so `1402-1-2` is month 1 / day 2, and `۱۴۰۲/۰۵/۱۲` from a
 * Persian keyboard parses just the same.
 *
 * `valueFormat` decides what `onChange` hands back — here a `YYYY-MM-DD` string,
 * the shape you would keep in a query param, so no conversion wrapper is needed.
 * Errors appear on blur rather than per keystroke, and text that doesn't parse is
 * kept so it can be corrected.
 */
export default function Typing({ locale }: { locale: Locale }) {
  const [value, setValue] = useState<string | null>(null);
  const [invalidText, setInvalidText] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <DoranDatePicker
        valueFormat="YYYY-MM-DD"
        value={value}
        onChange={setValue}
        onParseError={setInvalidText}
        locale={locale}
        placeholder="۱۴۰۲/۰۵/۱۲"
        aria-describedby="typing-status"
        inputWidth="14rem"
      />
      <small id="typing-status" style={{ fontSize: '0.78rem' }}>
        {invalidText ? (
          <span style={{ color: 'var(--doran-danger)' }}>«{invalidText}» تاریخ معتبری نیست</span>
        ) : (
          <span style={{ color: 'var(--doran-text-muted)' }}>
            مقدار: <code>{value ?? '—'}</code>
          </span>
        )}
      </small>
    </div>
  );
}
