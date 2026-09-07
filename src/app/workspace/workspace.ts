import { DOCUMENT } from '@angular/core';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkMenu, CdkMenuItem, CdkContextMenuTrigger } from '@angular/cdk/menu';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DocumentStore } from '../core/state/document-store';
import { KeyboardShortcuts } from '../core/keyboard/keyboard-shortcuts';
import { TextDocument } from '../core/state/models';
import { Editor } from '../editor/editor';
import { Autofocus } from '../shared/autofocus';

@Component({
  selector: 'app-workspace',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CdkDrag,
    CdkDropList,
    CdkMenu,
    CdkMenuItem,
    CdkContextMenuTrigger,
    OverlayModule,
    Editor,
    Autofocus,
  ],
  styleUrl: './workspace.scss',
  templateUrl: './workspace.html',
})
export class Workspace {
  private readonly store = inject(DocumentStore);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);
  private readonly document = inject(DOCUMENT);
  private readonly shortcuts = inject(KeyboardShortcuts);
  private readonly dialog = inject(MatDialog);

  protected readonly documents = this.store.orderedDocuments;
  protected readonly activeId = this.store.activeId;
  protected readonly activeDocument = this.store.activeDocument;

  protected readonly renamingId = signal<string | null>(null);
  protected readonly draftName = signal('');

  protected readonly tabListOpen = signal(false);
  protected readonly tabFilter = signal('');
  protected readonly filteredDocuments = computed<readonly TextDocument[]>(() => {
    const query = this.tabFilter().trim().toLowerCase();
    const docs = this.documents();
    return query ? docs.filter((doc) => doc.name.toLowerCase().includes(query)) : docs;
  });

  protected readonly activeDocuments = computed(() => {
    const doc = this.store.activeDocument();
    return doc ? [doc] : [];
  });

  constructor() {
    if (this.store.entities().length === 0) {
      this.store.openDocument();
    }

    this.shortcuts.register({
      id: 'new-document',
      keys: 'Mod+Alt+N',
      description: 'New document',
      category: 'Documents',
      handler: () => this.newTab(),
    });
    this.shortcuts.register({
      id: 'rename-document',
      keys: 'F2',
      description: 'Rename the active document',
      category: 'Documents',
      handler: () => this.renameActive(),
    });
    this.shortcuts.register({
      id: 'close-document',
      keys: 'Mod+Shift+W',
      description: 'Close the active document',
      category: 'Documents',
      handler: () => this.closeActive(),
    });
    inject(DestroyRef).onDestroy(() => {
      this.shortcuts.unregister('new-document');
      this.shortcuts.unregister('rename-document');
      this.shortcuts.unregister('close-document');
    });
  }

  protected newTab(): void {
    this.store.openDocument();
  }

  protected renameActive(): void {
    const doc = this.store.activeDocument();
    if (doc) {
      this.startRename(doc.id, doc.name);
    }
  }

  protected async closeActive(): Promise<void> {
    const doc = this.store.activeDocument();
    if (!doc) {
      return;
    }
    if (doc.currentContent.length === 0) {
      this.close(doc.id);
      return;
    }
    const { ConfirmDialog } = await import('../shared/dialogs/confirm-dialog');
    this.dialog
      .open(ConfirmDialog, {
        data: {
          title: 'Close document',
          message: `Close “${doc.name}”? Its content will be discarded.`,
          confirmLabel: 'Close',
        },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.close(doc.id);
        }
      });
  }

  protected select(id: string): void {
    this.store.setActive(id);
  }

  protected toggleTabList(): void {
    this.tabListOpen.update((open) => !open);
    if (this.tabListOpen()) {
      this.tabFilter.set('');
    }
  }

  protected closeTabList(): void {
    this.tabListOpen.set(false);
  }

  protected onTabFilter(event: Event): void {
    this.tabFilter.set((event.target as HTMLInputElement).value);
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeTabList();
    }
  }

  protected onTabsWheel(event: WheelEvent): void {
    const el = event.currentTarget as HTMLElement;
    if (event.deltaY === 0 || el.scrollWidth <= el.clientWidth) {
      return;
    }
    el.scrollLeft += event.deltaY;
    event.preventDefault();
  }

  protected selectFromList(id: string): void {
    this.store.setActive(id);
    this.closeTabList();
  }

  protected close(id: string): void {
    this.store.closeDocument(id);
  }

  protected onDrop(event: CdkDragDrop<readonly TextDocument[]>): void {
    const ids = this.documents().map((doc) => doc.id);
    moveItemInArray(ids, event.previousIndex, event.currentIndex);
    this.store.reorderDocuments(ids);
  }

  protected togglePin(id: string): void {
    this.store.togglePin(id);
  }

  protected duplicate(doc: TextDocument): void {
    this.store.openDocument({ name: `${doc.name} copy`, content: doc.currentContent });
  }

  protected closeOthers(id: string): void {
    for (const doc of this.documents()) {
      if (doc.id !== id && !doc.pinned) {
        this.store.closeDocument(doc.id);
      }
    }
  }

  protected closeToLeft(id: string): void {
    const docs = this.documents();
    const position = docs.findIndex((doc) => doc.id === id);
    if (position < 0) {
      return;
    }
    for (const doc of docs.slice(0, position)) {
      if (!doc.pinned) {
        this.store.closeDocument(doc.id);
      }
    }
  }

  protected closeToRight(id: string): void {
    const docs = this.documents();
    const position = docs.findIndex((doc) => doc.id === id);
    if (position < 0) {
      return;
    }
    for (const doc of docs.slice(position + 1)) {
      if (!doc.pinned) {
        this.store.closeDocument(doc.id);
      }
    }
  }

  protected hasClosableOthers(id: string): boolean {
    return this.documents().some((doc) => doc.id !== id && !doc.pinned);
  }

  protected hasClosableToLeft(id: string): boolean {
    const docs = this.documents();
    const position = docs.findIndex((doc) => doc.id === id);
    return position > 0 && docs.slice(0, position).some((doc) => !doc.pinned);
  }

  protected hasClosableToRight(id: string): boolean {
    const docs = this.documents();
    const position = docs.findIndex((doc) => doc.id === id);
    return position >= 0 && docs.slice(position + 1).some((doc) => !doc.pinned);
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
