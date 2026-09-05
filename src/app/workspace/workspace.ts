import { DOCUMENT } from '@angular/core';
import { Component, computed, inject, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentStore } from '../core/state/document-store';
import { Editor } from '../editor/editor';
import { Autofocus } from '../shared/autofocus';

@Component({
  selector: 'app-workspace',
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, Editor, Autofocus],
  styleUrl: './workspace.scss',
  templateUrl: './workspace.html',
})
export class Workspace {
  private readonly store = inject(DocumentStore);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);
  private readonly document = inject(DOCUMENT);

  protected readonly documents = this.store.entities;
  protected readonly activeId = this.store.activeId;
  protected readonly activeDocument = this.store.activeDocument;

  protected readonly renamingId = signal<string | null>(null);
  protected readonly draftName = signal('');

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

  protected startRename(id: string, name: string): void {
    this.renamingId.set(id);
    this.draftName.set(name);
  }

  protected onRenameInput(event: Event): void {
    this.draftName.set((event.target as HTMLInputElement).value);
  }

  protected commitRename(): void {
    const id = this.renamingId();
    if (!id) {
      return;
    }
    const name = this.draftName().trim();
    if (name) {
      this.store.renameDocument(id, name);
    }
    this.renamingId.set(null);
  }

  protected cancelRename(): void {
    this.renamingId.set(null);
  }

  protected onRenameKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.commitRename();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelRename();
    }
  }

  protected copy(): void {
    const doc = this.store.activeDocument();
    if (!doc) {
      return;
    }
    const ok = this.clipboard.copy(doc.currentContent);
    this.snackBar.open(ok ? 'Copied to clipboard.' : 'Copy failed.', 'Dismiss', { duration: 3000 });
  }

  protected download(): void {
    const doc = this.store.activeDocument();
    if (!doc) {
      return;
    }
    const blob = new Blob([doc.currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = this.document.createElement('a');
    anchor.href = url;
    anchor.download = `${doc.name}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
