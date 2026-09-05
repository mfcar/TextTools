import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentStore } from '../core/state/document-store';
import { Editor } from '../editor/editor';

@Component({
  selector: 'app-workspace',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, Editor],
  styleUrl: './workspace.scss',
  templateUrl: './workspace.html',
})
export class Workspace {
  private readonly store = inject(DocumentStore);

  protected readonly documents = this.store.entities;
  protected readonly activeId = this.store.activeId;

  protected readonly activeDocuments = computed(() => {
    const doc = this.store.activeDocument();
    return doc ? [doc] : [];
  });

  constructor() {
    if (this.store.entities().length === 0) {
      this.store.openDocument();
    }
  }

  protected newTab(): void {
    this.store.openDocument();
  }

  protected select(id: string): void {
    this.store.setActive(id);
  }

  protected close(id: string): void {
    this.store.closeDocument(id);
  }

  protected onEdit(id: string, value: string): void {
    this.store.setContent(id, value);
  }
}
