import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { TextDocument } from '../state/models';

export const DB_NAME = 'texttools';
export const DB_VERSION = 1;

/** Schema for the persisted workspace: documents keyed by id, plus small meta. */
export interface WorkspaceDB extends DBSchema {
  documents: {
    key: string;
    value: TextDocument;
  };
  meta: {
    key: string;
    value: string | null;
  };
}

export function openWorkspaceDB(): Promise<IDBPDatabase<WorkspaceDB>> {
  return openDB<WorkspaceDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('documents')) {
        db.createObjectStore('documents', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta');
      }
    },
  });
}
