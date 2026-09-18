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

  private readonly tabId = crypto.randomUUID();
  private knownRevision = 0;
  private applyingRemote = false;
  private readonly channel = this.createChannel();

  constructor() {
    const onVisibility = () => {
      if (this.doc.visibilityState === 'hidden') {
        void this.flush();
      } else {
        void this.reconcile();
      }
    };
    const onFocus = () => void this.reconcile();
    const onUnload = () => void this.flush();
    const view = this.doc.defaultView;
    this.doc.addEventListener('visibilitychange', onVisibility);
    view?.addEventListener('focus', onFocus);
    view?.addEventListener('beforeunload', onUnload);

    if (this.channel) {
      this.channel.onmessage = (event: MessageEvent) => {
        if (event.data?.source !== this.tabId) {
          void this.reconcile();
        }
      };
    }

    effect(() => {
      this.store.entities();
      this.store.activeId();
      if (!this.hydrated) {
        return;
      }
      if (this.applyingRemote) {
        this.applyingRemote = false;
        return;
      }
      this.schedule();
    });

    this.destroyRef.onDestroy(() => {
      this.doc.removeEventListener('visibilitychange', onVisibility);
      view?.removeEventListener('focus', onFocus);
      view?.removeEventListener('beforeunload', onUnload);
      this.channel?.close();
      if (this.timer) {
        clearTimeout(this.timer);
      }
      void this.dbPromise?.then((db) => db.close());
    });
  }

  private createChannel(): BroadcastChannel | null {
    const Channel = this.doc.defaultView?.BroadcastChannel;
    return Channel ? new Channel('texttools') : null;
  }

  private db(): Promise<IDBPDatabase<WorkspaceDB>> {
    return (this.dbPromise ??= openWorkspaceDB());
  }

  async hydrate(): Promise<void> {
    try {
      const db = await this.db();
      const documents = await db.getAll('documents');
      const activeId = (await db.get('meta', 'active')) ?? null;
      this.knownRevision = Number(await db.get('meta', 'revision')) || 0;
      if (documents.length) {
        this.applyingRemote = true;
        this.store.hydrate(documents, activeId);
      }
    } catch {
      // A blocked or unavailable IndexedDB must not stop the app from starting.
    } finally {
      this.hydrated = true;
    }
  }

  /** Reloads the workspace from IndexedDB so this tab reflects writes from others. */
  async reconcile(): Promise<void> {
    if (!this.hydrated) {
      return;
    }
    try {
      const db = await this.db();
      const revision = Number(await db.get('meta', 'revision')) || 0;
      if (revision === this.knownRevision) {
        return;
      }
      const documents = await db.getAll('documents');
      if (!documents.length) {
        this.knownRevision = revision;
        return;
      }
      const activeId = (await db.get('meta', 'active')) ?? null;
      this.knownRevision = revision;
      this.applyingRemote = true;
      this.store.hydrate(documents, activeId);
    } catch {
      // A failed reconcile is non-fatal; the tab keeps its current state.
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
      const metaStore = tx.objectStore('meta');
      const remoteRevision = Number(await metaStore.get('revision')) || 0;
      if (remoteRevision > this.knownRevision) {
        await tx.done;
        await this.reconcile();
        return;
      }

      const docStore = tx.objectStore('documents');
      for (const key of await docStore.getAllKeys()) {
        if (!currentIds.has(key)) {
          await docStore.delete(key);
        }
      }
      for (const document of documents) {
        await docStore.put(document);
      }
      const nextRevision = remoteRevision + 1;
      await metaStore.put(activeId, 'active');
      await metaStore.put(String(nextRevision), 'revision');
      await tx.done;
      this.knownRevision = nextRevision;
      this.lastWrite = Date.now();
      this.channel?.postMessage({ source: this.tabId, revision: nextRevision });
    } catch {
      // Best-effort persistence; a failed write must never crash the app.
    }
  }
}
