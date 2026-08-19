import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DoranDatePicker } from './date-picker';

/**
 * Pretends the primary pointer is a finger, which is what the picker keys its
 * keyboard-avoidance off. jsdom reports no match at all by default.
 */
function useCoarsePointer(coarse: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) =>
    ({
      matches: query.includes('pointer: coarse') ? coarse : false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

let restore: (() => void) | null = null;
afterEach(() => {
  restore?.();
  restore = null;
});

describe('editable={false}', () => {
  it('renders a button trigger instead of a text field', () => {
    render(<DoranDatePicker editable={false} defaultValue="1402/05/12" />);

    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.getByRole('button', { name: /تاریخ/ })).toHaveTextContent('۱۴۰۲/۰۵/۱۲');
  });

  it('opens the calendar when the trigger itself is activated', () => {
    render(<DoranDatePicker editable={false} />);
    const trigger = screen.getByRole('button', { name: /تاریخ/ });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows the placeholder while empty and the value once picked', () => {
    const onChange = vi.fn();
    render(<DoranDatePicker editable={false} placeholder="تاریخ تولد" onChange={onChange} />);
    const trigger = screen.getByRole('button', { name: 'تاریخ تولد' });
    expect(trigger).toHaveTextContent('تاریخ تولد');

    fireEvent.click(trigger);
    fireEvent.click(screen.getAllByRole('gridcell')[10]!.querySelector('button')!);

    expect(onChange).toHaveBeenCalled();
    expect(trigger.textContent).not.toBe('تاریخ تولد');
  });

  it('closes the calendar again on a second activation', () => {
    render(<DoranDatePicker editable={false} />);
    const trigger = screen.getByRole('button', { name: /تاریخ/ });

    fireEvent.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('hands the forwarded ref the trigger element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<DoranDatePicker editable={false} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('still submits a machine-readable value through `name`', () => {
    const { container } = render(
      <DoranDatePicker editable={false} name="birthday" defaultValue="1402/05/12" />,
    );

    expect(container.querySelector('input[name="birthday"]')).toHaveValue('1402-05-12');
  });

  it('keeps the field disabled when asked', () => {
    render(<DoranDatePicker editable={false} disabled />);
    const trigger = screen.getByRole('button', { name: /تاریخ/ });

    fireEvent.click(trigger);
    expect(trigger).toBeDisabled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('on-screen keyboard avoidance', () => {
  it('drops focus from the text field when the calendar opens on touch', () => {
    restore = useCoarsePointer(true);
    render(<DoranDatePicker />);
    const input = screen.getByRole('textbox');
    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));

    // The keyboard is what makes the calendar unusable: it covers the panel, and
    // dismissing it mid-tap moves the panel out from under the finger.
    expect(document.activeElement).not.toBe(input);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('keeps the caret where it is on a mouse-driven screen', () => {
    restore = useCoarsePointer(false);
    render(<DoranDatePicker />);
    const input = screen.getByRole('textbox');
    input.focus();

    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));

    expect(document.activeElement).toBe(input);
  });

  it('does not restore focus to the field after picking a date on touch', () => {
    restore = useCoarsePointer(true);
    render(<DoranDatePicker />);
    const input = screen.getByRole('textbox');

    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    fireEvent.click(screen.getAllByRole('gridcell')[10]!.querySelector('button')!);

    // Refocusing would pop the keyboard straight back up over the page.
    expect(document.activeElement).not.toBe(input);
  });

  it('restores focus to the field after picking with a mouse', () => {
    restore = useCoarsePointer(false);
    render(<DoranDatePicker />);
    const input = screen.getByRole('textbox');

    fireEvent.click(screen.getByRole('button', { name: /تقویم/ }));
    fireEvent.click(screen.getAllByRole('gridcell')[10]!.querySelector('button')!);

    expect(document.activeElement).toBe(input);
  });

  it('leaves a button trigger focused on touch, having raised no keyboard', () => {
    restore = useCoarsePointer(true);
    render(<DoranDatePicker editable={false} />);
    const trigger = screen.getByRole('button', { name: /تاریخ/ });
    trigger.focus();

    fireEvent.click(trigger);

    expect(document.activeElement).toBe(trigger);
  });
});
