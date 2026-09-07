import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { WorkerToolRunner } from './worker-tool-runner';

interface Posted {
  readonly data: { id: number; toolId: string; params: unknown; buffer: ArrayBuffer };
  readonly transfer?: unknown;
}

class FakeWorker {
  static instances: FakeWorker[] = [];
  readonly posted: Posted[] = [];
  terminated = false;
  private readonly listeners: ((event: { data: unknown }) => void)[] = [];

  constructor(readonly url: string | URL) {
    FakeWorker.instances.push(this);
  }

  addEventListener(type: string, handler: (event: { data: unknown }) => void): void {
    if (type === 'message') {
      this.listeners.push(handler);
    }
  }

  postMessage(data: Posted['data'], transfer?: unknown): void {
    this.posted.push({ data, transfer });
  }

  terminate(): void {
    this.terminated = true;
  }

  emit(data: unknown): void {
    for (const listener of this.listeners) {
      listener({ data });
    }
  }
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

describe('WorkerToolRunner', () => {
  let runner: WorkerToolRunner;

  beforeEach(() => {
    FakeWorker.instances = [];
    (globalThis as { Worker?: unknown }).Worker = FakeWorker;
    runner = TestBed.inject(WorkerToolRunner);
  });

  afterEach(() => {
    delete (globalThis as { Worker?: unknown }).Worker;
  });

  it('reports worker support from the environment', () => {
    expect(runner.supported).toBe(true);
  });

  it('encodes the input, posts it, and resolves the decoded response', async () => {
    const promise = runner.run('upper', 'hi', {});
    const worker = FakeWorker.instances[0];

    expect(worker).toBeDefined();
    const message = worker.posted[0].data;
    expect(message.toolId).toBe('upper');
    expect(decoder.decode(new Uint8Array(message.buffer))).toBe('hi');
    expect(worker.posted[0].transfer).toEqual([message.buffer]);

    worker.emit({ id: message.id, ok: true, buffer: encoder.encode('HI').buffer });

    expect(await promise).toEqual({ ok: true, output: 'HI' });
  });

  it('resolves a failure response as a failure result', async () => {
    const promise = runner.run('missing', 'hi');
    const worker = FakeWorker.instances[0];

    worker.emit({ id: worker.posted[0].data.id, ok: false, error: 'unknown tool' });

    expect(await promise).toEqual({ ok: false, error: 'unknown tool' });
  });

  it('reuses a single worker across runs', () => {
    runner.run('upper', 'a');
    runner.run('upper', 'b');

    expect(FakeWorker.instances).toHaveLength(1);
  });

  it('ignores responses with an unknown id', async () => {
    const promise = runner.run('upper', 'a');
    const worker = FakeWorker.instances[0];

    worker.emit({ id: 9999, ok: true, buffer: encoder.encode('X').buffer });
    worker.emit({ id: worker.posted[0].data.id, ok: true, buffer: encoder.encode('A').buffer });

    expect(await promise).toEqual({ ok: true, output: 'A' });
  });

  it('fails gracefully when workers are unavailable', async () => {
    (globalThis as { Worker?: unknown }).Worker = undefined;

    const result = await runner.run('upper', 'a');

    expect(result.ok).toBe(false);
    expect(FakeWorker.instances).toHaveLength(0);
  });
});
