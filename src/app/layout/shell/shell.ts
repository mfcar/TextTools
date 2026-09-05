import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Theme } from '../../core/theme';

@Component({
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  selector: 'app-shell',
  styleUrl: './shell.scss',
  templateUrl: './shell.html',
})
export class Shell {
  protected readonly theme = inject(Theme);

  protected readonly themeIcon = computed(() => {
    switch (this.theme.preference()) {
      case 'light':
        return 'light_mode';
      case 'dark':
        return 'dark_mode';
      default:
        return 'brightness_auto';
    }
  });

  protected readonly themeLabel = computed(
    () => `Theme: ${this.theme.preference()}. Click to change.`,
  );
}
