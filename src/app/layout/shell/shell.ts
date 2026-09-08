import { Component, DestroyRef, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Theme, ThemePreference } from '../../core/theme';
import { UiStore } from '../../core/state/ui-store';
import { KeyboardShortcuts } from '../../core/keyboard/keyboard-shortcuts';
import { CommandPalette } from '../../palette/command-palette';
import { HistoryPanel } from '../../history/history-panel';

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
    HistoryPanel,
  ],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly theme = inject(Theme);
  protected readonly ui = inject(UiStore);
  private readonly shortcuts = inject(KeyboardShortcuts);
  private readonly dialog = inject(MatDialog);

  constructor() {
    this.shortcuts.register({
      id: 'open-palette',
      keys: 'Mod+K',
      description: 'Open the command palette',
      category: 'General',
      handler: () => this.ui.togglePalette(),
    });
    this.shortcuts.register({
      id: 'show-shortcuts',
      keys: 'Mod+/',
      description: 'Show keyboard shortcuts',
      category: 'General',
      handler: () => this.openShortcuts(),
    });
    inject(DestroyRef).onDestroy(() => {
      this.shortcuts.unregister('open-palette');
      this.shortcuts.unregister('show-shortcuts');
    });
  }

  protected async openShortcuts(): Promise<void> {
    if (this.dialog.getDialogById('shortcuts-help')) {
      return;
    }
    const { ShortcutsHelp } = await import('../../shared/dialogs/shortcuts-help');
    this.dialog.open(ShortcutsHelp, { id: 'shortcuts-help', width: '32rem' });
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

  protected readonly themeIcon = computed(() => {
    if (this.theme.preference() === 'system') {
      return this.theme.resolved() === 'dark' ? 'dark_mode' : 'light_mode';
    }
    return this.activeOption().icon;
  });
  protected readonly themeTooltip = computed(() => `Theme: ${this.activeOption().label}`);
}
