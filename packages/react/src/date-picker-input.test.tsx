import { DoranDate } from '@doranjs/core';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DoranDatePicker } from './date-picker';

const UTC = { timeZone: 'UTC' };

function field() {
  return screen.getByRole('textbox') as HTMLInputElement;
}

function type(text: string) {
  fireEvent.change(field(), { target: { value: text } });
}

describe('typing a date', () => {
  it('parses the format the picker itself displays', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker onChange={onChange} />);

    type('1402/05/12');

    expect(onChange).toHaveBeenCalledTimes(1);
    const picked = onChange.mock.calls[0]![0] as DoranDate;
    expect([picked.year, picked.month, picked.day]).toEqual([1402, 5, 12]);
  });

  it('accepts unpadded and dash-separated input', () => {
    const onChange = vi.fn();
    const { rerender } = render(<DoranDatePicker onChange={onChange} />);

    type('1402/5/12');
    expect((onChange.mock.calls[0]![0] as DoranDate).day).toBe(12);

    rerender(<DoranDatePicker onChange={onChange} key="second" />);
    type('1402-5-12');
    expect((onChange.mock.calls.at(-1)![0] as DoranDate).day).toBe(12);
  });

  it('accepts Persian digits, which is what a Persian keyboard produces', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker onChange={onChange} />);

    type('۱۴۰۲/۰۵/۱۲');

    const picked = onChange.mock.calls[0]![0] as DoranDate;
    expect([picked.year, picked.month, picked.day]).toEqual([1402, 5, 12]);
  });

  it('emits null when the field is cleared', () => {
    const onChange = vi.fn();
    render(
      <DoranDatePicker defaultValue={DoranDate.fromJalali(1405, 3, 15, UTC)} onChange={onChange} />,
    );

    type('');

    expect(onChange).toHaveBeenCalledWith(null, null);
  });

  // Partial input is the normal state of a field being typed into, not an error. En
  // route to 1402/05/12 the value passes through 1, 14, 140 — flagging each of those
  // would leave the field red the whole time it is in use.
  it('stays quiet on partial input rather than reporting it as invalid', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker onChange={onChange} />);

    type('140');

    expect(onChange).not.toHaveBeenCalled();
    expect(field()).not.toHaveAttribute('aria-invalid');
  });

  it('surfaces the error once, on blur', () => {
    render(<DoranDatePicker />);

    type('140');
    expect(field()).not.toHaveAttribute('aria-invalid');

    fireEvent.blur(field());
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveValue('140');
  });

  it('keeps unparseable text and marks the field invalid', () => {
    const onChange = vi.fn();
    const onParseError = vi.fn();
    render(<DoranDatePicker onChange={onChange} onParseError={onParseError} />);

    type('not a date');
    fireEvent.blur(field());

    // The text survives — discarding what someone typed is worse than flagging it.
    expect(field()).toHaveValue('not a date');
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(onChange).not.toHaveBeenCalled();
    expect(onParseError).toHaveBeenCalledWith('not a date');
  });

  it('clears the invalid state once the text parses again', () => {
    render(<DoranDatePicker />);

    type('nope');
    fireEvent.blur(field());
    expect(field()).toHaveAttribute('aria-invalid', 'true');

    type('1402/05/12');
    expect(field()).not.toHaveAttribute('aria-invalid');
  });

  it('refuses a typed date outside min/max', () => {
    const onChange = vi.fn();
    render(
      <DoranDatePicker
        onChange={onChange}
        min={DoranDate.fromJalali(1405, 3, 10, UTC)}
        max={DoranDate.fromJalali(1405, 3, 20, UTC)}
      />,
    );

    type('1405/03/25');
    fireEvent.blur(field());

    expect(onChange).not.toHaveBeenCalled();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not overwrite what the user is typing', () => {
    render(<DoranDatePicker defaultValue={DoranDate.fromJalali(1405, 3, 15, UTC)} />);

    type('1402/0');
    expect(field()).toHaveValue('1402/0');
  });

  it('normalizes the text back to the display format on blur', () => {
    render(<DoranDatePicker />);

    type('1402/5/12');
    fireEvent.blur(field());

    expect(field()).toHaveValue('۱۴۰۲/۰۵/۱۲');
  });

  it('reflects a controlled value the parent changes', () => {
    function Controlled() {
      const [date, setDate] = useState<DoranDate | null>(null);
      return (
        <>
          <DoranDatePicker value={date} onChange={setDate} />
          <button type="button" onClick={() => setDate(DoranDate.fromJalali(1404, 1, 1, UTC))}>
            set
          </button>
        </>
      );
    }
    render(<Controlled />);

    fireEvent.click(screen.getByRole('button', { name: 'set' }));
    expect(field()).toHaveValue('۱۴۰۴/۰۱/۰۱');
  });

  it('leaves the value alone when readOnly', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker readOnly onChange={onChange} />);

    expect(field()).toHaveAttribute('readonly');
    // The calendar still works — readOnly restricts typing, not selection.
    expect(screen.getByRole('button', { name: /تقویم/ })).toBeEnabled();
  });
});

describe('opening the calendar from the field', () => {
  it('opens on ArrowDown without stealing the caret', () => {
    render(<DoranDatePicker />);

    fireEvent.keyDown(field(), { key: 'ArrowDown' });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // Focus must stay put; yanking the caret out mid-typing makes the field unusable.
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(false);
  });

  it('does not open merely on focus, which would fight typing', () => {
    render(<DoranDatePicker />);
    fireEvent.focus(field());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes on Enter while open', () => {
    render(<DoranDatePicker />);

    fireEvent.keyDown(field(), { key: 'ArrowDown' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(field(), { key: 'Enter' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('form association', () => {
  it('exposes the input through a forwarded ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<DoranDatePicker ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current).toBe(field());
  });

  it('submits its value under the given name', () => {
    const onSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <DoranDatePicker name="birthdate" defaultValue={DoranDate.fromJalali(1405, 3, 15, UTC)} />
        <button type="submit">go</button>
      </form>,
    );

    // Latin digits, not the Persian text on screen — a backend can read this.
    const form = screen.getByRole('button', { name: 'go' }).closest('form')!;
    expect(new FormData(form).get('birthdate')).toBe('1405-03-15');
  });

  it('submits in the requested valueFormat', () => {
    render(
      <form>
        <DoranDatePicker name="d" valueFormat="iso" defaultValue="1405/03/15" />
        <button type="submit">go</button>
      </form>,
    );

    const form = screen.getByRole('button', { name: 'go' }).closest('form')!;
    expect(form ? String(new FormData(form).get('d')) : '').toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('submits an empty value when nothing is selected', () => {
    render(
      <form>
        <DoranDatePicker name="d" />
        <button type="submit">go</button>
      </form>,
    );

    const form = screen.getByRole('button', { name: 'go' }).closest('form')!;
    expect(new FormData(form).get('d')).toBe('');
  });

  it('forwards onBlur, which react-hook-form register() relies on', () => {
    const onBlur = vi.fn();
    render(<DoranDatePicker onBlur={onBlur} />);

    fireEvent.blur(field());

    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('honours required and an externally supplied invalid state', () => {
    render(<DoranDatePicker required invalid aria-describedby="err" />);

    expect(field()).toBeRequired();
    expect(field()).toHaveAttribute('aria-invalid', 'true');
    expect(field()).toHaveAttribute('aria-describedby', 'err');
  });

  it('marks the field wrapper invalid for styling', () => {
    const { container } = render(<DoranDatePicker invalid />);
    expect(container.querySelector('.doran-datepicker__input')).toHaveAttribute('data-invalid');
  });

  it('disables both the field and the calendar button', () => {
    render(<DoranDatePicker disabled />);

    expect(field()).toBeDisabled();
    expect(screen.getByRole('button', { name: /تقویم/ })).toBeDisabled();
  });
});

describe('loose value types', () => {
  it('accepts a native Date as the value', () => {
    const gregorian = DoranDate.fromJalali(1405, 3, 15, UTC).toGregorian();
    render(<DoranDatePicker value={gregorian} />);
    expect(field()).toHaveValue('۱۴۰۵/۰۳/۱۵');
  });

  it('accepts a Jalali string as the value', () => {
    render(<DoranDatePicker value="1405/03/15" />);
    expect(field()).toHaveValue('۱۴۰۵/۰۳/۱۵');
  });

  it('accepts a Gregorian ISO string as the value', () => {
    render(<DoranDatePicker value="2026-06-05" />);
    expect(field()).toHaveValue('۱۴۰۵/۰۳/۱۵');
  });

  it('accepts epoch milliseconds as the value', () => {
    const ms = DoranDate.fromJalali(1405, 3, 15, UTC).valueOf();
    render(<DoranDatePicker value={ms} />);
    expect(field()).toHaveValue('۱۴۰۵/۰۳/۱۵');
  });

  it('accepts loose min and max', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker onChange={onChange} min="1405/03/10" max="1405/03/20" />);

    type('1405/03/25');
    fireEvent.blur(field());
    expect(onChange).not.toHaveBeenCalled();

    type('1405/03/15');
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});

describe('valueFormat', () => {
  it('hands back a DoranDate by default', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker onChange={onChange} />);
    type('1404/05/12');
    expect(onChange.mock.calls[0]![0]).toBeInstanceOf(DoranDate);
  });

  // This is the shape that deletes a consumer's conversion wrapper: a query-param
  // string in, a query-param string out.
  it('hands back a pattern string in Latin digits', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker valueFormat="YYYY-MM-DD" onChange={onChange} />);

    type('1404/05/12');

    expect(onChange).toHaveBeenCalledWith('1404-05-12', expect.any(Date));
  });

  it('hands back a native Date', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker valueFormat="date" onChange={onChange} />);
    type('1404/05/12');
    expect(onChange.mock.calls[0]![0]).toBeInstanceOf(Date);
  });

  it('hands back a Gregorian ISO string', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker valueFormat="iso" onChange={onChange} />);
    type('1404/05/12');
    expect(onChange.mock.calls[0]![0]).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('still passes the Gregorian Date as the second argument', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker valueFormat="YYYY-MM-DD" onChange={onChange} />);
    type('1404/05/12');
    expect(onChange.mock.calls[0]![1]).toBeInstanceOf(Date);
  });

  it('emits null on clear whatever the format', () => {
    const onChange = vi.fn();
    render(
      <DoranDatePicker valueFormat="YYYY-MM-DD" defaultValue="1404/05/12" onChange={onChange} />,
    );
    type('');
    expect(onChange).toHaveBeenCalledWith(null, null);
  });

  // The round trip a consumer actually performs: store the string, feed it back.
  it('round-trips its own output back through value', () => {
    const onChange = vi.fn();
    const { rerender } = render(<DoranDatePicker valueFormat="YYYY-MM-DD" onChange={onChange} />);
    type('1404/05/12');
    // Blur first: while the field is still being edited the picker deliberately
    // leaves the text alone rather than reformatting under the caret.
    fireEvent.blur(field());

    const emitted = onChange.mock.calls[0]![0] as string;
    expect(emitted).toBe('1404-05-12');

    rerender(<DoranDatePicker valueFormat="YYYY-MM-DD" value={emitted} onChange={onChange} />);
    expect(field()).toHaveValue('۱۴۰۴/۰۵/۱۲');
  });
});

describe('classNames and portalContainer', () => {
  it('merges per-part class names alongside Doran’s own', () => {
    const { container } = render(
      <DoranDatePicker
        classNames={{ root: 'my-root', trigger: 'my-trigger', input: 'my-input', icon: 'my-icon' }}
      />,
    );

    expect(container.querySelector('.doran-datepicker')).toHaveClass('my-root');
    expect(container.querySelector('.doran-datepicker__input')).toHaveClass('my-trigger');
    expect(container.querySelector('.doran-datepicker__control')).toHaveClass('my-input');
    expect(container.querySelector('.doran-datepicker__icon')).toHaveClass('my-icon');
  });

  it('reaches the popover and the calendar inside it', () => {
    render(<DoranDatePicker classNames={{ popover: 'my-popover', calendar: 'my-calendar' }} />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('my-popover');
    // The calendar previously received no className at all, so it was unreachable.
    expect(dialog.querySelector('.doran-calendar')).toHaveClass('my-calendar');
  });

  it('keeps className on the root working alongside classNames', () => {
    const { container } = render(
      <DoranDatePicker className="outer" classNames={{ root: 'inner' }} />,
    );
    expect(container.querySelector('.doran-datepicker')).toHaveClass('outer', 'inner');
  });

  // A body-level popover sits outside a dialog's focus trap, which then yanks focus
  // straight back out of the calendar.
  it('portals into a supplied container instead of document.body', () => {
    const host = document.createElement('div');
    host.id = 'trap';
    document.body.appendChild(host);

    render(<DoranDatePicker portalContainer={host} />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));

    expect(host.querySelector('[role="dialog"]')).not.toBeNull();
    host.remove();
  });

  it('still defaults to document.body', () => {
    render(<DoranDatePicker />);
    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    expect(screen.getByRole('dialog').parentElement).toBe(document.body);
  });
});
