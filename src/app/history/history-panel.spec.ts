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

  it('reverses the displayed rows when sorting newest first', async () => {
    const id = store.openDocument({ content: '' });
    await store.applyTool(id, 'append', { s: 'a' });
    await store.applyTool(id, 'append', { s: 'b' });
    await flush();

    const indexes = () => component['rows']().map((row) => (row.kind === 'step' ? row.index : 0));
    expect(indexes()).toEqual([1, 2]);

    component['toggleSort']();
    await flush();

    expect(indexes()).toEqual([2, 1]);
  });

  it('groups flow-applied steps and expands them on demand', async () => {
    const id = store.openDocument({ content: 'hi' });
    await store.applyFlow(id, {
      id: 'f',
      name: 'My flow',
      description: '',
      steps: [
        { toolId: 'append', toolName: 'Append', params: { s: 'a' } },
        { toolId: 'append', toolName: 'Append', params: { s: 'b' } },
      ],
      versions: [],
      createdAt: 1,
      updatedAt: 1,
    });
    await flush();

    let rows = component['rows']();
    expect(rows).toHaveLength(1);
    expect(rows[0].kind).toBe('group');
    const group = rows[0];
    if (group.kind === 'group') {
      expect(group.count).toBe(2);
      component['toggleGroup'](group.runId);
    }
    await flush();

    rows = component['rows']();
    expect(rows.map((row) => row.kind)).toEqual(['group', 'step', 'step']);
  });

  it('branches a history index into a new document', async () => {
    const id = store.openDocument({ content: '' });
    await store.applyTool(id, 'append', { s: 'a' });
    await store.applyTool(id, 'append', { s: 'b' });
    await flush();

    const branchId = await store.branchFromHistory(id, 1, 'From history');
    expect(store.entityMap()[branchId!].currentContent).toBe('a');
    expect(store.entityMap()[branchId!].name).toBe('From history');
  });
});
