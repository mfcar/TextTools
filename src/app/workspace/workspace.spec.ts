import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentStore } from '../core/state/document-store';
import { Workspace } from './workspace';

describe('Workspace', () => {
  let fixture: ComponentFixture<Workspace>;
  let store: InstanceType<typeof DocumentStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Workspace],
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
});
