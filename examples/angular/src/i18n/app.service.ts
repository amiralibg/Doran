import { Injectable, signal } from '@angular/core';
import { dirFor, type Lang, STRINGS } from './strings';

/** App-wide language + light/dark state; syncs `<html>` dir/theme. */
@Injectable({ providedIn: 'root' })
export class AppState {
  readonly lang = signal<Lang>('fa');
  readonly mode = signal<'light' | 'dark'>('light');

  constructor() {
    this.sync();
  }

  /** Look up a localized string by key (re-evaluated by change detection). */
  t(key: string): string {
    return STRINGS[this.lang()][key] ?? key;
  }

  toggleLang(): void {
    this.lang.update((l) => (l === 'fa' ? 'en' : 'fa'));
    this.sync();
  }
  toggleMode(): void {
    this.mode.update((m) => (m === 'light' ? 'dark' : 'light'));
    this.sync();
  }

  private sync(): void {
    const root = document.documentElement;
    root.setAttribute('dir', dirFor(this.lang()));
    root.setAttribute('lang', this.lang());
    root.setAttribute('data-doran-theme', this.mode());
  }
}
