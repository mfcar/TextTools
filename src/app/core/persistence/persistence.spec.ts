import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { defineTool } from '../tools/tool';
import { provideTools } from '../tools/tool-registry';
import { DocumentStore } from '../state/document-store';
import { TextDocument } from '../state/models';
import { DB_NAME, openWorkspaceDB } from './document-db';
import { PERSISTENCE_CONFIG, Persistence } from './persistence';

const append = defineTool({
  id: 'append',
  name: 'Append',
  description: 'Appends a fixed string.',
  category: 'Test',
  icon: 'add',
  params: [{ type: 'text', key: 's', label: 'Suffix', default: 'x' }],
  run: (input, params) => input + params.s,
});

function makeDoc(overrides: Partial<TextDocument> = {}): TextDocument {
  return {
    id: 'seed-1',
    name: 'Seeded',
    baseContent: 'hello',
    currentContent: 'hello',
    history: [],
    cursor: 0,
    checkpoints: [],
    createdAt: 1000,
    order: 0,
    pinned: false,
    language: 'plaintext',
    ...overrides,
  };
}

function deleteDb(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => resolve();
  });
}

describe('Persistence', () => {
  let store: InstanceType<typeof DocumentStore>;
  let persistence: Persistence;

  beforeEach(async () => {
    await deleteDb();
    TestBed.configureTestingModule({
      providers: [
        provideTools(append),
        { provide: PERSISTENCE_CONFIG, useValue: { debounceMs: 5, minIntervalMs: 5 } },
      ],
    });
    store = TestBed.inject(DocumentStore);
    persistence = TestBed.inject(Persistence);
  });

  afterEach(async () => {
    TestBed.resetTestingModule();
    await deleteDb();
  });

  it('leaves the store empty when nothing is persisted', async () => {
    await persistence.hydrate();
    expect(store.entities()).toHaveLength(0);
  });

  it('hydrates documents and the active id from IndexedDB', async () => {
    const db = await openWorkspaceDB();
    const doc = makeDoc({ id: 'abc', currentContent: 'restored' });
    await db.put('documents', doc);
    await db.put('meta', 'abc', 'active');
    db.close();

    await persistence.hydrate();

    expect(store.entities()).toHaveLength(1);
    expect(store.activeId()).toBe('abc');
    expect(store.activeDocument()?.currentContent).toBe('restored');
  });

  it('flushes the current documents and active id to IndexedDB', async () => {
    await persistence.hydrate();
    const id = store.openDocument({ content: 'hi' });
    await store.applyTool(id, 'append', { s: '!' });

    await persistence.flush();

    const db = await openWorkspaceDB();
    const docs = await db.getAll('documents');
    expect(docs).toHaveLength(1);
    expect(docs[0].currentContent).toBe('hi!');
    expect(docs[0].history).toHaveLength(1);
    expect(await db.get('meta', 'active')).toBe(id);
    db.close();
  });

  it('removes documents that were closed since the last write', async () => {
    await persistence.hydrate();
    const a = store.openDocument({ content: 'a' });
    const b = store.openDocument({ content: 'b' });
    await persistence.flush();

    store.closeDocument(b);
    await persistence.flush();

    const db = await openWorkspaceDB();
    expect(await db.getAllKeys('documents')).toEqual([a]);
    db.close();
  });

  it('schedules a debounced write after a change', async () => {
    await persistence.hydrate();
    store.openDocument({ content: 'debounced' });

    await new Promise((resolve) => setTimeout(resolve, 50));

    const db = await openWorkspaceDB();
    expect(await db.getAll('documents')).toHaveLength(1);
    db.close();
  });

  it('does not rewrite freshly hydrated documents', async () => {
    const db = await openWorkspaceDB();
    await db.put('documents', makeDoc({ id: 'abc' }));
    await db.put('meta', 'abc', 'active');
    await db.put('meta', '7', 'revision');
    db.close();

    await persistence.hydrate();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const check = await openWorkspaceDB();
    expect(await check.get('meta', 'revision')).toBe('7');
    check.close();
  });

  it('reconciles external changes written by another tab', async () => {
    await persistence.hydrate();
    const id = store.openDocument({ content: 'local' });
    await persistence.flush();

    const db = await openWorkspaceDB();
    const stored = await db.get('documents', id);
    await db.put('documents', { ...stored!, currentContent: 'remote edit' });
    await db.put('meta', '99', 'revision');
    db.close();

    await persistence.reconcile();

    expect(store.entityMap()[id].currentContent).toBe('remote edit');
  });

  it('does not clobber a newer external write when flushing stale state', async () => {
    await persistence.hydrate();
    const id = store.openDocument({ content: 'v1' });
    await persistence.flush();

    const db = await openWorkspaceDB();
    const stored = await db.get('documents', id);
    await db.put('documents', { ...stored!, currentContent: 'external v2' });
    await db.put('meta', '99', 'revision');
    db.close();

    store.setContent(id, 'local v3');
    await persistence.flush();

    const db2 = await openWorkspaceDB();
    expect((await db2.get('documents', id))!.currentContent).toBe('external v2');
    db2.close();
    expect(store.entityMap()[id].currentContent).toBe('external v2');
  });
});
