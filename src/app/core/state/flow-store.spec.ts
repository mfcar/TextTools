import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { FlowStore } from './flow-store';
import { Flow, FlowStep } from './models';

const steps: readonly FlowStep[] = [
  { toolId: 'upper', toolName: 'Uppercase', params: {} },
  { toolId: 'append', toolName: 'Append', params: { s: '!' } },
];

function setup(): InstanceType<typeof FlowStore> {
  TestBed.configureTestingModule({ providers: [] });
  return TestBed.inject(FlowStore);
}

describe('FlowStore', () => {
  let store: InstanceType<typeof FlowStore>;

  beforeEach(() => {
    store = setup();
  });

  it('creates a flow with an initial version', () => {
    const id = store.createFlow({ name: 'My flow', steps });
    const flow = store.entityMap()[id];
    expect(flow.name).toBe('My flow');
    expect(flow.description).toBe('');
    expect(flow.steps).toHaveLength(2);
    expect(flow.versions).toHaveLength(1);
    expect(flow.versions[0].version).toBe(1);
    expect(flow.createdAt).toBe(flow.updatedAt);
  });

  it('renames and redescribes a flow', () => {
    const id = store.createFlow({ name: 'Old', steps });
    store.renameFlow(id, 'New', 'A description');
    const flow = store.entityMap()[id];
    expect(flow.name).toBe('New');
    expect(flow.description).toBe('A description');
  });

  it('appends a version and replaces the head steps on save', () => {
    const id = store.createFlow({ name: 'Flow', steps });
    const next: readonly FlowStep[] = [{ toolId: 'upper', toolName: 'Uppercase', params: {} }];
    store.saveVersion(id, next);
    const flow = store.entityMap()[id];
    expect(flow.steps).toHaveLength(1);
    expect(flow.versions).toHaveLength(2);
    expect(flow.versions[1].version).toBe(2);
    expect(flow.versions[0].steps).toHaveLength(2);
  });

  it('deletes a flow', () => {
    const id = store.createFlow({ name: 'Flow', steps });
    store.deleteFlow(id);
    expect(store.entityMap()[id]).toBeUndefined();
  });

  it('ignores unknown ids on rename, save, and delete', () => {
    store.renameFlow('missing', 'x', 'y');
    store.saveVersion('missing', steps);
    store.deleteFlow('missing');
    expect(store.entities()).toHaveLength(0);
  });

  it('replaces all entities on hydrate', () => {
    const existing: Flow = {
      id: 'seed',
      name: 'Seed',
      description: '',
      steps,
      versions: [{ version: 1, steps, createdAt: 1 }],
      createdAt: 1,
      updatedAt: 1,
    };
    store.hydrate([existing]);
    expect(store.entities()).toHaveLength(1);
    expect(store.entityMap()['seed'].name).toBe('Seed');
  });
});
