import { Component, forwardRef, InjectionToken, Input } from '@angular/core';

/** Subtree defaults supplied by {@link DoranProvider}. */
export interface DoranDefaults {
  /** Locale attribute for the underlying elements (`'fa'` | `'en'`). */
  locale?: string;
  /** IANA time zone for `now()`-derived defaults. */
  timeZone?: string;
}

/** DI token carrying the nearest {@link DoranDefaults}. */
export const DORAN_DEFAULTS = new InjectionToken<DoranDefaults>('DORAN_DEFAULTS');

/**
 * Provides Doran defaults to its content subtree via Angular DI. Request-scoped,
 * so it's SSR-safe (Angular Universal): the same `locale`/`timeZone` render on the
 * server and the client, avoiding digit hydration mismatches. Components resolve
 * `explicit input → provider`.
 */
@Component({
  selector: 'dr-provider',
  standalone: true,
  template: '<ng-content></ng-content>',
  providers: [{ provide: DORAN_DEFAULTS, useExisting: forwardRef(() => DoranProvider) }],
})
export class DoranProvider implements DoranDefaults {
  @Input() locale?: string;
  @Input() timeZone?: string;
}
