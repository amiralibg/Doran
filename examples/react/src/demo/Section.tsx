import { type ReactNode } from 'react';

export interface SectionProps {
  /** Anchor id used by the side nav. */
  id: string;
  /** Component name, e.g. `<DoranCalendar>`. */
  title: ReactNode;
  /** Short intro to the component. */
  intro?: ReactNode;
  /** The demo cards. */
  children: ReactNode;
}

/**
 * Groups all demos for one component under a titled, anchorable section. Demos
 * inside flow in a responsive grid.
 */
export function Section({ id, title, intro, children }: SectionProps) {
  return (
    <section id={id} className="section">
      <header className="section__head">
        <h2 className="section__title">{title}</h2>
        {intro ? <p className="section__intro">{intro}</p> : null}
      </header>
      <div className="section__grid">{children}</div>
    </section>
  );
}
