import { describe, expect, it } from 'vitest';
import { enUS, faIR } from './locale';
import { applyFormatMask, isMaskableFormat } from './input-mask';

describe('isMaskableFormat', () => {
  it('accepts digit-and-literal formats', () => {
    expect(isMaskableFormat('YYYY/MM/DD')).toBe(true);
    expect(isMaskableFormat('MM-DD-YY')).toBe(true);
    expect(isMaskableFormat('YYYY/MM/DD HH:mm')).toBe(true);
    expect(isMaskableFormat('HH:mm:ss')).toBe(true);
  });

  it('rejects formats with text tokens', () => {
    expect(isMaskableFormat('D MMMM YYYY')).toBe(false);
    expect(isMaskableFormat('dddd YYYY/MM/DD')).toBe(false);
    expect(isMaskableFormat('hh:mm A')).toBe(false);
    expect(isMaskableFormat('YYYY/MM/DD Z')).toBe(false);
  });
});

describe('applyFormatMask', () => {
  it('inserts separators as fields fill up', () => {
    expect(applyFormatMask('1', 'YYYY/MM/DD', { locale: enUS })).toMatchObject({ text: '1' });
    expect(applyFormatMask('1402', 'YYYY/MM/DD', { locale: enUS })).toMatchObject({
      text: '1402',
    });
    expect(applyFormatMask('14020', 'YYYY/MM/DD', { locale: enUS })).toMatchObject({
      text: '1402/0',
    });
    expect(applyFormatMask('14020512', 'YYYY/MM/DD', { locale: enUS })).toMatchObject({
      text: '1402/05/12',
      caret: 10,
    });
  });

  it('honours any developer-supplied format', () => {
    expect(applyFormatMask('05121402', 'MM-DD-YYYY', { locale: enUS }).text).toBe('05-12-1402');
    expect(applyFormatMask('051202', 'MM - DD - YY', { locale: enUS }).text).toBe('05 - 12 - 02');
    expect(applyFormatMask('12051402', 'DD.MM.YYYY', { locale: enUS }).text).toBe('12.05.1402');
  });

  it('normalizes typed separators to the format’s own', () => {
    expect(applyFormatMask('1402-5-12', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1402/05/12');
    expect(applyFormatMask('1402/5/12', 'YYYY-MM-DD', { locale: enUS }).text).toBe('1402-05-12');
  });

  it('lets a typed separator close a field, so 1-2 is not month 12', () => {
    // Without the separator the digits would read as month 12; with it they are
    // month 1 and day 2, which is what the user typed.
    expect(applyFormatMask('1402-1-2', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1402/01/2');
    expect(applyFormatMask('1402/1/2', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1402/01/2');
    expect(applyFormatMask('1412', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1412');
  });

  it('leaves a single-letter token unpadded when a separator closes it', () => {
    expect(applyFormatMask('9-5-1402', 'M/D/YYYY', { locale: enUS }).text).toBe('9/5/1402');
  });

  it('advances to the next field when a digit cannot fit the current one', () => {
    // 95 is no month, so the 9 is month 09 and the 5 starts the day.
    expect(applyFormatMask('140295', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1402/09/5');
    // 19 is no month either: month 01, day 9.
    expect(applyFormatMask('1402199', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1402/01/09');
    // Day tops out at 31, so a second 5 has nowhere left to go and is dropped.
    expect(applyFormatMask('1402955', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1402/09/05');
    // Same rule with no separators at all in the format.
    expect(applyFormatMask('951402', 'M/D/YYYY', { locale: enUS }).text).toBe('9/5/1402');
    // 12 is a month, so it stays whole.
    expect(applyFormatMask('140212', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1402/12');
  });

  it('applies each field’s own ceiling', () => {
    expect(applyFormatMask('1402/05/', 'YYYY/MM/DD HH:mm', { locale: enUS }).text).toBe('1402/05/');
    // Hours cap at 23 and minutes at 59, so 9 then 9 advances in both.
    expect(applyFormatMask('14020512 99', 'YYYY/MM/DD HH:mm', { locale: enUS }).text).toBe(
      '1402/05/12 09:9',
    );
    expect(applyFormatMask('14020512 2359', 'YYYY/MM/DD HH:mm', { locale: enUS }).text).toBe(
      '1402/05/12 23:59',
    );
  });

  it('shows the separator as soon as the user types one', () => {
    expect(applyFormatMask('1402/', 'YYYY/MM/DD', { locale: enUS })).toEqual({
      text: '1402/',
      caret: 5,
    });
    expect(applyFormatMask('1402/5/', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1402/05/');
  });

  it('accepts Persian digits and renders the locale’s numerals', () => {
    expect(applyFormatMask('14020512', 'YYYY/MM/DD', { locale: faIR }).text).toBe('۱۴۰۲/۰۵/۱۲');
    expect(applyFormatMask('۱۴۰۲/۰۵/۱۲', 'YYYY/MM/DD', { locale: faIR }).text).toBe('۱۴۰۲/۰۵/۱۲');
  });

  it('masks time fields too', () => {
    expect(applyFormatMask('14020512 1030', 'YYYY/MM/DD HH:mm', { locale: enUS }).text).toBe(
      '1402/05/12 10:30',
    );
  });

  it('drops digits beyond what the format can hold', () => {
    expect(applyFormatMask('140205123', 'YYYY/MM/DD', { locale: enUS }).text).toBe('1402/05/12');
  });

  it('leaves prose untouched so the field can flag it invalid', () => {
    expect(applyFormatMask('not a date', 'YYYY/MM/DD', { locale: enUS }).text).toBe('not a date');
    expect(applyFormatMask('14a02', 'YYYY/MM/DD', { locale: enUS }).text).toBe('14a02');
  });

  it('leaves text alone when the format is not maskable', () => {
    expect(applyFormatMask('11 خرداد', 'D MMMM YYYY', { locale: faIR }).text).toBe('11 خرداد');
  });

  it('returns empty text unchanged', () => {
    expect(applyFormatMask('', 'YYYY/MM/DD')).toMatchObject({ text: '', caret: 0 });
  });

  it('is idempotent — re-masking its own output changes nothing', () => {
    for (const format of ['YYYY/MM/DD', 'MM-DD-YYYY', 'M/D/YYYY', 'YYYY/MM/DD HH:mm']) {
      for (const raw of ['1', '14', '1402', '1402/', '14025', '140295', '14020512', '1402-1-2']) {
        const once = applyFormatMask(raw, format, { locale: enUS }).text;
        expect(applyFormatMask(once, format, { locale: enUS }).text).toBe(once);
      }
    }
  });

  it('places the caret after an auto-inserted separator', () => {
    // Typing the 5th digit completes the year, so `/` appears and the caret follows.
    const result = applyFormatMask('14020', 'YYYY/MM/DD', { locale: enUS, caret: 5 });
    expect(result).toEqual({ text: '1402/0', caret: 6 });
  });

  it('keeps the caret in place when typing inside the text', () => {
    const result = applyFormatMask('1402/12', 'YYYY/MM/DD', { locale: enUS, caret: 5 });
    expect(result.text).toBe('1402/12');
    expect(result.caret).toBe(5);
  });

  it('counts only typed digits, so an inserted pad does not drag the caret back', () => {
    // `1402/9` + `5` → the mask supplies the `0` of `09`; the caret still belongs
    // after the 5 the user just typed.
    const result = applyFormatMask('1402/95', 'YYYY/MM/DD', { locale: enUS, caret: 7 });
    expect(result).toEqual({ text: '1402/09/5', caret: 9 });
  });

  it('treats a missing caret as the end of the text', () => {
    expect(applyFormatMask('14020512', 'YYYY/MM/DD', { locale: enUS }).caret).toBe(10);
  });
});

describe('applyFormatMask deletion', () => {
  it('backs up through separators the mask would put straight back', () => {
    // Backspace on the second `/` of `1402/05/12` removes it without any digit
    // disappearing; the mask must drop the preceding digit instead of re-inserting
    // the separator under the caret.
    const result = applyFormatMask('1402/0512', 'YYYY/MM/DD', {
      locale: enUS,
      caret: 7,
      previous: '1402/05/12',
    });
    expect(result.text).toBe('1402/01/2');
    expect(result.caret).toBe(6);
  });

  it('deletes digits normally when digits were removed', () => {
    const result = applyFormatMask('1402/05/1', 'YYYY/MM/DD', {
      locale: enUS,
      caret: 9,
      previous: '1402/05/12',
    });
    expect(result.text).toBe('1402/05/1');
  });

  it('keeps a separator the user still has text behind, then lets it go', () => {
    // Deleting the last digit leaves the separator the user typed through…
    const trailing = applyFormatMask('1402/05/', 'YYYY/MM/DD', {
      locale: enUS,
      caret: 8,
      previous: '1402/05/1',
    });
    expect(trailing.text).toBe('1402/05/');

    // …and the next backspace takes it.
    const again = applyFormatMask('1402/05', 'YYYY/MM/DD', {
      locale: enUS,
      caret: 7,
      previous: '1402/05/',
    });
    expect(again.text).toBe('1402/05');
  });

  it('walks all the way back to empty without ever sticking', () => {
    let text = applyFormatMask('14020512', 'YYYY/MM/DD', { locale: enUS }).text;
    const seen = [text];
    for (let i = 0; i < 20 && text !== ''; i++) {
      const caret = text.length - 1;
      const next = applyFormatMask(text.slice(0, -1), 'YYYY/MM/DD', {
        locale: enUS,
        caret,
        previous: text,
      });
      expect(next.text).not.toBe(text); // never traps backspace
      text = next.text;
      seen.push(text);
    }
    expect(text).toBe('');
    expect(seen).toEqual([
      '1402/05/12',
      '1402/05/1',
      '1402/05/',
      '1402/05',
      '1402/0',
      '1402/',
      '1402',
      '140',
      '14',
      '1',
      '',
    ]);
  });
});

describe('applyFormatMask keystroke by keystroke', () => {
  /** Replays `keys` one character at a time the way a field would. */
  function typeOut(keys: string, format: string): string[] {
    let text = '';
    let caret = 0;
    const frames: string[] = [];
    for (const key of keys) {
      const raw = text.slice(0, caret) + key + text.slice(caret);
      const result = applyFormatMask(raw, format, {
        locale: enUS,
        caret: caret + 1,
        previous: text,
      });
      text = result.text;
      caret = result.caret;
      frames.push(text);
    }
    return frames;
  }

  it('flows bare digits into the format', () => {
    expect(typeOut('14020512', 'YYYY/MM/DD')).toEqual([
      '1',
      '14',
      '140',
      '1402',
      '1402/0',
      '1402/05',
      '1402/05/1',
      '1402/05/12',
    ]);
  });

  it('honours separators the user types along the way', () => {
    expect(typeOut('1402/1/2', 'YYYY/MM/DD')).toEqual([
      '1',
      '14',
      '140',
      '1402',
      '1402/',
      '1402/1',
      '1402/01/',
      '1402/01/2',
    ]);
  });

  it('auto-advances a month that cannot take another digit', () => {
    expect(typeOut('9512025', 'M/D/YYYY')).toEqual([
      '9',
      '9/5',
      '9/5/1',
      '9/5/12',
      '9/5/120',
      '9/5/1202',
      '9/5/1202',
    ]);
  });

  it('keeps the caret at the end throughout', () => {
    let text = '';
    let caret = 0;
    for (const key of '14020512') {
      const result = applyFormatMask(text + key, 'YYYY/MM/DD', {
        locale: enUS,
        caret: text.length + 1,
        previous: text,
      });
      text = result.text;
      caret = result.caret;
      expect(caret).toBe(text.length);
    }
  });
});
