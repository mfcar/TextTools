import { DOCUMENT, DestroyRef, InjectionToken, Service, effect, inject } from '@angular/core';
import { IDBPDatabase } from 'idb';
import { DocumentStore } from '../state/document-store';
import { WorkspaceDB, openWorkspaceDB } from './document-db';

export const PERSIST_DEBOUNCE_MS = 750;
export const PERSIST_MIN_INTERVAL_MS = 2000;

export interface PersistenceConfig {
  readonly debounceMs: number;
  readonly minIntervalMs: number;
}

export const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = {
  debounceMs: PERSIST_DEBOUNCE_MS,
  minIntervalMs: PERSIST_MIN_INTERVAL_MS,
};

export const PERSISTENCE_CONFIG = new InjectionToken<PersistenceConfig>('PERSISTENCE_CONFIG', {
  providedIn: 'root',
  factory: () => DEFAULT_PERSISTENCE_CONFIG,
});

@Service()
export class Persistence {
  private readonly store = inject(DocumentStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly doc = inject(DOCUMENT);
  private readonly config = inject(PERSISTENCE_CONFIG);

  private dbPromise: Promise<IDBPDatabase<WorkspaceDB>> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastWrite = 0;
  private hydrated = false;

  constructor() {
    const onVisibility = () => {
      if (this.doc.visibilityState === 'hidden') {
        void this.flush();
      }
    };
    const onUnload = () => void this.flush();
    const view = this.doc.defaultView;
    this.doc.addEventListener('visibilitychange', onVisibility);
    view?.addEventListener('beforeunload', onUnload);

    effect(() => {
      this.store.entities();
      this.store.activeId();
      if (this.hydrated) {
        this.schedule();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.doc.removeEventListener('visibilitychange', onVisibility);
      view?.removeEventListener('beforeunload', onUnload);
      if (this.timer) {
        clearTimeout(this.timer);
      }
      void this.dbPromise?.then((db) => db.close());
    });
  }

  private db(): Promise<IDBPDatabase<WorkspaceDB>> {
    return (this.dbPromise ??= openWorkspaceDB());
  }

  async hydrate(): Promise<void> {
    try {
      const db = await this.db();
      const documents = await db.getAll('documents');
      const activeId = (await db.get('meta', 'active')) ?? null;
      if (documents.length) {
        this.store.hydrate(documents, activeId);
      }
    } catch {
      // A blocked or unavailable IndexedDB must not stop the app from starting.
    } finally {
      this.hydrated = true;
    }
  }

  private schedule(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    const sinceLast = Date.now() - this.lastWrite;
    const delay = Math.max(this.config.debounceMs, this.config.minIntervalMs - sinceLast);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, delay);
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    try {
      const db = await this.db();
      const documents = this.store.entities();
      const activeId = this.store.activeId();
      const currentIds = new Set(documents.map((doc) => doc.id));

      const tx = db.transaction(['documents', 'meta'], 'readwrite');
      const docStore = tx.objectStore('documents');
      for (const key of await docStore.getAllKeys()) {
        if (!currentIds.has(key)) {
          await docStore.delete(key);
        }
      }
      for (const document of documents) {
        await docStore.put(document);
      }
      await tx.objectStore('meta').put(activeId, 'active');
      await tx.done;
      this.lastWrite = Date.now();
    } catch {
      // Best-effort persistence; a failed write must never crash the app.
    }
  }
}
