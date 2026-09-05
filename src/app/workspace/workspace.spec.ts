import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { vi } from 'vitest';
import { DocumentStore } from '../core/state/document-store';
import { Workspace } from './workspace';

describe('Workspace', () => {
  let fixture: ComponentFixture<Workspace>;
  let store: InstanceType<typeof DocumentStore>;
  let clipboard: { copy: ReturnType<typeof vi.fn> };
  let snackBar: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    clipboard = { copy: vi.fn().mockReturnValue(true) };
    snackBar = { open: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [Workspace],
      providers: [
        { provide: Clipboard, useValue: clipboard },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Workspace);
    store = TestBed.inject(DocumentStore);
    await fixture.whenStable();
  });

  it('opens a first document on load', () => {
    expect(store.entities().length).toBe(1);
    expect(store.activeId()).toBe(store.entities()[0].id);
  });

  it('renders a tab per open document', () => {
    fixture.componentInstance['newTab']();
    fixture.detectChanges();

    const tabs = fixture.nativeElement.querySelectorAll('.workspace__tab');
    expect(tabs.length).toBe(2);
  });

  it('marks the active tab with aria-current', () => {
    const label = fixture.nativeElement.querySelector('.workspace__tab-label');
    expect(label.getAttribute('aria-current')).toBe('true');
  });

  it('adds a document via the new-document button', () => {
    const newButton = fixture.nativeElement.querySelector('.workspace__new');
    newButton.click();
    fixture.detectChanges();

    expect(store.entities().length).toBe(2);
  });

  it('activates a document when its tab is selected', () => {
    fixture.componentInstance['newTab']();
    fixture.detectChanges();
    const first = store.entities()[0].id;

    const firstLabel = fixture.nativeElement.querySelectorAll('.workspace__tab-label')[0];
    firstLabel.click();
    fixture.detectChanges();

    expect(store.activeId()).toBe(first);
  });

  it('closes a document via its close button', () => {
    fixture.componentInstance['newTab']();
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('.workspace__tab-close');
    closeButton.click();
    fixture.detectChanges();

    expect(store.entities().length).toBe(1);
  });

  it('writes edits back to the active document', () => {
    const id = store.activeId()!;
    fixture.componentInstance['onEdit'](id, 'hello world');

    expect(store.entityMap()[id].currentContent).toBe('hello world');
  });

  it('shows the empty state when all documents are closed', () => {
    const id = store.activeId()!;
    store.closeDocument(id);
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.workspace__empty');
    expect(empty).toBeTruthy();
  });

  it('renames a document inline via double-click on the tab', () => {
    const id = store.activeId()!;
    const label = fixture.nativeElement.querySelector('.workspace__tab-label');
    label.dispatchEvent(new MouseEvent('dblclick'));
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.workspace__tab-input');
    expect(input).toBeTruthy();

    input.value = 'My notes';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    fixture.detectChanges();

    expect(store.entityMap()[id].name).toBe('My notes');
    expect(fixture.nativeElement.querySelector('.workspace__tab-input')).toBeNull();
  });

  it('cancels an inline rename on Escape', () => {
    const id = store.activeId()!;
    const original = store.entityMap()[id].name;
    fixture.componentInstance['startRename'](id, original);
    fixture.componentInstance['draftName'].set('changed');
    fixture.componentInstance['onRenameKeydown'](new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(store.entityMap()[id].name).toBe(original);
    expect(fixture.componentInstance['renamingId']()).toBeNull();
  });

  it('ignores a blank rename', () => {
    const id = store.activeId()!;
    const original = store.entityMap()[id].name;
    fixture.componentInstance['startRename'](id, original);
    fixture.componentInstance['draftName'].set('   ');
    fixture.componentInstance['commitRename']();

    expect(store.entityMap()[id].name).toBe(original);
  });

  it('copies the active content to the clipboard', () => {
    const id = store.activeId()!;
    store.setContent(id, 'copy me');
    fixture.componentInstance['copy']();

    expect(clipboard.copy).toHaveBeenCalledWith('copy me');
    expect(snackBar.open).toHaveBeenCalledWith(
      'Copied to clipboard.',
      'Dismiss',
      expect.anything(),
    );
  });

  it('downloads the active content as a text file', () => {
    const id = store.activeId()!;
    store.renameDocument(id, 'export');
    store.setContent(id, 'file body');

    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clickSpy = vi.fn();
    const realCreate = document.createElement.bind(document);
    const createSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation((tag: string, options?: ElementCreationOptions) => {
        const el = realCreate(tag, options);
        if (tag === 'a') {
          el.click = clickSpy;
        }
        return el;
      });

    fixture.componentInstance['download']();

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:x');

    createSpy.mockRestore();
    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });
});
