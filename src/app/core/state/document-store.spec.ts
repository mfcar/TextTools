import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { HISTORY_CONFIG, HistoryConfig } from '../perf/history-policy';
import { defineTool, failure } from '../tools/tool';
import { provideTools } from '../tools/tool-registry';
import { DocumentStore } from './document-store';

const append = defineTool({
  id: 'append',
  name: 'Append',
  description: 'Appends a fixed string.',
  category: 'Test',
  icon: 'add',
  params: [{ type: 'text', key: 's', label: 'Suffix', default: 'x' }],
  run: (input, params) => input + params.s,
});

const upper = defineTool({
  id: 'upper',
  name: 'Uppercase',
  description: 'Uppercases text.',
  category: 'Test',
  icon: 'text_fields',
  params: [],
  run: (input) => input.toUpperCase(),
});

const boom = defineTool({
  id: 'boom',
  name: 'Boom',
  description: 'Always fails.',
  category: 'Test',
  icon: 'error',
  params: [],
  run: () => failure('boom'),
});

const config: HistoryConfig = {
  checkpointInterval: 2,
  historyCap: 5,
  checkpointBudgetBytes: 32 * 1024 * 1024,
};

function setup(cfg: HistoryConfig = config): InstanceType<typeof DocumentStore> {
  TestBed.configureTestingModule({
    providers: [provideTools(append, upper, boom), { provide: HISTORY_CONFIG, useValue: cfg }],
  });
  return TestBed.inject(DocumentStore);
}

describe('DocumentStore — tabs', () => {
  let store: InstanceType<typeof DocumentStore>;

  beforeEach(() => {
    store = setup();
  });

  it('opens a document, makes it active, and auto-names it', () => {
    const id = store.openDocument();
    expect(store.activeId()).toBe(id);
    expect(store.activeDocument()?.name).toBe('Untitled 1');
    expect(store.openDocument() && store.activeDocument()?.name).toBe('Untitled 2');
    expect(store.entities()).toHaveLength(2);
  });

  it('honours an explicit name and content', () => {
    const id = store.openDocument({ name: 'Notes', content: 'hello' });
    const doc = store.entityMap()[id];
    expect(doc.name).toBe('Notes');
    expect(doc.baseContent).toBe('hello');
    expect(doc.currentContent).toBe('hello');
  });

  it('renames a document and ignores unknown ids', () => {
    const id = store.openDocument();
    store.renameDocument(id, 'Renamed');
    store.renameDocument('missing', 'Nope');
    expect(store.entityMap()[id].name).toBe('Renamed');
  });

  it('activates a neighbour when the active tab is closed', () => {
    const a = store.openDocument();
    const b = store.openDocument();
    store.openDocument();
    store.setActive(b);
    store.closeDocument(b);
    expect(store.activeId()).toBe(a);
  });

  it('keeps the active tab when closing a different one', () => {
    const a = store.openDocument();
    const b = store.openDocument();
    store.setActive(a);
    store.closeDocument(b);
    expect(store.activeId()).toBe(a);
  });

  it('clears the active id when the last tab closes', () => {
    const id = store.openDocument();
    store.closeDocument(id);
    expect(store.activeId()).toBeNull();
    expect(store.entities()).toHaveLength(0);
  });
});

describe('DocumentStore — applying tools', () => {
  let store: InstanceType<typeof DocumentStore>;
  let id: string;

  beforeEach(() => {
    store = setup();
    id = store.openDocument({ content: 'hi' });
  });

  it('applies a tool and records a replayable step', async () => {
    const result = await store.applyTool(id, 'upper');
    expect(result).toEqual({ ok: true, output: 'HI' });

    const doc = store.entityMap()[id];
    expect(doc.currentContent).toBe('HI');
    expect(doc.cursor).toBe(1);
    expect(doc.history).toHaveLength(1);
    expect(doc.history[0]).toMatchObject({ toolId: 'upper', toolName: 'Uppercase', params: {} });
    expect(typeof doc.history[0].at).toBe('number');
    expect(store.canUndo()).toBe(true);
    expect(store.canRedo()).toBe(false);
  });

  it('passes params through to the tool', async () => {
    await store.applyTool(id, 'append', { s: '!' });
    expect(store.entityMap()[id].currentContent).toBe('hi!');
  });

  it('returns a failure and leaves state untouched for an unknown tool', async () => {
    const result = await store.applyTool(id, 'nope');
    expect(result.ok).toBe(false);
    expect(store.entityMap()[id].history).toHaveLength(0);
  });

  it('returns a failure and records nothing when the tool fails', async () => {
    const result = await store.applyTool(id, 'boom');
    expect(result).toEqual({ ok: false, error: 'boom' });
    const doc = store.entityMap()[id];
    expect(doc.history).toHaveLength(0);
    expect(doc.currentContent).toBe('hi');
  });

  it('reports a failure for an unknown document', async () => {
    const result = await store.applyTool('missing', 'upper');
    expect(result.ok).toBe(false);
  });
});

describe('DocumentStore — undo/redo', () => {
  let store: InstanceType<typeof DocumentStore>;
  let id: string;

  beforeEach(() => {
    store = setup();
    id = store.openDocument({ content: '' });
  });

  it('undoes and redoes by reconstructing content', async () => {
    await store.applyTool(id, 'append', { s: 'a' });
    await store.applyTool(id, 'append', { s: 'b' });
    expect(store.entityMap()[id].currentContent).toBe('ab');

    await store.undo(id);
    expect(store.entityMap()[id].currentContent).toBe('a');
    expect(store.entityMap()[id].cursor).toBe(1);

    await store.undo(id);
    expect(store.entityMap()[id].currentContent).toBe('');

    await store.redo(id);
    expect(store.entityMap()[id].currentContent).toBe('a');
  });

  it('is a no-op to undo at the base or redo at the head', async () => {
    await store.undo(id);
    expect(store.entityMap()[id].cursor).toBe(0);
    await store.applyTool(id, 'append', { s: 'a' });
    await store.redo(id);
    expect(store.entityMap()[id].cursor).toBe(1);
  });

  it('discards the redo tail when a new tool is applied after undo', async () => {
    await store.applyTool(id, 'append', { s: 'a' });
    await store.applyTool(id, 'append', { s: 'b' });
    await store.undo(id);
    await store.applyTool(id, 'append', { s: 'c' });

    const doc = store.entityMap()[id];
    expect(doc.currentContent).toBe('ac');
    expect(doc.history).toHaveLength(2);
    expect(store.canRedo()).toBe(false);
  });

  it('jumps to an arbitrary point in history and back to the base', async () => {
    for (const ch of ['a', 'b', 'c']) {
      await store.applyTool(id, 'append', { s: ch });
    }
    expect(store.entityMap()[id].currentContent).toBe('abc');

    await store.goTo(id, 1);
    expect(store.entityMap()[id].currentContent).toBe('a');
    expect(store.entityMap()[id].cursor).toBe(1);

    await store.goTo(id, 3);
    expect(store.entityMap()[id].currentContent).toBe('abc');

    await store.goTo(id, 0);
    expect(store.entityMap()[id].currentContent).toBe('');
    expect(store.canRedo()).toBe(true);
  });

  it('clamps goTo targets and is a no-op at the current cursor', async () => {
    await store.applyTool(id, 'append', { s: 'a' });
    await store.goTo(id, 99);
    expect(store.entityMap()[id].cursor).toBe(1);
    await store.goTo(id, -5);
    expect(store.entityMap()[id].cursor).toBe(0);
    await store.goTo(id, 0); // already there
    expect(store.entityMap()[id].currentContent).toBe('');
  });

  it('stays correct across many steps using checkpoints', async () => {
    for (const ch of ['a', 'b', 'c', 'd', 'e']) {
      await store.applyTool(id, 'append', { s: ch });
    }
    expect(store.entityMap()[id].currentContent).toBe('abcde');
    // Interval is 2, so checkpoints exist at 2 and 4.
    expect(store.entityMap()[id].checkpoints.map((cp) => cp.index)).toEqual([2, 4]);

    await store.undo(id); // -> abcd
    await store.undo(id); // -> abc
    expect(store.entityMap()[id].currentContent).toBe('abc');
  });
});

describe('DocumentStore — history cap and clearing', () => {
  it('collapses the oldest steps into the base past the cap', async () => {
    const store = setup(); // cap 5
    const id = store.openDocument({ content: '' });
    for (const ch of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
      await store.applyTool(id, 'append', { s: ch });
    }
    const doc = store.entityMap()[id];
    expect(doc.currentContent).toBe('abcdefg');
    expect(doc.history).toHaveLength(5);
    expect(doc.cursor).toBe(5);
    // Two oldest steps folded into the base; undoing all the way stops there.
    expect(doc.baseContent).toBe('ab');
  });

  it('clears history into the current content', async () => {
    const store = setup();
    const id = store.openDocument({ content: 'x' });
    await store.applyTool(id, 'append', { s: 'y' });
    store.clearHistory(id);

    const doc = store.entityMap()[id];
    expect(doc.baseContent).toBe('xy');
    expect(doc.currentContent).toBe('xy');
    expect(doc.history).toHaveLength(0);
    expect(doc.cursor).toBe(0);
    expect(store.canUndo()).toBe(false);
  });
});

describe('DocumentStore — ordering and pinning', () => {
  let store: InstanceType<typeof DocumentStore>;

  beforeEach(() => {
    store = setup();
  });

  it('assigns increasing order and sorts pinned documents first', () => {
    const a = store.openDocument();
    const b = store.openDocument();
    const c = store.openDocument();

    expect(store.orderedDocuments().map((doc) => doc.id)).toEqual([a, b, c]);

    store.togglePin(c);
    expect(store.orderedDocuments().map((doc) => doc.id)).toEqual([c, a, b]);
  });

  it('reorders documents by an explicit id list', () => {
    const a = store.openDocument();
    const b = store.openDocument();
    const c = store.openDocument();

    store.reorderDocuments([c, a, b]);
    expect(store.orderedDocuments().map((doc) => doc.id)).toEqual([c, a, b]);
  });

  it('backfills order and pinned when hydrating legacy documents', () => {
    const legacy = {
      id: 'legacy',
      name: 'Legacy',
      baseContent: '',
      currentContent: '',
      history: [],
      cursor: 0,
      checkpoints: [],
      createdAt: 1,
    } as unknown as import('./models').TextDocument;

    store.hydrate([legacy], 'legacy');
    const doc = store.entityMap()['legacy'];
    expect(doc.order).toBe(0);
    expect(doc.pinned).toBe(false);
  });
});

describe('DocumentStore — branch from history', () => {
  it('creates a new document from content at a history index', async () => {
    const store = setup();
    const id = store.openDocument({ content: '' });
    await store.applyTool(id, 'append', { s: 'a' });
    await store.applyTool(id, 'append', { s: 'b' });

    const branchId = await store.branchFromHistory(id, 1, 'Branch');
    expect(branchId).not.toBeNull();
    const branch = store.entityMap()[branchId!];
    expect(branch.name).toBe('Branch');
    expect(branch.baseContent).toBe('a');
    expect(branch.currentContent).toBe('a');
    expect(branch.history).toHaveLength(0);
    expect(store.activeId()).toBe(branchId);
  });

  it('returns null for an unknown document', async () => {
    const store = setup();
    expect(await store.branchFromHistory('missing', 0, 'x')).toBeNull();
  });
});

describe('DocumentStore — manual edits', () => {
  it('resets the operation history on a hand edit', async () => {
    const store = setup();
    const id = store.openDocument({ content: 'hi' });
    await store.applyTool(id, 'append', { s: '!' });
    store.setContent(id, 'rewritten');

    const doc = store.entityMap()[id];
    expect(doc.baseContent).toBe('rewritten');
    expect(doc.currentContent).toBe('rewritten');
    expect(doc.history).toHaveLength(0);
    expect(doc.cursor).toBe(0);
  });

  it('is a no-op when the content is unchanged', async () => {
    const store = setup();
    const id = store.openDocument({ content: 'hi' });
    await store.applyTool(id, 'append', { s: '!' });
    store.setContent(id, 'hi!'); // equals currentContent

    expect(store.entityMap()[id].history).toHaveLength(1);
  });
});
