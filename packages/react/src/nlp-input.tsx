'use client';

import { DoranDate, faIR, type Locale } from '@doranjs/core';
import {
  parse,
  suggest,
  type ParseResult,
  type Suggestion,
  type SuggestOptions,
} from '@doranjs/nlp';
import { cn } from '@doranjs/ui';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';

/** State returned by {@link useNlpSuggest}. */
export interface NlpSuggestState {
  /** The resolved parse of the current text, or `null`. */
  result: ParseResult | null;
  /** Autocomplete suggestions for the current text. */
  suggestions: Suggestion[];
}

/**
 * Headless natural-language suggestion state: parses `text` and computes
 * autocomplete suggestions, memoized on the inputs. Pair with your own UI, or use
 * the ready-made {@link DoranNlpInput}.
 */
export function useNlpSuggest(text: string, options?: SuggestOptions): NlpSuggestState {
  const reference = options?.reference;
  const limit = options?.limit;
  const timeZone = options?.timeZone;

  const memoOptions = useMemo<SuggestOptions>(
    () => ({
      ...(reference ? { reference } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(timeZone ? { timeZone } : {}),
    }),
    [reference, limit, timeZone],
  );

  const result = useMemo(() => parse(text, memoOptions), [text, memoOptions]);
  const suggestions = useMemo(() => suggest(text, memoOptions), [text, memoOptions]);

  return { result, suggestions };
}

export interface DoranNlpInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (text: string) => void;
  /** Called whenever the text resolves (or stops resolving) to a date. */
  onResolve?: (result: ParseResult | null) => void;
  locale?: Locale;
  /** Reference "now" used to resolve relative expressions. */
  reference?: DoranDate;
  placeholder?: string;
  /** Format for the resolved-date hint/preview. Defaults to `dddd D MMMM` (+ time). */
  format?: string;
  /** Show the resolved-date hint at the opposite end of the input. Defaults `true`. */
  showHint?: boolean;
  /** Show the autocomplete dropdown. Defaults `true`. */
  showSuggestions?: boolean;
  /** Maximum number of suggestions. Defaults to `8`. */
  limit?: number;
  disabled?: boolean;
  className?: string;
}

interface PreviewParts {
  date: string;
  time?: string;
}

function previewParts(date: DoranDate, locale: Locale, format?: string): PreviewParts {
  const d = date.withLocale(locale);
  if (format) return { date: d.format(format) };
  const hasTime = date.hour !== 0 || date.minute !== 0;
  // Show the year only when it isn't the current one, so near-term dates stay terse but a
  // date that resolves to a different year (e.g. «۳ سال دیگه ۱۱ دی») isn't ambiguous.
  const dayFormat = hasTime ? 'D MMMM' : 'dddd D MMMM';
  const sameYear = date.year === DoranDate.now({ timeZone: date.timeZone }).year;
  const dateStr = d.format(sameYear ? dayFormat : `${dayFormat} YYYY`);
  return hasTime ? { date: dateStr, time: d.format('HH:mm') } : { date: dateStr };
}

/**
 * Renders a resolved-date preview. The date and the (numeric) time are isolated in
 * their own `<bdi>` elements so the bidi algorithm can't reorder the Persian text and
 * the clock time relative to each other.
 */
function Preview({ parts }: { parts: PreviewParts }) {
  return (
    <>
      <bdi>{parts.date}</bdi>
      {parts.time && (
        <bdi dir="ltr" className="doran-nlp__time">
          {parts.time}
        </bdi>
      )}
    </>
  );
}

/**
 * A Persian natural-language date input: type expressions like “جمعه ساعت ۷ شب” and
 * get a live autocomplete dropdown plus a resolved-date hint pinned to the opposite
 * (LTR) end of the field. Controlled or uncontrolled.
 */
export function DoranNlpInput({
  value,
  defaultValue,
  onChange,
  onResolve,
  locale = faIR,
  reference,
  placeholder = 'مثلاً: جمعه ساعت ۷ شب',
  format,
  showHint = true,
  showSuggestions = true,
  limit = 8,
  disabled,
  className,
}: DoranNlpInputProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? '');
  const text = isControlled ? value : internal;

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const suggestOptions = useMemo<SuggestOptions>(
    () => ({ limit, ...(reference ? { reference } : {}) }),
    [limit, reference],
  );
  const { result, suggestions } = useNlpSuggest(text, suggestOptions);

  const lastResolved = useRef<ParseResult | null>(null);
  useEffect(() => {
    if (result !== lastResolved.current) {
      lastResolved.current = result;
      onResolve?.(result);
    }
  }, [result, onResolve]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function update(next: string) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  function choose(suggestion: Suggestion) {
    update(suggestion.value);
    setOpen(false);
    setActive(-1);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setOpen(true);
        setActive((i) => (i + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setOpen(true);
        setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
        break;
      case 'Enter':
        if (open && active >= 0 && suggestions[active]) {
          event.preventDefault();
          choose(suggestions[active]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setActive(-1);
        break;
      default:
        break;
    }
  }

  const showList = showSuggestions && open && suggestions.length > 0;
  const hintParts =
    showHint && text.trim() && result ? previewParts(result.date, locale, format) : null;
  const hintUnknown = showHint && text.trim().length > 0 && !result;

  return (
    <div ref={rootRef} className={cn('doran-nlp', className)} dir="rtl">
      <div className="doran-nlp__field">
        <input
          ref={inputRef}
          type="text"
          className="doran-nlp__input"
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          dir="rtl"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showList}
          aria-controls={showList ? listId : undefined}
          aria-autocomplete="list"
          onChange={(e) => {
            update(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        {hintParts && (
          <span className="doran-nlp__hint" aria-hidden>
            <Preview parts={hintParts} />
          </span>
        )}
        {hintUnknown && (
          <span className="doran-nlp__hint doran-nlp__hint--unknown" aria-hidden>
            نامشخص
          </span>
        )}
      </div>

      {showList && (
        <ul className="doran-nlp__suggestions" id={listId} role="listbox">
          {suggestions.map((s, i) => (
            <li key={`${s.value}-${i}`} role="option" aria-selected={i === active}>
              <button
                type="button"
                className={cn(
                  'doran-nlp__suggestion',
                  i === active && 'doran-nlp__suggestion--active',
                )}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(s)}
              >
                <span>{s.label}</span>
                {s.date && (
                  <span className="doran-nlp__suggestion-preview">
                    <Preview parts={previewParts(s.date, locale, format)} />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
