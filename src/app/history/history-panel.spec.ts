import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { DocumentStore } from '../core/state/document-store';
import { defineTool } from '../core/tools/tool';
import { provideTools } from '../core/tools/tool-registry';
import { HistoryPanel } from './history-panel';

const append = defineTool({
  id: 'append',
  name: 'Append',
  description: 'Appends a fixed string.',
  category: 'Test',
  icon: 'add',
  params: [{ type: 'text', key: 's', label: 'Suffix', default: 'x' }],
  run: (input, params) => input + params.s,
});

describe('HistoryPanel', () => {
  let fixture: ComponentFixture<HistoryPanel>;
  let component: HistoryPanel;
  let store: InstanceType<typeof DocumentStore>;

  const flush = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HistoryPanel],
      providers: [provideTools(append)],
    });
    store = TestBed.inject(DocumentStore);

    fixture = TestBed.createComponent(HistoryPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('prompts to open a document when none is active', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Open a document');
  });

  it('shows an empty history for a fresh document', async () => {
    store.openDocument({ content: 'hi' });
    await flush();

    expect(fixture.nativeElement.textContent).toContain('No steps yet');
    expect(component['canUndo']()).toBe(false);
  });

  it('lists applied steps with the baseline row', async () => {
    const id = store.openDocument({ content: 'hi' });
    await store.applyTool(id, 'append', { s: '!' });
    await flush();

    expect(component['steps']().length).toBe(1);
    const names = [...fixture.nativeElement.querySelectorAll('.history__step-name')].map(
      (el: HTMLElement) => el.textContent?.trim(),
    );
    expect(names).toContain('Original text');
    expect(names).toContain('Append');
  });

  it('undoes and redoes through the header buttons', async () => {
    const id = store.openDocument({ content: 'a' });
    await store.applyTool(id, 'append', { s: 'b' });
    await flush();
    expect(store.entityMap()[id].currentContent).toBe('ab');

    component['undo']();
    await flush();
    expect(store.entityMap()[id].currentContent).toBe('a');

    component['redo']();
    await flush();
    expect(store.entityMap()[id].currentContent).toBe('ab');
  });

  it('jumps to a step when its row is activated', async () => {
    const id = store.openDocument({ content: '' });
    await store.applyTool(id, 'append', { s: 'a' });
    await store.applyTool(id, 'append', { s: 'b' });
    await flush();

    component['goTo'](0);
    await flush();
    expect(store.entityMap()[id].currentContent).toBe('');
    expect(store.canRedo()).toBe(true);
  });

  it('clears history through the header button', async () => {
    const id = store.openDocument({ content: 'x' });
    await store.applyTool(id, 'append', { s: 'y' });
    await flush();

    component['clear']();
    await flush();

    expect(store.entityMap()[id].history).toHaveLength(0);
    expect(store.entityMap()[id].currentContent).toBe('xy');
  });
});
