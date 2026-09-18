import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentStore } from '../core/state/document-store';
import { FlowStore } from '../core/state/flow-store';
import { toFlowSteps } from '../core/state/flow';
import { UiStore } from '../core/state/ui-store';
import { PromptDialog } from '../shared/dialogs/prompt-dialog';
import { DisplayRow, buildDisplayRows } from './history-rows';

@Component({
  selector: 'app-history-panel',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    ScrollingModule,
    CdkContextMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    CdkMenuTrigger,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
  ],
  styleUrl: './history-panel.scss',
  templateUrl: './history-panel.html',
})
export class HistoryPanel {
  private readonly store = inject(DocumentStore);
  private readonly flows = inject(FlowStore);
  private readonly ui = inject(UiStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly document = this.store.activeDocument;
  protected readonly canUndo = this.store.canUndo;
  protected readonly canRedo = this.store.canRedo;
  protected readonly steps = computed(() => this.document()?.history ?? []);
  protected readonly cursor = computed(() => this.document()?.cursor ?? 0);
  protected readonly sortDescending = this.ui.historySortDescending;
  private readonly expandedGroups = signal<ReadonlySet<string>>(new Set());
  protected readonly rows = computed<readonly DisplayRow[]>(() =>
    buildDisplayRows(this.steps(), this.expandedGroups(), this.sortDescending()),
  );

  protected trackRow(_index: number, row: DisplayRow): string {
    return row.kind === 'group' ? `group-${row.runId}` : `step-${row.index}`;
  }

  protected toggleGroup(runId: string): void {
    this.expandedGroups.update((current) => {
      const next = new Set(current);
      if (next.has(runId)) {
        next.delete(runId);
      } else {
        next.add(runId);
      }
      return next;
    });
  }

  protected inGroup(startIndex: number, endIndex: number): boolean {
    const cursor = this.cursor();
    return cursor >= startIndex && cursor <= endIndex;
  }

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

  protected saveAsFlow(): void {
    const doc = this.document();
    if (!doc || doc.cursor === 0) {
      return;
    }
    const stepsToSave = doc.history.slice(0, doc.cursor);
    this.dialog
      .open(PromptDialog, {
        data: {
          title: 'Save history as flow',
          label: 'Flow name',
          value: `${doc.name} flow`,
          confirmLabel: 'Save',
        },
      })
      .afterClosed()
      .subscribe((name) => {
        if (name) {
          this.flows.createFlow({ name, steps: toFlowSteps(stepsToSave) });
          this.snackBar.open(`Saved "${name}" flow.`, 'Dismiss', { duration: 4000 });
        }
      });
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
