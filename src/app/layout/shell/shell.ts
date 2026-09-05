import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Theme, ThemePreference } from '../../core/theme';
import { UiStore } from '../../core/state/ui-store';
import { CommandPalette } from '../../palette/command-palette';

interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: string;
}

@Component({
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatSidenavModule,
    CommandPalette,
  ],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)',
  },
})
export class Shell {
  protected readonly theme = inject(Theme);
  protected readonly ui = inject(UiStore);

  constructor() {
    this.ui.registerShortcut({
      id: 'open-palette',
      keys: 'Mod+K',
      description: 'Open the command palette',
      category: 'General',
    });
  }

  protected onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.ui.togglePalette();
    }
  }

  protected readonly themeOptions: readonly ThemeOption[] = [
    { value: 'system', label: 'System', icon: 'computer' },
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  ];

  private readonly activeOption = computed(
    () =>
      this.themeOptions.find((option) => option.value === this.theme.preference()) ??
      this.themeOptions[0],
  );

  protected readonly themeIcon = computed(() => this.activeOption().icon);
  protected readonly themeTooltip = computed(() => `Theme: ${this.activeOption().label}`);
}
