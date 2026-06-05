import { DoranDate } from '@doranjs/core';
import type { ParseResult } from '@doranjs/nlp';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DoranNlpInput } from './nlp-input';

const reference = DoranDate.fromJalali(1405, 3, 15, { timeZone: 'UTC' });

describe('DoranNlpInput', () => {
  it('renders an accessible combobox input', () => {
    render(<DoranNlpInput reference={reference} />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
  });

  it('updates the value and reports edits via onChange (uncontrolled)', () => {
    const onChange = vi.fn();
    render(<DoranNlpInput reference={reference} onChange={onChange} />);
    const input = screen.getByRole<HTMLInputElement>('combobox');
    fireEvent.change(input, { target: { value: 'فردا' } });
    expect(onChange).toHaveBeenLastCalledWith('فردا');
    expect(input.value).toBe('فردا');
  });

  it('resolves a known phrase to a date via onResolve', () => {
    const onResolve = vi.fn<(r: ParseResult | null) => void>();
    render(<DoranNlpInput reference={reference} onResolve={onResolve} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'فردا' } });
    const last = onResolve.mock.calls.at(-1)![0];
    expect(last).not.toBeNull();
    expect(last!.date.diff(reference.startOf('day'), 'day')).toBe(1);
  });

  it('reports null when a resolved phrase becomes unparseable', () => {
    const onResolve = vi.fn<(r: ParseResult | null) => void>();
    render(<DoranNlpInput reference={reference} onResolve={onResolve} />);
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'فردا' } });
    expect(onResolve.mock.calls.at(-1)![0]).not.toBeNull();
    fireEvent.change(input, { target: { value: 'یک جمله بی‌ربط' } });
    expect(onResolve.mock.calls.at(-1)![0]).toBeNull();
  });

  it('shows an autocomplete list and fills the input when a suggestion is chosen', () => {
    render(<DoranNlpInput reference={reference} />);
    const input = screen.getByRole<HTMLInputElement>('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'فرد' } });
    const optionButtons = within(screen.getByRole('listbox')).getAllByRole('button');
    expect(optionButtons.length).toBeGreaterThan(0);
    const farda = optionButtons.find((b) => b.textContent?.includes('فردا'))!;
    expect(farda).toBeDefined();
    fireEvent.click(farda);
    // The chosen suggestion completes the partial text in the field.
    expect(input.value.length).toBeGreaterThan('فرد'.length);
    expect(input.value.startsWith('فرد')).toBe(true);
  });
});
