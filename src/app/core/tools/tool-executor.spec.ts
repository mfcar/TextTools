import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { HARD_OFFLOAD_CHARS, WORKER_ELIGIBLE_CHARS } from '../perf/offload-policy';
import { ToolParams } from './param-schema';
import { ToolExecutor } from './tool-executor';
import { ToolResult, defineTool, success } from './tool';
import { provideTools } from './tool-registry';
import { WorkerToolRunner } from './worker-tool-runner';

const upper = defineTool({
  id: 'upper',
  name: 'Uppercase',
  description: 'Uppercases text.',
  category: 'Case',
  icon: 'text_fields',
  params: [],
  run: (input) => input.toUpperCase(),
});

const heavy = defineTool({
  id: 'heavy',
  name: 'Heavy',
  description: 'A worker-eligible tool.',
  category: 'Text',
  icon: 'bolt',
  workerEligible: true,
  params: [],
  run: (input) => input,
});

class FakeWorkerRunner {
  supported = true;
  readonly calls: { toolId: string; input: string; params: ToolParams }[] = [];

  run(toolId: string, input: string, params: ToolParams = {}): Promise<ToolResult> {
    this.calls.push({ toolId, input, params });
    return Promise.resolve(success('WORKER'));
  }
}

describe('ToolExecutor', () => {
  let executor: ToolExecutor;
  let worker: FakeWorkerRunner;

  beforeEach(() => {
    worker = new FakeWorkerRunner();
    TestBed.configureTestingModule({
      providers: [provideTools(upper, heavy), { provide: WorkerToolRunner, useValue: worker }],
    });
    executor = TestBed.inject(ToolExecutor);
  });

  it('runs small inputs in-process', async () => {
    expect(await executor.execute('upper', 'abc')).toEqual({ ok: true, output: 'ABC' });
    expect(worker.calls).toHaveLength(0);
  });

  it('offloads any tool once the input hits the hard threshold', async () => {
    const input = 'a'.repeat(HARD_OFFLOAD_CHARS);

    expect(await executor.execute('upper', input)).toEqual({ ok: true, output: 'WORKER' });
    expect(worker.calls[0].toolId).toBe('upper');
  });

  it('offloads a worker-eligible tool at its lower threshold', async () => {
    const input = 'a'.repeat(WORKER_ELIGIBLE_CHARS);

    await executor.execute('heavy', input);

    expect(worker.calls[0].toolId).toBe('heavy');
  });

  it('does not offload a non-eligible tool below the hard threshold', async () => {
    const input = 'a'.repeat(WORKER_ELIGIBLE_CHARS);

    await executor.execute('upper', input);

    expect(worker.calls).toHaveLength(0);
  });

  it('stays in-process when workers are unsupported, even for large input', async () => {
    worker.supported = false;
    const input = 'a'.repeat(HARD_OFFLOAD_CHARS);

    const result = await executor.execute('upper', input);

    expect(result.ok).toBe(true);
    expect(worker.calls).toHaveLength(0);
  });

  it('fails for an unknown tool id', async () => {
    const result = await executor.execute('missing', 'x');

    expect(result.ok).toBe(false);
    expect(worker.calls).toHaveLength(0);
  });
});
