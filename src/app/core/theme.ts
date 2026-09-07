import { DOCUMENT, DestroyRef, Service, computed, effect, inject, signal } from '@angular/core';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'texttools.theme';

@Service()
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly storage = this.document.defaultView?.localStorage ?? null;
  private readonly darkQuery =
    this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  readonly preference = signal<ThemePreference>(this.readStoredPreference());
  private readonly systemDark = signal(this.darkQuery?.matches ?? false);

  readonly resolved = computed<ResolvedTheme>(() => {
    const preference = this.preference();
    return preference === 'system' ? (this.systemDark() ? 'dark' : 'light') : preference;
  });

  constructor() {
    const query = this.darkQuery;
    if (query) {
      const onChange = (event: MediaQueryListEvent) => this.systemDark.set(event.matches);
      query.addEventListener('change', onChange);
      this.destroyRef.onDestroy(() => query.removeEventListener('change', onChange));
    }

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
