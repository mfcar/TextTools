import { patchState, signalStore, withMethods } from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Flow, FlowStep } from './models';

function newId(): string {
  return crypto.randomUUID();
}

export interface CreateFlowOptions {
  readonly name: string;
  readonly description?: string;
  readonly steps: readonly FlowStep[];
}

export const FlowStore = signalStore(
  { providedIn: 'root' },
  withEntities<Flow>(),
  withMethods((store) => ({
    hydrate(flows: readonly Flow[]): void {
      patchState(store, setAllEntities([...flows]));
    },

    createFlow(options: CreateFlowOptions): string {
      const id = newId();
      const now = Date.now();
      const steps = [...options.steps];
      const flow: Flow = {
        id,
        name: options.name,
        description: options.description ?? '',
        steps,
        versions: [{ version: 1, steps, createdAt: now }],
        createdAt: now,
        updatedAt: now,
      };
      patchState(store, addEntity(flow));
      return id;
    },

    renameFlow(id: string, name: string, description: string): void {
      if (store.entityMap()[id]) {
        patchState(
          store,
          updateEntity({ id, changes: { name, description, updatedAt: Date.now() } }),
        );
      }
    },

    /** Replaces the head steps and appends a new version. */
    saveVersion(id: string, steps: readonly FlowStep[]): void {
      const flow = store.entityMap()[id];
      if (!flow) {
        return;
      }
      const now = Date.now();
      const next = [...steps];
      const version = {
        version: flow.versions.length + 1,
        steps: next,
        createdAt: now,
      };
      patchState(
        store,
        updateEntity({
          id,
          changes: { steps: next, versions: [...flow.versions, version], updatedAt: now },
        }),
      );
    },

    deleteFlow(id: string): void {
      if (store.entityMap()[id]) {
        patchState(store, removeEntity(id));
      }
    },
  })),
);
