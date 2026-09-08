import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentStore } from '../core/state/document-store';
import { UiStore } from '../core/state/ui-store';
import { PromptDialog } from '../shared/dialogs/prompt-dialog';

interface HistoryRow {
  readonly index: number;
  readonly toolName: string;
  readonly at: number;
}

@Component({
  selector: 'app-history-panel',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    ScrollingModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  styleUrl: './history-panel.scss',
  templateUrl: './history-panel.html',
})
export class HistoryPanel {
  private readonly store = inject(DocumentStore);
  private readonly ui = inject(UiStore);
  private readonly dialog = inject(MatDialog);

  protected readonly document = this.store.activeDocument;
  protected readonly canUndo = this.store.canUndo;
  protected readonly canRedo = this.store.canRedo;
  protected readonly steps = computed(() => this.document()?.history ?? []);
  protected readonly cursor = computed(() => this.document()?.cursor ?? 0);
  protected readonly sortDescending = this.ui.historySortDescending;
  protected readonly rows = computed<readonly HistoryRow[]>(() => {
    const rows = this.steps().map((step, i) => ({
      index: i + 1,
      toolName: step.toolName,
      at: step.at,
    }));
    return this.sortDescending() ? [...rows].reverse() : rows;
  });

  protected undo(): void {
    const id = this.store.activeId();
    if (id) {
      void this.store.undo(id);
    }
  }

  protected redo(): void {
    const id = this.store.activeId();
    if (id) {
      void this.store.redo(id);
    }
  }

  protected clear(): void {
    const id = this.store.activeId();
    if (id) {
      this.store.clearHistory(id);
    }
  }

  protected goTo(target: number): void {
    const id = this.store.activeId();
    if (id) {
      void this.store.goTo(id, target);
    }
  }

  protected toggleSort(): void {
    this.ui.toggleHistorySort();
  }

  protected branch(target: number): void {
    const id = this.store.activeId();
    if (!id) {
      return;
    }
    this.dialog
      .open(PromptDialog, {
        data: {
          title: 'Branch into a new document',
          label: 'Document name',
          value: `${this.document()?.name ?? 'Document'} branch`,
          confirmLabel: 'Create',
        },
      })
      .afterClosed()
      .subscribe((name) => {
        if (name) {
          void this.store.branchFromHistory(id, target, name);
        }
      });
  }
}
