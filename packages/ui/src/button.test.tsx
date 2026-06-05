import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('renders its children and the base + primary classes by default', () => {
    render(<Button>ذخیره</Button>);
    const btn = screen.getByRole('button', { name: 'ذخیره' });
    expect(btn).toHaveClass('doran-btn', 'doran-btn--primary');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('applies the requested variant and icon modifiers', () => {
    render(
      <Button variant="outline" icon className="extra">
        +
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('doran-btn--outline', 'doran-btn--icon', 'extra');
    expect(btn).not.toHaveClass('doran-btn--primary');
  });

  it('forwards clicks and the ref to the underlying element', () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button ref={ref} onClick={onClick}>
        کلیک
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('honours an explicit type override', () => {
    render(<Button type="submit">ارسال</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
