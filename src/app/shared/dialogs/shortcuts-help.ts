import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { KeyboardShortcut, UiStore } from '../../core/state/ui-store';

interface ShortcutGroup {
  readonly category: string;
  readonly shortcuts: readonly KeyboardShortcut[];
}

@Component({
  selector: 'app-shortcuts-help',
  imports: [MatButtonModule, MatDialogModule],
  styleUrl: './shortcuts-help.scss',
  template: `
    <h2 mat-dialog-title>Keyboard shortcuts</h2>
    <mat-dialog-content>
      @for (group of groups(); track group.category) {
        <h3 class="shortcuts__category">{{ group.category }}</h3>
        <dl class="shortcuts__list">
          @for (shortcut of group.shortcuts; track shortcut.id) {
            <div class="shortcuts__row">
              <dt>{{ shortcut.description }}</dt>
              <dd>
                @for (key of keys(shortcut.keys); track $index) {
                  <kbd>{{ key }}</kbd>
                }
              </dd>
            </div>
          }
        </dl>
      } @empty {
        <p>No shortcuts registered.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton mat-dialog-close cdkFocusInitial>Close</button>
    </mat-dialog-actions>
  `,
})
export class ShortcutsHelp {
  private readonly ui = inject(UiStore);
  private readonly modLabel =
    typeof navigator !== 'undefined' && /Mac|iP(hone|ad|od)/.test(navigator.userAgent)
      ? '⌘'
      : 'Ctrl';

  protected readonly groups = computed<readonly ShortcutGroup[]>(() => {
    const byCategory = new Map<string, KeyboardShortcut[]>();
    for (const shortcut of this.ui.shortcuts()) {
      const category = shortcut.category ?? 'General';
      (byCategory.get(category) ?? byCategory.set(category, []).get(category)!).push(shortcut);
    }
    return [...byCategory.entries()]
      .map(([category, shortcuts]) => ({ category, shortcuts }))
      .sort((a, b) => a.category.localeCompare(b.category));
  });

  protected keys(combo: string): readonly string[] {
    return combo.split('+').map((part) => (part.toLowerCase() === 'mod' ? this.modLabel : part));
  }
}
