import { DestroyRef, Service, inject } from '@angular/core';
import { ToolParams } from './param-schema';
import { ToolResult, failure, success } from './tool';

interface WorkerResponse {
  readonly id: number;
  readonly ok: boolean;
  readonly buffer?: ArrayBuffer;
  readonly error?: string;
}

@Service()
export class WorkerToolRunner {
  private worker: Worker | null = null;
  private nextId = 0;
  private readonly pending = new Map<number, (result: ToolResult) => void>();
  private readonly encoder = new TextEncoder();
  private readonly decoder = new TextDecoder();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.terminate());
  }

  get supported(): boolean {
    return typeof Worker !== 'undefined';
  }

  run(toolId: string, input: string, params: ToolParams = {}): Promise<ToolResult> {
    const worker = this.ensureWorker();
    if (!worker) {
      return Promise.resolve(failure('Web Workers are not available in this environment.'));
    }

    const id = this.nextId++;
    const bytes = this.encoder.encode(input);
    return new Promise<ToolResult>((resolve) => {
      this.pending.set(id, resolve);
      worker.postMessage({ id, toolId, params, buffer: bytes.buffer }, [bytes.buffer]);
    });
  }

  private ensureWorker(): Worker | null {
    if (this.worker) {
      return this.worker;
    }
    if (!this.supported) {
      return null;
    }
    this.worker = new Worker(new URL('./tool.worker', import.meta.url));
    this.worker.addEventListener('message', ({ data }: MessageEvent<WorkerResponse>) =>
      this.settle(data),
    );
    return this.worker;
  }

  private settle(data: WorkerResponse): void {
    const resolve = this.pending.get(data.id);
    if (!resolve) {
      return;
    }
    this.pending.delete(data.id);
    if (data.ok && data.buffer) {
      resolve(success(this.decoder.decode(new Uint8Array(data.buffer))));
    } else {
      resolve(failure(data.error ?? 'Worker execution failed.'));
    }
  }

  private terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this.pending.clear();
  }
}
