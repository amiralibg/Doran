'use client';

import { type DoranDate, faIR, type Locale } from '@doran/core';
import { cn } from '@doran/ui';
import type { ReactNode } from 'react';

/** A single event rendered in the agenda. */
export interface AgendaEvent {
  id: string;
  /** The day the event falls on. */
  date: DoranDate;
  title: string;
  description?: string;
  /** Optional accent color for the event marker. */
  color?: string;
}

export interface DoranAgendaProps {
  /** First day of the agenda. */
  start: DoranDate;
  /** Number of consecutive days to show. Defaults to 7. */
  days?: number;
  /** Events to place on the timeline. */
  events?: AgendaEvent[];
  locale?: Locale;
  /** Called when a day's header is clicked. */
  onSelectDay?: (day: DoranDate) => void;
  /** Custom event renderer. */
  renderEvent?: (event: AgendaEvent) => ReactNode;
  className?: string;
}

/**
 * A vertical agenda: a sequence of days, each listing the events that fall on it.
 * RTL-first and accessible.
 */
export function DoranAgenda({
  start,
  days = 7,
  events = [],
  locale = faIR,
  onSelectDay,
  renderEvent,
  className,
}: DoranAgendaProps) {
  const startOfRange = start.startOf('day');
  const dayList = Array.from({ length: days }, (_, i) => startOfRange.addDays(i));

  const eventsByDay = new Map<string, AgendaEvent[]>();
  for (const event of events) {
    const key = event.date.withLocale(locale).format('YYYY-MM-DD');
    const bucket = eventsByDay.get(key) ?? [];
    bucket.push(event);
    eventsByDay.set(key, bucket);
  }

  return (
    <div className={cn('doran-agenda', className)} dir="rtl">
      {dayList.map((day) => {
        const key = day.withLocale(locale).format('YYYY-MM-DD');
        const dayEvents = eventsByDay.get(key) ?? [];
        const isWeekend = day.dayOfWeek === 6; // Friday
        return (
          <section
            key={key}
            className={cn('doran-agenda__day', isWeekend && 'doran-agenda__day--weekend')}
          >
            <button
              type="button"
              className="doran-agenda__date"
              onClick={() => onSelectDay?.(day)}
              aria-label={day.withLocale(locale).format('dddd D MMMM YYYY')}
            >
              <span className="doran-agenda__weekday">{day.withLocale(locale).format('dddd')}</span>
              <span className="doran-agenda__daynum">
                {day.withLocale(locale).format('D MMMM')}
              </span>
            </button>

            <div className="doran-agenda__events">
              {dayEvents.length === 0 ? (
                <span className="doran-agenda__empty">رویدادی نیست</span>
              ) : (
                dayEvents.map((event) =>
                  renderEvent ? (
                    <div key={event.id}>{renderEvent(event)}</div>
                  ) : (
                    <div key={event.id} className="doran-agenda__event">
                      <span
                        className="doran-agenda__marker"
                        style={{ background: event.color ?? 'var(--doran-primary)' }}
                        aria-hidden
                      />
                      <div>
                        <div className="doran-agenda__event-title">{event.title}</div>
                        {event.description && (
                          <div className="doran-agenda__event-desc">{event.description}</div>
                        )}
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
