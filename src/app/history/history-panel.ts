import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentStore } from '../core/state/document-store';

@Component({
  selector: 'app-history-panel',
  imports: [DatePipe, ScrollingModule, MatButtonModule, MatIconModule, MatTooltipModule],
  styleUrl: './history-panel.scss',
  templateUrl: './history-panel.html',
})
export class HistoryPanel {
  private readonly store = inject(DocumentStore);

  protected readonly document = this.store.activeDocument;
  protected readonly canUndo = this.store.canUndo;
  protected readonly canRedo = this.store.canRedo;
  protected readonly steps = computed(() => this.document()?.history ?? []);
  protected readonly cursor = computed(() => this.document()?.cursor ?? 0);

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
}
