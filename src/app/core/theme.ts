import { DOCUMENT, Service, effect, inject, signal } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'texttools.theme';

@Service()
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly storage = this.document.defaultView?.localStorage ?? null;

  readonly preference = signal<ThemePreference>(this.readStoredPreference());

  constructor() {
    effect(() => {
      const preference = this.preference();
      this.document.documentElement.style.colorScheme =
        preference === 'system' ? 'light dark' : preference;
      this.storage?.setItem(STORAGE_KEY, preference);
    });
  }

  set(preference: ThemePreference): void {
    this.preference.set(preference);
  }

  /** Cycles system → light → dark → system. */
  cycle(): void {
    this.preference.update((current) =>
      current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system',
    );
  }

  private readStoredPreference(): ThemePreference {
    const stored = this.storage?.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  }
}
