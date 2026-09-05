import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Theme, ThemePreference } from '../../core/theme';

interface ThemeOption {
  value: ThemePreference;
  label: string;
  icon: string;
}

@Component({
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly theme = inject(Theme);

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
